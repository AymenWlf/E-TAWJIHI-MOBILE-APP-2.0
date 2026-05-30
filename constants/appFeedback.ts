import type { ComponentProps } from 'react';
import type FontAwesome from '@expo/vector-icons/FontAwesome';

import type { HomeCopyKey } from '@/constants/i18n';

export type AppFeedbackRatingKey =
  | 'designOverall'
  | 'designNavigation'
  | 'designReadability'
  | 'easeFirstUse'
  | 'easeFindInfo'
  | 'easeForms'
  | 'transFrench'
  | 'transArabic'
  | 'transConsistency'
  | 'recoRelevance'
  | 'recoClarity'
  | 'recoDiagnosticFlow'
  | 'schoolsSearch'
  | 'schoolsAnnouncements'
  | 'schoolsFollowStatus'
  | 'contentHomeParcours'
  | 'contentNotifications'
  | 'techSpeed'
  | 'techStability'
  | 'techBugsFrequency'
  | 'shopBrowse';

export type AppFeedbackTextKey = 'improve' | 'bugs' | 'features';

type FaName = ComponentProps<typeof FontAwesome>['name'];

export type AppFeedbackQuestionDef = {
  key: AppFeedbackRatingKey;
  labelKey: HomeCopyKey;
  descriptionKey: HomeCopyKey;
};

export type AppFeedbackCategoryDef = {
  id: string;
  icon: FaName;
  titleKey: HomeCopyKey;
  descriptionKey: HomeCopyKey;
  questions: AppFeedbackQuestionDef[];
};

export const APP_FEEDBACK_CATEGORIES: AppFeedbackCategoryDef[] = [
  {
    id: 'design',
    icon: 'paint-brush',
    titleKey: 'appFeedbackCatDesign',
    descriptionKey: 'appFeedbackCatDesignDesc',
    questions: [
      { key: 'designOverall', labelKey: 'appFeedbackQDesignOverall', descriptionKey: 'appFeedbackQDesignOverallDesc' },
      { key: 'designNavigation', labelKey: 'appFeedbackQDesignNav', descriptionKey: 'appFeedbackQDesignNavDesc' },
      { key: 'designReadability', labelKey: 'appFeedbackQDesignRead', descriptionKey: 'appFeedbackQDesignReadDesc' },
    ],
  },
  {
    id: 'simplicity',
    icon: 'hand-pointer-o',
    titleKey: 'appFeedbackCatSimplicity',
    descriptionKey: 'appFeedbackCatSimplicityDesc',
    questions: [
      { key: 'easeFirstUse', labelKey: 'appFeedbackQEaseFirst', descriptionKey: 'appFeedbackQEaseFirstDesc' },
      { key: 'easeFindInfo', labelKey: 'appFeedbackQEaseFind', descriptionKey: 'appFeedbackQEaseFindDesc' },
      { key: 'easeForms', labelKey: 'appFeedbackQEaseForms', descriptionKey: 'appFeedbackQEaseFormsDesc' },
    ],
  },
  {
    id: 'translations',
    icon: 'language',
    titleKey: 'appFeedbackCatTranslations',
    descriptionKey: 'appFeedbackCatTranslationsDesc',
    questions: [
      { key: 'transFrench', labelKey: 'appFeedbackQTransFr', descriptionKey: 'appFeedbackQTransFrDesc' },
      { key: 'transArabic', labelKey: 'appFeedbackQTransAr', descriptionKey: 'appFeedbackQTransArDesc' },
      { key: 'transConsistency', labelKey: 'appFeedbackQTransConsist', descriptionKey: 'appFeedbackQTransConsistDesc' },
    ],
  },
  {
    id: 'recommendations',
    icon: 'star',
    titleKey: 'appFeedbackCatRecommendations',
    descriptionKey: 'appFeedbackCatRecommendationsDesc',
    questions: [
      { key: 'recoRelevance', labelKey: 'appFeedbackQRecoRel', descriptionKey: 'appFeedbackQRecoRelDesc' },
      { key: 'recoClarity', labelKey: 'appFeedbackQRecoClear', descriptionKey: 'appFeedbackQRecoClearDesc' },
      { key: 'recoDiagnosticFlow', labelKey: 'appFeedbackQRecoDiag', descriptionKey: 'appFeedbackQRecoDiagDesc' },
    ],
  },
  {
    id: 'schools',
    icon: 'university',
    titleKey: 'appFeedbackCatSchools',
    descriptionKey: 'appFeedbackCatSchoolsDesc',
    questions: [
      { key: 'schoolsSearch', labelKey: 'appFeedbackQSchoolSearch', descriptionKey: 'appFeedbackQSchoolSearchDesc' },
      { key: 'schoolsAnnouncements', labelKey: 'appFeedbackQSchoolAnn', descriptionKey: 'appFeedbackQSchoolAnnDesc' },
      { key: 'schoolsFollowStatus', labelKey: 'appFeedbackQSchoolFollow', descriptionKey: 'appFeedbackQSchoolFollowDesc' },
    ],
  },
  {
    id: 'content',
    icon: 'home',
    titleKey: 'appFeedbackCatContent',
    descriptionKey: 'appFeedbackCatContentDesc',
    questions: [
      { key: 'contentHomeParcours', labelKey: 'appFeedbackQContentHome', descriptionKey: 'appFeedbackQContentHomeDesc' },
      { key: 'contentNotifications', labelKey: 'appFeedbackQContentNotif', descriptionKey: 'appFeedbackQContentNotifDesc' },
    ],
  },
  {
    id: 'technical',
    icon: 'cog',
    titleKey: 'appFeedbackCatTechnical',
    descriptionKey: 'appFeedbackCatTechnicalDesc',
    questions: [
      { key: 'techSpeed', labelKey: 'appFeedbackQTechSpeed', descriptionKey: 'appFeedbackQTechSpeedDesc' },
      { key: 'techStability', labelKey: 'appFeedbackQTechStable', descriptionKey: 'appFeedbackQTechStableDesc' },
      { key: 'techBugsFrequency', labelKey: 'appFeedbackQTechBugs', descriptionKey: 'appFeedbackQTechBugsDesc' },
    ],
  },
  {
    id: 'shop',
    icon: 'shopping-bag',
    titleKey: 'appFeedbackCatShop',
    descriptionKey: 'appFeedbackCatShopDesc',
    questions: [
      { key: 'shopBrowse', labelKey: 'appFeedbackQShop', descriptionKey: 'appFeedbackQShopDesc' },
    ],
  },
];

