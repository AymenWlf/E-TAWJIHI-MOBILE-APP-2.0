import { DiagnosticCompatibilityPrompt } from '@/components/diagnostic/DiagnosticCompatibilityPrompt';
import { DiagnosticRecommendationBadge } from '@/components/diagnostic/DiagnosticRecommendationBadge';
import { useSchoolDiagnosticRecommendations } from '@/contexts/SchoolDiagnosticRecommendationsContext';

type Props = {
  establishmentId: number;
  /** Si fourni, priorité à la reco liée à l’annonce. */
  announcementId?: number;
  /** Type établissement (ex. Militaire) pour blocage taille « non ». */
  establishmentType?: string | null;
  size?: 'xs' | 'sm' | 'md';
  isRTL?: boolean;
  locale?: 'fr' | 'ar';
};

/**
 * Affiche le % + seuil si diagnostic passé et établissement dans les reco ;
 * sinon invite à passer le test de compatibilité.
 */
export function DiagnosticEstablishmentCompatibilityBadge({
  establishmentId,
  announcementId,
  establishmentType,
  size = 'xs',
  isRTL = false,
  locale = 'fr',
}: Props) {
  const lookup = useSchoolDiagnosticRecommendations();

  if (lookup.loading || !lookup.ready) {
    return null;
  }

  if (!lookup.hasCompletedDiagnostic) {
    return <DiagnosticCompatibilityPrompt size={size} isRTL={isRTL} locale={locale} />;
  }

  const rec = lookup.getCompatibilityForEstablishment({
    establishmentId,
    announcementId,
    establishmentType,
  });

  if (!rec) {
    return null;
  }

  return (
    <DiagnosticRecommendationBadge
      combinedScore={rec.combinedScore}
      bacFiliereCompatible={rec.bacFiliereCompatible}
      seuilCompatibility={rec.seuilCompatibility}
      seuilNoteSource={lookup.seuilComparisonSource ?? undefined}
      size={size}
      isRTL={isRTL}
      locale={locale}
    />
  );
}
