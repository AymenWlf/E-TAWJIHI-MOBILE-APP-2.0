import { buildApiUrl } from '@/constants/api';
import {
  normalizePlatformServiceBrandColor,
  parsePlatformServiceBrandIconKey,
} from '@/utils/platformServiceBrandIcon';
import type { AppLocale } from '@/constants/i18n';
import { httpGetJson, httpPostJson } from '@/services/http';

export type PlatformServiceEstablishment = {
  id: number;
  nom: string;
  slug: string | null;
  sigle: string | null;
  type: string | null;
  ville: string | null;
  /** Fichier ou URL logo (même convention que les autres APIs établissements). */
  logo: string | null;
};

export type PlatformServiceItem = {
  id: string;
  name: string;
  slug: string;
  /** Ancien champ unique ; utilisé en secours si FR/AR vides. */
  description: string | null;
  descriptionFr: string | null;
  descriptionAr: string | null;
  features: string[];
  /** Avantages / puces en arabe (affichage si locale AR, secours FR). */
  featuresAr: string[];
  price: string | null;
  promotionalPrice: string | null;
  promotionDeadlineAt: string | null;
  currency: string;
  /**
   * Critères depuis l’API : `all`, `mission`, `reste`, et/ou noms de filières / intitulés.
   * @see PlatformService.php (JSON)
   */
  filieresAccepted: string[];
  popular: boolean;
  isBestseller: boolean;
  /** Livraison gratuite pour toute la commande si le panier contient ce service (aligné produits boutique). */
  isFreeShipping?: boolean;
  cta: string;
  sortOrder: number;
  /** Nom d’icône Font Awesome 4 (ex. briefcase, graduation-cap). */
  brandIcon: string;
  /** Couleur #RGB ou #RRGGBB pour la vignette du service. */
  brandColor: string;
  establishments: PlatformServiceEstablishment[];
  miniDescriptionFr?: string | null;
  miniDescriptionAr?: string | null;
  niveauKeyApplied?: string | null;
  /** false si le profil a un niveau sans offre active en base. */
  eligibleForNiveau?: boolean;
  availableNiveauKeys?: string[];
};

type ApiListResponse = {
  success: boolean;
  data: PlatformServiceItem[];
  count?: number;
};

/** Texte affiché selon la langue de l’app (secours : autre langue puis `description`). */
export function platformServiceLocalizedDescription(
  s: Pick<PlatformServiceItem, 'description' | 'descriptionFr' | 'descriptionAr'>,
  locale: AppLocale,
): string | null {
  const legacy = (s.description ?? '').trim();
  const fr = (s.descriptionFr ?? '').trim() || legacy;
  const ar = (s.descriptionAr ?? '').trim();
  if (locale === 'ar') {
    return ar || fr || null;
  }
  return fr || ar || null;
}

/** Puces « avantages » selon la langue de l’app (secours : autre langue). */
/** Texte court carte boutique (mini description par niveau, sinon description). */
export function platformServiceLocalizedMiniDescription(
  s: Pick<
    PlatformServiceItem,
    'miniDescriptionFr' | 'miniDescriptionAr' | 'description' | 'descriptionFr' | 'descriptionAr'
  >,
  locale: AppLocale,
): string | null {
  const fr =
    (s.miniDescriptionFr ?? '').trim() ||
    platformServiceLocalizedDescription(s, 'fr') ||
    '';
  const ar = (s.miniDescriptionAr ?? '').trim();
  if (locale === 'ar') {
    return ar || fr || null;
  }
  return fr || ar || null;
}

export function platformServiceLocalizedFeatures(
  s: Pick<PlatformServiceItem, 'features' | 'featuresAr'>,
  locale: AppLocale,
): string[] {
  const fr = (s.features ?? []).map(String).map((x) => x.trim()).filter(Boolean);
  const ar = (s.featuresAr ?? []).map(String).map((x) => x.trim()).filter(Boolean);
  if (locale === 'ar') {
    return ar.length > 0 ? ar : fr;
  }
  return fr.length > 0 ? fr : ar;
}

