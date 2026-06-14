import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

export type AppLaunchIntent =
  | { kind: 'normal' }
  | { kind: 'push'; content: Notifications.NotificationContent }
  | { kind: 'deep_link'; url: string };

let resolveInFlight: Promise<AppLaunchIntent> | null = null;
let resolved: AppLaunchIntent | null = null;
let defaultTabLaunchRedirectApplied = false;

const IS_WEB = Platform.OS === 'web';
/** Notif considérée comme ouverture seulement si tap récent (évite les réponses Expo périmées). */
const PUSH_LAUNCH_MAX_AGE_MS = 20_000;

function isMeaningfulDeepLink(url: string | null | undefined): url is string {
  if (!url?.trim()) return false;
  const normalized = url.trim();
  if (normalized === 'etawjihi://' || normalized === 'etawjihi:///') return false;
  if (normalized.startsWith('exp://') || normalized.startsWith('exps://')) return false;
  return true;
}

function isRecentPushLaunchResponse(
  response: Notifications.NotificationResponse | null,
): response is Notifications.NotificationResponse {
  if (!response?.notification?.request?.content) return false;
  const dateSec = response.notification.date;
  if (typeof dateSec !== 'number' || !Number.isFinite(dateSec)) {
    return true;
  }
  const ageMs = Date.now() - dateSec * 1000;
  return ageMs >= 0 && ageMs <= PUSH_LAUNCH_MAX_AGE_MS;
}

export function getResolvedAppLaunchIntent(): AppLaunchIntent | null {
  return resolved;
}

export function isNormalAppLaunchIntent(): boolean {
  return !resolved || resolved.kind === 'normal';
}

export function markDefaultTabLaunchRedirectApplied(): void {
  defaultTabLaunchRedirectApplied = true;
}

export function wasDefaultTabLaunchRedirectApplied(): boolean {
  return defaultTabLaunchRedirectApplied;
}

/**
 * Détermine une seule fois comment l’app a été ouverte (lancement normal, push ou deep link).
 * À appeler le plus tôt possible au boot.
 */
export async function resolveAppLaunchIntent(): Promise<AppLaunchIntent> {
  if (resolved) return resolved;
  if (resolveInFlight) return resolveInFlight;

  resolveInFlight = (async (): Promise<AppLaunchIntent> => {
    if (IS_WEB) {
      resolved = { kind: 'normal' };
      return resolved;
    }

    try {
      const [notifResp, initialUrl] = await Promise.all([
        Notifications.getLastNotificationResponseAsync(),
        Linking.getInitialURL(),
      ]);

      if (isRecentPushLaunchResponse(notifResp)) {
        resolved = {
          kind: 'push',
          content: notifResp.notification.request.content,
        };
        return resolved;
      }

      if (isMeaningfulDeepLink(initialUrl)) {
        resolved = { kind: 'deep_link', url: initialUrl.trim() };
        return resolved;
      }
    } catch {
      /* fallback : ouverture normale */
    }

    resolved = { kind: 'normal' };
    return resolved;
  })();

  return resolveInFlight;
}
