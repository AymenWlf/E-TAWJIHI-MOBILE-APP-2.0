import type { HomeCopyKey } from '@/constants/i18n';
import {
  PLAN_PARCOURS_STEP_IDS,
  isPlanStepComplete,
  type PlanParcoursCompletion,
} from '@/constants/orientationParcours';

export type OrientationPracticalLinkId = 'diagnostic-ecoles' | 'diagnostic-recommandations';

export const ORIENTATION_PRACTICAL_LINK_IDS: OrientationPracticalLinkId[] = [
  'diagnostic-ecoles',
  'diagnostic-recommandations',
];

export type PracticalLinkLockState = {
  locked: boolean;
  reasonKey?: HomeCopyKey;
  done?: boolean;
};

export function getOrientationPracticalLinkLock(
  linkId: OrientationPracticalLinkId,
  completion: PlanParcoursCompletion,
  options?: {
    loading?: boolean;
    tawjihPlusLoading?: boolean;
    hasTawjihPlusAccess?: boolean;
  },
): PracticalLinkLockState {
  if (options?.loading || options?.tawjihPlusLoading) {
    return { locked: true, reasonKey: 'practical_orientation_loading' };
  }

  if (options?.hasTawjihPlusAccess === false) {
    return { locked: true, reasonKey: 'inscTawjihPlusLockHint' };
  }

  const accountDone = completion.accountSetupComplete;

  if (linkId === 'diagnostic-ecoles') {
    if (!accountDone) {
      return { locked: true, reasonKey: 'practical_diagnostic_locked_account' };
    }
    return {
      locked: false,
      done: isPlanStepComplete(PLAN_PARCOURS_STEP_IDS.orientationDiagnostic, completion),
    };
  }

  if (linkId === 'diagnostic-recommandations') {
    if (!accountDone) {
      return { locked: true, reasonKey: 'practical_recommandations_locked_account' };
    }
    if (!isPlanStepComplete(PLAN_PARCOURS_STEP_IDS.orientationDiagnostic, completion)) {
      return { locked: true, reasonKey: 'practical_recommandations_locked_diagnostic' };
    }
    return {
      locked: false,
      done: isPlanStepComplete(PLAN_PARCOURS_STEP_IDS.recommendation, completion),
    };
  }

  return { locked: false };
}

export function isOrientationPracticalLinkId(id: string): id is OrientationPracticalLinkId {
  return ORIENTATION_PRACTICAL_LINK_IDS.includes(id as OrientationPracticalLinkId);
}
