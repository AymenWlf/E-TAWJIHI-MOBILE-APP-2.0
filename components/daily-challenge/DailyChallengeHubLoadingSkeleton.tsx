import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import {
  LoadingProgressBarSkeleton,
  SkeletonBlock,
  SKELETON_BG,
  SKELETON_BG_STRONG,
  useSkeletonPulse,
} from '@/components/ui/CardLoadingSkeleton';
import { brand, radius, spacing } from '@/theme/tokens';

const ON_DARK = 'rgba(255, 255, 255, 0.28)';
const ON_DARK_STRONG = 'rgba(255, 255, 255, 0.42)';
const ON_DARK_PANEL = 'rgba(255, 255, 255, 0.14)';

type Props = {
  isRTL?: boolean;
  /** Carte progression (connecté). */
  showProgress?: boolean;
  style?: StyleProp<ViewStyle>;
};

function HubHeroSkeleton({ isRTL = false }: { isRTL?: boolean }) {
  const pulse = useSkeletonPulse();
  return (
    <View style={styles.hubHero}>
      <View style={[styles.hubHeroTopRow, isRTL && styles.rowReverse]}>
        <SkeletonBlock style={styles.hubBrandMark} pulseStyle={pulse} />
        <View style={styles.hubHeroTitles}>
          <SkeletonBlock style={styles.hubDateLine} pulseStyle={pulse} />
        </View>
      </View>
      <View style={[styles.hubStatsRow, isRTL && styles.rowReverse]}>
        {[0, 1].map((i) => (
          <View key={`stat-${i}`} style={[styles.hubStatCard, isRTL && styles.rowReverse]}>
            <SkeletonBlock style={styles.hubStatIcon} pulseStyle={pulse} />
            <View style={styles.hubStatTextCol}>
              <SkeletonBlock style={styles.hubStatLabel} pulseStyle={pulse} />
              <SkeletonBlock style={styles.hubStatValue} pulseStyle={pulse} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function ProgressCardSkeleton({ isRTL = false }: { isRTL?: boolean }) {
  const pulse = useSkeletonPulse();
  return (
    <View style={styles.progressCard}>
      <View style={[styles.progressBanner, isRTL && styles.rowReverse]}>
        <View style={[styles.progressBannerLeft, isRTL && styles.rowReverse]}>
          <SkeletonBlock style={styles.progressBannerIcon} pulseStyle={pulse} />
          <View style={styles.progressBannerTitles}>
            <SkeletonBlock style={styles.progressBannerKicker} pulseStyle={pulse} />
            <SkeletonBlock style={styles.progressBannerTitle} pulseStyle={pulse} />
          </View>
        </View>
        <SkeletonBlock style={styles.progressLevelPill} pulseStyle={pulse} />
      </View>
      <View style={styles.progressBody}>
        <View style={[styles.progressXpLabels, isRTL && styles.rowReverse]}>
          <SkeletonBlock style={styles.progressFireChip} pulseStyle={pulse} />
          <SkeletonBlock style={styles.progressXpCaption} pulseStyle={pulse} />
        </View>
        <LoadingProgressBarSkeleton isRTL={isRTL} />
        <View style={[styles.progressStatDeck, isRTL && styles.rowReverse]}>
          {[0, 1, 2].map((i) => (
            <View key={`psc-${i}`} style={styles.progressStatCard}>
              <SkeletonBlock style={styles.progressStatIcon} pulseStyle={pulse} />
              <SkeletonBlock style={styles.progressStatNum} pulseStyle={pulse} />
              <SkeletonBlock style={styles.progressStatLbl} pulseStyle={pulse} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function MissionCardSkeleton({ isRTL = false }: { isRTL?: boolean }) {
  const pulse = useSkeletonPulse();
  return (
    <View style={[styles.missionCard, isRTL && styles.rowReverse]}>
      <SkeletonBlock style={styles.missionAccent} pulseStyle={pulse} />
      <View style={styles.missionInner}>
        <View style={[styles.missionTop, isRTL && styles.rowReverse]}>
          <SkeletonBlock style={styles.missionIcon} pulseStyle={pulse} />
          <SkeletonBlock style={styles.missionTitle} pulseStyle={pulse} />
        </View>
        <SkeletonBlock style={styles.missionScoreLine} pulseStyle={pulse} />
      </View>
    </View>
  );
}

function MissionsSectionSkeleton({ isRTL = false }: { isRTL?: boolean }) {
  const pulse = useSkeletonPulse();
  return (
    <View style={styles.missionsCard}>
      <SkeletonBlock style={styles.missionsTitle} pulseStyle={pulse} />
      <SkeletonBlock style={styles.missionsIntro} pulseStyle={pulse} />
      <MissionCardSkeleton isRTL={isRTL} />
    </View>
  );
}

/** Skeleton du hub « Défi du jour » — calqué sur hero, missions et progression. */
export function DailyChallengeHubLoadingSkeleton({
  isRTL = false,
  showProgress = true,
  style,
}: Props) {
  return (
    <View style={[styles.root, style]}>
      <HubHeroSkeleton isRTL={isRTL} />
      <MissionsSectionSkeleton isRTL={isRTL} />
      {showProgress ? <ProgressCardSkeleton isRTL={isRTL} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%', gap: spacing.md },
  rowReverse: { flexDirection: 'row-reverse' },

  hubHero: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: brand.primary,
    gap: spacing.md,
  },
  hubHeroTopRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  hubBrandMark: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: ON_DARK_PANEL,
  },
  hubHeroTitles: { flex: 1, minWidth: 0 },
  hubDateLine: {
    width: '62%',
    height: 18,
    borderRadius: 4,
    backgroundColor: ON_DARK_STRONG,
  },
  hubStatsRow: { flexDirection: 'row', gap: spacing.sm },
  hubStatCard: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: ON_DARK_PANEL,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  hubStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ON_DARK,
  },
  hubStatTextCol: { flex: 1, gap: 6 },
  hubStatLabel: {
    width: '70%',
    height: 10,
    borderRadius: 3,
    backgroundColor: ON_DARK,
  },
  hubStatValue: {
    width: '40%',
    height: 22,
    borderRadius: 4,
    backgroundColor: ON_DARK_STRONG,
  },

  progressCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: brand.border,
    backgroundColor: brand.white,
  },
  progressBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: brand.primary,
  },
  progressBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  progressBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: ON_DARK_PANEL,
  },
  progressBannerTitles: { flex: 1, gap: 6 },
  progressBannerKicker: {
    width: '55%',
    height: 10,
    borderRadius: 3,
    backgroundColor: ON_DARK,
  },
  progressBannerTitle: {
    width: '78%',
    height: 16,
    borderRadius: 4,
    backgroundColor: ON_DARK_STRONG,
  },
  progressLevelPill: {
    width: 56,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: ON_DARK_PANEL,
  },
  progressBody: { padding: spacing.lg, gap: spacing.md },
  progressXpLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  progressFireChip: {
    width: 48,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: SKELETON_BG,
  },
  progressXpCaption: {
    flex: 1,
    maxWidth: 140,
    height: 12,
    borderRadius: 3,
    backgroundColor: SKELETON_BG,
  },
  progressStatDeck: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  progressStatCard: {
    flex: 1,
    minWidth: 88,
    alignItems: 'center',
    gap: 6,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.border,
    backgroundColor: brand.backgroundSoft,
  },
  progressStatIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: SKELETON_BG,
  },
  progressStatNum: {
    width: 28,
    height: 22,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
  },
  progressStatLbl: {
    width: '80%',
    height: 10,
    borderRadius: 3,
    backgroundColor: SKELETON_BG,
  },

  missionsCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: brand.border,
    backgroundColor: brand.white,
    gap: spacing.sm,
  },
  missionsTitle: {
    width: '48%',
    height: 18,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
  },
  missionsIntro: {
    width: '88%',
    height: 12,
    borderRadius: 3,
    backgroundColor: SKELETON_BG,
  },

  missionCard: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: brand.border,
    backgroundColor: brand.backgroundSoft,
  },
  missionAccent: {
    width: 5,
    backgroundColor: SKELETON_BG_STRONG,
  },
  missionInner: { flex: 1, padding: spacing.md, gap: spacing.sm },
  missionTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  missionIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: SKELETON_BG,
  },
  missionTitle: {
    flex: 1,
    height: 16,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
    marginTop: 4,
  },
  missionScoreLine: {
    width: '55%',
    height: 12,
    borderRadius: 3,
    backgroundColor: SKELETON_BG,
  },
});
