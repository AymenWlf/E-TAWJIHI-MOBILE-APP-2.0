import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Clipboard, Linking, Pressable, View } from 'react-native';

import { AuthHeroSheetLayout, authSheetStyles } from '@/components/auth/AuthHeroSheetLayout';
import { Text } from '@/components/ui/Text';
import {
  buildEtawjihiWhatsAppNativeUrl,
  buildEtawjihiWhatsAppUrl,
  formatEtawjihiOfficialWhatsAppDisplay,
  formatMoroccoPhoneDisplay,
} from '@/constants/etawjihiWhatsApp';
import { useLocale } from '@/contexts/LocaleContext';
import { brand, spacing } from '@/theme/tokens';

const s = authSheetStyles;
const WA_GREEN = '#25D366';

export default function ForgotPasswordSentScreen() {
  const router = useRouter();
  const { phone: phoneParam } = useLocalSearchParams<{ phone?: string }>();
  const phone = typeof phoneParam === 'string' ? phoneParam : Array.isArray(phoneParam) ? phoneParam[0] : '';
  const { t, isRTL } = useLocale();
  const rtl = isRTL;

  const phoneDisplay = useMemo(() => formatMoroccoPhoneDisplay(phone), [phone]);

  const whatsappMessage = useMemo(
    () => t('forgotWhatsappMessage').replace(/\{\{phone\}\}/g, phoneDisplay),
    [t, phoneDisplay],
  );

  const whatsappHref = useMemo(() => buildEtawjihiWhatsAppUrl(whatsappMessage), [whatsappMessage]);
  const officialWhatsappDisplay = useMemo(() => formatEtawjihiOfficialWhatsAppDisplay(), []);

  const copyMessage = () => {
    void Clipboard.setString(whatsappMessage);
    Alert.alert(t('forgotCopied'));
  };

  const openWhatsApp = () => {
    const native = buildEtawjihiWhatsAppNativeUrl(whatsappMessage);
    void Linking.canOpenURL(native).then((ok) => {
      void Linking.openURL(ok ? native : whatsappHref).catch(() => {
        void Linking.openURL(whatsappHref);
      });
    });
  };

  if (!phone) {
    return (
      <AuthHeroSheetLayout title={t('forgotTitle')} onBack={() => router.replace('/forgot-password')}>
        <Text style={[s.errorText, rtl && s.rtl]}>{t('verifyOtpErrMissingPhone')}</Text>
      </AuthHeroSheetLayout>
    );
  }

  return (
    <AuthHeroSheetLayout
      stepLabel={t('resetFlowStep2')}
      title={t('forgotAccountFoundTitle')}
      subtitle={t('forgotAccountFoundIntro')}
      onBack={() => router.replace('/forgot-password')}
    >
      <Text style={[s.label, rtl && s.rtl]}>{t('forgotWhatsappMessageLabel')}</Text>
      <View style={[s.infoCard, { backgroundColor: '#f8fafc' }]}>
        <Text style={[s.infoCardTxt, rtl && s.rtl, { color: brand.text }]} selectable>
          {whatsappMessage}
        </Text>
      </View>

      <Text style={[s.label, rtl && s.rtl, { marginTop: spacing.sm }]}>{t('forgotWhatsappContactLabel')}</Text>
      <View style={[s.infoCard, { borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }]}>
        <FontAwesome name="whatsapp" size={20} color={WA_GREEN} />
        <Text style={[s.infoCardTxt, rtl && s.rtl, { fontWeight: '700', color: brand.text }]} selectable>
          {officialWhatsappDisplay}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={copyMessage}
        style={({ pressed }) => [
          s.cta,
          { backgroundColor: brand.white, borderWidth: 1, borderColor: brand.primary, marginTop: spacing.sm },
          pressed && { opacity: 0.85 },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <FontAwesome name="copy" size={16} color={brand.primary} />
          <Text style={[s.ctaText, { color: brand.primary }]}>{t('forgotCopyWhatsappMessage')}</Text>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={openWhatsApp}
        style={({ pressed }) => [
          s.cta,
          { backgroundColor: WA_GREEN, marginTop: spacing.sm },
          pressed && s.ctaPressed,
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <FontAwesome name="whatsapp" size={20} color={brand.white} />
          <Text style={s.ctaText}>{t('forgotOpenWhatsappCta')}</Text>
        </View>
      </Pressable>

      <Text style={[s.label, rtl && s.rtl, { marginTop: spacing.md }]}>{t('forgotWhatsappStepsTitle')}</Text>
      <View style={[s.infoCard, { backgroundColor: '#f8fafc' }]}>
        <Text style={[s.infoCardTxt, rtl && s.rtl, { color: brand.text }]}>
          {t('forgotWhatsappStepSend')}
          {'\n\n'}
          {t('forgotWhatsappStepSameNumber').replace(/\{\{phone\}\}/g, phoneDisplay)}
          {'\n\n'}
          {t('forgotWhatsappStepFollow')}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace('/login')}
        style={({ pressed }) => [s.cta, { marginTop: 16, backgroundColor: brand.primary }, pressed && s.ctaPressed]}
      >
        <Text style={s.ctaText}>{t('forgotBackToLogin')}</Text>
      </Pressable>
    </AuthHeroSheetLayout>
  );
}
