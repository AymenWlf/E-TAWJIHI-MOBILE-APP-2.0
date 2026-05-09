import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RenderHtml from 'react-native-render-html';

import { Text } from '@/components/ui/Text';
import { useShopCart } from '@/contexts/ShopCartContext';
import { fetchShopProductBySlug } from '@/services/shop';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { ShopProductDetail } from '@/types/shop';
import {
  formatShopPrice,
  shopFormatPromoDiscountPercentLabel,
  shopHasPromotionalPrice,
  shopPriceFormatOptsForCatalogOrCartLine,
  shopPromoDiscountPercent,
} from '@/utils/shopFormatPrice';
import { shopProductGalleryUrls, resolveShopImageUrl } from '@/utils/shopImageUrl';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { width } = useWindowDimensions();
  const { addLine, lines: cartLines, count: cartCount } = useShopCart();

  const [product, setProduct] = useState<ShopProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  const inCart = useMemo(
    () => cartLines.some((l) => l.productId === product?.id),
    [cartLines, product],
  );

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setFetchError(false);
    fetchShopProductBySlug(slug)
      .then((p) => {
        if (p) setProduct(p);
        else setFetchError(true);
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const images = useMemo(() => shopProductGalleryUrls(product?.images), [product]);
  const priceOpts = useMemo(() => shopPriceFormatOptsForCatalogOrCartLine(product), [product]);
  const promoPct = product ? shopPromoDiscountPercent(product.price, product.compareAtPrice) : null;
  const hasPromo = product ? shopHasPromotionalPrice(product.price, product.compareAtPrice) : false;
  const isOut = product?.isOutOfStock === true;

  const handleAdd = useCallback(async () => {
    if (!product || isOut) return;
    setAddingToCart(true);
    try {
      await addLine({
        productId: product.id,
        slug: product.slug,
        title: product.title,
        price: product.price,
        currency: product.currency,
        quantity: 1,
        type: product.type,
        packPricingMode: product.packPricingMode ?? null,
        images: product.images,
        isFreeShipping: Boolean(product.isFreeShipping),
      });
    } finally {
      setAddingToCart(false);
    }
  }, [product, isOut, addLine]);

  const handleBuyNow = useCallback(async () => {
    if (!product || isOut) return;
    await handleAdd();
    router.push('/boutique/checkout' as any);
  }, [product, isOut, handleAdd, router]);

  const onGalleryScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / width);
      setGalleryIndex(idx);
    },
    [width],
  );

  /* ─── Loading ─── */
  if (loading) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <View style={styles.navBar}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.navBtn}>
            <FontAwesome name="chevron-left" size={15} color={brand.text} />
          </Pressable>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={brand.primary} />
          <Text style={styles.loadingTxt}>Chargement…</Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ─── Error ─── */
  if (fetchError || !product) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <View style={styles.navBar}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.navBtn}>
            <FontAwesome name="chevron-left" size={15} color={brand.text} />
          </Pressable>
        </View>
        <View style={styles.centered}>
          <View style={styles.errorIcon}>
            <FontAwesome name="exclamation-circle" size={28} color={brand.error} />
          </View>
          <Text style={styles.errorTitle}>Produit introuvable</Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.errorBack, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.errorBackTxt}>Retour à la boutique</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const htmlSource = product.description?.trim()
    ? { html: product.description }
    : null;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* ── Overlay nav (back + cart) ── */}
      <SafeAreaView edges={['top']} style={styles.galleryOverlay} pointerEvents="box-none">
        <View style={styles.galleryOverlayRow}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={styles.overlayBtn}
            accessibilityRole="button"
            accessibilityLabel="Retour"
          >
            <FontAwesome name="chevron-left" size={15} color={brand.text} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/boutique/cart' as any)}
            hitSlop={8}
            style={styles.overlayBtn}
            accessibilityRole="button"
            accessibilityLabel={`Panier, ${cartCount} article${cartCount !== 1 ? 's' : ''}`}
          >
            <FontAwesome name="shopping-bag" size={15} color={brand.text} />
            {cartCount > 0 ? (
              <View style={styles.overlayBadge}>
                <Text style={styles.overlayBadgeTxt}>{cartCount > 9 ? '9+' : cartCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </SafeAreaView>

      {/* ── Scroll body ── */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} bounces>

        {/* Gallery */}
        <View style={[styles.gallery, { height: width }]}>
          <FlatList
            data={images}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onGalleryScroll}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={{ width, height: width }}
                resizeMode="cover"
              />
            )}
          />

          {/* Promo badge on gallery */}
          {promoPct != null ? (
            <View style={styles.galPromoBadge}>
              <Text style={styles.galPromoBadgeTxt}>
                −{shopFormatPromoDiscountPercentLabel(promoPct)}%
              </Text>
            </View>
          ) : null}

          {/* Out overlay */}
          {isOut ? (
            <View style={styles.galOutOverlay}>
              <Text style={styles.galOutTxt}>Indisponible</Text>
            </View>
          ) : null}

          {/* Pagination dots */}
          {images.length > 1 ? (
            <View style={styles.dots}>
              {images.map((_, i) => (
                <View key={i} style={[styles.dot, i === galleryIndex && styles.dotActive]} />
              ))}
            </View>
          ) : null}

          {/* Image counter top-right */}
          {images.length > 1 ? (
            <View style={styles.imgCounter}>
              <Text style={styles.imgCounterTxt}>{galleryIndex + 1}/{images.length}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Content card ── */}
        <View style={styles.content}>

          {/* Badges row */}
          <View style={styles.badgeRow}>
            <View style={[styles.badge, styles.badgeType]}>
              <FontAwesome
                name={product.type === 'pack' ? 'cubes' : 'cube'}
                size={11}
                color={brand.primary}
              />
              <Text style={styles.badgeTypeTxt}>
                {product.type === 'pack' ? 'Pack' : 'Produit'}
              </Text>
            </View>
            {product.category ? (
              <View style={[styles.badge, styles.badgeCat]}>
                <Text style={styles.badgeCatTxt}>{product.category}</Text>
              </View>
            ) : null}
            {product.isNew ? (
              <View style={[styles.badge, styles.badgeNew]}>
                <Text style={styles.badgeNewTxt}>Nouveau</Text>
              </View>
            ) : null}
            {product.isFreeShipping ? (
              <View style={[styles.badge, styles.badgeFree]}>
                <FontAwesome name="truck" size={10} color={brand.emerald} />
                <Text style={styles.badgeFreeTxt}>Livraison offerte</Text>
              </View>
            ) : null}
          </View>

          {/* Title */}
          <Text style={styles.title}>{product.title}</Text>

          {/* Rating */}
          {(product.ratingCount > 0 || product.ratingAverage != null) ? (
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <FontAwesome
                  key={s}
                  name={s <= Math.round(product.ratingAverage ?? 0) ? 'star' : 'star-o'}
                  size={13}
                  color="#F59E0B"
                />
              ))}
              <Text style={styles.ratingVal}>
                {product.ratingAverage != null ? product.ratingAverage.toFixed(1) : '—'}
              </Text>
              <Text style={styles.ratingCount}>({product.ratingCount} avis)</Text>
            </View>
          ) : null}

          {/* Short description */}
          {product.shortDescription ? (
            <Text style={styles.shortDesc}>{product.shortDescription}</Text>
          ) : null}

          {/* Price card */}
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={[styles.price, hasPromo && styles.priceSale]}>
                {formatShopPrice(product.price, product.currency, priceOpts)}
              </Text>
              {hasPromo && product.compareAtPrice ? (
                <Text style={styles.priceCompare}>
                  {formatShopPrice(product.compareAtPrice, product.currency)}
                </Text>
              ) : null}
              {hasPromo && promoPct != null ? (
                <View style={styles.promoChip}>
                  <Text style={styles.promoChipTxt}>
                    −{shopFormatPromoDiscountPercentLabel(promoPct)}%
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Stock urgency */}
            {product.stockUrgentPieces != null &&
              product.stockUrgentPieces > 0 &&
              product.stockUrgentPieces <= 5 ? (
              <View style={styles.stockUrgent}>
                <FontAwesome name="exclamation-triangle" size={11} color="#B45309" />
                <Text style={styles.stockUrgentTxt}>
                  Plus que {product.stockUrgentPieces} en stock !
                </Text>
              </View>
            ) : null}
          </View>

          {/* ── Full description ── */}
          {htmlSource ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Description</Text>
              <View style={styles.descWrap}>
                <RenderHtml
                  contentWidth={width - spacing.lg * 2}
                  source={htmlSource}
                  tagsStyles={{
                    body: {
                      color: brand.textSecondary,
                      fontSize: 14,
                      lineHeight: 22,
                    },
                    p: { marginTop: 0, marginBottom: 10 },
                    ul: { paddingLeft: 18 },
                    ol: { paddingLeft: 18 },
                    li: { marginBottom: 5, color: brand.textSecondary },
                    strong: { color: brand.text },
                    b: { color: brand.text },
                    h2: {
                      color: brand.text,
                      fontSize: 16,
                      fontWeight: '700',
                      marginTop: 4,
                      marginBottom: 4,
                    },
                    h3: {
                      color: brand.text,
                      fontSize: 14,
                      fontWeight: '700',
                      marginBottom: 4,
                    },
                    a: { color: brand.primary },
                  }}
                />
              </View>
            </>
          ) : null}

          {/* ── Pack contents ── */}
          {product.type === 'pack' && product.packLines.length > 0 ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>
                Contenu du pack · {product.packLines.length} produit
                {product.packLines.length > 1 ? 's' : ''}
              </Text>
              <View style={styles.packList}>
                {product.packLines.map((line, idx) => {
                  const thumbUri = line.childProduct.images?.[0]
                    ? resolveShopImageUrl(line.childProduct.images[0])
                    : null;
                  return (
                    <View key={idx} style={styles.packLine}>
                      {thumbUri ? (
                        <Image
                          source={{ uri: thumbUri }}
                          style={styles.packThumb}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.packThumb, styles.packThumbFallback]}>
                          <FontAwesome name="cube" size={15} color={brand.textMuted} />
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.packLineTitle} numberOfLines={2}>
                          {line.childProduct.title}
                        </Text>
                        <Text style={styles.packLinePrice}>
                          {formatShopPrice(line.childProduct.price, line.childProduct.currency)}
                        </Text>
                      </View>
                      <View style={styles.packQty}>
                        <Text style={styles.packQtyTxt}>×{line.quantity}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          ) : null}

          {/* ── Establishments ── */}
          {product.establishments && product.establishments.length > 0 ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Établissements concernés</Text>
              <View style={styles.estabRow}>
                {product.establishments.map((e) => (
                  <View key={e.id} style={styles.estabChip}>
                    <FontAwesome name="university" size={11} color={brand.primary} />
                    <Text style={styles.estabTxt}>{e.sigle ?? e.nom}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* ── Sticky footer ── */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        {isOut ? (
          <View style={styles.outPill}>
            <FontAwesome name="times-circle" size={15} color="#92400E" />
            <Text style={styles.outPillTxt}>Produit indisponible</Text>
          </View>
        ) : (
          <View style={styles.footerBtns}>
            <Pressable
              onPress={() => void handleAdd()}
              disabled={addingToCart}
              style={({ pressed }) => [
                styles.addBtn,
                inCart && styles.addBtnActive,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityLabel={inCart ? 'Déjà au panier' : 'Ajouter au panier'}
            >
              {addingToCart ? (
                <ActivityIndicator
                  size="small"
                  color={inCart ? brand.white : brand.primary}
                />
              ) : (
                <>
                  <FontAwesome
                    name={inCart ? 'check' : 'shopping-cart'}
                    size={15}
                    color={inCart ? brand.white : brand.primary}
                  />
                  <Text style={[styles.addBtnTxt, inCart && styles.addBtnTxtActive]}>
                    {inCart ? 'Au panier' : 'Ajouter'}
                  </Text>
                </>
              )}
            </Pressable>

            <Pressable
              onPress={() => void handleBuyNow()}
              disabled={addingToCart}
              style={({ pressed }) => [styles.buyBtn, pressed && { opacity: 0.88 }]}
              accessibilityLabel="Commander maintenant"
            >
              <Text style={styles.buyBtnTxt}>Commander</Text>
              <FontAwesome name="arrow-right" size={13} color={brand.white} />
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

/* ─────────────────────────────────────────────────────────
   Styles
───────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.white },

  /* Nav bar (loading/error states) */
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

  /* Loading / Error */
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: spacing.xxl,
  },
  loadingTxt: { color: brand.textMuted, fontSize: fontSize.sm },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239,68,68,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: { fontSize: fontSize.md, fontWeight: '900', color: brand.text },
  errorBack: {
    marginTop: 4,
    paddingHorizontal: spacing.xxl,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
  },
  errorBackTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.sm },

  /* Gallery overlay */
  galleryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  galleryOverlayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  overlayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  overlayBadge: {
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
  overlayBadgeTxt: { color: brand.white, fontSize: 8, fontWeight: '900' },

  /* Gallery */
  gallery: {
    width: '100%',
    backgroundColor: brand.backgroundSoft,
    position: 'relative',
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
  galOutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.52)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  galOutTxt: { color: brand.white, fontSize: 20, fontWeight: '900', letterSpacing: 0.4 },
  dots: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    zIndex: 5,
  },
  dot: {
    height: 6,
    width: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    width: 20,
    backgroundColor: brand.white,
  },
  imgCounter: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    backgroundColor: 'rgba(15,23,42,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    zIndex: 5,
  },
  imgCounterTxt: { color: brand.white, fontSize: 11, fontWeight: '800' },

  /* Content */
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
  },

  /* Badges */
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeType: {
    backgroundColor: 'rgba(51,62,143,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.14)',
  },
  badgeTypeTxt: { color: brand.primary, fontSize: 11, fontWeight: '800' },
  badgeCat: {
    backgroundColor: brand.backgroundSoft,
    borderWidth: 1,
    borderColor: brand.border,
  },
  badgeCatTxt: { color: brand.textSecondary, fontSize: 11, fontWeight: '700' },
  badgeNew: {
    backgroundColor: 'rgba(21,143,101,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(21,143,101,0.18)',
  },
  badgeNewTxt: { color: brand.emerald, fontSize: 11, fontWeight: '800' },
  badgeFree: {
    backgroundColor: 'rgba(21,143,101,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(21,143,101,0.15)',
  },
  badgeFreeTxt: { color: brand.emerald, fontSize: 11, fontWeight: '800' },

  /* Title */
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: brand.text,
    lineHeight: 30,
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
  },

  /* Rating */
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: spacing.sm,
  },
  ratingVal: {
    fontSize: 13,
    fontWeight: '700',
    color: brand.text,
    marginLeft: 4,
  },
  ratingCount: { fontSize: 12, color: brand.textMuted },

  /* Short description */
  shortDesc: {
    fontSize: 14,
    color: brand.textSecondary,
    lineHeight: 21,
    marginBottom: spacing.md,
  },

  /* Price card */
  priceCard: {
    backgroundColor: brand.backgroundSoft,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 8,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: brand.border,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 30,
    fontWeight: '900',
    color: brand.primary,
    letterSpacing: -0.5,
  },
  priceSale: { color: '#EF4444' },
  priceCompare: {
    fontSize: 16,
    color: brand.textMuted,
    textDecorationLine: 'line-through',
  },
  promoChip: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  promoChipTxt: { color: '#DC2626', fontSize: 12, fontWeight: '800' },
  stockUrgent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  stockUrgentTxt: { color: '#B45309', fontSize: 12, fontWeight: '700' },

  /* Sections */
  divider: {
    height: 1,
    backgroundColor: brand.border,
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '900',
    color: brand.text,
    marginBottom: spacing.md,
  },

  /* Description */
  descWrap: {},

  /* Pack lines */
  packList: { gap: spacing.sm },
  packLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: brand.backgroundSoft,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: brand.border,
  },
  packThumb: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
    backgroundColor: brand.border,
  },
  packThumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.backgroundSoft,
  },
  packLineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: brand.text,
    lineHeight: 18,
  },
  packLinePrice: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '800',
    color: brand.primary,
  },
  packQty: {
    backgroundColor: brand.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  packQtyTxt: { color: brand.white, fontSize: 12, fontWeight: '900' },

  /* Establishments */
  estabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  estabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(51,62,143,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  estabTxt: { color: brand.primary, fontSize: 12, fontWeight: '700' },

  /* Footer */
  footer: {
    backgroundColor: brand.white,
    borderTopWidth: 1,
    borderTopColor: brand.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -3 },
    elevation: 6,
  },
  footerBtns: { flexDirection: 'row', gap: spacing.md },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: brand.primary,
    backgroundColor: brand.white,
  },
  addBtnActive: {
    backgroundColor: brand.success,
    borderColor: brand.success,
  },
  addBtnTxt: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.primary,
  },
  addBtnTxtActive: { color: brand.white },
  buyBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
    shadowColor: brand.primary,
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buyBtnTxt: {
    fontSize: fontSize.sm,
    fontWeight: '900',
    color: brand.white,
  },
  outPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: radius.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  outPillTxt: { color: '#92400E', fontWeight: '800', fontSize: fontSize.md },
});
