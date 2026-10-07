import { router } from 'expo-router';

import { readOrientationDiagnosticPrototypeDraft } from '@/features/orientationDiagnostic/constants/orientationDiagnosticPrototypeStorage';
import type { PlanParcoursNavigationAuth } from '@/utils/planParcoursNavigation';

type NavigateFn = (href: string) => void;

function goTo(
  href: string,
  navigate?: NavigateFn,
): void {
  const go =
    navigate ??
    ((path: string) => {
      router.push(path as never);
    });
  go(href);
}

/**
 * Ouvre le **test** d’orientation (`/diagnostic-orientation`) — wizard / reprise quiz.
 * Ne redirige pas vers le rapport (étape parcours séparée).
 */
export async function navigateToOrientationDiagnosticWizard(
  auth?: PlanParcoursNavigationAuth,
  navigate?: NavigateFn,
): Promise<void> {
  goTo('/diagnostic-orientation', navigate);
}

/**
 * Ouvre le **rapport** d’orientation s’il existe, sinon le test.
 */
export async function navigateToOrientationReportEntry(
  auth?: PlanParcoursNavigationAuth,
  navigate?: NavigateFn,
): Promise<void> {
  const userId = auth?.userId ?? null;
  const draft = await readOrientationDiagnosticPrototypeDraft(userId);

  if (draft?.phase === 'report' && draft.report) {
    goTo('/diagnostic-orientation/rapport', navigate);
    return;
  }

  goTo('/diagnostic-orientation', navigate);
}

/**
 * @deprecated Préférer {@link navigateToOrientationDiagnosticWizard} ou
 * {@link navigateToOrientationReportEntry}.
 */
export async function navigateToOrientationDiagnosticEntry(
  auth?: PlanParcoursNavigationAuth,
  navigate?: NavigateFn,
): Promise<void> {
  await navigateToOrientationReportEntry(auth, navigate);
}
