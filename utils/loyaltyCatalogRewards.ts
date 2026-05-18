import { LOYALTY_POINTS_PER_MAD } from '@/constants/loyaltyConfig';
import type { PlatformServiceItem } from '@/services/platformServices';
import { platformServiceEffectiveUnitPriceString } from '@/utils/platformServicePrice';
import { shopProductPrimaryImage } from '@/utils/shopImageUrl';
import type { ShopProductListItem } from '@/types/shop';

export type LoyaltyRewardKind = 'product' | 'platform_service';

export type LoyaltyRewardTier = {
  id: string;
  kind: LoyaltyRewardKind;
  tierIndex: number;
  title: string;
  subtitle: string | null;
  slug: string;
  priceMad: number;
  currency: string;
  pointsCost: number;
  imageUrl: string | null;
  usePlatformThumb: boolean;
  brandIcon: string | null;
  brandColor: string | null;
  affordable: boolean;
  pointsToUnlock: number;
  /** false = récompense visible mais non déblocable (admin). */
  redemptionActive: boolean;
  /** true = déjà échangée une fois par l’utilisateur. */
  alreadyRedeemed?: boolean;
  entityId?: number;
};

export function parsePriceMad(price: string | null | undefined): number {
  const n = parseFloat(String(price ?? '').replace(',', '.').trim());
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Coût en points pour débloquer une récompense (légère prime vs équivalent MAD).
 */
export function computeRedeemPointsCost(priceMad: number): number {
  if (priceMad <= 0) return 0;
  const base = priceMad * LOYALTY_POINTS_PER_MAD;
  const premium = base * 1.2;
  return Math.max(150, Math.round(premium / 50) * 50);
}

function productSubtitle(p: ShopProductListItem): string | null {
  if (p.category?.trim()) return p.category.trim();
  if (p.type === 'pack') return 'Pack';
  if (p.type === 'service') return 'Service boutique';
  return 'Produit';
}

function serviceSubtitle(s: PlatformServiceItem): string | null {
  const n = s.establishments?.length ?? 0;
  if (n > 0) return `${n} établissement${n > 1 ? 's' : ''}`;
  return 'Service orientation';
}

export function buildLoyaltyRewardTiers(
  products: ShopProductListItem[],
  services: PlatformServiceItem[],
  balance: number,
): LoyaltyRewardTier[] {
  const tiers: Omit<LoyaltyRewardTier, 'tierIndex'>[] = [];

  const sortedProducts = [...products]
    .filter((p) => !p.isOutOfStock && parsePriceMad(p.price) > 0)
    .sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      if (a.isBestseller !== b.isBestseller) return a.isBestseller ? -1 : 1;
      return parsePriceMad(a.price) - parsePriceMad(b.price);
    })
    .slice(0, 10);

  for (const p of sortedProducts) {
    const priceMad = parsePriceMad(p.price);
    const pointsCost = computeRedeemPointsCost(priceMad);
    tiers.push({
      id: `product-${p.id}`,
      kind: 'product',
      title: p.title,
      subtitle: productSubtitle(p),
      slug: p.slug,
      priceMad,
      currency: p.currency || 'MAD',
      pointsCost,
      imageUrl: shopProductPrimaryImage(p.images),
      usePlatformThumb: false,
      brandIcon: null,
      brandColor: null,
      redemptionActive: true,
      affordable: balance >= pointsCost,
      pointsToUnlock: Math.max(0, pointsCost - balance),
    });
  }

  const sortedServices = [...services]
    .filter((s) => parsePriceMad(platformServiceEffectiveUnitPriceString(s)) > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
    .slice(0, 8);

  for (const s of sortedServices) {
    const priceMad = parsePriceMad(platformServiceEffectiveUnitPriceString(s));
    const pointsCost = computeRedeemPointsCost(priceMad);
    tiers.push({
      id: `service-${s.slug}`,
      kind: 'platform_service',
      title: s.name,
      subtitle: serviceSubtitle(s),
      slug: s.slug,
      priceMad,
      currency: s.currency || 'MAD',
      pointsCost,
      imageUrl: null,
      usePlatformThumb: true,
      brandIcon: s.brandIcon ?? null,
      brandColor: s.brandColor ?? null,
      redemptionActive: true,
      affordable: balance >= pointsCost,
      pointsToUnlock: Math.max(0, pointsCost - balance),
    });
  }

  return tiers
    .sort((a, b) => a.pointsCost - b.pointsCost)
    .map((t, idx) => ({ ...t, tierIndex: idx + 1 }));
}

export function findNextRewardTier(
  tiers: LoyaltyRewardTier[],
  balance: number,
): LoyaltyRewardTier | null {
  return tiers.find((t) => t.redemptionActive && !t.alreadyRedeemed && t.pointsCost > balance) ?? null;
}
