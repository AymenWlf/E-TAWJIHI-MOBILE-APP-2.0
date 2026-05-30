import { StyleSheet, View } from 'react-native';

import { SkeletonBlock, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import { radius, spacing } from '@/theme/tokens';

type Props = {
  isRTL?: boolean;
};

/** Placeholder recherche + filtres (écoles sup) pendant chargement droits TAWJIH PLUS. */
export function SchoolsSearchFiltersSkeleton({ isRTL = false }: Props) {
  const pulseStyle = useSkeletonPulse();

  return (
    <View style={styles.root} accessibilityLabel="Chargement recherche et filtres">
      <SkeletonBlock style={styles.searchSk} pulseStyle={pulseStyle} />
      <View style={[styles.filterRow, isRTL && styles.filterRowRtl]}>
        <SkeletonBlock style={styles.filtersSk} pulseStyle={pulseStyle} />
        <SkeletonBlock style={styles.heartSk} pulseStyle={pulseStyle} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm,
    width: '100%',
  },
  searchSk: {
    width: '100%',
    height: 46,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(51, 62, 143, 0.1)',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  filterRowRtl: {
    flexDirection: 'row-reverse',
  },
  filtersSk: {
    flex: 1,
    minWidth: 0,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(51, 62, 143, 0.12)',
  },
  heartSk: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(51, 62, 143, 0.1)',
  },
});
