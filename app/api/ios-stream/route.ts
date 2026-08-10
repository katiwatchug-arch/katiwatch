/**
 * /api/ios-stream
 *
 * Remuxes an MKV (or any container) to fragmented MP4 on the fly for iOS/Safari.
 *
 * HOW IT WORKS
 * ────────────
 * 1. Probe the upstream video with ffprobe to read video + audio codec names.
 * 2. Decide per-stream: copy vs. transcode:
 *    - Video  H.264 / HEVC → copy.  Anything else (VP9, AV1…) → libx264.
 *    - Audio  AAC / MP3 / ALAC → copy.  Anything else (AC3, DTS, Vorbis…) → aac.
 * 3. Spawn ffmpeg:
 *    - Input  : piped from an upstream HTTP fetch (no disk write).
 *    - Output : fragmented MP4 piped to the HTTP response.
 *    - Flags  : -movflags frag_keyframe+empty_moov+default_base_moof
 *               Produces a streamable fMP4 whose moov atom is at the front.
 *               Without these flags Safari stalls waiting for moov at EOF.
 *
 * RANGE REQUESTS
 * ──────────────
 * fMP4 with the above flags is inherently streamable — Safari does not need
 * byte-range seeking to start playback. Seek-by-time works via fragment
 * timestamps. True byte-range seeking into a live remux is not supported
 * because output length is unknown before remuxing completes.
 *
 * CODEC COMPATIBILITY
 * ───────────────────
 *   Video  H.264, HEVC/H.265          → copy (fast, lossless)
 *          VP8, VP9, AV1, MPEG-4, etc → transcode to H.264 (slow, CPU-heavy)
 *   Audio  AAC, MP3, ALAC             → copy
 *          AC3, DTS, EAC3, FLAC,
 *          Vorbis, Opus, TrueHD, etc  → transcode to AAC (fast)
 *
 * DEPLOYMENT NOTE
 * ───────────────
 * Requires a long-running process with ffmpeg installed — your Docker
 * deployment (Dockerfile in this repo) satisfies this. ffmpeg is installed
 * in the runner stage via apt-get. This will NOT work on Vercel Serverless.
 *
 * Usage
 * ─────
 *   GET /api/ios-stream?url=<encoded-video-url>
 */

import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import { Readable } from 'stream';

// ── Binary resolution ─────────────────────────────────────────────────────────
// In Docker: system ffmpeg (apt-get) is used for both ffmpeg and ffprobe.
// In local dev: ffmpeg-static provides the ffmpeg binary; ffprobe must be
// installed separately (brew install ffmpeg / choco install ffmpeg).
function resolveFfmpegBin(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const p: string = require('ffmpeg-static');
    if (p) return p;
  } catch {
    // not installed — fall through to PATH
  }
  return 'ffmpeg';
}

const FFMPEG  = resolveFfmpegBin();
const FFPROBE = 'ffprobe'; // always resolved from PATH (system install)

// ── Safari-compatible codec sets ─────────────────────────────────────────────
const SAFARI_VIDEO = new Set(['h264', 'hevc', 'h265']);
const SAFARI_AUDIO = new Set(['aac', 'mp3', 'alac']);

interface ProbeResult {
  videoCodec: string;
  audioCodec: string;
}

/**
 * Runs ffprobe on the URL and returns the first video + audio codec names.
 * ffprobe reads only container headers — it does NOT download the full file.
 */
function probeUrl(url: string): Promise<ProbeResult> {
  return new Promise((resolve, reject) => {
    const proc = spawn(FFPROBE, [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_streams',
      '-select_streams', 'v:0,a:0',
      url,
    ]);

    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (c: Buffer) => { stdout += c.toString(); });
    proc.stderr.on('data', (c: Buffer) => { stderr += c.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`ffprobe exited ${code}: ${stderr.slice(0, 400)}`));
      }
      try {
        const streams: any[] = JSON.parse(stdout).streams ?? [];
        const video = streams.find((s: any) => s.codec_type === 'video');
        const audio = streams.find((s: any) => s.codec_type === 'audio');
        resolve({
          videoCodec: (video?.codec_name ?? 'unknown').toLowerCase(),
          audioCodec: (audio?.codec_name ?? 'unknown').toLowerCase(),
        });
      } catch (e) {
        reject(new Error(`ffprobe JSON parse failed: ${e}`));
      }
    });

    proc.on('error', reject);
  });
}

