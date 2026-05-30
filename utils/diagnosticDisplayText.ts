import { preserveLtrDigitsInRtlLabel } from '@/utils/bidiText';

const LRI = '\u2066';
const PDI = '\u2069';

function isMostlyArabic(text: string): boolean {
  const ar = (text.match(/[\u0600-\u06FF]/g) ?? []).length;
  const lat = (text.match(/[A-Za-z]/g) ?? []).length;
  return ar > 0 && ar >= lat;
}

function rtlEmbedLatin(text: string, rtl: boolean): string {
  if (!rtl || !text || isMostlyArabic(text)) return text;
  return `${LRI}${text}${PDI}`;
}

/** Pourcentage lisible en RTL (chiffres LTR + police système via `latinDigits` sur Text). */
export function formatDiagnosticPercent(value: number, rtl?: boolean): string {
  const n = Math.round(value);
  const core = `${n}%`;
  return rtl ? `${LRI}${core}${PDI}` : core;
}

export type EstablishmentNameParts = {
  nom: string;
  sigle?: string | null;
  nomArabe?: string | null;
};

/** Nom affiché pour une ligne recommandation (arabe si disponible en RTL). */
export function establishmentRecommendationTitle(
  row: EstablishmentNameParts,
  rtl: boolean,
): string {
  const name =
    rtl && row.nomArabe?.trim() ? row.nomArabe.trim() : row.nom?.trim() ?? '';
  const sigle = row.sigle?.trim();
  if (!sigle) return preserveLtrDigitsInRtlLabel(rtlEmbedLatin(name, rtl), rtl);
  if (!rtl) return `${sigle} — ${name}`;
  const namePart = preserveLtrDigitsInRtlLabel(rtlEmbedLatin(name, rtl), rtl);
  return `${namePart} — ${LRI}${sigle}${PDI}`;
}

/** Indique si le libellé contient des chiffres (pour prop `latinDigits` sur Text). */
export function diagnosticLabelHasLatinDigits(text: string): boolean {
  return /\d/.test(text);
}
