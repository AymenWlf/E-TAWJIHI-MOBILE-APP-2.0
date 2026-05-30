/**
 * Push notifications natives via Expo Push.
 *
 * Cycle de vie complet :
 *   1. `registerForPushAndSubmit(getToken)` est appelé après login
 *      réussi (et au premier lancement avec session) :
 *        - demande la permission de notification (Android API 33+ requis,
 *          iOS implicite via `getExpoPushTokenAsync`).
 *        - récupère le `ExpoPushToken[…]` projet (avec `projectId` issu
 *          d'`expo-constants` si disponible).
 *        - POST le token vers `/api/me/push-token` (idempotent, avec
 *          `deviceId` + `installationId` pour la politique multi-appareils).
 *   2. `attachNotificationListeners()` installe :
 *        - listener tap (notification ouverte depuis la barre des tâches)
 *          → record-push-click + deep-link `/inscriptions/{id}`.
 *        - listener foreground (notif reçue app ouverte) → handler natif
 *          déjà configuré avec `setNotificationHandler` ci-dessous.
 *   3. Au logout, `unregisterPushToken(getToken)` révoque le token côté
 *      backend pour ne plus envoyer de notif sur cet appareil.
 *
 * Cas particulier Expo Go (SDK 53+) : `getExpoPushTokenAsync` ne
 * fonctionne plus dans Expo Go, mais reste valide en build natif (EAS
 * Build / dev client). On gère le rejet silencieusement.
 */
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { DeviceEventEmitter, Linking, Platform } from 'react-native';
import { router } from 'expo-router';

import { buildApiUrl } from '@/constants/api';
import { GLOBAL_WALL_MOBILE_ENABLED, isGlobalWallMobileRoute } from '@/constants/mobileFeatureFlags';
import { NOTIFICATIONS_IN_APP_REFRESH_EVENT } from '@/services/notifications';
import { httpDeleteJson, httpPostJson } from '@/services/http';
import { getOrCreateDeviceId } from '@/utils/deviceId';
import { getMobileVisitorId } from '@/utils/visitorId';
import { ensureAndroidNotificationChannels } from '@/services/pushNotificationChannels';
import { navigateToContestAnnouncement } from '@/utils/contestAnnouncementNavigation';
import { navigateFromAppNotification } from '@/utils/notificationNavigation';
import type { AppNotification } from '@/types/inscriptions';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

type AuthTokenGetter = () => Promise<string | null>;

/**
 * `expo-notifications` n'expose pas ses bindings natifs sur le web (Expo Go
 * web ou build web). Toute tentative d'appel (`getLastNotificationResponseAsync`,
 * `setNotificationHandler`, `getExpoPushTokenAsync`, …) lève
 * `ExpoNotifications.X is not available on web`. On court-circuite donc
 * tous les entry points publics quand on tourne dans un navigateur.
 */
const IS_WEB = Platform.OS === 'web';

let foregroundHandlerSet = false;
let listenersAttached = false;
let lastRegisteredToken: string | null = null;
let receivedSubscription: Notifications.EventSubscription | null = null;
let responseSubscription: Notifications.EventSubscription | null = null;
/** Push indisponible pour toute la session (projectId manquant, Expo Go, etc.). */
let sessionPushBlocked = false;
let sessionPushBlockLogged = false;
let registerInFlight: Promise<string | null> | null = null;
let lastRegisterAttemptAt = 0;

const REGISTER_RETRY_MS = 5 * 60_000;

function logPushBlockedOnce(message: string): void {
  if (sessionPushBlockLogged) return;
  sessionPushBlockLogged = true;
  // eslint-disable-next-line no-console
  console.warn(message);
}

function markSessionPushBlocked(message: string): void {
  sessionPushBlocked = true;
  logPushBlockedOnce(message);
}

/**
 * Configure le rendu d'une notif **reçue alors que l'app est au premier
 * plan** : par défaut Expo ne l'affiche pas, on force l'affichage en bandeau
 * + son pour rester cohérent avec le comportement « notif quand app fermée ».
 */
function ensureForegroundHandler(): void {
  if (foregroundHandlerSet || IS_WEB) return;
  foregroundHandlerSet = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Crée le canal Android par défaut (obligatoire à partir d'API 26 pour
 * que les notifications s'affichent). `default` correspond à celui passé
 * dans `channelId` côté backend (`ExpoPushMessage::channelId`).
 */
async function ensureAndroidDefaultChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Notifications par défaut',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#333E8F',
  });
}

