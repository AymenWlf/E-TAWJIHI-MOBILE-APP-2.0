import { buildApiUrl } from '@/constants/api';
import { httpGetJson, httpPostJson } from '@/services/http';
import type { EstablishmentListItem, EstablishmentNormalized } from '@/services/establishments';
import { getMobileVisitorId } from '@/utils/visitorId';

export type ListingPlacementInfo = {
  placementId: number;
  isSponsored: boolean;
  goalType: 'traffic' | 'leadgen';
  destinationUrl: string | null;
  includeLeadFormOnTraffic?: boolean;
  showLeadFormOnDetailPage?: boolean;
  campaignId?: number | null;
};

export type EstablishmentPlacementInfo = ListingPlacementInfo;

/** Carte placementId / méta campagne par établissement (aligné sur `/api/referencing/listing-placements`). */
export async function fetchListingPlacementsByEstablishment(): Promise<Record<number, ListingPlacementInfo>> {
  const url = buildApiUrl('/api/referencing/listing-placements');
  const res = await httpGetJson<{ success: boolean; data?: Record<string, ListingPlacementInfo> }>(url);
  if (!res.success || !res.data || typeof res.data !== 'object') return {};
  const out: Record<number, ListingPlacementInfo> = {};
  for (const [k, v] of Object.entries(res.data)) {
    const id = parseInt(k, 10);
    if (!Number.isFinite(id) || id <= 0 || !v?.placementId) continue;
    out[id] = {
      placementId: v.placementId,
      isSponsored: Boolean(v.isSponsored),
      goalType: v.goalType === 'leadgen' ? 'leadgen' : 'traffic',
      destinationUrl: v.destinationUrl ?? null,
      includeLeadFormOnTraffic: Boolean(v.includeLeadFormOnTraffic),
      showLeadFormOnDetailPage: v.showLeadFormOnDetailPage !== false,
      campaignId: v.campaignId ?? null,
    };
  }
  return out;
}

export async function fetchEstablishmentPlacementInfo(
  establishmentId: number,
): Promise<EstablishmentPlacementInfo | null> {
  if (!Number.isFinite(establishmentId) || establishmentId <= 0) return null;
  const url = buildApiUrl(`/api/referencing/establishment/${establishmentId}/placement-info`);
  const res = await httpGetJson<{ success: boolean; data?: EstablishmentPlacementInfo | null }>(url);
  if (!res.success || !res.data?.placementId) return null;
  const d = res.data;
  return {
    placementId: d.placementId,
    isSponsored: Boolean(d.isSponsored),
    goalType: d.goalType === 'leadgen' ? 'leadgen' : 'traffic',
    destinationUrl:
      d.destinationUrl != null && String(d.destinationUrl).trim() !== '' ? String(d.destinationUrl).trim() : null,
    includeLeadFormOnTraffic: Boolean(d.includeLeadFormOnTraffic),
    showLeadFormOnDetailPage: d.showLeadFormOnDetailPage !== false,
    campaignId: d.campaignId ?? null,
  };
}

export type ReferencingLeadPayload = {
  placementId?: number;
  establishmentId?: number;
  campaignId?: number;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  source?: 'referencing' | 'banner';
  cardSource?: 'referencing' | 'sponsorship';
  role?: 'élève' | 'tuteur';
  niveau?: string;
  bacType?: 'normal' | 'mission';
  filiere?: string;
  specialite1?: string;
  specialite2?: string;
  ville?: string;
};

export async function submitReferencingLead(payload: ReferencingLeadPayload): Promise<void> {
  await httpPostJson<{ success: boolean; message?: string }, Record<string, unknown>>(
    buildApiUrl('/api/referencing/lead'),
    { ...payload, viewport: 'mobile', clientSurface: 'native_app' },
  );
}

export async function recordReferencingContactClickNative(opts: {
  placementId: number;
}): Promise<void> {
  const visitorId = await getMobileVisitorId();
  await httpPostJson<{ success: boolean }, Record<string, unknown>>(
    buildApiUrl('/api/referencing/record-contact-click'),
    {
      placementId: opts.placementId,
      visitorId,
      viewport: 'mobile',
      clientSurface: 'native_app',
    },
  );
}

