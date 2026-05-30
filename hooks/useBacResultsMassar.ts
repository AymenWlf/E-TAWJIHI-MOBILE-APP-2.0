import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { invalidateEligibilityProfileCache } from '@/hooks/useEligibilityProfile';
import { buildMassarOutlookEmail } from '@/constants/bacResultsCard';
import { getUserProfile, updateUserProfile } from '@/services/userProfile';
import { readBacResultsMassarLocal, writeBacResultsMassarLocal } from '@/utils/bacResultsMassarStorage';

export function useBacResultsMassar() {
  const { user, getValidAccessToken } = useAuth();
  const [massarCode, setMassarCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const local = await readBacResultsMassarLocal();
      let fromProfile = '';
      if (user?.id) {
        const token = await getValidAccessToken();
        if (token) {
          const profile = await getUserProfile(token);
          fromProfile = (profile?.massarCode ?? '').replace(/\s/g, '').trim();
        }
      }
      setMassarCode(local || fromProfile || '');
    } catch {
      setMassarCode('');
    } finally {
      setLoading(false);
    }
  }, [user?.id, getValidAccessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const confirmMassar = useCallback(
    async (draft: string): Promise<boolean> => {
      const normalized = draft.replace(/\s/g, '').trim();
      if (normalized.length < 5) return false;
      setSaving(true);
      try {
        await writeBacResultsMassarLocal(normalized);
        setMassarCode(normalized);
        const token = await getValidAccessToken();
        if (token && user?.id) {
          await updateUserProfile(token, { massarCode: normalized });
          invalidateEligibilityProfileCache();
        }
        return true;
      } catch {
        return false;
      } finally {
        setSaving(false);
      }
    },
    [getValidAccessToken, user?.id],
  );

  return {
    massarCode,
    outlookEmail: buildMassarOutlookEmail(massarCode),
    loading,
    saving,
    reload: load,
    confirmMassar,
  };
}
