import {
  navigateToSchoolDiagnosticEntry,
  navigateToSchoolDiagnosticWizard,
} from '@/utils/navigateToSchoolDiagnosticEntry';
import type { PlanParcoursNavigationAuth } from '@/utils/planParcoursNavigation';
import {
  guardTawjihPlusPracticalLink,
  type TawjihPlusParcoursGate,
} from '@/utils/tawjihPlusParcoursGate';

type PushHref = (href: string) => void;

/**
 * Navigation depuis les tuiles « Liens pratiques » et les cartes accueil (`practicalLinkId`).
 * Parcours in-app quand un écran existe ; sinon ouverture du site public.
 */
export function navigatePracticalLink(
  push: PushHref,
  id: string,
  auth?: PlanParcoursNavigationAuth,
  tawjihPlusGate?: TawjihPlusParcoursGate,
): void {
  guardTawjihPlusPracticalLink(id, tawjihPlusGate, () => {
    navigatePracticalLinkUnlocked(push, id, auth, tawjihPlusGate);
  });
}

function navigatePracticalLinkUnlocked(
  push: PushHref,
  id: string,
  auth?: PlanParcoursNavigationAuth,
  tawjihPlusGate?: TawjihPlusParcoursGate,
): void {
  switch (id) {
    case 'ecoles':
      push('/ecoles');
      return;
    case 'inscriptions':
      push('/inscriptions?tab=announcements');
      return;
    case 'candidatures':
      push('/inscriptions?tab=candidacies');
      return;
    case 'ecoles-inscription':
      push('/tassjil-school-choices');
      return;
    case 'boutique':
      push('/boutique');
      return;
    case 'evenements':
      push('/evenements');
      return;
    case 'diagnostic-ecoles':
    case 'diagnostic-rapport':
      void navigateToSchoolDiagnosticWizard(auth, push, tawjihPlusGate);
      return;
    case 'diagnostic-recommandations':
      void navigateToSchoolDiagnosticEntry(auth, push, tawjihPlusGate);
      return;
    default:
      return;
  }
}
