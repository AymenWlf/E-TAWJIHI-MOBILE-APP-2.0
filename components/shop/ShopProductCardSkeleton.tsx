import { Dimensions, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { SkeletonBlock, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import { brand, radius, spacing } from '@/theme/tokens';

const GUTTER = spacing.md;
const SCREEN_W = Dimensions.get('window').width;
const CARD_W = (SCREEN_W - GUTTER) / 2;

type Props = {
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Squelette aligné sur `ProductCard` dans `boutique.tsx`. */
export function ShopProductCardSkeleton({ isRTL = false, style }: Props) {
  const pulseStyle = useSkeletonPulse();

  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardImgWrap}>
        <SkeletonBlock style={styles.cardImg} pulseStyle={pulseStyle} />
        <SkeletonBlock style={styles.imgOverlay} pulseStyle={pulseStyle} />
        <View style={[styles.badgeStackTL, isRTL && styles.badgeStackTLRtl]}>
          <SkeletonBlock style={styles.badgePromo} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.badgeBestseller} pulseStyle={pulseStyle} />
        </View>
        <SkeletonBlock
          style={isRTL ? styles.badgeFreeRtl : styles.badgeFreeLtr}
          pulseStyle={pulseStyle}
        />
        <SkeletonBlock
          style={[styles.typePill, isRTL && styles.typePillRtl]}
          pulseStyle={pulseStyle}
        />
      </View>

      <View style={styles.cardBody}>
        <SkeletonBlock style={styles.cardTitle} pulseStyle={pulseStyle} />
        <SkeletonBlock style={[styles.cardTitle, styles.cardTitleShort]} pulseStyle={pulseStyle} />
        <View style={[styles.ratingRow, isRTL && styles.ratingRowRtl]}>
          <SkeletonBlock style={styles.ratingStar} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.ratingTxt} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.ratingCount} pulseStyle={pulseStyle} />
        </View>
        <View style={[styles.priceRow, isRTL && styles.priceRowRtl]}>
          <SkeletonBlock style={styles.price} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.priceCompare} pulseStyle={pulseStyle} />
        </View>
      </View>

      <View style={[styles.actions, isRTL && styles.actionsRtl]}>
        <SkeletonBlock style={styles.addBtn} pulseStyle={pulseStyle} />
        <SkeletonBlock style={styles.buyBtn} pulseStyle={pulseStyle} />
      </View>
    </View>
  );
}

/** Grille 2 colonnes comme l’onglet Boutique (produits). */
export function ShopProductGridSkeleton({
  count = 4,
  isRTL = false,
  style,
}: {
  count?: number;
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const rows = Math.ceil(count / 2);
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <View style={[styles.gridWrap, style]}>
      {Array.from({ length: rows }, (_, rowIdx) => {
        const left = items[rowIdx * 2];
        const right = items[rowIdx * 2 + 1];
        return (
          <View key={rowIdx} style={[styles.gridRow, isRTL && styles.gridRowRtl]}>
            {left != null ? (
              <View
                style={[
                  styles.cardWrap,
                  isRTL ? { marginLeft: GUTTER / 2 } : { marginRight: GUTTER / 2 },
                ]}>
                <ShopProductCardSkeleton isRTL={isRTL} />
              </View>
            ) : null}
            {right != null ? (
              <View
                style={[
                  styles.cardWrap,
                  isRTL ? { marginRight: GUTTER / 2 } : { marginLeft: GUTTER / 2 },
                ]}>
                <ShopProductCardSkeleton isRTL={isRTL} />
              </View>
            ) : (
              <View style={styles.cardWrap} />
            )}
          </View>
        );
      })}
    </View>
  );
}

/** Deux cartes en bas de liste (pagination) — même marges que `renderItem`. */
export function ShopProductGridFooterSkeleton({ isRTL = false }: { isRTL?: boolean }) {
  return <ShopProductGridSkeleton count={2} isRTL={isRTL} style={styles.footerGrid} />;
}

const sk = 'rgba(51, 62, 143, 0.1)';
const skStrong = 'rgba(51, 62, 143, 0.16)';

const styles = StyleSheet.create({
  gridWrap: {
    width: '100%',
    alignSelf: 'stretch',
  },
  footerGrid: {
    paddingTop: spacing.md,
  },
  gridRow: {
    flexDirection: 'row',
    width: '100%',
  },
  gridRowRtl: {
    flexDirection: 'row-reverse',
  },
  cardWrap: {
    width: CARD_W,
    marginBottom: GUTTER,
  },
  card: {
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.07)',
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  cardImgWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: brand.backgroundSoft,
    position: 'relative',
  },
  cardImg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: sk,
  },
  imgOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(15,23,42,0.06)',
  },
  badgeStackTL: {
    position: 'absolute',
    top: 7,
    left: 7,
    zIndex: 2,
    gap: 5,
    alignItems: 'flex-start',
  },
  badgeStackTLRtl: {
    left: undefined,
    right: 7,
    alignItems: 'flex-end',
  },
  badgePromo: {
    width: 44,
    height: 20,
    borderRadius: radius.sm,
    backgroundColor: skStrong,
  },
  badgeBestseller: {
    width: 56,
    height: 18,
    borderRadius: radius.sm,
    backgroundColor: sk,
  },
  badgeFreeLtr: {
    position: 'absolute',
    bottom: 7,
    right: 7,
    width: 64,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: skStrong,
  },
  badgeFreeRtl: {
    position: 'absolute',
    bottom: 7,
    left: 7,
    right: undefined,
    width: 64,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: skStrong,
  },
  typePill: {
    position: 'absolute',
    bottom: 7,
    left: 7,
    width: 56,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: 'rgba(15,23,42,0.12)',
  },
  typePillRtl: {
    left: undefined,
    right: 7,
  },
  cardBody: {
    padding: spacing.md,
    gap: 5,
  },
  cardTitle: {
    width: '92%',
    height: 14,
    borderRadius: 4,
    backgroundColor: skStrong,
  },
  cardTitleShort: {
    width: '68%',
    height: 12,
    backgroundColor: sk,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingRowRtl: {
    flexDirection: 'row-reverse',
  },
  ratingStar: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: sk,
  },
  ratingTxt: {
    width: 24,
    height: 11,
    borderRadius: 3,
    backgroundColor: skStrong,
  },
  ratingCount: {
    width: 28,
    height: 10,
    borderRadius: 3,
    backgroundColor: sk,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 1,
  },
  priceRowRtl: {
    flexDirection: 'row-reverse',
  },
  price: {
    width: 56,
    height: 17,
    borderRadius: 4,
    backgroundColor: skStrong,
  },
  priceCompare: {
    width: 40,
    height: 12,
    borderRadius: 3,
    backgroundColor: sk,
  },
  actions: {
    marginTop: 8,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
  },
  actionsRtl: {
    flexDirection: 'row-reverse',
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: sk,
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.12)',
  },
  buyBtn: {
    flex: 1,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: skStrong,
  },
});
