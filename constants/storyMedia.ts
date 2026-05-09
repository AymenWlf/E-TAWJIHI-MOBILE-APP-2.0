/**
 * Résolution des URLs des stories (même logique que le site : fichiers publics API).
 *
 * Définir `EXPO_PUBLIC_MEDIA_BASE_URL` (sans slash final) vers la base publique du backend
 * (ex. `https://api.votredomaine.ma`) pour forcer la base des médias.
 * Sinon on s'aligne automatiquement sur `getApiBaseUrl()` (auto‑détection LAN en dev).
 */
import { getApiBaseUrl } from '@/constants/api';

/** Stories : images uniquement (pas de vidéo dans le lecteur). */
const VIDEO_EXT = /\.(mp4|webm|mov|m4v|avi|mkv|mpeg|ogv)(\?|#|$)/i;

export function isStoryImageUri(uri: string): boolean {
  const path = uri.split(/[?#]/)[0]?.toLowerCase() ?? '';
  return uri.length > 0 && !VIDEO_EXT.test(path);
}

export function resolvePublicMediaUrl(relativeOrAbsolute: string): string {
  const s = relativeOrAbsolute.trim();
  if (!s) return '';
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  const mediaBase = (process.env.EXPO_PUBLIC_MEDIA_BASE_URL ?? '').replace(/\/$/, '');
  if (mediaBase) {
    return `${mediaBase}/${s.replace(/^\//, '')}`;
  }
  const apiBase = getApiBaseUrl().replace(/\/$/, '');
  if (apiBase) {
    return `${apiBase}/${s.replace(/^\//, '')}`;
  }
  const seed = encodeURIComponent(s.replace(/\//g, '-').slice(0, 80));
  return `https://picsum.photos/seed/etawjihi-${seed}/720/1280`;
}
