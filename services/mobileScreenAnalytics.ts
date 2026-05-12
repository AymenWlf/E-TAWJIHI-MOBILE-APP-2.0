import { buildApiUrl } from '@/constants/api';
import { httpPostJson } from '@/services/http';
import { getMobileVisitorId } from '@/utils/visitorId';

type PlatformRecordEvent =
  | {
      action: 'imp';
      segmentType: 'page';
      segmentKey: string;
      viewport: 'mobile';
      userId?: number;
    }
  | {
      action: 'time';
      segmentType: 'page';
      segmentKey: string;
      viewport: 'mobile';
      durationMs: number;
      userId?: number;
    };

const queue: PlatformRecordEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const MAX_BATCH = 40;
const FLUSH_MS = 1600;

async function flushQueue(): Promise<void> {
  if (queue.length === 0) return;
  const batch = queue.splice(0, MAX_BATCH);
  try {
    const visitorId = await getMobileVisitorId();
    const url = buildApiUrl('/api/platform-analytics/record');
    await httpPostJson<{ success: boolean }, { visitorId: string; events: PlatformRecordEvent[] }>(url, {
      visitorId,
      events: batch,
    });
  } catch {
    /* best-effort */
  }
  if (queue.length > 0) void flushQueue();
}

function scheduleFlush(): void {
  if (flushTimer != null) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushQueue();
  }, FLUSH_MS);
}

/**
 * Enregistre une vue d'écran (préfixe `app:` réservé aux KPI admin app mobile).
 */
export function recordMobileScreenImpression(pathnameNormalized: string, userId: number | null): void {
  const segmentKey = pathnameNormalized.slice(0, 512);
  if (!segmentKey.startsWith('app:')) return;

  const ev: PlatformRecordEvent = {
    action: 'imp',
    segmentType: 'page',
    segmentKey,
    viewport: 'mobile',
  };
  if (userId != null && userId > 0) {
    ev.userId = userId;
  }

  queue.push(ev);
  if (queue.length >= MAX_BATCH) void flushQueue();
  else scheduleFlush();
}

/**
 * Durée passée sur un écran (ms), agrégée côté serveur par jour et par route.
 * Max 1 h par événement (aligné backend).
 */
export function recordMobileScreenTime(segmentKey: string, durationMs: number, userId: number | null): void {
  const key = segmentKey.slice(0, 512);
  if (!key.startsWith('app:') || durationMs < 1000) return;

  const durationMsCapped = Math.min(Math.floor(durationMs), 3_600_000);

  const ev: PlatformRecordEvent = {
    action: 'time',
    segmentType: 'page',
    segmentKey: key,
    viewport: 'mobile',
    durationMs: durationMsCapped,
  };
  if (userId != null && userId > 0) {
    ev.userId = userId;
  }

  queue.push(ev);
  if (queue.length >= MAX_BATCH) void flushQueue();
  else scheduleFlush();
}
