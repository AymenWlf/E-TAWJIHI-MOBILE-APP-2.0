import { ANNEES_BAC_OPTIONS, type LabeledOption } from '@/constants/academicSetup';
import { CURRENT_BAC_SCHOOL_YEAR, FIRST_BAC_SCHOOL_YEAR } from '@/utils/academicProfileLevels';

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

/** Options année du bac avec libellés pédagogiques (setup mobile, compte, diagnostic). */
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
