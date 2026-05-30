/** Mur communauté « Groupe BAC 2026 » — désactivé sur mobile (pas d’UI, pas de navigation). */
export const GLOBAL_WALL_MOBILE_ENABLED = false;

/** Test d’orientation 1ère bac — code actif (accès réel via `isOrientation1BacUnlocked`). */
export const ORIENTATION_1BAC_MOBILE_ENABLED = true;

/** Entrée menu latéral (désactivée ; accès via carte accueil). */
export const ORIENTATION_1BAC_SIDEBAR_ENABLED = false;

export function isGlobalWallMobileRoute(path: string): boolean {
  const p = path.trim().toLowerCase();
  return p === '/communaute' || p.startsWith('/communaute/') || p.includes('communaute');
}

export function isOrientation1BacMobileRoute(path: string): boolean {
  const p = path.trim().toLowerCase();
  return p === '/orientation-1bac' || p.startsWith('/orientation-1bac/') || p.includes('orientation-1bac');
}
