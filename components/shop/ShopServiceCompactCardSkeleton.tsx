import { useWindowDimensions, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { SkeletonBlock, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import { brand, radius, spacing } from '@/theme/tokens';
import { platformServiceCarouselCardWidth } from '@/utils/platformServiceBrandIcon';

const H_PAD = spacing.md;

type Props = {
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
  layout?: 'carousel' | 'stack';
};

/** Squelette aligné sur `ServiceCompactCard` dans `boutique.tsx`. */
export function ShopServiceCompactCardSkeleton({
  isRTL = false,
  style,
  layout = 'stack',
}: Props) {
  const pulseStyle = useSkeletonPulse();
  const { width: winW } = useWindowDimensions();
  const isStack = layout === 'stack';

  return (
    <View
      style={[
        styles.outer,
        isStack ? styles.outerStack : [styles.outerCarousel, { width: platformServiceCarouselCardWidth(winW, H_PAD), marginEnd: spacing.sm }],
        style,
      ]}>
      <SkeletonBlock style={styles.accent} pulseStyle={pulseStyle} />

      <View style={[styles.body, isStack && styles.bodyStack]}>
        <View style={[styles.heroRow, isRTL && styles.heroRowRtl]}>
          <SkeletonBlock style={styles.iconCircle} pulseStyle={pulseStyle} />
          <View style={styles.titleCol}>
            <View style={[styles.titleRow, isRTL && styles.titleRowRtl]}>
              <SkeletonBlock style={styles.name} pulseStyle={pulseStyle} />
              <SkeletonBlock style={styles.chip} pulseStyle={pulseStyle} />
            </View>
            <SkeletonBlock style={styles.pill} pulseStyle={pulseStyle} />
            <SkeletonBlock style={[styles.pill, styles.pillWide]} pulseStyle={pulseStyle} />
          </View>
        </View>

        <SkeletonBlock style={styles.descLine} pulseStyle={pulseStyle} />
        <SkeletonBlock style={[styles.descLine, styles.descLineMid]} pulseStyle={pulseStyle} />

        <View style={styles.featBox}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.featRow, isRTL && styles.featRowRtl]}>
              <SkeletonBlock style={styles.featDot} pulseStyle={pulseStyle} />
              <SkeletonBlock style={styles.featTxt} pulseStyle={pulseStyle} />
            </View>
          ))}
        </View>

        <View style={styles.priceBlock}>
          <SkeletonBlock style={styles.promoBadge} pulseStyle={pulseStyle} />
          <View style={[styles.priceRow, isRTL && styles.priceRowRtl]}>
            <SkeletonBlock style={styles.priceMain} pulseStyle={pulseStyle} />
            <SkeletonBlock style={styles.priceCompare} pulseStyle={pulseStyle} />
          </View>
        </View>
      </View>

      <View style={[styles.actionsBar, isStack && styles.actionsBarStack]}>
        <View style={[styles.actions, isRTL && styles.actionsRtl]}>
          <SkeletonBlock style={styles.iconBtn} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.buyBtn} pulseStyle={pulseStyle} />
        </View>
      </View>
    </View>
  );
}

export function ShopServiceCompactCardSkeletonRow({
  count = 2,
  isRTL = false,
  style,
}: {
  count?: number;
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.rowOuter, style]}>
      <ScrollView
        horizontal
        nestedScrollEnabled
        removeClippedSubviews={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.rowContent, isRTL && styles.rowContentRtl]}>
        {Array.from({ length: count }, (_, i) => (
          <ShopServiceCompactCardSkeleton key={i} isRTL={isRTL} layout="carousel" />
        ))}
      </ScrollView>
    </View>
  );
}

export function ShopServiceCompactCardSkeletonStack({
  count = 3,
  isRTL = false,
  style,
}: {
  count?: number;
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.stack, isRTL && styles.stackRtl, style]}>
      {Array.from({ length: count }, (_, i) => (
        <ShopServiceCompactCardSkeleton key={i} isRTL={isRTL} layout="stack" />
      ))}
    </View>
  );
}

const sk = 'rgba(51, 62, 143, 0.1)';
const skStrong = 'rgba(51, 62, 143, 0.16)';

const styles = StyleSheet.create({
  stack: {
    width: '100%',
    alignSelf: 'stretch',
    gap: spacing.md,
    alignItems: 'center',
  },
  stackRtl: {
    direction: 'rtl',
    alignItems: 'stretch',
  },
  rowOuter: {
    marginHorizontal: -H_PAD,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: H_PAD,
  },
  rowContentRtl: {
    flexDirection: 'row-reverse',
  },
  outer: {
    borderRadius: radius.lg,
    backgroundColor: brand.white,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  outerCarousel: {
    maxWidth: '100%',
    flexShrink: 0,
  },
  outerStack: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  accent: {
    height: 2,
    width: '100%',
    backgroundColor: skStrong,
  },
  body: {
    padding: spacing.sm + 2,
    paddingTop: spacing.md,
  },
  bodyStack: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm + 4,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  heroRowRtl: {
    flexDirection: 'row-reverse',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: sk,
  },
  titleCol: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  titleRowRtl: {
    flexDirection: 'row-reverse',
  },
  name: {
    flex: 1,
    minWidth: 0,
    height: 16,
    borderRadius: 4,
    backgroundColor: skStrong,
  },
  chip: {
    width: 52,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: sk,
  },
  pill: {
    width: '58%',
    height: 22,
    borderRadius: radius.full,
    backgroundColor: sk,
  },
  pillWide: {
    width: '72%',
  },
  descLine: {
    marginTop: spacing.sm,
    width: '100%',
    height: 12,
    borderRadius: 3,
    backgroundColor: sk,
  },
  descLineMid: {
    width: '88%',
    marginTop: 4,
  },
  featBox: {
    marginTop: spacing.sm,
    gap: 6,
    backgroundColor: brand.backgroundSoft,
    borderRadius: radius.sm,
    padding: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  featRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  featRowRtl: {
    flexDirection: 'row-reverse',
  },
  featDot: {
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: skStrong,
    marginTop: 1,
  },
  featTxt: {
    flex: 1,
    height: 11,
    borderRadius: 3,
    backgroundColor: sk,
  },
  priceBlock: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.border,
    gap: 6,
  },
  promoBadge: {
    width: 48,
    height: 18,
    borderRadius: radius.sm,
    backgroundColor: sk,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  priceRowRtl: {
    flexDirection: 'row-reverse',
  },
  priceMain: {
    width: 72,
    height: 20,
    borderRadius: 4,
    backgroundColor: skStrong,
  },
  priceCompare: {
    width: 48,
    height: 13,
    borderRadius: 3,
    backgroundColor: sk,
  },
  actionsBar: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingBottom: spacing.sm + 2,
  },
  actionsBarStack: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionsRtl: {
    flexDirection: 'row-reverse',
  },
  iconBtn: {
    width: 42,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: sk,
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.12)',
  },
  buyBtn: {
    flex: 1,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: skStrong,
  },
});
