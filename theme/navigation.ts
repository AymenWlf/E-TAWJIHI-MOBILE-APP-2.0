import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

import { brand, semanticColors, type ColorScheme } from '@/theme/tokens';

export function appNavigationTheme(scheme: ColorScheme): Theme {
  const s = semanticColors(scheme);
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: s.primary,
      background: s.background,
      card: s.surface,
      text: s.text,
      border: s.border,
      notification: brand.warning,
    },
  };
}
