/** Segments numériques (montants, tailles, fourchettes) à garder en ordre LTR dans une UI RTL. */
const LTR_DIGIT_RUN =
  /(?:≥|≤)?\s*\d[\d\s.,]*(?:\s*[—–-]\s*(?:≥|≤)?\s*\d[\d\s.,]*)?/g;

const LRI = '\u2066';
const PDI = '\u2069';
const RLM = '\u200F';

/** Segments latins / alphanum (sigle école…) isolés en LTR dans un paragraphe RTL. */
function preserveLtrLatinRuns(text: string): string {
  return text.replace(/[A-Za-z][A-Za-z0-9+\-_.]*/g, (m) => `${LRI}${m}${PDI}`);
}

/** Chiffres occidentaux (1., 10., …) isolés sans conversion — le reste du titre reste RTL. */
function isolateWesternDigitRuns(text: string): string {
  return text.replace(/\d[\d.,]*/g, (m) => `${LRI}${m}${PDI}`);
}

/**
 * Force le sens RTL des libellés arabe en conservant les chiffres FR (1, 2, 3…).
 * Le marqueur RLM + isolation LRI des chiffres/latin empêche le préfixe « 1. »
 * de basculer tout le titre en LTR.
 */
export function formatArabicParagraph(text: string): string {
  const trimmed = text.trim();
  const withDigits = isolateWesternDigitRuns(trimmed);
  return `${RLM}${preserveLtrLatinRuns(withDigits)}`;
}

/** Évite l’inversion « 4 000 » → « 000 4 » quand le conteneur parent est en `direction: 'rtl'`. */
export function preserveLtrDigitsInRtlLabel(text: string, rtl?: boolean): string {
  if (!rtl || !/\d/.test(text)) return text;
  return text.replace(LTR_DIGIT_RUN, (m) => `${LRI}${m.trim()}${PDI}`);
}

export function labelContainsDigits(text: string): boolean {
  return /\d/.test(text);
}
