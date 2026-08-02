export const isIOSDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(userAgent);
};

export const isSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent;
  return /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
};

export const isIOSSafari = (): boolean => {
  return isIOSDevice() && isSafari();
};

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
};

export const canStreamMKV = (): boolean => {
  if (isIOSDevice()) return false;
  return true;
};

export const getSupportedVideoFormats = (): string[] => {
  if (isIOSDevice()) {
    // iOS only supports MP4 (H.264/HEVC) and HLS
    return ['mp4', 'm3u8', 'mov'];
  }
  
  // Android and Desktop support most formats
  return ['mp4', 'webm', 'mkv', 'm3u8', 'ogv', 'avi', 'mov'];
};

export const getRecommendedVideoFormat = (): string => {
  // MP4 is universally supported
  return 'mp4';
};

export const isLegacySmartTV = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  // Target WebOS < 5, Tizen, older Samsung/LG TVs
  return /webos|smarttv|tizen|netcast|viera/i.test(userAgent);
};

export const getDownloadInstructions = (): string => {
  if (isIOSSafari()) {
    return 'Tap the download link, then long-press the video and select "Download Linked File". Alternatively, use the Files app or a downloader app like Documents by Readdle.';
  }
  
  if (isIOSDevice()) {
    return 'Your browser may not support direct downloads. Try using Safari or a download manager app.';
  }
  
  return 'Click to download the video to your device.';
};