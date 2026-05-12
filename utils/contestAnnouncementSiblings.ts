export type ContestSiblingBrief = {
  id: number;
  titreSpecial: string;
  titreSpecialAr?: string | null;
  typeAnnonce: string;
  dateDebut: string;
  dateFin: string;
  isOpen: boolean;
  isExpire: boolean;
  daysUntilClose?: number;
  ogImage?: string | null;
};

export function compareContestTimeline(
  a: { dateDebut: string; id: number },
  b: { dateDebut: string; id: number }
): number {
  if (a.dateDebut > b.dateDebut) return 1;
  if (a.dateDebut < b.dateDebut) return -1;
  return a.id - b.id;
}

export function splitSiblingsAroundCurrent(
  current: { id: number; dateOuverture: string },
  items: ContestSiblingBrief[]
): { newer: ContestSiblingBrief[]; older: ContestSiblingBrief[] } {
  const cur = { dateDebut: current.dateOuverture, id: current.id };
  const newer = items.filter(
    (it) => compareContestTimeline({ dateDebut: it.dateDebut, id: it.id }, cur) > 0
  );
  const older = items.filter(
    (it) => compareContestTimeline({ dateDebut: it.dateDebut, id: it.id }, cur) < 0
  );
  newer.sort((a, b) => compareContestTimeline(b, a));
  older.sort((a, b) => compareContestTimeline(b, a));
  return { newer, older };
}
