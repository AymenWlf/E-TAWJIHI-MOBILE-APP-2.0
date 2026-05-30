import type { ComponentProps } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { HomeCopyKey } from '@/constants/i18n';
import { isInviteFriendParcoursStepComplete } from '@/constants/inviteFriendParcours';
import {
  isRecommendationParcoursStepComplete,
  RECOMMENDATION_PARCOURS_STEP_ID,
} from '@/constants/recommendationParcours';

export type OrientationParcoursTask = {
  id: string;
  title: string;
  stepKey?: string;
  icon?: ComponentProps<typeof FontAwesome>['name'];
  done?: boolean;
};

export const PLAN_PARCOURS_STEP_IDS = {
  accountSetup: 'accountSetup',
  orientationDiagnostic: 'orientationDiagnostic',
  recommendation: 'recommendation',
  feedback: 'feedback',
  applyToSchools: 'applyToSchools',
  inviteFriend: 'inviteFriend',
} as const;

/** Clés JSON `planReussiteSteps` pour le parcours mobile (≠ plan web). */
export const PLAN_PARCOURS_MOBILE_STEP_KEYS = {
  orientationDiagnostic: 'orientationDiagnostic',
  recommendation: 'recommendation',
  feedback: 'feedback',
  applyToSchools: 'applyToSchools',
  inviteFriend: 'inviteFriend',
} as const;

export type PlanParcoursStepId = (typeof PLAN_PARCOURS_STEP_IDS)[keyof typeof PLAN_PARCOURS_STEP_IDS];

export type PlanParcoursCompletion = {
  accountSetupComplete: boolean;
  orientationDiagnosticComplete: boolean;
  recommendationComplete: boolean;
  /** Nombre d’écoles suivies (API establishment-follows). */
  recommendationFollowCount: number;
  feedbackComplete: boolean;
  applyToSchoolsComplete: boolean;
  /** @deprecated Préférer `inviteFriendQualifiedCount` — dérivé des parrainés qualifiés. */
  inviteFriendComplete: boolean;
  /** Parrainés ayant finalisé une commande éligible (programme parrainage). */
  inviteFriendQualifiedCount: number;
};

export const EMPTY_PLAN_PARCOURS_COMPLETION: PlanParcoursCompletion = {
  accountSetupComplete: false,
  orientationDiagnosticComplete: false,
  recommendationComplete: false,
  recommendationFollowCount: 0,
  feedbackComplete: false,
  applyToSchoolsComplete: false,
  inviteFriendComplete: false,
  inviteFriendQualifiedCount: 0,
};

export type PlanParcoursStepDef = {
  id: PlanParcoursStepId;
  stepKey: PlanParcoursStepId;
  labelKey: HomeCopyKey;
  shortLabelKey: HomeCopyKey;
  /** Indication affichée sur l’étape courante (ex. condition de suivi). */
  hintKey?: HomeCopyKey;
  icon: ComponentProps<typeof FontAwesome>['name'];
};

export const PLAN_PARCOURS_STEPS: readonly PlanParcoursStepDef[] = [
  {
    id: PLAN_PARCOURS_STEP_IDS.accountSetup,
    stepKey: PLAN_PARCOURS_STEP_IDS.accountSetup,
    labelKey: 'orientationStepAccountSetup',
    shortLabelKey: 'orientationStepAccountSetupShort',
    icon: 'id-card-o',
  },
  {
    id: PLAN_PARCOURS_STEP_IDS.orientationDiagnostic,
    stepKey: PLAN_PARCOURS_STEP_IDS.orientationDiagnostic,
    labelKey: 'orientationStepOrientationDiagnostic',
    shortLabelKey: 'orientationStepOrientationDiagnosticShort',
    icon: 'compass',
  },
  {
    id: PLAN_PARCOURS_STEP_IDS.recommendation,
    stepKey: PLAN_PARCOURS_STEP_IDS.recommendation,
    labelKey: 'orientationStepRecommendation',
    shortLabelKey: 'orientationStepRecommendationShort',
    hintKey: 'orientationStepRecommendationHint',
    icon: 'star-o',
  },
  {
    id: PLAN_PARCOURS_STEP_IDS.feedback,
    stepKey: PLAN_PARCOURS_STEP_IDS.feedback,
    labelKey: 'orientationStepFeedback',
    shortLabelKey: 'orientationStepFeedbackShort',
    icon: 'comment-o',
  },
  {
    id: PLAN_PARCOURS_STEP_IDS.applyToSchools,
    stepKey: PLAN_PARCOURS_STEP_IDS.applyToSchools,
    labelKey: 'orientationStepApplyToSchools',
    shortLabelKey: 'orientationStepApplyToSchoolsShort',
    icon: 'paper-plane-o',
  },
  {
    id: PLAN_PARCOURS_STEP_IDS.inviteFriend,
    stepKey: PLAN_PARCOURS_STEP_IDS.inviteFriend,
    labelKey: 'orientationStepInviteFriend',
    shortLabelKey: 'orientationStepInviteFriendShort',
    icon: 'user-plus',
  },
] as const;

