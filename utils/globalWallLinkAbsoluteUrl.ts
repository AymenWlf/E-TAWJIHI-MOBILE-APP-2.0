import { buildPublicPageUrl } from '@/constants/publicWeb';

/** URL absolue HTTPS pour l’API link-preview (chemins internes du site). */
export function globalWallLinkAbsoluteUrl(href: string): string {
  const h = href.trim();
  if (!h) return '';
  if (/^https?:\/\//i.test(h)) return h;
  const path = h.startsWith('/') ? h : `/${h}`;
  return buildPublicPageUrl(path);
}
