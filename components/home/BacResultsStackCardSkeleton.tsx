import { StyleSheet, View } from 'react-native';

import { SkeletonBlock, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import type { StackCardLayout } from '@/components/home/stackCardLayout';

type Props = {
  layout: StackCardLayout;
  isRTL?: boolean;
  /** Réserver le placeholder du bouton seuils (résultats publiés ou en cours de chargement). */
  showThresholdsCta?: boolean;
  /** Carte en arrière-plan (peek) : masquer le CTA seuils. */
  hideThresholdsCta?: boolean;
};

function OutletRowSkeleton({
  pulseStyle,
  layout,
  isRTL,
}: {
  pulseStyle: ReturnType<typeof useSkeletonPulse>;
  layout: StackCardLayout;
  isRTL?: boolean;
}) {
  const fs = Math.max(9, layout.validityLabel);
  return (
    <View style={[styles.outletRow, isRTL && styles.rowRtl]}>
      <View style={[styles.outletLeft, isRTL && styles.outletLeftRtl]}>
        <SkeletonBlock style={styles.outletIconSk} pulseStyle={pulseStyle} />
        <View style={styles.outletLabelCol}>
          <SkeletonBlock
            style={[styles.outletLabelSk, { height: fs + 2 }]}
            pulseStyle={pulseStyle}
          />
          <SkeletonBlock style={styles.outletHintSk} pulseStyle={pulseStyle} />
        </View>
      </View>
      <SkeletonBlock
        style={[styles.outletTagSk, isRTL && styles.outletTagSkRtl]}
        pulseStyle={pulseStyle}
      />
    </View>
  );
}

/** Squelette pulse de la carte résultats du bac (structure proche du contenu réel). */
export function BacResultsStackCardSkeleton({
  layout,
  isRTL = false,
  showThresholdsCta = true,
  hideThresholdsCta = false,
}: Props) {
  const pulseStyle = useSkeletonPulse();
  const fsTitle = Math.max(13, layout.packName - 2);
  const gap = Math.max(8, layout.validityMT);

  return (
    <View style={[styles.root, { gap, marginTop: layout.packNameMT }]}>
      <View style={[styles.headerRow, isRTL && styles.rowRtl]}>
        <View style={styles.headerText}>
          <SkeletonBlock
            style={[styles.titleSk, { height: fsTitle }]}
            pulseStyle={pulseStyle}
          />
          <SkeletonBlock style={styles.dateSk} pulseStyle={pulseStyle} />
        </View>
        <SkeletonBlock
          style={[styles.statusTagSk, isRTL && styles.statusTagSkRtl]}
          pulseStyle={pulseStyle}
        />
      </View>

      <SkeletonBlock style={styles.countdownSk} pulseStyle={pulseStyle} />

      <View
        style={[
          styles.outletsCard,
          { padding: layout.boxPad, borderRadius: layout.boxRadius },
        ]}>
        <SkeletonBlock style={styles.outletsTitleSk} pulseStyle={pulseStyle} />
        <OutletRowSkeleton pulseStyle={pulseStyle} layout={layout} isRTL={isRTL} />
        <OutletRowSkeleton pulseStyle={pulseStyle} layout={layout} isRTL={isRTL} />
        <OutletRowSkeleton pulseStyle={pulseStyle} layout={layout} isRTL={isRTL} />
      </View>

      {showThresholdsCta && !hideThresholdsCta ? (
        <BacThresholdsCtaSkeleton pulseStyle={pulseStyle} isRTL={isRTL} />
      ) : null}
    </View>
  );
}

/** Placeholder du bouton « calcul des seuils » (chargement résultats bac / profil). */
export function BacThresholdsCtaSkeleton({
  pulseStyle,
  isRTL = false,
}: {
  pulseStyle: ReturnType<typeof useSkeletonPulse>;
  isRTL?: boolean;
}) {
  return (
    <View style={styles.thresholdsCtaOuter}>
      <View style={[styles.thresholdsCtaSk, isRTL && styles.rowRtl]}>
        <SkeletonBlock style={styles.thresholdsCtaIconSk} pulseStyle={pulseStyle} />
        <View style={styles.thresholdsCtaTextSk}>
          <SkeletonBlock style={styles.thresholdsCtaTitleSk} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.thresholdsCtaSubSk} pulseStyle={pulseStyle} />
        </View>
        <SkeletonBlock style={styles.thresholdsCtaArrowSk} pulseStyle={pulseStyle} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
    gap: 8,
    minWidth: 0,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    width: '100%',
    minWidth: 0,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    gap: 8,
  },
  titleSk: {
    width: '78%',
    borderRadius: 6,
    backgroundColor: 'rgba(51, 62, 143, 0.16)',
  },
  dateSk: {
    width: '62%',
    height: 11,
    borderRadius: 4,
    backgroundColor: 'rgba(51, 62, 143, 0.1)',
  },
  statusTagSk: {
    width: 72,
    height: 26,
    borderRadius: 999,
    backgroundColor: 'rgba(51, 62, 143, 0.12)',
    flexShrink: 1,
  },
  statusTagSkRtl: {
    width: 88,
    height: 30,
  },
  countdownSk: {
    width: '100%',
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
  },
  outletsCard: {
    width: '100%',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(51, 62, 143, 0.12)',
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    gap: 10,
  },
  outletsTitleSk: {
    width: '48%',
    height: 11,
    borderRadius: 4,
    backgroundColor: 'rgba(51, 62, 143, 0.12)',
  },
  outletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 4,
    width: '100%',
    minWidth: 0,
  },
  outletLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  outletLeftRtl: {
    flexDirection: 'row-reverse',
  },
  outletIconSk: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(51, 62, 143, 0.14)',
  },
  outletLabelCol: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  outletLabelSk: {
    width: '85%',
    borderRadius: 4,
    backgroundColor: 'rgba(51, 62, 143, 0.14)',
  },
  outletHintSk: {
    width: '55%',
    height: 9,
    borderRadius: 3,
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
  },
  outletTagSk: {
    width: 64,
    height: 22,
    borderRadius: 999,
    backgroundColor: 'rgba(51, 62, 143, 0.1)',
    flexShrink: 0,
  },
  outletTagSkRtl: {
    width: 80,
    height: 26,
  },
  thresholdsCtaOuter: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    maxWidth: '100%',
    flexShrink: 0,
    borderRadius: 12,
    marginTop: 4,
  },
  thresholdsCtaSk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    minHeight: 56,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(51, 62, 143, 0.1)',
  },
  thresholdsCtaIconSk: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(51, 62, 143, 0.16)',
  },
  thresholdsCtaTextSk: {
    flex: 1,
    minWidth: 0,
    gap: 8,
  },
  thresholdsCtaTitleSk: {
    width: '72%',
    height: 14,
    borderRadius: 4,
    backgroundColor: 'rgba(51, 62, 143, 0.16)',
  },
  thresholdsCtaSubSk: {
    width: '88%',
    height: 10,
    borderRadius: 3,
    backgroundColor: 'rgba(51, 62, 143, 0.1)',
  },
  thresholdsCtaArrowSk: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(51, 62, 143, 0.14)',
  },
});
