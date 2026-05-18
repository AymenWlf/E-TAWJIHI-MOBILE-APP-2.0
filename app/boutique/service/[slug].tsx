import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ShareIconButton } from '@/components/share/ShareIconButton';
import { EstablishmentRowLogoThumb } from '@/components/shop/EstablishmentRowLogoThumb';
import { PlatformServiceVisualThumb } from '@/components/shop/PlatformServiceVisualThumb';
import { Text } from '@/components/ui/Text';
import { ETAWJIHI_LOGO_COLOR, ETAWJIHI_LOGO_TRANSPARENT } from '@/constants/brandAssets';
import { useLocale } from '@/contexts/LocaleContext';
import { useSharePreview } from '@/contexts/SharePreviewContext';
import { useShopCart } from '@/contexts/ShopCartContext';
import { usePlatformServiceCatalogEntitlements } from '@/hooks/usePlatformServiceCatalogEntitlements';
import {
  fetchPlatformServiceBySlug,
  fetchPlatformServices,
  platformServiceLocalizedDescription,
  platformServiceLocalizedFeatures,
  type PlatformServiceItem,
} from '@/services/platformServices';
import { recordShopBoutiqueEvent } from '@/services/shopBoutiqueAnalytics';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { getShopPathAfterBuyNow } from '@/utils/shopCartStorage';
import {
  formatShopPrice,
  shopFormatPromoDiscountPercentLabel,
  shopHasPromotionalPrice,
  shopPromoDiscountPercent,
} from '@/utils/shopFormatPrice';
import { platformServiceCartProductId } from '@/utils/platformServiceCart';
import {
  platformServiceCurrency,
  platformServiceEffectiveUnitPriceString,
} from '@/utils/platformServicePrice';
import { sharePayloadBoutiquePlatformServiceDetail } from '@/utils/sharePagePayloads';
import {
  establishmentSectionTitleKey,
  splitEstablishmentsByDisplayCategory,
} from '@/utils/establishmentDisplayCategories';
import { shopServiceFiliereBadgeKey } from '@/utils/platformServiceFilieresFilter';
import { PlatformServiceEntitlementStatus } from '@/components/shop/PlatformServiceEntitlementStatus';
import {
  platformServiceEntitlementCtaLabel,
  platformServiceShouldShowCatalogPrice,
} from '@/utils/platformServiceEntitlementUi';

