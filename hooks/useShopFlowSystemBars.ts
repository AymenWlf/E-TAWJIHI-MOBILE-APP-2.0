import * as NavigationBar from 'expo-navigation-bar';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Platform } from 'react-native';

import { brand } from '@/theme/tokens';

function isLightBackground(hex: string): boolean {
  const c = hex.replace('#', '');
  if (c.length !== 6) return true;
  const r = Number.parseInt(c.slice(0, 2), 16);
  const g = Number.parseInt(c.slice(2, 4), 16);
  const b = Number.parseInt(c.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return true;
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

export type ShopFlowSystemBarsOptions = {
  /** Couleur sous la barre de statut (en-tête de page). */
  headerColor?: string;
  /** Barre de navigation système Android + zone safe area bas. */
  bottomColor?: string;
};

/**
 * Aligne la barre de statut (Android) et la barre de navigation Android
 * sur les écrans panier / checkout / merci.
 */
export function useShopFlowSystemBars({
  headerColor = brand.white,
  bottomColor = brand.white,
}: ShopFlowSystemBarsOptions = {}) {
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;
      void NavigationBar.setBackgroundColorAsync(bottomColor);
      void NavigationBar.setButtonStyleAsync(isLightBackground(bottomColor) ? 'dark' : 'light');
    }, [bottomColor]),
  );

  return {
    headerColor,
    bottomColor,
    statusBarStyle: 'dark' as const,
  };
}
