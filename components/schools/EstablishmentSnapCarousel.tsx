import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { brand, spacing } from '@/theme/tokens';
import { programmeCarouselCardsPerView } from '@/utils/programmeCarouselLayout';

export type EstablishmentSnapCarouselProps<T> = {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderSlide: (item: T, layout: { cardWidth: number; index: number }) => ReactNode;
  rtl?: boolean;
  prevAccessibilityLabel: string;
  nextAccessibilityLabel: string;
  cardsPerView?: (viewportWidth: number) => number;
  gap?: number;
};

export function EstablishmentSnapCarousel<T>({
  data,
  keyExtractor,
  renderSlide,
  rtl = false,
  prevAccessibilityLabel,
  nextAccessibilityLabel,
  cardsPerView = programmeCarouselCardsPerView,
  gap = spacing.md,
}: EstablishmentSnapCarouselProps<T>) {
  const { width: screenWidth } = useWindowDimensions();
  const listRef = useRef<FlatList<T>>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const visibleCards = cardsPerView(screenWidth);
  const cardWidth = useMemo(() => {
    if (trackWidth <= 0) return 0;
    if (visibleCards === 1) return trackWidth;
    return (trackWidth - gap * (visibleCards - 1)) / visibleCards;
  }, [trackWidth, visibleCards, gap]);

  const snapInterval = cardWidth + gap;

  const onTrackLayout = useCallback((e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w > 0) setTrackWidth(w);
  }, []);

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (snapInterval <= 0) return;
      const x = e.nativeEvent.contentOffset.x;
      const next = Math.round(x / snapInterval);
      setActiveIndex(Math.max(0, Math.min(next, data.length - 1)));
    },
    [snapInterval, data.length],
  );

  const scrollToIndex = useCallback(
    (index: number) => {
      if (snapInterval <= 0) return;
      const clamped = Math.max(0, Math.min(index, data.length - 1));
      listRef.current?.scrollToOffset({ offset: clamped * snapInterval, animated: true });
      setActiveIndex(clamped);
    },
    [snapInterval, data.length],
  );

  const showNav = data.length > 1;
  const canPrev = activeIndex > 0;
  const canNext = activeIndex < data.length - 1;
  const listReady = trackWidth > 0 && cardWidth > 0;

  if (data.length === 0) return null;

  return (
    <View style={styles.root}>
      <View style={styles.track} onLayout={onTrackLayout}>
        {listReady ? (
          <FlatList
            ref={listRef}
            data={data}
            horizontal
            snapToInterval={snapInterval}
            snapToAlignment="start"
            disableIntervalMomentum
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            key={`${visibleCards}-${trackWidth}-${data.length}`}
            keyExtractor={keyExtractor}
            getItemLayout={(_, index) => ({
              length: snapInterval,
              offset: snapInterval * index,
              index,
            })}
            onMomentumScrollEnd={onScrollEnd}
            onScrollEndDrag={onScrollEnd}
            renderItem={({ item, index }) => (
              <View style={[styles.slide, { width: snapInterval }]}>
                {renderSlide(item, { cardWidth, index })}
              </View>
            )}
            style={rtl ? styles.listRtl : undefined}
          />
        ) : null}
      </View>

      {showNav && listReady ? (
        <View style={[styles.navRow, rtl && styles.navRowRtl]}>
          <Pressable
            onPress={() => scrollToIndex(activeIndex - 1)}
            disabled={!canPrev}
            style={[styles.navBtn, !canPrev && styles.navBtnDisabled]}
            accessibilityRole="button"
            accessibilityLabel={prevAccessibilityLabel}
            accessibilityState={{ disabled: !canPrev }}
            hitSlop={6}
          >
            <FontAwesome
              name={rtl ? 'chevron-right' : 'chevron-left'}
              size={13}
              color={canPrev ? brand.primary : brand.textMuted}
            />
          </Pressable>

          <View style={styles.dotsWrap}>
            {data.map((item, idx) => (
              <Pressable
                key={keyExtractor(item, idx)}
                onPress={() => scrollToIndex(idx)}
                accessibilityRole="button"
                accessibilityLabel={`${idx + 1} / ${data.length}`}
                hitSlop={6}
              >
                <View style={[styles.dot, idx === activeIndex && styles.dotActive]} />
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => scrollToIndex(activeIndex + 1)}
            disabled={!canNext}
            style={[styles.navBtn, !canNext && styles.navBtnDisabled]}
            accessibilityRole="button"
            accessibilityLabel={nextAccessibilityLabel}
            accessibilityState={{ disabled: !canNext }}
            hitSlop={6}
          >
            <FontAwesome
              name={rtl ? 'chevron-left' : 'chevron-right'}
              size={13}
              color={canNext ? brand.primary : brand.textMuted}
            />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.xs,
  },
  track: {
    width: '100%',
  },
  listRtl: {
    direction: 'rtl',
  },
  slide: {
    alignItems: 'flex-start',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
  },
  navRowRtl: {
    flexDirection: 'row-reverse',
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.18)',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  navBtnDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  dotsWrap: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    minHeight: 34,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(51,62,143,0.20)',
  },
  dotActive: {
    width: 18,
    backgroundColor: brand.primary,
  },
});
