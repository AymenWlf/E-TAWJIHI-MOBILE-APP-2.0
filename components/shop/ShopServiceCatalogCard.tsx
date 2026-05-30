import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useMemo } from 'react';
import { Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { PlatformServiceEntitlementStatus } from '@/components/shop/PlatformServiceEntitlementStatus';
import { Text } from '@/components/ui/Text';
import type { AppLocale, HomeCopyKey } from '@/constants/i18n';
import type { PlatformServiceCatalogEntitlement, PlatformServiceItem } from '@/services/platformServices';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { EligibilityProfile } from '@/utils/eligibility';
import { platformServiceEligibleForProfile } from '@/utils/platformServiceFilieresFilter';
import {
  platformServiceCatalogCardInactive,
  platformServiceCatalogDisplayPrices,
  platformServiceCatalogPriceMode,
  platformServiceCatalogPurchasable,
  platformServiceEntitlementCtaLabel,
} from '@/utils/platformServiceEntitlementUi';
import {
  platformServiceActivePromotionalPrice,
  platformServiceCurrency,
} from '@/utils/platformServicePrice';
import { resolvePlatformServicePromotionDeadline } from '@/utils/platformServicePromotionDeadline';
import { recordShopBoutiqueEvent } from '@/services/shopBoutiqueAnalytics';
import { formatShopPrice } from '@/utils/shopFormatPrice';
import {
  normalizePlatformServiceBrandColor,
  platformServiceFaIcon,
  withAlpha,
} from '@/utils/platformServiceBrandIcon';

const H_PAD = spacing.md;

type LocaleT = (key: HomeCopyKey, ...args: never[]) => string;

export type ShopServiceCatalogCardProps = {
  service: PlatformServiceItem;
  locale: AppLocale;
  t: LocaleT;
  isRTL: boolean;
  eligibilityProfile: EligibilityProfile | null;
  eligibilityProfileLoading: boolean;
  entitlement?: PlatformServiceCatalogEntitlement;
  entitlementsLoading?: boolean;
  serviceNameBySlug?: Map<string, string>;
  inCart: boolean;
  onOpenDetail: () => void;
  onAddCart: () => void;
  onBuyNow: () => void;
  layout?: 'carousel' | 'stack';
};


export function ShopServiceCatalogCard({
  service: s,
  locale,
  t,
  isRTL,
  eligibilityProfile,
  eligibilityProfileLoading,
  entitlement,
  entitlementsLoading = false,
  serviceNameBySlug = new Map<string, string>(),
  inCart,
  onOpenDetail,
  onAddCart,
  onBuyNow,
  layout = 'carousel',
}: ShopServiceCatalogCardProps) {
  const { width: winW } = useWindowDimensions();
  const isStack = layout === 'stack';
  const carouselCardW = Math.min(320, Math.max(220, winW - H_PAD * 2));

  const cur = platformServiceCurrency(s.currency);
  const sale = s.promotionalPrice;
  const list = s.price;
  const hasPromo = Boolean(platformServiceActivePromotionalPrice(list, sale, s.promotionDeadlineAt));
  const promoDeadline = hasPromo
    ? resolvePlatformServicePromotionDeadline(s.promotionDeadlineAt, true)
    : null;
  const inactive = platformServiceCatalogCardInactive(entitlement, entitlementsLoading);
  const brandHex = normalizePlatformServiceBrandColor(s.brandColor, inactive);
  const priceMode = platformServiceCatalogPriceMode(entitlement, entitlementsLoading, hasPromo);
  const { primary: pricePrimary, compare: priceCompare, isUpgradePrice } = platformServiceCatalogDisplayPrices(
    list,
    sale,
    priceMode,
    entitlement,
    s.promotionDeadlineAt,
  );
  const showPromoStyle = hasPromo || isUpgradePrice;
  const purchasable = platformServiceCatalogPurchasable(entitlement, entitlementsLoading);

  const localizedDesc =
    locale === 'ar'
      ? (s.descriptionAr?.trim() || s.descriptionFr?.trim() || s.description?.trim() || '')
      : (s.descriptionFr?.trim() || s.descriptionAr?.trim() || s.description?.trim() || '');
  const feats =
    locale === 'ar'
      ? (s.featuresAr?.length ? s.featuresAr : s.features).slice(0, 3)
      : (s.features?.length ? s.features : s.featuresAr).slice(0, 3);

  const isEligible = useMemo(
    () =>
      platformServiceEligibleForProfile(s, eligibilityProfile, {
        profileLoading: eligibilityProfileLoading,
      }),
    [s, eligibilityProfile, eligibilityProfileLoading],
  );

  useEffect(() => {
    void recordShopBoutiqueEvent('impression_listing', undefined, s.slug);
  }, [s.slug]);

  return (
    <View
      style={[
        styles.outer,
        inactive && styles.outerInactive,
        isStack
          ? styles.outerStack
          : [styles.outerCarousel, { width: carouselCardW, marginEnd: spacing.sm }],
      ]}
    >
      <Pressable
        onPress={() => {
          void recordShopBoutiqueEvent('click_product', undefined, s.slug);
          onOpenDetail();
        }}
        style={({ pressed }) => (pressed ? { opacity: 0.94 } : undefined)}
        accessibilityRole="button"
        accessibilityLabel={`${s.name} — ${t('shopServiceDetail')}`}
      >
        <View style={[styles.header, { backgroundColor: brandHex }, inactive && styles.headerInactive]}>
          <View style={[styles.headerOrb, { backgroundColor: withAlpha('#FFFFFF', 0.18) }]} pointerEvents="none" />
          <View style={[styles.headerOrb2, { backgroundColor: withAlpha(homeShell.green, 0.35) }]} pointerEvents="none" />
          <View style={[styles.headerRow, isRTL && styles.headerRowRtl]}>
            <View style={[styles.iconWrap, { borderColor: withAlpha('#FFFFFF', 0.35) }]}>
              <FontAwesome name={platformServiceFaIcon(s.brandIcon)} size={22} color={brand.white} />
            </View>
            <View style={styles.headerTexts}>
              <View style={[styles.titleRow, isRTL && styles.titleRowRtl]}>
                <Text style={[styles.name, isRTL && styles.txtRtl]} numberOfLines={isStack ? 3 : 2}>
                  {s.name}
                </Text>
              </View>
              <View style={[styles.badgesRow, isRTL && styles.badgesRowRtl]}>
                {!inactive && s.popular ? (
                  <View style={styles.badgePopular}>
                    <FontAwesome name="star" size={8} color="#B45309" />
                    <Text style={styles.badgePopularTxt}>{t('shopServicesPopular')}</Text>
                  </View>
                ) : null}
                {!inactive && s.isBestseller ? (
                  <View style={styles.badgeBest}>
                    <Text style={styles.badgeBestTxt}>{t('shopBadgeBestseller')}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.body, isStack && styles.bodyStack]}>
          {!eligibilityProfileLoading ? (
            <View
              style={[
                styles.eligibilityPill,
                isEligible ? styles.eligibilityOk : styles.eligibilityKo,
                isRTL && styles.eligibilityPillRtl,
              ]}
            >
              <FontAwesome
                name={isEligible ? 'check-circle' : 'times-circle'}
                size={10}
                color={isEligible ? '#15803D' : '#B91C1C'}
              />
              <Text
                style={[
                  styles.eligibilityTxt,
                  isEligible ? styles.eligibilityTxtOk : styles.eligibilityTxtKo,
                  isRTL && styles.txtRtl,
                ]}
                numberOfLines={1}
              >
                {t(isEligible ? 'eligibilityYouEligible' : 'eligibilityYouNotEligible')}
              </Text>
            </View>
          ) : null}

          <PlatformServiceEntitlementStatus
            entitlement={entitlement}
            entitlementsLoading={entitlementsLoading}
            serviceNameBySlug={serviceNameBySlug}
            locale={locale}
            isRTL={isRTL}
            t={(key) => t(key as Parameters<typeof t>[0])}
            variant="compact"
          />

          {localizedDesc ? (
            <Text style={[styles.desc, isRTL && styles.txtRtl]} numberOfLines={isStack ? 4 : 3}>
              {localizedDesc}
            </Text>
          ) : null}

          {feats.length > 0 ? (
            <View style={styles.featBox}>
              {feats.map((line) => (
                <View key={line} style={[styles.featRow, isRTL && styles.featRowRtl]}>
                  <View style={styles.featCheck}>
                    <FontAwesome name="check" size={7} color={homeShell.greenDark} />
                  </View>
                  <Text style={[styles.featTxt, isRTL && styles.txtRtl]} numberOfLines={2}>
                    {line}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {priceMode !== 'hidden' ? (
            <View style={[styles.priceBox, showPromoStyle && styles.priceBoxPromo]}>
              <View style={[styles.priceRow, isRTL && styles.priceRowRtl]}>
                {priceMode === 'promo-primary-only' && hasPromo && !isUpgradePrice ? (
                  <View style={styles.promoChip}>
                    <Text style={styles.promoChipTxt}>{t('shopServicePromoChip')}</Text>
                  </View>
                ) : isUpgradePrice ? (
                  <View style={[styles.promoChip, styles.upgradeChip]}>
                    <Text style={[styles.promoChipTxt, styles.upgradeChipTxt]}>
                      {t('shopEntitlementUpgradeAvailable')}
                    </Text>
                  </View>
                ) : null}
                <Text
                  style={[
                    styles.priceMain,
                    inactive && styles.priceMuted,
                    showPromoStyle && styles.priceSale,
                  ]}
                >
                  {formatShopPrice(pricePrimary, cur, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Text>
                {priceCompare && priceMode === 'standard' ? (
                  <Text style={styles.priceCompare}>
                    {formatShopPrice(priceCompare, cur, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </Text>
                ) : null}
              </View>
              {promoDeadline?.displayText ? (
                <Text style={[styles.deadline, isRTL && styles.txtRtl]} numberOfLines={2}>
                  {locale === 'ar' ? 'حتى ' : "Jusqu'au "}
                  {promoDeadline.displayText}
                  {promoDeadline.timeRemaining ? ` · ${promoDeadline.timeRemaining}` : ''}
                </Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.detailBtn}>
            <FontAwesome name="file-text-o" size={12} color={brand.primary} />
            <Text style={styles.detailBtnTxt}>{t('shopServiceDetail')}</Text>
            <FontAwesome name={isRTL ? 'chevron-left' : 'chevron-right'} size={11} color={brand.primary} />
          </View>
        </View>
      </Pressable>

      <View style={[styles.actionsBar, isStack && styles.actionsBarStack]}>
        <View style={[styles.actions, isRTL && styles.actionsRtl]}>
          <Pressable
            onPress={() => {
              if (!purchasable && !inCart) return;
              void onAddCart();
            }}
            disabled={(!purchasable && !inCart) || entitlementsLoading}
            style={({ pressed }) => [
              styles.cartBtn,
              inCart && styles.cartBtnOn,
              ((!purchasable && !inCart) || entitlementsLoading) && styles.btnDisabled,
              pressed && purchasable && !entitlementsLoading && { opacity: 0.88 },
            ]}
            accessibilityLabel={
              !purchasable && !inCart ? t('shopEntitlementNotPurchasable') : inCart ? t('shopRemoveFromCartA11y') : t('shopAddA11y')
            }
          >
            <FontAwesome
              name={inCart ? 'check' : 'shopping-cart'}
              size={15}
              color={!purchasable && !inCart ? '#94A3B8' : inCart ? brand.white : brand.primary}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              if (!purchasable && !inCart) return;
              void onBuyNow();
            }}
            disabled={(!purchasable && !inCart) || entitlementsLoading}
            style={({ pressed }) => [
              styles.buyBtn,
              ((!purchasable && !inCart) || entitlementsLoading) && styles.buyBtnDisabled,
              pressed && purchasable && !entitlementsLoading && { opacity: 0.92 },
            ]}
            accessibilityLabel={
              !purchasable && !inCart ? t('shopEntitlementNotPurchasable') : t('shopBuyNowA11y')
            }
          >
            <Text
              style={[
                styles.buyTxt,
                ((!purchasable && !inCart) || entitlementsLoading) && styles.buyTxtDisabled,
              ]}
            >
              {platformServiceEntitlementCtaLabel(entitlement, (key) => t(key as Parameters<typeof t>[0]), 'shopBuyNow')}
            </Text>
            <FontAwesome name={isRTL ? 'angle-left' : 'angle-right'} size={14} color={brand.white} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const cardShadow =
  Platform.OS === 'android'
    ? { elevation: 6 }
    : {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 14,
      };

const styles = StyleSheet.create({
  outer: {
    borderRadius: radius.lg + 2,
    backgroundColor: brand.white,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    ...cardShadow,
  },
  outerCarousel: {
    maxWidth: '100%',
  },
  outerStack: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  outerInactive: {
    opacity: 0.92,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg + 4,
    overflow: 'hidden',
  },
  headerInactive: {
    opacity: 0.85,
  },
  headerOrb: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    top: -24,
    end: -20,
  },
  headerOrb2: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    bottom: -12,
    start: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  headerRowRtl: {
    flexDirection: 'row-reverse',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTexts: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  titleRowRtl: {
    flexDirection: 'row-reverse',
  },
  name: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: '800',
    color: brand.white,
    lineHeight: 21,
    letterSpacing: -0.25,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badgesRowRtl: {
    flexDirection: 'row-reverse',
  },
  badgePopular: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  badgePopularTxt: {
    fontSize: 9,
    fontWeight: '800',
    color: '#92400E',
  },
  badgeBest: {
    backgroundColor: homeShell.green,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  badgeBestTxt: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0f172a',
  },
  body: {
    marginTop: -10,
    borderTopStartRadius: radius.lg,
    borderTopEndRadius: radius.lg,
    backgroundColor: brand.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  bodyStack: {
    paddingBottom: spacing.sm + 2,
  },
  eligibilityPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  eligibilityPillRtl: {
    flexDirection: 'row-reverse',
    alignSelf: 'flex-end',
  },
  eligibilityOk: {
    backgroundColor: 'rgba(47,206,148,0.14)',
  },
  eligibilityKo: {
    backgroundColor: 'rgba(254,226,226,0.9)',
  },
  eligibilityTxt: {
    fontSize: 11,
    fontWeight: '700',
    maxWidth: '100%',
  },
  eligibilityTxtOk: {
    color: '#15803D',
  },
  eligibilityTxtKo: {
    color: '#B91C1C',
  },
  desc: {
    fontSize: fontSize.sm,
    color: brand.textMuted,
    fontWeight: '500',
    lineHeight: 19,
  },
  featBox: {
    gap: 8,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51,62,143,0.04)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(51,62,143,0.1)',
  },
  featRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  featRowRtl: {
    flexDirection: 'row-reverse',
  },
  featCheck: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: homeShell.greenAlpha11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  featTxt: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: brand.textSecondary,
    lineHeight: 16,
  },
  priceBox: {
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51,62,143,0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(51,62,143,0.12)',
    gap: 4,
  },
  priceBoxPromo: {
    backgroundColor: 'rgba(254,242,242,0.85)',
    borderColor: 'rgba(248,113,113,0.35)',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceRowRtl: {
    flexDirection: 'row-reverse',
  },
  promoChip: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  promoChipTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: brand.white,
    letterSpacing: 0.3,
  },
  upgradeChip: {
    backgroundColor: brand.primary,
  },
  upgradeChipTxt: {
    color: brand.white,
  },
  priceMain: {
    fontSize: 20,
    fontWeight: '900',
    color: brand.primary,
    letterSpacing: -0.4,
  },
  priceSale: {
    color: '#DC2626',
  },
  priceMuted: {
    color: '#94A3B8',
  },
  priceCompare: {
    fontSize: 13,
    color: brand.textMuted,
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  deadline: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B91C1C',
    lineHeight: 15,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(51,62,143,0.14)',
    backgroundColor: 'rgba(51,62,143,0.03)',
  },
  detailBtnTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: brand.primary,
  },
  actionsBar: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
  },
  actionsBarStack: {
    paddingBottom: spacing.md + 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionsRtl: {
    flexDirection: 'row-reverse',
  },
  cartBtn: {
    width: 48,
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(51,62,143,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.white,
  },
  cartBtnOn: {
    backgroundColor: homeShell.green,
    borderColor: homeShell.green,
  },
  btnDisabled: {
    opacity: 0.5,
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  buyBtn: {
    flex: 1,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
  },
  buyBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  buyTxt: {
    color: brand.white,
    fontSize: fontSize.sm,
    fontWeight: '800',
    letterSpacing: 0.15,
  },
  buyTxtDisabled: {
    color: '#F8FAFC',
  },
  txtRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
});
