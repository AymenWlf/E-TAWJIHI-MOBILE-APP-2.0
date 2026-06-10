import { Alert, Linking, Platform } from 'react-native';

function cleanWaDigits(phone?: string): string {
  if (!phone?.trim()) return '';
  return phone.replace(/\D/g, '');
}

function encodeMsg(message: string): string {
  return encodeURIComponent(message.trim());
}

export function buildWhatsAppWebUrl(message: string, phoneWaDigits?: string): string {
  const phone = cleanWaDigits(phoneWaDigits);
  const q = encodeMsg(message);
  return phone ? `https://wa.me/${phone}?text=${q}` : `https://wa.me/?text=${q}`;
}

export function buildWhatsAppApiUrl(message: string, phoneWaDigits?: string): string {
  const phone = cleanWaDigits(phoneWaDigits);
  const q = encodeMsg(message);
  return phone
    ? `https://api.whatsapp.com/send?phone=${phone}&text=${q}`
    : `https://api.whatsapp.com/send?text=${q}`;
}

export function buildWhatsAppNativeUrl(message: string, phoneWaDigits?: string): string {
  const phone = cleanWaDigits(phoneWaDigits);
  const q = encodeMsg(message);
  if (phone) return `whatsapp://send?phone=${phone}&text=${q}`;
  return `whatsapp://send?text=${q}`;
}

async function tryOpenUrl(url: string): Promise<boolean> {
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}

export type OpenWhatsAppOptions = {
  message: string;
  phoneWaDigits?: string;
  failureTitle?: string;
  failureMessage?: string;
};

/** Ouvre WhatsApp avec message prérempli (wa.me → api.whatsapp.com → schéma natif). */
export async function openWhatsAppChat(options: OpenWhatsAppOptions): Promise<boolean> {
  const { message, phoneWaDigits, failureTitle, failureMessage } = options;
  const urls = [
    buildWhatsAppWebUrl(message, phoneWaDigits),
    buildWhatsAppApiUrl(message, phoneWaDigits),
    buildWhatsAppNativeUrl(message, phoneWaDigits),
  ];

  if (Platform.OS === 'android') {
    const phone = cleanWaDigits(phoneWaDigits);
    const q = encodeMsg(message);
    const path = phone ? `send?phone=${phone}&text=${q}` : `send?text=${q}`;
    urls.push(`intent://${path}#Intent;scheme=whatsapp;package=com.whatsapp;end`);
  }

  for (const url of [...new Set(urls)]) {
    if (await tryOpenUrl(url)) return true;
  }

  if (failureMessage) {
    Alert.alert(failureTitle ?? '', failureMessage);
  }
  return false;
}

/** Ouvre une URL wa.me / WhatsApp déjà construite, avec repli api.whatsapp.com si besoin. */
export async function openWhatsAppHref(
  href: string,
  failureMessage?: string,
  failureTitle?: string,
): Promise<boolean> {
  const trimmed = href.trim();
  if (!trimmed) return false;

  const fallbacks = [trimmed];
  const withPhone = /^https:\/\/wa\.me\/(\d+)\?text=(.+)$/i.exec(trimmed);
  if (withPhone) {
    fallbacks.push(`https://api.whatsapp.com/send?phone=${withPhone[1]}&text=${withPhone[2]}`);
  }
  const noPhone = /^https:\/\/wa\.me\/\?text=(.+)$/i.exec(trimmed);
  if (noPhone) {
    fallbacks.push(`https://api.whatsapp.com/send?text=${noPhone[1]}`);
  }

  for (const url of [...new Set(fallbacks)]) {
    if (await tryOpenUrl(url)) return true;
  }

  if (failureMessage) {
    Alert.alert(failureTitle ?? '', failureMessage);
  }
  return false;
}
