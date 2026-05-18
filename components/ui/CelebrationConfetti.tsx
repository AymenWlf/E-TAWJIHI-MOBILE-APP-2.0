import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { brand } from '@/theme/tokens';

const CONFETTI_SPECS: Array<{ x: number; y: number; w: number; c: string; rot: number }> = [
  { x: 0.06, y: 0.1, w: 7, c: brand.emerald, rot: -22 },
  { x: 0.82, y: 0.08, w: 6, c: brand.warning, rot: 18 },
  { x: 0.45, y: 0.05, w: 5, c: 'rgba(255,255,255,0.35)', rot: 8 },
  { x: 0.2, y: 0.22, w: 6, c: brand.primaryInteractive, rot: -12 },
  { x: 0.72, y: 0.2, w: 7, c: brand.emerald, rot: 25 },
  { x: 0.12, y: 0.38, w: 5, c: brand.warning, rot: -8 },
  { x: 0.9, y: 0.35, w: 6, c: 'rgba(255,255,255,0.3)', rot: 14 },
  { x: 0.38, y: 0.32, w: 5, c: brand.emerald, rot: -30 },
  { x: 0.58, y: 0.42, w: 6, c: brand.warning, rot: 20 },
  { x: 0.25, y: 0.55, w: 5, c: 'rgba(255,255,255,0.28)', rot: -15 },
  { x: 0.75, y: 0.52, w: 7, c: brand.primaryInteractive, rot: 10 },
  { x: 0.5, y: 0.65, w: 6, c: brand.emerald, rot: -5 },
];

function ConfettiPiece({ p, index }: { p: (typeof CONFETTI_SPECS)[number]; index: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const dur = 1400 + (index % 5) * 140;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(t, {
          toValue: 1,
          duration: dur,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(t, {
          toValue: 0,
          duration: 260,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(120 + (index % 4) * 35),
      ]),
    );
    const startDelay = setTimeout(() => anim.start(), index * 70);
    return () => {
      clearTimeout(startDelay);
      anim.stop();
    };
  }, [index, t]);

  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, 26 + (index % 4) * 5] });
  const translateX = t.interpolate({ inputRange: [0, 0.45, 1], outputRange: [0, index % 2 === 0 ? 10 : -8, 0] });
  const rotate = t.interpolate({
    inputRange: [0, 1],
    outputRange: [`${p.rot}deg`, `${p.rot + (index % 2 === 0 ? 85 : -70)}deg`],
  });
  const opacity = t.interpolate({ inputRange: [0, 0.12, 0.55, 1], outputRange: [0.38, 0.88, 0.78, 0.42] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: `${p.x * 100}%`,
        top: `${p.y * 100}%`,
        width: p.w,
        height: p.w * 1.35,
        backgroundColor: p.c,
        borderRadius: 2,
        opacity,
        transform: [{ translateX }, { translateY }, { rotate }],
      }}
    />
  );
}

type Props = {
  active?: boolean;
};

export function CelebrationConfetti({ active = true }: Props) {
  if (!active) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {CONFETTI_SPECS.map((p, i) => (
        <ConfettiPiece key={i} p={p} index={i} />
      ))}
    </View>
  );
}
