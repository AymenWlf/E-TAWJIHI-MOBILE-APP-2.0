import { RECOMMENDATION_FOLLOW_MIN_COUNT } from '@/constants/recommendationParcours';
import { postPlanReussiteStep } from '@/services/planReussiteSteps';

/** Marque l’étape parcours si l’utilisateur suit assez d’écoles. */
export async function tryCompleteRecommendationParcoursStep(
  accessToken: string | null,
  followCount: number,
): Promise<void> {
  if (!accessToken || followCount < RECOMMENDATION_FOLLOW_MIN_COUNT) {
    return;
  }
  await postPlanReussiteStep(accessToken, 'recommendation').catch(() => undefined);
}
