const ACCREDITE_PAR_ETAT = /^accredit[eé]\s+par\s+l['']?état$/i;
const RECONNU_PAR_ETAT = /^reconnu[e]?\s+par\s+l['']?état$/i;

export function formatProgrammeReconnaissanceLabel(raw: string | null | undefined): string {
  const value = String(raw ?? '').trim();
  if (!value) return '';
  if (ACCREDITE_PAR_ETAT.test(value) || RECONNU_PAR_ETAT.test(value)) {
    return "Reconnu par l'État";
  }
  return value;
}
