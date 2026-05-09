import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { fetchShopOrder } from '@/services/shop';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { ShopOrderPayload } from '@/types/shop';
import { formatShopPrice } from '@/utils/shopFormatPrice';
import { getShopOrderAccessToken } from '@/utils/shopOrderTokenStorage';

export default function BoutiqueThankYouScreen() {
  const router = useRouter();
  const { publicId: rawPublicId } = useLocalSearchParams<{ publicId?: string | string[] }>();
  const publicId = Array.isArray(rawPublicId) ? rawPublicId[0] : rawPublicId;

  const [order, setOrder] = useState<ShopOrderPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      if (!publicId) {
        setLoading(false);
        return;
      }
      const token = await getShopOrderAccessToken(publicId);
      if (!token) {
        if (alive) {
          setForbidden(true);
          setLoading(false);
        }
        return;
      }
      const o = await fetchShopOrder(publicId, token);
      if (!alive) return;
      setOrder(o);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [publicId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={brand.primary} />
          <Text style={styles.loadingTxt}>Chargement…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (forbidden || !order || !publicId) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.center}>
          <FontAwesome name="exclamation-circle" size={36} color={brand.error} />
          <Text style={styles.loadingTxt}>Commande introuvable ou session expirée.</Text>
          <Pressable
            onPress={() => router.replace('/(tabs)/boutique')}
            style={({ pressed }) => [styles.btnPrimary, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.btnPrimaryTxt}>Retour à la boutique</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const shippingNum = Number.parseFloat(order.shippingFee || '0');
  const shippingLabel =
    order.deliveryMode === 'pickup_office'
      ? 'Retrait au bureau'
      : shippingNum === 0
        ? 'Offert'
        : formatShopPrice(order.shippingFee, order.currency);

  const nextSteps = [
    'Nous vérifions votre commande et préparons la suite (livraison ou retrait).',
    "L'équipe E-Tawjihi vous contacte par téléphone ou email pour confirmer.",
    'Règlement en espèces à la livraison ou au bureau — pas de paiement carte.',
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <FontAwesome name="check-circle" size={42} color={brand.success} />
          </View>
          <Text style={styles.eyebrow}>Boutique</Text>
          <Text style={styles.heroTitle}>Merci pour votre commande</Text>
          <Text style={styles.heroDesc}>
            Votre demande est bien prise en charge. Nous vous recontactons très bientôt sur les coordonnées indiquées.
          </Text>

          <View style={styles.refRow}>
            <View>
              <Text style={styles.refLbl}>Référence</Text>
              <Text style={styles.refVal}>{order.orderNumber}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.refLbl}>Total TTC</Text>
              <Text style={styles.refTotal}>{formatShopPrice(order.total, order.currency)}</Text>
            </View>
          </View>
        </View>

        <SectionCard title="Contact">
          <Row icon="envelope-o" value={order.email} />
          <Row icon="phone" value={order.phone} />
        </SectionCard>

        {order.deliveryMode === 'cod_delivery' ? (
          <SectionCard title="Livraison">
            {order.city ? <Row icon="map-marker" value={order.city} /> : null}
            {order.addressLine ? <Row icon="home" value={order.addressLine} /> : null}
            {order.deliveryDelayLabel ? (
              <Row icon="clock-o" value={`Délai indicatif : ${order.deliveryDelayLabel}`} />
            ) : null}
            <View style={styles.payTip}>
              <FontAwesome name="money" size={14} color={brand.success} />
              <Text style={styles.payTipTxt}>
                Paiement en <Text style={{ fontWeight: '800' }}>espèces (MAD)</Text> à la réception.
              </Text>
            </View>
          </SectionCard>
        ) : null}

        {order.deliveryMode === 'pickup_office' ? (
          <SectionCard title="Retrait au bureau">
            {order.pickupDate ? (
              <Row
                icon="calendar"
                value={
                  'Passage prévu : ' +
                  order.pickupDate +
                  (order.pickupTime ? ' à ' + order.pickupTime : '')
                }
              />
            ) : null}
            <View style={styles.payTip}>
              <FontAwesome name="building" size={14} color={brand.primary} />
              <Text style={styles.payTipTxt}>Règlement sur place lors du retrait.</Text>
            </View>
          </SectionCard>
        ) : null}

        <SectionCard title="Articles & montants">
          {order.lines.map((l) => (
            <View key={l.id ?? `${l.productTitle}-${l.quantity}`} style={styles.lineRow}>
              <FontAwesome name="cube" size={12} color={brand.primary} />
              <Text style={styles.lineTitle} numberOfLines={2}>
                {l.productTitle}
              </Text>
              <Text style={styles.lineQty}>× {l.quantity}</Text>
              <Text style={styles.lineVal}>{formatShopPrice(l.lineTotal, order.currency)}</Text>
            </View>
          ))}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLbl}>Sous-total articles</Text>
            <Text style={styles.summaryVal}>{formatShopPrice(order.subtotal, order.currency)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLbl}>{shippingNum === 0 ? 'Livraison' : 'Frais de livraison'}</Text>
            <Text style={styles.summaryVal}>{shippingLabel}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLbl}>Total TTC</Text>
            <Text style={styles.summaryTotalVal}>{formatShopPrice(order.total, order.currency)}</Text>
          </View>
        </SectionCard>

        <SectionCard title="Prochaines étapes">
          {nextSteps.map((s, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumTxt}>{i + 1}</Text>
              </View>
              <Text style={styles.stepTxt}>{s}</Text>
            </View>
          ))}
        </SectionCard>

        <Pressable
          onPress={() => router.replace('/(tabs)/boutique')}
          style={({ pressed }) => [styles.backToShopBtn, pressed && { opacity: 0.92 }]}
        >
          <FontAwesome name="shopping-bag" size={14} color={brand.white} />
          <Text style={styles.backToShopTxt}>Retour à la boutique</Text>
          <FontAwesome name="arrow-right" size={12} color={brand.white} />
        </Pressable>
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={{ gap: spacing.sm }}>{children}</View>
    </View>
  );
}

