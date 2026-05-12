import type { AppLocale } from '@/constants/i18n';
import { DateTime } from 'luxon';

import { PLATFORM_DISPLAY_TIMEZONE } from '@/utils/dateParis';

/** Écart en jours calendaires (Europe/Paris) entre le jour de début d’événement et « aujourd’hui » à Paris. */
export function calendarDaysUntilStart(startsAtIso: string): number {
  const start = DateTime.fromISO(startsAtIso, { setZone: true });
  if (!start.isValid) return NaN;
  const startDay = start.setZone(PLATFORM_DISPLAY_TIMEZONE).startOf('day');
  const todayDay = DateTime.now().setZone(PLATFORM_DISPLAY_TIMEZONE).startOf('day');
  return Math.round(startDay.diff(todayDay, 'days').days);
}

/**
 * Libellé court pour l’app mobile (FR / AR) : jours restants avant le début,
 * ou « en cours » si l’événement a déjà commencé et n’est pas terminé.
 */
export function platformEventDaysRemainingLabel(
  locale: AppLocale,
  ev: { startsAt: string; endsAt: string; isPast: boolean },
): string | null {
  if (ev.isPast) return null;
  const now = Date.now();
  const startMs = new Date(ev.startsAt).getTime();
  const endMs = new Date(ev.endsAt).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return null;

  if (now >= startMs && now < endMs) {
    return locale === 'ar' ? 'جارية الآن' : 'En cours';
  }
  if (now >= endMs) return null;

  const days = calendarDaysUntilStart(ev.startsAt);
  if (Number.isNaN(days) || days < 0) return null;
  if (days === 0) {
    return locale === 'ar' ? 'اليوم' : "Aujourd'hui";
  }
  if (days === 1) {
    return locale === 'ar' ? 'غداً' : 'Demain';
  }
  if (locale === 'ar') {
    return days === 2 ? 'خلال يومين' : `خلال ${days} يوماً`;
  }
  return `Dans ${days} jours`;
}
