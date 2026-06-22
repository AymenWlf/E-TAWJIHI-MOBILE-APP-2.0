import type { EstablishmentListItem } from '@/services/establishments';
import type { ListingPlacementInfo } from '@/services/referencingAds';

export function establishmentListingPlacement(
  item: Pick<
    EstablishmentListItem,
    | 'isSponsored'
    | 'referencingPlacementId'
    | 'referencingGoalType'
    | 'referencingDestinationUrl'
    | 'referencingIncludeLeadFormOnTraffic'
    | 'referencingCampaignId'
  >,
): ListingPlacementInfo | null {
  const placementId = item.referencingPlacementId;
  if (typeof placementId !== 'number' || placementId <= 0) return null;
  return {
    placementId,
    isSponsored: Boolean(item.isSponsored),
    goalType: item.referencingGoalType === 'leadgen' ? 'leadgen' : 'traffic',
    destinationUrl: item.referencingDestinationUrl ?? null,
    includeLeadFormOnTraffic: Boolean(item.referencingIncludeLeadFormOnTraffic),
    campaignId: item.referencingCampaignId ?? null,
  };
}
