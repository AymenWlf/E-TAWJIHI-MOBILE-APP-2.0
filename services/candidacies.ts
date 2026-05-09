import { buildApiUrl } from '@/constants/api';
import { httpGetJson, httpPostJson } from '@/services/http';
import type {
  Candidacy,
  CandidacyStatus,
  CandidacyTimelinePayload,
} from '@/types/inscriptions';

type ListResponse = {
  success: boolean;
  data: Candidacy[];
  counts: Partial<Record<CandidacyStatus, number>>;
  statuses: CandidacyStatus[];
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
  counts: Partial<Record<CandidacyStatus, number>>;
};

export async function fetchCandidacies(
  accessToken: string,
  status?: CandidacyStatus,
): Promise<CandidaciesPayload> {
  try {
    const url = buildApiUrl('/api/candidacies', status ? { status } : undefined);
    const res = await httpGetJson<ListResponse>(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return {
      items: Array.isArray(res.data) ? res.data : [],
      counts: res.counts ?? {},
    };
  } catch {
    return { items: [], counts: {} };
  }
}

export type UpsertCandidacyInput = {
  contestAnnouncementId: number;
  status?: CandidacyStatus;
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

export async function updateCandidacyStatus(
  accessToken: string,
  id: number,
  status: CandidacyStatus,
): Promise<Candidacy | null> {
  try {
    const url = buildApiUrl(`/api/candidacies/${id}/status`);
    const res = await httpPostJson<ItemResponse, { status: CandidacyStatus }>(
      url,
      { status },
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
