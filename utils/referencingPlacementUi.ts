import type { ListingPlacementInfo } from '@/services/referencingAds';

export function placementShowsContactForm(
  info: Pick<ListingPlacementInfo, 'goalType' | 'includeLeadFormOnTraffic' | 'isSponsored'> | null | undefined,
): boolean {
  if (!info) return false;
  if (info.isSponsored) return true;
  if (info.goalType === 'leadgen') return true;
  return info.goalType === 'traffic' && Boolean(info.includeLeadFormOnTraffic);
}

export function placementTrafficDestinationUrl(
  info: Pick<ListingPlacementInfo, 'goalType' | 'destinationUrl'> | null | undefined,
): string | null {
  if (!info || info.goalType !== 'traffic') return null;
  const url = (info.destinationUrl ?? '').trim();
  return url !== '' ? url : null;
}

/** Ajoute utm_source=e-tawjihi (aligné web). */
export function addUtmToUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  try {
    const u = new URL(trimmed);
    u.searchParams.set('utm_source', 'e-tawjihi');
    return u.toString();
  } catch {
    const sep = trimmed.includes('?') ? '&' : '?';
    return `${trimmed}${sep}utm_source=e-tawjihi`;
  }
}
