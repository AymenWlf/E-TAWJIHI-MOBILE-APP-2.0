/**
 * Chemins publics alignés sur E-TAWJIHI-GLOBAL-FRONT (`App.tsx`).
 * Les liens partagés pointent vers le site web pour un aperçu (Open Graph) correct.
 */

const MAX_CONTEST_PATH_SLUG_LEN = 120;

export function slugifyContestPathSegment(text: string): string {
  const t = String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
  return t.length > MAX_CONTEST_PATH_SLUG_LEN ? t.slice(0, MAX_CONTEST_PATH_SLUG_LEN).replace(/-+$/g, '') : t;
}

/** `/annonces-concours/{id}-{slug}` — même logique que `buildContestAnnouncementPublicPath` côté web. */
export function webPathContestAnnouncement(id: number, titre: string, nomEtablissement: string): string {
  const combined = `${String(titre ?? '').trim()} ${String(nomEtablissement ?? '').trim()}`.trim();
  const slug = slugifyContestPathSegment(combined) || 'annonce';
  return `/annonces-concours/${id}-${slug}`;
}

export function webPathEstablishment(id: number, slug: string): string {
  const s = String(slug ?? '').trim() || 'fiche';
  return `/etablissements/${id}/${encodeURIComponent(s)}`;
}

export function webPathEvent(id: number): string {
  return `/evenements/${id}`;
}

/** Page produit marketplace (aligné `App.tsx` web). */
export function webPathBoutiqueProduct(slug: string): string {
  const s = String(slug ?? '').trim() || 'produit';
  return `/boutique/${encodeURIComponent(s)}`;
}

/** Ancre page services publics (même logique que l’app mobile `openServicesSite`). */
export function webPathPlatformService(slug: string): string {
  const s = String(slug ?? '').trim() || 'service';
  return `/services#${encodeURIComponent(s)}`;
}

/** Fil d’info communauté (page web `GlobalWallPage`). */
export function webPathCommunity(): string {
  return '/communaute';
}
