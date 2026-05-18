import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OrderPromoApplyBlock } from '@/components/shop/OrderPromoApplyBlock';
import { PlatformServiceVisualThumb } from '@/components/shop/PlatformServiceVisualThumb';
import { Text } from '@/components/ui/Text';
import { getApiBaseUrl } from '@/constants/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { fetchUserOrderDetail, uploadUserOrderBankTransferReceipt } from '@/services/userOrders';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { homeShell } from '@/theme/homeShell';
import type { ShopOrderPayload } from '@/types/shop';
import { formatOrderCreatedAtShort } from '@/utils/dateParis';
import { formatShopPrice } from '@/utils/shopFormatPrice';
import {
  isShopOrderCompleted,
  orderHasActivePhysicalLines,
  orderHasActiveServiceLines,
  shopOrderStatusUi,
} from '@/utils/shopOrderStatusUi';

function receiptAbsoluteUrl(path: string | null | undefined): string | null {
  if (!path || !path.startsWith('/')) return null;
  return `${getApiBaseUrl().replace(/\/$/, '')}${path}`;
}

export default function AccountOrderDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, isRTL, locale } = useLocale();
  const { getValidAccessToken } = useAuth();
  const { publicId: rawPublicId } = useLocalSearchParams<{ publicId?: string | string[] }>();
  const publicId = Array.isArray(rawPublicId) ? rawPublicId[0] : rawPublicId;

  const [order, setOrder] = useState<ShopOrderPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadBusy, setUploadBusy] = useState(false);

  const reload = useCallback(async () => {
    if (!publicId) return;
    const token = await getValidAccessToken();
    if (!token) {
      setOrder(null);
      return;
    }
    const o = await fetchUserOrderDetail(token, publicId);
    setOrder(o);
  }, [publicId, getValidAccessToken]);

  useEffect(() => {
    let alive = true;
    void (async () => {
      setLoading(true);
      await reload();
      if (alive) setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [reload]);

  const completed = order ? isShopOrderCompleted(order.status) : false;
  const hasServices = order ? orderHasActiveServiceLines(order.lines) : false;
  const hasPhysical = order ? orderHasActivePhysicalLines(order.lines) : false;
  const followUp = order?.servicePaymentFollowUp ?? null;
  const isBankTransfer = order?.servicePaymentModality === 'bank_transfer';
  const showServicePayment =
    !!order && hasServices && !completed && (followUp != null || isBankTransfer);

  const serviceLines = useMemo(
    () => (order?.lines ?? []).filter((l) => !l.removedAt && l.productType === 'service'),
    [order],
  );
  const physicalLines = useMemo(
    () => (order?.lines ?? []).filter((l) => !l.removedAt && l.productType !== 'service'),
    [order],
  );

  const statusUi = order ? shopOrderStatusUi(order.status, locale) : null;
  const promoDiscount =
    order?.promoDiscountAmount && parseFloat(String(order.promoDiscountAmount).replace(',', '.')) > 0
      ? order.promoDiscountAmount
      : null;

  const onPickReceipt = useCallback(async () => {
    if (!publicId || !order) return;
    const token = await getValidAccessToken();
    if (!token) return;
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.canceled || !res.assets?.[0]) return;
      const a = res.assets[0];
      setUploadBusy(true);
      const next = await uploadUserOrderBankTransferReceipt(token, publicId, {
        uri: a.uri,
        name: a.name || 'justificatif.pdf',
        type: a.mimeType || 'application/octet-stream',
      });
      setOrder(next);
      Alert.alert('', t('shopThankBankUploadOk'));
    } catch (e) {
      Alert.alert(t('commonErrorTitle'), e instanceof Error ? e.message : t('shopThankBankUploadErr'));
    } finally {
      setUploadBusy(false);
    }
  }, [publicId, order, getValidAccessToken, t]);

  const flashCopy = useCallback(
    (text: string) => {
      const v = text.trim();
      if (!v) return;
      void Clipboard.setString(v);
      Alert.alert('', t('shopThankCopied'));
    },
    [t],
  );

  if (loading) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <View style={[styles.center, { paddingTop: insets.top }]}>
          <ActivityIndicator color={homeShell.text} size="large" />
        </View>
      </View>
    );
  }

  if (!order || !publicId) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <View style={[styles.center, { paddingTop: insets.top }]}>
          <Text style={styles.errTxt}>{t('accountOrderDetailNotFound')}</Text>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnTxt}>{locale === 'ar' ? 'رجوع' : 'Retour'}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const receiptUrl = receiptAbsoluteUrl(order.bankTransferReceiptUrl);
  const cashplusCode =
    followUp?.cashplusCode?.trim() || order.servicePaymentCashplusCode?.trim() || '';

  return (
    <View style={[styles.root, isRTL && styles.rtlRoot]}>
      <StatusBar style="light" />
      <View style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}>
        <View style={[styles.heroTop, isRTL && styles.rowRtl]}>
          <Pressable onPress={() => router.back()} style={styles.heroBack} hitSlop={12}>
            <FontAwesome name={isRTL ? 'chevron-right' : 'chevron-left'} size={18} color={homeShell.text} />
          </Pressable>
          <Text style={[styles.heroTitle, isRTL && styles.txtRtl]}>{t('accountOrderDetailTitle')}</Text>
          <View style={{ width: 36 }} />
        </View>
        <Text style={[styles.heroOrderNum, isRTL && styles.txtRtl]}>{`N° ${order.orderNumber}`}</Text>
        <Text style={[styles.heroDate, isRTL && styles.txtRtl]}>
          {formatOrderCreatedAtShort(order.createdAt, locale)}
        </Text>
        {statusUi ? (
          <View style={[styles.heroBadge, { backgroundColor: statusUi.bg }]}>
            <Text style={[styles.heroBadgeTxt, { color: statusUi.color }]}>{statusUi.label}</Text>
          </View>
        ) : null}
        <Text style={[styles.heroTotal, isRTL && styles.txtRtl]}>
          {formatShopPrice(order.total, order.currency)}
        </Text>
        {completed && hasServices ? (
          <Text style={[styles.heroCompletedNote, isRTL && styles.txtRtl]}>{t('accountOrderCompletedNote')}</Text>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: spacing.xxl + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >

        {showServicePayment ? (
          <View style={styles.card}>
            <Text style={[styles.sectionTitle, isRTL && styles.txtRtl]}>{t('accountOrderPaymentSection')}</Text>
            {followUp?.modalityLabel ? (
              <Text style={[styles.modalityLbl, isRTL && styles.txtRtl]}>{followUp.modalityLabel}</Text>
            ) : null}

            {isBankTransfer && followUp?.bankWire ? (
              <View style={styles.payBlock}>
                <Text style={[styles.lbl, isRTL && styles.txtRtl]}>{followUp.bankWire.bankName}</Text>
                <Pressable onPress={() => flashCopy(followUp.bankWire!.rib)} style={styles.copyRow}>
                  <Text style={styles.mono}>{followUp.bankWire.rib}</Text>
                  <FontAwesome name="copy" size={14} color={brand.primary} />
                </Pressable>
                <Text style={[styles.hint, isRTL && styles.txtRtl]}>{followUp.bankWire.accountHolder}</Text>
                {followUp.bankInstructions ? (
                  <Text style={[styles.instructions, isRTL && styles.txtRtl]}>{followUp.bankInstructions}</Text>
                ) : null}
                <Pressable
                  onPress={() => void onPickReceipt()}
                  disabled={uploadBusy}
                  style={[styles.uploadBtn, uploadBusy && { opacity: 0.6 }]}
                >
                  {uploadBusy ? (
                    <ActivityIndicator color={brand.white} />
                  ) : (
                    <FontAwesome name="cloud-upload" size={16} color={brand.white} />
                  )}
                  <Text style={styles.uploadBtnTxt}>
                    {uploadBusy ? t('shopThankBankUploadBusy') : t('shopThankBankUploadPick')}
                  </Text>
                </Pressable>
                {order.bankTransferReceiptUploadedAt ? (
                  <Text style={[styles.okNote, isRTL && styles.txtRtl]}>{t('shopThankBankUploadOk')}</Text>
                ) : null}
                {receiptUrl ? (
                  <Pressable onPress={() => void Linking.openURL(receiptUrl)}>
                    <Text style={styles.link}>{t('shopThankBankViewReceipt')}</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            {followUp?.modality === 'cashplus' && cashplusCode ? (
              <View style={styles.cashplusBox}>
                <Text style={[styles.cashplusLbl, isRTL && styles.txtRtl]}>{t('shopThankCashplusCodeLbl')}</Text>
                <Text style={[styles.cashplusCode, isRTL && styles.txtRtl]} selectable>
                  {cashplusCode}
                </Text>
                <Pressable
                  onPress={() => flashCopy(cashplusCode)}
                  style={({ pressed }) => [styles.cashplusCopyBtn, isRTL && styles.rowRtl, pressed && { opacity: 0.88 }]}
                >
                  <FontAwesome name="copy" size={16} color={brand.white} />
                  <Text style={styles.cashplusCopyBtnTxt}>{t('shopThankCopy')}</Text>
                </Pressable>
                {followUp.cashplusInstructions ? (
                  <Text style={[styles.instructions, isRTL && styles.txtRtl]}>{followUp.cashplusInstructions}</Text>
                ) : null}
              </View>
            ) : null}

            {followUp?.modality === 'office' ? (
              <View style={styles.officeBlock}>
                {followUp.officeAddress ? (
                  <Text style={[styles.instructions, isRTL && styles.txtRtl]}>{followUp.officeAddress}</Text>
                ) : null}
                {followUp.officeMapsUrl ? (
                  <Pressable
                    onPress={() => void Linking.openURL(followUp.officeMapsUrl!)}
                    style={({ pressed }) => [styles.mapsBtn, isRTL && styles.rowRtl, pressed && { opacity: 0.9 }]}
                  >
                    <FontAwesome name="map-marker" size={16} color={brand.white} />
                    <Text style={[styles.mapsBtnTxt, isRTL && styles.txtRtl]}>{t('shopThankOfficeMapsBtn')}</Text>
                  </Pressable>
                ) : null}
                {followUp.officeInstructions ? (
                  <Text style={[styles.instructions, isRTL && styles.txtRtl]}>{followUp.officeInstructions}</Text>
                ) : null}
              </View>
            ) : null}

            {followUp?.modality === 'pay_on_delivery' && followUp.payOnDeliveryMessage ? (
              <Text style={[styles.instructions, isRTL && styles.txtRtl]}>{followUp.payOnDeliveryMessage}</Text>
            ) : null}
          </View>
        ) : null}

        {hasPhysical ? (
          <View style={styles.card}>
            <Text style={[styles.sectionTitle, isRTL && styles.txtRtl]}>{t('accountOrderPhysicalSection')}</Text>
            {order.deliveryDelayLabel ? (
              <Text style={[styles.hint, isRTL && styles.txtRtl]}>{order.deliveryDelayLabel}</Text>
            ) : null}
            {order.city ? <Text style={[styles.hint, isRTL && styles.txtRtl]}>{order.city}</Text> : null}
            {order.addressLine ? (
              <Text style={[styles.hint, isRTL && styles.txtRtl]}>{order.addressLine}</Text>
            ) : null}
            {physicalLines.map((l) => (
              <LineRow key={l.id ?? l.productTitle} line={l} currency={order.currency} isRTL={isRTL} />
            ))}
          </View>
        ) : null}

        {hasServices ? (
          <View style={styles.card}>
            <Text style={[styles.sectionTitle, isRTL && styles.txtRtl]}>
              {completed ? t('accountOrderRecapSection') : t('accountOrderServicesSection')}
            </Text>
            {serviceLines.map((l) => (
              <LineRow key={l.id ?? l.productTitle} line={l} currency={order.currency} isRTL={isRTL} service />
            ))}
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={[styles.sumRow, isRTL && styles.rowRtl]}>
            <Text style={styles.sumLbl}>{t('shopThankSummarySubtotalItems')}</Text>
            <Text style={styles.sumVal}>{formatShopPrice(order.subtotal, order.currency)}</Text>
          </View>
          {hasPhysical ? (
            <View style={[styles.sumRow, isRTL && styles.rowRtl]}>
              <Text style={styles.sumLbl}>{t('shopThankSummaryShipFeesLbl')}</Text>
              <Text style={styles.sumVal}>{formatShopPrice(order.shippingFee, order.currency)}</Text>
            </View>
          ) : null}
          {promoDiscount ? (
            <View style={[styles.sumRow, isRTL && styles.rowRtl]}>
              <Text style={[styles.sumLbl, styles.promoLbl]}>
                {t('accountOrderPromoDiscount')}
                {order.promoCodeLabel?.trim() ? ` (${order.promoCodeLabel.trim()})` : ''}
              </Text>
              <Text style={[styles.sumVal, styles.promoVal]}>−{formatShopPrice(promoDiscount, order.currency)}</Text>
            </View>
          ) : null}
          <OrderPromoApplyBlock
            publicId={publicId}
            order={order}
            isRTL={isRTL}
            onOrderUpdated={setOrder}
          />
          <View style={[styles.sumRow, isRTL && styles.rowRtl]}>
            <Text style={styles.sumTotalLbl}>{t('shopThankTotalLabel')}</Text>
            <Text style={styles.sumTotalVal}>{formatShopPrice(order.total, order.currency)}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function LineRow({
  line,
  currency,
  isRTL,
  service,
}: {
  line: ShopOrderPayload['lines'][number];
  currency: string;
  isRTL: boolean;
  service?: boolean;
}) {
  return (
    <View style={[styles.lineRow, isRTL && styles.rowRtl]}>
      {service ? (
        <PlatformServiceVisualThumb
          brandIcon={line.platformServiceBrandIcon}
          brandColor={line.platformServiceBrandColor}
          size={36}
          iconSize={16}
        />
      ) : (
        <View style={styles.lineThumb}>
          <FontAwesome name="cube" size={14} color={brand.primary} />
        </View>
      )}
      <Text style={[styles.lineTitle, isRTL && styles.txtRtl]} numberOfLines={2}>
        {line.productTitle}
      </Text>
      <Text style={styles.lineQty}>×{line.quantity}</Text>
      <Text style={styles.linePrice}>{formatShopPrice(line.lineTotal, currency)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  rtlRoot: { direction: 'rtl' },
  rowRtl: { flexDirection: 'row-reverse' },
  txtRtl: { writingDirection: 'rtl', textAlign: 'right' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  errTxt: { fontSize: fontSize.md, color: homeShell.cardMuted },
  backBtn: { marginTop: spacing.md, padding: spacing.md },
  backBtnTxt: { color: brand.primary, fontWeight: '700' },
  hero: {
    backgroundColor: homeShell.bg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  heroBack: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { flex: 1, textAlign: 'center', fontSize: fontSize.md, fontWeight: '800', color: homeShell.text },
  heroOrderNum: { fontSize: fontSize.lg, fontWeight: '800', color: homeShell.text },
  heroDate: { fontSize: fontSize.sm, color: homeShell.textMuted },
  heroBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: spacing.xs,
  },
  heroBadgeTxt: { fontSize: 11, fontWeight: '700' },
  heroTotal: { fontSize: fontSize.xl, fontWeight: '800', color: homeShell.green, marginTop: spacing.sm },
  heroCompletedNote: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  scroll: { padding: spacing.md, gap: spacing.md },
  card: {
    backgroundColor: homeShell.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '800', color: homeShell.cardText },
  modalityLbl: { fontSize: fontSize.sm, fontWeight: '600', color: brand.primary },
  payBlock: {
    gap: spacing.sm,
    marginTop: spacing.xs,
    backgroundColor: '#EFF6FF',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  lbl: { fontWeight: '700', color: homeShell.cardText },
  copyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mono: { flex: 1, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13 },
  hint: { fontSize: fontSize.sm, color: homeShell.cardMuted },
  instructions: { fontSize: fontSize.sm, color: homeShell.cardText, lineHeight: 20 },
  officeBlock: { gap: spacing.sm, marginTop: spacing.xs },
  mapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: homeShell.blue,
    borderRadius: radius.md,
    paddingVertical: 12,
  },
  mapsBtnTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.sm },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: homeShell.blue,
    borderRadius: radius.md,
    paddingVertical: 12,
    marginTop: spacing.sm,
  },
  uploadBtnTxt: { color: brand.white, fontWeight: '700' },
  okNote: { fontSize: fontSize.sm, color: homeShell.greenDark },
  link: { color: brand.primary, fontWeight: '600', marginTop: 4 },
  cashplusBox: {
    backgroundColor: '#F5F3FF',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  cashplusLbl: { fontSize: fontSize.sm, fontWeight: '600', color: homeShell.cardMuted },
  cashplusCode: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#5B21B6',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 6,
  },
  cashplusCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: homeShell.blue,
    borderRadius: radius.md,
    paddingVertical: 10,
    marginTop: spacing.sm,
  },
  cashplusCopyBtnTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.sm },
  lineRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  lineThumb: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineTitle: { flex: 1, fontSize: fontSize.sm, color: homeShell.cardText },
  lineQty: { fontSize: fontSize.sm, color: homeShell.cardMuted },
  linePrice: { fontSize: fontSize.sm, fontWeight: '700', color: homeShell.cardText },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  sumLbl: { color: homeShell.cardMuted, fontSize: fontSize.sm },
  sumVal: { fontWeight: '600', color: homeShell.cardText },
  sumTotalLbl: { fontWeight: '800', color: homeShell.cardText },
  sumTotalVal: { fontWeight: '800', color: brand.primary, fontSize: fontSize.md },
  promoLbl: { color: '#166534' },
  promoVal: { color: '#166534', fontWeight: '700' },
});
