import { Image, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import {
  fallbackEstablishmentAvatarName,
  getEstablishmentLogoUrl,
} from '@/constants/establishmentMedia';
import { useLocale } from '@/contexts/LocaleContext';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { EstablishmentBrief } from '@/types/inscriptions';
import { pickEstablishmentNamesPair } from '@/utils/candidacyStatus';

type Props = {
  establishment: EstablishmentBrief | null | undefined;
  /** Variante compacte (carte alerte étape 1). */
  compact?: boolean;
};

export function TourEstablishmentHeader({ establishment, compact = false }: Props) {
  const { isRTL, locale } = useLocale();
  const est = establishment ?? null;
  const { primary, secondary } = pickEstablishmentNamesPair(est, locale);
  const sigle = est?.sigle?.trim() ?? '';

  const logoUri =
    getEstablishmentLogoUrl(est?.logo) ??
    fallbackEstablishmentAvatarName(est?.nom, est?.sigle);

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact, isRTL && styles.wrapRtl]}>
      <Image
        source={{ uri: logoUri }}
        style={[styles.logo, compact && styles.logoCompact]}
        accessibilityIgnoresInvertColors
      />
      <View style={[styles.texts, isRTL && styles.textsRtl]}>
        {sigle ? (
          <Text style={[styles.sigle, isRTL && styles.txtRtl]} numberOfLines={1}>
            {sigle}
          </Text>
        ) : null}
        <Text
          style={[compact ? styles.nameCompact : styles.name, isRTL && styles.txtRtl]}
          numberOfLines={compact ? 2 : 3}>
          {primary}
        </Text>
        {secondary ? (
          <Text style={[styles.secondary, isRTL && styles.txtRtl]} numberOfLines={2}>
            {secondary}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  wrapCompact: {
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
    gap: spacing.md,
  },
  wrapRtl: {
    direction: 'rtl',
    alignItems: 'stretch',
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: brand.backgroundSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  logoCompact: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  texts: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  textsRtl: {
    alignItems: 'flex-end',
  },
  sigle: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.primary,
    letterSpacing: 0.3,
  },
  name: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.text,
    lineHeight: 20,
  },
  nameCompact: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.text,
    lineHeight: 18,
  },
  secondary: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: brand.textMuted,
    lineHeight: 16,
  },
  txtRtl: {
    writingDirection: 'rtl',
    textAlign: 'right',
    alignSelf: 'stretch',
  },
});
