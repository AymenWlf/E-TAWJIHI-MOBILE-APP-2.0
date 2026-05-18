import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'etawjihi.pending_referral_code';

export async function getPendingReferralCode(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const code = (raw ?? '').trim().toUpperCase();
    return code.length > 0 ? code : null;
  } catch {
    return null;
  }
}

/** Ignore le stockage si le code est celui de l'utilisateur connecté. */
export async function setPendingReferralCodeIfAllowed(
  code: string | null | undefined,
  ownReferralCode?: string | null,
): Promise<void> {
  const normalized = (code ?? '').trim().toUpperCase();
  const own = (ownReferralCode ?? '').trim().toUpperCase();
  if ('' !== normalized && '' !== own && normalized === own) {
    return;
  }
  await setPendingReferralCode(code);
}

export async function setPendingReferralCode(code: string | null | undefined): Promise<void> {
  const normalized = (code ?? '').trim().toUpperCase();
  try {
    if ('' === normalized) {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } else {
      await AsyncStorage.setItem(STORAGE_KEY, normalized);
    }
  } catch {
    /* ignore */
  }
}

export async function clearPendingReferralCode(): Promise<void> {
  await setPendingReferralCode(null);
}

/** Extrait un code depuis un lien https://etawjihi.ma/r/CODE ou paramètre ?ref= */
export function parseReferralCodeFromUrl(url: string): string | null {
  const trimmed = url.trim();
  if ('' === trimmed) {
    return null;
  }
  try {
    const u = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`);
    const pathMatch = u.pathname.match(/\/r\/([^/?#]+)/i);
    if (pathMatch?.[1]) {
      return decodeURIComponent(pathMatch[1]).trim().toUpperCase();
    }
    const ref = u.searchParams.get('ref') ?? u.searchParams.get('referral');
    if (ref) {
      return ref.trim().toUpperCase();
    }
  } catch {
    /* not a URL — peut être le code brut */
  }
  if (/^ETAW-[A-Z0-9-]+$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  return null;
}
