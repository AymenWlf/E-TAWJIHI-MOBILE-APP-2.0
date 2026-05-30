import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ReferralInviteListSkeleton } from '@/components/account/ReferralProgramSkeleton';
import { Text } from '@/components/ui/Text';
import type { HomeCopyKey } from '@/constants/i18n';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import {
  isReferralInviteCompleted,
  type UserReferralInvite,
  type UserReferralProgram,
} from '@/services/userReferral';
import { referredUserDisplayName } from '@/utils/referralDisplayName';

type Props = {
  program: UserReferralProgram | null;
  loading: boolean;
  error: string | null;
  rtl: boolean;
  t: (k: HomeCopyKey) => string;
  onReload: () => void;
  onPressViewAll?: () => void;
  previewLimit?: number;
  compact?: boolean;
};

function statusLabelKey(status: UserReferralInvite['status']): HomeCopyKey {
  return isReferralInviteCompleted(status) ? 'referralInviteCompleted' : 'referralInviteNotCompleted';
}

function statusColor(status: UserReferralInvite['status']): string {
  return isReferralInviteCompleted(status) ? homeShell.greenDark : homeShell.cardMuted;
}

export function ReferralProgramSection({
  program,
  loading,
  error,
  rtl,
  t,
  onReload,
  onPressViewAll,
  previewLimit,
  compact,
}: Props) {
  const invites = program?.invites ?? [];
  const visible = previewLimit != null && previewLimit > 0 ? invites.slice(0, previewLimit) : invites;
  const hasMore = previewLimit != null && invites.length > previewLimit;

  return (
    <View style={[styles.wrap, rtl && styles.wrapRtl]}>
      <View style={[styles.head, rtl && styles.rowRtl]}>
        <FontAwesome name="users" size={16} color={homeShell.blue} />
        <Text style={[styles.title, rtl && styles.txtRtl]}>{t('referralInvitesTitle')}</Text>
      </View>

      {loading ? (
        <ReferralInviteListSkeleton
          isRTL={rtl}
          showHeader={false}
          count={previewLimit && previewLimit > 0 ? Math.min(previewLimit, 2) : 2}
          style={styles.inviteSkeleton}
        />
      ) : error ? (
        <View style={styles.center}>
          <Text style={[styles.err, rtl && styles.txtRtl]}>{t('commonLoadError')}</Text>
          <Pressable onPress={onReload} style={styles.retryBtn}>
            <Text style={styles.retryTxt}>{t('loyaltyCatalogRetry')}</Text>
          </Pressable>
        </View>
      ) : visible.length === 0 ? (
        <Text style={[styles.empty, rtl && styles.txtRtl]}>{t('referralInvitesEmpty')}</Text>
      ) : (
        visible.map((inv) => (
          <View key={inv.id} style={[styles.inviteRow, rtl && styles.rowRtl]}>
            <View style={styles.avatar}>
              <FontAwesome name="user" size={14} color={homeShell.blue} />
            </View>
            <View style={styles.inviteMain}>
              <Text style={[styles.inviteName, rtl && styles.txtRtl]}>
                {referredUserDisplayName(inv)}
              </Text>
              <View
                style={[
                  styles.pill,
                  rtl && styles.rowRtl,
                  rtl && styles.pillRtl,
                  { backgroundColor: `${statusColor(inv.status)}22` },
                ]}>
                <FontAwesome
                  name={isReferralInviteCompleted(inv.status) ? 'check-circle' : 'clock-o'}
                  size={10}
                  color={statusColor(inv.status)}
                  style={styles.pillIcon}
                />
                <Text style={[styles.pillTxt, rtl && styles.txtRtl, { color: statusColor(inv.status) }]}>
                  {t(statusLabelKey(inv.status))}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}

      {hasMore && onPressViewAll ? (
        <Pressable
          onPress={onPressViewAll}
          style={({ pressed }) => [styles.viewAllBtn, rtl && styles.rowRtl, pressed && { opacity: 0.9 }]}>
          <Text style={[styles.viewAllTxt, rtl && styles.txtRtl]}>{t('referralViewAllInvites')}</Text>
          <Text style={[styles.viewAllCount, rtl && styles.txtRtl]}>
            {t('loyaltyViewAllCount').replace('{{count}}', String(invites.length))}
          </Text>
        </Pressable>
      ) : null}

      {!compact && program?.referralCode ? (
        <Text style={[styles.codeHint, rtl && styles.txtRtl]}>
          {t('referralYourCode')}: {program.referralCode}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, alignItems: 'stretch' },
  wrapRtl: { direction: 'rtl' },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  title: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: homeShell.cardText,
  },
  center: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  inviteSkeleton: {
    width: '100%',
    paddingTop: spacing.xs,
  },
  err: {
    fontSize: fontSize.sm,
    color: '#c2410c',
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: `${brand.primary}14`,
  },
  retryTxt: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: brand.primary,
  },
  empty: {
    fontSize: fontSize.sm,
    color: homeShell.cardMuted,
    lineHeight: 20,
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: homeShell.borderOnWhite,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${homeShell.blue}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteMain: { flex: 1, gap: 4 },
  inviteName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: homeShell.cardText,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  pillIcon: {
    marginTop: 1,
  },
  pillRtl: { alignSelf: 'flex-end' },
  pillTxt: {
    fontSize: 10,
    fontWeight: '800',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.xs,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: `${brand.primary}12`,
    borderWidth: 1,
    borderColor: `${brand.primary}28`,
  },
  viewAllTxt: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.primary,
  },
  viewAllCount: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: homeShell.cardMuted,
  },
  codeHint: {
    fontSize: 10,
    fontWeight: '600',
    color: homeShell.cardMuted,
    marginTop: spacing.xs,
  },
  txtRtl: { textAlign: 'right', writingDirection: 'rtl' },
});
