import type { EstablishmentListItem } from '@/services/establishments';

/** Normalise les libellés type comme sur le listing web */
export function formatEstablishmentType(t?: string | null): string {
  switch (t) {
    case 'Privé':
    case 'Public':
    case 'Militaire':
      return t;
    case 'Semi-public':
      return 'Semi-Public';
    default:
      return t?.trim() || 'Public';
  }
}

/** Merge diplômes (comme `mapEstablishmentData` web). */
export function mergeDiplomes(e: EstablishmentListItem): string[] {
  const fromRoot = Array.isArray(e.diplomesDelivres) ? e.diplomesDelivres : [];
  const fromAcad = Array.isArray(e.academicInfo?.diplomesDelivres) ? e.academicInfo!.diplomesDelivres! : [];
  const legacy = Array.isArray(e.diplomes) ? e.diplomes : [];
  const merged = [...fromRoot, ...fromAcad, ...legacy].filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
  return Array.from(new Set(merged.map((x) => x.trim())));
}

export function villesListe(e: EstablishmentListItem): string[] {
  const fromCampus: string[] = [];
  const campusArr = Array.isArray(e.campus) ? e.campus : [];
  for (const c of campusArr) {
    const row = c as { ville?: unknown; city?: { titre?: string } };
    let v: string | null = null;
    if (typeof row.ville === 'string') v = row.ville;
    else if (
      row.ville &&
      typeof row.ville === 'object' &&
      row.ville !== null &&
      typeof (row.ville as { titre?: string }).titre === 'string'
    ) {
      v = (row.ville as { titre: string }).titre;
    } else if (row.city?.titre) v = row.city.titre;
    if (v?.trim()) fromCampus.push(v.trim());
  }
  const fromLoc = Array.isArray(e.location?.villes) ? e.location!.villes! : [];
  const fromFlat = Array.isArray(e.villes) ? e.villes! : [];
  const single =
    ((e.location?.ville ?? e.ville) || '')
      .toString()
      .trim();

  const all = [...(single ? [single] : []), ...fromFlat, ...fromLoc, ...fromCampus].filter(Boolean);
  return Array.from(new Set(all));
}

export function formatVillesCourtes(villes: string[], max = 2): string {
  if (villes.length === 0) return '';
  const head = villes.slice(0, max).join(', ');
  const extra = villes.length > max ? ` +${villes.length - max}` : '';
  return `${head}${extra}`;
}

function parseEuro(n: unknown): number | null {
  if (n === null || n === undefined || n === '') return null;
  if (typeof n === 'number' && Number.isFinite(n)) return n;
  const s = String(n).replace(/\s/g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  const v = Number.parseFloat(s);
  return Number.isFinite(v) ? v : null;
}

/** Libellé frais proche du web (résumé carte). */
export function formatFraisScolarite(e: EstablishmentListItem): string {
  const gratuit =
    !!e.gratuit ||
    e.type === 'Public' ||
    e.type === 'Militaire' ||
    e.type === 'Semi-public';

  const mn = parseEuro(e.fraisScolariteMin);
  const mx = parseEuro(e.fraisScolariteMax);

  if (mn != null || mx != null) {
    if (mx != null && mn != null && mx === mn && mx === 0) return 'Gratuit';
    if ((mn ?? 0) === 0 && (mx ?? 0) === 0 && gratuit) return 'Gratuit';
    const fmt = (x: number) =>
      `${x.toLocaleString('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })} MAD`;
    if (mn != null && mx != null && mn !== mx) return `${fmt(mn)} – ${fmt(mx)} / an`;
    const one = mn ?? mx!;
    return `${fmt(one)} / an`;
  }

  return gratuit ? 'Gratuit' : 'Sur demande';
}

export function dureeLabel(e: EstablishmentListItem): string {
  if (e.dureeEtudesMax != null && e.dureeEtudesMax !== undefined) return `${e.dureeEtudesMax} ans`;
  if (e.dureeEtudes != null) return `${e.dureeEtudes} ans`;
  const y = e.academicInfo?.anneesEtudes ?? e.anneesEtudes;
  if (typeof y === 'number' && y > 0) return `${y} ans`;
  return '';
}

/** Concours comme sur le listing web (`requirements.concours`). */
export function isConcours(e: EstablishmentListItem): boolean {
  const c = (e.concours ?? e.academicInfo?.concours) as unknown;
  return !!(c === true || c === 1 || c === '1' || c === 'true' || String(c).toLowerCase() === 'true');
}

export function secteurTitres(e: EstablishmentListItem, opts?: { rtl?: boolean }): string[] {
  const ss = Array.isArray(e.secteurs) ? e.secteurs : [];
  const rtl = !!opts?.rtl;
  const out = ss.map((s) =>
    typeof s === 'object' && s !== null && 'titre' in (s as object)
      ? String(
          (rtl ? (s as { titreAr?: string | null }).titreAr : undefined) ??
            (s as { titre?: string }).titre ??
            (s as { nom?: string }).nom ??
            '',
        )
      : '',
  );
  return out.map((x) => x.trim()).filter(Boolean);
}

export function universityName(e: EstablishmentListItem, opts?: { rtl?: boolean }): string {
  const rtl = !!opts?.rtl;
  const u = e.location?.universite;
  if (u && typeof u === 'object') {
    if (rtl && 'nomArabe' in u && (u as { nomArabe?: string }).nomArabe) return String((u as { nomArabe: string }).nomArabe);
    if ('nom' in u && (u as { nom?: string }).nom) return String((u as { nom: string }).nom);
  }
  const legacy = (e as EstablishmentListItem & { universite?: string }).universite;
  return legacy?.trim() ?? '';
}
