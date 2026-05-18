import { buildApiUrl } from '@/constants/api';
import { httpGetJson, httpPostJson, type ApiError } from '@/services/http';
import type { LoyaltyRewardKind, LoyaltyRewardTier } from '@/utils/loyaltyCatalogRewards';

export type LoyaltyRewardsPayload = {
  pointsBalance: number;
  pointsPending: number;
  pointsEnabled: boolean;
  tiers: LoyaltyRewardTier[];
};

type RewardsResponse = {
  success: boolean;
  data?: {
    pointsBalance: number;
    pointsPending: number;
    pointsEnabled: boolean;
    tiers: Array<{
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
      redemptionActive: boolean;
      alreadyRedeemed?: boolean;
      entityId?: number;
    }>;
  };
};

export type LoyaltyRedeemResult = {
  pointsSpent: number;
  pointsBalance: number;
  reward: { kind: LoyaltyRewardKind; slug: string; title: string; pointsCost: number };
};

export type LoyaltyRedeemErrorCode =
  | 'already_redeemed'
  | 'insufficient_points'
  | 'points_disabled'
  | 'reward_inactive'
  | 'reward_not_found'
  | 'invalid_kind'
  | 'redeem_failed'
  | 'network';

export type LoyaltyRedeemResponse =
  | { ok: true; data: LoyaltyRedeemResult }
  | { ok: false; code: LoyaltyRedeemErrorCode; message?: string };

export type LoyaltyEarnRule = {
  actionKey: string;
  audience: 'self' | 'referrer';
  points: number;
  pointsPerMad: number | null;
  labelFr: string | null;
  labelAr: string | null;
  isVariableMad: boolean;
};

export type LoyaltyEarnRulesPayload = {
  pointsEnabled: boolean;
  defaultPointsPerMad: number;
  rules: LoyaltyEarnRule[];
};

export async function fetchLoyaltyEarnRules(accessToken: string): Promise<LoyaltyEarnRulesPayload | null> {
  const url = buildApiUrl('/api/user/loyalty/earn-rules');
  const res = await httpGetJson<{ success: boolean; data?: LoyaltyEarnRulesPayload }>(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.success || !res.data) {
    return null;
  }
  return res.data;
}

export async function fetchLoyaltyRewards(accessToken: string): Promise<LoyaltyRewardsPayload | null> {
  const url = buildApiUrl('/api/user/loyalty/rewards');
  const res = await httpGetJson<RewardsResponse>(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.success || !res.data) {
    return null;
  }
  return {
    pointsBalance: res.data.pointsBalance,
    pointsPending: res.data.pointsPending,
    pointsEnabled: res.data.pointsEnabled,
    tiers: res.data.tiers
      .filter((t) => t.redemptionActive !== false)
      .map((t) => ({
        ...t,
        alreadyRedeemed: t.alreadyRedeemed === true,
      })),
  };
}

export async function redeemLoyaltyReward(
  accessToken: string,
  kind: LoyaltyRewardKind,
  entityId: number,
): Promise<LoyaltyRedeemResponse> {
  const url = buildApiUrl('/api/user/loyalty/redeem');
  try {
    const res = await httpPostJson<
      {
        success: boolean;
        code?: string;
        message?: string;
        data?: LoyaltyRedeemResult;
      },
      { kind: LoyaltyRewardKind; entityId: number }
    >(url, { kind, entityId }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (res.success && res.data) {
      return { ok: true, data: res.data };
    }
    const code = (res.code ?? 'redeem_failed') as LoyaltyRedeemErrorCode;
    return { ok: false, code, message: res.message };
  } catch (e: unknown) {
    const err = e as ApiError;
    if (err.message) {
      try {
        const parsed = JSON.parse(err.message) as { code?: string; message?: string };
        if (parsed.code) {
          return {
            ok: false,
            code: parsed.code as LoyaltyRedeemErrorCode,
            message: parsed.message,
          };
        }
      } catch {
        /* corps non JSON */
      }
    }
    return { ok: false, code: 'network' };
  }
}
