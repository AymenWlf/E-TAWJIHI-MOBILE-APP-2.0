/** Plans d’école pour l’orientation (aligné web — logique seule). */
export type EstablishmentOrientationPlan = 'A' | 'B' | 'C' | 'D';

export const ESTABLISHMENT_ORIENTATION_PLANS: {
  id: EstablishmentOrientationPlan;
  short: string;
  label: string;
  full: string;
}[] = [
  { id: 'A', short: 'PLAN A', label: 'Ambitieux', full: 'PLAN A — Ambitieux' },
  { id: 'B', short: 'PLAN B', label: 'Accessible', full: 'PLAN B — Accessible' },
  { id: 'C', short: 'PLAN C', label: 'Sécurité', full: 'PLAN C — Sécurité' },
  { id: 'D', short: 'PLAN D', label: 'Spécialisé', full: 'PLAN D — Spécialisé' },
];

export function normalizeOrientationPlan(
  value?: string | null,
): EstablishmentOrientationPlan | null {
  if (!value) return null;
  const p = String(value).trim().toUpperCase();
  if (p === 'A' || p === 'B' || p === 'C' || p === 'D') return p;
  return null;
}

export function orientationPlanLabel(value?: string | null): string {
  const p = normalizeOrientationPlan(value);
  if (!p) return 'Sans plan';
  return ESTABLISHMENT_ORIENTATION_PLANS.find((x) => x.id === p)?.full || `PLAN ${p}`;
}

/** A → B → C → D → sans plan */
export function orientationPlanSortRank(value?: string | null): number {
  const p = normalizeOrientationPlan(value);
  if (!p) return 99;
  return ESTABLISHMENT_ORIENTATION_PLANS.findIndex((x) => x.id === p);
}
