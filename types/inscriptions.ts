/**
 * Types partagés pour le système Inscriptions / Suivi de candidature.
 *
 * Source : `RegistrationCandidacyController`, `ContestAnnouncementController`,
 * `EstablishmentFollowController` et `CandidacyStatusTypeController`.
 *
 * Refonte 2026-05 : les statuts de candidature ne sont plus une union
 * littérale mais une référence vers le catalogue admin
 * `CandidacyStatusType` (couleurs, libellés FR/AR, icône, ordre, etc.).
 * Chaque annonce expose la liste des statuts qu'elle autorise via
 * `availableStatuses`. Une candidature peut avoir un statut `null` :
 * l'utilisateur a souscrit sans déclarer d'action explicite.
 */

/**
 * Statut de candidature configurable côté admin.
 * Le `code` (snake_case) reste stable pour relier les events historiques
 * même après renommage des libellés ; les valeurs visuelles sont
 * directement appliquées par les composants (pas de mapping en dur).
 */
export type CandidacyStatusType = {
  id: number;
  code: string;
  labelFr: string;
  labelAr: string;
  /** Nom d'icône FontAwesome (ex. `star`, `check-circle`). */
  icon: string;
  /** Couleur d'accent (texte / icône) au format hex `#RRGGBB`. */
  colorFg: string;
  /** Couleur de fond du badge. */
  colorBg: string;
  /** Couleur de bordure du badge. */
  colorBorder: string;
  sortOrder: number;
  isActive: boolean;
  /**
   * Quand `true`, l'arrivée à ce statut marque la candidature comme
   * « inscription administrative effectuée » (cf. backend
   * `RegistrationCandidacyController::applyStatusTimestamps`).
   */
  isEnrollmentMarker: boolean;
  /**
   * Quand `true`, la candidature est considérée comme terminée (refus ou
   * issue finale) : plus de relance « mettre à jour le statut ».
   */
  isFinalizedMarker: boolean;
};

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
  /**
   * Sous-ensemble du catalogue admin que l'étudiant pourra sélectionner
   * pour cette annonce (ordonné dans l'ordre voulu par l'admin).
   * Liste vide ⇒ aucune action de candidature possible (seul le suivi
   * école reste accessible).
   */
  availableStatuses: CandidacyStatusType[];
  establishment: EstablishmentBrief | null;
  /** Compteur public Q&R (liste suivi école), si exposé par l’API. */
  communityQnaMessageCount?: number;
  /** Payload limité (TAWJIH PLUS / TASSJIL requis). */
  previewOnly?: boolean;
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
  /**
   * Code (snake_case) du statut **avant** le changement, snapshot au
   * moment de l'event. `null` si l'event n'est pas un changement de
   * statut ou si la candidature n'avait aucun statut auparavant. Le code
   * est conservé tel quel même si le statut est ensuite supprimé.
   */
  oldStatus: string | null;
  /** Code (snake_case) du statut **après** le changement. */
  newStatus: string | null;
  message: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type Candidacy = {
  id: number;
  /**
   * Statut courant de la candidature. `null` quand l'utilisateur a juste
   * souscrit sans choisir d'action (ou si l'annonce n'autorise plus aucun
   * statut). Sinon, objet complet (couleur/libellé/icône) renvoyé par le
   * backend, prêt à afficher.
   */
  status: CandidacyStatusType | null;
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

export type CandidacyListResponse = {
  data: Candidacy[];
  /**
   * Compte par code de statut (ex. `{ "interested": 3, "applied": 1, "null": 2 }`).
   * La clé `null` regroupe les candidatures sans statut explicite.
   */
  counts: Record<string, number>;
  /** Catalogue actif (ordonné), pour rendre les filtres et la timeline. */
  statuses: CandidacyStatusType[];
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

/**
 * Suivi d'un établissement par l'utilisateur — porte également le statut
 * de candidature de l'utilisateur sur cette école (refonte UX 2026-05).
 *
 * `availableStatuses` est l'**union** des statuts autorisés par toutes
 * les annonces publiées de l'école, calculée par le backend. Vide ⇒
 * aucune action de modification de statut possible côté UI.
 */
export type EstablishmentFollow = {
  id: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  establishment: EstablishmentBrief | null;
  /**
   * Statut courant. Initialisé à `interested` (slug conventionnel) au
   * follow ; modifiable ensuite via `updateFollowStatus`. `null` si l'admin
   * a supprimé le statut référencé ou si l'utilisateur l'a effacé.
   */
  status: CandidacyStatusType | null;
  /** Statuts proposables (union des annonces de l'école), triés. */
  availableStatuses: CandidacyStatusType[];
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
  /** Libellés arabes (si absents, l’UI retombe sur `title` / `message`). */
  titleAr?: string | null;
  messageAr?: string | null;
  type: string;
  isRead: boolean;
  createdAt: string;
  timeAgo: string;
  timeAgoAr?: string | null;
  metadata: Record<string, unknown> | null;
};

export type NotificationsListResponse = {
  items: AppNotification[];
  total: number;
  unreadCount: number;
};
