import { buildApiUrl } from '@/constants/api';
import { httpGetJson, httpPostJson } from '@/services/http';
import type {
  CreateShopOrderInput,
  CreateShopOrderResult,
  ShopOrderPayload,
  ShopPagination,
  ShopProductDetail,
  ShopProductListItem,
  ShopPublicSettings,
} from '@/types/shop';

interface ApiListResponse<T> {
  success: boolean;
  data: T;
  pagination: ShopPagination;
  message?: string;
}

interface ApiDataResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type ShopProductsQuery = {
  page?: number;
  limit?: number;
  type?: string;
  category?: string;
  search?: string;
  featured?: boolean;
  bacType?: string;
  filiere?: string;
  specialite1?: string;
  specialite2?: string;
};

export async function fetchShopCategories(): Promise<string[]> {
  const url = buildApiUrl('/api/shop/products/categories');
  const data = await httpGetJson<ApiDataResponse<string[]>>(url);
  if (!data.success || !Array.isArray(data.data)) return [];
  return data.data;
}

export async function fetchShopProducts(
  params: ShopProductsQuery,
): Promise<{ items: ShopProductListItem[]; pagination: ShopPagination }> {
  const url = buildApiUrl('/api/shop/products', {
    page: params.page ?? 1,
    limit: params.limit ?? 24,
    type: params.type || undefined,
    category: params.category || undefined,
    search: params.search || undefined,
    featured: params.featured ? '1' : undefined,
    bacType: params.bacType || undefined,
    filiere: params.filiere || undefined,
    specialite1: params.specialite1 || undefined,
    specialite2: params.specialite2 || undefined,
  });
  const data = await httpGetJson<ApiListResponse<ShopProductListItem[]>>(url);
  return { items: data.data ?? [], pagination: data.pagination };
}

export async function fetchShopProductBySlug(slug: string): Promise<ShopProductDetail | null> {
  try {
    const url = buildApiUrl(`/api/shop/products/${encodeURIComponent(slug)}`);
    const data = await httpGetJson<ApiDataResponse<ShopProductDetail>>(url);
    if (!data.success) return null;
    return data.data;
  } catch {
    return null;
  }
}

export async function fetchShopPublicSettings(): Promise<ShopPublicSettings> {
  try {
    const url = buildApiUrl('/api/shop/settings/public');
    const data = await httpGetJson<ApiDataResponse<ShopPublicSettings>>(url);
    if (!data.success || !data.data) return { shippingFeeMode: 'catalog', fixedShippingFee: null };
    return {
      shippingFeeMode: data.data.shippingFeeMode === 'fixed' ? 'fixed' : 'catalog',
      fixedShippingFee: data.data.fixedShippingFee ?? null,
    };
  } catch {
    return { shippingFeeMode: 'catalog', fixedShippingFee: null };
  }
}

export async function createShopOrder(body: CreateShopOrderInput): Promise<CreateShopOrderResult> {
  const url = buildApiUrl('/api/shop/orders');
  const data = await httpPostJson<ApiDataResponse<CreateShopOrderResult>, CreateShopOrderInput>(url, body);
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Erreur lors de la création de la commande');
  }
  return data.data;
}

export async function fetchShopOrder(publicId: string, token: string): Promise<ShopOrderPayload | null> {
  try {
    const url = buildApiUrl(`/api/shop/orders/${encodeURIComponent(publicId)}`, { token });
    const data = await httpGetJson<ApiDataResponse<ShopOrderPayload>>(url);
    if (!data.success) return null;
    return data.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Recharge depuis le catalogue les images / livraison gratuite manquantes des lignes panier
 * (utile pour les paniers persistés avant l'ajout des champs côté API).
 */
export async function hydrateCartLinesImagesViaApi<T extends { slug: string; images?: string[]; isFreeShipping?: boolean }>(
  lines: T[],
): Promise<T[]> {
  if (lines.length === 0) return lines;
  const needs = lines.filter((l) => !l.images || l.images.length === 0);
  if (needs.length === 0) return lines;
  const map = new Map<string, { images?: string[]; isFreeShipping?: boolean }>();
  await Promise.all(
    needs.map(async (l) => {
      const detail = await fetchShopProductBySlug(l.slug);
      if (detail) {
        map.set(l.slug, { images: detail.images, isFreeShipping: detail.isFreeShipping });
      }
    }),
  );
  if (map.size === 0) return lines;
  return lines.map((l) => {
    const hit = map.get(l.slug);
    if (!hit) return l;
    return {
      ...l,
      ...(hit.images && hit.images.length > 0 ? { images: hit.images } : {}),
      ...(hit.isFreeShipping !== undefined ? { isFreeShipping: hit.isFreeShipping } : {}),
    };
  });
}
