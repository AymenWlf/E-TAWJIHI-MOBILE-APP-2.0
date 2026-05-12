import { Platform, RefreshControl, type RefreshControlProps } from 'react-native';

import { brand } from '@/theme/tokens';

const REFRESH_TINT = brand.primary;

type Props = RefreshControlProps;

/**
 * Pull-to-refresh charte E-Tawjihi : indicateur **bleu** (#333E8F) sur iOS (`tintColor`) et Android (`colors`).
 */
export function AppRefreshControl({ tintColor = REFRESH_TINT, colors, progressBackgroundColor, ...rest }: Props) {
  return (
    <RefreshControl
      {...rest}
      tintColor={tintColor}
      {...(Platform.OS === 'android'
        ? {
            colors: colors ?? [REFRESH_TINT],
            progressBackgroundColor: progressBackgroundColor ?? brand.background,
          }
        : {})}
    />
  );
}
