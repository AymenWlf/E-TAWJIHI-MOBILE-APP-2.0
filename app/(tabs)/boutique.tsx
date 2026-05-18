import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentProps } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SidebarMenuIconButton } from '@/components/SidebarMenuIconButton';
import { AppRefreshControl } from '@/components/ui/AppRefreshControl';
import { Text } from '@/components/ui/Text';
import { ETAWJIHI_LOGO_TRANSPARENT } from '@/constants/brandAssets';
import { useLocale } from '@/contexts/LocaleContext';
import { useSharePreview } from '@/contexts/SharePreviewContext';
import { useShopCart } from '@/contexts/ShopCartContext';
import { useEligibilityProfile } from '@/hooks/useEligibilityProfile';
import { usePlatformServiceCatalogEntitlements } from '@/hooks/usePlatformServiceCatalogEntitlements';
import {
  fetchPlatformServices,
  platformServiceLocalizedDescription,
  platformServiceLocalizedFeatures,
  type PlatformServiceCatalogEntitlement,
  type PlatformServiceItem,
} from '@/services/platformServices';
import { fetchShopProducts } from '@/services/shop';
import { recordShopBoutiqueEvent } from '@/services/shopBoutiqueAnalytics';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { AppLocale } from '@/constants/i18n';
import type { ShopProductListItem } from '@/types/shop';
import {
  formatShopPrice,
  shopFormatPromoDiscountPercentLabel,
  shopHasPromotionalPrice,
  shopPriceFormatOptsForCatalogOrCartLine,
  shopPromoDiscountPercent,
} from '@/utils/shopFormatPrice';
import { shopProductPrimaryImage } from '@/utils/shopImageUrl';
import { platformServiceCartProductId } from '@/utils/platformServiceCart';
import { getShopPathAfterBuyNow } from '@/utils/shopCartStorage';
import { platformServiceVisibleForProfile } from '@/utils/platformServiceFilieresFilter';
import { PlatformServiceEntitlementStatus } from '@/components/shop/PlatformServiceEntitlementStatus';
import {
  platformServiceCatalogCardInactive,
  platformServiceCatalogDisplayPrices,
  platformServiceCatalogPriceMode,
  platformServiceEntitlementCtaLabel,
  sortPlatformServicesForCatalog,
} from '@/utils/platformServiceEntitlementUi';
import type { EligibilityProfile } from '@/utils/eligibility';
import {
  platformServiceCurrency,
  platformServiceEffectiveUnitPriceString,
} from '@/utils/platformServicePrice';
const PAGE_SIZE = 20;
const { width: SCREEN_W } = Dimensions.get('window');
const GUTTER = spacing.md;
/** Grille produits : pleine largeur (pas de paddingHorizontal sur `list`). */
const H_PAD = spacing.md;
const CARD_W = (SCREEN_W - GUTTER) / 2;

type CatalogTab = 'all' | 'services' | 'product' | 'pack';

const CATALOG_TABS: {
  id: CatalogTab;
  labelKey: 'shopFilterAll' | 'shopFilterServices' | 'shopFilterProducts' | 'shopFilterPacks';
  icon?: ComponentProps<typeof FontAwesome>['name'];
  /** Pastille logo E-Tawjihi (couleur via `tintColor` sur l’onglet). */
  brandMark?: boolean;
}[] = [
  { id: 'all', labelKey: 'shopFilterAll', icon: 'th-large' },
  { id: 'services', labelKey: 'shopFilterServices', brandMark: true },
  { id: 'product', labelKey: 'shopFilterProducts', icon: 'cube' },
  { id: 'pack', labelKey: 'shopFilterPacks', icon: 'cubes' },
];

