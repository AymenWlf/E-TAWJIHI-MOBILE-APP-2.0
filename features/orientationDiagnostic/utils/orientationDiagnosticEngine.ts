import {
  ecoleLabel,
  metierLabel,
  salaryLabel,
  sectorLabel,
  CATALOG_METIERS,
  CATALOG_SECTORS,
} from '../data/orientationDiagnosticCatalog';
import {
  AMBITION_LABELS,
  flattenSelectedEcoleIds,
  flattenSelectedMetierIds,
  isMetierSectorStepId,
  isSchoolTypeStepId,
  METIERS_PER_SECTOR_MAX,
  ORIENTATION_DIAGNOSTIC_STEPS,
  RIASEC_LABELS,
  SCHOOLS_PER_TYPE_MAX,
  SCHOOLS_TOTAL_MAX,
} from '../data/orientationDiagnosticQuestions';
import { extractVersusSignals } from './orientationDiagnosticVersus';
import type { DiagnosticStep } from '../types/orientationDiagnosticPrototype';
import { getPersonaById } from '../data/orientationDiagnosticPersonas';
import {
  EMPTY_DIAGNOSTIC_PROFILE,
  formatProfileBacFiliereLabel,
  mapFiliereToCtx,
  mapStudyLevelToCtx,
  validateProfileGrades,
  validateProfileIdentity,
  validateProfileSchool,
  type DiagnosticProfile,
} from '../data/orientationDiagnosticProfile';
import type {
  AmbitionScores,
  DiagnosticAnswers,
  FamilyReco,
  FunctioningScores,
  Likert5,
  MetierReco,
  OrientationReport,
  RiasecLetter,
  RiasecScores,
} from '../types/orientationDiagnosticPrototype';

const LETTERS: RiasecLetter[] = ['R', 'I', 'A', 'S', 'E', 'C'];

