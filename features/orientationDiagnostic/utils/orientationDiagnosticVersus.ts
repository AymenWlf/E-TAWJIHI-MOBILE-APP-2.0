import {
  findModernMetierName,
  MODERN_SECTOR_METIERS,
  modernMetiersForSecteur,
} from '../data/orientationDiagnosticModernMetiers';
import {
  formatBilingualName,
  pickMetierDisplayName,
  pickSchoolDisplayName,
} from '../data/orientationDiagnosticI18n';
import establishmentService, {
  type Establishment,
} from '../services/establishmentService';
import metierService, { type Metier } from '../services/metierService';
import {
  flattenSelectedEcoleIds,
  flattenSelectedMetierIds,
  isMetierSectorStepId,
} from '../data/orientationDiagnosticQuestions';
import { resolveAdmissionDisplayLabel } from '../constants/establishmentAdmissionType';
import {
  normalizeOrientationPlan,
  orientationPlanSortRank,
} from '../constants/establishmentOrientationPlan';
import {
  FACULTES_PUBLIQUES_DIPLOMES,
  isFacultePubliqueAccesOuvert,
} from './orientationFacultePubliqueGroup';
import type { DiagnosticAnswers } from '../types/orientationDiagnosticPrototype';
import type { DiagnosticStep } from '../types/orientationDiagnosticPrototype';

/** Taille du tableau Coupe du monde (métiers ou écoles). */
export const VERSUS_FIELD_SIZE = 16;

/** Option unique Versus pour toutes les universités / facultés publiques (accès ouvert). */
export const VERSUS_FACULTES_PUBLIQUES_ID = 'facultes_publiques_group';

/** @deprecated — un tournoi = 15 matches ; deux tournois ≈ 30 */
export const VERSUS_MAX_DUELS = 30;

export type VersusRound = 'R16' | 'QF' | 'SF' | 'FINAL';

export type VersusSchoolOption = {
  id: string;
  label: string;
  nom?: string;
  nomArabe?: string | null;
  sigle?: string;
  ville?: string | null;
  dureeEtudes?: string | null;
  diplomes?: string[];
  logo?: string | null;
  orientationPlan?: 'A' | 'B' | 'C' | 'D' | null;
  admissionType?: string | null;
  admissionLabel?: string | null;
  /** Rang de seed 1–16 (1 = favori) */
  seed?: number;
  /** Secteur associé (libellé bilingue « FR · AR » quand les deux existent) */
  secteurLabel?: string | null;
};

function establishmentLogoPath(e: Establishment): string | null {
  const raw =
    (e as Establishment & { media?: { logo?: string | null } }).media?.logo ?? e.logo;
  const text = typeof raw === 'string' ? raw.trim() : '';
  return text || null;
}

export function facultesPubliquesVersusOption(logo?: string | null): VersusSchoolOption {
  return {
    id: VERSUS_FACULTES_PUBLIQUES_ID,
    label: 'Universités et facultés publiques',
    nom: 'Universités et facultés publiques',
    nomArabe: 'الجامعات والكليات العمومية',
    logo: logo || null,
    diplomes: [...FACULTES_PUBLIQUES_DIPLOMES],
    orientationPlan: null,
    admissionType: 'acces_ouvert',
    admissionLabel: 'Accès ouvert',
  };
}

function facultePubliqueSampleLogo(list: Establishment[]): string | null {
  for (const school of list) {
    if (!isFacultePubliqueAccesOuvert(school)) continue;
    const logo = establishmentLogoPath(school);
    if (logo) return logo;
  }
  return null;
}

export type VersusDuel = {
  id: string;
  versusType: 'metier' | 'ecole';
  title: string;
  subtitle: string;
  options: VersusSchoolOption[];
  source: 'choix' | 'filiere' | 'compatible' | 'contraste' | 'tournoi';
  round: VersusRound;
  /** Index du match dans le tour (0…) */
  matchIndex: number;
};

export type VersusMatchLog = {
  duelId: string;
  versusType: 'metier' | 'ecole';
  round: VersusRound;
  matchIndex: number;
  winnerId: string;
  loserId: string;
  winnerLabel: string;
  loserLabel: string;
  winnerSeed?: number;
  loserSeed?: number;
};

export type VersusRankedItem = {
  id: string;
  label: string;
  rank: number;
  seed: number;
  eliminatedRound: VersusRound | 'champion';
};

export type VersusField = {
  metiers: VersusSchoolOption[];
  ecoles: VersusSchoolOption[];
};

export type VersusBuildResult = {
  plan: VersusDuel[];
  field: VersusField;
  log: VersusMatchLog[];
  rankings: {
    metiers: VersusRankedItem[];
    ecoles: VersusRankedItem[];
  };
};

const ROUND_LABEL: Record<VersusRound, string> = {
  R16: '8es de finale',
  QF: 'Quarts de finale',
  SF: 'Demi-finales',
  FINAL: 'Finale',
};

const NEXT_ROUND: Record<VersusRound, VersusRound | null> = {
  R16: 'QF',
  QF: 'SF',
  SF: 'FINAL',
  FINAL: null,
};

