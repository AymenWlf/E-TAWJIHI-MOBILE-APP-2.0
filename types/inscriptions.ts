/**
 * Types partagés pour le système Inscriptions / Suivi de candidature.
 * Source : RegistrationCandidacyController, ContestAnnouncementController, NotificationController.
 */

export type CandidacyStatus =
  | 'interested'
  | 'applied'
  | 'pre_admitted'
  | 'admitted'
  | 'enrolled'
  | 'rejected'
  | 'withdrawn';

export const ALL_CANDIDACY_STATUSES: CandidacyStatus[] = [
  'interested',
  'applied',
  'pre_admitted',
  'admitted',
  'enrolled',
  'rejected',
  'withdrawn',
];

export type EstablishmentBrief = {
  id: number;
  nom: string;
  nomArabe?: string | null;
  sigle?: string | null;
  slug?: string | null;
  logo?: string | null;
  ville?: string | null;
  villes?: string[];
  type?: string | null;
};

export type CustomLink = {
  /** Libellé affiché à l'utilisateur. Si vide côté serveur, l'URL est utilisée. */
  titre: string;
  url: string;
};

export type AnnouncementBrief = {
  id: number;
  title: string;
  /** Titre en arabe (priorité côté UI lorsque la locale est `ar`). */
  titleAr?: string | null;
  /** Description HTML (FR). Optionnelle dans certaines réponses légères. */
  descriptionHtml?: string | null;
  /** Description HTML en arabe (priorité côté UI lorsque la locale est `ar`). */
  descriptionHtmlAr?: string | null;
  announcementType: string;
  badgeType: string;
  dateStart: string;
  dateEnd: string;
  datePublication?: string | null;
  isOpen: boolean;
  isExpire: boolean;
  /** Jours restants avant la clôture (négatif si déjà clos). */
  daysUntilClose?: number;
  registrationUrl: string;
  /** Libellé personnalisé du bouton CTA (vide ⇒ libellé par défaut selon le type). */
  registrationUrlLabel?: string | null;
  preRegistrationFee: string | null;
  feesMin: string | null;
  feesMax: string | null;
  ogImage: string | null;
  /** Liens utiles personnalisés (label + url). */
  liensUtiles?: CustomLink[];
  /** Critères d'éligibilité — Filières Bac Normal acceptées (vide = pas de filtrage). */
  filieresAcceptees?: string[];
  /** Critères d'éligibilité — Spécialités Bac Mission acceptées (mode "OU" simple). */
  specialitesBacMissionAcceptees?: string[];
  /** Critères d'éligibilité — Années scolaires du bac acceptées. */
  anneesBacAcceptees?: string[];
  establishment: EstablishmentBrief | null;
};

export type CandidacyEventType =
  | 'created'
  | 'status_changed'
  | 'link_visited'
  | 'note_added'
  | 'deadline_reminder'
  | 'announcement_update';

export type CandidacyEvent = {
  id: number;
  type: CandidacyEventType;
  oldStatus: CandidacyStatus | null;
  newStatus: CandidacyStatus | null;
  message: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type Candidacy = {
  id: number;
  status: CandidacyStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  registrationLinkVisitedAt: string | null;
  appliedAt: string | null;
  enrolledAt: string | null;
  announcement: AnnouncementBrief | null;
  /** Présent dans la liste, null dans l'objet timeline. */
  lastEvent: CandidacyEvent | null;
};

export type CandidacyTimelinePayload = {
  candidacy: Candidacy;
  events: CandidacyEvent[];
  relatedAnnouncements: AnnouncementBrief[];
};

/* ─────────────── Suivi école-niveau ─────────────── */

export type EstablishmentFollowStats = {
  /** Nombre d'annonces (publiées, < 18 mois) connues pour l'école. */
  totalAnnouncements: number;
  /** Nombre d'annonces ouvertes aujourd'hui. */
  openAnnouncements: number;
  /** Nombre de candidatures (par annonce) que l'utilisateur a démarrées sur cette école. */
  candidaciesCount: number;
};

/** Évènement de timeline agrégée à l'échelle école (peut référencer une annonce). */
export type EstablishmentFollowEvent = CandidacyEvent & {
  announcementId: number | null;
  announcementTitle: string | null;
  announcementTitleAr: string | null;
  candidacyId: number | null;
};

export type EstablishmentFollow = {
  id: number;
  status: CandidacyStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  establishment: EstablishmentBrief | null;
  stats: EstablishmentFollowStats;
  latestAnnouncement: AnnouncementBrief | null;
  latestEvent: EstablishmentFollowEvent | null;
};

export type EstablishmentFollowTimeline = {
  follow: EstablishmentFollow;
  events: EstablishmentFollowEvent[];
  announcements: AnnouncementBrief[];
};

export type EstablishmentFollowState = {
  isFollowing: boolean;
  follow: EstablishmentFollow | null;
};

export type AppNotification = {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  timeAgo: string;
  metadata: Record<string, unknown> | null;
};

export type NotificationsListResponse = {
  items: AppNotification[];
  total: number;
  unreadCount: number;
};
