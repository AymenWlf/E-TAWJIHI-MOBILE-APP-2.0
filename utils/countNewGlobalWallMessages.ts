import type { GlobalWallPost } from '@/services/globalWall';

/** Compte nouveaux posts / réponses présents dans `after` mais pas dans `before` (sync temps réel). */
export function countNewGlobalWallMessages(before: GlobalWallPost[], after: GlobalWallPost[]): number {
  if (before.length === 0) {
    return 0;
  }
  const oldMap = new Map(before.map((p) => [p.id, p]));
  let added = 0;
  for (const p of after) {
    const op = oldMap.get(p.id);
    if (!op) {
      added += 1 + p.replies.length;
      continue;
    }
    const oldR = new Set(op.replies.map((r) => r.id));
    for (const r of p.replies) {
      if (!oldR.has(r.id)) {
        added += 1;
      }
    }
  }
  return added;
}
