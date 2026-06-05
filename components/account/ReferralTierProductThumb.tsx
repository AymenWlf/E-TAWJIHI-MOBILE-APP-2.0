import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { ReferralTierProduct } from '@/services/userReferral';
import { homeShell } from '@/theme/homeShell';
import { radius } from '@/theme/tokens';
import { getReferralTierProductImageUri } from '@/utils/referralTierProduct';

type Props = {
  product: ReferralTierProduct | null | undefined;
  size?: number;
  icon?: React.ComponentProps<typeof FontAwesome>['name'];
  style?: StyleProp<ViewStyle>;
};

export function ReferralTierProductThumb({
  product,
  size = 56,
  icon = 'gift',
  style,
}: Props) {
  const uri = getReferralTierProductImageUri(product);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.thumb, { width: size, height: size, borderRadius: radius.md }, style]}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
    );
  }

  return (
    <View
      style={[
        styles.thumb,
        styles.fallback,
        { width: size, height: size, borderRadius: radius.md },
        style,
      ]}>
      <FontAwesome name={icon} size={Math.max(14, Math.round(size * 0.36))} color={homeShell.cardMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  thumb: {
    backgroundColor: '#E2E8F0',
    flexShrink: 0,
    overflow: 'hidden',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
