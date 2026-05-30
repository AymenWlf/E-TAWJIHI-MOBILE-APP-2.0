import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';

import { AuthHeroSheetLayout, authSheetStyles } from '@/components/auth/AuthHeroSheetLayout';
import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { resetPasswordWithToken, validateResetPasswordToken } from '@/services/auth';
import { brand } from '@/theme/tokens';
import { getUserFacingApiError } from '@/utils/apiError';

const BLUE = brand.primary;
const s = authSheetStyles;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token: tokenParam } = useLocalSearchParams<{ token?: string }>();
  const token = typeof tokenParam === 'string' ? tokenParam : Array.isArray(tokenParam) ? tokenParam[0] : '';
  const { t, isRTL } = useLocale();
  const rtl = isRTL;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token?.trim()) {
      setError(t('resetPasswordErrToken'));
      setValidating(false);
      return;
    }
    void (async () => {
      try {
        const res = await validateResetPasswordToken(token.trim());
        setTokenValid(Boolean(res.success));
        if (!res.success) setError(res.message ?? t('resetPasswordErrToken'));
      } catch (e) {
        setError(getUserFacingApiError(e, t, { context: 'auth' }));
      } finally {
        setValidating(false);
      }
    })();
  }, [token, t]);

  const canSubmit = useMemo(
    () => password.length >= 8 && password === confirm && tokenValid && !submitting,
    [password, confirm, tokenValid, submitting],
  );

  const onSubmit = async () => {
    if (!token?.trim()) return;
    setError(null);
    if (password !== confirm) {
      setError(t('resetPasswordErrMatch'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await resetPasswordWithToken(token.trim(), password);
      if (!res.success) {
        setError(res.message ?? t('commonErrorGeneric'));
        return;
      }
      setDone(true);
      setTimeout(() => router.replace('/login'), 2500);
    } catch (e) {
      setError(getUserFacingApiError(e, t, { context: 'auth' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthHeroSheetLayout
      stepLabel={t('resetFlowStep3')}
      title={t('resetPasswordTitle')}
      subtitle={done ? undefined : validating ? undefined : t('resetPasswordSubtitle')}
      onBack={() => (done ? router.replace('/login') : router.back())}
    >
      {validating ? (
        <ActivityIndicator color={BLUE} style={{ marginTop: 24 }} />
      ) : done ? (
        <View style={s.successCard}>
          <FontAwesome name="check-circle" size={40} color={brand.success} />
          <Text style={[s.successTitle, rtl && s.rtl]}>{t('resetPasswordDoneTitle')}</Text>
          <Text style={[s.successBody, rtl && s.rtl]}>{t('resetPasswordDoneBody')}</Text>
        </View>
      ) : !tokenValid ? (
        <>
          <View style={s.errorRow}>
            <FontAwesome name="exclamation-circle" size={14} color={brand.error} />
            <Text style={s.errorText}>{error ?? t('resetPasswordErrToken')}</Text>
          </View>
          <Pressable onPress={() => router.replace('/forgot-password')} style={s.linkRow}>
            <Text style={[s.linkTxt, rtl && s.rtl]}>{t('verifyOtpResend')}</Text>
          </Pressable>
        </>
      ) : (
        <>
          {error ? (
            <View style={s.errorRow}>
              <FontAwesome name="exclamation-circle" size={14} color={brand.error} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={[s.label, rtl && s.rtl]}>{t('resetPasswordNew')}</Text>
          <View style={[s.fieldWrap, rtl && s.fieldWrapRtl, error ? s.fieldWrapError : undefined]}>
            <View style={s.fieldIconWrap}>
              <FontAwesome name="lock" size={17} color={BLUE} />
            </View>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={t('resetPasswordNew')}
              placeholderTextColor={brand.textMuted}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              textContentType="newPassword"
              style={[s.fieldInput, rtl && s.rtl]}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowPassword((v) => !v)}
              hitSlop={12}
              style={{ paddingHorizontal: 14 }}
            >
              <FontAwesome name={showPassword ? 'eye-slash' : 'eye'} size={17} color={brand.textMuted} />
            </Pressable>
          </View>

          <Text style={[s.label, { marginTop: 16 }, rtl && s.rtl]}>{t('resetPasswordConfirm')}</Text>
          <View style={[s.fieldWrap, rtl && s.fieldWrapRtl]}>
            <View style={s.fieldIconWrap}>
              <FontAwesome name="lock" size={17} color={BLUE} />
            </View>
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              placeholder={t('resetPasswordConfirm')}
              placeholderTextColor={brand.textMuted}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              style={[s.fieldInput, rtl && s.rtl]}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={!canSubmit}
            onPress={() => void onSubmit()}
            style={({ pressed }) => [s.cta, !canSubmit && s.ctaDisabled, pressed && canSubmit && s.ctaPressed]}
          >
            {submitting ? (
              <ActivityIndicator color={brand.white} />
            ) : (
              <Text style={s.ctaText}>{t('resetPasswordCta')}</Text>
            )}
          </Pressable>
        </>
      )}
    </AuthHeroSheetLayout>
  );
}
