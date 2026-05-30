import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import {
  SKELETON_BG,
  SKELETON_BG_STRONG,
  SkeletonBlock,
  useSkeletonPulse,
} from '@/components/ui/CardLoadingSkeleton';
import { homeShell } from '@/theme/homeShell';
import { radius, spacing } from '@/theme/tokens';

type RtlProps = { isRTL?: boolean; style?: StyleProp<ViewStyle> };

/** Bannière réduction + code + boutons (ReferralShareCodeBlock). */
export function ReferralShareCodeBlockSkeleton({ isRTL = false, style }: RtlProps) {
  const pulse = useSkeletonPulse();
  return (
    <View style={[styles.shareWrap, isRTL && styles.rtlWrap, style]}>
      <SkeletonBlock style={styles.discountBanner} pulseStyle={pulse} />
      <SkeletonBlock style={styles.labelLine} pulseStyle={pulse} />
      <View style={[styles.codeRow, isRTL && styles.rowRtl]}>
        <SkeletonBlock style={styles.codeValue} pulseStyle={pulse} />
        <SkeletonBlock style={styles.codeCopyBtn} pulseStyle={pulse} />
      </View>
      <SkeletonBlock style={[styles.labelLine, styles.labelShort]} pulseStyle={pulse} />
      <SkeletonBlock style={styles.linkLine} pulseStyle={pulse} />
      <View style={[styles.actionsRow, isRTL && styles.rowRtl]}>
        <SkeletonBlock style={styles.actionBtn} pulseStyle={pulse} />
        <SkeletonBlock style={styles.actionBtn} pulseStyle={pulse} />
        <SkeletonBlock style={styles.actionBtnWide} pulseStyle={pulse} />
      </View>
    </View>
  );
}

/** Paliers récompenses (ReferralTierProgress). */
export function ReferralTierProgressSkeleton({
  isRTL = false,
  tierCount = 2,
  style,
}: RtlProps & { tierCount?: number }) {
  const pulse = useSkeletonPulse();
  return (
    <View style={[styles.tierWrap, isRTL && styles.rtlWrap, style]}>
      <View style={[styles.tierHead, isRTL && styles.rowRtl]}>
        <SkeletonBlock style={styles.tierHeadIcon} pulseStyle={pulse} />
        <SkeletonBlock style={styles.tierHeadTitle} pulseStyle={pulse} />
      </View>
      <SkeletonBlock style={styles.tierSub} pulseStyle={pulse} />
      <SkeletonBlock style={styles.countPill} pulseStyle={pulse} />
      {Array.from({ length: tierCount }, (_, i) => (
        <View key={`tier-sk-${i}`} style={[styles.tierCard, isRTL && styles.rtlWrap]}>
          <View style={[styles.tierTop, isRTL && styles.rowRtl]}>
            <SkeletonBlock style={styles.tierBadge} pulseStyle={pulse} />
            <SkeletonBlock style={styles.tierMeta} pulseStyle={pulse} />
          </View>
          <SkeletonBlock style={styles.tierReward} pulseStyle={pulse} />
          <SkeletonBlock style={styles.tierProgress} pulseStyle={pulse} />
          <SkeletonBlock style={styles.tierThreshold} pulseStyle={pulse} />
        </View>
      ))}
    </View>
  );
}

/** 4 étapes « Comment ça marche ». */
export function ReferralHowItWorksSkeleton({ isRTL = false, style }: RtlProps) {
  const pulse = useSkeletonPulse();
  return (
    <View style={[styles.stepsWrap, isRTL && styles.rtlWrap, style]}>
      <SkeletonBlock style={styles.sectionTitle} pulseStyle={pulse} />
      {Array.from({ length: 4 }, (_, i) => (
        <View key={`step-sk-${i}`} style={[styles.stepRow, isRTL && styles.rowRtl]}>
          <SkeletonBlock style={styles.stepIcon} pulseStyle={pulse} />
          <View style={[styles.stepTextCol, isRTL && styles.stepTextColRtl]}>
            <SkeletonBlock style={styles.stepTitle} pulseStyle={pulse} />
            <SkeletonBlock style={styles.stepBody} pulseStyle={pulse} />
          </View>
        </View>
      ))}
    </View>
  );
}

