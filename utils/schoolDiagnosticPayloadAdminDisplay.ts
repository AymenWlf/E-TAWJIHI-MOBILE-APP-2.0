import {
  FILIERE_BAC_OPTIONS,
  NIVEAU_ETUDE_OPTIONS,
  SPECIALITES_MISSION_LABELS,
} from '@/constants/academicSetup';
import {
  defaultSchoolQuickDiagnosticForm,
  GENDER_OPTIONS,
  HIGHER_ED_TEACHING_LANGUAGE_OPTIONS,
  HOUSING_AWAY_OPTIONS,
  INGENIEUR_MASTER_PATH_OPTIONS,
  LYCEE_PUBLIC_PRIVE_OPTIONS,
  PRIVATE_FEE_BRACKET_OPTIONS,
  RENT_BUDGET_OPTIONS,
  TARGET_STUDY_LEVEL_OPTIONS,
} from '@/constants/schoolQuickDiagnostic';
import {
  pickIdOptionLabel,
  pickLabeledOption,
  type DiagnosticUiLocale,
} from '@/constants/schoolDiagnosticLocale';
import type { SchoolDiagnosticPayloadDisplayContext } from '@/utils/schoolDiagnosticPayloadDisplayContext';

const PAYLOAD_KEY_ORDER = Object.keys(defaultSchoolQuickDiagnosticForm());

