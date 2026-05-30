import { StyleSheet, View } from 'react-native';

import { HomeFeedHorizontalScroll } from '@/components/home/HomeFeedHorizontalScroll';
import { practicalLinkCardShadow } from '@/components/home/HomeFeedSection';
import { homeSectionHeaderStyles as header } from '@/components/home/homeSectionHeaderStyles';
import { SkeletonBlock, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import { homeShell } from '@/theme/homeShell';
import { brand, radius, spacing } from '@/theme/tokens';

const CARD_W = 144;
const CARD_H = 112;
const PLACEHOLDER_COUNT = 4;

type Props = {
  width: number;
  isRTL?: boolean;
};

function PracticalCardSkeleton({ isRTL }: { isRTL: boolean }) {
  const pulseStyle = useSkeletonPulse();
  return (
    <View style={styles.card}>
      <View style={styles.topBarSk} />
      <View style={[styles.cardBody, isRTL && styles.cardBodyRtl]}>
        <View style={styles.heroRow}>
          <SkeletonBlock style={styles.iconSk} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.arrowSk} pulseStyle={pulseStyle} />
        </View>
        <View style={styles.textBlock}>
          <SkeletonBlock style={[styles.labelSk, isRTL && header.alignEnd]} pulseStyle={pulseStyle} />
        </View>
      </View>
    </View>
  );
}

/** Carrousel horizontal liens pratiques (accueil). */
export function HomePracticalInfoSectionSkeleton({ width, isRTL = false }: Props) {
  const pulseStyle = useSkeletonPulse();

  return (
    <View style={[header.sectionWrap, { width }, isRTL && header.sectionWrapRtl]}>
      <View style={[header.titleRow, isRTL && header.titleRowRtl]}>
        <View style={[header.titleLeft, isRTL && header.titleLeftRtl]}>
          <SkeletonBlock style={header.titleAccentSk} pulseStyle={pulseStyle} />
          <View style={[header.titleTextCol, isRTL && header.titleTextColRtl]}>
            <SkeletonBlock style={[header.titleSk, isRTL && header.alignEnd]} pulseStyle={pulseStyle} />
          </View>
        </View>
      </View>
      <SkeletonBlock
        style={[header.subtitleSk, isRTL && header.subtitleSkRtl, isRTL && header.alignEnd]}
        pulseStyle={pulseStyle}
      />

      <HomeFeedHorizontalScroll isRTL={isRTL}>
        {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
          <View key={i} style={[styles.cardSlot, styles.cardShadowHost, practicalLinkCardShadow]}>
            <PracticalCardSkeleton isRTL={isRTL} />
          </View>
        ))}
      </HomeFeedHorizontalScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  cardSlot: {
    width: CARD_W,
    height: CARD_H,
    marginVertical: 2,
  },
  cardShadowHost: {
    borderRadius: radius.lg,
    backgroundColor: brand.white,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: radius.lg,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    overflow: 'hidden',
  },
  topBarSk: {
    height: 3,
    backgroundColor: 'rgba(51, 62, 143, 0.14)',
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingTop: spacing.sm + 4,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  cardBodyRtl: {
    direction: 'rtl',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  iconSk: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(51, 62, 143, 0.12)',
  },
  arrowSk: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
  },
  textBlock: {
    gap: 4,
  },
  labelSk: {
    width: '92%',
    height: 28,
    borderRadius: 4,
    backgroundColor: 'rgba(51, 62, 143, 0.12)',
  },
});