const ROUND_MATCH_COUNT: Record<VersusRound, number> = {
  R16: 8,
  QF: 4,
  SF: 2,
  FINAL: 1,
};

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function parseSalary(value: string | number | null | undefined): number {
  if (value == null || value === '') return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const n = parseFloat(String(value).replace(/[^\d.,]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function metierSalary(m: Metier): number {
  return parseSalary(m.salaireMax) || parseSalary(m.salaireMin) || 0;
}

function schoolCity(e: Establishment): string {
  return (
    e.ville ||
    e.location?.ville ||
    (Array.isArray(e.villes) && e.villes[0]) ||
    '—'
  );
}

function schoolLabel(e: Establishment): string {
  const city = schoolCity(e);
  const name = pickSchoolDisplayName(e);
  return city && city !== '—' ? `${name} (${city})` : name;
}

function schoolCitiesLabel(e: Establishment): string | null {
  const names: string[] = [];
  const seen = new Set<string>();
  const push = (value?: string | null) => {
    const text = (value || '').trim();
    if (!text) return;
    const key = text.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    names.push(text);
  };
  if (Array.isArray(e.campus)) {
    for (const campus of e.campus) {
      if (!campus || typeof campus !== 'object') continue;
      const row = campus as {
        ville?: string | { titre?: string } | null;
        city?: { titre?: string } | string | null;
      };
      if (typeof row.ville === 'string') push(row.ville);
      else if (row.ville && typeof row.ville === 'object') push(row.ville.titre);
      else if (typeof row.city === 'string') push(row.city);
      else if (row.city && typeof row.city === 'object') push(row.city.titre);
    }
  }
  if (!names.length) {
    push(e.ville);
    push(e.location?.ville);
    if (Array.isArray(e.villes)) e.villes.forEach((ville) => push(typeof ville === 'string' ? ville : ''));
  }
  return names.length ? names.join(' · ') : null;
}

function schoolDureeLabel(e: Establishment): string | null {
  const raw = e.dureeEtudes;
  if (typeof raw === 'string' && raw.trim()) {
    const text = raw.trim();
    return /\bans?\b/i.test(text) ? text : `${text} ans`;
  }
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return `${raw} ans`;
  const min = e.dureeEtudesMin;
  const max = e.dureeEtudesMax;
  if (min != null && max != null && min > 0 && max > 0) {
    return min === max ? `${min} ans` : `${min}-${max} ans`;
  }
  if (max != null && max > 0) return `${max} ans`;
  if (min != null && min > 0) return `${min} ans`;
  const years = e.anneesEtudes;
  if (typeof years === 'number' && Number.isFinite(years) && years > 0) return `${years} ans`;
  if (typeof years === 'string' && years.trim()) {
    const text = years.trim();
    return /\bans?\b/i.test(text) ? text : `${text} ans`;
  }
  return null;
}

function schoolDiplomes(e: Establishment): string[] {
  const extra = e as Establishment & { diplomes?: string[] | null };
  const raw = [
    ...(Array.isArray(e.diplomesDelivres) ? e.diplomesDelivres : []),
    ...(Array.isArray(extra.diplomes) ? extra.diplomes : []),
  ]
    .map((item) => String(item || '').trim())
    .filter(Boolean);
  return [...new Set(raw)];
}

export function schoolVersusOption(e: Establishment): VersusSchoolOption {
  return {
    id: String(e.id),
    label: schoolLabel(e),
    nom: (e.nom || '').trim() || undefined,
    nomArabe: e.nomArabe?.trim() || null,
    sigle: e.sigle?.trim() || undefined,
    ville: schoolCitiesLabel(e),
    dureeEtudes: schoolDureeLabel(e),
    diplomes: schoolDiplomes(e),
    logo: e.logo || null,
    orientationPlan: normalizeOrientationPlan(e.orientationPlan),
    admissionType: e.admissionType ?? null,
    admissionLabel: resolveAdmissionDisplayLabel(e),
  };
}

function schoolTypeKey(e: Establishment): string {
  const t = (e.type || '').trim().toLowerCase();
  if (t === 'semi-public' || t === 'semi_public') return 'Semi-Public';
  if (t === 'public') return 'Public';
  if (t === 'privé' || t === 'prive') return 'Privé';
  if (t === 'militaire') return 'Militaire';
  return (e.type || '').trim() || '—';
}

/** École compatible avec la filière / spécialités du profil. */
export function schoolMatchesProfile(
  e: Establishment,
  answers: DiagnosticAnswers,
): boolean {
  const p = answers.profile;
  if (!p) return true;

  if (p.bacType === 'mission') {
    const specs = p.bacSpecialites || [];
    const accepted = e.specialitesBacMissionAcceptees || [];
    if (!specs.length) return true;
    if (!accepted.length) {
      if (e.bacType && !/mission|français|francais/i.test(e.bacType)) return false;
      return true;
    }
    return specs.some((s) =>
      accepted.some((a) => {
        const ns = norm(s);
        const na = norm(a);
        return ns.includes(na) || na.includes(ns);
      }),
    );
  }

  if (p.bacType === 'marocain' && p.bacFiliere) {
    const accepted = e.filieresAcceptees || [];
    if (!accepted.length) return true;
    const nf = norm(p.bacFiliere);
    return accepted.some((a) => {
      const na = norm(a);
      return na.includes(nf) || nf.includes(na) || shareToken(nf, na);
    });
  }

  return true;
}

function shareToken(a: string, b: string): boolean {
  const tokens = a.split(/[\s,/()-]+/).filter((t) => t.length >= 3);
  return tokens.some((t) => b.includes(t));
}

function uniqueById<T extends { id: string }>(list: T[]): T[] {
  const seen = new Set<string>();
  return list.filter((x) => {
    if (seen.has(x.id)) return false;
    seen.add(x.id);
    return true;
  });
}

function withSeeds(items: VersusSchoolOption[]): VersusSchoolOption[] {
  return items.slice(0, VERSUS_FIELD_SIZE).map((item, i) => ({
    ...item,
    seed: i + 1,
  }));
}

/** Appariements type tableau final : 1v16, 8v9, 4v13, 5v12, 2v15, 7v10, 3v14, 6v11 */
function worldCupR16Pairs(field: VersusSchoolOption[]): [VersusSchoolOption, VersusSchoolOption][] {
  const f = field.slice(0, 16);
  while (f.length < 16) {
    // ne devrait pas arriver — pad défensif
    f.push({
      id: `__pad_${f.length}`,
      label: `Piste ${f.length + 1}`,
      seed: f.length + 1,
    });
  }
  const idx: [number, number][] = [
    [0, 15],
    [7, 8],
    [3, 12],
    [4, 11],
    [1, 14],
    [6, 9],
    [2, 13],
    [5, 10],
  ];
  return idx.map(([a, b]) => [f[a], f[b]]);
}

function makeRoundDuels(
  versusType: 'metier' | 'ecole',
  round: VersusRound,
  pairs: [VersusSchoolOption, VersusSchoolOption][],
): VersusDuel[] {
  const kind = versusType === 'metier' ? 'métier' : 'école';
  const prefix = versusType === 'metier' ? 'vs_m' : 'vs_e';
  return pairs.map((pair, matchIndex) => ({
    id: `${prefix}_${round.toLowerCase()}_${matchIndex}`,
    versusType,
    round,
    matchIndex,
    source: 'tournoi' as const,
    title: `Versus ${kind} — ${ROUND_LABEL[round]}`,
    subtitle:
      round === 'FINAL'
        ? `Finale ${kind} — qui termine n°1 ?`
        : `Match ${matchIndex + 1}/${pairs.length} · seeds ${pair[0].seed ?? '?'} vs ${pair[1].seed ?? '?'}`,
    options: pair,
  }));
}

function metiersBySector(
  answers: DiagnosticAnswers,
): { sectorId: string; sectorLabel: string; metiers: { id: string; label: string }[] }[] {
  const labels = answers.labels || {};
  const groups: {
    sectorId: string;
    sectorLabel: string;
    metiers: { id: string; label: string }[];
  }[] = [];
  for (const [stepId, ids] of Object.entries(answers.multi || {})) {
    if (!isMetierSectorStepId(stepId)) continue;
    const sectorId = stepId.replace(/^car_metiers__/, '');
    const metiers = (ids || []).map((id) => ({
      id,
      label: labels[id] || id,
    }));
    if (!metiers.length) continue;
    groups.push({
      sectorId,
      sectorLabel: labels[sectorId] || `Secteur ${sectorId}`,
      metiers,
    });
  }
  return groups;
}

function metierSectorLabel(id: string, preferred?: string | null): string | undefined {
  const direct = (preferred || '').trim();
  if (direct && !/^Secteur \d+$/i.test(direct)) return direct;
  const found = findModernMetierName(id, '');
  if (found?.secteurTitre) return formatBilingualName(found.secteurTitre, found.secteurTitreAr);
  return direct || undefined;
}

function withMetierSector(opt: VersusSchoolOption, preferred?: string | null): VersusSchoolOption {
  const secteurLabel = metierSectorLabel(opt.id, preferred ?? opt.secteurLabel);
  return secteurLabel ? { ...opt, secteurLabel } : opt;
}

async function selectMetierField16(
  answers: DiagnosticAnswers,
): Promise<VersusSchoolOption[]> {
  const labels = answers.labels || {};
  const selectedIds = flattenSelectedMetierIds(answers.multi);
  const scored = new Map<string, { opt: VersusSchoolOption; score: number }>();
  const sectorByMetierId = new Map<string, string>();
  for (const group of metiersBySector(answers)) {
    for (const metier of group.metiers) {
      if (group.sectorLabel) sectorByMetierId.set(metier.id, group.sectorLabel);
    }
  }

  selectedIds.forEach((id, i) => {
    scored.set(id, {
      opt: withMetierSector(
        { id, label: labels[id] || id },
        sectorByMetierId.get(id),
      ),
      score: 1000 - i, // ordre de sélection
    });
  });

  const sectorIds = (answers.multi.car_secteurs || [])
    .map(Number)
    .filter((n) => Number.isFinite(n));

  for (const sid of sectorIds.slice(0, 6)) {
    const titre = labels[String(sid)] || '';
    try {
      const res = await metierService.getAll({ secteur: sid, limit: 50 });
      if (res.success && res.data) {
        for (const m of res.data) {
          if (m.id == null) continue;
          const id = String(m.id);
          const salary = metierSalary(m);
          const bonus = 200 + Math.min(120, salary / 200);
          const prev = scored.get(id);
          if (!prev || prev.score < bonus) {
            const mLabel = pickMetierDisplayName(m) || m.nom;
            scored.set(id, {
              opt: withMetierSector(
                { id, label: labels[id] || mLabel },
                titre || m.secteur?.titre || sectorByMetierId.get(id),
              ),
              score: selectedIds.includes(id) ? (prev?.score ?? 1000) : bonus,
            });
          }
        }
      }
    } catch {
      /* ignore */
    }
    for (const m of modernMetiersForSecteur(sid, titre, undefined, 9)) {
      const bonus = 150 + Math.min(80, (m.salaireMax || m.salaireMin) / 250);
      const prev = scored.get(m.id);
      if (!prev) {
        scored.set(m.id, {
          opt: withMetierSector(
            { id: m.id, label: formatBilingualName(m.nom, m.nomArabe) },
            titre,
          ),
          score: bonus,
        });
      }
    }
  }

  // Compléter avec d’autres familles modernes si < 16
  if (scored.size < VERSUS_FIELD_SIZE) {
    for (const sid of [1, 2, 3, 4, 5, 6, 7, 8]) {
      if (scored.size >= VERSUS_FIELD_SIZE) break;
      for (const m of modernMetiersForSecteur(sid, `Secteur ${sid}`, undefined, 9)) {
        if (scored.size >= VERSUS_FIELD_SIZE) break;
        if (!scored.has(m.id)) {
          scored.set(m.id, {
            opt: withMetierSector(
              { id: m.id, label: formatBilingualName(m.nom, m.nomArabe) },
            ),
            score: 40 + (m.salaireMax || 0) / 500,
          });
        }
      }
    }
  }

  // Moins de 16 : d’abord d’autres métiers des secteurs choisis, puis les familles les plus proches.
  if (scored.size < VERSUS_FIELD_SIZE) {
    try {
      const res = await metierService.getAll({ limit: 80, afficherDansTest: true });
      if (res.success && res.data) {
        const preferred = new Set(sectorIds);
        const extras = [...res.data].sort((a, b) => {
          const aHit = a.secteur?.id != null && preferred.has(a.secteur.id) ? 1 : 0;
          const bHit = b.secteur?.id != null && preferred.has(b.secteur.id) ? 1 : 0;
          if (aHit !== bHit) return bHit - aHit;
          return metierSalary(b) - metierSalary(a);
        });
        for (const m of extras) {
          if (scored.size >= VERSUS_FIELD_SIZE) break;
          if (m.id == null) continue;
          const id = String(m.id);
          const label = labels[id] || pickMetierDisplayName(m) || m.nom;
          if (scored.has(id) || scoredHasMetierName(scored, label)) continue;
          const sameSector = m.secteur?.id != null && preferred.has(m.secteur.id);
          if (!sameSector && preferred.size > 0) continue;
          const sectorName =
            (m.secteur?.id != null ? labels[String(m.secteur.id)] : '') || m.secteur?.titre || '';
          scored.set(id, {
            opt: withMetierSector({ id, label }, sectorName),
            score: 180 + Math.min(40, metierSalary(m) / 400),
          });
        }
      }
    } catch {
      /* ignore */
    }
  }

  if (scored.size < VERSUS_FIELD_SIZE) {
    const sectorTitles = sectorIds
      .map((sid) => labels[String(sid)] || '')
      .filter(Boolean);
    const hay = sectorTitles.map((t) => norm(t)).join(' ');
    const families = MODERN_SECTOR_METIERS.map((fam) => {
      const hits =
        fam.key === 'default'
          ? 0
          : fam.match.filter((token) => hay.includes(norm(token))).length;
      return { fam, hits };
    }).sort(
      (a, b) =>
        b.hits - a.hits ||
        (a.fam.key === 'default' ? 1 : 0) - (b.fam.key === 'default' ? 1 : 0),
    );

    for (const { fam, hits } of families) {
      if (scored.size >= VERSUS_FIELD_SIZE) break;
      const compat = hits > 0 ? 120 : fam.key === 'default' ? 70 : 45;
      for (const m of fam.metiers) {
        if (scored.size >= VERSUS_FIELD_SIZE) break;
        const already =
          scored.has(m.id) ||
          [...scored.keys()].some((k) => k === m.id || k.startsWith(`${m.id}_`));
        const label = formatBilingualName(m.nom, m.nomArabe);
        if (already || scoredHasMetierName(scored, label)) continue;
        scored.set(`${m.id}_compat`, {
          opt: withMetierSector(
            { id: `${m.id}_compat`, label },
            formatBilingualName(fam.titre, fam.titreAr),
          ),
          score: compat + Math.min(20, (m.salaireMax || 0) / 800),
        });
      }
    }
  }

  const ranked = [...scored.values()]
    .sort((a, b) => b.score - a.score)
    .map((x) => x.opt);

  return withSeeds(uniqueById(ranked).slice(0, VERSUS_FIELD_SIZE));
}

const CITY_ID_TO_LABEL: Record<string, string> = {
  casa: 'Casablanca',
  rabat: 'Rabat',
  marrakech: 'Marrakech',
  tanger: 'Tanger',
  fes: 'Fès',
};

async function selectEcoleField16(
  answers: DiagnosticAnswers,
): Promise<VersusSchoolOption[]> {
  const labels = answers.labels || {};
  const selectedIds = flattenSelectedEcoleIds(answers.multi);
  const preferredTypes = new Set(answers.multi.sch_types ?? []);
  const preferredCities = new Set(
    [
      ...(answers.cities ?? [])
        .filter((id) => id !== 'peuimporte' && id !== 'autres')
        .map((id) => norm(CITY_ID_TO_LABEL[id] || id)),
      ...(answers.cityOther ?? []).map((c) => norm(c)),
    ].filter(Boolean),
  );
  const anyCity =
    (answers.cities ?? []).includes('peuimporte') || preferredCities.size === 0;

  let list: Establishment[] = [];
  try {
    const res = await establishmentService.getAll({ limit: 500, isActive: true });
    list = (res.data || []).filter((e) => e.isActive !== false);
  } catch {
    list = [];
  }

  const scored = new Map<string, { opt: VersusSchoolOption; score: number }>();
  const faculteIds = new Set(
    list.filter((e) => isFacultePubliqueAccesOuvert(e)).map((e) => String(e.id)),
  );

  const bumpScore = (id: string, opt: VersusSchoolOption, score: number) => {
    const prev = scored.get(id);
    if (!prev || prev.score < score) {
      scored.set(id, { opt, score });
    }
  };

  selectedIds.forEach((id, i) => {
    const score = 1000 - i;
    if (faculteIds.has(id)) {
      bumpScore(VERSUS_FACULTES_PUBLIQUES_ID, facultesPubliquesVersusOption(), score);
      return;
    }
    const meta = answers.schoolMeta?.[id];
    const fromList = list.find((e) => String(e.id) === id);
    const opt = fromList
      ? schoolVersusOption(fromList)
      : {
          id,
          label: labels[id] || id,
          orientationPlan: meta?.orientationPlan ?? null,
          admissionType: meta?.admissionType ?? null,
          admissionLabel: meta?.admissionLabel ?? null,
        };
    bumpScore(id, opt, score);
  });

  for (const e of list) {
    if (e.id == null) continue;
    const id = String(e.id);
    let score = 50;
    if (selectedIds.includes(id)) score += 900;
    if (schoolMatchesProfile(e, answers)) score += 80;
    const typeKey = schoolTypeKey(e);
    const typeId =
      typeKey === 'Public'
        ? 'public'
        : typeKey === 'Semi-Public'
          ? 'semi_public'
          : typeKey === 'Privé'
            ? 'prive'
            : typeKey === 'Militaire'
              ? 'militaire'
              : '';
    if (typeId && preferredTypes.has(typeId)) score += 70;
    const city = norm(schoolCity(e));
    if (!anyCity && city && preferredCities.has(city)) score += 60;
    const planRank = orientationPlanSortRank(e.orientationPlan);
    score += Math.max(0, 40 - planRank * 8);
    if (e.accreditationEtat) score += 15;

    // Une seule entrée Versus pour toutes les facultés / universités publiques.
    if (isFacultePubliqueAccesOuvert(e)) {
      bumpScore(VERSUS_FACULTES_PUBLIQUES_ID, facultesPubliquesVersusOption(), score);
      continue;
    }

    bumpScore(id, schoolVersusOption(e), score);
  }

  const faculteGroup = scored.get(VERSUS_FACULTES_PUBLIQUES_ID);
  if (faculteGroup) {
    faculteGroup.opt = facultesPubliquesVersusOption(facultePubliqueSampleLogo(list));
  }

  const ranked = [...scored.values()]
    .sort((a, b) => b.score - a.score)
    .map((x) => x.opt)
    .filter((o) => !faculteIds.has(o.id));

  let field = uniqueById(ranked).slice(0, VERSUS_FIELD_SIZE);

  // Si catalogue trop petit : garder ce qu’on a (groupe facultés dédupliqué)
  if (field.length < 2 && selectedIds.length >= 2) {
    const collapsed: VersusSchoolOption[] = [];
    let hasFaculteGroup = false;
    for (const id of selectedIds.slice(0, 16)) {
      if (faculteIds.has(id)) {
        if (!hasFaculteGroup) {
          collapsed.push(facultesPubliquesVersusOption(facultePubliqueSampleLogo(list)));
          hasFaculteGroup = true;
        }
        continue;
      }
      collapsed.push({
        id,
        label: labels[id] || id,
        ...(answers.schoolMeta?.[id] || {}),
      });
    }
    field = collapsed;
  }

  // Pad jusqu’à 16 avec les meilleures restantes déjà scorées (re-slice after unique)
  if (field.length < VERSUS_FIELD_SIZE) {
    for (const item of ranked) {
      if (field.length >= VERSUS_FIELD_SIZE) break;
      if (!field.some((f) => f.id === item.id)) field.push(item);
    }
  }

  return withSeeds(field.slice(0, VERSUS_FIELD_SIZE));
}

function computeRankingFromLog(
  field: VersusSchoolOption[],
  log: VersusMatchLog[],
  versusType: 'metier' | 'ecole',
): VersusRankedItem[] {
  const typeLog = log.filter((l) => l.versusType === versusType);
  const eliminated = new Map<string, VersusRound>();
  let champion: string | null = null;

  for (const entry of typeLog) {
    eliminated.set(entry.loserId, entry.round);
    if (entry.round === 'FINAL') champion = entry.winnerId;
  }

  const seedOf = (id: string) =>
    field.find((f) => f.id === id)?.seed ??
    typeLog.find((l) => l.winnerId === id)?.winnerSeed ??
    typeLog.find((l) => l.loserId === id)?.loserSeed ??
    99;

  const labelOf = (id: string) =>
    field.find((f) => f.id === id)?.label ||
    typeLog.find((l) => l.winnerId === id)?.winnerLabel ||
    typeLog.find((l) => l.loserId === id)?.loserLabel ||
    id;

  const exitWeight: Record<VersusRound | 'champion', number> = {
    champion: 0,
    FINAL: 1,
    SF: 2,
    QF: 3,
    R16: 4,
  };

  const ids = uniqueById(field).map((f) => f.id);
  const ranked = ids
    .map((id) => {
      const eliminatedRound: VersusRound | 'champion' =
        champion === id ? 'champion' : eliminated.get(id) || 'R16';
      return {
        id,
        label: labelOf(id),
        seed: seedOf(id),
        eliminatedRound,
        rank: 0,
      };
    })
    .sort((a, b) => {
      const wa = exitWeight[a.eliminatedRound];
      const wb = exitWeight[b.eliminatedRound];
      if (wa !== wb) return wa - wb;
      return a.seed - b.seed; // meilleur seed = mieux classé à sortie égale
    });

  return ranked.map((item, i) => ({
    id: item.id,
    label: item.label,
    seed: item.seed,
    eliminatedRound: item.eliminatedRound,
    rank: i + 1,
  }));
}

function roundComplete(
  plan: VersusDuel[],
  log: VersusMatchLog[],
  versusType: 'metier' | 'ecole',
  round: VersusRound,
): boolean {
  const needed = ROUND_MATCH_COUNT[round];
  const done = log.filter((l) => l.versusType === versusType && l.round === round).length;
  const expected = plan.filter((d) => d.versusType === versusType && d.round === round).length;
  return done >= needed && done >= expected && expected > 0;
}

function buildNextRoundFromWinners(
  versusType: 'metier' | 'ecole',
  nextRound: VersusRound,
  prevRound: VersusRound,
  plan: VersusDuel[],
  log: VersusMatchLog[],
): VersusDuel[] {
  const winnersInOrder: VersusSchoolOption[] = [];
  const prevMatches = plan
    .filter((d) => d.versusType === versusType && d.round === prevRound)
    .sort((a, b) => a.matchIndex - b.matchIndex);

  for (const match of prevMatches) {
    const entry = log.find((l) => l.duelId === match.id);
    if (!entry) continue;
    const opt = match.options.find((o) => o.id === entry.winnerId) || {
      id: entry.winnerId,
      label: entry.winnerLabel,
      seed: entry.winnerSeed,
    };
    winnersInOrder.push(opt);
  }

  if (winnersInOrder.length < ROUND_MATCH_COUNT[nextRound] * 2) return [];

  const pairs: [VersusSchoolOption, VersusSchoolOption][] = [];
  for (let i = 0; i + 1 < winnersInOrder.length; i += 2) {
    pairs.push([winnersInOrder[i], winnersInOrder[i + 1]]);
  }
  return makeRoundDuels(versusType, nextRound, pairs);
}

/**
 * Construit le tableau Coupe du monde : 16 métiers + 16 écoles,
 * seeds selon les interactions précédentes, 8es → finale.
 */
export async function buildVersusPlan(
  answers: DiagnosticAnswers,
): Promise<VersusBuildResult> {
  const [metiers, ecoles] = await Promise.all([
    selectMetierField16(answers),
    selectEcoleField16(answers),
  ]);

  const metierPairs = worldCupR16Pairs(metiers);
  const plan = makeRoundDuels('metier', 'R16', metierPairs);

  return {
    plan,
    field: { metiers, ecoles },
    log: [],
    rankings: { metiers: [], ecoles: [] },
  };
}

export function versusPlanToSteps(plan: VersusDuel[]): DiagnosticStep[] {
  return plan.map((d) => ({
    id: d.id,
    module: 'versus',
    kind: 'versus',
    versusType: d.versusType,
    versusRound: d.round,
    title: d.title,
    subtitle: d.subtitle,
    options: d.options.map((o) => ({
      id: o.id,
      label: o.label,
      nom: o.nom,
      nomArabe: o.nomArabe,
      sigle: o.sigle,
      ville: o.ville,
      dureeEtudes: o.dureeEtudes,
      diplomes: o.diplomes,
      logo: o.logo,
      orientationPlan: o.orientationPlan,
      admissionType: o.admissionType,
      admissionLabel: o.admissionLabel,
      seed: o.seed,
      secteurLabel: o.secteurLabel,
    })),
  }));
}

function versusSchoolNeedsVisual(option: VersusSchoolOption): boolean {
  if (option.id === VERSUS_FACULTES_PUBLIQUES_ID) {
    return !option.logo || !(option.diplomes?.length);
  }
  return /^\d+$/.test(option.id) && !option.nom;
}

let versusSchoolVisualCache: Map<string, VersusSchoolOption> | null = null;

/** Complète logo, diplômes et noms bilingues d’un tableau déjà enregistré. */
export async function hydrateVersusSchoolVisuals(
  answers: DiagnosticAnswers,
): Promise<DiagnosticAnswers | null> {
  const stored = [
    ...(answers.versusField?.ecoles ?? []),
    ...(answers.versusPlan ?? []).flatMap((duel) =>
      duel.versusType === 'ecole' ? duel.options : [],
    ),
  ];
  if (!stored.some(versusSchoolNeedsVisual)) return null;

  if (!versusSchoolVisualCache) {
    const fresh = await selectEcoleField16(answers);
    versusSchoolVisualCache = new Map(fresh.map((option) => [option.id, option]));
  }
  const byId = versusSchoolVisualCache;
  let changed = false;
  const merge = (option: VersusSchoolOption): VersusSchoolOption => {
    const next = byId.get(option.id);
    if (!next?.nom && !next?.logo) return option;
    if (option.id === VERSUS_FACULTES_PUBLIQUES_ID) {
      if (option.logo && option.diplomes?.length) return option;
      changed = true;
      return {
        ...option,
        ...next,
        id: option.id,
        seed: option.seed ?? next.seed,
      };
    }
    if (option.nom) return option;
    changed = true;
    return {
      ...option,
      ...next,
      id: option.id,
      seed: option.seed ?? next.seed,
    };
  };

  const hydrated: DiagnosticAnswers = {
    ...answers,
    versusField: answers.versusField
      ? { ...answers.versusField, ecoles: answers.versusField.ecoles.map(merge) }
      : answers.versusField,
    versusPlan: (answers.versusPlan ?? []).map((duel) =>
      duel.versusType === 'ecole'
        ? { ...duel, options: duel.options.map(merge) }
        : duel,
    ),
  };
  return changed ? hydrated : null;
}

/**
 * Enregistre un vainqueur, avance le tableau (QF/SF/Finale),
 * lance le tournoi écoles après la finale métiers, calcule les classements.
 */
export function applyVersusWinner(
  answers: DiagnosticAnswers,
  duelId: string,
  winner: VersusSchoolOption,
): DiagnosticAnswers {
  const plan = [...(answers.versusPlan ?? [])];
  const duel = plan.find((d) => d.id === duelId);
  if (!duel) {
    return {
      ...answers,
      single: { ...answers.single, [duelId]: winner.id },
      labels: { ...answers.labels, [winner.id]: winner.label },
    };
  }

  const loser = duel.options.find((o) => o.id !== winner.id);
  if (!loser) {
    return {
      ...answers,
      single: { ...answers.single, [duelId]: winner.id },
    };
  }

  const winOpt = duel.options.find((o) => o.id === winner.id) || winner;
  const log: VersusMatchLog[] = [
    ...(answers.versusLog ?? []).filter((l) => l.duelId !== duelId),
    {
      duelId,
      versusType: duel.versusType,
      round: duel.round,
      matchIndex: duel.matchIndex,
      winnerId: winOpt.id,
      loserId: loser.id,
      winnerLabel: winOpt.label,
      loserLabel: loser.label,
      winnerSeed: winOpt.seed,
      loserSeed: loser.seed,
    },
  ];

  let nextPlan = plan;
  const nextRound = NEXT_ROUND[duel.round];
  if (nextRound && roundComplete(plan, log, duel.versusType, duel.round)) {
    const already = plan.some(
      (d) => d.versusType === duel.versusType && d.round === nextRound,
    );
    if (!already) {
      const created = buildNextRoundFromWinners(
        duel.versusType,
        nextRound,
        duel.round,
        plan,
        log,
      );
      nextPlan = [...plan, ...created];
    }
  }

  const field = answers.versusField || { metiers: [], ecoles: [] };
  let rankings = {
    metiers: [...(answers.versusRankings?.metiers ?? [])],
    ecoles: [...(answers.versusRankings?.ecoles ?? [])],
  };

  // Finale métiers terminée → classement métiers + ouvrir 8es écoles
  if (
    duel.versusType === 'metier' &&
    duel.round === 'FINAL' &&
    roundComplete(nextPlan, log, 'metier', 'FINAL')
  ) {
    rankings = {
      ...rankings,
      metiers: computeRankingFromLog(field.metiers, log, 'metier'),
    };
    const hasEcole = nextPlan.some((d) => d.versusType === 'ecole');
    if (!hasEcole && field.ecoles.length >= 2) {
      nextPlan = [
        ...nextPlan,
        ...makeRoundDuels('ecole', 'R16', worldCupR16Pairs(field.ecoles)),
      ];
    }
  }

  // Finale écoles terminée → classement écoles
  if (
    duel.versusType === 'ecole' &&
    duel.round === 'FINAL' &&
    roundComplete(nextPlan, log, 'ecole', 'FINAL')
  ) {
    rankings = {
      ...rankings,
      ecoles: computeRankingFromLog(field.ecoles, log, 'ecole'),
    };
  }

  return {
    ...answers,
    versusPlan: nextPlan,
    versusLog: log,
    versusField: field,
    versusRankings: rankings,
    single: { ...answers.single, [duelId]: winOpt.id },
    labels: {
      ...answers.labels,
      [winOpt.id]: winOpt.label,
      [loser.id]: loser.label,
    },
  };
}

/** @deprecated — utiliser applyVersusWinner */
export function applyVersusMetierWinner(
  answers: DiagnosticAnswers,
  duelId: string,
  winner: VersusSchoolOption,
): DiagnosticAnswers {
  return applyVersusWinner(answers, duelId, winner);
}

/** Pré-remplit tout le tournoi (profils démo) — toujours l’option A / seed favori. */
export function autoFillVersusWinners(
  answers: DiagnosticAnswers,
  build: VersusBuildResult | VersusDuel[],
): DiagnosticAnswers {
  const result: VersusBuildResult = Array.isArray(build)
    ? {
        plan: build,
        field: answers.versusField || { metiers: [], ecoles: [] },
        log: [],
        rankings: { metiers: [], ecoles: [] },
      }
    : build;

  let next: DiagnosticAnswers = {
    ...answers,
    versusPlan: [...result.plan],
    versusField: result.field,
    versusLog: [],
    versusRankings: { metiers: [], ecoles: [] },
    single: { ...answers.single },
    labels: { ...answers.labels },
  };

  // Boucle de sécurité : avance match après match
  for (let guard = 0; guard < 64; guard++) {
    const open = (next.versusPlan ?? []).find((d) => !next.single[d.id]);
    if (!open || open.options.length < 2) break;
    // Favori = meilleur seed (plus petit numéro)
    const sorted = [...open.options].sort(
      (a, b) => (a.seed ?? 99) - (b.seed ?? 99),
    );
    const win = sorted[0];
    next = applyVersusWinner(next, open.id, win);
  }
  return next;
}

export type VersusSignal = {
  metierWins: Map<string, number>;
  metierLosses: Map<string, number>;
  ecoleWins: Map<string, number>;
  ecoleLosses: Map<string, number>;
  preferredTypes: Map<string, number>;
  preferredCities: Map<string, number>;
  sectorWins: Map<string, number>;
};

function bump(map: Map<string, number>, key: string, n = 1) {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + n);
}

export function extractVersusSignals(
  answers: DiagnosticAnswers,
  schoolLookup?: Map<string, Establishment>,
): VersusSignal {
  const signal: VersusSignal = {
    metierWins: new Map(),
    metierLosses: new Map(),
    ecoleWins: new Map(),
    ecoleLosses: new Map(),
    preferredTypes: new Map(),
    preferredCities: new Map(),
    sectorWins: new Map(),
  };

  const metierToSector = new Map<string, string>();
  for (const group of metiersBySector(answers)) {
    for (const m of group.metiers) metierToSector.set(m.id, group.sectorId);
  }

  const log = answers.versusLog ?? [];
  if (log.length) {
    for (const entry of log) {
      if (entry.versusType === 'metier') {
        // Pondération par tour : finale > demi > …
        const weight =
          entry.round === 'FINAL' ? 5 : entry.round === 'SF' ? 3 : entry.round === 'QF' ? 2 : 1;
        bump(signal.metierWins, entry.winnerId, weight);
        bump(signal.metierLosses, entry.loserId, 1);
        const sec = metierToSector.get(entry.winnerId);
        if (sec) bump(signal.sectorWins, sec, weight);
      } else {
        const weight =
          entry.round === 'FINAL' ? 5 : entry.round === 'SF' ? 3 : entry.round === 'QF' ? 2 : 1;
        bump(signal.ecoleWins, entry.winnerId, weight);
        bump(signal.ecoleLosses, entry.loserId, 1);
        if (entry.winnerId === VERSUS_FACULTES_PUBLIQUES_ID) {
          bump(signal.preferredTypes, 'Public', weight);
        } else {
          const est = schoolLookup?.get(String(entry.winnerId));
          if (est) {
            bump(signal.preferredTypes, schoolTypeKey(est), weight);
            const city = schoolCity(est);
            if (city && city !== '—') bump(signal.preferredCities, norm(city), weight);
          }
        }
      }
    }
  } else {
    // Fallback legacy
    for (const duel of answers.versusPlan ?? []) {
      const winner = answers.single[duel.id];
      if (!winner) continue;
      const loser = duel.options.find((o) => o.id !== winner)?.id;
      if (duel.versusType === 'metier') {
        bump(signal.metierWins, winner);
        if (loser) bump(signal.metierLosses, loser);
        const sec = metierToSector.get(winner);
        if (sec) bump(signal.sectorWins, sec);
      } else {
        bump(signal.ecoleWins, winner);
        if (loser) bump(signal.ecoleLosses, loser);
        if (winner === VERSUS_FACULTES_PUBLIQUES_ID) {
          bump(signal.preferredTypes, 'Public');
        } else {
          const est = schoolLookup?.get(String(winner));
          if (est) {
            bump(signal.preferredTypes, schoolTypeKey(est));
            const city = schoolCity(est);
            if (city && city !== '—') bump(signal.preferredCities, norm(city));
          }
        }
      }
    }
  }

  // Boost fort selon classement final Coupe du monde
  for (const item of answers.versusRankings?.metiers ?? []) {
    const pts = Math.max(0, 17 - item.rank);
    bump(signal.metierWins, item.id, pts);
  }
  for (const item of answers.versusRankings?.ecoles ?? []) {
    const pts = Math.max(0, 17 - item.rank);
    bump(signal.ecoleWins, item.id, pts);
  }

  return signal;
}
