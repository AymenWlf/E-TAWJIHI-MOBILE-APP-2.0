import { getAnnouncementTypeStyle } from '@/utils/announcementTypeStyle';
import type { EstablishmentBrief } from '@/types/inscriptions';
import {
  hasLegacyTassjilAccess,
  type LegacyLinkFlags,
} from '@/utils/tassjilPracticalLinkLock';

/** Annonce d’ouverture d’inscription ou de résultat (pas concours / bourse / message). */
export function isInscriptionOrResultAnnouncementType(
  announcementType: string | null | undefined,
): boolean {
  const key = getAnnouncementTypeStyle(announcementType).key;
  return key === 'opening' || key === 'result';
}

export function shouldShowTassjilServiceIncludedNotice(
  establishment: Pick<EstablishmentBrief, 'isServiceTassjil'> | null | undefined,
  announcementType: string | null | undefined,
  legacyLink?: LegacyLinkFlags | null,
): boolean {
  return (
    hasLegacyTassjilAccess(legacyLink) &&
    Boolean(establishment?.isServiceTassjil) &&
    isInscriptionOrResultAnnouncementType(announcementType)
  );
}
