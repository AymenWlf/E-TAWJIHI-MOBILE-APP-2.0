import { useRouter } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { TAWJIH_PLUS_PRODUCT_PATH } from '@/constants/tawjihPlusAccess';
import { useAuth } from '@/contexts/AuthContext';
import { useTawjihPlusAccess } from '@/hooks/useTawjihPlusAccess';

type TawjihPlusAccessContextValue = {
  /** Client avec TAWJIH PLUS ou pack TASSJIL actif (services actifs). */
  hasAccess: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  /** Droit inscriptions renvoyé par l’API annonces (prioritaire sur le client seul). */
  applyServerInscriptionsAccess: (fullAccess: boolean) => void;
  /** Si le fetch annonces échoue : débloquer l’UI en retombant sur les services client. */
  resolveInscriptionsAccessWithoutServer: () => void;
  /**
   * Accès pas encore connu (services client + meta API annonces).
   * Tant que true : skeleton / chargement page, pas de bandeau « contenu réservé ».
   */
  isInscriptionsAccessPending: boolean;
  /** Contenu inscriptions verrouillé (uniquement après résolution de l’accès). */
  isInscriptionsLocked: boolean;
  openTawjihPlusProduct: () => void;
};

const TawjihPlusAccessContext = createContext<TawjihPlusAccessContextValue | null>(null);

export function TawjihPlusAccessProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();
  const { hasAccess, loading, refresh } = useTawjihPlusAccess();
  const [serverFullAccess, setServerFullAccess] = useState<boolean | null>(null);
  /** Meta `inscriptionsFullAccess` reçue (ou repli client après échec fetch annonces). */
  const [serverMetaReady, setServerMetaReady] = useState(false);

  const applyServerInscriptionsAccess = useCallback((fullAccess: boolean) => {
    setServerFullAccess(fullAccess);
    setServerMetaReady(true);
  }, []);

  const resolveInscriptionsAccessWithoutServer = useCallback(() => {
    setServerMetaReady(true);
  }, []);

  useEffect(() => {
    setServerFullAccess(null);
    setServerMetaReady(false);
  }, [user?.id]);

  const openTawjihPlusProduct = useCallback(() => {
    router.push(TAWJIH_PLUS_PRODUCT_PATH as never);
  }, [router]);

  const isInscriptionsAccessPending = loading || !serverMetaReady;

  const isInscriptionsLocked = useMemo(() => {
    if (isInscriptionsAccessPending) return false;
    if (serverFullAccess !== null) return !serverFullAccess;
    return !hasAccess;
  }, [hasAccess, isInscriptionsAccessPending, serverFullAccess]);

  const value = useMemo(
    () => ({
      hasAccess: serverFullAccess ?? hasAccess,
      loading,
      refresh,
      applyServerInscriptionsAccess,
      resolveInscriptionsAccessWithoutServer,
      isInscriptionsAccessPending,
      isInscriptionsLocked,
      openTawjihPlusProduct,
    }),
    [
      applyServerInscriptionsAccess,
      resolveInscriptionsAccessWithoutServer,
      hasAccess,
      isInscriptionsAccessPending,
      isInscriptionsLocked,
      loading,
      openTawjihPlusProduct,
      refresh,
      serverFullAccess,
    ],
  );

  return (
    <TawjihPlusAccessContext.Provider value={value}>{children}</TawjihPlusAccessContext.Provider>
  );
}

export function useTawjihPlusAccessContext(): TawjihPlusAccessContextValue {
  const ctx = useContext(TawjihPlusAccessContext);
  if (!ctx) {
    throw new Error('useTawjihPlusAccessContext must be used within TawjihPlusAccessProvider');
  }
  return ctx;
}

/** Hors provider (ex. tests) : accès complet par défaut. */
export function useTawjihPlusAccessContextOptional(): TawjihPlusAccessContextValue | null {
  return useContext(TawjihPlusAccessContext);
}
