const ACCREDITE_PAR_ETAT = /^accredit[eé]\s+par\s+l['']?état$/i;
const RECONNU_PAR_ETAT = /^reconnu[e]?\s+par\s+l['']?état$/i;

export function formatProgrammeReconnaissanceLabel(
  raw: string | null | undefined,
  locale: 'fr' | 'ar' = 'fr',
): string {
  const value = String(raw ?? '').trim();
  if (!value) return '';
  if (ACCREDITE_PAR_ETAT.test(value) || RECONNU_PAR_ETAT.test(value)) {
    return locale === 'ar' ? 'معترف بها من طرف الدولة' : "Reconnu par l'État";
  }
  return value;
}
