import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, View } from 'react-native';

import { ReferralTierProductThumb } from '@/components/account/ReferralTierProductThumb';
import { ReferralTierRewardPanel } from '@/components/account/ReferralTierRewardPanel';
import { Text } from '@/components/ui/Text';
import type { HomeCopyKey } from '@/constants/i18n';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { ReferralTierInfo, UserReferralProgram } from '@/services/userReferral';
import {
  getNextReferralTier,
  getTierDisplayProduct,
  getTierRewardProducts,
} from '@/utils/referralTierProduct';

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
  const tiers = tierProgress?.tiers ?? [];
  const nextTier = getNextReferralTier(tiers);
  const nextTierProduct = nextTier ? getTierDisplayProduct(nextTier) : null;
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

      {nextTier ? (
        <View style={[styles.nextTierHighlight, rtl && styles.nextTierHighlightRtl]}>
          <ReferralTierProductThumb product={nextTierProduct} size={72} />
          <View style={[styles.nextTierTexts, rtl && styles.nextTierTextsRtl]}>
            <Text style={[styles.nextTierEyebrow, rtl && styles.txtRtl]}>{t('loyaltyTeaserNextReward')}</Text>
            <Text style={[styles.nextTierTitle, rtl && styles.txtRtl]} numberOfLines={2}>
              {tierLabel(nextTier, locale)}
            </Text>
            <Text style={[styles.nextTierHint, rtl && styles.txtRtl]}>
              {t('referralTierRemaining').replace('{{count}}', String(nextTier.remaining))}
            </Text>
          </View>
        </View>
      ) : null}

      {tiers.map((tier) => {
        const label = tierLabel(tier, locale);
        const unlocked = tier.unlocked;
        const rewardProducts = getTierRewardProducts(tier);
        const productCount = rewardProducts.length;
        const primaryProduct = getTierDisplayProduct(tier);
        const isNextTier = nextTier?.tierIndex === tier.tierIndex;

        return (
          <View
            key={tier.tierIndex}
            style={[
              styles.tierCard,
              embedded && styles.tierCardEmbedded,
              unlocked && styles.tierCardUnlocked,
              isNextTier && styles.tierCardNext,
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

            {productCount > 0 ? (
              <View style={[styles.rewardPreviewRow, rtl && styles.rowRtl]}>
                <ReferralTierProductThumb product={primaryProduct} size={64} />
                <View style={[styles.rewardPreviewTexts, rtl && styles.rewardPreviewTextsRtl]}>
                  <Text style={[styles.tierReward, rtl && styles.txtRtl]} numberOfLines={2}>
                    {label}
                  </Text>
                  {tier.rewardMode === 'choice' && productCount > 1 ? (
                    <Text style={[styles.choiceHint, rtl && styles.txtRtl]}>
                      {t('referralTierChoiceHint').replace('{{count}}', String(productCount))}
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : (
              <Text style={[styles.tierReward, rtl && styles.txtRtl]} numberOfLines={2}>
                {label}
              </Text>
            )}

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
            ) : productCount > 1 && tier.rewardMode === 'choice' ? (
              <View style={[styles.previewRow, rtl && styles.rowRtl]}>
                {rewardProducts.slice(0, 3).map((p) => (
                  <ReferralTierProductThumb key={p.id} product={p} size={44} />
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
  nextTierHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: `${brand.primary}08`,
    borderWidth: 1,
    borderColor: `${brand.primary}22`,
  },
  nextTierHighlightRtl: {
    flexDirection: 'row-reverse',
  },
  nextTierTexts: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  nextTierTextsRtl: {
    alignItems: 'flex-end',
  },
  nextTierEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: homeShell.blue,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
  },
  nextTierTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: homeShell.cardText,
    lineHeight: 20,
  },
  nextTierHint: {
    fontSize: 10,
    fontWeight: '700',
    color: homeShell.greenDark,
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
  tierCardNext: {
    borderColor: `${brand.primary}44`,
    backgroundColor: '#F8FAFF',
  },
  rewardPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rewardPreviewTexts: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  rewardPreviewTextsRtl: {
    alignItems: 'flex-end',
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
    gap: 8,
    marginTop: 4,
    alignItems: 'center',
  },
  previewMore: {
    fontSize: 9,
    fontWeight: '800',
    color: brand.primary,
    alignSelf: 'center',
  },
  txtRtl: { textAlign: 'right', writingDirection: 'rtl' },
});
