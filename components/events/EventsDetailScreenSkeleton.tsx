import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

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
    <View style={skStyles.sectionCard}>
      <SkeletonBlock style={skStyles.sectionHeading} pulseStyle={pulseStyle} />
      {Array.from({ length: rowCount }, (_, i) => (
        <View
          key={i}
          style={[
            skStyles.infoRow,
            isRTL && skStyles.rowRtl,
            i === rowCount - 1 && skStyles.infoRowLast,
          ]}
        >
          <SkeletonBlock style={skStyles.infoIconWrap} pulseStyle={pulseStyle} />
          <View style={skStyles.infoTextCol}>
            <SkeletonBlock style={skStyles.infoLabel} pulseStyle={pulseStyle} />
            <SkeletonBlock style={[skStyles.infoValue, i === 1 && skStyles.infoValueShort]} pulseStyle={pulseStyle} />
          </View>
        </View>
      ))}
    </View>
  );
}

/** Squelette aligné sur `evenements/[id].tsx`. */
export function EventsDetailScreenSkeleton({ isRTL = false, style }: Props) {
  const pulseStyle = useSkeletonPulse();

  return (
    <View style={[skStyles.root, style]}>
      <View style={[skStyles.heroBar, isRTL && skStyles.rowRtl]}>
        <SkeletonBlock style={skStyles.menuBtn} pulseStyle={pulseStyle} />
        <View style={skStyles.heroBarSpacer} />
        <SkeletonBlock style={skStyles.langBtn} pulseStyle={pulseStyle} />
        <SkeletonBlock style={skStyles.backBtn} pulseStyle={pulseStyle} />
      </View>

      <ScrollView
        style={skStyles.body}
        contentContainerStyle={skStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SkeletonBlock style={skStyles.coverHero} pulseStyle={pulseStyle} />

        <View style={skStyles.contentSheet}>
          <SkeletonBlock style={skStyles.pageTitle} pulseStyle={pulseStyle} />
          <SkeletonBlock style={[skStyles.pageTitle, skStyles.pageTitleShort]} pulseStyle={pulseStyle} />
          <View style={[skStyles.titleBadges, isRTL && skStyles.rowRtl]}>
            <SkeletonBlock style={skStyles.kindPill} pulseStyle={pulseStyle} />
            <SkeletonBlock style={skStyles.livePill} pulseStyle={pulseStyle} />
          </View>

          <SectionCardSkeleton pulseStyle={pulseStyle} isRTL={isRTL} rowCount={3} />
          <SectionCardSkeleton pulseStyle={pulseStyle} isRTL={isRTL} rowCount={2} />
          <SectionCardSkeleton pulseStyle={pulseStyle} isRTL={isRTL} rowCount={2} />

          <SkeletonBlock style={skStyles.ctaBlock} pulseStyle={pulseStyle} />
        </View>
      </ScrollView>
    </View>
  );
}

const skStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.primary },
  heroBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: brand.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  heroBarSpacer: { flex: 1 },
  langBtn: {
    width: 36,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  body: { flex: 1, backgroundColor: brand.backgroundSoft },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.section * 2,
  },
  coverHero: {
    marginHorizontal: -spacing.lg,
    marginBottom: -spacing.lg,
    height: 220,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    backgroundColor: SKELETON_BG,
  },
  contentSheet: {
    paddingTop: spacing.lg + spacing.sm,
    gap: spacing.md,
  },
  pageTitle: {
    width: '92%',
    height: 24,
    borderRadius: 6,
    backgroundColor: SKELETON_BG_STRONG,
  },
  pageTitleShort: {
    width: '64%',
    marginTop: 8,
  },
  titleBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  kindPill: {
    width: 80,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: SKELETON_BG,
  },
  livePill: {
    width: 64,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: SKELETON_BG_STRONG,
  },
  sectionCard: {
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.06)',
    gap: 0,
  },
  sectionHeading: {
    width: 140,
    height: 16,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.borderLight,
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: SKELETON_BG,
  },
  infoTextCol: { flex: 1, minWidth: 0, gap: 6 },
  infoLabel: {
    width: 72,
    height: 10,
    borderRadius: 3,
    backgroundColor: SKELETON_BG,
  },
  infoValue: {
    width: '88%',
    height: 16,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
  },
  infoValueShort: { width: '55%' },
  ctaBlock: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: SKELETON_BG_STRONG,
    marginTop: spacing.sm,
  },
});
