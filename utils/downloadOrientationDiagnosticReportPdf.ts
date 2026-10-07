import type { OrientationReport } from '@/features/orientationDiagnostic/types/orientationDiagnosticPrototype';
import type { OrientationUiLocale } from '@/features/orientationDiagnostic/data/orientationDiagnosticI18n';
import { buildOrientationDiagnosticReportHtml } from '@/utils/orientationDiagnosticReportHtml';
import { shareHtmlAsPdf } from '@/utils/shareHtmlAsPdf';

function fileName(report: OrientationReport): string {
  const safe = (report.studentSummary.fullName || 'rapport')
    .replace(/[^\w-]+/g, '_')
    .slice(0, 40);
  const day = new Date().toISOString().slice(0, 10);
  return `rapport_orientation_${safe}_${day}.pdf`;
}

/** PDF du rapport d’orientation via impression (expo-print) + partage. */
export async function downloadOrientationDiagnosticReportPdf(
  report: OrientationReport,
  uiLocale: OrientationUiLocale = 'fr',
): Promise<void> {
  const html = buildOrientationDiagnosticReportHtml(report, uiLocale);
  await shareHtmlAsPdf(html, fileName(report));
}
