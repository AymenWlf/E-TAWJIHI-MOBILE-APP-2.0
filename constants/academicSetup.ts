export type LabeledOption = { value: string; label: string; labelAr?: string };

export const NIVEAU_ETUDE_OPTIONS: LabeledOption[] = [
  { value: '', label: 'Sélectionnez un niveau...', labelAr: 'اختر مستوى...' },
  { value: '1ère année Baccalauréat', label: '1ère année Baccalauréat', labelAr: 'الأولى باك' },
  { value: '2ème année Baccalauréat', label: '2ème année Baccalauréat', labelAr: 'الثانية باك' },
  { value: 'BAC+1', label: 'BAC+1', labelAr: 'باك+1' },
  { value: 'BAC+2', label: 'BAC+2', labelAr: 'باك+2' },
  { value: 'BAC+3', label: 'BAC+3', labelAr: 'باك+3' },
  { value: 'BAC+4', label: 'BAC+4', labelAr: 'باك+4' },
  { value: 'BAC+5', label: 'BAC+5', labelAr: 'باك+5' },
  { value: 'BAC+6', label: 'BAC+6', labelAr: 'باك+6' },
  { value: 'Doctorant', label: 'Doctorant', labelAr: 'دكتوراه' },
  { value: 'Autre', label: 'Autre', labelAr: 'أخرى' },
];

export const BAC_TYPES = [
  { value: 'normal', label: 'Bac marocain', labelAr: 'باك مغربي' },
  { value: 'mission', label: 'Bac Mission', labelAr: 'باك فرنسي (ميسيون)' },
] as const;

/** Valeurs = libellés standard FR envoyés au backend ; label / labelAr = affichage selon la langue. */
export const FILIERE_BAC_OPTIONS: LabeledOption[] = [
  { value: '', label: 'Sélectionnez une option...', labelAr: 'اختر خيارًا...' },
  { value: 'Sciences Math A', label: 'Sciences Math A', labelAr: 'علوم رياضية أ' },
  { value: 'Sciences Math B', label: 'Sciences Math B', labelAr: 'علوم رياضية ب' },
  { value: 'Sciences Physique', label: 'Sciences Physique', labelAr: 'علوم فيزيائية' },
  { value: 'SVT', label: 'SVT', labelAr: 'علوم الحياة والأرض' },
  {
    value: 'Sciences et technologies électriques',
    label: 'Sciences et technologies électriques',
    labelAr: 'علوم وتكنولوجيات كهربائية',
  },
  {
    value: 'Sciences et technologies mécaniques',
    label: 'Sciences et technologies mécaniques',
    labelAr: 'علوم وتكنولوجيات ميكانيكية',
  },
  { value: 'Sciences économique', label: 'Sciences économique', labelAr: 'علوم اقتصادية' },
  {
    value: 'Sciences gestion comptable',
    label: 'Sciences gestion comptable',
    labelAr: 'علوم التدبير المحاسبي',
  },
  { value: 'Sciences agronomiques', label: 'Sciences agronomiques', labelAr: 'علوم زراعية' },
  { value: 'Lettres', label: 'Lettres', labelAr: 'آداب' },
  { value: 'Sciences humaines', label: 'Sciences humaines', labelAr: 'علوم إنسانية' },
  {
    value: 'Sciences de la chariaa',
    label: 'Sciences de la chariaa',
    labelAr: 'علوم الشرعية',
  },
  { value: 'Arts Appliqués', label: 'Arts Appliqués', labelAr: 'فنون تطبيقية' },
  { value: 'Autre', label: 'Autre', labelAr: 'أخرى' },
];

/**
 * Années scolaires d'obtention (ou en cours d'obtention) du baccalauréat,
 * proposées dans le setup et utilisées pour évaluer l'éligibilité aux annonces.
 * Aligné avec la liste du web admin (`E-TAWJIHI-GLOBAL-FRONT/constants/academicSetup.ts`).
 */
/**
 * Années scolaires du bac — alignées sur `E-TAWJIHI-GLOBAL-FRONT/src/constants/academicSetup.ts`.
 */
export const ANNEES_BAC_OPTIONS: LabeledOption[] = [
  { value: '', label: 'Sélectionnez une année...', labelAr: 'اختر السنة...' },
  { value: '2026-2027', label: '2026-2027', labelAr: '2026-2027' },
  { value: '2025-2026', label: '2025-2026', labelAr: '2025-2026' },
  { value: '2024-2025', label: '2024-2025', labelAr: '2024-2025' },
  { value: '2023-2024', label: '2023-2024', labelAr: '2023-2024' },
  { value: '2022-2023', label: '2022-2023', labelAr: '2022-2023' },
  { value: '2021-2022', label: '2021-2022', labelAr: '2021-2022' },
  { value: '2020-2021', label: '2020-2021', labelAr: '2020-2021' },
  { value: '2019-2020', label: '2019-2020', labelAr: '2019-2020' },
  { value: 'Autre', label: 'Autre', labelAr: 'أخرى' },
];

export const SPECIALITES_MISSION = [
  'Mathématiques',
  'Physique-Chimie',
  'SVT',
  'NSI',
  'SES',
  'HGGSP',
  'HLP',
  'LLCE',
  'Arts',
  'Technologique',
] as const;

/** Alias aligné web — utilisé par le rapport diagnostic (`schoolDiagnosticPayloadAdminDisplay`). */
export const NIVEAU_ETUDE_FORM_MAROC_OPTIONS: { value: string; label: string }[] = NIVEAU_ETUDE_OPTIONS.map(
  (o) => ({ value: o.value, label: o.label }),
);

/** Alias aligné web — valeurs identiques au diagnostic rapide. */
export const FILIERE_BAC_FORM_MAROC_OPTIONS: { value: string; label: string }[] = FILIERE_BAC_OPTIONS.map(
  (o) => ({ value: o.value, label: o.label }),
);

export const SPECIALITES_MISSION_LABELS: Record<string, string> = {
  Mathématiques: 'Mathématiques',
  'Physique-Chimie': 'Physique-Chimie',
  SVT: 'SVT (Sciences de la Vie et de la Terre)',
  NSI: 'Numérique et Sciences Informatiques (NSI)',
  SES: 'SES (Sciences Économiques et Sociales)',
  HGGSP: 'HGGSP (Histoire-Géo, Géopolitique, Sciences Politiques)',
  HLP: 'HLP (Humanités, Littérature, Philosophie)',
  LLCE: 'LLCE (Langues, Littératures et Cultures Étrangères)',
  Arts: 'Arts (Théâtre, Musique, Arts Plastiques...)',
  Technologique: 'Technologique (STMG, STI2D, STL, ...)',
};

export const TYPE_ECOLE_PREFERE: LabeledOption[] = [
  { value: 'public', label: 'Public', labelAr: 'عمومي' },
  { value: 'prive', label: 'Privé', labelAr: 'خصوصي' },
  { value: 'militaire', label: 'Militaire', labelAr: 'عسكري' },
  { value: 'semi-public', label: 'Semi-public', labelAr: 'شبه عمومي' },
] as const;

export const SERVICES_PREFERE: LabeledOption[] = [
  { value: 'orientation', label: 'Orientation', labelAr: 'التوجيه' },
  { value: 'inscription', label: 'Inscription', labelAr: 'التسجيل' },
  { value: 'notifications', label: 'Notifications', labelAr: 'الإشعارات' },
] as const;

