import { Platform, type TextStyle } from 'react-native';

/** Centrage vertical du chiffre dans une pastille (Android : padding police + lineHeight). */
export function countBadgeTextStyle(lineHeight = 12): TextStyle {
  return {
    textAlign: 'center',
    ...(Platform.OS === 'android'
      ? {
          includeFontPadding: false,
          textAlignVertical: 'center',
          lineHeight,
        }
      : {}),
  };
}
