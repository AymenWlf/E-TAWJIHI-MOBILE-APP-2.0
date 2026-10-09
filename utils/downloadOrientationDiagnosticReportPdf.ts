import { Platform } from 'react-native';

import type { OrientationUiLocale } from '@/features/orientationDiagnostic/data/orientationDiagnosticI18n';
import type { OrientationReport } from '@/features/orientationDiagnostic/types/orientationDiagnosticPrototype';
import { buildOrientationDiagnosticReportHtml } from '@/utils/orientationDiagnosticReportHtml';
import { shareHtmlAsPdf } from '@/utils/shareHtmlAsPdf';

/** A4 à 72 ppp — même page que l’impression Chrome du rapport web. */
const A4_WIDTH = 595;
const A4_HEIGHT = 842;
/** 1,5 cm, marge `@page` du rapport web. */
const A4_MARGIN = 42;

function fileName(report: OrientationReport): string {
  const safe = (report.studentSummary.fullName || 'rapport')
    .replace(/[^\w-]+/g, '_')
    .slice(0, 40);
  const day = new Date().toISOString().slice(0, 10);
  return `rapport_orientation_${safe}_${day}.pdf`;
}

/**
 * iOS dessine la WebView dans la zone imprimable.
 * La marge est portée par la page, le CSS `@page` du document web est retiré
 * pour éviter une double marge.
 */
function htmlForIosPrint(html: string): string {
  const patch =
    '<style>@page{size:A4;margin:0}html,body{width:auto!important;max-width:100%!important}</style>';
  if (html.includes('</head>')) return html.replace('</head>', `${patch}</head>`);
  return `${patch}${html}`;
}

/** PDF du rapport d’orientation, même document HTML que le site. */
export async function downloadOrientationDiagnosticReportPdf(
  report: OrientationReport,
  uiLocale: OrientationUiLocale = 'fr',
): Promise<void> {
  const html = buildOrientationDiagnosticReportHtml(report, uiLocale);
  const name = fileName(report);

  if (Platform.OS === 'ios') {
    await shareHtmlAsPdf(htmlForIosPrint(html), name, {
      width: A4_WIDTH,
      height: A4_HEIGHT,
      margins: { top: A4_MARGIN, right: A4_MARGIN, bottom: A4_MARGIN, left: A4_MARGIN },
    });
    return;
  }

  await shareHtmlAsPdf(
    html,
    name,
    Platform.OS === 'web' ? undefined : { width: A4_WIDTH, height: A4_HEIGHT },
  );
}
