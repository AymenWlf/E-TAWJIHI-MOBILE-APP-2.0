import { getDiagnosticStepLabels, pickIdOptionLabel } from '@/constants/schoolDiagnosticLocale';
import {
  HIGHER_ED_TEACHING_LANGUAGE_OPTIONS,
  TARGET_STUDY_LEVEL_OPTIONS,
} from '@/constants/schoolQuickDiagnostic';
import type { SchoolDiagnosticRecommendationItem } from '@/services/schoolRecommendationDiagnostic';
import { formatDiagnosticPercent } from '@/utils/diagnosticDisplayText';
import { getDiagnosticTier, tierLabel } from '@/utils/schoolDiagnosticTier';
import { getSchoolDiagnosticPayloadRows } from '@/utils/schoolDiagnosticPayloadAdminDisplay';
import {
  resolveCityNames,
  resolveSectorNames,
  type DiagnosticReportLocale,
  type SchoolDiagnosticPayloadDisplayContext,
} from '@/utils/schoolDiagnosticPayloadDisplayContext';

type DiagnosticTierId = 'recommended' | 'possible' | 'last' | 'avoid';

function tierLabelsForLocale(locale: DiagnosticReportLocale): Record<DiagnosticTierId, string> {
  return {
    recommended: tierLabel('recommended', locale),
    possible: tierLabel('possible', locale),
    lastResort: tierLabel('last', locale),
    avoid: tierLabel('avoid', locale),
  };
}

function getSchoolDiagnosticTier(
  row: Pick<SchoolDiagnosticRecommendationItem, 'combinedScore' | 'bacFiliereCompatible'>,
): DiagnosticTierId {
  const t = getDiagnosticTier(row);
  return t === 'last' ? 'lastResort' : t;
}

export type StoryReportCardKind = 'intro' | 'step' | 'synthesis' | 'cta';

export type StoryReportBullet = { label: string; value: string };

export type StoryChipTone = 'positive' | 'negative' | 'neutral' | 'accent';

export type StoryChipGroup = {
  title: string;
  items: string[];
  tone?: StoryChipTone;
};

export type StoryTopSchool = {
  rank: number;
  name: string;
  sigle?: string;
  ville?: string;
  score: number;
  tier: 'recommended' | 'possible' | 'last' | 'avoid';
};

export type StoryReportCard = {
  kind: StoryReportCardKind;
  stepIndex?: number;
  stepNumber?: number;
  stepTotal?: number;
  title: string;
  subtitle?: string;
  highlight?: string;
  bullets: StoryReportBullet[];
  /** Puces visuelles (villes, secteurs…) */
  chipGroups?: StoryChipGroup[];
  /** Lecture analytique courte */
  insights?: string[];
  /** Top 3 établissements (carte synthèse). */
  topSchools?: StoryTopSchool[];
  badge?: string;
};

const STEP_SUBTITLES_FR = [
  'Qui êtes-vous et comment vous joindre ?',
  'Votre niveau, bac et filière actuels',
  'Vos notes — une estimation suffit',
  'Public, privé, semi-public ou militaire',
  'Où et comment envisagez-vous d’étudier ?',
  'Concours et préparation',
  'Projet d’études, secteurs et matières',
] as const;

const STEP_SUBTITLES_AR = [
  'من أنت وكيف نتواصل معك؟',
  'مستواك وباكك والشعبة الحالية',
  'نقطك — تقدير كافٍ',
  'عمومي، خاص، شبه عمومي أو عسكري',
  'أين وكيف تتصور دراستك؟',
  'المباريات والتحضير',
  'مشروع الدراسة والقطاعات والمواد',
] as const;

