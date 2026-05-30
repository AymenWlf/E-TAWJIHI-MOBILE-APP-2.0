import AsyncStorage from '@react-native-async-storage/async-storage';

import { buildApiUrl } from '@/constants/api';
import { httpGetJson } from '@/services/http';
import type { CandidacyStatusType } from '@/types/inscriptions';

/**
 * Service de lecture du catalogue des statuts de candidature.
 *
 * Le catalogue est partagé par toute l'app (badges, picker, timeline) et
 * doit être disponible même offline. On le cache en `AsyncStorage` avec
 * une enveloppe `{ version, fetchedAt, data }` ; on resert le cache
 * immédiatement à la lecture pour rendre l'UI réactive, et on déclenche
 * en arrière-plan un refresh dès que l'app a une connexion et un token.
 *
 * - GET `/api/candidacy-statuses` (public lecture) renvoie uniquement les
 *   statuts actifs.
 * - Le cache reste valide même si un statut est désactivé entre deux
 *   refresh : la timeline historique se base dessus pour rendre les
 *   events `status_changed` (codes bruts) avec leurs visuels.
 */

type ListResponse = { success: boolean; data: CandidacyStatusType[] };

const STORAGE_KEY = '@etawjihi/candidacy-status-catalog/v2';

type CacheEnvelope = {
  version: 1;
  fetchedAt: string;
  data: CandidacyStatusType[];
};

export async function readCachedCandidacyStatuses(): Promise<CandidacyStatusType[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CacheEnvelope | null;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.data)) return [];
    return parsed.data;
  } catch {
    return [];
  }
}

async function writeCachedCandidacyStatuses(data: CandidacyStatusType[]): Promise<void> {
  try {
    const env: CacheEnvelope = {
      version: 1,
      fetchedAt: new Date().toISOString(),
      data,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(env));
  } catch {
    // Cache non bloquant.
  }
}

/**
 * Récupère les statuts actifs depuis l'API (sans token : endpoint public).
 * Met à jour le cache en cas de succès. En cas d'échec on rend ce qu'il y
 * a en cache (potentiellement vide) pour que l'UI ne casse pas.
 */
export async function fetchActiveCandidacyStatuses(): Promise<CandidacyStatusType[]> {
  try {
    const url = buildApiUrl('/api/candidacy-statuses');
    const res = await httpGetJson<ListResponse>(url);
    if (res.success && Array.isArray(res.data)) {
      await writeCachedCandidacyStatuses(res.data);
      return res.data;
    }
  } catch {
    // Tombe sur le cache.
  }
  return readCachedCandidacyStatuses();
}

/**
 * Stratégie « cache d'abord, puis refresh » : renvoie immédiatement les
 * valeurs mises en cache, et déclenche un fetch réseau en arrière-plan
 * dont le résultat sera communiqué via `onRefresh`.
 */
export async function loadCandidacyStatusesWithRefresh(
  onRefresh?: (fresh: CandidacyStatusType[]) => void,
): Promise<CandidacyStatusType[]> {
  const cached = await readCachedCandidacyStatuses();
  void (async () => {
    try {
      const fresh = await fetchActiveCandidacyStatuses();
      if (onRefresh && fresh.length > 0) {
        const sameLength = fresh.length === cached.length;
        const sameIds =
          sameLength &&
          fresh.every(
            (s, idx) =>
              s.id === cached[idx]?.id &&
              s.code === cached[idx]?.code &&
              s.isFinalizedMarker === cached[idx]?.isFinalizedMarker &&
              s.isEnrollmentMarker === cached[idx]?.isEnrollmentMarker,
          );
        if (!sameIds) onRefresh(fresh);
      }
    } catch {
      // Ignoré : le cache reste utilisé.
    }
  })();
  return cached;
}

/**
 * Helper : trouve un statut dans la liste à partir de son code (sécurisé
 * contre les codes nuls / disparus). Utile pour rendre les events
 * `status_changed` historiques qui ne contiennent que des codes string.
 */
export function findStatusByCode(
  catalog: CandidacyStatusType[],
  code: string | null | undefined,
): CandidacyStatusType | null {
  if (!code) return null;
  return catalog.find((s) => s.code === code) ?? null;
}
