import * as Linking from 'expo-linking';

import { buildPublicPageUrl } from '@/constants/publicWeb';

type PushHref = (href: string) => void;

/**
 * Navigation depuis les tuiles « Liens pratiques » et les cartes accueil (`practicalLinkId`).
 * Parcours in-app quand un écran existe ; sinon ouverture du site public.
 */
export function navigatePracticalLink(push: PushHref, id: string): void {
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
    case 'tests-orientation':
      void Linking.openURL(buildPublicPageUrl('/test-diagnostic')).catch(() => undefined);
      return;
    case 'resultats-orientation':
      void Linking.openURL(buildPublicPageUrl('/rapport-diagnostic')).catch(() => undefined);
      return;
    default:
      return;
  }
}
