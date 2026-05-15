import type { ShopCartLine } from '@/types/shop';

/** Identifiant panier stable (négatif) pour ne pas collisionner avec les IDs produits boutique. */
export function platformServiceCartProductId(slug: string): number {
  let h = 5381;
  const s = String(slug ?? '');
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  const n = h | 0;
  if (n >= 0) return n === 0 ? -2 : -n - 1;
  return n === 0 ? -2 : n;
}

export function isPlatformServiceCartLine(line: ShopCartLine): boolean {
  const slug =
    (line.platformServiceSlug ?? '').trim() || (line.type === 'service' ? (line.slug ?? '').trim() : '');
  if (!slug) return false;
  return line.lineKind === 'platform_service' || line.type === 'service';
}
