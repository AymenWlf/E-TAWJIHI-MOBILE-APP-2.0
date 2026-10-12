import {
  PLAN_PARCOURS_STEP_IDS,
  type PlanParcoursStepId,
} from '@/constants/orientationParcours';

/** Seule la gestion des inscriptions reste réservée aux clients TAWJIH PLUS (ou pack TASSJIL). */
export const TAWJIH_PLUS_GATED_PLAN_STEP_IDS: readonly PlanParcoursStepId[] = [
  PLAN_PARCOURS_STEP_IDS.applyToSchools,
] as const;

const GATED_SET = new Set<string>(TAWJIH_PLUS_GATED_PLAN_STEP_IDS);

export function isPlanStepTawjihPlusGated(stepId: string): stepId is PlanParcoursStepId {
  return GATED_SET.has(stepId);
}

/** Gestion des inscriptions : réservée aux clients. */
export const PRACTICAL_LINK_IDS_REQUIRING_TAWJIH_PLUS = [
  'inscriptions',
  'candidatures',
] as const;

export type TawjihPlusPracticalLinkId = (typeof PRACTICAL_LINK_IDS_REQUIRING_TAWJIH_PLUS)[number];

const PRACTICAL_GATED_SET = new Set<string>(PRACTICAL_LINK_IDS_REQUIRING_TAWJIH_PLUS);

export function isPracticalLinkTawjihPlusGated(linkId: string): linkId is TawjihPlusPracticalLinkId {
  return PRACTICAL_GATED_SET.has(linkId);
}
