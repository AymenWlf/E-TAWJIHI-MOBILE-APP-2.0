import { buildApiUrl } from '@/constants/api';
import { httpGetJson } from '@/services/http';

export type UserOrderSummary = {
  publicId: string;
  orderNumber: string;
  status: string;
  deliveryMode: string;
  total: string;
  currency: string;
  createdAt: string | null;
  itemsCount: number;
  firstItemTitle: string | null;
};

type ApiListResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export async function fetchUserOrders(accessToken: string): Promise<UserOrderSummary[]> {
  try {
    const url = buildApiUrl('/api/user/orders');
    const res = await httpGetJson<ApiListResponse<UserOrderSummary[]>>(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}
