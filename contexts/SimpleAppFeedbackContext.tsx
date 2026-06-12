import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { SimpleAppFeedbackModal } from '@/components/feedback/SimpleAppFeedbackModal';
import { useAuth } from '@/contexts/AuthContext';
import {
  dismissSimpleFeedbackForUser,
  useSimpleAppFeedbackAutoPrompt,
} from '@/hooks/useSimpleAppFeedbackAutoPrompt';
import { fetchSimpleAppFeedbackPrompt } from '@/services/simpleAppFeedback';

type SimpleAppFeedbackContextValue = {
  openSimpleAppFeedback: (options?: { isCommercialClient?: boolean }) => void;
  closeSimpleAppFeedback: () => void;
};

const SimpleAppFeedbackContext = createContext<SimpleAppFeedbackContextValue | null>(null);

export function SimpleAppFeedbackProvider({ children }: { children: ReactNode }) {
  const { user, getValidAccessToken } = useAuth();
  const [visible, setVisible] = useState(false);
  const [isCommercialClient, setIsCommercialClient] = useState(false);

  const openSimpleAppFeedback = useCallback(
    (opts?: { isCommercialClient?: boolean }) => {
      if (opts?.isCommercialClient === true) {
        setIsCommercialClient(true);
        setVisible(true);
        return;
      }
      if (opts?.isCommercialClient === false) {
        setIsCommercialClient(false);
        setVisible(true);
        return;
      }

      setIsCommercialClient(false);
      setVisible(true);
      void (async () => {
        try {
          const token = await getValidAccessToken();
          if (!token) return;
          const prompt = await fetchSimpleAppFeedbackPrompt(token);
          setIsCommercialClient(prompt.isCommercialClient);
        } catch {
          /* libellé visiteur par défaut ; le backend corrige audience à l’envoi */
        }
      })();
    },
    [getValidAccessToken],
  );

  const closeSimpleAppFeedback = useCallback(() => {
    setVisible(false);
  }, []);

  useSimpleAppFeedbackAutoPrompt(
    useCallback(
      ({ isCommercialClient: isClient }) => {
        openSimpleAppFeedback({ isCommercialClient: isClient });
      },
      [openSimpleAppFeedback],
    ),
  );

  const handleDismiss = useCallback(() => {
    const userId = user?.id;
    if (userId) {
      void dismissSimpleFeedbackForUser(userId);
    }
  }, [user?.id]);

  const value = useMemo(
    () => ({ openSimpleAppFeedback, closeSimpleAppFeedback }),
    [openSimpleAppFeedback, closeSimpleAppFeedback],
  );

  return (
    <SimpleAppFeedbackContext.Provider value={value}>
      {children}
      <SimpleAppFeedbackModal
        visible={visible}
        onClose={closeSimpleAppFeedback}
        isCommercialClient={isCommercialClient}
        onDismiss={handleDismiss}
      />
    </SimpleAppFeedbackContext.Provider>
  );
}

export function useSimpleAppFeedback(): SimpleAppFeedbackContextValue {
  const ctx = useContext(SimpleAppFeedbackContext);
  if (!ctx) {
    throw new Error('useSimpleAppFeedback must be used within SimpleAppFeedbackProvider');
  }
  return ctx;
}