const FIELD_LABELS: Record<string, string> = {
  firstName: 'Prénom',
  lastName: 'Nom',
  profileRole: 'Profil (remplissant le formulaire)',
  phone: 'Téléphone',
  cityId: 'Ville de résidence (identifiant API)',
  city: 'Ville de résidence (libellé)',
  studyCityScope: 'Périmètre géographique des études',
  gender: 'Genre',
  studyLevel: 'Niveau / classe actuel(le)',
  bacType: 'Type de baccalauréat',
  lyceePublicPrive: 'Lycée public ou privé',
  bacStream: 'Filière / série (bac marocain)',
  massarCode: 'Code Massar',
  missionSpecialite1: 'Spécialité 1 (bac mission)',
  missionSpecialite2: 'Spécialité 2 (bac mission)',
  missionSpecialite3: 'Spécialité 3 (bac mission)',
  studentCode: 'Code étudiant (bac mission)',
  noteGeneraleTroncCommunSur20: 'Note générale tronc commun (/20)',
  noteGeneralePremiereBacSur20: 'Note régionale / 1re année bac (/20)',
  regionalGradeReceived: 'Note régionale — déjà reçue ?',
  previsionnelRegionalMinSur20: 'Prévisionnel régional — note min (/20)',
  previsionnelRegionalMaxSur20: 'Prévisionnel régional — note max (/20)',
  noteGeneraleSemestre1SecondBacSur20: 'Note 1er semestre 2e année bac (/20)',
  semestre1BacGradeReceived: 'Note S1 bac — déjà reçue ?',
  previsionnelSemestre1BacMinSur20: 'Prévisionnel S1 bac — note min (/20)',
  previsionnelSemestre1BacMaxSur20: 'Prévisionnel S1 bac — note max (/20)',
  bacGradeReceived: 'Note bac finale — déjà reçue ?',
  noteBacFinaleSur20: 'Note bac finale (/20)',
  previsionnelBacNationalMinSur20: 'Prévisionnel bac national — note min (/20)',
  previsionnelBacNationalMaxSur20: 'Prévisionnel bac national — note max (/20)',
  premiereMissionGradeReceived: 'Note Première (mission) — déjà reçue ?',
  previsionnelPremiereMissionMinSur20: 'Prévisionnel Première mission — min (/20)',
  previsionnelPremiereMissionMaxSur20: 'Prévisionnel Première mission — max (/20)',
  semestre1MissionGradeReceived: 'Note S1 Terminale (mission) — déjà reçue ?',
  previsionnelSemestre1MissionMinSur20: 'Prévisionnel S1 mission — min (/20)',
  previsionnelSemestre1MissionMaxSur20: 'Prévisionnel S1 mission — max (/20)',
  noteMissionSecondeSur20: 'Note générale Seconde (mission) (/20)',
  noteMissionPremiereSur20: 'Note générale Première (mission) (/20)',
  noteMissionSemestre1TerminaleSur20: 'Note 1er semestre Terminale (mission) (/20)',
  previsionnelBacMissionMinSur20: 'Prévisionnel bac mission — note min (/20)',
  previsionnelBacMissionMaxSur20: 'Prévisionnel bac mission — note max (/20)',
  prefPublic: 'Souhaite un établissement public',
  prefPrivate: 'Souhaite un établissement privé',
  prefSemiPublic: 'Souhaite un établissement semi-public',
  prefMilitary: 'Souhaite un établissement militaire',
  militaryVeilWearing: 'Établissement militaire — port du voile',
  militaryHeightRequirementMet: 'Établissement militaire — taille minimale déclarée',
  privateIfDreamSchoolRejects: 'Si refus école visée : accepter le privé ?',
  splitPublicYearsThenPrivate: 'Parcours mixte public puis privé (2 ou 3 ans)',
  willingOtherCity: 'Prêt·e à étudier dans une autre ville',
  housingIfAway: 'Mode de logement si études ailleurs',
  willingLiveWithFamily: 'Accepter de vivre chez de la famille sur place',
  willingPayRent: 'Accepter de payer un loyer',
  aloneIfPayingRent: 'Vivre seul·e si loyer',
  budgetRentDreamSchool: 'Budget loyer envisagé (fourchette)',
  privateMonthlyBudgetBracket: 'Budget mensuel privé envisagé',
  considersContests: 'Envisage de préparer les concours',
  contestPrep: 'Préparation aux concours',
  targetStudyLevelIds: 'Niveaux d’études supérieures visés',
  ingenieurMasterPathPreference: 'Master / ingénieur (5 ans) : entrée envisagée',
  acceptedHigherEdLanguages: 'Langues d’enseignement acceptées (études sup.)',
  diplomesSouhaites: 'Diplômes souhaités',
  strongSubjects: 'Matières fortes',
  weakSubjects: 'Matières difficiles',
  attractedSectors: 'Secteurs métiers qui vous attirent',
  excludedSectors: 'Secteurs métiers à écarter',
  preferredStudyCityIds: 'Villes d’études ciblées',
  freeComment: 'Projet professionnel / commentaire libre',
  consentProcessing: 'Consentement au traitement des données',
};