function parseFilieresAccepted(raw: Record<string, unknown>): string[] {
  const fromArray = raw.filieresArray ?? raw.filieres_array;
  if (Array.isArray(fromArray) && fromArray.length > 0) {
    return fromArray.map((x) => String(x).trim()).filter((s) => s.length > 0);
  }
  const legacy = raw.filieres;
  if (Array.isArray(legacy)) {
    return legacy.map((x) => String(x).trim()).filter((s) => s.length > 0);
  }
  const s = String(legacy ?? 'all').trim();
  return s.length > 0 ? [s] : ['all'];
}

function normalizeItem(raw: Record<string, unknown>): PlatformServiceItem {
  const filieresAccepted = parseFilieresAccepted(raw);
  const feats = Array.isArray(raw.features) ? raw.features.map(String) : [];
  const featsArRaw = raw.featuresAr ?? raw.features_ar;
  const featsAr = Array.isArray(featsArRaw) ? featsArRaw.map(String) : [];
  const descriptionFrRaw = raw.descriptionFr ?? raw.description_fr;
  const descriptionArRaw = raw.descriptionAr ?? raw.description_ar;
  const estRaw = raw.establishments;
  const establishments: PlatformServiceEstablishment[] = Array.isArray(estRaw)
    ? (estRaw as unknown[]).map((row) => {
        const e = row as Record<string, unknown>;
        return {
          id: Number(e.id ?? 0),
          nom: String(e.nom ?? ''),
          slug: e.slug == null || e.slug === '' ? null : String(e.slug),
          sigle: e.sigle == null ? null : String(e.sigle),
          type: e.type == null ? null : String(e.type),
          ville: e.ville == null ? null : String(e.ville),
          logo: e.logo == null || String(e.logo).trim() === '' ? null : String(e.logo).trim(),
        };
      })
    : [];
  return {
    id: String(raw.id ?? raw.slug ?? ''),
    name: String(raw.name ?? ''),
    slug: String(raw.slug ?? ''),
    description: raw.description == null ? null : String(raw.description),
    descriptionFr: descriptionFrRaw == null || descriptionFrRaw === '' ? null : String(descriptionFrRaw),
    descriptionAr: descriptionArRaw == null || descriptionArRaw === '' ? null : String(descriptionArRaw),
    features: feats,
    featuresAr: featsAr,
    price: raw.price == null || raw.price === '' ? null : String(raw.price),
    promotionalPrice:
      raw.promotionalPrice == null || raw.promotionalPrice === ''
        ? null
        : String(raw.promotionalPrice),
    promotionDeadlineAt:
      raw.promotionDeadlineAt == null || String(raw.promotionDeadlineAt).trim() === ''
        ? null
        : String(raw.promotionDeadlineAt).trim().slice(0, 10),
    currency: String(raw.currency ?? 'DHS'),
    filieresAccepted,
    popular: Boolean(raw.popular),
    isBestseller: Boolean(raw.isBestseller ?? raw.is_bestseller),
    isFreeShipping: Boolean(raw.isFreeShipping ?? raw.is_free_shipping),
    cta: String(raw.cta ?? 'Commander'),
    sortOrder: Number(raw.sortOrder ?? 0) || 0,
    brandIcon: parsePlatformServiceBrandIconKey(
      (raw.brandIcon ?? raw.brand_icon) as string | null | undefined,
    ),
    brandColor: normalizePlatformServiceBrandColor(
      (raw.brandColor ?? raw.brand_color) as string | null | undefined,
      false,
    ),
    establishments,
    eligibleForNiveau:
      raw.eligibleForNiveau === undefined ? undefined : Boolean(raw.eligibleForNiveau),
    availableNiveauKeys: Array.isArray(raw.availableNiveauKeys)
      ? raw.availableNiveauKeys.map(String)
      : undefined,
    niveauKeyApplied:
      raw.niveauKeyApplied == null || raw.niveauKeyApplied === ''
        ? null
        : String(raw.niveauKeyApplied),
  };
}

