/**
 * Normalisation campus / Google Maps — alignée sur `EcoleDetail.tsx` (Global Front).
 */

const NON_SPECIFIE = 'Non spécifié';

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/** Ville affichée : chaîne API ou `city.titre`. */
export function campusCityLabel(c: Record<string, unknown>): string {
  const direct = str(c.ville);
  if (direct) return direct;
  const city = c.city;
  if (city && typeof city === 'object' && city !== null && 'titre' in city) {
    return str((city as { titre?: string }).titre);
  }
  return '';
}

export type CampusDisplayRow = {
  key: string;
  name: string;
  city: string;
  district: string;
  /** iframe embed (WebView) */
  embedUrl: string | null;
  /** Lien Maps (app / navigateur) si pas d’embed utilisable */
  openMapUrl: string | null;
};

function rawMapField(c: Record<string, unknown>): string {
  return str(c.mapUrl) || str((c as { googleMapsUrl?: unknown }).googleMapsUrl) || str((c as { mapEmbedUrl?: unknown }).mapEmbedUrl);
}

/**
 * Extrait URL embed et/ou lien externe Maps depuis la valeur API (y compris iframe HTML).
 */
export function extractGoogleMapsUrls(input: string): { embed: string | null; external: string | null } {
  let s = input.trim();
  if (!s) return { embed: null, external: null };
  if (s.includes('<iframe')) {
    const m = s.match(/src=["']([^"']+)["']/i);
    if (m?.[1]) s = m[1].trim();
  }
  if (!s) return { embed: null, external: null };

  if (s.includes('google.com/maps/embed')) {
    return { embed: s, external: s };
  }
  if (s.includes('google.com/maps') || s.includes('maps.app.goo.gl') || s.includes('goo.gl/maps')) {
    return { embed: null, external: s };
  }
  return { embed: null, external: null };
}

function campusHasMinimalInfo(c: Record<string, unknown>): boolean {
  return !!(str(c.nom) || campusCityLabel(c) || str(c.email));
}

/**
 * Filtre et mappe les campus comme sur le web (nom, ville, quartier, carte).
 */
export function mapCampusForDisplay(campus: Record<string, unknown>[] | undefined): CampusDisplayRow[] {
  if (!Array.isArray(campus) || campus.length === 0) return [];
  return campus.filter(campusHasMinimalInfo).map((c, index) => {
    const ville = campusCityLabel(c);
    const city = ville || NON_SPECIFIE;
    const nom = str(c.nom);
    const name = nom || (ville ? `Campus ${ville}` : `Campus ${index + 1}`);
    const district =
      str(c.quartier) || str(c.adresse) || ville || NON_SPECIFIE;
    const rawMap = rawMapField(c);
    const { embed, external } = extractGoogleMapsUrls(rawMap);
    const id = str((c as { id?: unknown }).id);
    const key = id ? `campus-${id}` : `campus-${index}`;
    return {
      key,
      name,
      city,
      district,
      embedUrl: embed,
      openMapUrl: external,
    };
  });
}
