import { usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { recordMobileScreenImpression, recordMobileScreenTime } from '@/services/mobileScreenAnalytics';

/**
 * — Impression « page » par navigation (dédoublonnage local).
 * — Durée par écran : temps jusqu’au changement de route ou passage en arrière-plan.
 */
export function MobileAnalyticsTracker(): null {
  const pathname = usePathname();
  const { user } = useAuth();

  const prevSegmentRef = useRef<string | null>(null);
  const enteredAtRef = useRef<number>(Date.now());
  const dedupeImpRef = useRef<string>('');

  useEffect(() => {
    const path = pathname || '/';
    const segmentKey = path.startsWith('/') ? `app:${path}` : `app:/${path}`;
    const now = Date.now();

    const prev = prevSegmentRef.current;
    if (prev !== null && prev !== segmentKey) {
      const ms = now - enteredAtRef.current;
      if (ms >= 1000) {
        recordMobileScreenTime(prev, ms, user?.id ?? null);
      }
    }

    prevSegmentRef.current = segmentKey;
    enteredAtRef.current = now;

    const dedupeKey = `${segmentKey}|${user?.id ?? 'anon'}`;
    if (dedupeKey !== dedupeImpRef.current) {
      dedupeImpRef.current = dedupeKey;
      recordMobileScreenImpression(segmentKey, user?.id ?? null);
    }
  }, [pathname, user?.id]);

  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next === 'active') {
        enteredAtRef.current = Date.now();
        return;
      }
      const sk = prevSegmentRef.current;
      if (!sk) return;
      const ms = Date.now() - enteredAtRef.current;
      if (ms >= 1000) {
        recordMobileScreenTime(sk, ms, user?.id ?? null);
      }
    };

    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [user?.id]);

  return null;
}
