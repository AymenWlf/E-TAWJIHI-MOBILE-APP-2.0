/**
 * Extrait l'identifiant vidéo YouTube (11 caractères) pour lecteur intégré.
 */

const ID_RE = /^[a-zA-Z0-9_-]{11}$/;

export function parseYoutubeVideoId(raw: string | null | undefined): string | null {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  let urlStr = s;
  if (!/^https?:\/\//i.test(urlStr)) {
    urlStr = `https://${urlStr}`;
  }
  try {
    const u = new URL(urlStr);
    const host = u.hostname.replace(/^www\./i, '').toLowerCase();
    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0] ?? '';
      return ID_RE.test(id) ? id : null;
    }
    if (!host.endsWith('youtube.com')) return null;
    const v = u.searchParams.get('v');
    if (v && ID_RE.test(v)) return v;
    const mEmbed = u.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})/);
    if (mEmbed) return mEmbed[1];
    const mShorts = u.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (mShorts) return mShorts[1];
    const mLive = u.pathname.match(/^\/live\/([a-zA-Z0-9_-]{11})/);
    if (mLive) return mLive[1];
  } catch {
    return null;
  }
  return null;
}

/** Origine par défaut si l’app ne fournit pas la sienne (évite l’erreur YouTube 153 en WebView). */
export const YOUTUBE_EMBED_DEFAULT_ORIGIN = 'https://www.e-tawjihi.ma';

/**
 * URL d’iframe YouTube. Le paramètre `origin` + un en-tête `Referer` côté WebView
 * sont requis depuis fin 2025 pour la lecture dans les apps (erreur 153 sinon).
 *
 * @param pageOrigin — ex. `https://www.e-tawjihi.ma` ou `window.location.origin` sur le web
 */
export function youtubeNocookieEmbedSrc(videoId: string, pageOrigin: string = YOUTUBE_EMBED_DEFAULT_ORIGIN): string {
  let origin = pageOrigin.trim().replace(/\/$/, '');
  if (!/^https:\/\//i.test(origin)) {
    origin = YOUTUBE_EMBED_DEFAULT_ORIGIN;
  }
  const q = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    origin,
  });
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${q.toString()}`;
}
