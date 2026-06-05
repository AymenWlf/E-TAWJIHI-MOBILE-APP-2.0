import type { ReferralTierInfo, ReferralTierProduct } from '@/services/userReferral';
import { resolveShopImageUrl, shopProductPrimaryImage } from '@/utils/shopImageUrl';

export function getTierRewardProducts(tier: ReferralTierInfo): ReferralTierProduct[] {
  if (tier.rewardProducts?.length) {
    return [...tier.rewardProducts].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }
  return tier.rewardProduct ? [tier.rewardProduct] : [];
}

export function getTierPrimaryProduct(tier: ReferralTierInfo): ReferralTierProduct | null {
  return getTierRewardProducts(tier)[0] ?? null;
}

/** Produit dont l’image est affichée (override admin ou récompense par défaut). */
export function getTierDisplayProduct(tier: ReferralTierInfo): ReferralTierProduct | null {
  if (tier.displayImageProduct) return tier.displayImageProduct;
  return getTierPrimaryProduct(tier);
}

export function getReferralTierProductImageUri(product: ReferralTierProduct | null | undefined): string {
  if (!product) return '';
  const fromUrl = resolveShopImageUrl(product.imageUrl);
  if (fromUrl) return fromUrl;
  if (product.images?.length) return shopProductPrimaryImage(product.images);
  return '';
}

export function getNextReferralTier(tiers: ReferralTierInfo[] | undefined | null): ReferralTierInfo | null {
  return tiers?.find((tier) => !tier.unlocked) ?? null;
}
