/** Support transfert compte / mot de passe oublié */
export const ETAWJIHI_TRANSFER_SUPPORT_PHONE =
  process.env.EXPO_PUBLIC_ETAWJIHI_TRANSFER_SUPPORT_PHONE ?? '0655690632';

export function formatSupportPhoneDisplay(phone: string = ETAWJIHI_TRANSFER_SUPPORT_PHONE): string {
  const d = phone.replace(/\D/g, '');
  if (d.length === 10 && d.startsWith('0')) {
    return `${d.slice(0, 2)} ${d.slice(2, 4)} ${d.slice(4, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`;
  }
  return phone.trim();
}

export function supportPhoneWaDigits(phone: string = ETAWJIHI_TRANSFER_SUPPORT_PHONE): string {
  const d = phone.replace(/\D/g, '');
  if (d.startsWith('0') && d.length === 10) {
    return `212${d.slice(1)}`;
  }
  if (d.startsWith('212')) {
    return d;
  }
  return d;
}

export function buildSupportWhatsAppUrl(message: string, phone: string = ETAWJIHI_TRANSFER_SUPPORT_PHONE): string {
  return `https://wa.me/${supportPhoneWaDigits(phone)}?text=${encodeURIComponent(message)}`;
}

/** Message WhatsApp prérempli pour signaler une activité suspecte sur le compte. */
export function buildDeviceTransferSecurityWhatsAppMessage(accountPhoneDisplay: string): string {
  const phoneLine = accountPhoneDisplay.trim() || '—';
  return [
    'Bonjour,',
    '',
    `Je suis un client E-Tawjihi. Mon numéro de compte est : ${phoneLine}`,
    '',
    'Je pense qu’une activité suspecte est en cours sur mon compte. Veuillez m’aider à sécuriser mon compte et à résoudre ce problème.',
    '',
    'Merci.',
  ].join('\n');
}