const STORY_STEP_FIELD_KEYS: readonly string[][] = [
  ['firstName', 'lastName', 'profileRole', 'phone', 'city', 'gender'],
  [
    'studyLevel',
    'bacType',
    'lyceePublicPrive',
    'bacStream',
    'massarCode',
    'missionSpecialite1',
    'missionSpecialite2',
    'missionSpecialite3',
    'studentCode',
  ],
  [
    'noteGeneraleTroncCommunSur20',
    'noteGeneralePremiereBacSur20',
    'regionalGradeReceived',
    'previsionnelRegionalMinSur20',
    'previsionnelRegionalMaxSur20',
    'noteGeneraleSemestre1SecondBacSur20',
    'semestre1BacGradeReceived',
    'previsionnelSemestre1BacMinSur20',
    'previsionnelSemestre1BacMaxSur20',
    'bacGradeReceived',
    'noteBacFinaleSur20',
    'previsionnelBacNationalMinSur20',
    'previsionnelBacNationalMaxSur20',
    'noteMissionSecondeSur20',
    'noteMissionPremiereSur20',
    'premiereMissionGradeReceived',
    'previsionnelPremiereMissionMinSur20',
    'previsionnelPremiereMissionMaxSur20',
    'noteMissionSemestre1TerminaleSur20',
    'semestre1MissionGradeReceived',
    'previsionnelSemestre1MissionMinSur20',
    'previsionnelSemestre1MissionMaxSur20',
    'previsionnelBacMissionMinSur20',
    'previsionnelBacMissionMaxSur20',
  ],
  [
    'prefPublic',
    'prefPrivate',
    'prefSemiPublic',
    'prefMilitary',
    'militaryVeilWearing',
    'militaryHeightRequirementMet',
    'privateIfDreamSchoolRejects',
    'splitPublicYearsThenPrivate',
  ],
  [
    'studyCityScope',
    'preferredStudyCityIds',
    'willingLiveWithFamily',
    'budgetRentDreamSchool',
    'privateMonthlyBudgetBracket',
  ],
  ['considersContests', 'contestPrep'],
  [
    'targetStudyLevelIds',
    'ingenieurMasterPathPreference',
    'acceptedHigherEdLanguages',
    'diplomesSouhaites',
    'strongSubjects',
    'weakSubjects',
    'attractedSectors',
    'excludedSectors',
    'freeComment',
    'consentProcessing',
  ],
];

