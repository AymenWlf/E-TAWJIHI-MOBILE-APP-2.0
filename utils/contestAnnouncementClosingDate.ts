/** Date effective pour tri / filtre « fin d'inscription » : dateFin si renseignée, sinon dateDebut. */
export function effectiveContestClosingDateIso(
  dateDebut: string | null | undefined,
  dateFin: string | null | undefined,
): string {
  const fin = String(dateFin ?? '').trim().slice(0, 10);
  if (fin) return fin;
  return String(dateDebut ?? '').trim().slice(0, 10);
}

export function computeDaysUntilContestClose(
  dateDebut: string | null | undefined,
  dateFin: string | null | undefined,
): number | null {
  const iso = effectiveContestClosingDateIso(dateDebut, dateFin);
  if (!iso) return null;
  const end = new Date(iso);
  if (Number.isNaN(end.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / 86_400_000);
}
