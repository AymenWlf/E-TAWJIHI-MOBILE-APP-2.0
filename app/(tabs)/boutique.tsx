import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { useShopCart } from '@/contexts/ShopCartContext';
import { fetchShopProducts } from '@/services/shop';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { ShopProductListItem } from '@/types/shop';
import {
  formatShopPrice,
  shopFormatPromoDiscountPercentLabel,
  shopHasPromotionalPrice,
  shopPriceFormatOptsForCatalogOrCartLine,
  shopPromoDiscountPercent,
} from '@/utils/shopFormatPrice';
import { shopProductPrimaryImage } from '@/utils/shopImageUrl';

const PAGE_SIZE = 20;
const { width: SCREEN_W } = Dimensions.get('window');
const GUTTER = spacing.md;
const H_PAD = spacing.lg;
const CARD_W = (SCREEN_W - H_PAD * 2 - GUTTER) / 2;

export default function BoutiqueTabScreen() {
  const router = useRouter();
  const { t, isRTL, locale, setLocale } = useLocale();
  const { count: cartCount, addLine, lines: cartLines } = useShopCart();

  const [items, setItems] = useState<ShopProductListItem[]>([]);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [type, setType] = useState<'' | 'product' | 'pack'>('');

  const searchRef = useRef<TextInput>(null);
  const inCartIds = useMemo(() => new Set(cartLines.map((l) => l.productId)), [cartLines]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadPage = useCallback(
    async (pageToLoad: number, append: boolean) => {
      if (pageToLoad > 1 && append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      try {
        const res = await fetchShopProducts({
          page: pageToLoad,
          limit: PAGE_SIZE,
          type: type || undefined,
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
    [type, debouncedSearch],
  );

  useEffect(() => {
    void loadPage(1, false);
  }, [loadPage]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void loadPage(1, false);
  }, [loadPage]);

  const onEndReached = useCallback(() => {
    if (loadingMore || loading) return;
    if (page >= pages) return;
    void loadPage(page + 1, true);
  }, [loading, loadingMore, page, pages, loadPage]);

  const handleAdd = useCallback(
    async (p: ShopProductListItem) => {
      if (p.isOutOfStock) return;
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
    },
    [addLine],
  );

  const handleBuyNow = useCallback(
    async (p: ShopProductListItem) => {
      if (p.isOutOfStock) return;
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
      router.push('/boutique/checkout' as any);
    },
    [addLine, router],
  );

  const renderHeader = useCallback(() => {
    const typeFilters: { id: '' | 'product' | 'pack'; labelKey: 'shopFilterAll' | 'shopFilterProducts' | 'shopFilterPacks'; icon: React.ComponentProps<typeof FontAwesome>['name'] }[] = [
      { id: '', labelKey: 'shopFilterAll', icon: 'th-large' },
      { id: 'product', labelKey: 'shopFilterProducts', icon: 'cube' },
      { id: 'pack', labelKey: 'shopFilterPacks', icon: 'cubes' },
    ];

    return (
      <View>
        {/* ── Hero header ── */}
        <View style={styles.hero}>
          <View style={[styles.heroTop, isRTL && styles.heroTopRtl]}>
            <View style={styles.heroTitles}>
              <Text style={[styles.heroEyebrow, isRTL && styles.txtRtl]}>{t('shopEyebrow')}</Text>
              <Text style={[styles.heroTitle, isRTL && styles.txtRtl]}>{t('shopTitle')}</Text>
            </View>

            {/* Lang switch */}
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

          {/* Search bar */}
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
              placeholder={t('shopSearchPlaceholder')}
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

        {/* ── Type tabs ── */}
        <View style={[styles.tabsRow, isRTL && styles.tabsRowRtl]}>
          {typeFilters.map((f) => {
            const active = type === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => setType(f.id)}
                style={({ pressed }) => [
                  styles.tab,
                  active && styles.tabActive,
                  pressed && !active && { opacity: 0.75 },
                ]}
              >
                <FontAwesome
                  name={f.icon}
                  size={13}
                  color={active ? brand.white : brand.textMuted}
                />
                <Text style={[styles.tabTxt, active && styles.tabTxtActive]}>
                  {t(f.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Error */}
        {error ? (
          <View style={[styles.errorBox, isRTL && styles.errorBoxRtl]}>
            <FontAwesome name="exclamation-triangle" size={13} color="#991B1B" />
            <Text style={[styles.errorTxt, isRTL && styles.txtRtl]}>{error}</Text>
          </View>
        ) : null}

      </View>
    );
  }, [type, search, error, cartCount, router, t, isRTL, locale, setLocale]);

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
            onPress={() => router.push(`/boutique/${p.slug}` as any)}
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

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar style="light" />

      {/* ── Header fixe (hors FlatList) — le pull-to-refresh ne s'y déclenche pas ── */}
      {renderHeader()}

      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.list}
        style={[styles.flatList, isRTL ? styles.rtl : styles.ltr]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={brand.primary}
            colors={[brand.primary]}
          />
        }
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
            <View style={{ height: spacing.xxl * 3 }} />
          )
        }
      />
    </SafeAreaView>
  );
}

/* ─────────────────────────────────────────────────────────
   ProductCard — grille 2 colonnes
───────────────────────────────────────────────────────── */
type LocaleT = ReturnType<typeof useLocale>['t'];

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

          {promoPct != null ? (
            <View style={[styles.badgePromo, isRTL && styles.badgePromoRtl]}>
              <Text style={styles.badgePromoTxt}>
                −{shopFormatPromoDiscountPercentLabel(promoPct)}%
              </Text>
            </View>
          ) : null}

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
            accessibilityLabel={inCart ? t('shopAddedA11y') : t('shopAddA11y')}
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
  root: {
    flex: 1,
    backgroundColor: brand.primary,
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
    paddingHorizontal: H_PAD,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },

  /* ── Hero ── */
  hero: {
    backgroundColor: brand.primary,
    paddingTop: spacing.lg,
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

  /* Image badges */
  badgePromo: {
    position: 'absolute',
    top: 7,
    left: 7,
    backgroundColor: '#EF4444',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  badgePromoRtl: {
    left: undefined,
    right: 7,
  },
  badgePromoTxt: {
    color: brand.white,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
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