function mapPermissionStatus(status: Notifications.PermissionStatus): NotificationPermissionStatus {
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

/** État actuel de la permission notification (sans afficher de dialogue). */
export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  if (IS_WEB) return 'denied';
  const { status } = await Notifications.getPermissionsAsync();
  return mapPermissionStatus(status);
}

/** Demande la permission système (dialogue iOS / Android). */
export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (IS_WEB) return 'denied';
  const current = await getNotificationPermissionStatus();
  if (current === 'granted') return 'granted';
  const { status } = await Notifications.requestPermissionsAsync();
  return mapPermissionStatus(status);
}

/** Ouvre les réglages de l’app (notifications) selon la plateforme. */
export function openNotificationSettings(): void {
  void Linking.openSettings();
}

/** Vérifie / demande la permission notification. Renvoie `true` si granted. */
async function requestPermissionsIfNeeded(): Promise<boolean> {
  const status = await requestNotificationPermission();
  return status === 'granted';
}

/**
 * Après login, inscription ou fin de setup : demande la permission si jamais demandée,
 * puis enregistre le token Expo côté backend.
 */
export async function promptNotificationPermissionAfterAuth(
  getAuthToken: AuthTokenGetter,
): Promise<void> {
  if (IS_WEB || !isNativePushRegistrationSupported()) return;
  const status = await getNotificationPermissionStatus();
  if (status === 'undetermined') {
    await requestNotificationPermission();
  }
  void registerForPushAndSubmit(getAuthToken);
}

/** Récupère le projectId Expo (config / EAS / env) si disponible. */
function resolveProjectId(): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cfg = Constants.expoConfig as any;
  const fromExtra = cfg?.extra?.eas?.projectId ?? cfg?.extra?.expoProjectId;
  const fromEas = Constants.easConfig?.projectId;
  const fromEnv =
    typeof process.env.EXPO_PUBLIC_EAS_PROJECT_ID === 'string'
      ? process.env.EXPO_PUBLIC_EAS_PROJECT_ID.trim()
      : '';
  const id = fromExtra ?? fromEas ?? (fromEnv || undefined);
  return typeof id === 'string' && id.length > 0 ? id : undefined;
}

/** Indique si l’enregistrement push natif est possible sur cet appareil / build. */
export function isNativePushRegistrationSupported(): boolean {
  if (IS_WEB || sessionPushBlocked) return false;
  if (!Device.isDevice) return false;
  const projectId = resolveProjectId();
  if (!projectId) {
    markSessionPushBlocked(
      '[push] Expo projectId manquant — push désactivé. Définissez EXPO_PUBLIC_EAS_PROJECT_ID dans .env ou extra.eas.projectId (npx eas init).',
    );
    return false;
  }
  return true;
}

/**
 * Récupère le ExpoPushToken pour cet appareil. Renvoie `null` en cas de :
 *   - simulateur / émulateur sans support push
 *   - permission refusée
 *   - exécution dans Expo Go (SDK 53+) — message clair en console pour debug
 */
export async function getExpoPushTokenIfPossible(): Promise<string | null> {
  if (IS_WEB || sessionPushBlocked) return null;
  if (!Device.isDevice) {
    return null;
  }

  const projectId = resolveProjectId();
  if (!projectId) {
    markSessionPushBlocked(
      '[push] Expo projectId manquant — push désactivé. Définissez EXPO_PUBLIC_EAS_PROJECT_ID dans .env ou extra.eas.projectId (npx eas init).',
    );
    return null;
  }

  const ok = await requestPermissionsIfNeeded();
  if (!ok) return null;

  await ensureAndroidDefaultChannel();

  try {
    const tokenResp = await Notifications.getExpoPushTokenAsync({ projectId });
    return tokenResp.data ?? null;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/projectId|expo go|not available/i.test(msg)) {
      markSessionPushBlocked(`[push] Enregistrement push impossible : ${msg}`);
    } else {
      // eslint-disable-next-line no-console
      console.warn('[push] getExpoPushTokenAsync failed:', e);
    }
    return null;
  }
}

