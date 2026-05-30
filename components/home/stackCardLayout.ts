import { fontSize, radius, spacing } from '@/theme/tokens';

/** Hauteur de référence (iPhone classique) ; le rendu réel dépend de `buildStackCardLayout`. */
export const BASE_CARD_H = 336;
/** Marge supplémentaire (réf. iPhone) — carte bac + CTA seuils (LTR). */
export const BAC_STACK_EXTRA_H = 44;
/** Marge supplémentaire en arabe RTL (titres + sous-titre CTA sur 2 lignes, canaux plus hauts). */
export const BAC_STACK_EXTRA_H_RTL = 76;
/** Marge verticale sous la pile (ombre + hint swipe). */
export const STACK_VERTICAL_EXTRA = 36;
export type StackCardLayout = {
  cardH: number;
  outerH: number;
  pad: number;
  padStripe: number;
  iconSize: number;
  eyebrow: number;
  packLabel: number;
  packName: number;
  packLh: number;
  validityLabel: number;
  validityValue: number;
  validityLh: number;
  boxPad: number;
  boxRadius: number;
  hint: number;
  hintLh: number;
  hintMinH: number;
  validityMT: number;
  packLabelMT: number;
  packNameMT: number;
  hintMT: number;
  calMR: number;
  calMT: number;
  validityValueMT: number;
};

/** Hauteur / typo / marges adaptées à la fenêtre pour que la carte tienne entièrement à l’écran. */
export function buildStackCardLayout(cardWidth: number, windowHeight: number): StackCardLayout {
  const wh = Math.max(420, windowHeight);
  const capByScreen = Math.floor(wh * 0.43);
  const capByWidth = Math.floor(cardWidth * 0.82);
  let cardH = Math.min(BASE_CARD_H, capByScreen, capByWidth);
  cardH = Math.max(210, cardH);
  const s = cardH / BASE_CARD_H;
  const r = (x: number) => Math.max(1, Math.round(x * s));

  return {
    cardH,
    outerH: cardH + STACK_VERTICAL_EXTRA,
    pad: r(spacing.lg),
    padStripe: r(6),
    iconSize: Math.max(12, r(16)),
    eyebrow: Math.max(10, r(fontSize.xs)),
    packLabel: Math.max(11, r(fontSize.sm)),
    packName: Math.max(13, r(fontSize.lg)),
    packLh: Math.max(18, r(22)),
    validityLabel: Math.max(9, r(fontSize.xs)),
    validityValue: Math.max(11, r(fontSize.sm)),
    validityLh: Math.max(16, r(20)),
    boxPad: r(spacing.md),
    boxRadius: r(radius.md),
    hint: Math.max(10, r(fontSize.xs)),
    hintLh: Math.max(14, r(16)),
    hintMinH: r(32),
    validityMT: r(spacing.sm),
    packLabelMT: r(spacing.sm),
    packNameMT: r(4),
    hintMT: r(spacing.sm),
    calMR: r(spacing.md),
    calMT: r(2),
    validityValueMT: r(4),
  };
}

/** Hauteur pile accueil : + espace CTA seuils si une carte bac est dans le deck. */
export function getHomeStackCardHeight(
  layout: StackCardLayout,
  hasBacCard: boolean,
  isRTL = false,
): number {
  if (!hasBacCard) return layout.cardH;
  const scale = layout.cardH / BASE_CARD_H;
  const extraRef = isRTL ? BAC_STACK_EXTRA_H_RTL : BAC_STACK_EXTRA_H;
  const extraMin = isRTL ? 44 : 28;
  return layout.cardH + Math.max(extraMin, Math.ceil(extraRef * scale));
}

