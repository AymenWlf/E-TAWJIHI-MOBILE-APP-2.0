/** Types d’annonces dont l’identité fiche = titre FR/AR (+ logo optionnel), pas le nom d’établissement. */
const TITLE_FIRST_ANNOUNCEMENT_TYPES = new Set([
  'Message important',
  'Bourse maroc',
  'Bourse etrangere',
  "Opportunité à l'étranger",
]);

export function isTitleFirstContestAnnouncementType(type: string | null | undefined): boolean {
  const t = (type ?? '').trim();
  if (!t) return false;
  if (TITLE_FIRST_ANNOUNCEMENT_TYPES.has(t)) return true;
  const lower = t.toLowerCase();
  return (
    lower === 'message important' ||
    lower.startsWith('bourse ') ||
    lower.startsWith('opportunité') ||
    lower.startsWith('opportunite')
  );
}
