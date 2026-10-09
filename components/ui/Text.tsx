import { Text as RNText, TextProps, StyleSheet, TextStyle, type ReactNode } from 'react-native';

import { useLocale } from '@/contexts/LocaleContext';
import { applyArabicFontOverlay, isMonospaceFontFamily } from '@/theme/arabicTypography';

type AppTextProps = TextProps & {
  /** Chiffres / symboles latins (−10 %) : ne pas appliquer Cairo en mode arabe. */
  latinDigits?: boolean;
};

function nodeHasArabic(node: ReactNode): boolean {
  if (typeof node === 'string' || typeof node === 'number') {
    return /[\u0600-\u06FF]/.test(String(node));
  }
  if (Array.isArray(node)) return node.some(nodeHasArabic);
  return false;
}

/** Text RN ; en arabe applique Cairo + alignement RTL (même contenu FR). */
export function Text({ style, latinDigits, children, ...props }: AppTextProps) {
  const { isRTL } = useLocale();
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  const keepArabicFont = nodeHasArabic(children);
  const skipLatinFont = Boolean(latinDigits) && !keepArabicFont;
  const skip = isMonospaceFontFamily(flat?.fontFamily) || skipLatinFont;
  const arabic = isRTL && !skip ? applyArabicFontOverlay(flat) : undefined;
  const hasExplicitAlign =
    flat?.textAlign != null && flat.textAlign !== 'auto' && flat.textAlign !== 'inherit';
  const rtlAlign: TextStyle | undefined =
    isRTL && !skipLatinFont && !hasExplicitAlign
      ? { textAlign: 'right', writingDirection: 'rtl' }
      : undefined;
  return (
    <RNText {...props} style={[style, arabic, rtlAlign]}>
      {children}
    </RNText>
  );
}