const FIELD_LABELS_AR: Record<string, string> = {
  firstName: 'الاسم الشخصي',
  lastName: 'اسم العائلة',
  profileRole: 'الدور (من يملأ النموذج)',
  phone: 'الهاتف',
  cityId: 'مدينة الإقامة (معرّف)',
  city: 'مدينة الإقامة',
  studyCityScope: 'نطاق المدن للدراسة',
  gender: 'الجنس',
  studyLevel: 'المستوى الدراسي الحالي',
  bacType: 'نوع الباكالوريا',
  lyceePublicPrive: 'ثانوية عمومية أو خاصة',
  bacStream: 'شعبة الباك',
  massarCode: 'رمز مسار',
  missionSpecialite1: 'تخصص 1 (باك فرنسي)',
  missionSpecialite2: 'تخصص 2 (باك فرنسي)',
  missionSpecialite3: 'تخصص 3 (باك فرنسي)',
  studentCode: 'رمز التلميذ (باك فرنسي)',
  noteGeneraleTroncCommunSur20: 'معدل الجذع المشترك (/20)',
  noteGeneralePremiereBacSur20: 'معدل الجهوي / أولى باك (/20)',
  regionalGradeReceived: 'معدل جهوي — مستلم؟',
  previsionnelRegionalMinSur20: 'تقدير جهوي — الحد الأدنى (/20)',
  previsionnelRegionalMaxSur20: 'تقدير جهوي — الحد الأقصى (/20)',
  noteGeneraleSemestre1SecondBacSur20: 'معدل الدورة الأولى ثانية باك (/20)',
  semestre1BacGradeReceived: 'معدل الدورة الأولى — مستلم؟',
  previsionnelSemestre1BacMinSur20: 'تقدير الدورة الأولى — الحد الأدنى (/20)',
  previsionnelSemestre1BacMaxSur20: 'تقدير الدورة الأولى — الحد الأقصى (/20)',
  bacGradeReceived: 'معدل الباك النهائي — مستلم؟',
  noteBacFinaleSur20: 'معدل الباك النهائي (/20)',
  previsionnelBacNationalMinSur20: 'تقدير الباك الوطني — الحد الأدنى (/20)',
  previsionnelBacNationalMaxSur20: 'تقدير الباك الوطني — الحد الأقصى (/20)',
  premiereMissionGradeReceived: 'معدل الأولى (فرنسي) — مستلم؟',
  previsionnelPremiereMissionMinSur20: 'تقدير الأولى — الحد الأدنى (/20)',
  previsionnelPremiereMissionMaxSur20: 'تقدير الأولى — الحد الأقصى (/20)',
  semestre1MissionGradeReceived: 'معدل الدورة الأولى نهائي (فرنسي) — مستلم؟',
  previsionnelSemestre1MissionMinSur20: 'تقدير الدورة الأولى — الحد الأدنى (/20)',
  previsionnelSemestre1MissionMaxSur20: 'تقدير الدورة الأولى — الحد الأقصى (/20)',
  noteMissionSecondeSur20: 'معدل الثانية (فرنسي) (/20)',
  noteMissionPremiereSur20: 'معدل الأولى (فرنسي) (/20)',
  noteMissionSemestre1TerminaleSur20: 'معدل الدورة الأولى نهائي (فرنسي) (/20)',
  previsionnelBacMissionMinSur20: 'تقدير الباك (فرنسي) — الحد الأدنى (/20)',
  previsionnelBacMissionMaxSur20: 'تقدير الباك (فرنسي) — الحد الأقصى (/20)',
  prefPublic: 'يفضّل مؤسسة عمومية',
  prefPrivate: 'يفضّل مؤسسة خاصة',
  prefSemiPublic: 'يفضّل شبه عمومي',
  prefMilitary: 'يفضّل مؤسسة عسكرية',
  militaryVeilWearing: 'عسكري — الحجاب',
  militaryHeightRequirementMet: 'عسكري — الطول الأدنى',
  privateIfDreamSchoolRejects: 'إذا رُفضت: قبول خاص؟',
  splitPublicYearsThenPrivate: 'مسار عمومي ثم خاص',
  willingOtherCity: 'مستعد للدراسة في مدينة أخرى',
  housingIfAway: 'نوع السكن خارج المدينة',
  willingLiveWithFamily: 'السكن لدى العائلة',
  willingPayRent: 'دفع إيجار',
  aloneIfPayingRent: 'العيش وحيداً مع إيجار',
  budgetRentDreamSchool: 'ميزانية الإيجار',
  privateMonthlyBudgetBracket: 'ميزانية شهرية للخاص',
  considersContests: 'التحضير للمباريات',
  contestPrep: 'طريقة التحضير للمباريات',
  targetStudyLevelIds: 'المستويات الدراسية المستهدفة',
  ingenieurMasterPathPreference: 'مسار ماستر / مهندس (5 سنوات)',
  acceptedHigherEdLanguages: 'لغات التدريس المقبولة',
  diplomesSouhaites: 'الشهادات المرغوبة',
  strongSubjects: 'مواد قوية',
  weakSubjects: 'مواد تحتاج دعماً',
  attractedSectors: 'قطاعات تجذبك',
  excludedSectors: 'قطاعات مستبعدة',
  preferredStudyCityIds: 'مدن الدراسة المستهدفة',
  freeComment: 'تعليق / مشروع',
  consentProcessing: 'الموافقة على معالجة البيانات',
};

