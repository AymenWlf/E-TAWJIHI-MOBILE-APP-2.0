/**
 * Configuration carte « Résultats du bac ».
 * Prod : chargée via GET /api/bac-results/public (backoffice admin).
 * Fallback local si l’API est indisponible.
 */

export type BacOutletStatus = 'not_yet' | 'published';

export type BacResultsGlobalStatus = 'not_yet' | 'published';

export type BacResultsCardConfig = {
  /** Statut global de publication des résultats */
  globalStatus: BacResultsGlobalStatus;
  /** Date/heure prévue de publication (ISO 8601, fuseau Maroc conseillé) */
  resultDateIso: string;
  /** Résultats disponibles sur Outlook */
  outlook: BacOutletStatus;
  /** Résultats envoyés par SMS */
  sms: BacOutletStatus;
  /** Résultats visibles sur bac.men.gov.ma */
  menResults: BacOutletStatus;
  /** Le site bac.men.gov.ma répond (hors contenu des notes) */
  menSiteOnline: boolean;
  /** Carte bac en 1re position (parcours orientation en 2e). */
  bacCardFirst: boolean;
};

/** Valeurs par défaut si l’API est injoignable. */
export const BAC_RESULTS_STATIC_DEFAULT: BacResultsCardConfig = {
  globalStatus: 'not_yet',
  resultDateIso: '2026-07-08T12:00:00+01:00',
  outlook: 'not_yet',
  sms: 'not_yet',
  menResults: 'not_yet',
  menSiteOnline: true,
  bacCardFirst: false,
};

function normalizeOutletStatus(raw: unknown): BacOutletStatus {
  return raw === 'published' ? 'published' : 'not_yet';
}

function normalizeGlobalStatus(raw: unknown): BacResultsGlobalStatus {
  return raw === 'published' ? 'published' : 'not_yet';
}

/** Parse la réponse API admin/public → config carte (fallback sur défaut local). */
export function parseBacResultsConfigFromApi(
  raw: unknown,
  fallback: BacResultsCardConfig = BAC_RESULTS_STATIC_DEFAULT,
): BacResultsCardConfig {
  if (!raw || typeof raw !== 'object') {
    return fallback;
  }
  const o = raw as Record<string, unknown>;
  const resultDateIso =
    typeof o.resultDateIso === 'string' && o.resultDateIso.trim()
      ? o.resultDateIso.trim()
      : fallback.resultDateIso;
  return {
    globalStatus: normalizeGlobalStatus(o.globalStatus ?? fallback.globalStatus),
    resultDateIso,
    outlook: normalizeOutletStatus(o.outlook ?? fallback.outlook),
    sms: normalizeOutletStatus(o.sms ?? fallback.sms),
    menResults: normalizeOutletStatus(o.menResults ?? fallback.menResults),
    menSiteOnline: o.menSiteOnline !== false,
    bacCardFirst: o.bacCardFirst === true,
  };
}

const STACK_BAC_ID = 'stack-bac-results';
const STACK_PARCOURS_ID = 'stack-1';

/** Réordonne la pile : bac puis parcours, ou l’inverse selon la config backoffice. */
export function orderHomeStackCards<T extends { id: string; bacResults?: unknown; orientationProgress?: unknown }>(
  cards: T[],
  bacCardFirst: boolean,
): T[] {
  const bac = cards.find((c) => c.id === STACK_BAC_ID || c.bacResults != null);
  const parcours = cards.find((c) => c.id === STACK_PARCOURS_ID || c.orientationProgress != null);
  if (!bac || !parcours || bac === parcours) {
    return cards;
  }
  const rest = cards.filter((c) => c !== bac && c !== parcours);
  return bacCardFirst ? [bac, parcours, ...rest] : [parcours, bac, ...rest];
}

export const BAC_MEN_GOV_URL = 'https://bac.men.gov.ma';
export const BAC_OUTLOOK_CHECK_URL = 'https://outlook.live.com/mail/';

export type BacVerificationChannel = 'outlook' | 'men' | 'sms';

/** Identifiant Outlook officiel : code Massar + @taalim.ma */
export function buildMassarOutlookEmail(massarCode: string): string {
  const code = massarCode.replace(/\s/g, '').toLowerCase();
  if (!code) return '';
  return `${code}@taalim.ma`;
}

export type BacCountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  totalMs: number;
  isPast: boolean;
};

export function getBacCountdownParts(
  resultDateIso: string,
  nowMs: number = Date.now(),
): BacCountdownParts {
  const target = new Date(resultDateIso).getTime();
  const diff = target - nowMs;
  if (!Number.isFinite(target) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, totalMs: Math.min(0, diff), isPast: true };
  }
  const totalMinutes = Math.floor(diff / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 60 * 24) / 60);
  const minutes = totalMinutes % 60;
  return { days, hours, minutes, totalMs: diff, isPast: false };
}

export function isBacResultsDay(resultDateIso: string, nowMs: number = Date.now()): boolean {
  const target = new Date(resultDateIso);
  const now = new Date(nowMs);
  return (
    target.getFullYear() === now.getFullYear() &&
    target.getMonth() === now.getMonth() &&
    target.getDate() === now.getDate()
  );
}

export function pad2(n: number): string {
  return String(Math.max(0, n)).padStart(2, '0');
}

/** Au moins un canal de résultat (Outlook, SMS ou bac.men.gov.ma) est publié. */
export function hasAnyBacResultPublished(config: BacResultsCardConfig): boolean {
  return (
    config.outlook === 'published' ||
    config.sms === 'published' ||
    config.menResults === 'published'
  );
}
