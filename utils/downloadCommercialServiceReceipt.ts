import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { UserActiveCommercialService } from '@/services/userActiveServices';

import {
  buildCommercialServiceReceiptHtml,
  type CommercialReceiptClientInfo,
} from '@/utils/commercialServiceReceiptDocument';

function parseMoney(raw: string | null | undefined): number {
  if (raw == null || raw === '') return 0;
  const n = Number.parseFloat(String(raw).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

/** Services ayant au moins un paiement enregistré (aligné admin web). */
export function filterServicesEligibleForReceipt(
  services: UserActiveCommercialService[],
): UserActiveCommercialService[] {
  return services.filter((svc) => {
    const paid = parseMoney(svc.montantPaye ?? svc.totalPaye);
    const txs = svc.transactions ?? [];
    return paid > 0.01 || txs.length > 0;
  });
}

function receiptFileName(contractRef: string): string {
  const safe = contractRef.replace(/[^\w-]+/g, '_').slice(0, 48);
  const day = new Date().toISOString().slice(0, 10);
  return `recu_paiement_${safe}_${day}.pdf`;
}

/**
 * Génère un PDF (expo-print) et ouvre le partage système (enregistrer / imprimer).
 */
export async function downloadCommercialServiceReceiptPdf(
  client: CommercialReceiptClientInfo,
  services: UserActiveCommercialService[],
): Promise<void> {
  const eligible = filterServicesEligibleForReceipt(services);
  if (eligible.length === 0) {
    throw new Error('NO_PAYMENTS');
  }

  const html = buildCommercialServiceReceiptHtml(client, eligible);
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  const contractRef =
    client.numeroContrat?.trim() ||
    eligible.find((s) => s.numeroContrat)?.numeroContrat?.trim() ||
    `ETAW-${eligible[0]?.id ?? 'client'}`;

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: receiptFileName(contractRef),
    });
    return;
  }

  throw new Error('SHARE_UNAVAILABLE');
}
