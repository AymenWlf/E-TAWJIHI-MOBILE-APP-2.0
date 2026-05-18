import { buildApiUrl } from '@/constants/api';
import { httpGetJson, httpPostJson } from '@/services/http';

export type ReferralInviteStatus = 'registered' | 'profile_done' | 'qualified' | 'pending';

export type UserReferralInvite = {
  id: string;
  displayName: string;
  status: ReferralInviteStatus;
  registeredAt: string | null;
  countsForTier: boolean;
};

export type ReferralTierProduct = {
  id: number;
  slug: string;
  title: string;
  imageUrl: string | null;
  price?: string | null;
  description?: string | null;
  displayOrder?: number;
};

export type ReferralTierPromoClaim = {
  tierIndex: number;
  shopProductId: number;
  shopProductSlug: string | null;
  shopProductTitle: string | null;
  generatedAt: string;
  rewardTaken?: boolean;
  promo: {
    code: string;
    usageLimit: number | null;
    usedCount: number;
    status: 'available' | 'used' | 'inactive';
    isActive: boolean;
    validUntil: string | null;
  } | null;
};

export type ReferralTierInfo = {
  tierIndex: number;
  threshold: number;
  qualifiedCount: number;
  remaining: number;
  unlocked: boolean;
  progressPercent: number;
  rewardMode: 'single' | 'choice';
  rewardLabelFr: string | null;
  rewardLabelAr: string | null;
  rewardProduct: ReferralTierProduct | null;
  rewardProducts: ReferralTierProduct[];
  promoClaim: ReferralTierPromoClaim | null;
  canClaim: boolean;
  rewardTaken: boolean;
  rewardTakenOnOtherTier: boolean;
  claimedTierIndex: number | null;
};

export type ReferralTierProgress = {
  programActive: boolean;
  qualifiedAffiliateCount: number;
  eligibleService: { id?: number; name?: string; slug?: string; crmPackId?: string } | null;
  singleRewardPerProgram?: boolean;
  programRewardClaim: ReferralTierPromoClaim | null;
  rewardTaken: boolean;
  tiers: ReferralTierInfo[];
};

export type ReferralProgramAccess = {
  isUnlocked: boolean;
  requiredServiceName: string;
  requiredServiceSlug?: string | null;
};

export type UserReferralProgram = {
  access?: ReferralProgramAccess;
  referralCode: string | null;
  referralLink: string | null;
  referredDiscountPercent?: number;
  invites: UserReferralInvite[];
  invitesCount: number;
  tierProgress: ReferralTierProgress;
};

type ReferralResponse = {
  success: boolean;
  data?: UserReferralProgram;
  message?: string;
};

type ClaimPromoResponse = {
  success: boolean;
  data?: ReferralTierPromoClaim;
  message?: string;
};

export async function fetchUserReferralProgram(accessToken: string): Promise<UserReferralProgram | null> {
  const url = buildApiUrl('/api/user/referral');
  const res = await httpGetJson<ReferralResponse>(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.success || !res.data) {
    return null;
  }
  return res.data;
}

export async function claimReferralTierPromo(
  accessToken: string,
  tierIndex: number,
  shopProductId?: number,
): Promise<ReferralTierPromoClaim> {
  const url = buildApiUrl(`/api/user/referral/tiers/${tierIndex}/claim-promo`);
  const res = await httpPostJson<ClaimPromoResponse>(
    url,
    shopProductId ? { shopProductId } : {},
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.success || !res.data) {
    throw new Error(res.message ?? 'claim_failed');
  }
  return res.data;
}

export function tierCanClaimReward(tier: ReferralTierInfo): boolean {
  return tier.canClaim !== false && !tier.rewardTakenOnOtherTier;
}

/** Parrainage complété = achat éligible comptabilisé pour les paliers. */
export function isReferralInviteCompleted(status: ReferralInviteStatus): boolean {
  return status === 'qualified';
}

export function isReferralProgramUnlocked(program: UserReferralProgram | null | undefined): boolean {
  if (!program) return false;

  return program.access?.isUnlocked === true;
}

export function getReferralRequiredServiceName(program: UserReferralProgram | null | undefined): string {
  const fromAccess = program?.access?.requiredServiceName?.trim();
  if (fromAccess) return fromAccess;

  const fromTier = program?.tierProgress?.eligibleService?.name?.trim();
  if (fromTier) return fromTier;

  return 'TAWJIH PLUS';
}

export function getReferralRequiredServiceSlug(program: UserReferralProgram | null | undefined): string | null {
  const slug = program?.access?.requiredServiceSlug?.trim();
  return slug || program?.tierProgress?.eligibleService?.slug?.trim() || null;
}
