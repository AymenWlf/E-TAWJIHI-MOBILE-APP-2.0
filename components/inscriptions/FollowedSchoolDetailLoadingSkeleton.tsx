import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AnnouncementCardSkeleton } from '@/components/inscriptions/AnnouncementCardSkeleton';
import { SkeletonBlock, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import { homeShell } from '@/theme/homeShell';
import { brand, radius, spacing } from '@/theme/tokens';

type Props = {
  isRTL?: boolean;
  topInset?: number;
  bottomInset?: number;
  style?: StyleProp<ViewStyle>;
};

const SK = 'rgba(51, 62, 143, 0.12)';
const SK_STRONG = 'rgba(51, 62, 143, 0.18)';
const SK_ON_DARK = 'rgba(255, 255, 255, 0.32)';
const SK_ON_DARK_PILL = 'rgba(255, 255, 255, 0.22)';

function TimelineEventSkeleton({
  pulseStyle,
  isRTL,
}: {
  pulseStyle: ReturnType<typeof useSkeletonPulse>;
  isRTL?: boolean;
}) {
  return (
    <View style={[styles.eventCard, isRTL && styles.rowRtl]}>
      <SkeletonBlock style={styles.eventDot} pulseStyle={pulseStyle} />
      <View style={{ flex: 1, gap: 6 }}>
        <SkeletonBlock style={styles.eventMsg} pulseStyle={pulseStyle} />
        <SkeletonBlock style={styles.eventMeta} pulseStyle={pulseStyle} />
      </View>
    </View>
  );
}

/**
 * Placeholder de chargement aligné sur l'écran « Suivi de l'école »
 * (hero, carte école, statut, stats, timeline, annonces).
 */
export function FollowedSchoolDetailLoadingSkeleton({
  isRTL = false,
  topInset = 0,
  bottomInset = 0,
  style,
}: Props) {
  const pulseStyle = useSkeletonPulse();

  return (
    <View style={[styles.root, style]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomInset + spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { paddingTop: topInset + 6 }]}>
          <View style={[styles.heroTopBar, isRTL && styles.rowRtl]}>
            <SkeletonBlock style={[styles.iconBtn, { backgroundColor: SK_ON_DARK }]} pulseStyle={pulseStyle} />
            <SkeletonBlock style={[styles.heroTitle, { backgroundColor: SK_ON_DARK }]} pulseStyle={pulseStyle} />
            <SkeletonBlock style={[styles.langSwitch, { backgroundColor: SK_ON_DARK }]} pulseStyle={pulseStyle} />
          </View>

          <View style={[styles.estCard, isRTL && styles.rowRtl]}>
            <SkeletonBlock style={styles.estLogo} pulseStyle={pulseStyle} />
            <View style={styles.estTextCol}>
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
            <SkeletonBlock style={styles.estChevron} pulseStyle={pulseStyle} />
          </View>

          <View style={[styles.statusBlock, isRTL && styles.rowRtl]}>
            <View style={{ flex: 1, gap: 8 }}>
              <SkeletonBlock style={styles.statusEyebrow} pulseStyle={pulseStyle} />
              <SkeletonBlock style={styles.statusBadge} pulseStyle={pulseStyle} />
            </View>
            <SkeletonBlock style={styles.statusUpdateBtn} pulseStyle={pulseStyle} />
          </View>

          <View style={[styles.statsRow, isRTL && styles.rowRtl]}>
            <SkeletonBlock
              style={[styles.statPill, { backgroundColor: SK_ON_DARK_PILL }]}
              pulseStyle={pulseStyle}
            />
            <SkeletonBlock
              style={[styles.statPill, styles.statPillWide, { backgroundColor: SK_ON_DARK_PILL }]}
              pulseStyle={pulseStyle}
            />
          </View>

          <SkeletonBlock
            style={[styles.viewSchoolCta, { backgroundColor: 'rgba(255,255,255,0.85)' }]}
            pulseStyle={pulseStyle}
          />

          <SkeletonBlock style={styles.unfollowBtn} pulseStyle={pulseStyle} />
        </View>

        <View style={styles.section}>
          <View style={[styles.sectionHeader, isRTL && styles.rowRtl]}>
            <SkeletonBlock style={styles.sectionIconCircle} pulseStyle={pulseStyle} />
            <SkeletonBlock style={styles.sectionTitle} pulseStyle={pulseStyle} />
          </View>
          <View style={{ gap: spacing.sm }}>
            <TimelineEventSkeleton pulseStyle={pulseStyle} isRTL={isRTL} />
            <TimelineEventSkeleton pulseStyle={pulseStyle} isRTL={isRTL} />
          </View>
        </View>

        <View style={[styles.announcementsTitleRow, isRTL && styles.rowRtl]}>
          <SkeletonBlock style={styles.sectionIconCircle} pulseStyle={pulseStyle} />
          <SkeletonBlock style={[styles.sectionTitle, { flex: 1 }]} pulseStyle={pulseStyle} />
        </View>

        <View style={styles.announcementsList}>
          <AnnouncementCardSkeleton isRTL={isRTL} />
          <AnnouncementCardSkeleton isRTL={isRTL} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.backgroundSoft },
  scroll: { flex: 1 },
  rowRtl: { flexDirection: 'row-reverse' },

  hero: {
    backgroundColor: homeShell.bg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  heroTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  iconBtn: { width: 38, height: 38, borderRadius: radius.full },
  heroTitle: { flex: 1, height: 16, borderRadius: 4, maxWidth: '42%', marginHorizontal: spacing.sm },
  langSwitch: { width: 72, height: 32, borderRadius: radius.full },

  estCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: brand.white,
    padding: spacing.md + 2,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  estTextCol: { flex: 1, gap: 6 },
  estLogo: { width: 56, height: 56, borderRadius: radius.sm, backgroundColor: SK },
  estName: { height: 16, borderRadius: 4, backgroundColor: SK_STRONG, width: '88%' },
  estNameShort: { height: 14, borderRadius: 4, backgroundColor: SK, width: '62%' },
  estMetaRow: { flexDirection: 'row', gap: 6 },
  siglePill: { width: 44, height: 18, borderRadius: radius.sm, backgroundColor: SK },
  typePill: { width: 58, height: 18, borderRadius: radius.sm, backgroundColor: SK },
  villeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  villeIcon: { width: 11, height: 11, borderRadius: 6, backgroundColor: SK },
  villeTxt: { flex: 1, height: 12, borderRadius: 4, backgroundColor: SK },
  estChevron: { width: 14, height: 14, borderRadius: 3, backgroundColor: SK },

  statusBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(226,232,240,0.95)',
  },
  statusEyebrow: { width: 100, height: 10, borderRadius: 3, backgroundColor: SK },
  statusBadge: { width: 104, height: 28, borderRadius: radius.full, backgroundColor: SK_STRONG },
  statusUpdateBtn: { width: 108, height: 36, borderRadius: radius.full, backgroundColor: SK },

  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statPill: { width: 108, height: 28, borderRadius: radius.full },
  statPillWide: { width: 124 },

  viewSchoolCta: {
    height: 46,
    borderRadius: radius.lg,
    backgroundColor: SK,
  },
  unfollowBtn: {
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },

  section: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.borderLight,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SK,
  },
  sectionTitle: { height: 16, borderRadius: 4, backgroundColor: SK_STRONG, width: '58%' },

  eventCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    backgroundColor: brand.backgroundSoft,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  eventDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, backgroundColor: SK_STRONG },
  eventMsg: { height: 14, borderRadius: 4, backgroundColor: SK_STRONG, width: '92%' },
  eventMeta: { height: 11, borderRadius: 3, backgroundColor: SK, width: '70%' },

  announcementsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  announcementsList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
});
