import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ShopThankYouScreenSkeleton } from '@/components/shop/ShopThankYouScreenSkeleton';
import { Text } from '@/components/ui/Text';
import { PlatformServiceVisualThumb } from '@/components/shop/PlatformServiceVisualThumb';
import { getApiBaseUrl } from '@/constants/api';
import { useLocale } from '@/contexts/LocaleContext';
import { useShopFlowSystemBars } from '@/hooks/useShopFlowSystemBars';
import { fetchShopOrder, uploadShopOrderBankTransferReceipt } from '@/services/shop';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { AppLocale, HomeCopyKey } from '@/constants/i18n';
import type { ShopOrderPayload, ShopOrderServicePaymentFollowUp } from '@/types/shop';
import {
  isFiliere1BacId,
  isPremiereBacNiveau,
  resolveFiliereDisplayLabel,
} from '@/utils/academicFiliere';
import { formatShopPrice } from '@/utils/shopFormatPrice';
import { getShopOrderAccessToken } from '@/utils/shopOrderTokenStorage';
import { getUserFacingApiError } from '@/utils/apiError';

function fillThankTpl(template: string, vars: Record<string, string>): string {
  let s = template;
  for (const [k, v] of Object.entries(vars)) {
    s = s.split(`{${k}}`).join(v);
  }
  return s;
}

function receiptAbsoluteUrl(path: string | null | undefined): string | null {
  if (!path || !path.startsWith('/')) return null;
  const base = getApiBaseUrl().replace(/\/$/, '');
  return `${base}${path}`;
}

/** Instructions API : arabe si `locale === 'ar'` et texte AR fourni, sinon FR. */
function thankInstructionText(locale: AppLocale, fr: string, ar?: string | null): string {
  const a = (ar ?? '').trim();
  if (locale === 'ar' && a.length > 0) return a;
  return fr;
}

function thankFollowUpModalityLabel(
  modality: ShopOrderServicePaymentFollowUp['modality'],
  apiLabel: string,
  locale: AppLocale,
  t: (key: HomeCopyKey) => string,
): string {
  if (locale !== 'ar') return apiLabel;
  switch (modality) {
    case 'bank_transfer':
      return t('shopThankModalityBank');
    case 'cashplus':
      return t('shopThankModalityCashplus');
    case 'office':
      return t('shopThankModalityOffice');
    case 'pay_on_delivery':
      return t('shopThankModalityPayOnDelivery');
    default:
      return apiLabel;
  }
}

