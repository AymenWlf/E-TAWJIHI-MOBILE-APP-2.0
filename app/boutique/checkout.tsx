import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  SearchablePickSheet,
  type SearchablePickItem,
} from '@/components/schools/SearchablePickSheet';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { SelectField } from '@/components/ui/SelectField';
import { ShopVillePickerSheet } from '@/components/ui/ShopVillePickerSheet';
import { PlatformServiceVisualThumb } from '@/components/shop/PlatformServiceVisualThumb';
import { Text } from '@/components/ui/Text';
import {
  BAC_TYPES,
  FILIERE_BAC_OPTIONS,
  type LabeledOption,
  NIVEAU_ETUDE_OPTIONS,
  SPECIALITES_MISSION,
} from '@/constants/academicSetup';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useShopCart } from '@/contexts/ShopCartContext';
import { createShopOrder, fetchShopPublicSettings, hydrateCartLinesPricesViaApi } from '@/services/shop';
import { checkPlatformServicePurchaseEligibility } from '@/services/platformServices';
import { isPlatformServiceCartLine } from '@/utils/platformServiceCart';
import type { ShopPromoDiscountType } from '@/services/shopPromo';
import {
  fetchShopAutoApplyPromo,
  rejectMultipleShopPromoCodesInInput,
  shopCartLinesToPromoPayload,
  validateShopPromoCode,
} from '@/services/shopPromo';
import { recordShopBoutiqueEvent } from '@/services/shopBoutiqueAnalytics';
import { getUserProfile } from '@/services/userProfile';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { CreateShopOrderInput, ShopShippingFeeMode } from '@/types/shop';
import {
  formatShopPrice,
  shopParsePriceString,
  shopPriceFormatOptsForCatalogOrCartLine,
} from '@/utils/shopFormatPrice';
import { shopProductPrimaryImage } from '@/utils/shopImageUrl';
import { saveShopOrderAccessToken } from '@/utils/shopOrderTokenStorage';
import { getMobileVisitorId } from '@/utils/visitorId';
import { isBacStudyProfileLevel } from '@/utils/academicProfileLevels';
import { getActiveShopVilles, parseShopVillePriceAmount, shopVilleListLabel, type ShopVilleRow } from '@/utils/shopVilles';

type ServicePaymentChoice = NonNullable<CreateShopOrderInput['servicePaymentModality']>;

const ACTIVE_VILLES = getActiveShopVilles();

const CHECKOUT_DELIVERY_MODE = 'cod_delivery' as const;

function findShopVilleForProfileCity(rows: readonly ShopVilleRow[], titre: string): ShopVilleRow | null {
  const raw = titre.trim();
  if (!raw) return null;
  const t = raw.toLowerCase();
  const norm = (s: string) => s.trim().toLowerCase();
  for (const v of rows) {
    if (norm(shopVilleListLabel(v)) === t || norm(v.ville) === t || norm(v.name) === t) {
      return v;
    }
  }
  let hit: ShopVilleRow | null = null;
  for (const v of rows) {
    const lbl = norm(shopVilleListLabel(v));
    if (lbl.includes(t) || t.includes(lbl)) {
      if (hit) return null;
      hit = v;
    }
  }
  return hit;
}

const BASE_SERVICE_PAYMENT_ICONS: Record<
  ServicePaymentChoice,
  ComponentProps<typeof FontAwesome>['name']
> = {
  bank_transfer: 'credit-card',
  cashplus: 'mobile',
  office: 'building-o',
  pay_on_delivery: 'truck',
};

function fillCheckoutTpl(template: string, vars: Record<string, string>): string {
  let s = template;
  for (const [k, v] of Object.entries(vars)) {
    s = s.split(`{${k}}`).join(v);
  }
  return s;
}

type CheckoutFieldKey =
  | 'email'
  | 'fullName'
  | 'phone'
  | 'studyLevel'
  | 'bacType'
  | 'filiere'
  | 'specialiteMission1'
  | 'specialiteMission2'
  | 'studentCity'
  | 'servicePayment'
  | 'deliveryCity'
  | 'addressLine';

function collectCheckoutValidationErrors(params: {
  email: string;
  fullName: string;
  phone: string;
  hasAnyService: boolean;
  hasPhysicalProducts: boolean;
  studyLevel: string;
  bacType: string;
  filiere: string;
  specialiteMission1: string;
  specialiteMission2: string;
  studentVilleCheckCode: number;
  studentCity: string;
  servicePayment: string;
  selectedVilleCheckCode: number;
  city: string;
  addressLine: string;
  t: (key: string) => string;
}): { errors: Set<CheckoutFieldKey>; firstMessage: string | null } {
  const errors = new Set<CheckoutFieldKey>();
  let firstMessage: string | null = null;
  const add = (key: CheckoutFieldKey, message: string) => {
    errors.add(key);
    if (firstMessage === null) firstMessage = message;
  };

  if (!params.email.trim() || !/.+@.+\..+/.test(params.email.trim())) {
    add('email', params.t('shopCheckoutErrEmail'));
  }
  if (!params.fullName.trim()) {
    add('fullName', params.t('shopCheckoutErrFullName'));
  }
  if (!params.phone.trim()) {
    add('phone', params.t('shopCheckoutErrPhone'));
  }

  if (params.hasAnyService) {
    if (!params.studyLevel.trim()) {
      add('studyLevel', params.t('shopCheckoutErrStudyLevel'));
    }
    if (isBacStudyProfileLevel(params.studyLevel)) {
      if (!params.bacType) {
        add('bacType', params.t('shopCheckoutErrBacType'));
      } else if (params.bacType === 'mission') {
        if (!params.specialiteMission1.trim() || !params.specialiteMission2.trim()) {
          if (!params.specialiteMission1.trim()) add('specialiteMission1', params.t('shopCheckoutErrMissionSpecs'));
          if (!params.specialiteMission2.trim()) add('specialiteMission2', params.t('shopCheckoutErrMissionSpecs'));
        }
      } else if (!params.filiere.trim()) {
        add('filiere', params.t('shopCheckoutErrFiliere'));
      }
    }
    if (params.studentVilleCheckCode <= 0 || !params.studentCity.trim()) {
      add('studentCity', params.t('shopCheckoutErrStudentVille'));
    }
    if (!params.servicePayment) {
      add('servicePayment', params.t('shopCheckoutErrPayment'));
    }
  }

  if (params.hasPhysicalProducts) {
    if (params.selectedVilleCheckCode <= 0 || !params.city.trim()) {
      add('deliveryCity', params.t('shopCheckoutErrShipCity'));
    }
    if (!params.addressLine.trim()) {
      add('addressLine', params.t('shopCheckoutErrAddress'));
    }
  }

  return { errors, firstMessage };
}

