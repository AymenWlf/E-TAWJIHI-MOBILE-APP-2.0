import { buildApiUrl } from '@/constants/api';
import { httpGetJson, httpPostJson } from '@/services/http';
import type { CustomLink, EstablishmentBrief } from '@/types/inscriptions';
import { getMobileVisitorId } from '@/utils/visitorId';

/**
 * Le controller public renvoie un payload normalisé "card" :
 *   { id, titreSpecial, typeAnnonce, dateDebut, dateFin, lienInscription,
 *     ogImage, isOpen, isExpire, daysUntilClose,
 *     secteur, etablissement: { id, nom, nomArabe, sigle, slug, logo, ville, villes, type, … } }
 * On ré-aligne en camelCase pour l'app mobile.
 */
export type ContestAnnouncementCard = {
  id: number;
  title: string;
  /** Titre en arabe (priorité côté UI lorsque la locale est `ar`). */
  titleAr: string | null;
  announcementType: string;
  dateStart: string;
  dateEnd: string;
  isOpen: boolean;
  isExpire: boolean;
  /** Jours restants avant clôture (négatif si déjà clos). */
  daysUntilClose: number;
  registrationUrl: string;
  /** Libellé personnalisé du bouton CTA (vide ⇒ libellé par défaut selon le type). */
  registrationUrlLabel: string | null;
  ogImage: string | null;
  /** Liens utiles personnalisés (label + URL). */
  liensUtiles: CustomLink[];
  /** Critères d'éligibilité — Filières Bac Normal acceptées (vide = pas de filtrage). */
  filieresAcceptees: string[];
  /** Critères d'éligibilité — Spécialités Bac Mission acceptées (mode "OU" simple). */
  specialitesBacMissionAcceptees: string[];
  /** Critères d'éligibilité — Années scolaires du bac acceptées. */
  anneesBacAcceptees: string[];
  establishment: EstablishmentBrief | null;
};

type RawCard = {
  id: number;
  titreSpecial: string;
  titreSpecialAr?: string | null;
  typeAnnonce: string;
  dateDebut: string;
  dateFin: string;
  lienInscription?: string | null;
  registrationUrlLabel?: string | null;
  ogImage?: string | null;
  isOpen?: boolean;
  isExpire?: boolean;
  daysUntilClose?: number;
  liensUtiles?: Array<{ titre?: string; url?: string }>;
  filieresAcceptees?: string[];
  specialitesBacMissionAcceptees?: string[];
  anneesBacAcceptees?: string[];
  etablissement?: {
    id?: number;
    nom?: string;
    nomArabe?: string | null;
    sigle?: string | null;
    slug?: string | null;
    logo?: string | null;
    ville?: string | null;
    villes?: string[];
    type?: string | null;
  } | null;
};

type ListResponse = { success: boolean; data: RawCard[] };

function computeDaysUntilClose(dateEnd: string): number {
  const end = new Date(dateEnd);
  if (Number.isNaN(end.getTime())) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / 86_400_000);
}

