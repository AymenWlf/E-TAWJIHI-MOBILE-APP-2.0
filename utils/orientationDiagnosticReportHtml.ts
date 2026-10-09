import { getEstablishmentLogoUrl } from '@/constants/establishmentMedia';
import { ETAWJIHI_RECEIPT_LOGO_URL } from '@/utils/commercialServiceReceiptDocument';
import { tOd, type OrientationUiLocale } from '@/features/orientationDiagnostic/data/orientationDiagnosticI18n';
import { RIASEC_LABELS } from '@/features/orientationDiagnostic/data/orientationDiagnosticQuestions';
import type {
  FunctioningScores,
  OrientationReport,
  RiasecLetter,
} from '@/features/orientationDiagnostic/types/orientationDiagnosticPrototype';
import {
  localizeProfileSentence,
  localizeProfileTitle,
  localizeReportPhrase,
  reportMetierBilingualLines,
} from '@/features/orientationDiagnostic/utils/orientationDiagnosticReportLocale';

/**
 * HTML du PDF mobile — même document que le rapport imprimable web
 * (`OrientationDiagnosticPrintableReport`).
 */

const BRAND = {
  name: 'E-Tawjihi',
  domain: 'E-TAWJIHI.ma',
  logo: ETAWJIHI_RECEIPT_LOGO_URL,
  registerUrl: 'https://e-tawjihi.ma/register',
};

const FUNCTIONING_LABELS: { key: keyof FunctioningScores; label: string }[] = [
  { key: 'autonomie', label: 'Autonomie' },
  { key: 'leadership', label: 'Leadership' },
  { key: 'analyse', label: 'Analyse' },
  { key: 'contactHumain', label: 'Contact humain' },
  { key: 'structure', label: 'Besoin de structure' },
  { key: 'creativite', label: 'Créativité' },
  { key: 'action', label: 'Action' },
  { key: 'incertitude', label: 'Tolérance incertitude' },
  { key: 'pratique', label: 'Pratique' },
  { key: 'collaboration', label: 'Collaboration' },
  { key: 'variete', label: 'Besoin de variété' },
];

