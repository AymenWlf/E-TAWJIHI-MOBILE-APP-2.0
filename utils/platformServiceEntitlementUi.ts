import type { AppLocale } from '@/constants/i18n';
import type { PlatformServiceCatalogEntitlement } from '@/services/platformServices';
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
    case 'blocked':
      return 'danger';
    default:
      return 'muted';
  }
}

export function platformServiceShouldShowCatalogPrice(
  ent: PlatformServiceCatalogEntitlement | undefined,
): boolean {
  if (!ent) return true;
  return ent.purchasable && ent.status !== 'included' && ent.status !== 'already_owned';
}

export function platformServiceCatalogCardInactive(
  ent: PlatformServiceCatalogEntitlement | undefined,
  entitlementsLoading = false,
): boolean {
  if (entitlementsLoading || !ent) return false;
  return !ent.purchasable;
}

export function platformServiceCatalogPriceMode(
  ent: PlatformServiceCatalogEntitlement | undefined,
  entitlementsLoading = false,
  hasPromo = false,
): PlatformServiceCatalogPriceMode {
  if (entitlementsLoading) return 'standard';
  if (!ent || ent.purchasable) {
    return platformServiceShouldShowCatalogPrice(ent) ? 'standard' : 'hidden';
  }
  if (hasPromo) return 'promo-primary-only';
  return 'standard';
}

export function platformServiceCatalogDisplayPrices(
  listPrice: string | null | undefined,
  promoPrice: string | null | undefined,
  mode: PlatformServiceCatalogPriceMode,
): { primary: string; compare: string | null } {
  const list = (listPrice ?? '').trim();
  const sale = (promoPrice ?? '').trim();
  const hasPromo = Boolean(sale && list && shopHasPromotionalPrice(sale, list));

  if (mode === 'promo-primary-only' && hasPromo) {
    return { primary: sale, compare: null };
  }
  if (hasPromo) {
    return { primary: sale, compare: list };
  }
  return { primary: list || sale || '0', compare: null };
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
  if (!ent || ent.purchasable) return t(fallbackKey);
  switch (ent.status) {
    case 'included':
      return t('shopEntitlementIncluded');
    case 'already_owned':
      return t('shopEntitlementAlreadyOwned');
    case 'requires_prerequisite':
      return t('shopEntitlementRequiresPrerequisite');
    default:
      return t('shopEntitlementNotPurchasable');
  }
}

export function resolveUpgradeSourceName(
  ent: PlatformServiceCatalogEntitlement | undefined,
  serviceNameBySlug: Map<string, string>,
  locale: AppLocale,
): string | null {
  if (!ent?.upgradeFromSlugs?.length) return null;
  const slug = ent.upgradeFromSlugs[0];
  return serviceNameBySlug.get(slug) ?? slug;
}