// ── SSRF guard ────────────────────────────────────────────────────────────────
function isAllowedVideoUrl(urlString: string): boolean {
  const envHosts = process.env.ALLOWED_VIDEO_HOSTS || '';
  const allowedHosts = envHosts.split(',').map(h => h.trim().toLowerCase()).filter(Boolean);
  try {
    const url = new URL(urlString);
    const hostname = url.hostname.toLowerCase();
    const blocked = [
      /^localhost$/i, /^127\./, /^10\./, /^172\.(1[6-9]|2\d|3[01])\./,
      /^192\.168\./, /^169\.254\./, /^0\./, /^\[::1\]$/, /^metadata\./i, /^internal\./i,
    ];
    if (blocked.some(p => p.test(hostname))) return false;
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    if (allowedHosts.length > 0) {
      return allowedHosts.some(h => hostname === h || hostname.endsWith(`.${h}`));
    }
    return true;
  } catch {
    return false;
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const videoUrl = request.nextUrl.searchParams.get('url');

  if (!videoUrl) {
    return Response.json({ error: 'url parameter is required' }, { status: 400 });
  }

  if (!isAllowedVideoUrl(videoUrl)) {
    return Response.json({ error: 'Invalid video source' }, { status: 403 });
  }

  // ── 1. Probe codecs ──────────────────────────────────────────────────────────
  let probe: ProbeResult;
  try {
    probe = await probeUrl(videoUrl);
  } catch (err: any) {
    console.error('[ios-stream] ffprobe failed:', err.message);
    return Response.json({ error: 'Failed to probe video', detail: err.message }, { status: 502 });
  }

  const { videoCodec, audioCodec } = probe;
  const videoNeedsTranscode = !SAFARI_VIDEO.has(videoCodec);
  const audioNeedsTranscode = !SAFARI_AUDIO.has(audioCodec);

  console.log(
    `[ios-stream] video=${videoCodec}(${videoNeedsTranscode ? 'transcode→h264' : 'copy'})`,
    `audio=${audioCodec}(${audioNeedsTranscode ? 'transcode→aac' : 'copy'})`,
  );

  // Warn loudly if video transcoding is required — it is CPU-intensive and
  // will be slow for long files even on a VPS. Consider pre-transcoding on
  // upload instead of on-request if this path is hit frequently.
  if (videoNeedsTranscode) {
    console.warn(
      `[ios-stream] WARNING: video codec "${videoCodec}" requires transcoding to H.264.`,
      'This is CPU-intensive. Pre-transcode on upload for better performance.',
    );
  }

  // ── 2. Fetch upstream video ──────────────────────────────────────────────────
  const upstreamHeaders: Record<string, string> = {};
  const username = process.env.CADDY_USERNAME || process.env.VIDEO_AUTH_USERNAME;
  const password = process.env.CADDY_PASSWORD || process.env.VIDEO_AUTH_PASSWORD;
  if (username && password) {
    upstreamHeaders['Authorization'] = `Basic ${btoa(`${username}:${password}`)}`;
  }

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(videoUrl, { headers: upstreamHeaders });
  } catch (err: any) {
    return Response.json({ error: 'Failed to fetch upstream video', detail: err.message }, { status: 502 });
  }

  if (!upstreamRes.ok || !upstreamRes.body) {
    return Response.json({ error: 'Upstream video unavailable', status: upstreamRes.status }, { status: upstreamRes.status });
  }

  // ── 3. Build ffmpeg args ─────────────────────────────────────────────────────
  //
  // -i pipe:0                    read from stdin (upstream body piped in)
  // -map 0:v:0 -map 0:a:0        take first video + first audio stream only
  // -c:v copy|libx264            copy H.264/HEVC; re-encode everything else
  // -c:a copy|aac                copy AAC/MP3/ALAC; re-encode everything else
  // -movflags frag_keyframe+…    fragmented MP4 — mandatory for streaming
  //   frag_keyframe              start a new fragment at every keyframe
  //   empty_moov                 write an empty moov at the start (no seeking needed)
  //   default_base_moof          each fragment carries its own base offset
  // -f mp4                       force MP4 container
  // pipe:1                       write output to stdout

  const ffmpegArgs: string[] = [
    '-loglevel', 'error',
    '-i', 'pipe:0',
    '-map', '0:v:0',
    '-map', '0:a:0',
    '-c:v', videoNeedsTranscode ? 'libx264' : 'copy',
    '-c:a', audioNeedsTranscode ? 'aac'     : 'copy',
  ];

  if (videoNeedsTranscode) {
    ffmpegArgs.push(
      '-preset', 'veryfast', // fastest encode; still slow for full movies
      '-crf',    '23',       // quality (18=high, 28=smaller file)
      '-pix_fmt','yuv420p',  // required for broad Safari/iOS compatibility
    );
  }

  if (audioNeedsTranscode) {
    ffmpegArgs.push('-b:a', '192k');
  }

  ffmpegArgs.push(
    '-movflags', 'frag_keyframe+empty_moov+default_base_moof',
    '-f', 'mp4',
    'pipe:1',
  );

  // ── 4. Spawn ffmpeg ──────────────────────────────────────────────────────────
  const ffmpegProc = spawn(FFMPEG, ffmpegArgs, { stdio: ['pipe', 'pipe', 'pipe'] });

  // Pipe upstream response body → ffmpeg stdin
  const nodeReadable = Readable.fromWeb(upstreamRes.body as any);
  nodeReadable.pipe(ffmpegProc.stdin);

  // Collect stderr (trimmed) for error logging on close
  let ffmpegStderr = '';
  ffmpegProc.stderr.on('data', (chunk: Buffer) => {
    ffmpegStderr += chunk.toString();
    if (ffmpegStderr.length > 2048) ffmpegStderr = ffmpegStderr.slice(-2048);
  });

  ffmpegProc.on('error', (err) => {
    console.error('[ios-stream] ffmpeg spawn error:', err.message);
    nodeReadable.destroy();
  });

  ffmpegProc.on('close', (code) => {
    if (code !== 0) {
      console.error(`[ios-stream] ffmpeg exited ${code}. Last stderr: ${ffmpegStderr}`);
    }
  });

  // ── 5. Pipe ffmpeg stdout → Web ReadableStream → HTTP response ───────────────
  //
  // Next.js Route Handlers use the Web Streams API, so we convert the Node.js
  // Readable (ffmpegProc.stdout) to a Web ReadableStream.
  const webStream = new ReadableStream({
    start(controller) {
      ffmpegProc.stdout.on('data', (chunk: Buffer) => {
        controller.enqueue(new Uint8Array(chunk));
      });

      ffmpegProc.stdout.on('end', () => {
        controller.close();
      });

      ffmpegProc.stdout.on('error', (err) => {
        console.error('[ios-stream] stdout read error:', err.message);
        controller.error(err);
      });

      // Client disconnected — kill ffmpeg immediately to free CPU/memory
      request.signal.addEventListener('abort', () => {
        ffmpegProc.kill('SIGKILL');
        nodeReadable.destroy();
        controller.error(new Error('Client disconnected'));
      });
    },
  });

  const CORS_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || '*';

  return new Response(webStream, {
    status: 200,
    headers: {
      'Content-Type':  'video/mp4',
      // No Content-Length — unknown until remux completes
      'Cache-Control': 'no-store',
      'Accept-Ranges': 'none',
      'Access-Control-Allow-Origin':  CORS_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      // Diagnostic headers — visible in DevTools Network tab
      'X-Video-Codec':  videoCodec,
      'X-Audio-Codec':  audioCodec,
      'X-Video-Action': videoNeedsTranscode ? 'transcode' : 'copy',
      'X-Audio-Action': audioNeedsTranscode ? 'transcode' : 'copy',
    },
  });
}

export async function OPTIONS() {
  const CORS_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || '*';
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin':  CORS_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
