import { buildApiUrl } from '@/constants/api';
import { httpGetJson, httpPostJson } from '@/services/http';
import type { EstablishmentListItem, EstablishmentNormalized } from '@/services/establishments';
import { getMobileVisitorId } from '@/utils/visitorId';

export type ListingPlacementInfo = {
  placementId: number;
  isSponsored: boolean;
  goalType: 'traffic' | 'leadgen';
  destinationUrl: string | null;
};

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
    };
  }
  return out;
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
    };
  });
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
