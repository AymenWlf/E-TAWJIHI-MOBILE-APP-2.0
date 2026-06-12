import { router } from 'expo-router';

import { PLAN_PARCOURS_STEP_IDS, type PlanParcoursStepId } from '@/constants/orientationParcours';
import { triggerParcoursFeedback } from '@/contexts/ParcoursFeedbackContext';
import { openApplyToSchoolsTour } from '@/utils/applyToSchoolsTourNavigation';
import {
  navigateToSchoolDiagnosticEntry,
  navigateToSchoolDiagnosticWizard,
} from '@/utils/navigateToSchoolDiagnosticEntry';
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
      void navigateToSchoolDiagnosticWizard(
        auth,
        (href) => {
          router.push(href as never);
        },
        tawjihPlusGate,
      );
      return;
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
      triggerParcoursFeedback();
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