/** Nombre d’étapes du parcours / plan affiché sur la carte accueil. */
export const PLAN_PARCOURS_STEP_COUNT = PLAN_PARCOURS_STEPS.length;

/** @deprecated Utiliser `PLAN_PARCOURS_STEPS`. */
export const ORIENTATION_PARCOURS_STEPS = PLAN_PARCOURS_STEPS;
export const ORIENTATION_PARCOURS_STEP_COUNT = PLAN_PARCOURS_STEP_COUNT;
export const ORIENTATION_PARCOURS_ACCOUNT_SETUP_ID = PLAN_PARCOURS_STEP_IDS.accountSetup;

/** Nombre d’étapes franchies (booléens à 1). */
export function countCompletedPlanSteps(completion: PlanParcoursCompletion): number {
  return PLAN_PARCOURS_STEPS.filter((s) => isPlanStepComplete(s.id, completion)).length;
}

/** Étapes franchies, dans l’ordre du plan (affichage carte / modal). */
export function getFranchisedPlanSteps(completion: PlanParcoursCompletion): PlanParcoursStepDef[] {
  return PLAN_PARCOURS_STEPS.filter((s) => isPlanStepComplete(s.id, completion));
}

/** Prochaine étape non franchie, ou `null` si le plan est terminé. */
export function getNextPlanStep(completion: PlanParcoursCompletion): PlanParcoursStepDef | null {
  return PLAN_PARCOURS_STEPS.find((s) => !isPlanStepComplete(s.id, completion)) ?? null;
}

/** Étape accessible dans le parcours : déjà franchie ou prochaine étape à réaliser. */
export function isPlanStepUnlocked(
  stepId: PlanParcoursStepId,
  completion: PlanParcoursCompletion | null | undefined,
): boolean {
  const safe = completion ?? EMPTY_PLAN_PARCOURS_COMPLETION;
  if (isPlanStepComplete(stepId, safe)) return true;
  const next = getNextPlanStep(safe);
  return next?.id === stepId;
}

export function isPlanStepComplete(
  stepId: PlanParcoursStepId,
  completion: PlanParcoursCompletion | null | undefined,
): boolean {
  if (!completion) return false;
  switch (stepId) {
    case PLAN_PARCOURS_STEP_IDS.accountSetup:
      return completion.accountSetupComplete;
    case PLAN_PARCOURS_STEP_IDS.orientationDiagnostic:
      return completion.orientationDiagnosticComplete;
    case RECOMMENDATION_PARCOURS_STEP_ID:
      return isRecommendationParcoursStepComplete(completion);
    case PLAN_PARCOURS_STEP_IDS.feedback:
      return completion.feedbackComplete;
    case PLAN_PARCOURS_STEP_IDS.applyToSchools:
      return completion.applyToSchoolsComplete;
    case PLAN_PARCOURS_STEP_IDS.inviteFriend:
      return isInviteFriendParcoursStepComplete(completion);
    default:
      return false;
  }
}