function normalize(c: RawCard): ContestAnnouncementCard {
  const days = c.daysUntilClose ?? computeDaysUntilClose(c.dateFin);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(c.dateDebut);
  const end = new Date(c.dateFin);
  const liens: CustomLink[] = Array.isArray(c.liensUtiles)
    ? c.liensUtiles
        .map((l) => ({
          titre: typeof l?.titre === 'string' ? l.titre.trim() : '',
          url: typeof l?.url === 'string' ? l.url.trim() : '',
        }))
        .filter((l) => l.url.length > 0)
        .map((l) => ({ titre: l.titre || l.url, url: l.url }))
    : [];
  return {
    id: c.id,
    title: c.titreSpecial,
    titleAr: c.titreSpecialAr ?? null,
    announcementType: c.typeAnnonce,
    dateStart: c.dateDebut,
    dateEnd: c.dateFin,
    isOpen: c.isOpen ?? (today >= start && today <= end),
    isExpire: c.isExpire ?? today > end,
    daysUntilClose: days,
    registrationUrl: c.lienInscription ?? '',
    registrationUrlLabel:
      typeof c.registrationUrlLabel === 'string' && c.registrationUrlLabel.trim() !== ''
        ? c.registrationUrlLabel.trim()
        : null,
    ogImage: c.ogImage ?? null,
    liensUtiles: liens,
    filieresAcceptees: Array.isArray(c.filieresAcceptees) ? c.filieresAcceptees : [],
    specialitesBacMissionAcceptees: Array.isArray(c.specialitesBacMissionAcceptees)
      ? c.specialitesBacMissionAcceptees
      : [],
    anneesBacAcceptees: Array.isArray(c.anneesBacAcceptees) ? c.anneesBacAcceptees : [],
    establishment: c.etablissement
      ? {
          id: c.etablissement.id ?? 0,
          nom: c.etablissement.nom ?? '',
          nomArabe: c.etablissement.nomArabe ?? null,
          sigle: c.etablissement.sigle ?? null,
          slug: c.etablissement.slug ?? null,
          logo: c.etablissement.logo ?? null,
          ville: c.etablissement.ville ?? null,
          villes: Array.isArray(c.etablissement.villes) ? c.etablissement.villes : [],
          type: c.etablissement.type ?? null,
        }
      : null,
  };
}

export async function fetchContestAnnouncements(): Promise<ContestAnnouncementCard[]> {
  try {
    const url = buildApiUrl('/api/contest-announcements');
    const res = await httpGetJson<ListResponse>(url);
    if (!res.success || !Array.isArray(res.data)) return [];
    return res.data.map(normalize);
  } catch {
    return [];
  }
}

/**
 * Annonces publiées d'un établissement précis (fiche école → section "Annonces").
 * Renvoie [] si aucun établissement ou en cas d'erreur réseau.
 */
export async function fetchContestAnnouncementsByEstablishment(
  establishmentId: number,
): Promise<ContestAnnouncementCard[]> {
  if (!Number.isFinite(establishmentId) || establishmentId <= 0) return [];
  try {
    const url = buildApiUrl(`/api/contest-announcements/by-establishment/${establishmentId}`);
    const res = await httpGetJson<ListResponse>(url);
    if (!res.success || !Array.isArray(res.data)) return [];
    return res.data.map(normalize);
  } catch {
    return [];
  }
}

/** Type complet du payload renvoyé par `GET /api/contest-announcements/{id}` (`normalizeDetail`). */
export type ContestAnnouncementDetail = {
  id: number;
  title: string;
  titleAr: string | null;
  type: string;
  announcementType: string;
  dateStart: string;
  dateEnd: string;
  dateStartPrevious: string | null;
  dateEndPrevious: string | null;
  datePublication: string;
  isOpen: boolean;
  isExpire: boolean;
  isNouveau: boolean;
  daysUntilClose: number;
  description: string;
  descriptionAr: string | null;
  registrationUrl: string;
  /** Libellé personnalisé du bouton CTA (vide ⇒ libellé par défaut selon le type). */
  registrationUrlLabel: string | null;
  preRegistrationFee: string | null;
  ogImage: string | null;
  descriptionLeadImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  liensUtiles: CustomLink[];
  documentsUtiles: CustomLink[];
  filieresAcceptees: string[];
  specialitesBacMissionAcceptees: string[];
  anneesBacAcceptees: string[];
  establishment: {
    id: number;
    nom: string;
    nomArabe: string | null;
    sigle: string | null;
    slug: string | null;
    logo: string | null;
    ville: string | null;
    villes: string[];
    type: string | null;
    telephone: string | null;
    email: string | null;
    siteWeb: string | null;
    campuses: { nom: string; ville: string }[];
  };
};

