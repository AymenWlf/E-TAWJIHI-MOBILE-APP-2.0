import { createContext, useContext, type ReactNode, type RefObject } from 'react';
import { Platform, TextInput, type ScrollView, type View } from 'react-native';

const DiagnosticFieldScrollContext = createContext<(() => void) | null>(null);

export function DiagnosticFieldScrollProvider({
  scroll,
  children,
}: {
  scroll: () => void;
  children: ReactNode;
}) {
  return (
    <DiagnosticFieldScrollContext.Provider value={scroll}>
      {children}
    </DiagnosticFieldScrollContext.Provider>
  );
}

/** Défile jusqu’au champ focalisé. Sans provider, ne fait rien. */
export function useDiagnosticFieldScroll(): () => void {
  return useContext(DiagnosticFieldScrollContext) ?? noop;
}

function noop() {}

const FOCUS_TOP_GAP = 20;

/**
 * Place le champ en cours de saisie près du haut de la zone défilante,
 * au-dessus du clavier et de la barre d’actions.
 */
export function scrollFocusedInputIntoView(
  scrollRef: RefObject<ScrollView | null>,
  contentRef: RefObject<View | null>,
) {
  const content = contentRef.current;
  const focused = TextInput.State.currentlyFocusedInput();
  if (!content || !focused || typeof focused.measureLayout !== 'function') {
    return;
  }

  const run = () => {
    focused.measureLayout(
      content as never,
      (_x, y) => {
        scrollRef.current?.scrollTo({
          y: Math.max(0, y - FOCUS_TOP_GAP),
          animated: true,
        });
      },
      () => {},
    );
  };

  requestAnimationFrame(run);
  setTimeout(run, Platform.OS === 'ios' ? 280 : 320);
}
