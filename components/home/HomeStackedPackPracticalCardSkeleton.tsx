import { StyleSheet, View } from 'react-native';

import { SkeletonBlock, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import type { StackCardLayout } from './stackCardLayout';

type Props = {
  layout: StackCardLayout;
};

/** Contenu squelette d’une carte pack « lien pratique » empilée. */
export function HomeStackedPackPracticalCardSkeleton({ layout }: Props) {
  const pulseStyle = useSkeletonPulse();

  return (
    <View style={styles.wrap}>
      <SkeletonBlock
        style={[styles.eyebrow, { height: layout.eyebrow, borderRadius: layout.eyebrow / 2 }]}
        pulseStyle={pulseStyle}
      />
      <SkeletonBlock
        style={[
          styles.title,
          { height: layout.packName, marginTop: layout.packLabelMT, borderRadius: 6 },
        ]}
        pulseStyle={pulseStyle}
      />
      <SkeletonBlock
        style={[
          styles.desc,
          {
            height: layout.validityValue * 2,
            marginTop: layout.packNameMT,
            borderRadius: 6,
          },
        ]}
        pulseStyle={pulseStyle}
      />
      <SkeletonBlock
        style={[
          styles.box,
          {
            marginTop: layout.validityMT,
            minHeight: Math.max(132, Math.round(layout.cardH * 0.36)),
            borderRadius: layout.boxRadius,
          },
        ]}
        pulseStyle={pulseStyle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    width: '100%',
  },
  eyebrow: {
    width: '38%',
    backgroundColor: 'rgba(51, 62, 143, 0.14)',
  },
  title: {
    width: '88%',
    backgroundColor: 'rgba(51, 62, 143, 0.16)',
  },
  desc: {
    width: '72%',
    backgroundColor: 'rgba(51, 62, 143, 0.1)',
  },
  box: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
  },
});
