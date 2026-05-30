import { router } from 'expo-router';

import { GLOBAL_WALL_MOBILE_ENABLED, isGlobalWallMobileRoute } from '@/constants/mobileFeatureFlags';
import type { AppNotification } from '@/types/inscriptions';
import { navigateToContestAnnouncement } from '@/utils/contestAnnouncementNavigation';

/** Indique si un bouton d’action peut naviguer (sans pousser de route). */
export function canNavigateFromAppNotification(n: AppNotification): boolean {
  const meta = (n.metadata ?? {}) as Record<string, unknown>;
  const type = String(n.type ?? '');

  if (
    type === 'school_recommendations_ready' ||
    meta.deep_link === 'school_diagnostic_recommendations' ||
    type === 'plan_step_completed' ||
    meta.deep_link === 'plan_parcours_step'
  ) {
    return true;
  }

  if (meta.deep_link === 'referral' || type === 'referral' || type.startsWith('referral_')) {
    return true;
  }

  if (type.startsWith('daily_challenge_') || type === 'daily_challenge') {
    return true;
  }

  if (type === 'welcome') {
    return true;
  }

  if (type === 'platform_service_activated' || meta.deep_link === 'platform_service') {
    return true;
  }

  if (GLOBAL_WALL_MOBILE_ENABLED && type.startsWith('global_wall_')) {
    return true;
  }

  if (meta.deep_link === 'community_qna') {
    const cid = Number(meta.context_id ?? 0);
    const qid = Number(meta.question_id ?? 0);
    return Number.isFinite(cid) && cid > 0 && Number.isFinite(qid) && qid > 0;
  }

  const annId = Number(meta.announcement_id ?? meta.contest_announcement_id ?? 0);
  if (Number.isFinite(annId) && annId > 0) {
    return true;
  }

  const eid = Number(meta.establishment_id ?? 0);
  return Number.isFinite(eid) && eid > 0;
}

/**
 * Navigation depuis une notification (in-app / cloche).
 * Retourne `true` si une route a été poussée.
 */
export function navigateFromAppNotification(n: AppNotification): boolean {
  const meta = (n.metadata ?? {}) as Record<string, unknown>;
  const type = String(n.type ?? '');

  if (
    type === 'school_recommendations_ready' ||
    meta.deep_link === 'school_diagnostic_recommendations'
  ) {
    const route =
      typeof meta.route === 'string' && meta.route.trim() !== '' ? meta.route.trim() : '';
    const code =
      typeof meta.public_code === 'string' && /^[a-f0-9]{32}$/i.test(meta.public_code.trim())
        ? meta.public_code.trim().toLowerCase()
        : '';
    if (route.includes('c=') || code) {
      const c = code || (route.match(/[?&]c=([a-f0-9]{32})/i)?.[1] ?? '').toLowerCase();
      if (c) {
        router.push({
          pathname: '/diagnostic-ecoles/resultats',
          params: { c },
        } as never);
        return true;
      }
    }
    router.push('/diagnostic-ecoles' as never);
    return true;
  }

  if (type === 'plan_step_completed' || meta.deep_link === 'plan_parcours_step') {
    const route =
      typeof meta.route === 'string' && meta.route.trim() !== '' ? meta.route.trim() : '/(tabs)';
    if (isGlobalWallMobileRoute(route)) {
      router.push('/(tabs)' as never);
      return true;
    }
    try {
      router.push(route as never);
      return true;
    } catch {
      return false;
    }
  }

  if (meta.deep_link === 'referral' || type === 'referral' || type.startsWith('referral_')) {
    const route =
      typeof meta.route === 'string' && meta.route.trim() !== ''
        ? meta.route.trim()
        : '/compte/fidelite';
    router.push(route as never);
    return true;
  }

  if (type.startsWith('daily_challenge_') || type === 'daily_challenge') {
    const route =
      typeof meta.route === 'string' && meta.route.trim() !== ''
        ? meta.route.trim()
        : '/daily-challenge';
    router.push(route as never);
    return true;
  }

  if (type === 'welcome') {
    router.push('/(tabs)' as never);
    return true;
  }

  if (type === 'platform_service_activated' || meta.deep_link === 'platform_service') {
    const route =
      typeof meta.route === 'string' && meta.route.trim() !== '' ? meta.route.trim() : '/(tabs)';
    router.push(route as never);
    return true;
  }

  if (type.startsWith('global_wall_')) {
    if (GLOBAL_WALL_MOBILE_ENABLED) {
      router.push('/communaute' as never);
      return true;
    }
    return false;
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

  const annId = Number(meta.announcement_id ?? meta.contest_announcement_id ?? meta.contestId ?? 0);
  if (Number.isFinite(annId) && annId > 0) {
    if (
      type === 'contest_announcement' ||
      type === 'follow_school_new_announcement' ||
      type === 'candidacy_status_changed' ||
      meta.contest_announcement_id != null
    ) {
      navigateToContestAnnouncement(annId, meta);
      return true;
    }
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