const COPY = {
  fr: {
    introTitle: 'Votre rapport de diagnostic',
    introSub: 'Synthèse personnalisée de vos réponses',
    introSubYear: (y: string) => `Année scolaire de référence : ${y}`,
    introDefault:
      'Votre profil a été analysé par notre algorithme de filtrage',
    introIa: ' et enrichi par l’intelligence artificielle',
    introSuffix: '. Parcourez chaque étape puis la synthèse des établissements.',
    stepsLabel: 'Étapes du questionnaire',
    stepsValue: (n: number) => `${n} sections récapitulées`,
    schoolsLabel: 'Établissements évalués',
    schoolsValue: (n: number) => `${n} fiches comparées`,
    schoolsEmpty: 'Classement en cours de chargement',
    iaLabel: 'Analyse IA',
    iaOn: 'Activée — avis qualitatifs intégrés',
    iaOff: 'Non disponible — scores algorithmiques uniquement',
    noData: 'Aucune donnée saisie pour cette section',
    badgeIntro: 'Introduction',
    badgeStep: (a: number, b: number) => `Étape ${a} / ${b}`,
    synthesisTitle: 'Synthèse algorithmique & IA',
    synthesisSub: 'Filtrage, scores d’adéquation et lecture globale',
    synthesisBadgeIa: 'Algorithme + IA',
    synthesisBadgeAlgo: 'Algorithme',
    ctaTitle: 'Rapport complet',
    ctaSub: 'Classement détaillé et export PDF',
    swipeHint: 'Glissez pour continuer',
    citiesTarget: 'Villes d’études visées',
    citiesOpen: 'Mobilité nationale',
    citiesOpenInsight:
      'Vous restez ouvert·e à toutes les villes du Maroc : le classement privilégiera l’adéquation filière plutôt que la géographie.',
    citiesTargetInsight: (n: number) =>
      `Ciblage sur ${n} ville${n > 1 ? 's' : ''} : les établissements hors zone perdront en pertinence géographique.`,
    sectorsAttract: 'Secteurs qui vous attirent',
    sectorsExclude: 'Secteurs à écarter',
    subjectsStrong: 'Matières fortes',
    subjectsWeak: 'Matières à renforcer',
    sectorsAttractInsight: (n: number) =>
      `${n} secteur${n > 1 ? 's' : ''} d’intérêt : l’algorithme favorise les écoles alignées sur ces domaines.`,
    sectorsExcludeInsight: (n: number) =>
      `${n} secteur${n > 1 ? 's' : ''} écarté${n > 1 ? 's' : ''} volontairement pour affiner les recommandations.`,
    projectComment: 'Votre projet en quelques mots',
    targetLevels: 'Niveaux d’études visés',
    targetLanguages: 'Langues d’enseignement acceptées',
    targetDiplomas: 'Diplômes souhaités',
    matchRate: 'Taux de compatibilité moyen',
    topSchools: 'Meilleures adéquations',
  },
  ar: {
    introTitle: 'تقرير التشخيص الخاص بك',
    introSub: 'ملخص مخصص لإجاباتك',
    introSubYear: (y: string) => `السنة الدراسية المرجعية: ${y}`,
    introDefault: 'تم تحليل ملفك بواسطة خوارزمية التصفية',
    introIa: ' مع تعزيز بالذكاء الاصطناعي',
    introSuffix: '. تصفح كل مرحلة ثم ملخص المؤسسات.',
    stepsLabel: 'مراحل الاستبيان',
    stepsValue: (n: number) => `${n} أقسام ملخصة`,
    schoolsLabel: 'المؤسسات المقيّمة',
    schoolsValue: (n: number) => `${n} ملف مقارن`,
    schoolsEmpty: 'الترتيب قيد التحميل',
    iaLabel: 'تحليل الذكاء الاصطناعي',
    iaOn: 'مفعّل — آراء نوعية مدمجة',
    iaOff: 'غير متاح — درجات الخوارزمية فقط',
    noData: 'لا توجد بيانات لهذا القسم',
    badgeIntro: 'مقدمة',
    badgeStep: (a: number, b: number) => `المرحلة ${a} / ${b}`,
    synthesisTitle: 'ملخص الخوارزمية والذكاء الاصطناعي',
    synthesisSub: 'تصفية، درجات التوافق وقراءة شاملة',
    synthesisBadgeIa: 'خوارزمية + ذكاء',
    synthesisBadgeAlgo: 'خوارزمية',
    ctaTitle: 'التقرير الكامل',
    ctaSub: 'ترتيب مفصل وتصدير PDF',
    swipeHint: 'اسحب للمتابعة',
    citiesTarget: 'مدن الدراسة المستهدفة',
    citiesOpen: 'تنقل وطني',
    citiesOpenInsight:
      'أنت منفتح على جميع مدن المغرب: الترتيب يفضّل ملاءمة الشعبة أكثر من الجغرافيا.',
    citiesTargetInsight: (n: number) =>
      `استهداف ${n} مدينة: المؤسسات خارج المنطقة ستفقد في الأهمية الجغرافية.`,
    sectorsAttract: 'قطاعات تجذبك',
    sectorsExclude: 'قطاعات تستبعدها',
    subjectsStrong: 'مواد قوية',
    subjectsWeak: 'مواد تحتاج دعماً',
    sectorsAttractInsight: (n: number) =>
      `${n} قطاع${n > 1 ? 'ات' : ''} اهتمام: الخوارزمية تفضّل مدارس متوافقة مع هذه المجالات.`,
    sectorsExcludeInsight: (n: number) =>
      `${n} قطاع${n > 1 ? 'ات' : ''} مستبعد${n > 1 ? 'ة' : ''} طوعاً لتحسين التوصيات.`,
    projectComment: 'مشروعك باختصار',
    targetLevels: 'المستويات الدراسية المستهدفة',
    targetLanguages: 'لغات التدريس المقبولة',
    targetDiplomas: 'الشهادات المرغوبة',
    matchRate: 'متوسط نسبة التوافق',
    topSchools: 'أفضل التوافقات',
  },
} as const;

function t(locale: DiagnosticReportLocale) {
  return COPY[locale];
}

