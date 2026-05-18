import { router } from 'expo-router';

import type { AppNotification } from '@/types/inscriptions';

/**
 * Navigation depuis une notification (in-app / cloche).
 * Retourne `true` si une route a été poussée.
 */
export function navigateFromAppNotification(n: AppNotification): boolean {
  const meta = (n.metadata ?? {}) as Record<string, unknown>;

  if (meta.deep_link === 'referral' || String(n.type ?? '').startsWith('referral_')) {
    const route =
      typeof meta.route === 'string' && meta.route.trim() !== ''
        ? meta.route.trim()
        : '/compte/fidelite';
    router.push(route as never);
    return true;
  }

  if (meta.deep_link === 'community_qna') {
    const ct = String(meta.context_type ?? '');
    const cid = Number(meta.context_id ?? 0);
    const qid = Number(meta.question_id ?? 0);
    if (!Number.isFinite(cid) || cid <= 0 || !Number.isFinite(qid) || qid <= 0) {
      return false;
    }
    const q = `qnaQ=${encodeURIComponent(String(qid))}`;
    if (ct === 'establishment') {
      const slug = String(meta.establishment_slug ?? 'fiche').trim() || 'fiche';
      router.push(`/etablissements/${cid}/${encodeURIComponent(slug)}?${q}` as never);
      return true;
    }
    if (ct === 'contest_announcement') {
      router.push(`/inscriptions/${cid}?${q}` as never);
      return true;
    }
    if (ct === 'platform_event') {
      router.push(`/evenements/${cid}?${q}` as never);
      return true;
    }
    if (ct === 'establishment_follow') {
      router.push(`/inscriptions/follow/${cid}?${q}` as never);
      return true;
    }
    if (ct === 'article') {
      return false;
    }
    return false;
  }

  const annId = Number(meta.announcement_id ?? meta.contest_announcement_id ?? 0);
  if (Number.isFinite(annId) && annId > 0) {
    router.push(`/inscriptions/${annId}` as never);
    return true;
  }

  const eid = Number(meta.establishment_id ?? 0);
  if (Number.isFinite(eid) && eid > 0) {
    router.push(`/etablissements/${eid}/fiche` as never);
    return true;
  }

  return false;
}
