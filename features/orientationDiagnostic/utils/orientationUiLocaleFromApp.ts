import type { AppLocale } from '@/constants/i18n';
import type { OrientationUiLocale } from '../data/orientationDiagnosticI18n';

/** Langue UI du diagnostic d’orientation (alignée sur l’app mobile). */
export function orientationUiLocaleFromApp(locale: AppLocale): OrientationUiLocale {
  return locale === 'ar' ? 'ar' : 'fr';
}
