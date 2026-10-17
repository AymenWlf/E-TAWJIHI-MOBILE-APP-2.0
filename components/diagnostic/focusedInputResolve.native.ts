import { TextInput } from 'react-native';

import { hostFromReader, type FocusedHost, type FocusedReader } from './focusedInputHost';

export type { FocusedHost };

/**
 * Sur iOS et Android, `TextInput.State.currentlyFocusedInput` n’est pas toujours
 * une fonction. Le module interne l’est, et le web ne charge pas ce fichier.
 */
export function readFocusedInput(): FocusedHost | null {
  try {
    const mod = require('react-native/Libraries/Components/TextInput/TextInputState') as {
      currentlyFocusedInput?: FocusedReader;
      default?: { currentlyFocusedInput?: FocusedReader };
    };
    const fromModule =
      hostFromReader(mod.currentlyFocusedInput) ??
      hostFromReader(mod.default?.currentlyFocusedInput);
    if (fromModule) return fromModule;
  } catch {
    /* repli sur l’API publique */
  }
  const state = TextInput.State as { currentlyFocusedInput?: FocusedReader } | undefined;
  return hostFromReader(state?.currentlyFocusedInput);
}
