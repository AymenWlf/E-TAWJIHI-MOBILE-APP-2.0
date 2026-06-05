import { useCallback, useState } from 'react';

export type ToastAlertVariant = 'error' | 'success' | 'info';

type ToastState = {
  message: string;
  variant: ToastAlertVariant;
};

export function useToastAlert() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const dismiss = useCallback(() => {
    setToast(null);
  }, []);

  const show = useCallback((message: string, variant: ToastAlertVariant = 'error') => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setToast({ message: trimmed, variant });
  }, []);

  const showError = useCallback((message: string) => show(message, 'error'), [show]);

  return {
    toast,
    visible: Boolean(toast?.message),
    show,
    showError,
    dismiss,
  };
}
