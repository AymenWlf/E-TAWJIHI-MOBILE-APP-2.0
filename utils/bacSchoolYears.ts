/**
 * Années scolaires du bac — calcul dynamique à partir de septembre.
 * Ex. dès septembre 2026 : année en cours = 2026-2027, 1ère année = 2027-2028.
 */

/** Première année listée (historique) — bornée pour ne pas allonger indéfiniment le select. */
export const EARLIEST_BAC_START_YEAR = 2019;

/** Début d'année scolaire (septembre → août). */
export function getBacSchoolYearStart(date: Date = new Date()): number {
  const y = date.getFullYear();
  const month = date.getMonth() + 1; // 1–12
  return month >= 9 ? y : y - 1;
}

export function formatBacSchoolYearLabel(startYear: number): string {
  return `${startYear}-${startYear + 1}`;
}

/** Terminale / 2ème année bac (année scolaire en cours). */
export function getCurrentBacSchoolYear(date: Date = new Date()): string {
  return formatBacSchoolYearLabel(getBacSchoolYearStart(date));
}

/** 1ère année Baccalauréat → bac l'année suivante. */
export function getFirstBacSchoolYear(date: Date = new Date()): string {
  return formatBacSchoolYearLabel(getBacSchoolYearStart(date) + 1);
}

/**
 * Valeurs du select : 1ère année, année en cours, puis antérieures jusqu'à 2019-2020, puis Autre.
 */
export function buildAnneesBacValues(date: Date = new Date()): string[] {
  const currentStart = getBacSchoolYearStart(date);
  const firstStart = currentStart + 1;
  const years: string[] = [];
  for (let start = firstStart; start >= EARLIEST_BAC_START_YEAR; start -= 1) {
    years.push(formatBacSchoolYearLabel(start));
  }
  years.push('Autre');
  return years;
}
