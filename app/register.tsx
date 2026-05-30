import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { HeroLangSwitch } from '@/components/ui/HeroLangSwitch';
import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { useAuth } from '@/contexts/AuthContext';
import { CAIRO } from '@/theme/arabicTypography';
import { brand, radius, spacing } from '@/theme/tokens';
import { errorMessage } from '@/utils/errorMessage';
import { isValidMoroccoMobile10, sanitizeMoroccoMobileInput } from '@/utils/moroccoMobilePhone';
import { evaluateAccountPassword, isStrongAccountPassword } from '@/utils/accountPasswordPolicy';

const BLUE = brand.primary;
const MINT = brand.success;

const FIELD_SCROLL_INSET = 28;

export default function RegisterScreen() {
  const { isRTL, t } = useLocale();
  const { register } = useAuth();
  const { bottom: safeBottom } = useSafeAreaInsets();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [touched, setTouched] = useState({ phone: false, password: false, confirm: false });

  const scrollRef = useRef<ScrollView>(null);
  const blockYRef = useRef({ phone: 0, password: 0, confirm: 0 });
  const passwordRef = useRef<TextInput>(null);

  // Keyboard-driven sheet lift — 100% UI thread, no setState → no flicker
  // On lève la feuille juste assez pour dégager le bas du formulaire (max 110 px)
  const keyboard = useAnimatedKeyboard();
  const sheetLiftStyle = useAnimatedStyle(() => {
    const lift = Math.min(keyboard.height.value * 0.36, 110);
    return { transform: [{ translateY: -lift }] };
  });
  const keyboardSpacerStyle = useAnimatedStyle(() => ({
    height: keyboard.height.value + safeBottom + spacing.xl,
  }));
  const confirmRef = useRef<TextInput>(null);

  // Same subtle blue animation as login
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


  const scrollToFieldBlock = (key: 'phone' | 'password' | 'confirm') => {
    const y = Math.max(0, blockYRef.current[key] - FIELD_SCROLL_INSET);
    setTimeout(() => scrollRef.current?.scrollTo({ y, animated: true }), 180);
  };

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

  const rtl = isRTL;

  const passwordRules = useMemo(() => evaluateAccountPassword(password), [password]);
  const passwordStrong = useMemo(() => isStrongAccountPassword(password), [password]);

  const v = useMemo(() => {
    const phoneOk = isValidMoroccoMobile10(phone);
    const passwordOk = passwordStrong;
    const confirmOk = confirm.length >= 8;
    const match = passwordOk && confirmOk && password === confirm;
    return {
      phoneOk,
      passwordOk,
      confirmOk,
      match,
      canSubmit: phoneOk && passwordOk && confirmOk && match && !submitting,
      phoneError: touched.phone && !phoneOk ? t('loginInvalidPhone') : '',
      passwordError: touched.password && !passwordOk ? t('registerPasswordWeak') : '',
      confirmError: touched.confirm && !confirmOk ? t('registerInvalidConfirm') : '',
      matchError: touched.confirm && confirmOk && passwordOk && !match ? t('registerPasswordsMismatch') : '',
    };
  }, [confirm, password, passwordStrong, phone, submitting, t, touched.confirm, touched.password, touched.phone]);

  async function onSubmit() {
    setTouched({ phone: true, password: true, confirm: true });
    setServerError('');
    if (!v.canSubmit) return;
    setSubmitting(true);
    try {
      // Navigation handled by useSetupRedirectGate in _layout.tsx
      await register(phone.trim(), password);
    } catch (e: unknown) {
      setServerError(errorMessage(e, t, 'auth'));
    } finally {
      setSubmitting(false);
    }
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
          <HeroLangSwitch />
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

      {/* ─── FEUILLE BLANCHE — remonte avec le clavier (UI thread) ───── */}
      <Animated.View style={[styles.bottomPanel, sheetLiftStyle]}>
        <ScrollView
          ref={scrollRef}
          style={styles.sheetScroll}
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          showsVerticalScrollIndicator={false}
          accessibilityLabel="Register"
        >
          <View style={styles.sheetHandle} />
          <Text style={[styles.sheetTitle, rtl && styles.rtl]}>{t('registerTitle')}</Text>
          <Text style={[styles.sheetSub, rtl && styles.rtl]}>{t('registerSubtitle')}</Text>

          {!!serverError && (
            <View style={styles.errorRow}>
              <FontAwesome name="exclamation-circle" size={14} color={brand.error} />
              <Text style={styles.errorText}>{serverError}</Text>
            </View>
          )}

          <View
            onLayout={(e) => {
              blockYRef.current.phone = e.nativeEvent.layout.y;
            }}
          >
            <Text style={[styles.label, rtl && styles.rtl]}>{t('registerPhoneLabel')}</Text>
            <View style={[styles.fieldWrap, rtl && styles.fieldWrapRtl, v.phoneError ? styles.fieldWrapError : undefined]}>
              <View style={styles.fieldIconWrap}>
                <FontAwesome name="phone" size={17} color={v.phoneError ? brand.error : BLUE} />
              </View>
              <TextInput
                value={phone}
                onChangeText={(text) => setPhone(sanitizeMoroccoMobileInput(text))}
                onFocus={() => scrollToFieldBlock('phone')}
                onBlur={() => setTouched((s) => ({ ...s, phone: true }))}
                onSubmitEditing={() => passwordRef.current?.focus()}
                placeholder={t('registerPhonePlaceholder')}
                placeholderTextColor={brand.textMuted}
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                returnKeyType="next"
                maxLength={10}
                style={[styles.fieldInput, rtl && styles.rtl]}
              />
            </View>
            {!!v.phoneError && <Text style={[styles.fieldHint, rtl && styles.rtl]}>{v.phoneError}</Text>}
          </View>

          <View
            style={{ marginTop: spacing.lg }}
            onLayout={(e) => {
              blockYRef.current.password = e.nativeEvent.layout.y;
            }}
          >
            <Text style={[styles.label, rtl && styles.rtl]}>{t('registerPasswordLabel')}</Text>
            <View style={[styles.fieldWrap, rtl && styles.fieldWrapRtl, styles.fieldWrapMt, v.passwordError ? styles.fieldWrapError : undefined]}>
              <View style={styles.fieldIconWrap}>
                <FontAwesome name="lock" size={17} color={v.passwordError ? brand.error : BLUE} />
              </View>
              <TextInput
                ref={passwordRef}
                value={password}
                onChangeText={setPassword}
                onFocus={() => scrollToFieldBlock('password')}
                onBlur={() => setTouched((s) => ({ ...s, password: true }))}
                onSubmitEditing={() => confirmRef.current?.focus()}
                placeholder={t('registerPasswordPlaceholder')}
                placeholderTextColor={brand.textMuted}
                secureTextEntry={!showPassword}
                autoComplete="password"
                textContentType="newPassword"
                returnKeyType="next"
                style={[styles.fieldInput, rtl && styles.rtl]}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Masquer' : 'Afficher'}
                onPress={() => setShowPassword((s) => !s)}
                hitSlop={12}
                style={styles.eyeBtn}
              >
                <FontAwesome name={showPassword ? 'eye-slash' : 'eye'} size={17} color={brand.textMuted} />
              </Pressable>
            </View>
            {!!v.passwordError && <Text style={[styles.fieldHint, rtl && styles.rtl]}>{v.passwordError}</Text>}
            {password.length > 0 ? (
              <View style={styles.passwordRulesBox}>
                <Text style={[styles.passwordRulesTitle, rtl && styles.rtl]}>{t('registerPasswordRulesTitle')}</Text>
                {(
                  [
                    ['minLength', t('registerPasswordRuleMinLength')],
                    ['hasUpperCase', t('registerPasswordRuleUpper')],
                    ['hasLowerCase', t('registerPasswordRuleLower')],
                    ['hasNumber', t('registerPasswordRuleNumber')],
                    ['hasSpecialChar', t('registerPasswordRuleSpecial')],
                  ] as const
                ).map(([key, label]) => {
                  const ok = passwordRules[key];
                  return (
                    <View key={key} style={[styles.passwordRuleRow, rtl && styles.passwordRuleRowRtl]}>
                      <FontAwesome
                        name={ok ? 'check-circle' : 'circle-o'}
                        size={13}
                        color={ok ? brand.success : brand.textMuted}
                      />
                      <Text style={[styles.passwordRuleTxt, ok && styles.passwordRuleTxtOk, rtl && styles.rtl]}>
                        {label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>

          <View
            style={{ marginTop: spacing.lg }}
            onLayout={(e) => {
              blockYRef.current.confirm = e.nativeEvent.layout.y;
            }}
          >
            <Text style={[styles.label, rtl && styles.rtl]}>{t('registerPasswordConfirmLabel')}</Text>
            <View
              style={[
                styles.fieldWrap,
                rtl && styles.fieldWrapRtl,
                styles.fieldWrapMt,
                (v.confirmError || v.matchError) ? styles.fieldWrapError : undefined,
              ]}
            >
              <View style={styles.fieldIconWrap}>
                <FontAwesome name="lock" size={17} color={(v.confirmError || v.matchError) ? brand.error : BLUE} />
              </View>
              <TextInput
                ref={confirmRef}
                value={confirm}
                onChangeText={setConfirm}
                onFocus={() => scrollToFieldBlock('confirm')}
                onBlur={() => setTouched((s) => ({ ...s, confirm: true }))}
                onSubmitEditing={onSubmit}
                placeholder={t('registerPasswordConfirmPlaceholder')}
                placeholderTextColor={brand.textMuted}
                secureTextEntry={!showConfirm}
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
                style={[styles.fieldInput, rtl && styles.rtl]}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showConfirm ? 'Masquer' : 'Afficher'}
                onPress={() => setShowConfirm((s) => !s)}
                hitSlop={12}
                style={styles.eyeBtn}
              >
                <FontAwesome name={showConfirm ? 'eye-slash' : 'eye'} size={17} color={brand.textMuted} />
              </Pressable>
            </View>
            {!!v.confirmError && <Text style={[styles.fieldHint, rtl && styles.rtl]}>{v.confirmError}</Text>}
            {!!v.matchError && <Text style={[styles.fieldHint, rtl && styles.rtl]}>{v.matchError}</Text>}
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={!v.canSubmit}
            onPress={onSubmit}
            style={({ pressed }) => [
              styles.cta,
              !v.canSubmit && styles.ctaDisabled,
              pressed && v.canSubmit && styles.ctaPressed,
            ]}
          >
            {submitting ? <ActivityIndicator color={brand.white} /> : <Text style={styles.ctaText}>{t('registerCta')}</Text>}
          </Pressable>

          <View style={[styles.signupRow, rtl && styles.signupRowRtl]}>
            <Text style={[styles.signupHint, rtl && styles.rtl]}>{t('registerHaveAccount')}</Text>
            <Pressable accessibilityRole="button" onPress={() => router.replace('/login')} hitSlop={8}>
              <Text style={[styles.signupLink, rtl && styles.rtl]}>{t('registerLoginLink')}</Text>
            </Pressable>
          </View>

          {/* Espaceur animé : laisse scroller sous le clavier sans setState */}
          <Animated.View style={keyboardSpacerStyle} />
        </ScrollView>
      </Animated.View>
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
    paddingBottom: spacing.xxl * 3,
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

  bottomPanel: { flex: 1, justifyContent: 'flex-end' },
  bottomPanelKeyboard: { zIndex: 40, elevation: 24 },
  sheetPressable: { flex: 1 },
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
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: brand.border, alignSelf: 'center' },
  sheetTitle: {
    marginTop: spacing.lg,
    fontSize: 20,
    color: brand.text,
    fontWeight: '900',
    letterSpacing: -0.2,
    fontFamily: CAIRO.black,
  },
  sheetSub: { marginTop: spacing.sm, fontSize: 15, color: brand.textSecondary, marginBottom: spacing.md },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },

  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239,68,68,0.07)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: { flex: 1, fontSize: 13, color: brand.error, fontWeight: '700' },

  label: { fontSize: 13, fontWeight: '900', color: brand.text, marginBottom: spacing.sm, fontFamily: CAIRO.bold },
  labelMt: { marginTop: spacing.lg },

  fieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: brand.border,
    backgroundColor: brand.backgroundSoft,
    overflow: 'hidden',
  },
  fieldWrapRtl: { flexDirection: 'row-reverse' },
  fieldWrapMt: { marginTop: spacing.md },
  fieldWrapError: { borderColor: brand.error, backgroundColor: 'rgba(239,68,68,0.04)' },
  fieldIconWrap: { width: 46, alignItems: 'center', justifyContent: 'center' },
  fieldInput: { flex: 1, height: '100%', fontSize: 15, color: brand.text, paddingVertical: 0, fontFamily: CAIRO.bold },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  fieldHint: { marginTop: 5, marginLeft: 2, fontSize: 12, color: brand.error, fontWeight: '700' },
  passwordRulesBox: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: brand.backgroundSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    gap: 6,
  },
  passwordRulesTitle: { fontSize: 12, fontWeight: '800', color: brand.text, marginBottom: 2 },
  passwordRuleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  passwordRuleRowRtl: { flexDirection: 'row-reverse' },
  passwordRuleTxt: { flex: 1, fontSize: 12, color: brand.textMuted, fontWeight: '600' },
  passwordRuleTxtOk: { color: brand.success },

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
  ctaDisabled: { backgroundColor: 'rgba(51,62,143,0.42)', shadowOpacity: 0, elevation: 0 },
  ctaText: { color: brand.white, fontSize: 16, fontWeight: '900', letterSpacing: 0.2, fontFamily: CAIRO.black },

  signupRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  signupRowRtl: { flexDirection: 'row-reverse' },
  signupHint: { color: brand.textMuted, fontSize: 13, fontWeight: '700' },
  signupLink: { color: BLUE, fontSize: 13, fontWeight: '900', fontFamily: CAIRO.black },
});

