import type {
  DiagnosticAnswers,
  DiagnosticStep,
  OrientationReport,
  RiasecLetter,
  RiasecScores,
} from '../types/orientationDiagnosticPrototype';
import { orientationStepsFor } from './orientationDiagnosticEngine';

const LETTERS: RiasecLetter[] = ['R', 'I', 'A', 'S', 'E', 'C'];
const NAMES: Record<RiasecLetter, string> = {
  R: 'Réaliste',
  I: 'Investigateur',
  A: 'Artistique',
  S: 'Social',
  E: 'Entreprenant',
  C: 'Conventionnel',
};

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value * 10) / 10));
}

function choiceValue(step: DiagnosticStep, choiceId: string | number | undefined): number | null {
  if (choiceId == null || choiceId === '') return null;
  const option = step.options?.find((item) => item.id === String(choiceId));
  if (option?.value != null && !Number.isNaN(Number(option.value))) return Number(option.value);
  const numeric = Number(choiceId);
  return Number.isNaN(numeric) ? null : numeric;
}

function answerScore(step: DiagnosticStep, answers: DiagnosticAnswers): number | null {
  if (step.kind === 'dilemma' || step.kind === 'slider') {
    const value = answers.sliders[step.id];
    return value == null ? null : value;
  }
  if (step.kind === 'likert') return choiceValue(step, answers.likert[step.id]);
  return choiceValue(step, answers.single[step.id]);
}

function declaredRiasec(steps: DiagnosticStep[], answers: DiagnosticAnswers): RiasecScores {
  const buckets: Record<RiasecLetter, number[]> = { R: [], I: [], A: [], S: [], E: [], C: [] };
  for (const step of steps) {
    if (step.kind !== 'likert' || step.scoring?.axis !== 'riasec' || !step.riasecDim) continue;
    const value = choiceValue(step, answers.likert[step.id]);
    if (value == null) continue;
    buckets[step.riasecDim].push(value);
  }
  return {
    R: buckets.R.length ? clamp(buckets.R.reduce((a, b) => a + b, 0) / buckets.R.length) : 50,
    I: buckets.I.length ? clamp(buckets.I.reduce((a, b) => a + b, 0) / buckets.I.length) : 50,
    A: buckets.A.length ? clamp(buckets.A.reduce((a, b) => a + b, 0) / buckets.A.length) : 50,
    S: buckets.S.length ? clamp(buckets.S.reduce((a, b) => a + b, 0) / buckets.S.length) : 50,
    E: buckets.E.length ? clamp(buckets.E.reduce((a, b) => a + b, 0) / buckets.E.length) : 50,
    C: buckets.C.length ? clamp(buckets.C.reduce((a, b) => a + b, 0) / buckets.C.length) : 50,
  };
}

function behavioralRiasec(steps: DiagnosticStep[], answers: DiagnosticAnswers): RiasecScores {
  const pts: RiasecScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  let max = 0;
  let min = 0;
  let count = 0;
  for (const step of steps) {
    if (step.kind !== 'situation') continue;
    const row = answers.situations[step.id];
    if (!row?.most || !row.least) continue;
    const plus = step.scoring?.situationMost ?? 18;
    const minus = step.scoring?.situationLeast ?? 10;
    if (LETTERS.includes(row.most as RiasecLetter)) pts[row.most as RiasecLetter] += plus;
    if (LETTERS.includes(row.least as RiasecLetter)) pts[row.least as RiasecLetter] -= minus;
    max += plus;
    min -= minus;
    count += 1;
  }
  const span = max - min;
  const out = { ...pts };
  for (const letter of LETTERS) {
    out[letter] = count === 0 || span <= 0 ? 50 : clamp(((pts[letter] - min) / span) * 100);
  }
  return out;
}

function top3(scores: RiasecScores): [RiasecLetter, RiasecLetter, RiasecLetter] {
  const sorted = [...LETTERS].sort((a, b) => scores[b] - scores[a]);
  return [sorted[0], sorted[1], sorted[2]];
}

function avg(values: number[]): number {
  return values.length ? clamp(values.reduce((a, b) => a + b, 0) / values.length) : 50;
}

