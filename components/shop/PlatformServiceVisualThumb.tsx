import { Image, StyleSheet, View } from 'react-native';

import {
  ETAWJIHI_LOGO_LIGHT_ASPECT,
  ETAWJIHI_LOGO_LIGHT_URL,
  ETAWJIHI_LOGO_SQUARE,
  ETAWJIHI_LOGO_TRANSPARENT,
} from '@/constants/brandAssets';
import { radius } from '@/theme/tokens';
import { normalizePlatformServiceBrandColor, withAlpha } from '@/utils/platformServiceBrandIcon';

type Props = {
  brandIcon?: string | null;
  brandColor?: string | null;
  size: number;
  iconSize?: number;
  borderRadius?: number;
  surfaceColor?: string;
  inactive?: boolean;
  /**
   * `light` : logo blanc horizontal CDN (en-têtes).
   * `square` : logo carré (fiche détail service, bandeau plein écran).
   * `tinted` : pastille teintée (listes, panier).
   */
  logoVariant?: 'tinted' | 'light' | 'square';
};

export function PlatformServiceVisualThumb({
  brandIcon,
  brandColor,
  size,
  iconSize,
  borderRadius,
  surfaceColor,
  inactive = false,
  logoVariant = 'tinted',
}: Props) {
  const rad = borderRadius ?? radius.md;
  const accent = normalizePlatformServiceBrandColor(brandColor, inactive);
  const isLight = logoVariant === 'light';
  const isSquare = logoVariant === 'square';
  const isHeroLogo = isLight || isSquare;
  const bg = surfaceColor ?? (isHeroLogo ? accent : withAlpha(accent, 0.12));
  const border = isHeroLogo ? 'transparent' : withAlpha(accent, 0.22);
  const glyph = iconSize ?? Math.max(16, Math.round(size * 0.42));
  const lightLogoW = Math.round(glyph * ETAWJIHI_LOGO_LIGHT_ASPECT);
  const squareLogo = Math.min(
    glyph,
    Math.round(size * (iconSize != null ? 0.78 : 0.52)),
  );

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: rad,
          backgroundColor: bg,
          borderColor: border,
          borderWidth: isHeroLogo ? 0 : 1,
        },
      ]}>
      {isSquare ? (
        <Image
          source={ETAWJIHI_LOGO_SQUARE}
          style={{ width: squareLogo, height: squareLogo }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      ) : isLight ? (
        <Image
          source={{ uri: ETAWJIHI_LOGO_LIGHT_URL }}
          style={{ width: lightLogoW, height: glyph, maxWidth: size * 0.88 }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Image
          source={ETAWJIHI_LOGO_TRANSPARENT}
          style={{
            width: glyph,
            height: glyph,
            tintColor: inactive ? '#94A3B8' : accent,
          }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
  },
});
