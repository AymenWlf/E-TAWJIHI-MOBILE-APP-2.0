import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { LoyaltyRewardMiniCard } from '@/components/account/LoyaltyRewardMiniCard';
import { LoadingCardStack } from '@/components/ui/CardLoadingSkeleton';
import { Text } from '@/components/ui/Text';
import type { HomeCopyKey } from '@/constants/i18n';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { LoyaltyRewardTier } from '@/utils/loyaltyCatalogRewards';

type Props = {
  tiers: LoyaltyRewardTier[];
  balance: number;
  loading: boolean;
  error: string | null;
  rtl: boolean;
  locale: 'fr' | 'ar';
  t: (k: HomeCopyKey) => string;
  limit?: number;
  compact?: boolean;
  onReload: () => void;
  onOpenReward: (slug: string, kind: LoyaltyRewardTier['kind']) => void;
  onRedeemReward?: (reward: LoyaltyRewardTier) => void;
  onViewAll?: () => void;
  showViewAll?: boolean;
};

export function LoyaltyRewardsTimeline({
  tiers,
  balance,
  loading,
  error,
  rtl,
  locale,
  t,
  limit,
  compact,
  onReload,
  onOpenReward,
  onRedeemReward,
  onViewAll,
  showViewAll,
}: Props) {
  const visible = limit != null && limit > 0 ? tiers.slice(0, limit) : tiers;
  const hasMore = limit != null && tiers.length > limit;

  if (loading) {
    return <LoadingCardStack count={2} isRTL={rtl} style={styles.loadWrap} />;
  }

  if (error) {
    return (
      <View style={styles.loadWrap}>
        <Text style={[styles.errTxt, rtl && styles.txtRtl]}>{t('commonLoadError')}</Text>
        <Pressable onPress={onReload} style={styles.retryBtn}>
          <Text style={styles.retryBtnTxt}>{t('loyaltyCatalogRetry')}</Text>
        </Pressable>
      </View>
    );
  }

  if (tiers.length === 0) {
    return <Text style={[styles.emptyTxt, rtl && styles.txtRtl]}>{t('loyaltyCatalogEmpty')}</Text>;
  }

  return (
    <View style={[styles.wrap, rtl && styles.wrapRtl]}>
      {visible.map((reward, idx) => {
        const isLast = idx === visible.length - 1 && !hasMore;
        const unlocked = reward.affordable;
        const redemptionActive = reward.redemptionActive !== false;
        const isCurrent =
          unlocked && redemptionActive && (idx === visible.length - 1 || !visible[idx + 1]?.affordable);

        return (
          <View key={reward.id} style={[styles.timelineRow, rtl && styles.timelineRowRtl]}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.dot,
                  unlocked && styles.dotUnlocked,
                  isCurrent && styles.dotCurrent,
                ]}
              />
              {!isLast ? (
                <View
                  style={[
                    styles.line,
                    unlocked && visible[idx + 1]?.affordable && styles.lineUnlocked,
                  ]}
                />
              ) : null}
            </View>
            <LoyaltyRewardMiniCard
              reward={reward}
              rtl={rtl}
              locale={locale}
              t={t}
              compact={compact}
              onPress={() => {
                if (reward.alreadyRedeemed) {
                  onOpenReward(reward.slug, reward.kind);
                } else if (reward.affordable && onRedeemReward) {
                  onRedeemReward(reward);
                } else {
                  onOpenReward(reward.slug, reward.kind);
                }
              }}
            />
          </View>
        );
      })}

      {showViewAll && hasMore && onViewAll ? (
        <Pressable
          onPress={onViewAll}
          style={({ pressed }) => [styles.viewAllBtn, rtl && styles.rowRtl, pressed && { opacity: 0.9 }]}>
          <Text style={[styles.viewAllTxt, rtl && styles.txtRtl]}>{t('loyaltyViewAllRewards')}</Text>
          <Text style={[styles.viewAllCount, rtl && styles.txtRtl]}>
            {t('loyaltyViewAllCount').replace('{{count}}', String(tiers.length))}
          </Text>
        </Pressable>
      ) : null}

      {!showViewAll && tiers.length > 0 ? (
        <Text style={[styles.balanceFoot, rtl && styles.txtRtl]}>
          {t('loyaltyTimelineBalanceFoot')
            .replace('{{balance}}', balance.toLocaleString(locale === 'ar' ? 'ar-MA' : 'fr-FR'))
            .replace('{{unit}}', t('loyaltyPointsUnit'))}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 0 },
  wrapRtl: { direction: 'rtl', alignItems: 'stretch' },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  timelineRowRtl: { flexDirection: 'row-reverse' },
  rowRtl: { flexDirection: 'row-reverse' },
  rail: {
    width: 22,
    alignItems: 'center',
    paddingTop: spacing.md + 4,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    zIndex: 1,
  },
  dotUnlocked: {
    backgroundColor: homeShell.green,
    borderColor: homeShell.greenDark,
  },
  dotCurrent: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: brand.white,
    shadowColor: homeShell.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  line: {
    flex: 1,
    width: 2,
    minHeight: 24,
    marginTop: 2,
    backgroundColor: '#E2E8F0',
    borderRadius: 1,
  },
  lineUnlocked: {
    backgroundColor: `${homeShell.green}88`,
  },
  loadWrap: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  loadTxt: {
    fontSize: fontSize.sm,
    color: homeShell.cardMuted,
  },
  errTxt: {
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
  retryBtnTxt: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: brand.primary,
  },
  emptyTxt: {
    fontSize: fontSize.sm,
    color: homeShell.cardMuted,
    lineHeight: 20,
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
  balanceFoot: {
    marginTop: spacing.sm,
    fontSize: 10,
    fontWeight: '600',
    color: homeShell.cardMuted,
    textAlign: 'center',
  },
  txtRtl: { textAlign: 'right', writingDirection: 'rtl' },
});
