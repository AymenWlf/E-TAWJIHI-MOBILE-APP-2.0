import { buildApiUrl } from '@/constants/api';
import { httpGetJson, httpPostJson } from '@/services/http';
import type {
  CandidacyStatusType,
  CustomLink,
  EstablishmentBrief,
} from '@/types/inscriptions';
import { fireAndForget } from '@/utils/fireAndForget';
import type { ContestSiblingBrief } from '@/utils/contestAnnouncementSiblings';
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
  /** Libellé arabe du bouton CTA (optionnel, ex. tutoriel / données enrichies). */
  registrationUrlLabelAr?: string | null;
  ogImage: string | null;
  /** Liens utiles personnalisés (label + URL). */
  liensUtiles: CustomLink[];
  /** Critères d'éligibilité — Filières Bac Normal acceptées (vide = pas de filtrage). */
  filieresAcceptees: string[];
  /** Critères d'éligibilité — Spécialités Bac Mission acceptées (mode "OU" simple). */
  specialitesBacMissionAcceptees: string[];
  /** Critères d'éligibilité — Années scolaires du bac acceptées. */
  anneesBacAcceptees: string[];
  /**
   * Statuts de candidature autorisés par cette annonce (issus du
   * référentiel admin, déjà filtrés sur `is_active=true` côté backend).
   * Liste vide ⇒ aucune action de candidature : seul le suivi école est
   * possible (les CTA « Mettre à jour mon statut » sont masqués).
   */
  availableStatuses: CandidacyStatusType[];
  establishment: EstablishmentBrief | null;
  /** Messages publics Q&R (questions + réponses) pour l’icône commentaire sur la carte. */
  communityQnaMessageCount?: number;
  /** Payload limité côté API (TAWJIH PLUS / TASSJIL requis pour le détail). */
  previewOnly?: boolean;
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
  availableStatuses?: RawAvailableStatus[];
  communityQnaMessageCount?: number;
  previewOnly?: boolean;
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

type ListResponse = {
  success: boolean;
  data: RawCard[];
  meta?: { inscriptionsFullAccess?: boolean };
};

export type ContestAnnouncementsListResult = {
  items: ContestAnnouncementCard[];
  inscriptionsFullAccess: boolean;
};

/**
 * Forme brute d'un `CandidacyStatusType` côté API. On accepte les types
 * faibles (Partial / null) parce que le payload provient d'un controller
 * Symfony qui peut omettre certains champs et qu'on veut être tolérant
 * sans casser la liste si un statut est mal formé.
 */
type RawAvailableStatus = {
  id?: number;
  code?: string;
  labelFr?: string;
  labelAr?: string;
  icon?: string;
  colorFg?: string;
  colorBg?: string;
  colorBorder?: string;
  sortOrder?: number;
  isActive?: boolean;
  isEnrollmentMarker?: boolean;
  isFinalizedMarker?: boolean;
};

function normalizeAvailableStatuses(
  raw: RawAvailableStatus[] | undefined,
): CandidacyStatusType[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (s): s is RawAvailableStatus =>
        !!s && typeof s.id === 'number' && typeof s.code === 'string' && s.code.length > 0,
    )
    .map<CandidacyStatusType>((s) => ({
      id: s.id as number,
      code: s.code as string,
      labelFr: s.labelFr ?? '',
      labelAr: s.labelAr ?? '',
      icon: s.icon ?? 'circle',
      colorFg: s.colorFg ?? '#1D4ED8',
      colorBg: s.colorBg ?? '#DBEAFE',
      colorBorder: s.colorBorder ?? '#BFDBFE',
      sortOrder: typeof s.sortOrder === 'number' ? s.sortOrder : 0,
      isActive: s.isActive !== false,
      isEnrollmentMarker: s.isEnrollmentMarker === true,
      isFinalizedMarker: s.isFinalizedMarker === true,
    }));
}

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
    availableStatuses: normalizeAvailableStatuses(c.availableStatuses),
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
    communityQnaMessageCount:
      typeof c.communityQnaMessageCount === 'number' && Number.isFinite(c.communityQnaMessageCount)
        ? Math.max(0, Math.floor(c.communityQnaMessageCount))
        : undefined,
    previewOnly: c.previewOnly === true,
  };
}

function authHeaders(accessToken?: string | null): Record<string, string> | undefined {
  const token = (accessToken ?? '').trim();
  if (!token) return undefined;
  return { Authorization: `Bearer ${token}` };
}

