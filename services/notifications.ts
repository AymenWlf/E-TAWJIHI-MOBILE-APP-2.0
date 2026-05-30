import { DeviceEventEmitter } from 'react-native';

import { buildApiUrl } from '@/constants/api';
import { httpGetJson, httpPostJson } from '@/services/http';
import type { AppNotification, NotificationsListResponse } from '@/types/inscriptions';

/**
 * Émis pour aligner badge + liste in-app (push reçue, retour app au premier plan, polling léger).
 * Pas lié au formulaire du bandeau système : uniquement données `/api/notifications`.
 */
export const NOTIFICATIONS_IN_APP_REFRESH_EVENT = 'notifications:in-app-refresh';

export type NotificationsRefreshPayload = { force?: boolean };

/** Rafraîchit badge + tiroir notifications (après étape parcours, push, reco IA, etc.). */
export function emitNotificationsRefresh(options?: NotificationsRefreshPayload): void {
  DeviceEventEmitter.emit(NOTIFICATIONS_IN_APP_REFRESH_EVENT, options);
}

type ListResponse = {
  success: boolean;
  data: AppNotification[];
  pagination: { total: number; unreadCount: number; limit: number; offset: number };
  message?: string;
};

type SimpleResponse = { success: boolean; message?: string };
type CountResponse = { success: boolean; count: number };

export async function fetchNotifications(
  accessToken: string,
  options: { limit?: number; offset?: number; unreadOnly?: boolean } = {},
): Promise<NotificationsListResponse> {
  const url = buildApiUrl('/api/notifications', {
    limit: options.limit ?? 50,
    offset: options.offset ?? 0,
    unread_only: options.unreadOnly ? 'true' : undefined,
  });
  try {
    const res = await httpGetJson<ListResponse>(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return {
      items: Array.isArray(res.data) ? res.data : [],
      total: res.pagination?.total ?? 0,
      unreadCount: res.pagination?.unreadCount ?? 0,
    };
  } catch {
    return { items: [], total: 0, unreadCount: 0 };
  }
}

export async function fetchUnreadAnnouncementCount(accessToken: string): Promise<number> {
  const res = await fetchNotifications(accessToken, {
    limit: 100,
    offset: 0,
    unreadOnly: true,
  });
  return unreadContestAnnouncementIdsFromNotifications(res.items).size;
}

export async function fetchUnreadAnnouncementState(accessToken: string): Promise<Set<number>> {
  const res = await fetchNotifications(accessToken, {
    limit: 100,
    offset: 0,
    unreadOnly: true,
  });
  return unreadContestAnnouncementIdsFromNotifications(res.items);
}

export async function fetchUnreadCount(accessToken: string): Promise<number> {
  try {
    const url = buildApiUrl('/api/notifications/unread-count');
    const res = await httpGetJson<CountResponse>(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.success ? res.count ?? 0 : 0;
  } catch {
    return 0;
  }
}

export async function markNotificationRead(accessToken: string, id: number): Promise<boolean> {
  try {
    const url = buildApiUrl(`/api/notifications/${id}/read`);
    const res = await httpPostJson<SimpleResponse, Record<string, never>>(url, {} as never, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return Boolean(res.success);
  } catch {
    return false;
  }
}

export async function markAllNotificationsRead(accessToken: string): Promise<boolean> {
  try {
    const url = buildApiUrl('/api/notifications/mark-all-read');
    const res = await httpPostJson<SimpleResponse, Record<string, never>>(url, {} as never, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return Boolean(res.success);
  } catch {
    return false;
  }
}

/**
 * Indique si une notification in-app pointe vers une annonce concours.
 */
export function isAnnouncementRelatedNotification(n: AppNotification): boolean {
  if (n.type === 'announcement' || n.type === 'follow_school_new_announcement') return true;
  const meta = (n.metadata ?? {}) as Record<string, unknown>;
  const direct = Number(meta.announcement_id ?? meta.contest_announcement_id ?? 0);
  if (Number.isFinite(direct) && direct > 0) return true;
  if (
    meta.deep_link === 'community_qna' &&
    String(meta.context_type ?? '') === 'contest_announcement' &&
    Number(meta.context_id ?? 0) > 0
  ) {
    return true;
  }
  return false;
}

/** ID annonce concours référencé par la notification, si identifiable. */
export function contestAnnouncementIdFromNotification(n: AppNotification): number | null {
  const meta = (n.metadata ?? {}) as Record<string, unknown>;
  const direct = Number(meta.announcement_id ?? meta.contest_announcement_id ?? 0);
  if (Number.isFinite(direct) && direct > 0) return direct;
  if (
    meta.deep_link === 'community_qna' &&
    String(meta.context_type ?? '') === 'contest_announcement'
  ) {
    const cid = Number(meta.context_id ?? 0);
    if (Number.isFinite(cid) && cid > 0) return cid;
  }
  return null;
}

/**
 * Annonces concours ayant au moins une notification in-app non lue.
 */
export function unreadContestAnnouncementIdsFromNotifications(
  items: readonly AppNotification[],
): Set<number> {
  const out = new Set<number>();
  for (const n of items) {
    if (n.isRead || !isAnnouncementRelatedNotification(n)) continue;
    const aid = contestAnnouncementIdFromNotification(n);
    if (aid != null) out.add(aid);
  }
  return out;
}

/**
 * Indique si une notification in-app pointe vers cette annonce concours (même logique que la navigation).
 */
export function appNotificationReferencesContestAnnouncement(
  n: AppNotification,
  contestAnnouncementId: number,
): boolean {
  const meta = (n.metadata ?? {}) as Record<string, unknown>;
  const direct = Number(meta.announcement_id ?? meta.contest_announcement_id ?? 0);
  if (Number.isFinite(direct) && direct === contestAnnouncementId) return true;
  if (
    meta.deep_link === 'community_qna' &&
    String(meta.context_type ?? '') === 'contest_announcement' &&
    Number(meta.context_id ?? 0) === contestAnnouncementId
  ) {
    return true;
  }
  return false;
}

/**
 * Marque comme lues les notifications non lues associées à l’annonce (ex. consultation page détail).
 * Retourne le nombre de notifications effectivement marquées côté API.
 */
export async function markUnreadNotificationsForContestAnnouncement(
  accessToken: string,
  contestAnnouncementId: number,
): Promise<number> {
  const res = await fetchNotifications(accessToken, {
    limit: 100,
    offset: 0,
    unreadOnly: true,
  });
  let marked = 0;
  for (const n of res.items) {
    if (!appNotificationReferencesContestAnnouncement(n, contestAnnouncementId)) continue;
    const ok = await markNotificationRead(accessToken, n.id);
    if (ok) marked += 1;
  }
  return marked;
}
