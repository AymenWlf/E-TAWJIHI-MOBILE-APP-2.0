import type { ContestAnnouncementCard } from '@/services/contestAnnouncements';
import type { CandidacyStatusType } from '@/types/inscriptions';

/** Slugs établissement FGSES (alignés fiche école / API). */
export const TOUR_FGSES_ESTABLISHMENT_SLUG = 'um6p-fgses-faculte-gouvernance-sciences-economiques-sociales';
export const TOUR_FGSES_ESTABLISHMENT_SLUG_LEGACY = 'fgses-ain-sebaa';

/** Étapes du tutoriel « Gestion des inscriptions ». */
export const APPLY_TO_SCHOOLS_TOUR_STEPS = [
  'notification_tease',
  'push_preview',
  'announcement_card',
  'registration_link',
  'follow_action',
  'status_action',
  'inscriptions_tabs',
  'candidacies_tab',
  'candidacy_card',
  'bravo',
] as const;

export type ApplyToSchoolsTourStepId = (typeof APPLY_TO_SCHOOLS_TOUR_STEPS)[number];

export const APPLY_TO_SCHOOLS_TOUR_STEP_COUNT = APPLY_TO_SCHOOLS_TOUR_STEPS.length;

/** Statuts de démo alignés sur le catalogue backend (dont admission définitive). */
const DEMO_STATUSES: CandidacyStatusType[] = [
  {
    id: 901,
    code: 'interested',
    labelFr: 'Intéressé',
    labelAr: 'مهتم',
    icon: 'star',
    colorFg: '#1D4ED8',
    colorBg: '#DBEAFE',
    colorBorder: '#BFDBFE',
    sortOrder: 10,
    isActive: true,
    isEnrollmentMarker: false,
    isFinalizedMarker: false,
  },
  {
    id: 902,
    code: 'applied',
    labelFr: 'J’ai candidaté',
    labelAr: 'قدّمتُ طلبي',
    icon: 'paper-plane',
    colorFg: '#1E40AF',
    colorBg: '#DBEAFE',
    colorBorder: '#BFDBFE',
    sortOrder: 20,
    isActive: true,
    isEnrollmentMarker: false,
    isFinalizedMarker: false,
  },
  {
    id: 910,
    code: 'admitted',
    labelFr: 'Admis définitivement',
    labelAr: 'مقبول بشكل نهائي',
    icon: 'check-circle',
    colorFg: '#15803D',
    colorBg: '#DCFCE7',
    colorBorder: '#BBF7D0',
    sortOrder: 100,
    isActive: true,
    isEnrollmentMarker: false,
    isFinalizedMarker: false,
  },
  {
    id: 911,
    code: 'admitted_and_enrolled',
    labelFr: 'Admis et inscrit',
    labelAr: 'مقبول ومسجَّل',
    icon: 'graduation-cap',
    colorFg: '#064E3B',
    colorBg: '#86EFAC',
    colorBorder: '#34D399',
    sortOrder: 120,
    isActive: true,
    isEnrollmentMarker: true,
    isFinalizedMarker: true,
  },
];

const FGSES_ESTABLISHMENT = {
  id: 2410,
  nom: 'Faculté de Gouvernance, des Sciences Economiques et Sociales',
  nomArabe: 'كلية الحوكمة والعلوم الاقتصادية والاجتماعية',
  sigle: 'UM6P-FGSES',
  slug: TOUR_FGSES_ESTABLISHMENT_SLUG,
  logo: 'Logo-ecoles-E-TAWJIHI-67631fe5e54b6.jpg',
  ville: 'Salé',
  villes: ['Salé'],
  type: 'Semi-public',
} as const;

/** Repli hors-ligne si l’API ne renvoie pas encore l’annonce FGSES. */
export const TOUR_DEMO_FGSES_ANNOUNCEMENT: ContestAnnouncementCard = {
  id: 1,
  title: 'Annonce de concours FGSES - UM6P : Ouverture des inscriptions',
  titleAr: 'إعلان مسابقة FGSES - UM6P : فتح التسجيلات',
  announcementType: "Ouverture d'inscription",
  dateStart: '2026-05-01',
  dateEnd: '2026-06-30',
  isOpen: true,
  isExpire: false,
  daysUntilClose: 18,
  registrationUrl: 'https://admission.fgses-um6p.ma/login',
  registrationUrlLabel: "Lien d'inscription officiel",
  registrationUrlLabelAr: 'رابط التسجيل الرسمي',
  ogImage: null,
  liensUtiles: [],
  filieresAcceptees: [],
  specialitesBacMissionAcceptees: [],
  anneesBacAcceptees: [],
  availableStatuses: DEMO_STATUSES,
  establishment: { ...FGSES_ESTABLISHMENT },
  communityQnaMessageCount: 3,
};

export const TOUR_DEMO_STATUSES = DEMO_STATUSES;

/** Codes proposés à l’étape 6 « Statut de candidature » (sheet limitée). */
export const TOUR_STATUS_ACTION_STEP_CODES = ['applied', 'not_interested'] as const;

/** Repli si l’API ne renvoie pas encore ces libellés. */
export const TOUR_STATUS_ACTION_STEP_STATUSES: CandidacyStatusType[] = [
  {
    id: 920,
    code: 'applied',
    labelFr: 'Inscrit',
    labelAr: 'مسجَّل',
    icon: 'paper-plane',
    colorFg: '#1E40AF',
    colorBg: '#DBEAFE',
    colorBorder: '#BFDBFE',
    sortOrder: 20,
    isActive: true,
    isEnrollmentMarker: false,
    isFinalizedMarker: false,
  },
  {
    id: 921,
    code: 'not_interested',
    labelFr: 'Non intéressé',
    labelAr: 'غير مهتم',
    icon: 'ban',
    colorFg: '#6B7280',
    colorBg: '#F3F4F6',
    colorBorder: '#D1D5DB',
    sortOrder: 25,
    isActive: true,
    isEnrollmentMarker: false,
    isFinalizedMarker: false,
  },
];

/** Codes proposés à l’étape 9 « Action requise » (candidatures). */
export const TOUR_CANDIDACY_CARD_STEP_CODES = ['admitted_contest', 'not_admitted_contest'] as const;

/** Repli si l’API ne renvoie pas encore ces libellés. */
export const TOUR_CANDIDACY_CARD_STEP_STATUSES: CandidacyStatusType[] = [
  {
    id: 930,
    code: 'admitted_contest',
    labelFr: 'Admis au concours',
    labelAr: 'مقبول في المباراة',
    icon: 'check-circle',
    colorFg: '#15803D',
    colorBg: '#DCFCE7',
    colorBorder: '#BBF7D0',
    sortOrder: 50,
    isActive: true,
    isEnrollmentMarker: false,
    isFinalizedMarker: true,
  },
  {
    id: 931,
    code: 'not_admitted_contest',
    labelFr: 'Non admis au concours',
    labelAr: 'غير مقبول في المباراة',
    icon: 'times-circle',
    colorFg: '#B91C1C',
    colorBg: '#FEE2E2',
    colorBorder: '#FECACA',
    sortOrder: 80,
    isActive: true,
    isEnrollmentMarker: false,
    isFinalizedMarker: true,
  },
];
