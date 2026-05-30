import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { completePlanParcoursStep } from '@/services/planParcoursStepComplete';

/**
 * Au premier focus de l’écran, enregistre l’étape du parcours (notification serveur).
 */
export function useMarkPlanParcoursStepOnFocus(step: string, enabled = true): void {
  const { getValidAccessToken } = useAuth();
  const markedKeyRef = useRef<string | null>(null);
  const focusKey = `${step}:${enabled ? '1' : '0'}`;

  useFocusEffect(
    useCallback(() => {
      if (!enabled || markedKeyRef.current === focusKey) {
        return;
      }
      void (async () => {
        const token = await getValidAccessToken();
        if (!token) {
          return;
        }
        const ok = await completePlanParcoursStep(token, step);
        if (ok) {
          markedKeyRef.current = focusKey;
        }
      })();
    }, [enabled, focusKey, step, getValidAccessToken]),
  );
}