export async function fetchContestAnnouncements(
  options?: { throwOnError?: boolean; accessToken?: string | null },
): Promise<ContestAnnouncementsListResult> {
  try {
    const url = buildApiUrl('/api/contest-announcements');
    const headers = authHeaders(options?.accessToken);
    const res = await httpGetJson<ListResponse>(url, headers ? { headers } : undefined);
    if (!res.success || !Array.isArray(res.data)) {
      return { items: [], inscriptionsFullAccess: false };
    }
    return {
      items: res.data.map(normalize),
      inscriptionsFullAccess: res.meta?.inscriptionsFullAccess === true,
    };
  } catch (e) {
    if (options?.throwOnError) throw e;
    return { items: [], inscriptionsFullAccess: false };
  }
}

let contestAnnouncementsListCache: {
  at: number;
  cacheKey: string;
  data: ContestAnnouncementCard[];
  inscriptionsFullAccess: boolean;
} | null = null;
const CONTEST_ANNOUNCEMENTS_LIST_CACHE_MS = 90_000;

/** Invalide le cache liste (pull-to-refresh / bouton actualiser accueil). */
export function clearContestAnnouncementsListCache(): void {
  contestAnnouncementsListCache = null;
}

/** Liste publiée avec court cache — évite un GET à chaque bulle du chat E‑MOWAJIH. */
export async function fetchContestAnnouncementsCached(
  accessToken?: string | null,
): Promise<ContestAnnouncementsListResult> {
  const now = Date.now();
  const cacheKey = (accessToken ?? '').trim() || 'anon';
  if (
    contestAnnouncementsListCache &&
    contestAnnouncementsListCache.cacheKey === cacheKey &&
    now - contestAnnouncementsListCache.at < CONTEST_ANNOUNCEMENTS_LIST_CACHE_MS
  ) {
    return {
      items: contestAnnouncementsListCache.data,
      inscriptionsFullAccess: contestAnnouncementsListCache.inscriptionsFullAccess,
    };
  }
  const result = await fetchContestAnnouncements({ accessToken });
  contestAnnouncementsListCache = {
    at: now,
    cacheKey,
    data: result.items,
    inscriptionsFullAccess: result.inscriptionsFullAccess,
  };
  return result;
}

/** Aligne une fiche détail sur la forme « carte liste » pour les mini-cards chat. */
export function contestDetailToListCard(d: ContestAnnouncementDetail): ContestAnnouncementCard {
  return {
    id: d.id,
    title: d.title,
    titleAr: d.titleAr,
    announcementType: d.announcementType,
    dateStart: d.dateStart,
    dateEnd: d.dateEnd,
    isOpen: d.isOpen,
    isExpire: d.isExpire,
    daysUntilClose: d.daysUntilClose,
    registrationUrl: d.registrationUrl,
    registrationUrlLabel: d.registrationUrlLabel,
    ogImage: d.ogImage,
    liensUtiles: d.liensUtiles,
    filieresAcceptees: d.filieresAcceptees,
    specialitesBacMissionAcceptees: d.specialitesBacMissionAcceptees,
    anneesBacAcceptees: d.anneesBacAcceptees,
    availableStatuses: d.availableStatuses,
    establishment: d.establishment
      ? {
          id: d.establishment.id,
          nom: d.establishment.nom,
          nomArabe: d.establishment.nomArabe,
          sigle: d.establishment.sigle,
          slug: d.establishment.slug,
          logo: d.establishment.logo,
          ville: d.establishment.ville,
          villes: d.establishment.villes,
          type: d.establishment.type,
        }
      : null,
    communityQnaMessageCount: undefined,
    previewOnly: d.previewOnly === true,
  };
}

/**
 * Annonces publiées d'un établissement précis (fiche école → section "Annonces").
 * Renvoie [] si aucun établissement ou en cas d'erreur réseau.
 */