export const APP_FEEDBACK_RATING_KEYS: AppFeedbackRatingKey[] = APP_FEEDBACK_CATEGORIES.flatMap((c) =>
  c.questions.map((q) => q.key),
);

/** 1 = moyen, 2 = bien, 3 = très bien (stockage API inchangé, plage 1–5 acceptée). */
export const APP_FEEDBACK_SCORE_OPTIONS = [
  { value: 3, labelKey: 'appFeedbackOptionTresBien' as HomeCopyKey },
  { value: 2, labelKey: 'appFeedbackOptionBien' as HomeCopyKey },
  { value: 1, labelKey: 'appFeedbackOptionMoyen' as HomeCopyKey },
] as const;

export const APP_FEEDBACK_SCORE_MIN = 1;
export const APP_FEEDBACK_SCORE_MAX = 3;

export type AppFeedbackTextFieldDef = {
  key: AppFeedbackTextKey;
  labelKey: HomeCopyKey;
  placeholderKey: HomeCopyKey;
  required: boolean;
  minLength: number;
};

export const APP_FEEDBACK_TEXT_FIELDS: AppFeedbackTextFieldDef[] = [
  {
    key: 'improve',
    labelKey: 'appFeedbackTextImprove',
    placeholderKey: 'appFeedbackTextImprovePh',
    required: false,
    minLength: 0,
  },
  {
    key: 'bugs',
    labelKey: 'appFeedbackTextBugs',
    placeholderKey: 'appFeedbackTextBugsPh',
    required: false,
    minLength: 0,
  },
  {
    key: 'features',
    labelKey: 'appFeedbackTextFeatures',
    placeholderKey: 'appFeedbackTextFeaturesPh',
    required: false,
    minLength: 0,
  },
];

export type AppFeedbackRatings = Record<AppFeedbackRatingKey, number | null>;

export type AppFeedbackTexts = Record<AppFeedbackTextKey, string>;

export function emptyAppFeedbackRatings(): AppFeedbackRatings {
  return APP_FEEDBACK_RATING_KEYS.reduce(
    (acc, key) => {
      acc[key] = null;
      return acc;
    },
    {} as AppFeedbackRatings,
  );
}

export function emptyAppFeedbackTexts(): AppFeedbackTexts {
  return { improve: '', bugs: '', features: '' };
}

export function countAnsweredRatings(ratings: AppFeedbackRatings): number {
  return APP_FEEDBACK_RATING_KEYS.filter((k) => {
    const v = ratings[k];
    return (
      typeof v === 'number' &&
      v >= APP_FEEDBACK_SCORE_MIN &&
      v <= APP_FEEDBACK_SCORE_MAX
    );
  }).length;
}

export function isAppFeedbackRatingsComplete(ratings: AppFeedbackRatings): boolean {
  return countAnsweredRatings(ratings) === APP_FEEDBACK_RATING_KEYS.length;
}

export function isAppFeedbackTextsValid(texts: AppFeedbackTexts): boolean {
  return APP_FEEDBACK_TEXT_FIELDS.every((field) => {
    const len = texts[field.key].trim().length;
    return len === 0 || len >= field.minLength;
  });
}
