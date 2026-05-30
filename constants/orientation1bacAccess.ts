import type { AppLocale } from '@/constants/i18n';

/** Ouverture du test d’orientation 1ère bac (heure locale appareil). */
export const ORIENTATION_1BAC_UNLOCK_AT = new Date(2026, 10, 1, 0, 0, 0, 0);

export function isOrientation1BacUnlocked(now: Date = new Date()): boolean {
  return now.getTime() >= ORIENTATION_1BAC_UNLOCK_AT.getTime();
}

export function formatOrientation1BacUnlockDate(locale: AppLocale): string {
  return ORIENTATION_1BAC_UNLOCK_AT.toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
