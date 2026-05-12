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
  /** Conservé pour compatibilité ; toujours null (plus d’embed WebView). */
  embedUrl: string | null;
  /** Lien Google Maps (navigateur / app). */
  openMapUrl: string | null;
};

function rawMapField(c: Record<string, unknown>): string {
  return str(c.mapUrl) || str((c as { googleMapsUrl?: unknown }).googleMapsUrl) || str((c as { mapEmbedUrl?: unknown }).mapEmbedUrl);
}

/** Décodage minimal des entités fréquentes dans les `src` d’iframe collés depuis le back-office. */
function decodeCommonEntitiesInUrl(url: string): string {
  return url
    .replace(/&amp;/gi, '&')
    .replace(/&#38;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/gi, "'");
}

function looksLikeGoogleMapsUrl(s: string): boolean {
  return /google\.[\w.]+\/maps|maps\.google\.[\w.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/i.test(s);
}

/**
 * Si la valeur est du HTML avec iframe(s), extrait le `src` pertinent (Google Maps).
 * Sinon renvoie la chaîne nettoyée (URL directe).
 */
function extractMapsSrcFromIframeOrUrl(raw: string): string {
  let s = raw.trim();
  if (!s) return '';
  if (!/<iframe/i.test(s)) {
    return decodeCommonEntitiesInUrl(s);
  }

  const iframeTags = s.match(/<iframe\b[^>]*>/gi) ?? [];
  for (const tag of iframeTags) {
    const quoted = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    if (quoted?.[1]) {
      const u = decodeCommonEntitiesInUrl(quoted[1].trim());
      if (looksLikeGoogleMapsUrl(u) || /\/maps\/embed/i.test(u)) return u;
    }
    const bare = tag.match(/\bsrc\s*=\s*([^\s>]+)/i);
    if (bare?.[1]) {
      const u = decodeCommonEntitiesInUrl(bare[1].replace(/^["']|["']$/g, '').trim());
      if (looksLikeGoogleMapsUrl(u) || /\/maps\/embed/i.test(u)) return u;
    }
  }

  const anySrc = s.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
  if (anySrc?.[1]) return decodeCommonEntitiesInUrl(anySrc[1].trim());

  return '';
}

/** Convertit une URL d’embed Maps (`/maps/embed?…` ou `maps/embed/…`) en lien `/maps?…` ouvert dans le navigateur / l’app. */
function mapsEmbedToExternalUrl(s: string): string {
  let out = s.trim();
  if (!/^https?:\/\//i.test(out) && out.startsWith('//')) {
    out = `https:${out}`;
  }
  out = out.replace(/\/maps\/embed\?/i, '/maps?').replace(/\/maps\/embed\//i, '/maps/');
  return out;
}

function isFiniteLatLng(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

/**
 * Les URLs `pb=!1m18!…!2dLNG!3dLAT` ouvrent parfois l’app Maps sans repère (troncature / interprétation).
 * On extrait le premier couple lng/lat du bloc type `!1m3` pour construire un lien `search?api=1&query=lat,lng`.
 */
function parseLatLngFromPbHaystack(haystack: string): { lat: number; lng: number } | null {
  const m1 = haystack.match(/!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/);
  if (m1) {
    const lng = parseFloat(m1[1]);
    const lat = parseFloat(m1[2]);
    if (isFiniteLatLng(lat, lng)) return { lat, lng };
  }
  const m2 = haystack.match(/!3d(-?\d+(?:\.\d+)?)!2d(-?\d+(?:\.\d+)?)/);
  if (m2) {
    const lat = parseFloat(m2[1]);
    const lng = parseFloat(m2[2]);
    if (isFiniteLatLng(lat, lng)) return { lat, lng };
  }
  return null;
}

function latLngFromGoogleMapsUrl(url: string): { lat: number; lng: number } | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const absolute = /^https?:\/\//i.test(trimmed) ? trimmed : trimmed.startsWith('//') ? `https:${trimmed}` : `https://${trimmed}`;
    const u = new URL(absolute);
    const pb = u.searchParams.get('pb');
    if (pb) {
      let decoded = pb.replace(/\+/g, ' ');
      try {
        decoded = decodeURIComponent(decoded);
      } catch {
        /* garder pb brut */
      }
      const fromPb = parseLatLngFromPbHaystack(decoded);
      if (fromPb) return fromPb;
    }
  } catch {
    /* ignore */
  }
  return parseLatLngFromPbHaystack(trimmed);
}

/** Retire `output=embed` (anciens iframes) pour que le lien mène au lieu et non à une vue embed vide. */
function stripOutputEmbedParam(url: string): string {
  try {
    const absolute = /^https?:\/\//i.test(url) ? url : url.startsWith('//') ? `https:${url}` : `https://${url}`;
    const u = new URL(absolute);
    if (u.searchParams.get('output') === 'embed') {
      u.searchParams.delete('output');
      return u.toString();
    }
  } catch {
    /* ignore */
  }
  return url;
}

/**
 * Lien stable pour navigateur + app Maps : préfère `search?api=1&query=lat,lng` si on peut parser le `pb`.
 */
function toReliableGoogleMapsOpenUrl(s: string): string {
  let out = mapsEmbedToExternalUrl(s);
  out = stripOutputEmbedParam(out);
  const ll = latLngFromGoogleMapsUrl(out);
  if (ll) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${ll.lat},${ll.lng}`)}`;
  }
  return out;
}

/**
 * Extrait un lien Google Maps depuis la valeur API (URL ou iframe HTML, `src` avec " ou ').
 * On ne renvoie plus d’URL d’embed : uniquement un lien externe exploitable.
 */
export function extractGoogleMapsUrls(input: string): { embed: string | null; external: string | null } {
  const s = extractMapsSrcFromIframeOrUrl(input);
  if (!s) return { embed: null, external: null };

  if (/\/maps\/embed/i.test(s)) {
    return { embed: null, external: toReliableGoogleMapsOpenUrl(s) };
  }
  if (looksLikeGoogleMapsUrl(s)) {
    return { embed: null, external: toReliableGoogleMapsOpenUrl(s) };
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
