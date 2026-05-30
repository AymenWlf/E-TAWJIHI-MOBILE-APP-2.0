import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect } from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlatformSheetOverlay } from '@/components/ui/PlatformSheetOverlay';
import { Text } from '@/components/ui/Text';
import type { HomeCopyKey } from '@/constants/i18n';
import { useLocale } from '@/contexts/LocaleContext';
import type { AppUpdatePolicy } from '@/services/appUpdate';
import { getStoreUrlForPlatform } from '@/services/appUpdate';
import { brand, radius, spacing } from '@/theme/tokens';

const LOGO_URI = 'https://cdn.e-tawjihi.ma/logo-rectantgle-simple-nobg.png';

type Props = {
  visible: boolean;
  required: boolean;
  policy: AppUpdatePolicy;
  onLater?: () => void;
};

export function AppUpdateModal({ visible, required, policy, onLater }: Props) {
  const { t, isRTL, locale } = useLocale();
  const enter = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      enter.value = 0;
      enter.value = withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) });
    }
  }, [enter, visible]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 20 }],
  }));

  const titleKey: HomeCopyKey = required ? 'appUpdateTitleRequired' : 'appUpdateTitleRecommended';
  const body =
    locale === 'ar' && policy.messageAr.trim() !== '' ? policy.messageAr : policy.message;

  const openStore = () => {
    const url = getStoreUrlForPlatform(policy);
    void Linking.openURL(url).catch(() => {
      /* store indisponible */
    });
  };

  return (
    <PlatformSheetOverlay
      visible={visible}
      zIndex={9500}
      onRequestClose={required ? undefined : onLater}
    >
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[styles.card, cardStyle]}>
              <Image
                source={{ uri: LOGO_URI }}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="E-TAWJIHI"
              />

              <View style={styles.iconWrap}>
                <FontAwesome name="mobile" size={28} color={brand.white} />
              </View>

              <Text style={[styles.eyebrow, isRTL && styles.rtlText]}>{t('appUpdateEyebrow')}</Text>
              <Text style={[styles.title, isRTL && styles.rtlText]}>{t(titleKey)}</Text>

              {body.trim() !== '' ? (
                <Text style={[styles.body, isRTL && styles.rtlText]}>{body}</Text>
              ) : null}

              <Text style={[styles.versionHint, isRTL && styles.rtlText]}>
                {t('appUpdateVersionHint')
                  .replace('{current}', policy.clientVersion)
                  .replace('{latest}', policy.latestVersion)}
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('appUpdateCta')}
                onPress={openStore}
                style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPressed]}
              >
                <FontAwesome
                  name={required ? 'download' : 'external-link'}
                  size={16}
                  color={brand.white}
                  style={styles.btnIcon}
                />
                <Text style={styles.btnPrimaryLabel}>{t('appUpdateCta')}</Text>
              </Pressable>

              {!required && onLater ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('appUpdateLater')}
                  onPress={onLater}
                  style={({ pressed }) => [styles.btnGhost, pressed && styles.btnGhostPressed]}
                >
                  <Text style={styles.btnGhostLabel}>{t('appUpdateLater')}</Text>
                </Pressable>
              ) : null}
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </PlatformSheetOverlay>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  card: {
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  logo: {
    width: '88%',
    maxWidth: 280,
    height: 64,
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: brand.emerald,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  versionHint: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    backgroundColor: brand.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  btnPressed: {
    opacity: 0.9,
  },
  btnIcon: {
    marginEnd: 2,
  },
  btnPrimaryLabel: {
    color: brand.white,
    fontSize: 16,
    fontWeight: '700',
  },
  btnGhost: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  btnGhostPressed: {
    opacity: 0.7,
  },
  btnGhostLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: brand.primary,
  },
  rtlText: {
    writingDirection: 'rtl',
    textAlign: 'center',
  },
});
