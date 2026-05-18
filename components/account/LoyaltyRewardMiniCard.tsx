import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { PlatformServiceVisualThumb } from '@/components/shop/PlatformServiceVisualThumb';
import { Text } from '@/components/ui/Text';
import type { HomeCopyKey } from '@/constants/i18n';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { LoyaltyRewardTier } from '@/utils/loyaltyCatalogRewards';

type Props = {
  reward: LoyaltyRewardTier;
  rtl: boolean;
  locale: 'fr' | 'ar';
  t: (k: HomeCopyKey) => string;
  onPress: () => void;
  compact?: boolean;
};

export function LoyaltyRewardMiniCard({ reward, rtl, locale, t, onPress, compact }: Props) {
  const loc = locale === 'ar' ? 'ar-MA' : 'fr-FR';
  const redemptionActive = reward.redemptionActive !== false;
  const alreadyRedeemed = reward.alreadyRedeemed === true;
  const unlocked = reward.affordable;
  const thumbSize = compact ? 48 : 56;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        rtl && styles.cardRtl,
        compact && styles.cardCompact,
        !unlocked && !alreadyRedeemed && styles.cardLocked,
        alreadyRedeemed && styles.cardRedeemed,
        !redemptionActive && styles.cardInactive,
        pressed && { opacity: 0.92 },
      ]}>
      <View style={[styles.thumbWrap, { width: thumbSize, height: thumbSize }]}>
        {reward.usePlatformThumb ? (
          <PlatformServiceVisualThumb
            size={thumbSize}
            brandIcon={reward.brandIcon}
            brandColor={reward.brandColor}
            borderRadius={radius.md}
          />
        ) : (
          <Image
            source={{ uri: reward.imageUrl ?? '' }}
            style={[styles.thumbImg, { width: thumbSize, height: thumbSize }]}
            resizeMode="cover"
          />
        )}
        {alreadyRedeemed ? (
          <View style={styles.lockOverlay}>
            <View style={[styles.lockCircle, styles.redeemedCircle]}>
              <FontAwesome name="check" size={compact ? 14 : 16} color={brand.white} />
            </View>
          </View>
        ) : !unlocked ? (
          <View style={styles.lockOverlay}>
            <View style={styles.lockCircle}>
              <FontAwesome name="lock" size={compact ? 14 : 16} color={brand.white} />
            </View>
          </View>
        ) : null}
      </View>

      <View style={[styles.body, rtl && styles.bodyRtl]}>
        <View style={[styles.tierRow, rtl && styles.rowRtl]}>
          <Text style={[styles.tierTxt, rtl && styles.txtRtl, !unlocked && styles.muted]}>
            {t('loyaltyTierLabel').replace('{{n}}', String(reward.tierIndex))}
          </Text>
          {alreadyRedeemed ? (
            <Text style={[styles.redeemedPillTxt, rtl && styles.txtRtl]}>{t('loyaltyAlreadyRedeemedLabel')}</Text>
          ) : unlocked ? (
            <View style={styles.unlockedPill}>
              <FontAwesome name="check" size={8} color={homeShell.greenDark} />
            </View>
          ) : null}
        </View>
        <Text
          style={[styles.title, rtl && styles.txtRtl, !unlocked && styles.titleLocked]}
          numberOfLines={2}>
          {reward.title}
        </Text>
        {reward.subtitle ? (
          <Text style={[styles.sub, rtl && styles.txtRtl, !unlocked && styles.muted]} numberOfLines={1}>
            {reward.subtitle}
          </Text>
        ) : null}
        <View style={[styles.goalRow, rtl && styles.rowRtl]}>
          <FontAwesome name="star" size={11} color={unlocked ? brand.primary : homeShell.cardMuted} />
          <Text style={[styles.goalPts, rtl && styles.txtRtl, !unlocked && styles.goalPtsLocked]}>
            {t('loyaltyPointsGoal')
              .replace('{{count}}', reward.pointsCost.toLocaleString(loc))
              .replace('{{unit}}', t('loyaltyPointsUnit'))}
          </Text>
        </View>
        {!alreadyRedeemed && !unlocked && !redemptionActive ? (
          <Text style={[styles.inactiveHint, rtl && styles.txtRtl]}>{t('loyaltyRedeemInactive')}</Text>
        ) : !unlocked && reward.pointsToUnlock > 0 ? (
          <Text style={[styles.unlockHint, rtl && styles.txtRtl]}>
            {t('loyaltyPointsToUnlock').replace('{{count}}', String(reward.pointsToUnlock))}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: homeShell.card,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    minWidth: 0,
  },
  cardRtl: { flexDirection: 'row-reverse' },
  cardCompact: {
    padding: spacing.xs + 2,
  },
  cardLocked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.92,
  },
  cardInactive: {
    borderColor: '#FDBA74',
    backgroundColor: '#FFF7ED',
  },
  cardRedeemed: {
    backgroundColor: '#F0FDF4',
    borderColor: `${homeShell.green}55`,
  },
  thumbWrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  thumbImg: {
    borderRadius: radius.md,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  redeemedCircle: {
    backgroundColor: homeShell.greenDark,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  redeemedPillTxt: {
    fontSize: 8,
    fontWeight: '800',
    color: homeShell.greenDark,
    textTransform: 'uppercase',
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  bodyRtl: { alignItems: 'flex-end' },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  tierTxt: {
    fontSize: 9,
    fontWeight: '800',
    color: homeShell.blue,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  unlockedPill: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: `${homeShell.green}33`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: homeShell.cardText,
    lineHeight: 18,
  },
  titleLocked: {
    color: '#94A3B8',
  },
  sub: {
    fontSize: 10,
    fontWeight: '600',
    color: homeShell.cardMuted,
  },
  muted: {
    color: '#CBD5E1',
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  goalPts: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.primary,
  },
  goalPtsLocked: {
    color: '#94A3B8',
  },
  unlockHint: {
    fontSize: 9,
    fontWeight: '600',
    color: homeShell.cardMuted,
    marginTop: 1,
  },
  inactiveHint: {
    fontSize: 9,
    fontWeight: '700',
    color: '#C2410C',
    marginTop: 1,
  },
  txtRtl: { textAlign: 'right', writingDirection: 'rtl' },
});