const PRINT_CSS = `
@page { size: A4; margin: 1.5cm; }
html, body {
  width: 210mm;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11pt;
  line-height: 1.3;
  color: #333;
  margin: 0;
  padding: 0;
  background: #fff !important;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}
.print-only { display: block !important; position: relative; }
.page-break { page-break-before: always; }
.no-break, .avoid-break { page-break-inside: avoid; break-inside: avoid; }
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.header-logo { height: 100px; margin-bottom: 5px; }
.section { margin-bottom: 15px; break-inside: avoid; }
.section-title {
  font-size: 14pt;
  font-weight: bold;
  margin-bottom: 10px;
  color: #2563eb;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 5px;
}
.card {
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  margin-bottom: 10px;
  background-color: #f9fafb;
}
.text-primary { color: #2563eb; }
.text-secondary { color: #4b5563; }
.text-sm { font-size: 9pt; }
.bar-container {
  height: 10px;
  background-color: #e5e7eb;
  border-radius: 5px;
  margin-top: 5px;
}
.bar { height: 10px; border-radius: 5px; }
.bar-riasec { background-color: #8b5cf6; }
.bar-personality { background-color: #10b981; }
.bar-aptitude { background-color: #f59e0b; }
.bar-interest { background-color: #3b82f6; }
.watermark {
  position: fixed;
  top: 50%;
  left: 0;
  width: 100%;
  text-align: center;
  opacity: 0.1;
  transform: rotate(-45deg);
  font-size: 100pt;
  font-weight: bold;
  z-index: -1;
  white-space: nowrap;
  pointer-events: none;
}
.official-stamp {
  position: absolute;
  top: 120px;
  right: 40px;
  transform: rotate(-12deg);
  color: rgba(220, 38, 38, 0.2);
  font-size: 32pt;
  font-weight: bold;
  border: 6px solid rgba(220, 38, 38, 0.2);
  padding: 12px 24px;
  text-transform: uppercase;
  white-space: nowrap;
  border-radius: 8px;
  letter-spacing: 1px;
  z-index: 10;
  pointer-events: none;
}
.footer {
  position: fixed;
  bottom: 12px;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 9pt;
  color: #6b7280;
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}
.info-cell {
  background: white;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #bfdbfe;
}
.info-cell .k { font-size: 9pt; color: #6b7280; margin-bottom: 3px; }
.info-cell .v { font-size: 11pt; font-weight: bold; color: #1e40af; }
.chip-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.chip {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 9pt;
  background: #eff6ff;
  border: 1px solid #93c5fd;
  color: #1e40af;
}
.bli { display: block; line-height: 1.25; }
.bli__ar {
  display: block;
  font-size: 0.9em;
  color: #64748b;
  direction: rtl;
  unicode-bidi: isolate;
  font-family: 'Cairo', 'Noto Naskh Arabic', Tahoma, Arial, sans-serif;
}
.list-plain { margin: 0; padding-left: 18px; }
.list-plain li { margin-bottom: 4px; font-size: 10pt; }
.score-row { margin-bottom: 8px; }
.score-row-head {
  display: flex;
  justify-content: space-between;
  font-size: 10pt;
  margin-bottom: 2px;
}
.func-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.func-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  padding: 8px;
  text-align: center;
}
.func-item strong { display: block; font-size: 12pt; color: #2563eb; }
.func-item span { font-size: 8pt; color: #6b7280; }
.family-row, .metier-row, .school-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  margin-bottom: 6px;
  font-size: 10pt;
}
.school-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
  flex-shrink: 0;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  padding: 2px;
}
.school-rank {
  flex-shrink: 0;
  min-width: 28px;
  height: 22px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #333e8f;
  color: #fff;
  font-size: 9pt;
  font-weight: 800;
  line-height: 1;
}
.tier-forte { color: #059669; font-weight: bold; font-size: 9pt; }
.tier-bonne { color: #2563eb; font-weight: bold; font-size: 9pt; }
.tier-exploratoire { color: #d97706; font-weight: bold; font-size: 9pt; }
.diag-box {
  background: #eff6ff;
  border: 1px solid #93c5fd;
  border-radius: 5px;
  padding: 12px;
}
.diag-box .label {
  font-weight: bold;
  color: #1e40af;
  margin-bottom: 6px;
  font-size: 11pt;
}
.code-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.code-pill {
  background: white;
  border: 1px solid #c4b5fd;
  color: #5b21b6;
  padding: 6px 12px;
  border-radius: 5px;
  font-size: 10pt;
  font-weight: bold;
}
`;

function esc(value: string | number | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function bilingualHtml(value: string): string {
  const cityMatch = value.match(/^(.*?)(\s*\([^)]+\))$/);
  const core = cityMatch ? cityMatch[1] : value;
  const suffix = cityMatch ? cityMatch[2] : '';
  const idx = core.indexOf(' · ');
  if (idx > 0) {
    return `<span class="bli"><span>${esc(core.slice(0, idx))}${esc(suffix)}</span><span class="bli__ar" lang="ar" dir="rtl">${esc(core.slice(idx + 3))}</span></span>`;
  }
  return esc(value);
}

function metierBilingualValue(id: string, fallback: string): string {
  const lines = reportMetierBilingualLines(id, fallback, 'fr');
  return lines.secondary ? `${lines.primary} · ${lines.secondary}` : lines.primary;
}

