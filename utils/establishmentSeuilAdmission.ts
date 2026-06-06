/**
 * Seuils d'admission établissement — parsing JSON API + affichage public (web / admin).
 * Grille : general | filiere_bac | genre | ville
 * Temporalité : previsionnel | anneeEnCours | anneePrecedente (+ source official | estimation)
 */

export type SeuilAdmissionMode = 'general' | 'filiere_bac' | 'genre' | 'ville' | '';

export type SeuilTemporalKey = 'previsionnel' | 'anneeEnCours' | 'anneePrecedente';

export type SeuilSource = 'official' | 'estimation';

export type SeuilPairForm = {
  previsionnel: number | '';
  previsionnelSource: SeuilSource;
  anneeEnCours: number | '';
  anneeEnCoursSource: SeuilSource;
  anneePrecedente: number | '';
  anneePrecedenteSource: SeuilSource;
};

export type SeuilValueDisplay = {
  key: SeuilTemporalKey;
  temporalLabel: string;
  valueLabel: string;
  source: SeuilSource;
  sourceLabel: string;
};

export type SeuilRowDisplay = {
  segmentLabel: string;
  values: SeuilValueDisplay[];
};

export type SeuilAdmissionDisplay = {
  mode: SeuilAdmissionMode;
  modeShortLabel: string;
  cardLine: string;
  bacNormalRows: SeuilRowDisplay[];
  bacMissionRow: SeuilRowDisplay | null;
  hasAnyValue: boolean;
};

/** @deprecated Utiliser SeuilAdmissionDisplay — alias rétrocompat listing. */
export type SeuilPrevisionnelDisplay = {
  mode: SeuilAdmissionMode;
  modeShortLabel: string;
  cardLine: string;
  detailRows: { label: string; value: string }[];
};

const MODE_SHORT: Record<Exclude<SeuilAdmissionMode, ''>, string> = {
  general: 'Général',
  filiere_bac: 'Par filière',
  genre: 'Par genre',
  ville: 'Par campus',
};

const MODE_SHORT_AR: Record<Exclude<SeuilAdmissionMode, ''>, string> = {
  general: 'عام',
  filiere_bac: 'حسب الشعبة',
  genre: 'حسب الجنس',
  ville: 'حسب الحرم',
};

export const SEUIL_TEMPORAL_LABELS_FR: Record<SeuilTemporalKey, string> = {
  previsionnel: 'Prévisionnel',
  anneeEnCours: 'Année en cours',
  anneePrecedente: 'Année précédente',
};

export const SEUIL_TEMPORAL_LABELS_AR: Record<SeuilTemporalKey, string> = {
  previsionnel: 'توقعي',
  anneeEnCours: 'السنة الجارية',
  anneePrecedente: 'السنة السابقة',
};

export const SEUIL_SOURCE_LABELS_FR: Record<SeuilSource, string> = {
  official: 'Officiel',
  estimation: 'Estimation',
};

export const SEUIL_SOURCE_LABELS_AR: Record<SeuilSource, string> = {
  official: 'رسمي',
  estimation: 'تقدير',
};

const TEMPORAL_KEYS: SeuilTemporalKey[] = ['previsionnel', 'anneeEnCours', 'anneePrecedente'];

export function emptySeuilPairForm(): SeuilPairForm {
  return {
    previsionnel: '',
    previsionnelSource: 'estimation',
    anneeEnCours: '',
    anneeEnCoursSource: 'official',
    anneePrecedente: '',
    anneePrecedenteSource: 'official',
  };
}

export function normalizeSeuilSource(raw: unknown, fallback: SeuilSource = 'estimation'): SeuilSource {
  return raw === 'official' ? 'official' : raw === 'estimation' ? 'estimation' : fallback;
}