function establishmentLabel(
  row: SchoolDiagnosticRecommendationItem,
  locale: DiagnosticReportLocale,
): string {
  const rtl = locale === 'ar';
  const name =
    rtl && row.nomArabe?.trim() ? row.nomArabe.trim() : row.nom;
  const s = row.sigle?.trim();
  return s ? (rtl ? `${name} — ${s}` : `${s} — ${name}`) : name;
}

function toStoryTopSchool(
  row: SchoolDiagnosticRecommendationItem,
  rank: number,
  locale: DiagnosticReportLocale,
): StoryTopSchool {
  const rtl = locale === 'ar';
  const name =
    rtl && row.nomArabe?.trim() ? row.nomArabe.trim() : row.nom;
  return {
    rank,
    name,
    sigle: row.sigle?.trim() || undefined,
    ville: row.ville?.trim() || undefined,
    score: Math.round(row.combinedScore),
    tier: getDiagnosticTier(row),
  };
}

function bulletsForStepKeys(
  payload: Record<string, unknown>,
  keys: readonly string[],
  ctx?: SchoolDiagnosticPayloadDisplayContext,
  omitKeys: Set<string> = new Set(),
): StoryReportBullet[] {
  const rows = getSchoolDiagnosticPayloadRows(payload, ctx);
  const keySet = new Set(keys);
  return rows
    .filter((r) => keySet.has(r.key) && !omitKeys.has(r.key))
    .map((r) => ({ label: r.label, value: r.value }));
}

function countByTier(recommendations: SchoolDiagnosticRecommendationItem[]): Record<DiagnosticTierId, number> {
  const counts: Record<DiagnosticTierId, number> = {
    recommended: 0,
    possible: 0,
    lastResort: 0,
    avoid: 0,
  };
  for (const r of recommendations) {
    counts[getSchoolDiagnosticTier(r)] += 1;
  }
  return counts;
}

function strArr(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === 'string' || typeof x === 'number' ? String(x).trim() : ''))
    .filter(Boolean);
}

function labelsFromOptions(
  options: readonly { id: string; label: string; labelAr?: string }[],
  ids: string[],
  locale: DiagnosticReportLocale,
): string[] {
  return ids.map((id) => pickIdOptionLabel(options, id, locale)).filter(Boolean);
}

function isYesNoValue(value: string): boolean {
  const v = value.trim().toLowerCase();
  return /^(oui|non|yes|no|نعم|لا)$/.test(v);
}

function isPositiveYes(value: string): boolean {
  const v = value.trim().toLowerCase();
  return v === 'oui' || v === 'yes' || v === 'نعم';
}

function buildEstablishmentPrefsCard(
  payload: Record<string, unknown>,
  stepIndex: number,
  stepTotal: number,
  locale: DiagnosticReportLocale,
  ctx?: SchoolDiagnosticPayloadDisplayContext,
): StoryReportCard {
  const c = t(locale);
  const bullets = bulletsForStepKeys(payload, STORY_STEP_FIELD_KEYS[stepIndex] ?? [], ctx);
  const activePrefs: string[] = [];
  const inactivePrefs: string[] = [];
  const otherBullets: StoryReportBullet[] = [];

  for (const b of bullets) {
    if (isYesNoValue(b.value)) {
      (isPositiveYes(b.value) ? activePrefs : inactivePrefs).push(b.label);
    } else {
      otherBullets.push(b);
    }
  }

  const chipGroups: StoryChipGroup[] = [];
  if (activePrefs.length > 0) {
    chipGroups.push({
      title: locale === 'ar' ? 'أنواع مقبولة' : 'Types retenus',
      items: activePrefs,
      tone: 'positive',
    });
  }
  if (inactivePrefs.length > 0) {
    chipGroups.push({
      title: locale === 'ar' ? 'غير محددة' : 'Non retenus',
      items: inactivePrefs,
      tone: 'neutral',
    });
  }

  return {
    kind: 'step',
    stepIndex,
    stepNumber: stepIndex + 1,
    stepTotal,
    title: getDiagnosticStepLabels(locale)[stepIndex] ?? `Étape ${stepIndex + 1}`,
    subtitle: locale === 'ar' ? STEP_SUBTITLES_AR[stepIndex] : STEP_SUBTITLES_FR[stepIndex],
    bullets: otherBullets.length > 0 ? otherBullets : bullets.length > 0 ? [] : [{ label: '—', value: c.noData }],
    chipGroups: chipGroups.length > 0 ? chipGroups : undefined,
    insights:
      activePrefs.length > 0
        ? [
            locale === 'ar'
              ? `أولوية لـ ${activePrefs.length} نوع${activePrefs.length > 1 ? 'ات' : ''} من المؤسسات.`
              : `Priorité donnée à ${activePrefs.length} type${activePrefs.length > 1 ? 's' : ''} d’établissement.`,
          ]
        : undefined,
    badge: c.badgeStep(stepIndex + 1, stepTotal),
  };
}

