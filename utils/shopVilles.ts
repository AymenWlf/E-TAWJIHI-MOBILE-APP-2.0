/**
 * Référentiel villes (livraison COD) — repris du JSON statique partagé avec le front web.
 * Filtre les villes actives, dédoublonne les quartiers Casablanca, et fournit l'extraction
 * du tarif depuis la chaîne « 45 DH ».
 */
import raw from '@/data/villes.json';

export type ShopVilleRow = {
  id: number;
  checkCode: number;
  ville: string;
  name: string;
  arabic_name?: string;
  region: string;
  price: string;
  delais: string;
  active: string;
};

const VILLES = raw as ShopVilleRow[];

function isActiveVilleRow(v: ShopVilleRow): boolean {
  return (v.active ?? '').trim().toLowerCase() === 'oui';
}

function normalizeCasablancaQuarters(active: ShopVilleRow[]): ShopVilleRow[] {
  const CASA_NAME_PREFIX = /^casablanca\s*-\s*/i;
  const isCasaQuarter = (v: ShopVilleRow) => {
    const ville = (v.ville ?? '').trim().toLowerCase();
    return ville === 'casablanca' && CASA_NAME_PREFIX.test((v.name ?? '').trim());
  };

  const casaQuarters = active.filter(isCasaQuarter);
  const rest = active.filter((v) => !isCasaQuarter(v));
  if (casaQuarters.length === 0) return active;

  const autre =
    casaQuarters.find((v) => /autres\s+quartiers/i.test((v.name ?? '').trim())) ??
    casaQuarters.reduce((a, b) => (a.checkCode <= b.checkCode ? a : b));

  return [...rest, { ...autre, name: 'Casablanca', ville: 'Casablanca' }];
}

const ACTIVE_VILLES_LIST: ShopVilleRow[] = normalizeCasablancaQuarters(VILLES.filter(isActiveVilleRow));

function villeTariffMergeKey(v: ShopVilleRow): string {
  return `${(v.ville ?? '').trim().toLowerCase()}\0${(v.price ?? '').trim()}\0${(v.delais ?? '').trim()}`;
}

const VILLE_TARIFF_MERGE_COUNTS = new Map<string, number>();
for (const v of ACTIVE_VILLES_LIST) {
  const k = villeTariffMergeKey(v);
  VILLE_TARIFF_MERGE_COUNTS.set(k, (VILLE_TARIFF_MERGE_COUNTS.get(k) ?? 0) + 1);
}

export function getActiveShopVilles(): ShopVilleRow[] {
  return ACTIVE_VILLES_LIST;
}

export function isMergedVilleTariffGroup(row: ShopVilleRow): boolean {
  return (VILLE_TARIFF_MERGE_COUNTS.get(villeTariffMergeKey(row)) ?? 0) > 1;
}

export function shopVilleListLabel(row: ShopVilleRow): string {
  if (isMergedVilleTariffGroup(row)) {
    const t = (row.ville ?? '').trim();
    return t !== '' ? t : row.name.trim();
  }
  return row.name.trim();
}

export function parseShopVillePriceAmount(price: string): number {
  const m = price.match(/(\d+(?:[.,]\d+)?)/);
  if (!m) return 0;
  return Number.parseFloat(m[1].replace(',', '.')) || 0;
}

export function filterShopVilles(query: string, limit = 70): { row: ShopVilleRow; label: string }[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const scored: { v: ShopVilleRow; score: number }[] = [];
  for (const v of ACTIVE_VILLES_LIST) {
    const name = (v.name ?? '').toLowerCase();
    const ville = (v.ville ?? '').toLowerCase();
    const region = (v.region ?? '').toLowerCase();
    const arab = (v.arabic_name ?? '').toLowerCase();
    if (!name.includes(q) && !ville.includes(q) && !region.includes(q) && !arab.includes(q)) continue;

    let score = 0;
    if (name.startsWith(q)) score += 120;
    else if (name.includes(q)) score += 60;
    if (ville.startsWith(q)) score += 45;
    else if (ville.includes(q)) score += 25;
    if (region.includes(q)) score += 15;
    if (arab.includes(q)) score += 10;
    scored.push({ v, score });
  }
  scored.sort(
    (a, b) => b.score - a.score || a.v.name.localeCompare(b.v.name, 'fr', { sensitivity: 'base' }),
  );

  const seenKeys = new Set<string>();
  const deduped: ShopVilleRow[] = [];
  for (const { v } of scored) {
    const k = villeTariffMergeKey(v);
    if (seenKeys.has(k)) continue;
    seenKeys.add(k);
    deduped.push(v);
    if (deduped.length >= limit) break;
  }

  return deduped.map((row) => ({ row, label: shopVilleListLabel(row) }));
}
