import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { AuthHeroSheetLayout, authSheetStyles } from '@/components/auth/AuthHeroSheetLayout';
import { OtpCodeInput } from '@/components/auth/OtpCodeInput';
import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { verifyResetPasswordOtp } from '@/services/auth';
import { brand } from '@/theme/tokens';
import { getUserFacingApiError } from '@/utils/apiError';

const OTP_LENGTH = 6;
const s = authSheetStyles;

export default function VerifyResetOtpScreen() {
  const router = useRouter();
  const { phone: phoneParam } = useLocalSearchParams<{ phone?: string }>();
  const phone = typeof phoneParam === 'string' ? phoneParam : Array.isArray(phoneParam) ? phoneParam[0] : '';
  const { t, isRTL } = useLocale();
  const rtl = isRTL;

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const otp = useMemo(() => digits.join(''), [digits]);
  const canSubmit = otp.length === OTP_LENGTH && phone.length >= 10;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await verifyResetPasswordOtp(phone.trim(), otp);
      if (!res.success || !res.data?.resetToken) {
        setError(res.message ?? t('verifyOtpErrInvalid'));
        return;
      }
      router.replace({ pathname: '/reset-password', params: { token: res.data.resetToken } });
    } catch (e) {
      setError(getUserFacingApiError(e, t, { context: 'auth' }));
    } finally {
      setSubmitting(false);
    }
  };

  if (!phone) {
    return (
      <AuthHeroSheetLayout
        title={t('verifyOtpTitle')}
        subtitle={t('verifyOtpErrMissingPhone')}
        onBack={() => router.replace('/forgot-password')}
      >
        <Pressable onPress={() => router.replace('/forgot-password')} style={s.linkRow}>
          <Text style={s.linkTxt}>{t('forgotTitle')}</Text>
        </Pressable>
      </AuthHeroSheetLayout>
    );
  }

  return (
    <AuthHeroSheetLayout
      stepLabel={t('resetFlowStep2')}
      title={t('verifyOtpTitle')}
      subtitle={t('verifyOtpSubtitle').replace('{phone}', phone)}
      onBack={() => router.back()}
    >
      <View style={s.infoCard}>
        <FontAwesome name="commenting" size={18} color={brand.primary} />
        <Text style={[s.infoCardTxt, rtl && s.rtl]}>{t('verifyOtpHint')}</Text>
      </View>

      <OtpCodeInput
        value={digits}
        onChange={setDigits}
        isRTL={rtl}
        error={error}
        label={t('verifyOtpCodeLabel')}
      />

      <Pressable
        accessibilityRole="button"
        disabled={!canSubmit || submitting}
        onPress={() => void onSubmit()}
        style={({ pressed }) => [s.cta, (!canSubmit || submitting) && s.ctaDisabled, pressed && canSubmit && s.ctaPressed]}
      >
        {submitting ? (
          <ActivityIndicator color={brand.white} />
        ) : (
          <Text style={s.ctaText}>{t('verifyOtpCta')}</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.replace('/forgot-password')} style={s.linkRow}>
        <Text style={[s.linkTxt, rtl && s.rtl]}>{t('verifyOtpResend')}</Text>
      </Pressable>
    </AuthHeroSheetLayout>
  );
}