export default function BoutiqueTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, isRTL, locale, setLocale } = useLocale();
  const { presentShare } = useSharePreview();
  const { count: cartCount, addLine, removeLine, lines: cartLines } = useShopCart();
  const { profile: eligibilityProfile, loading: eligibilityProfileLoading } = useEligibilityProfile();

  const [items, setItems] = useState<ShopProductListItem[]>([]);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [catalogTab, setCatalogTab] = useState<CatalogTab>('all');

  const [serviceItems, setServiceItems] = useState<PlatformServiceItem[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const searchRef = useRef<TextInput>(null);
  const inCartIds = useMemo(() => new Set(cartLines.map((l) => l.productId)), [cartLines]);

  const cartPlatformServiceSlugs = useMemo(
    () =>
      cartLines
        .map((l) => l.platformServiceSlug?.trim() || (l.lineKind === 'platform_service' ? l.slug?.trim() : ''))
        .filter((s): s is string => Boolean(s)),
    [cartLines],
  );
  const { bySlug: serviceEntitlementsBySlug, loading: entitlementsLoading } =
    usePlatformServiceCatalogEntitlements(cartPlatformServiceSlugs);

  const serviceNameBySlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of serviceItems) map.set(s.slug, s.name);
    return map;
  }, [serviceItems]);

  const servicesForUser = useMemo(
    () =>
      serviceItems.filter((s) =>
        platformServiceVisibleForProfile(s, eligibilityProfile, {
          profileLoading: eligibilityProfileLoading,
        }),
      ),
    [serviceItems, eligibilityProfile, eligibilityProfileLoading],
  );

  const filteredServices = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    const matched = !q
      ? servicesForUser
      : servicesForUser.filter((s) => {
          const locFeats = platformServiceLocalizedFeatures(s, locale);
          return (
            s.name.toLowerCase().includes(q) ||
            (s.description && s.description.toLowerCase().includes(q)) ||
            locFeats.some((f) => f.toLowerCase().includes(q)) ||
            s.features.some((f) => f.toLowerCase().includes(q)) ||
            s.featuresAr.some((f) => f.toLowerCase().includes(q))
          );
        });
    return sortPlatformServicesForCatalog(matched, serviceEntitlementsBySlug, entitlementsLoading);
  }, [servicesForUser, debouncedSearch, locale, serviceEntitlementsBySlug, entitlementsLoading]);

  const putPlatformServiceInCart = useCallback(
    async (s: PlatformServiceItem) => {
      const ent = serviceEntitlementsBySlug[s.slug];
      if (ent && !ent.purchasable) return;
      const unit = platformServiceEffectiveUnitPriceString(s);
      const currency = platformServiceCurrency(s.currency);
      await addLine({
        productId: platformServiceCartProductId(s.slug),
        slug: s.slug,
        title: s.name,
        price: unit,
        currency,
        quantity: 1,
        type: 'service',
        lineKind: 'platform_service',
        platformServiceSlug: s.slug,
        images: [],
        isFreeShipping: Boolean(s.isFreeShipping),
        platformServiceBrandIcon: s.brandIcon,
        platformServiceBrandColor: s.brandColor,
      });
      void recordShopBoutiqueEvent('add_to_cart', undefined, s.slug);
    },
    [addLine, serviceEntitlementsBySlug],
  );

  const addPlatformServiceToCart = useCallback(
    async (s: PlatformServiceItem) => {
      const productId = platformServiceCartProductId(s.slug);
      if (inCartIds.has(productId)) {
        await removeLine(productId);
        return;
      }
      await putPlatformServiceInCart(s);
    },
    [inCartIds, removeLine, putPlatformServiceInCart],
  );

  const buyPlatformServiceNow = useCallback(
    async (s: PlatformServiceItem) => {
      const productId = platformServiceCartProductId(s.slug);
      if (!inCartIds.has(productId)) {
        await putPlatformServiceInCart(s);
      }
      const path = await getShopPathAfterBuyNow();
      router.push(path as any);
    },
    [inCartIds, putPlatformServiceInCart, router],
  );

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const shopTypeParam = catalogTab === 'product' ? 'product' : catalogTab === 'pack' ? 'pack' : undefined;
  const isServicesTab = catalogTab === 'services';
  const showShopGrid = !isServicesTab;

  const loadServices = useCallback(async () => {
    setServicesError(null);
    setServicesLoading(true);
    try {
      const list = await fetchPlatformServices();
      setServiceItems(list);
    } catch {
      setServicesError(t('shopServicesError'));
      setServiceItems([]);
    } finally {
      setServicesLoading(false);
    }
  }, [t]);

  const loadPage = useCallback(
    async (pageToLoad: number, append: boolean) => {
      if (pageToLoad > 1 && append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      try {
        const res = await fetchShopProducts({
          page: pageToLoad,
          limit: PAGE_SIZE,
          type: shopTypeParam,
          search: debouncedSearch || undefined,
        });
        setPages(res.pagination.pages);
        setItems((prev) => (append ? [...prev, ...res.items] : res.items));
        setPage(pageToLoad);
      } catch {
        setError(t('shopErrorLoad'));
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [shopTypeParam, debouncedSearch, t],
  );

  useEffect(() => {
    if (!showShopGrid) return;
    void loadPage(1, false);
  }, [showShopGrid, loadPage]);

  useEffect(() => {
    if (catalogTab === 'all' || catalogTab === 'services') {
      void loadServices();
    }
  }, [catalogTab, loadServices]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (isServicesTab) {
      void loadServices().finally(() => setRefreshing(false));
      return;
    }
    if (catalogTab === 'all') {
      void loadServices();
    }
    void loadPage(1, false);
  }, [isServicesTab, catalogTab, loadPage, loadServices]);

  const onEndReached = useCallback(() => {
    if (!showShopGrid) return;
    if (loadingMore || loading) return;
    if (page >= pages) return;
    void loadPage(page + 1, true);
  }, [showShopGrid, loading, loadingMore, page, pages, loadPage]);

  const handleAdd = useCallback(
    async (p: ShopProductListItem) => {
      if (p.isOutOfStock) return;
      if (inCartIds.has(p.id)) {
        await removeLine(p.id);
        return;
      }
      await addLine({
        productId: p.id,
        slug: p.slug,
        title: p.title,
        price: p.price,
        currency: p.currency,
        quantity: 1,
        type: p.type,
        packPricingMode: p.packPricingMode ?? null,
        images: p.images,
        isFreeShipping: Boolean(p.isFreeShipping),
      });
      void recordShopBoutiqueEvent('add_to_cart', p.id);
    },
    [addLine, removeLine, inCartIds],
  );

  const handleBuyNow = useCallback(
    async (p: ShopProductListItem) => {
      if (p.isOutOfStock) return;
      if (!inCartIds.has(p.id)) {
        await addLine({
          productId: p.id,
          slug: p.slug,
          title: p.title,
          price: p.price,
          currency: p.currency,
          quantity: 1,
          type: p.type,
          packPricingMode: p.packPricingMode ?? null,
          images: p.images,
          isFreeShipping: Boolean(p.isFreeShipping),
        });
        void recordShopBoutiqueEvent('add_to_cart', p.id);
      }
      const path = await getShopPathAfterBuyNow();
      router.push(path as any);
    },
    [addLine, router, inCartIds],
  );

  const renderHero = useCallback(
    () => (
      <View style={styles.hero}>
        <View style={[styles.heroTop, isRTL && styles.heroTopRtl]}>
          <SidebarMenuIconButton color={brand.white} />
          <View style={styles.heroTitles}>
            <Text style={[styles.heroEyebrow, isRTL && styles.txtRtl]}>{t('shopEyebrow')}</Text>
            <Text style={[styles.heroTitle, isRTL && styles.txtRtl]}>{t('shopTitle')}</Text>
          </View>

          <View
            style={[styles.langSwitch, isRTL && styles.langSwitchRtl]}
            accessibilityRole="tablist"
            accessibilityLabel={t('languageSwitcher')}
          >
            <Pressable
              onPress={() => setLocale('fr')}
              style={({ pressed }) => [
                styles.langPill,
                locale === 'fr' && styles.langPillActive,
                pressed && styles.langPillPressed,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: locale === 'fr' }}
            >
              <Text style={[styles.langPillTxt, locale === 'fr' && styles.langPillTxtActive]}>
                {t('langFr')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setLocale('ar')}
              style={({ pressed }) => [
                styles.langPill,
                locale === 'ar' && styles.langPillActive,
                pressed && styles.langPillPressed,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: locale === 'ar' }}
            >
              <Text style={[styles.langPillTxt, locale === 'ar' && styles.langPillTxtActive]}>
                {t('langAr')}
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [styles.cartBtn, pressed && { opacity: 0.88 }]}
            onPress={() => router.push('/boutique/cart')}
            accessibilityLabel={`${t('shopCartA11y')}, ${cartCount}`}
          >
            <FontAwesome name="shopping-bag" size={19} color={brand.white} />
            {cartCount > 0 ? (
              <View style={[styles.cartBadge, isRTL ? { left: -5 } : { right: -5 }]}>
                <Text style={styles.cartBadgeTxt}>{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <Text style={[styles.heroSub, isRTL && styles.txtRtl]}>{t('shopSubtitle')}</Text>

        <Pressable
          style={[styles.searchWrap, isRTL && styles.searchWrapRtl]}
          onPress={() => searchRef.current?.focus()}
          accessibilityRole="search"
        >
          <FontAwesome name="search" size={14} color={brand.textMuted} style={{ marginRight: 2 }} />
          <TextInput
            ref={searchRef}
            style={[styles.searchInput, isRTL && styles.txtRtl]}
            value={search}
            onChangeText={setSearch}
            placeholder={
              isServicesTab ? t('shopSearchServicesPlaceholder') : t('shopSearchPlaceholder')
            }
            placeholderTextColor={brand.textMuted}
            returnKeyType="search"
          />
          {search.length > 0 ? (
            <Pressable
              onPress={() => setSearch('')}
              hitSlop={10}
              accessibilityLabel={t('shopClearSearchA11y')}
            >
              <View style={styles.clearBtn}>
                <FontAwesome name="times" size={11} color={brand.textMuted} />
              </View>
            </Pressable>
          ) : null}
        </Pressable>
      </View>
    ),
    [
      isRTL,
      t,
      locale,
      setLocale,
      cartCount,
      router,
      search,
      isServicesTab,
    ],
  );

  const renderCatalogTabs = useCallback(
    () => (
      <View style={styles.tabsScrollOuter}>
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={[styles.tabsScrollContent, isRTL && styles.tabsScrollContentRtl]}
        >
          {CATALOG_TABS.map((f) => {
            const active = catalogTab === f.id;
            const isAll = f.id === 'all';
            return (
              <Pressable
                key={f.id}
                onPress={() => setCatalogTab(f.id)}
                style={({ pressed }) => [
                  styles.tabPill,
                  isAll && styles.tabPillTout,
                  active && styles.tabActive,
                  active && isAll && styles.tabPillToutActive,
                  pressed && !active && { opacity: 0.78 },
                ]}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                {f.brandMark ? (
                  <Image
                    source={ETAWJIHI_LOGO_TRANSPARENT}
                    style={[
                      { width: 15, height: 15 },
                      { tintColor: active ? brand.white : brand.primary },
                    ]}
                    resizeMode="contain"
                    accessibilityIgnoresInvertColors
                  />
                ) : (
                  <FontAwesome
                    name={f.icon!}
                    size={13}
                    color={active ? brand.white : brand.textMuted}
                  />
                )}
                <Text style={[styles.tabTxt, active && styles.tabTxtActive]} numberOfLines={1}>
                  {t(f.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    ),
    [catalogTab, isRTL, t],
  );

  const renderListingHeader = useCallback(() => {
    const preview =
      catalogTab === 'all' &&
      (servicesLoading || serviceItems.length > 0 || (servicesError && !servicesLoading)) ? (
        <View style={styles.servicesPreviewSection}>
          <View style={[styles.servicesPreviewTitleBlock, isRTL && styles.servicesPreviewTitleBlockRtl]}>
            <View style={styles.servicesPreviewIconWrap}>
              <FontAwesome name="handshake-o" size={16} color={brand.primary} />
            </View>
            <View style={styles.servicesPreviewTitleTexts}>
              <Text style={[styles.servicesPreviewKicker, isRTL && styles.txtRtl]}>{t('shopEyebrow')}</Text>
              <Text style={[styles.servicesPreviewTitle, isRTL && styles.txtRtl]}>
                {t('shopServicesSectionTitle')}
              </Text>
            </View>
          </View>
          {servicesLoading ? (
            <ActivityIndicator color={brand.primary} style={{ marginVertical: 14 }} />
          ) : servicesError ? (
            <Text style={[styles.servicesPreviewErr, isRTL && styles.txtRtl]}>{servicesError}</Text>
          ) : servicesForUser.length === 0 ? (
            <Text style={[styles.servicesPreviewErr, isRTL && styles.txtRtl]}>{t('shopServicesEmpty')}</Text>
          ) : (
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.servicesPreviewScroll,
                isRTL && styles.servicesPreviewScrollRtl,
              ]}
            >
              {servicesForUser.map((s) => (
                <ServiceCompactCard
                  key={s.slug}
                  service={s}
                  locale={locale}
                  t={t}
                  isRTL={isRTL}
                  eligibilityProfile={eligibilityProfile}
                  eligibilityProfileLoading={eligibilityProfileLoading}
                  entitlement={serviceEntitlementsBySlug[s.slug]}
                  entitlementsLoading={entitlementsLoading}
                  serviceNameBySlug={serviceNameBySlug}
                  inCart={inCartIds.has(platformServiceCartProductId(s.slug))}
                  onOpenDetail={() => router.push(`/boutique/service/${encodeURIComponent(s.slug)}` as any)}
                  onAddCart={() => void addPlatformServiceToCart(s)}
                  onBuyNow={() => void buyPlatformServiceNow(s)}
                />
              ))}
            </ScrollView>
          )}
        </View>
      ) : null;

    const errBlock =
      showShopGrid && error ? (
        <View style={[styles.errorBox, isRTL && styles.errorBoxRtl]}>
          <FontAwesome name="exclamation-triangle" size={13} color="#991B1B" />
          <Text style={[styles.errorTxt, isRTL && styles.txtRtl]}>{error}</Text>
        </View>
      ) : null;

    if (!preview && !errBlock) return null;
    return (
      <View>
        {preview}
        {errBlock}
      </View>
    );
  }, [
    catalogTab,
    error,
    servicesError,
    servicesLoading,
    serviceItems,
    servicesForUser,
    eligibilityProfile,
    eligibilityProfileLoading,
    router,
    t,
    isRTL,
    showShopGrid,
    locale,
    addPlatformServiceToCart,
    buyPlatformServiceNow,
    inCartIds,
    serviceEntitlementsBySlug,
    entitlementsLoading,
    serviceNameBySlug,
  ]);

  const listingHeaderElement = useMemo(() => renderListingHeader(), [renderListingHeader]);

  const renderItem = useCallback(
    ({ item: p, index }: { item: ShopProductListItem; index: number }) => {
      // En RTL on inverse les marges pour que la grille s'aligne correctement.
      const evenIdx = index % 2 === 0;
      const marginStyle = isRTL
        ? evenIdx
          ? { marginLeft: GUTTER / 2 }
          : { marginRight: GUTTER / 2 }
        : evenIdx
          ? { marginRight: GUTTER / 2 }
          : { marginLeft: GUTTER / 2 };
      return (
        <View style={[styles.cardWrap, marginStyle]}>
          <ProductCard
            product={p}
            t={t}
            isRTL={isRTL}
            onPress={() => {
              void recordShopBoutiqueEvent('click_product', p.id);
              router.push(`/boutique/${p.slug}` as any);
            }}
            onAdd={() => void handleAdd(p)}
            onBuyNow={() => void handleBuyNow(p)}
            inCart={inCartIds.has(p.id)}
          />
        </View>
      );
    },
    [handleAdd, handleBuyNow, inCartIds, router, t, isRTL],
  );

  const keyExtractor = useCallback((p: ShopProductListItem) => String(p.id), []);

  const keyExtractorService = useCallback((s: PlatformServiceItem) => s.slug, []);

  const renderServiceListItem = useCallback(
    ({ item: s }: { item: PlatformServiceItem }) => (
      <ServiceCompactCard
        layout="stack"
        service={s}
        locale={locale}
        t={t}
        isRTL={isRTL}
        eligibilityProfile={eligibilityProfile}
        eligibilityProfileLoading={eligibilityProfileLoading}
        entitlement={serviceEntitlementsBySlug[s.slug]}
        entitlementsLoading={entitlementsLoading}
        serviceNameBySlug={serviceNameBySlug}
        inCart={inCartIds.has(platformServiceCartProductId(s.slug))}
        onOpenDetail={() => router.push(`/boutique/service/${encodeURIComponent(s.slug)}` as any)}
        onAddCart={() => void addPlatformServiceToCart(s)}
        onBuyNow={() => void buyPlatformServiceNow(s)}
      />
    ),
    [
      addPlatformServiceToCart,
      buyPlatformServiceNow,
      eligibilityProfile,
      eligibilityProfileLoading,
      inCartIds,
      isRTL,
      locale,
      router,
      serviceEntitlementsBySlug,
      entitlementsLoading,
      serviceNameBySlug,
      t,
    ],
  );

  const listContentBottomPad = spacing.xxl + Math.max(8, insets.bottom);

  return (
    <View style={styles.screenRoot}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
        {renderHero()}
      </SafeAreaView>
      {renderCatalogTabs()}
      <View style={styles.listRegion}>
        {isServicesTab ? (
          <FlatList
            key="boutique-list-services-stack"
            data={filteredServices}
            keyExtractor={keyExtractorService}
            renderItem={renderServiceListItem}
            ListHeaderComponent={listingHeaderElement}
            contentContainerStyle={[
              styles.list,
              styles.listServicesStack,
              { paddingBottom: listContentBottomPad },
            ]}
            style={[styles.flatList, isRTL ? styles.rtl : styles.ltr]}
            refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              servicesLoading ? (
                <View style={styles.emptyWrap}>
                  <ActivityIndicator size="large" color={brand.primary} />
                  <Text style={styles.emptyTxt}>{t('shopLoading')}</Text>
                </View>
              ) : servicesError ? (
                <View style={styles.emptyWrap}>
                  <FontAwesome name="exclamation-triangle" size={28} color="#991B1B" />
                  <Text style={[styles.emptyTitle, { marginTop: 10 }]}>{servicesError}</Text>
                </View>
              ) : (
                <View style={styles.emptyWrap}>
                  <View style={styles.emptyIcon}>
                    <Image
                      source={ETAWJIHI_LOGO_TRANSPARENT}
                      style={{ width: 40, height: 40, tintColor: brand.primary }}
                      resizeMode="contain"
                      accessibilityIgnoresInvertColors
                    />
                  </View>
                  <Text style={styles.emptyTitle}>{t('shopServicesEmpty')}</Text>
                </View>
              )
            }
            ListFooterComponent={<View style={{ height: spacing.lg }} />}
          />
        ) : (
          <FlatList
            key="boutique-list-shop-grid"
            data={items}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            numColumns={2}
            ListHeaderComponent={listingHeaderElement}
            contentContainerStyle={[styles.list, { paddingBottom: listContentBottomPad }]}
            style={[styles.flatList, isRTL ? styles.rtl : styles.ltr]}
            refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.4}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              loading ? (
                <View style={styles.emptyWrap}>
                  <ActivityIndicator size="large" color={brand.primary} />
                  <Text style={styles.emptyTxt}>{t('shopLoading')}</Text>
                </View>
              ) : (
                <View style={styles.emptyWrap}>
                  <View style={styles.emptyIcon}>
                    <FontAwesome name="shopping-bag" size={32} color={brand.primary} />
                  </View>
                  <Text style={styles.emptyTitle}>{t('shopEmptyTitle')}</Text>
                  <Text style={styles.emptyTxt}>{t('shopEmptyDesc')}</Text>
                </View>
              )
            }
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.footerLoad}>
                  <ActivityIndicator color={brand.primary} />
                </View>
              ) : (
                <View style={{ height: spacing.lg }} />
              )
            }
          />
        )}
      </View>
    </View>
  );
}

type LocaleT = ReturnType<typeof useLocale>['t'];

function ServiceCompactCard({
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
}: {
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
  /** `carousel` : marges pour scroll horizontal « Tous ». `stack` : liste onglet Services. */
  layout?: 'carousel' | 'stack';
}) {
  const { width: winW } = useWindowDimensions();
  const isStack = layout === 'stack';
  /** Carrousel « Tous » : largeur stable mais recalculée au resize / rotation. */
  const carouselCardW = Math.min(308, Math.max(200, winW - H_PAD * 2));

  const cur = platformServiceCurrency(s.currency);
  const sale = s.promotionalPrice;
  const list = s.price;
  const hasPromo = Boolean(sale && list && shopHasPromotionalPrice(sale, list));
  const inactive = platformServiceCatalogCardInactive(entitlement, entitlementsLoading);
  const priceMode = platformServiceCatalogPriceMode(entitlement, entitlementsLoading, hasPromo);
  const { primary: pricePrimary, compare: priceCompare } = platformServiceCatalogDisplayPrices(
    list,
    sale,
    priceMode,
  );
  const feats = platformServiceLocalizedFeatures(s, locale).slice(0, 3);
  const localizedDesc = platformServiceLocalizedDescription(s, locale);

  const isEligible = useMemo(
    () =>
      platformServiceVisibleForProfile(s, eligibilityProfile, {
        profileLoading: eligibilityProfileLoading,
      }),
    [s, eligibilityProfile, eligibilityProfileLoading],
  );

  const showEligibilityBadge = !eligibilityProfileLoading;

  const purchasable = !entitlementsLoading && entitlement?.purchasable !== false;
  useEffect(() => {
    void recordShopBoutiqueEvent('impression_listing', undefined, s.slug);
  }, [s.slug]);

  return (
    <View
      style={[
        styles.svcCompactOuter,
        inactive && styles.svcCompactOuterInactive,
        isStack
          ? styles.svcCompactOuterStack
          : [
              styles.svcCompactOuterCarousel,
              { width: carouselCardW },
              isRTL ? { marginLeft: spacing.sm } : { marginRight: spacing.sm },
            ],
      ]}
    >
      <Pressable
        onPress={() => {
          void recordShopBoutiqueEvent('click_product', undefined, s.slug);
          onOpenDetail();
        }}
        style={({ pressed }) => (pressed ? { opacity: 0.92 } : undefined)}
        accessibilityRole="button"
        accessibilityLabel={`${s.name} — ${t('shopServiceDetail')}`}
      >
        <View style={styles.svcCompactAccent} />
        <View style={[styles.svcCompactBody, isStack && styles.svcCompactBodyStack]}>
          <View style={[styles.svcCompactHeroRow, isRTL && styles.svcCompactHeroRowRtl]}>
            <View style={[styles.svcCompactIconCircle, inactive && styles.svcCompactIconCircleInactive]}>
              <Image
                source={ETAWJIHI_LOGO_TRANSPARENT}
                style={{ width: 22, height: 22, tintColor: inactive ? '#94A3B8' : brand.primary }}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
            </View>
            <View style={styles.svcCompactTitleCol}>
              <View style={[styles.svcCompactTitleRow, isRTL && styles.svcCompactTitleRowRtl]}>
                <Text
                  style={[
                    styles.svcCompactName,
                    inactive && styles.svcCompactNameInactive,
                    isRTL && styles.txtRtl,
                  ]}
                  numberOfLines={isStack ? 3 : 2}
                >
                  {s.name}
                </Text>
                {!inactive && s.popular ? (
                  <View style={[styles.svcCompactPopularChip, isRTL && styles.svcCompactPopularChipRtl]}>
                    <FontAwesome name="star" size={8} color="#B45309" />
                    <Text style={styles.svcCompactPopularChipTxt}>{t('shopServicesPopular')}</Text>
                  </View>
                ) : null}
                {!inactive && s.isBestseller ? (
                  <View style={[styles.svcCompactBestsellerChip, isRTL && styles.svcCompactBestsellerChipRtl]}>
                    <FontAwesome name="trophy" size={8} color={brand.white} />
                    <Text style={styles.svcCompactBestsellerChipTxt}>{t('shopBadgeBestseller')}</Text>
                  </View>
                ) : null}
              </View>
              {showEligibilityBadge ? (
                <View
                  style={[
                    styles.svcCompactFilierePill,
                    isEligible ? styles.svcCompactEligiblePill : styles.svcCompactNotEligiblePill,
                    isRTL && styles.svcCompactFilierePillRtl,
                  ]}
                >
                  <FontAwesome
                    name={isEligible ? 'check-circle' : 'times-circle'}
                    size={9}
                    color={isEligible ? brand.success : '#B91C1C'}
                  />
                  <Text
                    style={[
                      styles.svcCompactFilierePillTxt,
                      isEligible ? styles.svcCompactEligiblePillTxt : styles.svcCompactNotEligiblePillTxt,
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
            </View>
          </View>

          {localizedDesc ? (
            <Text
              style={[styles.svcCompactDesc, isStack && styles.svcCompactDescStack, isRTL && styles.txtRtl]}
              numberOfLines={isStack ? 5 : 3}
            >
              {localizedDesc}
            </Text>
          ) : null}

          {feats.length > 0 ? (
            <View style={styles.svcCompactFeatBox}>
              {feats.map((line) => (
                <View key={line} style={[styles.svcCompactFeatRow, isRTL && styles.svcCompactFeatRowRtl]}>
                  <View style={styles.svcCompactFeatDot}>
                    <FontAwesome name="check" size={7} color={brand.emerald} />
                  </View>
                  <Text style={[styles.svcCompactFeatTxt, isRTL && styles.txtRtl]} numberOfLines={2}>
                    {line}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {priceMode !== 'hidden' ? (
            <View style={styles.svcCompactPriceBlock}>
              <View style={styles.svcCompactPriceLabels}>
                {priceMode === 'promo-primary-only' && hasPromo ? (
                  <View style={styles.svcCompactPromoBadge}>
                    <Text style={styles.svcCompactPromoBadgeTxt}>{t('shopServicePromoChip')}</Text>
                  </View>
                ) : null}
                <View style={[styles.svcCompactPriceRow, isRTL && styles.svcCompactPriceRowRtl]}>
                  <Text
                    style={[
                      styles.svcCompactPrice,
                      inactive && styles.svcCompactPriceInactive,
                      (hasPromo && priceMode === 'standard') || priceMode === 'promo-primary-only'
                        ? styles.priceSale
                        : undefined,
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
              </View>
            </View>
          ) : null}

          <View style={styles.svcCompactDetailBtn}>
            <FontAwesome name="file-text-o" size={12} color={brand.primary} />
            <Text style={styles.svcCompactDetailBtnTxt}>{t('shopServiceDetail')}</Text>
            <FontAwesome name={isRTL ? 'chevron-left' : 'chevron-right'} size={11} color={brand.primary} />
          </View>
        </View>
      </Pressable>

      <View style={[styles.svcCompactActionsBar, isStack && styles.svcCompactActionsBarStack]}>
        <View style={[styles.svcCompactActions, isRTL && styles.svcCompactActionsRtl]}>
          <Pressable
            onPress={() => {
              if (!purchasable && !inCart) return;
              void onAddCart();
            }}
            disabled={(!purchasable && !inCart) || entitlementsLoading}
            style={({ pressed }) => [
              styles.svcCompactIconBtn,
              inCart && styles.svcCompactIconBtnIn,
              (!purchasable && !inCart) || entitlementsLoading
                ? styles.svcCompactIconBtnDisabled
                : undefined,
              pressed && purchasable && !entitlementsLoading && { opacity: 0.88 },
            ]}
            accessibilityLabel={
              !purchasable && !inCart
                ? t('shopEntitlementNotPurchasable')
                : inCart
                  ? t('shopRemoveFromCartA11y')
                  : t('shopAddA11y')
            }
          >
            <FontAwesome
              name={inCart ? 'check' : 'shopping-cart'}
              size={14}
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
              styles.svcCompactBuyBtn,
              ((!purchasable && !inCart) || entitlementsLoading) && styles.svcCompactBuyBtnDisabled,
              pressed && purchasable && !entitlementsLoading && { opacity: 0.9 },
            ]}
            accessibilityLabel={
              !purchasable && !inCart ? t('shopEntitlementNotPurchasable') : t('shopBuyNowA11y')
            }
          >
            <Text
              style={[
                styles.svcCompactBuyTxt,
                ((!purchasable && !inCart) || entitlementsLoading) && styles.svcCompactBuyTxtDisabled,
              ]}
            >
              {platformServiceEntitlementCtaLabel(entitlement, (key) => t(key as Parameters<typeof t>[0]), 'shopBuyNow')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* ─────────────────────────────────────────────────────────
   ProductCard — grille 2 colonnes
───────────────────────────────────────────────────────── */
function ProductCard({
  product: p,
  t,
  isRTL,
  onPress,
  onAdd,
  onBuyNow,
  inCart,
}: {
  product: ShopProductListItem;
  t: LocaleT;
  isRTL: boolean;
  onPress: () => void;
  onAdd: () => void;
  onBuyNow: () => void;
  inCart: boolean;
}) {
  useEffect(() => {
    void recordShopBoutiqueEvent('impression_listing', p.id);
  }, [p.id]);

  const promoPct = shopPromoDiscountPercent(p.price, p.compareAtPrice);
  const isOut = p.isOutOfStock === true;
  const priceOpts = shopPriceFormatOptsForCatalogOrCartLine(p);
  const hasPromo = shopHasPromotionalPrice(p.price, p.compareAtPrice);

  return (
    <View style={styles.card}>
      {/* ── Tappable zone (image + info) ── */}
      <Pressable
        onPress={onPress}
        style={({ pressed }) => pressed && { opacity: 0.96 }}
        accessibilityRole="button"
        accessibilityLabel={`${t('shopViewProductA11y')}: ${p.title}`}
      >
        {/* Image */}
        <View style={styles.cardImgWrap}>
          <Image
            source={{ uri: shopProductPrimaryImage(p.images) }}
            style={styles.cardImg}
            resizeMode="cover"
          />
          <View style={styles.imgOverlay} />

          <View style={[styles.badgeStackTL, isRTL && styles.badgeStackTLRtl]}>
            {promoPct != null ? (
              <View style={styles.badgePromo}>
                <Text style={styles.badgePromoTxt}>
                  −{shopFormatPromoDiscountPercentLabel(promoPct)}%
                </Text>
              </View>
            ) : null}
            {p.isBestseller ? (
              <View style={styles.badgeBestseller}>
                <Text style={styles.badgeBestsellerTxt}>{t('shopBadgeBestseller')}</Text>
              </View>
            ) : null}
          </View>

          {p.isFreeShipping && !isOut ? (
            <View style={[styles.badgeFree, isRTL && styles.badgeFreeRtl]}>
              <FontAwesome name="truck" size={10} color={brand.emerald} />
              <Text style={styles.badgeFreeTxt}>{t('shopBadgeFree')}</Text>
            </View>
          ) : null}

          {isOut ? (
            <View style={styles.outOverlay}>
              <Text style={styles.outOverlayTxt}>{t('shopBadgeUnavailable')}</Text>
            </View>
          ) : null}

          <View style={[styles.typePill, isRTL && styles.typePillRtl]}>
            <FontAwesome
              name={p.type === 'pack' ? 'cubes' : 'cube'}
              size={9}
              color="rgba(255,255,255,0.9)"
            />
            <Text style={styles.typePillTxt}>
              {t(p.type === 'pack' ? 'shopBadgePack' : 'shopBadgeProduct')}
            </Text>
          </View>
        </View>

        {/* Info body */}
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, isRTL && styles.txtRtl]} numberOfLines={2}>
            {p.title}
          </Text>

          {p.ratingCount > 0 || p.ratingAverage != null ? (
            <View style={[styles.ratingRow, isRTL && styles.ratingRowRtl]}>
              <FontAwesome name="star" size={10} color="#F59E0B" />
              <Text style={styles.ratingTxt}>
                {p.ratingAverage != null ? p.ratingAverage.toFixed(1) : '—'}
              </Text>
              <Text style={styles.ratingCount}>({p.ratingCount})</Text>
            </View>
          ) : null}

          <View style={[styles.priceRow, isRTL && styles.priceRowRtl]}>
            <Text style={[styles.price, hasPromo && styles.priceSale]}>
              {formatShopPrice(p.price, p.currency, priceOpts)}
            </Text>
            {hasPromo && p.compareAtPrice ? (
              <Text style={styles.priceCompare}>
                {formatShopPrice(p.compareAtPrice, p.currency)}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>

      {/* ── Actions (outside Pressable pour éviter conflits) ── */}
      {isOut ? (
        <View style={styles.outPill}>
          <Text style={styles.outPillTxt}>{t('shopOutOfStock')}</Text>
        </View>
      ) : (
        <View style={[styles.actions, isRTL && styles.actionsRtl]}>
          <Pressable
            onPress={onAdd}
            style={({ pressed }) => [
              styles.addBtn,
              inCart && styles.addBtnIn,
              pressed && { opacity: 0.85 },
            ]}
            accessibilityLabel={inCart ? t('shopRemoveFromCartA11y') : t('shopAddA11y')}
          >
            <FontAwesome
              name={inCart ? 'check' : 'shopping-cart'}
              size={13}
              color={inCart ? brand.white : brand.primary}
            />
          </Pressable>

          <Pressable
            onPress={onBuyNow}
            style={({ pressed }) => [styles.buyBtn, pressed && { opacity: 0.88 }]}
            accessibilityLabel={t('shopBuyNowA11y')}
          >
            <Text style={styles.buyBtnTxt}>{t('shopBuyNow')}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

/* ─────────────────────────────────────────────────────────
   Styles
───────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: brand.white,
  },
  heroSafeArea: {
    backgroundColor: brand.primary,
  },
  listRegion: {
    flex: 1,
    backgroundColor: brand.white,
  },
  flatList: {
    flex: 1,
    backgroundColor: brand.white,
  },
  ltr: { direction: 'ltr' },
  rtl: { direction: 'rtl' },
  txtRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  list: {
    flexGrow: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  listServicesStack: {
    paddingHorizontal: H_PAD,
    paddingTop: spacing.md,
  },

  /* ── Hero ── */
  hero: {
    backgroundColor: brand.primary,
    paddingTop: 0,
    paddingBottom: spacing.xxl,
    paddingHorizontal: H_PAD,
    gap: spacing.md,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroTopRtl: {
    flexDirection: 'row-reverse',
  },
  heroTitles: {
    flex: 1,
    gap: 4,
  },

  /* Lang switch (placé entre titre et panier dans heroTop) */
  langSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full,
    padding: 3,
  },
  langSwitchRtl: {
    flexDirection: 'row-reverse',
  },
  langPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.full,
  },
  langPillActive: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  langPillPressed: {
    opacity: 0.88,
  },
  langPillTxt: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  langPillTxtActive: {
    color: brand.white,
  },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: brand.white,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  heroSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '600',
  },

  /* Cart button */
  cartBtn: {
    marginTop: 4,
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: brand.primary,
  },
  cartBadgeTxt: {
    color: brand.white,
    fontSize: 9,
    fontWeight: '900',
  },

  /* Search */
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  searchWrapRtl: {
    flexDirection: 'row-reverse',
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: brand.text,
    paddingVertical: 0,
    fontWeight: '600',
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: brand.backgroundSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Type tabs ── */
  tabsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: brand.backgroundSoft,
    paddingHorizontal: H_PAD,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: brand.border,
  },
  tabsRowRtl: {
    flexDirection: 'row-reverse',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: radius.md,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: brand.border,
  },
  tabActive: {
    backgroundColor: brand.primary,
    borderColor: brand.primary,
    shadowColor: brand.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  tabTxt: {
    fontSize: 12,
    fontWeight: '800',
    color: brand.textMuted,
  },
  tabTxtActive: {
    color: brand.white,
  },

  tabsScrollOuter: {
    backgroundColor: brand.backgroundSoft,
    borderBottomWidth: 1,
    borderBottomColor: brand.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: H_PAD,
  },
  tabsScroll: {
    flexGrow: 0,
  },
  tabsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 2,
    paddingRight: spacing.sm,
  },
  tabsScrollContentRtl: {
    flexDirection: 'row-reverse',
    paddingRight: 0,
    paddingLeft: spacing.sm,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: brand.border,
  },
  tabPillTout: {
    borderWidth: 2,
    borderColor: brand.primary,
    backgroundColor: brand.white,
  },
  tabPillToutActive: {
    borderColor: brand.primary,
  },

  servicesPreviewSection: {
    backgroundColor: brand.chatSurface,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: H_PAD,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.border,
  },
  servicesPreviewTitleBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    minWidth: 0,
    marginBottom: spacing.sm,
  },
  servicesPreviewTitleBlockRtl: {
    flexDirection: 'row-reverse',
  },
  servicesPreviewIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51,62,143,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(51,62,143,0.12)',
  },
  servicesPreviewTitleTexts: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  servicesPreviewKicker: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: 'rgba(51,62,143,0.55)',
    textTransform: 'uppercase',
  },
  servicesPreviewTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: brand.text,
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  servicesPreviewErr: {
    fontSize: fontSize.sm,
    color: '#991B1B',
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  servicesPreviewScroll: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingBottom: spacing.xs,
    paddingHorizontal: 0,
  },
  servicesPreviewScrollRtl: {
    flexDirection: 'row-reverse',
  },

  svcCompactOuter: {
    borderRadius: radius.lg,
    backgroundColor: brand.white,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  svcCompactOuterCarousel: {
    maxWidth: '100%',
  },
  /** Onglet Services : pleine largeur utile, plafonnée pour lisibilité sur tablette. */
  svcCompactOuterStack: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  svcCompactOuterInactive: {
    backgroundColor: '#F1F5F9',
    opacity: 0.9,
  },
  svcCompactAccent: {
    height: 2,
    width: '100%',
    backgroundColor: 'rgba(51,62,143,0.35)',
  },
  svcCompactAccentInactive: {
    backgroundColor: '#CBD5E1',
  },
  svcCompactBody: {
    padding: spacing.sm + 2,
    paddingTop: spacing.md,
  },
  svcCompactBodyStack: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm + 4,
  },
  svcCompactHeroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  svcCompactHeroRowRtl: {
    flexDirection: 'row-reverse',
  },
  svcCompactIconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51,62,143,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svcCompactIconCircleInactive: {
    backgroundColor: '#F1F5F9',
  },
  svcCompactTitleCol: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  svcCompactTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flexWrap: 'wrap',
  },
  svcCompactTitleRowRtl: {
    flexDirection: 'row-reverse',
  },
  svcCompactName: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    fontWeight: '700',
    color: brand.text,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  svcCompactNameInactive: {
    color: '#94A3B8',
  },
  svcCompactPopularChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(245,158,11,0.35)',
  },
  svcCompactPopularChipRtl: {
    flexDirection: 'row-reverse',
  },
  svcCompactPopularChipTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: '#92400E',
    letterSpacing: 0.1,
  },
  svcCompactBestsellerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  svcCompactBestsellerChipRtl: {
    flexDirection: 'row-reverse',
  },
  svcCompactBestsellerChipTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: brand.white,
    letterSpacing: 0.1,
  },
  svcCompactFilierePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(51,62,143,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  svcCompactFilierePillRtl: {
    flexDirection: 'row-reverse',
    alignSelf: 'flex-end',
  },
  svcCompactFilierePillTxt: {
    fontSize: 11,
    fontWeight: '600',
    maxWidth: '100%',
  },
  svcCompactEligiblePill: {
    backgroundColor: 'rgba(47,206,148,0.12)',
  },
  svcCompactEligiblePillTxt: {
    color: '#15803D',
    fontWeight: '700',
  },
  svcCompactNotEligiblePill: {
    backgroundColor: 'rgba(185,28,28,0.08)',
  },
  svcCompactNotEligiblePillTxt: {
    color: '#B91C1C',
    fontWeight: '700',
  },
  svcCompactDesc: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: brand.textMuted,
    fontWeight: '500',
    lineHeight: 17,
  },
  svcCompactDescStack: {
    fontSize: 13,
    lineHeight: 18,
  },
  svcCompactFeatBox: {
    marginTop: spacing.sm,
    gap: 6,
    backgroundColor: brand.backgroundSoft,
    borderRadius: radius.sm,
    padding: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  svcCompactFeatRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  svcCompactFeatRowRtl: {
    flexDirection: 'row-reverse',
  },
  svcCompactFeatDot: {
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(4,120,87,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  svcCompactFeatTxt: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
    color: brand.textSecondary,
    lineHeight: 15,
  },
  svcCompactPriceBlock: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.border,
  },

  svcCompactPriceLabels: {
    gap: 6,
  },
  svcCompactPromoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(239,68,68,0.08)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  svcCompactPromoBadgeTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B91C1C',
    letterSpacing: 0.2,
  },
  svcCompactPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 8,
  },
  svcCompactPriceRowRtl: {
    flexDirection: 'row-reverse',
  },
  svcCompactPriceInactive: {
    color: '#94A3B8',
  },
  svcCompactPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: brand.primary,
    letterSpacing: -0.3,
  },
  svcIncludedPriceHint: {
    marginTop: spacing.sm,
    fontSize: 13,
    fontWeight: '800',
    color: brand.emerald,
    lineHeight: 18,
  },
  svcCompactDetailBtn: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: radius.sm,
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  svcCompactDetailBtnTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: brand.primary,
  },
  svcCompactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  svcCompactActionsBar: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingBottom: spacing.sm + 2,
  },
  svcCompactActionsBarStack: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  svcCompactActionsRtl: {
    flexDirection: 'row-reverse',
  },
  svcCompactIconBtn: {
    width: 42,
    height: 40,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.white,
  },
  svcCompactIconBtnDisabled: {
    opacity: 0.55,
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  svcCompactIconBtnIn: {
    backgroundColor: brand.emerald,
    borderColor: brand.emerald,
  },
  svcCompactBuyBtn: {
    flex: 1,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svcCompactBuyTxt: {
    color: brand.white,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  svcCompactBuyBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  svcCompactBuyTxtDisabled: {
    color: '#F8FAFC',
  },

  /* Error */
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: spacing.sm,
    marginHorizontal: H_PAD,
  },
  errorBoxRtl: {
    flexDirection: 'row-reverse',
  },
  errorTxt: {
    flex: 1,
    color: '#991B1B',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },

  /* Empty */
  emptyWrap: {
    paddingVertical: 64,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: 10,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(51,62,143,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: fontSize.md,
    fontWeight: '900',
    color: brand.text,
  },
  emptyTxt: {
    color: brand.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },

  footerLoad: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },

  /* ── Card ── */
  cardWrap: {
    width: CARD_W,
    marginBottom: GUTTER,
  },
  card: {
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.07)',
    shadowColor: '#0F172A',
    shadowOpacity: 0.10,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  cardImgWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: brand.backgroundSoft,
    position: 'relative',
  },
  cardImg: {
    width: '100%',
    height: '100%',
  },
  imgOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'transparent',
    // Soft gradient feel via a very subtle bottom dark tint (no LinearGradient dep needed)
  },

  /* Image badges — coin haut-gauche (pile promo + best seller) */
  badgeStackTL: {
    position: 'absolute',
    top: 7,
    left: 7,
    zIndex: 2,
    gap: 5,
    alignItems: 'flex-start',
  },
  badgeStackTLRtl: {
    left: undefined,
    right: 7,
    alignItems: 'flex-end',
  },
  badgePromo: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  badgePromoTxt: {
    color: brand.white,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  badgeBestseller: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  badgeBestsellerTxt: {
    color: brand.white,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.25,
  },
  badgePopular: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(245,158,11,0.45)',
    maxWidth: '100%',
  },
  badgePopularTxt: {
    color: '#92400E',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.15,
    flexShrink: 1,
  },
  badgeFreeRtl: {
    right: undefined,
    left: 7,
    flexDirection: 'row-reverse',
  },
  badgeFree: {
    position: 'absolute',
    bottom: 7,
    right: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: brand.emerald,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  badgeFreeTxt: {
    color: brand.emerald,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  typePill: {
    position: 'absolute',
    bottom: 7,
    left: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15,23,42,0.58)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  typePillRtl: {
    left: undefined,
    right: 7,
    flexDirection: 'row-reverse',
  },
  typePillTxt: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  outOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOverlayTxt: {
    color: brand.white,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
  },

  /* Card body */
  cardBody: {
    padding: spacing.md,
    gap: 5,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: brand.text,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingRowRtl: {
    flexDirection: 'row-reverse',
  },
  ratingTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: brand.text,
  },
  ratingCount: {
    fontSize: 10,
    color: brand.textMuted,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    marginTop: 1,
  },
  priceRowRtl: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
  },
  price: {
    fontSize: fontSize.md,
    fontWeight: '900',
    color: brand.primary,
    letterSpacing: -0.3,
  },
  priceSale: {
    color: '#EF4444',
  },
  priceCompare: {
    fontSize: 11,
    color: brand.textMuted,
    textDecorationLine: 'line-through',
  },

  outPill: {
    marginTop: 6,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: '#FEF3C7',
    borderRadius: radius.md,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  outPillTxt: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '800',
  },

  actions: {
    marginTop: 8,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
  },
  actionsRtl: {
    flexDirection: 'row-reverse',
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: brand.primary,
    backgroundColor: brand.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnIn: {
    backgroundColor: brand.success,
    borderColor: brand.success,
  },
  buyBtn: {
    flex: 1,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: brand.primary,
    shadowOpacity: 0.22,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buyBtnTxt: {
    color: brand.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});