function printSchoolLogo(logo: string | null | undefined, name: string): string {
  const url = logo ? getEstablishmentLogoUrl(logo) : '';
  if (url) return url;
  const label = (name.split(' · ')[0] || name || 'Ecole').slice(0, 20);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(label || 'Ecole')}&background=333e8f&color=fff&size=128&bold=true`;
}

function scoreBar(label: string, value: number, barClass: string): string {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return `<div class="score-row"><div class="score-row-head"><span>${esc(label)}</span><strong class="text-primary">${pct}%</strong></div><div class="bar-container"><div class="bar ${barClass}" style="width:${pct}%"></div></div></div>`;
}

function tierClass(tier: string): string {
  if (tier === 'forte') return 'tier-forte';
  if (tier === 'bonne') return 'tier-bonne';
  return 'tier-exploratoire';
}

function tierText(tier: string): string {
  if (tier === 'forte') return 'Très forte compatibilité';
  if (tier === 'bonne') return 'Bonne compatibilité';
  return 'À explorer';
}

export function buildOrientationDiagnosticReportHtml(
  report: OrientationReport,
  uiLocale: OrientationUiLocale = 'fr',
): string {
  const isAr = uiLocale === 'ar';
  const t = (key: string) => tOd(uiLocale, key);
  const s = report.scores;
  const letters: RiasecLetter[] = ['R', 'I', 'A', 'S', 'E', 'C'];
  const ordered = [...letters].sort((a, b) => s.riasecConsolide[b] - s.riasecConsolide[a]);
  const formatDate = () =>
    new Date().toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  const fullName = report.studentSummary.fullName || 'Élève';
  const topSchools = (report.ecolesRecommandees ?? []).slice(0, 12);
  const topMetiers = report.metiers.slice(0, 10);
  const dateLabel = formatDate();

  const identity = (
    [
      [isAr ? 'الاسم الكامل' : 'Nom complet', report.studentSummary.fullName],
      [isAr ? 'المستوى' : 'Niveau', report.studentSummary.studyLevel],
      [isAr ? 'الباك والشعبة' : 'Bac / filière', report.studentSummary.bacLabel],
      [isAr ? 'مدن الدراسة' : 'Villes d’études', report.studentSummary.city],
      [isAr ? 'النقط' : 'Notes', report.studentSummary.notesLabel],
      [isAr ? 'رمز RIASEC' : 'Code RIASEC', s.codeConsolide],
    ] as const
  )
    .map(
      ([k, v]) =>
        `<div class="info-cell"><div class="k">${esc(k)}</div><div class="v">${esc(v || '—')}</div></div>`,
    )
    .join('');

  const gapBlocks = ordered
    .slice(0, 3)
    .map((L) => {
      const d = s.riasecDeclare[L];
      const c = s.riasecComportemental[L];
      const delta = Math.round(c - d);
      const deltaLabel =
        Math.abs(delta) < 8
          ? 'Discours et comportement proches'
          : delta > 0
            ? `Tu te comportes plus « ${RIASEC_LABELS[L]} » que tu ne le déclares`
            : `Tu déclares plus « ${RIASEC_LABELS[L]} » que tu ne le montres en situation`;
      const deltaColor = Math.abs(delta) < 8 ? '#6b7280' : delta > 0 ? '#059669' : '#d97706';
      return `<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;gap:8px;font-size:10pt;font-weight:bold;margin-bottom:4px"><span>${esc(L)} · ${esc(RIASEC_LABELS[L])}</span><span style="color:${deltaColor};font-size:8.5pt;font-weight:700;text-align:right;max-width:58%">${esc(deltaLabel)}</span></div>${scoreBar('Ce que tu déclares', d, 'bar-personality')}${scoreBar('Ce que tu choisis en situation', c, 'bar-interest')}</div>`;
    })
    .join('');

  const functioning = FUNCTIONING_LABELS.map(
    ({ key, label }) =>
      `<div class="func-item"><strong>${s.functioning[key]}%</strong><span>${esc(label)}</span></div>`,
  ).join('');

  const ambitions = report.moteursOrdered
    .map((m) => scoreBar(m.label, m.score, 'bar-personality'))
    .join('');

  const families = report.families
    .map(
      (f) =>
        `<div class="family-row avoid-break"><div><div style="font-weight:bold">${esc(f.label)}</div><div class="${tierClass(f.tier)}">${esc(tierText(f.tier))}</div>${f.why ? `<div class="text-sm text-secondary" style="margin-top:3px">${esc(f.why)}</div>` : ''}</div><strong class="text-primary">${f.score}%</strong></div>`,
    )
    .join('');

  const sectorChips = report.preferences.sectors
    .map((sec) => `<span class="chip">${bilingualHtml(sec)}</span>`)
    .join('');
  const metierChips = report.preferences.metiers
    .map((m) => `<span class="chip">${bilingualHtml(m)}</span>`)
    .join('');

  const prefSchools = report.preferences.ecoles
    .map((e) => {
      const cities = e.villes?.length ? e.villes.join(' · ') : e.ville || '';
      const diplomes = (e.diplomes ?? []).slice(0, 3).join(' · ');
      const meta = [cities, e.dureeEtudes, diplomes].filter(Boolean).join(' · ');
      const badges = [e.orientationPlan ? `Plan ${e.orientationPlan}` : null, e.admissionLabel]
        .filter(Boolean)
        .join(' · ');
      const recoLogo = (report.ecolesRecommandees ?? []).find(
        (school) => String(school.establishmentId) === e.id,
      )?.logo;
      const logo = printSchoolLogo(e.logo || recoLogo, e.label);
      const rank = e.versusRank ? `<span class="school-rank">#${e.versusRank}</span>` : '';
      return `<div class="school-row">${rank}<img class="school-logo" src="${esc(logo)}" alt="" /><span style="flex:1;min-width:0">${bilingualHtml(e.label)}${meta ? `<span class="text-sm text-secondary" style="display:block;margin-top:2px">${esc(meta)}</span>` : ''}</span><span class="text-sm text-secondary">${esc(badges)}</span></div>`;
    })
    .join('');

  const versusMetiers = report.preferences.versusRankings?.metiers ?? [];
  const versusEcoles = report.preferences.versusRankings?.ecoles ?? [];
  const versusBlock =
    versusMetiers.length || versusEcoles.length
      ? `<div class="card" style="margin-top:8px"><h3 style="font-size:11pt;font-weight:bold;margin-bottom:8px;color:#1e40af">${isAr ? 'ترتيب المواجهات' : 'Classement Versus (Coupe du monde)'}</h3>${
          versusMetiers.length
            ? `<p style="font-size:10pt;font-weight:bold;margin:0 0 4px">${esc(t('reportVersusRankMetiers'))}</p><ol style="margin:0 0 10px;padding-left:20px;font-size:10pt">${versusMetiers
                .map((r) => `<li>#${r.rank} ${bilingualHtml(r.label)}</li>`)
                .join('')}</ol>`
            : ''
        }${
          versusEcoles.length
            ? `<p style="font-size:10pt;font-weight:bold;margin:0 0 4px">${esc(t('reportVersusRankEcoles'))}</p><ol style="margin:0;padding-left:20px;font-size:10pt">${versusEcoles
                .map((r) => `<li>#${r.rank} ${bilingualHtml(r.label)}</li>`)
                .join('')}</ol>`
            : ''
        }</div>`
      : '';

  const metierRows = topMetiers
    .map(
      (m) =>
        `<div class="metier-row avoid-break"><div><div style="font-weight:bold">${bilingualHtml(metierBilingualValue(m.id, m.label))}</div><div class="text-sm text-secondary">RIASEC ${m.breakdown.riasec}% · ${esc(t('reportBdMode'))} ${m.breakdown.modeTravail}% · ${esc(t('reportBdAmbitions'))} ${m.breakdown.ambitions}% · ${esc(t('reportBdValeurs'))} ${m.breakdown.valeurs}% · ${esc(t('reportDiagFaisabilite'))} ${m.breakdown.faisabilite}%</div></div><strong class="text-primary">${m.score}%</strong></div>`,
    )
    .join('');

  const filieres = report.filieresSuggest ?? [];
  const strategie = report.ecolesStrategie ?? [];

  const schoolRows = topSchools
    .map((e) => {
      const cities = e.villes?.length ? e.villes.join(' · ') : e.ville || '';
      const diplomes = (e.diplomes ?? []).slice(0, 3).join(' · ');
      const name =
        e.nomArabe && e.nomArabe.trim() && e.nomArabe.trim() !== e.nom
          ? `${e.sigle ? `${e.sigle} — ` : ''}${e.nom} · ${e.nomArabe.trim()}`
          : `${e.sigle ? `${e.sigle} — ` : ''}${e.nom}`;
      const meta = [
        e.typeEcole,
        e.dureeEtudes,
        diplomes,
        e.orientationPlanLabel || (e.orientationPlan ? `Plan ${e.orientationPlan}` : null),
        e.admissionLabel,
        e.tierLabel,
      ]
        .filter(Boolean)
        .join(' · ');
      const logo = printSchoolLogo(e.logo, e.sigle || e.nom);
      return `<div class="school-row avoid-break"><img class="school-logo" src="${esc(logo)}" alt="" /><div style="flex:1;min-width:0"><div style="font-weight:bold">${bilingualHtml(name)}</div>${cities ? `<div class="text-sm text-secondary" style="margin-top:2px;line-height:1.4">${esc(cities)}</div>` : ''}<div class="text-sm text-secondary" style="margin-top:2px">${esc(meta)}</div></div><strong class="text-primary">${Math.round(e.combinedScore)}%</strong></div>`;
    })
    .join('');

  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(BRAND.registerUrl)}`;

  const body = `<div class="print-only" dir="${isAr ? 'rtl' : 'ltr'}">
