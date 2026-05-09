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
 *        - POST le token vers `/api/me/push-token` (idempotent).
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
import { Platform } from 'react-native';
import { router } from 'expo-router';

import { buildApiUrl } from '@/constants/api';
import { httpDeleteJson, httpPostJson } from '@/services/http';
import { getMobileVisitorId } from '@/utils/visitorId';

type AuthTokenGetter = () => Promise<string | null>;

let foregroundHandlerSet = false;
let listenersAttached = false;
let lastRegisteredToken: string | null = null;
let receivedSubscription: Notifications.EventSubscription | null = null;
let responseSubscription: Notifications.EventSubscription | null = null;

/**
 * Configure le rendu d'une notif **reçue alors que l'app est au premier
 * plan** : par défaut Expo ne l'affiche pas, on force l'affichage en bandeau
 * + son pour rester cohérent avec le comportement « notif quand app fermée ».
 */
function ensureForegroundHandler(): void {
  if (foregroundHandlerSet) return;
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

/** Vérifie / demande la permission notification. Renvoie `true` si granted. */
async function requestPermissionsIfNeeded(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status: next } = await Notifications.requestPermissionsAsync();
  return next === 'granted';
}

/** Récupère le projectId Expo (config / EAS) si disponible. */
function resolveProjectId(): string | undefined {
  // `expoConfig` (dev) puis `easConfig` (build EAS).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cfg = Constants.expoConfig as any;
  return cfg?.extra?.eas?.projectId ?? cfg?.extra?.expoProjectId ?? undefined;
}

/**
 * Récupère le ExpoPushToken pour cet appareil. Renvoie `null` en cas de :
 *   - simulateur / émulateur sans support push
 *   - permission refusée
 *   - exécution dans Expo Go (SDK 53+) — message clair en console pour debug
 */
export async function getExpoPushTokenIfPossible(): Promise<string | null> {
  if (!Device.isDevice) {
    // Émulateurs/simulateurs : pas de push réel.
    return null;
  }
  const ok = await requestPermissionsIfNeeded();
  if (!ok) return null;

  await ensureAndroidDefaultChannel();

  try {
    const projectId = resolveProjectId();
    const tokenResp = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return tokenResp.data ?? null;
  } catch (e) {
    // Expo Go SDK 53+ rejette explicitement.
    // eslint-disable-next-line no-console
    console.warn('[push] getExpoPushTokenAsync failed:', e);
    return null;
  }
}

/**
 * Pipeline complet : récupère le token + l'envoie au backend (rattaché à
 * l'utilisateur authentifié). Best-effort silencieux ; ne lève jamais
 * (les erreurs réseau ne doivent pas bloquer le rendu).
 */
export async function registerForPushAndSubmit(getAuthToken: AuthTokenGetter): Promise<string | null> {
  try {
    const expoToken = await getExpoPushTokenIfPossible();
    if (!expoToken) return null;

    const authToken = await getAuthToken();
    if (!authToken) return null;

    if (lastRegisteredToken === expoToken) {
      // Token déjà soumis pour cette session → pas besoin de re-poster.
      return expoToken;
    }

    const installationId = await getMobileVisitorId();
    const url = buildApiUrl('/api/me/push-token');
    const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';
    await httpPostJson<
      { success: boolean },
      { token: string; platform: string; installationId: string }
    >(url, {
      token: expoToken,
      platform,
      installationId,
    }, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    lastRegisteredToken = expoToken;
    return expoToken;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[push] register failed:', e);
    return null;
  }
}

/**
 * Révoque le token côté backend (logout). Best-effort silencieux.
 * Le token mémorisé en RAM est purgé pour permettre une nouvelle
 * registration sur la session suivante.
 */
export async function unregisterPushToken(getAuthToken: AuthTokenGetter): Promise<void> {
  const token = lastRegisteredToken;
  lastRegisteredToken = null;
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
 * Le serveur émet `{ type: 'contest_announcement', contestId, route }`.
 */
type ContestPushData = {
  type?: string;
  contestId?: number | string;
  route?: string;
};

/**
 * Lit la `data` d'une notification (avec tolérance sur le format) et
 * exécute le côté « clic » : tracking + deep-link vers la fiche annonce.
 */
async function handleNotificationTap(
  raw: Notifications.NotificationContent | null | undefined,
  getAuthToken: AuthTokenGetter,
): Promise<void> {
  if (!raw) return;
  const data = (raw.data ?? {}) as ContestPushData;
  const idRaw = data.contestId;
  const id = typeof idRaw === 'string' ? Number(idRaw) : idRaw;
  if (!id || !Number.isFinite(id)) return;

  // Tracking d'abord (silencieux), puis navigation.
  await recordPushClick(id, getAuthToken);

  const route =
    typeof data.route === 'string' && data.route.trim() !== ''
      ? data.route.trim()
      : `/inscriptions/${id}`;
  try {
    router.push(route as Parameters<typeof router.push>[0]);
  } catch {
    /* noop : routeur peut être indisponible si app pas montée */
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
    /* noop : `setNotificationHandler` gère déjà l'affichage en foreground. */
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
