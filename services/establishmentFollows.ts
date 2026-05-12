import { buildApiUrl } from '@/constants/api';
import { httpGetJson, httpPostJson } from '@/services/http';
import type {
  EstablishmentFollow,
  EstablishmentFollowState,
  EstablishmentFollowTimeline,
} from '@/types/inscriptions';

type ListResponse = {
  success: boolean;
  data: EstablishmentFollow[];
};

type ItemResponse = {
  success: boolean;
  data: EstablishmentFollow;
  created?: boolean;
};

type StateResponse = {
  success: boolean;
  data: EstablishmentFollowState;
};

type TimelineResponse = {
  success: boolean;
  data: EstablishmentFollowTimeline;
};

type SimpleResponse = { success: boolean; message?: string };

export type EstablishmentFollowsPayload = {
  items: EstablishmentFollow[];
};

/**
 * GET /api/establishment-follows
 *
 * Le suivi école porte le statut de candidature de l'utilisateur sur
 * l'école (refonte UX 2026-05). Chaque item inclut son `status` courant
 * et la liste `availableStatuses` (union des annonces de l'école) pour
 * piloter le sheet de modification de statut.
 */
export async function fetchEstablishmentFollows(
  accessToken: string,
): Promise<EstablishmentFollowsPayload> {
  try {
    const url = buildApiUrl('/api/establishment-follows');
    const res = await httpGetJson<ListResponse>(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return {
      items: Array.isArray(res.data) ? res.data : [],
    };
  } catch {
    return { items: [] };
  }
}

export type UpsertFollowInput = {
  establishmentId?: number;
  /** Raccourci : si fourni, le backend résout l'école depuis l'annonce. */
  contestAnnouncementId?: number;
  notes?: string;
  /**
   * Optionnel — au create, force le statut initial (doit faire partie de
   * l'union des statuts autorisés de l'école). Sinon, le backend retombe
   * sur le slug `interested`.
   */
  statusId?: number | null;
};

/** POST /api/establishment-follows */
export async function upsertEstablishmentFollow(
  accessToken: string,
  input: UpsertFollowInput,
): Promise<{ follow: EstablishmentFollow | null; created: boolean }> {
  try {
    const url = buildApiUrl('/api/establishment-follows');
    const res = await httpPostJson<ItemResponse, UpsertFollowInput>(url, input, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return { follow: res.success ? res.data : null, created: Boolean(res.created) };
  } catch {
    return { follow: null, created: false };
  }
}

/** POST /api/establishment-follows/{id}/note */
export async function setFollowNotes(
  accessToken: string,
  id: number,
  notes: string,
): Promise<EstablishmentFollow | null> {
  try {
    const url = buildApiUrl(`/api/establishment-follows/${id}/note`);
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

/**
 * POST /api/establishment-follows/{id}/status
 *
 * `statusId === null` ⇒ retire le statut. Sinon le backend valide que
 * l'id appartient à l'union des statuts autorisés de l'école et renvoie
 * 422 si ce n'est pas le cas.
 */
export async function updateFollowStatus(
  accessToken: string,
  id: number,
  statusId: number | null,
): Promise<EstablishmentFollow | null> {
  try {
    const url = buildApiUrl(`/api/establishment-follows/${id}/status`);
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

/** GET /api/establishment-follows/by-establishment/{eid} */
export async function fetchFollowStateByEstablishment(
  accessToken: string,
  establishmentId: number,
): Promise<EstablishmentFollowState> {
  try {
    const url = buildApiUrl(`/api/establishment-follows/by-establishment/${establishmentId}`);
    const res = await httpGetJson<StateResponse>(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.success ? res.data : { isFollowing: false, follow: null };
  } catch {
    return { isFollowing: false, follow: null };
  }
}

/** GET /api/establishment-follows/{id}/timeline */
export async function fetchEstablishmentFollowTimeline(
  accessToken: string,
  id: number,
): Promise<EstablishmentFollowTimeline | null> {
  try {
    const url = buildApiUrl(`/api/establishment-follows/${id}/timeline`);
    const res = await httpGetJson<TimelineResponse>(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.success ? res.data : null;
  } catch {
    return null;
  }
}

/** DELETE /api/establishment-follows/{id} */
export async function deleteEstablishmentFollow(
  accessToken: string,
  id: number,
): Promise<boolean> {
  try {
    const url = buildApiUrl(`/api/establishment-follows/${id}`);
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

/** DELETE /api/establishment-follows/by-establishment/{eid} */
export async function deleteEstablishmentFollowByEstablishment(
  accessToken: string,
  establishmentId: number,
): Promise<boolean> {
  try {
    const url = buildApiUrl(`/api/establishment-follows/by-establishment/${establishmentId}`);
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
