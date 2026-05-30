import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Linking, StyleSheet, View } from 'react-native';

import { PlatformSheetOverlay } from '@/components/ui/PlatformSheetOverlay';
import { Text } from '@/components/ui/Text';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  Pressable,
} from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  executeOnUIRuntimeSync,
  Extrapolation,
  interpolate,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { StoryChannel } from '@/data/mock/homeFeed';
import { isStoryImageUri } from '@/constants/storyMedia';
import { recordStoryEvent } from '@/services/stories';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, spacing } from '@/theme/tokens';

type Props = {
  visible: boolean;
  channels: StoryChannel[];
  initialChannelIndex: number;
  onClose: () => void;
  /** Appelé quand la dernière slide d’une chaîne a été vue (passage auto ou tap suivant). */
  onChannelFullyRead: (channelId: string) => void;
  /** Identifiant visiteur pour KPIs (`/api/stories/record-event`). */
  analyticsVisitorId?: string | null;
};

const { height: WIN_H } = Dimensions.get('window');

function StoryProgressSegment({
  index,
  slideIdxSv,
  progress,
}: {
  index: number;
  slideIdxSv: SharedValue<number>;
  progress: SharedValue<number>;
}) {
  const fillStyle = useAnimatedStyle(() => {
    'worklet';
    const active = slideIdxSv.value;
    if (index < active) {
      return { width: '100%' };
    }
    if (index > active) {
      return { width: '0%' };
    }
    return { width: `${progress.value * 100}%` };
  });

  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, fillStyle]} />
    </View>
  );
}

