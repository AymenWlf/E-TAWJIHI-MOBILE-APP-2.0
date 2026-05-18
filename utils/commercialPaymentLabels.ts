/** Libellés moyens de paiement (alignés admin web). */
const MOYEN_LABELS: Record<string, string> = {
  espece: 'Espèce',
  virement: 'Virement bancaire',
  'virement-pro': 'Virement bancaire (Pro)',
  cheque: 'Chèque',
  carte: 'TPE',
  cashplus: 'Cashplus',
};

export function commercialPaymentMethodLabel(moyen: string | null | undefined): string {
  const key = (moyen ?? '').trim().toLowerCase();
  if (!key) return '—';
  return MOYEN_LABELS[key] ?? moyen.trim();
}

export function commercialTransactionStatusLabel(statut: string | null | undefined): string {
  const s = (statut ?? '').trim();
  if (!s) return 'Effectué';
  return s;
}
