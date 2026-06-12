import { useCallback, useEffect, useRef, useState } from 'react';

import { userGrantsTawjihPlusInscriptionsAccess } from '@/constants/tawjihPlusAccess';
import { useAuth } from '@/contexts/AuthContext';
import { fetchTawjihPlusPublicSettings } from '@/services/tawjihPlusSettings';
import { fetchUserActiveServices } from '@/services/userActiveServices';
import { activeServicesGrantSchoolsCatalogAccess } from '@/utils/commercialClientAccess';
import { globalPartialAccessGrantsSchoolsCatalog } from '@/utils/tawjihPlusGlobalAccess';

export function useTawjihPlusAccess() {
  const { user, getValidAccessToken } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [hasSchoolsCatalogAccess, setHasSchoolsCatalogAccess] = useState(false);
  const [globalPartialAccessEnabled, setGlobalPartialAccessEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const loadGenRef = useRef(0);

  const refresh = useCallback(async () => {
    const gen = ++loadGenRef.current;
    setLoading(true);

    let partialGlobal = false;
    try {
      const publicSettings = await fetchTawjihPlusPublicSettings();
      partialGlobal = globalPartialAccessGrantsSchoolsCatalog(publicSettings);
    } catch {
      partialGlobal = false;
    }

    if (gen !== loadGenRef.current) return;

    setGlobalPartialAccessEnabled(partialGlobal);

    try {
      if (!user) {
        setHasAccess(false);
        setHasSchoolsCatalogAccess(partialGlobal);
        setLoading(false);
        return;
      }

      const token = await getValidAccessToken();
      if (!token) {
        setHasAccess(false);
        setHasSchoolsCatalogAccess(partialGlobal);
        setLoading(false);
        return;
      }

      const services = await fetchUserActiveServices(token);
      if (gen === loadGenRef.current) {
        const clientSchools = activeServicesGrantSchoolsCatalogAccess(services);
        setHasAccess(userGrantsTawjihPlusInscriptionsAccess(user, services));
        setHasSchoolsCatalogAccess(partialGlobal || clientSchools);
        setLoading(false);
      }
    } catch {
      if (gen === loadGenRef.current) {
        setHasAccess(userGrantsTawjihPlusInscriptionsAccess(user, []));
        setHasSchoolsCatalogAccess(partialGlobal);
        setLoading(false);
      }
    }
  }, [getValidAccessToken, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { hasAccess, hasSchoolsCatalogAccess, globalPartialAccessEnabled, loading, refresh };
}
