import { buildApiUrl } from '@/constants/api';
import type { AppLocale } from '@/constants/i18n';
import { httpGetJson } from '@/services/http';

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
    currency: String(raw.currency ?? 'DHS'),
    filieresAccepted,
    popular: Boolean(raw.popular),
    isBestseller: Boolean(raw.isBestseller ?? raw.is_bestseller),
    isFreeShipping: Boolean(raw.isFreeShipping ?? raw.is_free_shipping),
    cta: String(raw.cta ?? 'Commander'),
    sortOrder: Number(raw.sortOrder ?? 0) || 0,
    brandIcon:
      raw.brandIcon == null || String(raw.brandIcon).trim() === ''
        ? 'briefcase'
        : String(raw.brandIcon).trim().slice(0, 48),
    brandColor: (() => {
      const c = raw.brandColor == null ? '' : String(raw.brandColor).trim();
      if (c && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(c)) return c;
      return '#333E8F';
    })(),
    establishments,
  };
}

export async function fetchPlatformServices(): Promise<PlatformServiceItem[]> {
  const url = buildApiUrl('/api/platform-services');
  const res = await httpGetJson<ApiListResponse>(url);
  if (!res.success || !Array.isArray(res.data)) return [];
  const items = res.data.map((row) => normalizeItem(row as Record<string, unknown>));
  return items.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function fetchPlatformServiceBySlug(slug: string): Promise<PlatformServiceItem | null> {
  const list = await fetchPlatformServices();
  const s = String(slug ?? '').trim();
  return list.find((x) => x.slug === s) ?? null;
}
