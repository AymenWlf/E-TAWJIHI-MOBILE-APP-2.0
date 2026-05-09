import { getApiBaseUrl } from '@/constants/api';

/** Placeholder neutre (charte) si aucune image produit. SVG en data URI. */
const SHOP_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'><rect fill='%23f1f5f9' width='400' height='400'/><path fill='%2394a3b8' fill-opacity='.35' d='M130 150h140v100H130z'/><circle cx='200' cy='128' r='22' fill='%2394a3b8' fill-opacity='.25'/></svg>";

/** Résout une entrée image (URL absolue ou chemin uploads serveur). */
export function resolveShopImageUrl(src: string | undefined | null): string {
  if (!src) return '';
  const s = String(src).trim();
  if (!s) return '';
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (s.startsWith('data:')) return s;
  const base = getApiBaseUrl().replace(/\/$/, '');
  if (s.startsWith('/uploads/')) return `${base}${s}`;
  if (!s.startsWith('/')) return `${base}/uploads/${s}`;
  return `${base}${s}`;
}

export function shopProductPrimaryImage(images: string[] | null | undefined): string {
  if (!images || images.length === 0) return SHOP_IMAGE_PLACEHOLDER;
  return resolveShopImageUrl(images[0]) || SHOP_IMAGE_PLACEHOLDER;
}

export function shopProductGalleryUrls(images: string[] | null | undefined): string[] {
  if (!images || images.length === 0) return [SHOP_IMAGE_PLACEHOLDER];
  return images.map((src) => resolveShopImageUrl(src) || SHOP_IMAGE_PLACEHOLDER);
}

export { SHOP_IMAGE_PLACEHOLDER };