function numValue(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = parseFloat(v.trim().replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function formatNote20(n: number): string {
  const t = n.toFixed(1).replace('.', ',');
  return t.endsWith(',0') ? t.slice(0, -2) : t;
}

function rangeLabel(nums: number[]): string {
  const valid = nums.filter((x) => Number.isFinite(x));
  if (valid.length === 0) return '';
  const mn = Math.min(...valid);
  const mx = Math.max(...valid);
  if (mn === mx) return `${formatNote20(mn)}/20`;
  return `${formatNote20(mn)}–${formatNote20(mx)}/20`;
}

function mergeParFiliereBac(bn: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const pf = bn.parFiliereBac;
  if (pf && typeof pf === 'object') Object.assign(out, pf as Record<string, unknown>);
  const legacy = bn.parFiliereEtude;
  if (legacy && typeof legacy === 'object') {
    for (const [k, v] of Object.entries(legacy as Record<string, unknown>)) {
      if (/^\d+$/.test(k)) continue;
      if (out[k] === undefined) out[k] = v;
    }
  }
  return out;
}

export function normalizeSeuilAdmissionMode(raw: unknown): SeuilAdmissionMode {
  if (!raw || typeof raw !== 'object') return '';
  const o = raw as Record<string, unknown>;
  let modeRaw = typeof o.mode === 'string' ? o.mode.trim() : '';
  const bn = (o.bacNormal && typeof o.bacNormal === 'object' ? o.bacNormal : {}) as Record<string, unknown>;
  if (modeRaw === '' && typeof bn.mode === 'string') modeRaw = bn.mode.trim();
  if (modeRaw === 'filiere_etude') return 'filiere_bac';
  if (['general', 'filiere_bac', 'genre', 'ville'].includes(modeRaw)) return modeRaw as SeuilAdmissionMode;
  if (Object.keys(mergeParFiliereBac(bn)).length > 0) return 'filiere_bac';
  if (bn.general && typeof bn.general === 'object') return 'general';
  if (bn.parGenre && typeof bn.parGenre === 'object') return 'genre';
  if (bn.parFiliereBac && typeof bn.parFiliereBac === 'object' && Object.keys(bn.parFiliereBac as object).length > 0) {
    return 'filiere_bac';
  }
  const parCampus = bn.parCampus;
  const parVille = bn.parVille;
  if (
    (parCampus && typeof parCampus === 'object' && Object.keys(parCampus as object).length > 0) ||
    (parVille && typeof parVille === 'object' && Object.keys(parVille as object).length > 0)
  ) {
    return 'ville';
  }
  return '';
}

export function pairFromApiSeuil(v: unknown): SeuilPairForm {
  if (!v || typeof v !== 'object') return emptySeuilPairForm();
  const o = v as Record<string, unknown>;
  const num = (x: unknown): number | '' => {
    const n = numValue(x);
    return n !== null ? n : '';
  };
  return {
    previsionnel: num(o.previsionnel),
    previsionnelSource: normalizeSeuilSource(o.previsionnelSource, 'estimation'),
    anneeEnCours: num(o.anneeEnCours),
    anneeEnCoursSource: normalizeSeuilSource(o.anneeEnCoursSource, 'official'),
    anneePrecedente: num(o.anneePrecedente),
    anneePrecedenteSource: normalizeSeuilSource(o.anneePrecedenteSource, 'official'),
  };
}

export function toApiSeuilPair(p: SeuilPairForm): Record<string, unknown> | null {
  const out: Record<string, unknown> = {};
  if (p.previsionnel !== '' && Number.isFinite(Number(p.previsionnel))) {
    out.previsionnel = Number(p.previsionnel);
    out.previsionnelSource = p.previsionnelSource;
  }
  if (p.anneeEnCours !== '' && Number.isFinite(Number(p.anneeEnCours))) {
    out.anneeEnCours = Number(p.anneeEnCours);
    out.anneeEnCoursSource = p.anneeEnCoursSource;
  }
  if (p.anneePrecedente !== '' && Number.isFinite(Number(p.anneePrecedente))) {
    out.anneePrecedente = Number(p.anneePrecedente);
    out.anneePrecedenteSource = p.anneePrecedenteSource;
  }
  return Object.keys(out).length ? out : null;
}

function pairTemporalValue(pair: unknown, key: SeuilTemporalKey): number | null {
  if (!pair || typeof pair !== 'object') return null;
  return numValue((pair as Record<string, unknown>)[key]);
}

function pairTemporalSource(pair: unknown, key: SeuilTemporalKey): SeuilSource {
  if (!pair || typeof pair !== 'object') {
    return key === 'previsionnel' ? 'estimation' : 'official';
  }
  const srcKey = `${key}Source`;
  return normalizeSeuilSource(
    (pair as Record<string, unknown>)[srcKey],
    key === 'previsionnel' ? 'estimation' : 'official',
  );
}

function buildRowValues(pair: unknown, locale: 'fr' | 'ar'): SeuilValueDisplay[] {
  const temporalLabels = locale === 'ar' ? SEUIL_TEMPORAL_LABELS_AR : SEUIL_TEMPORAL_LABELS_FR;
  const sourceLabels = locale === 'ar' ? SEUIL_SOURCE_LABELS_AR : SEUIL_SOURCE_LABELS_FR;
  const values: SeuilValueDisplay[] = [];
  for (const key of TEMPORAL_KEYS) {
    const n = pairTemporalValue(pair, key);
    if (n === null) continue;
    const source = pairTemporalSource(pair, key);
    values.push({
      key,
      temporalLabel: temporalLabels[key],
      valueLabel: `${formatNote20(n)}/20`,
      source,
      sourceLabel: sourceLabels[source],
    });
  }
  return values;
}

function genreLabel(key: string, locale: 'fr' | 'ar'): string {
  if (key === 'homme') return locale === 'ar' ? 'ذكور' : 'Hommes';
  if (key === 'femme') return locale === 'ar' ? 'إناث' : 'Femmes';
  return key;
}

export type SeuilDisplayContext = {
  locale?: 'fr' | 'ar';
  campusLabels?: Record<string, string>;
  villeLabels?: Record<string, string>;
};

function resolveCampusSegmentLabel(
  campusId: string,
  context: SeuilDisplayContext,
  locale: 'fr' | 'ar',
): string {
  const labels = context.campusLabels;
  if (labels) {
    const direct = labels[campusId];
    if (direct) return direct;
    const stripped = campusId.replace(/^campus-/, '');
    if (labels[stripped]) return labels[stripped];
    if (labels[`campus-${stripped}`]) return labels[`campus-${stripped}`];
  }
  return locale === 'ar' ? `حرم ${campusId}` : `Campus ${campusId}`;
}

function collectPrevisionnelNums(pair: unknown): number[] {
  const n = pairTemporalValue(pair, 'previsionnel');
  return n !== null ? [n] : [];
}

function collectFromRecordPairs(rec: Record<string, unknown>): number[] {
  const nums: number[] = [];
  for (const v of Object.values(rec)) nums.push(...collectPrevisionnelNums(v));
  return nums;
}

export function getSeuilAdmissionDisplay(
  seuilsAdmission: unknown,
  context: SeuilDisplayContext = {},
): SeuilAdmissionDisplay | null {
  if (!seuilsAdmission || typeof seuilsAdmission !== 'object') return null;
  const locale = context.locale === 'ar' ? 'ar' : 'fr';
  const raw = seuilsAdmission as Record<string, unknown>;
  const bn = (raw.bacNormal && typeof raw.bacNormal === 'object' ? raw.bacNormal : {}) as Record<string, unknown>;
  const mode = normalizeSeuilAdmissionMode(raw);
  const bacNormalRows: SeuilRowDisplay[] = [];

  if (mode === 'general') {
    const values = buildRowValues(bn.general, locale);
    if (values.length) {
      bacNormalRows.push({
        segmentLabel: locale === 'ar' ? 'البكالوريا المغربية (عام)' : 'Bac marocain (général)',
        values,
      });
    }
  } else if (mode === 'filiere_bac') {
    const map = mergeParFiliereBac(bn);
    for (const [label, pair] of Object.entries(map)) {
      const values = buildRowValues(pair, locale);
      if (values.length) bacNormalRows.push({ segmentLabel: label, values });
    }
  } else if (mode === 'genre') {
    const pg = (bn.parGenre && typeof bn.parGenre === 'object' ? bn.parGenre : {}) as Record<string, unknown>;
    for (const g of ['homme', 'femme'] as const) {
      const values = buildRowValues(pg[g], locale);
      if (values.length) bacNormalRows.push({ segmentLabel: genreLabel(g, locale), values });
    }
  } else if (mode === 'ville') {
    const parCampus =
      bn.parCampus && typeof bn.parCampus === 'object' ? (bn.parCampus as Record<string, unknown>) : {};
    for (const [campusId, pair] of Object.entries(parCampus)) {
      const values = buildRowValues(pair, locale);
      if (!values.length) continue;
      const label = resolveCampusSegmentLabel(campusId, context, locale);
      bacNormalRows.push({ segmentLabel: label, values });
    }
    const parVille = bn.parVille && typeof bn.parVille === 'object' ? (bn.parVille as Record<string, unknown>) : {};
    for (const [villeId, pair] of Object.entries(parVille)) {
      const values = buildRowValues(pair, locale);
      if (!values.length) continue;
      const label =
        context.villeLabels?.[villeId] ??
        (locale === 'ar' ? `المدينة ${villeId}` : `Ville ${villeId}`);
      bacNormalRows.push({ segmentLabel: label, values });
    }
  } else {
    const g = buildRowValues(bn.general, locale);
    if (g.length) {
      bacNormalRows.push({
        segmentLabel: locale === 'ar' ? 'البكالوريا المغربية' : 'Bac marocain',
        values: g,
      });
    } else {
      const map = mergeParFiliereBac(bn);
      for (const [label, pair] of Object.entries(map)) {
        const values = buildRowValues(pair, locale);
        if (values.length) bacNormalRows.push({ segmentLabel: label, values });
      }
    }
  }

  const missionValues = buildRowValues(raw.bacMission, locale);
  const bacMissionRow: SeuilRowDisplay | null = missionValues.length
    ? { segmentLabel: locale === 'ar' ? 'البكالوريا الدولية' : 'Bac mission', values: missionValues }
    : null;

  const hasAnyValue = bacNormalRows.length > 0 || bacMissionRow !== null;
  if (!hasAnyValue) return null;

  let bacNums: number[] = [];
  if (mode === 'general') bacNums = collectPrevisionnelNums(bn.general);
  else if (mode === 'filiere_bac') bacNums = collectFromRecordPairs(mergeParFiliereBac(bn));
  else if (mode === 'genre') {
    const pg = (bn.parGenre && typeof bn.parGenre === 'object' ? bn.parGenre : {}) as Record<string, unknown>;
    bacNums = [...collectPrevisionnelNums(pg.homme), ...collectPrevisionnelNums(pg.femme)];
  } else if (mode === 'ville') {
    const parCampus =
      bn.parCampus && typeof bn.parCampus === 'object' ? (bn.parCampus as Record<string, unknown>) : {};
    const parVille = bn.parVille && typeof bn.parVille === 'object' ? (bn.parVille as Record<string, unknown>) : {};
    bacNums = [...collectFromRecordPairs(parCampus), ...collectFromRecordPairs(parVille)];
  }

  const missionN = pairTemporalValue(raw.bacMission, 'previsionnel');
  const modeShortLabel =
    mode && mode in MODE_SHORT
      ? locale === 'ar'
        ? MODE_SHORT_AR[mode as keyof typeof MODE_SHORT_AR]
        : MODE_SHORT[mode as keyof typeof MODE_SHORT]
      : '—';
  const modeTag =
    mode === 'general' ? '' : mode === 'filiere_bac' ? ' · filière' : mode === 'genre' ? ' · genre' : mode === 'ville' ? ' · campus' : '';

  let cardLine = bacNums.length ? `Prév. ${rangeLabel(bacNums)}${modeTag}` : '';
  if (missionN !== null) {
    const mShort = `M ${formatNote20(missionN)}/20`;
    cardLine = cardLine ? `${cardLine} · ${mShort}` : mShort;
  }
  if (!cardLine && hasAnyValue) {
    cardLine = locale === 'ar' ? 'عتبات القبول' : `Seuils ${modeShortLabel.toLowerCase()}`;
  }

  return { mode, modeShortLabel, cardLine, bacNormalRows, bacMissionRow, hasAnyValue };
}

/** Rétrocompat — résumé prévisionnel uniquement pour cartes listing. */
export function getSeuilPrevisionnelDisplay(seuilsAdmission: unknown): SeuilPrevisionnelDisplay | null {
  const full = getSeuilAdmissionDisplay(seuilsAdmission, { locale: 'fr' });
  if (!full) return null;
  const detailRows: { label: string; value: string }[] = [];
  for (const row of full.bacNormalRows) {
    const prev = row.values.find((v) => v.key === 'previsionnel');
    if (prev) {
      detailRows.push({
        label: row.segmentLabel,
        value: `${prev.temporalLabel} ${prev.valueLabel} (${prev.sourceLabel})`,
      });
    } else if (row.values.length === 1) {
      const v = row.values[0];
      detailRows.push({ label: row.segmentLabel, value: `${v.temporalLabel} ${v.valueLabel}` });
    } else if (row.values.length > 1) {
      detailRows.push({
        label: row.segmentLabel,
        value: row.values.map((v) => `${v.temporalLabel} ${v.valueLabel}`).join(' · '),
      });
    }
  }
  if (full.bacMissionRow) {
    const prev = full.bacMissionRow.values.find((v) => v.key === 'previsionnel') ?? full.bacMissionRow.values[0];
    if (prev) {
      detailRows.push({
        label: full.bacMissionRow.segmentLabel,
        value: `${prev.temporalLabel} ${prev.valueLabel}`,
      });
    }
  }
  return {
    mode: full.mode,
    modeShortLabel: full.modeShortLabel,
    cardLine: full.cardLine,
    detailRows,
  };
}
