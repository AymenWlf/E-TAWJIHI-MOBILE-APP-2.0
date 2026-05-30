import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  DeviceEventEmitter,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NotificationCard } from '@/components/inscriptions/NotificationCard';
import { NotificationCardSkeletonStack } from '@/components/inscriptions/NotificationCardSkeleton';
import { Text } from '@/components/ui/Text';
import { PlatformSheetOverlay } from '@/components/ui/PlatformSheetOverlay';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useNotificationsDrawer } from '@/contexts/NotificationsDrawerContext';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATIONS_IN_APP_REFRESH_EVENT,
} from '@/services/notifications';
import { brand, fontSize, spacing } from '@/theme/tokens';
import type { AppNotification } from '@/types/inscriptions';
import { notificationCtaLabelKey } from '@/utils/notificationCtaLabel';
import {
  canNavigateFromAppNotification,
  navigateFromAppNotification,
} from '@/utils/notificationNavigation';

const PANEL_W = Math.min(400, Math.round(Dimensions.get('window').width * 0.88));

export function NotificationsOffcanvas() {
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useLocale();
  const { user, getValidAccessToken } = useAuth();
  const { drawerOpen, closeDrawer, refreshUnread, unreadCount: serverUnreadCount } = useNotificationsDrawer();
  const slide = useRef(new Animated.Value(PANEL_W)).current;
  /** Évite les POST `/read` en double pour une même notif pendant que la liste est affichée. */
  const visibilityMarkedRef = useRef<Set<number>>(new Set());

  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent === true;
      if (!user) {
        setItems([]);
        return;
      }
      const token = await getValidAccessToken();
      if (!token) return;
      if (!silent) visibilityMarkedRef.current.clear();
      if (!silent) setLoading(true);
      try {
        const res = await fetchNotifications(token, { limit: 100, offset: 0, unreadOnly: false });
        setItems(res.items);
      } catch {
        setItems([]);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [user, getValidAccessToken],
  );

  useEffect(() => {
    if (!drawerOpen) visibilityMarkedRef.current.clear();
  }, [drawerOpen]);

  /** Liste in-app à jour comme un fil de messages : push, polling, retour app — sans ouvrir le panneau. */
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(NOTIFICATIONS_IN_APP_REFRESH_EVENT, () => {
      void load({ silent: true });
    });
    return () => sub.remove();
  }, [load]);

  /** Précharge au login pour que l’ouverture du tiroir affiche déjà les données récentes. */
  useEffect(() => {
    if (!user) return;
    void load({ silent: true });
  }, [user?.id, load]);

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 50,
      minimumViewTime: 320,
    }),
    [],
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!user) return;
      void (async () => {
        const token = await getValidAccessToken();
        if (!token) return;
        for (const vi of viewableItems) {
          if (!vi.isViewable || vi.item == null) continue;
          const n = vi.item as AppNotification;
          if (n.isRead || visibilityMarkedRef.current.has(n.id)) continue;
          visibilityMarkedRef.current.add(n.id);
          const ok = await markNotificationRead(token, n.id);
          if (ok) {
            setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
            void refreshUnread();
          } else {
            visibilityMarkedRef.current.delete(n.id);
          }
        }
      })();
    },
    [user, getValidAccessToken, refreshUnread],
  );

  useEffect(() => {
    if (!drawerOpen) return;
    slide.setValue(PANEL_W);
    void load({ silent: false });
    void refreshUnread();
    Animated.timing(slide, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [drawerOpen, load, refreshUnread, slide]);

  const closeWithAnim = useCallback(() => {
    Animated.timing(slide, {
      toValue: PANEL_W,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) closeDrawer();
    });
  }, [closeDrawer, slide]);

  const onBackdrop = useCallback(() => {
    closeWithAnim();
  }, [closeWithAnim]);

  const onOpenLink = useCallback(
    async (n: AppNotification) => {
      if (!user) return;
      const token = await getValidAccessToken();
      if (token && !n.isRead) {
        await markNotificationRead(token, n.id);
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
        void refreshUnread();
      }
      const ok = navigateFromAppNotification(n);
      if (ok) {
        closeWithAnim();
      }
    },
    [user, getValidAccessToken, refreshUnread, closeWithAnim],
  );

  const onMarkAll = useCallback(async () => {
    const token = await getValidAccessToken();
    if (!token) return;
    const ok = await markAllNotificationsRead(token);
    if (ok) {
      setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
      void refreshUnread();
    }
  }, [getValidAccessToken, refreshUnread]);

  const unreadInList = useMemo(() => items.filter((x) => !x.isRead).length, [items]);

  return (
    <PlatformSheetOverlay visible={drawerOpen} zIndex={8500} onRequestClose={closeWithAnim}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onBackdrop} accessibilityRole="button" accessibilityLabel={t('notifDrawerClose')} />
        <Animated.View
          style={[
            styles.panel,
            isRTL ? { left: 0, right: undefined } : { right: 0, left: undefined },
            {
              width: PANEL_W,
              paddingTop: insets.top + spacing.sm,
              paddingBottom: insets.bottom + spacing.sm,
              transform: [{ translateX: slide }],
            },
          ]}
        >
          <View style={[styles.panelHeader, isRTL && styles.rowRtl]}>
            <Text style={[styles.panelTitle, isRTL && styles.rtl]}>{t('notifDrawerTitle')}</Text>
            <Pressable
              onPress={closeWithAnim}
              hitSlop={12}
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.75 }]}
              accessibilityRole="button"
              accessibilityLabel={t('notifDrawerClose')}
            >
              <FontAwesome name="close" size={22} color={brand.text} />
            </Pressable>
          </View>
          <Text style={[styles.panelSub, isRTL && styles.rtl]}>{t('notifDrawerSubtitle')}</Text>
          {serverUnreadCount > 0 ? (
            <Text style={[styles.unreadLine, isRTL && styles.rtl]}>
              {serverUnreadCount} {t('unreadSuffix')}
            </Text>
          ) : null}
          {unreadInList > 0 ? (
            <Pressable onPress={() => void onMarkAll()} style={({ pressed }) => [styles.markAll, pressed && { opacity: 0.85 }]}>
              <FontAwesome name="check-square-o" size={12} color={brand.primary} />
              <Text style={styles.markAllTxt}>{t('inscNotifMarkAllRead')}</Text>
            </Pressable>
          ) : null}

          {loading ? (
            <NotificationCardSkeletonStack
              count={4}
              isRTL={isRTL}
              withCtaPattern={[true, false, true, false]}
              style={styles.list}
            />
          ) : (
            <FlatList
              data={items}
              keyExtractor={(n) => `drawer-notif-${n.id}`}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              viewabilityConfig={viewabilityConfig}
              onViewableItemsChanged={onViewableItemsChanged}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <FontAwesome name="bell-o" size={32} color={brand.textMuted} />
                  <Text style={[styles.emptyTxt, isRTL && styles.rtl]}>{t('notifDrawerEmpty')}</Text>
                </View>
              }
              renderItem={({ item: n }) => {
                const ctaKey = notificationCtaLabelKey(n);
                const canNavigate = canNavigateFromAppNotification(n);
                return (
                  <NotificationCard
                    notif={n}
                    interactive={false}
                    actionLabel={canNavigate ? t(ctaKey) : undefined}
                    onActionPress={canNavigate ? () => void onOpenLink(n) : undefined}
                  />
                );
              }}
            />
          )}
        </Animated.View>
      </View>
    </PlatformSheetOverlay>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: brand.white,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: brand.border,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: -4, height: 0 },
    elevation: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  panelTitle: {
    fontSize: fontSize.lg,
    fontWeight: '900',
    color: brand.text,
    flex: 1,
  },
  panelSub: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: brand.textMuted,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  unreadLine: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.primary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  markAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  markAllTxt: { fontSize: fontSize.xs, fontWeight: '800', color: brand.primary },
  closeBtn: { padding: spacing.xs },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm, flexGrow: 1 },
  empty: { paddingVertical: spacing.xxl, alignItems: 'center', gap: spacing.sm },
  emptyTxt: { textAlign: 'center', color: brand.textMuted, fontWeight: '600' },
  rowRtl: { flexDirection: 'row-reverse' },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
});