type RawDetail = {
  id: number;
  titre: string;
  titreAr?: string | null;
  type: string;
  announcementType: string;
  dateOuverture: string;
  dateFermeture: string;
  dateOuverturePrecedente?: string | null;
  dateFermeturePrecedente?: string | null;
  datePublication: string;
  isOpen?: boolean;
  isExpire?: boolean;
  isNouveau?: boolean;
  daysUntilClose?: number;
  description: string;
  descriptionAr?: string | null;
  lienOfficiel?: string;
  registrationUrlLabel?: string | null;
  fraisPreinscription?: string | null;
  ogImage?: string | null;
  descriptionLeadImage?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  liensUtiles?: { titre?: string; url?: string }[];
  documentsUtiles?: { titre?: string; url?: string }[];
  filieresAcceptees?: string[];
  specialitesBacMissionAcceptees?: string[];
  anneesBacAcceptees?: string[];
  etablissement?: {
    id?: number;
    nom?: string;
    nomArabe?: string | null;
    sigle?: string | null;
    slug?: string | null;
    logo?: string | null;
    ville?: string | null;
    villes?: string[];
    type?: string | null;
    telephone?: string | null;
    email?: string | null;
    siteWeb?: string | null;
    campuses?: { nom?: string; ville?: string }[];
  } | null;
};

function normalizeLinks(raw?: { titre?: string; url?: string }[]): CustomLink[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((l) => ({
      titre: typeof l?.titre === 'string' ? l.titre.trim() : '',
      url: typeof l?.url === 'string' ? l.url.trim() : '',
    }))
    .filter((l) => l.url.length > 0)
    .map((l) => ({ titre: l.titre || l.url, url: l.url }));
}

function normalizeDetail(d: RawDetail): ContestAnnouncementDetail {
  const days =
    d.daysUntilClose ?? computeDaysUntilClose(d.dateFermeture);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(d.dateOuverture);
  const end = new Date(d.dateFermeture);
  return {
    id: d.id,
    title: d.titre ?? '',
    titleAr: d.titreAr ?? null,
    type: d.type ?? '',
    announcementType: d.announcementType ?? d.type ?? '',
    dateStart: d.dateOuverture,
    dateEnd: d.dateFermeture,
    dateStartPrevious: d.dateOuverturePrecedente ?? null,
    dateEndPrevious: d.dateFermeturePrecedente ?? null,
    datePublication: d.datePublication ?? d.dateOuverture,
    isOpen: d.isOpen ?? (today >= start && today <= end),
    isExpire: d.isExpire ?? today > end,
    isNouveau: d.isNouveau ?? false,
    daysUntilClose: days,
    description: d.description ?? '',
    descriptionAr: d.descriptionAr ?? null,
    registrationUrl: d.lienOfficiel ?? '',
    registrationUrlLabel:
      typeof d.registrationUrlLabel === 'string' && d.registrationUrlLabel.trim() !== ''
        ? d.registrationUrlLabel.trim()
        : null,
    preRegistrationFee: d.fraisPreinscription ?? null,
    ogImage: d.ogImage ?? null,
    descriptionLeadImage: d.descriptionLeadImage ?? null,
    metaTitle: d.metaTitle ?? null,
    metaDescription: d.metaDescription ?? null,
    liensUtiles: normalizeLinks(d.liensUtiles),
    documentsUtiles: normalizeLinks(d.documentsUtiles),
    filieresAcceptees: Array.isArray(d.filieresAcceptees) ? d.filieresAcceptees : [],
    specialitesBacMissionAcceptees: Array.isArray(d.specialitesBacMissionAcceptees)
      ? d.specialitesBacMissionAcceptees
      : [],
    anneesBacAcceptees: Array.isArray(d.anneesBacAcceptees) ? d.anneesBacAcceptees : [],
    establishment: {
      id: d.etablissement?.id ?? 0,
      nom: d.etablissement?.nom ?? '',
      nomArabe: d.etablissement?.nomArabe ?? null,
      sigle: d.etablissement?.sigle ?? null,
      slug: d.etablissement?.slug ?? null,
      logo: d.etablissement?.logo ?? null,
      ville: d.etablissement?.ville ?? null,
      villes: Array.isArray(d.etablissement?.villes) ? d.etablissement!.villes! : [],
      type: d.etablissement?.type ?? null,
      telephone: d.etablissement?.telephone ?? null,
      email: d.etablissement?.email ?? null,
      siteWeb: d.etablissement?.siteWeb ?? null,
      campuses: Array.isArray(d.etablissement?.campuses)
        ? d.etablissement!.campuses!
            .filter((c) => c && (c.nom || c.ville))
            .map((c) => ({ nom: (c.nom ?? '').trim(), ville: (c.ville ?? '').trim() }))
        : [],
    },
  };
}

