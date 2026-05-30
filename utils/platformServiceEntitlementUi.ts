import type { AppLocale } from '@/constants/i18n';
import type { PlatformServiceCatalogEntitlement } from '@/services/platformServices';
import { platformServiceCanAddToCart } from '@/utils/platformServiceCartEviction';
import { platformServiceActivePromotionalPrice } from '@/utils/platformServicePrice';
import { shopHasPromotionalPrice } from '@/utils/shopFormatPrice';

export type PlatformServiceCatalogPriceMode = 'standard' | 'promo-primary-only' | 'hidden';

export type TranslateFn = (key: string) => string;

/** Libellé court pour pill / badge (statut uniquement, pas le message API). */
export function platformServiceEntitlementShortLabel(
  ent: PlatformServiceCatalogEntitlement | undefined,
  t: TranslateFn,
  sourceServiceName?: string | null,
): string | null {
  if (!ent) return null;
  switch (ent.status) {
    case 'already_owned':
      return t('shopEntitlementAlreadyOwned');
    case 'included':
      return sourceServiceName
        ? t('shopEntitlementIncludedVia').replace('{name}', sourceServiceName)
        : t('shopEntitlementIncluded');
    case 'blocked':
      return t('shopEntitlementBlocked');
    case 'requires_prerequisite':
      return t('shopEntitlementRequiresPrerequisite');
    case 'not_eligible':
      return t('eligibilityYouNotEligible');
    case 'upgrade_available':
      return t('shopEntitlementUpgradeAvailable');
    default:
      return null;
  }
}

/** @deprecated Préférer platformServiceEntitlementShortLabel pour l’UI */
export function platformServiceEntitlementLabel(
  ent: PlatformServiceCatalogEntitlement | undefined,
  t: TranslateFn,
  sourceServiceName?: string | null,
): string | null {
  if (!ent) return null;
  if (ent.message?.trim()) return ent.message.trim();
  return platformServiceEntitlementShortLabel(ent, t, sourceServiceName);
}

export function platformServiceEntitlementBadgeTone(
  status: PlatformServiceCatalogEntitlement['status'] | undefined,
): 'success' | 'muted' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'already_owned':
    case 'included':
      return 'success';
    case 'upgrade_available':
      return 'info';
    case 'requires_prerequisite':
      return 'warning';
    case 'not_eligible':
      return 'danger';
    case 'blocked':
      return 'danger';
    default:
      return 'muted';
  }
}

/** Boutons panier / achat actifs (y compris si remplacement d’un service en conflit). */
export function platformServiceCatalogPurchasable(
  ent: PlatformServiceCatalogEntitlement | undefined,
  entitlementsLoading = false,
): boolean {
  if (entitlementsLoading) return false;
  if (!ent) return true;
  return platformServiceCanAddToCart(ent);
}

export function platformServiceShouldShowCatalogPrice(
  ent: PlatformServiceCatalogEntitlement | undefined,
): boolean {
  if (!ent) return true;
  const canBuy = ent.purchasable || (ent.replacesCartSlugs?.length ?? 0) > 0;
  return canBuy && ent.status !== 'included' && ent.status !== 'already_owned';
}

export function platformServiceCatalogCardInactive(
  ent: PlatformServiceCatalogEntitlement | undefined,
  entitlementsLoading = false,
): boolean {
  if (entitlementsLoading || !ent) return false;
  if ((ent.replacesCartSlugs?.length ?? 0) > 0) return false;
  return !ent.purchasable;
}

export function platformServiceCatalogPriceMode(
  ent: PlatformServiceCatalogEntitlement | undefined,
  entitlementsLoading = false,
  hasPromo = false,
): PlatformServiceCatalogPriceMode {
  if (entitlementsLoading) return 'standard';
  const canAdd = !ent || ent.purchasable || (ent.replacesCartSlugs?.length ?? 0) > 0;
  if (canAdd) {
    return platformServiceShouldShowCatalogPrice(ent) ? 'standard' : 'hidden';
  }
  if (hasPromo) return 'promo-primary-only';
  return 'standard';
}