/** Ligne filleul (ReferralProgramSection). */
export function ReferralInviteRowSkeleton({ isRTL = false, first = false }: RtlProps & { first?: boolean }) {
  const pulse = useSkeletonPulse();
  return (
    <View style={[styles.inviteRow, !first && styles.inviteRowBorder, isRTL && styles.rowRtl]}>
      <SkeletonBlock style={styles.inviteAvatar} pulseStyle={pulse} />
      <View style={styles.inviteMain}>
        <SkeletonBlock style={styles.inviteName} pulseStyle={pulse} />
        <SkeletonBlock style={styles.invitePill} pulseStyle={pulse} />
      </View>
    </View>
  );
}

export function ReferralInviteListSkeleton({
  isRTL = false,
  count = 2,
  showHeader = true,
  style,
}: RtlProps & { count?: number; showHeader?: boolean }) {
  const pulse = useSkeletonPulse();
  return (
    <View style={[styles.invitesWrap, isRTL && styles.rtlWrap, style]}>
      {showHeader ? (
        <View style={[styles.invitesHead, isRTL && styles.rowRtl]}>
          <SkeletonBlock style={styles.invitesHeadIcon} pulseStyle={pulse} />
          <SkeletonBlock style={styles.invitesHeadTitle} pulseStyle={pulse} />
        </View>
      ) : null}
      {Array.from({ length: count }, (_, i) => (
        <ReferralInviteRowSkeleton key={`inv-sk-${i}`} isRTL={isRTL} first={i === 0} />
      ))}
    </View>
  );
}

/** Corps carte teaser compte (stats + pilule service). */
export function ReferralTeaserBodySkeleton({ isRTL = false, style }: RtlProps) {
  const pulse = useSkeletonPulse();
  return (
    <View style={[styles.teaserBody, isRTL && styles.rtlWrap, style]}>
      <View style={styles.teaserStatBlock}>
        <SkeletonBlock style={styles.teaserStatValue} pulseStyle={pulse} />
        <SkeletonBlock style={styles.teaserStatLabel} pulseStyle={pulse} />
      </View>
      <View style={styles.teaserNextBox}>
        <SkeletonBlock style={styles.teaserNextLabel} pulseStyle={pulse} />
        <SkeletonBlock style={styles.teaserNextTitle} pulseStyle={pulse} />
        <SkeletonBlock style={styles.teaserNextHint} pulseStyle={pulse} />
      </View>
      <SkeletonBlock style={styles.teaserServicePill} pulseStyle={pulse} />
    </View>
  );
}

/** Bannière verrouillée (ReferralLockedBanner carte). */
export function ReferralLockedBannerSkeleton({ isRTL = false, style }: RtlProps) {
  const pulse = useSkeletonPulse();
  return (
    <View style={[styles.lockedWrap, isRTL && styles.rtlWrap, style]}>
      <SkeletonBlock style={styles.lockedIcon} pulseStyle={pulse} />
      <SkeletonBlock style={styles.lockedTitle} pulseStyle={pulse} />
      <SkeletonBlock style={styles.lockedBody} pulseStyle={pulse} />
      <SkeletonBlock style={styles.lockedCta} pulseStyle={pulse} />
    </View>
  );
}

