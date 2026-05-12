import type { DateTime } from 'luxon';

/**
 * Libellés civils explicites : sur Hermes, Luxon `toFormat('MMM'|'LLL'|'EEE')` s’appuie sur `Intl`,
 * souvent incomplet → mois ou jour affiché vide / « null ».
 */

export const MONTH_LABELS_FR_SHORT = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
] as const;

export const MONTH_LABELS_AR = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
] as const;

/** Luxon : weekday 1 = lundi … 7 = dimanche */
export const WEEKDAY_LABELS_FR_SHORT = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'] as const;

export const WEEKDAY_LABELS_AR = [
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
  'الأحد',
] as const;

export type CalendarLabelLocale = 'fr' | 'ar';

export function monthLabel(month1To12: number, locale: CalendarLabelLocale): string {
  const i = month1To12 - 1;
  if (i < 0 || i > 11) return '';
  return locale === 'ar' ? MONTH_LABELS_AR[i] : MONTH_LABELS_FR_SHORT[i];
}

export function weekdayLabelFromLuxon(dt: DateTime, locale: CalendarLabelLocale): string {
  const i = dt.weekday - 1;
  if (i < 0 || i > 6) return '';
  return locale === 'ar' ? WEEKDAY_LABELS_AR[i] : WEEKDAY_LABELS_FR_SHORT[i];
}
