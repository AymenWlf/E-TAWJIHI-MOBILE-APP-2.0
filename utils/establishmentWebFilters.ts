import type { EstablishmentNormalized } from '@/services/establishments';
import {
  matchesAcceptedStudyPathFilter,
  type AcceptedStudyPathFilter,
} from '@/utils/eligibility';

/** Liste diplômes alignée sur `EcolesSupérieures.tsx` (Global Front). */
export const DIPLOME_OPTIONS = [
  'CPGE',
  'BTS',
  'DUT',
  'DEUG',
  'DEUST',
  'TS',
  'Licence',
  'Licence Professionnel',
  "Licence d'excellence",
  'Bachelor',
  'Master',
  'Master spécialisé',
  "Cycle d'ingénieur",
  'Médecine',
  "Diplôme d'Architecture",
  'Doctorat',
] as const;

function parseFee(n: unknown): number | null {
  if (n === null || n === undefined || n === '') return null;
  if (typeof n === 'number' && Number.isFinite(n)) return n;
  const s = String(n).replace(/\s/g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  const v = Number.parseFloat(s);
  return Number.isFinite(v) ? v : null;
}

/** Bornes numériques pour le chevauchement de fourchette (comme le listing web). */
export function establishmentFeeNumericBounds(e: EstablishmentNormalized): { min: number; max: number } {
  const mn = parseFee(e.fraisScolariteMin);
  const mx = parseFee(e.fraisScolariteMax);
  if (mn != null && mx != null) return { min: mn, max: mx };
  if (mn != null) return { min: mn, max: mn };
  if (mx != null) return { min: mx, max: mx };
  return { min: 0, max: 0 };
}

/** `e.fraisMax >= fMin && e.fraisMin <= fMax` (intervalles). */
export function feesOverlapFilter(e: EstablishmentNormalized, fMin: number, fMax: number): boolean {
  const { min: emin, max: emax } = establishmentFeeNumericBounds(e);
  return emax >= fMin && emin <= fMax;
}

export type WebLikeClientFilters = {
  secteurId: number | null;
  /** Titres de villes autorisées pour ce filtre région (pré-calculé depuis /api/cities). */
  villesInRegion: Set<string> | null;
  /** Ville exacte (web: `e.villes.includes(filters.ville)`). */
  villeExact: string | null;
  diplomeExact: string | null;
  fraisMin: number;
  fraisMax: number;
};

export function applyEstablishmentWebClientFilters(
  items: EstablishmentNormalized[],
  f: WebLikeClientFilters,
): EstablishmentNormalized[] {
  let out = items;

  if (f.secteurId != null) {
    const sid = f.secteurId;
    out = out.filter((e) => Array.isArray(e.secteursIds) && e.secteursIds.includes(sid));
  }

  if (f.villesInRegion && f.villesInRegion.size > 0) {
    out = out.filter((e) => e.villesListe.some((v) => f.villesInRegion!.has(v.trim())));
  }

  if (f.villeExact?.trim()) {
    const v = f.villeExact.trim();
    out = out.filter((e) => e.villesListe.includes(v));
  }

  if (f.diplomeExact?.trim()) {
    const d = f.diplomeExact.trim().toLowerCase();
    out = out.filter((e) => e.mergedDiplomes.some((x) => x.toLowerCase() === d));
  }

  out = out.filter((e) => feesOverlapFilter(e, f.fraisMin, f.fraisMax));

  return out;
}

/** Tri : sponsorisés en premier, puis ordre stable par id (aligné listing web). */
export function sortSponsoredFirst(items: EstablishmentNormalized[]): EstablishmentNormalized[] {
  return [...items].sort((a, b) => {
    const sa = Boolean(a.isSponsored);
    const sb = Boolean(b.isSponsored);
    if (sa && !sb) return -1;
    if (!sa && sb) return 1;
    return a.id - b.id;
  });
}

/** Même forme que les entrées de `fetchListingPlacementsByEstablishment` (champs utiles au tri). */
export type EstablishmentListingPlacementLike = {
  placementId: number;
  isSponsored: boolean;
};

/** Fisher–Yates sur copie — aligné `EcolesSupérieures.tsx`. */
export function shuffleEstablishmentsCopy<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = out[i]!;
    out[i] = out[j]!;
    out[j] = t;
  }
  return out;
}

/**
 * Signature stable du contenu (ids + placement) pour ne reshuffler le listing
 * « style web » que lorsque la piscine ou les placements changent.
 */
export function getListingWebOrderContentSig(
  pool: EstablishmentNormalized[],
  placementByEid: Record<number, EstablishmentListingPlacementLike>,
): string {
  const rows = pool.map((e) => {
    const p = placementByEid[e.id];
    return `${e.id}:${p?.placementId ?? 0}:${p?.isSponsored ? 1 : 0}`;
  });
  rows.sort((a, b) => parseInt(a.split(':')[0]!, 10) - parseInt(b.split(':')[0]!, 10));
  return rows.join('|');
}

export type EcolesSuperieuresWebSortOptions = {
  /** `itemsPerPage` web (30). */
  firstPageSize?: number;
  /** Taille du premier bloc mélangé référencés + autres (10). */
  mixBlockSize?: number;
};