/** Page fidélité / parrainage — panneaux empilés comme le contenu réel. */
export function ReferralProgramPageSkeleton({ isRTL = false, style }: RtlProps) {
  return (
    <View style={[styles.page, isRTL && styles.rtlWrap, style]}>
      <View style={[styles.panel, isRTL && styles.rtlWrap]}>
        <ReferralShareCodeBlockSkeleton isRTL={isRTL} />
      </View>
      <View style={[styles.panel, isRTL && styles.rtlWrap]}>
        <ReferralTierProgressSkeleton isRTL={isRTL} tierCount={2} />
      </View>
      <View style={[styles.panel, isRTL && styles.rtlWrap]}>
        <ReferralHowItWorksSkeleton isRTL={isRTL} />
      </View>
      <View style={[styles.panel, isRTL && styles.rtlWrap]}>
        <ReferralInviteListSkeleton isRTL={isRTL} count={2} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rtlWrap: { direction: 'rtl', alignItems: 'stretch' },
  rowRtl: { flexDirection: 'row-reverse' },

  page: { gap: spacing.md, width: '100%' },
  panel: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: homeShell.card,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
  },

  shareWrap: { gap: spacing.sm, width: '100%' },
  discountBanner: {
    width: '100%',
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: SKELETON_BG,
  },
  labelLine: {
    width: '42%',
    height: 12,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
  },
  labelShort: { width: '36%', marginTop: spacing.xs },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  codeValue: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: SKELETON_BG,
  },
  codeCopyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SKELETON_BG_STRONG,
  },
  linkLine: {
    width: '88%',
    height: 28,
    borderRadius: radius.md,
    backgroundColor: SKELETON_BG,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  actionBtn: {
    flexGrow: 1,
    flexBasis: '45%',
    minWidth: 120,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: SKELETON_BG,
  },
  actionBtnWide: {
    width: '100%',
    height: 44,
    borderRadius: radius.md,
    backgroundColor: SKELETON_BG_STRONG,
  },

  tierWrap: { gap: spacing.sm, width: '100%' },
  tierHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tierHeadIcon: { width: 16, height: 16, borderRadius: 8, backgroundColor: SKELETON_BG },
  tierHeadTitle: { width: '55%', height: 14, borderRadius: 4, backgroundColor: SKELETON_BG_STRONG },
  tierSub: { width: '92%', height: 12, borderRadius: 4, backgroundColor: SKELETON_BG },
  countPill: {
    width: 140,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: SKELETON_BG,
  },
  tierCard: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    gap: spacing.xs,
  },
  tierTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  tierBadge: { width: 56, height: 10, borderRadius: 4, backgroundColor: SKELETON_BG_STRONG },
  tierMeta: { width: 72, height: 10, borderRadius: 4, backgroundColor: SKELETON_BG },
  tierReward: { width: '78%', height: 14, borderRadius: 4, backgroundColor: SKELETON_BG_STRONG },
  tierProgress: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: SKELETON_BG,
    marginTop: 2,
  },
  tierThreshold: { width: '40%', height: 9, borderRadius: 3, backgroundColor: SKELETON_BG },

  stepsWrap: { gap: spacing.sm, width: '100%' },
  sectionTitle: {
    width: '48%',
    height: 14,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
    marginBottom: spacing.xs,
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: SKELETON_BG,
  },
  stepTextCol: { flex: 1, gap: 6, minWidth: 0 },
  stepTextColRtl: { alignItems: 'flex-end' },
  stepTitle: { width: '62%', height: 12, borderRadius: 4, backgroundColor: SKELETON_BG_STRONG },
  stepBody: { width: '95%', height: 28, borderRadius: 4, backgroundColor: SKELETON_BG },

  invitesWrap: { gap: spacing.sm, width: '100%' },
  invitesHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  invitesHeadIcon: { width: 16, height: 16, borderRadius: 8, backgroundColor: SKELETON_BG },
  invitesHeadTitle: { width: '50%', height: 14, borderRadius: 4, backgroundColor: SKELETON_BG_STRONG },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  inviteRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: homeShell.borderOnWhite,
  },
  inviteAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SKELETON_BG,
  },
  inviteMain: { flex: 1, gap: 6 },
  inviteName: { width: '58%', height: 12, borderRadius: 4, backgroundColor: SKELETON_BG_STRONG },
  invitePill: { width: 88, height: 18, borderRadius: radius.full, backgroundColor: SKELETON_BG },

  teaserBody: { gap: spacing.sm, marginTop: spacing.xs },
  teaserStatBlock: {
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    gap: 6,
    alignItems: 'center',
  },
  teaserStatValue: {
    width: 48,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  teaserStatLabel: {
    width: '70%',
    height: 10,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  teaserNextBox: {
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    gap: 6,
    alignItems: 'stretch',
  },
  teaserNextLabel: {
    width: '45%',
    height: 10,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  teaserNextTitle: {
    width: '85%',
    height: 14,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  teaserNextHint: {
    width: '55%',
    height: 10,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  teaserServicePill: {
    width: '52%',
    height: 26,
    borderRadius: radius.full,
    backgroundColor: 'rgba(47, 206, 148, 0.22)',
  },

  lockedWrap: {
    gap: spacing.sm,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  lockedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SKELETON_BG,
  },
  lockedTitle: {
    width: '72%',
    height: 16,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
  },
  lockedBody: {
    width: '90%',
    height: 36,
    borderRadius: 4,
    backgroundColor: SKELETON_BG,
  },
  lockedCta: {
    width: '100%',
    height: 44,
    borderRadius: radius.md,
    backgroundColor: SKELETON_BG_STRONG,
    marginTop: spacing.xs,
  },
});
