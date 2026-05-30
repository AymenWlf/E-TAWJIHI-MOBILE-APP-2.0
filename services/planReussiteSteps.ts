import { buildApiUrl } from '@/constants/api';
import type { PlanParcoursStepId } from '@/constants/orientationParcours';
import { getPlanParcoursDevResetPayload } from '@/constants/orientationParcours';
import { emitNotificationsRefresh } from '@/services/notifications';
import { httpPostJson } from '@/services/http';

type PlanStepResponse = {
  success?: boolean;
  message?: string;
  data?: {
    planReussiteSteps?: Record<string, boolean>;
    is_setup?: boolean;
  };
};

/** Marque une étape du plan (mobile ou web) dans `planReussiteSteps`. */
export async function postPlanReussiteStep(accessToken: string, step: string): Promise<void> {
  const res = await httpPostJson<PlanStepResponse, { step: string }>(
    buildApiUrl('/api/user/plan-reussite/steps'),
    { step },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (res.success === false) {
    throw new Error(res.message ?? 'Étape plan non enregistrée');
  }
  emitNotificationsRefresh({ force: true });
}

/** Dev uniquement (`APP_ENV=dev`) : remet une étape du parcours mobile à non franchi. */
export async function resetPlanParcoursStepDev(
  accessToken: string,
  stepId: PlanParcoursStepId,
): Promise<PlanStepResponse['data']> {
  const res = await httpPostJson<
    PlanStepResponse,
    { stepId: PlanParcoursStepId; resetAccountSetup: boolean; planStepKeys: string[] }
  >(
    buildApiUrl('/api/user/plan-reussite/steps/dev/reset'),
    { stepId, ...getPlanParcoursDevResetPayload(stepId) },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (res.success === false) {
    throw new Error(res.message ?? 'Réinitialisation étape impossible');
  }
  return res.data;
}
