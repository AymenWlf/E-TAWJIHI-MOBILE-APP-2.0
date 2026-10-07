import type { SchoolDiagnosticRecommendationItem } from '@/services/schoolRecommendationDiagnostic';
import {
  buildSchoolDiagnosticRecommendationsHtml,
  type SchoolRecoPdfOptions,
} from '@/utils/schoolDiagnosticRecommendationsHtml';
import { shareHtmlAsPdf } from '@/utils/shareHtmlAsPdf';

function fileName(options: SchoolRecoPdfOptions): string {
  const safe = (options.studentName || 'recommandations')
    .replace(/[^\w-]+/g, '_')
    .slice(0, 40);
  const day = new Date().toISOString().slice(0, 10);
  return `recommandations_ecoles_${safe}_${day}.pdf`;
}

/** PDF des recommandations d’écoles via impression (expo-print) + partage. */
export async function downloadSchoolDiagnosticRecommendationsPdf(
  items: SchoolDiagnosticRecommendationItem[],
  options: SchoolRecoPdfOptions = {},
): Promise<void> {
  const html = buildSchoolDiagnosticRecommendationsHtml(items, options);
  await shareHtmlAsPdf(html, fileName(options));
}
