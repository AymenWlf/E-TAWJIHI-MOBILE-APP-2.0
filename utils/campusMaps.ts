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
  /** URL embed Google Maps (iframe / WebView). */
  embedUrl: string | null;
  /** Lien Google Maps (navigateur / app). */
  openMapUrl: string | null;
};

/** Base WebView pour l’iframe Maps (même origine que le site). */
export const GOOGLE_MAPS_EMBED_WEBVIEW_BASE_URL = 'https://www.google.com';

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Document HTML minimal : Google Maps Embed API doit être chargé dans un `<iframe>`
 * (comme `EcoleDetail.tsx` sur le web), pas comme navigation directe du WebView.
 */
export function buildGoogleMapsEmbedWebHtml(embedUrl: string): string {
  const src = escapeHtmlAttr(embedUrl.trim());
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #e2e8f0; }
    iframe {
      display: block;
      width: 100%;
      height: 100%;
      border: 0;
    }
  </style>
</head>
<body>
  <iframe
    src="${src}"
    title="Google Maps"
    loading="lazy"
    referrerpolicy="no-referrer-when-downgrade"
    allowfullscreen
  ></iframe>
</body>
</html>`;
}

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

function absolutizeMapsUrl(url: string): string {
  let out = url.trim();
  if (!out) return '';
  if (!/^https?:\/\//i.test(out) && out.startsWith('//')) {
    return `https:${out}`;
  }
  if (!/^https?:\/\//i.test(out)) {
    return `https://${out}`;
  }
  return out;
}

/** URL utilisable dans une iframe (`https://www.google.com/maps/embed…`). */
function toGoogleMapsEmbedUrl(s: string): string | null {
  let out = absolutizeMapsUrl(s);
  if (!out) return null;

  if (/\/maps\/embed/i.test(out)) {
    try {
      const u = new URL(out);
      if (/^maps\.google\./i.test(u.hostname)) {
        u.hostname = 'www.google.com';
        out = u.toString();
      }
    } catch {
      /* garder out */
    }
    return out;
  }

  if (!looksLikeGoogleMapsUrl(s)) {
    return null;
  }

  try {
    const u = new URL(out);
    const pb = u.searchParams.get('pb');
    if (pb) {
      return `https://www.google.com/maps/embed?pb=${pb}`;
    }
    const q = u.searchParams.get('q');
    if (q) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
    }
  } catch {
    /* ignore */
  }

  const ll = latLngFromGoogleMapsUrl(out);
  if (ll) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(`${ll.lat},${ll.lng}`)}&output=embed`;
  }

  return null;
}

/**
 * Extrait embed + lien externe depuis la valeur API (URL directe ou HTML iframe).
 */
export function extractGoogleMapsUrls(input: string): { embed: string | null; external: string | null } {
  const s = extractMapsSrcFromIframeOrUrl(input);
  if (!s) return { embed: null, external: null };

  if (!looksLikeGoogleMapsUrl(s) && !/\/maps\/embed/i.test(s)) {
    return { embed: null, external: null };
  }

  return {
    embed: toGoogleMapsEmbedUrl(s),
    external: toReliableGoogleMapsOpenUrl(s),
  };
}

function campusHasMinimalInfo(c: Record<string, unknown>): boolean {
  return !!(str(c.nom) || campusCityLabel(c) || str(c.email));
}

/**
 * Filtre et mappe les campus comme sur le web (nom, ville, quartier, carte).
 */
/**
 * Libellés campus pour les seuils d'admission (clés API = id campus, nom affiché).
 */
export function campusSeuilLabelsFromApi(campus: Record<string, unknown>[] | undefined): Record<string, string> {
  const labels: Record<string, string> = {};
  if (!Array.isArray(campus) || campus.length === 0) return labels;
  campus.forEach((c, index) => {
    const id = str((c as { id?: unknown }).id);
    if (!id) return;
    const ville = campusCityLabel(c);
    const nom = str(c.nom);
    const name = nom || (ville ? `Campus ${ville}` : `Campus ${index + 1}`);
    labels[id] = name;
    labels[`campus-${id}`] = name;
  });
  return labels;
}

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
