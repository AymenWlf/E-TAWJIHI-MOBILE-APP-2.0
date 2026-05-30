import type { LabeledOption } from '@/constants/academicSetup';

export type DiagnosticUiLocale = 'fr' | 'ar';

export function diagnosticUiLocale(isRTL: boolean, appLocale?: string): DiagnosticUiLocale {
  if (appLocale === 'ar' || appLocale === 'fr') return appLocale;
  return isRTL ? 'ar' : 'fr';
}

export type LocalizedIdOption = { id: string; label: string; labelAr?: string };

export type LocalizedPathOption = LocalizedIdOption & { description?: string; descriptionAr?: string };

export function pickLabeledOption(
  options: readonly LabeledOption[],
  value: string,
  locale: DiagnosticUiLocale,
): string {
  if (!String(value ?? '').trim()) return '';
  const hit = options.find((o) => o.value === value);
  if (!hit) return value;
  return locale === 'ar' && hit.labelAr ? hit.labelAr : hit.label;
}

export function pickIdOptionLabel(
  options: readonly LocalizedIdOption[],
  id: string,
  locale: DiagnosticUiLocale,
): string {
  const hit = options.find((o) => o.id === id);
  if (!hit) return id;
  return locale === 'ar' && hit.labelAr ? hit.labelAr : hit.label;
}

export function pickPathOption(
  option: LocalizedPathOption,
  locale: DiagnosticUiLocale,
): { label: string; description?: string } {
  return {
    label: locale === 'ar' && option.labelAr ? option.labelAr : option.label,
    description:
      locale === 'ar' && option.descriptionAr ? option.descriptionAr : option.description,
  };
}

export const DIAGNOSTIC_STEP_LABELS_I18N: Record<DiagnosticUiLocale, readonly string[]> = {
  fr: [
    'Identité & contact',
    'Parcours & bac',
    'Notes & résultats',
    'Types d’établissements',
    'Mobilité & logement',
    'Concours & préparation',
    'Projet & envoi',
  ],
  ar: [
    'الهوية والتواصل',
    'المسار والباك',
    'النقط والنتائج',
    'أنواع المؤسسات',
    'التنقل والسكن',
    'المباريات والتحضير',
    'المشروع والإرسال',
  ],
};

export const DIAGNOSTIC_STEP_SHORT_LABELS_I18N: Record<DiagnosticUiLocale, readonly string[]> = {
  fr: ['Identité', 'Parcours', 'Notes', 'Établissements', 'Mobilité', 'Concours', 'Projet'],
  ar: ['الهوية', 'المسار', 'النقط', 'المؤسسات', 'التنقل', 'المباريات', 'المشروع'],
};

export function getDiagnosticStepLabels(locale: DiagnosticUiLocale): readonly string[] {
  return DIAGNOSTIC_STEP_LABELS_I18N[locale];
}

export function getDiagnosticStepShortLabels(locale: DiagnosticUiLocale): readonly string[] {
  return DIAGNOSTIC_STEP_SHORT_LABELS_I18N[locale];
}

export function yesNoLabel(locale: DiagnosticUiLocale, yes: boolean): string {
  return yes ? (locale === 'ar' ? 'نعم' : 'Oui') : locale === 'ar' ? 'لا' : 'Non';
}

export function yesNoMaybeLabels(locale: DiagnosticUiLocale): Record<string, string> {
  return locale === 'ar'
    ? { yes: 'نعم', no: 'لا', maybe: 'ربما', depends: 'يعتمد', unsure: 'غير متأكد', '': '—' }
    : { yes: 'Oui', no: 'Non', maybe: 'Peut-être', depends: 'Ça dépend', unsure: 'Je ne sais pas encore', '': '—' };
}