export async function fetchPlatformServices(niveau?: string | null): Promise<PlatformServiceItem[]> {
  const qs = niveau?.trim() ? `?niveau=${encodeURIComponent(niveau.trim())}` : '';
  const url = buildApiUrl(`/api/platform-services${qs}`);
  const res = await httpGetJson<ApiListResponse>(url);
  if (!res.success || !Array.isArray(res.data)) return [];
  const items = res.data.map((row) => normalizeItem(row as Record<string, unknown>));
  return items.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function fetchPlatformServiceBySlug(
  slug: string,
  niveau?: string | null,
): Promise<PlatformServiceItem | null> {
  const list = await fetchPlatformServices(niveau);
  const s = String(slug ?? '').trim();
  return list.find((x) => x.slug === s) ?? null;
}

export type PlatformServiceCatalogEntitlementStatus =
  | 'available'
  | 'upgrade_available'
  | 'already_owned'
  | 'included'
  | 'blocked'
  | 'requires_prerequisite'
  | 'not_eligible'
  | 'not_found';

export type PlatformServiceCatalogEntitlement = {
  status: PlatformServiceCatalogEntitlementStatus;
  purchasable: boolean;
  message: string | null;
  code: string | null;
  upgradeFromSlugs: string[];
  includedViaSlug: string | null;
  /** Services à retirer du panier si l’utilisateur ajoute celui-ci (conflit non cumulable). */
  replacesCartSlugs?: string[];
  /** Prix unitaire après crédit upgrade (prix liste source déduit). */
  upgradeUnitPrice: string | null;
  /** Montant déduit (prix liste du service possédé, pas le prix promo). */
  upgradeCredit: string | null;
};

export async function fetchPlatformServiceCatalogEntitlements(
  params: { phone?: string; cartSlugs?: string[]; niveau?: string | null },
  accessToken?: string | null,
): Promise<Record<string, PlatformServiceCatalogEntitlement>> {
  const search = new URLSearchParams();
  if (params.phone?.trim()) search.set('phone', params.phone.trim());
  if (params.niveau?.trim()) search.set('niveau', params.niveau.trim());
  const cart = (params.cartSlugs ?? []).map((s) => s.trim()).filter(Boolean);
  if (cart.length > 0) search.set('cart', cart.join(','));
  const qs = search.toString();
  const url = buildApiUrl(`/api/platform-services/catalog-entitlements${qs ? `?${qs}` : ''}`);
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const res = await httpGetJson<{
    success: boolean;
    data?: { bySlug?: Record<string, PlatformServiceCatalogEntitlement> };
  }>(url, { headers });
  if (!res.success || !res.data?.bySlug) return {};
  const out: Record<string, PlatformServiceCatalogEntitlement> = {};
  for (const [slug, row] of Object.entries(res.data.bySlug)) {
    const raw = row as Record<string, unknown>;
    const replacesRaw = raw.replacesCartSlugs ?? raw.replaces_cart_slugs;
    out[slug] = {
      ...(row as PlatformServiceCatalogEntitlement),
      replacesCartSlugs: Array.isArray(replacesRaw)
        ? replacesRaw.map((s) => String(s).trim()).filter(Boolean)
        : [],
    };
  }
  return out;
}

export async function checkPlatformServicePurchaseEligibility(
  payload: { slugs: string[]; phone?: string },
  accessToken?: string | null,
): Promise<{ allowed: boolean; message: string | null }> {
  const url = buildApiUrl('/api/platform-services/purchase-eligibility');
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const res = await httpPostJson<
    { success: boolean; data: { allowed: boolean; message: string | null } },
    typeof payload
  >(url, payload, { headers });
  if (!res.success || !res.data) {
    throw new Error('Vérification impossible');
  }
  return { allowed: res.data.allowed, message: res.data.message ?? null };
}
