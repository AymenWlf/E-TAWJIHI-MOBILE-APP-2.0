import { ETAWJIHI_RECEIPT_LOGO_URL } from '@/utils/commercialServiceReceiptDocument';
import type { SchoolDiagnosticRecommendationItem } from '@/services/schoolRecommendationDiagnostic';
import { partitionFacultePublique } from '@/features/orientationDiagnostic/utils/orientationFacultePubliqueGroup';
import {
  getDiagnosticTier,
  tierColor,
  type DiagnosticTier,
} from '@/utils/schoolDiagnosticTier';

function esc(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const TIER_ORDER: DiagnosticTier[] = ['recommended', 'possible', 'last', 'avoid'];

const TIER_LABEL: Record<'fr' | 'ar', Record<DiagnosticTier, string>> = {
  fr: {
    recommended: 'Recommandé',
    possible: 'Possible',
    last: 'Dernier choix',
    avoid: 'À éviter',
  },
  ar: {
    recommended: 'موصى به',
    possible: 'ممكن',
    last: 'خيار أخير',
    avoid: 'يُفضّل تجنبه',
  },
};

export type SchoolRecoPdfOptions = {
  locale?: 'fr' | 'ar';
  profileSummary?: string | null;
  academicYearLabel?: string | null;
  studentName?: string | null;
};

/**
 * HTML imprimable des recommandations d’écoles (PDF via expo-print).
 */
export function buildSchoolDiagnosticRecommendationsHtml(
  items: SchoolDiagnosticRecommendationItem[],
  options: SchoolRecoPdfOptions = {},
): string {
  const locale = options.locale === 'ar' ? 'ar' : 'fr';
  const isAr = locale === 'ar';
  const { facultes, others } = partitionFacultePublique(items);

  const grouped: Record<DiagnosticTier, SchoolDiagnosticRecommendationItem[]> = {
    recommended: [],
    possible: [],
    last: [],
    avoid: [],
  };
  for (const row of others) {
    grouped[getDiagnosticTier(row)].push(row);
  }

  const renderRow = (row: SchoolDiagnosticRecommendationItem) => {
    const nom =
      row.nomArabe && row.nomArabe !== row.nom
        ? `${row.sigle ? `${row.sigle} — ` : ''}${row.nom} · ${row.nomArabe}`
        : `${row.sigle ? `${row.sigle} — ` : ''}${row.nom}`;
    const reasons = (row.reasonsYes ?? [])
      .slice(0, 2)
      .map((r) => `<li>+ ${esc(r)}</li>`)
      .join('');
    return `<div class="card">
      <div class="card-top">
        <div>
          <h4>${esc(nom)}</h4>
          <p class="muted">${esc(row.ville || '')}${row.typeEcole ? ` · ${esc(row.typeEcole)}` : ''}</p>
        </div>
        <div class="score">${Math.round(row.combinedScore)}%</div>
      </div>
      ${reasons ? `<ul>${reasons}</ul>` : ''}
    </div>`;
  };

  const facultesBlock =
    facultes.length > 0
      ? `<h2>${isAr ? 'الجامعات والكليات العمومية' : 'Universités et facultés publiques'} (${facultes.length})</h2>
         ${facultes.map(renderRow).join('')}`
      : '';

  const tiersBlock = TIER_ORDER.map((tier) => {
    const list = grouped[tier];
    if (!list.length) return '';
    const color = tierColor(tier);
    return `<h2 style="color:${color}">${esc(TIER_LABEL[locale][tier])} (${list.length})</h2>
      ${list.map(renderRow).join('')}`;
  }).join('');

  const day = new Date().toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR');
  const title = isAr ? 'توصيات المدارس' : 'Recommandations d’écoles';

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${isAr ? 'rtl' : 'ltr'}">
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 14mm; }
  body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; font-size: 11px; line-height: 1.45; margin: 0; }
  .logo { height: 48px; width: auto; display: block; margin-bottom: 10px; }
  h1 { font-size: 18px; margin: 0 0 4px; color: #333E8F; }
  h2 { font-size: 13px; color: #333E8F; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; margin: 16px 0 8px; }
  h4 { margin: 0 0 2px; font-size: 12px; }
  .muted { color: #64748b; }
  .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; margin-bottom: 8px; background: #f8fafc; page-break-inside: avoid; }
  .card-top { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; }
  .score { font-weight: 800; color: #fff; background: #333E8F; border-radius: 999px; padding: 4px 10px; font-size: 12px; white-space: nowrap; }
  ul { margin: 6px 0 0; padding-${isAr ? 'right' : 'left'}: 16px; color: #065f46; }
  .box { background: #EEF1F7; border-radius: 8px; padding: 10px; margin: 10px 0; }
  .foot { margin-top: 18px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
</style>
</head>
<body>
  <img class="logo" src="${ETAWJIHI_RECEIPT_LOGO_URL}" alt="E-TAWJIHI" />
  <h1>${esc(title)}</h1>
  <p class="muted">E-TAWJIHI${options.academicYearLabel ? ` · ${esc(options.academicYearLabel)}` : ''} · ${esc(day)}</p>
  ${
    options.profileSummary
      ? `<div class="box"><b>${isAr ? 'ملفك' : 'Votre profil'}</b><br/>${esc(options.profileSummary)}</div>`
      : ''
  }
  ${facultesBlock}
  ${tiersBlock || `<p class="muted">${isAr ? 'لا توجد توصيات.' : 'Aucune recommandation.'}</p>`}
  <div class="foot">${esc(options.studentName || '')} · ${items.length} ${isAr ? 'مؤسسة' : 'établissement(s)'}</div>
</body>
</html>`;
}
