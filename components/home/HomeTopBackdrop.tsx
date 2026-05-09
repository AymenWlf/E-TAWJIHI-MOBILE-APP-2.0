import { StyleSheet, View } from 'react-native';

import { homeShell } from '@/theme/homeShell';

type Props = {
  width: number;
  /** Décalage vertical (ex. encoche) ; 0 quand le bloc est déjà sous safe area */
  topInset?: number;
};

/** Facteur du halo vert (ombre douce) autour du disque bleu. */
const GREEN_HALO_SCALE = 1.09;

/**
 * Grand disque bleu marque derrière le hero + halo vert type ombre.
 */
export function HomeTopBackdrop({ width, topInset = 0 }: Props) {
  const main = width * 1.52;
  const left = (width - main) / 2;
  const top = topInset - main * 0.44;

  const glowSize = main * GREEN_HALO_SCALE;
  const glowLeft = left + (main - glowSize) / 2;
  const glowTop = top + (main - glowSize) / 2;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View
        style={[
          styles.disk,
          {
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
            top: glowTop,
            left: glowLeft,
            backgroundColor: homeShell.greenAlpha28,
          },
        ]}
      />
      <View
        style={[
          styles.disk,
          {
            width: main,
            height: main,
            borderRadius: main / 2,
            top,
            left,
            backgroundColor: homeShell.bg,
            shadowColor: homeShell.green,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.28,
            shadowRadius: 28,
            elevation: 0,
          },
        ]}
      />
      <View
        style={[
          styles.disk,
          {
            width: main * 1.05,
            height: main * 1.05,
            borderRadius: (main * 1.05) / 2,
            top: top - 2,
            left: left - main * 0.025,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.06)',
            backgroundColor: 'transparent',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  disk: {
    position: 'absolute',
  },
});
