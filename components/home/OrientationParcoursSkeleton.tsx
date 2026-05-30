import { StyleSheet, View } from 'react-native';

import {
  LoadingProgressBarSkeleton,
  LoadingStepBubblesSkeleton,
  LoadingTimelineStackSkeleton,
  SkeletonBlock,
  SKELETON_BG,
  SKELETON_BG_STRONG,
  useSkeletonPulse,
} from '@/components/ui/CardLoadingSkeleton';
import { PLAN_PARCOURS_STEPS } from '@/constants/orientationParcours';
import { homeShell } from '@/theme/homeShell';
import { brand, spacing } from '@/theme/tokens';

/** Barre de progression + pastilles d’étapes (carte accueil). */
export function OrientationProgressSkeleton({
  layout,
  compact,
  isRTL = false,
}: {
  layout: { cardH: number; iconSize: number };
  compact?: boolean;
  isRTL?: boolean;
}) {
  const scale = layout.cardH / 380;
  const bubble = Math.max(compact ? 16 : 18, Math.round((compact ? 18 : 22) * scale));

  return (
    <View style={styles.progressWrap}>
      <LoadingProgressBarSkeleton isRTL={isRTL} />
      <LoadingStepBubblesSkeleton
        count={PLAN_PARCOURS_STEPS.length}
        isRTL={isRTL}
        bubbleSize={bubble}
      />
    </View>
  );
}

/** Badge % en-tête modal. */
export function OrientationPercentBadgeSkeleton() {
  const pulseStyle = useSkeletonPulse();
  return (
    <View style={styles.percentBadge}>
      <SkeletonBlock style={styles.percentBadgeValueSk} pulseStyle={pulseStyle} />
      <SkeletonBlock style={styles.percentBadgeHintSk} pulseStyle={pulseStyle} />
    </View>
  );
}

/** Placeholder texte « n/8 · n% » sur la carte accueil. */
export function OrientationPercentTextSkeleton() {
  const pulseStyle = useSkeletonPulse();
  return <SkeletonBlock style={styles.percentTextSk} pulseStyle={pulseStyle} />;
}

/** Liste verticale type timeline (modal parcours). */
export function OrientationTimelineSkeleton({ isRTL }: { isRTL?: boolean }) {
  return <LoadingTimelineStackSkeleton count={PLAN_PARCOURS_STEPS.length} isRTL={isRTL} />;
}

/** Barre globale modal (remplace le fill %). */
export function OrientationGlobalProgressSkeleton() {
  const pulseStyle = useSkeletonPulse();
  return (
    <View style={styles.globalProgressTrack}>
      <SkeletonBlock style={styles.globalProgressFillSk} pulseStyle={pulseStyle} />
    </View>
  );
}

const styles = StyleSheet.create({
  progressWrap: {
    marginTop: 6,
    width: '100%',
  },
  percentBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 52,
    gap: 4,
  },
  percentBadgeValueSk: {
    width: 36,
    height: 18,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
  },
  percentBadgeHintSk: {
    width: 28,
    height: 10,
    borderRadius: 3,
    backgroundColor: SKELETON_BG,
  },
  percentTextSk: {
    width: 88,
    height: 12,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
  },
  globalProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: homeShell.borderOnWhite,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  globalProgressFillSk: {
    height: '100%',
    width: '42%',
    borderRadius: 3,
    backgroundColor: SKELETON_BG_STRONG,
  },
});
