import type { PlanParcoursCompletion } from '@/constants/orientationParcours';

/** Nombre minimum d’écoles à suivre pour valider l’étape « Recommandation et suivi d’écoles ». */
export const RECOMMENDATION_FOLLOW_MIN_COUNT = 3;

export function getRecommendationFollowCount(
  completion: PlanParcoursCompletion | null | undefined,
): number {
  const n = completion?.recommendationFollowCount ?? 0;
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export function isRecommendationParcoursStepComplete(
  completion: PlanParcoursCompletion | null | undefined,
): boolean {
  return completion?.recommendationComplete === true;
}

export function recommendationFollowProgress(completion: PlanParcoursCompletion | null | undefined): {
  current: number;
  required: number;
  remaining: number;
  satisfied: boolean;
} {
  const current = getRecommendationFollowCount(completion);
  const required = RECOMMENDATION_FOLLOW_MIN_COUNT;
  return {
    current,
    required,
    remaining: Math.max(0, required - current),
    satisfied: current >= required,
  };
}

/** Aligné sur `PLAN_PARCOURS_STEP_IDS.recommendation` (évite une dépendance circulaire au chargement). */
export const RECOMMENDATION_PARCOURS_STEP_ID = 'recommendation' as const;

export type RecommendationFollowCopyLocale = 'fr' | 'ar';

function clampFollowCount(n: number): number {
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

/** Indication parcours (feuille d’étapes) — sans placeholders i18n. */
export function formatRecommendationParcoursHint(
  followCount: number,
  locale: RecommendationFollowCopyLocale,
): string {
  const done = clampFollowCount(followCount);
  const goal = RECOMMENDATION_FOLLOW_MIN_COUNT;
  if (locale === 'ar') {
    return `تابع ${goal} مؤسسات موصى بها لإتمام هذه الخطوة (${done}/${goal}).`;
  }
  return `Suivez ${goal} écoles recommandées pour valider cette étape (${done}/${goal}).`;
}

/** Bannière page résultats diagnostic — progression suivi. */
export function formatRecommendationResultsBanner(
  followCount: number,
  locale: RecommendationFollowCopyLocale,
): string {
  const done = clampFollowCount(followCount);
  const goal = RECOMMENDATION_FOLLOW_MIN_COUNT;
  if (locale === 'ar') {
    return `لإتمام المسار: تابع ${goal} مؤسسات موصى بها على الأقل (${done}/${goal}).`;
  }
  return `Pour valider le parcours, suivez ${goal} écoles recommandées (${done}/${goal}).`;
}

export function formatRecommendationResultsBannerDone(
  followCount: number,
  locale: RecommendationFollowCopyLocale,
): string {
  const done = clampFollowCount(followCount);
  if (locale === 'ar') {
    return `تمت الخطوة — تتابع ${done} مؤسسة/مؤسسات موصى بها.`;
  }
  return `Étape validée — vous suivez ${done} école(s) recommandée(s).`;
}

export function formatRecommendationFollowProgressTitle(
  followCount: number,
  locale: RecommendationFollowCopyLocale,
): string {
  const done = clampFollowCount(followCount);
  const goal = RECOMMENDATION_FOLLOW_MIN_COUNT;
  if (locale === 'ar') {
    return `متابعة المؤسسات (${done}/${goal} كحد أدنى)`;
  }
  return `Écoles suivies (${done}/${goal} minimum)`;
}

export function formatRecommendationFollowProgressHint(
  followCount: number,
  locale: RecommendationFollowCopyLocale,
): string {
  const done = clampFollowCount(followCount);
  const goal = RECOMMENDATION_FOLLOW_MIN_COUNT;
  if (locale === 'ar') {
    if (done >= goal) {
      return 'تم إنجاز الحد الأدنى. يمكنك متابعة مؤسسات إضافية دون حد.';
    }
    const left = goal - done;
    return `استخدم زر «متابعة» في كل بطاقة مدرسة (${left} متبقية على الأقل).`;
  }
  if (done >= goal) {
    return 'Objectif parcours atteint. Vous pouvez suivre d’autres écoles sans limite.';
  }
  const left = goal - done;
  return `Utilisez le bouton « Suivre » sur chaque carte (${left} restante${left > 1 ? 's' : ''} minimum).`;
}