<style>${PRINT_CSS}</style>
<div class="watermark">${esc(BRAND.domain)}</div>
<div class="official-stamp">${esc(BRAND.domain)}</div>
<div class="header-section">
  <div>
    <h1 style="font-size:18pt;font-weight:bold;color:#2563eb;margin-bottom:5px">${isAr ? 'التقرير الرسمي للتوجيه' : "Rapport Officiel d'Orientation"}</h1>
    <p class="text-secondary">${esc(fullName)} • ${isAr ? 'أُنشئ في' : 'Généré le'} ${esc(dateLabel)}</p>
    <p class="text-sm text-secondary" style="margin-top:4px">${isAr ? 'تشخيص التوجيه · الملف' : "Diagnostic d'orientation · Profil"} ${esc(s.codeConsolide || '—')}</p>
  </div>
  <img src="${BRAND.logo}" alt="${esc(BRAND.domain)}" class="header-logo" />
</div>

<div class="section no-break">
  <h2 class="section-title">${esc(t('reportSec0'))}</h2>
  <div class="card" style="background-color:#eff6ff;border:1px solid #93c5fd">
    <h3 style="font-size:11pt;font-weight:bold;margin-bottom:10px;color:#1e40af">${isAr ? 'الهوية والمسار الدراسي' : 'Identité & parcours scolaire'}</h3>
    <div class="info-grid">${identity}</div>
  </div>
