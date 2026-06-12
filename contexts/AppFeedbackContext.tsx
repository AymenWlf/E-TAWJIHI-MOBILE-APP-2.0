import type { ReactNode } from 'react';

import {
  ParcoursFeedbackProvider,
  triggerParcoursFeedback,
  useParcoursFeedback,
} from '@/contexts/ParcoursFeedbackContext';
import {
  SimpleAppFeedbackProvider,
  useSimpleAppFeedback,
} from '@/contexts/SimpleAppFeedbackContext';

/** Regroupe les deux flux feedback indépendants (avis rapide vs parcours). */
export function AppFeedbackProvider({ children }: { children: ReactNode }) {
  return (
    <SimpleAppFeedbackProvider>
      <ParcoursFeedbackProvider>{children}</ParcoursFeedbackProvider>
    </SimpleAppFeedbackProvider>
  );
}

export { useSimpleAppFeedback, useParcoursFeedback, triggerParcoursFeedback };

/** @deprecated Utiliser `triggerParcoursFeedback`. */
export function triggerAppFeedback(options?: { markParcoursStep?: boolean; onSubmitted?: () => void }): void {
  triggerParcoursFeedback({ onSubmitted: options?.onSubmitted });
}

/** @deprecated Utiliser `useSimpleAppFeedback` ou `useParcoursFeedback`. */
export function useAppFeedback() {
  const { openSimpleAppFeedback, closeSimpleAppFeedback } = useSimpleAppFeedback();
  const { openParcoursFeedback, closeParcoursFeedback } = useParcoursFeedback();

  return {
    openAppFeedback: (options?: {
      variant?: 'simple' | 'full';
      markParcoursStep?: boolean;
      isCommercialClient?: boolean;
      onSubmitted?: () => void;
    }) => {
      if (options?.markParcoursStep || options?.variant === 'full') {
        openParcoursFeedback({ onSubmitted: options?.onSubmitted });
        return;
      }
      openSimpleAppFeedback({ isCommercialClient: options?.isCommercialClient });
    },
    closeAppFeedback: () => {
      closeSimpleAppFeedback();
      closeParcoursFeedback();
    },
  };
}