export function platformServiceCatalogDisplayPrices(
  listPrice: string | null | undefined,
  promoPrice: string | null | undefined,
  mode: PlatformServiceCatalogPriceMode,
  ent?: PlatformServiceCatalogEntitlement,
  promotionDeadlineAt?: string | null,
): { primary: string; compare: string | null; isUpgradePrice: boolean } {
  const list = (listPrice ?? '').trim();
  const sale =
    platformServiceActivePromotionalPrice(listPrice, promoPrice, promotionDeadlineAt) ??
    (promoPrice ?? '').trim();
  const hasPromo = Boolean(sale && list && shopHasPromotionalPrice(sale, list));
  const upgradeUnit = (ent?.upgradeUnitPrice ?? '').trim();
  const hasUpgrade =
    ent?.status === 'upgrade_available' &&
    Boolean(upgradeUnit && list && shopHasPromotionalPrice(upgradeUnit, list));

  if (hasUpgrade) {
    return { primary: upgradeUnit, compare: list, isUpgradePrice: true };
  }

  if (mode === 'promo-primary-only' && hasPromo) {
    return { primary: sale, compare: null, isUpgradePrice: false };
  }
  if (hasPromo) {
    return { primary: sale, compare: list, isUpgradePrice: false };
  }
  return { primary: list || sale || '0', compare: null, isUpgradePrice: false };
}

export function sortPlatformServicesForCatalog<T extends { slug: string; sortOrder?: number | null }>(
  items: T[],
  entitlementsBySlug: Record<string, PlatformServiceCatalogEntitlement>,
  entitlementsLoading: boolean,
): T[] {
  return [...items].sort((a, b) => {
    const aInactive = platformServiceCatalogCardInactive(entitlementsBySlug[a.slug], entitlementsLoading);
    const bInactive = platformServiceCatalogCardInactive(entitlementsBySlug[b.slug], entitlementsLoading);
    if (aInactive !== bInactive) return aInactive ? 1 : -1;
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });
}

export function platformServiceEntitlementCtaLabel(
  ent: PlatformServiceCatalogEntitlement | undefined,
  t: TranslateFn,
  fallbackKey: string,
): string {
  if (ent?.status === 'upgrade_available') {
    return t('shopEntitlementUpgradeAvailable');
  }
  if (!ent || ent.purchasable || (ent.replacesCartSlugs?.length ?? 0) > 0) return t(fallbackKey);
  switch (ent.status) {
    case 'included':
      return t('shopEntitlementIncluded');
    case 'already_owned':
      return t('shopEntitlementAlreadyOwned');
    case 'requires_prerequisite':
      return t('shopEntitlementRequiresPrerequisite');
    case 'not_eligible':
      return t('eligibilityYouNotEligible');
    default:
      return t('shopEntitlementNotPurchasable');
  }
}

export function resolveUpgradeSourceName(
  ent: PlatformServiceCatalogEntitlement | undefined,
  serviceNameBySlug: Map<string, string>,
  _locale?: AppLocale,
): string | null {
  if (!ent?.upgradeFromSlugs?.length) return null;
  const slug = ent.upgradeFromSlugs[0];
  return serviceNameBySlug.get(slug) ?? slug;
}

/** Détail tarif upgrade pour récap checkout (prix catalogue, crédit service possédé, net). */
export function platformServiceUpgradeCheckoutBreakdown(
  listPrice: string | null | undefined,
  promoPrice: string | null | undefined,
  ent: PlatformServiceCatalogEntitlement | undefined,
): {
  catalogUnitPrice: string;
  upgradeCredit: string;
  upgradeUnitPrice: string;
} | null {
  if (ent?.status !== 'upgrade_available') return null;
  const upgradeCredit = (ent.upgradeCredit ?? '').trim();
  const upgradeUnitPrice = (ent.upgradeUnitPrice ?? '').trim();
  if (!upgradeCredit || !upgradeUnitPrice) return null;
  const { compare } = platformServiceCatalogDisplayPrices(
    listPrice,
    promoPrice,
    'standard',
    ent,
    undefined,
  );
  const catalogUnitPrice = (compare ?? listPrice ?? '').trim();
  if (!catalogUnitPrice) return null;
  return { catalogUnitPrice, upgradeCredit, upgradeUnitPrice };
}
