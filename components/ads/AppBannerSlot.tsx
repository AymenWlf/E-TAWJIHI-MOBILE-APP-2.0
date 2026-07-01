import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import {
  partnerBannerWideDimensions,
  PARTNER_BANNER_SQUARE,
  resolvePartnerBannerViewport,
} from '@/constants/partnerBannerDimensions';
import { fontSize, radius, spacing } from '@/theme/tokens';
import {
  fetchBannerSlotsByZone,
  pickBannerCreativeImageUrl,
  pickBannerSlotVariant,
  recordBannerClickNative,
  recordBannerImpressionNative,
  variantToDisplayCreative,
  type BannerCreativePublic,
  type BannerSlotPublic,
  type BannerZoneCode,
} from '@/services/publicBanners';
import { fireAndForget } from '@/utils/fireAndForget';

/** Déduplication session (survit aux remontages FlatList). */
const recordedBannerImpressions = new Set<string>();

const SLIDE_DURATION_MS = 10_000;
const SLIDE_ANIM_MS = 300;
const SWIPE_THRESHOLD_PX = 48;

function bannerImpressionKey(
  variantId: number,
  page: string,
  position: number,
  viewport: 'mobile' | 'desktop',
): string {
  return `${variantId}|${page}|${position}|${viewport}`;
}

type Props = {
  /** `mid_square` = créatives carrées (300×300), aligné fiches détail web. */
  zone: Exclude<BannerZoneCode, 'bottom'>;
  analyticsPage: string;
  style?: ViewStyle;
  /** Fiche établissement client : limiter aux bannières de cette campagne. */
  campaignId?: number | null;
};

function resolveClickUrl(c: BannerCreativePublic): string | null {
  const raw = (c.linkUrl || c.destinationUrl || '').trim();
  if (!raw) return null;
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

function shuffleSlots<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j]!;
    copy[j] = tmp!;
  }
  return copy;
}

/** Marge horizontale minimale pour ne pas déborder sur petits écrans. */
const HORIZONTAL_SAFE = spacing.lg * 2;

/**
 * Bandeau publicitaire — créatives API, KPI comptés comme **app mobile native**
 * (`clientSurface: native_app`). Rotation 10 s, swipe / flèches après la 1ʳᵉ bannière (aligné web).
 */
