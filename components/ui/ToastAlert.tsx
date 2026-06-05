import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import type { ToastAlertVariant } from '@/hooks/useToastAlert';
import { brand, radius, spacing } from '@/theme/tokens';

type Props = {
  message: string;
  visible: boolean;
  variant?: ToastAlertVariant;
  rtl?: boolean;
  onDismiss: () => void;
  durationMs?: number;
};

const VARIANT_STYLES: Record<
  ToastAlertVariant,
  { bg: string; border: string; fg: string; icon: React.ComponentProps<typeof FontAwesome>['name'] }
> = {
  error: {
    bg: '#FEF2F2',
    border: '#FECACA',
    fg: brand.error,
    icon: 'exclamation-circle',
  },
  success: {
    bg: '#F0FDF4',
    border: '#BBF7D0',
    fg: brand.success,
    icon: 'check-circle',
  },
  info: {
    bg: '#EFF6FF',
    border: '#BFDBFE',
    fg: brand.primary,
    icon: 'info-circle',
  },
};

export function ToastAlert({
  message,
  visible,
  variant = 'error',
  rtl = false,
  onDismiss,
  durationMs = 4200,
}: Props) {
  const insets = useSafeAreaInsets();
  const palette = VARIANT_STYLES[variant];

  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(id);
  }, [visible, message, durationMs, onDismiss]);

  if (!visible || !message.trim()) return null;

  return (
    <View style={[styles.host, { top: insets.top + spacing.sm }]} pointerEvents="box-none">
      <Animated.View entering={FadeInUp.duration(260)} exiting={FadeOutUp.duration(200)}>
        <Pressable
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          onPress={onDismiss}
          style={({ pressed }) => [
            styles.toast,
            rtl && styles.toastRtl,
            {
              backgroundColor: palette.bg,
              borderColor: palette.border,
            },
            pressed && styles.toastPressed,
          ]}>
          <FontAwesome name={palette.icon} size={16} color={palette.fg} />
          <Text style={[styles.message, rtl && styles.messageRtl, { color: palette.fg }]} numberOfLines={4}>
            {message}
          </Text>
          <FontAwesome name="times" size={14} color={palette.fg} style={styles.closeIcon} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
    elevation: 12,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
    borderWidth: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  toastRtl: {
    flexDirection: 'row-reverse',
  },
  toastPressed: {
    opacity: 0.92,
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  messageRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  closeIcon: {
    marginTop: 2,
    opacity: 0.75,
  },
});