export default function PlatformServiceDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { locale, isRTL, t } = useLocale();
  const { presentShare } = useSharePreview();
  const { slug: slugParam } = useLocalSearchParams<{ slug: string }>();
  const slug = typeof slugParam === 'string' ? slugParam : Array.isArray(slugParam) ? slugParam[0] : '';
  const { addLine, removeLine, lines: cartLines, count: cartCount } = useShopCart();

  const cartPlatformServiceSlugs = useMemo(
    () =>
      cartLines
        .map((l) => l.platformServiceSlug?.trim() || (l.lineKind === 'platform_service' ? l.slug?.trim() : ''))
        .filter((s): s is string => Boolean(s)),
    [cartLines],
  );
  const { bySlug: serviceEntitlementsBySlug, loading: entitlementsLoading } =
    usePlatformServiceCatalogEntitlements(cartPlatformServiceSlugs);
  const [serviceNames, setServiceNames] = useState<Map<string, string>>(new Map());

  const [service, setService] = useState<PlatformServiceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const cartPid = useMemo(
    () => (slug ? platformServiceCartProductId(slug) : 0),
    [slug],
  );
  const inCart = useMemo(() => cartLines.some((l) => l.productId === cartPid), [cartLines, cartPid]);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    void fetchPlatformServiceBySlug(slug)
      .then((s) => {
        if (s) setService(s);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const cur = service ? platformServiceCurrency(service.currency) : 'MAD';
  const unitStr = service ? platformServiceEffectiveUnitPriceString(service) : '0';
  const list = service?.price ?? null;
  const sale = service?.promotionalPrice ?? null;
  const hasPromo = service && sale && list ? shopHasPromotionalPrice(sale, list) : false;
  const promoPct =
    service && sale && list ? shopPromoDiscountPercent(sale, list) : null;

  const localizedDescription = useMemo(
    () => (service ? platformServiceLocalizedDescription(service, locale) : null),
    [service, locale],
  );

  const localizedFeatures = useMemo(
    () => (service ? platformServiceLocalizedFeatures(service, locale) : []),
    [service, locale],
  );

  const establishmentSections = useMemo(() => {
    if (!service?.establishments?.length) return [];
    return splitEstablishmentsByDisplayCategory(service.establishments);
  }, [service]);

  useEffect(() => {
    if (service?.slug) {
      void recordShopBoutiqueEvent('impression_detail', undefined, service.slug);
    }
  }, [service?.slug]);

  useEffect(() => {
    void fetchPlatformServices().then((list) => {
      const map = new Map<string, string>();
      for (const s of list) map.set(s.slug, s.name);
      setServiceNames(map);
    });
  }, []);

  const entitlement = slug ? serviceEntitlementsBySlug[slug] : undefined;
  const purchasable = !entitlementsLoading && entitlement?.purchasable !== false;
  const showPrice = platformServiceShouldShowCatalogPrice(entitlement);

  const handleAdd = useCallback(async () => {
    if (!service) return;
    if (!purchasable) return;
    setAddingToCart(true);
    try {
      const productId = platformServiceCartProductId(service.slug);
      if (inCart) {
        await removeLine(productId);
        return;
      }
      const unit = platformServiceEffectiveUnitPriceString(service);
      const currency = platformServiceCurrency(service.currency);
      await addLine({
        productId,
        slug: service.slug,
        title: service.name,
        price: unit,
        currency,
        quantity: 1,
        type: 'service',
        lineKind: 'platform_service',
        platformServiceSlug: service.slug,
        images: [],
        isFreeShipping: Boolean(service.isFreeShipping),
        platformServiceBrandIcon: service.brandIcon,
        platformServiceBrandColor: service.brandColor,
      });
      void recordShopBoutiqueEvent('add_to_cart', undefined, service.slug);
    } finally {
      setAddingToCart(false);
    }
  }, [service, inCart, addLine, removeLine, purchasable]);

  const handleBuyNow = useCallback(async () => {
    if (!service) return;
    if (!purchasable) return;
    setAddingToCart(true);
    try {
      if (!inCart) {
        const unit = platformServiceEffectiveUnitPriceString(service);
        const currency = platformServiceCurrency(service.currency);
        await addLine({
          productId: platformServiceCartProductId(service.slug),
          slug: service.slug,
          title: service.name,
          price: unit,
          currency,
          quantity: 1,
          type: 'service',
          lineKind: 'platform_service',
          platformServiceSlug: service.slug,
          images: [],
          isFreeShipping: Boolean(service.isFreeShipping),
          platformServiceBrandIcon: service.brandIcon,
          platformServiceBrandColor: service.brandColor,
        });
        void recordShopBoutiqueEvent('add_to_cart', undefined, service.slug);
      }
      const path = await getShopPathAfterBuyNow();
      router.push(path as any);
    } finally {
      setAddingToCart(false);
    }
  }, [service, inCart, addLine, router, purchasable]);

  if (loading) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" backgroundColor={brand.primary} />
        <SafeAreaView edges={['top']} style={styles.statusBarTint}>
          <View style={[styles.navBar, styles.navBarOnPrimary]}>
            <Pressable onPress={() => router.back()} hitSlop={8} style={styles.navBtnOnPrimary}>
              <FontAwesome
                name={isRTL ? 'chevron-right' : 'chevron-left'}
                size={16}
                color={brand.white}
              />
            </Pressable>
          </View>
        </SafeAreaView>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={brand.primary} />
          <Text style={styles.loadingTxt}>Chargement…</Text>
        </View>
      </View>
    );
  }

  if (notFound || !service) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" backgroundColor={brand.primary} />
        <SafeAreaView edges={['top']} style={styles.statusBarTint}>
          <View style={[styles.navBar, styles.navBarOnPrimary]}>
            <Pressable onPress={() => router.back()} hitSlop={8} style={styles.navBtnOnPrimary}>
              <FontAwesome
                name={isRTL ? 'chevron-right' : 'chevron-left'}
                size={16}
                color={brand.white}
              />
            </Pressable>
          </View>
        </SafeAreaView>
        <View style={styles.centered}>
          <FontAwesome name="briefcase" size={36} color={brand.textMuted} />
          <Text style={styles.errTitle}>Service introuvable</Text>
          <Pressable
            onPress={() => router.replace('/(tabs)/boutique')}
            style={({ pressed }) => [styles.btnGhost, pressed && { opacity: 0.88 }]}
          >
            <Text style={styles.btnGhostTxt}>Retour à la boutique</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const shareSubtitle = formatShopPrice(unitStr, cur, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor={brand.primary} />
      <View pointerEvents="none" style={[styles.statusBarFill, { height: insets.top }]} />

      <SafeAreaView edges={['top']} style={styles.galleryOverlay} pointerEvents="box-none">
        <View style={[styles.galleryOverlayRow, isRTL && styles.galleryOverlayRowRtl]}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={styles.navBtnOnPrimary}
            accessibilityRole="button"
            accessibilityLabel="Retour"
          >
            <FontAwesome
              name={isRTL ? 'chevron-right' : 'chevron-left'}
              size={16}
              color={brand.white}
            />
          </Pressable>
          <View style={{ flex: 1 }} />
          <View style={[styles.galleryOverlayActions, isRTL && styles.galleryOverlayActionsRtl]}>
            <ShareIconButton
              color={brand.white}
              style={styles.navBtnOnPrimary}
              onPress={() => {
                presentShare(
                  sharePayloadBoutiquePlatformServiceDetail({
                    slug: service.slug,
                    title: service.name,
                    subtitle: shareSubtitle,
                  }),
                );
              }}
            />
            <Pressable
              onPress={() => router.push('/boutique/cart' as any)}
              hitSlop={8}
              style={styles.navBtnOnPrimary}
              accessibilityRole="button"
              accessibilityLabel={`Panier, ${cartCount} article${cartCount !== 1 ? 's' : ''}`}
            >
              <FontAwesome name="shopping-bag" size={16} color={brand.white} />
              {cartCount > 0 ? (
                <View style={styles.navHeaderBadge}>
                  <Text style={styles.navHeaderBadgeTxt}>{cartCount > 9 ? '9+' : cartCount}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollBody}
        showsVerticalScrollIndicator={false}
        bounces={false}
        alwaysBounceVertical={false}
        alwaysBounceHorizontal={false}
        overScrollMode="never"
      >
        <View style={[styles.gallery, { height: width }]}>
          <PlatformServiceVisualThumb
            brandIcon={service.brandIcon}
            brandColor={service.brandColor}
            size={width}
            iconSize={Math.min(96, Math.round(width * 0.26))}
            borderRadius={0}
            surfaceColor={brand.primary}
            imageSource={ETAWJIHI_LOGO_COLOR}
          />
          {promoPct != null ? (
            <View style={styles.galPromoBadge}>
              <Text style={styles.galPromoBadgeTxt}>
                −{shopFormatPromoDiscountPercentLabel(promoPct)}%
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.content}>
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Image
                source={ETAWJIHI_LOGO_TRANSPARENT}
                style={{ width: 18, height: 18, tintColor: brand.primary }}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
              <Text style={styles.typeBadgeTxt}>Service</Text>
            </View>
            {service.popular ? (
              <View style={styles.popBadge}>
                <Text style={styles.popBadgeTxt}>Populaire</Text>
              </View>
            ) : null}
            {service.isBestseller ? (
              <View style={styles.bestSellerBadge}>
                <Text style={styles.bestSellerBadgeTxt}>{t('shopBadgeBestseller')}</Text>
              </View>
            ) : null}
            {service.isFreeShipping ? (
              <View style={styles.freeShipBadge}>
                <FontAwesome name="truck" size={10} color={brand.emerald} />
                <Text style={styles.freeShipBadgeTxt}>Livraison offerte</Text>
              </View>
            ) : null}
            <View style={styles.filBadge}>
              <FontAwesome name="graduation-cap" size={10} color={brand.textMuted} />
              <Text style={[styles.filBadgeTxt, isRTL && styles.txtRtl]}>
                {t(shopServiceFiliereBadgeKey(service.filieresAccepted))}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{service.name}</Text>

          <PlatformServiceEntitlementStatus
            entitlement={entitlement}
            entitlementsLoading={entitlementsLoading}
            serviceNameBySlug={serviceNames}
            locale={locale}
            isRTL={isRTL}
            t={t}
            variant="full"
          />

          {localizedDescription ? (
            <Text style={[styles.desc, isRTL && styles.descRtl]}>{localizedDescription}</Text>
          ) : null}

          {showPrice ? (
            <View style={styles.priceCard}>
              <View style={styles.priceRow}>
                <Text style={[styles.price, hasPromo && styles.priceSale]}>
                  {formatShopPrice(unitStr, cur, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Text>
                {hasPromo && list ? (
                  <Text style={styles.priceCompare}>
                    {formatShopPrice(list, cur, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </Text>
                ) : null}
                {promoPct != null ? (
                  <View style={styles.promoChip}>
                    <Text style={styles.promoChipTxt}>−{shopFormatPromoDiscountPercentLabel(promoPct)}%</Text>
                  </View>
                ) : null}
              </View>
            </View>
          ) : entitlement?.status === 'included' || entitlement?.status === 'already_owned' ? (
            <Text style={[styles.includedPriceHint, isRTL && styles.descRtl]}>
              {t('shopEntitlementIncludedPriceHint')}
            </Text>
          ) : null}

          {localizedFeatures.length > 0 ? (
            <>
              <Text style={[styles.sectionTitle, isRTL && styles.txtRtl]}>
                {locale === 'ar' ? 'يشمل' : 'Inclus'}
              </Text>
              {localizedFeatures.map((line) => (
                <View key={line} style={[styles.featRow, isRTL && styles.featRowRtl]}>
                  <FontAwesome name="check" size={12} color={brand.emerald} />
                  <Text style={[styles.featTxt, isRTL && styles.txtRtl]}>{line}</Text>
                </View>
              ))}
            </>
          ) : null}

          {service.establishments.length > 0 ? (
            <View style={styles.establishmentsBlock}>
              <Text style={[styles.sectionTitle, isRTL && styles.descRtl]}>
                {locale === 'ar' ? 'المؤسسات المعنية' : 'Établissements concernés'}
              </Text>
              <Text style={[styles.establishmentsCount, isRTL && styles.descRtl]}>
                {locale === 'ar'
                  ? `${service.establishments.length} مؤسسة`
                  : `${service.establishments.length} établissement${service.establishments.length > 1 ? 's' : ''}`}
              </Text>
              <Text style={[styles.establishmentsNotice, isRTL && styles.descRtl]}>
                {t('shopEstablishmentsConcernedNotice')}
              </Text>
              <View style={styles.establishmentsList}>
                {establishmentSections.map((section) => (
                  <View key={section.key} style={styles.establishmentCategoryBlock}>
                    <Text style={[styles.establishmentCategoryTitle, isRTL && styles.descRtl]}>
                      {t(establishmentSectionTitleKey(section.key))}
                    </Text>
                    {section.items.map((e) => {
                      const slugPart =
                        e.slug && String(e.slug).trim().length > 0 ? String(e.slug).trim() : 'fiche';
                      return (
                        <Pressable
                          key={e.id}
                          style={({ pressed }) => [styles.establishmentRow, pressed && { opacity: 0.88 }]}
                          onPress={() =>
                            router.push(`/etablissements/${e.id}/${encodeURIComponent(slugPart)}` as any)
                          }
                          accessibilityRole="button"
                          accessibilityLabel={`${e.nom}, fiche établissement`}
                        >
                          <EstablishmentRowLogoThumb logo={e.logo} nom={e.nom} sigle={e.sigle} />
                          <View style={styles.establishmentBody}>
                            <Text style={[styles.establishmentNom, isRTL && styles.descRtl]} numberOfLines={2}>
                              {e.nom}
                            </Text>
                            <Text style={[styles.establishmentMeta, isRTL && styles.descRtl]} numberOfLines={1}>
                              {[e.sigle, e.ville].filter(Boolean).join(' · ')}
                            </Text>
                          </View>
                          <FontAwesome
                            name={isRTL ? 'chevron-left' : 'chevron-right'}
                            size={12}
                            color={brand.textMuted}
                          />
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.hintBox}>
            <FontAwesome name="info-circle" size={14} color={brand.primary} />
            <Text style={styles.hintTxt}>
              Après confirmation, l’équipe vous indique les modalités de paiement (virement, espèces au bureau ou
              consignes en ligne) selon le service choisi.
            </Text>
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <View style={styles.footerBtns}>
          <Pressable
            onPress={() => void handleAdd()}
            disabled={addingToCart || entitlementsLoading || !purchasable}
            style={({ pressed }) => [
              styles.addBtn,
              inCart && purchasable && styles.addBtnIn,
              (!purchasable || entitlementsLoading) && styles.addBtnDisabled,
              pressed && purchasable && !entitlementsLoading && { opacity: 0.88 },
            ]}
            accessibilityLabel={
              !purchasable
                ? t('shopEntitlementNotPurchasable')
                : inCart
                  ? t('shopRemoveFromCartA11y')
                  : t('shopAddA11y')
            }
          >
            {addingToCart ? (
              <ActivityIndicator size="small" color={!purchasable ? '#94A3B8' : inCart ? brand.white : brand.primary} />
            ) : (
              <>
                <FontAwesome
                  name={inCart && purchasable ? 'check' : 'shopping-cart'}
                  size={15}
                  color={!purchasable ? '#94A3B8' : inCart && purchasable ? brand.white : brand.primary}
                />
                <Text
                  style={[
                    styles.addBtnTxt,
                    inCart && purchasable && styles.addBtnTxtIn,
                    !purchasable && styles.addBtnTxtDisabled,
                  ]}
                >
                  {!purchasable
                    ? platformServiceEntitlementCtaLabel(entitlement, (key) => t(key as Parameters<typeof t>[0]), 'Panier')
                    : inCart
                      ? 'Au panier'
                      : 'Panier'}
                </Text>
              </>
            )}
          </Pressable>
          <Pressable
            onPress={() => void handleBuyNow()}
            disabled={addingToCart || entitlementsLoading || !purchasable}
            style={({ pressed }) => [
              styles.buyBtn,
              (!purchasable || entitlementsLoading) && styles.buyBtnDisabled,
              pressed && purchasable && !entitlementsLoading && { opacity: 0.9 },
            ]}
          >
            <Text style={[styles.buyBtnTxt, (!purchasable || entitlementsLoading) && styles.buyBtnTxtDisabled]}>
              {entitlement?.status === 'upgrade_available' || !purchasable
                ? platformServiceEntitlementCtaLabel(entitlement, (key) => t(key as Parameters<typeof t>[0]), 'shopBuyNow')
                : service.cta}
            </Text>
            {!purchasable || entitlementsLoading ? null : (
              <FontAwesome name="arrow-right" size={13} color={brand.white} />
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.white },
  statusBarTint: { backgroundColor: brand.primary },
  statusBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: brand.primary,
    zIndex: 10,
  },
  galleryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  galleryOverlayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  galleryOverlayRowRtl: { flexDirection: 'row-reverse' },
  galleryOverlayActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  galleryOverlayActionsRtl: { flexDirection: 'row-reverse' },
  scrollBody: { flex: 1, zIndex: 0 },

  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: brand.border,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brand.backgroundSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBarOnPrimary: {
    backgroundColor: brand.primary,
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },
  navBtnOnPrimary: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navHeaderBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: brand.white,
  },
  navHeaderBadgeTxt: { color: brand.white, fontSize: 8, fontWeight: '900' },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: spacing.xxl,
  },
  loadingTxt: { color: brand.textMuted, fontSize: fontSize.sm },
  errTitle: { fontSize: fontSize.md, fontWeight: '900', color: brand.text },
  btnGhost: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.border,
  },
  btnGhostTxt: { fontWeight: '800', color: brand.primary },

  gallery: {
    width: '100%',
    backgroundColor: brand.primary,
    position: 'relative',
    overflow: 'hidden',
  },
  galPromoBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
    zIndex: 5,
  },
  galPromoBadgeTxt: { color: brand.white, fontSize: 12, fontWeight: '900' },

  content: {
    backgroundColor: brand.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    zIndex: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -3 },
    elevation: 3,
    gap: spacing.md,
  },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(51,62,143,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  typeBadgeTxt: { fontSize: 11, fontWeight: '800', color: brand.primary },
  popBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  popBadgeTxt: { fontSize: 10, fontWeight: '900', color: '#92400E' },
  bestSellerBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  bestSellerBadgeTxt: { fontSize: 10, fontWeight: '900', color: brand.white, letterSpacing: 0.2 },
  freeShipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  freeShipBadgeTxt: { fontSize: 10, fontWeight: '800', color: brand.emerald },
  filBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: brand.backgroundSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  filBadgeTxt: { fontSize: 10, fontWeight: '700', color: brand.textMuted },
  txtRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  title: { fontSize: 24, fontWeight: '900', color: brand.text, letterSpacing: -0.4, lineHeight: 30 },
  desc: { fontSize: fontSize.sm, lineHeight: 22, color: brand.textSecondary, fontWeight: '600' },
  descRtl: { textAlign: 'right', writingDirection: 'rtl' },
  priceCard: { marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  price: { fontSize: 26, fontWeight: '900', color: brand.primary },
  priceSale: { color: '#EF4444' },
  priceCompare: { fontSize: 14, color: brand.textMuted, textDecorationLine: 'line-through' },
  promoChip: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  promoChipTxt: { fontSize: 11, fontWeight: '900', color: '#B91C1C' },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: brand.text, marginTop: 8 },
  featRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 4 },
  featRowRtl: { flexDirection: 'row-reverse' },
  featTxt: { flex: 1, fontSize: 14, fontWeight: '600', color: brand.text, lineHeight: 20 },
  establishmentsBlock: { marginTop: 4, gap: 6 },
  establishmentsCount: { fontSize: 12, color: brand.textMuted, fontWeight: '600', marginBottom: 4 },
  establishmentsNotice: {
    fontSize: 12,
    lineHeight: 18,
    color: brand.textMuted,
    fontWeight: '500',
    marginBottom: 10,
  },
  establishmentsList: { gap: 12 },
  establishmentCategoryBlock: { gap: 6 },
  establishmentCategoryTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: brand.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  establishmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: brand.backgroundSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.border,
  },
  establishmentBody: { flex: 1, minWidth: 0 },
  establishmentNom: { fontSize: 14, fontWeight: '800', color: brand.text, lineHeight: 18 },
  establishmentMeta: { fontSize: 12, color: brand.textMuted, fontWeight: '600', marginTop: 2 },
  entitlementBox: {
    flexDirection: 'row',
    gap: 10,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: spacing.md,
    backgroundColor: 'rgba(51,62,143,0.06)',
    borderColor: 'rgba(51,62,143,0.14)',
  },
  entitlementBoxSuccess: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderColor: 'rgba(16,185,129,0.25)',
  },
  entitlementBoxDanger: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderColor: 'rgba(239,68,68,0.22)',
  },
  entitlementBoxWarning: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderColor: 'rgba(245,158,11,0.28)',
  },
  entitlementBoxInfo: {
    backgroundColor: 'rgba(14,165,233,0.1)',
    borderColor: 'rgba(14,165,233,0.22)',
  },
  entitlementTxt: { flex: 1, fontSize: 13, fontWeight: '700', color: brand.text, lineHeight: 19 },
  entitlementLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.sm,
  },
  includedPriceHint: {
    marginTop: spacing.sm,
    fontSize: 14,
    fontWeight: '800',
    color: brand.success,
  },
  hintBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(51,62,143,0.06)',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.12)',
    marginTop: 8,
  },
  hintTxt: { flex: 1, fontSize: 12, fontWeight: '600', color: brand.textSecondary, lineHeight: 18 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: brand.white,
    borderTopWidth: 1,
    borderTopColor: brand.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  footerBtns: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: brand.primary,
    backgroundColor: brand.white,
  },
  addBtnIn: { backgroundColor: brand.success, borderColor: brand.success },
  addBtnDisabled: { borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' },
  addBtnTxt: { fontSize: 13, fontWeight: '900', color: brand.primary },
  addBtnTxtIn: { color: brand.white },
  addBtnTxtDisabled: { color: '#94A3B8' },
  buyBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buyBtnTxt: { color: brand.white, fontSize: 14, fontWeight: '900' },
  buyBtnDisabled: { backgroundColor: '#CBD5E1' },
  buyBtnTxtDisabled: { color: '#F1F5F9' },
});
