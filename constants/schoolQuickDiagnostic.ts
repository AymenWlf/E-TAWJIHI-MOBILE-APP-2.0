import { ESTABLISHMENT_DIPLOMES_DELIVRES_OPTIONS } from './establishmentDiplomes';

/** Version du schéma — incrémenter si les champs changent (traçabilité backend). */
export const SCHOOL_QUICK_DIAGNOSTIC_VERSION = '31';

export const SCHOOL_QUICK_DIAGNOSTIC_STORAGE_KEY = 'schoolQuickDiagnosticDraft_v1';

/** Id serveur du brouillon en cours (créé après l’étape Identité) — reprise du formulaire. */
export const SCHOOL_QUICK_DIAGNOSTIC_SERVER_DRAFT_ID_KEY = 'schoolQuickDiagnosticServerDraftId_v1';

/** Code public du brouillon (requis pour PATCH/finalize sans compte). */
export const SCHOOL_QUICK_DIAGNOSTIC_SERVER_DRAFT_PUBLIC_CODE_KEY = 'schoolQuickDiagnosticServerDraftPublicCode_v1';

/** Visite du rapport du diagnostic rapide (plan de réussite — étape 2). */
export const PLAN_REUSSITE_QUICK_DIAG_REPORT_VISITED_KEY = 'planReussite_quickDiagnosticReportVisited';

/** Dernier diagnostic envoyé avec succès (id API + horodatage) — persistance navigateur. */
const SCHOOL_DIAGNOSTIC_LAST_RESULT_STORAGE_KEY = 'schoolDiagnosticLastResult_v1';

export function readServerDraftDiagnosticId(): number | null {
  try {
    const raw = localStorage.getItem(SCHOOL_QUICK_DIAGNOSTIC_SERVER_DRAFT_ID_KEY);
    if (!raw || !/^\d+$/.test(raw)) return null;
    const id = parseInt(raw, 10);
    return Number.isFinite(id) && id >= 1 ? id : null;
  } catch {
    return null;
  }
}

function isValidPublicDiagnosticCode(s: string): boolean {
  return /^[a-f0-9]{32}$/i.test(s.trim());
}

export function readServerDraftDiagnosticPublicCode(): string | null {
  try {
    const raw = localStorage.getItem(SCHOOL_QUICK_DIAGNOSTIC_SERVER_DRAFT_PUBLIC_CODE_KEY);
    if (!raw || !isValidPublicDiagnosticCode(raw)) return null;
    return raw.trim().toLowerCase();
  } catch {
    return null;
  }
}

export function persistServerDraftDiagnosticId(id: number | null, publicCode?: string | null): void {
  try {
    if (id == null || !Number.isFinite(id) || id < 1) {
      localStorage.removeItem(SCHOOL_QUICK_DIAGNOSTIC_SERVER_DRAFT_ID_KEY);
      localStorage.removeItem(SCHOOL_QUICK_DIAGNOSTIC_SERVER_DRAFT_PUBLIC_CODE_KEY);
    } else {
      localStorage.setItem(SCHOOL_QUICK_DIAGNOSTIC_SERVER_DRAFT_ID_KEY, String(id));
      if (publicCode != null && isValidPublicDiagnosticCode(publicCode)) {
        localStorage.setItem(SCHOOL_QUICK_DIAGNOSTIC_SERVER_DRAFT_PUBLIC_CODE_KEY, publicCode.trim().toLowerCase());
      }
    }
  } catch {
    /* ignore */
  }
}

export type PersistedSchoolDiagnosticResult = {
  id: number;
  /** Code opaque (32 hex) — URL et API sans exposer l’id interne. */
  publicCode?: string;
  submittedAt: string;
  userId?: number | null;
};

const SCHOOL_DIAGNOSTIC_LAST_PUBLIC_CODE_KEY = 'schoolDiagnosticLastPublicCode_v1';

export function readPersistedSchoolDiagnosticResult(): PersistedSchoolDiagnosticResult | null {
  try {
    const raw = localStorage.getItem(SCHOOL_DIAGNOSTIC_LAST_RESULT_STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== 'object') return null;
    const id = Number((o as { id?: unknown }).id);
    const submittedAt = String((o as { submittedAt?: unknown }).submittedAt ?? '');
    const pcRaw = (o as { publicCode?: unknown }).publicCode;
    const publicCode =
      typeof pcRaw === 'string' && isValidPublicDiagnosticCode(pcRaw) ? pcRaw.trim().toLowerCase() : undefined;
    if (!Number.isFinite(id) || id < 1) return null;
    return { id, submittedAt: submittedAt || new Date(0).toISOString(), ...(publicCode ? { publicCode } : {}) };
  } catch {
    return null;
  }
}

