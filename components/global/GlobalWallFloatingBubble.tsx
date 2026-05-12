import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLocale } from '@/contexts/LocaleContext';
import { brand, radius, spacing } from '@/theme/tokens';

/** Hauteur approximative barre d’onglets (icônes + labels + safe area déjà dans le tab). */
const TAB_BAR_EXTRA = 56;

export function GlobalWallFloatingBubble() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLocale();
  const bottom = TAB_BAR_EXTRA + Math.max(insets.bottom, spacing.sm) + spacing.sm;

  return (
    <View
      style={[styles.wrap, isRTL ? { left: spacing.md } : { right: spacing.md }, { bottom }]}
      pointerEvents="box-none"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('globalWallBubbleA11y')}
        onPress={() => router.push('/communaute' as never)}
        style={({ pressed }) => [styles.bubble, pressed && styles.bubblePressed]}
      >
        <FontAwesome name="bullhorn" size={22} color={brand.white} />
      </Pressable>
    </View>
  );
}

const BUBBLE = 56;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 40,
  },
  bubble: {
    width: BUBBLE,
    height: BUBBLE,
    borderRadius: radius.full,
    backgroundColor: brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  bubblePressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
});
