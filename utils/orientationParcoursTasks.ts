import type { OrientationParcoursTask } from '@/constants/orientationParcours';
import {
  isPlanStepComplete,
  PLAN_PARCOURS_STEPS,
  resolvePlanParcoursState,
  type PlanParcoursCompletion,
} from '@/constants/orientationParcours';
import type { HomeCopyKey } from '@/constants/i18n';

export type BuildHomePlanParcoursInput = {
  completion: PlanParcoursCompletion;
};

export type HomePlanParcoursData = {
  totalPercent: number;
  remainingTasks: OrientationParcoursTask[];
  completion: PlanParcoursCompletion;
};

/** Données parcours pour la carte accueil (6 étapes du plan). */
export function buildHomePlanParcoursData(
  input: BuildHomePlanParcoursInput,
  t?: (key: HomeCopyKey) => string,
): HomePlanParcoursData {
  const remainingTasks: OrientationParcoursTask[] = [];

  for (const def of PLAN_PARCOURS_STEPS) {
    if (!isPlanStepComplete(def.id, input.completion)) {
      remainingTasks.push({
        id: def.id,
        stepKey: def.stepKey,
        icon: def.icon,
        title: t ? t(def.labelKey) : def.stepKey,
      });
    }
  }

  const state = resolvePlanParcoursState(input.completion, remainingTasks);

  return {
    totalPercent: state.percent,
    remainingTasks,
    completion: input.completion,
  };
}

/** @deprecated Utiliser `buildHomePlanParcoursData`. */
export function buildHomeOrientationParcoursData(
  input: { accountSetupComplete: boolean; testPercent: number },
  t?: (key: HomeCopyKey) => string,
): HomePlanParcoursData {
  const completion: PlanParcoursCompletion = {
    accountSetupComplete: input.accountSetupComplete,
    orientationDiagnosticComplete: input.testPercent >= 100,
    recommendationComplete: false,
    recommendationFollowCount: 0,
    feedbackComplete: false,
    applyToSchoolsComplete: false,
    inviteFriendComplete: false,
    inviteFriendQualifiedCount: 0,
  };
  return buildHomePlanParcoursData({ completion }, t);
}
