/**
 * Base du site public (pages SEO / aperçus de liens messagerie).
 * Surcharge : `EXPO_PUBLIC_WEB_APP_URL` (sans slash final), ex. https://www.e-tawjihi.ma
 */
const DEFAULT_PUBLIC_WEB_ORIGIN = 'https://www.e-tawjihi.ma';

export function getPublicWebOrigin(): string {
  const raw = (process.env.EXPO_PUBLIC_WEB_APP_URL ?? '').trim().replace(/\/$/, '');
  return raw || DEFAULT_PUBLIC_WEB_ORIGIN;
}

export function buildPublicPageUrl(path: string): string {
  const origin = getPublicWebOrigin();
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${p}`;
}
