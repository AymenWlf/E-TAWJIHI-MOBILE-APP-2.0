import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SkeletonBlock, SKELETON_BG, SKELETON_BG_STRONG, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import { homeShell } from '@/theme/homeShell';
import { radius, spacing } from '@/theme/tokens';

const SK_ON_DARK = 'rgba(255, 255, 255, 0.22)';
const SK_ON_DARK_STRONG = 'rgba(255, 255, 255, 0.38)';

type Props = {
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
};

function OrderDetailCardSkeleton({
  pulseStyle,
  titleWidth = 160,
  children,
}: {
  pulseStyle: ReturnType<typeof useSkeletonPulse>;
  titleWidth?: number;
  children: ReactNode;
}) {
  return (
    <View style={sk.card}>
      <SkeletonBlock style={[sk.sectionTitle, { width: titleWidth }]} pulseStyle={pulseStyle} />
      {children}
    </View>
  );
}

/** Squelette aligné sur `app/compte/commande/[publicId].tsx` (hero bleu + cartes). */
export function AccountOrderDetailScreenSkeleton({ isRTL = false, style }: Props) {
  const pulseStyle = useSkeletonPulse();
  const insets = useSafeAreaInsets();

  return (
    <View style={[sk.root, style]}>
      <View style={[sk.hero, { paddingTop: insets.top + spacing.sm }]}>
        <View style={[sk.heroTop, isRTL && sk.rowRtl]}>
          <SkeletonBlock style={sk.heroBack} pulseStyle={pulseStyle} />
          <SkeletonBlock style={sk.heroScreenTitle} pulseStyle={pulseStyle} />
          <View style={sk.heroSpacer} />
        </View>
        <SkeletonBlock style={sk.heroOrderNum} pulseStyle={pulseStyle} />
        <SkeletonBlock style={sk.heroDate} pulseStyle={pulseStyle} />
        <SkeletonBlock style={sk.heroBadge} pulseStyle={pulseStyle} />
        <SkeletonBlock style={sk.heroTotal} pulseStyle={pulseStyle} />
      </View>

      <ScrollView
        contentContainerStyle={[sk.scroll, { paddingBottom: spacing.xxl + insets.bottom }]}
        showsVerticalScrollIndicator={false}>
        <OrderDetailCardSkeleton pulseStyle={pulseStyle} titleWidth={148}>
          <SkeletonBlock style={sk.modalityLbl} pulseStyle={pulseStyle} />
          <View style={sk.payBlock}>
            <SkeletonBlock style={sk.payLine} pulseStyle={pulseStyle} />
            <SkeletonBlock style={sk.payCopyRow} pulseStyle={pulseStyle} />
            <SkeletonBlock style={[sk.payLine, sk.payLineShort]} pulseStyle={pulseStyle} />
            <SkeletonBlock style={sk.payBtn} pulseStyle={pulseStyle} />
          </View>
        </OrderDetailCardSkeleton>

        <OrderDetailCardSkeleton pulseStyle={pulseStyle} isRTL={isRTL} titleWidth={132}>
          {Array.from({ length: 2 }, (_, i) => (
            <View key={i} style={[sk.lineRow, isRTL && sk.rowRtl]}>
              <SkeletonBlock style={sk.lineThumb} pulseStyle={pulseStyle} />
              <SkeletonBlock style={sk.lineTitle} pulseStyle={pulseStyle} />
              <SkeletonBlock style={sk.lineQty} pulseStyle={pulseStyle} />
              <SkeletonBlock style={sk.linePrice} pulseStyle={pulseStyle} />
            </View>
          ))}
        </OrderDetailCardSkeleton>

        <OrderDetailCardSkeleton pulseStyle={pulseStyle} titleWidth={120}>
          {Array.from({ length: 3 }, (_, i) => (
            <View key={i} style={[sk.sumRow, isRTL && sk.rowRtl]}>
              <SkeletonBlock style={sk.sumLbl} pulseStyle={pulseStyle} />
              <SkeletonBlock style={sk.sumVal} pulseStyle={pulseStyle} />
            </View>
          ))}
          <View style={[sk.sumRow, sk.sumRowTotal, isRTL && sk.rowRtl]}>
            <SkeletonBlock style={sk.sumTotalLbl} pulseStyle={pulseStyle} />
            <SkeletonBlock style={sk.sumTotalVal} pulseStyle={pulseStyle} />
          </View>
        </OrderDetailCardSkeleton>
      </ScrollView>
    </View>
  );
}

const sk = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  rowRtl: { flexDirection: 'row-reverse' },
  hero: {
    backgroundColor: homeShell.bg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  heroBack: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SK_ON_DARK,
  },
  heroScreenTitle: {
    flex: 1,
    height: 16,
    maxWidth: 140,
    alignSelf: 'center',
    borderRadius: 4,
    backgroundColor: SK_ON_DARK_STRONG,
  },
  heroSpacer: { width: 36 },
  heroOrderNum: {
    width: '58%',
    height: 22,
    borderRadius: 5,
    backgroundColor: SK_ON_DARK_STRONG,
  },
  heroDate: {
    width: '42%',
    height: 14,
    borderRadius: 4,
    backgroundColor: SK_ON_DARK,
  },
  heroBadge: {
    width: 88,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: SK_ON_DARK,
    marginTop: spacing.xs,
  },
  heroTotal: {
    width: 120,
    height: 28,
    borderRadius: 6,
    backgroundColor: SK_ON_DARK_STRONG,
    marginTop: spacing.sm,
  },
  scroll: { padding: spacing.md, gap: spacing.md },
  card: {
    backgroundColor: homeShell.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    height: 18,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
    marginBottom: 2,
  },
  modalityLbl: {
    width: '48%',
    height: 14,
    borderRadius: 4,
    backgroundColor: SKELETON_BG,
  },
  payBlock: {
    gap: spacing.sm,
    marginTop: spacing.xs,
    backgroundColor: '#EFF6FF',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  payLine: {
    width: '72%',
    height: 14,
    borderRadius: 4,
    backgroundColor: SKELETON_BG,
  },
  payLineShort: { width: '55%' },
  payCopyRow: {
    height: 44,
    borderRadius: radius.md,
    backgroundColor: SKELETON_BG_STRONG,
  },
  payBtn: {
    height: 44,
    borderRadius: radius.md,
    backgroundColor: SKELETON_BG_STRONG,
    marginTop: spacing.xs,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  lineThumb: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: SKELETON_BG,
  },
  lineTitle: {
    flex: 1,
    height: 14,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
  },
  lineQty: {
    width: 22,
    height: 12,
    borderRadius: 3,
    backgroundColor: SKELETON_BG,
  },
  linePrice: {
    width: 56,
    height: 14,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
  },
  sumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  sumRowTotal: {
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: homeShell.borderOnWhite,
  },
  sumLbl: {
    width: 100,
    height: 12,
    borderRadius: 3,
    backgroundColor: SKELETON_BG,
  },
  sumVal: {
    width: 72,
    height: 12,
    borderRadius: 3,
    backgroundColor: SKELETON_BG,
  },
  sumTotalLbl: {
    width: 56,
    height: 16,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
  },
  sumTotalVal: {
    width: 88,
    height: 18,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
  },
});
