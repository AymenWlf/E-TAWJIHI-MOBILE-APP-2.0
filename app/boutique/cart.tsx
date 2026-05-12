import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { useShopCart } from '@/contexts/ShopCartContext';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { formatShopPrice, shopParsePriceString, shopPriceFormatOptsForCatalogOrCartLine } from '@/utils/shopFormatPrice';
import { shopProductPrimaryImage } from '@/utils/shopImageUrl';
import { recordShopBoutiqueEvent } from '@/services/shopBoutiqueAnalytics';

export default function BoutiqueCartScreen() {
  const router = useRouter();
  const { lines, count, updateQuantity, removeLine, hydrateImages, ready } = useShopCart();

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

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.topBar}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/boutique'))}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.85 }]}
          hitSlop={6}
        >
          <FontAwesome name="chevron-left" size={16} color={brand.text} />
        </Pressable>
        <View style={styles.topTitleWrap}>
          <Text style={styles.eyebrow}>Boutique</Text>
          <Text style={styles.topTitle}>Panier</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {lines.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <FontAwesome name="shopping-bag" size={36} color={brand.primary} />
          </View>
          <Text style={styles.emptyTitle}>Votre panier est vide</Text>
          <Text style={styles.emptyDesc}>
            Parcourez les produits et packs orientation, puis revenez ici pour passer commande.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.btnPrimary, pressed && { opacity: 0.9 }]}
            onPress={() => router.replace('/(tabs)/boutique')}
          >
            <Text style={styles.btnPrimaryTxt}>Découvrir la boutique</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            <Text style={styles.itemCount}>
              {count} article{count > 1 ? 's' : ''}
            </Text>

            {lines.map((l) => {
              const lineTotal = shopParsePriceString(l.price) * l.quantity;
              const priceOpts = shopPriceFormatOptsForCatalogOrCartLine(l);
              return (
                <View key={l.productId} style={styles.itemCard}>
                  <Image source={{ uri: shopProductPrimaryImage(l.images) }} style={styles.itemImg} resizeMode="cover" />
                  <View style={styles.itemBody}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {l.title}
                    </Text>
                    <View style={styles.itemMetaRow}>
                      <View style={styles.itemTypeBadge}>
                        <FontAwesome name={l.type === 'pack' ? 'cubes' : 'cube'} size={10} color={brand.primary} />
                        <Text style={styles.itemTypeTxt}>{l.type === 'pack' ? 'Pack' : 'Produit'}</Text>
                      </View>
                      <Text style={styles.itemUnit}>
                        {formatShopPrice(l.price, l.currency, priceOpts)} l'unité
                      </Text>
                    </View>

                    <View style={styles.qtyRow}>
                      <View style={styles.qtyStepper}>
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
                      <Text style={styles.itemTotal}>
                        {formatShopPrice(String(lineTotal), l.currency, priceOpts)}
                      </Text>
                    </View>

                    <Pressable
                      onPress={() => void removeLine(l.productId)}
                      hitSlop={6}
                      style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.85 }]}
                    >
                      <FontAwesome name="trash-o" size={12} color={brand.error} />
                      <Text style={styles.removeTxt}>Supprimer</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Récapitulatif</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLbl}>Sous-total</Text>
                <Text style={styles.summaryVal}>{formatShopPrice(String(subtotal), currency)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                  <FontAwesome name="truck" size={11} color={brand.primary} />
                  <Text style={styles.summaryLbl}>Livraison</Text>
                </View>
                <Text style={styles.summaryNote}>À l'étape suivante</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLbl}>Total estimé</Text>
                <Text style={styles.summaryTotalVal}>{formatShopPrice(String(subtotal), currency)}</Text>
              </View>

              <View style={styles.payHints}>
                <View style={styles.payHint}>
                  <FontAwesome name="money" size={14} color={brand.success} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.payHintTitle}>À la livraison</Text>
                    <Text style={styles.payHintTxt}>Espèces (MAD) à réception</Text>
                  </View>
                </View>
                <View style={styles.payHint}>
                  <FontAwesome name="building" size={13} color={brand.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.payHintTitle}>Au bureau</Text>
                    <Text style={styles.payHintTxt}>Retrait & règlement sur place</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.disclaimer}>
                Carte bancaire : non proposée en ligne — règlement uniquement à la livraison ou au bureau, après validation par
                E-Tawjihi.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.checkoutBar}>
            <View style={{ flex: 1 }}>
              <Text style={styles.checkoutBarLbl}>Total</Text>
              <Text style={styles.checkoutBarTotal}>{formatShopPrice(String(subtotal), currency)}</Text>
            </View>
            <Pressable
              onPress={() => router.push('/boutique/checkout' as any)}
              style={({ pressed }) => [styles.checkoutBtn, pressed && { opacity: 0.92 }]}
            >
              <Text style={styles.checkoutBtnTxt}>Passer à la caisse</Text>
              <FontAwesome name="arrow-right" size={13} color={brand.white} />
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.backgroundSoft },
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
  payHintTitle: { fontSize: 12, fontWeight: '800', color: brand.text },
  payHintTxt: { fontSize: 11, color: brand.textSecondary, marginTop: 2 },
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
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: brand.white,
    borderTopWidth: 1,
    borderTopColor: brand.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg + 4,
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
