import { StyleSheet, View } from 'react-native';

import { SkeletonBlock, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import { radius, spacing } from '@/theme/tokens';

type Props = {
  isRTL?: boolean;
};

/** Placeholder barre filtres onglet Annonces (chargement droits TAWJIH PLUS). */
export function InscriptionsAnnouncementsFiltersSkeleton({ isRTL = false }: Props) {
  const pulseStyle = useSkeletonPulse();

  return (
    <View style={styles.root} accessibilityLabel="Chargement filtres annonces">
      <SkeletonBlock style={styles.schoolSk} pulseStyle={pulseStyle} />
      <View style={[styles.row, isRTL && styles.rowRtl]}>
        <SkeletonBlock style={styles.btnSk} pulseStyle={pulseStyle} />
        <SkeletonBlock style={styles.btnSkWide} pulseStyle={pulseStyle} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm,
    width: '100%',
  },
  schoolSk: {
    width: '100%',
    height: 52,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51, 62, 143, 0.1)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  btnSk: {
    width: 128,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: 'rgba(51, 62, 143, 0.1)',
  },
  btnSkWide: {
    flex: 1,
    minWidth: 100,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
  },
});
