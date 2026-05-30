import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, View } from 'react-native';

import { AuthHeroSheetLayout, authSheetStyles } from '@/components/auth/AuthHeroSheetLayout';
import { Text } from '@/components/ui/Text';
import {
  ETAWJIHI_TRANSFER_SUPPORT_PHONE,
  buildDeviceTransferSecurityWhatsAppMessage,
  buildSupportWhatsAppUrl,
  formatSupportPhoneDisplay,
} from '@/constants/etawjihiSupport';
import { useLocale } from '@/contexts/LocaleContext';
import { useAuth } from '@/contexts/AuthContext';
import type { DeviceTransferSession } from '@/services/deviceTransfer';
import { brand, spacing } from '@/theme/tokens';
import { formatMoroccoPhoneDisplay } from '@/constants/etawjihiWhatsApp';
import { getUserFacingApiError } from '@/utils/apiError';

const s = authSheetStyles;
const WA_GREEN = '#25D366';

function parseSessionsParam(raw: string | string[] | undefined): DeviceTransferSession[] {
  const str = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : '';
  if (!str) return [];
  try {
    const parsed = JSON.parse(str) as unknown;
    return Array.isArray(parsed) ? (parsed as DeviceTransferSession[]) : [];
  } catch {
    return [];
  }
}

