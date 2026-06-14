/**
 * Dimensions d’affichage des publicités partenaires (alignées web
 * `LISTING_BANNER_DIMENSIONS`). Sur téléphone : mobile ; sur tablette (≥768px),
 * zones `top` et `mid` en format desktop (728×90).
 */
export const PARTNER_BANNER_TABLET_DESKTOP_BREAKPOINT = 768;

export const PARTNER_BANNER_WIDE = {
  width: 320,
  height: 100,
} as const;

export const PARTNER_BANNER_WIDE_DESKTOP = {
  width: 728,
  height: 90,
} as const;

export const PARTNER_BANNER_SQUARE = {
  size: 300,
} as const;

export type PartnerBannerViewport = 'mobile' | 'desktop';

/** Zones rectangulaires éligibles au format desktop sur tablette. */
export type PartnerBannerWideZone = 'top' | 'mid' | 'bottom';

export function resolvePartnerBannerViewport(
  screenWidth: number,
  zone: PartnerBannerWideZone | 'mid_square',
): PartnerBannerViewport {
  if (
    (zone === 'top' || zone === 'mid') &&
    screenWidth >= PARTNER_BANNER_TABLET_DESKTOP_BREAKPOINT
  ) {
    return 'desktop';
  }
  return 'mobile';
}

export function partnerBannerWideDimensions(viewport: PartnerBannerViewport): {
  width: number;
  height: number;
} {
  return viewport === 'desktop' ? PARTNER_BANNER_WIDE_DESKTOP : PARTNER_BANNER_WIDE;
}