/**
 * Pipeline complet : récupère le token + l'envoie au backend (rattaché à
 * l'utilisateur authentifié). Best-effort silencieux ; ne lève jamais
 * (les erreurs réseau ne doivent pas bloquer le rendu).
 */
export async function registerForPushAndSubmit(getAuthToken: AuthTokenGetter): Promise<string | null> {
  if (IS_WEB || sessionPushBlocked) return null;

  const now = Date.now();
  if (
    lastRegisteredToken == null &&
    now - lastRegisterAttemptAt < REGISTER_RETRY_MS &&
    lastRegisterAttemptAt > 0
  ) {
    return null;
  }

  if (registerInFlight) {
    return registerInFlight;
  }

  registerInFlight = (async () => {
    lastRegisterAttemptAt = Date.now();
    try {
      const expoToken = await getExpoPushTokenIfPossible();
      if (!expoToken) return null;

      const authToken = await getAuthToken();
      if (!authToken) return null;

      if (lastRegisteredToken === expoToken) {
        return expoToken;
      }

      await ensureAndroidNotificationChannels();
      const installationId = await getMobileVisitorId();
      const deviceId = await getOrCreateDeviceId();
      const url = buildApiUrl('/api/me/push-token');
      const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';
      await httpPostJson<
        { success: boolean },
        { token: string; platform: string; installationId: string; deviceId: string }
      >(url, {
        token: expoToken,
        platform,
        installationId,
        deviceId,
      }, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      lastRegisteredToken = expoToken;
      return expoToken;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[push] register failed:', e);
      return null;
    } finally {
      registerInFlight = null;
    }
  })();

  return registerInFlight;
}

/**
 * Révoque le token côté backend (logout). Best-effort silencieux.
 * Le token mémorisé en RAM est purgé pour permettre une nouvelle
 * registration sur la session suivante.
 */
/**
 * Notification locale immédiate pour l’étape 1 du tutoriel inscriptions.
 * N’utilise pas le serveur Expo Push : fonctionne sans token enregistré.
 * Le tap est ignoré (`type: apply_tour_demo`) pour rester dans le guide.
 */
export async function presentApplyTourDemoPush(params: {
  title: string;
  body: string;
}): Promise<boolean> {
  if (IS_WEB) return false;
  ensureForegroundHandler();
  const ok = await requestPermissionsIfNeeded();
  if (!ok) return false;
  await ensureAndroidDefaultChannel();
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: params.title,
        body: params.body,
        data: { type: 'apply_tour_demo' },
        sound: true,
      },
      trigger: null,
    });
    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[push] tour demo local notification failed:', e);
    return false;
  }
}

