import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { fetchGlobalWallLiveConfig, fetchGlobalWallRevision } from '@/services/globalWall';

const POLL_MS = 12000;

/**
 * Mercure (SSE) si live-config est actif, sinon polling sur /revision.
 */
export function useGlobalWallLiveSync(opts: { enabled: boolean; syncFirstPage: () => Promise<void> }): void {
  const { enabled, syncFirstPage } = opts;
  const syncRef = useRef(syncFirstPage);
  syncRef.current = syncFirstPage;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    const abortMercure = new AbortController();
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleSync = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(() => {
        debounceTimer = null;
        void syncRef.current();
      }, 450);
    };

    const startRevisionPolling = () => {
      let lastRev = '';
      void fetchGlobalWallRevision()
        .then((r) => {
          if (r.success && r.data?.revision) {
            lastRev = r.data.revision;
          }
        })
        .catch(() => undefined);

      pollTimer = setInterval(() => {
        if (AppState.currentState !== 'active') {
          return;
        }
        void fetchGlobalWallRevision()
          .then((r) => {
            if (!r.success || !r.data?.revision || cancelled) {
              return;
            }
            if (lastRev !== '' && r.data.revision !== lastRev) {
              scheduleSync();
            }
            lastRev = r.data.revision;
          })
          .catch(() => undefined);
      }, POLL_MS);
    };

    const mercureLoop = async () => {
      while (!cancelled) {
        const cfgRes = await fetchGlobalWallLiveConfig().catch(() => ({ success: false as const }));
        if (cancelled) {
          return;
        }
        const cfg = cfgRes.success ? cfgRes.data : undefined;
        if (!cfg?.hubUrl?.trim() || !cfg.token) {
          startRevisionPolling();
          return;
        }

        const url = new URL(cfg.hubUrl);
        url.searchParams.append('topic', cfg.topic);

        try {
          await fetchEventSource(url.toString(), {
            signal: abortMercure.signal,
            headers: { Authorization: `Bearer ${cfg.token}` },
            async onopen(response) {
              if (!response.ok) {
                throw new Error(`mercure http ${response.status}`);
              }
            },
            onmessage(ev) {
              if (!ev.data) {
                return;
              }
              try {
                JSON.parse(ev.data);
                scheduleSync();
              } catch {
                // ping / non-json
              }
            },
          });
        } catch {
          // reconnect
        }

        if (!cancelled) {
          await new Promise((r) => setTimeout(r, 2500));
        }
      }
    };

    void mercureLoop();

    return () => {
      cancelled = true;
      abortMercure.abort();
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      if (pollTimer) {
        clearInterval(pollTimer);
      }
    };
  }, [enabled]);
}
