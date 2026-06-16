import { Text as RNText, TextProps, StyleSheet, TextStyle } from 'react-native';

import { useLocale } from '@/contexts/LocaleContext';
import { applyArabicFontOverlay, isMonospaceFontFamily } from '@/theme/arabicTypography';

type AppTextProps = TextProps & {
  /** Chiffres / symboles latins (−10 %) : ne pas appliquer Cairo en mode arabe. */
  latinDigits?: boolean;
};

/** Text RN ; en arabe applique Cairo + alignement RTL (même contenu FR). */
export function Text({ style, latinDigits, ...props }: AppTextProps) {
  const { isRTL } = useLocale();
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  const skip = isMonospaceFontFamily(flat?.fontFamily) || latinDigits;
  const arabic = isRTL && !skip ? applyArabicFontOverlay(flat) : undefined;
  const hasExplicitAlign =
    flat?.textAlign != null && flat.textAlign !== 'auto' && flat.textAlign !== 'inherit';
  const rtlAlign: TextStyle | undefined =
    isRTL && !latinDigits && !hasExplicitAlign
      ? { textAlign: 'right', writingDirection: 'rtl' }
      : undefined;
  return <RNText {...props} style={[style, arabic, rtlAlign]} />;
}
