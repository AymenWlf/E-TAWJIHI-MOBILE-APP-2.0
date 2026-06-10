export type TassjilSchoolRegistrationStatus = 'not-open' | 'open' | 'closed';

export type TassjilSchool = {
  id: string;
  /** Nom FR (fiche établissement Dev2). */
  nom?: string | null;
  /** Nom AR (fiche établissement Dev2). */
  nomArabe?: string | null;
  schoolName: string;
  schoolNameArabic: string;
  sigle?: string | null;
  slug?: string | null;
  logo?: string | null;
  program: string | null;
  programArabic: string | null;
  city: string;
  sector: string | null;
  isSelected: boolean;
  websiteUrl: string | null;
  description: string | null;
  descriptionArabic: string | null;
  schoolType: string;
  diplomasOffered: string[];
  registrationStatus: TassjilSchoolRegistrationStatus;
  applicationStatus: string;
  acceptanceStatus: string;
  acceptedCity?: string | null;
  acceptedProgram?: string | null;
  statut_inscription?: string | null;
  statut_suivi?: string | null;
  dateDebutInscription?: string | null;
  dateFinInscription?: string | null;
  schoolId?: number | string;
  etablissementId?: number | string;
  /** Critères éligibilité (enrichis apinew) — filtrage client si besoin. */
  filieresAcceptees?: string[] | null;
  specialitesBacMissionAcceptees?: string[] | null;
};

export type TassjilDisplayMode = 'full_catalog' | 'selected_only';

export type TassjilPanierEcolesResponse = {
  success: boolean;
  data?: {
    selectedSchools: TassjilSchool[];
    availableSchools?: TassjilSchool[];
    totalCount?: number;
    /** TOP : écoles sélectionnées seulement ; PLUS : catalogue complet. */
    displayMode?: TassjilDisplayMode;
    userInfo?: {
      id: number;
      nom?: string;
      prenom?: string;
      telephone?: string;
    };
  };
  message?: string;
  code?: string;
};

export type LegacyLinkStatus = {
  linked: boolean;
  linkedAt?: string | null;
  requiresLink?: boolean;
  hasTassjilCandidate?: boolean;
  maskedOtpPhone?: string | null;
};

export type LegacyLinkInitiateResponse = {
  success: boolean;
  message?: string;
  data?: {
    linked?: boolean;
  };
};

export type LegacyLinkVerifyResponse = {
  success: boolean;
  message?: string;
};
