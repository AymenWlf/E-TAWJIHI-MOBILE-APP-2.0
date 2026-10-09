import { buildApiUrl } from '@/constants/api';
import {
  EMPTY_PLAN_PARCOURS_COMPLETION,
  PLAN_PARCOURS_MOBILE_STEP_KEYS,
  type PlanParcoursCompletion,
} from '@/constants/orientationParcours';
import { RECOMMENDATION_FOLLOW_MIN_COUNT } from '@/constants/recommendationParcours';
import { INVITE_FRIEND_QUALIFIED_MIN_COUNT } from '@/constants/inviteFriendParcours';
import { fetchEstablishmentFollowCount } from '@/services/establishmentFollows';
import { httpGetJson } from '@/services/http';
import { fetchReferralQualifiedCount } from '@/services/userReferral';

type PlanReussiteStepsResponse = {
  success?: boolean;
  data?: {
    planReussiteSteps?: Record<string, boolean | string | number>;
  };
};

const stepBool = (steps: Record<string, boolean | string | number>, key: string) =>
  steps[key] === true;

/**
 * Progression du parcours mobile (7 étapes).
 * Clés dédiées mobile dans `planReussiteSteps` — pas de mélange avec le plan web.
 */
function completionFromSteps(
  accountSetupComplete: boolean,
  steps: Record<string, boolean | string | number>,
  followCount: number,
  inviteFriendQualifiedCount: number,
): PlanParcoursCompletion {
  const recommendationStepMarked =
    stepBool(steps, PLAN_PARCOURS_MOBILE_STEP_KEYS.recommendation) ||
    stepBool(steps, 'schoolSelection');

  return {
    accountSetupComplete: Boolean(accountSetupComplete),
    orientationDiagnosticComplete: stepBool(
      steps,
      PLAN_PARCOURS_MOBILE_STEP_KEYS.orientationDiagnostic,
    ),
    orientationReportComplete: stepBool(
      steps,
      PLAN_PARCOURS_MOBILE_STEP_KEYS.orientationReport,
    ),
    recommendationComplete:
      recommendationStepMarked && followCount >= RECOMMENDATION_FOLLOW_MIN_COUNT,
    recommendationFollowCount: followCount,
    feedbackComplete: stepBool(steps, PLAN_PARCOURS_MOBILE_STEP_KEYS.feedback),
    applyToSchoolsComplete: stepBool(steps, PLAN_PARCOURS_MOBILE_STEP_KEYS.applyToSchools),
    inviteFriendComplete: inviteFriendQualifiedCount >= INVITE_FRIEND_QUALIFIED_MIN_COUNT,
    inviteFriendQualifiedCount,
  };
}

/**
 * Affiche le plan dès que les étapes sont lues, puis complète écoles suivies
 * et parrainages sans bloquer la section.
 */
export async function fetchPlanParcoursCompletion(
  accessToken: string | null,
  accountSetupComplete: boolean,
  onPartial?: (completion: PlanParcoursCompletion) => void,
  knownCounts?: { followCount: number; qualifiedCount: number },
): Promise<PlanParcoursCompletion> {
  const seedFollow = knownCounts?.followCount ?? 0;
  const seedQualified = knownCounts?.qualifiedCount ?? 0;
  const empty = completionFromSteps(accountSetupComplete, {}, seedFollow, seedQualified);
  if (!accessToken) {
    onPartial?.(empty);
    return empty;
  }

  const headers = { Authorization: `Bearer ${accessToken}` };
  const stepsPromise = httpGetJson<PlanReussiteStepsResponse>(
    buildApiUrl('/api/user/plan-reussite/steps'),
    { headers },
  ).catch(() => null);
  const followCountPromise = fetchEstablishmentFollowCount(accessToken).catch(() => seedFollow);
  const qualifiedCountPromise = fetchReferralQualifiedCount(accessToken).catch(() => seedQualified);

  const planRes = await stepsPromise;
  const steps = planRes?.data?.planReussiteSteps ?? {};
  const withSteps = completionFromSteps(accountSetupComplete, steps, seedFollow, seedQualified);
  onPartial?.(withSteps);

  const [followCount, inviteFriendQualifiedCount] = await Promise.all([
    followCountPromise,
    qualifiedCountPromise,
  ]);

  return completionFromSteps(accountSetupComplete, steps, followCount, inviteFriendQualifiedCount);
}
