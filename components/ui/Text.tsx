import { Text as RNText, TextProps, StyleSheet, TextStyle } from 'react-native';

import { useLocale } from '@/contexts/LocaleContext';
import { resolveArabicFontFamily } from '@/theme/arabicTypography';

function shouldSkipArabicFont(flat?: TextStyle | null): boolean {
  const ff = flat?.fontFamily;
  if (typeof ff !== 'string') return false;
  return /mono|Menlo|Courier|Consolas/i.test(ff);
}

/** Text RN ; en arabe applique Cairo selon la graisse du style (voir `theme/arabicTypography`). */
export function Text({ style, ...props }: TextProps) {
  const { isRTL } = useLocale();
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  const skip = shouldSkipArabicFont(flat);
  const arabic = isRTL && !skip ? { fontFamily: resolveArabicFontFamily(flat) } : undefined;
  return <RNText {...props} style={[arabic, style]} />;
}
