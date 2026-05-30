import { Fragment, useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { homeShell } from '@/theme/homeShell';
import { brand, radius, spacing } from '@/theme/tokens';

export const SKELETON_BG = 'rgba(51, 62, 143, 0.1)';
export const SKELETON_BG_STRONG = 'rgba(51, 62, 143, 0.16)';
const SKELETON_ON_DARK = 'rgba(255, 255, 255, 0.28)';
const SKELETON_ON_DARK_STRONG = 'rgba(255, 255, 255, 0.42)';
const ORIENTATION_STEP_LINE = 'rgba(51, 62, 143, 0.12)';

const skStyles = StyleSheet.create({
  stack: {
    width: '100%',
  },
  screenWrap: {
    width: '100%',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  contentCard: {
    width: '100%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: homeShell.borderOnWhite,
    justifyContent: 'center',
    gap: 8,
  },
  contentCardRtl: {},
  contentCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  contentCardTopRtl: {
    flexDirection: 'row-reverse',
  },
  contentTitle: {
    flex: 1,
    height: 14,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
    maxWidth: '72%',
  },
  contentPct: {
    width: 28,
    height: 12,
    borderRadius: 3,
    backgroundColor: SKELETON_BG,
  },
  contentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentMetaRtl: {
    flexDirection: 'row-reverse',
  },
  contentPill: {
    width: 72,
    height: 18,
    borderRadius: 6,
    backgroundColor: SKELETON_BG,
  },
  contentChevron: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: SKELETON_BG,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 72,
  },
  timelineRowRtl: {
    flexDirection: 'row-reverse',
  },
  timelineRailCol: {
    width: 36,
    alignItems: 'center',
  },
  timelineSegment: {
    width: 3,
    flex: 1,
    minHeight: 8,
    borderRadius: 2,
    backgroundColor: ORIENTATION_STEP_LINE,
  },
  timelineSegmentTop: {
    flexGrow: 0,
    height: 10,
  },
  timelineSegmentTopSpacer: {
    height: 10,
  },
  timelineSegmentBottom: {
    flex: 1,
  },
  timelineSegmentBottomSpacer: {
    flex: 1,
    minHeight: 8,
  },
  timelineNode: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: SKELETON_BG,
    zIndex: 1,
  },
  timelineCardInset: {
    flex: 1,
    marginStart: spacing.sm,
    marginBottom: spacing.sm,
  },
  timelineCardInsetRtl: {
    marginStart: 0,
    marginEnd: spacing.sm,
  },
  inlineLines: {
    gap: 8,
    alignItems: 'flex-start',
    width: '100%',
  },
  inlineLinesRtl: {
    alignItems: 'flex-end',
  },
  inlineLine: {
    width: '78%',
    height: 14,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
  },
  inlineLineShort: {
    width: '52%',
    height: 12,
    backgroundColor: SKELETON_BG,
  },
  inlineLineOnDark: {
    width: '78%',
    height: 14,
    borderRadius: 4,
    backgroundColor: SKELETON_ON_DARK_STRONG,
  },
  inlineLineShortOnDark: {
    width: '52%',
    height: 12,
    backgroundColor: SKELETON_ON_DARK,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
    marginBottom: spacing.lg,
  },
  cardHeaderRtl: {
    flexDirection: 'row-reverse',
  },
  cardHeaderIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: SKELETON_BG,
  },
  cardHeaderTextCol: {
    flex: 1,
    gap: 8,
  },
  cardHeaderLine: {
    width: '88%',
    height: 16,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
  },
  cardHeaderLineShort: {
    width: '62%',
    height: 12,
    borderRadius: 4,
    backgroundColor: SKELETON_BG,
  },
  progressWrap: {
    marginTop: 6,
    width: '100%',
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  progressTrackRtl: {
    flexDirection: 'row-reverse',
  },
  progressFill: {
    height: '100%',
    width: '38%',
    borderRadius: 3,
    backgroundColor: SKELETON_BG_STRONG,
  },
  stepsRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  stepsRowRtl: {
    flexDirection: 'row-reverse',
  },
  stepLine: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    backgroundColor: ORIENTATION_STEP_LINE,
    marginHorizontal: 1,
    minWidth: 4,
  },
  stepBubble: {
    backgroundColor: SKELETON_BG,
  },
});

