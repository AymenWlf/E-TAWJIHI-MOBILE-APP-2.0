import { buildApiUrl } from '@/constants/api';
import { httpGetJson, httpPostJson } from '@/services/http';

export type FavorisData = {
  secteurs: number[];
  establishments: number[];
  filieres: number[];
  contestAnnouncements?: number[];
};

type FavorisListResponse = {
  success: boolean;
  data?: FavorisData;
};

type FavorisToggleResponse = {
  success: boolean;
  action?: 'added' | 'removed';
  message?: string;
  isFavorite?: boolean;
};

function bearerHeaders(accessToken: string): Record<string, string> {
  return { Authorization: `Bearer ${accessToken}` };
}

/** GET /api/favoris — IDs favoris de l’utilisateur connecté. */
export async function fetchAllFavoris(
  accessToken: string,
  options?: { throwOnError?: boolean },
): Promise<FavorisData> {
  const empty: FavorisData = {
    secteurs: [],
    establishments: [],
    filieres: [],
    contestAnnouncements: [],
  };
  try {
    const url = buildApiUrl('/api/favoris');
    const res = await httpGetJson<FavorisListResponse>(url, {
      headers: bearerHeaders(accessToken),
    });
    return {
      secteurs: Array.isArray(res.data?.secteurs) ? res.data!.secteurs : [],
      establishments: Array.isArray(res.data?.establishments) ? res.data!.establishments : [],
      filieres: Array.isArray(res.data?.filieres) ? res.data!.filieres : [],
      contestAnnouncements: Array.isArray(res.data?.contestAnnouncements)
        ? res.data!.contestAnnouncements
        : [],
    };
  } catch (e) {
    if (options?.throwOnError) throw e;
    return empty;
  }
}

export async function fetchFavoriteSecteurIds(accessToken: string): Promise<Set<number>> {
  const data = await fetchAllFavoris(accessToken);
  return new Set(data.secteurs.filter((id) => Number.isFinite(id) && id > 0));
}

/**
 * POST /api/favoris/secteur/{id} — toggle favori secteur.
 * Retourne l’action effectuée, ou null si échec.
 */
export async function toggleSecteurFavorite(
  accessToken: string,
  secteurId: number,
): Promise<'added' | 'removed' | null> {
  if (!Number.isFinite(secteurId) || secteurId <= 0) return null;
  try {
    const url = buildApiUrl(`/api/favoris/secteur/${secteurId}`);
    const res = await httpPostJson<FavorisToggleResponse, Record<string, never>>(
      url,
      {},
      { headers: bearerHeaders(accessToken) },
    );
    if (!res.success) return null;
    if (res.action === 'added' || res.action === 'removed') return res.action;
    return null;
  } catch {
    return null;
  }
}
