import type { PlatformServiceItem } from '@/services/platformServices';
import { shopHasPromotionalPrice } from '@/utils/shopFormatPrice';

export function platformServiceCurrency(currency: string): string {
  const c = String(currency ?? '').trim().toUpperCase();
  return c === 'DHS' ? 'MAD' : c || 'MAD';
}

/** Prix unitaire catalogue (promo si applicable), pour panier / commande. */
export function platformServiceEffectiveUnitPriceString(s: PlatformServiceItem): string {
  const sale = s.promotionalPrice;
  const list = s.price;
  if (sale && list && shopHasPromotionalPrice(sale, list)) return sale;
  if (sale && !list) return sale;
  return list || sale || '0';
}
