import { buildApiUrl } from '@/constants/api';
import { getEstablishmentFileUrl } from '@/constants/establishmentMedia';
import { httpGetJson } from '@/services/http';

export type SecteurCard = {
  id: number;
  titre: string;
  titreAr: string | null;
  code: string;
  description: string;
  image: string | null;
  imageUrl: string | null;
  softSkills: string[];
  personnalites: string[];
  bacs: string[];
  typeBacs: string[];
  avantages: string[];
  inconvenients: string[];
  metiers: string[];
  salaireLabel: string | null;
  nbFilieres: number;
  nbEcoles: number;
  nbMetiers: number;
  recommendationScore: number | null;
};

export type SecteurDetail = SecteurCard & {
  keywords: string[];
  status: string;
  isComplet: boolean;
};

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === 'string' ? x.trim() : ''))
    .filter((x) => x.length > 0);
}

function formatSalaire(raw: Record<string, unknown>): string | null {
  const direct = typeof raw.salaire === 'string' ? raw.salaire.trim() : '';
  if (direct) return direct;
  const min = raw.salaireMin != null ? String(raw.salaireMin).trim() : '';
  const max = raw.salaireMax != null ? String(raw.salaireMax).trim() : '';
  if (min && max) return `${min} - ${max} MAD`;
  if (min) return `À partir de ${min} MAD`;
  if (max) return `Jusqu'à ${max} MAD`;
  return null;
}

function normalizeSecteur(raw: Record<string, unknown>, score?: number | null): SecteurCard | null {
  const id = typeof raw.id === 'number' ? raw.id : Number(raw.id);
  if (!Number.isFinite(id) || id < 1) return null;
  const titre = typeof raw.titre === 'string' ? raw.titre.trim() : '';
  if (!titre) return null;
  const titreArRaw = raw.titreAr ?? raw.titre_ar;
  const titreAr =
    typeof titreArRaw === 'string' && titreArRaw.trim() !== '' ? titreArRaw.trim() : null;
  const image = typeof raw.image === 'string' && raw.image.trim() ? raw.image.trim() : null;
  const metiers = asStringArray(raw.metiers);
  const nbMetiersRaw = raw.nbMetiers;
  const nbMetiers =
    typeof nbMetiersRaw === 'number' && Number.isFinite(nbMetiersRaw)
      ? nbMetiersRaw
      : metiers.length;

  return {
    id,
    titre,
    titreAr,
    code: typeof raw.code === 'string' ? raw.code.trim() : '',
    description: typeof raw.description === 'string' ? raw.description : '',
    image,
    imageUrl: getEstablishmentFileUrl(image),
    softSkills: asStringArray(raw.softSkills),
    personnalites: asStringArray(raw.personnalites),
    bacs: asStringArray(raw.bacs),
    typeBacs: asStringArray(raw.typeBacs),
    avantages: asStringArray(raw.avantages),
    inconvenients: asStringArray(raw.inconvenients),
    metiers,
    salaireLabel: formatSalaire(raw),
    nbFilieres: typeof raw.nbFilieres === 'number' ? raw.nbFilieres : 0,
    nbEcoles: typeof raw.nbEcoles === 'number' ? raw.nbEcoles : 0,
    nbMetiers,
    recommendationScore:
      score != null && Number.isFinite(score) && score > 0 ? Math.round(score) : null,
  };
}

export function pickSecteurTitle(item: Pick<SecteurCard, 'titre' | 'titreAr'>, locale: 'fr' | 'ar'): string {
  if (locale === 'ar' && item.titreAr?.trim()) return item.titreAr.trim();
  return item.titre;
}

export async function fetchSecteursCatalog(opts?: {
  search?: string;
  token?: string | null;
}): Promise<{ items: SecteurCard[]; total: number }> {
  const search = opts?.search?.trim() || undefined;
  const url = buildApiUrl('/api/secteurs', {
    page: 1,
    limit: 1000,
    isActivate: '1',
    status: 'Actif',
    ...(search ? { search } : {}),
  });
  const headers: Record<string, string> = {};
  if (opts?.token) headers.Authorization = `Bearer ${opts.token}`;
  const res = await httpGetJson<{
    success?: boolean;
    data?: Record<string, unknown>[];
    pagination?: { total?: number };
    recommendations?: { scores?: Record<string, number> };
  }>(url, Object.keys(headers).length ? { headers } : undefined);

  const scores = res.recommendations?.scores ?? {};
  const items: SecteurCard[] = [];
  for (const row of res.data ?? []) {
    const id = typeof row.id === 'number' ? row.id : Number(row.id);
    const scoreRaw = Number.isFinite(id)
      ? scores[String(id)] ?? (scores as Record<number, number>)[id]
      : undefined;
    const s = normalizeSecteur(row, typeof scoreRaw === 'number' ? scoreRaw : null);
    if (s) items.push(s);
  }

  items.sort((a, b) => {
    const sa = a.recommendationScore ?? -1;
    const sb = b.recommendationScore ?? -1;
    if (sb !== sa) return sb - sa;
    return a.titre.localeCompare(b.titre, 'fr');
  });

  return {
    items,
    total: res.pagination?.total ?? items.length,
  };
}

export async function fetchSecteurDetail(
  id: number,
  opts?: { token?: string | null },
): Promise<SecteurDetail | null> {
  const url = buildApiUrl(`/api/secteurs/${id}`);
  const headers: Record<string, string> = {};
  if (opts?.token) headers.Authorization = `Bearer ${opts.token}`;
  const res = await httpGetJson<{ success?: boolean; data?: Record<string, unknown> }>(
    url,
    Object.keys(headers).length ? { headers } : undefined,
  );
  if (!res.data) return null;
  const base = normalizeSecteur(res.data);
  if (!base) return null;
  return {
    ...base,
    keywords: asStringArray(res.data.keywords),
    status: typeof res.data.status === 'string' ? res.data.status : '',
    isComplet: res.data.isComplet === true,
  };
}