function fieldLabel(key: string, locale: DiagnosticUiLocale = 'fr'): string {
  if (locale === 'ar') return FIELD_LABELS_AR[key] ?? FIELD_LABELS[key] ?? key;
  return FIELD_LABELS[key] ?? key;
}

function yesNoMap(locale: DiagnosticUiLocale): Record<string, string> {
  return locale === 'ar'
    ? { yes: 'نعم', no: 'لا', depends: 'يعتمد', maybe: 'ربما', unsure: 'غير متأكد', '': '—' }
    : { yes: 'Oui', no: 'Non', depends: 'Ça dépend', maybe: 'Peut-être', unsure: 'Je ne sais pas encore', '': '—' };
}

function profileRoleMap(locale: DiagnosticUiLocale): Record<string, string> {
  return locale === 'ar'
    ? { student: 'تلميذ(ة)', tutor: 'مرافق', '': '—' }
    : { student: 'Élève', tutor: 'Accompagnant (parent, tuteur…)', '': '—' };
}

function studyCityScopeMap(locale: DiagnosticUiLocale): Record<string, string> {
  return locale === 'ar'
    ? { any: 'أي مدينة في المغرب', specific: 'مدن محددة', '': '—' }
    : { any: 'N’importe quelle ville du Maroc', specific: 'Villes ciblées', '': '—' };
}

function bacTypeMap(locale: DiagnosticUiLocale): Record<string, string> {
  return locale === 'ar'
    ? { normal: 'باك مغربي', mission: 'باك فرنسي (ميسيون)', '': '—' }
    : { normal: 'Bac marocain', mission: 'Bac français (mission)', '': '—' };
}

function contestPrepMap(locale: DiagnosticUiLocale): Record<string, string> {
  return locale === 'ar'
    ? { alone: 'بمفردي', center: 'مركز تحضير', online: 'عن بعد', mixed: 'مختلط', '': '—' }
    : { alone: 'En autonomie', center: 'En centre / cours préparatoire', online: 'En ligne', mixed: 'Mixte', '': '—' };
}

function splitPublicPrivateMap(locale: DiagnosticUiLocale): Record<string, string> {
  return locale === 'ar'
    ? {
        public2_then_private: 'سنتان عمومي ثم خاص',
        public3_then_private: '3 سنوات عمومي ثم خاص',
        both_2_or_3: '2 أو 3 سنوات حسب الشعبة',
        no: 'لا يناسبني',
        depends: 'يعتمد',
        '': '—',
      }
    : SPLIT_PUBLIC_PRIVATE;
}

function ingenieurPathMap(locale: DiagnosticUiLocale): Record<string, string> {
  return Object.fromEntries([
    ['', '—'],
    ...INGENIEUR_MASTER_PATH_OPTIONS.map((o) => [o.id, pickIdOptionLabel(INGENIEUR_MASTER_PATH_OPTIONS, o.id, locale)]),
  ]);
}

const YES_NO_DEPENDS: Record<string, string> = {
  yes: 'Oui',
  no: 'Non',
  depends: 'Ça dépend',
  maybe: 'Peut-être',
  unsure: 'Je ne sais pas encore',
  '': '—',
};

const PROFILE_ROLE: Record<string, string> = {
  student: 'Élève',
  tutor: 'Accompagnant (parent, tuteur…)',
  '': '—',
};

const STUDY_CITY_SCOPE: Record<string, string> = {
  any: 'N’importe quelle ville du Maroc',
  specific: 'Villes ciblées',
  '': '—',
};

const BAC_TYPE: Record<string, string> = {
  normal: 'Bac marocain',
  mission: 'Bac français (mission)',
  '': '—',
};

