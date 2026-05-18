import { ANNEES_BAC_OPTIONS, type LabeledOption } from '@/constants/academicSetup';

/** Année scolaire en cours (terminale / 2ème année bac). À mettre à jour en début de rentrée si besoin. */
export const CURRENT_BAC_SCHOOL_YEAR = '2025-2026';

/** Rentrée suivante : 1ère année Baccalauréat. */
export const FIRST_BAC_SCHOOL_YEAR = '2026-2027';

export type BacSchoolYearLocale = 'fr' | 'ar';

function bacAnneeContextPhrase(value: string, locale: BacSchoolYearLocale): string | null {
  if (!value || value === 'Autre') return null;
  if (value === CURRENT_BAC_SCHOOL_YEAR) {
    return locale === 'ar' ? 'أنت في الباكالوريا' : 'Tu es en baccalauréat';
  }
  if (value === FIRST_BAC_SCHOOL_YEAR) {
    return locale === 'ar' ? 'أنت في السنة الأولى باك' : 'Tu es en 1ère année Baccalauréat';
  }
  return locale === 'ar' ? 'باكالوريا سابقة' : 'Ancien baccalauréat';
}

/** Libellé affiché dans les puces / listes (contexte + année). */
export function formatBacAnneePickerLabel(value: string, locale: BacSchoolYearLocale): string {
  if (!value) {
    return locale === 'ar' ? 'اختر السنة...' : 'Sélectionnez une année...';
  }
  if (value === 'Autre') {
    return locale === 'ar' ? 'أخرى' : 'Autre';
  }
  const phrase = bacAnneeContextPhrase(value, locale);
  if (!phrase) return value;
  return `${phrase} · ${value}`;
}

/** Options année du bac avec libellés pédagogiques (setup mobile, compte). */
export function anneesBacOptionsForLocale(locale: BacSchoolYearLocale): LabeledOption[] {
  return ANNEES_BAC_OPTIONS.map((o) => {
    if (!o.value) {
      return {
        value: o.value,
        label: formatBacAnneePickerLabel(o.value, 'fr'),
        labelAr: formatBacAnneePickerLabel(o.value, 'ar'),
      };
    }
    return {
      value: o.value,
      label: formatBacAnneePickerLabel(o.value, 'fr'),
      labelAr: formatBacAnneePickerLabel(o.value, 'ar'),
    };
  });
}
