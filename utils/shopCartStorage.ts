import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ShopCartLine } from '@/types/shop';

import { isPlatformServiceCartLine, platformServiceCartProductId } from './platformServiceCart';

const STORAGE_KEY = 'etawjihi_shop_cart_v1';

function isShopCartLine(row: unknown): row is ShopCartLine {
  if (!row || typeof row !== 'object') return false;
  const r = row as Partial<ShopCartLine>;
  if (typeof r.productId !== 'number' || typeof r.slug !== 'string' || typeof r.quantity !== 'number') {
    return false;
  }
  if (typeof r.price !== 'string' || typeof r.title !== 'string') {
    return false;
  }
  const t = r.type;
  if (t !== 'product' && t !== 'pack' && t !== 'service') {
    return false;
  }
  if (r.lineKind === 'platform_service') {
    return typeof r.platformServiceSlug === 'string' && r.platformServiceSlug.length > 0;
  }
  if (t === 'service') {
    const svcSlug =
      typeof r.platformServiceSlug === 'string' && r.platformServiceSlug.trim().length > 0
        ? r.platformServiceSlug.trim()
        : r.slug.trim().length > 0
          ? r.slug.trim()
          : '';
    return svcSlug !== '';
  }
  return r.productId > 0;
}

/** Paniers persistés avant `lineKind` / `platformServiceSlug` explicites. */
function normalizeLoadedCartLine(line: ShopCartLine): ShopCartLine {
  if (line.type !== 'service') return line;
  const slug = (line.platformServiceSlug ?? line.slug).trim();
  if (!slug) return line;
  const next: ShopCartLine = {
    ...line,
    lineKind: 'platform_service',
    platformServiceSlug: slug,
    slug,
  };
  if (!(line.productId < 0)) {
    next.productId = platformServiceCartProductId(slug);
  }
  return next;
}

export async function loadCart(): Promise<ShopCartLine[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isShopCartLine)
      .map(normalizeLoadedCartLine)
      .map((l) => (isPlatformServiceCartLine(l) ? { ...l, quantity: 1 } : l));
  } catch {
    return [];
  }
}

export async function saveCart(lines: ShopCartLine[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* quota errors silenced */
  }
}

export async function clearCart(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function cartItemCount(lines: ShopCartLine[]): number {
  return lines.reduce((acc, l) => acc + l.quantity, 0);
}

/** Après « Commander » : plusieurs lignes → panier ; une seule → checkout. */
export async function getShopPathAfterBuyNow(): Promise<'/boutique/checkout' | '/boutique/cart'> {
  const lines = await loadCart();
  return lines.length > 1 ? '/boutique/cart' : '/boutique/checkout';
}

export function upsertCartLine(lines: ShopCartLine[], line: ShopCartLine): ShopCartLine[] {
  const incoming = isPlatformServiceCartLine(line) ? { ...line, quantity: 1 } : line;
  const idx = lines.findIndex((l) => l.productId === incoming.productId);
  if (idx === -1) return [...lines, incoming];
  const next = [...lines];
  const prev = next[idx];
  const mergedPlatform =
    isPlatformServiceCartLine(prev) || isPlatformServiceCartLine(incoming);
  next[idx] = {
    ...prev,
    quantity: mergedPlatform ? 1 : prev.quantity + incoming.quantity,
    ...(incoming.images?.length ? { images: incoming.images } : {}),
    ...(incoming.isFreeShipping !== undefined ? { isFreeShipping: incoming.isFreeShipping } : {}),
    ...(incoming.packPricingMode !== undefined ? { packPricingMode: incoming.packPricingMode } : {}),
    ...(mergedPlatform
      ? {
          lineKind: 'platform_service' as const,
          type: 'service' as const,
          platformServiceSlug: incoming.platformServiceSlug ?? prev.platformServiceSlug,
          platformServiceBrandIcon: prev.platformServiceBrandIcon ?? incoming.platformServiceBrandIcon,
          platformServiceBrandColor: prev.platformServiceBrandColor ?? incoming.platformServiceBrandColor,
        }
      : {}),
  };
  return next;
}
