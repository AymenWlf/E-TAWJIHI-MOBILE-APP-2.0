import React, { useEffect, useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const BRAND_BLUE = '#333E8F';

type AnimatedSplashProps = {
  onReadyForHideNativeSplash?: () => void;
  onDone: () => void;
  durationMs?: number;
};

type OrbitIcon = {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
};

/** Icônes thématiques : établissement, inscription, éducation. */
const ORBIT_ICONS: OrbitIcon[] = [
  { name: 'university', label: 'Établissements' },
  { name: 'graduation-cap', label: 'Diplôme' },
  { name: 'calendar-check-o', label: 'Inscription' },
  { name: 'book', label: 'Cours' },
  { name: 'pencil', label: 'Examen' },
  { name: 'file-text-o', label: 'Dossier' },
];

const ORBIT_RADIUS = 118;
const ICON_SIZE = 22;
const ICON_BUBBLE = 46;

/**
 * Splash animé E-Tawjihi
 * - Fond bleu marque, logo centré
 * - Anneau d'icônes (établissements, inscription, éducation) qui tourne autour du logo
 * - Les icônes contre-tournent pour rester droites pendant la rotation
 * - Fondu de sortie vers la page d'accueil
 */
export function AnimatedSplash({
  onReadyForHideNativeSplash,
  onDone,
  durationMs = 3200,
}: AnimatedSplashProps) {
  const enter = useSharedValue(0);
  const orbit = useSharedValue(0);
  const exit = useSharedValue(0);

  useEffect(() => {
    enter.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    orbit.value = withRepeat(
      withTiming(1, { duration: 4500, easing: Easing.linear }),
      -1,
      false,
    );

    const t = setTimeout(() => {
      exit.value = withTiming(
        1,
        { duration: 320, easing: Easing.inOut(Easing.quad) },
        (finished) => {
          if (finished) {
            runOnJS(onDone)();
          }
        },
      );
    }, Math.max(1200, durationMs));

    return () => clearTimeout(t);
  }, [durationMs, enter, exit, onDone, orbit]);

  const rootStyle = useAnimatedStyle(() => ({
    opacity: 1 - exit.value,
    transform: [{ scale: interpolate(exit.value, [0, 1], [1, 0.985]) }],
  }));

  const logoStyle = useAnimatedStyle(() => {
    const opacity = interpolate(enter.value, [0, 0.35, 1], [0, 1, 1]);
    const scaleIn = interpolate(enter.value, [0, 1], [0.92, 1]);
    const breathe = 1 + 0.012 * Math.sin(orbit.value * Math.PI * 2);
    return { opacity, transform: [{ scale: scaleIn * breathe }] };
  });

  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(enter.value, [0, 1], [0, 0.18]) * (1 - exit.value),
    transform: [{ rotateZ: `${orbit.value * 360}deg` }],
  }));

  const orbitStyle = useAnimatedStyle(() => ({
    opacity: interpolate(enter.value, [0, 0.6, 1], [0, 1, 1]) * (1 - exit.value),
    transform: [{ rotateZ: `${orbit.value * 360}deg` }],
  }));

  return (
    <View
      style={styles.root}
      onLayout={() => onReadyForHideNativeSplash?.()}
      accessibilityLabel="E-Tawjihi splash screen"
      accessibilityRole="image"
    >
      <Animated.View style={[styles.overlay, rootStyle]}>
        <Animated.View style={[styles.ring, ringStyle]} />

        <Animated.View style={[styles.orbit, orbitStyle]}>
          {ORBIT_ICONS.map((item, index) => (
            <OrbitIconBubble
              key={item.name as string}
              icon={item}
              index={index}
              total={ORBIT_ICONS.length}
              orbit={orbit}
            />
          ))}
        </Animated.View>

        <Animated.View style={[styles.logoWrap, logoStyle]}>
          <Image
            source={require('../assets/images/logo-transparent.png')}
            resizeMode="contain"
            style={styles.logo}
            accessibilityLabel="Logo E-Tawjihi"
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

type OrbitIconBubbleProps = {
  icon: OrbitIcon;
  index: number;
  total: number;
  orbit: ReturnType<typeof useSharedValue<number>>;
};

/**
 * Bulle d'icône positionnée sur l'anneau via un offset statique,
 * et qui contre-tourne en continu pour rester droite (pas tête en bas).
 */
function OrbitIconBubble({ icon, index, total, orbit }: OrbitIconBubbleProps) {
  const angle = useMemo(() => (index / total) * Math.PI * 2 - Math.PI / 2, [index, total]);
  const offsetX = useMemo(() => ORBIT_RADIUS * Math.cos(angle), [angle]);
  const offsetY = useMemo(() => ORBIT_RADIUS * Math.sin(angle), [angle]);

  const counterRotate = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${-orbit.value * 360}deg` }],
  }));

  return (
    <View
      style={[
        styles.bubble,
        { transform: [{ translateX: offsetX }, { translateY: offsetY }] },
      ]}
      accessibilityLabel={icon.label}
    >
      <Animated.View style={[styles.bubbleInner, counterRotate]}>
        <FontAwesome name={icon.name} size={ICON_SIZE} color={BRAND_BLUE} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: ORBIT_RADIUS * 2,
    height: ORBIT_RADIUS * 2,
    borderRadius: ORBIT_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  orbit: {
    position: 'absolute',
    width: ORBIT_RADIUS * 2,
    height: ORBIT_RADIUS * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    position: 'absolute',
    width: ICON_BUBBLE,
    height: ICON_BUBBLE,
    borderRadius: ICON_BUBBLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleInner: {
    width: ICON_BUBBLE,
    height: ICON_BUBBLE,
    borderRadius: ICON_BUBBLE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  logoWrap: {
    position: 'absolute',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
});
