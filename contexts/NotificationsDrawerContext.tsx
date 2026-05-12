import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, DeviceEventEmitter, type AppStateStatus } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { fetchUnreadCount, NOTIFICATIONS_IN_APP_REFRESH_EVENT } from '@/services/notifications';

type NotificationsDrawerContextValue = {
  unreadCount: number;
  refreshUnread: () => Promise<void>;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const NotificationsDrawerContext = createContext<NotificationsDrawerContextValue | null>(null);

export function NotificationsDrawerProvider({ children }: { children: React.ReactNode }) {
  const { user, getValidAccessToken } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refreshUnread = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    const token = await getValidAccessToken();
    if (!token) return;
    const c = await fetchUnreadCount(token);
    setUnreadCount(c);
  }, [user, getValidAccessToken]);

  useEffect(() => {
    void refreshUnread();
  }, [refreshUnread]);

  /** Push foreground + retour app + polling : une seule entrée pour garder le badge aligné serveur. */
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(NOTIFICATIONS_IN_APP_REFRESH_EVENT, () => {
      void refreshUnread();
    });
    return () => sub.remove();
  }, [refreshUnread]);

  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => {
      DeviceEventEmitter.emit(NOTIFICATIONS_IN_APP_REFRESH_EVENT);
    }, 25_000);
    return () => clearInterval(id);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active') {
        DeviceEventEmitter.emit(NOTIFICATIONS_IN_APP_REFRESH_EVENT);
      }
    });
    return () => sub.remove();
  }, [user]);

  const value = useMemo(
    (): NotificationsDrawerContextValue => ({
      unreadCount,
      refreshUnread,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }),
    [unreadCount, refreshUnread, drawerOpen],
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
