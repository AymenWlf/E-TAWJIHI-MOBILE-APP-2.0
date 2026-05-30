import type { PlatformServiceCatalogEntitlement, PlatformServiceItem } from '@/services/platformServices';
import { resolvePlatformServicePromotionDeadline } from '@/utils/platformServicePromotionDeadline';
import { shopHasPromotionalPrice } from '@/utils/shopFormatPrice';

export function platformServiceCurrency(currency: string): string {
  const c = String(currency ?? '').trim().toUpperCase();
  return c === 'DHS' ? 'MAD' : c || 'MAD';
}

export function platformServiceHasConfiguredPromo(
  listPrice: string | null | undefined,
  promoPrice: string | null | undefined,
): boolean {
  const list = (listPrice ?? '').trim();
  const sale = (promoPrice ?? '').trim();
  return Boolean(sale && list && shopHasPromotionalPrice(sale, list));
}

export function platformServiceActivePromotionalPrice(
  listPrice: string | null | undefined,
  promoPrice: string | null | undefined,
  promotionDeadlineAt?: string | null,
): string | null {
  if (!platformServiceHasConfiguredPromo(listPrice, promoPrice)) return null;
  const resolved = resolvePlatformServicePromotionDeadline(promotionDeadlineAt ?? null, true);
  if (!resolved?.isActive) return null;
  return (promoPrice ?? '').trim();
}

/** Prix unitaire catalogue (promo ou upgrade si applicable), pour panier / commande. */
export function platformServiceEffectiveUnitPriceString(
  s: PlatformServiceItem,
  ent?: PlatformServiceCatalogEntitlement,
): string {
  if (ent?.status === 'upgrade_available' && ent.upgradeUnitPrice) {
    const up = ent.upgradeUnitPrice.trim();
    if (up) return up;
  }
  const list = s.price;
  const activeSale = platformServiceActivePromotionalPrice(
    list,
    s.promotionalPrice,
    s.promotionDeadlineAt,
  );
  if (activeSale) return activeSale;
  const sale = s.promotionalPrice;
  if (sale && !list) return sale.trim();
  return list || sale || '0';
}