export async function fetchContestAnnouncementsByEstablishment(
  establishmentId: number,
  options?: { accessToken?: string | null },
): Promise<ContestAnnouncementsListResult> {
  if (!Number.isFinite(establishmentId) || establishmentId <= 0) {
    return { items: [], inscriptionsFullAccess: false };
  }
  try {
    const url = buildApiUrl(`/api/contest-announcements/by-establishment/${establishmentId}`);
    const headers = authHeaders(options?.accessToken);
    const res = await httpGetJson<ListResponse>(url, headers ? { headers } : undefined);
    if (!res.success || !Array.isArray(res.data)) {
      return { items: [], inscriptionsFullAccess: false };
    }
    return {
      items: res.data.map(normalize),
      inscriptionsFullAccess: res.meta?.inscriptionsFullAccess === true,
    };
  } catch {
    return { items: [], inscriptionsFullAccess: false };
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
  /** Lien YouTube (tutoriel inscription) — optionnel */
  inscriptionTutorialYoutubeUrl: string | null;
  autresAnnoncesMemeEtablissement: ContestSiblingBrief[];
  metaTitle: string | null;
  metaDescription: string | null;
  liensUtiles: CustomLink[];
  documentsUtiles: CustomLink[];
  filieresAcceptees: string[];
  specialitesBacMissionAcceptees: string[];
  anneesBacAcceptees: string[];
  /** Statuts de candidature autorisés (cf. `ContestAnnouncementCard`). */
  availableStatuses: CandidacyStatusType[];
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
  previewOnly?: boolean;
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
  inscriptionTutorialYoutubeUrl?: string | null;
  autresAnnoncesMemeEtablissement?: ContestSiblingBrief[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  liensUtiles?: { titre?: string; url?: string }[];
  documentsUtiles?: { titre?: string; url?: string }[];
  filieresAcceptees?: string[];
  specialitesBacMissionAcceptees?: string[];
  anneesBacAcceptees?: string[];
  availableStatuses?: RawAvailableStatus[];
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
  previewOnly?: boolean;
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

function normalizeSiblingsBrief(raw: unknown): ContestSiblingBrief[] {
  if (!Array.isArray(raw)) return [];
  const out: ContestSiblingBrief[] = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const o = row as Record<string, unknown>;
    const id = typeof o.id === 'number' ? o.id : Number(o.id);
    if (!Number.isFinite(id) || id <= 0) continue;
    const titreSpecial = typeof o.titreSpecial === 'string' ? o.titreSpecial.trim() : '';
    if (!titreSpecial) continue;
    const dateDebut = typeof o.dateDebut === 'string' ? o.dateDebut : '';
    const dateFin = typeof o.dateFin === 'string' ? o.dateFin : '';
    if (!dateDebut || !dateFin) continue;
    out.push({
      id,
      titreSpecial,
      titreSpecialAr: typeof o.titreSpecialAr === 'string' ? o.titreSpecialAr : null,
      typeAnnonce: typeof o.typeAnnonce === 'string' ? o.typeAnnonce : '',
      dateDebut,
      dateFin,
      isOpen: Boolean(o.isOpen),
      isExpire: Boolean(o.isExpire),
      daysUntilClose: typeof o.daysUntilClose === 'number' ? o.daysUntilClose : undefined,
      ogImage: typeof o.ogImage === 'string' ? o.ogImage : null,
    });
  }
  return out;
}

function rawDetailEstablishment(d: RawDetail): NonNullable<RawDetail['etablissement']> | null {
  if (d.etablissement) return d.etablissement;
  const alt = (d as RawDetail & { establishment?: RawDetail['etablissement'] }).establishment;
  return alt ?? null;
}

function normalizeDetailEstablishment(
  e: NonNullable<RawDetail['etablissement']> | null,
): ContestAnnouncementDetail['establishment'] {
  return {
    id: e?.id ?? 0,
    nom: e?.nom ?? '',
    nomArabe: e?.nomArabe ?? null,
    sigle: e?.sigle ?? null,
    slug: e?.slug ?? null,
    logo: e?.logo ?? null,
    ville: e?.ville ?? null,
    villes: Array.isArray(e?.villes) ? e!.villes! : [],
    type: e?.type ?? null,
    telephone: e?.telephone ?? null,
    email: e?.email ?? null,
    siteWeb: e?.siteWeb ?? null,
    campuses: Array.isArray(e?.campuses)
      ? e!
          .campuses!.filter((c) => c && (c.nom || c.ville))
          .map((c) => ({ nom: (c.nom ?? '').trim(), ville: (c.ville ?? '').trim() }))
      : [],
  };
}

/** Garantit `establishment` après normalisation ou état partiel (cache / payload incomplet). */
export function ensureContestDetailEstablishment(
  d: ContestAnnouncementDetail,
): ContestAnnouncementDetail {
  if (d.establishment && typeof d.establishment === 'object') return d;
  return { ...d, establishment: normalizeDetailEstablishment(null) };
}

function normalizeDetail(d: RawDetail): ContestAnnouncementDetail {
  const days =
    d.daysUntilClose ?? computeDaysUntilClose(d.dateFermeture);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(d.dateOuverture);
  const end = new Date(d.dateFermeture);
  const etab = rawDetailEstablishment(d);
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
    inscriptionTutorialYoutubeUrl:
      typeof d.inscriptionTutorialYoutubeUrl === 'string' && d.inscriptionTutorialYoutubeUrl.trim() !== ''
        ? d.inscriptionTutorialYoutubeUrl.trim()
        : null,
    autresAnnoncesMemeEtablissement: normalizeSiblingsBrief(d.autresAnnoncesMemeEtablissement),
    metaTitle: d.metaTitle ?? null,
    metaDescription: d.metaDescription ?? null,
    liensUtiles: normalizeLinks(d.liensUtiles),
    documentsUtiles: normalizeLinks(d.documentsUtiles),
    filieresAcceptees: Array.isArray(d.filieresAcceptees) ? d.filieresAcceptees : [],
    specialitesBacMissionAcceptees: Array.isArray(d.specialitesBacMissionAcceptees)
      ? d.specialitesBacMissionAcceptees
      : [],
    anneesBacAcceptees: Array.isArray(d.anneesBacAcceptees) ? d.anneesBacAcceptees : [],
    availableStatuses: normalizeAvailableStatuses(d.availableStatuses),
    establishment: normalizeDetailEstablishment(etab),
    previewOnly: d.previewOnly === true,
  };
}

export type ContestAnnouncementDetailResult = {
  detail: ContestAnnouncementDetail;
  inscriptionsFullAccess: boolean;
};

export async function fetchContestAnnouncementDetail(
  id: number,
  options?: { throwOnError?: boolean; accessToken?: string | null },
): Promise<ContestAnnouncementDetailResult | null> {
  try {
    const url = buildApiUrl(`/api/contest-announcements/${id}`);
    const headers = authHeaders(options?.accessToken);
    const res = await httpGetJson<{
      success: boolean;
      data: RawDetail;
      meta?: { inscriptionsFullAccess?: boolean };
    }>(url, headers ? { headers } : undefined);
    if (!res.success || !res.data) return null;
    const raw = res.data;
    const payload: RawDetail =
      raw &&
      typeof raw === 'object' &&
      'detail' in raw &&
      raw.detail &&
      typeof raw.detail === 'object'
        ? (raw.detail as RawDetail)
        : raw;
    const meta =
      raw && typeof raw === 'object' && 'inscriptionsFullAccess' in raw
        ? (raw as { inscriptionsFullAccess?: boolean }).inscriptionsFullAccess
        : res.meta?.inscriptionsFullAccess;
    return {
      detail: ensureContestDetailEstablishment(normalizeDetail(payload)),
      inscriptionsFullAccess: meta === true || res.meta?.inscriptionsFullAccess === true,
    };
  } catch (e) {
    if (options?.throwOnError) throw e;
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
    fireAndForget(recordContestImpression(it.id, 'listing'));
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

export type ContestAnnouncementSeenState = {
  seenIds: Set<number>;
  unreadIds: Set<number>;
  /** Annonces publiées jamais ouvertes (point « non vue » sur les cards). */
  unseenIds: Set<number>;
};

/** État vu/lu serveur pour l'utilisateur connecté. */
export async function fetchContestAnnouncementSeenState(
  accessToken: string,
): Promise<ContestAnnouncementSeenState> {
  try {
    const url = buildApiUrl('/api/contest-announcements/seen-state');
    const res = await httpGetJson<{
      success: boolean;
      data?: { seenIds?: number[]; unreadIds?: number[]; unseenIds?: number[] };
    }>(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    const seen = (res.data?.seenIds ?? []).filter((v) => Number.isFinite(v) && v > 0);
    const unread = (res.data?.unreadIds ?? []).filter((v) => Number.isFinite(v) && v > 0);
    const unseen = (res.data?.unseenIds ?? []).filter((v) => Number.isFinite(v) && v > 0);
    return { seenIds: new Set(seen), unreadIds: new Set(unread), unseenIds: new Set(unseen) };
  } catch {
    return { seenIds: new Set(), unreadIds: new Set(), unseenIds: new Set() };
  }
}

/** Marque l'annonce vue côté serveur et les notifications liées comme lues. */
export async function markContestAnnouncementSeenApi(
  accessToken: string,
  contestId: number,
): Promise<{ notificationsMarkedRead: number }> {
  if (!Number.isFinite(contestId) || contestId <= 0) {
    return { notificationsMarkedRead: 0 };
  }
  try {
    const url = buildApiUrl(`/api/contest-announcements/${contestId}/mark-seen`);
    const res = await httpPostJson<
      { success: boolean; data?: { notificationsMarkedRead?: number } },
      { source: 'mobile' }
    >(url, { source: 'mobile' }, { headers: { Authorization: `Bearer ${accessToken}` } });
    return { notificationsMarkedRead: res.data?.notificationsMarkedRead ?? 0 };
  } catch {
    return { notificationsMarkedRead: 0 };
  }
}