function buildMobilityCard(
  payload: Record<string, unknown>,
  stepIndex: number,
  stepTotal: number,
  locale: DiagnosticReportLocale,
  ctx?: SchoolDiagnosticPayloadDisplayContext,
): StoryReportCard {
  const c = t(locale);
  const scope = String(payload.studyCityScope ?? '');
  const cityIds = strArr(payload.preferredStudyCityIds);
  const cityNames = resolveCityNames(cityIds, ctx);
  const chipGroups: StoryChipGroup[] = [];
  const insights: string[] = [];

  if (scope === 'any') {
    chipGroups.push({ title: c.citiesOpen, items: [locale === 'ar' ? 'كل المدن' : 'Tout le Maroc'], tone: 'accent' });
    insights.push(c.citiesOpenInsight);
  } else if (cityNames.length > 0) {
    chipGroups.push({ title: c.citiesTarget, items: cityNames, tone: 'neutral' });
    insights.push(c.citiesTargetInsight(cityNames.length));
  }

  const omit = new Set(['preferredStudyCityIds', 'studyCityScope']);
  const bullets = bulletsForStepKeys(payload, STORY_STEP_FIELD_KEYS[stepIndex] ?? [], ctx, omit);

  return {
    kind: 'step',
    stepIndex,
    stepNumber: stepIndex + 1,
    stepTotal,
    title: getDiagnosticStepLabels(locale)[stepIndex] ?? `Étape ${stepIndex + 1}`,
    subtitle: locale === 'ar' ? STEP_SUBTITLES_AR[stepIndex] : STEP_SUBTITLES_FR[stepIndex],
    bullets: bullets.length > 0 ? bullets : [{ label: '—', value: c.noData }],
    chipGroups: chipGroups.length > 0 ? chipGroups : undefined,
    insights: insights.length > 0 ? insights : undefined,
    badge: c.badgeStep(stepIndex + 1, stepTotal),
  };
}

