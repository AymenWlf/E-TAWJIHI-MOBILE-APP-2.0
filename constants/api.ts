import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Port par défaut du backend Symfony en local (`symfony serve` ou `php -S` sur :8001).
 * Surchargeable via `EXPO_PUBLIC_API_PORT` ou directement via `EXPO_PUBLIC_API_BASE_URL`.
 */
const DEV_LOCAL_PORT = (process.env.EXPO_PUBLIC_API_PORT ?? '8001').trim() || '8001';

/**
 * IP ou hostname du Mac qui sert l’API en dev, si la détection Metro échoue
 * (souvent sur **iPhone physique**). Ex. `.env` : `EXPO_PUBLIC_DEV_API_HOST=192.168.1.10`
 */
const DEV_API_HOST_OVERRIDE = (process.env.EXPO_PUBLIC_DEV_API_HOST ?? '').trim();

/**
 * URL de production utilisée hors `__DEV__` (ou comme dernier recours).
 */
const PROD_URL = 'https://apinew.e-tawjihi.ma';

/**
 * Tente de récupérer l'IP LAN du Mac qui sert le bundle Metro
 * (ex. "192.168.68.91:8081"). Couvre Expo Go SDK 49+ et anciennes versions.
 */
function getMetroHost(): string | null {
  // SDK 49+ : Constants.expoConfig?.hostUri
  // SDK <49 : Constants.manifest?.debuggerHost / hostUri
  const candidates: (string | null | undefined)[] = [
    (Constants.expoConfig as any)?.hostUri,
    (Constants.expoConfig as any)?.debuggerHost,
    (Constants as any)?.debuggerHost,
    (Constants as any)?.expoGoConfig?.debuggerHost,
    (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost,
    (Constants as any)?.manifest?.debuggerHost,
    (Constants as any)?.manifest?.hostUri,
    (Constants as any)?.linkingUri,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.length > 0) {
      // On peut recevoir "exp://192.168.x.x:8081" ou "192.168.x.x:8081"
      const cleaned = c.replace(/^[a-z]+:\/\//i, '');
      const host = cleaned.split('/')[0]?.split(':')[0];
      if (host && host !== 'localhost' && host !== '127.0.0.1') return host;
    }
  }
  return null;
}

/**
 * Expo Web : si la page est ouverte via une IP LAN (`http://192.168.x.x:8081`),
 * l’API doit viser la **même** machine — pas `localhost` (qui serait le téléphone / tablette).
 */
function getWebDevApiHostname(): string {
  if (typeof window === 'undefined') return 'localhost';
  const h = window.location?.hostname;
  if (!h) return 'localhost';
  if (h === 'localhost' || h === '127.0.0.1') return 'localhost';
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(h)) return h;
  return 'localhost';
}

/**
 * Hôte local utilisé en dev selon la plateforme :
 * - Android emulator : 10.0.2.2 (loopback hôte depuis l'émulateur)
 * - iOS simulator / web : localhost (ou IP de la page en web sur le LAN)
 * - Device physique : IP LAN du Mac détectée via Metro (`EXPO_PUBLIC_DEV_API_HOST` si besoin)
 */
function getDevHost(): string {
  if (DEV_API_HOST_OVERRIDE) return DEV_API_HOST_OVERRIDE;
  if (Platform.OS === 'web') return getWebDevApiHostname();
  if (Platform.OS === 'android') {
    // Sur émulateur Android : 10.0.2.2.
    // Sur device Android physique : IP LAN du Mac.
    const lan = getMetroHost();
    return lan ?? '10.0.2.2';
  }
  // iOS : simulateur partage la stack du Mac (localhost OK), device physique = IP LAN.
  const lan = getMetroHost();
  return lan ?? 'localhost';
}

export function getApiBaseUrl(): string {
  const raw = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim().replace(/\/$/, '');
  if (raw) return raw;

  if (__DEV__) {
    return `http://${getDevHost()}:${DEV_LOCAL_PORT}`;
  }

  return PROD_URL;
}

export function buildApiUrl(path: string, query?: Record<string, string | number | boolean | undefined | null>): string {
  const base = getApiBaseUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${base}${p}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

/**
 * Indique si l'URL active est locale/dev (utile pour afficher un bandeau debug).
 */
export function isDevApiBaseUrl(): boolean {
  const base = getApiBaseUrl();
  return /(^http:\/\/(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.))/.test(base);
}
