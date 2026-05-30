import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlatformSheetOverlay } from '@/components/ui/PlatformSheetOverlay';
import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { openNotificationSettings } from '@/services/pushNotifications';
import { brand, radius, spacing } from '@/theme/tokens';

type Props = {
  visible: boolean;
  onDismiss: () => void;
};

export function NotificationPermissionModal({ visible, onDismiss }: Props) {
  const { t, isRTL } = useLocale();
  const rtl = isRTL;
  const enter = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      enter.value = 0;
      enter.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) });
    }
  }, [enter, visible]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 16 }],
  }));

  return (
    <PlatformSheetOverlay visible={visible} zIndex={9400} onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <Animated.View style={[styles.card, cardStyle]}>
            <View style={styles.iconWrap}>
              <FontAwesome name="bell" size={28} color={brand.primary} />
            </View>
            <Text style={[styles.title, rtl && styles.rtl]}>{t('pushPermissionModalTitle')}</Text>
            <Text style={[styles.body, rtl && styles.rtl]}>{t('pushPermissionModalBody')}</Text>
            <Text style={[styles.hint, rtl && styles.rtl]}>{t('pushPermissionModalHint')}</Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                openNotificationSettings();
                onDismiss();
              }}
              style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            >
              <Text style={styles.ctaText}>{t('pushPermissionModalOpenSettings')}</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={onDismiss}
              style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.7 }]}
            >
              <Text style={[styles.secondaryText, rtl && styles.rtl]}>{t('pushPermissionModalLater')}</Text>
            </Pressable>
          </Animated.View>
        </SafeAreaView>
      </View>
    </PlatformSheetOverlay>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  safe: { flex: 1, justifyContent: 'center' },
  card: {
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  iconWrap: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: brand.text,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
    textAlign: 'center',
  },
  hint: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  rtl: { writingDirection: 'rtl', textAlign: 'right' },
  cta: {
    backgroundColor: brand.primary,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  ctaPressed: { opacity: 0.9 },
  ctaText: { color: brand.white, fontWeight: '700', fontSize: 16 },
  secondary: { paddingVertical: 12, alignItems: 'center' },
  secondaryText: { color: '#64748b', fontWeight: '600', fontSize: 15 },
});
