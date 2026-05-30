import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSegments } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  buildEtawjihiSupportWhatsAppUrl,
  buildEtawjihiSupportWhatsAppNativeUrl,
} from '@/constants/etawjihiWhatsApp';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { brand, spacing } from '@/theme/tokens';

/** Hauteur approx barre d’onglets. */
const TAB_BAR_EXTRA = 56;

const WHATSAPP_GREEN = '#25D366';

/**
 * Bulle flottante WhatsApp — contact E-TAWJIHI pour toute demande d’information.
 */
const AUTH_ROUTE_PREFIXES = [
  'login',
  'register',
  'device-transfer',
  'forgot-password',
  'forgot-password-sent',
  'verify-reset-otp',
  'reset-password',
  'logout',
] as const;

export function FloatingBubbleHub() {
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLocale();
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const route = segments.join('/');

  const hidden = useMemo(() => {
    if (isLoading || !user) return true;
    return AUTH_ROUTE_PREFIXES.some((p) => route === p || route.startsWith(`${p}/`));
  }, [isLoading, user, route]);

  const bottom = TAB_BAR_EXTRA + Math.max(insets.bottom, spacing.sm) + spacing.sm;

  const openWhatsApp = useCallback(() => {
    const message = t('hubWhatsAppPrefill');
    const nativeUrl = buildEtawjihiSupportWhatsAppNativeUrl(message);
    const webUrl = buildEtawjihiSupportWhatsAppUrl(message);
    void Linking.canOpenURL(nativeUrl)
      .then((ok) => Linking.openURL(ok ? nativeUrl : webUrl))
      .catch(() => {
        void Linking.openURL(webUrl);
      });
  }, [t]);

  if (hidden) {
    return null;
  }

  return (
    <View
      style={[styles.wrap, isRTL ? { left: spacing.md } : { right: spacing.md }, { bottom }]}
      pointerEvents="box-none"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('hubWhatsAppA11y')}
        onPress={openWhatsApp}
        style={({ pressed }) => [styles.bubble, pressed && styles.bubblePressed]}
      >
        <FontAwesome name="whatsapp" size={28} color={brand.white} />
      </Pressable>
    </View>
  );
}

const BUBBLE = 56;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 50,
    alignItems: 'flex-end',
  },
  bubble: {
    width: BUBBLE,
    height: BUBBLE,
    borderRadius: BUBBLE / 2,
    backgroundColor: WHATSAPP_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 6,
  },
  bubblePressed: { opacity: 0.92, transform: [{ scale: 0.96 }] },
});
