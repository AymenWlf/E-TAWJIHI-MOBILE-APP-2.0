import { buildApiUrl } from '@/constants/api';
import {
  EMPTY_PLAN_PARCOURS_COMPLETION,
  PLAN_PARCOURS_MOBILE_STEP_KEYS,
  type PlanParcoursCompletion,
} from '@/constants/orientationParcours';
import { RECOMMENDATION_FOLLOW_MIN_COUNT } from '@/constants/recommendationParcours';
import { INVITE_FRIEND_QUALIFIED_MIN_COUNT } from '@/constants/inviteFriendParcours';
import { fetchEstablishmentFollows } from '@/services/establishmentFollows';
import { httpGetJson } from '@/services/http';
import { fetchUserReferralProgram } from '@/services/userReferral';

type PlanReussiteStepsResponse = {
  success?: boolean;
  data?: {
    planReussiteSteps?: Record<string, boolean | string | number>;
  };
};

const stepBool = (steps: Record<string, boolean | string | number>, key: string) =>
  steps[key] === true;

/**
 * Progression du parcours mobile (6 étapes).
 * Clés dédiées mobile dans `planReussiteSteps` — pas de mélange avec le plan web.
 */
export async function fetchPlanParcoursCompletion(
  accessToken: string | null,
  accountSetupComplete: boolean,
): Promise<PlanParcoursCompletion> {
  const completion: PlanParcoursCompletion = {
    ...EMPTY_PLAN_PARCOURS_COMPLETION,
    accountSetupComplete: Boolean(accountSetupComplete),
  };

  if (!accessToken) {
    return completion;
  }

  const [planRes, followsRes, referralProgram] = await Promise.all([
    httpGetJson<PlanReussiteStepsResponse>(buildApiUrl('/api/user/plan-reussite/steps'), {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => null),
    fetchEstablishmentFollows(accessToken).catch(() => ({ items: [] })),
    fetchUserReferralProgram(accessToken).catch(() => null),
  ]);

  const steps = planRes?.data?.planReussiteSteps ?? {};
  const followCount = followsRes.items.length;
  const recommendationStepMarked =
    stepBool(steps, PLAN_PARCOURS_MOBILE_STEP_KEYS.recommendation) ||
    stepBool(steps, 'schoolSelection');

  const inviteFriendQualifiedCount = referralProgram?.tierProgress?.qualifiedAffiliateCount ?? 0;
  const inviteFriendComplete = inviteFriendQualifiedCount >= INVITE_FRIEND_QUALIFIED_MIN_COUNT;

  return {
    accountSetupComplete: Boolean(accountSetupComplete),
    orientationDiagnosticComplete:
      stepBool(steps, PLAN_PARCOURS_MOBILE_STEP_KEYS.orientationDiagnostic) ||
      stepBool(steps, 'quickDiagnosticCompleted'),
    recommendationComplete:
      recommendationStepMarked && followCount >= RECOMMENDATION_FOLLOW_MIN_COUNT,
    recommendationFollowCount: followCount,
    feedbackComplete: stepBool(steps, PLAN_PARCOURS_MOBILE_STEP_KEYS.feedback),
    applyToSchoolsComplete: stepBool(steps, PLAN_PARCOURS_MOBILE_STEP_KEYS.applyToSchools),
    inviteFriendComplete,
    inviteFriendQualifiedCount,
  };
}
