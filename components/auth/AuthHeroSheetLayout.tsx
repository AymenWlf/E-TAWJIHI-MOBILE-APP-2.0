import FontAwesome from '@expo/vector-icons/FontAwesome';
import { type ReactNode, useEffect } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeroLangSwitch } from '@/components/ui/HeroLangSwitch';
import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { CAIRO } from '@/theme/arabicTypography';
import { brand, spacing } from '@/theme/tokens';

const BLUE = brand.primary;
const MINT = brand.success;

type Props = {
  title: string;
  subtitle?: string;
  stepLabel?: string;
  onBack?: () => void;
  backLabel?: string;
  children: ReactNode;
  footer?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function AuthHeroSheetLayout({
  title,
  subtitle,
  stepLabel,
  onBack,
  backLabel,
  children,
  footer,
  contentContainerStyle,
}: Props) {
  const { isRTL, t } = useLocale();
  const rtl = isRTL;
  const { bottom: safeBottom } = useSafeAreaInsets();

  const keyboard = useAnimatedKeyboard();
  const sheetLiftStyle = useAnimatedStyle(() => {
    const lift = Math.min(keyboard.height.value * 0.36, 110);
    return { transform: [{ translateY: -lift }] };
  });
  const keyboardSpacerStyle = useAnimatedStyle(() => ({
    height: keyboard.height.value + safeBottom + spacing.xl,
  }));

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
    opacity: 0.1 + glow.value * 0.1,
    transform: [{ scale: 1 + glow.value * 0.04 }],
  }));

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
          {onBack ? (
            <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
              <FontAwesome name={rtl ? 'arrow-right' : 'arrow-left'} size={16} color={brand.white} />
              <Text style={[styles.backBtnTxt, rtl && styles.rtl]}>
                {backLabel ?? t('forgotBackToLogin')}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.backPlaceholder} />
          )}
          <HeroLangSwitch />
        </View>

        <View style={styles.topLogoCenter}>
          <Image
            source={require('../../assets/images/logo-transparent.png')}
            resizeMode="contain"
            style={styles.topLogo}
            accessibilityLabel="E-Tawjihi"
          />
          {stepLabel ? (
            <View style={styles.stepPill}>
              <Text style={styles.stepPillTxt}>{stepLabel}</Text>
            </View>
          ) : null}
        </View>
      </SafeAreaView>

      <Animated.View style={[styles.bottomPanel, sheetLiftStyle]}>
        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={[styles.sheetContent, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sheetHandle} />
          <Text style={[styles.sheetTitle, rtl && styles.rtl]}>{title}</Text>
          {subtitle ? <Text style={[styles.sheetSub, rtl && styles.rtl]}>{subtitle}</Text> : null}
          {children}
          {footer}
          <Animated.View style={keyboardSpacerStyle} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

export const authSheetStyles = StyleSheet.create({
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239,68,68,0.07)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: brand.error,
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
    fontWeight: '900',
    color: brand.text,
    marginBottom: spacing.sm,
    fontFamily: CAIRO.bold,
  },
  fieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: brand.border,
    backgroundColor: brand.backgroundSoft,
    overflow: 'hidden',
  },
  fieldWrapRtl: { flexDirection: 'row-reverse' },
  fieldWrapError: {
    borderColor: brand.error,
    backgroundColor: 'rgba(239,68,68,0.04)',
  },
  fieldIconWrap: {
    width: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: brand.text,
    paddingVertical: 0,
    fontFamily: CAIRO.bold,
  },
  fieldHint: {
    marginTop: 5,
    marginLeft: 2,
    fontSize: 12,
    color: brand.error,
    fontWeight: '700',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: 'rgba(51,62,143,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.12)',
    marginBottom: spacing.lg,
  },
  infoCardTxt: {
    flex: 1,
    fontSize: 13,
    color: brand.textSecondary,
    lineHeight: 19,
    fontWeight: '600',
  },
  cta: {
    height: 54,
    marginTop: spacing.xl,
    borderRadius: 999,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BLUE,
    shadowOpacity: 0.38,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  ctaPressed: { opacity: 0.88 },
  ctaDisabled: {
    backgroundColor: 'rgba(51,62,143,0.42)',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaText: {
    color: brand.white,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.2,
    fontFamily: CAIRO.black,
  },
  linkRow: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  linkTxt: {
    color: BLUE,
    fontSize: 13,
    fontWeight: '800',
    textDecorationLine: 'underline',
    fontFamily: CAIRO.bold,
  },
  successCard: {
    marginTop: spacing.md,
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: 20,
    backgroundColor: brand.backgroundSoft,
    borderWidth: 1,
    borderColor: brand.border,
    gap: spacing.sm,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: brand.text,
    fontFamily: CAIRO.black,
    textAlign: 'center',
  },
  successBody: {
    fontSize: 14,
    color: brand.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '600',
  },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
});

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
  topBubble: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  topBubble1: { width: 180, height: 180, top: 60, left: -70 },
  topBubble2: {
    width: 130,
    height: 130,
    top: 30,
    right: -50,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  topRow: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  backBtnTxt: { color: brand.white, fontSize: 13, fontWeight: '700' },
  backPlaceholder: { flex: 1 },
  topLogoCenter: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl * 2.2,
    gap: spacing.sm,
  },
  topLogo: { width: 72, height: 72 },
  stepPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  stepPillTxt: {
    color: brand.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  bottomPanel: { flex: 1, justifyContent: 'flex-end' },
  sheetScroll: {
    flex: 1,
    backgroundColor: brand.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  sheetContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl + 4,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: brand.border,
    alignSelf: 'center',
  },
  sheetTitle: {
    marginTop: spacing.lg,
    fontSize: 20,
    color: brand.text,
    fontWeight: '900',
    letterSpacing: -0.2,
    fontFamily: CAIRO.black,
  },
  sheetSub: {
    marginTop: spacing.sm,
    fontSize: 15,
    color: brand.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 21,
    fontWeight: '600',
  },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
});