export function AppBannerSlot({ zone, analyticsPage, style, campaignId = null }: Props) {
  const isSquare = zone === 'mid_square';
  const isMiddleZone = zone === 'mid' || isSquare;
  const { width: screenWidth } = useWindowDimensions();
  const viewport = useMemo(
    () => resolvePartnerBannerViewport(screenWidth, zone),
    [screenWidth, zone],
  );
  const layout = useMemo(() => {
    const maxUsable = Math.max(0, screenWidth - HORIZONTAL_SAFE);
    if (isSquare) {
      const side = Math.min(PARTNER_BANNER_SQUARE.size, maxUsable || PARTNER_BANNER_SQUARE.size);
      return { wideW: 0, wideH: 0, squareSide: side };
    }
    const dims = partnerBannerWideDimensions(viewport);
    const wideW = Math.min(dims.width, maxUsable || dims.width);
    const wideH = Math.round((dims.height * wideW) / dims.width);
    return { wideW, wideH, squareSide: PARTNER_BANNER_SQUARE.size };
  }, [isSquare, screenWidth, viewport]);

  const slideWidth = isSquare ? layout.squareSide : layout.wideW;
  const slideHeight = isSquare ? layout.squareSide : layout.wideH;

  const [orderedSlots, setOrderedSlots] = useState<BannerSlotPublic[]>([]);
  const [slideCreatives, setSlideCreatives] = useState<BannerCreativePublic[]>([]);
  const slotCount = orderedSlots.length;
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [navigationUnlocked, setNavigationUnlocked] = useState(false);
  /** Chrono 1ʳᵉ bannière (10 s avant swipe). */
  const [initialCountdown, setInitialCountdown] = useState(10);
  /** Chrono par slide après déverrouillage navigation. */
  const [countdown, setCountdown] = useState(10);

  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigationUnlockedRef = useRef(false);
  const translateX = useSharedValue(0);

  useEffect(() => {
    navigationUnlockedRef.current = navigationUnlocked;
  }, [navigationUnlocked]);

  const clearAutoTimer = useCallback(() => {
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, []);

  const clearCountdownTimer = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  const goToIndex = useCallback(
    (next: number) => {
      if (slotCount <= 1) return;
      const clamped = ((next % slotCount) + slotCount) % slotCount;
      setIndex(clamped);
      translateX.value = withTiming(-clamped * slideWidth, { duration: SLIDE_ANIM_MS });
      setCountdown(10);
    },
    [slotCount, slideWidth, translateX],
  );

  const goNext = useCallback(() => {
    if (!navigationUnlocked || slotCount <= 1) return;
    goToIndex(index + 1);
  }, [slotCount, goToIndex, index, navigationUnlocked]);

  const goPrev = useCallback(() => {
    if (!navigationUnlocked || slotCount <= 1) return;
    goToIndex(index - 1);
  }, [slotCount, goToIndex, index, navigationUnlocked]);

  const scheduleAutoAdvance = useCallback(() => {
    clearAutoTimer();
    if (slotCount <= 1) return;
    autoTimerRef.current = setTimeout(() => {
      if (!navigationUnlockedRef.current) {
        setNavigationUnlocked(true);
        if (slotCount > 1) {
          goToIndex(1);
        }
        return;
      }
      setIndex((current) => {
        const next = (current + 1) % slotCount;
        translateX.value = withTiming(-next * slideWidth, { duration: SLIDE_ANIM_MS });
        return next;
      });
      setCountdown(10);
    }, SLIDE_DURATION_MS);
  }, [clearAutoTimer, slotCount, goToIndex, slideWidth, translateX]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNavigationUnlocked(false);
    setInitialCountdown(10);
    setCountdown(10);
    void fetchBannerSlotsByZone(zone, { campaignId })
      .then((list) => {
        if (!cancelled) {
          const slots = list.length <= 1 ? list : shuffleSlots(list);
          setOrderedSlots(slots);
          setSlideCreatives([]);
          setIndex(0);
          translateX.value = 0;
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOrderedSlots([]);
          setSlideCreatives([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [zone, translateX, campaignId]);

  useEffect(() => {
    const slotItem = orderedSlots[index];
    if (!slotItem?.variants?.length) return;
    let cancelled = false;
    void pickBannerSlotVariant(slotItem).then((variant) => {
      if (cancelled) return;
      const creative = variantToDisplayCreative(slotItem, variant);
      if (pickBannerCreativeImageUrl(creative, viewport).trim() === '') return;
      setSlideCreatives((prev) => {
        if (prev[index]?.variantId === creative.variantId) return prev;
        const next = [...prev];
        next[index] = creative;
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [index, orderedSlots, viewport]);

  useEffect(() => {
    translateX.value = withTiming(-index * slideWidth, { duration: SLIDE_ANIM_MS });
  }, [index, slideWidth, translateX]);

  const creative = slideCreatives[index] ?? null;
  const variantId = creative?.variantId ?? creative?.id ?? 0;

  useEffect(() => {
    if (!variantId) return;
    const key = bannerImpressionKey(variantId, analyticsPage, index + 1, viewport);
    if (recordedBannerImpressions.has(key)) return;
    recordedBannerImpressions.add(key);
    void recordBannerImpressionNative({
      variantId,
      slotId: creative?.slotId,
      page: analyticsPage,
      position: index + 1,
      viewport,
    }).catch(() => {
      recordedBannerImpressions.delete(key);
    });
  }, [variantId, creative?.slotId, analyticsPage, index, viewport]);

  useEffect(() => {
    if (slotCount <= 1) return;
    scheduleAutoAdvance();
    return clearAutoTimer;
  }, [slotCount, index, navigationUnlocked, scheduleAutoAdvance, clearAutoTimer]);

  useEffect(() => {
    if (slotCount <= 1 || navigationUnlocked) return;
    clearCountdownTimer();
    setInitialCountdown(10);
    countdownTimerRef.current = setInterval(() => {
      setInitialCountdown((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);
    return clearCountdownTimer;
  }, [slotCount, navigationUnlocked, clearCountdownTimer, zone]);

  useEffect(() => {
    if (slotCount <= 1 || !navigationUnlocked) return;
    clearCountdownTimer();
    setCountdown(10);
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);
    return clearCountdownTimer;
  }, [slotCount, index, navigationUnlocked, clearCountdownTimer]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(navigationUnlocked && slotCount > 1)
        .activeOffsetX([-14, 14])
        .onEnd((e) => {
          if (e.translationX <= -SWIPE_THRESHOLD_PX) {
            runOnJS(goNext)();
          } else if (e.translationX >= SWIPE_THRESHOLD_PX) {
            runOnJS(goPrev)();
          }
        }),
    [slotCount, goNext, goPrev, navigationUnlocked],
  );

  const trackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const onPressCurrentCreative = useCallback(() => {
    const c = slideCreatives[index];
    const vid = c?.variantId ?? c?.id;
    if (!vid) return;
    fireAndForget(
      recordBannerClickNative({
        variantId: vid,
        slotId: c?.slotId,
        page: analyticsPage,
        position: index + 1,
        viewport,
      }),
    );
    const url = resolveClickUrl(c);
    if (url) void Linking.openURL(url);
  }, [analyticsPage, slideCreatives, index, viewport]);

  const shellStyle = useMemo(
    () => [
      styles.shell,
      isMiddleZone && styles.shellMiddle,
      isSquare
        ? { width: layout.squareSide, alignSelf: 'center' as const }
        : { width: layout.wideW, alignSelf: 'center' as const },
      style,
    ],
    [isMiddleZone, isSquare, layout.squareSide, layout.wideW, style],
  );

  const viewportStyle = useMemo(
    () => ({
      width: slideWidth,
      height: slideHeight,
      overflow: 'hidden' as const,
    }),
    [slideHeight, slideWidth],
  );

  const loadingBoxStyle = useMemo(
    () => [
      styles.loadingBox,
      { width: slideWidth, height: slideHeight },
    ],
    [slideHeight, slideWidth],
  );

  if (loading) {
    return (
      <View style={shellStyle}>
        <View style={loadingBoxStyle}>
          <ActivityIndicator />
        </View>
      </View>
    );
  }

  if (slotCount === 0 && !loading) {
    return null;
  }

  if (slotCount > 0 && !slideCreatives[index] && !loading) {
    return (
      <View style={shellStyle}>
        <View style={loadingBoxStyle}>
          <ActivityIndicator />
        </View>
      </View>
    );
  }

  const showControls = slotCount > 1;
  const countdownLabel = navigationUnlocked ? countdown : initialCountdown;

  return (
    <View style={shellStyle} accessibilityRole="summary">
      <View style={styles.partnerRow}>
        <Text style={styles.partnerTxt}>Publicité partenaire</Text>
      </View>
      <GestureDetector gesture={panGesture}>
        <View style={[styles.carouselViewport, viewportStyle]}>
          <Animated.View
            style={[
              styles.carouselTrack,
              { width: slideWidth * slotCount, height: slideHeight },
              trackStyle,
            ]}
          >
            {orderedSlots.map((slotItem, i) => {
              const c = slideCreatives[i];
              const url = c ? pickBannerCreativeImageUrl(c, viewport) : '';
              if (!url) {
                return (
                  <View
                    key={`slot-${slotItem.slotId}-${i}`}
                    pointerEvents="none"
                    style={[styles.slide, { width: slideWidth, height: slideHeight }]}
                  />
                );
              }
              return (
                <View
                  key={c.variantId ?? c.id}
                  pointerEvents="none"
                  style={[styles.slide, { width: slideWidth, height: slideHeight }]}
                >
                  <Image
                    source={{ uri: url }}
                    style={styles.img}
                    resizeMode={isSquare ? 'cover' : 'contain'}
                    accessibilityLabel={c.label || 'Publicité'}
                  />
                </View>
              );
            })}
          </Animated.View>

          {resolveClickUrl(slideCreatives[index]) ? (
            <Pressable
              onPress={onPressCurrentCreative}
              accessibilityRole="link"
              accessibilityLabel={slideCreatives[index]?.label || 'Publicité partenaire'}
              style={({ pressed }) => [styles.clickOverlay, pressed && { opacity: 0.92 }]}
            />
          ) : null}

          {showControls ? (
            <View style={styles.countdownBadge} pointerEvents="none">
              <Text style={styles.countdownTxt}>{countdownLabel}</Text>
              <Text style={styles.countdownUnit}>s</Text>
            </View>
          ) : null}

          {showControls && navigationUnlocked ? (
            <>
              <Pressable
                onPress={goPrev}
                accessibilityRole="button"
                accessibilityLabel="Bannière précédente"
                style={({ pressed }) => [styles.navBtn, styles.navBtnLeft, pressed && styles.navBtnPressed]}
              >
                <FontAwesome name="chevron-left" size={14} color="#fff" />
              </Pressable>
              <Pressable
                onPress={goNext}
                accessibilityRole="button"
                accessibilityLabel="Bannière suivante"
                style={({ pressed }) => [styles.navBtn, styles.navBtnRight, pressed && styles.navBtnPressed]}
              >
                <FontAwesome name="chevron-right" size={14} color="#fff" />
              </Pressable>
            </>
          ) : null}
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.12)',
    backgroundColor: '#fff',
    marginBottom: spacing.md,
  },
  shellMiddle: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  partnerRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(15, 23, 42, 0.1)',
  },
  partnerTxt: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#6b7280',
  },
  carouselViewport: {
    alignSelf: 'center',
    backgroundColor: '#f1f5f9',
    position: 'relative',
  },
  carouselTrack: {
    flexDirection: 'row',
  },
  clickOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  slide: {
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  loadingBox: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  countdownBadge: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  countdownTxt: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  countdownUnit: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.92)',
  },
  navBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -18,
    zIndex: 20,
    width: 32,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  navBtnLeft: {
    left: 0,
    borderTopRightRadius: radius.md,
    borderBottomRightRadius: radius.md,
  },
  navBtnRight: {
    right: 0,
    borderTopLeftRadius: radius.md,
    borderBottomLeftRadius: radius.md,
  },
  navBtnPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
});
