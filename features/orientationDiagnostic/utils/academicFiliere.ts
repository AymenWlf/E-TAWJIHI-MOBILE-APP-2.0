import type { AppLocale } from '@/constants/i18n';
import { resolveFiliereDisplayLabel as resolveFiliereDisplayLabelMobile } from '@/utils/academicFiliere';

/** Libellé filière — locale FR par défaut (compat web diagnostic). */
export function resolveFiliereDisplayLabel(
  value: string,
  locale: AppLocale = 'fr',
): string {
  return resolveFiliereDisplayLabelMobile(value, locale);
}
