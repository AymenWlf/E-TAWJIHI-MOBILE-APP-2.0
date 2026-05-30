import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, View } from 'react-native';

import { ReferralTierRewardPanel } from '@/components/account/ReferralTierRewardPanel';
import { Text } from '@/components/ui/Text';
import type { HomeCopyKey } from '@/constants/i18n';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { ReferralTierInfo, UserReferralProgram } from '@/services/userReferral';

type Props = {
  tierProgress: UserReferralProgram['tierProgress'];
  rtl: boolean;
  locale: 'fr' | 'ar';
  t: (k: HomeCopyKey) => string;
  onOpenProduct?: (slug: string) => void;
  onClaimSuccess?: () => void;
  embedded?: boolean;
};

function tierLabel(tier: ReferralTierInfo, locale: 'fr' | 'ar'): string {
  if (locale === 'ar' && tier.rewardLabelAr) return tier.rewardLabelAr;
  return tier.rewardLabelFr ?? tier.rewardProduct?.title ?? '';
}

export function ReferralTierProgress({
  tierProgress,
  rtl,
  locale,
  t,
  onClaimSuccess,
  embedded,
}: Props) {
  const qualifiedCount = tierProgress?.qualifiedAffiliateCount ?? 0;
  const serviceName =
    tierProgress?.eligibleService?.name ??
    (locale === 'ar' ? 'TAWJIH PLUS' : 'TAWJIH PLUS');

  return (
    <View style={[styles.wrap, rtl && styles.wrapRtl]}>
      <View style={[styles.head, rtl && styles.rowRtl]}>
        <FontAwesome name="gift" size={16} color={homeShell.blue} />
        <Text style={[styles.headTitle, rtl && styles.txtRtl]}>{t('referralTiersTitle')}</Text>
      </View>
      <Text style={[styles.sub, rtl && styles.txtRtl]}>
        {t('referralTiersSubtitle').replace('{{service}}', serviceName)}
      </Text>
      <View style={[styles.countRow, rtl && styles.rowRtl]}>
        <View style={[styles.countPill, rtl && styles.rowRtl]}>
          <FontAwesome name="users" size={12} color={homeShell.greenDark} />
          <Text style={[styles.countTxt, rtl && styles.txtRtl]}>
            {t('referralQualifiedCount').replace('{{count}}', String(qualifiedCount)).replace('{{unit}}', '')}
          </Text>
        </View>
      </View>

      {(tierProgress?.tiers ?? []).map((tier) => {
        const label = tierLabel(tier, locale);
        const unlocked = tier.unlocked;
        const productCount = tier.rewardProducts?.length ?? (tier.rewardProduct ? 1 : 0);

        return (
          <View
            key={tier.tierIndex}
            style={[
              styles.tierCard,
              embedded && styles.tierCardEmbedded,
              unlocked && styles.tierCardUnlocked,
              rtl && styles.tierCardRtl,
            ]}>
            <View style={[styles.tierTop, rtl && styles.rowRtl]}>
              <Text style={[styles.tierBadge, rtl && styles.txtRtl]}>
                {t('referralTierBadge').replace('{{n}}', String(tier.tierIndex))}
              </Text>
              {unlocked ? (
                <View style={styles.unlockedPill}>
                  <FontAwesome name="check" size={9} color={homeShell.greenDark} />
                  <Text style={styles.unlockedTxt}>{t('referralTierUnlocked')}</Text>
                </View>
              ) : (
                <Text style={[styles.remaining, rtl && styles.txtRtl]}>
                  {t('referralTierRemaining').replace('{{count}}', String(tier.remaining))}
                </Text>
              )}
            </View>

            <Text style={[styles.tierReward, rtl && styles.txtRtl]} numberOfLines={2}>
              {label}
            </Text>

            {tier.rewardMode === 'choice' && productCount > 1 && !unlocked ? (
              <Text style={[styles.choiceHint, rtl && styles.txtRtl]}>
                {t('referralTierChoiceHint').replace('{{count}}', String(productCount))}
              </Text>
            ) : null}

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(100, tier.progressPercent)}%` },
                  unlocked && styles.progressFillDone,
                ]}
              />
            </View>
            <Text style={[styles.threshold, rtl && styles.txtRtl]}>
              {t('referralTierThreshold').replace('{{count}}', String(tier.threshold))}
            </Text>

            {unlocked && (tier.promoClaim || tier.canClaim !== false) ? (
              <ReferralTierRewardPanel
                tier={tier}
                rtl={rtl}
                locale={locale}
                t={t}
                onClaimSuccess={onClaimSuccess}
              />
            ) : productCount > 0 ? (
              <View style={styles.previewRow}>
                {(tier.rewardProducts ?? (tier.rewardProduct ? [tier.rewardProduct] : []))
                  .slice(0, 3)
                  .map((p) => (
                    <View key={p.id} style={styles.previewChip}>
                      <Text style={[styles.previewChipTxt, rtl && styles.txtRtl]} numberOfLines={1}>
                        {p.title}
                      </Text>
                    </View>
                  ))}
                {productCount > 3 ? (
                  <Text style={styles.previewMore}>+{productCount - 3}</Text>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, alignItems: 'stretch' },
  wrapRtl: { direction: 'rtl' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowRtl: { flexDirection: 'row-reverse' },
  headTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: homeShell.cardText,
  },
  sub: {
    fontSize: fontSize.xs,
    color: homeShell.cardMuted,
    lineHeight: 18,
  },
  countRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: `${brand.primary}12`,
  },
  countPillRtl: {
    alignSelf: 'flex-end',
  },
  countTxt: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.primary,
  },
  programHint: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: homeShell.blue,
    lineHeight: 17,
    paddingHorizontal: 2,
  },
  tierCard: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: homeShell.card,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    gap: spacing.xs,
  },
  tierCardEmbedded: {
    backgroundColor: '#F8FAFC',
  },
  tierCardRtl: { direction: 'rtl' },
  tierCardUnlocked: {
    borderColor: `${homeShell.green}66`,
    backgroundColor: '#F0FDF4',
  },
  tierTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  tierBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: homeShell.blue,
    textTransform: 'uppercase',
  },
  unlockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: `${homeShell.green}22`,
  },
  unlockedTxt: {
    fontSize: 9,
    fontWeight: '800',
    color: homeShell.greenDark,
  },
  remaining: {
    fontSize: 10,
    fontWeight: '600',
    color: homeShell.cardMuted,
  },
  tierReward: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: homeShell.cardText,
    lineHeight: 20,
  },
  choiceHint: {
    fontSize: 10,
    fontWeight: '600',
    color: homeShell.blue,
    lineHeight: 14,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: brand.primary,
  },
  progressFillDone: {
    backgroundColor: homeShell.green,
  },
  threshold: {
    fontSize: 9,
    fontWeight: '600',
    color: homeShell.cardMuted,
  },
  previewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  previewChip: {
    maxWidth: '48%',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: '#E2E8F0',
  },
  previewChipTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: homeShell.cardMuted,
  },
  previewMore: {
    fontSize: 9,
    fontWeight: '800',
    color: brand.primary,
    alignSelf: 'center',
  },
  txtRtl: { textAlign: 'right', writingDirection: 'rtl' },
});
