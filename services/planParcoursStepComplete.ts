import { postPlanReussiteStep } from '@/services/planReussiteSteps';

const inFlight = new Set<string>();

/**
 * Marque une étape du parcours côté API ; le backend crée la notification in-app + push.
 * Idempotent par clé d’étape pendant la session (évite les doublons au focus).
 */
export async function completePlanParcoursStep(accessToken: string, step: string): Promise<boolean> {
  const key = `${accessToken.slice(0, 8)}:${step}`;
  if (inFlight.has(key)) {
    return false;
  }
  inFlight.add(key);
  try {
    await postPlanReussiteStep(accessToken, step);
    return true;
  } catch {
    return false;
  } finally {
    inFlight.delete(key);
  }
}
