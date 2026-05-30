import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ShopServiceCompactCardSkeletonRow } from '@/components/shop/ShopServiceCompactCardSkeleton';
import { SkeletonBlock, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import { brand, radius, spacing } from '@/theme/tokens';

const H_PAD = spacing.md;

type Props = {
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Nombre de cartes dans le carrousel horizontal. */
  carouselCount?: number;
};

/** Bloc « Services » de l’onglet Tous — même fond et en-tête que `servicesPreviewSection`. */
export function ShopServicesPreviewSkeleton({ isRTL = false, style, carouselCount = 2 }: Props) {
  const pulseStyle = useSkeletonPulse();

  return (
    <View style={[styles.section, isRTL && styles.sectionRtl, style]}>
      <View style={[styles.titleBlock, isRTL && styles.titleBlockRtl]}>
        <SkeletonBlock style={styles.iconWrap} pulseStyle={pulseStyle} />
        <View style={[styles.titleTexts, isRTL && styles.titleTextsRtl]}>
          <SkeletonBlock style={[styles.kicker, isRTL && styles.alignEnd]} pulseStyle={pulseStyle} />
          <SkeletonBlock style={[styles.title, isRTL && styles.alignEnd]} pulseStyle={pulseStyle} />
        </View>
      </View>
      <ShopServiceCompactCardSkeletonRow count={carouselCount} isRTL={isRTL} style={styles.carousel} />
    </View>
  );
}

const sk = 'rgba(51, 62, 143, 0.1)';
const skStrong = 'rgba(51, 62, 143, 0.16)';

const styles = StyleSheet.create({
  section: {
    backgroundColor: brand.chatSurface,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: H_PAD,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.border,
  },
  sectionRtl: {
    direction: 'rtl',
    alignSelf: 'stretch',
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    minWidth: 0,
    marginBottom: spacing.sm,
  },
  titleBlockRtl: {
    flexDirection: 'row-reverse',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: sk,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(51,62,143,0.12)',
  },
  titleTexts: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  titleTextsRtl: {
    alignItems: 'flex-end',
  },
  alignEnd: {
    alignSelf: 'flex-end',
  },
  kicker: {
    width: 72,
    height: 10,
    borderRadius: 3,
    backgroundColor: sk,
  },
  title: {
    width: '78%',
    height: 18,
    borderRadius: 4,
    backgroundColor: skStrong,
  },
  carousel: {},
});