export default function BoutiqueThankYouScreen() {
  const router = useRouter();
  const { t, isRTL, locale } = useLocale();
  const { publicId: rawPublicId } = useLocalSearchParams<{ publicId?: string | string[] }>();
  const publicId = Array.isArray(rawPublicId) ? rawPublicId[0] : rawPublicId;

  const [order, setOrder] = useState<ShopOrderPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      if (!publicId) {
        if (alive) setLoading(false);
        return;
      }
      const token = await getShopOrderAccessToken(publicId);
      if (!token) {
        if (alive) {
          setForbidden(true);
          setLoading(false);
        }
        return;
      }
      if (alive) setAccessToken(token);
      const o = await fetchShopOrder(publicId, token);
      if (!alive) return;
      setOrder(o);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [publicId]);

  const filiereThankYouDisplay = useMemo(() => {
    const raw = (order?.filiere ?? '').trim();
    if (!raw) return '';
    const loc = locale === 'ar' ? 'ar' : 'fr';
    if (isPremiereBacNiveau(order?.studyLevel ?? '')) {
      if (!isFiliere1BacId(raw)) return '';
    }
    return resolveFiliereDisplayLabel(raw, loc);
  }, [order?.filiere, order?.studyLevel, locale]);

  const followUp = order?.servicePaymentFollowUp ?? null;
  const payModalityLabel =
    followUp != null
      ? thankFollowUpModalityLabel(followUp.modality, followUp.modalityLabel, locale, t)
      : '';
  const bankInstructionsLocalized =
    followUp && (followUp.bankInstructions?.trim() || followUp.bankInstructionsAr?.trim())
      ? thankInstructionText(locale, followUp.bankInstructions?.trim() ?? '', followUp.bankInstructionsAr)
      : '';
  const cashplusInstructionsLocalized =
    followUp && (followUp.cashplusInstructions?.trim() || followUp.cashplusInstructionsAr?.trim())
      ? thankInstructionText(locale, followUp.cashplusInstructions?.trim() ?? '', followUp.cashplusInstructionsAr)
      : '';
  const payOnDeliveryMessageLocalized =
    followUp && (followUp.payOnDeliveryMessage?.trim() || followUp.payOnDeliveryMessageAr?.trim())
      ? thankInstructionText(locale, followUp.payOnDeliveryMessage?.trim() ?? '', followUp.payOnDeliveryMessageAr)
      : '';
  const officeHoursLocalized =
    followUp && (followUp.officeHoursFr?.trim() || followUp.officeHoursAr?.trim())
      ? thankInstructionText(locale, followUp.officeHoursFr?.trim() ?? '', followUp.officeHoursAr ?? null)
      : '';
  const officeInstructionsLocalized =
    followUp && (followUp.officeInstructions?.trim() || followUp.officeInstructionsAr?.trim())
      ? thankInstructionText(locale, followUp.officeInstructions?.trim() ?? '', followUp.officeInstructionsAr)
      : '';

  const isCompleted = order?.status === 'completed' || order?.status === 'cancelled';
  const isBankTransfer =
    !isCompleted &&
    order?.servicePaymentModality === 'bank_transfer' &&
    followUp?.modality === 'bank_transfer';

  const bankWire = followUp?.bankWire;
  const waDigits = followUp?.whatsappWaMe ?? '212655690632';
  const waDisplay = followUp?.whatsappPhoneDisplay ?? '06 55 69 06 32';

  const whatsappPrefill = useMemo(() => {
    if (!order) return '';
    const modality = order.servicePaymentFollowUp?.modality;
    if (modality === 'cashplus') {
      return t('shopThankWhatsappPrefillCashplus').replaceAll('{orderNumber}', order.orderNumber);
    }
    return t('shopThankWhatsappPrefill').replaceAll('{orderNumber}', order.orderNumber);
  }, [order, t]);

  const whatsappHref = useMemo(() => {
    const q = encodeURIComponent(whatsappPrefill);
    return `https://wa.me/${waDigits}?text=${q}`;
  }, [waDigits, whatsappPrefill]);

  const onPickReceipt = useCallback(async () => {
    if (!publicId || !accessToken) return;
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.canceled || !res.assets?.[0]) return;
      const a = res.assets[0];
      const uri = a.uri;
      const name = a.name || 'justificatif.pdf';
      const mime = a.mimeType || 'application/octet-stream';
      setUploadBusy(true);
      const next = await uploadShopOrderBankTransferReceipt(publicId, accessToken, {
        uri,
        name,
        type: mime,
      });
      setOrder(next);
      Alert.alert('', t('shopThankBankUploadOk'));
    } catch (e) {
      Alert.alert(t('commonErrorTitle'), getUserFacingApiError(e, t, { context: 'upload' }));
    } finally {
      setUploadBusy(false);
    }
  }, [publicId, accessToken, t]);

  const flashCopy = useCallback(
    (text: string) => {
      const v = text.trim();
      if (!v) return;
      void Clipboard.setString(v);
      Alert.alert('', t('shopThankCopied'));
    },
    [t],
  );

  const { headerColor, bottomColor } = useShopFlowSystemBars({
    headerColor: brand.backgroundSoft,
    bottomColor: brand.backgroundSoft,
  });

  if (loading) {
    return (
      <View style={[styles.screen, isRTL && styles.rtlRoot]}>
        <StatusBar style="dark" backgroundColor={headerColor} />
        <SafeAreaView edges={['top', 'bottom']} style={[styles.screenSafe, { backgroundColor: bottomColor }]}>
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            <ShopThankYouScreenSkeleton isRTL={isRTL} />
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  if (forbidden || !order || !publicId) {
    return (
      <View style={[styles.screen, isRTL && styles.rtlRoot]}>
        <StatusBar style="dark" backgroundColor={headerColor} />
        <SafeAreaView edges={['top', 'bottom']} style={[styles.screenSafe, { backgroundColor: bottomColor }]}>
          <View style={styles.center}>
            <FontAwesome name="exclamation-circle" size={36} color={brand.error} />
            <Text style={[styles.loadingTxt, isRTL && styles.txtRtl]}>{t('shopThankOrderNotFound')}</Text>
            <Pressable
              onPress={() => router.replace('/(tabs)/boutique')}
              style={({ pressed }) => [styles.btnPrimary, pressed && { opacity: 0.9 }]}
            >
              <Text style={styles.btnPrimaryTxt}>{t('shopThankBackShop')}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const shippingNum = Number.parseFloat(order.shippingFee || '0');
  const promoCodeLabel = order.promoCodeLabel?.trim() ?? '';
  const promoDiscountNum = Number.parseFloat(String(order.promoDiscountAmount ?? '0').replace(',', '.'));
  const hasPromoApplied = promoCodeLabel !== '' && Number.isFinite(promoDiscountNum) && promoDiscountNum > 0;
  const hasShippableItems = order.lines.some((l) => l.productType !== 'service');
  const shippingLabel =
    order.deliveryMode === 'pickup_office'
      ? t('shopThankPickupTitle')
      : shippingNum === 0
        ? t('shopCheckoutShipFree')
        : formatShopPrice(order.shippingFee, order.currency);

  const nextSteps = isBankTransfer
    ? [t('shopThankNextStep1Bank'), t('shopThankNextStep2Bank')]
    : followUp
      ? [t('shopThankNextStep1Followup'), t('shopThankNextStep2Followup')]
      : [t('shopThankNextStep1Cod'), t('shopThankNextStep2Cod'), t('shopThankNextStep3Cod')];

  const receiptUrl = receiptAbsoluteUrl(order.bankTransferReceiptUrl);

  const pickupScheduleLine =
    order.pickupDate
      ? t('shopThankPickupBase').replace('{date}', order.pickupDate) +
        (order.pickupTime ? t('shopThankPickupTimePart').replace('{time}', order.pickupTime) : '')
      : '';

  return (
    <View style={[styles.screen, isRTL && styles.rtlRoot]}>
      <StatusBar style="dark" backgroundColor={headerColor} />

      <SafeAreaView edges={['top', 'bottom']} style={[styles.screenSafe, { backgroundColor: bottomColor }]}>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <FontAwesome name="check-circle" size={42} color={brand.success} />
          </View>
          <Text style={[styles.eyebrow, isRTL && styles.heroTxtRtl]}>{t('shopThankEyebrowBoutique')}</Text>
          <Text style={[styles.heroTitle, isRTL && styles.heroTxtRtl]}>{t('shopThankHeroTitle')}</Text>
          <Text style={[styles.heroDesc, isRTL && styles.heroTxtRtl]}>{t('shopThankHeroDesc')}</Text>

          <View style={[styles.refRow, isRTL && styles.refRowRtl]}>
            <View>
              <Text style={[styles.refLbl, isRTL && styles.txtRtl]}>{t('shopThankRefLabel')}</Text>
              <Text style={[styles.refVal, isRTL && styles.txtRtl]}>{order.orderNumber}</Text>
            </View>
            <View style={{ alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
              <Text style={[styles.refLbl, isRTL && styles.txtRtl]}>{t('shopThankTotalLabel')}</Text>
              <Text style={[styles.refTotal, isRTL && styles.txtRtl]}>{formatShopPrice(order.total, order.currency)}</Text>
            </View>
          </View>
        </View>

        <SectionCard title={t('shopThankContactTitle')} isRtl={isRTL}>
          <Row icon="envelope-o" value={order.email} isRtl={isRTL} />
          <Row icon="user" value={order.fullName} isRtl={isRTL} />
          <Row icon="phone" value={order.phone} isRtl={isRTL} />
          {order.studyLevel ? (
            <Row
              icon="graduation-cap"
              isRtl={isRTL}
              value={fillThankTpl(t('shopThankLevelLine'), { v: order.studyLevel })}
            />
          ) : null}
          {order.bacType ? (
            <Row
              icon="book"
              isRtl={isRTL}
              value={fillThankTpl(t('shopThankBacLine'), { v: order.bacType })}
            />
          ) : null}
          {order.studyLevel ? (
            <Row
              icon="list-alt"
              isRtl={isRTL}
              value={fillThankTpl(t('shopThankFiliereLine'), {
                v: filiereThankYouDisplay || '—',
              })}
            />
          ) : null}
          {order.specialiteMission1 ? (
            <Row
              icon="star-o"
              isRtl={isRTL}
              value={fillThankTpl(t('shopThankMissionLine'), {
                v: [order.specialiteMission1, order.specialiteMission2, order.specialiteMission3]
                  .filter(Boolean)
                  .join(' · '),
              })}
            />
          ) : null}
          {order.studentCity ? (
            <Row
              icon="map-marker"
              isRtl={isRTL}
              value={fillThankTpl(t('shopThankStudentCityLine'), { v: order.studentCity })}
            />
          ) : null}
        </SectionCard>

        {isBankTransfer && bankWire ? (
          <SectionCard title={t('shopThankBankSectionTitle')} isRtl={isRTL}>
            <BankWireDetailCard
              order={order}
              bankWire={bankWire}
              bankInstructions={followUp?.bankInstructions}
              flashCopy={flashCopy}
              isRtl={isRTL}
              t={t}
            />

            <View style={{ marginTop: spacing.md }}>
              <Text style={[styles.subHead, isRTL && styles.txtRtl]}>{t('shopThankBankUploadTitle')}</Text>
              <Text style={[styles.blockTxt, isRTL && styles.txtRtl]}>{t('shopThankBankUploadHint')}</Text>
              <Pressable
                onPress={() => void onPickReceipt()}
                disabled={uploadBusy}
                style={({ pressed }) => [
                  styles.uploadBtn,
                  isRTL && styles.rowRtl,
                  (pressed || uploadBusy) && { opacity: 0.88 },
                  uploadBusy && { opacity: 0.6 },
                ]}
              >
                {uploadBusy ? (
                  <ActivityIndicator color={brand.white} />
                ) : (
                  <FontAwesome name="cloud-upload" size={16} color={brand.white} />
                )}
                <Text style={[styles.uploadBtnTxt, isRTL && styles.txtRtl]}>
                  {uploadBusy ? t('shopThankBankUploadBusy') : t('shopThankBankUploadPick')}
                </Text>
              </Pressable>
              {order.bankTransferReceiptUploadedAt ? (
                <Text style={[styles.okNote, isRTL && styles.txtRtl]}>{t('shopThankBankUploadOk')}</Text>
              ) : null}
              {receiptUrl ? (
                <Pressable
                  onPress={() => void Linking.openURL(receiptUrl)}
                  style={({ pressed }) => [styles.linkBtn, isRTL && styles.rowRtl, pressed && { opacity: 0.88 }]}
                >
                  <FontAwesome name="external-link" size={14} color={brand.primary} />
                  <Text style={[styles.linkBtnTxt, isRTL && styles.txtRtl]}>{t('shopThankBankViewReceipt')}</Text>
                </Pressable>
              ) : null}
            </View>

            <View style={{ marginTop: spacing.md }}>
              <Text style={[styles.blockTxt, isRTL && styles.txtRtl]}>
                {t('shopThankBankWhatsappHint').replace('{phone}', waDisplay)}
              </Text>
              <Pressable
                onPress={() => void Linking.openURL(whatsappHref)}
                style={({ pressed }) => [styles.waBtn, isRTL && styles.rowRtl, pressed && { opacity: 0.9 }]}
              >
                <FontAwesome name="whatsapp" size={18} color={brand.white} />
                <Text style={[styles.waBtnTxt, isRTL && styles.txtRtl]}>{t('shopThankBankWhatsappOpen')}</Text>
              </Pressable>
            </View>
          </SectionCard>
        ) : followUp && !isCompleted ? (
          <SectionCard
            title={fillThankTpl(t('shopThankPaymentHeading'), { label: payModalityLabel })}
            isRtl={isRTL}
          >
            {followUp.modality === 'office' ? (
              <View style={[styles.payBlock, styles.payBlockOffice]}>
                <View style={[styles.payBlockTitleRow, isRTL && styles.rowRtl]}>
                  <FontAwesome name="building-o" size={18} color={brand.primary} />
                  <Text style={[styles.payBlockTitle, isRTL && styles.txtRtl]}>{payModalityLabel}</Text>
                </View>
                {followUp.officeAddress ? (
                  <CopyableValueRow
                    label={t('shopThankOfficeAddressLbl')}
                    value={followUp.officeAddress}
                    onCopy={flashCopy}
                    isRtl={isRTL}
                    copyVerb={t('shopThankCopy')}
                  />
                ) : null}
                {officeHoursLocalized ? (
                  <View style={{ marginTop: spacing.sm }}>
                    <Text style={[styles.subHead, isRTL && styles.txtRtl]}>{t('shopThankOfficeHoursLbl')}</Text>
                    <InstructionCallout text={officeHoursLocalized} isRtl={isRTL} />
                    <Pressable
                      onPress={() => flashCopy(officeHoursLocalized.trim())}
                      style={({ pressed }) => [
                        styles.inlineCopyLink,
                        isRTL && styles.inlineCopyLinkRtl,
                        isRTL && styles.rowRtl,
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <FontAwesome name="copy" size={13} color={brand.primary} />
                      <Text style={[styles.inlineCopyLinkTxt, isRTL && styles.txtRtl]}>{t('shopThankCopyInstructions')}</Text>
                    </Pressable>
                  </View>
                ) : null}
                {followUp.officePhoneDisplay && followUp.officeTelHref ? (
                  <View style={{ gap: 6, marginTop: spacing.sm }}>
                    <Text style={[styles.blockTxt, isRTL && styles.txtRtl]}>{t('shopThankOfficeCallHint')}</Text>
                    <CopyableValueRow
                      label={t('shopThankOfficePhoneLbl')}
                      value={followUp.officePhoneDisplay}
                      onCopy={flashCopy}
                      isRtl={isRTL}
                      copyVerb={t('shopThankCopy')}
                    />
                    <Pressable
                      onPress={() => void Linking.openURL(followUp.officeTelHref!)}
                      style={({ pressed }) => [styles.phoneBtn, isRTL && styles.rowRtl, pressed && { opacity: 0.9 }]}
                    >
                      <FontAwesome name="phone" size={16} color={brand.white} />
                      <Text style={[styles.phoneBtnTxt, isRTL && styles.txtRtl]}>{followUp.officePhoneDisplay}</Text>
                    </Pressable>
                  </View>
                ) : null}
                {followUp.officeMapsUrl ? (
                  <Pressable
                    onPress={() => void Linking.openURL(followUp.officeMapsUrl!)}
                    style={({ pressed }) => [
                      styles.mapsBtn,
                      isRTL && styles.rowRtl,
                      pressed && { opacity: 0.88 },
                      { marginTop: spacing.md },
                    ]}
                  >
                    <FontAwesome name="map-marker" size={15} color={brand.white} />
                    <Text style={[styles.mapsBtnTxt, isRTL && styles.txtRtl]}>{t('shopThankOfficeMapsBtn')}</Text>
                  </Pressable>
                ) : null}
                {officeInstructionsLocalized ? (
                  <View style={{ marginTop: spacing.md }}>
                    <Text style={[styles.subHead, isRTL && styles.txtRtl]}>{t('shopThankInstructionsTitle')}</Text>
                    <InstructionCallout text={officeInstructionsLocalized} isRtl={isRTL} />
                    <Pressable
                      onPress={() => flashCopy(officeInstructionsLocalized.trim())}
                      style={({ pressed }) => [
                        styles.inlineCopyLink,
                        isRTL && styles.inlineCopyLinkRtl,
                        isRTL && styles.rowRtl,
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <FontAwesome name="copy" size={13} color={brand.primary} />
                      <Text style={[styles.inlineCopyLinkTxt, isRTL && styles.txtRtl]}>{t('shopThankCopyInstructions')}</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ) : null}

            {followUp.modality === 'bank_transfer' ? (
              <>
                {followUp.bankWire ? (
                  <BankWireDetailCard
                    order={order}
                    bankWire={followUp.bankWire}
                    bankInstructions={bankInstructionsLocalized || undefined}
                    flashCopy={flashCopy}
                    isRtl={isRTL}
                    t={t}
                  />
                ) : bankInstructionsLocalized.trim() ? (
                  <View style={[styles.payBlock, styles.payBlockBank]}>
                    <Text style={[styles.subHead, isRTL && styles.txtRtl]}>{t('shopThankBankInstructionsTitle')}</Text>
                    <InstructionCallout text={bankInstructionsLocalized.trim()} isRtl={isRTL} />
                    <Pressable
                      onPress={() => flashCopy(bankInstructionsLocalized.trim())}
                      style={({ pressed }) => [
                        styles.inlineCopyLink,
                        isRTL && styles.inlineCopyLinkRtl,
                        isRTL && styles.rowRtl,
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <FontAwesome name="copy" size={13} color={brand.primary} />
                      <Text style={[styles.inlineCopyLinkTxt, isRTL && styles.txtRtl]}>{t('shopThankCopyInstructions')}</Text>
                    </Pressable>
                  </View>
                ) : null}
              </>
            ) : null}

            {followUp.modality === 'cashplus' ? (
              <View style={[styles.payBlock, styles.payBlockCashplus]}>
                <View style={[styles.payBlockTitleRow, isRTL && styles.rowRtl]}>
                  <FontAwesome name="mobile" size={18} color={brand.primary} />
                  <Text style={[styles.payBlockTitle, isRTL && styles.txtRtl]}>{payModalityLabel}</Text>
                </View>
                {followUp.cashplusCode ? (
                  <CashplusCodeHeroBox
                    code={followUp.cashplusCode}
                    flashCopy={flashCopy}
                    isRtl={isRTL}
                    t={t}
                    onOpenAccount={() => router.push('/(tabs)/compte')}
                  />
                ) : (
                  <>
                    <Text style={[styles.blockTxt, isRTL && styles.txtRtl, styles.cashplusHintPara]}>
                      {t('shopThankCashplusAgencyHint')}
                    </Text>
                    <Text style={[styles.blockTxt, isRTL && styles.txtRtl, styles.cashplusHintPara]}>
                      {t('shopThankCashplusActivationHint')}
                    </Text>
                    <Text style={[styles.blockTxt, isRTL && styles.txtRtl, styles.cashplusHintPara]}>
                      {t('shopThankCashplusDelayHint')}
                    </Text>
                    <Pressable
                      onPress={() => router.push('/(tabs)/compte')}
                      style={({ pressed }) => [styles.accountCtaBtn, isRTL && styles.rowRtl, pressed && { opacity: 0.9 }]}
                    >
                      <FontAwesome name="user" size={16} color={brand.primary} />
                      <Text style={[styles.accountCtaBtnTxt, isRTL && styles.txtRtl]}>
                        {t('shopThankCashplusGotoAccountCta')}
                      </Text>
                    </Pressable>
                  </>
                )}
                {cashplusInstructionsLocalized.trim() ? (
                  <View style={{ marginTop: spacing.sm }}>
                    <InstructionCallout text={cashplusInstructionsLocalized.trim()} isRtl={isRTL} />
                    <Pressable
                      onPress={() => flashCopy(cashplusInstructionsLocalized.trim())}
                      style={({ pressed }) => [
                        styles.inlineCopyLink,
                        isRTL && styles.inlineCopyLinkRtl,
                        isRTL && styles.rowRtl,
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <FontAwesome name="copy" size={13} color={brand.primary} />
                      <Text style={[styles.inlineCopyLinkTxt, isRTL && styles.txtRtl]}>{t('shopThankCopyInstructions')}</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ) : null}

            {followUp.modality === 'pay_on_delivery' && payOnDeliveryMessageLocalized.trim() ? (
              <View style={[styles.payBlock, styles.payBlockCod]}>
                <View style={[styles.payBlockTitleRow, isRTL && styles.rowRtl]}>
                  <FontAwesome name="truck" size={18} color={brand.primary} />
                  <Text style={[styles.payBlockTitle, isRTL && styles.txtRtl]}>{payModalityLabel}</Text>
                </View>
                <InstructionCallout text={payOnDeliveryMessageLocalized.trim()} isRtl={isRTL} />
                <Pressable
                  onPress={() => flashCopy(payOnDeliveryMessageLocalized.trim())}
                  style={({ pressed }) => [
                    styles.inlineCopyLink,
                    isRTL && styles.inlineCopyLinkRtl,
                    isRTL && styles.rowRtl,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <FontAwesome name="copy" size={13} color={brand.primary} />
                  <Text style={[styles.inlineCopyLinkTxt, isRTL && styles.txtRtl]}>{t('shopThankCopyInstructions')}</Text>
                </Pressable>
              </View>
            ) : null}
            <PaymentHelpWhatsApp waDisplay={waDisplay} whatsappHref={whatsappHref} isRtl={isRTL} t={t} />
          </SectionCard>
        ) : null}

        {order.deliveryMode === 'cod_delivery' && (order.city || order.addressLine) ? (
          <SectionCard title={t('shopThankDeliveryTitle')} isRtl={isRTL}>
            {order.city ? <Row icon="map-marker" value={order.city} isRtl={isRTL} /> : null}
            {order.addressLine ? <Row icon="home" value={order.addressLine} isRtl={isRTL} /> : null}
            {order.deliveryDelayLabel ? (
              <Row
                icon="clock-o"
                isRtl={isRTL}
                value={fillThankTpl(t('shopThankDelayIndicative'), { delay: order.deliveryDelayLabel })}
              />
            ) : null}
            <View style={[styles.payTip, isRTL && styles.rowRtl]}>
              <FontAwesome name="money" size={14} color={brand.success} />
              <Text style={[styles.payTipTxt, isRTL && styles.txtRtl]}>{t('shopThankCodCashTip')}</Text>
            </View>
          </SectionCard>
        ) : null}

        {order.deliveryMode === 'pickup_office' ? (
          <SectionCard title={t('shopThankPickupTitle')} isRtl={isRTL}>
            {order.pickupDate ? (
              <Row icon="calendar" value={pickupScheduleLine} isRtl={isRTL} />
            ) : null}
            <View style={[styles.payTip, isRTL && styles.rowRtl]}>
              <FontAwesome name="building" size={14} color={brand.primary} />
              <Text style={[styles.payTipTxt, isRTL && styles.txtRtl]}>{t('shopThankPickupPayOnSite')}</Text>
            </View>
          </SectionCard>
        ) : null}

        <SectionCard title={t('shopThankItemsTitle')} isRtl={isRTL}>
          {order.lines.map((l) => (
            <View key={l.id ?? `${l.productTitle}-${l.quantity}`} style={[styles.lineRow, isRTL && styles.rowRtl]}>
              {l.productType === 'service' ? (
                <PlatformServiceVisualThumb
                  brandIcon={l.platformServiceBrandIcon}
                  brandColor={l.platformServiceBrandColor}
                  size={40}
                  iconSize={18}
                />
              ) : (
                <View style={styles.lineThumbProduct}>
                  <FontAwesome
                    name={l.productType === 'pack' ? 'cubes' : 'cube'}
                    size={16}
                    color={brand.primary}
                  />
                </View>
              )}
              <Text style={[styles.lineTitle, isRTL && styles.txtRtl]} numberOfLines={2}>
                {l.productTitle}
              </Text>
              <Text style={[styles.lineQty, isRTL && styles.txtRtl]}>× {l.quantity}</Text>
              <Text style={[styles.lineVal, isRTL && styles.lineValRtl]}>
                {formatShopPrice(l.lineTotal, order.currency)}
              </Text>
            </View>
          ))}
          <View style={styles.summaryDivider} />
          <View style={[styles.summaryRow, isRTL && styles.rowRtl]}>
            <Text style={[styles.summaryLbl, isRTL && styles.txtRtl]}>{t('shopThankSummarySubtotalItems')}</Text>
            <Text style={[styles.summaryVal, isRTL && styles.txtRtl]}>{formatShopPrice(order.subtotal, order.currency)}</Text>
          </View>
          {hasPromoApplied ? (
            <View style={[styles.summaryRow, isRTL && styles.rowRtl]}>
              <Text style={[styles.summaryLbl, styles.promoDiscountLbl, isRTL && styles.txtRtl]}>
                {t('shopCheckoutLblDiscount').replace('{code}', promoCodeLabel)}
              </Text>
              <Text style={[styles.summaryVal, styles.promoDiscountVal, isRTL && styles.txtRtl]}>
                −{formatShopPrice(String(promoDiscountNum), order.currency)}
              </Text>
            </View>
          ) : null}
          {hasShippableItems ? (
            <View style={[styles.summaryRow, isRTL && styles.rowRtl]}>
              <Text style={[styles.summaryLbl, isRTL && styles.txtRtl]}>
                {shippingNum === 0 ? t('shopThankSummaryShipLbl') : t('shopThankSummaryShipFeesLbl')}
              </Text>
              <Text style={[styles.summaryVal, isRTL && styles.txtRtl]}>{shippingLabel}</Text>
            </View>
          ) : null}
          <View style={styles.summaryDivider} />
          <View style={[styles.summaryRow, isRTL && styles.rowRtl]}>
            <Text style={[styles.summaryTotalLbl, isRTL && styles.txtRtl]}>{t('shopThankTotalLabel')}</Text>
            <Text style={[styles.summaryTotalVal, isRTL && styles.txtRtl]}>{formatShopPrice(order.total, order.currency)}</Text>
          </View>
        </SectionCard>

        {!followUp && !isBankTransfer ? (
          <PaymentHelpWhatsApp waDisplay={waDisplay} whatsappHref={whatsappHref} isRtl={isRTL} t={t} />
        ) : null}

        <SectionCard title={t('shopThankNextStepsTitle')} isRtl={isRTL}>
          {nextSteps.map((s, i) => (
            <View key={i} style={[styles.stepRow, isRTL && styles.stepRowRtl]}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumTxt}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepTxt, isRTL && styles.txtRtl]}>{s}</Text>
            </View>
          ))}
        </SectionCard>

        <Pressable
          onPress={() => router.replace('/(tabs)/boutique')}
          style={({ pressed }) => [styles.backToShopBtn, isRTL && styles.rowRtl, pressed && { opacity: 0.92 }]}
        >
          <FontAwesome name="shopping-bag" size={14} color={brand.white} />
          <Text style={[styles.backToShopTxt, isRTL && styles.txtRtl]}>{t('shopThankBackShop')}</Text>
          <FontAwesome name={isRTL ? 'arrow-left' : 'arrow-right'} size={12} color={brand.white} />
        </Pressable>
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SectionCard({ title, children, isRtl }: { title: string; children: ReactNode; isRtl?: boolean }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, isRtl && styles.txtRtl]}>{title}</Text>
      <View style={{ gap: spacing.sm }}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  value,
  isRtl,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  value: string;
  isRtl?: boolean;
}) {
  return (
    <View style={[styles.row, isRtl && styles.rowRtl]}>
      <FontAwesome name={icon} size={13} color={brand.primary} />
      <Text style={[styles.rowVal, isRtl && styles.txtRtl]}>{value}</Text>
    </View>
  );
}

function buildBankWireCopyText(
  order: ShopOrderPayload,
  bankWire: NonNullable<ShopOrderServicePaymentFollowUp['bankWire']>,
  t: (key: HomeCopyKey) => string,
): string {
  return [
    `${t('shopThankRefLabel')}: ${order.orderNumber}`,
    `${t('shopThankBankNameLbl')}: ${bankWire.bankName}`,
    `${t('shopThankBankRibLbl')}: ${bankWire.rib}`,
    `${t('shopThankBankHolderLbl')}: ${bankWire.accountHolder}`,
  ].join('\n');
}

function CopyableValueRow({
  label,
  value,
  variant = 'body',
  isRtl,
  onCopy,
  copyVerb,
}: {
  label?: string;
  value: string;
  variant?: 'body' | 'mono' | 'hero';
  isRtl?: boolean;
  onCopy: (s: string) => void;
  copyVerb: string;
}) {
  if (!value.trim()) return null;
  const valStyle =
    variant === 'mono' ? styles.copyRowValMono : variant === 'hero' ? styles.copyRowValHero : styles.copyRowVal;
  const a11y = label?.trim() ? `${copyVerb} — ${label}` : `${copyVerb} — ${value.slice(0, 24)}`;
  return (
    <View style={[styles.copyRow, isRtl && styles.rowRtl]}>
      <View style={styles.copyRowMain}>
        {label?.trim() ? <Text style={[styles.copyRowLbl, isRtl && styles.txtRtl]}>{label}</Text> : null}
        <Text style={[valStyle, isRtl && styles.txtRtl]} selectable>
          {value}
        </Text>
      </View>
      <Pressable
        onPress={() => onCopy(value)}
        hitSlop={10}
        style={({ pressed }) => [styles.copyIconBtn, pressed && { opacity: 0.75 }]}
        accessibilityRole="button"
        accessibilityLabel={a11y}
      >
        <FontAwesome name="copy" size={16} color={brand.primary} />
      </Pressable>
    </View>
  );
}

function InstructionCallout({ text, isRtl }: { text: string; isRtl?: boolean }) {
  return (
    <View style={[styles.instructionCallout, isRtl && styles.instructionCalloutRtl]}>
      <FontAwesome name="info-circle" size={15} color={brand.primary} style={styles.instructionCalloutIcon} />
      <Text style={[styles.instructionCalloutTxt, isRtl && styles.txtRtl]}>{text}</Text>
    </View>
  );
}

function PaymentHelpWhatsApp({
  waDisplay,
  whatsappHref,
  isRtl,
  t,
}: {
  waDisplay: string;
  whatsappHref: string;
  isRtl?: boolean;
  t: (key: HomeCopyKey) => string;
}) {
  return (
    <View style={styles.paymentHelpFooter}>
      <Text style={[styles.paymentHelpFooterTitle, isRtl && styles.txtRtl]}>{t('shopThankPaymentHelpWhatsappTitle')}</Text>
      <Text style={[styles.blockTxt, isRtl && styles.txtRtl]}>
        {t('shopThankWhatsappHintHelp').replace('{phone}', waDisplay)}
      </Text>
      <Pressable
        onPress={() => void Linking.openURL(whatsappHref)}
        style={({ pressed }) => [styles.waBtn, isRtl && styles.rowRtl, pressed && { opacity: 0.9 }]}
      >
        <FontAwesome name="whatsapp" size={18} color={brand.white} />
        <Text style={[styles.waBtnTxt, isRtl && styles.txtRtl]}>{t('shopThankBankWhatsappOpen')}</Text>
      </Pressable>
    </View>
  );
}

function CashplusCodeHeroBox({
  code,
  flashCopy,
  isRtl,
  t,
  onOpenAccount,
}: {
  code: string;
  flashCopy: (s: string) => void;
  isRtl?: boolean;
  t: (key: HomeCopyKey) => string;
  onOpenAccount: () => void;
}) {
  if (!code.trim()) return null;
  return (
    <>
      <View style={[styles.cashplusHeroBox, isRtl && styles.cashplusHeroBoxRtl]}>
        <Text style={[styles.cashplusHeroLbl, isRtl && styles.txtRtl]}>{t('shopThankCashplusCodeLbl')}</Text>
        <Text style={[styles.cashplusHeroCode, isRtl && styles.txtRtl]} selectable>
          {code.trim()}
        </Text>
        <Pressable
          onPress={() => flashCopy(code.trim())}
          style={({ pressed }) => [styles.cashplusHeroCopyBtn, isRtl && styles.rowRtl, pressed && { opacity: 0.88 }]}
          accessibilityRole="button"
          accessibilityLabel={t('shopThankCopy')}
        >
          <FontAwesome name="copy" size={18} color={brand.white} />
          <Text style={[styles.cashplusHeroCopyBtnTxt, isRtl && styles.txtRtl]}>{t('shopThankCopy')}</Text>
        </Pressable>
      </View>
      <Text style={[styles.blockTxt, isRtl && styles.txtRtl, styles.cashplusHintPara]}>{t('shopThankCashplusAgencyHint')}</Text>
      <Text style={[styles.blockTxt, isRtl && styles.txtRtl, styles.cashplusHintPara]}>{t('shopThankCashplusActivationHint')}</Text>
      <Text style={[styles.blockTxt, isRtl && styles.txtRtl, styles.cashplusHintPara]}>{t('shopThankCashplusDelayHint')}</Text>
      <Pressable
        onPress={onOpenAccount}
        style={({ pressed }) => [styles.accountCtaBtn, isRtl && styles.rowRtl, pressed && { opacity: 0.9 }]}
      >
        <FontAwesome name="user" size={16} color={brand.primary} />
        <Text style={[styles.accountCtaBtnTxt, isRtl && styles.txtRtl]}>{t('shopThankCashplusGotoAccountCta')}</Text>
      </Pressable>
    </>
  );
}

function BankWireDetailCard({
  order,
  bankWire,
  bankInstructions,
  flashCopy,
  isRtl,
  t,
}: {
  order: ShopOrderPayload;
  bankWire: NonNullable<ShopOrderServicePaymentFollowUp['bankWire']>;
  bankInstructions?: string | null;
  flashCopy: (s: string) => void;
  isRtl?: boolean;
  t: (key: HomeCopyKey) => string;
}) {
  const allText = buildBankWireCopyText(order, bankWire, t);
  return (
    <View style={[styles.payBlock, styles.payBlockBank]}>
      <View style={[styles.payBlockTitleRow, isRtl && styles.rowRtl]}>
        <FontAwesome name="credit-card" size={18} color={brand.primary} />
        <Text style={[styles.payBlockTitle, isRtl && styles.txtRtl]}>{t('shopThankBankCoordinTitle')}</Text>
      </View>
      <CopyableValueRow
        label={t('shopThankBankNameLbl')}
        value={bankWire.bankName}
        onCopy={flashCopy}
        isRtl={isRtl}
        copyVerb={t('shopThankCopy')}
      />
      <CopyableValueRow
        label={t('shopThankBankRibLbl')}
        value={bankWire.rib}
        variant="mono"
        onCopy={flashCopy}
        isRtl={isRtl}
        copyVerb={t('shopThankCopy')}
      />
      <CopyableValueRow
        label={t('shopThankBankHolderLbl')}
        value={bankWire.accountHolder}
        onCopy={flashCopy}
        isRtl={isRtl}
        copyVerb={t('shopThankCopy')}
      />
      <Pressable
        onPress={() => flashCopy(allText)}
        style={({ pressed }) => [styles.copyAllBtn, isRtl && styles.rowRtl, pressed && { opacity: 0.88 }]}
        accessibilityRole="button"
        accessibilityLabel={t('shopThankCopyAllBank')}
      >
        <FontAwesome name="clipboard" size={15} color={brand.primary} />
        <Text style={[styles.copyAllBtnTxt, isRtl && styles.txtRtl]}>{t('shopThankCopyAllBank')}</Text>
      </Pressable>
      {bankInstructions?.trim() ? (
        <View style={styles.bankInstrWrap}>
          <Text style={[styles.subHead, isRtl && styles.txtRtl]}>{t('shopThankBankInstructionsTitle')}</Text>
          <InstructionCallout text={bankInstructions.trim()} isRtl={isRtl} />
          <Pressable
            onPress={() => flashCopy(bankInstructions.trim())}
            style={({ pressed }) => [
              styles.inlineCopyLink,
              isRtl && styles.inlineCopyLinkRtl,
              isRtl && styles.rowRtl,
              pressed && { opacity: 0.85 },
            ]}
          >
            <FontAwesome name="copy" size={13} color={brand.primary} />
            <Text style={[styles.inlineCopyLinkTxt, isRtl && styles.txtRtl]}>{t('shopThankCopyInstructions')}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: brand.backgroundSoft },
  screenSafe: { flex: 1 },
  root: { flex: 1, backgroundColor: brand.backgroundSoft },
  rtlRoot: { direction: 'rtl' },
  rowRtl: { flexDirection: 'row-reverse' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.md,
  },
  loadingTxt: { color: brand.textSecondary, fontSize: fontSize.sm, textAlign: 'center' },
  list: { padding: spacing.lg, gap: spacing.md },
  txtRtl: { textAlign: 'right', writingDirection: 'rtl' },
  heroTxtRtl: { writingDirection: 'rtl', textAlign: 'center' },

  heroCard: {
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: brand.border,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: 6,
  },
  heroIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(47,206,148,0.12)',
    marginBottom: spacing.sm,
  },
  eyebrow: { fontSize: 11, color: brand.cyan, fontWeight: '800', letterSpacing: 1.2 },
  heroTitle: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: '800',
    color: brand.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroDesc: {
    marginTop: 4,
    color: brand.textSecondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  refRow: {
    marginTop: spacing.lg,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: brand.border,
  },
  refRowRtl: { flexDirection: 'row-reverse' },
  refLbl: { fontSize: 11, color: brand.textMuted, fontWeight: '700' },
  refVal: { fontSize: fontSize.md, color: brand.text, fontWeight: '800', marginTop: 2 },
  refTotal: { fontSize: 22, color: brand.primary, fontWeight: '800', marginTop: 2 },

  section: {
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: brand.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '800', color: brand.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowVal: { flex: 1, color: brand.text, fontSize: fontSize.sm, fontWeight: '600' },

  payBlock: {
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  payBlockBank: {
    backgroundColor: 'rgba(51,62,143,0.06)',
    borderColor: 'rgba(51,62,143,0.2)',
  },
  payBlockOffice: {
    backgroundColor: 'rgba(51,62,143,0.04)',
    borderColor: 'rgba(51,62,143,0.14)',
  },
  payBlockCashplus: {
    backgroundColor: 'rgba(47,206,148,0.08)',
    borderColor: 'rgba(47,206,148,0.28)',
  },
  payBlockCod: {
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderColor: 'rgba(245,158,11,0.35)',
  },
  payBlockTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.borderLight,
  },
  payBlockTitle: { flex: 1, fontSize: fontSize.md, fontWeight: '800', color: brand.text },

  copyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: brand.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.border,
  },
  copyRowMain: { flex: 1, minWidth: 0, gap: 4 },
  copyRowLbl: {
    fontSize: 10,
    fontWeight: '800',
    color: brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  copyRowVal: { fontSize: fontSize.sm, fontWeight: '700', color: brand.text, lineHeight: 20 },
  copyRowValMono: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: brand.text,
    letterSpacing: 0.6,
    lineHeight: 22,
  },
  copyRowValHero: {
    fontSize: 22,
    fontWeight: '900',
    color: brand.primary,
    letterSpacing: 1,
  },
  copyIconBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51,62,143,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.12)',
  },
  copyAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: brand.white,
    borderWidth: 1.5,
    borderColor: brand.primary,
  },
  copyAllBtnTxt: { fontSize: fontSize.sm, fontWeight: '800', color: brand.primary },

  instructionCallout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 4,
    padding: spacing.md,
    backgroundColor: brand.backgroundSoft,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: brand.primary,
  },
  instructionCalloutRtl: {
    borderLeftWidth: 0,
    borderRightWidth: 4,
    borderRightColor: brand.primary,
  },
  instructionCalloutIcon: { marginTop: 2 },
  instructionCalloutTxt: {
    flex: 1,
    fontSize: fontSize.sm,
    color: brand.text,
    lineHeight: 21,
    fontWeight: '600',
  },

  inlineCopyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  inlineCopyLinkRtl: { alignSelf: 'flex-end' },
  inlineCopyLinkTxt: { fontSize: 12, fontWeight: '800', color: brand.primary },

  bankInstrWrap: { marginTop: spacing.md, gap: 4 },

  kvRow: { gap: 4, marginBottom: spacing.sm },
  kvLbl: { fontSize: 11, fontWeight: '800', color: brand.textMuted, textTransform: 'uppercase' },
  kvVal: { fontSize: fontSize.sm, fontWeight: '700', color: brand.text },
  kvValMono: { fontSize: fontSize.md, fontWeight: '800', color: brand.text, letterSpacing: 0.5 },
  subHead: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.text,
    marginBottom: 6,
  },

  payTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(47,206,148,0.08)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(47,206,148,0.25)',
    marginTop: 4,
  },
  payTipTxt: { flex: 1, color: brand.text, fontSize: fontSize.sm },

  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.borderLight,
  },
  lineThumbProduct: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: brand.backgroundSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineTitle: { flex: 1, fontSize: 12, color: brand.text, fontWeight: '700' },
  lineQty: { fontSize: 11, color: brand.textMuted, fontWeight: '600' },
  lineVal: { minWidth: 80, textAlign: 'right', color: brand.primary, fontSize: 12, fontWeight: '800' },
  lineValRtl: { textAlign: 'left' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLbl: { color: brand.textSecondary, fontSize: fontSize.sm },
  summaryVal: { color: brand.text, fontSize: fontSize.sm, fontWeight: '700' },
  promoDiscountLbl: { color: '#047857' },
  promoDiscountVal: { color: '#047857', fontWeight: '800' },
  summaryDivider: { height: 1, backgroundColor: brand.border, marginVertical: 4 },
  summaryTotalLbl: { fontSize: fontSize.md, fontWeight: '800', color: brand.text },
  summaryTotalVal: { fontSize: fontSize.lg, fontWeight: '800', color: brand.primary },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepRowRtl: { flexDirection: 'row-reverse' },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumTxt: { color: brand.white, fontSize: 12, fontWeight: '800' },
  stepTxt: { flex: 1, color: brand.textSecondary, fontSize: fontSize.sm, lineHeight: 19 },

  backToShopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: brand.primary,
    paddingVertical: 15,
    borderRadius: radius.md,
  },
  backToShopTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.sm },

  blockTxt: {
    fontSize: fontSize.sm,
    color: brand.textSecondary,
    lineHeight: 21,
    fontWeight: '600',
  },
  codeBox: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(51,62,143,0.08)',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.2)',
    marginVertical: spacing.sm,
  },
  codeBoxRtl: { alignSelf: 'flex-end' },
  codeLbl: { fontSize: 11, fontWeight: '800', color: brand.textMuted, textTransform: 'uppercase' },
  codeVal: { marginTop: 6, fontSize: 22, fontWeight: '900', color: brand.primary, letterSpacing: 1 },
  mapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.sm,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
  },
  mapsBtnTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.sm },

  phoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    alignSelf: 'stretch',
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
  },
  phoneBtnTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.md },

  uploadBtn: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: brand.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  uploadBtnTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.sm },
  okNote: { marginTop: spacing.sm, fontSize: 12, fontWeight: '700', color: brand.success },
  linkBtn: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  linkBtnTxt: { color: brand.primary, fontWeight: '800', fontSize: fontSize.sm },
  waBtn: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#25D366',
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  waBtnTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.sm },

  paymentHelpFooter: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: brand.borderLight,
    gap: spacing.sm,
  },
  paymentHelpFooterTitle: { fontSize: fontSize.md, fontWeight: '800', color: brand.text },

  cashplusHeroBox: {
    alignItems: 'center',
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: brand.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  cashplusHeroBoxRtl: { alignItems: 'stretch' },
  cashplusHeroLbl: {
    fontSize: 11,
    fontWeight: '800',
    color: brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  cashplusHeroCode: {
    fontSize: 30,
    fontWeight: '900',
    color: brand.primary,
    letterSpacing: 2,
    textAlign: 'center',
    width: '100%',
  },
  cashplusHeroCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: brand.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    minWidth: 200,
  },
  cashplusHeroCopyBtnTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.sm },
  cashplusHintPara: { marginTop: spacing.sm },
  accountCtaBtn: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: brand.primary,
    backgroundColor: brand.white,
  },
  accountCtaBtnTxt: { fontWeight: '800', fontSize: fontSize.sm, color: brand.primary },

  btnPrimary: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
  },
  btnPrimaryTxt: { color: brand.white, fontSize: fontSize.sm, fontWeight: '800' },
});
