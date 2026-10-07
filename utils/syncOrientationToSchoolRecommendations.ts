/**
 * Génère / récupère les recommandations écoles à partir du nouveau test d’orientation
 * (plus de questionnaire « diagnostic écoles » 7 étapes).
 */

import {
  persistOrientationDiagnosticPrototypeDraft,
  readOrientationDiagnosticPrototypeDraft,
} from '@/features/orientationDiagnostic/constants/orientationDiagnosticPrototypeStorage';
import type { DiagnosticAnswers } from '@/features/orientationDiagnostic/types/orientationDiagnosticPrototype';
import { listCities } from '@/services/referenceData';
import {
  submitSchoolRecommendationDiagnostic,
  type SchoolDiagnosticSubmitResult,
} from '@/services/schoolRecommendationDiagnostic';
import { mapOrientationAnswersToSchoolQuickForm } from '@/utils/mapOrientationAnswersToSchoolQuickForm';
import { enrichSchoolDiagnosticSubmitPayload } from '@/utils/schoolDiagnosticPayloadDisplayContext';
import { persistSchoolDiagnosticResult } from '@/utils/schoolDiagnosticStorage';

function isValidPublicCode(code: string | null | undefined): code is string {
  return typeof code === 'string' && /^[a-f0-9]{32}$/.test(code.trim().toLowerCase());
}

export type EnsureSchoolRecoFromOrientationAuth = {
  getValidAccessToken: () => Promise<string | null>;
  userId?: number | null;
  uiLocale?: 'fr' | 'ar';
};

/**
 * Soumet les réponses d’orientation à l’API recommandations écoles.
 * Retourne le résultat serveur, ou `null` si impossible.
 */
export async function submitOrientationAnswersAsSchoolRecommendations(
  answers: DiagnosticAnswers,
  auth: EnsureSchoolRecoFromOrientationAuth,
): Promise<SchoolDiagnosticSubmitResult | null> {
  const token = await auth.getValidAccessToken();
  if (!token) return null;

  const cities = await listCities(8000).catch(() => []);
  const form = mapOrientationAnswersToSchoolQuickForm(answers, { cities });
  const payload = enrichSchoolDiagnosticSubmitPayload(
    form,
    auth.uiLocale === 'ar' ? 'ar' : 'fr',
    cities,
    [],
  );

  const result = await submitSchoolRecommendationDiagnostic(payload, token);
  if (!isValidPublicCode(result.publicCode)) return null;

  await persistSchoolDiagnosticResult(result.id, result.publicCode, auth.userId ?? null);
  return result;
}

/**
 * Si le test d’orientation est terminé (rapport) et qu’aucun diagnostic écoles
 * n’existe encore côté compte, le crée à partir des réponses d’orientation.
 */
export async function ensureSchoolRecommendationsFromOrientation(
  auth: EnsureSchoolRecoFromOrientationAuth,
): Promise<string | null> {
  const draft = await readOrientationDiagnosticPrototypeDraft(auth.userId ?? null);
  if (!draft?.answers || draft.phase !== 'report' || !draft.report) {
    return null;
  }

  const cached = draft.schoolRecoPublicCode?.trim().toLowerCase() ?? '';
  if (isValidPublicCode(cached)) {
    return cached;
  }

  try {
    const result = await submitOrientationAnswersAsSchoolRecommendations(draft.answers, auth);
    if (!result || !isValidPublicCode(result.publicCode)) return null;

    const code = result.publicCode.trim().toLowerCase();
    await persistOrientationDiagnosticPrototypeDraft({
      ...draft,
      userId: auth.userId ?? draft.userId,
      schoolRecoPublicCode: code,
    });
    return code;
  } catch {
    return null;
  }
}
