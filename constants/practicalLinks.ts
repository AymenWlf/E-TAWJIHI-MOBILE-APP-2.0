import type { ComponentProps } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import type { HomeCopyKey } from '@/constants/i18n';
import { homeShell } from '@/theme/homeShell';

export type PracticalLinkDef = {
  id: string;
  labelKey: HomeCopyKey;
  descriptionKey: HomeCopyKey;
  icon: ComponentProps<typeof FontAwesome>['name'];
  accent: string;
};

/** Ordre aligné sur la rangée « Liens pratiques » accueil. */
export const PRACTICAL_LINK_DEFS: PracticalLinkDef[] = [
  {
    id: 'ecoles',
    labelKey: 'practical_ecoles',
    descriptionKey: 'practical_ecoles_desc',
    icon: 'university',
    accent: homeShell.blue,
  },
  {
    id: 'inscriptions',
    labelKey: 'practical_inscriptions',
    descriptionKey: 'practical_inscriptions_desc',
    icon: 'calendar',
    accent: homeShell.greenDark,
  },
  {
    id: 'candidatures',
    labelKey: 'practical_candidatures',
    descriptionKey: 'practical_candidatures_desc',
    icon: 'list-alt',
    accent: homeShell.blue,
  },
  {
    id: 'tests-orientation',
    labelKey: 'practical_testsOrientation',
    descriptionKey: 'practical_testsOrientation_desc',
    icon: 'compass',
    accent: homeShell.green,
  },
  {
    id: 'resultats-orientation',
    labelKey: 'practical_resultatsOrientation',
    descriptionKey: 'practical_resultatsOrientation_desc',
    icon: 'line-chart',
    accent: homeShell.blue,
  },
  {
    id: 'ecoles-inscription',
    labelKey: 'practical_ecolesInscription',
    descriptionKey: 'practical_ecolesInscription_desc',
    icon: 'building',
    accent: homeShell.blue,
  },
  {
    id: 'boutique',
    labelKey: 'practical_boutique',
    descriptionKey: 'practical_boutique_desc',
    icon: 'shopping-cart',
    accent: homeShell.blue,
  },
];

export function getPracticalLinkDef(id: string): PracticalLinkDef | undefined {
  return PRACTICAL_LINK_DEFS.find((d) => d.id === id);
}
