import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

const HINT_ROTATION_MS = 2600;

export type ChatbotThinkingProps = {
  /** Titre principal (ex. « E‑MOWAJIH prépare votre réponse »). */
  title: string;
  /** Sous-texte rassurant. */
  subtitle: string;
  /** Phrases qui défilent pour expliquer la préparation (contexte, données, rédaction…). */
  prepHints: readonly string[];
};

/**
 * Indicateur de chargement : icône « IA / étoiles », texte de préparation animé, barre d’attente.
 */
export function ChatbotThinkingSteps({ title, subtitle, prepHints }: ChatbotThinkingProps) {
  const [trackW, setTrackW] = useState(0);
  const [hintIndex, setHintIndex] = useState(0);
  const slide = useRef(new Animated.Value(0)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;

  const hints = prepHints.filter((h) => h.trim().length > 0);
  const activeHint = hints.length > 0 ? hints[hintIndex % hints.length] : '';

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, {
          toValue: 0.88,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(iconPulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [iconPulse]);

  useEffect(() => {
    setHintIndex(0);
  }, [prepHints]);

  useEffect(() => {
    if (hints.length <= 1) return;
    const id = setInterval(() => {
      setHintIndex((i) => (i + 1) % hints.length);
    }, HINT_ROTATION_MS);
    return () => clearInterval(id);
  }, [hints.length]);

  useEffect(() => {
    if (trackW <= 0) return;
    slide.setValue(0);
    const loop = Animated.loop(
      Animated.timing(slide, {
        toValue: 1,
        duration: 1550,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [trackW, slide]);

  const onTrackLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setTrackW(w);
  };

  const shimmerW = Math.max(56, Math.round(trackW * 0.32));
  const translateX =
    trackW > 0
      ? slide.interpolate({
          inputRange: [0, 1],
          outputRange: [-shimmerW, trackW + shimmerW * 0.15],
        })
      : 0;

  const a11yLabel = activeHint ? `${title}. ${activeHint}. ${subtitle}` : `${title}. ${subtitle}`;

  return (
    <View
      style={styles.card}
      accessibilityRole="progressbar"
      accessibilityLabel={a11yLabel}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.topRow}>
        <Animated.View style={[styles.aiIconWrap, { opacity: iconPulse }]}>
          <MaterialCommunityIcons
            name="star-four-points-small"
            size={13}
            color={brand.primary}
            style={styles.sparkTL}
          />
          <MaterialCommunityIcons name="creation" size={28} color={brand.primary} />
          <MaterialCommunityIcons
            name="star-four-points-small"
            size={11}
            color="#6366F1"
            style={styles.sparkBR}
          />
        </Animated.View>
        <View style={styles.textCol}>
          <Text style={styles.title} numberOfLines={3}>
            {title}
          </Text>
          {activeHint ? (
            <Text style={styles.prepHint} numberOfLines={4}>
              {activeHint}
            </Text>
          ) : null}
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
      </View>

      <View style={styles.track} onLayout={onTrackLayout}>
        {trackW > 0 ? (
          <Animated.View
            style={[
              styles.shimmer,
              {
                width: shimmerW,
                transform: [{ translateX }],
              },
            ]}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    alignSelf: 'stretch',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: '#F1F5F9',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  /** Icône type « IA » : étoiles + glyphe creation (effet étincelles). */
  aiIconWrap: {
    width: 48,
    height: 48,
    marginRight: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51, 62, 143, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sparkTL: {
    position: 'absolute',
    top: 4,
    left: 4,
    opacity: 0.95,
  },
  sparkBR: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    opacity: 0.85,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    marginBottom: 6,
    color: brand.text,
    fontSize: fontSize.md,
    fontWeight: '800',
    lineHeight: 22,
  },
  /** Détail de ce qui est en cours de préparation (texte rotatif). */
  prepHint: {
    marginBottom: 6,
    color: brand.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '700',
    lineHeight: 20,
  },
  subtitle: {
    color: brand.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
    lineHeight: 19,
  },
  track: {
    marginTop: spacing.md,
    height: 5,
    borderRadius: radius.full,
    backgroundColor: brand.borderLight,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: radius.full,
    backgroundColor: 'rgba(51, 62, 143, 0.38)',
  },
});