/**
 * Ordre d’affichage du listing « Écoles supérieures » web (`EcolesSupérieures.tsx`) :
 * sponsorisés (référencés) mélangés en tête, puis bloc mélangé référencés-non-sponsor / tête des autres,
 * puis complément de « première page », puis le reste.
 * `merged` doit déjà inclure `mergeEstablishmentsWithListingPlacements`.
 */
export function sortEstablishmentsLikeEcolesSuperieuresWeb(
  merged: EstablishmentNormalized[],
  placementByEid: Record<number, EstablishmentListingPlacementLike>,
  opts?: EcolesSuperieuresWebSortOptions,
): EstablishmentNormalized[] {
  const itemsPerPage = opts?.firstPageSize ?? 30;
  const first10Size = opts?.mixBlockSize ?? 10;
  if (merged.length === 0) return [];

  const referencedIds = new Set(
    Object.keys(placementByEid)
      .map((k) => parseInt(k, 10))
      .filter((id) => Number.isFinite(id) && id > 0),
  );

  const referencedList = merged.filter((e) => referencedIds.has(e.id));
  const othersList = merged.filter((e) => !referencedIds.has(e.id));
  const sponsoredList = referencedList.filter((e) => Boolean(e.isSponsored));
  const referencedOnlyList = referencedList.filter((e) => !e.isSponsored);

  const first10Pool = shuffleEstablishmentsCopy([
    ...referencedOnlyList,
    ...othersList.slice(0, Math.max(0, first10Size - referencedOnlyList.length)),
  ]);
  const first10 = first10Pool.slice(0, first10Size);
  const first10Ids = new Set(first10.map((x) => x.id));

  const restOfFirstPageCount = Math.max(0, itemsPerPage - first10Size);
  const remainingOthers = othersList.filter((o) => !first10Ids.has(o.id));
  const remainingReferenced = referencedOnlyList.filter((r) => !first10Ids.has(r.id));
  const restOfFirstPage = remainingOthers.slice(0, restOfFirstPageCount);
  const restOfFirstPageIds = new Set(restOfFirstPage.map((x) => x.id));
  const remaining = [
    ...remainingReferenced,
    ...remainingOthers.filter((o) => !restOfFirstPageIds.has(o.id)),
  ];

  return [
    ...shuffleEstablishmentsCopy(sponsoredList),
    ...first10,
    ...restOfFirstPage,
    ...remaining,
  ];
}

/**
 * Critères « complets » (combinaison serveur + client) appliqués à une seule
 * école. Utilisé par l'onglet « Annonces » de « Mes inscriptions » pour
 * filtrer les annonces en croisant chaque annonce avec son école parente.
 */
export type EstablishmentFullFilters = {
  type: string;
  universite: string;
  regionTitle: string;
  ville: string;
  secteurId: string;
  diplome: string;
  fraisMin: number;
  fraisMax: number;
  /** Liste pré-calculée des villes appartenant à la région choisie (vide ⇒ ignoré). */
  villesInRegion?: Set<string> | null;
  acceptedStudyBacType?: '' | 'normal' | 'mission';
  acceptedStudyValue?: string;
};

export function establishmentMatchesAllFilters(
  e: EstablishmentNormalized,
  f: EstablishmentFullFilters,
): boolean {
  if (f.type.trim() && (e.type ?? '').trim() !== f.type.trim()) return false;

  if (f.universite.trim()) {
    const needle = f.universite.trim().toLowerCase();
    const hay = `${e.nom ?? ''} ${e.nomArabe ?? ''} ${e.sigle ?? ''}`.toLowerCase();
    if (!hay.includes(needle)) return false;
  }

  if (f.villesInRegion && f.villesInRegion.size > 0) {
    const hit = e.villesListe.some((v) => f.villesInRegion!.has(v.trim()));
    if (!hit) return false;
  }

  if (f.ville.trim()) {
    if (!e.villesListe.includes(f.ville.trim())) return false;
  }

  if (f.secteurId.trim()) {
    const sid = parseInt(f.secteurId, 10);
    if (!Number.isFinite(sid) || !Array.isArray(e.secteursIds) || !e.secteursIds.includes(sid)) {
      return false;
    }
  }

  if (f.diplome.trim()) {
    const d = f.diplome.trim().toLowerCase();
    if (!e.mergedDiplomes.some((x) => x.toLowerCase() === d)) return false;
  }

  if (!feesOverlapFilter(e, f.fraisMin, f.fraisMax)) return false;

  const studyBac = f.acceptedStudyBacType;
  const studyVal = (f.acceptedStudyValue ?? '').trim();
  if ((studyBac === 'normal' || studyBac === 'mission') && studyVal) {
    const ok = matchesAcceptedStudyPathFilter(
      {
        filieresAcceptees: e.filieresAcceptees ?? null,
        specialitesBacMissionAcceptees: e.specialitesBacMissionAcceptees ?? null,
      },
      { bacType: studyBac, value: studyVal } satisfies AcceptedStudyPathFilter,
    );
    if (!ok) return false;
  }

  return true;
}
