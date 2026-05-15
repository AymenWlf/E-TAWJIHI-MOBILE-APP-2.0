/**
 * Aligné sur la logique du compte (`account-setup`) : champs bac affichés
 * pour les niveaux contenant « bac » / « Bac » / « Baccalauréat », hors « BAC+n ».
 */
export function isBacStudyProfileLevel(niveau: string): boolean {
  const n = niveau.trim();
  if (!n) return false;
  if (/^BAC\+\s*\d/i.test(n)) return false;
  return n.includes('bac') || n.includes('Bac') || n.includes('Baccalauréat');
}
