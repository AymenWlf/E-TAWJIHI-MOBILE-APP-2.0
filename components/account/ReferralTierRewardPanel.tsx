import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { CelebrationConfetti } from '@/components/ui/CelebrationConfetti';
import { Text } from '@/components/ui/Text';
import type { HomeCopyKey } from '@/constants/i18n';
import { useAuth } from '@/contexts/AuthContext';
import {
  claimReferralTierPromo,
  type ReferralTierInfo,
  type ReferralTierProduct,
  type ReferralTierPromoClaim,
} from '@/services/userReferral';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { resolveShopImageUrl, shopProductPrimaryImage } from '@/utils/shopImageUrl';
import { getUserFacingApiError } from '@/utils/apiError';

type Props = {
  tier: ReferralTierInfo;
  rtl: boolean;
  locale: 'fr' | 'ar';
  t: (k: HomeCopyKey) => string;
  onClaimSuccess?: () => void;
};

function tierLabel(tier: ReferralTierInfo, locale: 'fr' | 'ar'): string {
  if (locale === 'ar' && tier.rewardLabelAr) return tier.rewardLabelAr;
  return tier.rewardLabelFr ?? '';
}

function rewardProductImageUri(product: ReferralTierProduct): string {
  const fromUrl = resolveShopImageUrl(product.imageUrl);
  if (fromUrl) return fromUrl;
  if (product.images?.length) return shopProductPrimaryImage(product.images);
  return '';
}

function RewardProductThumb({ product, icon }: { product: ReferralTierProduct; icon: 'gift' | 'book' }) {
  const uri = rewardProductImageUri(product);
  if (uri) {
    return <Image source={{ uri }} style={styles.productRowThumb} resizeMode="cover" />;
  }
  return (
    <View style={[styles.productRowThumb, styles.productThumbFallback]}>
      <FontAwesome name={icon} size={20} color={homeShell.cardMuted} />
    </View>
  );
}

function RewardProductPrice({
  product,
  rtl,
  t,
}: {
  product: ReferralTierProduct;
  rtl: boolean;
  t: (k: HomeCopyKey) => string;
}) {
  const priceLabel = product.price?.trim();
  return (
    <View style={[styles.priceRow, rtl && styles.rowRtl]}>
      {priceLabel ? (
        <Text style={[styles.priceStruck, rtl && styles.txtRtl]}>{priceLabel} MAD</Text>
      ) : null}
      <Text style={[styles.priceFree, rtl && styles.txtRtl]}>{t('referralTierRewardFree')}</Text>
    </View>
  );
}