export type OrientationParcoursUiState = {
  steps: PlanParcoursStepDef[];
  franchisedSteps: PlanParcoursStepDef[];
  completedCount: number;
  currentIndex: number;
  percent: number;
  allDone: boolean;
  currentStepKey: PlanParcoursStepId;
  completion: PlanParcoursCompletion;
};

export function resolvePlanParcoursState(
  completion: PlanParcoursCompletion | null | undefined,
  _tasks?: OrientationParcoursTask[],
): OrientationParcoursUiState {
  const safeCompletion = completion ?? EMPTY_PLAN_PARCOURS_COMPLETION;
  const franchisedSteps = getFranchisedPlanSteps(safeCompletion);
  const completedCount = franchisedSteps.length;
  const allDone = completedCount >= PLAN_PARCOURS_STEP_COUNT;
  const nextStep = getNextPlanStep(safeCompletion);
  const currentIndex = nextStep
    ? PLAN_PARCOURS_STEPS.findIndex((s) => s.id === nextStep.id)
    : PLAN_PARCOURS_STEP_COUNT - 1;
  const currentStep = nextStep ?? PLAN_PARCOURS_STEPS[PLAN_PARCOURS_STEP_COUNT - 1]!;

  return {
    steps: PLAN_PARCOURS_STEPS as unknown as PlanParcoursStepDef[],
    franchisedSteps,
    completedCount,
    currentIndex: Math.max(0, currentIndex),
    percent: Math.round((completedCount / PLAN_PARCOURS_STEP_COUNT) * 100),
    allDone,
    currentStepKey: currentStep.stepKey,
    completion: safeCompletion,
  };
}

/** @deprecated Utiliser `resolvePlanParcoursState`. */
export function resolveOrientationParcoursState(
  _legacyTestPercent: number,
  tasks?: OrientationParcoursTask[],
  options?: { accountSetupComplete?: boolean },
): OrientationParcoursUiState {
  const completion: PlanParcoursCompletion = {
    ...EMPTY_PLAN_PARCOURS_COMPLETION,
    accountSetupComplete: options?.accountSetupComplete === true,
  };
  return resolvePlanParcoursState(completion, tasks);
}

export function isAccountSetupStep(stepKey?: string | null): boolean {
  return stepKey === PLAN_PARCOURS_STEP_IDS.accountSetup;
}

/** Clés `planReussiteSteps` / profil à effacer en dev pour réinitialiser une étape mobile. */
export function getPlanParcoursDevResetPayload(stepId: PlanParcoursStepId): {
  resetAccountSetup: boolean;
  planStepKeys: string[];
} {
  switch (stepId) {
    case PLAN_PARCOURS_STEP_IDS.accountSetup:
      return { resetAccountSetup: true, planStepKeys: [] };
    case PLAN_PARCOURS_STEP_IDS.orientationDiagnostic:
      return {
        resetAccountSetup: false,
        planStepKeys: [
          PLAN_PARCOURS_MOBILE_STEP_KEYS.orientationDiagnostic,
          'quickDiagnosticCompleted',
        ],
      };
    case RECOMMENDATION_PARCOURS_STEP_ID:
      return {
        resetAccountSetup: false,
        planStepKeys: [PLAN_PARCOURS_MOBILE_STEP_KEYS.recommendation, 'schoolSelection'],
      };
    case PLAN_PARCOURS_STEP_IDS.feedback:
      return { resetAccountSetup: false, planStepKeys: [PLAN_PARCOURS_MOBILE_STEP_KEYS.feedback] };
    case PLAN_PARCOURS_STEP_IDS.applyToSchools:
      return { resetAccountSetup: false, planStepKeys: [PLAN_PARCOURS_MOBILE_STEP_KEYS.applyToSchools] };
    case PLAN_PARCOURS_STEP_IDS.inviteFriend:
      return { resetAccountSetup: false, planStepKeys: [PLAN_PARCOURS_MOBILE_STEP_KEYS.inviteFriend] };
    default:
      return { resetAccountSetup: false, planStepKeys: [] };
  }
}
