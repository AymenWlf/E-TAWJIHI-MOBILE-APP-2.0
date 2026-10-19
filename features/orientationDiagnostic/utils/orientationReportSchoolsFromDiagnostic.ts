import type { OrientationSchoolReco } from '@/features/orientationDiagnostic/types/orientationDiagnosticPrototype';
import type {
  SchoolDiagnosticFullResult,
  SchoolDiagnosticRecommendationItem,
} from '@/services/schoolRecommendationDiagnostic';
import { computeDiagnosticBacComparisonNote } from '@/utils/diagnosticBacComparisonNote';
import { applyDiagnosticHardBlocksToRow } from '@/utils/schoolDiagnosticHardBlocks';
import { sortSchoolDiagnosticRecommendationsWithSeuil } from '@/utils/schoolDiagnosticSeuilCompatibility';
import { getDiagnosticTier, tierLabel } from '@/utils/schoolDiagnosticTier';

function studyDuration(row: SchoolDiagnosticRecommendationItem): string | null {
  const min = row.anneesEtudes;
  const max = row.dureeEtudesMax;
  if (typeof min === 'number' && typeof max === 'number' && max > min) return `${min}-${max} ans`;
  if (typeof min === 'number' && min > 0) return `${min} ans`;
  return null;
}

function toReportSchool(row: SchoolDiagnosticRecommendationItem): OrientationSchoolReco {
  const tier = getDiagnosticTier(row);
  const diplomes = (row.diplomesDelivres ?? '')
    .split(/[|\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
  return {
    establishmentId: row.establishmentId,
    nom: row.nom,
    nomArabe: row.nomArabe,
    sigle: row.sigle,
    slug: row.slug,
    ville: row.ville,
    dureeEtudes: studyDuration(row),
    diplomes,
    typeEcole: row.typeEcole,
    admissionType: row.admissionType,
    facultePubliqueAccesOuvert: row.facultePubliqueAccesOuvert === true,
    logo: row.logo,
    algorithmicScore: row.algorithmicScore ?? row.combinedScore ?? 0,
    combinedScore: row.combinedScore ?? 0,
    reasonsYes: row.reasonsYes ?? [],
    reasonsNo: row.reasonsNo ?? [],
    bacFiliereCompatible: row.bacFiliereCompatible !== false,
    seuilCompatible: row.seuilCompatible !== false,
    tier: tier === 'last' ? 'lastResort' : tier,
    tierLabel: tierLabel(tier, 'fr'),
  };
}

/** Même liste, mêmes paliers et même ordre que la page Recommandations d’écoles. */
export function reportSchoolsFromDiagnostic(
  data: Pick<SchoolDiagnosticFullResult, 'recommendations' | 'payload'>,
): OrientationSchoolReco[] {
  const payload = data.payload ?? {};
  const bacSummary = computeDiagnosticBacComparisonNote(payload);
  const sorted = sortSchoolDiagnosticRecommendationsWithSeuil(
    (data.recommendations ?? []).map((row) => applyDiagnosticHardBlocksToRow(row, payload, bacSummary)),
    bacSummary,
  );
  return sorted.map(toReportSchool);
}