export async function unregisterPushToken(getAuthToken: AuthTokenGetter): Promise<void> {
  if (IS_WEB) return;
  const token = lastRegisteredToken;
  lastRegisteredToken = null;
  registerInFlight = null;
  if (!token) return;

  try {
    const authToken = await getAuthToken();
    if (!authToken) return;
    const url = buildApiUrl('/api/me/push-token') + `?token=${encodeURIComponent(token)}`;
    await httpDeleteJson<{ success: boolean }>(url, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
  } catch {
    /* noop */
  }
}

/**
 * Notifie le backend qu'un user a tapé sur la push d'une annonce (pour les
 * KPIs "clics push"). Idempotent côté backend — seul le premier compte.
 */
async function recordPushClick(contestId: number, getAuthToken: AuthTokenGetter): Promise<void> {
  try {
    const authToken = await getAuthToken();
    if (!authToken) return;
    const url = buildApiUrl(`/api/contest-announcements/${contestId}/record-push-click`);
    await httpPostJson<{ success: boolean }, Record<string, never>>(url, {} as Record<string, never>, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
  } catch {
    /* noop */
  }
}

/**
 * Type minimal de la donnée embarquée dans une notification push backend.
 * Le serveur émet `{ type: 'contest_announcement', contestId, route }` ou
 * `{ type: 'daily_challenge', route }`.
 */
type PushData = Record<string, unknown> & {
  type?: string;
  contestId?: number | string;
  route?: string;
  referral_event?: string;
  public_code?: string;
  deep_link?: string;
  notification_id?: number | string;
  contest_announcement_id?: number | string;
  commercial_client?: boolean | string | number;
  tab?: string;
};

function navigateFromPushPayload(data: PushData): boolean {
  const route = typeof data.route === 'string' ? data.route.trim() : '';
  if (route && isGlobalWallMobileRoute(route)) {
    if (GLOBAL_WALL_MOBILE_ENABLED) {
      try {
        router.push(route as Parameters<typeof router.push>[0]);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
  const type = String(data.type ?? '');
  const meta = data as Record<string, unknown>;
  const n: AppNotification = {
    id: Number(data.notification_id) || 0,
    type,
    title: '',
    message: '',
    isRead: false,
    createdAt: new Date().toISOString(),
    metadata: meta,
  };
  return navigateFromAppNotification(n);
}

/**
 * Lit la `data` d'une notification (avec tolérance sur le format) et
 * exécute le côté « clic » : tracking + deep-link vers la fiche annonce ou le défi du jour.
 */
async function handleNotificationTap(
  raw: Notifications.NotificationContent | null | undefined,
  getAuthToken: AuthTokenGetter,
): Promise<void> {
  if (!raw) return;
  const data = (raw.data ?? {}) as PushData;

  /** Démo tutoriel « Gestion des inscriptions » : affichage uniquement, pas de navigation. */
  if (data.type === 'apply_tour_demo') {
    return;
  }

  if (data.type === 'contest_announcement') {
    const idRaw = data.contestId ?? data.contest_announcement_id;
    const id = typeof idRaw === 'string' ? Number(idRaw) : idRaw;
    if (id && Number.isFinite(id)) {
      await recordPushClick(id, getAuthToken);
      navigateToContestAnnouncement(id, data as Record<string, unknown>);
    }
    return;
  }

  if (navigateFromPushPayload(data)) {
    return;
  }

  const fallbackIdRaw = data.contestId ?? data.contest_announcement_id;
  const fallbackId = typeof fallbackIdRaw === 'string' ? Number(fallbackIdRaw) : fallbackIdRaw;
  if (!fallbackId || !Number.isFinite(fallbackId)) return;

  const route =
    typeof data.route === 'string' && data.route.trim() !== ''
      ? data.route.trim()
      : `/inscriptions/${fallbackId}`;
  if (isGlobalWallMobileRoute(route)) {
    return;
  }
  try {
    router.push(route as Parameters<typeof router.push>[0]);
  } catch {
    /* noop */
  }
}

/**
 * Branche les listeners de notifications. Appelé une fois après le mount
 * de l'app. Idempotent : un seul jeu de listeners actifs en simultané.
 *
 * Renvoie une fonction de cleanup (à appeler au démontage si nécessaire,
 * en pratique l'app vit pendant toute la session donc on ne nettoie pas).
 */
export function attachNotificationListeners(getAuthToken: AuthTokenGetter): () => void {
  // Web : `expo-notifications` n'est pas linké, on saute proprement
  // sans toucher à `listenersAttached` pour rester idempotent côté natif.
  if (IS_WEB) {
    return () => undefined;
  }

  ensureForegroundHandler();

  if (listenersAttached) {
    return () => detachNotificationListeners();
  }
  listenersAttached = true;

  // Cas 1 : app ouverte par un tap depuis la notif (cold start)
  void Notifications.getLastNotificationResponseAsync().then((resp) => {
    if (resp) {
      void handleNotificationTap(resp.notification.request.content, getAuthToken);
    }
  });

  // Cas 2 : app déjà running, user reçoit une notif → on garde le hook
  // (utile si on veut afficher un toast / mettre à jour un badge).
  receivedSubscription = Notifications.addNotificationReceivedListener(() => {
    /** Nouvelle notif (y compris premier plan) → même flux que messages : badge + liste API à jour sans ouvrir le panneau. */
    DeviceEventEmitter.emit(NOTIFICATIONS_IN_APP_REFRESH_EVENT, { force: true });
  });

  // Cas 3 : user tap sur une notification (foreground OU background).
  responseSubscription = Notifications.addNotificationResponseReceivedListener((resp) => {
    void handleNotificationTap(resp.notification.request.content, getAuthToken);
  });

  return () => detachNotificationListeners();
}

function detachNotificationListeners(): void {
  if (receivedSubscription) {
    receivedSubscription.remove();
    receivedSubscription = null;
  }
  if (responseSubscription) {
    responseSubscription.remove();
    responseSubscription = null;
  }
  listenersAttached = false;
}
