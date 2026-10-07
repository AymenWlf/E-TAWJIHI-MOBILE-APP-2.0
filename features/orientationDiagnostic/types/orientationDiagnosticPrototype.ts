/** Prototype diagnostic d’orientation E-TAWJIHI (RIASEC + contexte + rapport). */

export type RiasecLetter = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export type Likert5 = 1 | 2 | 3 | 4 | 5;

export type ModuleId =
  | 'profile'
  | 'context'
  | 'riasec'
  | 'situations'
  | 'functioning'
  | 'ambitions'
  | 'reality'
  | 'careers'
  | 'schools'
  | 'versus';

export type StepKind =
  | 'single'
  | 'likert'
  | 'situation'
  | 'multi_max'
  | 'slider'
  | 'dilemma'
  | 'versus'
  | 'cities'
  | 'dynamic_sectors'
  | 'dynamic_metiers'
  | 'dynamic_schools'
  | 'profile_identity'
  | 'profile_school'
  | 'profile_grades';

export type ChoiceOption = {
  id: string;
  label: string;
  /** Mapping RIASEC optionnel (situations, etc.) */
  riasec?: RiasecLetter;
  /** Score dimension fonctionnement / ambition */
  value?: number;
  /** Meta école (Versus / sélection) */
  orientationPlan?: 'A' | 'B' | 'C' | 'D' | null;
  admissionType?: string | null;
  admissionLabel?: string | null;
  /** Seed Coupe du monde (1–16) */
  seed?: number;
};

/** Méta persistée pour une école radar (plan + admission). */
export type OrientationSchoolMeta = {
  orientationPlan?: 'A' | 'B' | 'C' | 'D' | null;
  admissionType?: string | null;
  admissionLabel?: string | null;
  concours?: boolean;
  afficherEtudeDossierPublic?: boolean;
  facultePubliqueAccesOuvert?: boolean;
  type?: string | null;
  ville?: string | null;
  /** Villes des campus associés (+ siège) */
  villes?: string[];
  dureeEtudes?: string | null;
  diplomes?: string[];
};

export type PreferenceSchool = {
  id: string;
  label: string;
  orientationPlan?: 'A' | 'B' | 'C' | 'D' | null;
  admissionType?: string | null;
  admissionLabel?: string | null;
  ville?: string | null;
  villes?: string[];
  dureeEtudes?: string | null;
  diplomes?: string[];
};

export type DiagnosticStep = {
  id: string;
  module: ModuleId;
  kind: StepKind;
  title: string;
  subtitle?: string;
  /** Dimension RIASEC pour likert déclaré */
  riasecDim?: RiasecLetter;
  options?: ChoiceOption[];
  /** multi_max : nombre max de sélections */
  maxSelect?: number;
  /** multi_max : minimum requis (défaut = maxSelect → exact) */
  minSelect?: number;
  /** slider / dilemma : bornes labels */
  leftLabel?: string;
  rightLabel?: string;
  /** versus : type d’affrontement */
  versusType?: 'metier' | 'ecole';
  /** versus Coupe du monde : tour */
  versusRound?: import('../utils/orientationDiagnosticVersus').VersusRound;
  /** Étape métiers dynamique : secteur ciblé */
  secteurId?: string;
  /** Étape écoles dynamique : type (Public, Semi-Public, …) */
  schoolType?: string;
  /** Clé multi associée (ex. sch_ecoles__public) */
  schoolTypeKey?: string;
};

export type SituationAnswer = { most: string; least: string };

export type DiagnosticAnswers = {
  /** stepId → réponse */
  single: Record<string, string>;
  likert: Record<string, Likert5>;
  situations: Record<string, SituationAnswer>;
  multi: Record<string, string[]>;
  sliders: Record<string, number>; // 0–100
  cities: string[];
  /** Villes précises si « Autres villes du Maroc » est coché (multi) */
  cityOther: string[];
  /** Libellés dynamiques (secteurs / métiers API) id → titre */
  labels: Record<string, string>;
  /** Meta établissements retenus (plan A–D, type d’admission) */
  schoolMeta: Record<string, OrientationSchoolMeta>;
  /** Duels Versus (tableau Coupe du monde — rounds débloqués au fil des vainqueurs) */
  versusPlan: import('../utils/orientationDiagnosticVersus').VersusDuel[];
  /** 16 métiers + 16 écoles seedés pour le tournoi */
  versusField?: import('../utils/orientationDiagnosticVersus').VersusField;
  /** Journal de tous les matchs (vainqueur / perdant / tour) */
  versusLog?: import('../utils/orientationDiagnosticVersus').VersusMatchLog[];
  /** Classement final 1→16 après chaque finale */
  versusRankings?: {
    metiers: import('../utils/orientationDiagnosticVersus').VersusRankedItem[];
    ecoles: import('../utils/orientationDiagnosticVersus').VersusRankedItem[];
  };
  /** Infos perso / scolaires / notes (ancien personalInfo) */
  profile: import('../data/orientationDiagnosticProfile').DiagnosticProfile;
};

