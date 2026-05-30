import { StyleSheet, View } from 'react-native';

import { HomeGreetingSubtitleSkeleton } from '@/components/home/HomeGreetingSubtitleSkeleton';
import { SkeletonBlock, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import { radius, spacing } from '@/theme/tokens';

type Props = {
  isRTL?: boolean;
};

/** Salutation complète en chargement (bonjour + pack · filière · niveau). */
export function HomeGreetingBlockSkeleton({ isRTL = false }: Props) {
  const pulseStyle = useSkeletonPulse();

  return (
    <View style={[styles.wrap, isRTL && styles.wrapRtl]}>
      <SkeletonBlock
        style={[styles.greetLine, isRTL && styles.greetLineRtl]}
        pulseStyle={pulseStyle}
      />
      <View style={[styles.subRow, isRTL && styles.subRowRtl]}>
        <HomeGreetingSubtitleSkeleton isRTL={isRTL} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: spacing.sm,
  },
  wrapRtl: {
    alignItems: 'flex-end',
  },
  greetLine: {
    width: '68%',
    height: 26,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
  },
  greetLineRtl: {
    alignSelf: 'flex-end',
  },
  subRow: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    maxWidth: '100%',
  },
  subRowRtl: {
    alignSelf: 'flex-end',
  },
});
