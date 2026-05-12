import AsyncStorage from '@react-native-async-storage/async-storage';

import type { EstablishmentFollow } from '@/types/inscriptions';
import { getAnnouncementTypeStyle } from '@/utils/announcementTypeStyle';

const STORAGE_KEY = 'etawjihi.follow.latestAnnouncementSeen.v1';

export type FollowLatestSeenMap = Record<string, number>;

export async function loadFollowLatestSeenMap(): Promise<FollowLatestSeenMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: FollowLatestSeenMap = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      const id = typeof v === 'number' ? v : Number(v);
      if (Number.isFinite(id)) out[k] = id;
    }
    return out;
  } catch {
    return {};
  }
}

export async function saveFollowLatestSeenMap(map: FollowLatestSeenMap): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* AsyncStorage peut échouer (quota, web) : l’UI reste cohérente sans persistance. */
  }
}

/** Mise à jour disque seule (ex. ouverture d’annonce depuis la timeline école). */
export async function updateLatestSeenOnDisk(followId: number, announcementId: number): Promise<void> {
  const cur = await loadFollowLatestSeenMap();
  const next = { ...cur, [String(followId)]: announcementId };
  await saveFollowLatestSeenMap(next);
}

/**
 * Pour chaque suivi encore absent de la map : enregistre l’id de la dernière
 * annonce actuelle comme « déjà vu » — ainsi seules les **futures** annonces
 * remontées en « dernière » déclenchent une action requise.
 * Retire les clés dont le follow n’existe plus.
 */
export function mergeDefaultSeenForFollows(
  follows: EstablishmentFollow[],
  current: FollowLatestSeenMap,
): { map: FollowLatestSeenMap; changed: boolean } {
  const map: FollowLatestSeenMap = { ...current };
  let changed = false;
  const valid = new Set<string>();
  for (const f of follows) {
    const k = String(f.id);
    valid.add(k);
    if (!(k in map)) {
      map[k] = f.latestAnnouncement?.id ?? 0;
      changed = true;
    }
  }
  for (const k of Object.keys(map)) {
    if (!valid.has(k)) {
      delete map[k];
      changed = true;
    }
  }
  return { map, changed };
}

export function followHasUnseenLatestAnnouncement(
  follow: EstablishmentFollow,
  seenMap: FollowLatestSeenMap | null,
): boolean {
  if (!seenMap || !follow.latestAnnouncement?.id) return false;
  const seen = seenMap[String(follow.id)];
  if (seen === undefined) return false;
  return seen !== follow.latestAnnouncement.id;
}

/**
 * Statut actuel du suivi absent des statuts proposés sur la **dernière**
 * annonce (ex. : nouvelle annonce « résultat » n’autorise plus que « admis »).
 */
export function followStatusMisalignedWithLatestAnnouncement(follow: EstablishmentFollow): boolean {
  const latest = follow.latestAnnouncement;
  if (!latest?.id) return false;
  const allowed = latest.availableStatuses ?? [];
  if (allowed.length === 0) return false;
  const curId = follow.status?.id;
  if (curId == null) return true;
  return !allowed.some((s) => s.id === curId);
}

/**
 * Annonce de type « résultat » publiée après la dernière modification du suivi :
 * incite à relire l’annonce et à mettre à jour le statut (ex. passage à « admis »).
 */
export function followResultAnnouncementNeedsStatusRefresh(follow: EstablishmentFollow): boolean {
  const latest = follow.latestAnnouncement;
  if (!latest?.id) return false;
  const typeKey = getAnnouncementTypeStyle(latest.announcementType).key;
  if (typeKey !== 'result') return false;
  const pubRaw = latest.datePublication || latest.dateStart;
  const pub = Date.parse(pubRaw);
  const upd = Date.parse(follow.updatedAt);
  if (!Number.isFinite(pub) || !Number.isFinite(upd)) return false;
  return pub > upd;
}

/** Action requise : annonce non vue, statut incompatible avec la dernière annonce, ou rappel « résultat ». */
export function followRequiresAttention(
  follow: EstablishmentFollow,
  seenMap: FollowLatestSeenMap | null,
): boolean {
  if (!follow.latestAnnouncement?.id) return false;
  return (
    followHasUnseenLatestAnnouncement(follow, seenMap) ||
    followStatusMisalignedWithLatestAnnouncement(follow) ||
    followResultAnnouncementNeedsStatusRefresh(follow)
  );
}

export function announcementSortTimestampMs(follow: EstablishmentFollow): number {
  const a = follow.latestAnnouncement;
  if (!a) return 0;
  const raw = a.datePublication || a.dateStart;
  const t = Date.parse(raw);
  return Number.isFinite(t) ? t : 0;
}

export function sortFollowsActionRequiredFirst(
  list: EstablishmentFollow[],
  seenMap: FollowLatestSeenMap | null,
): EstablishmentFollow[] {
  return [...list].sort((a, b) => {
    const ua = followRequiresAttention(a, seenMap) ? 1 : 0;
    const ub = followRequiresAttention(b, seenMap) ? 1 : 0;
    if (ub !== ua) return ub - ua;
    return announcementSortTimestampMs(b) - announcementSortTimestampMs(a);
  });
}
