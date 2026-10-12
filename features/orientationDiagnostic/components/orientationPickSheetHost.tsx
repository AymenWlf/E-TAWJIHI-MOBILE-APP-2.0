import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { StyleSheet, View } from 'react-native';

import { SearchablePickSheet } from '@/components/schools/SearchablePickSheet';

type RenderFn = () => ReactNode;
type Token = object;

type HostApi = {
  update: (render: RenderFn) => Token;
  release: (token: Token) => void;
};

const OrientationPickSheetContext = createContext<HostApi | null>(null);

/**
 * Affiche la feuille au-dessus de tout l’écran du test.
 * Sur iOS l’overlay est ancré au parent : s’il reste dans le ScrollView,
 * la liste est coupée par la carte de l’étape.
 */
export function OrientationPickSheetHost({ children }: { children: ReactNode }) {
  const renderRef = useRef<RenderFn | null>(null);
  const tokenRef = useRef<Token | null>(null);
  const [, setEpoch] = useState(0);
  const api = useMemo<HostApi>(
    () => ({
      update(render) {
        const token: Token = {};
        tokenRef.current = token;
        renderRef.current = render;
        setEpoch((n) => n + 1);
        return token;
      },
      release(token) {
        queueMicrotask(() => {
          if (tokenRef.current !== token) return;
          renderRef.current = null;
          tokenRef.current = null;
          setEpoch((n) => n + 1);
        });
      },
    }),
    [],
  );

  const sheet = renderRef.current?.() ?? null;

  return (
    <OrientationPickSheetContext.Provider value={api}>
      {children}
      {sheet ? (
        <View style={styles.outlet} pointerEvents="box-none">
          {sheet}
        </View>
      ) : null}
    </OrientationPickSheetContext.Provider>
  );
}

type SheetProps = ComponentProps<typeof SearchablePickSheet>;

/** Même feuille que le setup, rendue hors du conteneur de l’étape. */
export function HostedSearchablePickSheet(props: SheetProps) {
  const api = useContext(OrientationPickSheetContext);
  const propsRef = useRef(props);
  propsRef.current = props;

  const itemsKey = props.items.map((item) => `${item.id}\u0000${item.label}`).join('\n');
  const selectedKey = props.multiSelect
    ? (props.selectedValues ?? []).join('\n')
    : props.selectedValue;

  useLayoutEffect(() => {
    if (!api || !props.visible) return;
    const token = api.update(() => <SearchablePickSheet {...propsRef.current} />);
    return () => api.release(token);
  }, [api, props.visible, props.title, props.rtl, props.multiSelect, itemsKey, selectedKey]);

  if (!api) {
    return <SearchablePickSheet {...props} />;
  }
  return null;
}

const styles = StyleSheet.create({
  outlet: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9000,
    elevation: 9000,
  },
});
