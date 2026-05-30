import { PUBLIC_STATUS_DEBOUNCE_MS } from '@/constants/backgroundPollIntervals';
import { buildApiUrl } from '@/constants/api';
import { createCachedFetcher } from '@/utils/cachedFetch';

export type MaintenancePublicStatus = {
  enabled: boolean;
  message: string;
  retryAfterMinutes: number;
};

export const DEFAULT_MAINTENANCE_MESSAGE =
  'E-TAWJIHI est en cours de maintenance. Merci de réessayer dans quelques minutes.';

const DEFAULT_RETRY_MINUTES = 5;

type MaintenanceListener = (status: MaintenancePublicStatus) => void;

const listeners = new Set<MaintenanceListener>();
let pendingNotify = false;

function isMaintenanceStatusUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.includes('/api/public/maintenance') || lower.includes('/api/admin/maintenance');
}

function normalizeStatus(partial: Partial<MaintenancePublicStatus>): MaintenancePublicStatus {
  return {
    enabled: Boolean(partial.enabled),
    message:
      typeof partial.message === 'string' && partial.message.trim() !== ''
        ? partial.message.trim()
        : DEFAULT_MAINTENANCE_MESSAGE,
    retryAfterMinutes:
      typeof partial.retryAfterMinutes === 'number' && partial.retryAfterMinutes > 0
        ? partial.retryAfterMinutes
        : DEFAULT_RETRY_MINUTES,
  };
}

/** Déclenché quand une requête API renvoie maintenance (503 + corps JSON). */
export function notifyMaintenanceActive(status: MaintenancePublicStatus): void {
  if (pendingNotify) return;
  pendingNotify = true;
  const payload = normalizeStatus({ ...status, enabled: true });
  queueMicrotask(() => {
    pendingNotify = false;
    for (const fn of listeners) {
      try {
        fn(payload);
      } catch {
        /* noop */
      }
    }
  });
}

export function subscribeMaintenanceActive(listener: MaintenanceListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * À appeler sur toute réponse HTTP API (hors endpoint statut maintenance).
 * Retourne true si la maintenance a été détectée et signalée.
 */
export function reportMaintenanceIfPresent(url: string, status: number, bodyText: string): boolean {
  if (isMaintenanceStatusUrl(url)) {
    return false;
  }
  if (status !== 503) {
    return false;
  }
  let parsed: { maintenance?: boolean; message?: string; retryAfterMinutes?: number } | null = null;
  try {
    parsed = JSON.parse(bodyText) as {
      maintenance?: boolean;
      message?: string;
      retryAfterMinutes?: number;
    };
  } catch {
    return false;
  }
  if (!parsed?.maintenance) {
    return false;
  }
  invalidatePublicMaintenanceCache();
  notifyMaintenanceActive({
    enabled: true,
    message: typeof parsed.message === 'string' ? parsed.message : DEFAULT_MAINTENANCE_MESSAGE,
    retryAfterMinutes:
      typeof parsed.retryAfterMinutes === 'number' ? parsed.retryAfterMinutes : DEFAULT_RETRY_MINUTES,
  });
  return true;
}

async function fetchPublicMaintenanceStatusNetwork(): Promise<MaintenancePublicStatus> {
  const url = buildApiUrl('/api/public/maintenance');
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) {
      return normalizeStatus({ enabled: false, message: DEFAULT_MAINTENANCE_MESSAGE });
    }
    const json = (await res.json()) as {
      success?: boolean;
      data?: Partial<MaintenancePublicStatus>;
    };
    return normalizeStatus({
      enabled: Boolean(json.data?.enabled),
      message: json.data?.message,
      retryAfterMinutes: json.data?.retryAfterMinutes,
    });
  } catch {
    return normalizeStatus({ enabled: false, message: DEFAULT_MAINTENANCE_MESSAGE });
  }
}

const maintenanceStatusCached = createCachedFetcher({
  ttlMs: 120_000,
  minNetworkIntervalMs: PUBLIC_STATUS_DEBOUNCE_MS,
  fetcher: fetchPublicMaintenanceStatusNetwork,
});

/** Statut public — sans JWT ; cache + anti-rafale (sauf `force` ou refresh manuel). */
export function fetchPublicMaintenanceStatus(options?: {
  force?: boolean;
}): Promise<MaintenancePublicStatus> {
  return maintenanceStatusCached(options);
}

export function invalidatePublicMaintenanceCache(): void {
  maintenanceStatusCached.invalidate();
}
