import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DeviceEventEmitter, InteractionManager } from 'react-native';

import {
  NOTIFICATIONS_POLL_MS,
  NOTIFICATIONS_REFRESH_MIN_MS,
} from '@/constants/backgroundPollIntervals';
import { useAuth } from '@/contexts/AuthContext';
import { useBackgroundPoll } from '@/hooks/useBackgroundPoll';
import { fetchUnreadCount, NOTIFICATIONS_IN_APP_REFRESH_EVENT } from '@/services/notifications';
import {
  fetchContestAnnouncementsCached,
  fetchContestAnnouncementSeenState,
  markContestAnnouncementSeenApi,
} from '@/services/contestAnnouncements';
import {
  loadSeenAnnouncementIds,
  markAnnouncementSeenOnDisk,
  persistSeenAnnouncementIds,
} from '@/utils/announcementSeenState';

type NotificationsDrawerContextValue = {
  unreadCount: number;
  /** Annonces concours avec au moins une notification in-app non lue (chip « Non lue »). */
  unreadAnnouncementCount: number;
  unreadAnnouncementIds: ReadonlySet<number>;
  /** Annonces publiées jamais ouvertes (point animé « Non vue »). */
  unseenAnnouncementCount: number;
  unseenAnnouncementIds: ReadonlySet<number>;
  /** Badge onglet Inscriptions : annonces non lues (notif) ou jamais ouvertes. */
  inscriptionsTabBadgeCount: number;
  /** Annonces dont la fiche a déjà été ouverte par l'utilisateur. */
  seenAnnouncementIds: ReadonlySet<number>;
  refreshUnread: (options?: { force?: boolean }) => Promise<void>;
  markAnnouncementSeen: (announcementId: number) => Promise<void>;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const NotificationsDrawerContext = createContext<NotificationsDrawerContextValue | null>(null);

const EMPTY_SET = new Set<number>();

function removeIdFromSet(source: ReadonlySet<number>, id: number): Set<number> {
  if (!source.has(id)) return new Set(source);
  const next = new Set(source);
  next.delete(id);
  return next;
}

export function NotificationsDrawerProvider({ children }: { children: React.ReactNode }) {
  const { user, getValidAccessToken } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadAnnouncementIds, setUnreadAnnouncementIds] = useState<Set<number>>(EMPTY_SET);
  const [unseenAnnouncementIds, setUnseenAnnouncementIds] = useState<Set<number>>(EMPTY_SET);
  const [seenAnnouncementIds, setSeenAnnouncementIds] = useState<Set<number>>(EMPTY_SET);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const refreshInFlightRef = useRef(false);
  const lastRefreshAtRef = useRef(0);

  const refreshUnread = useCallback(async (options?: { force?: boolean }) => {
    const force = Boolean(options?.force);
    const now = Date.now();
    if (!force && now - lastRefreshAtRef.current < NOTIFICATIONS_REFRESH_MIN_MS) {
      return;
    }
    if (refreshInFlightRef.current) {
      return;
    }
    refreshInFlightRef.current = true;
    lastRefreshAtRef.current = now;

    const local = await loadSeenAnnouncementIds();

    if (!user) {
      setUnreadCount(0);
      setUnreadAnnouncementIds(EMPTY_SET);
      setSeenAnnouncementIds(local);
      try {
        const { items } = await fetchContestAnnouncementsCached();
        const unseen = new Set<number>();
        for (const item of items) {
          if (!local.has(item.id)) unseen.add(item.id);
        }
        setUnseenAnnouncementIds(unseen);
      } catch {
        setUnseenAnnouncementIds(EMPTY_SET);
      }
      refreshInFlightRef.current = false;
      return;
    }

    try {
      const token = await getValidAccessToken();
      if (!token) {
        refreshInFlightRef.current = false;
        return;
      }
      const [notifUnreadCount, state] = await Promise.all([
        fetchUnreadCount(token),
        fetchContestAnnouncementSeenState(token),
      ]);
      const mergedSeen = new Set([...local, ...state.seenIds]);
      setUnreadCount(notifUnreadCount);
      setUnreadAnnouncementIds(state.unreadIds);
      setUnseenAnnouncementIds(state.unseenIds);
      setSeenAnnouncementIds(mergedSeen);
      await persistSeenAnnouncementIds(mergedSeen);
    } catch {
      /* Réseau / API indisponible : conserver le cache local. */
      setSeenAnnouncementIds(local);
    } finally {
      refreshInFlightRef.current = false;
    }
  }, [user?.id, getValidAccessToken]);

  const markAnnouncementSeen = useCallback(
    async (announcementId: number) => {
      const next = await markAnnouncementSeenOnDisk(announcementId);
      setSeenAnnouncementIds(next);
      setUnseenAnnouncementIds((prev) => removeIdFromSet(prev, announcementId));
      setUnreadAnnouncementIds((prev) => removeIdFromSet(prev, announcementId));
      if (!user) return;
      try {
        const token = await getValidAccessToken();
        if (!token) return;
        const result = await markContestAnnouncementSeenApi(token, announcementId);
        if (result.notificationsMarkedRead > 0) {
          void refreshUnread({ force: true });
        }
      } catch {
        /* Réseau : le cache local reste à jour. */
      }
    },
    [user?.id, getValidAccessToken, refreshUnread],
  );

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      void refreshUnread();
    });
    return () => task.cancel();
  }, [refreshUnread]);

  /** Push foreground + retour app + polling : une seule entrée pour garder le badge aligné serveur. */
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      NOTIFICATIONS_IN_APP_REFRESH_EVENT,
      (payload?: { force?: boolean }) => {
        void refreshUnread(payload);
      },
    );
    return () => sub.remove();
  }, [refreshUnread]);

  useBackgroundPoll(
    () => {
      DeviceEventEmitter.emit(NOTIFICATIONS_IN_APP_REFRESH_EVENT);
    },
    {
      intervalMs: NOTIFICATIONS_POLL_MS,
      debounceMs: NOTIFICATIONS_REFRESH_MIN_MS,
      enabled: Boolean(user?.id),
      runOnMount: false,
    },
  );

  const unreadAnnouncementCount = unreadAnnouncementIds.size;
  const unseenAnnouncementCount = unseenAnnouncementIds.size;
  const inscriptionsTabBadgeCount = useMemo(() => {
    const merged = new Set(unreadAnnouncementIds);
    for (const id of unseenAnnouncementIds) merged.add(id);
    return merged.size;
  }, [unreadAnnouncementIds, unseenAnnouncementIds]);

  const value = useMemo(
    (): NotificationsDrawerContextValue => ({
      unreadCount,
      unreadAnnouncementCount,
      unreadAnnouncementIds,
      unseenAnnouncementCount,
      unseenAnnouncementIds,
      inscriptionsTabBadgeCount,
      seenAnnouncementIds,
      refreshUnread,
      markAnnouncementSeen,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }),
    [
      unreadCount,
      unreadAnnouncementCount,
      unreadAnnouncementIds,
      unseenAnnouncementCount,
      unseenAnnouncementIds,
      inscriptionsTabBadgeCount,
      seenAnnouncementIds,
      refreshUnread,
      markAnnouncementSeen,
      drawerOpen,
    ],
  );

  return <NotificationsDrawerContext.Provider value={value}>{children}</NotificationsDrawerContext.Provider>;
}

export function useNotificationsDrawer(): NotificationsDrawerContextValue {
  const ctx = useContext(NotificationsDrawerContext);
  if (!ctx) {
    throw new Error('useNotificationsDrawer must be used within NotificationsDrawerProvider');
  }
  return ctx;
}
