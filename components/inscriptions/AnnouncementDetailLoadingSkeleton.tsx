import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { SkeletonBlock, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import { brand, radius, spacing } from '@/theme/tokens';

type Props = {
  isRTL?: boolean;
  /** Padding haut (safe area + top bar), comme `insets.top + 6`. */
  topInset?: number;
  /** Padding bas du CTA sticky (safe area). */
  bottomInset?: number;
  style?: StyleProp<ViewStyle>;
};

const SK = 'rgba(51, 62, 143, 0.12)';
const SK_STRONG = 'rgba(51, 62, 143, 0.18)';
const SK_ON_DARK = 'rgba(255, 255, 255, 0.32)';

function SectionSkeleton({
  pulseStyle,
  isRTL,
  lines = 2,
  tall,
}: {
  pulseStyle: ReturnType<typeof useSkeletonPulse>;
  isRTL?: boolean;
  lines?: number;
  tall?: boolean;
}) {
  return (
    <View style={styles.section}>
      <View style={[styles.sectionHeader, isRTL && styles.rowRtl]}>
        <SkeletonBlock style={styles.sectionIcon} pulseStyle={pulseStyle} />
        <SkeletonBlock style={styles.sectionTitle} pulseStyle={pulseStyle} />
      </View>
      <View style={{ gap: spacing.sm }}>
        {tall ? <SkeletonBlock style={styles.sectionBlockTall} pulseStyle={pulseStyle} /> : null}
        {Array.from({ length: lines }, (_, i) => (
          <SkeletonBlock
            key={i}
            style={[styles.sectionLine, i === lines - 1 && lines > 1 ? styles.sectionLineShort : null]}
            pulseStyle={pulseStyle}
          />
        ))}
      </View>
    </View>
  );
}

/**
 * Placeholder de chargement aligné sur la fiche détail annonce concours
 * (cover, carte école, actions, titre, statut, sections, CTA sticky).
 */
export function AnnouncementDetailLoadingSkeleton({
  isRTL = false,
  topInset = 0,
  bottomInset = 0,
  style,
}: Props) {
  const pulseStyle = useSkeletonPulse();

  return (
    <View style={[styles.root, style]}>
      <View style={[styles.topBar, { paddingTop: topInset }]}>
        <SkeletonBlock style={[styles.topIcon, { backgroundColor: SK_ON_DARK }]} pulseStyle={pulseStyle} />
        <SkeletonBlock style={[styles.topTitle, { backgroundColor: SK_ON_DARK }]} pulseStyle={pulseStyle} />
        <View style={[styles.topRight, isRTL && styles.rowRtl]}>
          <SkeletonBlock style={[styles.topIcon, { backgroundColor: SK_ON_DARK }]} pulseStyle={pulseStyle} />
          <SkeletonBlock style={[styles.langSwitch, { backgroundColor: SK_ON_DARK }]} pulseStyle={pulseStyle} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SkeletonBlock style={styles.cover} pulseStyle={pulseStyle} />

        <View style={[styles.headerCard, isRTL && styles.rowRtl]}>
          <SkeletonBlock style={styles.estLogo} pulseStyle={pulseStyle} />
          <View style={styles.headerTextCol}>
            <SkeletonBlock style={styles.estName} pulseStyle={pulseStyle} />
            <SkeletonBlock style={styles.estNameShort} pulseStyle={pulseStyle} />
            <View style={[styles.estMetaRow, isRTL && styles.rowRtl]}>
              <SkeletonBlock style={styles.siglePill} pulseStyle={pulseStyle} />
              <SkeletonBlock style={styles.typePill} pulseStyle={pulseStyle} />
            </View>
            <View style={[styles.villeRow, isRTL && styles.rowRtl]}>
              <SkeletonBlock style={styles.villeIcon} pulseStyle={pulseStyle} />
              <SkeletonBlock style={styles.villeTxt} pulseStyle={pulseStyle} />
            </View>
          </View>
        </View>

        <View style={[styles.estActionsRow, isRTL && styles.rowRtl]}>
          <SkeletonBlock style={styles.estActionBtn} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.estActionBtn} pulseStyle={pulseStyle} />
        </View>

        <View style={[styles.titleBlock, isRTL && styles.titleBlockRtl]}>
          <SkeletonBlock style={styles.typeChip} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.titleLine} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.titleLineShort} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.countdown} pulseStyle={pulseStyle} />
          <View style={[styles.badgeRow, isRTL && styles.rowRtl]}>
            <SkeletonBlock style={styles.badge} pulseStyle={pulseStyle} />
            <SkeletonBlock style={styles.badgeWide} pulseStyle={pulseStyle} />
          </View>
        </View>

        <View style={styles.candidacyBlock}>
          <View style={[styles.candidacyRow, isRTL && styles.rowRtl]}>
            <View style={{ flex: 1, gap: 8 }}>
              <SkeletonBlock style={styles.candidacyEyebrow} pulseStyle={pulseStyle} />
              <SkeletonBlock style={styles.candidacyBadge} pulseStyle={pulseStyle} />
            </View>
            <SkeletonBlock style={styles.candidacyBtn} pulseStyle={pulseStyle} />
          </View>
        </View>

        <SectionSkeleton pulseStyle={pulseStyle} isRTL={isRTL} lines={2} />
        <SectionSkeleton pulseStyle={pulseStyle} isRTL={isRTL} lines={4} tall />
        <SectionSkeleton pulseStyle={pulseStyle} isRTL={isRTL} lines={3} />

        <View style={styles.qnaBlock}>
          <View style={[styles.sectionHeader, isRTL && styles.rowRtl]}>
            <SkeletonBlock style={styles.sectionIcon} pulseStyle={pulseStyle} />
            <SkeletonBlock style={[styles.sectionTitle, { width: '55%' }]} pulseStyle={pulseStyle} />
          </View>
          <SkeletonBlock style={styles.qnaComposer} pulseStyle={pulseStyle} />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomInset + 12 }]}>
        <SkeletonBlock style={styles.cta} pulseStyle={pulseStyle} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.backgroundSoft },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.section + 88 },
  rowRtl: { flexDirection: 'row-reverse' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: brand.primary,
    gap: spacing.sm,
  },
  topIcon: { width: 36, height: 36, borderRadius: radius.full },
  topTitle: { flex: 1, height: 16, borderRadius: 4, maxWidth: '38%' },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  langSwitch: { width: 72, height: 32, borderRadius: radius.full },

  cover: {
    width: '100%',
    height: 170,
    backgroundColor: SK,
  },

  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: brand.white,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: -32,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  headerTextCol: { flex: 1, gap: 6 },
  estLogo: {
    width: 54,
    height: 54,
    borderRadius: radius.sm,
    backgroundColor: SK,
  },
  estName: { height: 16, borderRadius: 4, backgroundColor: SK_STRONG, width: '92%' },
  estNameShort: { height: 14, borderRadius: 4, backgroundColor: SK, width: '68%' },
  estMetaRow: { flexDirection: 'row', gap: 6, marginTop: 2 },
  siglePill: { width: 48, height: 18, borderRadius: radius.sm, backgroundColor: SK },
  typePill: { width: 56, height: 18, borderRadius: radius.sm, backgroundColor: SK },
  villeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  villeIcon: { width: 11, height: 11, borderRadius: 6, backgroundColor: SK },
  villeTxt: { flex: 1, height: 12, borderRadius: 4, backgroundColor: SK },

  estActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  estActionBtn: {
    flex: 1,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: SK,
  },

  titleBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  titleBlockRtl: { alignItems: 'flex-end' },
  typeChip: { width: 88, height: 24, borderRadius: radius.full, backgroundColor: SK },
  titleLine: { width: '96%', height: 22, borderRadius: 5, backgroundColor: SK_STRONG },
  titleLineShort: { width: '72%', height: 22, borderRadius: 5, backgroundColor: SK },
  countdown: { width: 140, height: 32, borderRadius: radius.md, backgroundColor: SK },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 2 },
  badge: { width: 72, height: 24, borderRadius: radius.full, backgroundColor: SK },
  badgeWide: { width: 110, height: 24, borderRadius: radius.full, backgroundColor: SK },

  candidacyBlock: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  candidacyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  candidacyEyebrow: { width: 120, height: 10, borderRadius: 3, backgroundColor: SK },
  candidacyBadge: { width: 96, height: 26, borderRadius: radius.full, backgroundColor: SK },
  candidacyBtn: { width: 108, height: 36, borderRadius: radius.full, backgroundColor: SK_STRONG },

  section: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionIcon: { width: 14, height: 14, borderRadius: 3, backgroundColor: SK_STRONG },
  sectionTitle: { flex: 1, height: 16, borderRadius: 4, backgroundColor: SK_STRONG, maxWidth: '64%' },
  sectionLine: { height: 12, borderRadius: 4, backgroundColor: SK, width: '100%' },
  sectionLineShort: { width: '78%' },
  sectionBlockTall: {
    height: 72,
    borderRadius: radius.md,
    backgroundColor: SK,
    marginBottom: spacing.xs,
  },

  qnaBlock: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  qnaComposer: {
    height: 44,
    borderRadius: radius.md,
    backgroundColor: SK,
  },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: brand.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.border,
  },
  cta: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: SK_STRONG,
  },
});
