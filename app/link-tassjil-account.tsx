import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { AuthHeroSheetLayout, authSheetStyles } from '@/components/auth/AuthHeroSheetLayout';
import { Text } from '@/components/ui/Text';
import { ETAWJIHI_TRANSFER_SUPPORT_PHONE, supportPhoneWaDigits } from '@/constants/etawjihiSupport';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { initiateLegacyLink } from '@/services/tassjilInscriptions';
import { brand } from '@/theme/tokens';
import { getUserFacingApiError } from '@/utils/apiError';
import { openWhatsAppChat } from '@/utils/openWhatsApp';

const s = authSheetStyles;

export default function LinkTassjilAccountScreen() {
  const router = useRouter();
  const { getValidAccessToken, reloadMe } = useAuth();
  const { t, isRTL } = useLocale();
  const rtl = isRTL;

  const [submitting, setSubmitting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runAutoLink = useCallback(async () => {
    setError(null);
    setSubmitting(true);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        router.replace('/login');
        return;
      }
      const res = await initiateLegacyLink(token);
      if (res.data?.linked) {
        await reloadMe();
        router.replace('/tassjil-school-choices');
        return;
      }
      if (!res.success) {
        setError(res.message ?? t('tassjilLinkErrGeneric'));
        return;
      }
      setError(res.message ?? t('tassjilLinkInitiateNeutral'));
    } catch (e) {
      setError(getUserFacingApiError(e, t, { context: 'auth' }));
    } finally {
      setSubmitting(false);
    }
  }, [getValidAccessToken, reloadMe, router, t]);

  useEffect(() => {
    void runAutoLink();
  }, [runAutoLink]);

  const openSupport = () => {
    void openWhatsAppChat({
      message: t('tassjilLinkSupportMessage'),
      phoneWaDigits: supportPhoneWaDigits(ETAWJIHI_TRANSFER_SUPPORT_PHONE),
    });
  };

  return (
    <AuthHeroSheetLayout
      title={t('tassjilLinkTitle')}
      subtitle={t('tassjilLinkSubtitle')}
      onBack={() => router.back()}
    >
      <View style={s.infoCard}>
        <FontAwesome name="link" size={18} color={brand.primary} />
        <Text style={[s.infoCardTxt, rtl && s.rtl]}>{t('tassjilLinkIntro')}</Text>
      </View>

      {submitting ? (
        <View style={s.cta}>
          <ActivityIndicator color={brand.white} />
        </View>
      ) : (
        <>
          {error ? <Text style={[s.errorText, rtl && s.rtl]}>{error}</Text> : null}
          <Pressable
            accessibilityRole="button"
            onPress={() => void runAutoLink()}
            style={({ pressed }) => [s.cta, pressed && s.ctaPressed]}
          >
            <Text style={s.ctaText}>{t('tassjilLinkCta')}</Text>
          </Pressable>
        </>
      )}

      <Pressable onPress={openSupport} style={s.linkRow}>
        <Text style={[s.linkTxt, rtl && s.rtl]}>{t('tassjilLinkSupport')}</Text>
      </Pressable>
    </AuthHeroSheetLayout>
  );
}
