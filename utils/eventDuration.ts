import type { AppLocale } from '@/constants/i18n';

function durationMs(startIso: string, endIso: string): number {
  const s = new Date(startIso).getTime();
  const e = new Date(endIso).getTime();
  if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return 0;
  return e - s;
}

function formatFr(ms: number): string {
  if (ms <= 0) return '—';
  const minsTotal = Math.round(ms / 60000);
  if (minsTotal < 60) return minsTotal <= 1 ? '1 min' : `${minsTotal} min`;
  const fullDays = Math.floor(ms / 86400000);
  const remMs = ms - fullDays * 86400000;
  const remMins = Math.round(remMs / 60000);
  if (fullDays >= 1 && remMins < 2) return fullDays === 1 ? '1 jour' : `${fullDays} jours`;
  if (fullDays >= 1) {
    const remH = Math.floor(remMins / 60);
    const m = remMins % 60;
    const dayPart = fullDays === 1 ? '1 j' : `${fullDays} j`;
    if (remH === 0 && m === 0) return fullDays === 1 ? '1 jour' : `${fullDays} jours`;
    if (m === 0) return `${dayPart} ${remH} h`;
    return `${dayPart} ${remH} h ${m} min`;
  }
  const hTotal = ms / 3600000;
  const h = Math.floor(hTotal);
  const m = Math.round((hTotal - h) * 60);
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

function formatAr(ms: number): string {
  if (ms <= 0) return '—';
  const minsTotal = Math.round(ms / 60000);
  if (minsTotal < 60) return minsTotal <= 1 ? 'دقيقة واحدة' : `${minsTotal} دقيقة`;
  const fullDays = Math.floor(ms / 86400000);
  const remMs = ms - fullDays * 86400000;
  const remMins = Math.round(remMs / 60000);
  if (fullDays >= 1 && remMins < 2) return fullDays === 1 ? 'يوم واحد' : `${fullDays} أيام`;
  if (fullDays >= 1) {
    const remH = Math.floor(remMins / 60);
    const m = remMins % 60;
    if (remH === 0 && m === 0) return fullDays === 1 ? 'يوم واحد' : `${fullDays} أيام`;
    return `${fullDays} ي ${remH} س${m > 0 ? ` ${m} د` : ''}`;
  }
  const hTotal = ms / 3600000;
  const h = Math.floor(hTotal);
  const m = Math.round((hTotal - h) * 60);
  if (m === 0) return h === 1 ? 'ساعة واحدة' : `${h} ساعات`;
  return `${h} س ${m} د`;
}

export function formatPlatformEventDurationMobile(startIso: string, endIso: string, locale: AppLocale): string {
  const ms = durationMs(startIso, endIso);
  return locale === 'ar' ? formatAr(ms) : formatFr(ms);
}