export default function DeviceTransferScreen() {
  const router = useRouter();
  const { completeDeviceTransfer } = useAuth();
  const params = useLocalSearchParams<{
    transferToken?: string;
    phone?: string;
    supportPhone?: string;
    maxDevices?: string;
    activeSessions?: string;
  }>();
  const transferToken =
    typeof params.transferToken === 'string'
      ? params.transferToken
      : Array.isArray(params.transferToken)
        ? params.transferToken[0]
        : '';
  const phone =
    typeof params.phone === 'string' ? params.phone : Array.isArray(params.phone) ? params.phone[0] : '';
  const supportPhone =
    (typeof params.supportPhone === 'string' ? params.supportPhone : ETAWJIHI_TRANSFER_SUPPORT_PHONE) ||
    ETAWJIHI_TRANSFER_SUPPORT_PHONE;
  const maxDevicesParam = params.maxDevices;
  const maxDevices =
    typeof maxDevicesParam === 'string'
      ? Math.max(1, Number(maxDevicesParam) || 1)
      : Array.isArray(maxDevicesParam)
        ? Math.max(1, Number(maxDevicesParam[0]) || 1)
        : 1;

  const { t, isRTL } = useLocale();
  const rtl = isRTL;

  const initialSessions = useMemo(() => parseSessionsParam(params.activeSessions), [params.activeSessions]);
  const [sessions] = useState<DeviceTransferSession[]>(initialSessions);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(() =>
    initialSessions.length === 1 ? initialSessions[0].sessionId : null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneDisplay = useMemo(() => formatMoroccoPhoneDisplay(phone), [phone]);
  const supportDisplay = useMemo(() => formatSupportPhoneDisplay(supportPhone), [supportPhone]);
  const canConfirm =
    transferToken.length > 0 && (sessions.length === 0 || sessions.length === 1 || !!selectedSessionId);

  const supportMessage = useMemo(
    () => buildDeviceTransferSecurityWhatsAppMessage(phoneDisplay || phone),
    [phone, phoneDisplay],
  );

  const onConfirmRevoke = async () => {
    if (!canConfirm) return;
    setError(null);
    setSubmitting(true);
    try {
      await completeDeviceTransfer(transferToken, selectedSessionId ?? undefined);
    } catch (e) {
      setError(getUserFacingApiError(e, t, { context: 'auth' }) || t('deviceTransferErrInvalid'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!transferToken) {
    return (
      <AuthHeroSheetLayout title={t('deviceTransferTitle')} onBack={() => router.replace('/login')}>
        <Text style={[s.errorText, rtl && s.rtl]}>{t('verifyOtpErrMissingPhone')}</Text>
      </AuthHeroSheetLayout>
    );
  }

  const intro =
    maxDevices > 1
      ? t('deviceTransferIntroMulti').replace(/\{\{max\}\}/g, String(maxDevices))
      : t('deviceTransferIntro');

  return (
    <AuthHeroSheetLayout
      title={t('deviceTransferTitle')}
      subtitle={t('deviceTransferSubtitle')}
      onBack={() => router.replace('/login')}
    >
      <View style={s.infoCard}>
        <FontAwesome name="exchange" size={18} color={brand.primary} />
        <Text style={[s.infoCardTxt, rtl && s.rtl]}>{intro}</Text>
      </View>

      {sessions.length > 0 ? (
        <>
          <Text style={[s.label, rtl && s.rtl]}>{t('deviceTransferPickLabel')}</Text>
          <ScrollView style={{ maxHeight: 280 }} nestedScrollEnabled>
            {sessions.map((sess) => {
              const selected = selectedSessionId === sess.sessionId;
              return (
                <Pressable
                  key={sess.sessionId}
                  accessibilityRole="button"
                  onPress={() => setSelectedSessionId(sess.sessionId)}
                  style={({ pressed }) => [
                    s.infoCard,
                    {
                      marginBottom: spacing.sm,
                      borderWidth: 2,
                      borderColor: selected ? brand.primary : '#e2e8f0',
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Text style={[s.infoCardTxt, rtl && s.rtl, { fontWeight: '700' }]}>
                    {sess.deviceLabel || sess.platformLabel}
                  </Text>
                  <Text style={[s.infoCardTxt, rtl && s.rtl, { fontSize: 13, marginTop: 4, color: '#64748b' }]}>
                    {sess.platformLabel}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      ) : (
        <View style={[s.infoCard, { backgroundColor: '#f8fafc' }]}>
          <Text style={[s.infoCardTxt, rtl && s.rtl, { color: brand.text }]}>
            {t('deviceTransferPickIntro')}
          </Text>
        </View>
      )}

      <View style={[s.infoCard, { backgroundColor: '#fff7ed', borderColor: '#fed7aa' }]}>
        <FontAwesome name="warning" size={16} color="#c2410c" />
        <Text style={[s.infoCardTxt, rtl && s.rtl, { color: '#9a3412', marginTop: 6 }]}>
          {t('deviceTransferSecurityHint')}
        </Text>
      </View>

      {error ? <Text style={[s.errorText, rtl && s.rtl]}>{error}</Text> : null}

      <Pressable
        accessibilityRole="button"
        disabled={!canConfirm || submitting}
        onPress={() => void onConfirmRevoke()}
        style={({ pressed }) => [
          s.cta,
          (!canConfirm || submitting) && s.ctaDisabled,
          pressed && canConfirm && s.ctaPressed,
        ]}
      >
        {submitting ? (
          <ActivityIndicator color={brand.white} />
        ) : (
          <Text style={s.ctaText}>{t('deviceTransferCta')}</Text>
        )}
      </Pressable>

      <Text style={[s.label, rtl && s.rtl, { marginTop: spacing.md }]}>{t('deviceTransferSupportLabel')}</Text>
      <View style={[s.infoCard, { borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }]}>
        <Text style={[s.infoCardTxt, rtl && s.rtl]}>{t('deviceTransferSupportHint')}</Text>
        <Text style={[s.infoCardTxt, rtl && s.rtl, { fontWeight: '700', marginTop: 8 }]} selectable>
          {supportDisplay}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => void Linking.openURL(buildSupportWhatsAppUrl(supportMessage, supportPhone))}
        style={({ pressed }) => [
          s.cta,
          { backgroundColor: WA_GREEN, marginTop: spacing.sm },
          pressed && s.ctaPressed,
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <FontAwesome name="whatsapp" size={20} color={brand.white} />
          <Text style={s.ctaText}>{t('deviceTransferOpenSupportWhatsapp')}</Text>
        </View>
      </Pressable>
    </AuthHeroSheetLayout>
  );
}
