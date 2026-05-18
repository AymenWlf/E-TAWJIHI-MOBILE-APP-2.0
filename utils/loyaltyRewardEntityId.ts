import type { LoyaltyRewardTier } from '@/utils/loyaltyCatalogRewards';

/** Identifiant numérique pour l’API d’échange (entityId). */
export function loyaltyRewardEntityId(reward: LoyaltyRewardTier): number | null {
  if (typeof reward.entityId === 'number' && reward.entityId > 0) {
    return reward.entityId;
  }
  const m = reward.id.match(/^(?:product|service)-(\d+)$/);
  if (m) {
    return parseInt(m[1], 10);
  }
  return null;
}
