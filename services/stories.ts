import { buildApiUrl } from '@/constants/api';
import { httpPostJson } from '@/services/http';

import type { StoryChannel } from '@/data/mock/homeFeed';
import { isStoryImageUri } from '@/constants/storyMedia';

type ChannelsApiResponse = {
  success: boolean;
  data?: {
    channels: Array<{
      id: string;
      label: string;
      coverUri?: string | null;
      slides: Array<{
        id: string;
        uri: string;
        durationMs?: number;
        caption?: string | null;
        linkUrl?: string | null;
      }>;
    }>;
  };
};

/**
 * Chaînes publiées depuis l’API (remplace le mock si au moins une chaîne renvoyée).
 */
export async function fetchStoryChannels(locale: 'fr' | 'ar'): Promise<StoryChannel[]> {
  const url = buildApiUrl('/api/stories/channels', { locale });
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`Stories HTTP ${res.status}`);
  }
  const json = (await res.json()) as ChannelsApiResponse;
  const raw = json.data?.channels ?? [];
  const out: StoryChannel[] = [];
  for (const ch of raw) {
    const slides = ch.slides
      .map((s) => ({
        id: String(s.id),
        uri: s.uri,
        durationMs: s.durationMs ?? 5000,
        caption: s.caption ?? undefined,
        linkUrl: s.linkUrl ?? undefined,
      }))
      .filter((s) => isStoryImageUri(s.uri));
    if (slides.length === 0) continue;
    const coverUri =
      ch.coverUri && isStoryImageUri(ch.coverUri) ? ch.coverUri : slides[0]?.uri;
    out.push({
      id: String(ch.id),
      label: ch.label,
      coverUri,
      slides,
    });
  }
  return out;
}

export type StoryAnalyticsEvent =
  | 'feed_impression'
  | 'open'
  | 'slide_view'
  | 'complete'
  | 'cta_click';

/**
 * Envoie un événement analytics (best-effort, pas de throw vers l’UI).
 */
export async function recordStoryEvent(
  event: StoryAnalyticsEvent,
  opts: {
    channelId?: string;
    slideId?: string;
    visitorId?: string;
    viewport?: 'mobile' | 'desktop';
  },
): Promise<void> {
  try {
    const body: Record<string, unknown> = {
      event,
      viewport: opts.viewport ?? 'mobile',
    };
    if (opts.visitorId) body.visitorId = opts.visitorId;
    if (opts.channelId) body.channelId = Number(opts.channelId);
    if (opts.slideId) body.slideId = Number(opts.slideId);
    const url = buildApiUrl('/api/stories/record-event');
    await httpPostJson<{ success: boolean }, Record<string, unknown>>(url, body);
  } catch {
    /* ignore — KPIs best-effort */
  }
}
