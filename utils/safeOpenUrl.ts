import { Linking } from 'react-native';

const ALLOWED_SCHEMES = ['https:', 'http:', 'mailto:', 'tel:'];

export function isSafeHref(href: string | null | undefined): boolean {
  if (!href || typeof href !== 'string') return false;
  const trimmed = href.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/')) return true;

  try {
    const url = new URL(trimmed);
    return ALLOWED_SCHEMES.includes(url.protocol);
  } catch {
    return false;
  }
}

export async function safeOpenUrl(href: string | null | undefined): Promise<void> {
  if (!isSafeHref(href)) return;
  const trimmed = href!.trim();
  try {
    const canOpen = await Linking.canOpenURL(trimmed);
    if (canOpen) {
      await Linking.openURL(trimmed);
    }
  } catch {
    // ignore
  }
}
