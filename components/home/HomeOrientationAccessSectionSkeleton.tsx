import { Platform, StyleSheet, View } from 'react-native';

import { homeSectionHeaderStyles as header } from '@/components/home/homeSectionHeaderStyles';
import { ORIENTATION_PRACTICAL_LINK_DEFS } from '@/constants/practicalLinks';
import { SkeletonBlock, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import { brand, radius, spacing } from '@/theme/tokens';

const CARD_GAP = spacing.sm;
const ICON_BOX = 52;
const TILE_COUNT = ORIENTATION_PRACTICAL_LINK_DEFS.length;

const shadowCard =
  Platform.OS === 'android'
    ? { elevation: 6 }
    : {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      };

type Props = {
  width: number;
  isRTL?: boolean;
  showParcoursBtn?: boolean;
};

function TileSkeleton({ size, isRTL }: { size: number; isRTL: boolean }) {
  const pulseStyle = useSkeletonPulse();
  return (
    <View style={[styles.tile, shadowCard, { width: size, height: size }]}>
      <View style={[styles.tileContent, isRTL && styles.tileContentRtl]}>
        <SkeletonBlock style={styles.iconSk} pulseStyle={pulseStyle} />
        <View style={styles.labelCol}>
          <SkeletonBlock style={styles.labelSk} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.labelSkMid} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.labelSkShort} pulseStyle={pulseStyle} />
        </View>
      </View>
    </View>
  );
}

/** Grille diagnostic + recommandations (accueil) — 2 tuiles comme le contenu réel. */
export function HomeOrientationAccessSectionSkeleton({
  width,
  isRTL = false,
  showParcoursBtn = true,
}: Props) {
  const pulseStyle = useSkeletonPulse();
  const cardSize = TILE_COUNT <= 1 ? width : (width - CARD_GAP) / 2;

  return (
    <View style={[header.sectionWrap, { width }, isRTL && header.sectionWrapRtl]}>
      <View
        style={[
          header.titleRow,
          header.titleRowWithTrailing,
          isRTL && header.titleRowRtl,
        ]}>
        <View style={[header.titleLeft, isRTL && header.titleLeftRtl]}>
          <SkeletonBlock style={header.titleAccentSk} pulseStyle={pulseStyle} />
          <View style={[header.titleTextCol, isRTL && header.titleTextColRtl]}>
            <SkeletonBlock style={[header.titleSk, isRTL && header.alignEnd]} pulseStyle={pulseStyle} />
          </View>
        </View>
        {showParcoursBtn ? (
          <SkeletonBlock style={styles.parcoursBtnSk} pulseStyle={pulseStyle} />
        ) : null}
      </View>
      <SkeletonBlock
        style={[header.subtitleSk, isRTL && header.subtitleSkRtl, isRTL && header.alignEnd]}
        pulseStyle={pulseStyle}
      />

      <View style={[styles.grid, isRTL && styles.gridRtl]}>
        {Array.from({ length: TILE_COUNT }, (_, i) => (
          <TileSkeleton key={i} size={cardSize} isRTL={isRTL} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  parcoursBtnSk: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(51, 62, 143, 0.1)',
    flexShrink: 0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: CARD_GAP,
  },
  gridRtl: {
    direction: 'rtl',
  },
  tile: {
    borderRadius: radius.lg,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.07)',
    borderTopWidth: 3,
    borderTopColor: 'rgba(51, 62, 143, 0.18)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    overflow: 'hidden',
  },
  tileContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: 2,
  },
  tileContentRtl: {
    direction: 'rtl',
  },
  labelCol: {
    width: '100%',
    alignItems: 'center',
    gap: 5,
  },
  iconSk: {
    width: ICON_BOX,
    height: ICON_BOX,
    borderRadius: 12,
    backgroundColor: 'rgba(51, 62, 143, 0.12)',
  },
  labelSk: {
    width: '82%',
    height: 11,
    borderRadius: 4,
    backgroundColor: 'rgba(51, 62, 143, 0.12)',
  },
  labelSkMid: {
    width: '68%',
    height: 11,
    borderRadius: 4,
    backgroundColor: 'rgba(51, 62, 143, 0.1)',
  },
  labelSkShort: {
    width: '52%',
    height: 11,
    borderRadius: 4,
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
  },
});
