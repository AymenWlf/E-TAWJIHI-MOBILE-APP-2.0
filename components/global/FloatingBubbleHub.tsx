import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  DeviceEventEmitter,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalWallUnread } from '@/contexts/GlobalWallUnreadContext';
import { useLocale } from '@/contexts/LocaleContext';
import { brand, radius, spacing } from '@/theme/tokens';

/** Hauteur approx barre d’onglets. */
const TAB_BAR_EXTRA = 56;

type HubItem = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'] | React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  kind: 'fa' | 'mci';
  onPress: () => void;
};

export function FloatingBubbleHub() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLocale();
  const { user } = useAuth();
  const { unreadCount } = useGlobalWallUnread();
  const [expanded, setExpanded] = useState(false);

  const unreadBadgeScale = useRef(new Animated.Value(1)).current;
  const prevUnreadRef = useRef(0);

  const containerOpacity = useRef(new Animated.Value(0)).current;
  const containerScale = useRef(new Animated.Value(0.92)).current;
  const itemAnimsRef = useRef<Animated.Value[]>([]);

  const bottom = TAB_BAR_EXTRA + Math.max(insets.bottom, spacing.sm) + spacing.sm;

  /** Nombre d’entrées du hub (animations stagger). */
  const hubSlotCount = 2;

  const ensureItemAnims = useCallback((len: number) => {
    const arr = itemAnimsRef.current;
    while (arr.length < len) {
      arr.push(new Animated.Value(0));
    }
    return arr.slice(0, len);
  }, []);

  const resetClosed = useCallback(() => {
    containerOpacity.setValue(0);
    containerScale.setValue(0.92);
    ensureItemAnims(hubSlotCount).forEach((v) => v.setValue(0));
  }, [containerOpacity, containerScale, ensureItemAnims, hubSlotCount]);

  const animateOpen = useCallback(() => {
    const itemVals = ensureItemAnims(hubSlotCount);
    resetClosed();
    Animated.parallel([
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(containerScale, {
        toValue: 1,
        friction: 8,
        tension: 78,
        useNativeDriver: true,
      }),
      Animated.stagger(
        72,
        itemVals.map((v) =>
          Animated.timing(v, {
            toValue: 1,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ),
      ),
    ]).start();
  }, [containerOpacity, containerScale, ensureItemAnims, hubSlotCount, resetClosed]);

  const animateClose = useCallback(
    (onDone?: () => void) => {
      const itemVals = ensureItemAnims(hubSlotCount);
      Animated.parallel([
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(containerScale, {
          toValue: 0.92,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.stagger(
          48,
          [...itemVals].reverse().map((v) =>
            Animated.timing(v, {
              toValue: 0,
              duration: 160,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }),
          ),
        ),
      ]).start(() => {
        resetClosed();
        onDone?.();
      });
    },
    [containerOpacity, containerScale, ensureItemAnims, hubSlotCount, resetClosed],
  );

  const openMenu = useCallback(() => {
    setExpanded(true);
  }, []);

  const closeMenu = useCallback(() => {
    animateClose(() => setExpanded(false));
  }, [animateClose]);

  const items = useMemo<HubItem[]>(
    () => [
      {
        key: 'chatbot',
        label: t('chatbotTitle'),
        icon: 'robot',
        kind: 'mci',
        onPress: () => {
          DeviceEventEmitter.emit('chatbot:open');
        },
      },
      {
        key: 'community',
        label: t('globalWallTitle'),
        icon: 'bullhorn',
        kind: 'fa',
        onPress: () => {
          animateClose(() => {
            setExpanded(false);
            router.push('/communaute' as never);
          });
        },
      },
    ],
    [router, t, animateClose],
  );

  useEffect(() => {
    if (!expanded) return;
    animateOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- animation uniquement à l’ouverture
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const sub = DeviceEventEmitter.addListener('chatbot:open', () => {
      animateClose(() => setExpanded(false));
    });
    return () => sub.remove();
  }, [expanded, animateClose]);

  const toggle = () => {
    if (expanded) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const showUnread = Boolean(user && unreadCount > 0);
  const showFabUnreadBadge = showUnread && !expanded;
  const showCommunityUnreadBadge = showUnread && expanded;

  const unreadA11y = t('hubGlobalWallUnreadBadgeA11y').replace('{{count}}', String(unreadCount));

  return (
    <View style={[styles.wrap, { right: spacing.md, bottom }]} pointerEvents="box-none">
      {expanded ? (
        <Animated.View
          style={[
            styles.menuCard,
            {
              opacity: containerOpacity,
              transform: [{ scale: containerScale }],
            },
          ]}
          pointerEvents="box-none"
        >
          {items.map((it, index) => {
            const progress = ensureItemAnims(hubSlotCount)[index];
            const translateY = progress.interpolate({
              inputRange: [0, 1],
              outputRange: [16, 0],
            });
            return (
              <Animated.View
                key={it.key}
                style={{
                  opacity: progress,
                  transform: [{ translateY }],
                }}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    it.key === 'community' && showCommunityUnreadBadge
                      ? `${it.label}. ${unreadA11y}`
                      : it.label
                  }
                  onPress={it.onPress}
                  style={({ pressed }) => [
                    styles.item,
                    { flexDirection: isRTL ? 'row' : 'row-reverse' },
                    pressed && { opacity: 0.92 },
                  ]}
                >
                  <View style={styles.itemIcon}>
                    {it.kind === 'fa' ? (
                      <FontAwesome name={it.icon as any} size={18} color={brand.white} />
                    ) : (
                      <MaterialCommunityIcons name={it.icon as any} size={20} color={brand.white} />
                    )}
                    {it.key === 'community' && showCommunityUnreadBadge ? (
                      <Animated.View
                        style={[
                          styles.unreadBadgeItem,
                          isRTL ? styles.unreadBadgeItemRtl : null,
                          { transform: [{ scale: unreadBadgeScale }] },
                        ]}
                        pointerEvents="none"
                      >
                        <Text style={styles.unreadBadgeTxt}>
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Text>
                      </Animated.View>
                    ) : null}
                  </View>
                  <View style={styles.itemLabelWrap}>
                    <Text
                      style={[styles.itemLabel, { textAlign: isRTL ? 'left' : 'right' }]}
                      numberOfLines={2}
                    >
                      {it.label}
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </Animated.View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          showFabUnreadBadge ? `${unreadA11y}. Ouvrir les bulles` : 'Ouvrir les bulles'
        }
        onPress={toggle}
        style={({ pressed }) => [styles.bubble, pressed && styles.bubblePressed]}
      >
        <View style={styles.bubbleInner}>
          <FontAwesome name={expanded ? 'times' : 'th-large'} size={20} color={brand.white} />
          {showFabUnreadBadge ? (
            <Animated.View
              style={[styles.unreadBadgeFab, { transform: [{ scale: unreadBadgeScale }] }]}
              pointerEvents="none"
            >
              <Text style={styles.unreadBadgeTxt}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </Animated.View>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}

const BUBBLE = 56;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 50,
    alignItems: 'flex-end',
  },
  bubbleInner: {
    width: BUBBLE,
    height: BUBBLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    width: BUBBLE,
    height: BUBBLE,
    borderRadius: radius.full,
    backgroundColor: brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  bubblePressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
  menuCard: {
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 10,
    maxWidth: 300,
    minWidth: 220,
  },
  /** Icon + libellé : la bulle reste au bord écran, le nom à côté (vers le centre). */
  item: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemIcon: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },
  unreadBadgeFab: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: brand.white,
  },
  unreadBadgeItemShared: {
    position: 'absolute',
    top: -6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: brand.white,
  },
  unreadBadgeTxt: {
    color: brand.white,
    fontSize: 10,
    fontWeight: '900',
  },
  itemLabelWrap: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    backgroundColor: brand.backgroundSoft,
    marginEnd: 0,
  },
  itemLabel: {
    color: brand.text,
    fontWeight: '800',
    fontSize: 14,
  },
});
