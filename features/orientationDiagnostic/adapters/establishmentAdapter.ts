import type {
  EstablishmentListItem,
  EstablishmentNormalized,
} from '@/services/establishments';

/** Shape attendue par le moteur diagnostic (alignée sur le front web). */
export interface EstablishmentSecteur {
  id: number;
  titre: string;
  code?: string;
}

export interface EstablishmentCampus {
  id?: number;
  nom?: string;
  ville?: string | { titre?: string } | null;
  city?: { id?: number; titre?: string } | null;
}

export interface EstablishmentLocation {
  ville?: string;
  villes?: string[];
  universite?: { id?: number; nom?: string };
}

export interface Establishment {
  id?: number;
  nom: string;
  sigle: string;
  nomArabe?: string;
  type: string;
  ville: string;
  villes?: string[];
  slug: string;
  logo?: string;
  description?: string;
  location?: EstablishmentLocation;
  campus?: EstablishmentCampus[];
  concours: boolean;
  afficherEtudeDossierPublic?: boolean;
  accreditationEtat: boolean;
  echangeInternational: boolean;
  bacObligatoire: boolean;
  isActive: boolean;
  isRecommended: boolean;
  isSponsored: boolean;
  isFeatured: boolean;
  noIndex: boolean;
  isComplet: boolean;
  hasDetailPage: boolean;
  orientationPlan?: 'A' | 'B' | 'C' | 'D' | null;
  admissionType?: string | null;
  /** Faculté / univ. publique accès ouvert (groupe accordéon). */
  facultePubliqueAccesOuvert?: boolean;
  bacType?: string;
  filieresAcceptees?: string[];
  combinaisonsBacMission?: string[][];
  specialitesBacMissionAcceptees?: string[];
  secteursIds?: number[];
  secteurs?: EstablishmentSecteur[];
  diplomesDelivres?: string[];
  diplomes?: string[];
  fraisScolariteMin?: string;
  fraisScolariteMax?: string;
  dureeEtudes?: string | number | null;
  dureeEtudesMin?: number;
  dureeEtudesMax?: number;
  anneesEtudes?: number | string | null;
  seuilsAdmission?: Record<string, unknown> | null;
}

export type PaginatedResponse<T> = {
  success: boolean;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

type ApiExtraFields = {
  orientationPlan?: Establishment['orientationPlan'];
  admissionType?: string | null;
  facultePubliqueAccesOuvert?: boolean;
  bacType?: string;
  combinaisonsBacMission?: string[][];
};

function readExtra(raw: EstablishmentListItem): ApiExtraFields {
  const r = raw as EstablishmentListItem & ApiExtraFields;
  return {
    orientationPlan: r.orientationPlan ?? null,
    admissionType: r.admissionType ?? null,
    facultePubliqueAccesOuvert: Boolean(r.facultePubliqueAccesOuvert),
    bacType: r.bacType,
    combinaisonsBacMission: r.combinaisonsBacMission,
  };
}

/** Normalise un établissement mobile → modèle diagnostic web. */
export function toDiagnosticEstablishment(e: EstablishmentNormalized): Establishment {
  const extra = readExtra(e);
  const concours =
    e.concoursAdmission ??
    (e.academicInfo?.concours != null ? Boolean(e.academicInfo.concours) : false);

  return {
    id: e.id,
    nom: e.nom,
    sigle: e.sigle?.trim() || e.nom.slice(0, 12),
    nomArabe: e.nomArabe,
    type: e.type?.trim() || '',
    ville: e.ville?.trim() || e.villesListe[0] || '',
    villes: e.villes?.length ? e.villes : e.villesListe,
    slug: e.slug,
    logo: e.media?.logo ?? e.logo ?? undefined,
    description: e.description,
    location: e.location as EstablishmentLocation | undefined,
    campus: e.campus as EstablishmentCampus[] | undefined,
    concours,
    afficherEtudeDossierPublic: e.afficherEtudeDossierPublic,
    accreditationEtat: Boolean(e.accreditationEtat),
    echangeInternational: Boolean(e.echangeInternational),
    bacObligatoire: Boolean(e.bacObligatoire),
    isActive: e.isActive !== false && e.status !== 'inactive',
    isRecommended: Boolean(e.isRecommended),
    isSponsored: Boolean(e.isSponsored),
    isFeatured: Boolean(e.isFeatured),
    noIndex: false,
    isComplet: true,
    hasDetailPage: true,
    orientationPlan: extra.orientationPlan ?? null,
    admissionType: extra.admissionType ?? null,
    facultePubliqueAccesOuvert: extra.facultePubliqueAccesOuvert === true,
    bacType: extra.bacType,
    filieresAcceptees: e.filieresAcceptees ?? undefined,
    combinaisonsBacMission: extra.combinaisonsBacMission,
    specialitesBacMissionAcceptees: e.specialitesBacMissionAcceptees ?? undefined,
    secteursIds: e.secteursIds,
    secteurs: e.secteurs?.map((s) => ({
      id: s.id ?? 0,
      titre: s.titre ?? '',
      code: undefined,
    })),
    diplomesDelivres: e.mergedDiplomes,
    diplomes: e.mergedDiplomes,
    fraisScolariteMin:
      e.fraisScolariteMin != null && e.fraisScolariteMin !== ''
        ? String(e.fraisScolariteMin)
        : undefined,
    fraisScolariteMax:
      e.fraisScolariteMax != null && e.fraisScolariteMax !== ''
        ? String(e.fraisScolariteMax)
        : undefined,
    dureeEtudes: e.dureeEtudes ?? e.dureeLabel ?? null,
    dureeEtudesMin: e.dureeEtudesMin ?? undefined,
    dureeEtudesMax: e.dureeEtudesMax ?? undefined,
    anneesEtudes: e.anneesEtudes ?? e.academicInfo?.anneesEtudes ?? null,
    seuilsAdmission:
      e.seuilsAdmission != null && typeof e.seuilsAdmission === 'object'
        ? (e.seuilsAdmission as Record<string, unknown>)
        : null,
  };
}
