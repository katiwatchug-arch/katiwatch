'use client';

import { useState, useEffect, useCallback } from 'react';

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: typeof window.OneSignal) => void>;
    OneSignal?: {
      init: (options: Record<string, unknown>) => Promise<void>;
      Notifications: {
        permission: boolean;
        permissionNative: NotificationPermission;
        requestPermission: () => Promise<void>;
        addEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
      };
      User: {
        addAlias: (label: string, id: string) => void;
      };
    };
  }
}

export type NotifPermission = 'default' | 'granted' | 'denied' | 'loading' | 'unsupported';

export interface StoredNotification {
  id: string;
  title: string;
  message: string;
  imageUrl?: string;
  receivedAt: string;
  read: boolean;
  url?: string;
}

const STORAGE_KEY = 'katiwatch-notifications';
const MAX_STORED = 50;

export function getStoredNotifications(): StoredNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

export function saveNotification(notif: StoredNotification) {
  const existing = getStoredNotifications();
  if (existing.find(n => n.id === notif.id)) return;
  const updated = [notif, ...existing].slice(0, MAX_STORED);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function markAllRead() {
  const existing = getStoredNotifications();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.map(n => ({ ...n, read: true }))));
}

interface UseOneSignalReturn {
  permission: NotifPermission;
  isSubscribed: boolean;
  isInitialized: boolean;
  promptForNotifications: () => Promise<void>;
  linkUserId: (userId: string) => void;
}

export function useOneSignal(): UseOneSignalReturn {
  const [permission, setPermission] = useState<NotifPermission>('loading');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) { setPermission('unsupported'); return; }
    if (!appId) { setPermission('unsupported'); return; }

    window.OneSignalDeferred = window.OneSignalDeferred || [];

    if (!document.getElementById('onesignal-sdk')) {
      const script = document.createElement('script');
      script.id = 'onesignal-sdk';
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      script.async = true;
      document.head.appendChild(script);
    }

    window.OneSignalDeferred.push(async (OneSignal) => {
      if (!OneSignal) return;
      try {
        await OneSignal.init({
          appId,
          allowLocalhostAsSecureOrigin: true,
          notifyButton: { enable: false },
          welcomeNotification: {
            disable: false,
            title: 'Katiwatch',
            message: "Welcome! You'll now get notified about new movies and series.",
          },
        });

        setIsInitialized(true);

        const nativePerm = OneSignal.Notifications.permissionNative;
        const subscribed = OneSignal.Notifications.permission;
        setIsSubscribed(subscribed);
        setPermission(nativePerm === 'denied' ? 'denied' : subscribed ? 'granted' : 'default');

        OneSignal.Notifications.addEventListener('permissionChange', (granted: unknown) => {
          const isGranted = Boolean(granted);
          setIsSubscribed(isGranted);
          setPermission(isGranted ? 'granted' : 'default');
        });

        // Store incoming foreground notifications
        OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event: unknown) => {
          try {
            const e = event as any;
            const n = e?.notification;
            if (!n) return;
            saveNotification({
              id: n.notificationId || n.id || Date.now().toString(),
              title: n.title || 'Katiwatch',
              message: n.body || n.message || '',
              imageUrl: n.bigPicture || n.largeIcon || n.icon || undefined,
              receivedAt: new Date().toISOString(),
              read: false,
              url: n.launchURL || n.url || undefined,
            });
          } catch {}
        });
      } catch (err) {
        console.error('[OneSignal] Init error:', err);
        setPermission('default');
      }
    });
  }, [appId]);

  const promptForNotifications = useCallback(async () => {
    if (typeof window === 'undefined' || !window.OneSignal) return;
    try {
      await window.OneSignal.Notifications.requestPermission();
    } catch (err) {
      console.error('[OneSignal] Prompt error:', err);
    }
  }, []);

  const linkUserId = useCallback((userId: string) => {
    if (typeof window === 'undefined' || !window.OneSignal) return;
    try {
      window.OneSignal.User.addAlias('external_id', userId);
    } catch (err) {
      console.error('[OneSignal] Link user error:', err);
    }
  }, []);

  return { permission, isSubscribed, isInitialized, promptForNotifications, linkUserId };
}
