import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSegments } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  buildEtawjihiSupportWhatsAppUrl,
  buildEtawjihiSupportWhatsAppNativeUrl,
} from '@/constants/etawjihiWhatsApp';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { fetchUserActiveServices } from '@/services/userActiveServices';
import { getUserProfile } from '@/services/userProfile';
import { brand, spacing } from '@/theme/tokens';
import {
  applyMessageTemplate,
  formatUserFullName,
  pickPrimaryContractNumber,
} from '@/utils/buildHubWhatsAppPrefill';

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
  const { user, isLoading, getValidAccessToken } = useAuth();
  const segments = useSegments();
  const route = segments.join('/');
  const [contractNumber, setContractNumber] = useState<string | null>(null);
  const [profileFullName, setProfileFullName] = useState('');

  const hidden = useMemo(() => {
    if (isLoading || !user) return true;
    return AUTH_ROUTE_PREFIXES.some((p) => route === p || route.startsWith(`${p}/`));
  }, [isLoading, user, route]);

  const bottom = TAB_BAR_EXTRA + Math.max(insets.bottom, spacing.sm) + spacing.sm;

  const authFullName = useMemo(
    () => formatUserFullName(user?.firstName, user?.lastName),
    [user?.firstName, user?.lastName],
  );

  const fullName = authFullName || profileFullName;

  useEffect(() => {
    if (!user) {
      setContractNumber(null);
      setProfileFullName('');
      return;
    }
    let cancelled = false;
    void (async () => {
      const token = await getValidAccessToken();
      if (!token || cancelled) return;
      try {
        const [services, profile] = await Promise.all([
          fetchUserActiveServices(token),
          authFullName ? Promise.resolve(null) : getUserProfile(token),
        ]);
        if (!cancelled) {
          setContractNumber(pickPrimaryContractNumber(services));
          if (!authFullName && profile) {
            setProfileFullName(formatUserFullName(profile.prenom, profile.nom));
          }
        }
      } catch {
        if (!cancelled) {
          setContractNumber(null);
          if (!authFullName) setProfileFullName('');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, getValidAccessToken, authFullName]);

  const buildPrefillMessage = useCallback(() => {
    if (!fullName) {
      return t('hubWhatsAppPrefill');
    }
    const contract = (contractNumber ?? '').trim() || t('hubWhatsAppContractUnknown');
    return applyMessageTemplate(t('hubWhatsAppPrefillClient'), {
      fullName,
      contractNumber: contract,
    });
  }, [contractNumber, fullName, t]);

  const openWhatsApp = useCallback(() => {
    const message = buildPrefillMessage();
    const nativeUrl = buildEtawjihiSupportWhatsAppNativeUrl(message);
    const webUrl = buildEtawjihiSupportWhatsAppUrl(message);
    void Linking.canOpenURL(nativeUrl)
      .then((ok) => Linking.openURL(ok ? nativeUrl : webUrl))
      .catch(() => {
        void Linking.openURL(webUrl);
      });
  }, [buildPrefillMessage]);

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
