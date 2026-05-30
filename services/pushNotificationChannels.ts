import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { buildApiUrl } from '@/constants/api';
import { httpGetJson } from '@/services/http';

export type PushChannelConfig = {
  slug: string;
  label: string;
  androidChannelId: string;
  soundAndroid: string;
  soundIos: string;
};

/** Nom de ressource raw Android (sans extension .wav / .mp3). */
function resolveAndroidChannelSound(soundAndroid: string | undefined): string {
  if (!soundAndroid || soundAndroid === 'default') return 'default';
  return soundAndroid.replace(/\.(wav|mp3)$/i, '');
}

let cachedChannels: PushChannelConfig[] | null = null;
let lastFetchAt = 0;
const CACHE_TTL_MS = 15 * 60_000;

export async function fetchPushNotificationChannels(force = false): Promise<PushChannelConfig[]> {
  const now = Date.now();
  if (!force && cachedChannels && now - lastFetchAt < CACHE_TTL_MS) {
    return cachedChannels;
  }
  try {
    const url = buildApiUrl('/api/public/push-notification-channels');
    const res = await httpGetJson<{
      success: boolean;
      data?: { channels?: PushChannelConfig[] };
    }>(url);
    if (res.success && Array.isArray(res.data?.channels) && res.data.channels.length > 0) {
      cachedChannels = res.data.channels;
      lastFetchAt = now;
      return cachedChannels;
    }
  } catch {
    /* fallback */
  }
  return [{ slug: 'default', label: 'Général', androidChannelId: 'default', soundAndroid: 'default', soundIos: 'default' }];
}

/** Synchronise les canaux Android avec la config API (sons par type de notif). */
export async function ensureAndroidNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;
  const channels = await fetchPushNotificationChannels();
  for (const ch of channels) {
    const sound = resolveAndroidChannelSound(ch.soundAndroid);
    await Notifications.setNotificationChannelAsync(ch.androidChannelId, {
      name: ch.label,
      importance: Notifications.AndroidImportance.HIGH,
      sound,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#333E8F',
    });
  }
}