/** Recouvre le rapport avec le moteur 2.0. Les choix de métiers et d’écoles ne modifient pas le RIASEC. */
export function applyOrientationV2(report: OrientationReport, answers: DiagnosticAnswers): OrientationReport {
  const steps = orientationStepsFor();
  const declared = declaredRiasec(steps, answers);
  const behavioral = behavioralRiasec(steps, answers);
  const consolidated = { ...declared };
  for (const letter of LETTERS) {
    consolidated[letter] = clamp(declared[letter] * 0.55 + behavioral[letter] * 0.45);
  }
  const [primary, secondary, tertiary] = top3(consolidated);
  const spread = consolidated[primary] - consolidated[tertiary];
  const balanced = spread < 8;
  const readinessBuckets: Record<string, number[]> = { concern: [], control: [], curiosity: [], confidence: [] };
  for (const step of steps) {
    const dimension = step.scoring?.dimension;
    if (step.scoring?.axis !== 'readiness' || !dimension || !(dimension in readinessBuckets)) continue;
    const value = answerScore(step, answers);
    if (value != null) readinessBuckets[dimension].push(value);
  }
  const readiness = {
    concern: avg(readinessBuckets.concern),
    control: avg(readinessBuckets.control),
    curiosity: avg(readinessBuckets.curiosity),
    confidence: avg(readinessBuckets.confidence),
    score: 50,
  };
  const present = [readiness.concern, readiness.control, readiness.curiosity, readiness.confidence].filter(
    (_, index) => readinessBuckets[['concern', 'control', 'curiosity', 'confidence'][index]].length > 0,
  );
  readiness.score = present.length ? clamp(present.reduce((a, b) => a + b, 0) / present.length) : 50;
  const notes: string[] = [];
  let gapSum = 0;
  for (const letter of LETTERS) {
    const gap = Math.abs(declared[letter] - behavioral[letter]);
    gapSum += gap;
    if (gap > 20) notes.push(`Écart d’environ ${Math.round(gap)} points entre le déclaré et le comportemental sur ${letter}.`);
  }
  if (balanced) notes.push('Les trois premières dimensions sont proches : le profil est peu différencié.');
  const title = balanced
    ? `Profil ${primary}-${secondary}-${tertiary} relativement équilibré`
    : `Piste ${NAMES[primary]} à explorer`;
  const sentence = balanced
    ? `Ton profil suggère un équilibre entre les environnements ${NAMES[primary]}, ${NAMES[secondary]} et ${NAMES[tertiary]}. Plusieurs contextes semblent compatibles et méritent d’être explorés.`
    : `Ton profil suggère une affinité avec les environnements ${NAMES[primary]}, puis ${NAMES[secondary]}. Cette piste semble compatible et mérite d’être explorée.`;

  return {
    ...report,
    modelVersion: '2.0',
    profileTitle: title,
    profileSentence: sentence,
    dominante: { primary, secondary, tertiary },
    diagnosticLabel: readiness.score >= 70 ? 'Projet déjà assez structuré' : 'Exploration encore nécessaire',
    diagnosticBody:
      'La readiness décrit la clarté du projet. Elle ne dit pas qu’un métier est compatible ou incompatible. La faisabilité reste affichée à part.',
    scores: {
      ...report.scores,
      riasecDeclare: declared,
      riasecComportemental: behavioral,
      riasecConsolide: consolidated,
      codeDeclare: top3(declared).join(''),
      codeComportemental: top3(behavioral).join(''),
      codeConsolide: [primary, secondary, tertiary].join(''),
    },
    v2: {
      ...(report.v2 ?? {
        careerScores: [],
        diagnosticLabel: '',
        diagnosticBody: '',
      }),
      readiness,
      reliabilityScore: clamp(100 - (gapSum / 6) * 1.1 - (balanced ? 12 : 0)),
      reliabilityNotes: notes,
      balancedProfile: balanced,
      profileTitleAr: balanced
        ? `ملف ${primary}-${secondary}-${tertiary} متوازن نسبياً`
        : `مسار ${NAMES[primary]} يستحق الاستكشاف`,
      profileSentenceAr:
        'ملفّك يوحي ببيئات قد تكون مناسبة وتستحق الاستكشاف. هذه قراءة للتوجيه وليست حكماً نهائياً.',
      diagnosticLabel: readiness.score >= 70 ? 'Projet déjà assez structuré' : 'Exploration encore nécessaire',
      diagnosticBody:
        'La readiness décrit la clarté du projet. Elle ne dit pas qu’un métier est compatible ou incompatible.',
      careerScores: report.v2?.careerScores ?? [],
      constraints: { salaryPreference: answers.single.car_salaire },
    },
  };
}
