import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { ActiveServicesLoadingSkeleton } from '@/components/account/ActiveServiceCardSkeleton';
import { Text } from '@/components/ui/Text';
import type { HomeCopyKey } from '@/constants/i18n';
import type { UserActiveCommercialService } from '@/services/userActiveServices';
import type { CommercialReceiptClientInfo } from '@/utils/commercialServiceReceiptDocument';
import { downloadCommercialServiceReceiptPdf } from '@/utils/downloadCommercialServiceReceipt';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import {
  commercialPaymentMethodLabel,
  commercialTransactionStatusLabel,
} from '@/utils/commercialPaymentLabels';
import { formatShortDateInParis } from '@/utils/dateParis';
import { formatShopPrice } from '@/utils/shopFormatPrice';

type Props = {
  services: UserActiveCommercialService[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  rtl: boolean;
  locale: string;
  t: (k: HomeCopyKey) => string;
  onRetry: () => void;
  receiptClient: CommercialReceiptClientInfo | null;
};

function parseMoney(raw: string | null | undefined): number {
  if (raw == null || raw === '') return 0;
  const n = Number.parseFloat(String(raw).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function daysLabel(
  svc: UserActiveCommercialService,
  t: (k: HomeCopyKey) => string,
): { text: string; tone: 'ok' | 'warn' | 'muted' } {
  if (!svc.hasEndDate || svc.daysRemaining === null) {
    return { text: t('accountActiveServicesNoEndDate'), tone: 'muted' };
  }
  if (svc.daysRemaining === 0) {
    return { text: t('accountActiveServicesEndsToday'), tone: 'warn' };
  }
  if (svc.daysRemaining === 1) {
    return { text: t('accountActiveServicesOneDayLeft'), tone: 'warn' };
  }
  const text = t('accountActiveServicesDaysRemaining').replace('{{count}}', String(svc.daysRemaining));
  if (svc.daysRemaining <= 14) {
    return { text, tone: 'warn' };
  }
  return { text, tone: 'ok' };
}

function MoneyCell({
  label,
  value,
  highlight,
  rtl,
}: {
  label: string;
  value: string;
  highlight?: 'ok' | 'warn' | 'default';
  rtl: boolean;
}) {
  return (
    <View style={[styles.moneyCell, rtl && styles.moneyCellRtl]}>
      <Text style={[styles.moneyLabel, rtl && styles.txtRtl]}>{label}</Text>
      <Text
        style={[
          styles.moneyValue,
          highlight === 'ok' && styles.moneyValueOk,
          highlight === 'warn' && styles.moneyValueWarn,
          rtl && styles.txtRtl,
        ]}>
        {value}
      </Text>
    </View>
  );
}

function ReceiptDownloadButton({
  rtl,
  t,
  busy,
  onPress,
}: {
  rtl: boolean;
  t: (k: HomeCopyKey) => string;
  busy: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={t('accountActiveServicesDownloadReceipt')}
      style={({ pressed }) => [
        styles.receiptBtn,
        rtl && styles.receiptBtnRtl,
        pressed && !busy && styles.receiptBtnPressed,
        busy && { opacity: 0.6 },
      ]}>
      {busy ? (
        <ActivityIndicator size="small" color={homeShell.blue} />
      ) : (
        <FontAwesome name="download" size={13} color={homeShell.blue} />
      )}
      <Text style={[styles.receiptBtnTxt, rtl && styles.txtRtl]}>
        {t('accountActiveServicesDownloadReceipt')}
      </Text>
    </Pressable>
  );
}

function ServiceCard({
  svc,
  rtl,
  loc,
  t,
  isLast,
  receiptClient,
  receiptBusy,
  onDownloadReceipt,
}: {
  svc: UserActiveCommercialService;
  rtl: boolean;
  loc: string;
  t: (k: HomeCopyKey) => string;
  isLast: boolean;
  receiptClient: CommercialReceiptClientInfo | null;
  receiptBusy: boolean;
  onDownloadReceipt: (svc: UserActiveCommercialService) => void;
}) {
  const days = daysLabel(svc, t);
  const endStr = svc.dateFin ? formatShortDateInParis(svc.dateFin, loc) : null;
  const total = parseMoney(svc.montantTotal ?? svc.prix);
  const paid = parseMoney(svc.montantPaye ?? svc.totalPaye);
  const remaining = parseMoney(svc.resteAPayer);
  const showPayment = total > 0.01;
  const progress = showPayment ? Math.min(1, paid / total) : 1;
  const complete = svc.paymentComplete ?? remaining < 0.01;
  const txs = svc.transactions ?? [];

  return (
    <View style={[styles.serviceCard, !isLast && styles.serviceCardGap]}>
      <View style={[styles.serviceHead, rtl && styles.rowRtl]}>
        <View style={styles.serviceIcon}>
          <FontAwesome name="graduation-cap" size={16} color={homeShell.greenDark} />
        </View>
        <View style={styles.serviceHeadBody}>
          <Text style={[styles.serviceName, rtl && styles.txtRtl]} numberOfLines={2}>
            {svc.serviceName}
          </Text>
          {svc.numeroContrat ? (
            <Text style={[styles.meta, rtl && styles.txtRtl]}>
              {t('accountActiveServicesContract')} · {svc.numeroContrat}
            </Text>
          ) : null}
        </View>
      </View>

      {showPayment ? (
        <View style={styles.paymentBlock}>
          <View style={[styles.paymentBadgeRow, rtl && styles.rowRtl]}>
            <View
              style={[
                styles.paymentBadge,
                complete ? styles.paymentBadgeOk : styles.paymentBadgeWarn,
              ]}>
              <FontAwesome
                name={complete ? 'check-circle' : 'exclamation-circle'}
                size={13}
                color={complete ? homeShell.greenDark : '#B45309'}
              />
              <Text
                style={[
                  styles.paymentBadgeTxt,
                  complete ? styles.paymentBadgeTxtOk : styles.paymentBadgeTxtWarn,
                ]}>
                {complete
                  ? t('accountActiveServicesPaymentComplete')
                  : t('accountActiveServicesPaymentIncomplete')}
              </Text>
            </View>
            {!complete && remaining > 0.01 ? (
              <Text style={[styles.remainingHighlight, rtl && styles.txtRtl]}>
                {t('accountActiveServicesRemaining')}: {formatShopPrice(remaining)}
              </Text>
            ) : null}
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>

          <View style={[styles.moneyRow, rtl && styles.moneyRowRtl]}>
            <MoneyCell label={t('accountActiveServicesTotal')} value={formatShopPrice(total)} rtl={rtl} />
            <MoneyCell
              label={t('accountActiveServicesPaid')}
              value={formatShopPrice(paid)}
              highlight="ok"
              rtl={rtl}
            />
            {!complete ? (
              <MoneyCell
                label={t('accountActiveServicesRemaining')}
                value={formatShopPrice(remaining)}
                highlight="warn"
                rtl={rtl}
              />
            ) : null}
          </View>

          {svc.promoCode ? (
            <Text style={[styles.promoLine, rtl && styles.txtRtl]}>
              {t('accountActiveServicesPromo')}: {svc.promoCode}
              {svc.promoDiscount ? ` (−${formatShopPrice(svc.promoDiscount)})` : ''}
            </Text>
          ) : null}

          {showPayment && receiptClient ? (
            <ReceiptDownloadButton
              rtl={rtl}
              t={t}
              busy={receiptBusy}
              onPress={() => onDownloadReceipt(svc)}
            />
          ) : null}
        </View>
      ) : null}

      <View style={styles.accessBlock}>
        <View
          style={[
            styles.daysChip,
            days.tone === 'ok' && styles.daysChipOk,
            days.tone === 'warn' && styles.daysChipWarn,
            days.tone === 'muted' && styles.daysChipMuted,
            rtl && styles.rowRtl,
          ]}>
          <FontAwesome
            name={svc.hasEndDate ? 'clock-o' : 'check'}
            size={12}
            color={days.tone === 'warn' ? '#B45309' : days.tone === 'ok' ? homeShell.greenDark : homeShell.cardMuted}
          />
          <Text
            style={[
              styles.daysChipTxt,
              days.tone === 'warn' && styles.daysChipTxtWarn,
              days.tone === 'ok' && styles.daysChipTxtOk,
            ]}>
            {days.text}
          </Text>
        </View>
        {endStr ? (
          <Text style={[styles.meta, rtl && styles.txtRtl]}>
            {t('accountActiveServicesEndDate')}: {endStr}
          </Text>
        ) : null}
      </View>

      <View style={styles.txSection}>
        <Text style={[styles.txSectionTitle, rtl && styles.txtRtl]}>
          {t('accountActiveServicesTransactions')}
        </Text>
        {txs.length === 0 ? (
          <View style={styles.txEmptyWrap}>
            <Text style={[styles.txEmpty, rtl && styles.txtRtl]}>{t('accountActiveServicesNoTransactions')}</Text>
          </View>
        ) : (
          txs.map((tx, txIdx) => {
            const txDate = tx.date ? formatShortDateInParis(tx.date, loc) : '—';
            const moyen = commercialPaymentMethodLabel(tx.moyen);
            const statut = commercialTransactionStatusLabel(tx.statut);
            return (
              <View
                key={tx.id}
                style={[styles.txRow, txIdx > 0 && styles.txRowBorder, rtl && styles.txRowRtl]}>
                <View style={styles.txIcon}>
                  <FontAwesome name="money" size={14} color={homeShell.blue} />
                </View>
                <View style={styles.txBody}>
                  <View style={[styles.txTopLine, rtl && styles.rowRtl]}>
                    <Text style={[styles.txAmount, rtl && styles.txtRtl]}>
                      {formatShopPrice(tx.montant)}
                    </Text>
                    <Text style={[styles.txDate, rtl && styles.txtRtl]}>{txDate}</Text>
                  </View>
                  <Text style={[styles.txMeta, rtl && styles.txtRtl]}>
                    {t('accountActiveServicesTxMethod')}: {moyen}
                    {' · '}
                    {t('accountActiveServicesTxStatus')}: {statut}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

export function ActiveServicesPanel({
  services,
  loading,
  loaded,
  error,
  rtl,
  locale,
  t,
  onRetry,
  receiptClient,
}: Props) {
  const loc = locale === 'ar' ? 'ar' : 'fr';
  const [receiptBusyId, setReceiptBusyId] = useState<number | null>(null);

  const onDownloadReceipt = useCallback(
    async (svc: UserActiveCommercialService) => {
      if (!receiptClient) return;
      setReceiptBusyId(svc.id);
      try {
        const client: CommercialReceiptClientInfo = {
          ...receiptClient,
          numeroContrat: svc.numeroContrat ?? receiptClient.numeroContrat,
        };
        await downloadCommercialServiceReceiptPdf(client, [svc]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : '';
        if (msg === 'NO_PAYMENTS') {
          Alert.alert(t('accountActiveServicesReceiptSoonTitle'), t('accountActiveServicesReceiptSoonBody'), [
            { text: 'OK' },
          ]);
        } else if (msg === 'SHARE_UNAVAILABLE') {
          Alert.alert(t('accountActiveServicesReceiptSoonTitle'), t('accountActiveServicesReceiptShareUnavailable'), [
            { text: 'OK' },
          ]);
        } else {
          Alert.alert(t('accountActiveServicesReceiptSoonTitle'), t('accountActiveServicesReceiptError'), [
            { text: 'OK' },
          ]);
        }
      } finally {
        setReceiptBusyId(null);
      }
    },
    [receiptClient, t],
  );

  return (
    <View style={styles.card}>
      <View style={[styles.sectionHead, rtl && styles.rowRtl]}>
        <FontAwesome name="briefcase" size={16} color={homeShell.blue} />
        <Text style={[styles.sectionTitle, rtl ? styles.sectionTitleRtl : styles.sectionTitleLtr]}>
          {t('accountSectionActiveServices')}
        </Text>
        {services.length > 0 ? (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeTxt}>{services.length}</Text>
          </View>
        ) : null}
      </View>

      {loading && !loaded ? (
        <ActiveServicesLoadingSkeleton isRTL={rtl} count={1} />
      ) : error ? (
        <View style={styles.center}>
          <Text style={[styles.hint, styles.error, rtl && styles.txtRtl]}>{error}</Text>
          <Pressable onPress={onRetry} style={styles.retryBtn}>
            <Text style={styles.retryTxt}>{t('inscRetry')}</Text>
          </Pressable>
        </View>
      ) : services.length === 0 ? (
        <Text style={[styles.hint, rtl && styles.txtRtl]}>{t('accountActiveServicesEmpty')}</Text>
      ) : (
        services.map((svc, idx) => (
            <ServiceCard
              key={svc.id}
              svc={svc}
              rtl={rtl}
              loc={loc}
              t={t}
              isLast={idx === services.length - 1}
              receiptClient={receiptClient}
              receiptBusy={receiptBusyId === svc.id}
              onDownloadReceipt={onDownloadReceipt}
            />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: homeShell.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  sectionTitle: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '800',
    color: homeShell.cardText,
  },
  sectionTitleLtr: { textAlign: 'left' },
  sectionTitleRtl: { textAlign: 'right' },
  countBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeTxt: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: homeShell.blue,
  },
  center: { alignItems: 'center', paddingVertical: spacing.md, gap: spacing.sm },
  hint: {
    fontSize: fontSize.sm,
    color: homeShell.cardMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  error: { color: brand.error },
  retryBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: homeShell.blue,
  },
  retryTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.sm },
  txtRtl: { textAlign: 'right', writingDirection: 'rtl' },
  serviceCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    padding: spacing.md,
    gap: spacing.sm,
  },
  serviceCardGap: { marginBottom: spacing.sm },
  serviceHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  serviceIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: homeShell.greenAlpha11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceHeadBody: { flex: 1, minWidth: 0, gap: 2 },
  serviceName: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: homeShell.cardText,
  },
  meta: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: homeShell.cardMuted,
  },
  paymentBlock: {
    backgroundColor: homeShell.card,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: homeShell.borderOnWhite,
  },
  paymentBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  paymentBadgeOk: { backgroundColor: homeShell.greenAlpha11 },
  paymentBadgeWarn: { backgroundColor: '#FEF3C7' },
  paymentBadgeTxt: { fontSize: fontSize.xs, fontWeight: '800' },
  paymentBadgeTxtOk: { color: homeShell.greenDark },
  paymentBadgeTxtWarn: { color: '#B45309' },
  remainingHighlight: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: '#B45309',
    flexShrink: 1,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: homeShell.greenDark,
  },
  moneyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  moneyRowRtl: { flexDirection: 'row-reverse' },
  moneyCell: { minWidth: 88, gap: 2 },
  moneyCellRtl: { alignItems: 'flex-end' },
  moneyLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: homeShell.cardMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  moneyValue: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: homeShell.cardText,
  },
  moneyValueOk: { color: homeShell.greenDark },
  moneyValueWarn: { color: '#B45309' },
  promoLine: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: homeShell.cardMuted,
  },
  accessBlock: { gap: 4 },
  daysChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  daysChipOk: { backgroundColor: homeShell.greenAlpha11 },
  daysChipWarn: { backgroundColor: '#FEF3C7' },
  daysChipMuted: { backgroundColor: '#F1F5F9' },
  daysChipTxt: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: homeShell.cardMuted,
  },
  daysChipTxtOk: { color: homeShell.greenDark },
  daysChipTxtWarn: { color: '#B45309' },
  txSection: {
    marginTop: 2,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: homeShell.borderOnWhite,
    gap: spacing.xs,
  },
  txSectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: homeShell.cardText,
    marginBottom: 2,
  },
  txEmptyWrap: { gap: spacing.sm },
  txEmpty: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: homeShell.cardMuted,
    fontStyle: 'italic',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: 6,
  },
  txRowRtl: { flexDirection: 'row-reverse' },
  txRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  txIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  txBody: { flex: 1, minWidth: 0, gap: 2 },
  txTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  txAmount: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: homeShell.cardText,
  },
  txDate: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: homeShell.cardMuted,
  },
  txMeta: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: homeShell.cardMuted,
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: homeShell.blue,
    backgroundColor: '#EFF6FF',
    opacity: 0.92,
  },
  receiptBtnCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#94A3B8',
    backgroundColor: '#F8FAFC',
  },
  receiptBtnRtl: { flexDirection: 'row-reverse' },
  receiptBtnPressed: { opacity: 0.75 },
  receiptBtnTxt: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: homeShell.blue,
  },
  receiptBtnTxtCompact: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#64748B',
  },
});
