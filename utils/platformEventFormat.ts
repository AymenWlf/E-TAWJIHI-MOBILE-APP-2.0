import { DateTime } from 'luxon';
import type { AppLocale } from '@/constants/i18n';
import { monthLabel, weekdayLabelFromLuxon, type CalendarLabelLocale } from '@/utils/calendarLabels';

/**
 * Défaut aligné backend / web : heure de Paris (DST gérée par IANA).
 *
 * Sur React Native / Hermes, `Intl` est incomplet : Luxon `LLL` / `MMM` / `EEE` peut afficher
 * un mois vide ou « null ». On compose les libellés avec des tableaux explicites (FR/AR).
 */
const FALLBACK_EVENT_IANA_TZ = 'Europe/Paris';

function calLocale(locale: AppLocale): CalendarLabelLocale {
  return locale === 'ar' ? 'ar' : 'fr';
}

/** IANA valide pour Luxon, sinon défaut aligné backend. */
export function resolvePlatformEventIanaTz(raw: string | undefined | null): string {
  const tz = (raw ?? '').trim();
  if (!tz) return FALLBACK_EVENT_IANA_TZ;
  const probe = DateTime.now().setZone(tz);
  return probe.isValid ? tz : FALLBACK_EVENT_IANA_TZ;
}

function zonedFromApiIso(iso: string, eventTimeZone: string): DateTime | null {
  const dt = DateTime.fromISO(iso, { setZone: true });
  if (!dt.isValid) return null;
  return dt.setZone(resolvePlatformEventIanaTz(eventTimeZone));
}

function formatZonedCardInstant(z: DateTime, locale: AppLocale): string {
  const loc = calLocale(locale);
  const mon = monthLabel(z.month, loc);
  const t = z.toFormat('HH:mm');
  return `${z.day} ${mon} ${t}`.trim();
}

/** Plage courte (cartes liste). */
export function formatPlatformEventCardRange(
  isoStart: string,
  isoEnd: string,
  locale: AppLocale,
  eventTimeZone: string,
): string {
  const a = zonedFromApiIso(isoStart, eventTimeZone);
  const b = zonedFromApiIso(isoEnd, eventTimeZone);
  if (!a || !b) return `${isoStart} → ${isoEnd}`;
  return `${formatZonedCardInstant(a, locale)} → ${formatZonedCardInstant(b, locale)}`;
}

/** Détail : jour + heure dans le fuseau de l’événement. */
export function formatPlatformEventDetailDateTime(
  iso: string,
  locale: AppLocale,
  eventTimeZone: string,
): string {
  const z = zonedFromApiIso(iso, eventTimeZone);
  if (!z) return iso;
  const loc = calLocale(locale);
  const wd = weekdayLabelFromLuxon(z, loc);
  const mon = monthLabel(z.month, loc);
  const t = z.toFormat('HH:mm');
  return `${wd} ${z.day} ${mon} ${z.year}, ${t}`.trim();
}
