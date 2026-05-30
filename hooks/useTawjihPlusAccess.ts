import { useCallback, useEffect, useRef, useState } from 'react';

import { activeServicesGrantTawjihPlusAccess } from '@/constants/tawjihPlusAccess';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserActiveServices } from '@/services/userActiveServices';

export function useTawjihPlusAccess() {
  const { user, getValidAccessToken } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const loadGenRef = useRef(0);

  const refresh = useCallback(async () => {
    const gen = ++loadGenRef.current;
    setLoading(true);
    try {
      if (!user) {
        if (gen === loadGenRef.current) {
          setHasAccess(false);
          setLoading(false);
        }
        return;
      }
      const token = await getValidAccessToken();
      if (!token) {
        if (gen === loadGenRef.current) {
          setHasAccess(false);
          setLoading(false);
        }
        return;
      }
      const services = await fetchUserActiveServices(token);
      if (gen === loadGenRef.current) {
        setHasAccess(activeServicesGrantTawjihPlusAccess(services));
        setLoading(false);
      }
    } catch {
      if (gen === loadGenRef.current) {
        setHasAccess(false);
        setLoading(false);
      }
    }
  }, [getValidAccessToken, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { hasAccess, loading, refresh };
}
