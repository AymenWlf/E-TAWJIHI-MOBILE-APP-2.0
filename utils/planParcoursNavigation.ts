import { router } from 'expo-router';

import { PLAN_PARCOURS_STEP_IDS, type PlanParcoursStepId } from '@/constants/orientationParcours';
import { triggerAppFeedback } from '@/contexts/AppFeedbackContext';
import { openApplyToSchoolsTour } from '@/utils/applyToSchoolsTourNavigation';
import { navigateToSchoolDiagnosticEntry } from '@/utils/navigateToSchoolDiagnosticEntry';
import {
  guardTawjihPlusParcoursStep,
  type TawjihPlusParcoursGate,
} from '@/utils/tawjihPlusParcoursGate';

export type PlanParcoursNavigationAuth = {
  getValidAccessToken: () => Promise<string | null>;
  userId?: number | null;
  uiLocale?: 'fr' | 'ar';
};

/** Navigation vers l’écran / action de l’étape courante du parcours. */
export function navigatePlanParcoursStep(
  stepKey: PlanParcoursStepId | string,
  auth?: PlanParcoursNavigationAuth,
  tawjihPlusGate?: TawjihPlusParcoursGate,
): void {
  guardTawjihPlusParcoursStep(stepKey, tawjihPlusGate, () => {
    navigatePlanParcoursStepUnlocked(stepKey, auth, tawjihPlusGate);
  });
}

function navigatePlanParcoursStepUnlocked(
  stepKey: PlanParcoursStepId | string,
  auth?: PlanParcoursNavigationAuth,
  tawjihPlusGate?: TawjihPlusParcoursGate,
): void {
  switch (stepKey) {
    case PLAN_PARCOURS_STEP_IDS.accountSetup:
      router.push('/account-setup' as never);
      return;
    case PLAN_PARCOURS_STEP_IDS.orientationDiagnostic:
    case PLAN_PARCOURS_STEP_IDS.recommendation:
      void navigateToSchoolDiagnosticEntry(
        auth,
        (href) => {
          router.push(href as never);
        },
        tawjihPlusGate,
      );
      return;
    case PLAN_PARCOURS_STEP_IDS.feedback:
      triggerAppFeedback({ markParcoursStep: true });
      return;
    case PLAN_PARCOURS_STEP_IDS.applyToSchools:
      openApplyToSchoolsTour(tawjihPlusGate);
      return;
    case PLAN_PARCOURS_STEP_IDS.inviteFriend:
      router.push('/compte/fidelite' as never);
      return;
    default:
      return;
  }
}