export function mergeEstablishmentsWithListingPlacements<
  T extends EstablishmentListItem | EstablishmentNormalized,
>(items: T[], byEstablishment: Record<number, ListingPlacementInfo>): T[] {
  return items.map((e) => {
    const p = byEstablishment[e.id];
    if (!p) return e;
    return {
      ...e,
      isSponsored: p.isSponsored,
      referencingPlacementId: p.placementId,
      referencingGoalType: p.goalType,
      referencingDestinationUrl: p.destinationUrl,
      referencingIncludeLeadFormOnTraffic: p.includeLeadFormOnTraffic,
      referencingCampaignId: p.campaignId ?? null,
    };
  });
}

/**
 * Bannières « Publicité partenaire » sur la fiche établissement :
 * - sans placement client → toutes les bannières ;
 * - établissement référencé / sponsorisé → uniquement la campagne du placement.
 */
export function resolveEstablishmentDetailBannerFilter(
  placement: ListingPlacementInfo | null | undefined,
  placementResolved: boolean,
): { show: boolean; campaignId: number | null } {
  if (!placementResolved) {
    return { show: false, campaignId: null };
  }
  if (!placement) {
    return { show: true, campaignId: null };
  }
  const campaignId = placement.campaignId;
  if (typeof campaignId === 'number' && campaignId > 0) {
    return { show: true, campaignId };
  }
  return { show: false, campaignId: null };
}

/** @deprecated Utiliser `resolveEstablishmentDetailBannerFilter`. */
export function establishmentBlocksPartnerBanners(
  item:
    | Pick<EstablishmentListItem, 'isSponsored' | 'referencingPlacementId'>
    | ListingPlacementInfo
    | null
    | undefined,
): boolean {
  if (!item) return false;
  if ('placementId' in item && item.placementId > 0) {
    return true;
  }
  if ('referencingPlacementId' in item) {
    const placementId = item.referencingPlacementId;
    if (typeof placementId === 'number' && placementId > 0) {
      return true;
    }
  }
  return Boolean(item.isSponsored);
}

export async function recordReferencingImpressionNative(opts: {
  placementId: number;
  source: 'referencing' | 'sponsorship';
}): Promise<void> {
  const visitorId = await getMobileVisitorId();
  await httpPostJson<{ success: boolean }, Record<string, unknown>>(
    buildApiUrl('/api/referencing/impression'),
    {
      placementId: opts.placementId,
      source: opts.source,
      visitorId,
      viewport: 'mobile',
      clientSurface: 'native_app',
    },
  );
}

export async function recordReferencingClickNative(opts: {
  placementId: number;
  source: 'referencing' | 'sponsorship';
}): Promise<void> {
  const visitorId = await getMobileVisitorId();
  await httpPostJson<{ success: boolean }, Record<string, unknown>>(
    buildApiUrl('/api/referencing/click'),
    {
      placementId: opts.placementId,
      source: opts.source,
      visitorId,
      viewport: 'mobile',
      clientSurface: 'native_app',
    },
  );
}

export async function recordReferencingPageViewNative(establishmentId: number): Promise<void> {
  const visitorId = await getMobileVisitorId();
  await httpPostJson<{ success: boolean }, Record<string, unknown>>(
    buildApiUrl('/api/referencing/page-view'),
    {
      establishmentId,
      visitorId,
      viewport: 'mobile',
      clientSurface: 'native_app',
    },
  );
}

export async function recordExternalLinkClickNative(opts: { placementId: number }): Promise<void> {
  const visitorId = await getMobileVisitorId();
  await httpPostJson<{ success: boolean }, Record<string, unknown>>(
    buildApiUrl('/api/referencing/external-link-click'),
    {
      placementId: opts.placementId,
      visitorId,
      viewport: 'mobile',
      clientSurface: 'native_app',
    },
  );
}

export async function recordBrochureDownloadNative(establishmentId: number): Promise<void> {
  const visitorId = await getMobileVisitorId();
  await httpPostJson<{ success: boolean }, Record<string, unknown>>(
    buildApiUrl('/api/referencing/brochure-download'),
    {
      establishmentId,
      visitorId,
      viewport: 'mobile',
      clientSurface: 'native_app',
    },
  );
}
