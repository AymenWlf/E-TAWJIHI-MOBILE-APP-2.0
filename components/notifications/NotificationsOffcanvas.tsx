import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  DeviceEventEmitter,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useNotificationsDrawer } from '@/contexts/NotificationsDrawerContext';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATIONS_IN_APP_REFRESH_EVENT,
} from '@/services/notifications';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { AppNotification } from '@/types/inscriptions';
import { notificationMessage, notificationTimeAgo, notificationTitle } from '@/utils/notificationDisplay';
import { navigateFromAppNotification } from '@/utils/notificationNavigation';

const PANEL_W = Math.min(400, Math.round(Dimensions.get('window').width * 0.88));

export function NotificationsOffcanvas() {
  const insets = useSafeAreaInsets();
  const { t, isRTL, locale } = useLocale();
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
    <Modal transparent visible={drawerOpen} animationType="none" onRequestClose={closeWithAnim}>
      <View style={styles.root} accessibilityViewIsModal>
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
            <View style={styles.center}>
              <ActivityIndicator color={brand.primary} />
            </View>
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
              renderItem={({ item: n }) => (
                <View style={[styles.card, !n.isRead && styles.cardUnread, isRTL && styles.cardRtl]}>
                  <View style={[styles.cardTop, isRTL && styles.rowRtl]}>
                    <FontAwesome name="bell" size={14} color={brand.primary} />
                    <Text style={[styles.cardTitle, !n.isRead && styles.cardTitleUnread, isRTL && styles.rtl]} numberOfLines={2}>
                      {notificationTitle(n, locale)}
                    </Text>
                  </View>
                  <Text style={[styles.cardMsg, isRTL && styles.rtl]} numberOfLines={4}>
                    {notificationMessage(n, locale)}
                  </Text>
                  <Text style={[styles.time, isRTL && styles.rtl]}>{notificationTimeAgo(n, locale)}</Text>
                  <Pressable
                    onPress={() => void onOpenLink(n)}
                    style={({ pressed }) => [styles.cta, isRTL && styles.rowRtl, pressed && { opacity: 0.9 }]}
                  >
                    <Text style={styles.ctaTxt}>{t('notifDrawerOpenLink')}</Text>
                    <FontAwesome name={isRTL ? 'chevron-left' : 'chevron-right'} size={12} color={brand.white} />
                  </Pressable>
                </View>
              )}
            />
          )}
        </Animated.View>
      </View>
    </Modal>
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
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  center: { paddingVertical: spacing.xxl, alignItems: 'center' },
  empty: { paddingVertical: spacing.xxl, alignItems: 'center', gap: spacing.sm },
  emptyTxt: { textAlign: 'center', color: brand.textMuted, fontWeight: '600' },
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    padding: spacing.md,
    backgroundColor: brand.white,
    marginBottom: spacing.sm,
  },
  cardRtl: {},
  cardUnread: {
    backgroundColor: 'rgba(51,62,143,0.05)',
    borderColor: 'rgba(51,62,143,0.25)',
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.xs },
  cardTitle: { flex: 1, fontSize: fontSize.sm, fontWeight: '700', color: brand.text },
  cardTitleUnread: { fontWeight: '900' },
  cardMsg: { fontSize: fontSize.xs, color: brand.textSecondary, lineHeight: 18, marginBottom: spacing.xs },
  time: { fontSize: 10, fontWeight: '600', color: brand.textMuted, marginBottom: spacing.sm },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: brand.primary,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  ctaTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.xs },
  rowRtl: { flexDirection: 'row-reverse' },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
});
