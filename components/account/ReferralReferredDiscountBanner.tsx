import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { HomeCopyKey } from '@/constants/i18n';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import {
  fillReferralPercentPlaceholder,
  formatReferralDiscountPercent,
} from '@/utils/referralDiscountDisplay';

type Variant = 'teaser' | 'card';

type Props = {
  percent: number;
  rtl: boolean;
  variant: Variant;
  t: (k: HomeCopyKey) => string;
};

export function ReferralReferredDiscountBanner({ percent, rtl, variant, t }: Props) {
  const isTeaser = variant === 'teaser';
  const discountLabel = formatReferralDiscountPercent(percent, rtl);
  const hint = fillReferralPercentPlaceholder(t('referralReferredDiscountHint'), percent, rtl);
  const shopLine = t('referralReferredDiscountShopLine');

  return (
    <View
      style={[
        styles.banner,
        isTeaser ? styles.bannerTeaser : styles.bannerCard,
        rtl && styles.bannerRtl,
      ]}
      accessibilityRole="summary"
      accessibilityLabel={`${discountLabel.replace(/\u2066|\u2069/g, '')}, ${shopLine}. ${hint}`}>
      {!isTeaser ? (
        <View style={[styles.cardAccent, rtl && styles.cardAccentRtl]} pointerEvents="none" />
      ) : null}

      <View style={[isTeaser ? styles.iconWrapTeaser : styles.iconWrapCard]}>
        <FontAwesome
          name="shopping-bag"
          size={isTeaser ? 18 : 16}
          color={isTeaser ? homeShell.bg : homeShell.greenDark}
        />
      </View>

      <View style={[styles.content, rtl && styles.contentRtl]}>
        <View style={[styles.percentRow, rtl && styles.percentRowRtl]}>
          <Text
            latinDigits
            style={[
              isTeaser ? styles.percentTeaser : styles.percentCard,
              rtl && styles.percentBidi,
            ]}>
            {discountLabel}
          </Text>
          <View
            style={[
              isTeaser ? styles.shopPillTeaser : styles.shopPillCard,
              rtl && styles.shopPillRtl,
            ]}>
            <Text
              style={[
                isTeaser ? styles.shopPillTxtTeaser : styles.shopPillTxtCard,
                rtl && styles.shopPillTxtRtl,
              ]}>
              {shopLine}
            </Text>
          </View>
        </View>
        <Text
          style={[isTeaser ? styles.hintTeaser : styles.hintCard, rtl && styles.txtRtl]}
          numberOfLines={3}>
          {hint}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  bannerRtl: { flexDirection: 'row-reverse' },
  bannerTeaser: {
    padding: spacing.sm,
    backgroundColor: homeShell.greenAlpha18,
    borderWidth: 1,
    borderColor: 'rgba(47, 206, 148, 0.38)',
  },
  bannerCard: {
    padding: spacing.md,
    backgroundColor: homeShell.greenAlpha11,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    marginBottom: spacing.sm,
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: homeShell.green,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
    zIndex: 0,
  },
  cardAccentRtl: {
    left: undefined,
    right: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  iconWrapTeaser: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: homeShell.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  iconWrapCard: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: 'rgba(47, 206, 148, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  content: { flex: 1, minWidth: 0, gap: 6 },
  contentRtl: { alignItems: 'flex-end' },
  percentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  /** RTL : −10% à droite, badge boutique juste à gauche, même ligne de base. */
  percentRowRtl: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    alignSelf: 'stretch',
    flexWrap: 'nowrap',
    gap: 6,
    paddingVertical: 2,
  },
  percentTeaser: {
    fontSize: 26,
    fontWeight: '800',
    color: homeShell.green,
    letterSpacing: -0.5,
    lineHeight: 32,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  percentCard: {
    fontSize: 24,
    fontWeight: '800',
    color: brand.primary,
    letterSpacing: -0.5,
    lineHeight: 30,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  percentBidi: {
    writingDirection: 'ltr',
    textAlign: 'left',
    alignSelf: 'center',
  },
  shopPillTeaser: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
  },
  shopPillCard: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: 'rgba(47, 206, 148, 0.28)',
    justifyContent: 'center',
  },
  shopPillRtl: {
    alignSelf: 'center',
    paddingVertical: 5,
  },
  shopPillTxtTeaser: {
    fontSize: 10,
    fontWeight: '800',
    color: brand.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  shopPillTxtCard: {
    fontSize: 10,
    fontWeight: '800',
    color: homeShell.greenDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  shopPillTxtRtl: {
    writingDirection: 'rtl',
    textAlign: 'center',
    lineHeight: 14,
    includeFontPadding: false,
  },
  hintTeaser: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
  hintCard: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: homeShell.cardMuted,
    lineHeight: 18,
  },
  txtRtl: { textAlign: 'right', writingDirection: 'rtl' },
});
