/** Numéro mobile Maroc national : 10 chiffres, préfixe 06 ou 07. */
export const MOROCCO_MOBILE_10_REGEX = /^0[67]\d{8}$/;

/** Filtre la saisie : chiffres uniquement, max 10, commence par 06 ou 07. */
export function sanitizeMoroccoMobileInput(raw: string): string {
  let digits = raw.replace(/\D/g, '');

  if (digits.startsWith('212')) {
    digits = '0' + digits.slice(3);
  }

  if (digits.length > 0 && digits[0] !== '0') {
    if (digits[0] === '6' || digits[0] === '7') {
      digits = '0' + digits;
    } else {
      return '';
    }
  }

  if (digits.length >= 2 && digits[1] !== '6' && digits[1] !== '7') {
    digits = digits.slice(0, 1);
  }

  return digits.slice(0, 10);
}

export function isValidMoroccoMobile10(phone: string): boolean {
  return MOROCCO_MOBILE_10_REGEX.test(phone.trim());
}
