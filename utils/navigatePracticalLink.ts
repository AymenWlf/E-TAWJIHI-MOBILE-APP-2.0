import { resolveUserDiagnosticPublicCode } from '@/utils/resolveSchoolDiagnosticNavigation';
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
    navigatePracticalLinkUnlocked(push, id, auth);
  });
}

function navigatePracticalLinkUnlocked(
  push: PushHref,
  id: string,
  auth?: PlanParcoursNavigationAuth,
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
      push('/ecoles');
      return;
    case 'boutique':
      push('/boutique');
      return;
    case 'evenements':
      push('/evenements');
      return;
    case 'diagnostic-ecoles':
      push('/diagnostic-ecoles');
      return;
    case 'diagnostic-rapport':
    case 'diagnostic-recommandations':
      if (!auth?.getValidAccessToken) {
        push('/diagnostic-ecoles');
        return;
      }
      void (async () => {
        const code = await resolveUserDiagnosticPublicCode(
          auth.getValidAccessToken,
          auth.userId ?? null,
          { uiLocale: auth.uiLocale },
        );
        if (code) {
          push(`/diagnostic-ecoles/resultats?c=${encodeURIComponent(code)}`);
        } else {
          push('/diagnostic-ecoles');
        }
      })();
      return;
    default:
      return;
  }
}
