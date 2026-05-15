import type { ImageSourcePropType } from 'react-native';
import { Image, StyleSheet, View } from 'react-native';

import { ETAWJIHI_LOGO_TRANSPARENT } from '@/constants/brandAssets';
import { brand, radius } from '@/theme/tokens';

type Props = {
  /** Conservés pour compatibilité API / panier ; non utilisés (logo marque unique). */
  brandIcon?: string | null;
  brandColor?: string | null;
  size: number;
  /** Conservé pour compatibilité ; la taille du logo est dérivée du carré. */
  iconSize?: number;
  borderRadius?: number;
  /** Fond du carré (défaut : surface neutre charte). */
  surfaceColor?: string;
  /** Couleur du logo (PNG) ; si absent, heuristique selon la taille (sauf `imageSource` couleur). */
  logoTintOverride?: string;
  /** Autre fichier logo (ex. variante vert + blanc) ; sinon `logo-transparent`. */
  imageSource?: ImageSourcePropType;
};

/** Fond neutre charte — plus de pastille couleur / icône par service. */
const THUMB_SURFACE = brand.chatSurface;

export function PlatformServiceVisualThumb({
  brandIcon: _brandIcon,
  brandColor: _brandColor,
  size,
  iconSize: _iconSize,
  borderRadius,
  surfaceColor,
  logoTintOverride,
  imageSource,
}: Props) {
  const rad = borderRadius ?? radius.md;
  const inset = Math.max(4, Math.round(size * 0.11));
  const logoSide = Math.max(14, size - inset * 2);
  const bg = surfaceColor ?? THUMB_SURFACE;
  const source = imageSource ?? ETAWJIHI_LOGO_TRANSPARENT;
  /** Logo couleur : pas de teinte sauf `logoTintOverride`. Logo transparent : teinte sur petites vignettes. */
  const logoTint =
    logoTintOverride ??
    (imageSource != null ? undefined : size >= 140 ? undefined : brand.primary);

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: rad, backgroundColor: bg }]}>
      <Image
        source={source}
        style={[styles.logo, { width: logoSide, height: logoSide }, logoTint != null && logoTint !== '' && { tintColor: logoTint }]}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
        accessibilityLabel="E-Tawjihi"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {},
});
