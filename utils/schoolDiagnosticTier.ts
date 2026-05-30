import type { SchoolDiagnosticRecommendationItem } from '@/services/schoolRecommendationDiagnostic';

export type DiagnosticTier = 'recommended' | 'possible' | 'last' | 'avoid';

export function getDiagnosticTier(
  row: Pick<SchoolDiagnosticRecommendationItem, 'combinedScore' | 'bacFiliereCompatible' | 'seuilCompatible'>,
): DiagnosticTier {
  if (row.bacFiliereCompatible === false || row.seuilCompatible === false) return 'avoid';
  const s = row.combinedScore ?? 0;
  if (s >= 78) return 'recommended';
  if (s >= 60) return 'possible';
  if (s >= 45) return 'last';
  return 'avoid';
}

export function tierLabel(tier: DiagnosticTier, locale: 'fr' | 'ar' = 'fr'): string {
  if (locale === 'ar') {
    switch (tier) {
      case 'recommended':
        return 'موصى به';
      case 'possible':
        return 'ممكن';
      case 'last':
        return 'خيار أخير';
      default:
        return 'يُفضّل تجنبه';
    }
  }
  switch (tier) {
    case 'recommended':
      return 'Recommandé';
    case 'possible':
      return 'Possible';
    case 'last':
      return 'Dernier choix';
    default:
      return 'À éviter';
  }
}

export function tierColor(tier: DiagnosticTier): string {
  switch (tier) {
    case 'recommended':
      return '#2fce94';
    case 'possible':
      return '#333E8F';
    case 'last':
      return '#F59E0B';
    default:
      return '#94A3B8';
  }
}
