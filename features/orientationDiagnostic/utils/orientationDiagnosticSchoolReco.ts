/**
 * Recommandation d’écoles algorithmique (style diagnostic mobile), sans couche IA.
 * Poids alignés sur SchoolDiagnosticMatchingService (backend).
 */

import type { DiagnosticAnswers, OrientationSchoolReco } from '../types/orientationDiagnosticPrototype';
import establishmentService, {
  type Establishment,
} from '../services/establishmentService';
import {
  DIAGNOSTIC_TIER_LABELS,
  getSchoolDiagnosticTier,
  type DiagnosticTierId,
} from './schoolDiagnosticTier';
import {
  extractVersusSignals,
  VERSUS_FACULTES_PUBLIQUES_ID,
} from './orientationDiagnosticVersus';
import {
  admissionImpliesConcours,
  normalizeAdmissionType,
  resolveAdmissionDisplayLabel,
} from '../constants/establishmentAdmissionType';
import {
  normalizeOrientationPlan,
  orientationPlanLabel,
} from '../constants/establishmentOrientationPlan';
import { flattenSelectedEcoleIds } from '../data/orientationDiagnosticQuestions';
import { isFacultePubliqueAccesOuvert } from './orientationFacultePubliqueGroup';

const WEIGHT = {
  secteurs: 15,
  ville: 18,
  type: 14,
  bac: 18,
  budget: 5,
  concours: 5,
  notes: 9,
  langues: 8,
  diplomes: 8,
} as const;

const CITY_ID_TO_LABEL: Record<string, string> = {
  casa: 'Casablanca',
  rabat: 'Rabat',
  marrakech: 'Marrakech',
  tanger: 'Tanger',
  fes: 'Fès',
};

type MatchPayload = {
  attractedSectors: string[];
  excludedSectors: string[];
  studyCityScope: 'any' | 'specific' | '';
  preferredCityNames: string[];
  bacType: 'normal' | 'mission' | '';
  bacStream: string;
  missionSpecialite1: string;
  missionSpecialite2: string;
  missionSpecialite3: string;
  prefPublic: boolean;
  prefPrivate: boolean;
  prefSemiPublic: boolean;
  prefMilitary: boolean;
  privateMonthlyBudgetBracket: string;
  considersContests: '' | 'yes' | 'no' | 'unsure';
  userReferenceNote: number | null;
  diplomesSouhaites: string[];
  radarSchoolIds: Set<string>;
  /** Compteur de victoires Versus par école */
  versusWinCounts: Map<string, number>;
  /** Compteur de défaites Versus par école */
  versusLossCounts: Map<string, number>;
  /** Types favorisés via Versus (Public, Privé…) */
  versusPreferredTypes: Map<string, number>;
  /** Villes favorisées via Versus (normalisées) */
  versusPreferredCities: Map<string, number>;
};

