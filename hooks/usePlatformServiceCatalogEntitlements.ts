import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import {
  fetchPlatformServiceCatalogEntitlements,
  type PlatformServiceCatalogEntitlement,
} from '@/services/platformServices';

export function usePlatformServiceCatalogEntitlements(cartServiceSlugs: string[]): {
  bySlug: Record<string, PlatformServiceCatalogEntitlement>;
  loading: boolean;
  refetch: () => Promise<void>;
} {
  const { user, getValidAccessToken } = useAuth();
  const [bySlug, setBySlug] = useState<Record<string, PlatformServiceCatalogEntitlement>>({});
  const [loading, setLoading] = useState(true);

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
        { phone, cartSlugs: cartKey ? cartKey.split(',') : [] },
        token,
      );
      setBySlug(map);
    } catch {
      setBySlug({});
    } finally {
      setLoading(false);
    }
  }, [cartKey, getValidAccessToken, phone]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { bySlug, loading, refetch };
}