export const cardSkeletonStyles = skStyles;

export function useSkeletonPulse() {
  const opacity = useSharedValue(0.42);
  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);
  return useAnimatedStyle(() => ({ opacity: opacity.value }));
}

export function SkeletonBlock({
  style,
  pulseStyle,
}: {
  style: StyleProp<ViewStyle>;
  pulseStyle: ReturnType<typeof useSkeletonPulse>;
}) {
  return <Animated.View style={[style, pulseStyle]} />;
}

/** Carte blanche type parcours (titre + pill + chevron). */
export function LoadingContentCardSkeleton({
  isRTL = false,
  style,
}: {
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const pulseStyle = useSkeletonPulse();
  return (
    <View style={[skStyles.contentCard, isRTL && skStyles.contentCardRtl, style]}>
      <View style={[skStyles.contentCardTop, isRTL && skStyles.contentCardTopRtl]}>
        <SkeletonBlock style={skStyles.contentTitle} pulseStyle={pulseStyle} />
        <SkeletonBlock style={skStyles.contentPct} pulseStyle={pulseStyle} />
      </View>
      <View style={[skStyles.contentMeta, isRTL && skStyles.contentMetaRtl]}>
        <SkeletonBlock style={skStyles.contentPill} pulseStyle={pulseStyle} />
        <SkeletonBlock style={skStyles.contentChevron} pulseStyle={pulseStyle} />
      </View>
    </View>
  );
}

/** Une ligne timeline (rail + carte), comme le modal parcours. */
export function LoadingTimelineRowSkeleton({
  isRTL = false,
  isFirst = false,
  isLast = false,
}: {
  isRTL?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const pulseStyle = useSkeletonPulse();
  return (
    <View style={[skStyles.timelineRow, isRTL && skStyles.timelineRowRtl]}>
      <View style={skStyles.timelineRailCol}>
        {!isFirst ? (
          <SkeletonBlock style={[skStyles.timelineSegment, skStyles.timelineSegmentTop]} pulseStyle={pulseStyle} />
        ) : (
          <View style={skStyles.timelineSegmentTopSpacer} />
        )}
        <SkeletonBlock style={skStyles.timelineNode} pulseStyle={pulseStyle} />
        {!isLast ? (
          <SkeletonBlock style={[skStyles.timelineSegment, skStyles.timelineSegmentBottom]} pulseStyle={pulseStyle} />
        ) : (
          <View style={skStyles.timelineSegmentBottomSpacer} />
        )}
      </View>
      <LoadingContentCardSkeleton
        isRTL={isRTL}
        style={[skStyles.timelineCardInset, isRTL && skStyles.timelineCardInsetRtl]}
      />
    </View>
  );
}

/** Pile de cartes contenu (écrans liste / compte / boutique…). */
export function LoadingCardStack({
  count = 3,
  isRTL = false,
  gap = spacing.md,
  style,
  cardStyle,
}: {
  count?: number;
  isRTL?: boolean;
  gap?: number;
  style?: StyleProp<ViewStyle>;
  cardStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[skStyles.stack, style]}>
      {Array.from({ length: count }, (_, i) => (
        <View key={`sk-card-${i}`} style={i > 0 ? { marginTop: gap } : undefined}>
          <LoadingContentCardSkeleton isRTL={isRTL} style={cardStyle} />
        </View>
      ))}
    </View>
  );
}

/** Pile timeline (modal parcours, feuille inscription…). */
export function LoadingTimelineStackSkeleton({
  count = 4,
  isRTL = false,
  style,
}: {
  count?: number;
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={style}>
      {Array.from({ length: count }, (_, i) => (
        <LoadingTimelineRowSkeleton
          key={`sk-tl-${i}`}
          isRTL={isRTL}
          isFirst={i === 0}
          isLast={i === count - 1}
        />
      ))}
    </View>
  );
}

/** Zone plein écran / section centrée : cartes skeleton au lieu du spinner. */
export function LoadingScreenPlaceholder({
  count = 3,
  isRTL = false,
  variant = 'content',
  style,
  contentStyle,
}: {
  count?: number;
  isRTL?: boolean;
  variant?: 'content' | 'timeline';
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[skStyles.screenWrap, style]}>
      {variant === 'timeline' ? (
        <LoadingTimelineStackSkeleton count={count} isRTL={isRTL} style={contentStyle} />
      ) : (
        <LoadingCardStack count={count} isRTL={isRTL} style={contentStyle} />
      )}
    </View>
  );
}

