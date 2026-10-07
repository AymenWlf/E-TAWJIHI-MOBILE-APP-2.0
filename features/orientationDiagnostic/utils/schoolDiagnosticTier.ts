export type DiagnosticTierId = 'recommended' | 'possible' | 'lastResort' | 'avoid';

type TierInput = {
  combinedScore?: number | null;
  bacFiliereCompatible?: boolean | null;
  seuilCompatible?: boolean | null;
};

export function getSchoolDiagnosticTier(row: TierInput): DiagnosticTierId {
  if (row.bacFiliereCompatible === false || row.seuilCompatible === false) return 'avoid';
  const s = row.combinedScore ?? 0;
  if (s >= 78) return 'recommended';
  if (s >= 60) return 'possible';
  if (s >= 45) return 'lastResort';
  return 'avoid';
}

export const DIAGNOSTIC_TIER_LABELS: Record<DiagnosticTierId, string> = {
  recommended: 'Recommandé',
  possible: 'Possible',
  lastResort: 'Dernier recours',
  avoid: 'À éviter',
};
