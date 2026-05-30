/** Numéro WhatsApp officiel E-Tawjihi (indicatif + pays, sans +) pour wa.me */
export const ETAWJIHI_OFFICIAL_WHATSAPP_WA_DIGITS =
  (process.env.EXPO_PUBLIC_ETAWJIHI_WHATSAPP_WA_DIGITS ?? '212784536246').replace(/\D/g, '');

/** Support / informations (bulle flottante, boutique) — 06 55 69 06 32 */
export const ETAWJIHI_SUPPORT_WHATSAPP_WA_DIGITS =
  (process.env.EXPO_PUBLIC_ETAWJIHI_SUPPORT_WHATSAPP_WA_DIGITS ?? '212655690632').replace(
    /\D/g,
    '',
  );

export function buildEtawjihiWhatsAppUrl(message: string): string {
  return `https://wa.me/${ETAWJIHI_OFFICIAL_WHATSAPP_WA_DIGITS}?text=${encodeURIComponent(message)}`;
}

export function buildEtawjihiWhatsAppNativeUrl(message: string): string {
  return `whatsapp://send?phone=${ETAWJIHI_OFFICIAL_WHATSAPP_WA_DIGITS}&text=${encodeURIComponent(message)}`;
}

export function buildEtawjihiSupportWhatsAppUrl(message: string): string {
  return `https://wa.me/${ETAWJIHI_SUPPORT_WHATSAPP_WA_DIGITS}?text=${encodeURIComponent(message)}`;
}

export function buildEtawjihiSupportWhatsAppNativeUrl(message: string): string {
  return `whatsapp://send?phone=${ETAWJIHI_SUPPORT_WHATSAPP_WA_DIGITS}&text=${encodeURIComponent(message)}`;
}

/** Affichage lisible d’un numéro national 10 chiffres (06…). */
/** Affichage du numéro officiel E-Tawjihi (ex. +212 784-536-246). */
export function formatEtawjihiOfficialWhatsAppDisplay(): string {
  const d = ETAWJIHI_OFFICIAL_WHATSAPP_WA_DIGITS;
  if (d.startsWith('212') && d.length >= 12) {
    const rest = d.slice(3, 12);
    return `+212 ${rest.slice(0, 3)}-${rest.slice(3)}`;
  }
  return d.startsWith('+') ? d : `+${d}`;
}

export function formatMoroccoPhoneDisplay(phone: string): string {
  let d = phone.replace(/\D/g, '');
  if (d.startsWith('212') && d.length >= 12) {
    d = `0${d.slice(3, 12)}`;
  } else if (!d.startsWith('0') && d.length === 9) {
    d = `0${d}`;
  }
  if (d.length === 10) {
    return `${d.slice(0, 2)} ${d.slice(2, 4)} ${d.slice(4, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`;
  }
  return phone.trim();
}
