import type { TextStyle } from 'react-native';

/** Noms PostScript Expo (`useFonts` @expo-google-fonts/cairo) — corps plus dense et titres plus affirmés. */
export const CAIRO = {
  semibold: 'Cairo_600SemiBold',
  bold: 'Cairo_700Bold',
  extrabold: 'Cairo_800ExtraBold',
  black: 'Cairo_900Black',
} as const;

function numericWeight(fw: TextStyle['fontWeight'] | undefined): number {
  if (fw == null || fw === 'normal') return 400;
  if (fw === 'bold') return 700;
  if (typeof fw === 'number') return fw;
  const n = Number.parseInt(String(fw), 10);
  return Number.isFinite(n) ? n : 400;
}

export function resolveArabicFontFamily(flat?: TextStyle | null): string {
  const fw = numericWeight(flat?.fontWeight);
  if (fw >= 900) return CAIRO.black;
  if (fw >= 800) return CAIRO.extrabold;
  if (fw >= 700) return CAIRO.bold;
  if (fw >= 600) return CAIRO.semibold;
  return CAIRO.bold;
}
