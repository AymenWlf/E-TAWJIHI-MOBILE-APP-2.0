import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { SkeletonBlock, SKELETON_BG, SKELETON_BG_STRONG, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import { brand, radius, spacing } from '@/theme/tokens';

type Props = {
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
};

function SectionCardSkeleton({
  pulseStyle,
  isRTL,
  rowCount = 3,
}: {
  pulseStyle: ReturnType<typeof useSkeletonPulse>;
  isRTL?: boolean;
  rowCount?: number;
}) {
  return (
    <View style={skStyles.section}>
      <SkeletonBlock style={skStyles.sectionTitle} pulseStyle={pulseStyle} />
      {Array.from({ length: rowCount }, (_, i) => (
        <View key={i} style={[skStyles.row, isRTL && skStyles.rowRtl]}>
          <SkeletonBlock style={skStyles.rowIcon} pulseStyle={pulseStyle} />
          <SkeletonBlock style={[skStyles.rowVal, i === rowCount - 1 && skStyles.rowValShort]} pulseStyle={pulseStyle} />
        </View>
      ))}
    </View>
  );
}

/** Squelette aligné sur `app/boutique/thank-you.tsx` (hero + cartes récap). */
export function ShopThankYouScreenSkeleton({ isRTL = false, style }: Props) {
  const pulseStyle = useSkeletonPulse();

  return (
    <View style={[skStyles.list, style]}>
      <View style={skStyles.heroCard}>
        <SkeletonBlock style={skStyles.heroIcon} pulseStyle={pulseStyle} />
        <SkeletonBlock style={skStyles.heroEyebrow} pulseStyle={pulseStyle} />
        <SkeletonBlock style={skStyles.heroTitle} pulseStyle={pulseStyle} />
        <SkeletonBlock style={[skStyles.heroDesc, skStyles.heroDescMid]} pulseStyle={pulseStyle} />
        <SkeletonBlock style={[skStyles.heroDesc, skStyles.heroDescShort]} pulseStyle={pulseStyle} />
        <View style={[skStyles.refRow, isRTL && skStyles.refRowRtl]}>
          <View style={skStyles.refCol}>
            <SkeletonBlock style={skStyles.refLbl} pulseStyle={pulseStyle} />
            <SkeletonBlock style={skStyles.refVal} pulseStyle={pulseStyle} />
          </View>
          <View style={[skStyles.refCol, skStyles.refColEnd]}>
            <SkeletonBlock style={skStyles.refLbl} pulseStyle={pulseStyle} />
            <SkeletonBlock style={skStyles.refTotal} pulseStyle={pulseStyle} />
          </View>
        </View>
      </View>

      <SectionCardSkeleton pulseStyle={pulseStyle} isRTL={isRTL} rowCount={4} />

      <View style={skStyles.section}>
        <SkeletonBlock style={skStyles.sectionTitle} pulseStyle={pulseStyle} />
        <View style={skStyles.payBlock}>
          <View style={[skStyles.payTitleRow, isRTL && skStyles.rowRtl]}>
            <SkeletonBlock style={skStyles.payTitleIcon} pulseStyle={pulseStyle} />
            <SkeletonBlock style={skStyles.payTitle} pulseStyle={pulseStyle} />
          </View>
          <SkeletonBlock style={skStyles.copyRow} pulseStyle={pulseStyle} />
          <SkeletonBlock style={skStyles.copyRow} pulseStyle={pulseStyle} />
          <SkeletonBlock style={skStyles.instructionBox} pulseStyle={pulseStyle} />
        </View>
      </View>

      <View style={skStyles.section}>
        <SkeletonBlock style={skStyles.sectionTitle} pulseStyle={pulseStyle} />
        {Array.from({ length: 2 }, (_, i) => (
          <View key={i} style={[skStyles.lineRow, isRTL && skStyles.rowRtl]}>
            <SkeletonBlock style={skStyles.lineThumb} pulseStyle={pulseStyle} />
            <SkeletonBlock style={skStyles.lineTitle} pulseStyle={pulseStyle} />
            <SkeletonBlock style={skStyles.lineQty} pulseStyle={pulseStyle} />
            <SkeletonBlock style={skStyles.lineVal} pulseStyle={pulseStyle} />
          </View>
        ))}
        <View style={skStyles.summaryDivider} />
        <View style={[skStyles.summaryRow, isRTL && skStyles.rowRtl]}>
          <SkeletonBlock style={skStyles.summaryLbl} pulseStyle={pulseStyle} />
          <SkeletonBlock style={skStyles.summaryVal} pulseStyle={pulseStyle} />
        </View>
        <View style={[skStyles.summaryRow, isRTL && skStyles.rowRtl]}>
          <SkeletonBlock style={skStyles.summaryLbl} pulseStyle={pulseStyle} />
          <SkeletonBlock style={skStyles.summaryVal} pulseStyle={pulseStyle} />
        </View>
        <View style={skStyles.summaryDivider} />
        <View style={[skStyles.summaryRow, isRTL && skStyles.rowRtl]}>
          <SkeletonBlock style={skStyles.summaryTotalLbl} pulseStyle={pulseStyle} />
          <SkeletonBlock style={skStyles.summaryTotalVal} pulseStyle={pulseStyle} />
        </View>
      </View>

      <View style={skStyles.section}>
        <SkeletonBlock style={skStyles.sectionTitle} pulseStyle={pulseStyle} />
        {Array.from({ length: 3 }, (_, i) => (
          <View key={i} style={[skStyles.stepRow, isRTL && skStyles.stepRowRtl]}>
            <SkeletonBlock style={skStyles.stepNum} pulseStyle={pulseStyle} />
            <SkeletonBlock style={[skStyles.stepTxt, i === 2 && skStyles.stepTxtShort]} pulseStyle={pulseStyle} />
          </View>
        ))}
      </View>

      <SkeletonBlock style={skStyles.ctaBtn} pulseStyle={pulseStyle} />
      <View style={{ height: spacing.xxl }} />
    </View>
  );
}

const skStyles = StyleSheet.create({
  list: { gap: spacing.md },
  heroCard: {
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: brand.border,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: 8,
  },
  heroIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: SKELETON_BG,
    marginBottom: spacing.sm,
  },
  heroEyebrow: {
    width: 88,
    height: 12,
    borderRadius: 4,
    backgroundColor: SKELETON_BG,
  },
  heroTitle: {
    width: '72%',
    height: 26,
    borderRadius: 6,
    backgroundColor: SKELETON_BG_STRONG,
    marginTop: 4,
  },
  heroDesc: {
    width: '90%',
    height: 14,
    borderRadius: 4,
    backgroundColor: SKELETON_BG,
  },
  heroDescMid: { width: '82%' },
  heroDescShort: { width: '58%' },
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
  refCol: { gap: 6 },
  refColEnd: { alignItems: 'flex-end' },
  refLbl: {
    width: 56,
    height: 10,
    borderRadius: 3,
    backgroundColor: SKELETON_BG,
  },
  refVal: {
    width: 100,
    height: 18,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
  },
  refTotal: {
    width: 88,
    height: 24,
    borderRadius: 5,
    backgroundColor: SKELETON_BG_STRONG,
  },
  section: {
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: brand.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    width: 160,
    height: 18,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  rowIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: SKELETON_BG,
  },
  rowVal: {
    flex: 1,
    height: 14,
    borderRadius: 4,
    backgroundColor: SKELETON_BG,
  },
  rowValShort: { maxWidth: '62%' },
  payBlock: {
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: brand.border,
    backgroundColor: brand.backgroundSoft,
    gap: spacing.sm,
  },
  payTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.borderLight,
  },
  payTitleIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: SKELETON_BG,
  },
  payTitle: {
    flex: 1,
    height: 16,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
  },
  copyRow: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: SKELETON_BG,
    borderWidth: 1,
    borderColor: brand.border,
  },
  instructionBox: {
    height: 72,
    borderRadius: radius.md,
    backgroundColor: SKELETON_BG,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.borderLight,
  },
  lineThumb: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: SKELETON_BG,
  },
  lineTitle: {
    flex: 1,
    height: 14,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
  },
  lineQty: {
    width: 24,
    height: 12,
    borderRadius: 3,
    backgroundColor: SKELETON_BG,
  },
  lineVal: {
    width: 64,
    height: 14,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: brand.border,
    marginVertical: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  summaryLbl: {
    width: 100,
    height: 12,
    borderRadius: 3,
    backgroundColor: SKELETON_BG,
  },
  summaryVal: {
    width: 72,
    height: 12,
    borderRadius: 3,
    backgroundColor: SKELETON_BG,
  },
  summaryTotalLbl: {
    width: 48,
    height: 16,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
  },
  summaryTotalVal: {
    width: 88,
    height: 20,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 4,
  },
  stepRowRtl: { flexDirection: 'row-reverse' },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: SKELETON_BG_STRONG,
  },
  stepTxt: {
    flex: 1,
    height: 14,
    borderRadius: 4,
    backgroundColor: SKELETON_BG,
    marginTop: 6,
  },
  stepTxtShort: { maxWidth: '78%' },
  ctaBtn: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: SKELETON_BG_STRONG,
  },
});
