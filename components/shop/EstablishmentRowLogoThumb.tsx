import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import {
  fallbackEstablishmentAvatarName,
  getEstablishmentLogoUrl,
} from '@/constants/establishmentMedia';
import { brand, radius } from '@/theme/tokens';

type Props = {
  logo?: string | null;
  nom: string;
  sigle?: string | null;
  /** Côté par défaut aligné sur les lignes « établissements concernés » (36). */
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function EstablishmentRowLogoThumb({ logo, nom, sigle, size = 36, style }: Props) {
  const uri = useMemo(
    () => getEstablishmentLogoUrl(logo) ?? fallbackEstablishmentAvatarName(nom, sigle),
    [logo, nom, sigle],
  );
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    setPhase('loading');
  }, [uri]);

  const iconSize = Math.max(14, Math.round(size * 0.42));

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius.sm,
          backgroundColor: 'rgba(51,62,143,0.08)',
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {phase !== 'error' ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
          onLoad={() => setPhase('ready')}
          onError={() => setPhase('error')}
          accessibilityIgnoresInvertColors
        />
      ) : null}
      {phase === 'loading' ? (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.55)',
            },
          ]}
        >
          <ActivityIndicator size="small" color={brand.primary} />
        </View>
      ) : null}
      {phase === 'error' ? <FontAwesome name="university" size={iconSize} color={brand.primary} /> : null}
    </View>
  );
}
