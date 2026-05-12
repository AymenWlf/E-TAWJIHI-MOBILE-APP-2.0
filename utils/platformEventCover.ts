import type { PlatformEventKind } from '@/services/platformEvents';

/**
 * Image de couverture : URL admin si présente, sinon visuel de secours stable par événement (picsum).
 */
export function resolvePlatformEventCoverUri(ev: {
  id: number;
  kind: PlatformEventKind;
  coverImage?: string | null;
}): string {
  const raw = ev.coverImage?.trim();
  if (raw && /^https?:\/\//i.test(raw)) {
    return raw;
  }
  const seed = `tawjihi-m-ev-${ev.id}-${ev.kind}`;
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/450`;
}
