import { buildApiUrl } from '@/constants/api';
import { httpGetJson } from '@/services/http';

export type TawjihPlusPublicSettings = {
  globalFullAccessEnabled: boolean;
  globalPartialAccessEnabled: boolean;
};

let publicCache: { value: TawjihPlusPublicSettings; at: number } | null = null;
const PUBLIC_CACHE_TTL_MS = 300_000;

function normalizePublicSettings(raw: unknown): TawjihPlusPublicSettings {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    globalFullAccessEnabled: o.globalFullAccessEnabled === true,
    globalPartialAccessEnabled: o.globalPartialAccessEnabled === true,
  };
}

/** Lecture publique (web + mobile) : déblocage global TAWJIH PLUS / accès partiel annonces. */
export async function fetchTawjihPlusPublicSettings(options?: {
  force?: boolean;
}): Promise<TawjihPlusPublicSettings> {
  const force = options?.force === true;
  const now = Date.now();
  if (!force && publicCache && now - publicCache.at < PUBLIC_CACHE_TTL_MS) {
    return publicCache.value;
  }

  const res = await httpGetJson<{
    success: boolean;
    data?: Record<string, unknown>;
    message?: string;
  }>(buildApiUrl('/api/tawjih-plus/public'));

  if (!res.success || !res.data) {
    throw new Error(typeof res.message === 'string' ? res.message : 'Configuration TAWJIH PLUS indisponible');
  }

  const normalized = normalizePublicSettings(res.data);
  publicCache = { value: normalized, at: now };
  return normalized;
}
