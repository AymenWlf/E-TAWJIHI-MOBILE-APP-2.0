import type { TawjihPlusPublicSettings } from '@/services/tawjihPlusSettings';

/** Accès partiel global admin : annonces détaillées + listing écoles complet (sans être client). */
export function globalPartialAccessGrantsSchoolsCatalog(
  settings: Pick<TawjihPlusPublicSettings, 'globalPartialAccessEnabled'> | null | undefined,
): boolean {
  return settings?.globalPartialAccessEnabled === true;
}
