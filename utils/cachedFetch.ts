/**
 * Cache mémoire + dédoublonnage des requêtes en vol pour limiter la charge serveur.
 */

type CacheEntry<T> = {
  value: T;
  fetchedAt: number;
};

export type CachedFetcher<T> = {
  (options?: { force?: boolean }): Promise<T>;
  invalidate: () => void;
};

export function createCachedFetcher<T>(options: {
  /** Durée pendant laquelle on renvoie le cache sans réseau (sauf force). */
  ttlMs: number;
  /** Délai minimum entre deux appels réseau (anti-rafale AppState / focus). */
  minNetworkIntervalMs: number;
  fetcher: () => Promise<T>;
}): CachedFetcher<T> {
  let cache: CacheEntry<T> | null = null;
  let lastNetworkAt = 0;
  let inflight: Promise<T> | null = null;

  const runNetwork = async (): Promise<T> => {
    if (inflight) {
      return inflight;
    }
    inflight = (async () => {
      try {
        const value = await options.fetcher();
        const now = Date.now();
        cache = { value, fetchedAt: now };
        lastNetworkAt = now;
        return value;
      } finally {
        inflight = null;
      }
    })();
    return inflight;
  };

  const cached: CachedFetcher<T> = async (opts) => {
    const force = Boolean(opts?.force);
    const now = Date.now();

    if (!force && cache && now - cache.fetchedAt < options.ttlMs) {
      return cache.value;
    }

    if (
      !force &&
      cache &&
      now - lastNetworkAt < options.minNetworkIntervalMs
    ) {
      return cache.value;
    }

    return runNetwork();
  };

  cached.invalidate = () => {
    cache = null;
    lastNetworkAt = 0;
  };

  return cached;
}
