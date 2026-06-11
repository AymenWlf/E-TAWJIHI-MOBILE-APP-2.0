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
  /** Filtres + listing écoles sup : au moins un service commercial actif. */
  hasSchoolsCatalogAccess: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  /** Droit inscriptions renvoyé par l’API annonces (prioritaire sur le client seul). */
  applyServerInscriptionsAccess: (fullAccess: boolean, partialAccess?: boolean) => void;
  /** Si le fetch annonces échoue : débloquer l’UI en retombant sur les services client. */
  resolveInscriptionsAccessWithoutServer: () => void;
  /**
   * Accès pas encore connu (services client + meta API annonces).
   * Tant que true : skeleton / chargement page, pas de bandeau « contenu réservé ».
   */
  isInscriptionsAccessPending: boolean;
  /** Contenu inscriptions verrouillé (uniquement après résolution de l’accès). */
  isInscriptionsLocked: boolean;
  /** Annonces visibles ; lien inscription + délai verrouillés (accès partiel global). */
  isInscriptionsPartialAccess: boolean;
  openTawjihPlusProduct: () => void;
};

const TawjihPlusAccessContext = createContext<TawjihPlusAccessContextValue | null>(null);

export function TawjihPlusAccessProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();
  const {
    hasAccess,
    hasSchoolsCatalogAccess,
    globalPartialAccessEnabled,
    loading,
    refresh,
  } = useTawjihPlusAccess();
  const [serverFullAccess, setServerFullAccess] = useState<boolean | null>(null);
  const [serverPartialAccess, setServerPartialAccess] = useState<boolean | null>(null);
  /** Meta `inscriptionsFullAccess` reçue (ou repli client après échec fetch annonces). */
  const [serverMetaReady, setServerMetaReady] = useState(false);

  const applyServerInscriptionsAccess = useCallback((fullAccess: boolean, partialAccess = false) => {
    setServerFullAccess(fullAccess);
    setServerPartialAccess(partialAccess);
    setServerMetaReady(true);
  }, []);

  const resolveInscriptionsAccessWithoutServer = useCallback(() => {
    setServerMetaReady(true);
  }, []);

  useEffect(() => {
    setServerFullAccess(null);
    setServerPartialAccess(null);
    setServerMetaReady(false);
  }, [user?.id]);

  const openTawjihPlusProduct = useCallback(() => {
    router.push(TAWJIH_PLUS_PRODUCT_PATH as never);
  }, [router]);

  const isInscriptionsAccessPending =
    loading || (!serverMetaReady && !globalPartialAccessEnabled);

  const isInscriptionsPartialAccess = useMemo(() => {
    if (loading) return false;
    if (globalPartialAccessEnabled) return true;
    if (!serverMetaReady) return false;
    return serverPartialAccess === true;
  }, [globalPartialAccessEnabled, loading, serverMetaReady, serverPartialAccess]);

  const isInscriptionsLocked = useMemo(() => {
    if (isInscriptionsAccessPending) return false;
    if (serverFullAccess === true) return false;
    if (globalPartialAccessEnabled || serverPartialAccess === true) return false;
    if (serverFullAccess === false && serverPartialAccess === false) return true;
    return !hasAccess;
  }, [
    globalPartialAccessEnabled,
    hasAccess,
    isInscriptionsAccessPending,
    serverFullAccess,
    serverPartialAccess,
  ]);

  const effectiveSchoolsCatalogAccess = useMemo(
    () =>
      hasSchoolsCatalogAccess ||
      globalPartialAccessEnabled ||
      (serverPartialAccess === true && serverMetaReady),
    [globalPartialAccessEnabled, hasSchoolsCatalogAccess, serverMetaReady, serverPartialAccess],
  );

  const value = useMemo(
    () => ({
      hasAccess: serverFullAccess ?? hasAccess,
      hasSchoolsCatalogAccess: effectiveSchoolsCatalogAccess,
      loading,
      refresh,
      applyServerInscriptionsAccess,
      resolveInscriptionsAccessWithoutServer,
      isInscriptionsAccessPending,
      isInscriptionsLocked,
      isInscriptionsPartialAccess,
      openTawjihPlusProduct,
    }),
    [
      applyServerInscriptionsAccess,
      resolveInscriptionsAccessWithoutServer,
      effectiveSchoolsCatalogAccess,
      hasAccess,
      isInscriptionsAccessPending,
      isInscriptionsLocked,
      isInscriptionsPartialAccess,
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
