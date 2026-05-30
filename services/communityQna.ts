import { buildApiUrl } from '@/constants/api';
import type { HomeCopyKey } from '@/constants/i18n';
import { httpDeleteJson, httpGetJson, httpPostJson } from '@/services/http';
import { getUserFacingApiError } from '@/utils/apiError';

export function formatCommunityQnaApiError(
  e: unknown,
  t: (key: HomeCopyKey) => string,
): string {
  return getUserFacingApiError(e, t, { context: 'qna' });
}

export type CommunityQnaContextType =
  | 'establishment'
  | 'contest_announcement'
  | 'platform_event'
  | 'establishment_follow'
  | 'article';

export type CommunityQnaVisibility = 'public' | 'private';

export type CommunityQnaAuthor = {
  id: number;
  displayName: string;
};

export type CommunityQnaVerdict = 'correct' | 'incorrect' | 'incomplete';

export type CommunityQnaAnswer = {
  id: number;
  body: string;
  isOfficial: boolean;
  /** Réponse d’un étudiant / membre (inverse d’officielle). */
  isCommunityAnswer?: boolean;
  /** Appréciation E-Tawjihi sur une réponse communautaire. */
  communityVerdict?: CommunityQnaVerdict | null;
  hidden: boolean;
  createdAt: string | null;
  author: CommunityQnaAuthor;
};

export type CommunityQnaQuestion = {
  id: number;
  contextType: string;
  contextId: number;
  visibility: CommunityQnaVisibility;
  body: string;
  hidden: boolean;
  messageCount?: number;
  replyCount?: number;
  createdAt: string | null;
  updatedAt: string | null;
  author: CommunityQnaAuthor | null;
  meTooCount: number;
  viewerMeToo: boolean;
  viewerIsAuthor: boolean;
  answers: CommunityQnaAnswer[];
};

type ListResponse = { success: boolean; message?: string; data?: CommunityQnaQuestion[] };
type MutationResponse<T> = { success: boolean; message?: string; data?: T };

function bearerHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export async function fetchCommunityQnaList(
  contextType: CommunityQnaContextType,
  contextId: number,
  accessToken?: string | null,
): Promise<CommunityQnaQuestion[]> {
  const url = buildApiUrl('/api/community-qna', { contextType, contextId });
  const headers: HeadersInit = accessToken ? bearerHeaders(accessToken) : {};
  const json = await httpGetJson<ListResponse>(url, { headers });
  if (!json.success || !Array.isArray(json.data)) {
    throw new Error(json.message || 'Q&R indisponible');
  }
  return json.data;
}

export async function createCommunityQnaQuestion(
  token: string,
  payload: {
    contextType: CommunityQnaContextType;
    contextId: number;
    visibility: CommunityQnaVisibility;
    body: string;
  },
): Promise<CommunityQnaQuestion> {
  const url = buildApiUrl('/api/community-qna/questions');
  const json = await httpPostJson<MutationResponse<CommunityQnaQuestion>, typeof payload>(url, payload, {
    headers: bearerHeaders(token),
  });
  if (!json.success || !json.data) {
    throw new Error(json.message || 'Envoi impossible');
  }
  return json.data;
}

export async function createCommunityQnaAnswer(
  token: string,
  questionId: number,
  body: string,
): Promise<void> {
  const url = buildApiUrl(`/api/community-qna/questions/${questionId}/answers`);
  const json = await httpPostJson<MutationResponse<unknown>, { body: string }>(url, { body }, { headers: bearerHeaders(token) });
  if (!json.success) {
    throw new Error(json.message || 'Réponse impossible');
  }
}

export async function setCommunityQnaMeToo(
  token: string,
  questionId: number,
  on: boolean,
): Promise<{ meTooCount: number; viewerMeToo: boolean }> {
  const path = `/api/community-qna/questions/${questionId}/me-too`;
  const url = buildApiUrl(path);
  if (on) {
    const json = await httpPostJson<MutationResponse<{ meTooCount: number; viewerMeToo: boolean }>, Record<string, never>>(
      url,
      {},
      { headers: bearerHeaders(token) },
    );
    if (!json.success || !json.data) {
      throw new Error(json.message || 'Erreur');
    }
    return json.data;
  }
  const json = await httpDeleteJson<MutationResponse<{ meTooCount: number; viewerMeToo: boolean }>>(url, {
    headers: bearerHeaders(token),
  });
  if (!json.success || !json.data) {
    throw new Error(json.message || 'Erreur');
  }
  return json.data;
}
