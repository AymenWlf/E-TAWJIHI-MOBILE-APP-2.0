import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { ShopCartLine } from '@/types/shop';
import { cartItemCount, clearCart, loadCart, saveCart, upsertCartLine } from '@/utils/shopCartStorage';
import { hydrateCartLinesImagesViaApi } from '@/services/shop';

type ShopCartContextValue = {
  lines: ShopCartLine[];
  count: number;
  ready: boolean;
  /** Cumule la quantité si la ligne existe déjà ; sinon ajoute. */
  addLine: (line: ShopCartLine) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeLine: (productId: number) => Promise<void>;
  clear: () => Promise<void>;
  /** Recharge les images manquantes via le catalogue (no-op si tout est déjà présent). */
  hydrateImages: () => Promise<void>;
};

const ShopCartContext = createContext<ShopCartContextValue | null>(null);

const MAX_LINE_QTY = 99;

export function ShopCartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<ShopCartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const initial = await loadCart();
      if (!alive) return;
      setLines(initial);
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const persist = useCallback(async (next: ShopCartLine[]) => {
    setLines(next);
    await saveCart(next);
  }, []);

  const addLine = useCallback<ShopCartContextValue['addLine']>(
    async (line) => {
      const merged = upsertCartLine(lines, {
        ...line,
        quantity: Math.min(MAX_LINE_QTY, Math.max(1, Math.floor(line.quantity || 1))),
      });
      await persist(merged);
    },
    [lines, persist],
  );

  const updateQuantity = useCallback<ShopCartContextValue['updateQuantity']>(
    async (productId, quantity) => {
      const q = Math.min(MAX_LINE_QTY, Math.max(1, Math.floor(quantity)));
      const next = lines.map((l) => (l.productId === productId ? { ...l, quantity: q } : l));
      await persist(next);
    },
    [lines, persist],
  );

  const removeLine = useCallback<ShopCartContextValue['removeLine']>(
    async (productId) => {
      const next = lines.filter((l) => l.productId !== productId);
      await persist(next);
    },
    [lines, persist],
  );

  const clear = useCallback<ShopCartContextValue['clear']>(async () => {
    setLines([]);
    await clearCart();
  }, []);

  const hydrateImages = useCallback<ShopCartContextValue['hydrateImages']>(async () => {
    if (lines.length === 0) return;
    if (!lines.some((l) => !l.images || l.images.length === 0)) return;
    const hydrated = await hydrateCartLinesImagesViaApi(lines);
    const changed = JSON.stringify(lines) !== JSON.stringify(hydrated);
    if (changed) await persist(hydrated);
  }, [lines, persist]);

  const value = useMemo<ShopCartContextValue>(
    () => ({
      lines,
      count: cartItemCount(lines),
      ready,
      addLine,
      updateQuantity,
      removeLine,
      clear,
      hydrateImages,
    }),
    [lines, ready, addLine, updateQuantity, removeLine, clear, hydrateImages],
  );

  return <ShopCartContext.Provider value={value}>{children}</ShopCartContext.Provider>;
}

export function useShopCart(): ShopCartContextValue {
  const ctx = useContext(ShopCartContext);
  if (!ctx) {
    throw new Error('useShopCart must be used inside <ShopCartProvider>');
  }
  return ctx;
}
