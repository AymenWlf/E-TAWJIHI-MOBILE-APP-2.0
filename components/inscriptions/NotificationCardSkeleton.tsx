import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { SkeletonBlock, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

type Props = {
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
  withCta?: boolean;
};

/** Skeleton aligné sur `NotificationCard` (icône, titre, message, date, CTA optionnel). */
export function NotificationCardSkeleton({ isRTL = false, style, withCta = false }: Props) {
  const pulseStyle = useSkeletonPulse();

  return (
    <View style={[styles.card, isRTL && styles.cardRtl, style]}>
      <SkeletonBlock style={styles.iconWrap} pulseStyle={pulseStyle} />
      <View style={styles.body}>
        <SkeletonBlock
          style={[styles.titleLine, isRTL && styles.alignEnd]}
          pulseStyle={pulseStyle}
        />
        <SkeletonBlock
          style={[styles.messageLine, isRTL && styles.alignEnd]}
          pulseStyle={pulseStyle}
        />
        <SkeletonBlock
          style={[styles.messageLineShort, isRTL && styles.alignEnd]}
          pulseStyle={pulseStyle}
        />
        <SkeletonBlock style={[styles.timeLine, isRTL && styles.alignEnd]} pulseStyle={pulseStyle} />
        {withCta ? <SkeletonBlock style={styles.ctaLine} pulseStyle={pulseStyle} /> : null}
      </View>
    </View>
  );
}

export function NotificationCardSkeletonStack({
  count = 3,
  isRTL = false,
  style,
  withCta = false,
  withCtaPattern,
}: {
  count?: number;
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
  withCta?: boolean;
  /** Variante par carte (ex. notifs avec / sans bouton d’action). */
  withCtaPattern?: boolean[];
}) {
  return (
    <View style={[styles.stack, style]}>
      {Array.from({ length: count }, (_, i) => {
        const showCta = withCtaPattern?.[i] ?? (withCtaPattern ? false : withCta);
        return (
          <View key={i} style={i > 0 ? styles.stackGap : undefined}>
            <NotificationCardSkeleton isRTL={isRTL} withCta={showCta} />
          </View>
        );
      })}
    </View>
  );
}

const sk = 'rgba(51, 62, 143, 0.1)';
const skStrong = 'rgba(51, 62, 143, 0.16)';

const styles = StyleSheet.create({
  stack: { width: '100%' },
  stackGap: { marginTop: spacing.sm },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  cardRtl: { flexDirection: 'row-reverse' },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: sk,
  },
  body: { flex: 1, gap: 5 },
  titleLine: {
    width: '72%',
    height: fontSize.sm + 2,
    borderRadius: 4,
    backgroundColor: skStrong,
  },
  messageLine: {
    width: '96%',
    height: fontSize.sm - 1,
    borderRadius: 4,
    backgroundColor: sk,
  },
  messageLineShort: {
    width: '64%',
    height: fontSize.sm - 1,
    borderRadius: 4,
    backgroundColor: sk,
  },
  timeLine: {
    width: 72,
    height: 10,
    borderRadius: 4,
    backgroundColor: sk,
    marginTop: 2,
  },
  ctaLine: {
    width: '100%',
    height: 34,
    borderRadius: radius.md,
    backgroundColor: skStrong,
    marginTop: spacing.xs,
  },
  alignEnd: { alignSelf: 'flex-end' },
});
