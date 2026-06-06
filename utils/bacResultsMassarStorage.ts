import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_PREFIX = 'etawjihi.bac.massar.confirmed';
/** Ancienne clé globale (avant scope par utilisateur). */
const LEGACY_STORAGE_KEY = STORAGE_KEY_PREFIX;

function storageKeyForUser(userId?: number | string | null): string | null {
  if (userId == null || userId === '') return null;
  return `${STORAGE_KEY_PREFIX}.${userId}`;
}

export async function readBacResultsMassarLocal(userId?: number | string | null): Promise<string> {
  try {
    const scopedKey = storageKeyForUser(userId);
    if (scopedKey) {
      const scoped = await AsyncStorage.getItem(scopedKey);
      if (typeof scoped === 'string' && scoped.trim()) {
        return scoped.trim();
      }
    }
    const legacy = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
    return typeof legacy === 'string' ? legacy.trim() : '';
  } catch {
    return '';
  }
}

export async function writeBacResultsMassarLocal(
  code: string,
  userId?: number | string | null,
): Promise<void> {
  const trimmed = code.replace(/\s/g, '').trim();
  const scopedKey = storageKeyForUser(userId);
  if (!scopedKey) {
    if (!trimmed) {
      await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
      return;
    }
    await AsyncStorage.setItem(LEGACY_STORAGE_KEY, trimmed);
    return;
  }
  if (!trimmed) {
    await AsyncStorage.removeItem(scopedKey);
    return;
  }
  await AsyncStorage.setItem(scopedKey, trimmed);
}
