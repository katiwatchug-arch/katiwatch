'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, BellOff, CheckCheck, Trash2, Sparkles, Clock, ExternalLink } from 'lucide-react';
import { getStoredNotifications, markAllRead, StoredNotification } from '@/lib/hooks/useOneSignal';
import { useOneSignal } from '@/lib/hooks/useOneSignal';

interface ApiNotification {
  id: string;
  title: string;
  message: string;
  image_url?: string;
  created_at: string;
  content_type?: string;
  content_id?: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function NotifCard({ title, message, imageUrl, time, href, unread }: {
  title: string; message: string; imageUrl?: string;
  time: string; href: string; unread?: boolean;
}) {
  return (
    <Link href={href} className="group block">
      <div className={`relative flex gap-4 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.01] ${
        unread
          ? 'bg-gradient-to-r from-[#1a0a0a] to-[#141414] border-[#E50914]/30 hover:border-[#E50914]/60'
          : 'bg-[#111111] border-gray-800/50 hover:border-gray-700'
      }`}>
        {/* Unread indicator */}
        {unread && (
          <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#E50914] shadow-lg shadow-[#E50914]/50" />
        )}

        {/* Poster / icon */}
        <div className="flex-shrink-0">
          {imageUrl ? (
            <div className="relative w-16 h-24 rounded-xl overflow-hidden bg-gray-900 shadow-lg">
              <Image src={imageUrl} alt={title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          ) : (
            <div className="w-16 h-24 rounded-xl bg-gradient-to-br from-[#E50914]/20 to-[#1a1a1a] border border-[#E50914]/20 flex items-center justify-center">
              <Bell className="w-6 h-6 text-[#E50914]/60" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
          <h3 className={`font-bold text-sm leading-snug line-clamp-2 ${unread ? 'text-white' : 'text-gray-200'}`}>
            {title}
          </h3>
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{message}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock className="w-3 h-3 text-gray-600" />
            <span className="text-[11px] text-gray-600">{time}</span>
            {href !== '#' && (
              <ExternalLink className="w-3 h-3 text-gray-700 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function NotificationsPage() {
  const { permission, isInitialized, promptForNotifications } = useOneSignal();
  const [storedNotifs, setStoredNotifs] = useState<StoredNotification[]>([]);
  const [apiNotifs, setApiNotifs] = useState<ApiNotification[]>([]);
  const [loadingApi, setLoadingApi] = useState(true);
  const [requesting, setRequesting] = useState(false);

  // Load localStorage notifications
  useEffect(() => {
    setStoredNotifs(getStoredNotifications());
  }, []);

  // Fetch API notifications
  useEffect(() => {
    import('@/lib/reelplexi').then(({ getReelplexiAppNotifications }) =>
      getReelplexiAppNotifications()
        .then(data => setApiNotifs(data || []))
        .catch(() => {})
        .finally(() => setLoadingApi(false))
    );
  }, []);

  const handleMarkAllRead = () => {
    markAllRead();
    setStoredNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    localStorage.removeItem('katiwatch-notifications');
    setStoredNotifs([]);
  };

  const handleEnableNotifications = async () => {
    setRequesting(true);
    try { await promptForNotifications(); }
    finally { setRequesting(false); }
  };

  const unreadCount = storedNotifs.filter(n => !n.read).length;
  const hasAny = storedNotifs.length > 0 || apiNotifs.length > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Cinematic header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#E50914]/8 via-[#1a0a0a] to-[#0a0a0a]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E50914]/50 to-transparent" />

        <div className="relative container mx-auto px-4 sm:px-6 pt-10 pb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E50914] to-[#8b0000] flex items-center justify-center shadow-xl shadow-[#E50914]/30">
                <Bell className="w-6 h-6 text-white" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-white text-[#E50914] text-[10px] font-black flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Notifications</h1>
                <p className="text-gray-500 text-xs mt-0.5">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </p>
              </div>
            </div>

            {storedNotifs.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-medium transition-all"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mark all read</span>
                  </button>
                )}
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-900/30 text-gray-400 hover:text-red-400 text-xs font-medium transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 pb-24">

        {/* Permission banner */}
        {isInitialized && permission !== 'granted' && permission !== 'denied' && permission !== 'unsupported' && (
          <div className="mb-8 relative overflow-hidden rounded-2xl border border-[#E50914]/20 bg-gradient-to-r from-[#1a0505] to-[#141414] p-5">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E50914]/40 to-transparent" />
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#E50914]/10 border border-[#E50914]/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-[#E50914]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">Enable push notifications</p>
                <p className="text-gray-500 text-xs mt-0.5">Be the first to know when new content drops.</p>
              </div>
              <button
                onClick={handleEnableNotifications}
                disabled={requesting}
                className="flex-shrink-0 px-4 py-2 bg-[#E50914] hover:bg-[#c8000f] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-[#E50914]/20"
              >
                {requesting ? 'Enabling...' : 'Enable'}
              </button>
            </div>
          </div>
        )}

        {/* Denied state */}
        {permission === 'denied' && (
          <div className="mb-8 flex items-center gap-3 p-4 rounded-2xl border border-gray-800 bg-[#111]">
            <BellOff className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <p className="text-gray-500 text-sm">
              Notifications are blocked. Enable them in your browser settings to receive alerts.
            </p>
          </div>
        )}

        {/* Push notifications received (from localStorage) */}
        {storedNotifs.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 rounded-full bg-[#E50914]" />
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Received</h2>
            </div>
            <div className="space-y-2.5">
              {storedNotifs.map(n => (
                <NotifCard
                  key={n.id}
                  title={n.title}
                  message={n.message}
                  imageUrl={n.imageUrl}
                  time={timeAgo(n.receivedAt)}
                  href={n.url || '#'}
                  unread={!n.read}
                />
              ))}
            </div>
          </section>
        )}

        {/* API / broadcast notifications */}
        {loadingApi ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 rounded-2xl bg-gray-800/30 animate-pulse" />
            ))}
          </div>
        ) : apiNotifs.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 rounded-full bg-gray-600" />
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Announcements</h2>
            </div>
            <div className="space-y-2.5">
              {apiNotifs.map((n: ApiNotification) => {
                const href = n.content_type && n.content_id
                  ? `/${n.content_type === 'movie' ? 'movies' : 'series'}/${n.content_id}`
                  : '#';
                return (
                  <NotifCard
                    key={n.id}
                    title={n.title}
                    message={n.message}
                    imageUrl={n.image_url}
                    time={timeAgo(typeof n.created_at === 'string' ? n.created_at.replace(/ /g, 'T') : n.created_at)}
                    href={href}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!loadingApi && !hasAny && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-gray-800 flex items-center justify-center mb-6 shadow-xl">
              <Bell className="w-9 h-9 text-gray-700" />
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#E50914]/20 border border-[#E50914]/30 flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-[#E50914]/60" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">No notifications yet</h3>
            <p className="text-gray-600 text-sm max-w-xs leading-relaxed">
              Enable notifications to be the first to know when new movies and series drop.
            </p>
            {permission !== 'granted' && permission !== 'denied' && isInitialized && (
              <button
                onClick={handleEnableNotifications}
                disabled={requesting}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-[#E50914] to-[#b80710] hover:from-[#c8000f] hover:to-[#9a0000] text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-[#E50914]/20 flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                {requesting ? 'Enabling...' : 'Enable Notifications'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
