import { buildApiUrl } from '@/constants/api';
import { fallbackEstablishmentAvatarName, getEstablishmentFileUrl, getEstablishmentLogoUrl } from '@/constants/establishmentMedia';
import { httpGetJson } from '@/services/http';
import {
  dureeLabel,
  formatFraisScolarite,
  mergeDiplomes,
  villesListe,
  isConcours,
} from '@/utils/establishmentFormat';

export type PaginatedResponse<T> = {
  success: boolean;
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

/** Données brutes / enrichies API (liste + détail partagées). */
export type EstablishmentListItem = {
  id: number;
  slug: string;
  nom: string;
  sigle?: string;
  nomArabe?: string;
  description?: string;
  descriptionAr?: string;
  type?: string;
  ville?: string;
  villes?: string[];
  gratuit?: boolean;
  fraisScolariteMin?: string | number | null;
  fraisScolariteMax?: string | number | null;
  dureeEtudes?: number | null;
  dureeEtudesMin?: number | null;
  dureeEtudesMax?: number | null;
  anneesEtudes?: number | null;
  concours?: boolean | null;
  bacObligatoire?: boolean | null;
  diplomesDelivres?: string[];
  /** Raccourci API (comme sur le web enrichi) */
  diplomes?: string[];
  /** Critères d'éligibilité — Bac Normal (filières acceptées). */
  filieresAcceptees?: string[] | null;
  /** Critères d'éligibilité — Bac Mission (spécialités acceptées, mode « OU »). */
  specialitesBacMissionAcceptees?: string[] | null;
  /**
   * Critères d'éligibilité — Années scolaires du bac (optionnel, peu utilisé
   * au niveau école : surtout présent au niveau annonce).
   */
  anneesBacAcceptees?: string[] | null;
  nbFilieres?: number | null;
  boursesDisponibles?: boolean;
  bourseMin?: string | number | null;
  bourseMax?: string | number | null;
  typesBourse?: string[];
  echangeInternational?: boolean;
  accreditationEtat?: boolean;
  eTawjihiInscription?: boolean;
  isRecommended?: boolean;
  isSponsored?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  status?: string;
  universite?: string;
  /** Présent sur certains payloads enrichis (équivalent à `media.videoUrl`). */
  videoUrl?: string | null;
  media?: {
    logo?: string | null;
    imageCouverture?: string | null;
    videoUrl?: string | null;
    photos?: {
      id?: string;
      url?: string;
      titre?: string;
      fileName?: string;
      description?: string;
    }[];
    documents?: { url?: string; titre?: string; type?: string }[];
  };
  logo?: string | null;
  imageCouverture?: string | null;
  campus?: Record<string, unknown>[];
  location?: {
    ville?: string;
    villes?: string[];
    universite?: { id?: number; nom?: string } | null;
  };
  secteurs?: { id?: number; titre?: string; titreAr?: string | null }[];
  secteursIds?: number[];
  academicInfo?: {
    nbEtudiants?: number | null;
    nbFilieres?: number | null;
    diplomesDelivres?: string[] | null;
    anneesEtudes?: number | null;
    concours?: boolean | null;
    bacObligatoire?: boolean | null;
    echangeInternational?: boolean | null;
    accreditationEtat?: boolean | null;
  };
  contact?: {
    email?: string | null;
    telephone?: string | null;
    siteWeb?: string | null;
    adresse?: string | null;
  };
  /** Nombre d’utilisateurs qui suivent l’école (API liste / détail). */
  followersCount?: number;
  /** Questions + réponses publiques non masquées (Q&R établissement). */
  communityQnaMessageCount?: number;
  /** Référencement / sponsorisation — enrichi côté app depuis `/api/referencing/listing-placements`. */
  referencingPlacementId?: number | null;
  referencingGoalType?: 'traffic' | 'leadgen';
  referencingDestinationUrl?: string | null;
};

/** Valeurs pré-calculées pour l’UI (liste + détail). */
export type EstablishmentNormalized = EstablishmentListItem & {
  displayLogoUrl: string;
  displayCoverUrl: string | null;
  mergedDiplomes: string[];
  villesListe: string[];
  dureeLabel: string;
  fraisLabel: string;
  concoursAdmission: boolean;
};

export type EstablishmentListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  ville?: string;
  universite?: string;
  isRecommended?: boolean;
  isSponsored?: boolean;
  isFeatured?: boolean;
  echangeInternational?: boolean;
  accreditationEtat?: boolean;
  includeUnpublishedDetailPages?: boolean;
};

export async function listEstablishments(
  query: EstablishmentListQuery,
): Promise<PaginatedResponse<EstablishmentNormalized>> {
  const url = buildApiUrl('/api/establishments', {
    page: query.page ?? 1,
    limit: query.limit ?? 18,
    search: query.search?.trim() || undefined,
    type: query.type || undefined,
    ville: query.ville || undefined,
    universite: query.universite?.trim() || undefined,
    isRecommended: query.isRecommended ? 'true' : undefined,
    isSponsored: query.isSponsored ? 'true' : undefined,
    isFeatured: query.isFeatured ? 'true' : undefined,
    echangeInternational: query.echangeInternational ? 'true' : undefined,
    accreditationEtat: query.accreditationEtat ? 'true' : undefined,
    includeUnpublishedDetailPages: query.includeUnpublishedDetailPages ? 'true' : undefined,
  });
  const res = await httpGetJson<PaginatedResponse<EstablishmentListItem>>(url);
  return {
    ...res,
    data: res.data.map(normalizeEstablishment),
  };
}

export async function getEstablishmentByIdSlug(id: number, slug: string): Promise<EstablishmentNormalized> {
  const url = buildApiUrl(`/api/establishments/${id}/${encodeURIComponent(slug)}`);
  const res = await httpGetJson<{ success: boolean; data: EstablishmentListItem }>(url);
  return normalizeEstablishment(res.data);
}

/** Charge toutes les pages (max 100 éléments / page côté API) — pour filtres « web » côté client. */
export async function listAllEstablishments(query: Omit<EstablishmentListQuery, 'page' | 'limit'>): Promise<EstablishmentNormalized[]> {
  const limit = 100;
  const first = await listEstablishments({ ...query, page: 1, limit });
  const merged: EstablishmentNormalized[] = [...first.data];
  for (let p = 2; p <= first.pagination.pages; p++) {
    const r = await listEstablishments({ ...query, page: p, limit });
    merged.push(...r.data);
  }
  return merged;
}

function normalizeEstablishment(e: EstablishmentListItem): EstablishmentNormalized {
  const villesListeVal = villesListe(e);
  const mergedDiplomes = mergeDiplomes(e);

  const rawLogoPath = e.media?.logo ?? e.logo ?? undefined;
  const displayLogoUrl =
    getEstablishmentLogoUrl(rawLogoPath) ??
    fallbackEstablishmentAvatarName(e.nom ?? 'École', e.sigle);

  const coverPath = e.media?.imageCouverture ?? e.imageCouverture ?? null;
  const displayCoverUrl = getEstablishmentFileUrl(coverPath);

  return {
    ...e,
    displayLogoUrl,
    displayCoverUrl,
    mergedDiplomes,
    villesListe: villesListeVal,
    dureeLabel: dureeLabel(e),
    fraisLabel: formatFraisScolarite(e),
    concoursAdmission: isConcours(e),
  };
}
