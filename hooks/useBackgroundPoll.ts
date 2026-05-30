import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

type Options = {
  /** Intervalle entre deux vérifications en arrière-plan (app active). */
  intervalMs: number;
  /** Ne pas relancer si le dernier run date de moins de X ms (focus / AppState). */
  debounceMs?: number;
  enabled?: boolean;
  runOnMount?: boolean;
};

/**
 * Polling léger : un seul timer + retour premier plan avec anti-rafale.
 */
export function useBackgroundPoll(
  callback: () => void | Promise<void>,
  {
    intervalMs,
    debounceMs = 45_000,
    enabled = true,
    runOnMount = true,
  }: Options,
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const lastRunAtRef = useRef(0);

  const run = useCallback(
    (force = false) => {
      const now = Date.now();
      if (!force && now - lastRunAtRef.current < debounceMs) {
        return;
      }
      lastRunAtRef.current = now;
      void callbackRef.current();
    },
    [debounceMs],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }
    if (runOnMount) {
      run(true);
    }
    const interval = setInterval(() => run(false), intervalMs);
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        run(false);
      }
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [enabled, intervalMs, run, runOnMount]);
}
