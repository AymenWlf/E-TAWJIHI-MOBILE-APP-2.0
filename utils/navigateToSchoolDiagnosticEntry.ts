import { router } from 'expo-router';

import { readOrientationDiagnosticPrototypeDraft } from '@/features/orientationDiagnostic/constants/orientationDiagnosticPrototypeStorage';
import { resolveUserDiagnosticPublicCode } from '@/utils/resolveSchoolDiagnosticNavigation';
import { ensureSchoolRecommendationsFromOrientation } from '@/utils/syncOrientationToSchoolRecommendations';
import type { PlanParcoursNavigationAuth } from '@/utils/planParcoursNavigation';
import {
  isTawjihPlusParcoursBlocked,
  promptTawjihPlusParcoursLock,
  type TawjihPlusParcoursGate,
} from '@/utils/tawjihPlusParcoursGate';

type NavigateFn = (href: string) => void;

function isValidPublicCode(code: string | null | undefined): code is string {
  return typeof code === 'string' && /^[a-f0-9]{32}$/.test(code.trim().toLowerCase());
}

/**
 * Priorité : code lié au rapport d’orientation courant → sync depuis le test →
 * diagnostic serveur existant (legacy).
 */
async function resolveSchoolRecoPublicCode(
  auth: PlanParcoursNavigationAuth | undefined,
): Promise<string | null> {
  if (!auth?.getValidAccessToken) return null;

  const draft = await readOrientationDiagnosticPrototypeDraft(auth.userId ?? null);
  const linked = draft?.schoolRecoPublicCode?.trim().toLowerCase() ?? '';
  if (draft?.phase === 'report' && draft.report && isValidPublicCode(linked)) {
    return linked;
  }

  if (draft?.phase === 'report' && draft.report) {
    const fromOrientation = await ensureSchoolRecommendationsFromOrientation({
      getValidAccessToken: auth.getValidAccessToken,
      userId: auth.userId ?? null,
      uiLocale: auth.uiLocale,
    });
    if (fromOrientation) return fromOrientation;
  }

  return resolveUserDiagnosticPublicCode(
    auth.getValidAccessToken,
    auth.userId ?? null,
    { uiLocale: auth.uiLocale },
  );
}

/**
 * @deprecated L’ancien questionnaire 7 étapes est retiré.
 * Redirige vers le test d’orientation (source des recommandations).
 */
export async function navigateToSchoolDiagnosticWizard(
  auth?: PlanParcoursNavigationAuth,
  navigate?: NavigateFn,
  tawjihPlusGate?: TawjihPlusParcoursGate,
): Promise<void> {
  const go =
    navigate ??
    ((href: string) => {
      router.push(href as never);
    });

  const blocked =
    tawjihPlusGate != null &&
    isTawjihPlusParcoursBlocked({ practicalLinkId: 'diagnostic-ecoles' }, tawjihPlusGate);

  if (blocked) {
    const code = auth ? await resolveSchoolRecoPublicCode(auth) : null;
    if (!code) {
      promptTawjihPlusParcoursLock(tawjihPlusGate!);
      return;
    }
    go(`/diagnostic-ecoles/resultats?c=${encodeURIComponent(code)}`);
    return;
  }

  go('/diagnostic-orientation');
}

/**
 * Ouvre la page de recommandations écoles.
 * Crée le diagnostic serveur depuis le test d’orientation si besoin.
 */
export async function navigateToSchoolDiagnosticEntry(
  auth?: PlanParcoursNavigationAuth,
  navigate?: NavigateFn,
  tawjihPlusGate?: TawjihPlusParcoursGate,
): Promise<void> {
  const go =
    navigate ??
    ((href: string) => {
      router.push(href as never);
    });

  const blocked =
    tawjihPlusGate != null &&
    isTawjihPlusParcoursBlocked({ practicalLinkId: 'diagnostic-recommandations' }, tawjihPlusGate);

  const code = auth ? await resolveSchoolRecoPublicCode(auth) : null;

  if (blocked && !code) {
    promptTawjihPlusParcoursLock(tawjihPlusGate!);
    return;
  }

  if (code) {
    go(`/diagnostic-ecoles/resultats?c=${encodeURIComponent(code)}`);
    return;
  }

  go('/diagnostic-orientation');
}

/** Même logique que {@link navigateToSchoolDiagnosticEntry}, en remplacement de route. */
export async function replaceToSchoolDiagnosticEntry(
  auth?: PlanParcoursNavigationAuth,
): Promise<boolean> {
  if (!auth?.getValidAccessToken) {
    return false;
  }

  const code = await resolveSchoolRecoPublicCode(auth);

  if (!code) {
    return false;
  }

  router.replace({
    pathname: '/diagnostic-ecoles/resultats',
    params: { c: code },
  } as never);
  return true;
}
