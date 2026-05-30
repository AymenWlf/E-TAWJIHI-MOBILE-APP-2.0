import type { AppLocale } from '@/constants/i18n';
import { NIVEAU_ETUDE_OPTIONS } from '@/constants/academicSetup';
import type { EligibilityProfile } from '@/utils/eligibility';
import { isFiliere1BacId, resolveFiliereDisplayLabel } from '@/utils/academicFiliere';

const FILIERE_SHORT_FR: Record<string, string> = {
  'Sciences et technologies électriques': 'ST électriques',
  'Sciences et technologies mécaniques': 'ST mécaniques',
  'Sciences gestion comptable': 'SGC',
  'Sciences de la chariaa': 'Chariaa',
};

function optionLabel(
  options: { value: string; label: string; labelAr?: string }[],
  value: string,
  locale: AppLocale,
): string {
  const opt = options.find((o) => o.value === value);
  if (!opt) return value.trim();
  return locale === 'ar' ? (opt.labelAr ?? opt.label) : opt.label;
}

/** Libellé court du niveau d’études pour le sous-titre accueil. */
export function simplifiedStudyLevelLabel(value: string, locale: AppLocale): string {
  const v = value.trim();
  if (!v) return '';
  if (locale === 'ar') return optionLabel(NIVEAU_ETUDE_OPTIONS, v, locale);
  if (v === '1ère année Baccalauréat') return '1ère Bac';
  if (v === '2ème année Baccalauréat') return '2ème Bac';
  return optionLabel(NIVEAU_ETUDE_OPTIONS, v, locale);
}

/** Libellé court de filière pour le sous-titre accueil. */
export function simplifiedFiliereLabel(value: string, locale: AppLocale): string {
  const v = value.trim();
  if (!v) return '';
  if (locale === 'fr' && FILIERE_SHORT_FR[v]) return FILIERE_SHORT_FR[v];
  const full = resolveFiliereDisplayLabel(v, locale);
  if (isFiliere1BacId(v) && locale === 'fr') {
    return full.replace('Sciences ', 'Sc. ').replace(' et ', ' & ');
  }
  return full;
}

/** Segments académiques : filière puis niveau (sans préfixe « Pack : »). */
export function buildHomeAcademicSubtitleParts(
  profile: EligibilityProfile,
  locale: AppLocale,
  bacMissionLabel: string,
): string[] {
  const parts: string[] = [];

  if (profile.bacType === 'mission') {
    parts.push(bacMissionLabel);
  } else {
    const filiere = simplifiedFiliereLabel(profile.filiere ?? '', locale);
    if (filiere) parts.push(filiere);
  }

  const niveau = simplifiedStudyLevelLabel(profile.niveau ?? '', locale);
  if (niveau) parts.push(niveau);

  return parts;
}
