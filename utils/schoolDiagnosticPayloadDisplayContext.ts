import type { SchoolQuickDiagnosticForm } from '@/constants/schoolQuickDiagnostic';
import type { DiagnosticUiLocale } from '@/constants/schoolDiagnosticLocale';
import type { CityRow, SecteurRow } from '@/services/referenceData';

export type DiagnosticReportLocale = 'fr' | 'ar';

export type SchoolDiagnosticPayloadDisplayContext = {
  locale: DiagnosticReportLocale;
  cityById: Record<string, string>;
  sectorById: Record<string, string>;
};

export function buildPayloadDisplayContext(
  cities: CityRow[],
  sectors: SecteurRow[],
  locale: DiagnosticReportLocale,
): SchoolDiagnosticPayloadDisplayContext {
  const cityById: Record<string, string> = {};
  for (const c of cities) {
    if (c?.id == null) continue;
    cityById[String(c.id)] = cityDisplayLabel(c, locale);
  }
  const sectorById: Record<string, string> = {};
  for (const s of sectors) {
    if (s?.id == null) continue;
    sectorById[String(s.id)] = sectorDisplayLabel(s, locale);
  }
  return { locale, cityById, sectorById };
}

/** Libellé secteur (arabe si `locale === 'ar'` et `titreAr` présent). */
export function sectorDisplayLabel(
  sector: SecteurRow,
  locale: DiagnosticReportLocale,
): string {
  const ar = sector.titreAr?.trim();
  if (locale === 'ar') {
    return ar || sector.titre?.trim() || String(sector.id);
  }
  return sector.titre?.trim() || String(sector.id);
}

/** Valeur affichée du select secteurs intéressés (noms, pas des ids). */
export function formatSelectedSectorNames(
  ids: readonly string[],
  secteurs: readonly SecteurRow[],
  locale: DiagnosticReportLocale,
  separator?: string,
): string {
  if (!ids.length) return '';
  const sep = separator ?? (locale === 'ar' ? '، ' : ', ');
  const byId = new Map(secteurs.map((s) => [String(s.id), sectorDisplayLabel(s, locale)]));
  return ids
    .map((id) => byId.get(String(id).trim()) ?? '')
    .filter(Boolean)
    .join(sep);
}

/** Langue du passage diagnostic (stockée dans le payload à l’envoi). */
export function resolveDiagnosticReportLocale(
  payload: Record<string, unknown>,
  fallback: DiagnosticReportLocale = 'fr',
): DiagnosticReportLocale {
  const raw = payload.uiLocale ?? payload.locale ?? payload.lang;
  if (raw === 'ar' || raw === 'arabic') return 'ar';
  if (raw === 'fr' || raw === 'french') return 'fr';
  return fallback;
}

export function cityDisplayLabel(
  city: CityRow,
  locale: DiagnosticReportLocale,
): string {
  const ar = (city as { titreAr?: string | null }).titreAr?.trim();
  return locale === 'ar' && ar ? ar : city.titre?.trim() || String(city.id);
}

/** Libellé du champ sélection villes (noms réels, pas « 3 ville(s) »). */
export function formatSelectedCityNames(
  ids: readonly string[],
  cities: readonly CityRow[],
  locale: DiagnosticReportLocale,
  separator?: string,
): string {
  if (!ids.length) return '';
  const sep = separator ?? (locale === 'ar' ? '، ' : ', ');
  const byId = new Map(cities.map((c) => [String(c.id), cityDisplayLabel(c, locale)]));
  return ids
    .map((id) => byId.get(String(id).trim()) ?? '')
    .filter(Boolean)
    .join(sep);
}

export function resolveCityNames(
  ids: unknown[],
  ctx: SchoolDiagnosticPayloadDisplayContext | undefined,
): string[] {
  const strs = ids
    .map((x) => (typeof x === 'string' || typeof x === 'number' ? String(x).trim() : ''))
    .filter(Boolean);
  return strs
    .map((id) => ctx?.cityById[id] ?? '')
    .filter(Boolean);
}

export function resolveSectorNames(
  ids: unknown[],
  ctx: SchoolDiagnosticPayloadDisplayContext | undefined,
): string[] {
  const strs = ids
    .map((x) => (typeof x === 'string' || typeof x === 'number' ? String(x).trim() : ''))
    .filter(Boolean);
  return strs.map((id) => ctx?.sectorById[id] ?? id);
}

/** Libellés arabes envoyés à l’API pour que l’IA ne reçoive pas de codes FR bruts. */
export function enrichSchoolDiagnosticSubmitPayload(
  form: SchoolQuickDiagnosticForm,
  uiLocale: DiagnosticUiLocale,
  cities: readonly CityRow[],
  secteurs: readonly SecteurRow[],
): SchoolQuickDiagnosticForm & { uiLocale: DiagnosticUiLocale } {
  const out: SchoolQuickDiagnosticForm & { uiLocale: DiagnosticUiLocale } = {
    ...form,
    uiLocale,
  };
  if (uiLocale !== 'ar') {
    return out;
  }
  const ctx = buildPayloadDisplayContext([...cities], [...secteurs], 'ar');
  if (form.studyCityScope === 'specific' && form.preferredStudyCityIds.length > 0) {
    const names = resolveCityNames(form.preferredStudyCityIds, ctx);
    if (names.length > 0) {
      (out as SchoolQuickDiagnosticForm & { preferredStudyCityNames?: string[] }).preferredStudyCityNames =
        names;
    }
  }
  if (form.attractedSectors.length > 0) {
    (out as SchoolQuickDiagnosticForm & { attractedSectorLabels?: string[] }).attractedSectorLabels =
      resolveSectorNames(form.attractedSectors, ctx);
  }
  if (form.excludedSectors.length > 0) {
    (out as SchoolQuickDiagnosticForm & { excludedSectorLabels?: string[] }).excludedSectorLabels =
      resolveSectorNames(form.excludedSectors, ctx);
  }
  return out;
}
