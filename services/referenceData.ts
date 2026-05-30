import { buildApiUrl } from '@/constants/api';
import { httpGetJson } from '@/services/http';

export type CityRow = { id: number; titre: string; region?: { id: number; titre: string } | null };

export async function listCities(limit = 1000): Promise<CityRow[]> {
  const url = buildApiUrl('/api/cities', { limit });
  const res = await httpGetJson<{ success: boolean; data: CityRow[] }>(url);
  return res.data ?? [];
}

export type SecteurRow = { id: number; titre: string; titreAr?: string | null; code?: string };

function normalizeSecteurRow(raw: Record<string, unknown>): SecteurRow | null {
  const id = typeof raw.id === 'number' ? raw.id : Number(raw.id);
  if (!Number.isFinite(id) || id < 1) return null;
  const titre = typeof raw.titre === 'string' ? raw.titre : '';
  const titreArRaw = raw.titreAr ?? raw.titre_ar;
  const titreAr =
    typeof titreArRaw === 'string' && titreArRaw.trim() !== '' ? titreArRaw.trim() : null;
  const code = typeof raw.code === 'string' ? raw.code : undefined;
  return { id, titre, titreAr, code };
}

export async function listAllSecteursActive(): Promise<SecteurRow[]> {
  const limit = 100;
  const out: SecteurRow[] = [];
  let page = 1;
  let pages = 1;
  do {
    const url = buildApiUrl('/api/secteurs', { page, limit, isActivate: '1' });
    const res = await httpGetJson<{
      success: boolean;
      data: Record<string, unknown>[];
      pagination?: { pages: number };
    }>(url);
    for (const row of res.data ?? []) {
      const s = normalizeSecteurRow(row);
      if (s) out.push(s);
    }
    pages = res.pagination?.pages ?? 1;
    page += 1;
  } while (page <= pages);
  return out;
}