export function StoryViewerModal({
  visible,
  channels,
  initialChannelIndex,
  onClose,
  onChannelFullyRead,
  analyticsVisitorId,
}: Props) {
  const insets = useSafeAreaInsets();
  const [chIdx, setChIdx] = useState(0);
  const [slideIdx, setSlideIdx] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  const idxRef = useRef({ ch: 0, sl: 0 });
  const channelsRef = useRef(channels);
  channelsRef.current = channels;
  idxRef.current = { ch: chIdx, sl: slideIdx };

  const durationRef = useRef(5000);
  const pauseProgressRef = useRef(0);
  const storyPressRef = useRef({ t0: 0, longFired: false });

  const segProgress = useSharedValue(0);
  const sheetY = useSharedValue(0);
  const slideIdxSv = useSharedValue(0);

  useEffect(() => {
    slideIdxSv.value = slideIdx;
  }, [slideIdx, slideIdxSv]);

  useEffect(() => {
    if (visible) {
      const start = Math.min(Math.max(0, initialChannelIndex), Math.max(0, channels.length - 1));
      setChIdx(start);
      setSlideIdx(0);
      slideIdxSv.value = 0;
      sheetY.value = 0;
      setImageLoading(true);
    }
  }, [visible, initialChannelIndex, channels.length, sheetY, slideIdxSv]);

  useEffect(() => {
    if (!visible) {
      sheetY.value = 0;
      cancelAnimation(segProgress);
    }
  }, [visible, sheetY, segProgress]);

  const currentChannel = channels[chIdx];
  const currentSlide = currentChannel?.slides[slideIdx];
  const slideCount = currentChannel?.slides.length ?? 0;
  const coverUri = currentChannel?.coverUri ?? currentChannel?.slides[0]?.uri;

  useEffect(() => {
    if (!visible || !currentChannel) return;
    void recordStoryEvent('open', {
      channelId: currentChannel.id,
      visitorId: analyticsVisitorId ?? undefined,
      viewport: 'mobile',
    });
  }, [visible, chIdx, currentChannel?.id, analyticsVisitorId]);

  useEffect(() => {
    if (!visible || !currentChannel || !currentSlide) return;
    void recordStoryEvent('slide_view', {
      channelId: currentChannel.id,
      slideId: currentSlide.id,
      visitorId: analyticsVisitorId ?? undefined,
      viewport: 'mobile',
    });
  }, [visible, chIdx, slideIdx, currentChannel?.id, currentSlide?.id, analyticsVisitorId]);

  const openSlideLink = useCallback(async () => {
    const url = currentSlide?.linkUrl?.trim();
    if (!url) return;
    void recordStoryEvent('cta_click', {
      channelId: currentChannel?.id,
      slideId: currentSlide?.id,
      visitorId: analyticsVisitorId ?? undefined,
      viewport: 'mobile',
    });
    try {
      await Linking.openURL(url);
    } catch {
      /* ignore */
    }
  }, [analyticsVisitorId, currentChannel?.id, currentSlide?.id, currentSlide?.linkUrl]);

  useEffect(() => {
    if (currentSlide?.uri) {
      setImageLoading(true);
    }
  }, [currentSlide?.uri]);

  useEffect(() => {
    if (!visible || !currentChannel) return;
    const nextInChannel = currentChannel.slides[slideIdx + 1]?.uri;
    if (nextInChannel && isStoryImageUri(nextInChannel)) {
      void Image.prefetch(nextInChannel).catch(() => {});
    }
    const nextChannelFirst = channels[chIdx + 1]?.slides[0]?.uri;
    if (slideIdx >= currentChannel.slides.length - 1 && nextChannelFirst && isStoryImageUri(nextChannelFirst)) {
      void Image.prefetch(nextChannelFirst).catch(() => {});
    }
  }, [visible, chIdx, slideIdx, currentChannel, channels]);

  const advanceFromCurrent = useCallback(() => {
    const { ch, sl } = idxRef.current;
    const list = channelsRef.current;
    const channel = list[ch];
    if (!channel?.slides?.length) {
      onClose();
      return;
    }
    if (sl < channel.slides.length - 1) {
      let next = sl + 1;
      while (next < channel.slides.length && !isStoryImageUri(channel.slides[next].uri)) {
        next += 1;
      }
      if (next < channel.slides.length) {
        slideIdxSv.value = next;
        setSlideIdx(next);
        return;
      }
    }
    void recordStoryEvent('complete', {
      channelId: channel.id,
      visitorId: analyticsVisitorId ?? undefined,
      viewport: 'mobile',
    });
    onChannelFullyRead(channel.id);
    if (ch < list.length - 1) {
      slideIdxSv.value = 0;
      setChIdx(ch + 1);
      setSlideIdx(0);
    } else {
      onClose();
    }
  }, [analyticsVisitorId, onChannelFullyRead, onClose, slideIdxSv]);

  const rewind = useCallback(() => {
    cancelAnimation(segProgress);
    const { ch, sl } = idxRef.current;
    const list = channelsRef.current;
    if (sl > 0) {
      let prev = sl - 1;
      while (prev >= 0 && !isStoryImageUri(list[ch].slides[prev].uri)) {
        prev -= 1;
      }
      if (prev >= 0) {
        slideIdxSv.value = prev;
        setSlideIdx(prev);
        return;
      }
    }
    if (ch > 0) {
      const prevCh = list[ch - 1];
      let last = prevCh.slides.length - 1;
      while (last >= 0 && !isStoryImageUri(prevCh.slides[last].uri)) {
        last -= 1;
      }
      last = Math.max(0, last);
      slideIdxSv.value = last;
      setChIdx(ch - 1);
      setSlideIdx(last);
    }
  }, [segProgress, slideIdxSv]);

  const tapNext = useCallback(() => {
    cancelAnimation(segProgress);
    advanceFromCurrent();
  }, [advanceFromCurrent, segProgress]);

  const startTimer = useCallback(
    (fromProgress: number) => {
      cancelAnimation(segProgress);
      const full = durationRef.current;
      const from = Math.min(1, Math.max(0, fromProgress));
      segProgress.value = from;
      const remaining = full * (1 - from);
      segProgress.value = withTiming(
        1,
        { duration: Math.max(160, remaining) },
        (finished) => {
          if (!finished) return;
          runOnJS(advanceFromCurrent)();
        }
      );
    },
    [advanceFromCurrent, segProgress]
  );

  const pause = useCallback(() => {
    const p = executeOnUIRuntimeSync(() => {
      'worklet';
      cancelAnimation(segProgress);
      return segProgress.value;
    })();
    pauseProgressRef.current = p;
  }, [segProgress]);

  const resume = useCallback(() => {
    if (!visible) return;
    startTimer(pauseProgressRef.current);
  }, [visible, startTimer]);

  useEffect(() => {
    if (!visible || !currentChannel?.slides?.length || !currentSlide?.uri) {
      cancelAnimation(segProgress);
      return;
    }
    if (!isStoryImageUri(currentSlide.uri)) {
      cancelAnimation(segProgress);
      advanceFromCurrent();
      return;
    }
    if (imageLoading) {
      cancelAnimation(segProgress);
      return;
    }
    durationRef.current = currentSlide.durationMs ?? 5000;
    startTimer(0);
    return () => {
      cancelAnimation(segProgress);
    };
  }, [
    visible,
    chIdx,
    slideIdx,
    currentChannel?.id,
    currentSlide?.id,
    currentSlide?.uri,
    imageLoading,
    startTimer,
    segProgress,
    advanceFromCurrent,
  ]);

  const onPressInStory = useCallback(() => {
    storyPressRef.current = { t0: Date.now(), longFired: false };
  }, []);

  const onLongPressStory = useCallback(() => {
    storyPressRef.current.longFired = true;
    pause();
  }, [pause]);

  const onPressOutStoryLeft = useCallback(() => {
    if (storyPressRef.current.longFired) {
      resume();
      storyPressRef.current.longFired = false;
      return;
    }
    if (Date.now() - storyPressRef.current.t0 < 320) {
      rewind();
    }
  }, [resume, rewind]);

  const onPressOutStoryRight = useCallback(() => {
    if (storyPressRef.current.longFired) {
      resume();
      storyPressRef.current.longFired = false;
      return;
    }
    if (Date.now() - storyPressRef.current.t0 < 320) {
      tapNext();
    }
  }, [resume, tapNext]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY(24)
        .failOffsetX([-56, 56])
        .onUpdate((e) => {
          'worklet';
          const y = Math.max(0, e.translationY);
          sheetY.value = y;
        })
        .onEnd((e) => {
          'worklet';
          const y = sheetY.value;
          if (y > 88 || e.velocityY > 900) {
            sheetY.value = withSpring(WIN_H, { damping: 28, stiffness: 280 }, (done) => {
              if (done) runOnJS(onClose)();
            });
          } else {
            sheetY.value = withSpring(0, { damping: 22, stiffness: 320 });
          }
        }),
    [onClose, sheetY]
  );

  const sheetStyle = useAnimatedStyle(() => {
    const y = sheetY.value;
    const scale = interpolate(y, [0, WIN_H * 0.4], [1, 0.9], Extrapolation.CLAMP);
    return {
      transform: [{ translateY: y }, { scale }],
      borderBottomLeftRadius: interpolate(y, [0, 100], [0, 16], Extrapolation.CLAMP),
      borderBottomRightRadius: interpolate(y, [0, 100], [0, 16], Extrapolation.CLAMP),
    };
  });

  const dimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sheetY.value, [0, WIN_H * 0.45], [0.14, 0.45], Extrapolation.CLAMP),
  }));

  if (!channels.length) {
    return null;
  }

  return (
    <PlatformSheetOverlay visible={visible} onRequestClose={onClose} animationType="fade">
      <StatusBar style="light" />
      <GestureHandlerRootView style={styles.gestureRoot}>
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.sheet, sheetStyle]}>
            <View style={styles.imageWrap} pointerEvents="box-none">
              {currentSlide?.uri && isStoryImageUri(currentSlide.uri) ? (
                <Image
                  key={currentSlide.uri}
                  source={{ uri: currentSlide.uri }}
                  style={styles.image}
                  resizeMode="cover"
                  onLoadStart={() => setImageLoading(true)}
                  onLoadEnd={() => setImageLoading(false)}
                />
              ) : null}
              <Animated.View style={[styles.scrimTop, dimStyle]} pointerEvents="none" />
              <View style={[styles.scrim, StyleSheet.absoluteFill]} pointerEvents="none" />
              {imageLoading ? (
                <View style={styles.loaderWrap} pointerEvents="none">
                  <ActivityIndicator size="large" color={brand.white} />
                </View>
              ) : null}
            </View>

            <View style={[styles.topChrome, { paddingTop: insets.top + 6 }]} pointerEvents="box-none">
              <View style={styles.progressRow}>
                {Array.from({ length: Math.max(1, slideCount) }).map((_, i) => (
                  <StoryProgressSegment
                    key={`${currentChannel?.id}-${i}`}
                    index={i}
                    slideIdxSv={slideIdxSv}
                    progress={segProgress}
                  />
                ))}
              </View>
              <View style={styles.headerRow}>
                <View style={styles.headerLeft}>
                  {coverUri && isStoryImageUri(coverUri) ? (
                    <Image source={{ uri: coverUri }} style={styles.avatarSm} />
                  ) : (
                    <View style={[styles.avatarSm, styles.avatarPlaceholder]} />
                  )}
                  <View style={styles.headerTexts}>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                      {currentChannel?.label ?? ''}
                    </Text>
                    <Text style={styles.headerSub} numberOfLines={1}>
                      À l&apos;instant
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={onClose}
                  hitSlop={14}
                  style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.75 }]}
                  accessibilityRole="button"
                  accessibilityLabel="Fermer les stories">
                  <FontAwesome name="times" size={24} color={brand.white} />
                </Pressable>
              </View>
            </View>

            <View style={styles.tapZones} pointerEvents="box-none">
              <Pressable
                style={styles.tapLeft}
                delayLongPress={220}
                onPressIn={onPressInStory}
                onLongPress={onLongPressStory}
                onPressOut={onPressOutStoryLeft}
                accessibilityLabel="Slide précédente ou pause"
              />
              <Pressable
                style={styles.tapRight}
                delayLongPress={220}
                onPressIn={onPressInStory}
                onLongPress={onLongPressStory}
                onPressOut={onPressOutStoryRight}
                accessibilityLabel="Slide suivante ou pause"
              />
            </View>

            {(currentSlide?.caption || currentSlide?.linkUrl) ? (
              <View style={[styles.captionWrap, { paddingBottom: insets.bottom + spacing.lg }]}>
                {currentSlide?.caption ? <Text style={styles.caption}>{currentSlide.caption}</Text> : null}
                {currentSlide?.linkUrl ? (
                  <Pressable
                    onPress={() => void openSlideLink()}
                    style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.85 }]}
                    accessibilityRole="link"
                    accessibilityLabel="Ouvrir le lien">
                    <Text style={styles.ctaBtnTxt}>Voir le lien →</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </PlatformSheetOverlay>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
    backgroundColor: '#000',
  },
  sheet: {
    flex: 1,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  imageWrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: homeShell.blueDeep,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  scrimTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 160,
    backgroundColor: '#000',
  },
  scrim: {
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  loaderWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  topChrome: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
    paddingHorizontal: spacing.sm + 2,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 10,
  },
  progressTrack: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  avatarSm: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerTexts: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    color: brand.white,
    fontSize: fontSize.sm,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerSub: {
    marginTop: 2,
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    fontWeight: '600',
  },
  closeBtn: {
    padding: spacing.sm,
  },
  tapZones: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 5,
  },
  tapLeft: {
    flexGrow: 35,
    flexBasis: 0,
    flexShrink: 0,
  },
  tapRight: {
    flexGrow: 65,
    flexBasis: 0,
    flexShrink: 0,
  },
  captionWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 8,
    paddingHorizontal: spacing.lg,
  },
  caption: {
    color: brand.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  ctaBtn: {
    marginTop: spacing.md,
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  ctaBtnTxt: {
    color: brand.white,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});
