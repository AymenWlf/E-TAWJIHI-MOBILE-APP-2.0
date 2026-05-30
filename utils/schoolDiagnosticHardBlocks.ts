import type { SchoolDiagnosticRecommendationItem } from '@/services/schoolRecommendationDiagnostic';
import type { DiagnosticRecommendationView } from '@/contexts/SchoolDiagnosticRecommendationsContext';
import { getSeuilCompatibilityForRow } from '@/utils/schoolDiagnosticSeuilCompatibility';
import type { DiagnosticBacComparisonSummary } from '@/utils/diagnosticBacComparisonNote';

/** Type établissement « Militaire » (casse / accents tolérés). */
export function isMilitaryEstablishmentType(type?: string | null): boolean {
  return (type ?? '').trim().toLowerCase() === 'militaire';
}

export function militaryHeightBlocksCompatibility(payload: Record<string, unknown>): boolean {
  return payload.militaryHeightRequirementMet === 'no';
}

export function shouldForceZeroMilitaryCompatibility(
  payload: Record<string, unknown> | null | undefined,
  establishmentType?: string | null,
): boolean {
  if (!payload) return false;
  return isMilitaryEstablishmentType(establishmentType) && militaryHeightBlocksCompatibility(payload);
}

export function shouldForceZeroSeuilIncompatibility(
  bacSummary: DiagnosticBacComparisonSummary | null,
  row: Pick<SchoolDiagnosticRecommendationItem, 'referenceSeuilPrevisionnel' | 'seuilCompatible'>,
): boolean {
  if (row.seuilCompatible === false) return true;
  if (!bacSummary) return false;
  return getSeuilCompatibilityForRow(bacSummary, row).kind === 'not';
}

export function applyDiagnosticHardBlocksToRow(
  row: SchoolDiagnosticRecommendationItem,
  payload: Record<string, unknown> | null | undefined,
  bacSummary: DiagnosticBacComparisonSummary | null,
): SchoolDiagnosticRecommendationItem {
  const military = shouldForceZeroMilitaryCompatibility(payload, row.typeEcole);
  const seuil = shouldForceZeroSeuilIncompatibility(bacSummary, row);
  if (!military && !seuil) return row;
  return {
    ...row,
    combinedScore: 0,
    algorithmicScore: military || seuil ? 0 : row.algorithmicScore,
    bacFiliereCompatible: military ? false : row.bacFiliereCompatible,
    militaryCriteriaCompatible: military ? false : row.militaryCriteriaCompatible,
    seuilCompatible: seuil ? false : row.seuilCompatible,
  };
}

export function applyDiagnosticHardBlocksToView(
  view: DiagnosticRecommendationView,
  payload: Record<string, unknown> | null | undefined,
  establishmentType?: string | null,
): DiagnosticRecommendationView {
  const military = shouldForceZeroMilitaryCompatibility(payload, establishmentType);
  const seuil = view.seuilCompatibility?.kind === 'not';
  if (!military && !seuil) {
    return view;
  }
  return {
    ...view,
    combinedScore: 0,
    bacFiliereCompatible: military ? false : view.bacFiliereCompatible,
  };
}

export function forcedZeroMilitaryCompatibilityView(
  establishmentId: number,
  payload: Record<string, unknown> | null | undefined,
  establishmentType?: string | null,
): DiagnosticRecommendationView | null {
  if (!shouldForceZeroMilitaryCompatibility(payload, establishmentType)) {
    return null;
  }
  return {
    establishmentId,
    combinedScore: 0,
    bacFiliereCompatible: false,
    seuilCompatibility: { kind: 'unknown', tone: 'unknown', seuil: null },
  };
}