function emptyRiasec(): RiasecScores {
  return { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function likertTo100(v: Likert5): number {
  return ((v - 1) / 4) * 100;
}

function topCode(scores: RiasecScores, n = 3): string {
  return [...LETTERS]
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, n)
    .join('');
}

function topLetters(scores: RiasecScores): [RiasecLetter, RiasecLetter, RiasecLetter] {
  const sorted = [...LETTERS].sort((a, b) => scores[b] - scores[a]);
  return [sorted[0], sorted[1], sorted[2]];
}

function optionValue(stepId: string, choiceId: string): number | undefined {
  const step = ORIENTATION_DIAGNOSTIC_STEPS.find((s) => s.id === stepId);
  return step?.options?.find((o) => o.id === choiceId)?.value;
}

function scoreDeclared(answers: DiagnosticAnswers): RiasecScores {
  const sums = emptyRiasec();
  const counts = emptyRiasec();
  for (const step of ORIENTATION_DIAGNOSTIC_STEPS) {
    if (step.kind !== 'likert' || !step.riasecDim) continue;
    const v = answers.likert[step.id];
    if (!v) continue;
    sums[step.riasecDim] += likertTo100(v);
    counts[step.riasecDim] += 1;
  }
  const out = emptyRiasec();
  for (const L of LETTERS) {
    out[L] = counts[L] ? clamp(sums[L] / counts[L]) : 50;
  }
  return out;
}

function scoreBehavioral(answers: DiagnosticAnswers): RiasecScores {
  const pts = emptyRiasec();
  for (const step of ORIENTATION_DIAGNOSTIC_STEPS) {
    if (step.kind !== 'situation') continue;
    const ans = answers.situations[step.id];
    if (!ans?.most || !ans?.least) continue;
    const most = ans.most as RiasecLetter;
    const least = ans.least as RiasecLetter;
    if (LETTERS.includes(most)) pts[most] += 18;
    if (LETTERS.includes(least)) pts[least] -= 10;
  }
  // baseline 50 + points, normalize roughly to 0–100
  const out = emptyRiasec();
  for (const L of LETTERS) {
    out[L] = clamp(50 + pts[L] * 1.4);
  }
  return out;
}

function mergeRiasec(declared: RiasecScores, behavioral: RiasecScores): RiasecScores {
  const out = emptyRiasec();
  for (const L of LETTERS) {
    out[L] = clamp(declared[L] * 0.55 + behavioral[L] * 0.45);
  }
  return out;
}

function scoreFunctioning(answers: DiagnosticAnswers): FunctioningScores {
  const structureChoice = answers.single.fn_structure;
  const autonomie =
    structureChoice === 'b' ? 82 : structureChoice === 'a' ? 28 : 50;

  const collab = optionValue('fn_collectif', answers.single.fn_collectif) ?? 55;
  const pratique = optionValue('fn_theorie', answers.single.fn_theorie) ?? 55;
  const variete = answers.sliders.fn_nouveaute ?? 50;
  const action = optionValue('fn_reflexion', answers.single.fn_reflexion) ?? 50;
  const incertitude = answers.likert.fn_incertitude
    ? likertTo100(answers.likert.fn_incertitude)
    : 50;
  const leadership = optionValue('fn_leadership', answers.single.fn_leadership) ?? 50;
  const contactHumain = answers.likert.fn_contact
    ? likertTo100(answers.likert.fn_contact)
    : 50;

  const analyse = clamp(100 - action * 0.55 + (answers.likert.i2 ? likertTo100(answers.likert.i2) * 0.35 : 25));
  const structure = clamp(100 - autonomie);
  const creativite = clamp(
    ((answers.likert.a1 ? likertTo100(answers.likert.a1) : 50) +
      (answers.likert.a2 ? likertTo100(answers.likert.a2) : 50)) /
      2,
  );

  return {
    autonomie: clamp(autonomie),
    collaboration: clamp(collab),
    pratique: clamp(pratique),
    variete: clamp(variete),
    leadership: clamp(leadership),
    contactHumain: clamp(contactHumain),
    analyse: clamp(analyse),
    structure: clamp(structure),
    creativite: clamp(creativite),
    action: clamp(action),
    incertitude: clamp(incertitude),
  };
}

function scoreAmbitions(answers: DiagnosticAnswers): AmbitionScores {
  const base: AmbitionScores = {
    remuneration: 35,
    stabilite: 35,
    entrepreneuriat: 35,
    apprentissage: 35,
    impact: 35,
    international: 35,
    progression: 35,
    equilibre: 35,
  };

  const top3 = answers.multi.amb_top3 ?? [];
  top3.forEach((k, i) => {
    if (k in base) {
      const key = k as keyof AmbitionScores;
      base[key] = i === 0 ? 78 : i === 1 ? 70 : 64;
    }
  });

  const prio = answers.single.amb_priorite as keyof AmbitionScores | undefined;
  if (prio && prio in base) base[prio] = Math.max(base[prio], 91);

  if (answers.likert.amb_entreprise) {
    base.entrepreneuriat = clamp(
      base.entrepreneuriat * 0.55 + likertTo100(answers.likert.amb_entreprise) * 0.55,
    );
  }
  if (answers.likert.amb_etranger) {
    base.international = clamp(
      base.international * 0.5 + likertTo100(answers.likert.amb_etranger) * 0.6,
    );
  }

  // dilemmes → ajustent stabilité / entrepreneuriat / passion
  const dilStab = answers.sliders.dil_stabilite ?? 50;
  base.stabilite = clamp(base.stabilite * 0.7 + (100 - dilStab) * 0.35);
  base.entrepreneuriat = clamp(base.entrepreneuriat * 0.7 + dilStab * 0.3);
  const dilPassion = answers.sliders.dil_passion ?? 50;
  base.apprentissage = clamp(base.apprentissage * 0.75 + (100 - dilPassion) * 0.3);

  return base;
}

type FamilyDef = {
  id: string;
  label: string;
  riasec: Partial<RiasecScores>;
  need: Partial<FunctioningScores>;
  amb: Partial<AmbitionScores>;
};

const FAMILIES: FamilyDef[] = [
  {
    id: 'tech',
    label: 'Technologie & numérique',
    riasec: { I: 90, R: 70, C: 55, E: 50 },
    need: { analyse: 80, pratique: 65, variete: 60 },
    amb: { apprentissage: 70, progression: 65 },
  },
  {
    id: 'conseil',
    label: 'Conseil & stratégie',
    riasec: { I: 80, E: 85, S: 60, C: 55 },
    need: { analyse: 75, leadership: 70, contactHumain: 60 },
    amb: { progression: 80, impact: 55 },
  },
  {
    id: 'inge',
    label: 'Ingénierie',
    riasec: { R: 85, I: 85, C: 60 },
    need: { analyse: 75, pratique: 80, structure: 55 },
    amb: { apprentissage: 65, stabilite: 55 },
  },
  {
    id: 'entre',
    label: 'Entrepreneuriat',
    riasec: { E: 95, A: 60, I: 55, S: 50 },
    need: { leadership: 85, autonomie: 80, incertitude: 75 },
    amb: { entrepreneuriat: 95, progression: 70 },
  },
  {
    id: 'finance',
    label: 'Finance & gestion',
    riasec: { C: 90, E: 70, I: 65 },
    need: { structure: 75, analyse: 70 },
    amb: { remuneration: 80, stabilite: 65 },
  },
  {
    id: 'marketing',
    label: 'Marketing stratégique',
    riasec: { E: 80, A: 75, S: 55, I: 50 },
    need: { creativite: 70, contactHumain: 60, leadership: 55 },
    amb: { progression: 70, international: 55 },
  },
  {
    id: 'sante',
    label: 'Santé & soin',
    riasec: { S: 90, I: 70, R: 50 },
    need: { contactHumain: 85, structure: 55 },
    amb: { impact: 90, stabilite: 65 },
  },
  {
    id: 'edu',
    label: 'Éducation & formation',
    riasec: { S: 95, A: 55, I: 55 },
    need: { contactHumain: 85, collaboration: 70 },
    amb: { impact: 85, apprentissage: 70 },
  },
  {
    id: 'design',
    label: 'Design & création',
    riasec: { A: 95, E: 50, I: 45 },
    need: { creativite: 90, autonomie: 70, variete: 65 },
    amb: { apprentissage: 60, equilibre: 55 },
  },
  {
    id: 'data',
    label: 'Data & analyse',
    riasec: { I: 95, C: 75, R: 40 },
    need: { analyse: 90, structure: 60, pratique: 50 },
    amb: { apprentissage: 75, remuneration: 60 },
  },
];

function matchProfile(
  target: Partial<Record<string, number>>,
  actual: Record<string, number>,
): number {
  const keys = Object.keys(target);
  if (!keys.length) return 50;
  let sum = 0;
  for (const k of keys) {
    const t = target[k] ?? 50;
    const a = actual[k] ?? 50;
    sum += 100 - Math.abs(t - a);
  }
  return clamp(sum / keys.length);
}

function recommendFamilies(
  riasec: RiasecScores,
  fn: FunctioningScores,
  amb: AmbitionScores,
): FamilyReco[] {
  const scored = FAMILIES.map((f) => {
    const r = matchProfile(f.riasec as Record<string, number>, riasec);
    const m = matchProfile(f.need as Record<string, number>, fn as unknown as Record<string, number>);
    const a = matchProfile(f.amb as Record<string, number>, amb as unknown as Record<string, number>);
    const score = clamp(r * 0.5 + m * 0.25 + a * 0.25);
    return { f, score, r, m, a };
  }).sort((x, y) => y.score - x.score);

  return scored.map(({ f, score, r }, i) => ({
    id: f.id,
    label: f.label,
    score,
    tier: (i < 3 ? 'forte' : i < 6 ? 'bonne' : 'exploratoire') as FamilyReco['tier'],
    why: `Alignement RIASEC ${r}% avec ton profil consolidé.`,
  }));
}

const METIERS: { id: string; label: string; familyId: string; riasec: Partial<RiasecScores> }[] = [
  { id: 'ing_ia', label: 'Ingénieur IA / Data', familyId: 'tech', riasec: { I: 95, R: 60, C: 55 } },
  { id: 'dev', label: 'Développeur logiciel', familyId: 'tech', riasec: { I: 80, R: 75, C: 50 } },
  { id: 'consultant', label: 'Consultant stratégie', familyId: 'conseil', riasec: { E: 85, I: 80, S: 55 } },
  { id: 'product', label: 'Product Manager', familyId: 'conseil', riasec: { E: 80, I: 70, A: 50, S: 55 } },
  { id: 'inge_indus', label: 'Ingénieur industriel', familyId: 'inge', riasec: { R: 85, I: 80, C: 60 } },
  { id: 'founder', label: 'Entrepreneur / fondateur', familyId: 'entre', riasec: { E: 95, A: 55, I: 50 } },
  { id: 'finance_ana', label: 'Analyste financier', familyId: 'finance', riasec: { C: 90, I: 75, E: 55 } },
  { id: 'mkt', label: 'Responsable marketing', familyId: 'marketing', riasec: { E: 80, A: 70, S: 55 } },
  { id: 'med', label: 'Métiers de la santé', familyId: 'sante', riasec: { S: 90, I: 75, R: 50 } },
  { id: 'enseignant', label: 'Enseignant / formateur', familyId: 'edu', riasec: { S: 95, A: 50, I: 50 } },
  { id: 'ux', label: 'Designer UX / UI', familyId: 'design', riasec: { A: 90, I: 55, E: 40 } },
  { id: 'data_sci', label: 'Data scientist', familyId: 'data', riasec: { I: 95, C: 70, R: 40 } },
];

function recommendMetiers(
  riasec: RiasecScores,
  fn: FunctioningScores,
  amb: AmbitionScores,
  families: FamilyReco[],
  faisabilite: number,
  answers: DiagnosticAnswers,
): MetierReco[] {
  const liked = new Set(flattenSelectedMetierIds(answers.multi));
  const vs = extractVersusSignals(answers);
  const topFam = new Set(families.slice(0, 5).map((f) => f.id));
  return METIERS.filter((m) => topFam.has(m.familyId) || true)
    .map((m) => {
      const riasecScore = matchProfile(m.riasec as Record<string, number>, riasec);
      const modeTravail = clamp(
        (fn.analyse + fn.pratique + fn.autonomie + fn.leadership) / 4,
      );
      const ambitions = clamp((amb.apprentissage + amb.progression + amb.impact) / 3);
      const valeurs = clamp((amb.stabilite + amb.equilibre + amb.remuneration) / 3);
      let score =
        riasecScore * 0.4 +
        modeTravail * 0.15 +
        ambitions * 0.2 +
        valeurs * 0.1 +
        faisabilite * 0.15;
      if (liked.has(m.id)) score += 10;
      // Wins / losses Versus (ids catalogue ou API — match exact)
      const wins = vs.metierWins.get(m.id) || 0;
      const losses = vs.metierLosses.get(m.id) || 0;
      if (wins > 0) score += Math.min(14, 8 + (wins - 1) * 3);
      if (losses > 0 && wins === 0) score -= Math.min(8, 4 + (losses - 1) * 2);
      // Match flou sur libellé (métiers API vs catalogue)
      if (!wins) {
        const label = m.label.toLowerCase();
        for (const [id, n] of vs.metierWins) {
          const wLabel = (answers.labels?.[id] || '').toLowerCase();
          if (wLabel && (wLabel.includes(label.slice(0, 8)) || label.includes(wLabel.slice(0, 8)))) {
            score += Math.min(10, 5 + n * 2);
            break;
          }
        }
      }
      return {
        id: m.id,
        label: answers.labels?.[m.id] || m.label,
        familyId: m.familyId,
        score: clamp(score),
        breakdown: {
          riasec: riasecScore,
          modeTravail,
          ambitions,
          valeurs,
          faisabilite,
        },
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

function buildPreferences(answers: DiagnosticAnswers): OrientationReport['preferences'] {
  const labelOf = (id: string, fallback: (x: string) => string) =>
    answers.labels?.[id] || fallback(id) || id;

  const versusFromLog = (answers.versusLog ?? []).map((entry) => ({
    id: entry.duelId,
    kind: entry.versusType,
    winner: entry.winnerLabel || labelOf(entry.winnerId, entry.versusType === 'ecole' ? ecoleLabel : metierLabel),
    loser: entry.loserLabel || labelOf(entry.loserId, entry.versusType === 'ecole' ? ecoleLabel : metierLabel),
    round: entry.round,
  }));

  const versus =
    versusFromLog.length > 0
      ? versusFromLog
      : (answers.versusPlan ?? [])
          .map((step) => {
            const winner = answers.single[step.id];
            const opts = step.options ?? [];
            if (!winner || opts.length < 2) return null;
            const loser = opts.find((o) => o.id !== winner)?.id ?? '';
            return {
              id: step.id,
              kind: step.versusType ?? 'metier',
              winner: labelOf(winner, step.versusType === 'ecole' ? ecoleLabel : metierLabel),
              loser: labelOf(loser, step.versusType === 'ecole' ? ecoleLabel : metierLabel),
              round: step.round,
            };
          })
          .filter((x): x is NonNullable<typeof x> => Boolean(x));

  return {
    sectors: (answers.multi.car_secteurs ?? []).map((id) => labelOf(id, sectorLabel)),
    metiers: flattenSelectedMetierIds(answers.multi).map((id) => labelOf(id, metierLabel)),
    salary: answers.single.car_salaire
      ? salaryLabel(answers.single.car_salaire)
      : 'Non renseigné',
    ecoles: flattenSelectedEcoleIds(answers.multi).map((id) => {
      const meta = answers.schoolMeta?.[id];
      return {
        id,
        label: labelOf(id, ecoleLabel),
        orientationPlan: meta?.orientationPlan ?? null,
        admissionType: meta?.admissionType ?? null,
        admissionLabel: meta?.admissionLabel ?? null,
        ville: meta?.ville ?? null,
        villes: meta?.villes ?? (meta?.ville ? [meta.ville] : []),
        dureeEtudes: meta?.dureeEtudes ?? null,
        diplomes: meta?.diplomes ?? [],
      };
    }),
    versus,
    versusRankings: {
      metiers: (answers.versusRankings?.metiers ?? []).map((r) => ({
        id: r.id,
        label: r.label,
        rank: r.rank,
      })),
      ecoles: (answers.versusRankings?.ecoles ?? []).map((r) => ({
        id: r.id,
        label: r.label,
        rank: r.rank,
      })),
    },
  };
}

function boostFamiliesFromChoices(
  families: FamilyReco[],
  answers: DiagnosticAnswers,
): FamilyReco[] {
  const sectorBoost = new Set(
    (answers.multi.car_secteurs ?? [])
      .map((id) => CATALOG_SECTORS.find((s) => s.id === id)?.familyId)
      .filter(Boolean) as string[],
  );
  const metierBoost = new Set(
    flattenSelectedMetierIds(answers.multi)
      .map((id) => CATALOG_METIERS.find((m) => m.id === id)?.familyId)
      .filter(Boolean) as string[],
  );
  const vs = extractVersusSignals(answers);
  // Secteurs dont un métier a gagné un Versus → boost famille liée (catalogue + labels)
  const versusFamilyBoost = new Map<string, number>();
  for (const [sectorId, n] of vs.sectorWins) {
    const fam =
      CATALOG_SECTORS.find((s) => s.id === sectorId || String(s.id) === String(sectorId))
        ?.familyId ||
      CATALOG_SECTORS.find((s) =>
        (answers.labels?.[sectorId] || '')
          .toLowerCase()
          .includes(s.label.toLowerCase().slice(0, 6)),
      )?.familyId;
    if (fam) versusFamilyBoost.set(fam, (versusFamilyBoost.get(fam) || 0) + n);
  }
  // Victoires métiers catalogue → famille directe
  for (const [metierId, n] of vs.metierWins) {
    const fam = CATALOG_METIERS.find((m) => m.id === metierId)?.familyId;
    if (fam) versusFamilyBoost.set(fam, (versusFamilyBoost.get(fam) || 0) + n);
  }

  return families
    .map((f) => {
      let score = f.score;
      if (sectorBoost.has(f.id)) score += 6;
      if (metierBoost.has(f.id)) score += 8;
      const vsN = versusFamilyBoost.get(f.id) || 0;
      if (vsN > 0) score += Math.min(12, 5 + vsN * 3);
      return { ...f, score: clamp(score) };
    })
    .sort((a, b) => b.score - a.score)
    .map((f, i) => ({
      ...f,
      tier: (i < 3 ? 'forte' : i < 6 ? 'bonne' : 'exploratoire') as FamilyReco['tier'],
    }));
}

function profileTitle(code: string, fn: FunctioningScores, amb: AmbitionScores): string {
  const primary = code[0] as RiasecLetter;
  if (primary === 'I' && amb.entrepreneuriat > 70) return 'L’Explorateur Stratège';
  if (primary === 'I' && fn.analyse > 70) return 'L’Analyste Curieux';
  if (primary === 'E' && amb.entrepreneuriat > 75) return 'Le Bâtisseur de Projets';
  if (primary === 'E') return 'Le Leader Ambitionné';
  if (primary === 'S' && amb.impact > 70) return 'Le Facilitateur Engagé';
  if (primary === 'A') return 'Le Créateur Orienté Sens';
  if (primary === 'R') return 'Le Praticien Concret';
  if (primary === 'C') return 'L’Organisateur Fiable';
  return 'Le Profil en Exploration';
}

function profileSentence(
  title: string,
  dominante: { primary: RiasecLetter; secondary: RiasecLetter; tertiary: RiasecLetter },
  fn: FunctioningScores,
): string {
  const p = RIASEC_LABELS[dominante.primary];
  const s = RIASEC_LABELS[dominante.secondary];
  const tone =
    fn.autonomie > 70
      ? 'avec une forte appétence pour l’autonomie'
      : fn.collaboration > 70
        ? 'dans des environnements collaboratifs'
        : 'en combinant réflexion et action';
  return `${title} — profil à dominante ${p.toLowerCase()} et ${s.toLowerCase()}, ${tone}. Tu sembles particulièrement stimulé(e) par les contextes où tu peux comprendre des problèmes, proposer des solutions et progresser vers davantage de responsabilités.`;
}

function buildForces(
  riasec: RiasecScores,
  fn: FunctioningScores,
  amb: AmbitionScores,
): string[] {
  const forces: string[] = [];
  const [p, s] = topLetters(riasec);
  forces.push(
    `Facilité à t’exprimer dans un registre ${RIASEC_LABELS[p].toLowerCase()} (et ${RIASEC_LABELS[s].toLowerCase()} en secondaire).`,
  );
  if (fn.analyse >= 65) forces.push('Capacité à analyser rapidement des situations complexes.');
  if (fn.leadership >= 65) forces.push('Aisance à coordonner ou prendre des responsabilités en groupe.');
  if (fn.pratique >= 65) forces.push('Préférence pour l’apprentissage par l’expérimentation.');
  if (fn.creativite >= 65) forces.push('Appétence pour imaginer des approches originales.');
  if (amb.apprentissage >= 65) forces.push('Motivation forte pour continuer à apprendre.');
  if (amb.impact >= 65) forces.push('Besoin de sens et d’impact dans ton projet professionnel.');
  if (forces.length < 4) {
    forces.push('Capacité à articuler ambitions personnelles et contraintes réalistes.');
  }
  return forces.slice(0, 6);
}

function buildVigilances(
  fn: FunctioningScores,
  amb: AmbitionScores,
  maturite: number,
  answers: DiagnosticAnswers,
): string[] {
  const v: string[] = [];
  if (fn.autonomie >= 75) {
    v.push(
      'Ton besoin d’autonomie peut rendre les environnements très rigides (process lourds) frustrants.',
    );
  }
  if (fn.variete >= 75 && maturite < 60) {
    v.push(
      'Ton attrait pour la variété peut rendre le choix d’une spécialité difficile — cadre 2–3 familles avant de trancher.',
    );
  }
  if (amb.stabilite < 45 && (answers.sliders.dil_stabilite ?? 50) > 60) {
    v.push(
      'Tes dilemmes montrent une tolérance au risque plus élevée que ta stabilité déclarée : clarifie ce que tu es prêt(e) à accepter.',
    );
  }
  if (maturite < 45) {
    v.push(
      'La clarté du projet est encore faible : priorise l’exploration concrète (métiers, stages, rencontres) avant les classements d’écoles.',
    );
  }
  if (fn.contactHumain < 40 && amb.impact > 70) {
    v.push(
      'Tu vises l’impact, mais le contact humain intensif te fatigue : privilégie des rôles d’impact « analytique » ou « produit ».',
    );
  }
  if (v.length < 2) {
    v.push(
      'Attention à ne pas sur-optimiser le prestige d’une école avant d’avoir validé l’adéquation métier / mode de vie.',
    );
  }
  return v.slice(0, 5);
}

function diagnosticLabel(maturite: number, amb: number): string {
  if (maturite >= 75 && amb >= 70) return 'Décision active';
  if (maturite >= 55) return 'Affinage du projet';
  if (maturite >= 40) return 'Exploration active';
  return 'Exploration initiale';
}

function diagnosticBody(
  label: string,
  maturite: number,
  families: FamilyReco[],
): string {
  const top = families
    .slice(0, 3)
    .map((f) => f.label)
    .join(', ');
  if (label === 'Exploration active' || label === 'Exploration initiale') {
    return `Tu disposes déjà de centres d’intérêt cohérents (notamment ${top}), mais ton projet n’est pas encore assez précis pour figer une formation. Priorité : comparer 2 à 3 familles professionnelles, puis construire ta stratégie d’écoles.`;
  }
  if (label === 'Affinage du projet') {
    return `Tu as une direction prometteuse autour de ${top}. L’étape suivante consiste à valider 1–2 métiers cibles et à cartographier les filières / établissements compatibles avec tes contraintes.`;
  }
  return `Ton niveau de clarté est élevé. Tu peux passer à une stratégie d’admission concrète : calendrier, plans A/B d’écoles, et alignement budget / mobilité — en gardant ${top} comme boussole.`;
}

function filieresFromFamilies(families: FamilyReco[]): string[] {
  const map: Record<string, string[]> = {
    tech: ['Informatique / Génie logiciel', 'IA & Data', 'Systèmes & réseaux'],
    conseil: ['Management', 'Stratégie & organisation', 'Business analytics'],
    inge: ['Génie industriel', 'Génie civil / électromécanique', 'Génie des procédés'],
    entre: ['Entrepreneuriat', 'Innovation & startup', 'Management de projet'],
    finance: ['Finance', 'Comptabilité / contrôle', 'Économie appliquée'],
    marketing: ['Marketing digital', 'Communication', 'Commerce international'],
    sante: ['Médecine / paramédical', 'Biologie / biotech', 'Santé publique'],
    edu: ['Sciences de l’éducation', 'Formation & RH', 'Psychologie'],
    design: ['Design graphique / UX', 'Architecture d’intérieur', 'Médias créatifs'],
    data: ['Data science', 'Statistique', 'Mathématiques appliquées'],
  };
  const out: string[] = [];
  for (const f of families.slice(0, 3)) {
    out.push(...(map[f.id] ?? []).slice(0, 2));
  }
  return out.slice(0, 6);
}

function ecolesStrategie(
  answers: DiagnosticAnswers,
  faisabilite: number,
  families: FamilyReco[],
): string[] {
  const tips: string[] = [];
  const budget = answers.single.real_budget;
  if (budget === 'public' || budget === 'lt30') {
    tips.push('Prioriser universités publiques / CPGE / écoles à frais maîtrisés comme plan A.');
  } else if (budget === 'gt100') {
    tips.push('Tu peux ouvrir le spectre aux écoles privées sélectives — garde un plan B public.');
  } else {
    tips.push('Construire un plan A/B : 1–2 cibles ambitieuses + options accessibles budgétairement.');
  }

  const villes = answers.cities ?? [];
  if (villes.includes('peuimporte') || villes.length >= 4) {
    tips.push('Mobilité géographique large : avantage pour optimiser le fit école / filière.');
  } else if (villes.length > 0) {
    const label = studyCitiesLabelFromAnswers(answers);
    if (label && label !== '—') {
      tips.push(`Cibler d’abord les établissements dans : ${label.replace(/ · /g, ', ')}.`);
    }
  }

  tips.push(
    `Ancrer la shortlist sur les familles « ${families
      .slice(0, 2)
      .map((f) => f.label)
      .join(' » et « ')} ».`,
  );

  if (faisabilite < 55) {
    tips.push(
      'Faisabilité actuelle limitée : séquencer (année de consolidation / alternatives) plutôt que forcer un parcours inaccessible.',
    );
  } else {
    tips.push('Faisabilité correcte : passer aux actions (portes ouvertes, dossiers, calendrier concours).');
  }

  const radarIds = flattenSelectedEcoleIds(answers.multi);
  const plans = new Set<string>();
  const admissions = new Set<string>();
  for (const id of radarIds) {
    const meta = answers.schoolMeta?.[id];
    if (meta?.orientationPlan) plans.add(`Plan ${meta.orientationPlan}`);
    if (meta?.admissionLabel) admissions.add(meta.admissionLabel);
  }
  if (plans.size) {
    tips.push(
      `Répartir tes candidatures selon les catégories retenues : ${[...plans].join(', ')}.`,
    );
  }
  if (admissions.size) {
    tips.push(
      `Anticiper les modes d’admission de ton radar : ${[...admissions].join(', ')}.`,
    );
  }

  return tips;
}

export function emptyAnswers(): DiagnosticAnswers {
  return {
    single: {},
    likert: {},
    situations: {},
    multi: {},
    sliders: {},
    cities: [],
    cityOther: [],
    labels: {},
    schoolMeta: {},
    versusPlan: [],
    versusField: { metiers: [], ecoles: [] },
    versusLog: [],
    versusRankings: { metiers: [], ecoles: [] },
    profile: { ...EMPTY_DIAGNOSTIC_PROFILE, bacSpecialites: [] },
  };
}

function syncProfileToContext(answers: DiagnosticAnswers): DiagnosticAnswers {
  const p = answers.profile;
  if (!p?.studyLevel) return answers;
  return {
    ...answers,
    single: {
      ...answers.single,
      ctx_niveau: mapStudyLevelToCtx(p.studyLevel),
      ctx_filiere: mapFiliereToCtx(p.bacType, p.bacFiliere, p.bacSpecialites),
    },
  };
}

const STUDY_CITY_ID_TO_LABEL: Record<string, string> = {
  casa: 'Casablanca',
  rabat: 'Rabat',
  marrakech: 'Marrakech',
  tanger: 'Tanger',
  fes: 'Fès',
};

/** Villes d’études choisies dans le module Réalité (pas la ville du profil). */
function studyCitiesLabelFromAnswers(answers: DiagnosticAnswers): string {
  const selected = answers.cities ?? [];
  if (selected.includes('peuimporte')) {
    return 'Peu importe — partout au Maroc';
  }
  const labels: string[] = [];
  for (const id of selected) {
    if (id === 'autres' || id === 'peuimporte') continue;
    labels.push(STUDY_CITY_ID_TO_LABEL[id] || id);
  }
  if (selected.includes('autres')) {
    for (const name of answers.cityOther ?? []) {
      if (name?.trim() && !labels.includes(name.trim())) labels.push(name.trim());
    }
  }
  return labels.length ? labels.join(' · ') : '—';
}

function studentSummaryFromAnswers(answers: DiagnosticAnswers) {
  const p = answers.profile;
  const bacLabel =
    p.bacType === 'mission'
      ? `Mission · ${(p.bacSpecialites || []).join(', ') || '—'}`
      : p.bacType === 'marocain'
        ? `Marocain · ${formatProfileBacFiliereLabel(p.bacFiliere)}`
        : p.studyLevel || '—';
  let notesLabel = 'Non renseignées';
  if (p.bacType === 'marocain' && p.noteNational) {
    notesLabel = `1ère ${p.noteGenerale1ereBac} · CC ${p.noteControleContinu} · Nat. ${p.noteNational}${
      p.noteAvailability === 'estimation' ? ' (estim.)' : ''
    }`;
  } else if (p.bacType === 'mission' && (p.noteGeneralePremiere || p.noteGeneraleBac)) {
    notesLabel = `1ère ${p.noteGeneralePremiere || '—'} · Term. ${p.noteGeneraleTerminale || '—'} · Bac ${
      p.noteGeneraleBac || '—'
    }`;
  }
  return {
    fullName: `${p.firstName} ${p.lastName}`.trim() || 'Étudiant(e)',
    studyLevel: p.studyLevel || '—',
    bacLabel,
    city: studyCitiesLabelFromAnswers(answers),
    notesLabel,
  };
}

/** Profil démo (persona Explorateur) pour prévisualiser le rapport rapidement. */
export function demoAnswers(): DiagnosticAnswers {
  const persona = getPersonaById('explorateur');
  return syncProfileToContext(persona ? persona.build() : emptyAnswers());
}

export function buildOrientationReport(rawAnswers: DiagnosticAnswers): OrientationReport {
  const answers = syncProfileToContext(rawAnswers);
  const riasecDeclare = scoreDeclared(answers);
  const riasecComportemental = scoreBehavioral(answers);
  const riasecConsolide = mergeRiasec(riasecDeclare, riasecComportemental);
  const codeDeclare = topCode(riasecDeclare);
  const codeComportemental = topCode(riasecComportemental);
  const codeConsolide = topCode(riasecConsolide);
  const [primary, secondary, tertiary] = topLetters(riasecConsolide);

  const functioning = scoreFunctioning(answers);
  const ambitions = scoreAmbitions(answers);

  const maturite =
    optionValue('ctx_maturite', answers.single.ctx_maturite) ?? 45;
  const connaissanceMetiers =
    optionValue('ctx_connaissance_metiers', answers.single.ctx_connaissance_metiers) ?? 40;
  const connaissanceFormations =
    optionValue('ctx_connaissance_formations', answers.single.ctx_connaissance_formations) ?? 40;
  const confiance = answers.likert.amb_confiance
    ? likertTo100(answers.likert.amb_confiance)
    : 50;

  const ambitionGlobale = clamp(
    Object.values(ambitions).reduce((s, v) => s + v, 0) / 8 +
      (answers.likert.amb_entreprise ? likertTo100(answers.likert.amb_entreprise) * 0.15 : 0),
  );

  let faisabilite = 55;
  const budget = answers.single.real_budget;
  if (budget === 'public' || budget === 'lt30') faisabilite -= 8;
  if (budget === 'gt100' || budget === '60_100') faisabilite += 10;
  if (budget === 'nsp') faisabilite -= 5;
  const abroad = optionValue('real_etranger', answers.single.real_etranger) ?? 50;
  const wantAbroad = answers.likert.amb_etranger
    ? likertTo100(answers.likert.amb_etranger)
    : 50;
  if (wantAbroad > 70 && abroad < 40) faisabilite -= 15;
  if (answers.cities?.includes('peuimporte') || (answers.cities?.length ?? 0) >= 3) {
    faisabilite += 8;
  }
  faisabilite = clamp(faisabilite);

  let families = recommendFamilies(riasecConsolide, functioning, ambitions);
  families = boostFamiliesFromChoices(families, answers);
  const metiers = recommendMetiers(
    riasecConsolide,
    functioning,
    ambitions,
    families,
    faisabilite,
    answers,
  );
  const preferences = buildPreferences(answers);

  const title = profileTitle(codeConsolide, functioning, ambitions);
  const dominante = { primary, secondary, tertiary };

  const moteursOrdered = (Object.keys(AMBITION_LABELS) as (keyof AmbitionScores)[])
    .map((key) => ({
      key,
      label: AMBITION_LABELS[key],
      score: ambitions[key],
    }))
    .sort((a, b) => b.score - a.score);

  const label = diagnosticLabel(maturite, ambitionGlobale);

  return {
    profileTitle: title,
    profileSentence: profileSentence(title, dominante, functioning),
    studentSummary: studentSummaryFromAnswers(answers),
    scores: {
      maturiteProjet: clamp(maturite),
      riasecDeclare,
      riasecComportemental,
      riasecConsolide,
      codeDeclare,
      codeComportemental,
      codeConsolide,
      functioning,
      ambitions,
      clarte: clamp(maturite),
      connaissanceMetiers: clamp(connaissanceMetiers),
      connaissanceFormations: clamp(connaissanceFormations),
      confiance: clamp(confiance),
      ambitionGlobale,
      faisabilite,
    },
    dominante,
    forces: buildForces(riasecConsolide, functioning, ambitions),
    vigilances: buildVigilances(functioning, ambitions, maturite, answers),
    families,
    metiers,
    filieresSuggest: filieresFromFamilies(families),
    ecolesStrategie: ecolesStrategie(answers, faisabilite, families),
    ecolesRecommandees: [],
    diagnosticLabel: label,
    diagnosticBody: diagnosticBody(label, maturite, families),
    moteursOrdered,
    preferences,
  };
}

export function isStepAnswered(
  stepId: string,
  answers: DiagnosticAnswers,
  stepOverride?: DiagnosticStep,
): boolean {
  const step =
    stepOverride ??
    ORIENTATION_DIAGNOSTIC_STEPS.find((s) => s.id === stepId) ??
    (isMetierSectorStepId(stepId)
      ? ({
          id: stepId,
          module: 'careers',
          kind: 'dynamic_metiers',
          maxSelect: METIERS_PER_SECTOR_MAX,
          title: '',
        } satisfies DiagnosticStep)
      : isSchoolTypeStepId(stepId)
        ? ({
            id: stepId,
            module: 'schools',
            kind: 'dynamic_schools',
            maxSelect: SCHOOLS_PER_TYPE_MAX,
            title: '',
          } satisfies DiagnosticStep)
        : undefined);
  if (!step) return false;
  switch (step.kind) {
    case 'single':
      return Boolean(answers.single[stepId]);
    case 'likert':
      return Boolean(answers.likert[stepId]);
    case 'situation': {
      const s = answers.situations[stepId];
      return Boolean(s?.most && s?.least && s.most !== s.least);
    }
    case 'multi_max': {
      const n = answers.multi[stepId]?.length ?? 0;
      const max = step.maxSelect ?? 3;
      const min = step.minSelect ?? max;
      return n >= min && n <= max;
    }
    case 'dynamic_schools': {
      const n = answers.multi[stepId]?.length ?? 0;
      const max = step.maxSelect ?? SCHOOLS_PER_TYPE_MAX;
      if (n > max) return false;
      const total = flattenSelectedEcoleIds(answers.multi).length;
      if (total > SCHOOLS_TOTAL_MAX) return false;
      // Catalogue vide pour ce type → étape traversable
      if (answers.single[`${stepId}__empty`] === '1') return true;
      // Au moins 1 école au total (les pages type suivantes peuvent rester vides)
      return total >= 1;
    }
    case 'dynamic_sectors': {
      const n = answers.multi[stepId]?.length ?? 0;
      const max = step.maxSelect ?? 7;
      return n >= 1 && n <= max;
    }
    case 'dynamic_metiers': {
      const n = answers.multi[stepId]?.length ?? 0;
      const max = step.maxSelect ?? METIERS_PER_SECTOR_MAX;
      return n >= 1 && n <= max;
    }
    case 'slider':
    case 'dilemma':
      return typeof answers.sliders[stepId] === 'number';
    case 'versus':
      return Boolean(answers.single[stepId]);
    case 'cities': {
      const selected = answers.cities ?? [];
      if (selected.length === 0) return false;
      if (selected.includes('autres') && !(answers.cityOther?.length > 0)) return false;
      return true;
    }
    case 'profile_identity':
      return validateProfileIdentity(answers.profile) === null;
    case 'profile_school':
      return validateProfileSchool(answers.profile) === null;
    case 'profile_grades':
      return validateProfileGrades(answers.profile) === null;
    default:
      return false;
  }
}