function clamp100(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Victoires Versus : id école + victoires du groupe « Universités et facultés publiques ». */
function versusWinsFor(p: MatchPayload, e: Establishment): number {
  const direct = p.versusWinCounts.get(String(e.id)) || 0;
  const group =
    isFacultePubliqueAccesOuvert(e)
      ? p.versusWinCounts.get(VERSUS_FACULTES_PUBLIQUES_ID) || 0
      : 0;
  return direct + group;
}

function versusLossesFor(p: MatchPayload, e: Establishment): number {
  const direct = p.versusLossCounts.get(String(e.id)) || 0;
  const group =
    isFacultePubliqueAccesOuvert(e)
      ? p.versusLossCounts.get(VERSUS_FACULTES_PUBLIQUES_ID) || 0
      : 0;
  return direct + group;
}

function normLabel(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function normalizeType(type?: string | null): string {
  const t = (type || '').trim();
  if (t.toLowerCase() === 'semi-public') return 'Semi-Public';
  return t;
}

function parseMoney(v?: string | null): number | null {
  if (v == null || v === '') return null;
  const f = Number(String(v).replace(',', '.').replace(/\s/g, ''));
  return Number.isFinite(f) ? f : null;
}

function parseNote(v?: string | null): number | null {
  if (v == null || String(v).trim() === '') return null;
  const f = Number(String(v).replace(',', '.'));
  if (!Number.isFinite(f) || f <= 0 || f > 20) return null;
  return f;
}

function bracketToRangeDh(bracket: string): [number | null, number] {
  switch (bracket) {
    case '2000_4000':
      return [2000, 4000];
    case '4000_8000':
      return [4000, 8000];
    case '8000_15000':
      return [8000, 15000];
    case '15000_plus':
      return [15000, 500000];
    default:
      return [null, 0];
  }
}

/** Budget annuel orientation → bracket mensuel diagnostic écoles. */
function mapBudgetBracket(realBudget?: string): string {
  switch (realBudget) {
    case 'public':
      return '0_public_only';
    case 'lt30':
      return '2000_4000';
    case '30_60':
      return '4000_8000';
    case '60_100':
      return '8000_15000';
    case 'gt100':
      return '15000_plus';
    default:
      return '';
  }
}

function mapDiplomes(niveau?: string): string[] {
  switch (niveau) {
    case 'bac2':
      return ['DUT', 'BTS', 'DEUG', 'Bac+2'];
    case 'bac3':
      return ['Licence', 'Bachelor', 'Bac+3'];
    case 'bac5':
      return ['Master', 'Ingénieur', 'Bac+5'];
    case 'bac8':
      return ['Doctorat', 'PhD', 'Bac+8'];
    default:
      return [];
  }
}

function extractUserNote(profile: DiagnosticAnswers['profile']): number | null {
  if (profile.bacType === 'mission') {
    return (
      parseNote(profile.noteGeneraleBac) ??
      parseNote(profile.noteGeneraleTerminale) ??
      parseNote(profile.noteGeneralePremiere)
    );
  }
  return (
    parseNote(profile.noteNational) ??
    parseNote(profile.noteControleContinu) ??
    parseNote(profile.noteGenerale1ereBac)
  );
}

function collectNumericThresholds(node: unknown, out: number[] = []): number[] {
  if (node == null) return out;
  if (typeof node === 'number' && Number.isFinite(node) && node > 0 && node <= 20) {
    out.push(node);
    return out;
  }
  if (typeof node === 'string') {
    const n = parseNote(node);
    if (n != null) out.push(n);
    return out;
  }
  if (Array.isArray(node)) {
    node.forEach((v) => collectNumericThresholds(v, out));
    return out;
  }
  if (typeof node === 'object') {
    Object.values(node as Record<string, unknown>).forEach((v) =>
      collectNumericThresholds(v, out),
    );
  }
  return out;
}

/** Ville d’un campus (string, `{ titre }`, ou `city.titre`). */
export function campusVilleName(campus: unknown): string | null {
  if (!campus || typeof campus !== 'object') return null;
  const c = campus as {
    ville?: string | { titre?: string } | null;
    city?: { titre?: string } | null;
  };
  if (typeof c.ville === 'string' && c.ville.trim()) return c.ville.trim();
  if (c.ville && typeof c.ville === 'object' && c.ville.titre?.trim()) {
    return c.ville.titre.trim();
  }
  if (c.city?.titre?.trim()) return c.city.titre.trim();
  return null;
}

function pushUniqueCity(out: string[], seen: Set<string>, raw?: string | null) {
  const t = (raw || '').trim();
  if (!t) return;
  const key = normLabel(t);
  if (!key || seen.has(key)) return;
  seen.add(key);
  out.push(t);
}

/**
 * Villes affichables (casse d’origine).
 * Campus associés en priorité, puis siège / listes `villes`.
 */
export function establishmentDisplayCities(e: Establishment): string[] {
  const seen = new Set<string>();
  const fromCampus: string[] = [];
  if (Array.isArray(e.campus)) {
    for (const campus of e.campus) {
      pushUniqueCity(fromCampus, seen, campusVilleName(campus));
    }
  }
  if (fromCampus.length) return fromCampus;

  const fallback: string[] = [];
  pushUniqueCity(fallback, seen, e.ville);
  pushUniqueCity(fallback, seen, e.location?.ville);
  if (Array.isArray(e.villes)) e.villes.forEach((v) => pushUniqueCity(fallback, seen, v));
  if (Array.isArray(e.location?.villes)) {
    e.location.villes.forEach((v) => pushUniqueCity(fallback, seen, v));
  }
  return fallback;
}

/** Labels normalisés pour le matching ville (préférence étudiant). */
function establishmentCityLabels(e: Establishment): string[] {
  return establishmentDisplayCities(e).map((x) => normLabel(x)).filter(Boolean);
}

/** Durée d’études affichable (ex. « 3 ans », « 3-5 ans »). */
export function establishmentDureeEtudesLabel(e: {
  dureeEtudes?: string | number | null;
  dureeEtudesMin?: number | null;
  dureeEtudesMax?: number | null;
  anneesEtudes?: number | string | null;
}): string {
  const raw = e.dureeEtudes;
  if (typeof raw === 'string' && raw.trim()) {
    const t = raw.trim();
    return /\bans?\b/i.test(t) ? t : `${t} ans`;
  }
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
    return `${raw} ans`;
  }
  const min = e.dureeEtudesMin;
  const max = e.dureeEtudesMax;
  if (min != null && max != null && min > 0 && max > 0) {
    return min === max ? `${min} ans` : `${min}-${max} ans`;
  }
  if (max != null && max > 0) return `${max} ans`;
  if (min != null && min > 0) return `${min} ans`;
  const annees = e.anneesEtudes;
  if (typeof annees === 'number' && Number.isFinite(annees) && annees > 0) {
    return `${annees} ans`;
  }
  if (typeof annees === 'string' && annees.trim()) {
    const t = annees.trim();
    return /\bans?\b/i.test(t) ? t : `${t} ans`;
  }
  return '';
}

/** Diplômes délivrés (liste unique). */
export function establishmentDiplomesList(e: {
  diplomesDelivres?: string[] | null;
  diplomes?: string[] | null;
}): string[] {
  const raw = [
    ...(Array.isArray(e.diplomesDelivres) ? e.diplomesDelivres : []),
    ...(Array.isArray(e.diplomes) ? e.diplomes : []),
  ]
    .map((d) => String(d || '').trim())
    .filter(Boolean);
  return [...new Set(raw)];
}

export function establishmentDiplomesLabel(
  e: {
    diplomesDelivres?: string[] | null;
    diplomes?: string[] | null;
  },
  max = 4,
): string {
  const list = establishmentDiplomesList(e);
  if (!list.length) return '';
  if (list.length <= max) return list.join(' · ');
  return `${list.slice(0, max).join(' · ')} (+${list.length - max})`;
}

function isPaidPrivate(e: Establishment): boolean {
  const t = normalizeType(e.type);
  if (t !== 'Privé' && t !== 'Semi-Public') return false;
  const min = parseMoney(e.fraisScolariteMin);
  if (min === 0) return false;
  return true;
}

export function answersToSchoolMatchPayload(
  answers: DiagnosticAnswers,
  schoolLookup?: Map<string, Establishment>,
): MatchPayload {
  const cities = answers.cities ?? [];
  const anyCity = cities.includes('peuimporte') || cities.length === 0;
  const preferredCityNames = [
    ...cities
      .filter((id) => id !== 'peuimporte' && id !== 'autres')
      .map((id) => CITY_ID_TO_LABEL[id] || id),
    ...(answers.cityOther ?? []),
  ].filter(Boolean);

  const types = answers.multi.sch_types ?? [];
  // Compat anciennes valeurs de brouillon
  const prefPublic =
    types.includes('public') ||
    types.includes('publique') ||
    types.includes('cpge');
  const prefPrivate =
    types.includes('prive') ||
    types.includes('privee') ||
    types.includes('business');
  const prefSemiPublic =
    types.includes('semi_public') || types.includes('semi-public');
  const prefMilitary = types.includes('militaire');

  const specs = answers.profile.bacSpecialites ?? [];
  const bacType =
    answers.profile.bacType === 'mission'
      ? 'mission'
      : answers.profile.bacType === 'marocain'
        ? 'normal'
        : '';

  const vs = extractVersusSignals(answers, schoolLookup);

  // Versus renforce les préférences de type (sans annuler les cases cochées)
  let vsPublic = prefPublic;
  let vsPrivate = prefPrivate;
  let vsSemi = prefSemiPublic;
  let vsMilitary = prefMilitary;
  if (vs.preferredTypes.size) {
    const ranked = [...vs.preferredTypes.entries()].sort((a, b) => b[1] - a[1]);
    for (const [t] of ranked) {
      if (t === 'Public') vsPublic = true;
      if (t === 'Privé') vsPrivate = true;
      if (t === 'Semi-Public') vsSemi = true;
      if (t === 'Militaire') vsMilitary = true;
    }
  }

  return {
    attractedSectors: (answers.multi.car_secteurs ?? []).map(String),
    excludedSectors: [],
    studyCityScope: anyCity ? 'any' : 'specific',
    preferredCityNames,
    bacType,
    bacStream: answers.profile.bacFiliere || '',
    missionSpecialite1: specs[0] || '',
    missionSpecialite2: specs[1] || '',
    missionSpecialite3: specs[2] || '',
    prefPublic: vsPublic,
    prefPrivate: vsPrivate,
    prefSemiPublic: vsSemi,
    prefMilitary: vsMilitary,
    privateMonthlyBudgetBracket: mapBudgetBracket(answers.single.real_budget),
    considersContests: (() => {
      if (types.includes('militaire')) return 'yes';
      const radarIds = flattenSelectedEcoleIds(answers.multi);
      let concours = 0;
      let nonConcours = 0;
      for (const id of radarIds) {
        const meta = answers.schoolMeta?.[id];
        if (!meta) continue;
        const t = normalizeAdmissionType(meta.admissionType);
        const isC =
          t === 'concours' || (!t && Boolean(meta.concours)) || meta.admissionLabel === 'Concours';
        if (isC) concours += 1;
        else if (meta.admissionLabel || meta.admissionType) nonConcours += 1;
      }
      if (concours > nonConcours && concours > 0) return 'yes';
      if (nonConcours > concours && nonConcours > 0) return 'no';
      return '';
    })(),
    userReferenceNote: extractUserNote(answers.profile),
    diplomesSouhaites: mapDiplomes(answers.single.amb_niveau_etudes),
    radarSchoolIds: new Set(flattenSelectedEcoleIds(answers.multi)),
    versusWinCounts: vs.ecoleWins,
    versusLossCounts: vs.ecoleLosses,
    versusPreferredTypes: vs.preferredTypes,
    versusPreferredCities: vs.preferredCities,
  };
}

function scoreSecteurs(p: MatchPayload, e: Establishment): number {
  const estIds = new Set((e.secteursIds ?? []).map(String));
  if ([...estIds].some((id) => p.excludedSectors.includes(id))) return 18;
  if (estIds.size === 0) return 58;
  if (p.attractedSectors.length === 0) return 68;
  return [...estIds].some((id) => p.attractedSectors.includes(id)) ? 92 : 42;
}

function scoreVille(p: MatchPayload, e: Establishment): number {
  const places = establishmentCityLabels(e);
  // Boost Versus ville (même si « peu importe »)
  if (p.versusPreferredCities.size) {
    for (const pl of places) {
      for (const [vc, n] of p.versusPreferredCities) {
        if (pl === vc || pl.includes(vc) || vc.includes(pl)) {
          return Math.min(98, 88 + n * 4);
        }
      }
    }
  }
  if (p.studyCityScope === 'any' || p.studyCityScope === '') return 88;
  if (p.studyCityScope !== 'specific') return 72;
  const names = p.preferredCityNames.map(normLabel).filter(Boolean);
  if (!names.length) return 70;
  for (const pl of places) {
    for (const pn of names) {
      if (pl === pn || pl.includes(pn) || pn.includes(pl)) return 96;
    }
  }
  return 28;
}

function scoreType(p: MatchPayload, e: Establishment): number {
  const t = normalizeType(e.type);
  const vsTypeBoost = p.versusPreferredTypes.get(t) || 0;
  const hasAny = p.prefPublic || p.prefPrivate || p.prefSemiPublic || p.prefMilitary;
  if (!hasAny && !vsTypeBoost) return 72;
  const map: Record<string, boolean> = {
    Public: p.prefPublic,
    Privé: p.prefPrivate,
    'Semi-Public': p.prefSemiPublic,
    Militaire: p.prefMilitary,
  };
  if (!(t in map) && !vsTypeBoost) return 60;
  let base = map[t] ? 95 : hasAny ? 32 : 60;
  if (vsTypeBoost) base = Math.min(98, Math.max(base, 78) + vsTypeBoost * 5);
  return base;
}

function filiereBacBlocks(p: MatchPayload, e: Establishment): boolean {
  if (p.bacType !== 'normal') return false;
  let estBac = e.bacType || '';
  if (estBac === 'both') estBac = 'normal';
  if (estBac !== 'normal') return false;
  const fil = e.filieresAcceptees;
  if (!Array.isArray(fil) || fil.length === 0) return false;
  const stream = p.bacStream.trim();
  if (!stream) return true;
  return !fil.some((f) => String(f).trim() === stream);
}

function scoreBac(p: MatchPayload, e: Establishment): number {
  let estBac = e.bacType || '';
  if (estBac === 'both') {
    if (p.bacType === 'normal') estBac = 'normal';
    else if (p.bacType === 'mission') estBac = 'mission';
  }

  if (p.bacType === 'normal') {
    if (estBac === 'mission') return 38;
    const fil = e.filieresAcceptees;
    if (!Array.isArray(fil) || fil.length === 0) return 74;
    if (filiereBacBlocks(p, e)) return 0;
    return 96;
  }

  if (p.bacType === 'mission') {
    if (estBac === 'normal') return 38;
    const specs = [p.missionSpecialite1, p.missionSpecialite2, p.missionSpecialite3]
      .map((s) => s.trim())
      .filter(Boolean);
    const acc = e.specialitesBacMissionAcceptees;
    if (Array.isArray(acc) && acc.length > 0) {
      const set = acc.map(String);
      if (specs.some((s) => set.includes(s))) return 94;
    }
    const combos = e.combinaisonsBacMission;
    if (Array.isArray(combos) && combos.length > 0 && specs.length > 0) {
      for (const combo of combos) {
        if (!Array.isArray(combo) || !combo.length) continue;
        if (combo.every((n) => specs.includes(String(n)))) return 96;
      }
    }
    if ((!Array.isArray(acc) || !acc.length) && (!Array.isArray(combos) || !combos.length)) {
      return 70;
    }
    return 48;
  }

  return 70;
}

function scoreBudget(p: MatchPayload, e: Establishment): number {
  if (!isPaidPrivate(e)) return 90;
  const bracket = p.privateMonthlyBudgetBracket;
  if (!bracket || bracket === '0_public_only') return 42;
  const minF = parseMoney(e.fraisScolariteMin);
  const maxF = parseMoney(e.fraisScolariteMax);
  if (minF == null && maxF == null) return 68;
  const [bMin, bMax] = bracketToRangeDh(bracket);
  if (bMin == null) return 68;
  const estMin = minF ?? maxF ?? 0;
  const estMax = maxF ?? minF ?? estMin;
  if (estMax <= bMax && estMin >= bMin * 0.85) return 92;
  if (estMin <= bMax) return 78;
  return 44;
}

function establishmentHasConcours(e: Establishment): boolean {
  const type = normalizeAdmissionType(e.admissionType);
  if (type) return admissionImpliesConcours(type);
  return Boolean(e.concours);
}

function scoreConcours(p: MatchPayload, e: Establishment): number {
  const hasC = establishmentHasConcours(e);
  if (p.considersContests === 'yes') return hasC ? 95 : 58;
  if (p.considersContests === 'no') return hasC ? 48 : 92;
  return 72;
}

function scoreNotes(p: MatchPayload, e: Establishment): number {
  if (p.userReferenceNote == null) return 58;
  const thresholds = collectNumericThresholds(e.seuilsAdmission);
  if (!thresholds.length) return 62;
  const minTh = Math.min(...thresholds);
  if (p.userReferenceNote >= minTh) return 92;
  if (p.userReferenceNote >= minTh - 1.5) return 72;
  return 48;
}

function scoreDiplomes(p: MatchPayload, e: Establishment): number {
  if (!p.diplomesSouhaites.length) return 72;
  const offered = (e.diplomesDelivres ?? [])
    .map((x) => String(x).toLowerCase().trim())
    .filter(Boolean);
  if (!offered.length) return 52;
  const wanted = p.diplomesSouhaites.map((s) => s.toLowerCase());
  const inter = wanted.filter((w) =>
    offered.some((o) => o.includes(w) || w.includes(o)),
  );
  if (!inter.length) return 35;
  if (inter.length >= wanted.length) return 96;
  return 86;
}

function seuilBlocks(p: MatchPayload, e: Establishment): boolean {
  if (p.userReferenceNote == null) return false;
  const thresholds = collectNumericThresholds(e.seuilsAdmission);
  if (!thresholds.length) return false;
  const minTh = Math.min(...thresholds);
  return p.userReferenceNote < minTh - 2;
}

function buildReasons(
  partials: Record<string, number>,
  p: MatchPayload,
  e: Establishment,
  filiereBlocked: boolean,
  seuilBlocked: boolean,
): { yes: string[]; no: string[] } {
  const yes: string[] = [];
  const no: string[] = [];
  if (partials.secteurs >= 85) yes.push('Secteurs alignés avec tes choix');
  else if (partials.secteurs <= 45) no.push('Secteurs peu alignés');
  if (partials.ville >= 90) yes.push('Ville compatible avec tes préférences');
  else if (partials.ville <= 35) no.push('Ville éloignée de tes choix');
  if (partials.type >= 90) yes.push('Type d’établissement cohérent');
  else if (partials.type <= 40) no.push('Type d’établissement moins adapté');
  if (filiereBlocked) no.push('Filière bac non acceptée');
  else if (partials.bac >= 90) yes.push('Filière / bac compatible');
  else if (partials.bac <= 40) no.push('Compatibilité bac limitée');
  if (seuilBlocked) no.push('Seuil d’admission difficilement atteignable');
  else if (partials.notes >= 85) yes.push('Notes compatibles avec les seuils');
  if (partials.budget >= 85) yes.push('Budget cohérent');
  else if (partials.budget <= 45 && isPaidPrivate(e)) no.push('Frais potentiellement élevés pour ton budget');
  if (partials.diplomes >= 85) yes.push('Niveau de diplôme visé proposé');
  if (partials.concours >= 90) {
    yes.push(resolveAdmissionDisplayLabel(e));
  } else if (partials.concours <= 50 && p.considersContests === 'no' && establishmentHasConcours(e)) {
    no.push('Accès sur concours');
  }
  if (p.radarSchoolIds.has(String(e.id))) yes.push('Déjà dans ton radar');
  const vsWins = versusWinsFor(p, e);
  const vsLoss = versusLossesFor(p, e);
  if (vsWins > 0) yes.push(vsWins > 1 ? `Vainqueur Versus (×${vsWins})` : 'Vainqueur Versus');
  if (vsLoss > 0 && vsWins === 0) no.push('Écarté en Versus');
  return { yes: yes.slice(0, 4), no: no.slice(0, 3) };
}

function scoreEstablishment(
  p: MatchPayload,
  e: Establishment,
): Omit<OrientationSchoolReco, 'tier' | 'tierLabel'> {
  const filiereBlocked = filiereBacBlocks(p, e);
  const seuilBlocked = seuilBlocks(p, e);
  const partials = {
    secteurs: scoreSecteurs(p, e),
    ville: scoreVille(p, e),
    type: scoreType(p, e),
    bac: scoreBac(p, e),
    budget: scoreBudget(p, e),
    concours: scoreConcours(p, e),
    notes: scoreNotes(p, e),
    langues: 72,
    diplomes: scoreDiplomes(p, e),
  };

  let total = clamp100(
    (partials.secteurs * WEIGHT.secteurs +
      partials.ville * WEIGHT.ville +
      partials.type * WEIGHT.type +
      partials.bac * WEIGHT.bac +
      partials.budget * WEIGHT.budget +
      partials.concours * WEIGHT.concours +
      partials.notes * WEIGHT.notes +
      partials.langues * WEIGHT.langues +
      partials.diplomes * WEIGHT.diplomes) /
      100,
  );

  if (filiereBlocked || seuilBlocked) total = 0;

  // Boost / malus radar & Versus (hors IA) — wins cumulés = ranking tournoi
  if (!filiereBlocked && !seuilBlocked) {
    if (p.radarSchoolIds.has(String(e.id))) total = Math.min(100, total + 6);
    const wins = versusWinsFor(p, e);
    const losses = versusLossesFor(p, e);
    if (wins > 0) total = Math.min(100, total + Math.min(12, 4 + (wins - 1) * 3));
    if (losses > 0 && wins === 0) total = Math.max(0, total - Math.min(8, 3 + (losses - 1) * 2));
  }

  const { yes, no } = buildReasons(partials, p, e, filiereBlocked, seuilBlocked);
  const villes = establishmentDisplayCities(e);
  const ville =
    villes[0] ||
    e.ville ||
    e.location?.ville ||
    (Array.isArray(e.villes) && e.villes[0]) ||
    '—';
  const dureeEtudes = establishmentDureeEtudesLabel(e) || null;
  const diplomes = establishmentDiplomesList(e);

  return {
    establishmentId: e.id ?? 0,
    nom: e.nom,
    nomArabe: e.nomArabe || null,
    sigle: e.sigle || undefined,
    slug: e.slug,
    ville,
    villes,
    dureeEtudes,
    diplomes,
    typeEcole: e.type || undefined,
    orientationPlan: normalizeOrientationPlan(e.orientationPlan),
    orientationPlanLabel: normalizeOrientationPlan(e.orientationPlan)
      ? orientationPlanLabel(e.orientationPlan)
      : null,
    admissionType: e.admissionType ?? null,
    admissionLabel: resolveAdmissionDisplayLabel(e),
    facultePubliqueAccesOuvert: isFacultePubliqueAccesOuvert(e),
    logo:
      ((e as Establishment & { media?: { logo?: string | null } }).media?.logo ?? e.logo)?.trim() ||
      null,
    algorithmicScore: total,
    combinedScore: total,
    reasonsYes: yes,
    reasonsNo: no,
    bacFiliereCompatible: !filiereBlocked,
    seuilCompatible: !seuilBlocked,
  };
}

function withTier(row: Omit<OrientationSchoolReco, 'tier' | 'tierLabel'>): OrientationSchoolReco {
  const tier = getSchoolDiagnosticTier(row) as DiagnosticTierId;
  return {
    ...row,
    tier,
    tierLabel: DIAGNOSTIC_TIER_LABELS[tier],
  };
}

export const ORIENTATION_SCHOOL_TIER_ORDER: DiagnosticTierId[] = [
  'recommended',
  'possible',
  'lastResort',
  'avoid',
];

export const ORIENTATION_SCHOOL_TIER_HINTS: Record<DiagnosticTierId, string> = {
  recommended: '≥ 78 %',
  possible: '60 % – 77 %',
  lastResort: '45 % – 59 %',
  avoid: '< 45 % ou filière / seuil incompatible',
};

function tierRank(t: DiagnosticTierId): number {
  const i = ORIENTATION_SCHOOL_TIER_ORDER.indexOf(t);
  return i >= 0 ? i : 99;
}

export function groupSchoolRecosByTier(
  items: OrientationSchoolReco[],
): Record<DiagnosticTierId, OrientationSchoolReco[]> {
  const buckets: Record<DiagnosticTierId, OrientationSchoolReco[]> = {
    recommended: [],
    possible: [],
    lastResort: [],
    avoid: [],
  };
  for (const row of items) {
    buckets[row.tier]?.push(row);
  }
  for (const id of ORIENTATION_SCHOOL_TIER_ORDER) {
    buckets[id].sort((a, b) => b.combinedScore - a.combinedScore);
  }
  return buckets;
}

async function loadEstablishmentsForReco(): Promise<Establishment[]> {
  const active = (e: Establishment) => e.isActive !== false && e.id != null;

  // 1) Tentative catalogue paginé (complet)
  try {
    const all = await establishmentService.fetchAllPublicCatalog({ isActive: true }, 100);
    const filtered = all.filter(active);
    if (filtered.length) return filtered;
  } catch (err) {
    console.warn('[orientation] fetchAllPublicCatalog failed, fallback limit=500', err);
  }

  // 2) Fallback : une seule page large (comme le module écoles du test)
  try {
    const res = await establishmentService.getAll({
      isActive: true,
      limit: 500,
      page: 1,
    });
    return (res.data || []).filter(active);
  } catch (err) {
    console.warn('[orientation] getAll establishments fallback failed', err);
    return [];
  }
}

/**
 * Charge les écoles actives et les classe
 * avec les mêmes paliers que le diagnostic mobile (sans IA).
 */
export async function buildSchoolRecommendations(
  answers: DiagnosticAnswers,
): Promise<OrientationSchoolReco[]> {
  const list = await loadEstablishmentsForReco();
  if (!list.length) return [];

  const lookup = new Map(list.map((e) => [String(e.id), e]));
  const payload = answersToSchoolMatchPayload(answers, lookup);

  return list
    .map((e) => withTier(scoreEstablishment(payload, e)))
    .filter((r) => r.establishmentId > 0)
    .sort((a, b) => {
      const d = tierRank(a.tier) - tierRank(b.tier);
      if (d !== 0) return d;
      return b.combinedScore - a.combinedScore;
    });
}
