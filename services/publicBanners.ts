import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildApiUrl, getApiBaseUrl } from '@/constants/api';
import { httpGetJson, httpPostJson } from '@/services/http';
import { logAnalytics } from '@/utils/analyticsDebug';
import { getMobileVisitorId } from '@/utils/visitorId';

export type BannerZoneCode = 'top' | 'mid' | 'bottom' | 'mid_square';

export type BannerCreativePublic = {
  id: number;
  variantId?: number;
  slotId?: number;
  slotIndex?: number;
  imageUrl: string;
  imageUrlMobile?: string | null;
  linkUrl?: string | null;
  label?: string | null;
  goalType?: string;
  destinationUrl?: string | null;
  campaignId?: number | null;
};

export type BannerVariantPublic = {
  variantId: number;
  variantIndex: number;
  imageUrl: string | null;
  imageUrlMobile?: string | null;
  linkUrl?: string | null;
  label?: string | null;
  goalType?: string;
  destinationUrl?: string | null;
};

export type BannerSlotPublic = {
  slotId: number;
  slotIndex: number;
  campaignId: number | null;
  goalType?: string;
  destinationUrl?: string | null;
  variants: BannerVariantPublic[];
};

const SLOT_VARIANT_ROT_PREFIX = 'banner_slot_variant_rot_';

function absoluteMediaUrl(raw: string): string {
  const s = raw.trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  const base = getApiBaseUrl().replace(/\/$/, '');
  return s.startsWith('/') ? `${base}${s}` : `${base}/${s}`;
}

/** Image affichée : mobile par défaut ; desktop = `imageUrl` (fallback mobile). */
export function pickBannerCreativeImageUrl(
  c: BannerCreativePublic,
  viewport: 'mobile' | 'desktop' = 'mobile',
): string {
  if (viewport === 'desktop') {
    const d = (c.imageUrl ?? '').trim();
    if (d) return absoluteMediaUrl(d);
    const m = (c.imageUrlMobile ?? '').trim();
    if (m) return absoluteMediaUrl(m);
    return '';
  }
  const m = (c.imageUrlMobile ?? '').trim();
  if (m) return absoluteMediaUrl(m);
  return absoluteMediaUrl(c.imageUrl ?? '');
}

function shuffleCreatives<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j]!;
    copy[j] = tmp!;
  }
  return copy;
}

export async function pickBannerSlotVariant(slot: BannerSlotPublic): Promise<BannerVariantPublic> {
  const variants = slot.variants ?? [];
  if (variants.length === 0) {
    throw new Error('Slot sans variante');
  }
  const key = `${SLOT_VARIANT_ROT_PREFIX}${slot.slotId}`;
  let idx = 0;
  try {
    const stored = await AsyncStorage.getItem(key);
    if (stored !== null && stored !== '') {
      const parsed = parseInt(stored, 10);
      if (!Number.isNaN(parsed)) idx = ((parsed % variants.length) + variants.length) % variants.length;
    }
  } catch {
    // ignore
  }
  const variant = variants[idx]!;
  try {
    await AsyncStorage.setItem(key, String((idx + 1) % variants.length));
  } catch {
    // ignore
  }
  return variant;
}

export function variantToDisplayCreative(
  slot: BannerSlotPublic,
  variant: BannerVariantPublic,
): BannerCreativePublic {
  return {
    id: variant.variantId,
    variantId: variant.variantId,
    slotId: slot.slotId,
    slotIndex: slot.slotIndex,
    imageUrl: variant.imageUrl ?? '',
    imageUrlMobile: variant.imageUrlMobile,
    linkUrl: variant.linkUrl,
    label: variant.label,
    goalType: variant.goalType,
    destinationUrl: variant.destinationUrl ?? slot.destinationUrl ?? null,
    campaignId: slot.campaignId,
  };
}

export async function fetchBannerSlotsByZone(
  zoneCode: BannerZoneCode,
  opts?: { campaignId?: number | null },
): Promise<BannerSlotPublic[]> {
  const campaignId = opts?.campaignId;
  const q =
    typeof campaignId === 'number' && campaignId > 0
      ? `?campaignId=${encodeURIComponent(String(campaignId))}`
      : '';
  const url = buildApiUrl(`/api/banners/by-zone/${encodeURIComponent(zoneCode)}${q}`);
  const res = await httpGetJson<{ success: boolean; data?: { slots?: BannerSlotPublic[] } }>(url);
  if (!res.success || !Array.isArray(res.data?.slots)) return [];
  return res.data.slots;
}

/** Slots mélangés ; une créative par slot (variante choisie à l’affichage). */
export async function fetchBannersByZone(
  zoneCode: BannerZoneCode,
  opts?: { campaignId?: number | null },
): Promise<BannerCreativePublic[]> {
  const slots = await fetchBannerSlotsByZone(zoneCode, opts);
  const shuffled = shuffleCreatives(slots);
  const out: BannerCreativePublic[] = [];
  for (const slot of shuffled) {
    if (!slot.variants?.length) continue;
    const variant = await pickBannerSlotVariant(slot);
    out.push(variantToDisplayCreative(slot, variant));
  }
  return out.filter((c) => pickBannerCreativeImageUrl(c, 'mobile').trim() !== '');
}

export async function recordBannerImpressionNative(opts: {
  variantId: number;
  slotId?: number;
  page?: string;
  position?: number;
  viewport?: 'mobile' | 'desktop';
}): Promise<void> {
  const visitorId = await getMobileVisitorId();
  const body: Record<string, unknown> = {
    variantId: opts.variantId,
    visitorId,
    viewport: opts.viewport ?? 'mobile',
    clientSurface: 'native_app',
    clientNativeApp: true,
  };
  if (opts.slotId != null && opts.slotId > 0) body.slotId = opts.slotId;
  if (opts.page) body.page = opts.page;
  if (opts.position != null && opts.position >= 1) body.position = opts.position;
  logAnalytics('banner impression →', {
    variantId: opts.variantId,
    page: opts.page,
    position: opts.position,
  });
  try {
    await httpPostJson<{ success: boolean }, Record<string, unknown>>(
      buildApiUrl('/api/banners/record-impression'),
      body,
    );
    logAnalytics('banner impression ok', { variantId: opts.variantId });
  } catch (e) {
    logAnalytics('banner impression fail', {
      variantId: opts.variantId,
      error: e instanceof Error ? e.message : String(e),
    });
    throw e;
  }
}

export async function recordBannerClickNative(opts: {
  variantId: number;
  slotId?: number;
  page?: string;
  position?: number;
  viewport?: 'mobile' | 'desktop';
}): Promise<void> {
  const body: Record<string, unknown> = {
    variantId: opts.variantId,
    viewport: opts.viewport ?? 'mobile',
    clientSurface: 'native_app',
    clientNativeApp: true,
  };
  if (opts.slotId != null && opts.slotId > 0) body.slotId = opts.slotId;
  if (opts.page) body.page = opts.page;
  if (opts.position != null && opts.position >= 1) body.position = opts.position;
  await httpPostJson<{ success: boolean }, Record<string, unknown>>(
    buildApiUrl('/api/banners/record-click'),
    body,
  );
}
