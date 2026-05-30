import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';

type UniformHeightContextValue = {
  minHeight: number;
  reportHeight: (id: string, height: number) => void;
};

const UniformHeightContext = createContext<UniformHeightContextValue | null>(null);

type ProviderProps = {
  itemIds: string[];
  /** Force un nouveau cycle de mesure (droits, filtres, contenu…). */
  measureKey?: string;
  /** N’applique la hauteur commune qu’une fois toutes les cartes mesurées (aperçu « Tous »). */
  waitForAllItems?: boolean;
  children: ReactNode;
};

export function PlatformServiceUniformHeightProvider({
  itemIds,
  measureKey,
  waitForAllItems = false,
  children,
}: ProviderProps) {
  const [minHeight, setMinHeight] = useState(0);
  const heightsRef = useRef(new Map<string, number>());
  const resetKey = measureKey ?? itemIds.join('\0');

  useEffect(() => {
    heightsRef.current.clear();
    setMinHeight(0);
  }, [resetKey]);

  const reportHeight = useCallback(
    (id: string, height: number) => {
      if (!itemIds.includes(id)) return;
      const rounded = Math.ceil(height);
      if (heightsRef.current.get(id) === rounded) return;
      heightsRef.current.set(id, rounded);

      const measured = heightsRef.current.size;
      if (waitForAllItems && measured < itemIds.length) return;

      const max = Math.max(...heightsRef.current.values());
      setMinHeight((prev) => (max > prev ? max : prev));
    },
    [itemIds, waitForAllItems, resetKey],
  );

  const value = useMemo(
    () => ({ minHeight, reportHeight }),
    [minHeight, reportHeight],
  );

  return <UniformHeightContext.Provider value={value}>{children}</UniformHeightContext.Provider>;
}

export function PlatformServiceUniformHeightList({
  itemIds,
  measureKey,
  waitForAllItems = true,
  style,
  children,
}: {
  itemIds: string[];
  measureKey?: string;
  waitForAllItems?: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  return (
    <PlatformServiceUniformHeightProvider
      itemIds={itemIds}
      measureKey={measureKey}
      waitForAllItems={waitForAllItems}
    >
      <View style={style}>{children}</View>
    </PlatformServiceUniformHeightProvider>
  );
}

/** Mesure la hauteur naturelle puis applique `minHeight` commun à toutes les cartes. */
export function usePlatformServiceUniformCardHeight(cardId: string) {
  const ctx = useContext(UniformHeightContext);
  const minHeight = ctx?.minHeight ?? 0;

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (!ctx) return;
      ctx.reportHeight(cardId, Math.ceil(event.nativeEvent.layout.height));
    },
    [cardId, ctx],
  );

  return {
    minHeight: minHeight > 0 ? minHeight : undefined,
    onLayout: ctx ? onLayout : undefined,
  };
}
