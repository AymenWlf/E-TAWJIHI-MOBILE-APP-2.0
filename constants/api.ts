import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Port par défaut du backend Symfony en local (`symfony serve` ou `php -S` sur :8001).
 * Surchargeable via `EXPO_PUBLIC_API_PORT` ou directement via `EXPO_PUBLIC_API_BASE_URL`.
 */
const DEV_LOCAL_PORT = (process.env.EXPO_PUBLIC_API_PORT ?? '8001').trim() || '8001';

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
 * Hôte local utilisé en dev selon la plateforme :
 * - Android emulator : 10.0.2.2 (loopback hôte depuis l'émulateur)
 * - iOS simulator / web : localhost
 * - Device physique : IP LAN du Mac détectée via Metro (ou EXPO_PUBLIC_API_BASE_URL)
 */
function getDevHost(): string {
  if (Platform.OS === 'web') return 'localhost';
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
