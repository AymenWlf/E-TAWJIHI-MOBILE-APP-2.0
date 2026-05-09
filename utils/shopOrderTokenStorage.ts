import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'shop_order_token_';

export function shopOrderTokenStorageKey(publicId: string): string {
  return `${PREFIX}${publicId}`;
}

export async function saveShopOrderAccessToken(publicId: string, token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(shopOrderTokenStorageKey(publicId), token);
  } catch {
    /* ignore quota / storage errors */
  }
}

export async function getShopOrderAccessToken(publicId: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(shopOrderTokenStorageKey(publicId));
  } catch {
    return null;
  }
}
