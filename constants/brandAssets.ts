/**
 * Logos alignés sur le front global (CDN e-tawjihi.ma).
 *
 * Landing `NewFooter` : `logo-rectantgle-simple-nobg.png` + filtres CSS `brightness-0 invert`
 * pour fond sombre. En natif on utilise directement la variante blanche (même usage que `Topbar.tsx`).
 */
export const ETAWJIHI_LOGO_LIGHT_URL = 'https://cdn.e-tawjihi.ma/logo-blanc-nobg.png';

/** Intrinsèque du PNG CDN (1000×500) — pour dimensionner le `<Image>` sans marge latérale due à `contain`. */
export const ETAWJIHI_LOGO_LIGHT_ASPECT = 1000 / 500;
