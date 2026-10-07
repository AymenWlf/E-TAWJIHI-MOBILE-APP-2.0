/** Bascule une sélection multi avec plafond (secteurs, métiers, écoles…). */
export function toggleMultiMax(current: string[], id: string, max: number): string[] {
  if (current.includes(id)) {
    return current.filter((x) => x !== id);
  }
  if (current.length >= max) return current;
  return [...current, id];
}
