import { buildApiUrl } from '@/constants/api';
import { httpGetJson, httpPostJson } from '@/services/http';
import type {
  Candidacy,
  CandidacyStatusType,
  CandidacyTimelinePayload,
} from '@/types/inscriptions';

type ListResponse = {
  success: boolean;
  data: Candidacy[];
  /** Compte par code de statut. La clé `null` regroupe les candidatures sans statut. */
  counts: Record<string, number>;
  /** Catalogue actif renvoyé pour amorcer le rendu du picker (les vues peuvent ignorer si elles ont déjà le cache). */
  statuses: CandidacyStatusType[];
};

type ItemResponse = {
  success: boolean;
  data: Candidacy;
  created?: boolean;
  message?: string;
};

type TimelineResponse = {
  success: boolean;
  data: CandidacyTimelinePayload;
};

type SimpleResponse = { success: boolean; message?: string };

export type CandidaciesPayload = {
  items: Candidacy[];
  counts: Record<string, number>;
  statuses: CandidacyStatusType[];
};

/**
 * GET /api/candidacies
 *
 * `statusId = null` filtre uniquement les candidatures **sans statut**
 * explicite (envoyé via `?statusId=null` au backend). `statusId = number`
 * filtre par id du catalogue. `undefined` ⇒ toutes les candidatures.
 */
export async function fetchCandidacies(
  accessToken: string,
  statusId?: number | null,
): Promise<CandidaciesPayload> {
  try {
    const params: Record<string, string> = {};
    if (statusId === null) {
      params.statusId = 'null';
    } else if (typeof statusId === 'number') {
      params.statusId = String(statusId);
    }
    const url = buildApiUrl(
      '/api/candidacies',
      Object.keys(params).length > 0 ? params : undefined,
    );
    const res = await httpGetJson<ListResponse>(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return {
      items: Array.isArray(res.data) ? res.data : [],
      counts: res.counts ?? {},
      statuses: Array.isArray(res.statuses) ? res.statuses : [],
    };
  } catch {
    return { items: [], counts: {}, statuses: [] };
  }
}

export type UpsertCandidacyInput = {
  contestAnnouncementId: number;
  /**
   * `null` ⇒ aucun statut explicite (l'utilisateur s'est juste abonné).
   * `number` ⇒ id d'un `CandidacyStatusType` autorisé par l'annonce.
   */
  statusId?: number | null;
  notes?: string;
};

export async function upsertCandidacy(
  accessToken: string,
  input: UpsertCandidacyInput,
): Promise<{ candidacy: Candidacy | null; created: boolean }> {
  try {
    const url = buildApiUrl('/api/candidacies');
    const res = await httpPostJson<ItemResponse, UpsertCandidacyInput>(url, input, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return { candidacy: res.success ? res.data : null, created: Boolean(res.created) };
  } catch {
    return { candidacy: null, created: false };
  }
}

/**
 * PATCH /api/candidacies/{id}/status
 *
 * `statusId = null` ⇒ retire le statut explicite (l'utilisateur a fait
 * « Aucun statut » dans la sheet).
 */
export async function updateCandidacyStatus(
  accessToken: string,
  id: number,
  statusId: number | null,
): Promise<Candidacy | null> {
  try {
    const url = buildApiUrl(`/api/candidacies/${id}/status`);
    const res = await httpPostJson<ItemResponse, { statusId: number | null }>(
      url,
      { statusId },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return res.success ? res.data : null;
  } catch {
    return null;
  }
}

export async function setCandidacyNotes(
  accessToken: string,
  id: number,
  notes: string,
): Promise<Candidacy | null> {
  try {
    const url = buildApiUrl(`/api/candidacies/${id}/note`);
    const res = await httpPostJson<ItemResponse, { notes: string }>(
      url,
      { notes },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return res.success ? res.data : null;
  } catch {
    return null;
  }
}

export async function reportLinkVisited(accessToken: string, id: number): Promise<Candidacy | null> {
  try {
    const url = buildApiUrl(`/api/candidacies/${id}/link-visited`);
    const res = await httpPostJson<ItemResponse, Record<string, never>>(url, {} as never, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.success ? res.data : null;
  } catch {
    return null;
  }
}

export async function fetchCandidacyTimeline(
  accessToken: string,
  id: number,
): Promise<CandidacyTimelinePayload | null> {
  try {
    const url = buildApiUrl(`/api/candidacies/${id}/timeline`);
    const res = await httpGetJson<TimelineResponse>(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.success ? res.data : null;
  } catch {
    return null;
  }
}

export async function deleteCandidacy(accessToken: string, id: number): Promise<boolean> {
  try {
    const url = buildApiUrl(`/api/candidacies/${id}`);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
    });
    if (!res.ok) return false;
    const json = (await res.json()) as SimpleResponse;
    return Boolean(json.success);
  } catch {
    return false;
  }
}
