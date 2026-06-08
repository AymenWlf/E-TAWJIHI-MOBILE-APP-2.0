import { Platform, StyleSheet } from 'react-native';

import { brand } from '@/theme/tokens';

/** Hauteur utile icône + libellé (hors safe area bas). */
export const TAB_BAR_CONTENT_HEIGHT = Platform.select({ ios: 56, android: 58, default: 54 }) as number;
/** Marge minimale au-dessus du bord / barre de navigation système. */
const TAB_BAR_MIN_BOTTOM_INSET = Platform.select({ ios: 12, android: 18, default: 12 }) as number;
/** Relevé visuel supplémentaire pour ne pas coller au bas du téléphone. */
const TAB_BAR_EXTRA_BOTTOM = Platform.select({ ios: 4, android: 6, default: 4 }) as number;

export function tabBarBottomInset(safeBottom: number): number {
  return Math.max(safeBottom, TAB_BAR_MIN_BOTTOM_INSET) + TAB_BAR_EXTRA_BOTTOM;
}

/** Style item onglet standard (icône + libellé). */
export const defaultTabBarItemStyle = {
  overflow: 'visible' as const,
  paddingVertical: 0,
  minHeight: TAB_BAR_CONTENT_HEIGHT,
};

/** Style item onglet central (Annonces / inscriptions). */
export const centerTabBarItemStyle = {
  ...defaultTabBarItemStyle,
  paddingBottom: Platform.OS === 'android' ? 0 : undefined,
};

/** Style par défaut de la barre d’onglets (à réappliquer après masquage temporaire). */
export function buildTabBarStyle(safeBottom: number) {
  const paddingBottom = tabBarBottomInset(safeBottom);
  const height = TAB_BAR_CONTENT_HEIGHT + paddingBottom;

  return {
    backgroundColor: brand.white,
    borderTopColor: brand.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Platform.OS === 'android' ? 8 : 10,
    paddingBottom,
    height,
    overflow: 'visible' as const,
    elevation: Platform.OS === 'android' ? 12 : 0,
    display: 'flex' as const,
  };
}
