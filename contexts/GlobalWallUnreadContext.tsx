import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePathname } from 'expo-router';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AppState, InteractionManager, type AppStateStatus } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import {
  fetchGlobalWallPosts,
  GLOBAL_WALL_PAGE_SIZE,
  type GlobalWallPost,
} from '@/services/globalWall';
import { GLOBAL_WALL_MOBILE_ENABLED } from '@/constants/mobileFeatureFlags';
import { countNewGlobalWallMessages } from '@/utils/countNewGlobalWallMessages';

const STORAGE_KEY = 'etawjihi.globalWall.page1Snapshot';

type StoredWallMini = { id: number; replies: { id: number }[] };

function postsToMini(items: GlobalWallPost[]): StoredWallMini[] {
  return items.map((p) => ({
    id: p.id,
    replies: p.replies.map((r) => ({ id: r.id })),
  }));
}

const DUMMY_AUTHOR = { id: 0, displayName: '' };

function minisToPosts(minis: StoredWallMini[]): GlobalWallPost[] {
  return minis.map((m) => ({
    id: m.id,
    body: '',
    linkUrl: null,
    linkLabel: null,
    attachments: null,
    share: null,
    createdAt: null,
    author: null,
    replyCount: m.replies.length,
    replies: m.replies.map((r) => ({
      id: r.id,
      body: '',
      linkUrl: null,
      linkLabel: null,
      attachments: null,
      createdAt: null,
      author: DUMMY_AUTHOR,
      reactions: [],
    })),
    reactions: [],
  }));
}

type GlobalWallUnreadContextValue = {
  unreadCount: number;
  /** À appeler avec la page 1 API après chargement / sync sur l’écran Communauté (marque tout comme lu côté badge). */
  registerGlobalWallPage1Seen: (items: GlobalWallPost[]) => Promise<void>;
  refreshUnread: () => Promise<void>;
};

const GlobalWallUnreadContext = createContext<GlobalWallUnreadContextValue | null>(null);

const DISABLED_WALL_CTX: GlobalWallUnreadContextValue = {
  unreadCount: 0,
  registerGlobalWallPage1Seen: async () => {},
  refreshUnread: async () => {},
};

export function GlobalWallUnreadProvider({ children }: { children: ReactNode }) {
  if (!GLOBAL_WALL_MOBILE_ENABLED) {
    return (
      <GlobalWallUnreadContext.Provider value={DISABLED_WALL_CTX}>
        {children}
      </GlobalWallUnreadContext.Provider>
    );
  }
  return <GlobalWallUnreadProviderActive>{children}</GlobalWallUnreadProviderActive>;
}

function GlobalWallUnreadProviderActive({ children }: { children: ReactNode }) {
  const { user, getValidAccessToken } = useAuth();
  const pathname = usePathname() ?? '';
  const onCommunityScreen = pathname.includes('communaute');

  const [unreadCount, setUnreadCount] = useState(0);

  const persistSnapshot = useCallback(async (items: GlobalWallPost[]) => {
    const mini = postsToMini(items);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mini));
    } catch {
      /* ignore */
    }
    setUnreadCount(0);
  }, []);

  const registerGlobalWallPage1Seen = useCallback(
    async (items: GlobalWallPost[]) => {
      if (items.length === 0) return;
      await persistSnapshot(items);
    },
    [persistSnapshot],
  );

  const refreshUnread = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    if (onCommunityScreen) {
      setUnreadCount(0);
      return;
    }
    const token = await getValidAccessToken();
    let storedRaw: string | null = null;
    try {
      storedRaw = await AsyncStorage.getItem(STORAGE_KEY);
    } catch {
      storedRaw = null;
    }

    const res = await fetchGlobalWallPosts(1, GLOBAL_WALL_PAGE_SIZE, token);
    if (!res.success || !res.data?.items) return;

    if (!storedRaw || storedRaw.trim() === '') {
      await persistSnapshot(res.data.items);
      return;
    }

    try {
      const parsed = JSON.parse(storedRaw) as StoredWallMini[];
      const before = minisToPosts(parsed);
      const n = countNewGlobalWallMessages(before, res.data.items);
      setUnreadCount(n);
    } catch {
      await persistSnapshot(res.data.items);
    }
  }, [user?.id, getValidAccessToken, onCommunityScreen, persistSnapshot]);

  useEffect(() => {
    if (!user) {
      void AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
      setUnreadCount(0);
      return;
    }
    if (onCommunityScreen) {
      setUnreadCount(0);
      return;
    }
    const task = InteractionManager.runAfterInteractions(() => {
      void refreshUnread();
    });
    return () => task.cancel();
  }, [user?.id, onCommunityScreen, refreshUnread]);

  useEffect(() => {
    if (!user?.id) return;
    const id = setInterval(() => {
      void refreshUnread();
    }, 28_000);
    return () => clearInterval(id);
  }, [user?.id, refreshUnread]);

  useEffect(() => {
    if (!user?.id) return;
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active') {
        void refreshUnread();
      }
    });
    return () => sub.remove();
  }, [user?.id, refreshUnread]);

  const value = useMemo(
    (): GlobalWallUnreadContextValue => ({
      unreadCount,
      registerGlobalWallPage1Seen,
      refreshUnread,
    }),
    [unreadCount, registerGlobalWallPage1Seen, refreshUnread],
  );

  return <GlobalWallUnreadContext.Provider value={value}>{children}</GlobalWallUnreadContext.Provider>;
}

export function useGlobalWallUnread(): GlobalWallUnreadContextValue {
  const ctx = useContext(GlobalWallUnreadContext);
  if (!ctx) {
    throw new Error('useGlobalWallUnread must be used within GlobalWallUnreadProvider');
  }
  return ctx;
}
