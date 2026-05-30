import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { fetchUserReferralProgram, type UserReferralProgram } from '@/services/userReferral';
import { clearPendingReferralCode, getPendingReferralCode } from '@/utils/referralPendingCode';

export function useUserReferral(enabled = true) {
  const { getValidAccessToken } = useAuth();
  const [data, setData] = useState<UserReferralProgram | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        setData(null);
        return;
      }
      const program = await fetchUserReferralProgram(token);
      setData(program);
      if (!program) {
        setError('load_failed');
      }
    } catch {
      setData(null);
      setError('load_failed');
    } finally {
      setLoading(false);
    }
  }, [enabled, getValidAccessToken]);

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    void reload();
  }, [enabled, reload]);

  useEffect(() => {
    const ownCode = data?.referralCode?.trim().toUpperCase();
    if (!ownCode) return;
    void (async () => {
      const pending = await getPendingReferralCode();
      if (pending && pending === ownCode) {
        await clearPendingReferralCode();
      }
    })();
  }, [data?.referralCode]);

  return { data, loading, error, reload };
}
