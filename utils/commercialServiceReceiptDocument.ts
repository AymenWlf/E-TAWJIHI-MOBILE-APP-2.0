import type { UserActiveCommercialService, UserActiveCommercialTransaction } from '@/services/userActiveServices';
import {
  commercialPaymentMethodLabel,
  commercialTransactionStatusLabel,
} from '@/utils/commercialPaymentLabels';

/** Logo documents imprimés (aligné factures / reçus RDV annonceurs). */
export const ETAWJIHI_RECEIPT_LOGO_URL = 'https://cdn.e-tawjihi.ma/logo-rectantgle-simple-nobg.png';

const DOCUMENT_FOOTER = `
<div class="document-footer">
  <div class="footer-line">39, Av Lalla Yacout 1er étage, Centre ville Casablanca Maroc</div>
  <div class="footer-line">contact@e-tawjihi.ma · 06 55 69 06 32</div>
  <div class="footer-line">Capital Social : 100 000 Dhs | RC N°614025 | ICE N°003443606000048</div>
  <div class="footer-line">Raison Sociale : EDUCALOGY | Banque : Attijariwafa bank</div>
</div>`;

const RECEIPT_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.45; color: #0f172a; background: #fff; font-size: 12px; }
.doc-container { max-width: 210mm; margin: 0 auto; background: #fff; min-height: 297mm; position: relative; padding-bottom: 72px; }
.header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; padding: 24px 28px 20px; border-bottom: 2px solid #cbd5e1; margin-bottom: 24px; page-break-inside: avoid; }
.company-info { flex: 1; }
.logo { max-height: 52px; width: auto; max-width: 200px; object-fit: contain; display: block; margin-bottom: 10px; }
.company-details { color: #64748b; font-size: 11px; line-height: 1.5; }
.company-details .company-name { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 4px; }
.doc-head-right { text-align: right; flex-shrink: 0; }
.doc-title { font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; margin-bottom: 6px; }
.doc-sub { font-size: 11px; color: #64748b; line-height: 1.4; }
.doc-ref { font-size: 13px; font-weight: 600; color: #1e293b; margin-top: 8px; }
.section { margin: 0 28px 22px; page-break-inside: avoid; }
.section-title { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #e2e8f0; }
.client-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; }
.info-item { display: flex; justify-content: space-between; gap: 12px; padding: 5px 0; font-size: 11px; }
.info-label { color: #64748b; font-weight: 500; }
.info-value { color: #1e293b; font-weight: 600; text-align: right; }
.specialites-section { grid-column: 1 / -1; margin-top: 8px; padding-top: 12px; border-top: 1px solid #e2e8f0; }
.specialites-title { font-size: 12px; font-weight: 600; color: #0369a1; margin-bottom: 8px; }
.specialite-item { display: flex; gap: 8px; align-items: flex-start; background: #fff; border: 1px solid #0ea5e9; border-radius: 6px; padding: 8px 10px; margin-bottom: 6px; font-size: 11px; }
.specialite-num { width: 20px; height: 20px; border-radius: 10px; background: #0ea5e9; color: #fff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.service-table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.service-table th { background: #f1f5f9; color: #374151; font-weight: 600; text-align: left; padding: 10px 12px; font-size: 11px; border-bottom: 1px solid #e2e8f0; }
.service-table th:not(:first-child) { text-align: right; }
.service-table td { padding: 11px 12px; border-bottom: 1px solid #f1f5f9; font-size: 11px; vertical-align: top; }
.service-table td:not(:first-child) { text-align: right; font-weight: 600; }
.service-name { font-weight: 600; color: #1e293b; font-size: 12px; }
.service-desc { color: #64748b; font-size: 10px; margin-top: 3px; }
.summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.summary-header { background: #f1f5f9; padding: 12px 15px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #1e293b; }
.summary-content { padding: 14px 16px; }
.summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; }
.summary-row.total { border-top: 2px solid #e2e8f0; margin-top: 8px; padding-top: 12px; font-weight: 700; font-size: 14px; }
.summary-label { color: #64748b; }
.summary-value { font-weight: 600; color: #1e293b; }
.summary-row.total .summary-value { color: #059669; font-size: 16px; }
.status-badge { display: inline-flex; align-items: center; gap: 6px; background: #059669; color: #fff; padding: 10px 20px; border-radius: 50px; font-weight: 600; font-size: 12px; margin: 8px 28px 0; }
.status-badge.warn { background: #dc2626; }
.tx-detail-row td { padding: 0 !important; border-bottom: 1px solid #e2e8f0; background: #fafbfc; }
.tx-detail-cell { padding: 10px 12px 12px !important; vertical-align: top; }
.tx-detail-title { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
.tx-inner-table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; background: #fff; }
.tx-inner-table th { background: #f1f5f9; color: #475569; font-weight: 600; text-align: left; padding: 7px 10px; font-size: 10px; border-bottom: 1px solid #e2e8f0; }
.tx-inner-table th:last-child { text-align: right; }
.tx-inner-table td { padding: 8px 10px; font-size: 10px; border-bottom: 1px solid #f1f5f9; color: #1e293b; vertical-align: middle; }
.tx-inner-table td:last-child { text-align: right; font-weight: 700; color: #059669; white-space: nowrap; }
.tx-inner-table tr:last-child td { border-bottom: none; }
.tx-inner-table tfoot td { background: #f8fafc; font-weight: 700; font-size: 11px; border-top: 2px solid #e2e8f0; padding: 9px 10px; }
.tx-inner-table tfoot td:last-child { color: #059669; font-size: 12px; }
.tx-pill { font-size: 9px; padding: 3px 6px; border-radius: 4px; font-weight: 600; background: #d1fae5; color: #059669; display: inline-block; }
.tx-pill.pending { background: #fef3c7; color: #d97706; }
.tx-historique-block { margin-bottom: 16px; page-break-inside: avoid; }
.tx-historique-service { font-size: 12px; font-weight: 700; color: #1e293b; margin: 12px 0 8px; }
.tx-historique-grand-total { margin-top: 14px; padding: 12px 14px; background: #ecfdf5; border: 2px solid #bbf7d0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 700; color: #065f46; }
.badge-ok { background: #d1fae5; color: #059669; padding: 3px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; }
.badge-warn { background: #fee2e2; color: #dc2626; padding: 3px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; }
.document-footer { margin: 28px 28px 0; padding: 16px; border-top: 2px solid #e2e8f0; font-size: 10px; color: #64748b; text-align: center; line-height: 1.6; }
.footer-line { margin-bottom: 4px; }
@media print {
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .doc-container { min-height: auto !important; padding-bottom: 12px; }
  @page { size: A4; margin: 12mm; }
}
`;

export type CommercialReceiptClientInfo = {
  prenom: string;
  nom: string;
  telephone: string;
  email?: string;
  numeroContrat?: string;
  bacType?: string | null;
  filiere?: string | null;
  bacAnnee?: string | null;
  specialite1?: string | null;
  specialite2?: string | null;
  specialite3?: string | null;
  dateCreation?: string | null;
};

function escapeHtml(s: string | null | undefined): string {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseMoney(raw: string | null | undefined): number {
  if (raw == null || raw === '') return 0;
  const n = Number.parseFloat(String(raw).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function formatMad(n: number): string {
  return `${n.toFixed(2)} DH`;
}

function isBacMission(client: CommercialReceiptClientInfo): boolean {
  const bt = (client.bacType ?? '').toLowerCase();
  if (bt.includes('mission')) return true;
  return Boolean(client.specialite1?.trim() || client.specialite2?.trim() || client.specialite3?.trim());
}

function txIsEffectue(statut: string | null | undefined): boolean {
  const s = (statut ?? '').trim().toLowerCase();
  if (!s) return true;
  return ['effectué', 'effectue', 'effectuée', 'payé', 'paye', 'validé', 'valide'].some((x) => s.includes(x));
}

function formatTxDate(date: string | null): string {
  if (!date) return '—';
  try {
    const d = new Date(`${date}T12:00:00`);
    if (Number.isNaN(d.getTime())) return date;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return date;
  }
}

function mapServiceForReceipt(svc: UserActiveCommercialService) {
  const prix = parseMoney(svc.montantTotal ?? svc.prix);
  const totalPaye = parseMoney(svc.montantPaye ?? svc.totalPaye);
  const reste = parseMoney(svc.resteAPayer);
  return { svc, prix, totalPaye, reste, complete: svc.paymentComplete ?? reste < 0.01 };
}

function sumTransactionAmounts(txs: UserActiveCommercialTransaction[]): {
  all: number;
  effectue: number;
} {
  let all = 0;
  let effectue = 0;
  for (const tx of txs) {
    const amt = parseMoney(tx.montant);
    all += amt;
    if (txIsEffectue(tx.statut)) {
      effectue += amt;
    }
  }
  return { all, effectue };
}

function buildTransactionTableRows(txs: UserActiveCommercialTransaction[]): string {
  return txs
    .map((tx, index) => {
      const effectue = txIsEffectue(tx.statut);
      const moyen = escapeHtml(commercialPaymentMethodLabel(tx.moyen));
      const statut = escapeHtml(commercialTransactionStatusLabel(tx.statut));
      const statutUpper = effectue ? 'EFFECTUÉ' : statut.toUpperCase() || 'EN ATTENTE';
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(formatTxDate(tx.date))}</td>
          <td>${moyen}</td>
          <td><span class="tx-pill ${effectue ? '' : 'pending'}">${escapeHtml(statutUpper)}</span></td>
          <td>${escapeHtml(formatMad(parseMoney(tx.montant)))}</td>
        </tr>`;
    })
    .join('');
}

function buildTransactionTableFooter(
  txs: UserActiveCommercialTransaction[],
  servicePaid: number,
): string {
  const { all, effectue } = sumTransactionAmounts(txs);
  const rows: string[] = [];

  rows.push(`
    <tr>
      <td colspan="4">Total des transactions (${txs.length})</td>
      <td>${escapeHtml(formatMad(all))}</td>
    </tr>`);

  if (Math.abs(effectue - all) > 0.009) {
    rows.push(`
    <tr>
      <td colspan="4">Dont montants effectués</td>
      <td>${escapeHtml(formatMad(effectue))}</td>
    </tr>`);
  }

  if (servicePaid > 0.009 && Math.abs(servicePaid - effectue) > 0.009) {
    rows.push(`
    <tr>
      <td colspan="4">Total payé retenu (service)</td>
      <td>${escapeHtml(formatMad(servicePaid))}</td>
    </tr>`);
  }

  return rows.join('');
}

/** Détail des paiements sous la ligne service (une ou plusieurs transactions). */
function buildServiceTransactionsDetailRow(
  svc: UserActiveCommercialService,
  servicePaid: number,
): string {
  const txs = svc.transactions ?? [];
  if (txs.length === 0) return '';

  const title =
    txs.length > 1
      ? `Détail des paiements (${txs.length} transactions)`
      : 'Détail du paiement';

  return `
    <tr class="tx-detail-row">
      <td colspan="5" class="tx-detail-cell">
        <div class="tx-detail-title">${escapeHtml(title)}</div>
        <table class="tx-inner-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Moyen de paiement</th>
              <th>Statut</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            ${buildTransactionTableRows(txs)}
          </tbody>
          <tfoot>
            ${buildTransactionTableFooter(txs, servicePaid)}
          </tfoot>
        </table>
      </td>
    </tr>`;
}

function buildTransactionsHistorySection(services: UserActiveCommercialService[]): string {
  const blocks: string[] = [];
  let grandTotal = 0;
  let grandEffectue = 0;
  let txCount = 0;

  for (const svc of services) {
    const txs = svc.transactions ?? [];
    if (txs.length === 0) continue;

    const servicePaid = parseMoney(svc.montantPaye ?? svc.totalPaye);
    const { all, effectue } = sumTransactionAmounts(txs);
    grandTotal += all;
    grandEffectue += effectue;
    txCount += txs.length;

    blocks.push(`
      <div class="tx-historique-block">
        <div class="tx-historique-service">${escapeHtml(svc.serviceName)}</div>
        <table class="tx-inner-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Moyen de paiement</th>
              <th>Statut</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            ${buildTransactionTableRows(txs)}
          </tbody>
          <tfoot>
            ${buildTransactionTableFooter(txs, servicePaid)}
          </tfoot>
        </table>
      </div>`);
  }

  if (blocks.length === 0) {
    return '<p style="color:#94a3b8;font-size:11px">Aucune transaction enregistrée.</p>';
  }

  const grandTotalHtml =
    txCount > 1 || services.filter((s) => (s.transactions?.length ?? 0) > 0).length > 1
      ? `
    <div class="tx-historique-grand-total">
      <span>Total général des transactions (${txCount})</span>
      <span>${escapeHtml(formatMad(grandTotal))}</span>
    </div>
    ${
      Math.abs(grandEffectue - grandTotal) > 0.009
        ? `<div class="summary-row" style="margin-top:8px;padding:0 4px"><span class="summary-label">Dont montants effectués</span><span class="summary-value">${escapeHtml(formatMad(grandEffectue))}</span></div>`
        : ''
    }`
      : '';

  return blocks.join('') + grandTotalHtml;
}

/**
 * HTML reçu de paiement (style documents RDV / factures E-TAWJIHI).
 */
export function buildCommercialServiceReceiptHtml(
  client: CommercialReceiptClientInfo,
  services: UserActiveCommercialService[],
): string {
  const emitted = new Date();
  const emittedLabel = emitted.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const mapped = services.map(mapServiceForReceipt);
  const totalAmount = mapped.reduce((s, m) => s + m.prix, 0);
  const totalPaid = mapped.reduce((s, m) => s + m.totalPaye, 0);
  const resteAPayer = Math.max(0, totalAmount - totalPaid);
  const totalHT = totalPaid / 1.2;
  const totalTVA = totalPaid - totalHT;
  const allComplete = resteAPayer < 0.01;

  const contractRef =
    client.numeroContrat?.trim() ||
    services.find((s) => s.numeroContrat)?.numeroContrat?.trim() ||
    `ETAW-${services[0]?.id ?? '001'}`;

  const bacMission = isBacMission(client);
  const fullName = `${client.prenom} ${client.nom}`.trim();

  const serviceRows = mapped
    .map(({ svc, prix, totalPaye, reste, complete }) => {
      const resteVal = Math.max(0, reste);
      const txs = svc.transactions ?? [];
      const txHint =
        txs.length > 1
          ? `${txs.length} paiements détaillés ci-dessous`
          : txs.length === 1
            ? '1 paiement détaillé ci-dessous'
            : '';
      return `
        <tr>
          <td>
            <div class="service-name">${escapeHtml(svc.serviceName)}</div>
            <div class="service-desc">Payé : ${escapeHtml(formatMad(totalPaye))}${txHint ? ` · ${escapeHtml(txHint)}` : ''}</div>
          </td>
          <td>${escapeHtml(formatMad(prix))}</td>
          <td style="color:#059669">${escapeHtml(formatMad(totalPaye))}</td>
          <td style="color:${resteVal > 0 ? '#dc2626' : '#059669'}">${escapeHtml(formatMad(resteVal))}</td>
          <td>${complete ? '<span class="badge-ok">COMPLET</span>' : '<span class="badge-warn">NON COMPLET</span>'}</td>
        </tr>
        ${buildServiceTransactionsDetailRow(svc, totalPaye)}`;
    })
    .join('');

  const specialitesHtml = bacMission
    ? `
    <div class="specialites-section">
      <div class="specialites-title">Spécialités — Baccalauréat Mission</div>
      ${client.specialite1 ? `<div class="specialite-item"><span class="specialite-num">1</span><span>${escapeHtml(client.specialite1)}</span></div>` : ''}
      ${client.specialite2 ? `<div class="specialite-item"><span class="specialite-num">2</span><span>${escapeHtml(client.specialite2)}</span></div>` : ''}
      ${client.specialite3 ? `<div class="specialite-item"><span class="specialite-num">3</span><span>${escapeHtml(client.specialite3)} <em>(optionnelle)</em></span></div>` : ''}
    </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <title>Reçu de paiement — ${escapeHtml(contractRef)}</title>
  <style>${RECEIPT_STYLES}</style>
</head>
<body>
  <div class="doc-container">
    <header class="header">
      <div class="company-info">
        <img src="${ETAWJIHI_RECEIPT_LOGO_URL}" alt="E-TAWJIHI" class="logo" />
        <div class="company-details">
          <div class="company-name">E-Tawjihi</div>
          <div>Plateforme et bureau d'orientation scolaire et universitaire</div>
          <div>Maarif 07 Rue Manaaziz, Casablanca Maroc</div>
        </div>
      </div>
      <div class="doc-head-right">
        <div class="doc-title">REÇU DE PAIEMENT</div>
        <div class="doc-sub">Document émis depuis votre espace client</div>
        <div class="doc-ref">N° ${escapeHtml(contractRef)}</div>
        <div class="doc-sub" style="margin-top:6px">Date d'émission : <strong>${escapeHtml(emittedLabel)}</strong></div>
      </div>
    </header>

    <div class="section">
      <div class="section-title">Informations client</div>
      <div class="client-grid">
        <div class="info-item"><span class="info-label">Nom complet</span><span class="info-value">${escapeHtml(fullName || '—')}</span></div>
        <div class="info-item"><span class="info-label">Téléphone</span><span class="info-value">${escapeHtml(client.telephone || '—')}</span></div>
        ${client.email ? `<div class="info-item"><span class="info-label">E-mail</span><span class="info-value">${escapeHtml(client.email)}</span></div>` : ''}
        <div class="info-item"><span class="info-label">N° de contrat</span><span class="info-value">${escapeHtml(contractRef)}</span></div>
        <div class="info-item"><span class="info-label">Type de Bac</span><span class="info-value">${bacMission ? 'Bac Mission' : 'Bac Marocain'}</span></div>
        ${!bacMission && client.filiere ? `<div class="info-item"><span class="info-label">Filière</span><span class="info-value">${escapeHtml(client.filiere)}${client.bacAnnee ? ` · ${escapeHtml(client.bacAnnee)}` : ''}</span></div>` : ''}
        ${bacMission && client.bacAnnee ? `<div class="info-item"><span class="info-label">Année</span><span class="info-value">${escapeHtml(client.bacAnnee)}</span></div>` : ''}
        ${specialitesHtml}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Détails des services</div>
      <table class="service-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Montant TTC</th>
            <th>Total payé</th>
            <th>Reste</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          ${serviceRows}
          <tr style="background:#f1f5f9;font-weight:700">
            <td>TOTAL</td>
            <td>${escapeHtml(formatMad(totalAmount))}</td>
            <td style="color:#059669">${escapeHtml(formatMad(totalPaid))}</td>
            <td style="color:${resteAPayer > 0 ? '#dc2626' : '#059669'}">${escapeHtml(formatMad(resteAPayer))}</td>
            <td>${allComplete ? '<span class="badge-ok">COMPLET</span>' : '<span class="badge-warn">NON COMPLET</span>'}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="summary-box">
        <div class="summary-header">Récapitulatif des paiements</div>
        <div class="summary-content">
          <div class="summary-row"><span class="summary-label">Montant TTC des services</span><span class="summary-value">${escapeHtml(formatMad(totalAmount))}</span></div>
          <div class="summary-row"><span class="summary-label">Total HT payé</span><span class="summary-value">${escapeHtml(formatMad(totalHT))}</span></div>
          <div class="summary-row"><span class="summary-label">TVA (20 %) payée</span><span class="summary-value">${escapeHtml(formatMad(totalTVA))}</span></div>
          <div class="summary-row total"><span class="summary-label">TOTAL TTC PAYÉ</span><span class="summary-value">${escapeHtml(formatMad(totalPaid))}</span></div>
          ${resteAPayer > 0.01 ? `<div class="summary-row" style="margin-top:10px"><span class="summary-label" style="color:#dc2626">Reste à payer</span><span class="summary-value" style="color:#dc2626">${escapeHtml(formatMad(resteAPayer))}</span></div>` : ''}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Historique des transactions par service</div>
      ${buildTransactionsHistorySection(services)}
    </div>

    <div style="text-align:center;margin:20px 28px">
      <span class="status-badge ${allComplete ? '' : 'warn'}">
        ${allComplete ? '✓ PAIEMENT EFFECTUÉ' : `! RESTE À PAYER : ${escapeHtml(formatMad(resteAPayer))}`}
      </span>
    </div>

    ${DOCUMENT_FOOTER}
  </div>
</body>
</html>`;
}
