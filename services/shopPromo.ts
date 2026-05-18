import { buildApiUrl } from '@/constants/api';
import { httpPostJson } from '@/services/http';
import type { ShopCartLine } from '@/types/shop';
import { isPlatformServiceCartLine } from '@/utils/platformServiceCart';

interface ApiDataResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type ShopPromoDiscountType = 'percent' | 'fixed';

export interface ValidateShopPromoResult {
  valid: boolean;
  message: string;
  discountAmount: string;
  code: string;
  discountType?: ShopPromoDiscountType;
  discountValue?: string;
  autoApplied?: boolean;
  eligibleSubtotal?: string;
  scopedToArticles?: boolean;
}

export type ShopPromoCartLinePayload = {
  productId?: number;
  platformServiceSlug?: string;
  quantity: number;
};

/** Panier mobile → payload API (produits + services plateforme). */
export function shopOrderLinesToPromoPayload(
  lines: {
    productId: number | null;
    productType: string;
    platformServiceSlug?: string | null;
    quantity: number;
    removedAt?: string | null;
  }[],
): ShopPromoCartLinePayload[] {
  const out: ShopPromoCartLinePayload[] = [];
  for (const line of lines) {
    if (line.removedAt) continue;
    if (line.productType === 'service') {
      const slug = (line.platformServiceSlug ?? '').trim();
      if (slug) out.push({ platformServiceSlug: slug, quantity: line.quantity });
      continue;
    }
    if (line.productId != null && line.productId > 0) {
      out.push({ productId: line.productId, quantity: line.quantity });
    }
  }
  return out;
}

export function shopCartLinesToPromoPayload(lines: ShopCartLine[]): ShopPromoCartLinePayload[] {
  return lines.map((l) => {
    if (isPlatformServiceCartLine(l)) {
      return {
        platformServiceSlug: String((l.platformServiceSlug ?? l.slug) ?? '').trim(),
        quantity: 1,
      };
    }
    return { productId: l.productId, quantity: l.quantity };
  });
}

export function rejectMultipleShopPromoCodesInInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/[,;+]/.test(trimmed)) {
    return 'Un seul code promo par commande : ne saisissez qu’un code à la fois.';
  }
  if (/\S\s+\S/.test(trimmed)) {
    return 'Un seul code promo par commande : ne saisissez qu’un code à la fois.';
  }
  return null;
}

export async function validateShopPromoCode(
  payload: {
    code: string;
    lines?: ShopPromoCartLinePayload[];
    phone?: string;
    email?: string;
  },
  accessToken?: string | null,
): Promise<ValidateShopPromoResult> {
  const multiErr = rejectMultipleShopPromoCodesInInput(payload.code);
  if (multiErr) {
    return {
      valid: false,
      message: multiErr,
      discountAmount: '0.00',
      code: '',
    };
  }
  const url = buildApiUrl('/api/shop/promo-codes/validate');
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const data = await httpPostJson<ApiDataResponse<ValidateShopPromoResult>, typeof payload>(url, payload, {
    headers,
  });
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Validation impossible');
  }
  return data.data;
}

export async function fetchShopAutoApplyPromo(
  payload: {
    lines: ShopPromoCartLinePayload[];
    phone?: string;
    email?: string;
  },
  accessToken?: string | null,
): Promise<ValidateShopPromoResult> {
  const url = buildApiUrl('/api/shop/promo-codes/auto-apply');
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const data = await httpPostJson<ApiDataResponse<ValidateShopPromoResult>, typeof payload>(url, payload, {
    headers,
  });
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Auto-application impossible');
  }
  return data.data;
}
