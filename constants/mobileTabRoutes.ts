/** Onglet affiché au lancement de l'app et après auth / configuration du compte. */
export const DEFAULT_TAB_ROUTE = '/(tabs)/inscriptions' as const;

export const DEFAULT_TAB_SCREEN = 'inscriptions' as const;

/** Routes « accueil » par défaut d'Expo Router (`index` dans le groupe tabs). */
export function isDefaultTabHomeRoute(routeKey: string): boolean {
  return routeKey === '(tabs)' || routeKey === '(tabs)/index';
}
