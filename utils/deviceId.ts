import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEY = 'etawjihi_device_id';

function randomId(): string {
  return `d_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

export async function getOrCreateDeviceId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    if (existing && existing.length >= 8) {
      return existing;
    }
    const id = randomId();
    await AsyncStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return randomId();
  }
}

export function getAuthPlatform(): 'ios' | 'android' | 'web' {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return 'web';
}