const CONTEST_PREP: Record<string, string> = {
  alone: 'En autonomie',
  center: 'En centre / cours préparatoire',
  online: 'En ligne',
  mixed: 'Mixte',
  '': '—',
};

const INGENIEUR_PATH: Record<string, string> = Object.fromEntries([
  ['', '—'],
  ...(INGENIEUR_MASTER_PATH_OPTIONS ?? []).map((o) => [o.id, o.label]),
]);

const SPLIT_PUBLIC_PRIVATE: Record<string, string> = {
  public2_then_private: '2 ans en public puis suite en privé',
  public3_then_private: '3 ans en public puis suite en privé',
  both_2_or_3: '2 ou 3 ans au public selon la filière',
  no: 'Non, ce parcours ne convient pas',
  depends: 'Ça dépend (écoles / coûts)',
  '': '—',
};

function byIdLabel(
  options: readonly { id: string; label: string; labelAr?: string }[],
  id: string,
  locale: DiagnosticUiLocale,
): string {
  return pickIdOptionLabel(options, id, locale);
}

function byValueLabel(
  options: readonly { value: string; label: string; labelAr?: string }[],
  value: string,
  locale: DiagnosticUiLocale,
): string {
  return pickLabeledOption(options, value, locale);
}

function formatYesNoUnknown(v: string, unknownLabel: string, locale: DiagnosticUiLocale): string {
  const m = yesNoMap(locale);
  if (v === 'yes') return m.yes ?? 'Oui';
  if (v === 'no') return m.no ?? 'Non';
  if (v === 'unsure') return unknownLabel;
  if (v === '') return '—';
  return v;
}

function isEmptyValue(key: string, v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string' && v.trim() === '') return true;
  if (Array.isArray(v) && v.length === 0) return true;
  if (key.startsWith('pref') && (key === 'prefPublic' || key === 'prefPrivate' || key === 'prefSemiPublic' || key === 'prefMilitary')) {
    return v === false;
  }
  return false;
}

function formatPrimitive(key: string, v: unknown, locale: DiagnosticUiLocale): string {
  if (typeof v === 'boolean') {
    return v ? yesNoMap(locale).yes! : yesNoMap(locale).no!;
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    return String(v);
  }
  if (typeof v !== 'string') {
    return JSON.stringify(v);
  }
  const s = v;

  switch (key) {
    case 'profileRole':
      return profileRoleMap(locale)[s] ?? s;
    case 'gender':
      return byValueLabel(GENDER_OPTIONS, s, locale);
    case 'studyCityScope':
      return studyCityScopeMap(locale)[s] ?? s;
    case 'bacType':
      return bacTypeMap(locale)[s] ?? s;
    case 'lyceePublicPrive':
      return byValueLabel(LYCEE_PUBLIC_PRIVE_OPTIONS, s, locale);
    case 'bacStream':
      return byValueLabel(FILIERE_BAC_OPTIONS, s, locale);
    case 'studyLevel':
      return byValueLabel(NIVEAU_ETUDE_OPTIONS, s, locale);
    case 'missionSpecialite1':
    case 'missionSpecialite2':
    case 'missionSpecialite3':
      return (SPECIALITES_MISSION_LABELS ?? {})[s] ?? s;
    case 'militaryVeilWearing':
      return formatYesNoUnknown(s, '—', locale);
    case 'militaryHeightRequirementMet':
      return formatYesNoUnknown(s, locale === 'ar' ? 'لا أعرف' : 'Ne sait pas', locale);
    case 'privateIfDreamSchoolRejects':
    case 'willingOtherCity':
    case 'willingLiveWithFamily':
    case 'willingPayRent':
      return yesNoMap(locale)[s] ?? s;
    case 'aloneIfPayingRent':
      if (s === 'yes') return yesNoMap(locale).yes!;
      if (s === 'no') return yesNoMap(locale).no!;
      return s === '' ? '—' : s;
    case 'budgetRentDreamSchool':
      return byValueLabel(RENT_BUDGET_OPTIONS, s, locale);
    case 'privateMonthlyBudgetBracket':
      return byValueLabel(PRIVATE_FEE_BRACKET_OPTIONS, s, locale);
    case 'regionalGradeReceived':
    case 'semestre1BacGradeReceived':
    case 'bacGradeReceived':
    case 'premiereMissionGradeReceived':
    case 'semestre1MissionGradeReceived':
      return formatYesNoUnknown(s, locale === 'ar' ? 'ليس بعد' : 'Pas encore', locale);
    case 'considersContests':
      return yesNoMap(locale)[s] ?? s;
    case 'contestPrep':
      return contestPrepMap(locale)[s] ?? s;
    case 'ingenieurMasterPathPreference':
      return ingenieurPathMap(locale)[s] ?? s;
    case 'splitPublicYearsThenPrivate':
      return splitPublicPrivateMap(locale)[s] ?? s;
    default:
      return s;
  }
}