/** Enregistre le dernier résultat après envoi réussi (localStorage + sessionStorage pour compat. chargement résultats). */
export function persistSchoolDiagnosticResult(id: number, publicCode: string): void {
  const code = publicCode.trim().toLowerCase();
  try {
    const payload: PersistedSchoolDiagnosticResult = {
      id,
      publicCode: code,
      submittedAt: new Date().toISOString(),
    };
    localStorage.setItem(SCHOOL_DIAGNOSTIC_LAST_RESULT_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / mode privé */
  }
  try {
    sessionStorage.setItem('schoolDiagnosticLastId', String(id));
    sessionStorage.setItem(SCHOOL_DIAGNOSTIC_LAST_PUBLIC_CODE_KEY, code);
  } catch {
    /* ignore */
  }
}

/** Note saisie /20 : accepte la virgule décimale ; retourne null si vide ou invalide. */
export function parseNoteSur20(raw: string): number | null {
  const t = raw.trim().replace(',', '.');
  if (t === '') return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  if (n < 0 || n > 20) return null;
  return n;
}

/** Diplômes / durées visés après le bac — sélection multiple (diagnostic rapide). */
export const TARGET_STUDY_LEVEL_OPTIONS: { id: string; label: string; labelAr?: string }[] = [
  { id: 'dip_prof_2', label: 'Diplôme professionnel — 2 ans d’études', labelAr: 'دبلوم مهني — سنتان' },
  { id: 'licence_3', label: 'Diplôme Licence — 3 ans d’études', labelAr: 'إجازة — 3 سنوات' },
  { id: 'bachelor_4', label: 'Bachelor — 4 ans d’études', labelAr: 'بكالوريوس — 4 سنوات' },
  { id: 'master_ingenieur_5', label: 'Diplôme Master ou ingénieur — 5 ans d’études', labelAr: 'ماستر أو مهندس — 5 سنوات' },
  { id: 'architecture_6', label: 'Architecture — 6 ans d’études', labelAr: 'هندسة معمارية — 6 سنوات' },
  {
    id: 'medecine_pharma_dentaire_6',
    label: 'Médecine, pharmacie ou dentaire — 6 ans d’études',
    labelAr: 'طب، صيدلة أو أسنان — 6 سنوات',
  },
];

/** Id du choix « Master ou ingénieur — 5 ans » (question parcours conditionnelle). */
export const TARGET_LEVEL_MASTER_INGENIEUR_ID = 'master_ingenieur_5';

/** Question affichée si « Master ou ingénieur — 5 ans » est coché. */
export const INGENIEUR_MASTER_PATH_QUESTION = {
  title: 'Comment envisagez-vous d’accéder au diplôme ingénieur ou master ?',
  hint: 'Au Maroc, le titre ingénieur (5 ans) passe le plus souvent par une licence (Bac+2), une prépa CPGE ou des concours d’entrée (ENSA, INPT, grandes écoles…). Choisissez la voie qui vous ressemble le plus.',
} as const;

export const INGENIEUR_MASTER_PATH_OPTIONS: {
  id: 'bac2_passerelle' | 'privee_directe_si_non_admis' | 'both' | 'unsure';
  label: string;
  labelAr?: string;
  description: string;
  descriptionAr?: string;
}[] = [
  {
    id: 'bac2_passerelle',
    label: 'Parcours public (Bac+2 puis concours / passerelle)',
    labelAr: 'مسار عمومي (باك+2 ثم مباريات / جسر)',
    description:
      'Licence, DUT ou BTS, puis intégration en école d’ingénieur via concours, prépa ou passerelles (ENSA, INPT, CPGE…).',
    descriptionAr: 'إجازة أو DUT أو BTS ثم مدرسة مهندس عبر مباريات أو تحضيرية.',
  },
  {
    id: 'privee_directe_si_non_admis',
    label: 'École privée si non admis(e) en public',
    labelAr: 'مدرسة خاصة إذا لم أُقبل في العمومي',
    description:
      'Si je ne suis pas retenu(e) dans le public (ENSA, filière sélective…), j’envisage une école d’ingénieur privée ou payante.',
    descriptionAr: 'إذا لم أُقبل في العمومي، أفكر في مدرسة مهندس خاصة.',
  },
  {
    id: 'both',
    label: 'Les deux options restent ouvertes',
    labelAr: 'الخياران مفتوحان',
    description:
      'Je vise d’abord le public (concours, prépa) tout en gardant une solution privée selon mes résultats d’admission.',
    descriptionAr: 'أهدف العمومي مع إبقاء خيار خاص حسب النتائج.',
  },
  {
    id: 'unsure',
    label: 'Pas encore décidé',
    labelAr: 'لم أقرر بعد',
    description: 'Je n’ai pas encore tranché entre passerelle, concours et école privée — besoin d’être orienté(e).',
    descriptionAr: 'ما زلت بين الجسر والمباريات والخاص — أحتاج توجيهاً.',
  },
];

/** Langues / modes d’enseignement acceptés pour les études supérieures (diagnostic rapide). */
export const HIGHER_ED_TEACHING_LANGUAGE_OPTIONS: { id: string; label: string; labelAr?: string }[] = [
  { id: 'french', label: 'Français', labelAr: 'الفرنسية' },
  { id: 'arabic', label: 'Arabe', labelAr: 'العربية' },
  { id: 'english', label: 'Anglais', labelAr: 'الإنجليزية' },
  { id: 'bilingual_fr_en', label: 'Bilingue français / anglais', labelAr: 'ثنائي فرنسي / إنجليزي' },
  { id: 'mixed_ar_fr', label: 'Mixte arabe et français', labelAr: 'مختلط عربي وفرنسي' },
  { id: 'no_preference', label: 'Aucune préférence (toutes options possibles)', labelAr: 'بدون تفضيل' },
];

export type ProfileRole = 'student' | 'tutor' | '';

export type SchoolQuickDiagnosticForm = {
  firstName: string;
  lastName: string;
  profileRole: ProfileRole;
  phone: string;
  /** Identifiant City (API) — sélection liste déroulante */
  cityId: string;
  /** Libellé ville (titre) pour affichage / payload */
  city: string;
  /** Études sup. : n’importe quelle ville du Maroc ou villes ciblées */
  studyCityScope: '' | 'any' | 'specific';
  /** Si studyCityScope === specific : ids City (API /api/cities), sélection multiple */
  preferredStudyCityIds: string[];
  gender: string;

  studyLevel: string;
  /** Comme form/maroc : `normal` = Marocain, `mission` = Mission */
  bacType: '' | 'normal' | 'mission';
  /** Si bac Marocain : lycée public ou privé (comme type_ecole Maroc) */
  lyceePublicPrive: '' | 'Public' | 'Privé';
  /** Filière bac marocain (valeurs alignées formulaire Maroc) */
  bacStream: string;
  /** Bac marocain — code Massar */
  massarCode: string;
  missionSpecialite1: string;
  missionSpecialite2: string;
  missionSpecialite3: string;
  /** Bac mission — code étudiant */
  studentCode: string;

  /** Bac marocain : note générale du tronc commun, /20 */
  noteGeneraleTroncCommunSur20: string;
  /** Bac marocain : note régionale définitive (/20) si `regionalGradeReceived === 'yes'` */
  noteGeneralePremiereBacSur20: string;
  regionalGradeReceived: '' | 'yes' | 'no';
  previsionnelRegionalMinSur20: string;
  previsionnelRegionalMaxSur20: string;
  /** Bac marocain : note S1 définitive (/20) si `semestre1BacGradeReceived === 'yes'` */
  noteGeneraleSemestre1SecondBacSur20: string;
  semestre1BacGradeReceived: '' | 'yes' | 'no';
  previsionnelSemestre1BacMinSur20: string;
  previsionnelSemestre1BacMaxSur20: string;
  /** Avez-vous passé et reçu votre note du baccalauréat national ? */
  bacGradeReceived: '' | 'yes' | 'no';
  /** Note finale du bac national (/20) si `bacGradeReceived === 'yes'` */
  noteBacFinaleSur20: string;
  /** Bac marocain : prévisionnel note min au baccalauréat national, /20 */
  previsionnelBacNationalMinSur20: string;
  /** Bac marocain : prévisionnel note max au baccalauréat national, /20 */
  previsionnelBacNationalMaxSur20: string;
  /** Bac mission : note générale de la Seconde (équivalent tronc commun), /20 */
  noteMissionSecondeSur20: string;
  /** Bac mission : note Première définitive (/20) */
  noteMissionPremiereSur20: string;
  premiereMissionGradeReceived: '' | 'yes' | 'no';
  previsionnelPremiereMissionMinSur20: string;
  previsionnelPremiereMissionMaxSur20: string;
  /** Bac mission : note S1 Terminale définitive (/20) */
  noteMissionSemestre1TerminaleSur20: string;
  semestre1MissionGradeReceived: '' | 'yes' | 'no';
  previsionnelSemestre1MissionMinSur20: string;
  previsionnelSemestre1MissionMaxSur20: string;
  /** Bac mission : prévisionnel note min au baccalauréat, /20 */
  previsionnelBacMissionMinSur20: string;
  /** Bac mission : prévisionnel note max au baccalauréat, /20 */
  previsionnelBacMissionMaxSur20: string;

  prefPublic: boolean;
  prefPrivate: boolean;
  prefSemiPublic: boolean;
  prefMilitary: boolean;
  /** Si militaire + profil féminin : port du voile */
  militaryVeilWearing: '' | 'yes' | 'no';
  /** Si militaire : taille ≥ 1,65 m (femme) ou ≥ 1,70 m (homme) — auto-déclaration */
  militaryHeightRequirementMet: '' | 'yes' | 'no' | 'unsure';

  /** Si non admis dans l’établissement visé : prêt à une école privée ? */
  privateIfDreamSchoolRejects: '' | 'yes' | 'no' | 'depends';
  /** Parcours mixte : X années en public puis fin du cursus en privé */
  splitPublicYearsThenPrivate:
    | ''
    | 'public2_then_private'
    | 'public3_then_private'
    | 'both_2_or_3'
    | 'no'
    | 'depends';

  willingOtherCity: '' | 'yes' | 'no' | 'depends';
  housingIfAway: string[];
  willingLiveWithFamily: '' | 'yes' | 'no' | 'depends';
  willingPayRent: '' | 'yes' | 'no' | 'depends';
  aloneIfPayingRent: '' | 'yes' | 'no' | '';
  budgetRentDreamSchool: string;
  privateMonthlyBudgetBracket: string;

  considersContests: '' | 'yes' | 'no' | 'maybe';
  contestPrep: '' | 'alone' | 'center' | 'online' | 'mixed';

  /** Niveaux d’études supérieures visés (ids — voir TARGET_STUDY_LEVEL_OPTIONS) */
  targetStudyLevelIds: string[];
  /**
   * Si master/ingénieur (5 ans) est visé : parcours envisagé (passerelle Bac+2 vs école privée directe, etc.)
   */
  ingenieurMasterPathPreference: '' | 'bac2_passerelle' | 'privee_directe_si_non_admis' | 'both' | 'unsure';

  /** Langues d’enseignement (études sup.) avec lesquelles l’utilisateur accepte d’étudier — ids HIGHER_ED_TEACHING_LANGUAGE_OPTIONS */
  acceptedHigherEdLanguages: string[];

  /**
   * Diplômes visés après le bac — mêmes libellés que « Diplômes délivrés » (fiche établissement admin).
   * @see ESTABLISHMENT_DIPLOMES_DELIVRES_OPTIONS
   */
  diplomesSouhaites: string[];

  strongSubjects: string[];
  weakSubjects: string[];
  /** Secteurs métiers (ids API `/api/secteurs`) qui attirent — chaînes numériques */
  attractedSectors: string[];
  /** Secteurs métiers (ids API) à écarter */
  excludedSectors: string[];
  freeComment: string;
  consentProcessing: boolean;
};

/** Compatibilité brouillons v1 (champs renommés / valeurs bac). */
export function normalizeSchoolQuickDiagnosticDraft(
  raw: Record<string, unknown>
): Partial<SchoolQuickDiagnosticForm> {
  const out = { ...raw } as Partial<SchoolQuickDiagnosticForm> & { currentSchoolType?: string };
  const bt = out.bacType as string | undefined;
  if (bt === 'national') {
    out.bacType = 'normal';
  }
  if (bt === 'autre') {
    out.bacType = '';
  }
  if (!out.lyceePublicPrive) {
    const cst = out.currentSchoolType;
    if (cst === 'lycee_public') out.lyceePublicPrive = 'Public';
    else if (cst === 'lycee_prive') out.lyceePublicPrive = 'Privé';
  }
  delete out.currentSchoolType;
  if (out.missionSpecialite1 === undefined) out.missionSpecialite1 = '';
  if (out.missionSpecialite2 === undefined) out.missionSpecialite2 = '';
  if (out.missionSpecialite3 === undefined) out.missionSpecialite3 = '';
  if (out.massarCode === undefined) out.massarCode = '';
  if (out.studentCode === undefined) out.studentCode = '';
  if (out.lyceePublicPrive === undefined) out.lyceePublicPrive = '';
  if (out.studyCityScope === undefined) out.studyCityScope = '';
  const coerceCityIdList = (v: unknown): string[] => {
    if (!Array.isArray(v)) return [];
    return v
      .map((x) => (typeof x === 'string' || typeof x === 'number' ? String(x).trim() : ''))
      .filter((s) => s.length > 0 && /^\d+$/.test(s));
  };
  out.preferredStudyCityIds = coerceCityIdList(out.preferredStudyCityIds);
  delete (out as Record<string, unknown>).preferredStudyCitiesText;

  const sl = out.studyLevel;
  if (typeof sl === 'string' && sl) {
    const legacy: Record<string, string> = {
      tronc_commun: '',
      '1ere_bac': '1ère année Baccalauréat',
      '2eme_bac_s1': '2ème année Baccalauréat',
      '2eme_bac_s2': '2ème année Baccalauréat',
      deja_bac: 'BAC+1',
      autre: 'Autre',
    };
    if (legacy[sl] !== undefined) {
      out.studyLevel = legacy[sl];
    }
  }
  const sl2 = out.studyLevel;
  if (typeof sl2 === 'string' && sl2) {
    const fromClassNames: Record<string, string> = {
      Seconde: '',
      Première: '1ère année Baccalauréat',
      Terminale: '2ème année Baccalauréat',
    };
    if (fromClassNames[sl2] !== undefined) {
      out.studyLevel = fromClassNames[sl2];
    }
  }

  const bs = out.bacStream;
  if (typeof bs === 'string' && bs) {
    const legacyStream: Record<string, string> = {
      sciences_math_a: 'Sciences Math A',
      sciences_math_b: 'Sciences Math B',
      sciences_physique: 'Sciences Physique',
      sciences_vie: 'SVT',
      sciences_agronomiques: 'Sciences agronomiques',
      lettres: 'Lettres',
      eco: 'Sciences économique',
      technique: 'Sciences et technologies mécaniques',
      autre: 'Autre',
    };
    if (legacyStream[bs]) {
      out.bacStream = legacyStream[bs];
    }
  }

  delete (out as Record<string, unknown>).bacYear;
  for (const k of [
    'gradeRegional',
    'gradeNationalForecast',
    'gradeTroncCommun',
    'gradeFirstBacYear',
    'gradeSem1SecondBac',
  ]) {
    delete (out as Record<string, unknown>)[k];
  }

  const str = (v: unknown): string => (typeof v === 'string' ? v : '');
  if (out.noteGeneraleTroncCommunSur20 === undefined) out.noteGeneraleTroncCommunSur20 = '';
  if (out.noteGeneralePremiereBacSur20 === undefined) out.noteGeneralePremiereBacSur20 = '';
  if (out.noteGeneraleSemestre1SecondBacSur20 === undefined) out.noteGeneraleSemestre1SecondBacSur20 = '';

  const oldReg = str((out as Record<string, unknown>).noteRegionalSur20);
  const oldNat = str((out as Record<string, unknown>).noteNationalPrevisionnelSur20);
  if (!out.noteGeneraleSemestre1SecondBacSur20.trim() && oldReg.trim()) {
    out.noteGeneraleSemestre1SecondBacSur20 = oldReg;
  }
  if (!out.noteGeneralePremiereBacSur20.trim() && oldNat.trim()) {
    out.noteGeneralePremiereBacSur20 = oldNat;
  }
  delete (out as Record<string, unknown>).noteRegionalSur20;
  delete (out as Record<string, unknown>).noteNationalPrevisionnelSur20;

  if (out.noteMissionSecondeSur20 === undefined) out.noteMissionSecondeSur20 = '';
  if (out.noteMissionPremiereSur20 === undefined) out.noteMissionPremiereSur20 = '';
  if (out.noteMissionSemestre1TerminaleSur20 === undefined) out.noteMissionSemestre1TerminaleSur20 = '';
  const oldMissionTerm = str((out as Record<string, unknown>).noteMissionTerminaleSur20);
  if (!out.noteMissionSemestre1TerminaleSur20.trim() && oldMissionTerm.trim()) {
    out.noteMissionSemestre1TerminaleSur20 = oldMissionTerm;
  }
  delete (out as Record<string, unknown>).noteMissionTerminaleSur20;

  const yn = new Set(['', 'yes', 'no']);
  for (const k of [
    'regionalGradeReceived',
    'semestre1BacGradeReceived',
    'bacGradeReceived',
    'premiereMissionGradeReceived',
    'semestre1MissionGradeReceived',
  ] as const) {
    if ((out as Record<string, unknown>)[k] === undefined) (out as Record<string, unknown>)[k] = '';
    if (!yn.has(String((out as Record<string, unknown>)[k]))) (out as Record<string, unknown>)[k] = '';
  }
  for (const k of [
    'noteBacFinaleSur20',
    'previsionnelRegionalMinSur20',
    'previsionnelRegionalMaxSur20',
    'previsionnelSemestre1BacMinSur20',
    'previsionnelSemestre1BacMaxSur20',
    'previsionnelPremiereMissionMinSur20',
    'previsionnelPremiereMissionMaxSur20',
    'previsionnelSemestre1MissionMinSur20',
    'previsionnelSemestre1MissionMaxSur20',
  ] as const) {
    if ((out as Record<string, unknown>)[k] === undefined) (out as Record<string, unknown>)[k] = '';
  }
  if (!out.regionalGradeReceived && out.noteGeneralePremiereBacSur20?.trim()) {
    out.regionalGradeReceived = 'yes';
  }
  if (!out.semestre1BacGradeReceived && out.noteGeneraleSemestre1SecondBacSur20?.trim()) {
    out.semestre1BacGradeReceived = 'yes';
  }
  if (!out.premiereMissionGradeReceived && out.noteMissionPremiereSur20?.trim()) {
    out.premiereMissionGradeReceived = 'yes';
  }
  if (!out.semestre1MissionGradeReceived && out.noteMissionSemestre1TerminaleSur20?.trim()) {
    out.semestre1MissionGradeReceived = 'yes';
  }
  if (out.previsionnelBacNationalMinSur20 === undefined) out.previsionnelBacNationalMinSur20 = '';
  if (out.previsionnelBacNationalMaxSur20 === undefined) out.previsionnelBacNationalMaxSur20 = '';
  if (out.previsionnelBacMissionMinSur20 === undefined) out.previsionnelBacMissionMinSur20 = '';
  if (out.previsionnelBacMissionMaxSur20 === undefined) out.previsionnelBacMissionMaxSur20 = '';

  const coerceSecteurIdList = (v: unknown): string[] => {
    if (!Array.isArray(v)) return [];
    return v
      .map((x) => (typeof x === 'string' ? x.trim() : typeof x === 'number' ? String(Math.trunc(x)) : ''))
      .filter((s) => /^\d+$/.test(s));
  };
  out.attractedSectors = coerceSecteurIdList(out.attractedSectors);
  out.excludedSectors = coerceSecteurIdList(out.excludedSectors);

  const allowedTargetIds = new Set(TARGET_STUDY_LEVEL_OPTIONS.map((o) => o.id));
  const coerceTargetIds = (v: unknown): string[] => {
    if (!Array.isArray(v)) return [];
    return v.filter((x): x is string => typeof x === 'string' && allowedTargetIds.has(x));
  };
  out.targetStudyLevelIds = coerceTargetIds(out.targetStudyLevelIds);

  const pathVals = new Set(['', 'bac2_passerelle', 'privee_directe_si_non_admis', 'both', 'unsure']);
  if (out.ingenieurMasterPathPreference === undefined) out.ingenieurMasterPathPreference = '';
  if (!pathVals.has(out.ingenieurMasterPathPreference)) out.ingenieurMasterPathPreference = '';

  const ynDepends = new Set(['', 'yes', 'no', 'depends']);
  if (out.privateIfDreamSchoolRejects === undefined) out.privateIfDreamSchoolRejects = '';
  if (!ynDepends.has(out.privateIfDreamSchoolRejects)) out.privateIfDreamSchoolRejects = '';

  const splitVals = new Set(['', 'public2_then_private', 'public3_then_private', 'both_2_or_3', 'no', 'depends']);
  if (out.splitPublicYearsThenPrivate === undefined) out.splitPublicYearsThenPrivate = '';
  if (!splitVals.has(out.splitPublicYearsThenPrivate)) out.splitPublicYearsThenPrivate = '';

  delete (out as Record<string, unknown>).wishesStudyAbroad;

  const militaryVeilVals = new Set(['', 'yes', 'no']);
  if (out.militaryVeilWearing === undefined) out.militaryVeilWearing = '';
  if (!militaryVeilVals.has(out.militaryVeilWearing)) out.militaryVeilWearing = '';

  const militaryHeightVals = new Set(['', 'yes', 'no', 'unsure']);
  if (out.militaryHeightRequirementMet === undefined) out.militaryHeightRequirementMet = '';
  if (!militaryHeightVals.has(out.militaryHeightRequirementMet)) out.militaryHeightRequirementMet = '';

  const allowedLangIds = new Set(HIGHER_ED_TEACHING_LANGUAGE_OPTIONS.map((o) => o.id));
  const coerceLangIds = (v: unknown): string[] => {
    if (!Array.isArray(v)) return [];
    return v.filter((x): x is string => typeof x === 'string' && allowedLangIds.has(x));
  };
  out.acceptedHigherEdLanguages = coerceLangIds(out.acceptedHigherEdLanguages);

  return out;
}

export const defaultSchoolQuickDiagnosticForm = (): SchoolQuickDiagnosticForm => ({
  firstName: '',
  lastName: '',
  profileRole: '',
  phone: '',
  cityId: '',
  city: '',
  studyCityScope: '',
  preferredStudyCityIds: [],
  gender: '',

  studyLevel: '',
  bacType: '',
  lyceePublicPrive: '',
  bacStream: '',
  massarCode: '',
  missionSpecialite1: '',
  missionSpecialite2: '',
  missionSpecialite3: '',
  studentCode: '',

  noteGeneraleTroncCommunSur20: '',
  noteGeneralePremiereBacSur20: '',
  regionalGradeReceived: '',
  previsionnelRegionalMinSur20: '',
  previsionnelRegionalMaxSur20: '',
  noteGeneraleSemestre1SecondBacSur20: '',
  semestre1BacGradeReceived: '',
  previsionnelSemestre1BacMinSur20: '',
  previsionnelSemestre1BacMaxSur20: '',
  bacGradeReceived: '',
  noteBacFinaleSur20: '',
  previsionnelBacNationalMinSur20: '',
  previsionnelBacNationalMaxSur20: '',
  noteMissionSecondeSur20: '',
  noteMissionPremiereSur20: '',
  premiereMissionGradeReceived: '',
  previsionnelPremiereMissionMinSur20: '',
  previsionnelPremiereMissionMaxSur20: '',
  noteMissionSemestre1TerminaleSur20: '',
  semestre1MissionGradeReceived: '',
  previsionnelSemestre1MissionMinSur20: '',
  previsionnelSemestre1MissionMaxSur20: '',
  previsionnelBacMissionMinSur20: '',
  previsionnelBacMissionMaxSur20: '',

  prefPublic: false,
  prefPrivate: false,
  prefSemiPublic: false,
  prefMilitary: false,
  militaryVeilWearing: '',
  militaryHeightRequirementMet: '',
  privateIfDreamSchoolRejects: '',
  splitPublicYearsThenPrivate: '',

  willingOtherCity: '',
  housingIfAway: [],
  willingLiveWithFamily: '',
  willingPayRent: '',
  aloneIfPayingRent: '',
  budgetRentDreamSchool: '',
  privateMonthlyBudgetBracket: '',

  considersContests: '',
  contestPrep: '',

  targetStudyLevelIds: [],
  ingenieurMasterPathPreference: '',
  acceptedHigherEdLanguages: [],
  diplomesSouhaites: [],

  strongSubjects: [],
  weakSubjects: [],
  attractedSectors: [],
  excludedSectors: [],
  freeComment: '',
  consentProcessing: false,
});

/** Paramètres dynamiques (API villes / secteurs) pour le préremplissage admin. */
export type SchoolQuickDiagnosticAdminDemoParams = {
  cityId: string;
  city: string;
  /** IDs secteurs « qui attirent » (chaînes numériques, alignés `/api/secteurs`). */
  attractedSectors: string[];
  /** IDs secteurs « à écarter » — optionnel ; ne doivent pas recouper `attractedSectors`. */
  excludedSectors: string[];
  /**
   * IDs villes « études dans des villes ciblées » (API `/api/cities`).
   * Si au moins un id : `studyCityScope` = `specific` et champs mobilité conditionnels remplis.
   */
  preferredStudyCityIds?: string[];
};

const DEMO_FREE_COMMENT = `Je suis en Terminale sciences math A et je vise surtout les écoles d’ingénieurs ou une licence en informatique / data. Mes parents peuvent m’aider pour une partie des frais si je dois passer par le privé, mais je préfère d’abord viser les grandes écoles publiques et les concours nationaux. Je suis prête à quitter Casablanca si le cursus et les débouchés sont vraiment alignés avec mon projet — j’ai déjà regardé Rabat et Marrakech. J’ai commencé à m’informer sur les concours (prépas vs admissions sur dossier) et j’aimerais des recommandations réalistes selon mes notes et mon budget, sans me fermer aux formations en français ou bilingue.`;

const DEMO_FREE_COMMENT_MISSION = `Je suis en Terminale bac français (mission), spécialités maths / langues / SES. Je vise surtout le Canada ou la France pour un bachelor ou une école de commerce, avec un bon niveau d’anglais. Je suis prêt à bouger dans le pays si le programme est fortement international ; budget famille modéré mais on peut envisager le privé si le retour sur investissement est clair.`;

const DEMO_FREE_COMMENT_BUDGET = `Je prépare le bac en sciences physiques et je veux surtout rester dans le public : pas de budget pour du privé pour l’instant. Je préfère étudier près de chez moi pour limiter les frais de logement. Je ne compte pas passer par les concours les plus sélectifs ; une licence ou un BTS dans une fac ou établissement public me convient.`;

const DEMO_FREE_COMMENT_TUTOR = `Je remplis ce diagnostic en tant que mère pour ma fille (Terminale SM A). Elle vise les écoles d’ingénieurs et les concours ; nous pouvons l’aider sur une partie du privé si besoin. Elle est ouverte à Rabat et Marrakech si l’offre de formation est cohérente. Merci d’orienter les recommandations vers des établissements réalistes au vu de son niveau.`;

const DEMO_FREE_COMMENT_SANTE = `Je suis en Terminale SVT, je vise médecine / sciences de la santé ou une licence biologie comme plan B. Je ne suis pas à l’aise avec les maths très abstraites mais j’ai de bons résultats en SVT et français. Je préfère rester dans une grande ville du Maroc pour les stages ; ouverture sur le bilingue.`;

const DEMO_FREE_COMMENT_DROIT = `Je suis en Terminale sciences économiques et je vise plutôt droit, sciences politiques ou école de commerce après une licence. J’aime l’économie et l’actualité ; les maths ne sont pas mon point fort. Je cherche des établissements sérieux en français ou bilingue, avec une bonne insertion pro.`;

const DEMO_FREE_COMMENT_LETTRES = `Je suis en Terminale Lettres : je vise licence lettres / langues, communication ou enseignement. Mes points forts sont le français, les langues et la philo. Je suis ouvert·e à la mobilité dans le royaume si la formation est reconnue.`;

const DEMO_FREE_COMMENT_AGRONOMIE = `Je suis en Terminale sciences agronomiques : je vise agronomie, environnement ou développement durable. J’aime les sciences de la vie et les projets de terrain. Je peux envisager une fac ou un institut spécialisé, public ou privé selon les débouchés.`;

const DEMO_FREE_COMMENT_ARTS = `Je suis en Terminale Arts appliqués : je vise architecture, design, arts ou écoles créatives. Je prépare un book / portfolio ; je suis prêt·e à passer par le privé si l’école est reconnue. Mobilité possible vers les grandes villes.`;

/**
 * Résout secteurs + périmètre géographique (villes d’études) à partir des listes API — utilisé par tous les cas admin.
 */
export function resolveSchoolQuickDiagnosticAdminDemoGeo(
  p: SchoolQuickDiagnosticAdminDemoParams
): Pick<SchoolQuickDiagnosticForm, 'attractedSectors' | 'excludedSectors' | 'studyCityScope' | 'preferredStudyCityIds'> {
  const attracted = [...new Set(p.attractedSectors.filter((id) => /^\d+$/.test(id)))];
  const excludedRaw = p.excludedSectors.filter((id) => /^\d+$/.test(id) && !attracted.includes(id));
  const excluded = [...new Set(excludedRaw)];

  const prefIds = (p.preferredStudyCityIds ?? []).filter((id) => /^\d+$/.test(String(id).trim()));
  const studyCityScope: SchoolQuickDiagnosticForm['studyCityScope'] =
    prefIds.length > 0 ? 'specific' : 'any';

  return {
    attractedSectors: attracted,
    excludedSectors: excluded,
    studyCityScope,
    preferredStudyCityIds: prefIds,
  };
}

/** Identifiants des cas de prérémplissage admin (diagnostic rapide), par domaine d’études (+ accompagnant). */
export type SchoolQuickDiagnosticPrefillUseCaseId =
  | 'domaine_ingenierie_numerique'
  | 'domaine_commerce_management'
  | 'domaine_sante_biologie'
  | 'domaine_droit_sciences_sociales'
  | 'domaine_lettres_langues'
  | 'domaine_agronomie_environnement'
  | 'domaine_arts_design_architecture'
  | 'domaine_enseignement_public_recherche'
  | 'accompagnant_tuteur';

/**
 * Villes cibles « où étudier » (ordre de préférence) — noms à retrouver dans le libellé API (`/api/cities`).
 * Cohérence : pôles d’ingénierie, commerce / international, santé, droit, lettres, agronomie, arts.
 */
const PREFILL_STUDY_CITY_NAME_TOKENS: Record<SchoolQuickDiagnosticPrefillUseCaseId, readonly string[]> = {
  domaine_ingenierie_numerique: ['rabat', 'marrakech', 'mohammedia', 'tanger'],
  domaine_commerce_management: ['rabat', 'tanger', 'marrakech', 'meknès'],
  domaine_sante_biologie: ['rabat', 'fès', 'marrakech', 'casablanca'],
  domaine_droit_sciences_sociales: ['rabat', 'marrakech', 'fès', 'casablanca'],
  domaine_lettres_langues: ['fès', 'rabat', 'marrakech', 'tanger'],
  domaine_agronomie_environnement: ['rabat', 'meknès', 'agadir', 'settat'],
  domaine_arts_design_architecture: ['casablanca', 'rabat', 'tanger', 'marrakech'],
  domaine_enseignement_public_recherche: [],
  accompagnant_tuteur: ['rabat', 'marrakech', 'mohammedia', 'fès'],
};

function normalizeForCityMatch(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

function labelMatchesCityToken(label: string, token: string): boolean {
  const l = normalizeForCityMatch(label);
  const t = normalizeForCityMatch(token);
  if (!t) return false;
  return l.includes(t);
}

/**
 * Choisit jusqu’à 2 villes d’études crédibles pour le cas admin (hors ville de résidence).
 * Le cas « enseignement sup. & budget public » ne cible pas de villes (mobilité ouverte / proche).
 */
export function pickPreferredStudyCityIdsForPrefillUseCase(
  useCaseId: SchoolQuickDiagnosticPrefillUseCaseId,
  cities: { id: number; label: string }[],
  residenceCityId: string
): string[] {
  if (useCaseId === 'domaine_enseignement_public_recherche') return [];
  if (cities.length === 0) return [];

  const tokens = PREFILL_STUDY_CITY_NAME_TOKENS[useCaseId];
  const picked: string[] = [];
  const seen = new Set<string>([String(residenceCityId)]);

  for (const tok of tokens) {
    if (picked.length >= 2) break;
    const hit = cities.find((c) => {
      const id = String(c.id);
      if (seen.has(id)) return false;
      return labelMatchesCityToken(c.label, tok);
    });
    if (hit) {
      picked.push(String(hit.id));
      seen.add(String(hit.id));
    }
  }

  if (picked.length < 2) {
    for (const c of cities) {
      if (picked.length >= 2) break;
      const id = String(c.id);
      if (seen.has(id)) continue;
      picked.push(id);
      seen.add(id);
    }
  }

  return picked.slice(0, 2);
}

export const SCHOOL_DIAGNOSTIC_PREFILL_USECASES: {
  id: SchoolQuickDiagnosticPrefillUseCaseId;
  title: string;
  description: string;
}[] = [
  {
    id: 'domaine_ingenierie_numerique',
    title: 'Ingénierie & numérique',
    description:
      'Terminale SM A, concours, militaire possible, mobilité. Secteurs : ingénierie, informatique, télécoms, data, industrie.',
  },
  {
    id: 'domaine_commerce_management',
    title: 'Commerce, management & finance',
    description:
      'Bac mission type maths / langues / SES, projet international. Secteurs : commerce, management, finance, tourisme.',
  },
  {
    id: 'domaine_sante_biologie',
    title: 'Santé, biologie & paramédical',
    description:
      'SVT, projet santé / médecine / biologie. Secteurs : santé, pharmacie, soins, biologie, paramédical.',
  },
  {
    id: 'domaine_droit_sciences_sociales',
    title: 'Droit, économie & sciences sociales',
    description:
      'Sciences économiques, projet droit / fac / sciences po. Secteurs : droit, juridique, économie, sciences sociales, administration.',
  },
  {
    id: 'domaine_lettres_langues',
    title: 'Lettres, langues & communication',
    description:
      'Lettres, licence lettres / langues / com. Secteurs : langues, littérature, communication, journalisme, enseignement.',
  },
  {
    id: 'domaine_agronomie_environnement',
    title: 'Agronomie & environnement',
    description:
      'Sciences agronomiques, développement durable, territoires. Secteurs : agronomie, environnement, agriculture, eau, forêt.',
  },
  {
    id: 'domaine_arts_design_architecture',
    title: 'Arts, design & architecture',
    description:
      'Arts appliqués, écoles créatives. Secteurs : arts, design, architecture, audiovisuel, culture, mode.',
  },
  {
    id: 'domaine_enseignement_public_recherche',
    title: 'Enseignement sup. & budget public',
    description:
      'Sciences physiques, priorité public, peu de mobilité. Secteurs : université, recherche, formation, filières accessibles en public.',
  },
  {
    id: 'accompagnant_tuteur',
    title: 'Accompagnant (parent / tuteur)',
    description:
      'Profil parent pour un·e élève SM A type ingénieur / concours. Secteurs alignés ingénierie / tech (comme « Ingénierie & numérique »).',
  },
];

/** Ligne secteur minimale pour le matching admin (API `/api/secteurs`). */
export type PrefillSecteurRow = { id: number; titre: string };

/**
 * Mots-clés sur les **titres** renvoyés par `/api/secteurs` (sous-chaînes, sans casse ni accents).
 * À ajuster si les libellés en base diffèrent fortement.
 */
const PREFILL_SECTEUR_KEYWORDS: Record<
  SchoolQuickDiagnosticPrefillUseCaseId,
  { primary: string[]; secondary: string[]; exclude: string[] }
> = {
  domaine_ingenierie_numerique: {
    primary: [
      'ingénieur',
      'ingénierie',
      'numérique',
      'informatique',
      'télécom',
      'data',
      'industrie',
      'aéronautique',
      'énergie',
      'génie',
      'tech',
      'cyber',
    ],
    secondary: ['sciences', 'technologie', 'mécanique', 'électrique', 'réseau'],
    exclude: ['spectacle', 'musique', 'cinéma', 'mode', 'textile', 'art plast'],
  },
  domaine_commerce_management: {
    primary: [
      'commerce',
      'international',
      'management',
      'finance',
      'marketing',
      'langue',
      'tourisme',
      'affaire',
      'gestion',
      'banque',
      'audit',
    ],
    secondary: ['commerce', 'économie', 'communication', 'vente', 'hôtellerie'],
    exclude: ['ingénieur', 'aéronautique', 'nucléaire', 'mines'],
  },
  domaine_sante_biologie: {
    primary: [
      'santé',
      'médical',
      'pharmacie',
      'biologie',
      'soins',
      'paramédical',
      'dentaire',
      'vétérinaire',
      'sage-femme',
      'kinésithérapie',
    ],
    secondary: ['recherche médicale', 'biotechnologie', 'nutrition', 'santé publique'],
    exclude: ['spectacle', 'mode', 'luxe', 'immobilier'],
  },
  domaine_droit_sciences_sociales: {
    primary: [
      'droit',
      'juridique',
      'justice',
      'politique',
      'économie',
      'social',
      'administration',
      'relations internationales',
      'sciences politiques',
      'faculté',
    ],
    secondary: ['université', 'licence', 'gestion publique', 'notariat', 'journalisme'],
    exclude: ['ingénieur', 'aéronautique', 'mines', 'nucléaire'],
  },
  domaine_lettres_langues: {
    primary: [
      'lettre',
      'langue',
      'littérature',
      'communication',
      'journalisme',
      'traduction',
      'humanité',
      'français',
      'anglais',
    ],
    secondary: ['culture', 'enseignement', 'média', 'édition'],
    exclude: ['ingénieur', 'aéronautique', 'mines'],
  },
  domaine_agronomie_environnement: {
    primary: [
      'agronomie',
      'environnement',
      'agriculture',
      'forêt',
      'eau',
      'développement',
      'durable',
      'territoire',
      'climat',
      'géologie',
    ],
    secondary: ['recherche', 'institut agricole', 'écologie', 'vétérinaire'],
    exclude: ['luxe', 'joaillerie', 'spectacle', 'mode'],
  },
  domaine_arts_design_architecture: {
    primary: [
      'art',
      'design',
      'architecture',
      'audiovisuel',
      'cinéma',
      'musique',
      'mode',
      'graphique',
      'culture',
      'spectacle',
    ],
    secondary: ['création', 'multimédia', 'plastique', 'décor'],
    exclude: ['nucléaire', 'mines', 'aéronautique'],
  },
  domaine_enseignement_public_recherche: {
    primary: [
      'enseignement',
      'université',
      'recherche',
      'agronomie',
      'environnement',
      'développement',
      'sciences',
      'agriculture',
      'forêt',
      'eau',
    ],
    secondary: ['formation', 'institut', 'éducation', 'territoire', 'faculté'],
    exclude: ['luxe', 'joaillerie', 'aéronautique', 'spatial'],
  },
  accompagnant_tuteur: {
    primary: [
      'ingénieur',
      'ingénierie',
      'numérique',
      'informatique',
      'télécom',
      'data',
      'industrie',
      'aéronautique',
      'énergie',
      'génie',
      'tech',
    ],
    secondary: ['sciences', 'technologie', 'mécanique', 'réseau'],
    exclude: ['spectacle', 'musique', 'cinéma', 'mode', 'art plast'],
  },
};

function normalizeTextForSecteurMatch(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

function secteurScore(titre: string, keywords: string[]): number {
  const t = normalizeTextForSecteurMatch(titre);
  let score = 0;
  for (const kw of keywords) {
    const k = normalizeTextForSecteurMatch(kw);
    if (k.length > 0 && t.includes(k)) {
      score += 1;
    }
  }
  return score;
}

function firstMatchingExcluded(
  rows: PrefillSecteurRow[],
  patterns: string[],
  forbiddenIds: Set<string>
): string | null {
  for (const s of rows) {
    const id = String(s.id);
    if (forbiddenIds.has(id)) {
      continue;
    }
    if (secteurScore(s.titre, patterns) > 0) {
      return id;
    }
  }
  return null;
}

/**
 * Choisit des IDs secteurs (chaînes numériques) alignés sur le cas d’usage, à partir de la liste API chargée.
 * 2 secteurs « attirants » (scores sur mots-clés primary puis secondary), 1 « à éviter » si possible.
 */
export function pickSectorsForPrefillUseCase(
  useCaseId: SchoolQuickDiagnosticPrefillUseCaseId,
  secteurs: PrefillSecteurRow[]
): { attractedSectors: string[]; excludedSectors: string[] } {
  const cfg = PREFILL_SECTEUR_KEYWORDS[useCaseId];
  if (!cfg || secteurs.length === 0) {
    return { attractedSectors: [], excludedSectors: [] };
  }

  const allKw = [...cfg.primary, ...cfg.secondary];
  const scored = secteurs
    .map((s) => ({
      id: String(s.id),
      titre: s.titre,
      scorePrimary: secteurScore(s.titre, cfg.primary),
      scoreSecondary: secteurScore(s.titre, cfg.secondary),
      scoreTotal: secteurScore(s.titre, allKw),
    }))
    .sort((a, b) => {
      if (b.scorePrimary !== a.scorePrimary) {
        return b.scorePrimary - a.scorePrimary;
      }
      if (b.scoreSecondary !== a.scoreSecondary) {
        return b.scoreSecondary - a.scoreSecondary;
      }
      return b.scoreTotal - a.scoreTotal;
    });

  const attracted: string[] = [];
  const seen = new Set<string>();
  for (const row of scored) {
    if (row.scorePrimary + row.scoreSecondary === 0) {
      continue;
    }
    if (!seen.has(row.id)) {
      attracted.push(row.id);
      seen.add(row.id);
    }
    if (attracted.length >= 2) {
      break;
    }
  }

  if (attracted.length < 2) {
    for (const row of scored) {
      if (row.scoreTotal > 0 && !seen.has(row.id)) {
        attracted.push(row.id);
        seen.add(row.id);
      }
      if (attracted.length >= 2) {
        break;
      }
    }
  }

  if (attracted.length < 2) {
    for (const s of secteurs) {
      const id = String(s.id);
      if (!seen.has(id)) {
        attracted.push(id);
        seen.add(id);
      }
      if (attracted.length >= 2) {
        break;
      }
    }
  }

  const forbidden = new Set(attracted);
  let excludedId = firstMatchingExcluded(secteurs, cfg.exclude, forbidden);

  if (excludedId === null) {
    for (const row of [...scored].reverse()) {
      const id = row.id;
      if (!forbidden.has(id) && row.scorePrimary === 0 && row.scoreSecondary === 0) {
        excludedId = id;
        break;
      }
    }
  }

  if (excludedId === null) {
    for (const s of secteurs) {
      const id = String(s.id);
      if (!forbidden.has(id)) {
        excludedId = id;
        break;
      }
    }
  }

  const excluded: string[] = excludedId !== null ? [excludedId] : [];

  return {
    attractedSectors: attracted.slice(0, 2),
    excludedSectors: excluded,
  };
}

/**
 * Préremplissage admin : un cas par domaine d’études (ou accompagnant). Les villes / secteurs viennent des listes API (IDs réels).
 */
export function buildSchoolQuickDiagnosticPrefillUseCase(
  useCaseId: SchoolQuickDiagnosticPrefillUseCaseId,
  p: SchoolQuickDiagnosticAdminDemoParams
): SchoolQuickDiagnosticForm {
  let geo = resolveSchoolQuickDiagnosticAdminDemoGeo(p);
  if (useCaseId === 'domaine_enseignement_public_recherche') {
    geo = { ...geo, studyCityScope: 'any', preferredStudyCityIds: [] };
  }

  const base: SchoolQuickDiagnosticForm = {
    ...defaultSchoolQuickDiagnosticForm(),
    ...geo,
    cityId: p.cityId,
    city: p.city,
  };

  switch (useCaseId) {
    case 'domaine_ingenierie_numerique':
      return {
        ...base,
        firstName: 'Yasmine',
        lastName: 'Alami',
        profileRole: 'student',
        phone: '0612345678',
        gender: 'femme',
        studyLevel: '2ème année Baccalauréat',
        bacType: 'normal',
        lyceePublicPrive: 'Public',
        bacStream: 'Sciences Math A',
        missionSpecialite1: '',
        missionSpecialite2: '',
        missionSpecialite3: '',
        noteGeneraleTroncCommunSur20: '13,5',
        noteGeneralePremiereBacSur20: '14',
        noteGeneraleSemestre1SecondBacSur20: '14,5',
        previsionnelBacNationalMinSur20: '13',
        previsionnelBacNationalMaxSur20: '16',
        noteMissionSecondeSur20: '',
        noteMissionPremiereSur20: '',
        noteMissionSemestre1TerminaleSur20: '',
        previsionnelBacMissionMinSur20: '',
        previsionnelBacMissionMaxSur20: '',
        prefPublic: true,
        prefPrivate: true,
        prefSemiPublic: true,
        prefMilitary: true,
        militaryVeilWearing: 'no',
        militaryHeightRequirementMet: 'yes',
        privateIfDreamSchoolRejects: 'yes',
        privateMonthlyBudgetBracket: '4000_8000',
        splitPublicYearsThenPrivate: 'public3_then_private',
        willingOtherCity: 'yes',
        housingIfAway: ['residence', 'colocation'],
        willingLiveWithFamily: 'yes',
        willingPayRent: 'yes',
        aloneIfPayingRent: 'no',
        budgetRentDreamSchool: '1500_3000',
        considersContests: 'yes',
        contestPrep: 'mixed',
        targetStudyLevelIds: [
          TARGET_STUDY_LEVEL_OPTIONS[1].id,
          TARGET_STUDY_LEVEL_OPTIONS[2].id,
          TARGET_LEVEL_MASTER_INGENIEUR_ID,
        ],
        ingenieurMasterPathPreference: 'bac2_passerelle',
        acceptedHigherEdLanguages: ['french', 'english', 'bilingual_fr_en', 'mixed_ar_fr'],
        strongSubjects: ['Mathématiques', 'Physique-Chimie', 'Anglais'],
        weakSubjects: ['Philosophie', 'Histoire-Géographie'],
        freeComment: DEMO_FREE_COMMENT,
        consentProcessing: true,
      };

    case 'domaine_commerce_management':
      return {
        ...base,
        firstName: 'Omar',
        lastName: 'Tazi',
        profileRole: 'student',
        phone: '0623456789',
        gender: 'homme',
        studyLevel: '2ème année Baccalauréat',
        bacType: 'mission',
        lyceePublicPrive: 'Privé',
        bacStream: '',
        missionSpecialite1: 'Mathématiques',
        missionSpecialite2: 'LLCE',
        missionSpecialite3: 'SES',
        noteGeneraleTroncCommunSur20: '',
        noteGeneralePremiereBacSur20: '',
        noteGeneraleSemestre1SecondBacSur20: '',
        previsionnelBacNationalMinSur20: '',
        previsionnelBacNationalMaxSur20: '',
        noteMissionSecondeSur20: '13',
        noteMissionPremiereSur20: '14',
        noteMissionSemestre1TerminaleSur20: '14,5',
        previsionnelBacMissionMinSur20: '12',
        previsionnelBacMissionMaxSur20: '16',
        prefPublic: true,
        prefPrivate: true,
        prefSemiPublic: true,
        prefMilitary: false,
        militaryVeilWearing: '',
        militaryHeightRequirementMet: '',
        privateIfDreamSchoolRejects: 'yes',
        privateMonthlyBudgetBracket: '8000_15000',
        splitPublicYearsThenPrivate: 'both_2_or_3',
        willingOtherCity: 'yes',
        housingIfAway: ['residence'],
        willingLiveWithFamily: 'depends',
        willingPayRent: 'yes',
        aloneIfPayingRent: 'no',
        budgetRentDreamSchool: '3000_5000',
        considersContests: 'maybe',
        contestPrep: 'online',
        targetStudyLevelIds: [TARGET_STUDY_LEVEL_OPTIONS[2].id, TARGET_STUDY_LEVEL_OPTIONS[3].id],
        ingenieurMasterPathPreference: 'unsure',
        acceptedHigherEdLanguages: ['english', 'french', 'bilingual_fr_en'],
        strongSubjects: ['Mathématiques', 'Anglais', 'Économie'],
        weakSubjects: ['Physique-Chimie'],
        freeComment: DEMO_FREE_COMMENT_MISSION,
        consentProcessing: true,
      };

    case 'domaine_enseignement_public_recherche':
      return {
        ...base,
        firstName: 'Imane',
        lastName: 'Idrissi',
        profileRole: 'student',
        phone: '0600112233',
        gender: 'femme',
        studyLevel: '2ème année Baccalauréat',
        bacType: 'normal',
        lyceePublicPrive: 'Public',
        bacStream: 'Sciences Physique',
        missionSpecialite1: '',
        missionSpecialite2: '',
        missionSpecialite3: '',
        noteGeneraleTroncCommunSur20: '12',
        noteGeneralePremiereBacSur20: '12,5',
        noteGeneraleSemestre1SecondBacSur20: '13',
        previsionnelBacNationalMinSur20: '11',
        previsionnelBacNationalMaxSur20: '14',
        noteMissionSecondeSur20: '',
        noteMissionPremiereSur20: '',
        noteMissionSemestre1TerminaleSur20: '',
        previsionnelBacMissionMinSur20: '',
        previsionnelBacMissionMaxSur20: '',
        prefPublic: true,
        prefPrivate: false,
        prefSemiPublic: false,
        prefMilitary: false,
        militaryVeilWearing: '',
        militaryHeightRequirementMet: '',
        privateIfDreamSchoolRejects: 'no',
        privateMonthlyBudgetBracket: '0_public_only',
        splitPublicYearsThenPrivate: 'no',
        willingOtherCity: 'no',
        housingIfAway: [],
        willingLiveWithFamily: 'yes',
        willingPayRent: 'no',
        aloneIfPayingRent: '',
        budgetRentDreamSchool: '',
        considersContests: 'no',
        contestPrep: '',
        targetStudyLevelIds: [TARGET_STUDY_LEVEL_OPTIONS[0].id, TARGET_STUDY_LEVEL_OPTIONS[1].id],
        ingenieurMasterPathPreference: '',
        acceptedHigherEdLanguages: ['french', 'arabic', 'mixed_ar_fr'],
        strongSubjects: ['Mathématiques', 'Physique-Chimie'],
        weakSubjects: ['Philosophie'],
        freeComment: DEMO_FREE_COMMENT_BUDGET,
        consentProcessing: true,
      };

    case 'domaine_droit_sciences_sociales':
      return {
        ...base,
        firstName: 'Mehdi',
        lastName: 'Bernoussi',
        profileRole: 'student',
        phone: '0619988776',
        gender: 'homme',
        studyLevel: '2ème année Baccalauréat',
        bacType: 'normal',
        lyceePublicPrive: 'Public',
        bacStream: 'Sciences économique',
        missionSpecialite1: '',
        missionSpecialite2: '',
        missionSpecialite3: '',
        noteGeneraleTroncCommunSur20: '13',
        noteGeneralePremiereBacSur20: '13,5',
        noteGeneraleSemestre1SecondBacSur20: '14',
        previsionnelBacNationalMinSur20: '12',
        previsionnelBacNationalMaxSur20: '15',
        noteMissionSecondeSur20: '',
        noteMissionPremiereSur20: '',
        noteMissionSemestre1TerminaleSur20: '',
        previsionnelBacMissionMinSur20: '',
        previsionnelBacMissionMaxSur20: '',
        prefPublic: true,
        prefPrivate: true,
        prefSemiPublic: true,
        prefMilitary: false,
        militaryVeilWearing: '',
        militaryHeightRequirementMet: '',
        privateIfDreamSchoolRejects: 'depends',
        privateMonthlyBudgetBracket: '4000_8000',
        splitPublicYearsThenPrivate: 'depends',
        willingOtherCity: 'yes',
        housingIfAway: ['residence'],
        willingLiveWithFamily: 'yes',
        willingPayRent: 'depends',
        aloneIfPayingRent: 'no',
        budgetRentDreamSchool: '1500_3000',
        considersContests: 'maybe',
        contestPrep: 'mixed',
        targetStudyLevelIds: [
          TARGET_STUDY_LEVEL_OPTIONS[0].id,
          TARGET_STUDY_LEVEL_OPTIONS[1].id,
          TARGET_STUDY_LEVEL_OPTIONS[2].id,
        ],
        ingenieurMasterPathPreference: '',
        acceptedHigherEdLanguages: ['french', 'bilingual_fr_en', 'english'],
        strongSubjects: ['Économie', 'Français', 'Histoire-Géographie'],
        weakSubjects: ['Mathématiques'],
        freeComment: DEMO_FREE_COMMENT_DROIT,
        consentProcessing: true,
      };

    case 'domaine_lettres_langues':
      return {
        ...base,
        firstName: 'Houda',
        lastName: 'Mansouri',
        profileRole: 'student',
        phone: '0622113344',
        gender: 'femme',
        studyLevel: '2ème année Baccalauréat',
        bacType: 'normal',
        lyceePublicPrive: 'Public',
        bacStream: 'Lettres',
        missionSpecialite1: '',
        missionSpecialite2: '',
        missionSpecialite3: '',
        noteGeneraleTroncCommunSur20: '14',
        noteGeneralePremiereBacSur20: '14',
        noteGeneraleSemestre1SecondBacSur20: '14,5',
        previsionnelBacNationalMinSur20: '13',
        previsionnelBacNationalMaxSur20: '16',
        noteMissionSecondeSur20: '',
        noteMissionPremiereSur20: '',
        noteMissionSemestre1TerminaleSur20: '',
        previsionnelBacMissionMinSur20: '',
        previsionnelBacMissionMaxSur20: '',
        prefPublic: true,
        prefPrivate: true,
        prefSemiPublic: true,
        prefMilitary: false,
        militaryVeilWearing: '',
        militaryHeightRequirementMet: '',
        privateIfDreamSchoolRejects: 'yes',
        privateMonthlyBudgetBracket: '4000_8000',
        splitPublicYearsThenPrivate: 'depends',
        willingOtherCity: 'yes',
        housingIfAway: ['residence', 'colocation'],
        willingLiveWithFamily: 'yes',
        willingPayRent: 'depends',
        aloneIfPayingRent: 'no',
        budgetRentDreamSchool: '1500_3000',
        considersContests: 'no',
        contestPrep: '',
        targetStudyLevelIds: [TARGET_STUDY_LEVEL_OPTIONS[1].id, TARGET_STUDY_LEVEL_OPTIONS[2].id],
        ingenieurMasterPathPreference: '',
        acceptedHigherEdLanguages: ['french', 'english', 'bilingual_fr_en', 'mixed_ar_fr'],
        strongSubjects: ['Français', 'Anglais', 'Philosophie'],
        weakSubjects: ['Mathématiques'],
        freeComment: DEMO_FREE_COMMENT_LETTRES,
        consentProcessing: true,
      };

    case 'domaine_agronomie_environnement':
      return {
        ...base,
        firstName: 'Younes',
        lastName: 'Fikri',
        profileRole: 'student',
        phone: '0633447788',
        gender: 'homme',
        studyLevel: '2ème année Baccalauréat',
        bacType: 'normal',
        lyceePublicPrive: 'Public',
        bacStream: 'Sciences agronomiques',
        missionSpecialite1: '',
        missionSpecialite2: '',
        missionSpecialite3: '',
        noteGeneraleTroncCommunSur20: '13',
        noteGeneralePremiereBacSur20: '13,5',
        noteGeneraleSemestre1SecondBacSur20: '14',
        previsionnelBacNationalMinSur20: '12',
        previsionnelBacNationalMaxSur20: '15,5',
        noteMissionSecondeSur20: '',
        noteMissionPremiereSur20: '',
        noteMissionSemestre1TerminaleSur20: '',
        previsionnelBacMissionMinSur20: '',
        previsionnelBacMissionMaxSur20: '',
        prefPublic: true,
        prefPrivate: true,
        prefSemiPublic: true,
        prefMilitary: false,
        militaryVeilWearing: '',
        militaryHeightRequirementMet: '',
        privateIfDreamSchoolRejects: 'depends',
        privateMonthlyBudgetBracket: '4000_8000',
        splitPublicYearsThenPrivate: 'public3_then_private',
        willingOtherCity: 'yes',
        housingIfAway: ['residence'],
        willingLiveWithFamily: 'yes',
        willingPayRent: 'yes',
        aloneIfPayingRent: 'no',
        budgetRentDreamSchool: '1500_3000',
        considersContests: 'maybe',
        contestPrep: 'mixed',
        targetStudyLevelIds: [
          TARGET_STUDY_LEVEL_OPTIONS[0].id,
          TARGET_STUDY_LEVEL_OPTIONS[1].id,
          TARGET_STUDY_LEVEL_OPTIONS[2].id,
        ],
        ingenieurMasterPathPreference: '',
        acceptedHigherEdLanguages: ['french', 'bilingual_fr_en', 'english'],
        strongSubjects: ['SVT', 'Mathématiques', 'Français'],
        weakSubjects: ['Physique-Chimie'],
        freeComment: DEMO_FREE_COMMENT_AGRONOMIE,
        consentProcessing: true,
      };

    case 'domaine_arts_design_architecture':
      return {
        ...base,
        firstName: 'Lina',
        lastName: 'Kettani',
        profileRole: 'student',
        phone: '0644556677',
        gender: 'femme',
        studyLevel: '2ème année Baccalauréat',
        bacType: 'normal',
        lyceePublicPrive: 'Privé',
        bacStream: 'Arts Appliqués',
        missionSpecialite1: '',
        missionSpecialite2: '',
        missionSpecialite3: '',
        noteGeneraleTroncCommunSur20: '13,5',
        noteGeneralePremiereBacSur20: '14',
        noteGeneraleSemestre1SecondBacSur20: '14,5',
        previsionnelBacNationalMinSur20: '12',
        previsionnelBacNationalMaxSur20: '16',
        noteMissionSecondeSur20: '',
        noteMissionPremiereSur20: '',
        noteMissionSemestre1TerminaleSur20: '',
        previsionnelBacMissionMinSur20: '',
        previsionnelBacMissionMaxSur20: '',
        prefPublic: true,
        prefPrivate: true,
        prefSemiPublic: true,
        prefMilitary: false,
        militaryVeilWearing: '',
        militaryHeightRequirementMet: '',
        privateIfDreamSchoolRejects: 'yes',
        privateMonthlyBudgetBracket: '8000_15000',
        splitPublicYearsThenPrivate: 'both_2_or_3',
        willingOtherCity: 'yes',
        housingIfAway: ['residence', 'colocation'],
        willingLiveWithFamily: 'depends',
        willingPayRent: 'yes',
        aloneIfPayingRent: 'no',
        budgetRentDreamSchool: '3000_5000',
        considersContests: 'maybe',
        contestPrep: 'online',
        targetStudyLevelIds: [
          TARGET_STUDY_LEVEL_OPTIONS[1].id,
          TARGET_STUDY_LEVEL_OPTIONS[2].id,
          TARGET_STUDY_LEVEL_OPTIONS[4].id,
        ],
        ingenieurMasterPathPreference: '',
        acceptedHigherEdLanguages: ['french', 'english', 'bilingual_fr_en'],
        strongSubjects: ['Arts plastiques & design', 'Français', 'Anglais'],
        weakSubjects: ['Mathématiques'],
        freeComment: DEMO_FREE_COMMENT_ARTS,
        consentProcessing: true,
      };

    case 'accompagnant_tuteur':
      return {
        ...base,
        firstName: 'Khadija',
        lastName: 'Amrani',
        profileRole: 'tutor',
        phone: '0611223344',
        gender: 'femme',
        studyLevel: '2ème année Baccalauréat',
        bacType: 'normal',
        lyceePublicPrive: 'Public',
        bacStream: 'Sciences Math A',
        missionSpecialite1: '',
        missionSpecialite2: '',
        missionSpecialite3: '',
        noteGeneraleTroncCommunSur20: '13,5',
        noteGeneralePremiereBacSur20: '14',
        noteGeneraleSemestre1SecondBacSur20: '14,5',
        previsionnelBacNationalMinSur20: '13',
        previsionnelBacNationalMaxSur20: '16',
        noteMissionSecondeSur20: '',
        noteMissionPremiereSur20: '',
        noteMissionSemestre1TerminaleSur20: '',
        previsionnelBacMissionMinSur20: '',
        previsionnelBacMissionMaxSur20: '',
        prefPublic: true,
        prefPrivate: true,
        prefSemiPublic: true,
        prefMilitary: true,
        militaryVeilWearing: 'no',
        militaryHeightRequirementMet: 'yes',
        privateIfDreamSchoolRejects: 'yes',
        privateMonthlyBudgetBracket: '4000_8000',
        splitPublicYearsThenPrivate: 'public3_then_private',
        willingOtherCity: 'yes',
        housingIfAway: ['residence', 'colocation'],
        willingLiveWithFamily: 'yes',
        willingPayRent: 'yes',
        aloneIfPayingRent: 'no',
        budgetRentDreamSchool: '1500_3000',
        considersContests: 'yes',
        contestPrep: 'mixed',
        targetStudyLevelIds: [
          TARGET_STUDY_LEVEL_OPTIONS[1].id,
          TARGET_STUDY_LEVEL_OPTIONS[2].id,
          TARGET_LEVEL_MASTER_INGENIEUR_ID,
        ],
        ingenieurMasterPathPreference: 'bac2_passerelle',
        acceptedHigherEdLanguages: ['french', 'english', 'bilingual_fr_en', 'mixed_ar_fr'],
        strongSubjects: ['Mathématiques', 'Physique-Chimie', 'Anglais'],
        weakSubjects: ['Philosophie', 'Histoire-Géographie'],
        freeComment: DEMO_FREE_COMMENT_TUTOR,
        consentProcessing: true,
      };

    case 'domaine_sante_biologie':
      return {
        ...base,
        firstName: 'Salma',
        lastName: 'El Harti',
        profileRole: 'student',
        phone: '0633445566',
        gender: 'femme',
        studyLevel: '2ème année Baccalauréat',
        bacType: 'normal',
        lyceePublicPrive: 'Public',
        bacStream: 'SVT',
        missionSpecialite1: '',
        missionSpecialite2: '',
        missionSpecialite3: '',
        noteGeneraleTroncCommunSur20: '14',
        noteGeneralePremiereBacSur20: '14',
        noteGeneraleSemestre1SecondBacSur20: '14,5',
        previsionnelBacNationalMinSur20: '13',
        previsionnelBacNationalMaxSur20: '16',
        noteMissionSecondeSur20: '',
        noteMissionPremiereSur20: '',
        noteMissionSemestre1TerminaleSur20: '',
        previsionnelBacMissionMinSur20: '',
        previsionnelBacMissionMaxSur20: '',
        prefPublic: true,
        prefPrivate: true,
        prefSemiPublic: true,
        prefMilitary: false,
        militaryVeilWearing: '',
        militaryHeightRequirementMet: '',
        privateIfDreamSchoolRejects: 'depends',
        privateMonthlyBudgetBracket: '4000_8000',
        splitPublicYearsThenPrivate: 'depends',
        willingOtherCity: 'yes',
        housingIfAway: ['residence'],
        willingLiveWithFamily: 'yes',
        willingPayRent: 'depends',
        aloneIfPayingRent: 'no',
        budgetRentDreamSchool: '1500_3000',
        considersContests: 'maybe',
        contestPrep: 'mixed',
        targetStudyLevelIds: ['medecine_pharma_dentaire_6', TARGET_STUDY_LEVEL_OPTIONS[1].id],
        ingenieurMasterPathPreference: '',
        acceptedHigherEdLanguages: ['french', 'bilingual_fr_en', 'english'],
        strongSubjects: ['SVT', 'Physique-Chimie', 'Français'],
        weakSubjects: ['Mathématiques'],
        freeComment: DEMO_FREE_COMMENT_SANTE,
        consentProcessing: true,
      };

    default: {
      const _exhaustive: never = useCaseId;
      throw new Error(`Cas de prérémplissage inconnu : ${String(_exhaustive)}`);
    }
  }
}

/**
 * @deprecated Préférez {@link buildSchoolQuickDiagnosticPrefillUseCase} avec un cas explicite — alias du cas « ingénieur / concours ».
 */
export function buildSchoolQuickDiagnosticAdminDemo(p: SchoolQuickDiagnosticAdminDemoParams): SchoolQuickDiagnosticForm {
  return buildSchoolQuickDiagnosticPrefillUseCase('domaine_ingenierie_numerique', p);
}

export const GENDER_OPTIONS = [
  { value: '', label: '—', labelAr: '—' },
  { value: 'femme', label: 'Femme', labelAr: 'أنثى' },
  { value: 'homme', label: 'Homme', labelAr: 'ذكر' },
];

export const LYCEE_PUBLIC_PRIVE_OPTIONS: { value: '' | 'Public' | 'Privé'; label: string; labelAr?: string }[] = [
  { value: '', label: '—', labelAr: '—' },
  { value: 'Public', label: 'Public', labelAr: 'عمومي' },
  { value: 'Privé', label: 'Privé', labelAr: 'خاص' },
];

export const RENT_BUDGET_OPTIONS = [
  { value: '', label: '—' },
  { value: '0', label: '0 DH (hébergement pris en charge)' },
  { value: '500_1500', label: '500 — 1 500 DH / mois' },
  { value: '1500_3000', label: '1 500 — 3 000 DH / mois' },
  { value: '3000_5000', label: '3 000 — 5 000 DH / mois' },
  { value: '5000_plus', label: 'Plus de 5 000 DH / mois' },
];

export const PRIVATE_FEE_BRACKET_OPTIONS = [
  { value: '', label: '—', labelAr: '—' },
  { value: '0_public_only', label: 'Je vise surtout le public (budget très limité)', labelAr: 'أهدف العمومي (ميزانية محدودة)' },
  { value: '2000_4000', label: '2 000 — 4 000 DH / mois', labelAr: '2 000 — 4 000 درهم / شهر' },
  { value: '4000_8000', label: '4 000 — 8 000 DH / mois', labelAr: '4 000 — 8 000 درهم / شهر' },
  { value: '8000_15000', label: '8 000 — 15 000 DH / mois', labelAr: '8 000 — 15 000 درهم / شهر' },
  { value: '15000_plus', label: 'Plus de 15 000 DH / mois', labelAr: 'أكثر من 15 000 درهم / شهر' },
];

/**
 * Matières proposées pour « fortes / difficiles » (diagnostic).
 * Inclut des entrées pour les profils NSI / arts (alignées filière & spécialités Mission).
 */
export const SUBJECT_OPTIONS = [
  'Mathématiques',
  'Physique-Chimie',
  'SVT',
  'Français',
  'Anglais',
  'Arabe',
  'Philosophie',
  'Histoire-Géographie',
  'Économie',
  'Sciences de l’ingénieur',
  'Informatique & numérique',
  'Arts plastiques & design',
] as const;

/** Filière bac marocain (valeur `bacStream`) → matières pertinentes pour l’affichage. */
const BAC_STREAM_TO_SUBJECTS: Record<string, readonly string[]> = {
  'Sciences Math A': [
    'Mathématiques',
    'Physique-Chimie',
    'SVT',
    'Français',
    'Anglais',
    'Arabe',
    'Philosophie',
    'Histoire-Géographie',
    'Sciences de l’ingénieur',
    'Informatique & numérique',
  ],
  'Sciences Math B': [
    'Mathématiques',
    'Physique-Chimie',
    'SVT',
    'Français',
    'Anglais',
    'Arabe',
    'Philosophie',
    'Histoire-Géographie',
    'Sciences de l’ingénieur',
    'Informatique & numérique',
  ],
  'Sciences Physique': [
    'Physique-Chimie',
    'Mathématiques',
    'SVT',
    'Français',
    'Anglais',
    'Arabe',
    'Philosophie',
    'Histoire-Géographie',
    'Sciences de l’ingénieur',
  ],
  SVT: [
    'SVT',
    'Mathématiques',
    'Physique-Chimie',
    'Français',
    'Anglais',
    'Arabe',
    'Philosophie',
    'Histoire-Géographie',
  ],
  'Sciences et technologies électriques': [
    'Mathématiques',
    'Physique-Chimie',
    'Sciences de l’ingénieur',
    'Français',
    'Anglais',
    'Arabe',
    'Philosophie',
    'SVT',
  ],
  'Sciences et technologies mécaniques': [
    'Mathématiques',
    'Physique-Chimie',
    'Sciences de l’ingénieur',
    'Français',
    'Anglais',
    'Arabe',
    'Philosophie',
    'SVT',
  ],
  'Sciences économique': [
    'Économie',
    'Mathématiques',
    'Français',
    'Anglais',
    'Arabe',
    'Philosophie',
    'Histoire-Géographie',
  ],
  'Sciences gestion comptable': [
    'Économie',
    'Mathématiques',
    'Français',
    'Anglais',
    'Arabe',
    'Philosophie',
    'Histoire-Géographie',
  ],
  'Sciences agronomiques': [
    'SVT',
    'Mathématiques',
    'Physique-Chimie',
    'Français',
    'Anglais',
    'Arabe',
    'Philosophie',
    'Histoire-Géographie',
  ],
  Lettres: ['Français', 'Arabe', 'Anglais', 'Philosophie', 'Histoire-Géographie'],
  'Sciences humaines': [
    'Français',
    'Arabe',
    'Anglais',
    'Philosophie',
    'Histoire-Géographie',
    'Mathématiques',
  ],
  'Sciences de la chariaa': ['Arabe', 'Français', 'Philosophie', 'Histoire-Géographie', 'Anglais'],
  'Arts Appliqués': [
    'Arts plastiques & design',
    'Français',
    'Anglais',
    'Arabe',
    'Philosophie',
    'Histoire-Géographie',
    'Mathématiques',
  ],
};

/** Spécialité bac Mission (clé `SPECIALITES_MISSION`) → matières proposées (union si plusieurs spécialités). */
const MISSION_SPEC_TO_SUBJECTS: Record<string, readonly string[]> = {
  Mathématiques: [
    'Mathématiques',
    'Physique-Chimie',
    'SVT',
    'Français',
    'Anglais',
    'Arabe',
    'Philosophie',
    'Histoire-Géographie',
    'Sciences de l’ingénieur',
    'Informatique & numérique',
  ],
  'Physique-Chimie': [
    'Mathématiques',
    'Physique-Chimie',
    'SVT',
    'Français',
    'Anglais',
    'Arabe',
    'Philosophie',
    'Histoire-Géographie',
    'Sciences de l’ingénieur',
  ],
  SVT: [
    'SVT',
    'Mathématiques',
    'Physique-Chimie',
    'Français',
    'Anglais',
    'Arabe',
    'Philosophie',
    'Histoire-Géographie',
  ],
  NSI: [
    'Informatique & numérique',
    'Mathématiques',
    'Physique-Chimie',
    'Sciences de l’ingénieur',
    'Français',
    'Anglais',
    'Arabe',
  ],
  SES: ['Économie', 'Mathématiques', 'Français', 'Anglais', 'Arabe', 'Philosophie', 'Histoire-Géographie'],
  HGGSP: ['Histoire-Géographie', 'Français', 'Anglais', 'Arabe', 'Philosophie', 'Économie', 'Mathématiques'],
  HLP: ['Français', 'Philosophie', 'Anglais', 'Arabe', 'Histoire-Géographie', 'Mathématiques'],
  LLCE: ['Français', 'Anglais', 'Arabe', 'Philosophie', 'Histoire-Géographie'],
  Arts: ['Arts plastiques & design', 'Français', 'Anglais', 'Arabe', 'Philosophie', 'Histoire-Géographie'],
  Technologique: [
    'Mathématiques',
    'Physique-Chimie',
    'Sciences de l’ingénieur',
    'Français',
    'Anglais',
    'Arabe',
    'Philosophie',
    'SVT',
  ],
};

const SUBJECT_OPTION_SET = new Set<string>(SUBJECT_OPTIONS as unknown as string[]);

function sortSubjectsCanonical(list: string[]): string[] {
  return SUBJECT_OPTIONS.filter((s) => list.includes(s));
}

/**
 * Matières affichées pour « fortes / difficiles » selon le bac Maroc (filière) ou le bac Mission (spécialités).
 * Si filière / spécialités non encore renseignées, retourne la liste complète.
 */
export function getSubjectOptionsForBacProfile(params: {
  bacType: '' | 'normal' | 'mission';
  bacStream: string;
  missionSpecialite1: string;
  missionSpecialite2: string;
  missionSpecialite3: string;
}): string[] {
  const full = [...SUBJECT_OPTIONS];

  if (params.bacType === 'mission') {
    const specs = [params.missionSpecialite1, params.missionSpecialite2, params.missionSpecialite3].filter((s) =>
      s.trim()
    );
    if (specs.length === 0) return full;

    const union = new Set<string>();
    for (const sp of specs) {
      const row = MISSION_SPEC_TO_SUBJECTS[sp];
      if (row) row.forEach((x) => union.add(x));
    }
    const arr = [...union].filter((s) => SUBJECT_OPTION_SET.has(s));
    return arr.length > 0 ? sortSubjectsCanonical(arr) : full;
  }

  if (params.bacType === 'normal') {
    const stream = params.bacStream.trim();
    if (!stream || stream === 'Autre') return full;
    const row = BAC_STREAM_TO_SUBJECTS[stream];
    if (!row) return full;
    return sortSubjectsCanonical([...row]);
  }

  return full;
}

export const HOUSING_AWAY_OPTIONS: { id: string; label: string }[] = [
  { id: 'alone', label: 'Seul(e) en studio / chambre' },
  { id: 'colocation', label: 'Colocation' },
  { id: 'family', label: 'Avec de la famille sur place' },
  { id: 'residence', label: 'Résidence étudiante / foyer' },
];

export const DIAGNOSTIC_STEP_LABELS = [
  'Identité & contact',
  'Parcours & bac',
  'Notes & résultats',
  'Types d’établissements',
  'Mobilité & logement',
  'Concours & préparation',
  'Projet & envoi',
];

export const DIAGNOSTIC_STEP_SHORT_LABELS = [
  'Identité',
  'Parcours',
  'Notes',
  'Établissements',
  'Mobilité',
  'Concours',
  'Projet',
] as const;

export const DIAGNOSTIC_TOTAL_STEPS = DIAGNOSTIC_STEP_LABELS.length;
