import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type AppSidebarContextValue = {
  open: () => void;
  close: () => void;
  toggle: () => void;
  visible: boolean;
};

const AppSidebarContext = createContext<AppSidebarContextValue | null>(null);

export function AppSidebarProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);
  const toggle = useCallback(() => setVisible((v) => !v), []);

  const value = useMemo(
    () => ({
      open,
      close,
      toggle,
      visible,
    }),
    [open, close, toggle, visible],
  );

  return <AppSidebarContext.Provider value={value}>{children}</AppSidebarContext.Provider>;
}

export function useAppSidebar(): AppSidebarContextValue {
  const ctx = useContext(AppSidebarContext);
  if (!ctx) {
    throw new Error('useAppSidebar must be used within AppSidebarProvider');
  }
  return ctx;
}
