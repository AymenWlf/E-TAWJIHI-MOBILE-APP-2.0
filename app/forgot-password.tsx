import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';

import { AuthHeroSheetLayout, authSheetStyles } from '@/components/auth/AuthHeroSheetLayout';
import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { checkForgotPasswordPhone } from '@/services/auth';
import { brand } from '@/theme/tokens';
import { getUserFacingApiError } from '@/utils/apiError';

const BLUE = brand.primary;
const s = authSheetStyles;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t, isRTL } = useLocale();
  const rtl = isRTL;
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneOk = useMemo(() => {
    const d = phone.replace(/\D/g, '');
    return d.length >= 10 && (d.startsWith('06') || d.startsWith('07') || d.startsWith('212'));
  }, [phone]);

  const onSubmit = async () => {
    setError(null);
    if (!phoneOk) {
      setError(t('loginInvalidPhone'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await checkForgotPasswordPhone(phone.trim());
      if (!res.success) {
        setError(res.message ?? t('commonErrorTitle'));
        return;
      }
      if (!res.data?.accountExists) {
        setError(t('forgotAccountNotFound'));
        return;
      }
      const phoneNational = res.data.phone?.trim() || phone.trim();
      router.push({ pathname: '/forgot-password-sent', params: { phone: phoneNational } });
    } catch (e) {
      setError(getUserFacingApiError(e, t, { context: 'auth' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthHeroSheetLayout
      stepLabel={t('resetFlowStep1')}
      title={t('forgotTitle')}
      subtitle={t('forgotSubtitleWhatsapp')}
      onBack={() => router.back()}
    >
      <View style={s.infoCard}>
        <FontAwesome name="whatsapp" size={20} color="#25D366" />
        <Text style={[s.infoCardTxt, rtl && s.rtl]}>{t('forgotInfoWhatsapp')}</Text>
      </View>

      {error ? (
        <View style={s.errorRow}>
          <FontAwesome name="exclamation-circle" size={14} color={brand.error} />
          <Text style={s.errorText}>{error}</Text>
        </View>
      ) : null}

      <Text style={[s.label, rtl && s.rtl]}>{t('forgotPhoneLabel')}</Text>
      <View style={[s.fieldWrap, rtl && s.fieldWrapRtl, error ? s.fieldWrapError : undefined]}>
        <View style={s.fieldIconWrap}>
          <FontAwesome name="phone" size={17} color={error ? brand.error : BLUE} />
        </View>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder={t('forgotPhonePlaceholder')}
          placeholderTextColor={brand.textMuted}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          style={[s.fieldInput, rtl && s.rtl]}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={!phoneOk || submitting}
        onPress={() => void onSubmit()}
        style={({ pressed }) => [s.cta, (!phoneOk || submitting) && s.ctaDisabled, pressed && phoneOk && s.ctaPressed]}
      >
        {submitting ? (
          <ActivityIndicator color={brand.white} />
        ) : (
          <Text style={s.ctaText}>{t('forgotCtaCheckPhone')}</Text>
        )}
      </Pressable>
    </AuthHeroSheetLayout>
  );
}
