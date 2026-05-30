import { router } from 'expo-router';

import {
  guardTawjihPlusParcoursStep,
  type TawjihPlusParcoursGate,
} from '@/utils/tawjihPlusParcoursGate';
import { PLAN_PARCOURS_STEP_IDS } from '@/constants/orientationParcours';

/** Ouvre le guide « Gestion des inscriptions » (page plein écran). */
export function openApplyToSchoolsTour(tawjihPlusGate?: TawjihPlusParcoursGate): void {
  guardTawjihPlusParcoursStep(PLAN_PARCOURS_STEP_IDS.applyToSchools, tawjihPlusGate, () => {
    router.push('/inscriptions/apply-tour' as never);
  });
}

/** Alias pour le parcours d’orientation et les CTA inscriptions. */
export function triggerApplyToSchoolsTour(tawjihPlusGate?: TawjihPlusParcoursGate): void {
  openApplyToSchoolsTour(tawjihPlusGate);
}
