/** Facteur historique : logo TAWJIH PLUS bandeau fiche ≈ 3× l’ancienne taille par défaut. */
export const PLATFORM_SERVICE_GALLERY_LOGO_SCALE = 3;

const GALLERY_LOGO_MAX_PX = 288;
const GALLERY_LOGO_WIDTH_RATIO = 0.78;

/**
 * Taille du logo carré E-Tawjihi dans le bandeau plein écran des fiches service (tous services).
 */
export function platformServiceGalleryLogoIconSize(screenWidth: number): number {
  return Math.min(GALLERY_LOGO_MAX_PX, Math.round(screenWidth * GALLERY_LOGO_WIDTH_RATIO));
}

/** Ancienne taille (avant alignement TAWJIH PLUS) — utile pour tests / comparaison. */
export function platformServiceGalleryLogoIconSizeLegacy(screenWidth: number): number {
  return Math.min(
    GALLERY_LOGO_MAX_PX / PLATFORM_SERVICE_GALLERY_LOGO_SCALE,
    Math.round((screenWidth * GALLERY_LOGO_WIDTH_RATIO) / PLATFORM_SERVICE_GALLERY_LOGO_SCALE),
  );
}
