import type { HomeCopyKey } from '@/constants/i18n';
import type { AppNotification } from '@/types/inscriptions';

export function notificationCtaLabelKey(n: AppNotification): HomeCopyKey {
  const meta = (n.metadata ?? {}) as Record<string, unknown>;
  const type = String(n.type ?? '');

  if (
    type === 'school_recommendations_ready' ||
    meta.deep_link === 'school_diagnostic_recommendations'
  ) {
    return 'notifDrawerSeeRecommendations';
  }

  if (type === 'plan_step_completed' || meta.deep_link === 'plan_parcours_step') {
    return 'notifDrawerContinueParcours';
  }

  return 'notifDrawerOpenLink';
}
