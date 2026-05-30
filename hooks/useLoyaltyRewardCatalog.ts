import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { fetchLoyaltyRewards } from '@/services/loyalty';
import type { LoyaltyRewardTier } from '@/utils/loyaltyCatalogRewards';

export function useLoyaltyRewardCatalog(_balance?: number) {
  const { getValidAccessToken } = useAuth();
  const [tiers, setTiers] = useState<LoyaltyRewardTier[]>([]);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [pointsPending, setPointsPending] = useState(0);
  const [pointsEnabled, setPointsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        setTiers([]);
        return;
      }
      const payload = await fetchLoyaltyRewards(token);
      if (!payload) {
        setError('load_failed');
        setTiers([]);
        return;
      }
      setTiers(payload.tiers);
      setPointsBalance(payload.pointsBalance);
      setPointsPending(payload.pointsPending);
      setPointsEnabled(payload.pointsEnabled);
    } catch {
      setTiers([]);
      setError('load_failed');
    } finally {
      setLoading(false);
    }
  }, [getValidAccessToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { tiers, pointsBalance, pointsPending, pointsEnabled, loading, error, reload };
}
