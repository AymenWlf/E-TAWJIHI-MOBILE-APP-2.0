import { TextInput } from 'react-native';

export type FocusedHost = {
  measureLayout: (
    relativeTo: object,
    onSuccess: (x: number, y: number) => void,
    onFail: () => void,
  ) => void;
};

export type FocusedReader = (() => unknown) | FocusedHost | { default?: () => unknown };

function isFocusedHost(value: unknown): value is FocusedHost {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as FocusedHost).measureLayout === 'function'
  );
}

export function hostFromReader(reader: FocusedReader | undefined): FocusedHost | null {
  if (!reader) return null;
  try {
    if (typeof reader === 'function') {
      const focused = reader();
      return isFocusedHost(focused) ? focused : null;
    }
    if (isFocusedHost(reader)) return reader;
    if (typeof reader.default === 'function') {
      const focused = reader.default();
      return isFocusedHost(focused) ? focused : null;
    }
  } catch {
    return null;
  }
  return null;
}

/** API publique. Suffisante sur le web, où l’import interne casse le bundle. */
export function readFocusedInput(): FocusedHost | null {
  const state = TextInput.State as { currentlyFocusedInput?: FocusedReader } | undefined;
  return hostFromReader(state?.currentlyFocusedInput);
}
