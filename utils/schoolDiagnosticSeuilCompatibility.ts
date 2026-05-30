import type { SchoolDiagnosticRecommendationItem } from '@/services/schoolRecommendationDiagnostic';
import {
  compareNoteRangeToSeuil,
  type DiagnosticBacComparisonSummary,
  type SeuilComparisonTone,
} from '@/utils/diagnosticBacComparisonNote';

export type SeuilCompatibilityKind = 'compatible' | 'almost' | 'not' | 'unknown';

export type SeuilCompatibilityInfo = {
  kind: SeuilCompatibilityKind;
  tone: SeuilComparisonTone;
  seuil: number | null;
};

const SORT_RANK: Record<SeuilCompatibilityKind, number> = {
  compatible: 0,
  almost: 1,
  unknown: 2,
  not: 3,
};

export const SEUIL_COMPATIBILITY_LABEL = {
  fr: {
    compatible: 'Seuil compatible',
    almost: 'Seuil presque compatible',
    not: 'Seuil non compatible',
    unknown: 'Seuil non évaluable',
  },
  ar: {
    compatible: 'عتبة نقط متوافقة',
    almost: 'عتبة نقط شبه متوافقة',
    not: 'عتبة نقط غير متوافقة',
    unknown: 'لا يمكن تقييم عتبة النقط',
  },
} as const;

export const SEUIL_COMPATIBILITY_COLOR: Record<SeuilCompatibilityKind, string> = {
  compatible: '#059669',
  almost: '#D97706',
  not: '#DC2626',
  unknown: '#64748B',
};

function toneToKind(tone: SeuilComparisonTone): SeuilCompatibilityKind {
  switch (tone) {
    case 'green':
      return 'compatible';
    case 'yellow':
      return 'almost';
    case 'red':
      return 'not';
    default:
      return 'unknown';
  }
}

function parseSeuil(row: Pick<SchoolDiagnosticRecommendationItem, 'referenceSeuilPrevisionnel'>): number | null {
  const v = row.referenceSeuilPrevisionnel;
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

export function getSeuilCompatibilityForRow(
  summary: DiagnosticBacComparisonSummary | null,
  row: Pick<SchoolDiagnosticRecommendationItem, 'referenceSeuilPrevisionnel'>,
): SeuilCompatibilityInfo {
  const seuil = parseSeuil(row);
  if (!summary) {
    return { kind: 'unknown', tone: 'unknown', seuil };
  }
  const { tone } = compareNoteRangeToSeuil(
    summary.comparisonNoteMin,
    summary.comparisonNoteMax,
    seuil,
  );
  return { kind: toneToKind(tone), tone, seuil };
}

function establishmentTypeSortRank(typeEcole: string | undefined | null): number {
  const t = (typeof typeEcole === 'string' ? typeEcole : '').trim().toLowerCase();
  if (t === 'public') return 0;
  if (t === 'militaire') return 1;
  if (t === 'semi-public' || t === 'semi public') return 2;
  if (t === 'privé' || t === 'prive') return 3;
  return 4;
}

function tieBreakLabel(row: SchoolDiagnosticRecommendationItem): string {
  const s = typeof row.sigle === 'string' ? row.sigle.trim() : '';
  return (s !== '' ? s : row.nom).toLocaleLowerCase('fr');
}

/** Tri : compatibilité seuil → score combiné → type d’établissement → nom. */
export function compareSchoolDiagnosticRecommendationsWithSeuil(
  a: SchoolDiagnosticRecommendationItem,
  b: SchoolDiagnosticRecommendationItem,
  summary: DiagnosticBacComparisonSummary | null,
): number {
  const ra = SORT_RANK[getSeuilCompatibilityForRow(summary, a).kind];
  const rb = SORT_RANK[getSeuilCompatibilityForRow(summary, b).kind];
  if (ra !== rb) return ra - rb;

  const scoreDiff = b.combinedScore - a.combinedScore;
  if (scoreDiff !== 0) return scoreDiff;

  const typeDiff =
    establishmentTypeSortRank(a.typeEcole) - establishmentTypeSortRank(b.typeEcole);
  if (typeDiff !== 0) return typeDiff;

  return tieBreakLabel(a).localeCompare(tieBreakLabel(b), 'fr');
}

export function sortSchoolDiagnosticRecommendationsWithSeuil(
  items: SchoolDiagnosticRecommendationItem[],
  summary: DiagnosticBacComparisonSummary | null,
): SchoolDiagnosticRecommendationItem[] {
  return [...items].sort((a, b) => compareSchoolDiagnosticRecommendationsWithSeuil(a, b, summary));
}
