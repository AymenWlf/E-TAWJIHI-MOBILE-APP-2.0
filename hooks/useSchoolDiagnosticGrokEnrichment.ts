import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import {
  enrichSchoolDiagnosticGrok,
  type SchoolDiagnosticFullResult,
} from '@/services/schoolRecommendationDiagnostic';

export type UseSchoolDiagnosticGrokEnrichmentOptions = {
  diagnosticId: number | null;
  grokPending: boolean;
  recommendationsDeferred: boolean;
  enabled: boolean;
  getValidAccessToken: () => Promise<string | null>;
  onComplete: (data: SchoolDiagnosticFullResult) => void;
  onError?: (error: unknown) => void;
};

/**
 * Enrichissement Grok IA :
 * - synchrone tant que l'utilisateur reste sur l'écran de chargement ;
 * - bascule en worker async si sortie de page ou mise en arrière-plan de l'app.
 */
export function useSchoolDiagnosticGrokEnrichment({
  diagnosticId,
  grokPending,
  recommendationsDeferred,
  enabled,
  getValidAccessToken,
  onComplete,
  onError,
}: UseSchoolDiagnosticGrokEnrichmentOptions): void {
  const grokPendingRef = useRef(grokPending);
  const diagnosticIdRef = useRef(diagnosticId);
  const syncStartedRef = useRef(false);
  const asyncScheduledRef = useRef(false);

  grokPendingRef.current = grokPending;
  diagnosticIdRef.current = diagnosticId;

  const prevGrokPendingRef = useRef(false);
  if (grokPending && !prevGrokPendingRef.current) {
    syncStartedRef.current = false;
    asyncScheduledRef.current = false;
  }
  prevGrokPendingRef.current = grokPending;

  const scheduleAsyncIfNeeded = useCallback(async () => {
    const id = diagnosticIdRef.current;
    if (!grokPendingRef.current || asyncScheduledRef.current || id == null) {
      return;
    }
    asyncScheduledRef.current = true;
    try {
      const token = await getValidAccessToken();
      if (!token) return;
      await enrichSchoolDiagnosticGrok(id, token, 'async');
    } catch {
      /* worker planifié côté serveur si possible */
    }
  }, [getValidAccessToken]);

  useEffect(() => {
    if (!enabled || !grokPending || recommendationsDeferred || diagnosticId == null) {
      return;
    }
    if (syncStartedRef.current) return;
    syncStartedRef.current = true;

    let alive = true;
    void (async () => {
      try {
        const token = await getValidAccessToken();
        if (!token || !alive) return;
        const data = await enrichSchoolDiagnosticGrok(diagnosticId, token, 'sync');
        if (!alive || !data) return;
        grokPendingRef.current = Boolean(data.grokPending);
        onComplete(data);
      } catch (error) {
        if (!alive) return;
        onError?.(error);
        await scheduleAsyncIfNeeded();
      }
    })();

    return () => {
      alive = false;
      void scheduleAsyncIfNeeded();
    };
  }, [
    diagnosticId,
    enabled,
    getValidAccessToken,
    grokPending,
    onComplete,
    onError,
    recommendationsDeferred,
    scheduleAsyncIfNeeded,
  ]);

  useEffect(() => {
    const onAppStateChange = (next: AppStateStatus) => {
      if (next === 'background' || next === 'inactive') {
        void scheduleAsyncIfNeeded();
      }
    };
    const sub = AppState.addEventListener('change', onAppStateChange);
    return () => sub.remove();
  }, [scheduleAsyncIfNeeded]);
}
