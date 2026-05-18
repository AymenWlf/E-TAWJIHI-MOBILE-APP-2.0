import { buildApiUrl } from '@/constants/api';
import { httpGetJson } from '@/services/http';
import type { ShopOrderPayload } from '@/types/shop';

export type UserOrderServicePaymentCard = {
  modality: string;
  cashplusCode?: string | null;
  bankRib?: string | null;
  officeMapsUrl?: string | null;
  officeAddress?: string | null;
};

export type UserOrderSummary = {
  publicId: string;
  orderNumber: string;
  status: string;
  deliveryMode: string;
  deliveryFulfillmentStatus?: string | null;
  total: string;
  currency: string;
  createdAt: string | null;
  itemsCount: number;
  firstItemTitle: string | null;
  hasServiceLines?: boolean;
  hasPhysicalLines?: boolean;
  servicePaymentModality?: string | null;
  servicePaymentCashplusCode?: string | null;
  bankTransferReceiptUrl?: string | null;
  servicePaymentCard?: UserOrderServicePaymentCard | null;
};

type ApiListResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type ApiDataResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export async function fetchUserOrders(accessToken: string): Promise<UserOrderSummary[]> {
  const url = buildApiUrl('/api/user/orders');
  const res = await httpGetJson<ApiListResponse<UserOrderSummary[]>>(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.success) {
    throw new Error(typeof res.message === 'string' ? res.message : 'Impossible de charger les commandes');
  }
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchUserOrderDetail(
  accessToken: string,
  publicId: string,
): Promise<ShopOrderPayload | null> {
  try {
    const url = buildApiUrl(`/api/user/orders/${encodeURIComponent(publicId)}`);
    const res = await httpGetJson<ApiDataResponse<ShopOrderPayload>>(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.success || !res.data) return null;
    return res.data;
  } catch {
    return null;
  }
}

export async function uploadUserOrderBankTransferReceipt(
  accessToken: string,
  publicId: string,
  file: { uri: string; name: string; type: string },
): Promise<ShopOrderPayload> {
  const url = buildApiUrl(`/api/user/orders/${encodeURIComponent(publicId)}/bank-transfer-receipt`);
  const form = new FormData();
  form.append('receipt', {
    uri: file.uri,
    name: file.name || 'justificatif.pdf',
    type: file.type || 'application/octet-stream',
  } as unknown as Blob);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });
  const json = (await res.json().catch(() => null)) as ApiDataResponse<ShopOrderPayload> & { message?: string };
  if (!res.ok || !json?.success || !json.data) {
    throw new Error(typeof json?.message === 'string' ? json.message : `HTTP ${res.status}`);
  }
  return json.data;
}

export async function applyUserOrderPromo(
  accessToken: string,
  publicId: string,
  promoCode: string,
): Promise<ShopOrderPayload> {
  const url = buildApiUrl(`/api/user/orders/${encodeURIComponent(publicId)}/apply-promo`);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ promoCode: promoCode.trim() }),
  });
  const json = (await res.json().catch(() => null)) as ApiDataResponse<ShopOrderPayload> & { message?: string };
  if (!res.ok || !json?.success || !json.data) {
    throw new Error(typeof json?.message === 'string' ? json.message : `HTTP ${res.status}`);
  }
  return json.data;
}
