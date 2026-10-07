import { ETAWJIHI_RECEIPT_LOGO_URL } from '@/utils/commercialServiceReceiptDocument';
import type { OrientationReport, RiasecLetter } from '@/features/orientationDiagnostic/types/orientationDiagnosticPrototype';
import { localizeRiasecLabel } from '@/features/orientationDiagnostic/data/orientationDiagnosticI18n';
import type { OrientationUiLocale } from '@/features/orientationDiagnostic/data/orientationDiagnosticI18n';
import {
  localizeDiagnosticLabel,
  localizeFamilyLabel,
  localizeForceLine,
  localizeProfileSentence,
  localizeProfileTitle,
  localizeReportPhrase,
  localizeTierLabel,
  reportAmbitionLabel,
  reportFamilyTierLabel,
  reportFunctioningLabels,
} from '@/features/orientationDiagnostic/utils/orientationDiagnosticReportLocale';
import { partitionFacultePublique } from '@/features/orientationDiagnostic/utils/orientationFacultePubliqueGroup';

const RIASEC: RiasecLetter[] = ['R', 'I', 'A', 'S', 'E', 'C'];

function esc(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function bar(pct: number, color = '#2fce94'): string {
  const w = Math.max(0, Math.min(100, Math.round(pct)));
  return `<div class="bar"><span style="width:${w}%;background:${color}"></span></div>`;
}

/**
 * HTML imprimable du rapport d’orientation (PDF via expo-print).
 */
export function buildOrientationDiagnosticReportHtml(
  report: OrientationReport,
  uiLocale: OrientationUiLocale = 'fr',
): string {
  const isAr = uiLocale === 'ar';
  const title = localizeProfileTitle(report.profileTitle, uiLocale);
  const sentence = localizeProfileSentence(report, uiLocale);
  const diag = localizeDiagnosticLabel(report.diagnosticLabel, uiLocale);
  const s = report.scores;
  const fn = reportFunctioningLabels(uiLocale);
  const { facultes, others } = partitionFacultePublique(report.ecolesRecommandees ?? []);
  const schools = [...others.slice(0, 15), ...(facultes.length ? facultes.slice(0, 8) : [])];

  const identity = [
    [isAr ? 'التلميذ' : 'Élève', report.studentSummary.fullName],
    [isAr ? 'المستوى' : 'Niveau', report.studentSummary.studyLevel],
    [isAr ? 'البكالوريا' : 'Bac', report.studentSummary.bacLabel],
    [isAr ? 'المدن' : 'Villes', report.studentSummary.city],
    [isAr ? 'النقط' : 'Notes', report.studentSummary.notesLabel],
  ]
    .filter(([, v]) => v?.trim())
    .map(
      ([k, v]) =>
        `<div class="kv"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`,
    )
    .join('');

  const riasecBars = RIASEC.map(
    (L) =>
      `<div class="row"><b>${L}</b> <span>${esc(localizeRiasecLabel(L, uiLocale))}</span>${bar(s.riasecConsolide[L], '#333E8F')}<em>${s.riasecConsolide[L]}%</em></div>`,
  ).join('');

  const functioning = Object.keys(fn)
    .map((key) => {
      const value = (s.functioning as Record<string, number>)[key] ?? 0;
      return `<div class="chip"><strong>${value}%</strong><span>${esc(fn[key] ?? key)}</span></div>`;
    })
    .join('');

  const ambitions = report.moteursOrdered
    .map(
      (m) =>
        `<div class="row"><span>${esc(reportAmbitionLabel(m.key, m.label, uiLocale))}</span>${bar(m.score)}<em>${m.score}%</em></div>`,
    )
    .join('');

  const forces = report.forces
    .map((f) => `<li class="ok">+ ${esc(localizeForceLine(f, uiLocale, report.dominante))}</li>`)
    .join('');
  const vigilances = report.vigilances
    .map((f) => `<li class="warn">! ${esc(localizeReportPhrase(f, uiLocale))}</li>`)
    .join('');

  const families = report.families
    .slice(0, 8)
    .map((f) => {
      const label =
        localizeFamilyLabel(f.id, uiLocale) ||
        localizeFamilyLabel(f.label, uiLocale) ||
        f.label;
      return `<tr><td>${esc(label)}<br/><small>${esc(reportFamilyTierLabel(f.tier, uiLocale))}</small></td><td class="num">${f.score}%</td></tr>`;
    })
    .join('');

  const metiers = report.metiers
    .slice(0, 10)
    .map(
      (m) =>
        `<tr><td>${esc(localizeReportPhrase(m.label, uiLocale))}</td><td class="num">${m.score}%</td></tr>`,
    )
    .join('');

  const schoolRows = schools
    .map((ec) => {
      const nom =
        ec.nomArabe && ec.nomArabe !== ec.nom ? `${ec.nom} · ${ec.nomArabe}` : ec.nom;
      const reasons = (ec.reasonsYes ?? [])
        .slice(0, 2)
        .map((r) => `<li>+ ${esc(localizeReportPhrase(r, uiLocale))}</li>`)
        .join('');
      return `<div class="school"><h4>${esc(nom)}</h4><p>${esc(ec.ville)} · ${esc(localizeTierLabel(ec.tier, uiLocale))} · <b>${ec.combinedScore}%</b></p><ul>${reasons}</ul></div>`;
    })
    .join('');

  const strategie = (report.ecolesStrategie ?? [])
    .map((line) => `<li>${esc(localizeReportPhrase(line, uiLocale))}</li>`)
    .join('');

  const day = new Date().toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR');

  return `<!DOCTYPE html>
<html lang="${isAr ? 'ar' : 'fr'}" dir="${isAr ? 'rtl' : 'ltr'}">
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 14mm; }
  body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; font-size: 11px; line-height: 1.45; margin: 0; }
  .logo { height: 48px; width: auto; display: block; margin-bottom: 10px; }
  h1 { font-size: 18px; margin: 0 0 6px; color: #333E8F; }
  h2 { font-size: 13px; color: #333E8F; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; margin: 18px 0 8px; }
  h4 { margin: 0 0 4px; font-size: 12px; }
  .muted { color: #64748b; }
  .hero { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; margin-bottom: 12px; }
  .snap { display: flex; gap: 8px; margin: 10px 0 14px; }
  .snap > div { flex: 1; background: #EEF1F7; border-radius: 8px; padding: 8px; }
  .snap strong { display: block; font-size: 14px; color: #333E8F; }
  .kv { display: flex; justify-content: space-between; gap: 12px; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
  .k { color: #64748b; } .v { font-weight: 700; text-align: ${isAr ? 'left' : 'right'}; }
  .row { display: grid; grid-template-columns: ${isAr ? '28px 1fr 52px 36px' : '28px 1fr 1fr 36px'}; gap: 6px; align-items: center; margin: 4px 0; }
  .bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
  .bar > span { display: block; height: 100%; }
  .chip { display: inline-block; width: 31%; vertical-align: top; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px; margin: 0 1% 6px 0; text-align: center; box-sizing: border-box; }
  .chip span { display: block; color: #64748b; font-size: 10px; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 6px 4px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  td.num { text-align: ${isAr ? 'left' : 'right'}; font-weight: 800; color: #333E8F; white-space: nowrap; }
  ul { margin: 0; padding-${isAr ? 'right' : 'left'}: 16px; }
  li.ok { color: #065f46; } li.warn { color: #9a3412; }
  .school { border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; margin-bottom: 8px; background: #f8fafc; }
  .foot { margin-top: 20px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
</style>
</head>
<body>
  <img class="logo" src="${ETAWJIHI_RECEIPT_LOGO_URL}" alt="E-TAWJIHI" />
  <div class="hero">
    <div class="muted">${esc(diag)}</div>
    <h1>${esc(title)}</h1>
    <p>${esc(sentence)}</p>
  </div>
  <div class="snap">
    <div><span class="muted">RIASEC</span><strong>${esc(s.codeConsolide || '—')}</strong></div>
    <div><span class="muted">${isAr ? 'الطموح' : 'Ambition'}</span><strong>${s.ambitionGlobale}%</strong></div>
    <div><span class="muted">${isAr ? 'القابلية' : 'Faisabilité'}</span><strong>${s.faisabilite}%</strong></div>
  </div>
  <h2>${isAr ? 'الهوية' : 'Identité'}</h2>
  ${identity}
  <h2>RIASEC</h2>
  ${riasecBars}
  <h2>${isAr ? 'أسلوب العمل' : 'Fonctionnement'}</h2>
  ${functioning}
  <h2>${isAr ? 'المحركات' : 'Ambitions'}</h2>
  ${ambitions}
  <h2>${isAr ? 'نقاط القوة' : 'Forces'}</h2>
  <ul>${forces}</ul>
  <h2>${isAr ? 'نقاط اليقظة' : 'Vigilances'}</h2>
  <ul>${vigilances}</ul>
  <h2>${isAr ? 'عائلات المهن' : 'Familles professionnelles'}</h2>
  <table>${families}</table>
  <h2>${isAr ? 'المهن' : 'Métiers'}</h2>
  <table>${metiers}</table>
  <h2>${isAr ? 'المدارس' : 'Écoles recommandées'}</h2>
  ${schoolRows || `<p class="muted">${isAr ? 'لا توجد توصيات بعد.' : 'Aucune recommandation.'}</p>`}
  ${strategie ? `<h2>${isAr ? 'استراتيجية' : 'Stratégie'}</h2><ul>${strategie}</ul>` : ''}
  ${
    report.filieresSuggest?.length
      ? `<p><b>${isAr ? 'مسارات مقترحة' : 'Filières suggérées'} :</b> ${esc(report.filieresSuggest.join(' · '))}</p>`
      : ''
  }
  <div class="foot">E-TAWJIHI · ${esc(day)} · ${esc(report.studentSummary.fullName || '')}</div>
</body>
</html>`;
}
