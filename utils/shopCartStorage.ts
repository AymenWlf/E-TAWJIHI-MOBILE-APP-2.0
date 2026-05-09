import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ShopCartLine } from '@/types/shop';

const STORAGE_KEY = 'etawjihi_shop_cart_v1';

function isShopCartLine(row: unknown): row is ShopCartLine {
  if (!row || typeof row !== 'object') return false;
  const r = row as Partial<ShopCartLine>;
  return (
    typeof r.productId === 'number' &&
    typeof r.slug === 'string' &&
    typeof r.quantity === 'number' &&
    typeof r.price === 'string' &&
    typeof r.title === 'string'
  );
}

export async function loadCart(): Promise<ShopCartLine[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isShopCartLine);
  } catch {
    return [];
  }
}

export async function saveCart(lines: ShopCartLine[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* quota errors silenced */
  }
}

export async function clearCart(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function cartItemCount(lines: ShopCartLine[]): number {
  return lines.reduce((acc, l) => acc + l.quantity, 0);
}

export function upsertCartLine(lines: ShopCartLine[], line: ShopCartLine): ShopCartLine[] {
  const idx = lines.findIndex((l) => l.productId === line.productId);
  if (idx === -1) return [...lines, line];
  const next = [...lines];
  const prev = next[idx];
  next[idx] = {
    ...prev,
    quantity: prev.quantity + line.quantity,
    ...(line.images?.length ? { images: line.images } : {}),
    ...(line.isFreeShipping !== undefined ? { isFreeShipping: line.isFreeShipping } : {}),
    ...(line.packPricingMode !== undefined ? { packPricingMode: line.packPricingMode } : {}),
  };
  return next;
}
