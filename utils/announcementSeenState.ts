import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'etawjihi.contestAnnouncements.seen.v1';

/** IDs d’annonces dont l’utilisateur a ouvert la fiche (ou la liste → détail). */
export async function loadSeenAnnouncementIds(): Promise<Set<number>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    const ids = parsed.filter((v): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0);
    return new Set(ids);
  } catch {
    return new Set();
  }
}

export async function persistSeenAnnouncementIds(ids: Set<number>): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...ids].sort((a, b) => a - b)));
  } catch {
    /* noop */
  }
}

export async function markAnnouncementSeenOnDisk(announcementId: number): Promise<Set<number>> {
  if (!Number.isFinite(announcementId) || announcementId <= 0) return new Set();
  const current = await loadSeenAnnouncementIds();
  if (current.has(announcementId)) return current;
  const next = new Set(current);
  next.add(announcementId);
  await persistSeenAnnouncementIds(next);
  return next;
}

export function isAnnouncementUnseen(announcementId: number, seenIds: ReadonlySet<number>): boolean {
  return !seenIds.has(announcementId);
}
