import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { HOME_COPY, type AppLocale, type HomeCopyKey } from '@/constants/i18n';

const STORAGE_KEY = 'etawjihi.locale';

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (next: AppLocale) => void;
  t: (key: HomeCopyKey) => string;
  isRTL: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>('fr');

  useEffect(() => {
    let cancelled = false;
    void AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        if (raw === 'fr' || raw === 'ar') {
          setLocaleState(raw);
        }
      })
      .catch(() => {
        /* AsyncStorage peut échouer sur web/old SDK : on garde le défaut. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback((next: AppLocale) => {
    if (next !== 'fr' && next !== 'ar') return;
    setLocaleState(next);
    void AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      /**
       * Lookup défensif :
       *  1. `HOME_COPY[locale]` peut être `undefined` si `locale` part en
       *     vrille (ex. cache AsyncStorage corrompu, HMR partiel pendant un
       *     ajout de locale). On retombe sur le bundle FR.
       *  2. La clé peut ne pas exister dans la locale courante (typo, clé
       *     supprimée mais composant pas encore rebuild). On retombe sur le
       *     bundle FR puis, en dernier recours, on rend la clé brute pour
       *     éviter un render crash et faciliter le debug.
       */
      t: (key: HomeCopyKey): string => {
        const dict = HOME_COPY[locale] ?? HOME_COPY.fr;
        const v = dict?.[key];
        if (typeof v === 'string') return v;
        const fallback = HOME_COPY.fr?.[key];
        return typeof fallback === 'string' ? fallback : String(key);
      },
      isRTL: locale === 'ar',
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}
