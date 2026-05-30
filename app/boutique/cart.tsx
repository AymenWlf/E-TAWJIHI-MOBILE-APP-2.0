import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { PlatformServiceVisualThumb } from '@/components/shop/PlatformServiceVisualThumb';
import { useLocale } from '@/contexts/LocaleContext';
import { useShopCart } from '@/contexts/ShopCartContext';
import { useShopFlowSystemBars } from '@/hooks/useShopFlowSystemBars';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { formatShopPrice, shopParsePriceString, shopPriceFormatOptsForCatalogOrCartLine } from '@/utils/shopFormatPrice';
import { shopProductPrimaryImage } from '@/utils/shopImageUrl';
import { isPlatformServiceCartLine } from '@/utils/platformServiceCart';
import { recordShopBoutiqueEvent } from '@/services/shopBoutiqueAnalytics';

export default function BoutiqueCartScreen() {
  const router = useRouter();
  const { t, isRTL } = useLocale();
  const { lines, count, updateQuantity, removeLine, hydrateImages, ready } = useShopCart();

  const payMethodLines = useMemo(
    () => [
      t('shopCartPayMethodCashDelivery'),
      t('shopCartPayMethodOffice'),
      t('shopCartPayMethodBankTransfer'),
      t('shopCartPayMethodCashplus'),
    ],
    [t],
  );

  useEffect(() => {
    if (ready) {
      void hydrateImages();
    }
  }, [ready, hydrateImages]);

  useEffect(() => {
    void recordShopBoutiqueEvent('view_cart');
  }, []);

  const subtotal = useMemo(
    () => lines.reduce((acc, l) => acc + shopParsePriceString(l.price) * l.quantity, 0),
    [lines],
  );
  const currency = lines[0]?.currency ?? 'MAD';
  const cartWideFreeShipping = useMemo(
    () => lines.length > 0 && lines.some((l) => l.isFreeShipping === true),
    [lines],
  );

  const hasFooter = lines.length > 0;
  const { headerColor, bottomColor } = useShopFlowSystemBars({
    headerColor: brand.white,
    bottomColor: hasFooter ? brand.white : brand.backgroundSoft,
  });

  return (
    <View style={[styles.screen, isRTL && styles.rtlRoot]}>
      <StatusBar style="dark" backgroundColor={headerColor} />

      <SafeAreaView edges={['top']} style={[styles.headerSafe, { backgroundColor: headerColor }]}>
      <View style={[styles.topBar, isRTL && styles.rowRtl]}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/boutique'))}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.85 }]}
          hitSlop={6}
        >
          <FontAwesome name={isRTL ? 'chevron-right' : 'chevron-left'} size={16} color={brand.text} />
        </Pressable>
        <View style={styles.topTitleWrap}>
          <Text style={[styles.eyebrow, isRTL && styles.txtRtl]}>{t('shopCartEyebrowBoutique')}</Text>
          <Text style={[styles.topTitle, isRTL && styles.txtRtl]}>{t('shopCartTitle')}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>
      </SafeAreaView>

      {lines.length === 0 ? (
        <SafeAreaView edges={['bottom']} style={[styles.screenSafe, { backgroundColor: bottomColor }]}>
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <FontAwesome name="shopping-bag" size={36} color={brand.primary} />
          </View>
          <Text style={[styles.emptyTitle, isRTL && styles.txtRtl]}>{t('shopCartEmptyTitle')}</Text>
          <Text style={[styles.emptyDesc, isRTL && styles.txtRtl]}>{t('shopCartEmptyDesc')}</Text>
          <Pressable
            style={({ pressed }) => [styles.btnPrimary, pressed && { opacity: 0.9 }]}
            onPress={() => router.replace('/(tabs)/boutique')}
          >
            <Text style={styles.btnPrimaryTxt}>{t('shopCartEmptyCta')}</Text>
          </Pressable>
        </View>
        </SafeAreaView>
      ) : (
        <>
          <ScrollView style={styles.scrollFill} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            <Text style={[styles.itemCount, isRTL && styles.txtRtl]}>
              {count === 1 ? t('shopCartItemsOne') : t('shopCartItemsMany').replace('{n}', String(count))}
            </Text>

            {lines.map((l) => {
              const lineTotal = shopParsePriceString(l.price) * l.quantity;
              const priceOpts = shopPriceFormatOptsForCatalogOrCartLine(l);
              const isSvc = isPlatformServiceCartLine(l);
              return (
                <View key={`${l.lineKind ?? 'shop'}-${l.productId}`} style={[styles.itemCard, isRTL && styles.rowRtl]}>
                  {isSvc ? (
                    <PlatformServiceVisualThumb
                      brandIcon={l.platformServiceBrandIcon}
                      brandColor={l.platformServiceBrandColor}
                      size={86}
                      iconSize={32}
                    />
                  ) : (
                    <Image source={{ uri: shopProductPrimaryImage(l.images) }} style={styles.itemImg} resizeMode="cover" />
                  )}
                  <View style={styles.itemBody}>
                    <Text style={[styles.itemTitle, isRTL && styles.txtRtl]} numberOfLines={2}>
                      {l.title}
                    </Text>
                    <View style={[styles.itemMetaRow, isRTL && styles.rowRtl]}>
                      <View style={[styles.itemTypeBadge, isRTL && styles.rowRtl]}>
                        <FontAwesome
                          name={isSvc ? 'briefcase' : l.type === 'pack' ? 'cubes' : 'cube'}
                          size={10}
                          color={brand.primary}
                        />
                        <Text style={[styles.itemTypeTxt, isRTL && styles.txtRtl]}>
                          {isSvc ? t('shopBadgeService') : l.type === 'pack' ? t('shopBadgePack') : t('shopBadgeProduct')}
                        </Text>
                      </View>
                      <Text style={[styles.itemUnit, isRTL && styles.txtRtl]}>
                        {formatShopPrice(l.price, l.currency, priceOpts)} {t('shopCartPerUnit')}
                      </Text>
                    </View>

                    <View style={[styles.qtyRow, isRTL && styles.rowRtl]}>
                      {isSvc ? (
                        <View style={[styles.qtyFixedWrap, isRTL && styles.rowRtl]}>
                          <Text style={[styles.qtyFixedLbl, isRTL && styles.txtRtl]}>{t('shopCartQtyLabel')}</Text>
                          <Text style={[styles.qtyFixedVal, isRTL && styles.txtRtl]}>1</Text>
                        </View>
                      ) : (
                        <View style={[styles.qtyStepper, isRTL && styles.rowRtl]}>
                          <Pressable
                            disabled={l.quantity <= 1}
                            onPress={() => void updateQuantity(l.productId, l.quantity - 1)}
                            style={({ pressed }) => [styles.qtyBtn, l.quantity <= 1 && styles.qtyBtnDisabled, pressed && { opacity: 0.85 }]}
                          >
                            <FontAwesome name="minus" size={11} color={brand.text} />
                          </Pressable>
                          <Text style={styles.qtyValue}>{l.quantity}</Text>
                          <Pressable
                            disabled={l.quantity >= 99}
                            onPress={() => void updateQuantity(l.productId, l.quantity + 1)}
                            style={({ pressed }) => [styles.qtyBtn, l.quantity >= 99 && styles.qtyBtnDisabled, pressed && { opacity: 0.85 }]}
                          >
                            <FontAwesome name="plus" size={11} color={brand.text} />
                          </Pressable>
                        </View>
                      )}
                      <Text style={[styles.itemTotal, isRTL && styles.txtRtl]}>
                        {formatShopPrice(String(lineTotal), l.currency, priceOpts)}
                      </Text>
                    </View>

                    <Pressable
                      onPress={() => void removeLine(l.productId)}
                      hitSlop={6}
                      style={({ pressed }) => [styles.removeBtn, isRTL && styles.rowRtl, pressed && { opacity: 0.85 }]}
                    >
                      <FontAwesome name="trash-o" size={12} color={brand.error} />
                      <Text style={[styles.removeTxt, isRTL && styles.txtRtl]}>{t('shopCartRemove')}</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}

            <View style={styles.summaryCard}>
              <Text style={[styles.summaryTitle, isRTL && styles.txtRtl]}>{t('shopCartSummaryTitle')}</Text>
              <View style={[styles.summaryRow, isRTL && styles.rowRtl]}>
                <Text style={[styles.summaryLbl, isRTL && styles.txtRtl]}>{t('shopCartSubtotal')}</Text>
                <Text style={[styles.summaryVal, isRTL && styles.txtRtl]}>{formatShopPrice(String(subtotal), currency)}</Text>
              </View>
              <View style={[styles.summaryRow, isRTL && styles.rowRtl]}>
                <View style={[styles.summaryShipLead, isRTL && styles.rowRtl]}>
                  <FontAwesome name="truck" size={11} color={brand.primary} />
                  <Text style={[styles.summaryLbl, isRTL && styles.txtRtl]}>{t('shopCartShippingLbl')}</Text>
                </View>
                <Text style={[styles.summaryNote, isRTL && styles.txtRtl]}>
                  {cartWideFreeShipping ? t('shopCartShippingFreeAll') : t('shopCartShippingNext')}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={[styles.summaryRow, isRTL && styles.rowRtl]}>
                <Text style={[styles.summaryTotalLbl, isRTL && styles.txtRtl]}>{t('shopCartTotalEstimated')}</Text>
                <Text style={[styles.summaryTotalVal, isRTL && styles.txtRtl]}>{formatShopPrice(String(subtotal), currency)}</Text>
              </View>

              <View style={styles.payHints}>
                <View style={[styles.payHint, styles.payHintAlignTop, isRTL && styles.rowRtl]}>
                  <FontAwesome name="list-ul" size={14} color={brand.primary} style={styles.payHintLeadIcon} />
                  <View style={styles.payHintBody}>
                    <Text style={[styles.payHintTitle, isRTL && styles.payHintTxtRtl]}>
                      {t('shopCartPayMethodsTitle')}
                    </Text>
                    {payMethodLines.map((line, i) => (
                      <Text key={`p-${i}`} style={[styles.payHintBullet, isRTL && styles.payHintTxtRtl]}>
                        {'\u2022'} {line}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
              <Text style={[styles.disclaimer, isRTL && styles.txtRtl]}>{t('shopCartPayDisclaimer')}</Text>
            </View>
          </ScrollView>

          <SafeAreaView edges={['bottom']} style={[styles.footerSafe, { backgroundColor: bottomColor }]}>
            <View style={[styles.checkoutBar, isRTL && styles.rowRtl]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.checkoutBarLbl, isRTL && styles.txtRtl]}>{t('shopCartFooterTotal')}</Text>
                <Text style={[styles.checkoutBarTotal, isRTL && styles.txtRtl]}>{formatShopPrice(String(subtotal), currency)}</Text>
              </View>
              <Pressable
                onPress={() => router.push('/boutique/checkout' as any)}
                style={({ pressed }) => [styles.checkoutBtn, isRTL && styles.rowRtl, pressed && { opacity: 0.92 }]}
              >
                <Text style={styles.checkoutBtnTxt}>{t('shopCartGoCheckout')}</Text>
                <FontAwesome name={isRTL ? 'arrow-left' : 'arrow-right'} size={13} color={brand.white} />
              </Pressable>
            </View>
          </SafeAreaView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: brand.backgroundSoft },
  headerSafe: {},
  footerSafe: {},
  scrollFill: { flex: 1 },
  screenSafe: { flex: 1 },
  rtlRoot: { direction: 'rtl' },
  rowRtl: { flexDirection: 'row-reverse' },
  txtRtl: { textAlign: 'right', writingDirection: 'rtl' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: brand.white,
    borderBottomWidth: 1,
    borderBottomColor: brand.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brand.backgroundSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitleWrap: { flex: 1, alignItems: 'center' },
  eyebrow: { fontSize: 10, fontWeight: '800', color: brand.cyan, letterSpacing: 1 },
  topTitle: { marginTop: 2, fontSize: fontSize.lg, fontWeight: '800', color: brand.text },
  list: { padding: spacing.lg, paddingBottom: 140 },
  itemCount: { color: brand.textSecondary, fontSize: fontSize.sm, marginBottom: spacing.md, fontWeight: '600' },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: brand.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  itemImg: {
    width: 86,
    height: 86,
    borderRadius: radius.md,
    backgroundColor: brand.backgroundSoft,
  },
  itemBody: { flex: 1, gap: 6 },
  itemTitle: { fontSize: fontSize.sm, fontWeight: '800', color: brand.text, lineHeight: 18 },
  itemMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  itemTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: brand.backgroundSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  itemTypeTxt: { fontSize: 10, color: brand.primary, fontWeight: '800' },
  itemUnit: { fontSize: 11, color: brand.textMuted, fontWeight: '600' },
  qtyRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  qtyFixedWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: brand.backgroundSoft,
    borderWidth: 1,
    borderColor: brand.border,
  },
  qtyFixedLbl: { fontSize: 11, fontWeight: '700', color: brand.textMuted },
  qtyFixedVal: { fontSize: fontSize.sm, fontWeight: '800', color: brand.text, minWidth: 12, textAlign: 'center' },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brand.backgroundSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.border,
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnDisabled: { opacity: 0.35 },
  qtyValue: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.text,
  },
  itemTotal: { fontSize: fontSize.md, fontWeight: '800', color: brand.primary },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  removeTxt: { color: brand.error, fontSize: 12, fontWeight: '700' },

  summaryCard: {
    marginTop: spacing.md,
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: brand.border,
    padding: spacing.lg,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  summaryTitle: { fontSize: fontSize.md, fontWeight: '800', color: brand.text },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLbl: { fontSize: fontSize.sm, color: brand.textSecondary },
  summaryShipLead: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  summaryVal: { fontSize: fontSize.sm, color: brand.text, fontWeight: '700' },
  summaryNote: { fontSize: 11, color: brand.textMuted, fontStyle: 'italic' },
  summaryDivider: { height: 1, backgroundColor: brand.border },
  summaryTotalLbl: { fontSize: fontSize.md, fontWeight: '800', color: brand.text },
  summaryTotalVal: { fontSize: fontSize.lg, fontWeight: '800', color: brand.primary },
  payHints: { gap: 8, marginTop: 4 },
  payHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: brand.backgroundSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.border,
  },
  payHintAlignTop: { alignItems: 'flex-start' },
  payHintLeadIcon: { marginTop: 2 },
  payHintBody: { flex: 1, gap: 6 },
  payHintTitle: { fontSize: 12, fontWeight: '800', color: brand.text },
  payHintBullet: { fontSize: 11, lineHeight: 17, color: brand.textSecondary, fontWeight: '600' },
  payHintTxtRtl: { textAlign: 'right', writingDirection: 'rtl' },
  disclaimer: {
    marginTop: 4,
    fontSize: 11,
    color: brand.textMuted,
    backgroundColor: brand.backgroundSoft,
    padding: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: brand.borderLight,
    borderStyle: 'dashed',
    lineHeight: 15,
  },

  checkoutBar: {
    backgroundColor: brand.white,
    borderTopWidth: 1,
    borderTopColor: brand.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkoutBarLbl: { fontSize: 11, color: brand.textMuted, fontWeight: '700', letterSpacing: 0.4 },
  checkoutBarTotal: { fontSize: fontSize.lg, fontWeight: '800', color: brand.primary },
  checkoutBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
  },
  checkoutBtnTxt: { color: brand.white, fontSize: fontSize.sm, fontWeight: '800' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(51,62,143,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: '800', color: brand.text },
  emptyDesc: {
    marginTop: 8,
    color: brand.textSecondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  btnPrimary: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
  },
  btnPrimaryTxt: { color: brand.white, fontSize: fontSize.sm, fontWeight: '800' },
});
