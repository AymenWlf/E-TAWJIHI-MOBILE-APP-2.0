import { StyleSheet, View } from 'react-native';

import { SkeletonBlock, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';

type Props = {
  isRTL?: boolean;
};

/** Squelette du sous-titre accueil : pack · filière · niveau (pastille bleue). */
export function HomeGreetingSubtitleSkeleton({ isRTL = false }: Props) {
  const pulseStyle = useSkeletonPulse();

  return (
    <View style={[styles.row, isRTL && styles.rowRtl]} accessibilityElementsHidden>
      <SkeletonBlock style={styles.chipPack} pulseStyle={pulseStyle} />
      <SkeletonBlock style={styles.sep} pulseStyle={pulseStyle} />
      <SkeletonBlock style={styles.chipFiliere} pulseStyle={pulseStyle} />
      <SkeletonBlock style={styles.sep} pulseStyle={pulseStyle} />
      <SkeletonBlock style={styles.chipNiveau} pulseStyle={pulseStyle} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    minHeight: 22,
    justifyContent: 'flex-start',
  },
  rowRtl: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
  },
  chipPack: {
    width: 108,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
  },
  chipFiliere: {
    width: 92,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.36)',
  },
  chipNiveau: {
    width: 56,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
  },
  sep: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
});
