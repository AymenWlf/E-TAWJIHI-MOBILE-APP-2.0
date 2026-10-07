import type { OrientationDiagnosticPrototypeDraft } from '../constants/orientationDiagnosticPrototypeStorage';

/** Rapport d’orientation terminé (phase + rapport + marquage parcours local ou API). */
export function isOrientationReportComplete(
  draft: OrientationDiagnosticPrototypeDraft | null | undefined,
): boolean {
  if (!draft || draft.phase !== 'report' || !draft.report) return false;
  return draft.reportParcoursSynced === true;
}
