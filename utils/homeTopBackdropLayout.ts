/** Largeur à partir de laquelle on applique le layout hero tablette / iPad. */
export const HOME_HERO_WIDE_MIN_WIDTH = 600;

export type HomeTopBackdropMetrics = {
  main: number;
  left: number;
  top: number;
  glowSize: number;
  glowLeft: number;
  glowTop: number;
  ringSize: number;
  ringLeft: number;
  ringTop: number;
  greenHaloScale: number;
};

export function isHomeHeroWideLayout(width: number): boolean {
  return width >= HOME_HERO_WIDE_MIN_WIDTH;
}

/**
 * Dimensions du disque décoratif (téléphone : grand arc ; tablette : taille plafonnée, plus haut).
 */
export function computeHomeTopBackdropMetrics(
  width: number,
  topInset = 0,
): HomeTopBackdropMetrics {
  const wide = isHomeHeroWideLayout(width);

  let main: number;
  let topLift: number;
  let greenHaloScale: number;

  if (!wide) {
    main = width * 1.52;
    topLift = 0.44;
    greenHaloScale = 1.09;
  } else if (width >= 1024) {
    main = Math.min(width * 0.52, 460);
    topLift = 0.56;
    greenHaloScale = 1.04;
  } else if (width >= 768) {
    main = Math.min(width * 0.62, 500);
    topLift = 0.54;
    greenHaloScale = 1.05;
  } else {
    main = Math.min(width * 0.72, 540);
    topLift = 0.5;
    greenHaloScale = 1.06;
  }

  const left = (width - main) / 2;
  const top = topInset - main * topLift;

  const glowSize = main * greenHaloScale;
  const glowLeft = left + (main - glowSize) / 2;
  const glowTop = top + (main - glowSize) / 2;

  const ringSize = main * 1.05;
  const ringLeft = left - main * 0.025;
  const ringTop = top - 2;

  return {
    main,
    left,
    top,
    glowSize,
    glowLeft,
    glowTop,
    ringSize,
    ringLeft,
    ringTop,
    greenHaloScale,
  };
}