function buildProjectCard(
  payload: Record<string, unknown>,
  stepIndex: number,
  stepTotal: number,
  locale: DiagnosticReportLocale,
  ctx?: SchoolDiagnosticPayloadDisplayContext,
): StoryReportCard {
  const c = t(locale);
  const targetLevels = labelsFromOptions(
    TARGET_STUDY_LEVEL_OPTIONS,
    strArr(payload.targetStudyLevelIds),
    locale,
  );
  const languages = labelsFromOptions(
    HIGHER_ED_TEACHING_LANGUAGE_OPTIONS,
    strArr(payload.acceptedHigherEdLanguages),
    locale,
  );
  const diplomas = strArr(payload.diplomesSouhaites);
  const attracted = resolveSectorNames(strArr(payload.attractedSectors), ctx);
  const excluded = resolveSectorNames(strArr(payload.excludedSectors), ctx);
  const strong = strArr(payload.strongSubjects);
  const weak = strArr(payload.weakSubjects);
  const freeComment = String(payload.freeComment ?? '').trim();

  const chipGroups: StoryChipGroup[] = [];
  const insights: string[] = [];

  if (targetLevels.length > 0) {
    chipGroups.push({ title: c.targetLevels, items: targetLevels, tone: 'accent' });
    insights.push(
      locale === 'ar'
        ? `تستهدف ${targetLevels.length} مسار${targetLevels.length > 1 ? 'ات' : ''} دراسي${targetLevels.length > 1 ? 'ة' : ''} بعد الباك.`
        : `${targetLevels.length} niveau${targetLevels.length > 1 ? 'x' : ''} d’études visé${targetLevels.length > 1 ? 's' : ''} : l’algorithme priorise les formations compatibles.`,
    );
  }
  if (diplomas.length > 0) {
    chipGroups.push({ title: c.targetDiplomas, items: diplomas, tone: 'neutral' });
  }
  if (languages.length > 0) {
    chipGroups.push({ title: c.targetLanguages, items: languages, tone: 'neutral' });
  }
  if (attracted.length > 0) {
    chipGroups.push({ title: c.sectorsAttract, items: attracted, tone: 'positive' });
    insights.push(c.sectorsAttractInsight(attracted.length));
  }
  if (excluded.length > 0) {
    chipGroups.push({ title: c.sectorsExclude, items: excluded, tone: 'negative' });
    insights.push(c.sectorsExcludeInsight(excluded.length));
  }
  if (strong.length > 0) {
    chipGroups.push({ title: c.subjectsStrong, items: strong, tone: 'positive' });
  }
  if (weak.length > 0) {
    chipGroups.push({ title: c.subjectsWeak, items: weak, tone: 'negative' });
  }

  const omit = new Set([
    'targetStudyLevelIds',
    'acceptedHigherEdLanguages',
    'diplomesSouhaites',
    'ingenieurMasterPathPreference',
    'attractedSectors',
    'excludedSectors',
    'strongSubjects',
    'weakSubjects',
    'freeComment',
    'consentProcessing',
  ]);
  const bullets = bulletsForStepKeys(payload, STORY_STEP_FIELD_KEYS[stepIndex] ?? [], ctx, omit);

  return {
    kind: 'step',
    stepIndex,
    stepNumber: stepIndex + 1,
    stepTotal,
    title: getDiagnosticStepLabels(locale)[stepIndex] ?? `Étape ${stepIndex + 1}`,
    subtitle: locale === 'ar' ? STEP_SUBTITLES_AR[stepIndex] : STEP_SUBTITLES_FR[stepIndex],
    highlight: freeComment || undefined,
    bullets: bullets.length > 0 ? bullets : [{ label: '—', value: c.noData }],
    chipGroups: chipGroups.length > 0 ? chipGroups : undefined,
    insights: insights.length > 0 ? insights : undefined,
    badge: c.badgeStep(stepIndex + 1, stepTotal),
  };
}

export type BuildSchoolDiagnosticStoryReportInput = {
  payload: Record<string, unknown>;
  profileSummary?: string | null;
  globalComment?: string | null;
  academicYearLabel?: string | null;
  grokAvailable: boolean;
  recommendations: SchoolDiagnosticRecommendationItem[];
  displayContext?: SchoolDiagnosticPayloadDisplayContext;
  locale?: DiagnosticReportLocale;
};

