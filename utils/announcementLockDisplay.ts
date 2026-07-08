/**
 * Variantes d’affichage carte annonce sans TAWJIH PLUS / service actif.
 * `featured` et `compact` partagent le même rendu (contenu masqué) ; la distinction
 * reste utile pour d’éventuelles règles produit côté liste.
 */
export type AnnouncementLockedVariant = 'featured' | 'compact';

export function resolveAnnouncementLockedVariant(
  locked: boolean,
  index: number,
): 'none' | AnnouncementLockedVariant {
  if (!locked) return 'none';
  return index === 0 ? 'featured' : 'compact';
}

/** Annonces concours sponsorisées : contenu visible sans TAWJIH PLUS. */
export function resolveContestAnnouncementLockedVariant(
  previewOnly: boolean | undefined,
  showPaywall: boolean,
  index: number,
  isSponsored?: boolean,
): 'none' | AnnouncementLockedVariant {
  if (isSponsored === true) return 'none';
  return resolveAnnouncementLockedVariant(previewOnly ?? showPaywall, index);
}

export function isAnnouncementContentLocked(
  lockedVariant: 'none' | AnnouncementLockedVariant,
): boolean {
  return lockedVariant !== 'none';
}
