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
): Promise<void> {
  try {
    const visitorId = await getMobileVisitorId();
    const url = buildApiUrl('/api/shop/analytics/record');
    const body: {
      event: ShopBoutiqueAnalyticsEvent;
      visitorId: string;
      viewport: string;
      productId?: number;
    } = {
      event,
      visitorId,
      viewport: 'mobile',
    };
    if (productId != null && productId > 0) {
      body.productId = productId;
    }
    await httpPostJson<{ success: boolean }, typeof body>(url, body);
  } catch {
    /* analytics best-effort */
  }
}