export function buildSchoolDiagnosticStoryReport(
  input: BuildSchoolDiagnosticStoryReportInput,
): StoryReportCard[] {
  const {
    payload,
    profileSummary,
    globalComment,
    academicYearLabel,
    grokAvailable,
    recommendations: recommendationsRaw,
    displayContext,
    locale: localeIn,
  } = input;
  const locale = localeIn ?? displayContext?.locale ?? 'fr';
  const c = t(locale);
  const ctx = displayContext;
  const recommendations = recommendationsRaw ?? [];
  const cards: StoryReportCard[] = [];
  const stepTotal = getDiagnosticStepLabels(locale).length;

  const introHighlight =
    profileSummary?.trim() ||
    c.introDefault + (grokAvailable ? c.introIa : '') + c.introSuffix;

  cards.push({
    kind: 'intro',
    title: c.introTitle,
    subtitle: academicYearLabel ? c.introSubYear(academicYearLabel) : c.introSub,
    highlight: introHighlight,
    bullets: [
      { label: c.stepsLabel, value: c.stepsValue(stepTotal) },
      {
        label: c.schoolsLabel,
        value:
          recommendations.length > 0
            ? c.schoolsValue(recommendations.length)
            : c.schoolsEmpty,
      },
      { label: c.iaLabel, value: grokAvailable ? c.iaOn : c.iaOff },
    ],
    badge: c.badgeIntro,
  });

  STORY_STEP_FIELD_KEYS.forEach((keys, stepIndex) => {
    if (stepIndex === 3) {
      cards.push(buildEstablishmentPrefsCard(payload, stepIndex, stepTotal, locale, ctx));
      return;
    }
    if (stepIndex === 4) {
      cards.push(buildMobilityCard(payload, stepIndex, stepTotal, locale, ctx));
      return;
    }
    if (stepIndex === 6) {
      cards.push(buildProjectCard(payload, stepIndex, stepTotal, locale, ctx));
      return;
    }

    const bullets = bulletsForStepKeys(payload, keys, ctx);
    cards.push({
      kind: 'step',
      stepIndex,
      stepNumber: stepIndex + 1,
      stepTotal,
      title: getDiagnosticStepLabels(locale)[stepIndex] ?? `Étape ${stepIndex + 1}`,
      subtitle: locale === 'ar' ? STEP_SUBTITLES_AR[stepIndex] : STEP_SUBTITLES_FR[stepIndex],
      bullets: bullets.length > 0 ? bullets : [{ label: '—', value: c.noData }],
      badge: c.badgeStep(stepIndex + 1, stepTotal),
    });
  });

  const tierCounts = countByTier(recommendations);
  const sorted = [...recommendations].sort((a, b) => b.combinedScore - a.combinedScore);
  const top3 = sorted.slice(0, 3);
  const avgScore =
    sorted.length > 0
      ? Math.round(sorted.reduce((s, r) => s + r.combinedScore, 0) / sorted.length)
      : 0;

  const tierLbl = tierLabelsForLocale(locale);
  const synthesisBullets: StoryReportBullet[] = [
    {
      label: tierLbl.recommended,
      value: `${tierCounts.recommended}`,
    },
    {
      label: tierLbl.possible,
      value: `${tierCounts.possible}`,
    },
    {
      label: `${tierLbl.lastResort} (45–59 %)`,
      value: `${tierCounts.lastResort}`,
    },
    { label: tierLbl.avoid, value: `${tierCounts.avoid}` },
  ];
  if (avgScore > 0) {
    synthesisBullets.unshift({
      label: c.matchRate,
      value: formatDiagnosticPercent(avgScore, locale === 'ar'),
    });
  }
  const synthesisInsights: string[] = [];
  if (tierCounts.recommended > 0) {
    synthesisInsights.push(
      locale === 'ar'
        ? `${tierCounts.recommended} مؤسسة في نطاق «موصى به» — ابدأ بمقارنة هذه القائمة.`
        : `${tierCounts.recommended} établissement${tierCounts.recommended > 1 ? 's' : ''} « recommandé${tierCounts.recommended > 1 ? 's' : '' } » : commencez par comparer cette liste.`,
    );
  }

  cards.push({
    kind: 'synthesis',
    title: c.synthesisTitle,
    subtitle: c.synthesisSub,
    highlight: globalComment?.trim() || undefined,
    bullets: synthesisBullets,
    topSchools:
      top3.length > 0 ? top3.map((r, i) => toStoryTopSchool(r, i + 1, locale)) : undefined,
    insights: synthesisInsights.length > 0 ? synthesisInsights : undefined,
    badge: grokAvailable ? c.synthesisBadgeIa : c.synthesisBadgeAlgo,
  });

  cards.push({
    kind: 'cta',
    title: c.ctaTitle,
    subtitle: c.ctaSub,
    bullets: [
      {
        label: locale === 'ar' ? 'الترتيب' : 'Classement',
        value:
          locale === 'ar'
            ? 'قائمة كاملة مع النسب والمعايير'
            : 'Liste complète avec pourcentages et critères',
      },
      {
        label: 'PDF',
        value:
          locale === 'ar'
            ? 'طباعة المتصفح — حفظ PDF'
            : 'Impression navigateur — enregistrer en PDF',
      },
    ],
    badge: locale === 'ar' ? 'التالي' : 'Suite',
  });

  return cards;
}
