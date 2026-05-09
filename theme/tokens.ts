/**
 * Tokens alignés sur la charte E-Tawjihi (Global Front — docs/CHARTE_GRAPHIQUE.md).
 * Bleu principal = topbar site (`Topbar.tsx` / `Layout.tsx`) : #333e8f.
 */
export const brand = {
  primary: '#333E8F',
  primaryHover: '#2A3478',
  primaryInteractive: '#3F4D9F',
  emerald: '#158f65',
  cyan: '#0E7490',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  background: '#FFFFFF',
  backgroundSoft: '#F8FAFC',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  success: '#2fce94',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#333E8F',
  white: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: 28,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
} as const;

export type ColorScheme = 'light' | 'dark';

export function semanticColors(scheme: ColorScheme) {
  const isDark = scheme === 'dark';
  return {
    background: isDark ? '#0F172A' : brand.background,
    backgroundSoft: isDark ? '#1E293B' : brand.backgroundSoft,
    surface: isDark ? '#1E293B' : brand.white,
    text: isDark ? '#F8FAFC' : brand.text,
    textSecondary: isDark ? '#CBD5E1' : brand.textSecondary,
    textMuted: isDark ? '#94A3B8' : brand.textMuted,
    border: isDark ? '#334155' : brand.border,
    primary: isDark ? '#B4BEE8' : brand.primary,
    primaryInteractive: isDark ? '#CCD4F2' : brand.primaryInteractive,
    primaryMuted: isDark ? 'rgba(51,62,143,0.28)' : 'rgba(51,62,143,0.09)',
    onPrimary: brand.white,
    success: brand.success,
    warning: brand.warning,
    error: brand.error,
    tabBar: isDark ? '#0F172A' : brand.white,
    tabIcon: isDark ? '#64748B' : brand.textMuted,
    tabIconActive: isDark ? '#B4BEE8' : brand.primary,
  };
}

/** @deprecated utiliser `brand` — conservé pour imports existants */
export const palette = {
  ...brand,
  slate50: brand.backgroundSoft,
  slate200: brand.border,
  slate500: brand.textMuted,
  slate900: brand.text,
  amber500: brand.warning,
} as const;
