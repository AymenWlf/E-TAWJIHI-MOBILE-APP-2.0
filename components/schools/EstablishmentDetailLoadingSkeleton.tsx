import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AnnouncementCardSkeletonStack } from '@/components/inscriptions/AnnouncementCardSkeleton';
import { SkeletonBlock, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

type Props = {
  isRTL?: boolean;
  bottomInset?: number;
  style?: StyleProp<ViewStyle>;
};

const SK = 'rgba(51, 62, 143, 0.1)';
const SK_STRONG = 'rgba(51, 62, 143, 0.16)';

function SectionShell({
  pulseStyle,
  isRTL,
  titleWidth = '42%',
  children,
}: {
  pulseStyle: ReturnType<typeof useSkeletonPulse>;
  isRTL?: boolean;
  titleWidth?: `${number}%`;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <SkeletonBlock
        style={[styles.sectionTitle, { width: titleWidth, alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}
        pulseStyle={pulseStyle}
      />
      {children}
    </View>
  );
}

function SummaryGridSkeleton({
  pulseStyle,
  isRTL,
}: {
  pulseStyle: ReturnType<typeof useSkeletonPulse>;
  isRTL?: boolean;
}) {
  return (
    <View style={[styles.grid, isRTL && styles.gridRtl]}>
      {Array.from({ length: 6 }, (_, i) => (
        <View key={i} style={[styles.cell, isRTL && styles.cellRtl]}>
          <SkeletonBlock style={styles.cellIcon} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.cellLabel} pulseStyle={pulseStyle} />
          <SkeletonBlock style={[styles.cellValue, i % 3 === 0 ? styles.cellValueShort : null]} pulseStyle={pulseStyle} />
        </View>
      ))}
    </View>
  );
}

function TextBlockSkeleton({
  pulseStyle,
  isRTL,
  lines = 4,
}: {
  pulseStyle: ReturnType<typeof useSkeletonPulse>;
  isRTL?: boolean;
  lines?: number;
}) {
  return (
    <View style={[styles.textBlock, isRTL && styles.textBlockRtl]}>
      {Array.from({ length: lines }, (_, i) => (
        <SkeletonBlock
          key={i}
          style={[
            styles.textLine,
            i === lines - 1 ? styles.textLineShort : null,
            isRTL && styles.textLineRtl,
          ]}
          pulseStyle={pulseStyle}
        />
      ))}
    </View>
  );
}

/**
 * Placeholder de chargement aligné sur la fiche détail établissement
 * (hero centré, grille résumé, présentation, annonces…).
 */
export function EstablishmentDetailLoadingSkeleton({
  isRTL = false,
  bottomInset = 0,
  style,
}: Props) {
  const pulseStyle = useSkeletonPulse();

  return (
    <ScrollView
      style={[styles.scroll, style]}
      contentContainerStyle={[styles.content, { paddingBottom: spacing.section + bottomInset + spacing.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <SkeletonBlock style={styles.logoRing} pulseStyle={pulseStyle} />
        <SkeletonBlock style={styles.name} pulseStyle={pulseStyle} />
        <SkeletonBlock style={styles.sigle} pulseStyle={pulseStyle} />
        <View style={[styles.badgeWrap, isRTL && styles.badgeWrapRtl]}>
          <SkeletonBlock style={styles.badgePill} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.badgePillWide} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.badgePill} pulseStyle={pulseStyle} />
        </View>
        <SkeletonBlock style={styles.followBtn} pulseStyle={pulseStyle} />
        <View style={[styles.locRow, isRTL && styles.rowRtl]}>
          <SkeletonBlock style={styles.locIcon} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.locTxt} pulseStyle={pulseStyle} />
        </View>
      </View>

      <SectionShell pulseStyle={pulseStyle} isRTL={isRTL} titleWidth="38%">
        <SummaryGridSkeleton pulseStyle={pulseStyle} isRTL={isRTL} />
      </SectionShell>

      <SkeletonBlock style={styles.bannerSquare} pulseStyle={pulseStyle} />

      <SectionShell pulseStyle={pulseStyle} isRTL={isRTL} titleWidth="48%">
        <TextBlockSkeleton pulseStyle={pulseStyle} isRTL={isRTL} lines={5} />
      </SectionShell>

      <SectionShell pulseStyle={pulseStyle} isRTL={isRTL} titleWidth="44%">
        <TextBlockSkeleton pulseStyle={pulseStyle} isRTL={isRTL} lines={3} />
      </SectionShell>

      <SectionShell pulseStyle={pulseStyle} isRTL={isRTL} titleWidth="52%">
        <AnnouncementCardSkeletonStack count={2} isRTL={isRTL} withCover />
      </SectionShell>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.section,
  },
  heroCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    backgroundColor: homeShell.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  logoRing: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: SK,
    marginBottom: spacing.md,
  },
  name: {
    width: '72%',
    height: 22,
    borderRadius: 6,
    backgroundColor: SK_STRONG,
  },
  sigle: {
    width: '48%',
    height: 14,
    borderRadius: 4,
    backgroundColor: SK,
    marginTop: spacing.sm,
  },
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.md,
    width: '100%',
  },
  badgeWrapRtl: {
    flexDirection: 'row-reverse',
  },
  badgePill: {
    width: 72,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: SK,
  },
  badgePillWide: {
    width: 96,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: SK,
  },
  followBtn: {
    width: 148,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: SK_STRONG,
    marginTop: spacing.md,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.lg,
    width: '88%',
    justifyContent: 'center',
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  locIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: SK,
  },
  locTxt: {
    flex: 1,
    height: 14,
    borderRadius: 4,
    backgroundColor: SK,
    maxWidth: '85%',
  },
  section: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.xl,
    backgroundColor: homeShell.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
  },
  sectionTitle: {
    height: 12,
    borderRadius: 4,
    backgroundColor: SK_STRONG,
    marginBottom: spacing.md,
  },
  bannerSquare: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    height: 120,
    borderRadius: radius.lg,
    backgroundColor: SK,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridRtl: {
    flexDirection: 'row-reverse',
  },
  cell: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    gap: 6,
    minHeight: 96,
  },
  cellRtl: {
    alignItems: 'flex-end',
  },
  cellIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: SK,
  },
  cellLabel: {
    width: '58%',
    height: 10,
    borderRadius: 3,
    backgroundColor: SK,
    marginTop: 2,
  },
  cellValue: {
    width: '88%',
    height: 14,
    borderRadius: 4,
    backgroundColor: SK_STRONG,
  },
  cellValueShort: {
    width: '64%',
  },
  textBlock: {
    gap: spacing.sm,
    width: '100%',
  },
  textBlockRtl: {
    alignItems: 'flex-end',
  },
  textLine: {
    width: '100%',
    height: 14,
    borderRadius: 4,
    backgroundColor: SK,
  },
  textLineShort: {
    width: '68%',
  },
  textLineRtl: {
    alignSelf: 'flex-end',
  },
  eligibilityWrap: {
    gap: spacing.sm,
    width: '100%',
  },
  eligibilityLine: {
    width: '92%',
    height: 14,
    borderRadius: 4,
    backgroundColor: SK,
  },
  eligibilityLineShort: {
    width: '76%',
  },
  eligibilityBtn: {
    width: 160,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: SK_STRONG,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
});

/** Lignes compactes pour le bloc éligibilité (section déjà titrée). */
export function EstablishmentEligibilityLoadingSkeleton({
  isRTL = false,
  style,
}: {
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const pulseStyle = useSkeletonPulse();
  return (
    <View style={[styles.eligibilityWrap, isRTL && styles.textBlockRtl, style]}>
      <SkeletonBlock style={styles.eligibilityLine} pulseStyle={pulseStyle} />
      <SkeletonBlock style={[styles.eligibilityLine, styles.eligibilityLineShort]} pulseStyle={pulseStyle} />
      <SkeletonBlock style={styles.eligibilityBtn} pulseStyle={pulseStyle} />
    </View>
  );
}
