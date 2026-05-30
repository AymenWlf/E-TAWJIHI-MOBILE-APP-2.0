import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { HomeCopyKey } from '@/constants/i18n';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

type Props = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  isRTL?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function LoadErrorState({
  message,
  onRetry,
  retryLabel,
  isRTL = false,
  compact = false,
  style,
}: Props) {
  return (
    <View style={[compact ? styles.wrapCompact : styles.wrap, style]}>
      <FontAwesome
        name="exclamation-circle"
        size={compact ? 22 : 28}
        color={brand.textMuted}
        style={styles.icon}
      />
      <Text style={[compact ? styles.msgCompact : styles.msg, isRTL && styles.rtl]}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.85 }]}
        >
          <FontAwesome name="refresh" size={12} color={brand.primary} />
          <Text style={styles.retryTxt}>{retryLabel ?? 'Réessayer'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Helper pour brancher le libellé i18n du bouton réessayer. */
export function loadErrorRetryLabel(t: (key: HomeCopyKey) => string): string {
  return t('commonRetry');
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  wrapCompact: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  icon: { marginBottom: 2 },
  msg: {
    textAlign: 'center',
    color: brand.textSecondary,
    fontSize: fontSize.md,
    fontWeight: '600',
    lineHeight: 22,
  },
  msgCompact: {
    textAlign: 'center',
    color: brand.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    lineHeight: 20,
  },
  rtl: { writingDirection: 'rtl' },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.primary,
    backgroundColor: brand.white,
  },
  retryTxt: {
    color: brand.primary,
    fontWeight: '800',
    fontSize: fontSize.sm,
  },
});
