import { buildApiUrl } from '@/constants/api';
import { httpDeleteJson, httpGetJson, httpPostJson } from '@/services/http';

export type PlatformEventKind = 'webinar' | 'live' | 'event';

export type PlatformEventRegistrationPolicy = 'manual' | 'closes_at' | 'when_full' | 'event_end';

export type PlatformEventContactStatus =
  | 'new'
  | 'unreachable'
  | 'whatsapp_sent'
  | 'confirmed'
  | 'cancelled'
  | 'abandoned';

export type PlatformEventAttendanceStatus = 'pending' | 'attended' | 'absent';

export type PlatformEventRegistrationSource = 'etawjihi' | 'external';

export type PlatformEventBrief = {
  id: number;
  kind: PlatformEventKind;
  title: string;
  titleAr?: string | null;
  summary?: string | null;
  startsAt: string;
  endsAt: string;
  timezone: string;
  locationLabel?: string | null;
  /** Présentiel : lien Google Maps (renvoyé par l’API seulement si `kind` = event). */
  locationMapsUrl?: string | null;
  onlineUrl?: string | null;
  connectionLinkPending?: boolean;
  registrationSource?: PlatformEventRegistrationSource;
  externalRegistrationUrl?: string | null;
  registrationInfoMessage?: string | null;
  registrationInfoMessageAr?: string | null;
  maxSeats?: number | null;
  showRegistrationCount: boolean;
  registrationCount: number | null;
  seatsRemaining?: number | null;
  isAtCapacity?: boolean;
  coverImage?: string | null;
  published: boolean;
  isPast: boolean;
  isUpcoming: boolean;
  isLiveNow?: boolean;
  registrationOpen?: boolean;
  registrationPolicy?: PlatformEventRegistrationPolicy;
  establishmentId?: number | null;
  contestAnnouncementId?: number | null;
  descriptionHtml?: string | null;
  descriptionHtmlAr?: string | null;
  registrationClosesAt?: string | null;
  myRegistration?: {
    registeredAt: string;
    presenceConfirmedAt?: string | null;
    contactStatus?: PlatformEventContactStatus;
    attendanceStatus?: PlatformEventAttendanceStatus;
  } | null;
  establishment?: {
    id: number;
    nom: string;
    sigle?: string | null;
    slug?: string | null;
    logo?: string | null;
    ville?: string | null;
  } | null;
  contestAnnouncement?: {
    id: number;
    title: string;
    titleAr?: string | null;
  } | null;
};

function coercePlatformEventBrief(row: PlatformEventBrief): PlatformEventBrief {
  const show = row.showRegistrationCount !== false;
  const max = row.maxSeats;
  const count: number | null = show
    ? typeof row.registrationCount === 'number'
      ? row.registrationCount
      : 0
    : null;
  const seatsRemaining =
    !show
      ? null
      : row.seatsRemaining != null
        ? row.seatsRemaining
        : max != null && max > 0 && typeof count === 'number'
          ? Math.max(0, max - count)
          : null;
  const derivedAtCap = max != null && max > 0 && typeof count === 'number' && count >= max;
  const registrationSource: PlatformEventRegistrationSource =
    row.registrationSource === 'external' ? 'external' : 'etawjihi';
  return {
    ...row,
    showRegistrationCount: show,
    registrationCount: count,
    seatsRemaining,
    isAtCapacity: typeof row.isAtCapacity === 'boolean' ? row.isAtCapacity : derivedAtCap,
    isLiveNow: row.isLiveNow === true,
    registrationOpen: row.registrationOpen !== false,
    registrationPolicy: row.registrationPolicy ?? 'closes_at',
    registrationSource,
    connectionLinkPending: row.connectionLinkPending === true,
    externalRegistrationUrl: row.externalRegistrationUrl ?? null,
    registrationInfoMessage: row.registrationInfoMessage ?? null,
    registrationInfoMessageAr: row.registrationInfoMessageAr ?? null,
    locationMapsUrl:
      typeof row.locationMapsUrl === 'string' && row.locationMapsUrl.trim() !== ''
        ? row.locationMapsUrl.trim()
        : null,
  };
}


type ListResponse = { success: boolean; data: PlatformEventBrief[] };
type ItemResponse = { success: boolean; data: PlatformEventBrief };

export async function fetchPlatformEvents(
  accessToken: string | undefined,
  scope: 'upcoming' | 'past' | 'all' | 'live' = 'upcoming',
  options?: { throwOnError?: boolean },
): Promise<PlatformEventBrief[]> {
  const url = buildApiUrl(`/api/platform-events?scope=${encodeURIComponent(scope)}&limit=80`);
  const headers: HeadersInit = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  try {
    const res = await httpGetJson<ListResponse>(url, { headers });
    return res.success && Array.isArray(res.data) ? res.data.map(coercePlatformEventBrief) : [];
  } catch (e) {
    if (options?.throwOnError) throw e;
    return [];
  }
}

export async function fetchPlatformEventDetail(
  accessToken: string | undefined,
  id: number,
  options?: { throwOnError?: boolean },
): Promise<PlatformEventBrief | null> {
  const url = buildApiUrl(`/api/platform-events/${id}`);
  const headers: HeadersInit = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  try {
    const res = await httpGetJson<ItemResponse>(url, { headers });
    return res.success && res.data ? coercePlatformEventBrief(res.data) : null;
  } catch (e) {
    if (options?.throwOnError) throw e;
    return null;
  }
}

export type PlatformEventRegisterContactBody = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export async function registerPlatformEvent(
  accessToken: string,
  id: number,
  body: PlatformEventRegisterContactBody,
): Promise<PlatformEventBrief | null> {
  const url = buildApiUrl(`/api/platform-events/${id}/register`);
  const res = await httpPostJson<ItemResponse, PlatformEventRegisterContactBody>(url, body, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.success && res.data ? coercePlatformEventBrief(res.data) : null;
}

export async function unregisterPlatformEvent(accessToken: string, id: number): Promise<PlatformEventBrief | null> {
  const url = buildApiUrl(`/api/platform-events/${id}/register`);
  try {
    const res = await httpDeleteJson<ItemResponse>(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.success && res.data ? coercePlatformEventBrief(res.data) : null;
  } catch {
    return null;
  }
}

export async function confirmPresencePlatformEvent(
  accessToken: string,
  id: number,
): Promise<PlatformEventBrief | null> {
  const url = buildApiUrl(`/api/platform-events/${id}/confirm-presence`);
  try {
    const res = await httpPostJson<ItemResponse, Record<string, never>>(url, {}, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.success && res.data ? coercePlatformEventBrief(res.data) : null;
  } catch {
    return null;
  }
}
