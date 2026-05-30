import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SkeletonBlock, SKELETON_BG, SKELETON_BG_STRONG, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import { brand, radius, spacing } from '@/theme/tokens';

type Variant = 'product' | 'service';

type Props = {
  variant: Variant;
  gallerySize: number;
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Squelette aligné sur les fiches `boutique/[slug]` et `boutique/service/[slug]`. */
export function ShopDetailScreenSkeleton({
  variant,
  gallerySize,
  isRTL = false,
  style,
}: Props) {
  const pulseStyle = useSkeletonPulse();
  const insets = useSafeAreaInsets();
  const isService = variant === 'service';

  return (
    <View style={[styles.root, style]}>
      <View style={[styles.gallery, { height: gallerySize }, isService && styles.galleryService]}>
        {isService ? (
          <SkeletonBlock style={styles.galleryIcon} pulseStyle={pulseStyle} />
        ) : null}
      </View>

      <View style={styles.content}>
        <View style={[styles.badgeRow, isRTL && styles.badgeRowRtl]}>
          <SkeletonBlock style={styles.badgeMd} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.badgeSm} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.badgeLg} pulseStyle={pulseStyle} />
        </View>

        <SkeletonBlock style={styles.title} pulseStyle={pulseStyle} />
        <SkeletonBlock style={[styles.title, styles.titleShort]} pulseStyle={pulseStyle} />

        {isService ? (
          <SkeletonBlock style={styles.entitlementBox} pulseStyle={pulseStyle} />
        ) : (
          <View style={[styles.ratingRow, isRTL && styles.ratingRowRtl]}>
            {Array.from({ length: 5 }, (_, i) => (
              <SkeletonBlock key={i} style={styles.ratingStar} pulseStyle={pulseStyle} />
            ))}
            <SkeletonBlock style={styles.ratingTxt} pulseStyle={pulseStyle} />
          </View>
        )}

        <SkeletonBlock style={styles.descLine} pulseStyle={pulseStyle} />
        <SkeletonBlock style={[styles.descLine, styles.descLineMid]} pulseStyle={pulseStyle} />
        <SkeletonBlock style={[styles.descLine, styles.descLineShort]} pulseStyle={pulseStyle} />

        <View style={isService ? styles.priceRowPlain : styles.priceCard}>
          <SkeletonBlock style={styles.price} pulseStyle={pulseStyle} />
          {!isService ? (
            <SkeletonBlock style={styles.priceCompare} pulseStyle={pulseStyle} />
          ) : null}
        </View>

        <SkeletonBlock style={styles.sectionTitle} pulseStyle={pulseStyle} />
        {Array.from({ length: isService ? 3 : 4 }, (_, i) => (
          <View key={i} style={[styles.featRow, isRTL && styles.featRowRtl]}>
            <SkeletonBlock style={styles.featIcon} pulseStyle={pulseStyle} />
            <SkeletonBlock
              style={[styles.featLine, i === 2 && styles.featLineShort]}
              pulseStyle={pulseStyle}
            />
          </View>
        ))}

        {isService ? (
          <SkeletonBlock style={styles.hintBox} pulseStyle={pulseStyle} />
        ) : (
          <>
            <View style={styles.divider} />
            <SkeletonBlock style={styles.sectionTitle} pulseStyle={pulseStyle} />
            <SkeletonBlock style={styles.establishmentRow} pulseStyle={pulseStyle} />
            <SkeletonBlock style={styles.establishmentRow} pulseStyle={pulseStyle} />
          </>
        )}

        <View style={{ height: 100 }} />
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
        <View style={styles.footerBtns}>
          <SkeletonBlock style={styles.addBtn} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.buyBtn} pulseStyle={pulseStyle} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: brand.white,
  },
  gallery: {
    width: '100%',
    backgroundColor: brand.backgroundSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryService: {
    backgroundColor: brand.primary,
  },
  galleryIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  content: {
    backgroundColor: brand.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
    zIndex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeRowRtl: {
    flexDirection: 'row-reverse',
  },
  badgeSm: {
    width: 72,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: SKELETON_BG,
  },
  badgeMd: {
    width: 88,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: SKELETON_BG_STRONG,
  },
  badgeLg: {
    width: 110,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: SKELETON_BG,
  },
  title: {
    width: '92%',
    height: 26,
    borderRadius: 6,
    backgroundColor: SKELETON_BG_STRONG,
  },
  titleShort: {
    width: '64%',
    height: 22,
    marginTop: -6,
  },
  entitlementBox: {
    width: '100%',
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: SKELETON_BG,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: -4,
  },
  ratingRowRtl: {
    flexDirection: 'row-reverse',
  },
  ratingStar: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: SKELETON_BG,
  },
  ratingTxt: {
    width: 48,
    height: 12,
    borderRadius: 3,
    marginStart: 6,
    backgroundColor: SKELETON_BG,
  },
  descLine: {
    width: '100%',
    height: 14,
    borderRadius: 4,
    backgroundColor: SKELETON_BG,
  },
  descLineMid: {
    width: '88%',
  },
  descLineShort: {
    width: '58%',
  },
  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: brand.backgroundSoft,
    borderWidth: 1,
    borderColor: brand.border,
  },
  priceRowPlain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: -4,
  },
  price: {
    width: 120,
    height: 32,
    borderRadius: 6,
    backgroundColor: SKELETON_BG_STRONG,
  },
  priceCompare: {
    width: 72,
    height: 18,
    borderRadius: 4,
    backgroundColor: SKELETON_BG,
  },
  sectionTitle: {
    width: 140,
    height: 16,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
    marginTop: 4,
  },
  featRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featRowRtl: {
    flexDirection: 'row-reverse',
  },
  featIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: SKELETON_BG,
  },
  featLine: {
    flex: 1,
    height: 14,
    borderRadius: 4,
    backgroundColor: SKELETON_BG,
  },
  featLineShort: {
    maxWidth: '72%',
    flex: 0,
    width: '72%',
  },
  hintBox: {
    width: '100%',
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: SKELETON_BG,
  },
  divider: {
    height: 1,
    backgroundColor: brand.border,
    marginVertical: -4,
  },
  establishmentRow: {
    width: '100%',
    height: 64,
    borderRadius: radius.md,
    backgroundColor: SKELETON_BG,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: brand.white,
    borderTopWidth: 1,
    borderTopColor: brand.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  footerBtns: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  addBtn: {
    width: 120,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: SKELETON_BG,
  },
  buyBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: SKELETON_BG_STRONG,
  },
});
