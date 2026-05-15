import { buildApiUrl } from '@/constants/api';
import { httpPostJson } from '@/services/http';
import { getMobileVisitorId } from '@/utils/visitorId';

export type ShopBoutiqueAnalyticsEvent =
  | 'impression_listing'
  | 'impression_detail'
  | 'click_product'
  | 'add_to_cart'
  | 'view_cart'
  | 'view_checkout';

/** Enregistrement non bloquant — même schéma que le front web. */
export async function recordShopBoutiqueEvent(
  event: ShopBoutiqueAnalyticsEvent,
  productId?: number,
  platformServiceSlug?: string,
): Promise<void> {
  try {
    const visitorId = await getMobileVisitorId();
    const url = buildApiUrl('/api/shop/analytics/record');
    const body: {
      event: ShopBoutiqueAnalyticsEvent;
      visitorId: string;
      viewport: string;
      productId?: number;
      platformServiceSlug?: string;
    } = {
      event,
      visitorId,
      viewport: 'mobile',
    };
    if (productId != null && productId > 0) {
      body.productId = productId;
    }
    const slug = typeof platformServiceSlug === 'string' ? platformServiceSlug.trim() : '';
    if (slug.length > 0) {
      body.platformServiceSlug = slug.length > 255 ? slug.slice(0, 255) : slug;
    }
    await httpPostJson<{ success: boolean }, typeof body>(url, body);
  } catch {
    /* analytics best-effort */
  }
}
