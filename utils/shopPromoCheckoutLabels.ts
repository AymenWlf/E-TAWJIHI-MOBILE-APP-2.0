import type { LocaleKey } from '@/constants/i18n';
import type { ShopPromoDiscountType } from '@/services/shopPromo';
import { formatShopPrice } from '@/utils/shopFormatPrice';

export function normalizeShopPromoDiscountType(type: string | null | undefined): ShopPromoDiscountType | null {
  if (type === 'percent' || type === 'fixed') return type;
  return null;
}

function hasConcretePromoDiscountLabel(
  discountType: ShopPromoDiscountType | null,
  discountValue: string | null,
): discountValue is string {
  if (!discountType || !discountValue) return false;
  const normalized = discountValue.replace(/\.00$/, '').trim();
  return normalized !== '' && normalized !== '0';
}

export function buildShopPromoAppliedMessage(params: {
  discountType: ShopPromoDiscountType | null;
  discountValue: string | null;
  eligibleSubtotal: number | null;
  currency: string;
  fallbackMessage: string;
  t: (key: LocaleKey) => string;
}): string {
  const { discountType, discountValue, eligibleSubtotal, currency, fallbackMessage, t } = params;
  if (
    discountType === 'percent' &&
    hasConcretePromoDiscountLabel(discountType, discountValue) &&
    eligibleSubtotal != null &&
    !Number.isNaN(eligibleSubtotal)
  ) {
    return t('shopCheckoutPromoAppliedPercent')
      .replace('{pct}', discountValue.replace(/\.00$/, ''))
      .replace('{base}', formatShopPrice(String(eligibleSubtotal), currency));
  }
  if (discountType === 'fixed' && hasConcretePromoDiscountLabel(discountType, discountValue)) {
    return t('shopCheckoutPromoAppliedFixed')
      .replace('{amount}', formatShopPrice(discountValue, currency));
  }
  return fallbackMessage;
}

export function buildShopPromoSummaryLabel(params: {
  discountType: ShopPromoDiscountType | null;
  discountValue: string | null;
  code: string;
  currency: string;
  t: (key: LocaleKey) => string;
}): string {
  const { discountType, discountValue, code, currency, t } = params;
  if (discountType === 'percent' && hasConcretePromoDiscountLabel(discountType, discountValue)) {
    return t('shopCheckoutLblDiscountPercent')
      .replace('{code}', code)
      .replace('{pct}', discountValue.replace(/\.00$/, ''));
  }
  if (discountType === 'fixed' && hasConcretePromoDiscountLabel(discountType, discountValue)) {
    return t('shopCheckoutLblDiscountFixed')
      .replace('{code}', code)
      .replace('{amount}', formatShopPrice(discountValue, currency));
  }
  return t('shopCheckoutLblDiscount').replace('{code}', code);
}