export default function BoutiqueCheckoutScreen() {
  const router = useRouter();
  const { locale, isRTL, t } = useLocale();
  const { lines, count, clear, replaceLines } = useShopCart();
  const { user, getValidAccessToken } = useAuth();

  const userFullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
  const [email, setEmail] = useState(user?.email ?? '');
  const [fullName, setFullName] = useState(userFullName);
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [addressLine, setAddressLine] = useState('');
  const [selectedVilleCheckCode, setSelectedVilleCheckCode] = useState(0);
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [shippingFeeMode, setShippingFeeMode] = useState<ShopShippingFeeMode>('catalog');
  const [fixedShippingFee, setFixedShippingFee] = useState('19.00');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Set<CheckoutFieldKey>>(() => new Set());

  const clearFieldError = useCallback((key: CheckoutFieldKey) => {
    setFieldErrors((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const fieldHasError = useCallback((key: CheckoutFieldKey) => fieldErrors.has(key), [fieldErrors]);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoEligibleSubtotal, setPromoEligibleSubtotal] = useState<number | null>(null);
  const [promoDiscountType, setPromoDiscountType] = useState<ShopPromoDiscountType | null>(null);
  const [promoDiscountValue, setPromoDiscountValue] = useState<string | null>(null);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [promoValidating, setPromoValidating] = useState(false);
  const promoManualEditRef = useRef(false);
  const [showDeliveryVilleModal, setShowDeliveryVilleModal] = useState(false);
  const [showStudentVilleModal, setShowStudentVilleModal] = useState(false);

  const [studyLevel, setStudyLevel] = useState('');
  const [bacType, setBacType] = useState<'normal' | 'mission' | ''>('');
  const [filiere, setFiliere] = useState('');
  const [specialiteMission1, setSpecialiteMission1] = useState('');
  const [specialiteMission2, setSpecialiteMission2] = useState('');
  const [specialiteMission3, setSpecialiteMission3] = useState('');
  const [studentVilleCheckCode, setStudentVilleCheckCode] = useState(0);
  const [studentCity, setStudentCity] = useState('');
  const [servicePayment, setServicePayment] = useState<ServicePaymentChoice | ''>('');

  type CheckoutAcademicField =
    | 'studyLevel'
    | 'bacType'
    | 'filiere'
    | 'specialiteMission1'
    | 'specialiteMission2'
    | 'specialiteMission3'
    | null;
  const [academicField, setAcademicField] = useState<CheckoutAcademicField>(null);

  const toPickItems = useCallback(
    (options: readonly LabeledOption[] | LabeledOption[]): SearchablePickItem[] =>
      options
        .filter((o) => o.value !== '')
        .map((o) => ({
          id: o.value,
          value: o.value,
          label: locale === 'ar' && o.labelAr ? o.labelAr : o.label,
        })),
    [locale],
  );

  const specialiteMissionOptions = useMemo<LabeledOption[]>(
    () => SPECIALITES_MISSION.map((s) => ({ value: s, label: s, labelAr: s })),
    [],
  );

  const checkoutAcademicConfig = useMemo(
    () => ({
      studyLevel: {
        title: t('setupStudyLevel'),
        items: toPickItems(NIVEAU_ETUDE_OPTIONS),
        value: studyLevel,
      },
      bacType: {
        title: t('setupBacType'),
        items: BAC_TYPES.map((b) => ({ id: b.value, value: b.value, label: b.label })),
        value: bacType,
      },
      filiere: {
        title: t('setupFiliere'),
        items: toPickItems(FILIERE_BAC_OPTIONS),
        value: filiere,
      },
      specialiteMission1: {
        title: t('setupSpecialite1'),
        items: toPickItems(specialiteMissionOptions),
        value: specialiteMission1,
      },
      specialiteMission2: {
        title: t('setupSpecialite2'),
        items: toPickItems(specialiteMissionOptions),
        value: specialiteMission2,
      },
      specialiteMission3: {
        title: t('setupSpecialite3Optional'),
        items: toPickItems(specialiteMissionOptions),
        value: specialiteMission3,
      },
    }),
    [
      t,
      toPickItems,
      studyLevel,
      bacType,
      filiere,
      specialiteMission1,
      specialiteMission2,
      specialiteMission3,
      specialiteMissionOptions,
    ],
  );

  const labelFor = useCallback((value: string, items: SearchablePickItem[]): string => {
    if (!value) return '';
    const found = items.find((i) => i.value === value);
    return found?.label ?? value;
  }, []);

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

  const hasPhysicalProducts = useMemo(
    () => lines.some((l) => !isPlatformServiceCartLine(l)),
    [lines],
  );
  const hasAnyService = useMemo(() => lines.some((l) => isPlatformServiceCartLine(l)), [lines]);
  const isMissionBac = bacType === 'mission';
  const showBacBlock = isBacStudyProfileLevel(studyLevel);

  useFocusEffect(
    useCallback(() => {
      if (!hasAnyService || !user?.id) {
        return;
      }
      let cancelled = false;
      void (async () => {
        try {
          const token = await getValidAccessToken();
          if (!token || cancelled) return;
          const p = await getUserProfile(token);
          if (!p || cancelled) return;

          const prenom = (p.prenom ?? '').trim();
          const nom = (p.nom ?? '').trim();
          const fromProfileName = [prenom, nom].filter(Boolean).join(' ').trim();
          const profileEmail = (p.email ?? '').trim();

          if (profileEmail) {
            setEmail((prev) => {
              const pt = prev.trim();
              if (pt === '') return profileEmail;
              if (pt.includes('@e-tawjihi.ma') && !profileEmail.includes('@e-tawjihi.ma')) return profileEmail;
              return prev;
            });
          }
          if (fromProfileName) {
            setFullName((prev) => (prev.trim() === '' ? fromProfileName : prev));
          }
          const profileTel = (p.telephone ?? '').trim();
          if (profileTel) {
            setPhone((prev) => (prev.trim() === '' ? profileTel : prev));
          }

          const nv = (p.niveau ?? '').trim();
          if (nv) {
            setStudyLevel((prev) => (prev.trim() === '' ? nv : prev));
          }

          const bt = (p.bacType ?? '').trim();
          if (bt === 'normal' || bt === 'mission') {
            setBacType((prev) => (prev === '' ? (bt as 'normal' | 'mission') : prev));
          }

          const fil = (p.filiere ?? '').trim();
          if (fil) {
            setFiliere((prev) => (prev.trim() === '' ? fil : prev));
          }

          const s1 = (p.specialite1 ?? '').trim();
          const s2 = (p.specialite2 ?? '').trim();
          const s3 = (p.specialite3 ?? '').trim();
          if (s1) setSpecialiteMission1((prev) => (prev.trim() === '' ? s1 : prev));
          if (s2) setSpecialiteMission2((prev) => (prev.trim() === '' ? s2 : prev));
          if (s3) setSpecialiteMission3((prev) => (prev.trim() === '' ? s3 : prev));

          const villeTitre = p.ville?.titre?.trim();
          if (villeTitre) {
            const row = findShopVilleForProfileCity(ACTIVE_VILLES, villeTitre);
            if (row) {
              setStudentVilleCheckCode((prev) => (prev <= 0 ? row.checkCode : prev));
              setStudentCity((prev) => (prev.trim() === '' ? shopVilleListLabel(row) : prev));
            }
          }
        } catch {
          /* pas de profil ou hors-ligne */
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [hasAnyService, user?.id, getValidAccessToken]),
  );

  useEffect(() => {
    if (!isBacStudyProfileLevel(studyLevel)) {
      setBacType('');
      setFiliere('');
      setSpecialiteMission1('');
      setSpecialiteMission2('');
      setSpecialiteMission3('');
    }
  }, [studyLevel]);

  useEffect(() => {
    if (servicePayment === 'pay_on_delivery' && !hasPhysicalProducts) {
      setServicePayment('');
    }
  }, [hasPhysicalProducts, servicePayment]);

  const servicePaymentOptions = useMemo(() => {
    const ids: ServicePaymentChoice[] = hasPhysicalProducts
      ? ['bank_transfer', 'cashplus', 'office', 'pay_on_delivery']
      : ['bank_transfer', 'cashplus', 'office'];
    const labelForId = (id: ServicePaymentChoice): string => {
      if (id === 'bank_transfer') return t('shopCheckoutPayBank');
      if (id === 'cashplus') return t('shopCheckoutPayCashplus');
      if (id === 'office') return t('shopCheckoutPayOffice');
      return t('shopCheckoutPayOnDelivery');
    };
    return ids.map((id) => ({
      id,
      label: labelForId(id),
      icon: BASE_SERVICE_PAYMENT_ICONS[id],
    }));
  }, [hasPhysicalProducts, t]);

  const subtotal = useMemo(
    () => lines.reduce((acc, l) => acc + shopParsePriceString(l.price) * l.quantity, 0),
    [lines],
  );
  const currency = lines[0]?.currency ?? 'MAD';
  const cartWideFreeShipping = useMemo(
    () => lines.length > 0 && lines.some((l) => l.isFreeShipping === true),
    [lines],
  );
  const selectedVille = useMemo<ShopVilleRow | null>(() => {
    if (selectedVilleCheckCode <= 0) return null;
    return ACTIVE_VILLES.find((v) => v.checkCode === selectedVilleCheckCode) ?? null;
  }, [selectedVilleCheckCode]);
  const selectedStudentVille = useMemo<ShopVilleRow | null>(() => {
    if (studentVilleCheckCode <= 0) return null;
    return ACTIVE_VILLES.find((v) => v.checkCode === studentVilleCheckCode) ?? null;
  }, [studentVilleCheckCode]);

  const shippingAmount =
    hasPhysicalProducts && selectedVille && !cartWideFreeShipping
      ? shippingFeeMode === 'fixed'
        ? Number.parseFloat(String(fixedShippingFee).replace(',', '.')) || 0
        : parseShopVillePriceAmount(selectedVille.price)
      : 0;
  const articlesAfterPromo = Math.max(0, subtotal - promoDiscount);
  const total = Math.max(0, articlesAfterPromo + shippingAmount);

  const clearPromo = useCallback(() => {
    promoManualEditRef.current = false;
    setPromoCode('');
    setPromoDiscount(0);
    setPromoEligibleSubtotal(null);
    setPromoDiscountType(null);
    setPromoDiscountValue(null);
    setPromoMessage(null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (lines.length === 0) return;
      let cancelled = false;
      void (async () => {
        const priced = await hydrateCartLinesPricesViaApi(lines);
        if (cancelled) return;
        if (JSON.stringify(priced) !== JSON.stringify(lines)) {
          await replaceLines(priced);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [lines, replaceLines]),
  );

  const applyPromoCode = useCallback(async () => {
    const code = promoCode.trim();
    if (!code) {
      setPromoMessage(t('shopCheckoutPromoErrEnter'));
      setPromoDiscount(0);
      return;
    }
    const multiErr = rejectMultipleShopPromoCodesInInput(code);
    if (multiErr) {
      setPromoDiscount(0);
      setPromoMessage(multiErr);
      return;
    }
    promoManualEditRef.current = true;
    setPromoValidating(true);
    setPromoMessage(null);
    setPromoDiscount(0);
    try {
      const accessToken = user ? await getValidAccessToken() : null;
      const res = await validateShopPromoCode(
        {
          code,
          lines: shopCartLinesToPromoPayload(lines),
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
        },
        accessToken,
      );
      if (res.valid) {
        const disc = Number.parseFloat(res.discountAmount) || 0;
        const eligible = res.eligibleSubtotal ? Number.parseFloat(res.eligibleSubtotal) : null;
        setPromoDiscount(disc);
        setPromoEligibleSubtotal(eligible != null && !Number.isNaN(eligible) ? eligible : null);
        setPromoDiscountType(res.discountType ?? null);
        setPromoDiscountValue(res.discountValue ?? null);
        setPromoCode(res.code);
        if (res.discountType === 'percent' && res.discountValue && eligible != null && !Number.isNaN(eligible)) {
          setPromoMessage(
            t('shopCheckoutPromoAppliedPercent')
              .replace('{pct}', res.discountValue.replace(/\.00$/, ''))
              .replace('{base}', formatShopPrice(String(eligible), currency)),
          );
        } else if (res.discountType === 'fixed' && res.discountValue) {
          setPromoMessage(
            t('shopCheckoutPromoAppliedFixed')
              .replace('{amount}', formatShopPrice(res.discountValue, currency)),
          );
        } else {
          setPromoMessage(res.message);
        }
      } else {
        setPromoDiscount(0);
        setPromoEligibleSubtotal(null);
        setPromoDiscountType(null);
        setPromoDiscountValue(null);
        setPromoMessage(res.message);
      }
    } catch {
      setPromoDiscount(0);
      setPromoEligibleSubtotal(null);
      setPromoDiscountType(null);
      setPromoDiscountValue(null);
      setPromoMessage(t('shopCheckoutPromoErrValidate'));
    } finally {
      setPromoValidating(false);
    }
  }, [promoCode, lines, phone, email, currency, t, user, getValidAccessToken]);

  /** Recalcule la remise si le sous-total change (ex. après synchro prix catalogue). */
  useEffect(() => {
    const code = promoCode.trim();
    if (!code || lines.length === 0 || subtotal <= 0) return;
    const tid = setTimeout(() => {
      void applyPromoCode();
    }, 400);
    return () => clearTimeout(tid);
  }, [subtotal]);

  useEffect(() => {
    if (lines.length === 0 || promoManualEditRef.current) return;
    let cancelled = false;
    void (async () => {
      try {
        const accessToken = user ? await getValidAccessToken() : null;
        const res = await fetchShopAutoApplyPromo(
          {
            lines: shopCartLinesToPromoPayload(lines),
            phone: phone.trim() || undefined,
            email: email.trim() || undefined,
          },
          accessToken,
        );
        if (cancelled) return;
        if (res.valid && res.autoApplied) {
          const disc = Number.parseFloat(res.discountAmount) || 0;
          const eligible = res.eligibleSubtotal ? Number.parseFloat(res.eligibleSubtotal) : null;
          setPromoDiscount(disc);
          setPromoEligibleSubtotal(eligible != null && !Number.isNaN(eligible) ? eligible : null);
          setPromoDiscountType(res.discountType ?? null);
          setPromoDiscountValue(res.discountValue ?? null);
          setPromoCode(res.code);
          setPromoMessage(res.message);
        } else if (!promoCode.trim()) {
          setPromoDiscount(0);
          setPromoMessage(null);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lines, phone, email, promoCode, user, getValidAccessToken]);

  const deliveryIntroText = useMemo(
    () => t('shopCheckoutDeliveryInfo') + (cartWideFreeShipping ? t('shopCheckoutDeliveryInfoFree') : ''),
    [t, cartWideFreeShipping],
  );

  const studentVilleHintText = useMemo(() => {
    if (!selectedStudentVille) return '';
    const price = selectedStudentVille.price;
    const delais = selectedStudentVille.delais?.trim() || '—';
    if (cartWideFreeShipping) {
      return fillCheckoutTpl(t('shopCheckoutStudentHintFree'), { price, delais });
    }
    return fillCheckoutTpl(t('shopCheckoutStudentHint'), { price, delais });
  }, [selectedStudentVille, cartWideFreeShipping, t]);

  const deliveryVilleMetaText = useMemo(() => {
    if (!selectedVille || !hasPhysicalProducts) return '';
    const price = selectedVille.price;
    const delais = selectedVille.delais?.trim() || '—';
    if (cartWideFreeShipping) {
      return fillCheckoutTpl(t('shopCheckoutVilleMetaFree'), { price, delais });
    }
    if (shippingFeeMode === 'fixed') {
      return fillCheckoutTpl(t('shopCheckoutVilleMetaFixed'), {
        price,
        delais,
        fee: String(fixedShippingFee).replace(',', '.'),
      });
    }
    return fillCheckoutTpl(t('shopCheckoutVilleMetaCatalog'), {
      fee: formatShopPrice(String(parseShopVillePriceAmount(selectedVille.price)), currency),
      delais,
    });
  }, [
    selectedVille,
    hasPhysicalProducts,
    cartWideFreeShipping,
    shippingFeeMode,
    fixedShippingFee,
    currency,
    t,
  ]);

  const shippingSummaryText = useMemo(() => {
    if (!hasPhysicalProducts) return t('shopCheckoutShipNoPhysical');
    if (cartWideFreeShipping) return t('shopCheckoutShipFree');
    if (selectedVille) return formatShopPrice(String(shippingAmount), currency);
    return t('shopCheckoutShipPickCity');
  }, [hasPhysicalProducts, cartWideFreeShipping, selectedVille, shippingAmount, currency, t]);

  const bottomDisclaimerText = useMemo(() => {
    if (hasAnyService) {
      return servicePayment === 'pay_on_delivery'
        ? t('shopCheckoutDisclaimerPod')
        : t('shopCheckoutDisclaimerInstr');
    }
    return t('shopCheckoutDisclaimerSecure');
  }, [hasAnyService, servicePayment, t]);

  if (lines.length === 0) {
    return (
      <SafeAreaView style={[styles.root, isRTL && styles.rtlRoot]} edges={['top']}>
        <StatusBar style="dark" />
        <View style={[styles.topBar, isRTL && styles.rowRtl]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <FontAwesome name={isRTL ? 'chevron-right' : 'chevron-left'} size={16} color={brand.text} />
          </Pressable>
          <Text style={[styles.topTitle, isRTL && styles.headerTxtRtl]}>{t('shopCheckoutTitle')}</Text>
          <View style={{ width: 40 }} />
        </View>
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
    );
  }

  const onSubmit = async () => {
    setError(null);
    const validation = collectCheckoutValidationErrors({
      email,
      fullName,
      phone,
      hasAnyService,
      hasPhysicalProducts,
      studyLevel,
      bacType,
      filiere,
      specialiteMission1,
      specialiteMission2,
      studentVilleCheckCode,
      studentCity,
      servicePayment,
      selectedVilleCheckCode,
      city,
      addressLine,
      t,
    });
    if (validation.errors.size > 0) {
      setFieldErrors(validation.errors);
      const msg = validation.firstMessage ?? t('shopCheckoutErrGeneric');
      setError(msg);
      Alert.alert(t('commonErrorTitle'), msg);
      return;
    }
    setFieldErrors(new Set());

    const serviceSlugs = lines
      .filter(isPlatformServiceCartLine)
      .map((l) => String((l.platformServiceSlug ?? l.slug) ?? '').trim())
      .filter(Boolean);
    if (serviceSlugs.length > 0) {
      try {
        const accessToken = user ? await getValidAccessToken() : null;
        const elig = await checkPlatformServicePurchaseEligibility(
          { slugs: serviceSlugs, phone: phone.trim() || undefined },
          accessToken,
        );
        if (!elig.allowed) {
          const msg = elig.message ?? t('shopCheckoutErrGeneric');
          setError(msg);
          Alert.alert(t('commonErrorTitle'), msg);
          return;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : t('shopCheckoutErrGeneric');
        setError(msg);
        Alert.alert(t('commonErrorTitle'), msg);
        return;
      }
    }

    setSubmitting(true);
    try {
      const analyticsVisitorId = await getMobileVisitorId();
      const accessToken = user ? await getValidAccessToken() : null;
      const result = await createShopOrder({
        lines: lines.map((l) =>
          isPlatformServiceCartLine(l)
            ? {
                platformServiceSlug: String((l.platformServiceSlug ?? l.slug) ?? '').trim(),
                quantity: 1,
              }
            : { productId: l.productId, quantity: l.quantity },
        ),
        email: email.trim(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        deliveryMode: CHECKOUT_DELIVERY_MODE,
        addressLine: hasPhysicalProducts ? addressLine.trim() || undefined : undefined,
        city: hasPhysicalProducts ? city.trim() || undefined : undefined,
        deliveryVilleCheckCode: hasPhysicalProducts && selectedVilleCheckCode > 0 ? selectedVilleCheckCode : undefined,
        notes: notes.trim() || undefined,
        analyticsVisitorId,
        analyticsViewport: 'mobile',
        ...(hasAnyService
          ? {
              studyLevel: studyLevel.trim(),
              bacType: bacType.trim() || undefined,
              filiere: filiere.trim() || undefined,
              specialiteMission1: isMissionBac ? specialiteMission1.trim() : undefined,
              specialiteMission2: isMissionBac ? specialiteMission2.trim() : undefined,
              specialiteMission3:
                isMissionBac && specialiteMission3.trim() ? specialiteMission3.trim() : undefined,
              studentCity: studentCity.trim(),
              servicePaymentModality: servicePayment as ServicePaymentChoice,
            }
          : {}),
        promoCode: promoCode.trim() || undefined,
      }, accessToken);
      await saveShopOrderAccessToken(result.publicId, result.accessToken);
      await clear();
      router.replace({ pathname: '/boutique/thank-you', params: { publicId: result.publicId } });
    } catch (e) {
      const rawMsg = e instanceof Error && e.message ? e.message : t('shopCheckoutErrSubmit');
      const errMsg = extractApiErrorMessage(rawMsg) || t('shopCheckoutErrGeneric');
      setError(errMsg);
      Alert.alert(t('commonErrorTitle'), errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.root, isRTL && styles.rtlRoot]} edges={['top']}>
      <StatusBar style="dark" />
      <View style={[styles.topBar, isRTL && styles.rowRtl]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={6}>
          <FontAwesome name={isRTL ? 'chevron-right' : 'chevron-left'} size={16} color={brand.text} />
        </Pressable>
        <View style={styles.topTitleWrap}>
          <Text style={[styles.eyebrow, isRTL && styles.headerTxtRtl]}>{t('shopCheckoutEyebrowBoutique')}</Text>
          <Text style={[styles.topTitle, isRTL && styles.headerTxtRtl]}>{t('shopCheckoutTitle')}</Text>
          <Text style={[styles.topSub, isRTL && styles.headerTxtRtl]}>
            {count === 1 ? t('shopCartItemsOne') : t('shopCartItemsMany').replace('{n}', String(count))}
          </Text>
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
            <View style={[styles.errorBox, isRTL && styles.rowRtl]}>
              <FontAwesome name="exclamation-triangle" size={14} color="#991B1B" />
              <Text style={[styles.errorTxt, isRTL && styles.txtRtl]}>{error}</Text>
            </View>
          ) : null}

          {hasPhysicalProducts ? (
            <SectionCard isRtl={isRTL} title={t('shopCheckoutDeliveryTitle')} desc={t('shopCheckoutDeliveryDesc')}>
              <View style={[styles.deliveryInfoRow, isRTL && styles.rowRtl]}>
                <FontAwesome name="truck" size={18} color={brand.primary} />
                <Text style={[styles.deliveryInfoTxt, isRTL && styles.txtRtl]}>{deliveryIntroText}</Text>
              </View>
            </SectionCard>
          ) : null}

          <SectionCard isRtl={isRTL} title={t('shopCheckoutContactTitle')} desc={t('shopCheckoutContactDesc')}>
            <Field isRtl={isRTL} label={t('shopCheckoutLblEmail')} required>
              <AppTextInput
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  clearFieldError('email');
                }}
                placeholder={t('shopCheckoutPhEmail')}
                textRtl={isRTL}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                style={fieldHasError('email') ? styles.inputFieldError : undefined}
              />
            </Field>
            <Field isRtl={isRTL} label={t('shopCheckoutLblFullName')} required>
              <AppTextInput
                value={fullName}
                onChangeText={(v) => {
                  setFullName(v);
                  clearFieldError('fullName');
                }}
                placeholder={t('shopCheckoutPhName')}
                textRtl={isRTL}
                autoComplete="name"
                style={fieldHasError('fullName') ? styles.inputFieldError : undefined}
              />
            </Field>
            <Field isRtl={isRTL} label={t('shopCheckoutLblPhone')} required>
              <AppTextInput
                value={phone}
                onChangeText={(v) => {
                  setPhone(v);
                  clearFieldError('phone');
                }}
                placeholder={t('shopCheckoutPhPhone')}
                textRtl={isRTL}
                keyboardType="phone-pad"
                autoComplete="tel"
                style={fieldHasError('phone') ? styles.inputFieldError : undefined}
              />
            </Field>

            {hasAnyService ? (
              <>
                <SelectField
                  label={t('setupStudyLevel')}
                  value={labelFor(studyLevel, checkoutAcademicConfig.studyLevel.items)}
                  rtl={isRTL}
                  required
                  hasError={fieldHasError('studyLevel')}
                  onPress={() => setAcademicField('studyLevel')}
                />
                {showBacBlock ? (
                  <>
                    <SelectField
                      label={t('setupBacType')}
                      value={labelFor(bacType, checkoutAcademicConfig.bacType.items)}
                      rtl={isRTL}
                      required
                      hasError={fieldHasError('bacType')}
                      onPress={() => setAcademicField('bacType')}
                    />
                    {bacType === 'normal' ? (
                      <SelectField
                        label={t('setupFiliere')}
                        value={labelFor(filiere, checkoutAcademicConfig.filiere.items)}
                        rtl={isRTL}
                        required
                        hasError={fieldHasError('filiere')}
                        onPress={() => setAcademicField('filiere')}
                      />
                    ) : null}
                    {bacType === 'mission' ? (
                      <>
                        <SelectField
                          label={t('setupSpecialite1')}
                          value={labelFor(specialiteMission1, checkoutAcademicConfig.specialiteMission1.items)}
                          rtl={isRTL}
                          required
                          hasError={fieldHasError('specialiteMission1')}
                          onPress={() => setAcademicField('specialiteMission1')}
                        />
                        <SelectField
                          label={t('setupSpecialite2')}
                          value={labelFor(specialiteMission2, checkoutAcademicConfig.specialiteMission2.items)}
                          rtl={isRTL}
                          required
                          hasError={fieldHasError('specialiteMission2')}
                          onPress={() => setAcademicField('specialiteMission2')}
                        />
                        <SelectField
                          label={t('setupSpecialite3Optional')}
                          value={labelFor(specialiteMission3, checkoutAcademicConfig.specialiteMission3.items)}
                          rtl={isRTL}
                          onPress={() => setAcademicField('specialiteMission3')}
                        />
                      </>
                    ) : null}
                  </>
                ) : null}
                <Field isRtl={isRTL} label={t('shopCheckoutLblStudentCity')} required>
                  <Pressable
                    onPress={() => setShowStudentVilleModal(true)}
                    style={[
                      styles.input,
                      styles.selectLike,
                      fieldHasError('studentCity') && styles.inputError,
                      isRTL && styles.rowRtl,
                    ]}
                  >
                    <Text
                      style={[styles.selectTxt, !selectedStudentVille && styles.selectTxtPlaceholder, isRTL && styles.txtRtl]}
                      numberOfLines={1}
                    >
                      {selectedStudentVille ? shopVilleListLabel(selectedStudentVille) : t('shopCheckoutPickCity')}
                    </Text>
                    <FontAwesome name="chevron-down" size={12} color={brand.textMuted} />
                  </Pressable>
                  {selectedStudentVille ? (
                    <Text style={[styles.metaHint, isRTL && styles.txtRtl]}>{studentVilleHintText}</Text>
                  ) : cartWideFreeShipping && hasPhysicalProducts ? (
                    <Text style={[styles.metaHint, isRTL && styles.txtRtl]}>{t('shopCheckoutStudentHintFreeShort')}</Text>
                  ) : null}
                </Field>
              </>
            ) : null}
          </SectionCard>

          {hasAnyService ? (
            <SectionCard
              isRtl={isRTL}
              title={t('shopCheckoutPaymentTitle')}
              desc={
                hasPhysicalProducts ? t('shopCheckoutPaymentDescMixed') : t('shopCheckoutPaymentDescServices')
              }
            >
              <Text style={[styles.label, isRTL && styles.txtRtl]}>
                {t('shopCheckoutPaymentTitle')}
                <Text style={styles.requiredMark}> *</Text>
              </Text>
              <View style={[styles.payGrid, fieldHasError('servicePayment') && styles.payGridError]}>
                {servicePaymentOptions.map((p) => {
                  const active = servicePayment === p.id;
                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => {
                        setServicePayment(p.id);
                        clearFieldError('servicePayment');
                      }}
                      style={({ pressed }) => [
                        styles.payCard,
                        isRTL && styles.rowRtl,
                        active && styles.payCardActive,
                        fieldHasError('servicePayment') && !active && styles.payCardError,
                        pressed && { opacity: 0.9 },
                      ]}
                    >
                      <FontAwesome name={p.icon} size={18} color={active ? brand.white : brand.primary} />
                      <Text style={[styles.payCardTxt, active && styles.payCardTxtActive, isRTL && styles.txtRtl]}>
                        {p.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </SectionCard>
          ) : null}

          {hasPhysicalProducts ? (
            <SectionCard isRtl={isRTL} title={t('shopCheckoutAddrTitle')} desc={t('shopCheckoutAddrDesc')}>
              <Field isRtl={isRTL} label={t('shopCheckoutLblCityShip')} required>
                <Pressable
                  onPress={() => {
                    setShowDeliveryVilleModal(true);
                  }}
                  style={[
                    styles.input,
                    styles.selectLike,
                    fieldHasError('deliveryCity') && styles.inputError,
                    isRTL && styles.rowRtl,
                  ]}
                >
                  <Text
                    style={[styles.selectTxt, !selectedVille && styles.selectTxtPlaceholder, isRTL && styles.txtRtl]}
                    numberOfLines={1}
                  >
                    {selectedVille ? shopVilleListLabel(selectedVille) : t('shopCheckoutPickCity')}
                  </Text>
                  <FontAwesome name="chevron-down" size={12} color={brand.textMuted} />
                </Pressable>
              </Field>
              {deliveryVilleMetaText ? (
                <Text style={[styles.metaHint, isRTL && styles.txtRtl]}>{deliveryVilleMetaText}</Text>
              ) : null}
              <Field isRtl={isRTL} label={t('shopCheckoutLblAddress')} required>
                <TextInput
                  style={[
                    styles.input,
                    styles.inputMulti,
                    fieldHasError('addressLine') && styles.inputError,
                    isRTL && styles.inputRtl,
                  ]}
                  value={addressLine}
                  onChangeText={(v) => {
                    setAddressLine(v);
                    clearFieldError('addressLine');
                  }}
                  placeholder={t('shopCheckoutPhAddress')}
                  placeholderTextColor={brand.textMuted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </Field>
            </SectionCard>
          ) : null}

          <SectionCard isRtl={isRTL} title={t('shopCheckoutNotesTitle')} desc={t('shopCheckoutNotesDesc')}>
            <TextInput
              style={[styles.input, styles.inputMulti, isRTL && styles.inputRtl]}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('shopCheckoutPhNotes')}
              placeholderTextColor={brand.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </SectionCard>

          <View style={styles.summaryCard}>
            <Text style={[styles.summaryTitle, isRTL && styles.txtRtl]}>{t('shopCheckoutRecapTitle')}</Text>
            {lines.map((l) => {
              const opts = shopPriceFormatOptsForCatalogOrCartLine(l);
              const lineTotal = shopParsePriceString(l.price) * l.quantity;
              const isSvc = isPlatformServiceCartLine(l);
              return (
                <View key={`${l.lineKind ?? 'shop'}-${l.productId}`} style={[styles.summaryLine, isRTL && styles.rowRtl]}>
                  {isSvc ? (
                    <PlatformServiceVisualThumb
                      brandIcon={l.platformServiceBrandIcon}
                      brandColor={l.platformServiceBrandColor}
                      size={44}
                      iconSize={20}
                    />
                  ) : (
                    <Image
                      source={{ uri: shopProductPrimaryImage(l.images) }}
                      style={styles.summaryLineImg}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.summaryLineTextCol}>
                    <Text style={[styles.summaryLineTitle, isRTL && styles.txtRtl]} numberOfLines={2}>
                      {l.title}
                    </Text>
                  </View>
                  <Text style={[styles.summaryLineMeta, isRTL && styles.txtRtl]}>× {l.quantity}</Text>
                  <Text style={[styles.summaryLineVal, isRTL && styles.summaryLineValRtl]}>
                    {formatShopPrice(String(lineTotal), l.currency, opts)}
                  </Text>
                </View>
              );
            })}
            <View style={styles.summaryDivider} />
            <View style={styles.promoBox}>
              <View style={[styles.promoTitleRow, isRTL && styles.rowRtl]}>
                <FontAwesome name="tag" size={14} color={brand.textMuted} />
                <Text style={[styles.promoTitle, isRTL && styles.txtRtl]}>{t('shopCheckoutPromoTitle')}</Text>
              </View>
              <Text style={[styles.promoHint, isRTL && styles.txtRtl]}>{t('shopCheckoutPromoHint')}</Text>
              <View style={[styles.promoInputRow, isRTL && styles.rowRtl]}>
                <TextInput
                  style={[styles.input, styles.promoInput, isRTL && styles.inputRtl]}
                  value={promoCode}
                  onChangeText={(v) => {
                    promoManualEditRef.current = true;
                    setPromoCode(v.toUpperCase());
                    if (promoDiscount > 0) {
                      setPromoDiscount(0);
                      setPromoMessage(null);
                    }
                  }}
                  placeholder={t('shopCheckoutPromoPh')}
                  placeholderTextColor={brand.textMuted}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
                <Pressable
                  onPress={() => void applyPromoCode()}
                  disabled={promoValidating}
                  style={({ pressed }) => [
                    styles.promoApplyBtn,
                    (promoValidating || pressed) && { opacity: 0.7 },
                  ]}
                >
                  {promoValidating ? (
                    <ActivityIndicator size="small" color={brand.primary} />
                  ) : (
                    <Text style={styles.promoApplyBtnTxt}>{t('shopCheckoutPromoApply')}</Text>
                  )}
                </Pressable>
                {(promoDiscount > 0 || promoCode.trim()) ? (
                  <Pressable onPress={clearPromo} style={styles.promoRemoveBtn}>
                    <Text style={styles.promoRemoveBtnTxt}>{t('shopCheckoutPromoRemove')}</Text>
                  </Pressable>
                ) : null}
              </View>
              {promoMessage ? (
                <Text
                  style={[
                    styles.promoFeedback,
                    isRTL && styles.txtRtl,
                    promoDiscount > 0 ? styles.promoFeedbackOk : styles.promoFeedbackErr,
                  ]}
                >
                  {promoMessage}
                </Text>
              ) : null}
            </View>
            <View style={styles.summaryDivider} />
            <View style={[styles.summaryRow, isRTL && styles.rowRtl]}>
              <Text style={[styles.summaryLbl, isRTL && styles.txtRtl]}>{t('shopCheckoutLblSubtotal')}</Text>
              <Text style={[styles.summaryVal, isRTL && styles.txtRtl]}>{formatShopPrice(String(subtotal), currency)}</Text>
            </View>
            {promoDiscount > 0 ? (
              <View style={[styles.summaryRow, isRTL && styles.rowRtl]}>
                <Text style={[styles.summaryLbl, styles.promoDiscountLbl, isRTL && styles.txtRtl]}>
                  {promoDiscountType === 'percent' && promoDiscountValue
                    ? t('shopCheckoutLblDiscountPercent')
                        .replace('{code}', promoCode)
                        .replace('{pct}', promoDiscountValue.replace(/\.00$/, ''))
                    : t('shopCheckoutLblDiscount').replace('{code}', promoCode)}
                </Text>
                <Text style={[styles.summaryVal, styles.promoDiscountVal, isRTL && styles.txtRtl]}>
                  −{formatShopPrice(String(promoDiscount), currency)}
                </Text>
              </View>
            ) : null}
            {promoDiscount > 0 && promoEligibleSubtotal != null && promoEligibleSubtotal < subtotal - 0.009 ? (
              <Text style={[styles.promoScopedHint, isRTL && styles.txtRtl]}>
                {t('shopCheckoutPromoScopedHint').replace(
                  '{base}',
                  formatShopPrice(String(promoEligibleSubtotal), currency),
                )}
              </Text>
            ) : null}
            {promoDiscount > 0 ? (
              <View style={[styles.summaryRow, isRTL && styles.rowRtl]}>
                <Text style={[styles.summaryLbl, isRTL && styles.txtRtl]}>{t('shopCheckoutLblArticlesNet')}</Text>
                <Text style={[styles.summaryVal, isRTL && styles.txtRtl]}>
                  {formatShopPrice(String(articlesAfterPromo), currency)}
                </Text>
              </View>
            ) : null}
            <View style={[styles.summaryRow, isRTL && styles.rowRtl]}>
              <Text style={[styles.summaryLbl, isRTL && styles.txtRtl]}>{t('shopCheckoutLblShipping')}</Text>
              <Text style={[styles.summaryVal, isRTL && styles.txtRtl]}>{shippingSummaryText}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={[styles.summaryRow, isRTL && styles.rowRtl]}>
              <Text style={[styles.summaryTotalLbl, isRTL && styles.txtRtl]}>{t('shopCheckoutLblTotal')}</Text>
              <Text style={[styles.summaryTotalVal, isRTL && styles.txtRtl]}>{formatShopPrice(String(total), currency)}</Text>
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
              isRTL && styles.rowRtl,
              (submitting || pressed) && { opacity: 0.85 },
            ]}
          >
            {submitting ? (
              <ActivityIndicator color={brand.white} />
            ) : (
              <>
                <FontAwesome name="lock" size={13} color={brand.white} />
                <Text style={[styles.confirmTxt, isRTL && styles.txtRtl]}>{t('shopCheckoutConfirmBtn')}</Text>
              </>
            )}
          </Pressable>
          <Text style={[styles.bottomDisclaimer, isRTL && styles.bottomDisclaimerRtl]}>{bottomDisclaimerText}</Text>
        </View>
      </KeyboardAvoidingView>

      <ShopVillePickerSheet
        visible={showDeliveryVilleModal}
        sheetTitle={t('shopCheckoutSheetCityShip')}
        selectedCheckCode={selectedVilleCheckCode}
        onClose={() => setShowDeliveryVilleModal(false)}
        onSelect={(v) => {
          setSelectedVilleCheckCode(v.checkCode);
          setCity(shopVilleListLabel(v));
          clearFieldError('deliveryCity');
          setShowDeliveryVilleModal(false);
        }}
      />
      <ShopVillePickerSheet
        visible={showStudentVilleModal}
        sheetTitle={t('shopCheckoutSheetCityResidence')}
        selectedCheckCode={studentVilleCheckCode}
        onClose={() => setShowStudentVilleModal(false)}
        onSelect={(v) => {
          setStudentVilleCheckCode(v.checkCode);
          setStudentCity(shopVilleListLabel(v));
          clearFieldError('studentCity');
          setShowStudentVilleModal(false);
        }}
      />
      {academicField ? (
        <SearchablePickSheet
          visible
          title={checkoutAcademicConfig[academicField].title}
          searchPlaceholder={t('setupCitySearchPlaceholder')}
          emptyLabel={t('accountSelectNoResults')}
          allLabel={t('accountSelectPlaceholder')}
          items={checkoutAcademicConfig[academicField].items}
          selectedValue={checkoutAcademicConfig[academicField].value}
          onPick={(v) => {
            const field = academicField;
            setAcademicField(null);
            if (!field) return;
            if (field === 'studyLevel') {
              setStudyLevel(v);
              clearFieldError('studyLevel');
              return;
            }
            if (field === 'bacType') {
              const next = (v === 'normal' || v === 'mission' ? v : '') as 'normal' | 'mission' | '';
              setBacType(next);
              clearFieldError('bacType');
              if (next === '') {
                setFiliere('');
                setSpecialiteMission1('');
                setSpecialiteMission2('');
                setSpecialiteMission3('');
              } else if (next === 'mission') {
                setFiliere('');
                clearFieldError('filiere');
              } else {
                setSpecialiteMission1('');
                setSpecialiteMission2('');
                setSpecialiteMission3('');
              }
              return;
            }
            if (field === 'filiere') {
              setFiliere(v);
              clearFieldError('filiere');
              return;
            }
            if (field === 'specialiteMission1') {
              setSpecialiteMission1(v);
              clearFieldError('specialiteMission1');
              return;
            }
            if (field === 'specialiteMission2') {
              setSpecialiteMission2(v);
              clearFieldError('specialiteMission2');
              return;
            }
            setSpecialiteMission3(v);
          }}
          onClose={() => setAcademicField(null)}
          rtl={isRTL}
        />
      ) : null}
    </SafeAreaView>
  );
}

function extractApiErrorMessage(raw: string): string {
  if (!raw) return '';
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
  isRtl,
  children,
}: {
  title: string;
  desc?: string;
  isRtl?: boolean;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, isRtl && styles.txtRtl]}>{title}</Text>
        {desc ? <Text style={[styles.sectionDesc, isRtl && styles.txtRtl]}>{desc}</Text> : null}
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Field({
  label,
  children,
  isRtl,
  required,
}: {
  label: string;
  children: ReactNode;
  isRtl?: boolean;
  required?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={[styles.label, isRtl && styles.txtRtl]}>
        {label}
        {required ? <Text style={styles.requiredMark}> *</Text> : null}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.backgroundSoft },
  rtlRoot: { direction: 'rtl' },
  rowRtl: { flexDirection: 'row-reverse' },
  txtRtl: { textAlign: 'right', writingDirection: 'rtl' },
  headerTxtRtl: { writingDirection: 'rtl', textAlign: 'center' },
  inputRtl: { textAlign: 'right', writingDirection: 'rtl' },
  summaryLineValRtl: { textAlign: 'left' },
  bottomDisclaimerRtl: { writingDirection: 'rtl', textAlign: 'center' },
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
  requiredMark: { color: '#DC2626', fontWeight: '800' },
  inputFieldError: {
    borderColor: '#DC2626',
    borderWidth: 2,
    backgroundColor: '#FEF2F2',
  },
  inputError: {
    borderColor: '#DC2626',
    borderWidth: 2,
    backgroundColor: '#FEF2F2',
  },
  payGridError: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 6,
    backgroundColor: '#FEF2F2',
  },
  payCardError: {
    borderColor: '#DC2626',
    borderWidth: 2,
    backgroundColor: '#FEF2F2',
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

  deliveryInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  deliveryInfoTxt: {
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: brand.textSecondary,
    fontWeight: '600',
  },
  metaHint: {
    fontSize: 11,
    lineHeight: 16,
    color: brand.textMuted,
    fontWeight: '600',
    marginTop: 4,
  },

  payGrid: { gap: 10 },
  payCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.border,
    backgroundColor: brand.backgroundSoft,
  },
  payCardActive: {
    backgroundColor: brand.primary,
    borderColor: brand.primary,
  },
  payCardTxt: { flex: 1, fontSize: fontSize.sm, fontWeight: '800', color: brand.text },
  payCardTxtActive: { color: brand.white },

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
  summaryLineImg: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: brand.backgroundSoft,
  },
  summaryLineTextCol: { flex: 1, minWidth: 0 },
  summaryLineTitle: { fontSize: 12, color: brand.text, fontWeight: '700' },
  summaryLineMeta: { fontSize: 11, color: brand.textMuted, fontWeight: '600' },
  summaryLineVal: { fontSize: 12, color: brand.primary, fontWeight: '800', minWidth: 80, textAlign: 'right' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLbl: { fontSize: fontSize.sm, color: brand.textSecondary },
  summaryVal: { fontSize: fontSize.sm, color: brand.text, fontWeight: '700' },
  summaryDivider: { height: 1, backgroundColor: brand.border, marginVertical: 4 },
  promoBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: brand.border,
    backgroundColor: brand.backgroundSoft,
    padding: spacing.md,
    gap: 8,
  },
  promoTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  promoTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: brand.textMuted,
    textTransform: 'uppercase',
  },
  promoHint: { fontSize: 11, lineHeight: 16, color: brand.textMuted, fontWeight: '600' },
  promoInputRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  promoInput: { flex: 1, minWidth: 120, minHeight: 42, paddingVertical: 10 },
  promoApplyBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.primary,
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoApplyBtnTxt: { fontSize: 12, fontWeight: '800', color: brand.primary },
  promoRemoveBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.border,
  },
  promoRemoveBtnTxt: { fontSize: 12, fontWeight: '700', color: brand.textSecondary },
  promoFeedback: { fontSize: 11, fontWeight: '600', lineHeight: 16 },
  promoFeedbackOk: { color: '#047857' },
  promoFeedbackErr: { color: '#991B1B' },
  promoDiscountLbl: { color: '#047857' },
  promoDiscountVal: { color: '#047857', fontWeight: '800' },
  promoScopedHint: { fontSize: fontSize.xs, color: brand.textMuted, marginTop: -4, marginBottom: 4, lineHeight: 16 },
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
