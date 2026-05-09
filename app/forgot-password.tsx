import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useEffect } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { CAIRO } from '@/theme/arabicTypography';
import { brand, radius, spacing } from '@/theme/tokens';

const BLUE = brand.primary;
const MINT = brand.success;
const WHATSAPP_URL =
  'https://api.whatsapp.com/send/?phone=212784536246&text=Mot+de+passe+oubli%C3%A9&type=phone_number&app_absent=0';

export default function ForgotPasswordScreen() {
  const { isRTL, locale, setLocale, t } = useLocale();
  const rtl = isRTL;

  const float = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 3200, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [float, glow]);

  const bubble1Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: -18 + float.value * 18 },
      { translateX: -10 + float.value * 10 },
    ],
    opacity: 0.18 + float.value * 0.06,
  }));
  const bubble2Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: 10 - float.value * 16 },
      { translateX: 12 - float.value * 8 },
    ],
    opacity: 0.12 + (1 - float.value) * 0.06,
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.10 + glow.value * 0.10,
    transform: [{ scale: 1 + glow.value * 0.04 }],
  }));

  async function onOpenWhatsapp() {
    const can = await Linking.canOpenURL(WHATSAPP_URL);
    if (can) await Linking.openURL(WHATSAPP_URL);
    else await Linking.openURL(WHATSAPP_URL);
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView edges={['top']} style={styles.topSafe}>
        <View style={styles.topBgLayer} pointerEvents="none">
          <Animated.View style={[styles.topGlow, glowStyle]} />
          <Animated.View style={[styles.topBubble, styles.topBubble1, bubble1Style]} />
          <Animated.View style={[styles.topBubble, styles.topBubble2, bubble2Style]} />
        </View>

        <View style={styles.topRow}>
          <View style={styles.langSwitchWrap} accessibilityLabel={t('languageSwitcher')}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setLocale('fr')}
              style={[styles.langPill, locale === 'fr' && styles.langPillActive]}
            >
              <Text style={[styles.langPillTxt, locale === 'fr' && styles.langPillTxtActive]}>{t('langFr')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setLocale('ar')}
              style={[styles.langPill, locale === 'ar' && styles.langPillActive]}
            >
              <Text style={[styles.langPillTxt, locale === 'ar' && styles.langPillTxtActive]}>{t('langAr')}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.topLogoCenter}>
          <Image
            source={require('../assets/images/logo-transparent.png')}
            resizeMode="contain"
            style={styles.topLogo}
            accessibilityLabel="E-Tawjihi"
          />
          <Text style={[styles.brandSubtitle, rtl && styles.rtl]}>{t('loginBrandSubtitle')}</Text>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.bottomPanel}>
        <View style={styles.sheet} accessibilityLabel="Forgot password">
          <View style={styles.sheetHandle} />
          <Text style={[styles.sheetTitle, rtl && styles.rtl]}>{t('forgotTitle')}</Text>
          <Text style={[styles.sheetSub, rtl && styles.rtl]}>{t('forgotSubtitle')}</Text>

          <View style={styles.instructions}>
            <Text style={[styles.instructionsTitle, rtl && styles.rtl]}>{t('forgotInstructionsTitle')}</Text>
            <Text style={[styles.instructionsLine, rtl && styles.rtl]}>{t('forgotInstructionsLine1')}</Text>
            <Text style={[styles.instructionsLine, rtl && styles.rtl]}>{t('forgotInstructionsLine2')}</Text>
            <Text style={[styles.instructionsLine, rtl && styles.rtl]}>{t('forgotInstructionsLine3')}</Text>
          </View>

          <Pressable accessibilityRole="button" onPress={onOpenWhatsapp} style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
            <View style={styles.whatsRow}>
              <FontAwesome name="whatsapp" size={18} color={brand.white} />
              <Text style={styles.ctaText}>{t('forgotCta')}</Text>
            </View>
          </Pressable>

          <Pressable accessibilityRole="button" onPress={() => router.replace('/login')} style={styles.backRow}>
            <Text style={[styles.backText, rtl && styles.rtl]}>{t('forgotBackToLogin')}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BLUE },

  topSafe: { backgroundColor: BLUE },
  topBgLayer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  topGlow: {
    position: 'absolute',
    top: -120,
    left: '50%',
    width: 320,
    height: 320,
    marginLeft: -160,
    borderRadius: 160,
    backgroundColor: MINT,
  },
  topBubble: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.16)' },
  topBubble1: { width: 180, height: 180, top: 60, left: -70 },
  topBubble2: { width: 130, height: 130, top: 30, right: -50, backgroundColor: 'rgba(255,255,255,0.12)' },

  topRow: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  topLogoCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl * 2,
  },
  topLogo: { width: 92, height: 92 },
  brandSubtitle: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
    maxWidth: 360,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.80)',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },

  langSwitchWrap: {
    flexDirection: 'row',
    backgroundColor: brand.backgroundSoft,
    borderRadius: 999,
    padding: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    gap: 4,
  },
  langPill: { height: 28, paddingHorizontal: 10, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  langPillActive: { backgroundColor: 'rgba(51,62,143,0.12)' },
  langPillTxt: { fontSize: 12, fontWeight: '900', color: brand.textMuted },
  langPillTxtActive: { color: BLUE },

  bottomPanel: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    flex: 1,
    backgroundColor: brand.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: spacing.xl + 4,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: brand.border, alignSelf: 'center' },
  sheetTitle: { marginTop: spacing.lg, fontSize: 20, color: brand.text, fontWeight: '900', letterSpacing: -0.2, fontFamily: CAIRO.black },
  sheetSub: { marginTop: spacing.sm, fontSize: 15, color: brand.textSecondary, marginBottom: spacing.md },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },

  instructions: {
    backgroundColor: brand.backgroundSoft,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  instructionsTitle: { fontSize: 13, fontWeight: '900', color: brand.text, marginBottom: spacing.sm, fontFamily: CAIRO.black },
  instructionsLine: { fontSize: 13, color: brand.textSecondary, lineHeight: 18, marginBottom: 6 },

  cta: {
    height: 54,
    borderRadius: 999,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BLUE,
    shadowOpacity: 0.38,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    marginTop: spacing.xl,
  },
  ctaPressed: { opacity: 0.88 },
  ctaText: { color: brand.white, fontSize: 15, fontWeight: '900', letterSpacing: 0.2, fontFamily: CAIRO.black, textAlign: 'center' },
  whatsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backRow: { marginTop: spacing.lg, alignItems: 'center' },
  backText: { color: BLUE, fontSize: 13, fontWeight: '900' },
});