</div>

<div class="section no-break">
  <h2 class="section-title">${isAr ? 'ملف التوجيه' : "Profil d'orientation"}</h2>
  <div class="card">
    <h3 style="font-size:13pt;font-weight:bold;color:#1e40af;margin:0 0 6px">${esc(localizeProfileTitle(report.profileTitle, uiLocale))}</h3>
    <p style="margin:0 0 10px;font-size:10pt;color:#4b5563">${esc(localizeProfileSentence(report, uiLocale))}</p>
    <div class="code-row">
      <span class="code-pill">${isAr ? 'ما صرّحت به' : 'Déclaré'} · ${esc(s.codeDeclare)}</span>
      <span class="code-pill">${isAr ? 'اختياراتك' : 'Comportemental'} · ${esc(s.codeComportemental)}</span>
      <span class="code-pill">${isAr ? 'النتيجة النهائية' : 'Consolidé'} · ${esc(s.codeConsolide)}</span>
    </div>
    <p style="margin:0;font-size:10pt">${isAr ? 'الغالب' : 'Dominante'} : <strong>${esc(RIASEC_LABELS[report.dominante.primary])}</strong> · ${isAr ? 'الثانوي' : 'Secondaire'} : <strong>${esc(RIASEC_LABELS[report.dominante.secondary])}</strong> · ${isAr ? 'المكمّل' : 'Complémentaire'} : <strong>${esc(RIASEC_LABELS[report.dominante.tertiary])}</strong></p>
  </div>
