import { Platform, type ViewStyle } from 'react-native';

/**
 * Direction de layout compatible RN natif + RN Web.
 *
 * - Natif : Yoga accepte `direction` (`ltr` | `rtl`).
 * - Web (react-native-web) : `direction` est invalide (warning + propriété
 *   supprimée). Il faut `writingDirection`, compilé en CSS `direction`.
 */
export const DIR_RTL: ViewStyle =
  Platform.OS === 'web'
    ? ({ writingDirection: 'rtl' } as ViewStyle)
    : ({ direction: 'rtl' } as ViewStyle);

export const DIR_LTR: ViewStyle =
  Platform.OS === 'web'
    ? ({ writingDirection: 'ltr' } as ViewStyle)
    : ({ direction: 'ltr' } as ViewStyle);

export function layoutDir(dir: 'rtl' | 'ltr'): ViewStyle {
  return dir === 'rtl' ? DIR_RTL : DIR_LTR;
}
