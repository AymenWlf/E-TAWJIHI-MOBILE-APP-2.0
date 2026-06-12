import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { AppFeedbackModal } from '@/components/feedback/AppFeedbackModal';

export type OpenParcoursFeedbackOptions = {
  onSubmitted?: () => void;
};

type ParcoursFeedbackContextValue = {
  openParcoursFeedback: (options?: OpenParcoursFeedbackOptions) => void;
  closeParcoursFeedback: () => void;
};

const ParcoursFeedbackContext = createContext<ParcoursFeedbackContextValue | null>(null);

let parcoursFeedbackOpener: ((options?: OpenParcoursFeedbackOptions) => void) | null = null;

/** Ouverture hors React (navigation parcours depuis les cartes accueil). */
export function triggerParcoursFeedback(options?: OpenParcoursFeedbackOptions): void {
  parcoursFeedbackOpener?.(options);
}

export function ParcoursFeedbackProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<OpenParcoursFeedbackOptions>({});

  const openParcoursFeedback = useCallback((opts?: OpenParcoursFeedbackOptions) => {
    setOptions(opts ?? {});
    setVisible(true);
  }, []);

  const closeParcoursFeedback = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    parcoursFeedbackOpener = openParcoursFeedback;
    return () => {
      parcoursFeedbackOpener = null;
    };
  }, [openParcoursFeedback]);

  const value = useMemo(
    () => ({ openParcoursFeedback, closeParcoursFeedback }),
    [openParcoursFeedback, closeParcoursFeedback],
  );

  return (
    <ParcoursFeedbackContext.Provider value={value}>
      {children}
      <AppFeedbackModal
        visible={visible}
        onClose={closeParcoursFeedback}
        markParcoursStep
        onSubmitted={options.onSubmitted}
      />
    </ParcoursFeedbackContext.Provider>
  );
}

export function useParcoursFeedback(): ParcoursFeedbackContextValue {
  const ctx = useContext(ParcoursFeedbackContext);
  if (!ctx) {
    throw new Error('useParcoursFeedback must be used within ParcoursFeedbackProvider');
  }
  return ctx;
}
