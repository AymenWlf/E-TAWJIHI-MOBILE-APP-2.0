import { buildApiUrl } from '@/constants/api';
import { httpGetJson } from '@/services/http';

export type ShopPromoCampaignBrief = {
  id: number;
  name: string;
  endsAt: string;
  labelFr: string | null;
  labelAr: string | null;
};

export type ShopPromoCampaignActiveResponse = {
  banner: ShopPromoCampaignBrief | null;
  hasActiveCampaign: boolean;
};

export async function fetchActiveShopPromoCampaign(): Promise<ShopPromoCampaignActiveResponse> {
  const res = await httpGetJson<{ success: boolean; data: ShopPromoCampaignActiveResponse }>(
    buildApiUrl('/api/shop/promo-campaigns/active'),
  );
  return res.data ?? { banner: null, hasActiveCampaign: false };
}
