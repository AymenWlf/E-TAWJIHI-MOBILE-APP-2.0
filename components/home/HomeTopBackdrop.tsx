import { StyleSheet, View } from 'react-native';

import { homeShell } from '@/theme/homeShell';
import {
  computeHomeTopBackdropMetrics,
  isHomeHeroWideLayout,
} from '@/utils/homeTopBackdropLayout';

type Props = {
  width: number;
  /** Décalage vertical (ex. encoche) ; 0 quand le bloc est déjà sous safe area */
  topInset?: number;
};

/**
 * Grand disque bleu marque derrière le hero + halo vert type ombre.
 * Sur iPad / tablette : disque plus petit et plus haut pour ne pas empiéter sur les sections blanches.
 */
export function HomeTopBackdrop({ width, topInset = 0 }: Props) {
  const m = computeHomeTopBackdropMetrics(width, topInset);
  const wide = isHomeHeroWideLayout(width);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {!wide ? (
        <View
          style={[
            styles.disk,
            {
              width: m.glowSize,
              height: m.glowSize,
              borderRadius: m.glowSize / 2,
              top: m.glowTop,
              left: m.glowLeft,
              backgroundColor: homeShell.greenAlpha28,
            },
          ]}
        />
      ) : null}
      <View
        style={[
          styles.disk,
          {
            width: m.main,
            height: m.main,
            borderRadius: m.main / 2,
            top: m.top,
            left: m.left,
            backgroundColor: homeShell.bg,
            shadowColor: wide ? 'transparent' : homeShell.green,
            shadowOffset: { width: 0, height: wide ? 0 : 10 },
            shadowOpacity: wide ? 0 : 0.28,
            shadowRadius: wide ? 0 : 28,
            elevation: 0,
          },
        ]}
      />
      <View
        style={[
          styles.disk,
          {
            width: m.ringSize,
            height: m.ringSize,
            borderRadius: m.ringSize / 2,
            top: m.ringTop,
            left: m.ringLeft,
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
