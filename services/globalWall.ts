import { buildApiUrl } from '@/constants/api';
import type { ApiError } from '@/services/http';
import { httpGetJson, httpPostJson } from '@/services/http';

export type GlobalWallAuthor = {
  id: number;
  displayName: string;
};

/** Accusés pour vos propres messages (API uniquement si vous êtes l’auteur). */
export type GlobalWallSenderStats = {
  delivered: boolean;
  seenByOthers: boolean;
  viewCount: number;
};

export type GlobalWallReactionSummary = {
  emoji: string;
  count: number;
  reactedByMe: boolean;
};

export type GlobalWallReply = {
  id: number;
  body: string;
  linkUrl?: string | null;
  linkLabel?: string | null;
  attachments?: GlobalWallAttachment[] | null;
  createdAt: string | null;
  author: GlobalWallAuthor;
  senderStats?: GlobalWallSenderStats | null;
  reactions?: GlobalWallReactionSummary[];
};

export type GlobalWallAttachment = {
  kind: 'photo' | 'document';
  url: string;
  name: string | null;
  mime: string | null;
  size: number | null;
};

export type GlobalWallShare = {
  type: 'establishment' | 'contest_announcement';
  id: number;
  title: string;
  path: string;
};

export type GlobalWallPost = {
  id: number;
  body: string;
  linkUrl: string | null;
  linkLabel: string | null;
  attachments: GlobalWallAttachment[] | null;
  share: GlobalWallShare | null;
  createdAt: string | null;
  author: GlobalWallAuthor | null;
  replyCount: number;
  replies: GlobalWallReply[];
  senderStats?: GlobalWallSenderStats | null;
  reactions?: GlobalWallReactionSummary[];
};

type ListResponse = {
  success: boolean;
  message?: string;
  data?: { items: GlobalWallPost[]; total: number; page: number; limit: number };
};

type ReplyResponse = {
  success: boolean;
  message?: string;
  data?: GlobalWallReply;
};

export type GlobalWallLiveConfig = { hubUrl: string; topic: string; token: string };

/** Taille de la première page (communauté mobile) — garder aligné avec le sync temps réel. */
export const GLOBAL_WALL_PAGE_SIZE = 12;

/** IDs à envoyer à `/mark-seen` (messages des autres seulement côté serveur). */
export function collectGlobalWallSeenPayload(posts: GlobalWallPost[]): { postIds: number[]; replyIds: number[] } {
  const postIds: number[] = [];
  const replyIds: number[] = [];
  for (const p of posts) {
    if (p.id > 0) {
      postIds.push(p.id);
    }
    for (const r of p.replies) {
      if (r.id > 0) {
        replyIds.push(r.id);
      }
    }
  }
  return { postIds, replyIds };
}