/** Lignes compactes (salutation hero, sous-titre…). */
export function LoadingInlineLinesSkeleton({
  lines = 2,
  isRTL = false,
  tone = 'default',
  style,
}: {
  lines?: number;
  isRTL?: boolean;
  tone?: 'default' | 'onDark';
  style?: StyleProp<ViewStyle>;
}) {
  const pulseStyle = useSkeletonPulse();
  const lineStyle = tone === 'onDark' ? skStyles.inlineLineOnDark : skStyles.inlineLine;
  const shortStyle = tone === 'onDark' ? skStyles.inlineLineShortOnDark : skStyles.inlineLineShort;
  return (
    <View style={[skStyles.inlineLines, isRTL && skStyles.inlineLinesRtl, style]}>
      {Array.from({ length: lines }, (_, i) => (
        <SkeletonBlock
          key={`sk-line-${i}`}
          style={[lineStyle, i === lines - 1 && lines > 1 ? shortStyle : undefined]}
          pulseStyle={pulseStyle}
        />
      ))}
    </View>
  );
}

/** En-tête carte diagnostic : pastille + lignes (remplace l’icône spinner). */
export function LoadingCardHeaderSkeleton({ isRTL = false }: { isRTL?: boolean }) {
  const pulseStyle = useSkeletonPulse();
  return (
    <View style={[skStyles.cardHeader, isRTL && skStyles.cardHeaderRtl]}>
      <SkeletonBlock style={skStyles.cardHeaderIcon} pulseStyle={pulseStyle} />
      <View style={skStyles.cardHeaderTextCol}>
        <SkeletonBlock style={skStyles.cardHeaderLine} pulseStyle={pulseStyle} />
        <SkeletonBlock style={skStyles.cardHeaderLineShort} pulseStyle={pulseStyle} />
      </View>
    </View>
  );
}

/** Mini pastilles (bouton quotidien, chip…). */
export function LoadingMiniIconSkeleton({
  size = 22,
  style,
}: {
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const pulseStyle = useSkeletonPulse();
  return (
    <SkeletonBlock
      style={[
        {
          width: size,
          height: size,
          borderRadius: Math.round(size / 2),
          backgroundColor: SKELETON_BG,
        },
        style,
      ]}
      pulseStyle={pulseStyle}
    />
  );
}

/** Barre de progression skeleton (carte accueil parcours). */
export function LoadingProgressBarSkeleton({
  isRTL = false,
  style,
}: {
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const pulseStyle = useSkeletonPulse();
  return (
    <View style={[skStyles.progressWrap, style]}>
      <View style={[skStyles.progressTrack, isRTL && skStyles.progressTrackRtl]}>
        <SkeletonBlock style={skStyles.progressFill} pulseStyle={pulseStyle} />
      </View>
    </View>
  );
}

/** Pastilles d’étapes (carte accueil parcours). */
export function LoadingStepBubblesSkeleton({
  count = 7,
  isRTL = false,
  bubbleSize = 20,
}: {
  count?: number;
  isRTL?: boolean;
  bubbleSize?: number;
}) {
  const pulseStyle = useSkeletonPulse();
  const bubble = { width: bubbleSize, height: bubbleSize, borderRadius: bubbleSize / 2 };
  return (
    <View style={[skStyles.stepsRow, isRTL && skStyles.stepsRowRtl]}>
      {Array.from({ length: count }, (_, i) => (
        <Fragment key={`sk-bubble-${i}`}>
          {i > 0 ? <SkeletonBlock style={skStyles.stepLine} pulseStyle={pulseStyle} /> : null}
          <SkeletonBlock style={[skStyles.stepBubble, bubble]} pulseStyle={pulseStyle} />
        </Fragment>
      ))}
    </View>
  );
}
