import { StyleSheet, View } from 'react-native';

import { homeShell } from '@/theme/homeShell';
import { spacing } from '@/theme/tokens';

type Props = {
  total: number;
  activeIndex: number;
  /** Dots clairs sur fond sombre */
  onDark?: boolean;
  /** Marge réduite au-dessus (ex. sous un court libellé). */
  compact?: boolean;
  /** Ordre des pastilles aligné sur un scroll horizontal RTL (arabe). */
  rtl?: boolean;
};

export function PaginationDots({ total, activeIndex, onDark = true, compact = false, rtl = false }: Props) {
  return (
    <View style={[styles.row, compact && styles.rowCompact, rtl && styles.rowRtl]}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            onDark
              ? i === activeIndex
                ? styles.dotActiveDark
                : styles.dotIdleDark
              : i === activeIndex
                ? styles.dotActiveLight
                : styles.dotIdleLight,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  rowCompact: {
    marginTop: spacing.xs,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActiveDark: {
    backgroundColor: homeShell.blue,
    width: 22,
    borderRadius: 4,
  },
  dotIdleDark: {
    backgroundColor: homeShell.dotInactive,
  },
  dotActiveLight: {
    backgroundColor: homeShell.blueDeep,
    width: 22,
    borderRadius: 4,
  },
  dotIdleLight: {
    backgroundColor: homeShell.dotInactiveOnLight,
  },
});
