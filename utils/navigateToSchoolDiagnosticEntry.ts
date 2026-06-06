import { router } from 'expo-router';

import { resolveUserDiagnosticPublicCode } from '@/utils/resolveSchoolDiagnosticNavigation';
import type { PlanParcoursNavigationAuth } from '@/utils/planParcoursNavigation';
import {
  isTawjihPlusParcoursBlocked,
  promptTawjihPlusParcoursLock,
  type TawjihPlusParcoursGate,
} from '@/utils/tawjihPlusParcoursGate';

type NavigateFn = (href: string) => void;

async function resolveDiagnosticWizardAccess(
  auth: PlanParcoursNavigationAuth | undefined,
  tawjihPlusGate?: TawjihPlusParcoursGate,
): Promise<{ blocked: boolean; code: string | null }> {
  const blocked =
    tawjihPlusGate != null &&
    isTawjihPlusParcoursBlocked({ practicalLinkId: 'diagnostic-ecoles' }, tawjihPlusGate);

  if (!auth?.getValidAccessToken) {
    return { blocked, code: null };
  }

  const code = await resolveUserDiagnosticPublicCode(
    auth.getValidAccessToken,
    auth.userId ?? null,
    { uiLocale: auth.uiLocale },
  );

  return { blocked, code };
}

/**
 * Ouvre le questionnaire diagnostic écoles (wizard), même si un diagnostic est déjà terminé.
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

  const { blocked, code } = await resolveDiagnosticWizardAccess(auth, tawjihPlusGate);

  if (blocked && !code) {
    promptTawjihPlusParcoursLock(tawjihPlusGate!);
    return;
  }

  go('/diagnostic-ecoles');
}

/**
 * Ouvre les recommandations : page résultats si diagnostic terminé, sinon le wizard.
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

  const { blocked, code } = await resolveDiagnosticWizardAccess(auth, tawjihPlusGate);

  if (!auth?.getValidAccessToken) {
    if (blocked) {
      promptTawjihPlusParcoursLock(tawjihPlusGate!);
      return;
    }
    go('/diagnostic-ecoles');
    return;
  }

  if (blocked && !code) {
    promptTawjihPlusParcoursLock(tawjihPlusGate!);
    return;
  }

  if (code) {
    go(`/diagnostic-ecoles/resultats?c=${encodeURIComponent(code)}`);
    return;
  }

  go('/diagnostic-ecoles');
}

/** Même logique que {@link navigateToSchoolDiagnosticEntry}, en remplacement de route. */
export async function replaceToSchoolDiagnosticEntry(
  auth?: PlanParcoursNavigationAuth,
): Promise<boolean> {
  if (!auth?.getValidAccessToken) {
    return false;
  }

  const code = await resolveUserDiagnosticPublicCode(
    auth.getValidAccessToken,
    auth.userId ?? null,
    { uiLocale: auth.uiLocale },
  );

  if (!code) {
    return false;
  }

  router.replace({
    pathname: '/diagnostic-ecoles/resultats',
    params: { c: code },
  } as never);
  return true;
}
