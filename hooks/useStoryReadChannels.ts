import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'etawjihi.stories.readChannels.v1';

export function useStoryReadChannels() {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        try {
          const arr = JSON.parse(raw) as string[];
          if (Array.isArray(arr)) {
            setReadIds(new Set(arr));
          }
        } catch {
          /* ignore */
        }
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const markChannelRead = useCallback((channelId: string) => {
    setReadIds((prev) => {
      if (prev.has(channelId)) return prev;
      const next = new Set(prev);
      next.add(channelId);
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...next])).catch(() => {});
      return next;
    });
  }, []);

  return { readIds, markChannelRead, hydrated };
}
