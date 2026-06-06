import { forwardRef, useState } from 'react';
import { Platform, StyleSheet, TextInput, type TextInputProps, type TextStyle } from 'react-native';

import { useLocale } from '@/contexts/LocaleContext';
import { applyArabicFontOverlay } from '@/theme/arabicTypography';
import { brand, radius, spacing } from '@/theme/tokens';

const SOFT_BORDER = 'rgba(51, 62, 143, 0.14)';

export type AppTextInputProps = TextInputProps & {
  /** RTL: alignement droite + direction du texte */
  textRtl?: boolean;
  /** Sans bordure ni fond — pour barres de recherche incluses dans un conteneur pill */
  plain?: boolean;
};

export const AppTextInput = forwardRef<TextInput, AppTextInputProps>(function AppTextInput(
  { style, onFocus, onBlur, textRtl, plain, placeholderTextColor, ...rest },
  ref,
) {
  const { isRTL } = useLocale();
  const [focused, setFocused] = useState(false);
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  const arabic = isRTL ? applyArabicFontOverlay(flat) : undefined;
  return (
    <TextInput
      ref={ref}
      placeholderTextColor={placeholderTextColor ?? brand.textMuted}
      selectionColor={brand.primary}
      {...rest}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={[
        plain ? styles.plain : styles.filled,
        !plain && focused && styles.filledFocused,
        (textRtl || isRTL) && styles.rtlText,
        style,
        arabic,
      ]}
    />
  );
});

const styles = StyleSheet.create({
  filled: {
    minHeight: Platform.select({ ios: 50, android: 52 }),
    fontSize: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: Platform.select({ ios: 12, android: 11 }),
    color: brand.text,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: SOFT_BORDER,
    backgroundColor: brand.backgroundSoft,
  },
  filledFocused: {
    borderColor: brand.primary,
    backgroundColor: brand.background,
    ...Platform.select({
      ios: {
        shadowColor: brand.primary,
        shadowOpacity: 0.14,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  plain: {
    flex: 1,
    margin: 0,
    padding: 0,
    fontSize: 16,
    color: brand.text,
    minHeight: Platform.select({ ios: 22, android: 24 }),
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