export async function markGlobalWallSeen(
  payload: { postIds: number[]; replyIds: number[] },
  accessToken: string,
): Promise<{ success: boolean; message?: string }> {
  const url = buildApiUrl('/api/global-wall/mark-seen');
  return await httpPostJson<{ success: boolean; message?: string }, typeof payload>(url, payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

/** Fusion page 1 : conserve senderStats déjà en mémoire si l’API ne les renvoie pas. */
export function mergeGlobalWallPage1(prev: GlobalWallPost[], page1: GlobalWallPost[]): GlobalWallPost[] {
  if (page1.length === 0) {
    return prev;
  }
  const prevById = new Map(prev.map((p) => [p.id, p]));
  const mergedPage1 = page1.map((fresh) => {
    const old = prevById.get(fresh.id);
    if (!old) {
      return fresh;
    }
    const replies =
      fresh.replies?.map((fr) => {
        const or = old.replies.find((r) => r.id === fr.id);
        let next = fr;
        if (or?.senderStats != null && fr.senderStats == null) {
          next = { ...next, senderStats: or.senderStats };
        }
        if (
          or &&
          (or.reactions?.length ?? 0) > 0 &&
          ((fr.reactions?.length ?? 0) === 0 || fr.reactions == null)
        ) {
          next = { ...next, reactions: or.reactions };
        }
        return next;
      }) ?? fresh.replies;
    let out: GlobalWallPost = { ...fresh, replies };
    if (old.senderStats != null && fresh.senderStats == null) {
      out = { ...out, senderStats: old.senderStats };
    }
    if (
      (old.reactions?.length ?? 0) > 0 &&
      ((fresh.reactions?.length ?? 0) === 0 || fresh.reactions == null)
    ) {
      out = { ...out, reactions: old.reactions };
    }
    return out;
  });
  const freshIds = new Set(mergedPage1.map((p) => p.id));
  return [...mergedPage1, ...prev.filter((p) => !freshIds.has(p.id))];
}

/** JWT optionnel : sans lui le backend n’envoie pas senderStats pour vos messages. */
export async function fetchGlobalWallPosts(
  page = 1,
  limit = GLOBAL_WALL_PAGE_SIZE,
  accessToken?: string | null,
): Promise<ListResponse> {
  const url = buildApiUrl('/api/global-wall/posts', { page, limit });
  const token = typeof accessToken === 'string' ? accessToken.trim() : '';
  const headers: HeadersInit = {};
  if (token.length > 0) {
    headers.Authorization = `Bearer ${token}`;
  }
  try {
    return await httpGetJson<ListResponse>(url, Object.keys(headers).length > 0 ? { headers } : undefined);
  } catch (err: unknown) {
    const status = (err as ApiError)?.status;
    /** Route GET publique : si le Bearer est refusé (JWT expiré / invalide), retenter sans auth. */
    if (token.length > 0 && status === 401) {
      return await httpGetJson<ListResponse>(url);
    }
    throw err;
  }
}

export async function fetchGlobalWallRevision(): Promise<{
  success: boolean;
  message?: string;
  data?: { revision: string };
}> {
  const url = buildApiUrl('/api/global-wall/revision');
  return await httpGetJson(url);
}

export async function fetchGlobalWallLiveConfig(): Promise<{
  success: boolean;
  message?: string;
  data?: GlobalWallLiveConfig | null;
}> {
  const url = buildApiUrl('/api/global-wall/live-config');
  return await httpGetJson(url);
}

export type PostGlobalWallReplyPayload = {
  body: string;
  linkUrl?: string | null;
  linkLabel?: string | null;
  photo?: { url: string; name?: string | null; mime?: string | null; size?: number | null } | null;
  document?: { url: string; name?: string | null; mime?: string | null; size?: number | null } | null;
};

export async function postGlobalWallReply(
  postId: number,
  payload: PostGlobalWallReplyPayload,
  accessToken: string,
): Promise<ReplyResponse> {
  const url = buildApiUrl(`/api/global-wall/posts/${postId}/replies`);
  return await httpPostJson<ReplyResponse, PostGlobalWallReplyPayload>(url, payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

type CreatePostResponse = {
  success: boolean;
  message?: string;
  data?: GlobalWallPost;
};

/** Publication sur le fil principal (top-level), même corps qu’une réponse. */
export async function postGlobalWallUserPost(
  payload: PostGlobalWallReplyPayload,
  accessToken: string,
): Promise<CreatePostResponse> {
  const url = buildApiUrl('/api/global-wall/posts');
  return await httpPostJson<CreatePostResponse, PostGlobalWallReplyPayload>(url, payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

type ReactionResponse = {
  success: boolean;
  message?: string;
  data?: { reactions: GlobalWallReactionSummary[] };
};

export async function postGlobalWallPostReaction(
  postId: number,
  emoji: string,
  accessToken: string,
): Promise<ReactionResponse> {
  const url = buildApiUrl(`/api/global-wall/posts/${postId}/reactions`);
  return await httpPostJson<ReactionResponse, { emoji: string }>(url, { emoji }, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function postGlobalWallReplyReaction(
  replyId: number,
  emoji: string,
  accessToken: string,
): Promise<ReactionResponse> {
  const url = buildApiUrl(`/api/global-wall/replies/${replyId}/reactions`);
  return await httpPostJson<ReactionResponse, { emoji: string }>(url, { emoji }, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
