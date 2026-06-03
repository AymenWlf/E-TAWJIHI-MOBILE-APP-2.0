import { FREE_ESTABLISHMENT_PREVIEW_COUNT } from '@/constants/tawjihPlusAccess';

export type EstablishmentLockedVariant = 'none' | 'compact';

export function resolveEstablishmentLockedVariant(
  contentLocked: boolean,
  listingIndex: number,
): EstablishmentLockedVariant {
  if (!contentLocked) return 'none';
  if (listingIndex >= 0 && listingIndex < FREE_ESTABLISHMENT_PREVIEW_COUNT) return 'none';
  return 'compact';
}

export function isEstablishmentDetailAllowed(
  contentLocked: boolean,
  listingIndex: number,
): boolean {
  if (!contentLocked) return true;
  return listingIndex >= 0 && listingIndex < FREE_ESTABLISHMENT_PREVIEW_COUNT;
}