export async function fetchContestAnnouncementDetail(
  id: number,
): Promise<ContestAnnouncementDetail | null> {
  try {
    const url = buildApiUrl(`/api/contest-announcements/${id}`);
    const res = await httpGetJson<{ success: boolean; data: RawDetail }>(url);
    if (!res.success || !res.data) return null;
    return normalizeDetail(res.data);
  } catch {
    return null;
  }
}

/**
 * Best-effort tracking d'une impression (silencieux).
 *
 * Tag `source: 'mobile'` (l'API agrège ensuite par canal côté admin) et
 * envoie le visitor ID stable de l'installation pour permettre le comptage
 * des **visiteurs uniques par jour** (et non seulement des hits bruts).
 */
export async function recordContestImpression(
  contestId: number,
  context: 'listing' | 'detail' = 'listing',
): Promise<void> {
  try {
    const visitorId = await getMobileVisitorId();
    const url = buildApiUrl('/api/contest-announcements/record-impression');
    await httpPostJson<
      { success: boolean },
      { contestId: number; context: string; source: 'mobile'; visitorId: string }
    >(url, {
      contestId,
      context,
      source: 'mobile',
      visitorId,
    });
  } catch {
    /* noop */
  }
}

/**
 * Cache module-level des IDs déjà comptabilisés en impression « listing »
 * pour la session en cours. Évite d'envoyer N fois la même mesure si la
 * liste est rechargée (pull-to-refresh, retour sur l'onglet, etc.).
 *
 * On accepte une légère sous-comptabilisation côté liste (quelques
 * impressions perdues si l'app est tuée) au profit d'un trafic réseau
 * minimal — les KPIs restent largement représentatifs.
 */
const sessionListingTracked = new Set<number>();

/**
 * Enregistre les impressions « listing » pour un lot d'annonces visibles,
 * en évitant les doublons sur la même session d'app. Best-effort, jamais
 * bloquant pour le rendu.
 */
export function recordContestListingImpressionsBatch(items: { id: number }[]): void {
  if (!items || items.length === 0) return;
  const fresh = items.filter((i) => Number.isFinite(i.id) && !sessionListingTracked.has(i.id));
  for (const it of fresh) {
    sessionListingTracked.add(it.id);
    // Fire-and-forget : un by-one keep-alive HTTP simple est suffisant
    // (pas de batching côté backend pour rester rétro-compatible web).
    void recordContestImpression(it.id, 'listing');
  }
}

/** Best-effort tracking d'un clic (silencieux). Voir `recordContestImpression`. */
export async function recordContestClick(
  contestId: number,
  context: 'listing' | 'detail' = 'listing',
): Promise<void> {
  try {
    const visitorId = await getMobileVisitorId();
    const url = buildApiUrl('/api/contest-announcements/record-click');
    await httpPostJson<
      { success: boolean },
      { contestId: number; context: string; source: 'mobile'; visitorId: string }
    >(url, {
      contestId,
      context,
      source: 'mobile',
      visitorId,
    });
  } catch {
    /* noop */
  }
}
