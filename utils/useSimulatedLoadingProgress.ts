import { useCallback, useEffect, useRef, useState } from 'react';

/** Phase rapide (courbe) puis +1 % périodique jusqu’à {@link CREEP_MAX} ; 100 % via {@link complete}. */
const ASYMPTOTIC_MAX = 93;
const CREEP_MAX = 99;
/** Délai entre chaque +1 % après le palier asymptotique (évite l’impression de blocage à 93 %). */
const CREEP_INTERVAL_MS = 2800;
const TICK_MS = 100;

/**
 * Progression affichée pendant une requête longue sans pourcentage réel côté API.
 */
export function useSimulatedLoadingProgress(isActive: boolean) {
  const [percent, setPercent] = useState(0);
  const doneRef = useRef(false);
  const creepStartRef = useRef(0);

  useEffect(() => {
    doneRef.current = false;
    creepStartRef.current = 0;
    if (!isActive) {
      setPercent(0);
      return;
    }
    setPercent(0);
    const start = Date.now();
    const id = setInterval(() => {
      if (doneRef.current) return;
      const elapsed = Date.now() - start;
      const asymptotic = ASYMPTOTIC_MAX * (1 - Math.exp(-elapsed / 4800));

      setPercent((p) => {
        if (p >= CREEP_MAX) return p;

        if (p < ASYMPTOTIC_MAX - 0.25) {
          creepStartRef.current = 0;
          return Math.min(ASYMPTOTIC_MAX, Math.max(p, asymptotic));
        }

        const floor = Math.max(ASYMPTOTIC_MAX, Math.floor(p));
        const now = Date.now();
        if (!creepStartRef.current) creepStartRef.current = now;
        const creepSteps = Math.floor((now - creepStartRef.current) / CREEP_INTERVAL_MS);
        return Math.min(CREEP_MAX, floor + creepSteps);
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [isActive]);

  const complete = useCallback(() => {
    doneRef.current = true;
    creepStartRef.current = 0;
    setPercent(100);
  }, []);

  return { percent, complete };
}
