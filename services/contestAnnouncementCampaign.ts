import { buildApiUrl } from '@/constants/api';
import { httpGetJson, httpPostJson } from '@/services/http';
import { getMobileVisitorId } from '@/utils/visitorId';

const PUBLIC_BASE = '/api/contest-announcement-campaign';

export type ContestListingPlacementMeta = {
  placementId: number;
  isSponsored: boolean;
  goalType: 'traffic' | 'leadgen';
  destinationUrl: string | null;
  includeLeadFormOnTraffic?: boolean;
  campaignId?: number | null;
};

export type ContestAnnouncementPlacementInfo = {
  placementId: number;
  goalType: 'traffic' | 'leadgen';
  campaignId: number | null;
  isSponsored: boolean;
  destinationUrl?: string | null;
  includeLeadFormOnTraffic?: boolean;
  showLeadFormOnDetailPage?: boolean;
};

export function resolveContestDetailBannerFilter(
  placementInfo: ContestAnnouncementPlacementInfo | null,
  placementInfoLoading: boolean,
): { show: boolean; campaignId: number | null } {
  if (placementInfoLoading) return { show: false, campaignId: null };
  if (!placementInfo) return { show: true, campaignId: null };
  const campaignId = placementInfo.campaignId;
  if (typeof campaignId === 'number' && campaignId > 0) {
    return { show: true, campaignId };
  }
  return { show: false, campaignId: null };
}

export async function fetchContestListingPlacements(): Promise<Record<number, ContestListingPlacementMeta>> {
  const url = buildApiUrl(`${PUBLIC_BASE}/listing-placements`);
  const res = await httpGetJson<{ success: boolean; data?: Record<string, ContestListingPlacementMeta> }>(url);
  if (!res.success || !res.data) return {};
  const out: Record<number, ContestListingPlacementMeta> = {};
  for (const [k, v] of Object.entries(res.data)) {
    const id = parseInt(k, 10);
    if (!Number.isFinite(id) || !v?.placementId) continue;
    out[id] = {
      placementId: v.placementId,
      isSponsored: Boolean(v.isSponsored),
      goalType: v.goalType === 'leadgen' ? 'leadgen' : 'traffic',
      destinationUrl: v.destinationUrl?.trim() ? String(v.destinationUrl).trim() : null,
      includeLeadFormOnTraffic: v.includeLeadFormOnTraffic,
      campaignId: v.campaignId ?? null,
    };
  }
  return out;
}

export async function fetchContestAnnouncementPlacementInfo(
  announcementId: number,
): Promise<ContestAnnouncementPlacementInfo | null> {
  const url = buildApiUrl(`${PUBLIC_BASE}/announcement/${announcementId}/placement-info`);
  const res = await httpGetJson<{ success: boolean; data?: ContestAnnouncementPlacementInfo | null }>(url);
  if (!res.success || !res.data) return null;
  return res.data;
}

async function postContestCampaignStat(
  endpoint: string,
  placementId: number,
  extra?: Record<string, unknown>,
): Promise<void> {
  try {
    const visitorId = await getMobileVisitorId();
    await httpPostJson<{ success: boolean }, Record<string, unknown>>(
      buildApiUrl(`${PUBLIC_BASE}/${endpoint}`),
      {
        placementId,
        viewport: 'mobile',
        clientSurface: 'native_app',
        clientNativeApp: true,
        visitorId,
        ...extra,
      },
    );
  } catch {
    /* best-effort */
  }
}

export async function recordContestCampaignImpression(placementId: number): Promise<void> {
  await postContestCampaignStat('impression', placementId);
}

export async function recordContestCampaignClick(placementId: number): Promise<void> {
  await postContestCampaignStat('click', placementId);
}

export async function recordContestCampaignPageView(
  placementId: number,
  contestAnnouncementId?: number,
): Promise<void> {
  await postContestCampaignStat('page-view', placementId, {
    contestAnnouncementId,
  });
}

export async function recordContestCampaignExternalLinkClick(placementId: number): Promise<void> {
  await postContestCampaignStat('external-link-click', placementId);
}

const sessionPlacementListingImpressions = new Set<number>();

/** Impressions listing sponsorisées (placement KPI portail annonceur). */
export function recordContestListingPlacementImpressionsBatch(
  items: Array<{ placementId?: number | null; isSponsored?: boolean }>,
): void {
  for (const item of items) {
    const placementId = item.placementId;
    if (!item.isSponsored || !placementId || sessionPlacementListingImpressions.has(placementId)) {
      continue;
    }
    sessionPlacementListingImpressions.add(placementId);
    void recordContestCampaignImpression(placementId);
  }
}
