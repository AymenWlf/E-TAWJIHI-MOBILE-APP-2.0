import { buildApiUrl } from '@/constants/api';
import {
  BAC_RESULTS_STATIC_DEFAULT,
  parseBacResultsConfigFromApi,
  type BacResultsCardConfig,
} from '@/constants/bacResultsCard';
import { httpGetJson } from '@/services/http';
import { createCachedFetcher } from '@/utils/cachedFetch';

type BacResultsPublicResponse = {
  success: boolean;
  data?: unknown;
};

async function fetchBacResultsConfigNetwork(): Promise<BacResultsCardConfig> {
  const url = buildApiUrl('/api/bac-results/public');
  try {
    const res = await httpGetJson<BacResultsPublicResponse>(url);
    if (!res.success) {
      return BAC_RESULTS_STATIC_DEFAULT;
    }
    return parseBacResultsConfigFromApi(res.data);
  } catch {
    return BAC_RESULTS_STATIC_DEFAULT;
  }
}

const bacResultsConfigCached = createCachedFetcher({
  ttlMs: 300_000,
  minNetworkIntervalMs: 120_000,
  fetcher: fetchBacResultsConfigNetwork,
});

/** Configuration carte « Résultats du bac » (endpoint public, cache 5 min). */
export function fetchBacResultsConfig(options?: { force?: boolean }): Promise<BacResultsCardConfig> {
  return bacResultsConfigCached(options);
}
