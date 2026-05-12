/**
 * Style visuel par type d'annonce de concours.
 *
 * On mappe chaque libellé canonique (cf. `ANNOUNCEMENT_TYPES` côté admin)
 * vers une palette pastel + une icône FontAwesome, pour offrir un repère
 * visuel rapide sur les listings (« vert = ouverture », « bleu = résultat »,
 * « rouge = message important »…).
 *
 * La normalisation gère le cas des accents et des variantes de casse
 * remontées par le backend (pas de garantie d'orthographe stricte côté
 * BDD — un admin peut taper « Resultat d'inscription » sans accent).
 */
import type { ComponentProps } from 'react';
import type FontAwesome from '@expo/vector-icons/FontAwesome';

export type AnnouncementVisualKey =
  | 'opening'
  | 'result'
  | 'scholarshipMa'
  | 'scholarshipForeign'
  | 'message'
  | 'offer'
  | 'other';

export type AnnouncementTypeStyle = {
  key: AnnouncementVisualKey;
  /** Couleur de fond (pastel — adaptée aux pills/bandeaux). */
  bg: string;
  /** Couleur de bordure (saturée — sert aussi pour le « rail » à gauche). */
  border: string;
  /** Couleur du texte et de l'icône (foncée pour assurer le contraste sur `bg`). */
  fg: string;
  /** Icône FontAwesome (sans le préfixe). */
  icon: ComponentProps<typeof FontAwesome>['name'];
};

const STYLES: Record<AnnouncementVisualKey, AnnouncementTypeStyle> = {
  opening: {
    key: 'opening',
    bg: '#DCFCE7',
    border: '#BBF7D0',
    fg: '#15803D',
    icon: 'unlock-alt',
  },
  result: {
    key: 'result',
    bg: '#DBEAFE',
    border: '#BFDBFE',
    fg: '#1D4ED8',
    icon: 'trophy',
  },
  scholarshipMa: {
    key: 'scholarshipMa',
    bg: '#FEF3C7',
    border: '#FDE68A',
    fg: '#B45309',
    icon: 'star',
  },
  scholarshipForeign: {
    key: 'scholarshipForeign',
    bg: '#E0E7FF',
    border: '#C7D2FE',
    fg: '#4338CA',
    icon: 'plane',
  },
  message: {
    key: 'message',
    bg: '#FEE2E2',
    border: '#FECACA',
    fg: '#B91C1C',
    icon: 'exclamation-circle',
  },
  offer: {
    key: 'offer',
    bg: '#FAE8FF',
    border: '#F5D0FE',
    fg: '#86198F',
    icon: 'gift',
  },
  other: {
    key: 'other',
    bg: '#E2E8F0',
    border: '#CBD5E1',
    fg: '#334155',
    icon: 'bookmark',
  },
};

/**
 * Compare en mode « tolérant » : minuscules, sans accents, sans
 * apostrophes courbes ni espaces multiples. Évite des mismatchs sur
 * « Résultat d'inscription » vs « Resultat d'inscription ».
 */
function normalize(label: string | null | undefined): string {
  if (!label) return '';
  return label
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\s+/g, ' ');
}

/**
 * Renvoie le style associé à un libellé d'`announcementType`. Tout libellé
 * inconnu retombe sur la palette neutre `other` afin d'éviter une UI
 * cassée si le backend introduit un nouveau type.
 */
export function getAnnouncementTypeStyle(label: string | null | undefined): AnnouncementTypeStyle {
  const n = normalize(label);
  if (n === '') return STYLES.other;

  // Ouverture d'inscription / pré-inscription / inscription en cours…
  if (n.includes('ouverture') || n.includes('pre-inscription') || n.includes('preinscription')) {
    return STYLES.opening;
  }
  // Résultat d'inscription / résultat d'admission / résultats…
  if (n.startsWith('resultat') || n.includes(' resultat')) {
    return STYLES.result;
  }
  // Bourse maroc — distinguer du foreign : on cherche « maroc » en premier.
  if (n.includes('bourse') && (n.includes('maroc') || n.includes('national'))) {
    return STYLES.scholarshipMa;
  }
  // Bourse étrangère / internationale.
  if (n.includes('bourse') && (n.includes('etrange') || n.includes('international'))) {
    return STYLES.scholarshipForeign;
  }
  // Bourse générique (sans précision) → on retombe sur le style « MA ».
  if (n.includes('bourse')) {
    return STYLES.scholarshipMa;
  }
  if (n.includes('message') || n.includes('important') || n.includes('alerte')) {
    return STYLES.message;
  }
  if (n.includes('offre') || n.includes('promotion') || n.includes('promo')) {
    return STYLES.offer;
  }

  return STYLES.other;
}
