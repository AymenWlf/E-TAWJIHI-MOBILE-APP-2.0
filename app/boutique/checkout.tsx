import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTextInput } from '@/components/ui/AppTextInput';
import { ShopVillePickerSheet } from '@/components/ui/ShopVillePickerSheet';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/contexts/AuthContext';
import { useShopCart } from '@/contexts/ShopCartContext';
import { createShopOrder, fetchShopPublicSettings } from '@/services/shop';
import { recordShopBoutiqueEvent } from '@/services/shopBoutiqueAnalytics';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { ShopDeliveryMode, ShopShippingFeeMode } from '@/types/shop';
import {
  formatShopPrice,
  shopParsePriceString,
  shopPriceFormatOptsForCatalogOrCartLine,
} from '@/utils/shopFormatPrice';
import { saveShopOrderAccessToken } from '@/utils/shopOrderTokenStorage';
import { getMobileVisitorId } from '@/utils/visitorId';
import { getActiveShopVilles, parseShopVillePriceAmount, shopVilleListLabel, type ShopVilleRow } from '@/utils/shopVilles';

const ACTIVE_VILLES = getActiveShopVilles();

export default function BoutiqueCheckoutScreen() {
  const router = useRouter();
  const { lines, count, clear } = useShopCart();
  const { user } = useAuth();

  const [deliveryMode, setDeliveryMode] = useState<ShopDeliveryMode>('cod_delivery');

  const userFullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
  const [email, setEmail] = useState(user?.email ?? '');
  const [fullName, setFullName] = useState(userFullName);
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [addressLine, setAddressLine] = useState('');
  const [selectedVilleCheckCode, setSelectedVilleCheckCode] = useState(0);
  const [city, setCity] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [notes, setNotes] = useState('');
  const [shippingFeeMode, setShippingFeeMode] = useState<ShopShippingFeeMode>('catalog');
  const [fixedShippingFee, setFixedShippingFee] = useState('19.00');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVilleModal, setShowVilleModal] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const s = await fetchShopPublicSettings();
      if (!alive) return;
      setShippingFeeMode(s.shippingFeeMode);
      setFixedShippingFee(s.fixedShippingFee ?? '19.00');
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    void recordShopBoutiqueEvent('view_checkout');
  }, []);

  const subtotal = useMemo(
    () => lines.reduce((acc, l) => acc + shopParsePriceString(l.price) * l.quantity, 0),
    [lines],
  );
  const currency = lines[0]?.currency ?? 'MAD';
  const allFreeShipping = useMemo(
    () => lines.length > 0 && lines.every((l) => l.isFreeShipping === true),
    [lines],
  );
  const selectedVille = useMemo<ShopVilleRow | null>(() => {
    if (selectedVilleCheckCode <= 0) return null;
    return ACTIVE_VILLES.find((v) => v.checkCode === selectedVilleCheckCode) ?? null;
  }, [selectedVilleCheckCode]);

  const shippingAmount =
    deliveryMode === 'cod_delivery' && selectedVille && !allFreeShipping
      ? shippingFeeMode === 'fixed'
        ? Number.parseFloat(String(fixedShippingFee).replace(',', '.')) || 0
        : parseShopVillePriceAmount(selectedVille.price)
      : 0;
  const total = subtotal + shippingAmount;

  if (lines.length === 0) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <FontAwesome name="chevron-left" size={16} color={brand.text} />
          </Pressable>
          <Text style={styles.topTitle}>Commande</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <FontAwesome name="shopping-bag" size={36} color={brand.primary} />
          </View>
          <Text style={styles.emptyTitle}>Votre panier est vide</Text>
          <Text style={styles.emptyDesc}>Ajoutez des articles avant de passer commande.</Text>
          <Pressable
            style={({ pressed }) => [styles.btnPrimary, pressed && { opacity: 0.9 }]}
            onPress={() => router.replace('/(tabs)/boutique')}
          >
            <Text style={styles.btnPrimaryTxt}>Retour à la boutique</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const onSubmit = async () => {
    setError(null);
    if (!email.trim() || !/.+@.+\..+/.test(email.trim())) {
      setError('Email invalide.');
      return;
    }
    if (!fullName.trim()) {
      setError('Indiquez votre nom complet.');
      return;
    }
    if (!phone.trim()) {
      setError('Indiquez un numéro de téléphone.');
      return;
    }
    if (deliveryMode === 'cod_delivery') {
      if (selectedVilleCheckCode <= 0 || !city.trim()) {
        setError('Sélectionnez votre ville de livraison.');
        return;
      }
      if (!addressLine.trim()) {
        setError('Renseignez une adresse de livraison.');
        return;
      }
    }
    if (deliveryMode === 'pickup_office' && !pickupDate.trim()) {
      setError('Indiquez la date de passage au bureau (format AAAA-MM-JJ).');
      return;
    }

    setSubmitting(true);
    try {
      const analyticsVisitorId = await getMobileVisitorId();
      const result = await createShopOrder({
        lines: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        email: email.trim(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        deliveryMode,
        addressLine: deliveryMode === 'cod_delivery' ? addressLine.trim() : undefined,
        city: deliveryMode === 'cod_delivery' ? city.trim() : undefined,
        deliveryVilleCheckCode: deliveryMode === 'cod_delivery' ? selectedVilleCheckCode : undefined,
        pickupDate: deliveryMode === 'pickup_office' ? pickupDate.trim() : undefined,
        pickupTime: deliveryMode === 'pickup_office' && pickupTime.trim() ? pickupTime.trim() : undefined,
        notes: notes.trim() || undefined,
        analyticsVisitorId,
        analyticsViewport: 'mobile',
      });
      await saveShopOrderAccessToken(result.publicId, result.accessToken);
      await clear();
      router.replace({ pathname: '/boutique/thank-you', params: { publicId: result.publicId } });
    } catch (e) {
      const msg =
        e instanceof Error && e.message
          ? e.message
          : 'Impossible de finaliser la commande. Réessayez.';
      setError(extractApiErrorMessage(msg));
      Alert.alert('Erreur', extractApiErrorMessage(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={6}>
          <FontAwesome name="chevron-left" size={16} color={brand.text} />
        </Pressable>
        <View style={styles.topTitleWrap}>
          <Text style={styles.eyebrow}>Boutique</Text>
          <Text style={styles.topTitle}>Commande</Text>
          <Text style={styles.topSub}>{count} article{count > 1 ? 's' : ''}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={8}
      >
        <ScrollView
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {error ? (
            <View style={styles.errorBox}>
              <FontAwesome name="exclamation-triangle" size={14} color="#991B1B" />
              <Text style={styles.errorTxt}>{error}</Text>
            </View>
          ) : null}

          <SectionCard title="Mode de réception">
            <View style={styles.modeRow}>
              <ModeChoice
                icon="truck"
                label="Livraison"
                hint="Paiement à la livraison (espèces)"
                active={deliveryMode === 'cod_delivery'}
                onPress={() => setDeliveryMode('cod_delivery')}
              />
              <ModeChoice
                icon="building"
                label="Retrait au bureau"
                hint="Sur place, règlement à l'enlèvement"
                active={deliveryMode === 'pickup_office'}
                onPress={() => setDeliveryMode('pickup_office')}
              />
            </View>
          </SectionCard>

          <SectionCard title="Coordonnées" desc="Pour vous contacter au sujet de la commande.">
            <Field label="Email">
              <AppTextInput
                value={email}
                onChangeText={setEmail}
                placeholder="vous@exemple.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </Field>
            <Field label="Nom complet">
              <AppTextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Prénom et nom"
                autoComplete="name"
              />
            </Field>
            <Field label="Téléphone">
              <AppTextInput value={phone} onChangeText={setPhone} placeholder="06…" keyboardType="phone-pad" autoComplete="tel" />
            </Field>
          </SectionCard>

          {deliveryMode === 'cod_delivery' ? (
            <SectionCard title="Livraison" desc="Ville, frais de livraison et adresse — paiement en espèces à la réception (MAD).">
              <Field label="Ville de livraison">
                <Pressable
                  onPress={() => {
                    setShowVilleModal(true);
                  }}
                  style={[styles.input, styles.selectLike]}
                >
                  <Text style={[styles.selectTxt, !selectedVille && styles.selectTxtPlaceholder]} numberOfLines={1}>
                    {selectedVille ? shopVilleListLabel(selectedVille) : 'Choisir une ville…'}
                  </Text>
                  <FontAwesome name="chevron-down" size={12} color={brand.textMuted} />
                </Pressable>
              </Field>
              <Field label="Adresse de livraison">
                <TextInput
                  style={[styles.input, styles.inputMulti]}
                  value={addressLine}
                  onChangeText={setAddressLine}
                  placeholder="Rue, quartier, complément…"
                  placeholderTextColor={brand.textMuted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </Field>
            </SectionCard>
          ) : (
            <SectionCard title="Retrait au bureau" desc="Indiquez le créneau prévu — l'équipe E-Tawjihi vous confirme par téléphone.">
              <Field label="Date (AAAA-MM-JJ)">
                <AppTextInput value={pickupDate} onChangeText={setPickupDate} placeholder="2026-05-15" autoCapitalize="none" />
              </Field>
              <Field label="Heure (optionnel, HH:mm)">
                <AppTextInput value={pickupTime} onChangeText={setPickupTime} placeholder="14:30" autoCapitalize="none" />
              </Field>
            </SectionCard>
          )}

          <SectionCard title="Notes" desc="Optionnel — précisions pour l'équipe E-Tawjihi.">
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Créneau souhaité, consignes d'accès…"
              placeholderTextColor={brand.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </SectionCard>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Récapitulatif</Text>
            {lines.map((l) => {
              const opts = shopPriceFormatOptsForCatalogOrCartLine(l);
              const lineTotal = shopParsePriceString(l.price) * l.quantity;
              return (
                <View key={l.productId} style={styles.summaryLine}>
                  <Text style={styles.summaryLineTitle} numberOfLines={2}>
                    {l.title}
                  </Text>
                  <Text style={styles.summaryLineMeta}>× {l.quantity}</Text>
                  <Text style={styles.summaryLineVal}>
                    {formatShopPrice(String(lineTotal), l.currency, opts)}
                  </Text>
                </View>
              );
            })}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLbl}>Sous-total</Text>
              <Text style={styles.summaryVal}>{formatShopPrice(String(subtotal), currency)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLbl}>Livraison</Text>
              <Text style={styles.summaryVal}>
                {deliveryMode === 'pickup_office'
                  ? 'Retrait bureau'
                  : allFreeShipping
                    ? 'Offert'
                    : selectedVille
                      ? formatShopPrice(String(shippingAmount), currency)
                      : 'Choisir une ville'}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLbl}>Total</Text>
              <Text style={styles.summaryTotalVal}>{formatShopPrice(String(total), currency)}</Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            disabled={submitting}
            onPress={onSubmit}
            style={({ pressed }) => [
              styles.confirmBtn,
              (submitting || pressed) && { opacity: 0.85 },
            ]}
          >
            {submitting ? (
              <ActivityIndicator color={brand.white} />
            ) : (
              <>
                <FontAwesome name="lock" size={13} color={brand.white} />
                <Text style={styles.confirmTxt}>Confirmer la commande</Text>
              </>
            )}
          </Pressable>
          <Text style={styles.bottomDisclaimer}>
            Données transmises de façon sécurisée — pas de paiement carte.
          </Text>
        </View>
      </KeyboardAvoidingView>

      <ShopVillePickerSheet
        visible={showVilleModal}
        selectedCheckCode={selectedVilleCheckCode}
        onClose={() => setShowVilleModal(false)}
        onSelect={(v) => {
          setSelectedVilleCheckCode(v.checkCode);
          setCity(shopVilleListLabel(v));
          setShowVilleModal(false);
        }}
      />
    </SafeAreaView>
  );
}

function extractApiErrorMessage(raw: string): string {
  if (!raw) return 'Une erreur est survenue.';
  try {
    const obj = JSON.parse(raw) as { message?: string };
    if (obj && typeof obj.message === 'string' && obj.message) return obj.message;
  } catch {
    /* not JSON */
  }
  return raw;
}

function SectionCard({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {desc ? <Text style={styles.sectionDesc}>{desc}</Text> : null}
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function ModeChoice({
  icon,
  label,
  hint,
  active,
  onPress,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  hint: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.modeChoice, active && styles.modeChoiceActive]}>
      <View style={[styles.modeIcon, active && styles.modeIconActive]}>
        <FontAwesome name={icon} size={16} color={active ? brand.white : brand.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>{label}</Text>
        <Text style={styles.modeHint} numberOfLines={2}>
          {hint}
        </Text>
      </View>
      <FontAwesome
        name={active ? 'check-circle' : 'circle-thin'}
        size={18}
        color={active ? brand.primary : brand.textMuted}
      />
    </Pressable>
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
  topSub: { fontSize: 11, color: brand.textMuted, marginTop: 2 },

  list: { padding: spacing.lg, gap: spacing.md },
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
  },
  errorTxt: { flex: 1, color: '#991B1B', fontSize: fontSize.sm, fontWeight: '600' },
  section: {
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: brand.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: brand.borderLight,
    backgroundColor: '#FAFBFD',
  },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '800', color: brand.text },
  sectionDesc: { marginTop: 2, fontSize: 12, color: brand.textSecondary },
  sectionBody: { padding: spacing.lg, gap: spacing.md },

  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: brand.textMuted,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: brand.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: fontSize.md,
    color: brand.text,
    minHeight: 44,
  },
  inputMulti: { minHeight: 86 },
  selectLike: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectTxt: { color: brand.text, fontSize: fontSize.md, flex: 1 },
  selectTxtPlaceholder: { color: brand.textMuted },
  helper: { fontSize: 11, color: brand.textSecondary, marginTop: 2 },

  modeRow: { flexDirection: 'column', gap: spacing.sm },
  modeChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: brand.border,
    backgroundColor: brand.white,
  },
  modeChoiceActive: { borderColor: brand.primary, backgroundColor: 'rgba(51,62,143,0.06)' },
  modeIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: brand.backgroundSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeIconActive: { backgroundColor: brand.primary },
  modeLabel: { fontSize: fontSize.sm, fontWeight: '800', color: brand.text },
  modeLabelActive: { color: brand.primary },
  modeHint: { fontSize: 11, color: brand.textSecondary, marginTop: 2 },

  summaryCard: {
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: brand.border,
    padding: spacing.lg,
    gap: 8,
  },
  summaryTitle: { fontSize: fontSize.md, fontWeight: '800', color: brand.text, marginBottom: 4 },
  summaryLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.borderLight,
  },
  summaryLineTitle: { flex: 1, fontSize: 12, color: brand.text, fontWeight: '700' },
  summaryLineMeta: { fontSize: 11, color: brand.textMuted, fontWeight: '600' },
  summaryLineVal: { fontSize: 12, color: brand.primary, fontWeight: '800', minWidth: 80, textAlign: 'right' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLbl: { fontSize: fontSize.sm, color: brand.textSecondary },
  summaryVal: { fontSize: fontSize.sm, color: brand.text, fontWeight: '700' },
  summaryDivider: { height: 1, backgroundColor: brand.border, marginVertical: 4 },
  summaryTotalLbl: { fontSize: fontSize.md, fontWeight: '800', color: brand.text },
  summaryTotalVal: { fontSize: fontSize.lg, fontWeight: '800', color: brand.primary },

  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg + 4,
    backgroundColor: brand.white,
    borderTopWidth: 1,
    borderTopColor: brand.border,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
  },
  confirmTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.md },
  bottomDisclaimer: { textAlign: 'center', marginTop: 8, color: brand.textMuted, fontSize: 11 },

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
