import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, View } from 'react-native';

import { ReferralLockedBanner } from '@/components/account/ReferralLockedBanner';
import { ReferralShareCodeBlock } from '@/components/account/ReferralShareCodeBlock';
import { Text } from '@/components/ui/Text';
import type { HomeCopyKey } from '@/constants/i18n';
import type { ReferralTierProgress } from '@/services/userReferral';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

type Props = {
  rtl: boolean;
  locale: 'fr' | 'ar';
  referralCode?: string | null;
  referralLink?: string | null;
  referredDiscountPercent?: number;
  tierProgress?: ReferralTierProgress | null;
  locked?: boolean;
  requiredServiceName?: string;
  t: (k: HomeCopyKey) => string;
  onPress: () => void;
  onLockedCtaPress?: () => void;
};

function tierRewardLabel(
  tier: NonNullable<ReferralTierProgress['tiers']>[number],
  locale: 'fr' | 'ar',
): string {
  if (locale === 'ar' && tier.rewardLabelAr) return tier.rewardLabelAr;
  return tier.rewardLabelFr ?? tier.rewardProduct?.title ?? '';
}

export function LoyaltyTeaserCard({
  rtl,
  locale,
  referralCode,
  referralLink,
  referredDiscountPercent,
  tierProgress,
  locked = false,
  requiredServiceName = 'TAWJIH PLUS',
  t,
  onPress,
  onLockedCtaPress,
}: Props) {
  const qualifiedCount = tierProgress?.qualifiedAffiliateCount ?? 0;
  const tiers = tierProgress?.tiers ?? [];
  const nextTier = tiers.find((tier) => !tier.unlocked);
  const allUnlocked = tiers.length > 0 && tiers.every((tier) => tier.unlocked);
  const serviceName = tierProgress?.eligibleService?.name ?? requiredServiceName;

  return (
    <View style={[styles.wrap, rtl && styles.wrapRtl]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ disabled: locked }}
        style={({ pressed }) => [styles.cardPress, pressed && !locked && { opacity: 0.97 }]}>
        <View style={[styles.card, locked && styles.cardLocked]}>
          <View style={styles.glow} pointerEvents="none" />

          <View style={[styles.topRow, rtl && styles.rowRtl]}>
            <View style={[styles.iconWrap, locked && styles.iconWrapLocked]}>
              <FontAwesome
                name={locked ? 'lock' : 'gift'}
                size={22}
                color={locked ? 'rgba(255,255,255,0.85)' : brand.white}
              />
            </View>
            <View style={styles.topText}>
              <Text style={[styles.title, rtl && styles.txtRtl]}>{t('loyaltyTeaserTitle')}</Text>
              <Text style={[styles.sub, rtl && styles.txtRtl]} numberOfLines={2}>
                {locked ? t('referralLockedBody').replace('{{service}}', requiredServiceName) : t('loyaltyTeaserSubtitle')}
              </Text>
            </View>
            <FontAwesome
              name={rtl ? 'chevron-left' : 'chevron-right'}
              size={14}
              color={locked ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.65)'}
            />
          </View>

          <View style={[styles.bodyLockedWrap, locked && styles.bodyLockedDim]} pointerEvents={locked ? 'none' : 'auto'}>
            <View style={[styles.statBlock, rtl && styles.txtRtl]}>
              <Text style={[styles.statValue, rtl && styles.txtRtl]}>{qualifiedCount}</Text>
              <Text style={[styles.statLabel, rtl && styles.txtRtl]}>{t('referralTeaserQualifiedLabel')}</Text>
            </View>

            {nextTier ? (
              <View style={[styles.nextRewardBox, rtl && styles.txtRtl]}>
                <Text style={[styles.statLabel, rtl && styles.txtRtl]}>{t('loyaltyTeaserNextReward')}</Text>
                <Text style={[styles.statValueSm, rtl && styles.txtRtl]} numberOfLines={2}>
                  {tierRewardLabel(nextTier, locale)}
                </Text>
                <Text style={[styles.statHint, rtl && styles.txtRtl]}>
                  {t('referralTierRemaining').replace('{{count}}', String(nextTier.remaining))}
                </Text>
              </View>
            ) : allUnlocked ? (
              <View style={[styles.nextRewardBox, rtl && styles.rowRtl]}>
                <FontAwesome name="check-circle" size={18} color={homeShell.green} />
                <Text style={[styles.statValueSm, rtl && styles.txtRtl]}>{t('referralTeaserAllUnlocked')}</Text>
              </View>
            ) : null}

            <View style={[styles.servicePill, rtl && styles.rowRtl]}>
              <FontAwesome name="briefcase" size={11} color={homeShell.green} />
              <Text style={[styles.servicePillTxt, rtl && styles.txtRtl]} numberOfLines={1}>
                {serviceName}
              </Text>
            </View>
          </View>

          {locked ? (
            <View style={styles.shareBlock}>
              <ReferralLockedBanner
                requiredServiceName={requiredServiceName}
                rtl={rtl}
                t={t}
                variant="hero"
                onCtaPress={onLockedCtaPress}
              />
            </View>
          ) : referralCode ? (
            <View style={styles.shareBlock}>
              <ReferralShareCodeBlock
                referralCode={referralCode}
                referralLink={referralLink}
                referredDiscountPercent={referredDiscountPercent}
                rtl={rtl}
                t={t}
                variant="teaser"
              />
            </View>
          ) : null}

          <View style={[styles.ctaRow, locked && styles.ctaRowLocked]}>
            <Text style={[styles.ctaTxt, locked && styles.ctaTxtLocked]}>
              {locked ? t('referralLockedCta') : t('loyaltyTeaserCta')}
            </Text>
            {!locked ? (
              <FontAwesome name={rtl ? 'angle-left' : 'angle-right'} size={16} color={homeShell.bg} />
            ) : null}
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  wrapRtl: { direction: 'rtl' },
  cardPress: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    shadowColor: homeShell.bg,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
  },
  card: {
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: homeShell.bg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  cardLocked: {
    borderColor: 'rgba(255,255,255,0.08)',
  },
  glow: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(47, 206, 148, 0.18)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapLocked: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.14)',
  },
  topText: { flex: 1, gap: 4, minWidth: 0 },
  title: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: homeShell.text,
  },
  sub: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: homeShell.textMuted,
    lineHeight: 18,
  },
  bodyLockedWrap: { gap: spacing.sm },
  bodyLockedDim: { opacity: 0.38 },
  statBlock: {
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    gap: 2,
    marginTop: spacing.xs,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: brand.white,
    lineHeight: 32,
  },
  statValueSm: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.white,
    lineHeight: 18,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: homeShell.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statHint: {
    fontSize: 10,
    fontWeight: '600',
    color: homeShell.green,
  },
  nextRewardBox: {
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    gap: 4,
  },
  servicePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: 'rgba(47, 206, 148, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(47, 206, 148, 0.35)',
    maxWidth: '100%',
  },
  servicePillTxt: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: homeShell.green,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: radius.lg,
    backgroundColor: brand.white,
    marginTop: spacing.xs,
  },
  ctaRowLocked: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  ctaTxt: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: homeShell.bg,
  },
  ctaTxtLocked: {
    color: brand.white,
  },
  shareBlock: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.18)',
  },
  txtRtl: { textAlign: 'right', writingDirection: 'rtl' },
});
