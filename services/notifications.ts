import { buildApiUrl } from '@/constants/api';
import { httpGetJson, httpPostJson } from '@/services/http';
import type { AppNotification, NotificationsListResponse } from '@/types/inscriptions';

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
