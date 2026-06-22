import { Platform, type TextStyle } from 'react-native';

/** Noms PostScript Expo (`useFonts` @expo-google-fonts/cairo) — corps plus dense et titres plus affirmés. */
export const CAIRO = {
  semibold: 'Cairo_600SemiBold',
  bold: 'Cairo_700Bold',
  extrabold: 'Cairo_800ExtraBold',
  black: 'Cairo_900Black',
} as const;

export function isCairoFontFamily(fontFamily: TextStyle['fontFamily']): boolean {
  return typeof fontFamily === 'string' && /^Cairo_/i.test(fontFamily);
}

export function isMonospaceFontFamily(fontFamily: TextStyle['fontFamily']): boolean {
  return typeof fontFamily === 'string' && /mono|Menlo|Courier|Consolas/i.test(fontFamily);
}

function numericWeight(fw: TextStyle['fontWeight'] | undefined): number {
  if (fw == null || fw === 'normal') return 400;
  if (fw === 'bold') return 700;
  if (typeof fw === 'number') return fw;
  const n = Number.parseInt(String(fw), 10);
  return Number.isFinite(n) ? n : 400;
}

export function resolveArabicFontFamily(flat?: TextStyle | null): string {
  const existing = flat?.fontFamily;
  if (typeof existing === 'string' && isCairoFontFamily(existing)) {
    return existing;
  }
  const fw = numericWeight(flat?.fontWeight);
  if (fw >= 900) return CAIRO.black;
  if (fw >= 800) return CAIRO.extrabold;
  if (fw >= 700) return CAIRO.bold;
  if (fw >= 600) return CAIRO.semibold;
  return CAIRO.bold;
}

/**
 * Couche finale de style arabe (Text / TextInput).
 * Android ignore `fontFamily` si `fontWeight` est aussi défini — on aligne sur iOS.
 */
export function applyArabicFontOverlay(flat?: TextStyle | null): TextStyle {
  const fontFamily = resolveArabicFontFamily(flat);
  return Platform.select({
    android: {
      fontFamily,
      fontWeight: 'normal',
      includeFontPadding: false,
    },
    default: {
      fontFamily,
      fontWeight: 'normal',
    },
  }) as TextStyle;
}

/**
 * Styles TextInput en arabe (RTL) — centrage vertical, Cairo, sans padding fantôme Android.
 */
export function rtlTextInputStyle(flat?: TextStyle | null): TextStyle {
  const fontOverlay = applyArabicFontOverlay(flat);
  const rawFs = flat?.fontSize;
  const fontSizeNum =
    typeof rawFs === 'number'
      ? rawFs
      : typeof rawFs === 'string'
        ? Number.parseFloat(rawFs)
        : 15;

  return {
    textAlign: 'right',
    writingDirection: 'rtl',
    textAlignVertical: 'center',
    alignSelf: 'stretch',
    width: '100%',
    ...fontOverlay,
    ...(Platform.OS === 'android'
      ? {
          paddingVertical: 0,
          lineHeight: Math.round(fontSizeNum * 1.22),
        }
      : {
          lineHeight: undefined,
        }),
  };
}

/** Style Cairo explicite (champs OTP, auth, etc.). */
export function cairoFontStyle(family: keyof typeof CAIRO): TextStyle {
  return applyArabicFontOverlay({ fontFamily: CAIRO[family] });
}
