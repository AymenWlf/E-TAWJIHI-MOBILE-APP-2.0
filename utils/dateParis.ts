import { DateTime } from 'luxon';

import { type CalendarLabelLocale, monthLabel } from '@/utils/calendarLabels';

/**
 * Fuseau unique pour l’affichage des dates « métier » (boutique, inscriptions, etc.)
 * afin d’aligner mobile, web et interprétation côté serveur.
 */
export const PLATFORM_DISPLAY_TIMEZONE = 'Europe/Paris';

function parseToParis(iso: string): DateTime | null {
  const raw = iso.trim();
  if (!raw) return null;
  let dt = DateTime.fromISO(raw, { setZone: true });
  if (!dt.isValid && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    dt = DateTime.fromISO(raw, { zone: PLATFORM_DISPLAY_TIMEZONE });
  }
  if (!dt.isValid) return null;
  return dt.setZone(PLATFORM_DISPLAY_TIMEZONE);
}

/** dd/MM/yyyy dans le fuseau Paris (chiffres uniquement : pas d’Intl / Hermes). */
export function formatShortDateInParis(iso: string | null | undefined, _locale: 'fr' | 'ar' = 'fr'): string {
  if (!iso) return '—';
  const z = parseToParis(String(iso));
  if (!z) return String(iso);
  return z.toFormat('dd/MM/yyyy');
}

/**
 * Date de commande : jour + mois abrégé + année (libellés explicites : pas de MMM Luxon / Intl sur Hermes).
 */
export function formatOrderCreatedAtShort(iso: string | null | undefined, locale: string): string {
  if (!iso) return '—';
  const z = parseToParis(String(iso));
  if (!z) return '—';
  const loc: CalendarLabelLocale = locale === 'ar' ? 'ar' : 'fr';
  const mon = monthLabel(z.month, loc);
  return `${z.day} ${mon} ${z.year}`.trim();
}
