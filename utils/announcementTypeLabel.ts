import type { HomeCopyKey } from '@/constants/i18n';

import {
  getAnnouncementTypeStyle,
  type AnnouncementVisualKey,
} from '@/utils/announcementTypeStyle';

/** Clés i18n pour les types canoniques (cf. `ANNOUNCEMENT_TYPES` admin). */
const VISUAL_KEY_TO_I18N: Record<Exclude<AnnouncementVisualKey, 'other'>, HomeCopyKey> = {
  opening: 'inscAnnTypeOpening',
  result: 'inscAnnTypeResult',
  scholarshipMa: 'inscAnnTypeScholarshipMa',
  scholarshipForeign: 'inscAnnTypeScholarshipForeign',
  message: 'inscAnnTypeImportant',
  offer: 'inscAnnTypeOffer',
};

/**
 * Renvoie la clé i18n d'un type d'annonce connu, ou `null` pour un libellé
 * custom / legacy non reconnu (on affiche alors le texte brut de l'API).
 */
export function pickAnnouncementTypeLabelKey(
  announcementType: string | null | undefined,
): HomeCopyKey | null {
  const raw = (announcementType ?? '').trim();
  if (raw === '') return null;

  const visualKey = getAnnouncementTypeStyle(raw).key;
  if (visualKey === 'other') return null;

  return VISUAL_KEY_TO_I18N[visualKey];
}

/** Libellé traduit du type d'annonce (FR/AR selon `t`). */
export function pickAnnouncementTypeLabel(
  announcementType: string | null | undefined,
  t: (k: HomeCopyKey) => string,
): string {
  const raw = (announcementType ?? '').trim();
  if (raw === '') return '';

  const i18nKey = pickAnnouncementTypeLabelKey(raw);
  if (i18nKey) return t(i18nKey);

  return raw;
}
