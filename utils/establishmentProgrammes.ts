import type { EstablishmentProgramme, EstablishmentProgrammeSecteur } from '@/services/establishments';

export function formatProgrammeFeeLabel(
  raw: string | number | null | undefined,
  emptyLabel = '—',
): string {
  const cleaned = String(raw ?? '')
    .trim()
    .replace(/\s/g, '')
    .replace(',', '.');
  if (!cleaned) return emptyLabel;
  const n = parseFloat(cleaned);
  if (!Number.isFinite(n)) return emptyLabel;
  if (n <= 0) return 'Gratuit';
  return `${n.toLocaleString('fr-FR')} DH`;
}

export function programmeSecteursLabel(
  secteurs: EstablishmentProgrammeSecteur[] | null | undefined,
  rtl: boolean,
  emptyLabel: string,
): string {
  if (!Array.isArray(secteurs) || secteurs.length === 0) return emptyLabel;
  const labels = secteurs
    .map((s) => {
      if (rtl) {
        return String(s.titreAr ?? s.titre ?? '').trim();
      }
      return String(s.titre ?? s.titreAr ?? '').trim();
    })
    .filter(Boolean);
  return labels.length > 0 ? labels.join(' · ') : emptyLabel;
}

export function programmeDisplayName(programme: EstablishmentProgramme, rtl: boolean): string {
  if (rtl && programme.nomArabe?.trim()) return programme.nomArabe.trim();
  return programme.nom;
}
