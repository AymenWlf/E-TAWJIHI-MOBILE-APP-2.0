import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'etawjihi.bac.massar.confirmed';

export async function readBacResultsMassarLocal(): Promise<string> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return typeof raw === 'string' ? raw.trim() : '';
  } catch {
    return '';
  }
}

export async function writeBacResultsMassarLocal(code: string): Promise<void> {
  const trimmed = code.replace(/\s/g, '').trim();
  if (!trimmed) {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return;
  }
  await AsyncStorage.setItem(STORAGE_KEY, trimmed);
}
