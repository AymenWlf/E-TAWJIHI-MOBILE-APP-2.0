import { buildApiUrl, getApiBaseUrl } from '@/constants/api';
import { httpGetJson, httpPostJson } from '@/services/http';
import { getMobileVisitorId } from '@/utils/visitorId';

export type BannerZoneCode = 'top' | 'mid' | 'bottom' | 'mid_square';

export type BannerCreativePublic = {
  id: number;
  imageUrl: string;
  imageUrlMobile?: string | null;
  linkUrl?: string | null;
  label?: string | null;
  goalType?: string;
  destinationUrl?: string | null;
  campaignId?: number | null;
};

function absoluteMediaUrl(raw: string): string {
  const s = raw.trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  const base = getApiBaseUrl().replace(/\/$/, '');
  return s.startsWith('/') ? `${base}${s}` : `${base}/${s}`;
}

/** Image affichée dans l’app : priorité à la créative mobile. */
export function pickBannerCreativeImageUrl(c: BannerCreativePublic): string {
  const m = (c.imageUrlMobile ?? '').trim();
  if (m) return absoluteMediaUrl(m);
  return absoluteMediaUrl(c.imageUrl ?? '');
}

export async function fetchBannersByZone(zoneCode: BannerZoneCode): Promise<BannerCreativePublic[]> {
  const url = buildApiUrl(`/api/banners/by-zone/${encodeURIComponent(zoneCode)}`);
  const res = await httpGetJson<{ success: boolean; data?: { creatives?: BannerCreativePublic[] } }>(url);
  if (!res.success || !Array.isArray(res.data?.creatives)) return [];
  return res.data!.creatives!;
}

export async function recordBannerImpressionNative(opts: {
  slotId: number;
  page?: string;
  position?: number;
}): Promise<void> {
  const visitorId = await getMobileVisitorId();
  const body: Record<string, unknown> = {
    slotId: opts.slotId,
    visitorId,
    viewport: 'mobile',
    clientSurface: 'native_app',
  };
  if (opts.page) body.page = opts.page;
  if (opts.position != null && opts.position >= 1) body.position = opts.position;
  await httpPostJson<{ success: boolean }, Record<string, unknown>>(
    buildApiUrl('/api/banners/record-impression'),
    body,
  );
}

export async function recordBannerClickNative(opts: {
  slotId: number;
  page?: string;
  position?: number;
}): Promise<void> {
  const body: Record<string, unknown> = {
    slotId: opts.slotId,
    viewport: 'mobile',
    clientSurface: 'native_app',
  };
  if (opts.page) body.page = opts.page;
  if (opts.position != null && opts.position >= 1) body.position = opts.position;
  await httpPostJson<{ success: boolean }, Record<string, unknown>>(
    buildApiUrl('/api/banners/record-click'),
    body,
  );
}