function Row({ icon, value }: { icon: React.ComponentProps<typeof FontAwesome>['name']; value: string }) {
  return (
    <View style={styles.row}>
      <FontAwesome name={icon} size={13} color={brand.primary} />
      <Text style={styles.rowVal}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.backgroundSoft },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.md,
  },
  loadingTxt: { color: brand.textSecondary, fontSize: fontSize.sm, textAlign: 'center' },
  list: { padding: spacing.lg, gap: spacing.md },

  heroCard: {
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: brand.border,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: 6,
  },
  heroIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(47,206,148,0.12)',
    marginBottom: spacing.sm,
  },
  eyebrow: { fontSize: 11, color: brand.cyan, fontWeight: '800', letterSpacing: 1.2 },
  heroTitle: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: '800',
    color: brand.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroDesc: {
    marginTop: 4,
    color: brand.textSecondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  refRow: {
    marginTop: spacing.lg,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: brand.border,
  },
  refLbl: { fontSize: 11, color: brand.textMuted, fontWeight: '700' },
  refVal: { fontSize: fontSize.md, color: brand.text, fontWeight: '800', marginTop: 2 },
  refTotal: { fontSize: 22, color: brand.primary, fontWeight: '800', marginTop: 2 },

  section: {
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: brand.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '800', color: brand.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowVal: { flex: 1, color: brand.text, fontSize: fontSize.sm, fontWeight: '600' },

  payTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(47,206,148,0.08)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(47,206,148,0.25)',
    marginTop: 4,
  },
  payTipTxt: { flex: 1, color: brand.text, fontSize: fontSize.sm },

  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.borderLight,
  },
  lineTitle: { flex: 1, fontSize: 12, color: brand.text, fontWeight: '700' },
  lineQty: { fontSize: 11, color: brand.textMuted, fontWeight: '600' },
  lineVal: { minWidth: 80, textAlign: 'right', color: brand.primary, fontSize: 12, fontWeight: '800' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLbl: { color: brand.textSecondary, fontSize: fontSize.sm },
  summaryVal: { color: brand.text, fontSize: fontSize.sm, fontWeight: '700' },
  summaryDivider: { height: 1, backgroundColor: brand.border, marginVertical: 4 },
  summaryTotalLbl: { fontSize: fontSize.md, fontWeight: '800', color: brand.text },
  summaryTotalVal: { fontSize: fontSize.lg, fontWeight: '800', color: brand.primary },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumTxt: { color: brand.white, fontSize: 12, fontWeight: '800' },
  stepTxt: { flex: 1, color: brand.textSecondary, fontSize: fontSize.sm, lineHeight: 19 },

  backToShopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: brand.primary,
    paddingVertical: 15,
    borderRadius: radius.md,
  },
  backToShopTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.sm },

  btnPrimary: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
  },
  btnPrimaryTxt: { color: brand.white, fontSize: fontSize.sm, fontWeight: '800' },
});
