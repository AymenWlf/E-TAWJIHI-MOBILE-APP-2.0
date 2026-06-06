import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect } from 'react';
import {
  Image,
  Linking,
  Platform,
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
import { StatusBar } from 'expo-status-bar';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import type { AppUpdatePolicy } from '@/services/appUpdate';
import { getStoreUrlForPlatform } from '@/services/appUpdate';
import { brand, radius, spacing } from '@/theme/tokens';

const LOGO_URI = 'https://cdn.e-tawjihi.ma/logo-rectantgle-simple-nobg.png';

type Props = {
  policy: AppUpdatePolicy;
};

export function AppUpdateRequiredScreen({ policy }: Props) {
  const { t, isRTL, locale } = useLocale();
  const enter = useSharedValue(0);

  useEffect(() => {
    enter.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) });
  }, [enter]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 16 }],
  }));

  const body =
    locale === 'ar' && policy.messageAr.trim() !== '' ? policy.messageAr : policy.message;

  const storeCta =
    Platform.OS === 'ios' ? t('appUpdateStoreCtaIos') : t('appUpdateStoreCtaAndroid');

  const openStore = () => {
    const url = getStoreUrlForPlatform(policy);
    void Linking.openURL(url).catch(() => {
      /* store indisponible */
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.blobTop} pointerEvents="none" />
      <View style={styles.blobBottom} pointerEvents="none" />

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
              <FontAwesome name="rocket" size={28} color={brand.white} />
            </View>

            <Text style={[styles.eyebrow, isRTL && styles.rtlText]}>{t('appUpdateEyebrow')}</Text>
            <Text style={[styles.title, isRTL && styles.rtlText]}>{t('appUpdateMajorTitle')}</Text>
            <Text style={[styles.lead, isRTL && styles.rtlText]}>{t('appUpdateMajorLead')}</Text>

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
              accessibilityLabel={storeCta}
              onPress={openStore}
              style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPressed]}
            >
              <FontAwesome
                name={Platform.OS === 'ios' ? 'apple' : 'android'}
                size={18}
                color={brand.white}
              />
              <Text style={styles.btnPrimaryLabel}>{storeCta}</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  blobTop: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: brand.primary,
    opacity: 0.1,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -80,
    left: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: brand.emerald,
    opacity: 0.1,
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
      },
      android: { elevation: 4 },
    }),
  },
  logo: {
    width: '88%',
    maxWidth: 300,
    height: 68,
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  lead: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    marginBottom: spacing.md,
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
  btnPrimaryLabel: {
    color: brand.white,
    fontSize: 16,
    fontWeight: '800',
  },
  rtlText: {
    writingDirection: 'rtl',
    textAlign: 'center',
  },
});
