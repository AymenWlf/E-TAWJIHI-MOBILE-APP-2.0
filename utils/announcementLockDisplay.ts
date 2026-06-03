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

export function isAnnouncementContentLocked(
  lockedVariant: 'none' | AnnouncementLockedVariant,
): boolean {
  return lockedVariant !== 'none';
}
