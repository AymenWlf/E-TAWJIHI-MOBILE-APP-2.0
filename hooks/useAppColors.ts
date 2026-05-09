import { useMemo } from 'react';

import { useColorScheme } from '@/components/useColorScheme';
import { semanticColors, type ColorScheme } from '@/theme/tokens';

export function useAppColors() {
  const scheme = useColorScheme() ?? 'light';
  const resolved: ColorScheme = scheme === 'dark' ? 'dark' : 'light';
  return useMemo(() => semanticColors(resolved), [resolved]);
}
