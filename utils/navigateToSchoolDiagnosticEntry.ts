import { router } from 'expo-router';

import { resolveUserDiagnosticPublicCode } from '@/utils/resolveSchoolDiagnosticNavigation';
import type { PlanParcoursNavigationAuth } from '@/utils/planParcoursNavigation';
import {
  isTawjihPlusParcoursBlocked,
  promptTawjihPlusParcoursLock,
  type TawjihPlusParcoursGate,
} from '@/utils/tawjihPlusParcoursGate';

type NavigateFn = (href: string) => void;

/**
 * Ouvre le diagnostic écoles : wizard si pas encore terminé, sinon la page résultats
 * (paywall TAWJIH PLUS pour les non-clients, recommandations complètes pour les clients).
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
    isTawjihPlusParcoursBlocked({ practicalLinkId: 'diagnostic-ecoles' }, tawjihPlusGate);

  if (!auth?.getValidAccessToken) {
    if (blocked) {
      promptTawjihPlusParcoursLock(tawjihPlusGate);
      return;
    }
    go('/diagnostic-ecoles');
    return;
  }

  const code = await resolveUserDiagnosticPublicCode(
    auth.getValidAccessToken,
    auth.userId ?? null,
    { uiLocale: auth.uiLocale },
  );

  if (blocked && !code) {
    promptTawjihPlusParcoursLock(tawjihPlusGate);
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
