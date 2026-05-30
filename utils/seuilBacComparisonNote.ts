/**
 * Priorité aux notes saisies dans « Résultats du bac » pour comparer aux seuils des écoles / annonces.
 * Repli sur le diagnostic uniquement si le bulletin n’est pas renseigné.
 */

import type { BacUserGradesDto } from '@/services/bacUserGrades';
import {
  computeDiagnosticBacComparisonNote,
  formatNoteFr20,
  type DiagnosticBacComparisonSummary,
} from '@/utils/diagnosticBacComparisonNote';

export type SeuilComparisonSource = 'bac_results' | 'diagnostic';

function parseGradeString(v: string | null | undefined): number | null {
  if (v == null || v === '') {
    return null;
  }
  const f = parseFloat(String(v).replace(',', '.'));
  if (!Number.isFinite(f) || f < 0 || f > 20) {
    return null;
  }
  return f;
}

/** Notes bulletin utilisables pour la comparaison aux seuils (75/25 ou note générale). */
export function bacUserGradesUsableForSeuil(grades: BacUserGradesDto | null | undefined): boolean {
  if (!grades) {
    return false;
  }
  if (parseGradeString(grades.calc75_25) != null) {
    return true;
  }
  if (parseGradeString(grades.overall) != null) {
    return true;
  }
  const nat = parseGradeString(grades.national);
  const reg = parseGradeString(grades.regional);
  return nat != null && reg != null;
}

function resolveNoteFromBacGrades(grades: BacUserGradesDto): number | null {
  const fromCalc = parseGradeString(grades.calc75_25);
  if (fromCalc != null) {
    return fromCalc;
  }
  const nat = parseGradeString(grades.national);
  const reg = parseGradeString(grades.regional);
  if (nat != null && reg != null) {
    return 0.75 * nat + 0.25 * reg;
  }
  return parseGradeString(grades.overall);
}

export function computeBacResultsComparisonNote(grades: BacUserGradesDto): DiagnosticBacComparisonSummary {
  const note = resolveNoteFromBacGrades(grades);
  const nat = parseGradeString(grades.national);
  const reg = parseGradeString(grades.regional);
  const usedWeighted = nat != null && reg != null;

  const formulaLines: string[] = [
    'Notes issues de votre bulletin (carte Résultats du bac), pas du diagnostic.',
    'Formule retenue pour ~90 % des établissements : 75 % note nationale + 25 % note régionale.',
  ];
  if (usedWeighted && nat != null && reg != null && note != null) {
    formulaLines.push(
      `0,75 × ${formatNoteFr20(nat)} + 0,25 × ${formatNoteFr20(reg)} = ${formatNoteFr20(note)}/20.`,
    );
  } else if (note != null) {
    formulaLines.push(`Note générale du bulletin : ${formatNoteFr20(note)}/20.`);
  }

  return {
    kind: 'marocain',
    comparisonNote: note,
    comparisonNoteMin: note,
    comparisonNoteMax: note,
    regionalAverage: reg,
    nationalReference: nat,
    formulaLines,
    usedFullWeightedFormula: usedWeighted,
    hasNoteRange: false,
    comparisonSource: 'bac_results',
  };
}

export function resolveSeuilBacComparisonNote(
  diagnosticPayload: Record<string, unknown>,
  bacGrades: BacUserGradesDto | null | undefined,
): { summary: DiagnosticBacComparisonSummary; source: SeuilComparisonSource } {
  if (bacUserGradesUsableForSeuil(bacGrades)) {
    return {
      summary: computeBacResultsComparisonNote(bacGrades!),
      source: 'bac_results',
    };
  }
  const summary = computeDiagnosticBacComparisonNote(diagnosticPayload);
  return {
    summary: { ...summary, comparisonSource: 'diagnostic' },
    source: 'diagnostic',
  };
}
