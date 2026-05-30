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

export type OpenAppFeedbackOptions = {
  /** Marque l’étape feedback du parcours après envoi. */
  markParcoursStep?: boolean;
  onSubmitted?: () => void;
};

type AppFeedbackContextValue = {
  openAppFeedback: (options?: OpenAppFeedbackOptions) => void;
  closeAppFeedback: () => void;
};

const AppFeedbackContext = createContext<AppFeedbackContextValue | null>(null);

/** Ouverture hors React (navigation parcours depuis les cartes accueil). */
let appFeedbackOpener: ((options?: OpenAppFeedbackOptions) => void) | null = null;

export function triggerAppFeedback(options?: OpenAppFeedbackOptions): void {
  appFeedbackOpener?.(options);
}

export function AppFeedbackProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<OpenAppFeedbackOptions>({});

  const openAppFeedback = useCallback((opts?: OpenAppFeedbackOptions) => {
    setOptions(opts ?? {});
    setVisible(true);
  }, []);

  const closeAppFeedback = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    appFeedbackOpener = openAppFeedback;
    return () => {
      appFeedbackOpener = null;
    };
  }, [openAppFeedback]);

  const value = useMemo(
    () => ({ openAppFeedback, closeAppFeedback }),
    [openAppFeedback, closeAppFeedback],
  );

  return (
    <AppFeedbackContext.Provider value={value}>
      {children}
      <AppFeedbackModal
        visible={visible}
        onClose={closeAppFeedback}
        markParcoursStep={options.markParcoursStep}
        onSubmitted={options.onSubmitted}
      />
    </AppFeedbackContext.Provider>
  );
}

export function useAppFeedback(): AppFeedbackContextValue {
  const ctx = useContext(AppFeedbackContext);
  if (!ctx) {
    throw new Error('useAppFeedback must be used within AppFeedbackProvider');
  }
  return ctx;
}