</div>

<div class="section">
  <h2 class="section-title">${esc(t('reportSec1'))}</h2>
  <p style="font-size:9.5pt;color:#4b5563;margin:0 0 10px;line-height:1.45">${esc(t('reportRiasecIntro'))}</p>
  <div class="info-grid" style="margin-bottom:12px">
    <div class="card" style="background-color:#ecfdf5;border:1px solid #6ee7b7;margin-bottom:0">
      <h3 style="font-size:10pt;font-weight:bold;margin:0 0 4px;color:#047857">${esc(t('reportLayer1Title'))} · ${esc(s.codeDeclare)}</h3>
      <p style="margin:0;font-size:9pt;color:#374151">${esc(t('reportLayer1Body'))}</p>
    </div>
    <div class="card" style="background-color:#eff6ff;border:1px solid #93c5fd;margin-bottom:0">
      <h3 style="font-size:10pt;font-weight:bold;margin:0 0 4px;color:#1d4ed8">${esc(t('reportLayer2Title'))} · ${esc(s.codeComportemental)}</h3>
      <p style="margin:0;font-size:9pt;color:#374151">${esc(t('reportLayer2Body'))}</p>
    </div>
  </div>
  <div class="card" style="background-color:#f5f3ff;border:1px solid #c4b5fd;margin-bottom:12px">
    <h3 style="font-size:10pt;font-weight:bold;margin:0 0 4px;color:#5b21b6">${esc(t('reportLayer3Title'))} · ${esc(s.codeConsolide)}</h3>
    <p style="margin:0;font-size:9pt;color:#374151">${esc(t('reportLayer3Body'))} <strong>${esc(t('reportLayer3How'))}</strong></p>
  </div>
  <div class="card">
    <h3 style="font-size:11pt;font-weight:bold;margin-bottom:8px;color:#1e40af">${esc(t('reportConsolideBars'))}</h3>
    ${ordered.map((L) => scoreBar(`${L} · ${RIASEC_LABELS[L]}`, s.riasecConsolide[L], 'bar-riasec')).join('')}
  </div>
  <div class="card" style="margin-top:8px">
    <h3 style="font-size:11pt;font-weight:bold;margin-bottom:6px;color:#047857">${esc(t('reportGapTitle'))}</h3>
    <p style="font-size:9pt;color:#4b5563;margin:0 0 10px">${esc(t('reportGapHint'))}</p>
    ${gapBlocks}
  </div>
</div>

<div class="section no-break">
  <h2 class="section-title">${esc(t('reportSec2'))}</h2>
  <div class="func-grid">${functioning}</div>
</div>

<div class="section no-break">
  <h2 class="section-title">${esc(t('reportSec3'))}</h2>
  <div class="card">${ambitions}</div>
</div>

