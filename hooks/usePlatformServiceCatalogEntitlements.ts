import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import {
  fetchPlatformServiceCatalogEntitlements,
  type PlatformServiceCatalogEntitlement,
} from '@/services/platformServices';

export function usePlatformServiceCatalogEntitlements(
  cartServiceSlugs: string[],
  niveau?: string | null,
): {
  bySlug: Record<string, PlatformServiceCatalogEntitlement>;
  loading: boolean;
  refetch: () => Promise<void>;
} {
  const { user, getValidAccessToken } = useAuth();
  const [bySlug, setBySlug] = useState<Record<string, PlatformServiceCatalogEntitlement>>({});
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  const cartKey = useMemo(
    () => [...cartServiceSlugs].map((s) => s.trim()).filter(Boolean).sort().join(','),
    [cartServiceSlugs],
  );

  const phone = user?.phone?.trim() || undefined;

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getValidAccessToken();
      const map = await fetchPlatformServiceCatalogEntitlements(
        { phone, cartSlugs: cartKey ? cartKey.split(',') : [], niveau },
        token,
      );
      setBySlug(map);
      hasLoadedRef.current = true;
    } catch {
      setBySlug({});
      hasLoadedRef.current = true;
    } finally {
      setLoading(false);
    }
  }, [cartKey, getValidAccessToken, phone, niveau]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { bySlug, loading, refetch };
}
