import type { EstablishmentNormalized } from '@/services/establishments';

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
  eTawjihiInscription: boolean;
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

  if (f.eTawjihiInscription) {
    out = out.filter((e) => e.eTawjihiInscription === true);
  }

  return out;
}

/** Tri rapide : sponsorisés en premier (comme le listing web). */
export function sortSponsoredFirst(items: EstablishmentNormalized[]): EstablishmentNormalized[] {
  return [...items].sort((a, b) => {
    if (a.isSponsored && !b.isSponsored) return -1;
    if (!a.isSponsored && b.isSponsored) return 1;
    return 0;
  });
}

/**
 * Critères « complets » (combinaison serveur + client) appliqués à une seule
 * école. Utilisé par l'onglet « Annonces » de « Mes inscriptions » pour
 * filtrer les annonces en croisant chaque annonce avec son école parente.
 *
 * Les booléens `featured/recommended/sponsored/accreditationEtat/echangeInternational`
 * sont normalement gérés côté serveur dans le listing principal mais doivent
 * aussi être contrôlés côté client lorsqu'on filtre une liste arbitraire
 * (ex. annonces) en local.
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
  eTawjihiOnly: boolean;
  featuredOnly: boolean;
  recommendedOnly: boolean;
  sponsoredOnly: boolean;
  accreditationEtat: boolean;
  echangeInternational: boolean;
  /** Liste pré-calculée des villes appartenant à la région choisie (vide ⇒ ignoré). */
  villesInRegion?: Set<string> | null;
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

  if (f.eTawjihiOnly && e.eTawjihiInscription !== true) return false;
  if (f.recommendedOnly && e.isRecommended !== true) return false;
  if (f.sponsoredOnly && e.isSponsored !== true) return false;
  if (f.featuredOnly && e.isFeatured !== true) return false;
  if (f.accreditationEtat && e.accreditationEtat !== true) return false;
  if (f.echangeInternational && e.echangeInternational !== true) return false;

  return true;
}
