import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import {
  LoadingProgressBarSkeleton,
  SKELETON_BG,
  SKELETON_BG_STRONG,
  SkeletonBlock,
  useSkeletonPulse,
} from '@/components/ui/CardLoadingSkeleton';
import { homeShell } from '@/theme/homeShell';
import { radius, spacing } from '@/theme/tokens';

type RtlProps = {
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
  isLast?: boolean;
};

/** Carte service actif — structure alignée sur `ServiceCard` dans ActiveServicesPanel. */
export function ActiveServiceCardSkeleton({ isRTL = false, style, isLast = false }: RtlProps) {
  const pulse = useSkeletonPulse();
  const row = isRTL ? styles.rowRtl : undefined;

  return (
    <View style={[styles.serviceCard, !isLast && styles.serviceCardGap, style]}>
      <View style={[styles.serviceHead, row]}>
        <SkeletonBlock style={styles.serviceIcon} pulseStyle={pulse} />
        <View style={styles.serviceHeadBody}>
          <SkeletonBlock style={styles.serviceName} pulseStyle={pulse} />
          <SkeletonBlock style={styles.serviceMeta} pulseStyle={pulse} />
        </View>
      </View>

      <View style={styles.paymentBlock}>
        <View style={[styles.paymentBadgeRow, row]}>
          <SkeletonBlock style={styles.paymentBadge} pulseStyle={pulse} />
          <SkeletonBlock style={styles.remainingLine} pulseStyle={pulse} />
        </View>
        <LoadingProgressBarSkeleton isRTL={isRTL} />
        <View style={[styles.moneyRow, row]}>
          <SkeletonBlock style={styles.moneyCell} pulseStyle={pulse} />
          <SkeletonBlock style={styles.moneyCell} pulseStyle={pulse} />
          <SkeletonBlock style={styles.moneyCellShort} pulseStyle={pulse} />
        </View>
        <SkeletonBlock style={styles.receiptBtn} pulseStyle={pulse} />
      </View>

      <View style={styles.accessBlock}>
        <SkeletonBlock style={styles.daysChip} pulseStyle={pulse} />
        <SkeletonBlock style={styles.endDateLine} pulseStyle={pulse} />
      </View>

      <View style={styles.txSection}>
        <SkeletonBlock style={styles.txSectionTitle} pulseStyle={pulse} />
        <ActiveServiceTxRowSkeleton isRTL={isRTL} pulse={pulse} />
        <ActiveServiceTxRowSkeleton isRTL={isRTL} pulse={pulse} bordered />
      </View>
    </View>
  );
}

function ActiveServiceTxRowSkeleton({
  isRTL,
  pulse,
  bordered = false,
}: {
  isRTL: boolean;
  pulse: ReturnType<typeof useSkeletonPulse>;
  bordered?: boolean;
}) {
  return (
    <View style={[styles.txRow, bordered && styles.txRowBorder, isRTL && styles.rowRtl]}>
      <SkeletonBlock style={styles.txIcon} pulseStyle={pulse} />
      <View style={styles.txBody}>
        <View style={[styles.txTopLine, isRTL && styles.rowRtl]}>
          <SkeletonBlock style={styles.txAmount} pulseStyle={pulse} />
          <SkeletonBlock style={styles.txDate} pulseStyle={pulse} />
        </View>
        <SkeletonBlock style={styles.txMeta} pulseStyle={pulse} />
      </View>
    </View>
  );
}

export function ActiveServicesLoadingSkeleton({
  isRTL = false,
  count = 1,
  style,
}: {
  isRTL?: boolean;
  count?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={style}>
      {Array.from({ length: count }, (_, i) => (
        <ActiveServiceCardSkeleton key={`active-svc-sk-${i}`} isRTL={isRTL} isLast={i === count - 1} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rowRtl: { flexDirection: 'row-reverse' },
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
    backgroundColor: SKELETON_BG,
  },
  serviceHeadBody: { flex: 1, minWidth: 0, gap: 6 },
  serviceName: {
    width: '72%',
    height: 16,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
  },
  serviceMeta: {
    width: '48%',
    height: 11,
    borderRadius: 3,
    backgroundColor: SKELETON_BG,
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
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  paymentBadge: {
    width: 128,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: SKELETON_BG,
  },
  remainingLine: {
    width: 96,
    height: 14,
    borderRadius: 3,
    backgroundColor: SKELETON_BG,
  },
  moneyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  moneyCell: {
    width: 72,
    height: 32,
    borderRadius: 4,
    backgroundColor: SKELETON_BG,
  },
  moneyCellShort: {
    width: 64,
    height: 32,
    borderRadius: 4,
    backgroundColor: SKELETON_BG,
  },
  receiptBtn: {
    width: 168,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: SKELETON_BG,
  },
  accessBlock: { gap: 6 },
  daysChip: {
    width: 140,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: SKELETON_BG,
    alignSelf: 'flex-start',
  },
  endDateLine: {
    width: '55%',
    height: 11,
    borderRadius: 3,
    backgroundColor: SKELETON_BG,
  },
  txSection: {
    marginTop: 2,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: homeShell.borderOnWhite,
    gap: spacing.xs,
  },
  txSectionTitle: {
    width: '42%',
    height: 14,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
    marginBottom: 2,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: 6,
  },
  txRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  txIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: SKELETON_BG,
    marginTop: 1,
  },
  txBody: { flex: 1, minWidth: 0, gap: 6 },
  txTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  txAmount: {
    width: 72,
    height: 14,
    borderRadius: 3,
    backgroundColor: SKELETON_BG_STRONG,
  },
  txDate: {
    width: 56,
    height: 11,
    borderRadius: 3,
    backgroundColor: SKELETON_BG,
  },
  txMeta: {
    width: '88%',
    height: 11,
    borderRadius: 3,
    backgroundColor: SKELETON_BG,
  },
});