export function ReferralTierRewardPanel({ tier, rtl, locale, t, onClaimSuccess }: Props) {
  const router = useRouter();
  const { getValidAccessToken } = useAuth();
  const products = tier.rewardProducts?.length
    ? [...tier.rewardProducts].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    : tier.rewardProduct
      ? [tier.rewardProduct]
      : [];

  const [selectedId, setSelectedId] = useState<number | null>(
    tier.promoClaim?.shopProductId ?? products[0]?.id ?? null,
  );
  const [claim, setClaim] = useState<ReferralTierPromoClaim | null>(tier.promoClaim);
  const [claiming, setClaiming] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setClaim(tier.promoClaim);
  }, [tier.promoClaim]);

  const isChoice = tier.rewardMode === 'choice' && products.length > 1;
  const selected = products.find((p) => p.id === selectedId) ?? products[0];
  const promo = claim?.promo;
  const isUsed = promo?.status === 'used';

  const copyCode = useCallback(() => {
    if (!promo?.code) return;
    void Clipboard.setString(promo.code);
    Alert.alert(t('referralCopied'));
  }, [promo?.code, t]);

  const generatePromo = useCallback(async () => {
    if (!tier.unlocked || claiming || tier.canClaim === false) return;
    const productId = isChoice ? selectedId : selected?.id;
    if (!productId) {
      Alert.alert(t('referralTierPickProduct'));
      return;
    }
    setClaiming(true);
    try {
      const token = await getValidAccessToken();
      if (!token) throw new Error('auth');
      const result = await claimReferralTierPromo(token, tier.tierIndex, productId);
      setClaim(result);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      onClaimSuccess?.();
    } catch (e) {
      Alert.alert(t('referralTierPromoError'), getUserFacingApiError(e, t, { context: 'account', fallbackKey: 'referralTierPromoError' }));
    } finally {
      setClaiming(false);
    }
  }, [
    tier.unlocked,
    tier.tierIndex,
    claiming,
    isChoice,
    selectedId,
    selected?.id,
    getValidAccessToken,
    onClaimSuccess,
    t,
  ]);

  if (!tier.unlocked) return null;
  if (products.length === 0) return null;

  return (
    <View style={[styles.wrap, rtl && styles.wrapRtl]}>
      {showConfetti ? (
        <View style={styles.confettiOverlay}>
          <CelebrationConfetti active />
        </View>
      ) : null}

      <Text style={[styles.sectionLabel, rtl && styles.txtRtl]}>
        {isChoice ? t('referralTierPickReward') : t('referralTierYourReward')}
      </Text>
      {tierLabel(tier, locale) ? (
        <Text style={[styles.tierLabel, rtl && styles.txtRtl]}>{tierLabel(tier, locale)}</Text>
      ) : null}

      {isChoice && !claim ? (
        <View style={styles.productList}>
          {products.map((p) => {
            const active = p.id === selectedId;
            return (
              <Pressable
                key={p.id}
                onPress={() => setSelectedId(p.id)}
                style={[
                  styles.productRow,
                  active && styles.productRowActive,
                  rtl && styles.rowRtl,
                ]}>
                <RewardProductThumb product={p} icon="gift" />
                <View style={styles.productRowBody}>
                  <Text style={[styles.productRowTitle, rtl && styles.txtRtl]}>{p.title}</Text>
                  <RewardProductPrice product={p} rtl={rtl} t={t} />
                </View>
                <View
                  style={[
                    styles.selectIndicator,
                    active && styles.selectIndicatorActive,
                  ]}>
                  {active ? <FontAwesome name="check" size={12} color={brand.white} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : selected && !claim ? (
        <Pressable
          onPress={() => router.push(`/boutique/${selected.slug}`)}
          style={[styles.singleProductRow, rtl && styles.rowRtl]}>
          <RewardProductThumb product={selected} icon="book" />
          <View style={styles.singleBody}>
            <Text style={[styles.productRowTitle, rtl && styles.txtRtl]}>{selected.title}</Text>
            {selected.description ? (
              <Text style={[styles.productDesc, rtl && styles.txtRtl]} numberOfLines={3}>
                {selected.description}
              </Text>
            ) : null}
            <RewardProductPrice product={selected} rtl={rtl} t={t} />
          </View>
          <FontAwesome name={rtl ? 'chevron-left' : 'chevron-right'} size={12} color={brand.primary} />
        </Pressable>
      ) : null}

      {claim && promo ? (
        <View style={[styles.promoBox, isUsed && styles.promoBoxUsed]}>
          <View style={[styles.takenBadge, rtl && styles.rowRtl]}>
            <FontAwesome name="gift" size={12} color={homeShell.greenDark} />
            <Text style={[styles.takenBadgeTxt, rtl && styles.txtRtl]}>{t('referralRewardTakenBadge')}</Text>
          </View>
          <View style={[styles.promoHead, rtl && styles.rowRtl]}>
            <FontAwesome
              name={isUsed ? 'check-circle' : 'ticket'}
              size={18}
              color={isUsed ? homeShell.greenDark : brand.primary}
            />
            <Text style={[styles.promoTitle, rtl && styles.txtRtl]}>{t('referralTierPromoTitle')}</Text>
          </View>
          <Pressable onPress={copyCode} style={[styles.codeRow, rtl && styles.rowRtl]}>
            <Text style={[styles.codeValue, rtl && styles.txtRtl]} selectable>
              {promo.code}
            </Text>
            <FontAwesome name="copy" size={16} color={brand.primary} />
          </Pressable>
          <View style={[styles.statusPill, rtl && styles.rowRtl, isUsed ? styles.statusUsed : styles.statusAvailable]}>
            <Text
              style={[
                styles.statusTxt,
                isUsed && styles.statusTxtUsed,
                rtl && styles.txtRtl,
              ]}>
              {isUsed ? t('referralTierPromoUsed') : t('referralTierPromoAvailable')}
            </Text>
          </View>
          <Text style={[styles.promoHint, rtl && styles.txtRtl]}>{t('referralTierPromoHint')}</Text>
          {!isUsed && claim.shopProductSlug ? (
            <Pressable
              onPress={() => router.push(`/boutique/${claim.shopProductSlug}`)}
              style={[styles.shopBtn, rtl && styles.rowRtl]}>
              <Text style={styles.shopBtnTxt}>{t('referralTierGoShop')}</Text>
              <FontAwesome name={rtl ? 'angle-left' : 'angle-right'} size={14} color={brand.white} />
            </Pressable>
          ) : null}
        </View>
      ) : (
        <Pressable
          onPress={() => void generatePromo()}
          disabled={claiming || (isChoice && !selectedId)}
          style={({ pressed }) => [
            styles.generateBtn,
            (pressed || claiming) && { opacity: 0.92 },
            (isChoice && !selectedId) && styles.generateBtnDisabled,
          ]}>
          {claiming ? (
            <ActivityIndicator color={brand.white} />
          ) : (
            <>
              <FontAwesome name="ticket" size={16} color={brand.white} />
              <Text style={styles.generateBtnTxt}>{t('referralTierGeneratePromo')}</Text>
            </>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: homeShell.borderOnWhite,
    gap: spacing.sm,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'stretch',
  },
  wrapRtl: {
    direction: 'rtl',
  },
  confettiOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: homeShell.blue,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tierLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: homeShell.cardMuted,
    lineHeight: 17,
  },
  singleRewardHint: {
    fontSize: 10,
    fontWeight: '600',
    color: homeShell.blue,
    lineHeight: 14,
  },
  blockedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
  },
  blockedTxt: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: homeShell.cardMuted,
    lineHeight: 17,
  },
  takenBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: `${homeShell.green}22`,
  },
  takenBadgeTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: homeShell.greenDark,
  },
  productList: {
    gap: spacing.sm,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: homeShell.borderOnWhite,
    backgroundColor: '#F8FAFC',
  },
  productRowActive: {
    borderColor: brand.primary,
    backgroundColor: `${brand.primary}08`,
  },
  productRowThumb: {
    width: 96,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: '#E2E8F0',
    flexShrink: 0,
  },
  productThumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productRowBody: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  productRowTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: homeShell.cardText,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  priceStruck: {
    fontSize: 12,
    fontWeight: '600',
    color: homeShell.cardMuted,
    textDecorationLine: 'line-through',
  },
  priceFree: {
    fontSize: fontSize.sm,
    fontWeight: '900',
    color: homeShell.greenDark,
  },
  productDesc: {
    fontSize: 10,
    color: homeShell.cardMuted,
    lineHeight: 14,
  },
  selectIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  selectIndicatorActive: {
    borderColor: brand.primary,
    backgroundColor: brand.primary,
  },
  singleProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  singleBody: { flex: 1, gap: 4, minWidth: 0 },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.lg,
    backgroundColor: homeShell.bg,
  },
  generateBtnDisabled: { opacity: 0.5 },
  generateBtnTxt: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.white,
  },
  promoBox: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: `${homeShell.green}55`,
    gap: spacing.sm,
  },
  promoBoxUsed: {
    backgroundColor: '#F8FAFC',
    borderColor: homeShell.borderOnWhite,
  },
  promoHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  promoTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: homeShell.cardText,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
  },
  codeValue: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: homeShell.bg,
    letterSpacing: 1,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusAvailable: { backgroundColor: `${homeShell.green}22` },
  statusUsed: { backgroundColor: '#E2E8F0' },
  statusTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: homeShell.greenDark,
  },
  statusTxtUsed: {
    color: homeShell.cardMuted,
  },
  promoHint: {
    fontSize: 10,
    color: homeShell.cardMuted,
    lineHeight: 15,
  },
  shopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
  },
  shopBtnTxt: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.white,
  },
  txtRtl: { textAlign: 'right', writingDirection: 'rtl' },
});
