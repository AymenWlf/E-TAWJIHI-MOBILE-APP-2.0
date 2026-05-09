import { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { PaginationDots } from '@/components/home/PaginationDots';
import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { homeShell } from '@/theme/homeShell';
import { fontSize, radius, spacing } from '@/theme/tokens';

const SCREEN_W = Dimensions.get('window').width;

const carouselShadow =
  Platform.OS === 'android'
    ? { elevation: 12 }
    : {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
      };

export type HeroEducationSlide = {
  id: string;
  title: string;
  subtitle: string;
  tone: 'blue' | 'green';
};

type Props = {
  slides: HeroEducationSlide[];
  width?: number;
};

export function HeroEducationCarousel({ slides, width = SCREEN_W }: Props) {
  const { isRTL } = useLocale();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const syncIndexFromOffset = (rawX: number) => {
    const n = slides.length;
    if (n === 0 || width <= 0) return;
    let i = Math.round(rawX / width);
    /** En RTL le décalage peut être symétrique selon la plateforme — aligner l’index avec la slide visible. */
    if (isRTL) {
      const maxX = Math.max(0, (n - 1) * width);
      i = Math.round((maxX - rawX) / width);
    }
    i = Math.min(n - 1, Math.max(0, i));
    setIndex((prev) => (prev !== i ? i : prev));
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    syncIndexFromOffset(e.nativeEvent.contentOffset.x);
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    syncIndexFromOffset(e.nativeEvent.contentOffset.x);
  };

  return (
    <View style={styles.carouselTrack}>
      <View style={[styles.carouselElevate, carouselShadow, { width }]}>
        <View style={styles.carouselClip}>
          <ScrollView
            ref={scrollRef}
            horizontal
            nestedScrollEnabled
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={[styles.scrollView, isRTL && styles.scrollRtl]}
            onScroll={onScroll}
            onMomentumScrollEnd={onMomentumScrollEnd}
            scrollEventThrottle={16}
            decelerationRate="fast">
            {slides.map((s) => (
              <View
                key={s.id}
                style={[
                  styles.slide,
                  { width },
                  s.tone === 'green' ? styles.slideGreen : styles.slideBlue,
                ]}>
                <Text style={[styles.title, isRTL && styles.textRtl]}>{s.title}</Text>
                <Text style={[styles.subtitle, isRTL && styles.textRtl]}>{s.subtitle}</Text>
              </View>
            ))}
          </ScrollView>
          <PaginationDots total={slides.length} activeIndex={index} onDark rtl={isRTL} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /** Bandeau centré dans la page ; marge verticale pour laisser l’ombre dépasser. */
  carouselTrack: {
    alignSelf: 'stretch',
    alignItems: 'center',
    overflow: 'visible',
    paddingVertical: spacing.sm,
  },
  carouselElevate: {
    alignSelf: 'center',
    borderRadius: radius.lg,
    backgroundColor: 'transparent',
  },
  carouselClip: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    width: '100%',
  },
  scrollView: {
    alignSelf: 'stretch',
    width: '100%',
  },
  scrollRtl: {
    direction: 'rtl',
  },
  slide: {
    height: 168,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    justifyContent: 'center',
  },
  slideBlue: {
    backgroundColor: homeShell.blue,
  },
  slideGreen: {
    backgroundColor: homeShell.greenDark,
  },
  title: {
    color: homeShell.text,
    fontSize: fontSize.xl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: spacing.sm,
    color: homeShell.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
    lineHeight: 20,
    maxWidth: 280,
  },
  textRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
    alignSelf: 'stretch',
  },
});
