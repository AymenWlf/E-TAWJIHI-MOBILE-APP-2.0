import { buildApiUrl } from '@/constants/api';
import { httpGetJson, httpPostJson } from '@/services/http';

import type { StoryChannel } from '@/data/mock/homeFeed';
import { isStoryImageUri, resolvePublicMediaUrl } from '@/constants/storyMedia';

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

const storyChannelsCache: Partial<Record<'fr' | 'ar', StoryChannel[]>> = {};

export function peekCachedStoryChannels(locale: 'fr' | 'ar'): StoryChannel[] | null {
  const hit = storyChannelsCache[locale];
  return hit?.length ? hit : null;
}

export function invalidateStoryChannelsCache(): void {
  delete storyChannelsCache.fr;
  delete storyChannelsCache.ar;
}

/**
 * Chaînes publiées depuis l’API (remplace le mock si au moins une chaîne renvoyée).
 */
export async function fetchStoryChannels(locale: 'fr' | 'ar'): Promise<StoryChannel[]> {
  const url = buildApiUrl('/api/stories/channels', { locale });
  const json = await httpGetJson<ChannelsApiResponse>(url);
  const raw = json.data?.channels ?? [];
  const out: StoryChannel[] = [];
  for (const ch of raw) {
    const slides = ch.slides
      .map((s) => ({
        id: String(s.id),
        uri: resolvePublicMediaUrl(s.uri),
        durationMs: s.durationMs ?? 5000,
        caption: s.caption ?? undefined,
        linkUrl: s.linkUrl ?? undefined,
      }))
      .filter((s) => isStoryImageUri(s.uri));
    if (slides.length === 0) continue;
    const rawCover = ch.coverUri ? resolvePublicMediaUrl(ch.coverUri) : slides[0]?.uri;
    const coverUri =
      rawCover && isStoryImageUri(rawCover) ? rawCover : slides[0]?.uri;
    out.push({
      id: String(ch.id),
      label: ch.label,
      coverUri,
      slides,
    });
  }
  if (out.length > 0) {
    storyChannelsCache[locale] = out;
  }
  return out;
}

export type StoryAnalyticsEvent =
  | 'feed_impression'
  | 'open'
  | 'slide_view'
  | 'complete'
  | 'cta_click';

/** IDs API (entiers). Les mocks locaux (`story-cdn-1`, etc.) sont ignorés. */
function parseStoryApiId(raw?: string): number | undefined {
  if (raw == null || raw === '') return undefined;
  const t = String(raw).trim();
  if (!/^\d+$/.test(t)) return undefined;
  const n = parseInt(t, 10);
  return n > 0 ? n : undefined;
}

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
  const channelId = parseStoryApiId(opts.channelId);
  const slideId = parseStoryApiId(opts.slideId);

  if (event === 'feed_impression' || event === 'open' || event === 'complete') {
    if (!channelId) return;
  }
  if (event === 'slide_view' || event === 'cta_click') {
    if (!slideId) return;
  }

  try {
    const body: Record<string, unknown> = {
      event,
      viewport: opts.viewport ?? 'mobile',
    };
    if (opts.visitorId) body.visitorId = opts.visitorId;
    if (channelId) body.channelId = channelId;
    if (slideId) body.slideId = slideId;
    const url = buildApiUrl('/api/stories/record-event');
    await httpPostJson<{ success: boolean }, Record<string, unknown>>(url, body);
  } catch {
    /* ignore — KPIs best-effort */
  }
}
