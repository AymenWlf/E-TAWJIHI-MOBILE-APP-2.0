import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { ShopCartLine } from '@/types/shop';
import { cartItemCount, clearCart, loadCart, saveCart, upsertCartLine } from '@/utils/shopCartStorage';
import { isPlatformServiceCartLine } from '@/utils/platformServiceCart';
import { hydrateCartLinesImagesViaApi, mergePlatformServiceBrandingIntoCartLines } from '@/services/shop';

type ShopCartContextValue = {
  lines: ShopCartLine[];
  count: number;
  ready: boolean;
  /** Cumule la quantité si la ligne existe déjà ; sinon ajoute. Les services plateforme restent à quantité 1. */
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
      const rawQty = Math.floor(line.quantity || 1);
      const qty = isPlatformServiceCartLine(line) ? 1 : Math.min(MAX_LINE_QTY, Math.max(1, rawQty));
      const merged = upsertCartLine(lines, {
        ...line,
        quantity: qty,
      });
      await persist(merged);
    },
    [lines, persist],
  );

  const updateQuantity = useCallback<ShopCartContextValue['updateQuantity']>(
    async (productId, quantity) => {
      const next = lines.map((l) => {
        if (l.productId !== productId) return l;
        if (isPlatformServiceCartLine(l)) {
          return { ...l, quantity: 1 };
        }
        const q = Math.min(MAX_LINE_QTY, Math.max(1, Math.floor(quantity)));
        return { ...l, quantity: q };
      });
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
    let next = await mergePlatformServiceBrandingIntoCartLines(lines);
    next = await hydrateCartLinesImagesViaApi(next);
    const changed = JSON.stringify(lines) !== JSON.stringify(next);
    if (changed) await persist(next);
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
