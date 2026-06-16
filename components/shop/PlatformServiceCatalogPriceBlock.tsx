import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { ShopPriceAmount } from '@/components/shop/ShopPriceAmount';
import { useLocale } from '@/contexts/LocaleContext';
import type { AppLocale } from '@/constants/i18n';
import { brand, radius, spacing } from '@/theme/tokens';
import type { PlatformServiceCatalogPriceMode } from '@/utils/platformServiceEntitlementUi';
import {
  formatPromotionDisplayDate,
  formatPromotionTimeRemaining,
  resolvePlatformServicePromotionDeadline,
} from '@/utils/platformServicePromotionDeadline';

type Props = {
  pricePrimary: string;
  priceCompare: string | null;
  priceMode: PlatformServiceCatalogPriceMode;
  hasPromo: boolean;
  isUpgradePrice: boolean;
  showPromoStyle: boolean;
  inactive?: boolean;
  currency: string;
  promotionDeadlineAt: string | null | undefined;
  locale: AppLocale;
  isRTL?: boolean;
  promoLabel: string;
  upgradeLabel: string;
  /** Ex. « −20 % » — affiché dans la ligne prix (fiche détail). */
  discountPercentLabel?: string | null;
  /** Pleine largeur dans les cartes stack boutique. */
  stack?: boolean;
};

/** Bloc tarif aligné sur `BoutiquePlatformServiceCard` (web). */
export function PlatformServiceCatalogPriceBlock({
  pricePrimary,
  priceCompare,
  priceMode,
  hasPromo,
  isUpgradePrice,
  showPromoStyle,
  inactive = false,
  currency,
  promotionDeadlineAt,
  locale,
  isRTL: isRTLProp,
  promoLabel,
  upgradeLabel,
  discountPercentLabel,
  stack = false,
}: Props) {
  const { isRTL: isRTLContext } = useLocale();
  const isRTL = isRTLProp ?? isRTLContext;
  const tagRtlText = isRTL ? styles.tagRtlText : undefined;
  const priceIntl = { minimumFractionDigits: 0, maximumFractionDigits: 0 } as const;
  const [now, setNow] = useState(() => new Date());

  const promoDeadline = useMemo(() => {
    if (!hasPromo) return null;
    return resolvePlatformServicePromotionDeadline(promotionDeadlineAt, true, now);
  }, [hasPromo, promotionDeadlineAt, now]);

  useEffect(() => {
    if (!promoDeadline?.isActive) return;
    const ms = promoDeadline.targetDate.getTime() - Date.now();
    const intervalMs = ms > 0 && ms < 86_400_000 ? 1000 : 60_000;
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [promoDeadline?.isActive, promoDeadline?.targetDate]);

  if (priceMode === 'hidden') return null;

  const timeRemaining =
    promoDeadline?.isActive && promoDeadline.targetDate
      ? formatPromotionTimeRemaining(now, promoDeadline.targetDate, locale, false)
      : '';

  const displayDate =
    promoDeadline?.targetDate != null
      ? formatPromotionDisplayDate(promoDeadline.targetDate, locale)
      : promoDeadline?.displayText ?? '';

  const promoBadgeEl =
    priceMode === 'promo-primary-only' && hasPromo && !isUpgradePrice ? (
      <View style={styles.promoBadge}>
        <Text style={[styles.promoBadgeTxt, tagRtlText]}>{promoLabel}</Text>
      </View>
    ) : isUpgradePrice ? (
      <View style={[styles.promoBadge, styles.upgradeBadge]}>
        <Text style={[styles.promoBadgeTxt, tagRtlText]}>{upgradeLabel}</Text>
      </View>
    ) : null;

  return (
    <View
      style={[
        styles.wrap,
        styles.box,
        stack && styles.boxStack,
        showPromoStyle ? styles.boxPromo : styles.boxStandard,
        isRTL && styles.boxRtl,
      ]}
    >
      {isRTL && promoBadgeEl ? (
        <View style={styles.promoBadgeLineRtl}>{promoBadgeEl}</View>
      ) : null}
      <View style={[styles.priceRow, isRTL && styles.priceRowRtl]}>
        {!isRTL ? promoBadgeEl : null}
        {isRTL && priceCompare && priceMode === 'standard' ? (
          <ShopPriceAmount
            amount={priceCompare}
            currency={currency}
            intl={priceIntl}
            amountStyle={styles.priceCompare}
            currencyStyle={styles.priceCompare}
          />
        ) : null}
        <ShopPriceAmount
          amount={pricePrimary}
          currency={currency}
          intl={priceIntl}
          amountStyle={[
            styles.priceMain,
            inactive && styles.priceMuted,
            showPromoStyle && styles.priceSale,
          ]}
        />
        {!isRTL && priceCompare && priceMode === 'standard' ? (
          <ShopPriceAmount
            amount={priceCompare}
            currency={currency}
            intl={priceIntl}
            amountStyle={styles.priceCompare}
            currencyStyle={styles.priceCompare}
          />
        ) : null}
        {discountPercentLabel ? (
          <View style={styles.discountChip}>
            <Text style={[styles.discountChipTxt, tagRtlText]}>{discountPercentLabel}</Text>
          </View>
        ) : null}
      </View>
      {displayDate ? (
        <View style={[styles.deadlineWrap, isRTL && styles.deadlineWrapRtl]}>
          <Text style={[styles.deadlineTxt, isRTL && styles.deadlineTxtRtl]} numberOfLines={3}>
            {locale === 'ar' ? 'حتى ' : "Jusqu'au "}
            {displayDate}
            {timeRemaining ? ` · ${timeRemaining}` : ''}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
  },
  box: {
    marginTop: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  boxStack: {
    marginTop: spacing.md,
  },
  boxStandard: {
    backgroundColor: 'rgba(248,250,252,0.95)',
    borderColor: 'rgba(226,232,240,0.95)',
  },
  boxPromo: {
    backgroundColor: 'rgba(254,242,242,0.75)',
    borderColor: 'rgba(254,202,202,0.95)',
  },
  boxRtl: {
    alignItems: 'stretch',
  },
  promoBadgeLineRtl: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  priceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
  },
  priceRowRtl: {
    justifyContent: 'flex-end',
  },
  promoBadge: {
    flexGrow: 0,
    flexShrink: 1,
    alignSelf: 'flex-start',
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  upgradeBadge: {
    backgroundColor: brand.primary,
  },
  promoBadgeTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: brand.white,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  priceMain: {
    fontSize: 22,
    fontWeight: '900',
    color: brand.primary,
    letterSpacing: -0.5,
  },
  priceSale: {
    color: '#DC2626',
  },
  priceMuted: {
    color: '#94A3B8',
  },
  priceCompare: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  discountChip: {
    backgroundColor: 'rgba(254,226,226,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(254,202,202,0.95)',
  },
  discountChipTxt: {
    fontSize: 11,
    fontWeight: '900',
    color: '#B91C1C',
  },
  tagRtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  deadlineWrap: {
    alignSelf: 'stretch',
    width: '100%',
  },
  deadlineWrapRtl: {
    alignItems: 'flex-end',
  },
  deadlineTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B91C1C',
    lineHeight: 17,
  },
  deadlineTxtRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
    width: '100%',
  },
});