<div class="section no-break">
  <h2 class="section-title">${esc(t('reportSec4'))}</h2>
  <div class="card" style="background-color:#ecfdf5;border:1px solid #6ee7b7"><ul class="list-plain">${report.forces.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div>
</div>

<div class="section no-break">
  <h2 class="section-title">${esc(t('reportSec5'))}</h2>
  <div class="card" style="background-color:#fffbeb;border:1px solid #fcd34d"><ul class="list-plain">${report.vigilances.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div>
</div>

<div class="section">
  <h2 class="section-title">${esc(t('reportSec6'))}</h2>
  ${families}
</div>

<div class="section page-break">
  <h2 class="section-title">${isAr ? 'اختياراتك المهنية والدراسية' : 'Tes choix métiers & écoles'}</h2>
  <div class="card">
    <div class="info-grid" style="margin-bottom:10px">
      <div class="info-cell"><div class="k">${esc(t('reportStatSectors'))}</div><div class="v">${report.preferences.sectors.length}</div></div>
      <div class="info-cell"><div class="k">${esc(t('reportStatMetiers'))}</div><div class="v">${report.preferences.metiers.length}</div></div>
      <div class="info-cell"><div class="k">${esc(t('reportStatEcoles'))}</div><div class="v">${report.preferences.ecoles.length}</div></div>
      <div class="info-cell"><div class="k">${esc(t('reportStatSalary'))}</div><div class="v">${esc(report.preferences.salary || '—')}</div></div>
    </div>
    ${
      report.preferences.sectors.length
        ? `<h3 style="font-size:10pt;margin:8px 0 4px;color:#1e40af">${esc(t('reportPrefSectors'))}</h3><div class="chip-row">${sectorChips}</div>`
        : ''
    }
    ${
      report.preferences.metiers.length
        ? `<h3 style="font-size:10pt;margin:10px 0 4px;color:#1e40af">${esc(t('reportPrefMetiers'))}</h3><div class="chip-row">${metierChips}</div>`
        : ''
    }
    ${
      report.preferences.ecoles.length
        ? `<h3 style="font-size:10pt;margin:10px 0 4px;color:#1e40af">${esc(t('reportPrefEcoles'))}</h3>${prefSchools}`
        : ''
    }
  </div>
  ${versusBlock}
</div>

<div class="section">
  <h2 class="section-title">${isAr ? 'المهن الأنسب لملفك' : 'Métiers recommandés'}</h2>
  ${metierRows}
  ${
    filieres.length
      ? `<div class="card" style="margin-top:8px"><h3 style="font-size:10pt;margin:0 0 6px;color:#1e40af">${esc(t('reportFilieres'))}</h3><div class="chip-row">${filieres
          .map((f) => `<span class="chip">${esc(localizeReportPhrase(f, uiLocale))}</span>`)
          .join('')}</div></div>`
      : ''
  }
  ${
    strategie.length
      ? `<div class="card" style="margin-top:8px"><h3 style="font-size:10pt;margin:0 0 6px;color:#1e40af">${esc(t('reportStrategie'))}</h3><ul class="list-plain">${strategie
          .map((line) => `<li>${esc(localizeReportPhrase(line, uiLocale))}</li>`)
          .join('')}</ul></div>`
      : ''
  }
</div>

${
  topSchools.length
    ? `<div class="section"><h2 class="section-title">${esc(t('reportSec9'))}</h2>${schoolRows}</div>`
    : ''
}

<div class="section no-break">
  <h2 class="section-title">${esc(t('reportSec10'))}</h2>
  <div class="card">
    ${scoreBar(t('reportDiagClarte'), s.clarte, 'bar-interest')}
    ${scoreBar(t('reportDiagConnMetiers'), s.connaissanceMetiers, 'bar-interest')}
    ${scoreBar(t('reportDiagConnFormations'), s.connaissanceFormations, 'bar-interest')}
    ${scoreBar(t('reportDiagConfiance'), s.confiance, 'bar-aptitude')}
    ${scoreBar(t('reportDiagAmbition'), s.ambitionGlobale, 'bar-personality')}
    ${scoreBar(t('reportDiagFaisabilite'), s.faisabilite, 'bar-personality')}
  </div>
  <div class="diag-box" style="margin-top:10px">
    <div class="label">Profil : ${esc(report.diagnosticLabel)}</div>
    <p style="margin:0;font-size:10pt;color:#374151">${esc(report.diagnosticBody)}</p>
  </div>
</div>

<div style="margin-top:40px;display:flex;justify-content:space-between;align-items:flex-start;page-break-inside:avoid">
  <div style="display:flex;flex-direction:column;align-items:center;text-align:center;width:30%">
    <img src="https://cdn.e-tawjihi.ma/signature_aymen.png" alt="Signature Aymen Ouallaf" style="height:80px;width:auto;object-fit:contain;margin-bottom:10px" />
    <div>
      <p style="font-size:12px;font-weight:bold;margin:0;color:#1F2937">Aymen Ouallaf</p>
      <p style="font-size:10px;margin:2px 0;color:#6b7280">Directeur de la plateforme</p>
      <p style="font-size:9px;margin:0;color:#9ca3af">${esc(BRAND.name)}</p>
    </div>
  </div>
  <div style="text-align:center;flex:1;margin:0 20px">
    <img src="${BRAND.logo}" alt="${esc(BRAND.name)}" style="height:80px;width:auto;margin-bottom:10px" />
    <p style="font-size:11px;color:#6b7280;margin:5px 0">Ce rapport a été généré par la plateforme ${esc(BRAND.name)}</p>
    <p style="font-size:10px;color:#9ca3af;margin:0">Plateforme d'orientation académique et professionnelle</p>
    <p style="font-size:10px;color:#d1d5db;margin:5px 0">www.${esc(BRAND.domain.toLowerCase())}</p>
    <div style="margin-top:15px">
      <div style="background-color:white;padding:8px;border-radius:6px;border:1px solid #e5e7eb;display:inline-block;margin-bottom:8px">
        <img src="${qr}" alt="QR Code Inscription" style="width:60px;height:60px" />
      </div>
      <p style="font-size:9px;color:#6b7280;margin:2px 0">Scannez pour vous inscrire</p>
    </div>
  </div>
  <div style="display:flex;flex-direction:column;align-items:center;text-align:center;width:30%">
    <img src="https://cdn.e-tawjihi.ma/signature_fz.png" alt="Signature Responsable Orientation" style="height:80px;width:auto;object-fit:contain;margin-bottom:10px" />
    <div>
      <p style="font-size:12px;font-weight:bold;margin:0;color:#1F2937">Responsable d'Orientation</p>
      <p style="font-size:10px;margin:2px 0;color:#6b7280">Service d'Orientation</p>
      <p style="font-size:9px;margin:0;color:#9ca3af">${esc(BRAND.name)}</p>
    </div>
  </div>
</div>

<div style="border-top:1px solid #f3f4f6;margin:20px 0"></div>
<div style="text-align:center;margin-top:20px">
  <p style="font-size:10px;color:#6b7280;margin:10px 0;line-height:1.4">Ce rapport a été généré automatiquement basé sur vos réponses aux différents tests d'orientation. Il est recommandé de consulter un conseiller d'orientation pour un accompagnement personnalisé.</p>
  <div style="font-size:9px;color:#9ca3af">
    <p style="margin:5px 0">© ${new Date().getFullYear()} ${esc(BRAND.name)}. Tous droits réservés.</p>
    <p style="margin:0">Rapport confidentiel à usage personnel uniquement</p>
  </div>
</div>
<div class="footer">Rapport d'Orientation - ${esc(fullName)} - ${esc(dateLabel)}</div>
</div>`;

  return `<!DOCTYPE html>
<html lang="${isAr ? 'ar' : 'fr'}" dir="${isAr ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8" />
  <title>Rapport d'Orientation - ${esc(fullName)}</title>
</head>
<body>${body}</body>
</html>`;
}