function formatArray(
  key: string,
  arr: unknown[],
  ctx?: SchoolDiagnosticPayloadDisplayContext,
): string {
  const locale: DiagnosticUiLocale = ctx?.locale ?? 'fr';
  const strs = arr.map((x) => (typeof x === 'string' || typeof x === 'number' ? String(x).trim() : '')).filter(Boolean);
  if (strs.length === 0) return '—';
  const sep = locale === 'ar' ? ' · ' : ' ; ';

  switch (key) {
    case 'targetStudyLevelIds':
      return strs.map((id) => byIdLabel(TARGET_STUDY_LEVEL_OPTIONS, id, locale)).join(sep);
    case 'acceptedHigherEdLanguages':
      return strs.map((id) => byIdLabel(HIGHER_ED_TEACHING_LANGUAGE_OPTIONS, id, locale)).join(sep);
    case 'housingIfAway':
      return strs.map((id) => byIdLabel(HOUSING_AWAY_OPTIONS, id, locale)).join(sep);
    case 'diplomesSouhaites':
      return strs.join(sep);
    case 'preferredStudyCityIds':
      return strs.map((id) => ctx?.cityById[id] ?? id).join(sep);
    case 'attractedSectors':
    case 'excludedSectors':
      return strs.map((id) => ctx?.sectorById[id] ?? id).join(sep);
    case 'strongSubjects':
    case 'weakSubjects':
      return strs.join(' ; ');
    default:
      return strs.join(' ; ');
  }
}

export type SchoolDiagnosticPayloadRow = { key: string; label: string; value: string };

/**
 * Transforme le payload JSON du diagnostic rapide en lignes lisibles pour l’admin.
 */
export function getSchoolDiagnosticPayloadRows(
  payload: Record<string, unknown> | null | undefined,
  ctx?: SchoolDiagnosticPayloadDisplayContext,
): SchoolDiagnosticPayloadRow[] {
  if (!payload || typeof payload !== 'object') return [];

  const locale: DiagnosticUiLocale = ctx?.locale ?? 'fr';

  const keys = new Set(Object.keys(payload));
  const ordered: string[] = [];
  for (const k of PAYLOAD_KEY_ORDER) {
    if (keys.has(k)) ordered.push(k);
  }
  const rest = [...keys].filter((k) => !ordered.includes(k)).sort();
  ordered.push(...rest);

  const rows: SchoolDiagnosticPayloadRow[] = [];

  for (const key of ordered) {
    const v = payload[key];
    if (isEmptyValue(key, v)) continue;

    const label = fieldLabel(key, locale);

    let value: string;
    if (Array.isArray(v)) {
      value = formatArray(key, v, ctx);
    } else {
      value = formatPrimitive(key, v, locale);
    }

    if (value === '—' && !Array.isArray(v)) continue;

    rows.push({ key, label, value });
  }

  return rows;
}
