import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { brand, spacing } from '@/theme/tokens';

type Props = {
  checked: boolean;
  onToggle: (next: boolean) => void;
  disabled?: boolean;
};

export function AuthRememberMeRow({ checked, onToggle, disabled }: Props) {
  const { t, isRTL } = useLocale();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: !!disabled }}
      accessibilityLabel={t('loginRememberMe')}
      disabled={disabled}
      onPress={() => onToggle(!checked)}
      style={({ pressed }) => [
        styles.row,
        isRTL && styles.rowRtl,
        pressed && !disabled && { opacity: 0.85 },
        disabled && styles.rowDisabled,
      ]}>
      <FontAwesome
        name={checked ? 'check-square' : 'square-o'}
        size={20}
        color={checked ? brand.primary : brand.textMuted}
      />
      <Text style={[styles.label, isRTL && styles.rtl]}>{t('loginRememberMe')}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  rowDisabled: {
    opacity: 0.55,
  },
  label: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: brand.textSecondary,
  },
  rtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