export type RiasecScores = Record<RiasecLetter, number>; // 0–100

export type FunctioningScores = {
  autonomie: number;
  collaboration: number;
  pratique: number;
  variete: number;
  leadership: number;
  contactHumain: number;
  analyse: number;
  structure: number;
  creativite: number;
  action: number;
  incertitude: number;
};

export type AmbitionScores = {
  remuneration: number;
  stabilite: number;
  entrepreneuriat: number;
  apprentissage: number;
  impact: number;
  international: number;
  progression: number;
  equilibre: number;
};

export type DiagnosticScores = {
  maturiteProjet: number;
  riasecDeclare: RiasecScores;
  riasecComportemental: RiasecScores;
  riasecConsolide: RiasecScores;
  codeDeclare: string;
  codeComportemental: string;
  codeConsolide: string;
  functioning: FunctioningScores;
  ambitions: AmbitionScores;
  clarte: number;
  connaissanceMetiers: number;
  connaissanceFormations: number;
  confiance: number;
  ambitionGlobale: number;
  faisabilite: number;
};

export type FamilyReco = {
  id: string;
  label: string;
  score: number;
  tier: 'forte' | 'bonne' | 'exploratoire';
  why: string;
};

export type MetierReco = {
  id: string;
  label: string;
  familyId: string;
  score: number;
  breakdown: {
    riasec: number;
    modeTravail: number;
    ambitions: number;
    valeurs: number;
    faisabilite: number;
  };
};

/** École recommandée (algo diagnostic mobile, sans IA) */
export type OrientationSchoolReco = {
  establishmentId: number;
  nom: string;
  /** Nom arabe (affichage bilingue test + rapport) */
  nomArabe?: string | null;
  sigle?: string;
  slug: string;
  /** Ville principale (siège / première connue) */
  ville: string;
  /** Villes des campus associés (+ ville siège), pour affichage rapport */
  villes?: string[];
  /** Durée d’études (ex. « 3-5 ans ») */
  dureeEtudes?: string | null;
  /** Diplômes délivrés */
  diplomes?: string[];
  typeEcole?: string;
  /** Plan A–D si renseigné */
  orientationPlan?: 'A' | 'B' | 'C' | 'D' | null;
  orientationPlanLabel?: string | null;
  /** Type d’admission brut (si renseigné) */
  admissionType?: string | null;
  /** Type d’admission (ou fallback legacy concours) */
  admissionLabel?: string | null;
  /** Faculté / univ. publique accès ouvert (groupe accordéon) */
  facultePubliqueAccesOuvert?: boolean;
  logo?: string | null;
  algorithmicScore: number;
  /** = algorithmicScore (pas de score Grok dans le prototype) */
  combinedScore: number;
  reasonsYes: string[];
  reasonsNo: string[];
  bacFiliereCompatible: boolean;
  seuilCompatible: boolean;
  tier: 'recommended' | 'possible' | 'lastResort' | 'avoid';
  tierLabel: string;
};

export type OrientationReport = {
  profileTitle: string;
  profileSentence: string;
  /** Résumé identité / scolaire / notes pour le rapport */
  studentSummary: {
    fullName: string;
    studyLevel: string;
    bacLabel: string;
    city: string;
    notesLabel: string;
  };
  scores: DiagnosticScores;
  dominante: { primary: RiasecLetter; secondary: RiasecLetter; tertiary: RiasecLetter };
  forces: string[];
  vigilances: string[];
  families: FamilyReco[];
  metiers: MetierReco[];
  filieresSuggest: string[];
  ecolesStrategie: string[];
  /** Toutes les écoles actives classées (paliers mobile, sans IA) */
  ecolesRecommandees: OrientationSchoolReco[];
  diagnosticLabel: string;
  diagnosticBody: string;
  moteursOrdered: { key: keyof AmbitionScores; label: string; score: number }[];
  /** Choix explicites de l’étudiant (modules métiers / écoles / versus) */
  preferences: {
    sectors: string[];
    metiers: string[];
    salary: string;
    ecoles: PreferenceSchool[];
    versus: { id: string; kind: 'metier' | 'ecole'; winner: string; loser: string; round?: string }[];
    versusRankings?: {
      metiers: { id: string; label: string; rank: number }[];
      ecoles: { id: string; label: string; rank: number }[];
    };
  };
};
