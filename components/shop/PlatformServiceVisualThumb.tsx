import { Image, StyleSheet, View } from 'react-native';

import { ETAWJIHI_LOGO_TRANSPARENT } from '@/constants/brandAssets';
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
};

export function PlatformServiceVisualThumb({
  brandIcon,
  brandColor,
  size,
  iconSize,
  borderRadius,
  surfaceColor,
  inactive = false,
}: Props) {
  const rad = borderRadius ?? radius.md;
  const accent = normalizePlatformServiceBrandColor(brandColor, inactive);
  const bg = surfaceColor ?? withAlpha(accent, 0.12);
  const border = withAlpha(accent, 0.22);
  const glyph = iconSize ?? Math.max(16, Math.round(size * 0.42));

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
        },
      ]}>
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
