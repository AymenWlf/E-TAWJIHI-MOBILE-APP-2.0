import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SidebarMenuIconButton } from '@/components/SidebarMenuIconButton';
import {
  SearchablePickSheet,
  type SearchablePickItem,
} from '@/components/schools/SearchablePickSheet';
import { AppRefreshControl } from '@/components/ui/AppRefreshControl';
import { BirthDateField } from '@/components/ui/BirthDateField';
import { SelectField } from '@/components/ui/SelectField';
import { Text } from '@/components/ui/Text';
import {
  ANNEES_BAC_OPTIONS,
  BAC_TYPES,
  FILIERE_BAC_OPTIONS,
  type LabeledOption,
  NIVEAU_ETUDE_OPTIONS,
  SPECIALITES_MISSION,
} from '@/constants/academicSetup';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { invalidateEligibilityProfileCache } from '@/hooks/useEligibilityProfile';
import { listCities, type CityRow } from '@/services/referenceData';
import { getUserProfile, updateUserProfile, type UserProfile } from '@/services/userProfile';
import { fetchUserOrders, type UserOrderSummary } from '@/services/userOrders';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { homeShell } from '@/theme/homeShell';
import { formatOrderCreatedAtShort } from '@/utils/dateParis';
import { errorMessage } from '@/utils/errorMessage';
import { isValidEmail } from '@/utils/isValidEmail';

export default function CompteTabScreen() {
  const { user, getValidAccessToken, reloadMe, logout } = useAuth();
  const { t, isRTL, locale, setLocale } = useLocale();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [cities, setCities] = useState<CityRow[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [orders, setOrders] = useState<UserOrderSummary[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [form, setForm] = useState({
    /* Profil */
    nom: '',
    prenom: '',
    email: '',
    dateNaissance: '',
    genre: '',
    villeId: '',

    /* Académique */
    userType: '',
    niveau: '',
    bacType: '',
    filiere: '',
    bacAnnee: '',
    specialite1: '',
    specialite2: '',
    specialite3: '',
    diplomeEnCours: '',
    nomEtablissement: '',
    typeLycee: '',
    massarCode: '',
    studentCode: '',

    /* Tuteur */
    tuteur: '',
    nomTuteur: '',
    prenomTuteur: '',
    telTuteur: '',
    professionTuteur: '',
    adresseTuteur: '',
  });
  const [cityPickerOpen, setCityPickerOpen] = useState(false);

  /**
   * Champ académique en cours d'édition via le bottom-sheet de sélection.
   * Chaque clé correspond à un Pressable de la section "Infos académiques".
   * `null` ⇒ aucun sheet ouvert.
   */
  type AcademicField =
    | 'niveau'
    | 'bacType'
    | 'filiere'
    | 'bacAnnee'
    | 'specialite1'
    | 'specialite2'
    | 'specialite3'
    | 'typeLycee'
    | 'tuteur';
  const [academicField, setAcademicField] = useState<AcademicField | null>(null);

  const isLoggedIn = !!user;

  const cityLabel = useMemo(() => {
    if (!form.villeId) return '';
    const id = Number(form.villeId);
    const row = cities.find((c) => c.id === id);
    return row?.titre ?? '';
  }, [cities, form.villeId]);

  /** Items pour le bottom-sheet de sélection : valeur stockée = id (string), label = titre. */
  const cityPickerItems = useMemo<SearchablePickItem[]>(
    () =>
      cities.map((c) => ({
        id: String(c.id),
        value: String(c.id),
        label: c.titre,
        subtitle: c.region?.titre,
      })),
    [cities],
  );

  /**
   * Transforme une `LabeledOption[]` (constants/academicSetup) en items pour le sheet,
   * en filtrant l'entrée vide initiale (« Sélectionnez… ») et en respectant la locale.
   */
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

  /** Liste des relations Tuteur (Père/Mère/Autre) localisée. */
  const tuteurOptions = useMemo<LabeledOption[]>(
    () => [
      { value: 'Père', label: t('setupGuardianFather'), labelAr: 'الأب' },
      { value: 'Mère', label: t('setupGuardianMother'), labelAr: 'الأم' },
      { value: 'Autre', label: t('setupGuardianOther'), labelAr: 'أخرى' },
    ],
    [t],
  );

  /** Type de lycée localisé (Public/Privé). */
  const typeLyceeOptions = useMemo<LabeledOption[]>(
    () => [
      { value: 'public', label: t('setupPublic'), labelAr: 'عمومي' },
      { value: 'prive', label: t('setupPrivate'), labelAr: 'خصوصي' },
    ],
    [t],
  );

  /** Specialités (mêmes valeurs que setup), enveloppées en LabeledOption. */
  const specialiteOptions = useMemo<LabeledOption[]>(
    () => SPECIALITES_MISSION.map((s) => ({ value: s, label: s, labelAr: s })),
    [],
  );

  /** Pour chaque champ académique éditable, retourne (label, items, value courante). */
  const academicConfig = useMemo(
    () => ({
      niveau: {
        title: t('setupStudyLevel'),
        items: toPickItems(NIVEAU_ETUDE_OPTIONS),
        value: form.niveau,
      },
      bacType: {
        title: t('setupBacType'),
        items: BAC_TYPES.map((b) => ({ id: b.value, value: b.value, label: b.label })),
        value: form.bacType,
      },
      filiere: {
        title: t('setupFiliere'),
        items: toPickItems(FILIERE_BAC_OPTIONS),
        value: form.filiere,
      },
      bacAnnee: {
        title: t('setupBacAnnee'),
        items: toPickItems(ANNEES_BAC_OPTIONS),
        value: form.bacAnnee,
      },
      specialite1: {
        title: t('setupSpecialite1'),
        items: toPickItems(specialiteOptions),
        value: form.specialite1,
      },
      specialite2: {
        title: t('setupSpecialite2'),
        items: toPickItems(specialiteOptions),
        value: form.specialite2,
      },
      specialite3: {
        title: t('setupSpecialite3Optional'),
        items: toPickItems(specialiteOptions),
        value: form.specialite3,
      },
      typeLycee: {
        title: t('setupLyceeType'),
        items: toPickItems(typeLyceeOptions),
        value: form.typeLycee,
      },
      tuteur: {
        title: t('setupGuardian'),
        items: toPickItems(tuteurOptions),
        value: form.tuteur,
      },
    }),
    [t, toPickItems, form, specialiteOptions, typeLyceeOptions, tuteurOptions],
  );

  /**
   * Convertit une valeur stockée (FR) en libellé localisé.
   * Si la valeur n'est pas dans la liste, on retourne la valeur brute (utile
   * pour des valeurs historiques saisies manuellement).
   */
  const labelFor = useCallback(
    (value: string, items: SearchablePickItem[]): string => {
      if (!value) return '';
      const found = items.find((i) => i.value === value);
      return found?.label ?? value;
    },
    [],
  );

  const displayName = useMemo(() => {
    const n = (isRTL ? `${form.nom} ${form.prenom}` : `${form.prenom} ${form.nom}`).trim();
    if (n) return n;
    return user?.phone ?? user?.email ?? '';
  }, [form.nom, form.prenom, isRTL, user?.email, user?.phone]);

  /**
   * Le « Diplôme en cours » n'a de sens que pour les étudiants du supérieur
   * (BAC+1 à BAC+6 et Doctorat) — exactement comme dans le wizard d'inscription.
   * Pour les niveaux secondaires (1ère/2ème année du bac) ou « Autre », on
   * masque le champ pour ne pas polluer le formulaire.
   */
  const showDiplomeEnCours = useMemo(
    () =>
      ['BAC+1', 'BAC+2', 'BAC+3', 'BAC+4', 'BAC+5', 'BAC+6', 'Doctorant'].includes(
        form.niveau,
      ),
    [form.niveau],
  );

  const loadCities = useCallback(async () => {
    setCitiesLoading(true);
    try {
      const rows = await listCities(1000);
      setCities(rows);
    } finally {
      setCitiesLoading(false);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    if (!isLoggedIn) return;
    const token = await getValidAccessToken();
    if (!token) {
      setProfileLoaded(true);
      return;
    }
    setLoading(true);
    try {
      const p = await getUserProfile(token);
      setProfile(p);
      setForm({
        nom: p?.nom ?? '',
        prenom: p?.prenom ?? '',
        email: (p?.email ?? user?.email ?? '') || '',
        dateNaissance: p?.dateNaissance ?? '',
        genre: p?.genre ?? '',
        villeId: p?.ville?.id ? String(p.ville.id) : '',

        userType: p?.userType ?? '',
        niveau: p?.niveau ?? '',
        bacType: p?.bacType ?? '',
        filiere: p?.filiere ?? '',
        bacAnnee: p?.bacAnnee ?? '',
        specialite1: p?.specialite1 ?? '',
        specialite2: p?.specialite2 ?? '',
        specialite3: p?.specialite3 ?? '',
        diplomeEnCours: p?.diplomeEnCours ?? '',
        nomEtablissement: p?.nomEtablissement ?? '',
        typeLycee: p?.typeLycee ?? '',
        massarCode: p?.massarCode ?? '',
        studentCode: p?.studentCode ?? '',

        tuteur: p?.tuteur ?? '',
        nomTuteur: p?.nomTuteur ?? '',
        prenomTuteur: p?.prenomTuteur ?? '',
        telTuteur: p?.telTuteur ?? '',
        professionTuteur: p?.professionTuteur ?? '',
        adresseTuteur: p?.adresseTuteur ?? '',
      });
    } finally {
      setLoading(false);
      setProfileLoaded(true);
    }
  }, [getValidAccessToken, isLoggedIn, user?.email]);

  useEffect(() => {
    if (!isLoggedIn) {
      setProfileLoaded(false);
      setProfile(null);
      setOrders([]);
      setOrdersLoaded(false);
    }
  }, [isLoggedIn]);

  const loadOrders = useCallback(async () => {
    if (!isLoggedIn) return;
    const token = await getValidAccessToken();
    if (!token) { setOrdersLoaded(true); return; }
    setOrdersLoading(true);
    try {
      const rows = await fetchUserOrders(token);
      setOrders(rows);
    } finally {
      setOrdersLoading(false);
      setOrdersLoaded(true);
    }
  }, [getValidAccessToken, isLoggedIn]);

  useEffect(() => {
    void loadCities();
  }, [loadCities]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadCities(),
        isLoggedIn ? reloadMe() : Promise.resolve(),
        loadProfile(),
        loadOrders(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [loadCities, loadProfile, loadOrders, isLoggedIn, reloadMe]);

  const save = useCallback(async () => {
    if (!isLoggedIn) return;
    const token = await getValidAccessToken();
    if (!token) return;
    setLoading(true);
    try {
      const emailTrim = form.email.trim();
      if (!isValidEmail(emailTrim)) {
        Alert.alert(t('commonErrorTitle'), t('errInvalidEmail'));
        return;
      }
      const payload = {
        /* Profil */
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        email: emailTrim,
        dateNaissance: form.dateNaissance.trim(),
        genre: form.genre.trim(),
        ville: form.villeId || undefined,

        /* Académique */
        userType: form.userType.trim(),
        niveau: form.niveau.trim(),
        bacType: form.bacType.trim(),
        filiere: form.filiere.trim(),
        bacAnnee: form.bacAnnee.trim() || null,
        specialite1: form.specialite1.trim(),
        specialite2: form.specialite2.trim(),
        specialite3: form.specialite3.trim(),
        diplomeEnCours: form.diplomeEnCours.trim(),
        nomEtablissement: form.nomEtablissement.trim(),
        typeLycee: form.typeLycee.trim(),
        massarCode: form.massarCode.trim(),
        studentCode: form.studentCode.trim(),

        /* Tuteur */
        tuteur: form.tuteur.trim(),
        nomTuteur: form.nomTuteur.trim(),
        prenomTuteur: form.prenomTuteur.trim(),
        telTuteur: form.telTuteur.trim(),
        professionTuteur: form.professionTuteur.trim(),
        adresseTuteur: form.adresseTuteur.trim(),
      };
      const res = await updateUserProfile(token, payload);
      if (!res.success) throw new Error(res.message || 'Échec de mise à jour');
      // Le profil influence l'éligibilité (filière, année, etc.) — on invalide
      // le cache pour que les badges se mettent à jour immédiatement.
      invalidateEligibilityProfileCache();
      await reloadMe();
      await loadProfile();
      Alert.alert(t('accountUpdatedTitle'), t('accountUpdatedBody'));
    } catch (e: unknown) {
      Alert.alert(t('commonErrorTitle'), errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [form, getValidAccessToken, isLoggedIn, loadProfile, reloadMe, t]);

  const handleLogout = useCallback(() => {
    Alert.alert(t('accountLogoutTitle'), t('accountLogoutMessage'), [
      { text: t('accountLogoutCancel'), style: 'cancel' },
      {
        text: t('accountLogoutConfirm'),
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
          } catch (e: unknown) {
            Alert.alert(t('commonErrorTitle'), errorMessage(e));
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  }, [logout, t]);

  return (
    <View style={[styles.root, isRTL ? styles.rtl : styles.ltr]}>
      <StatusBar style="light" />
      <View style={[styles.headerSafe, { paddingTop: insets.top }]}>
        <View style={styles.hero}>
          <View style={[styles.heroTitleRow, isRTL && styles.heroTitleRowRtl]}>
            <SidebarMenuIconButton color="#FFFFFF" />
            <View style={styles.heroTitleCol}>
              <Text style={[styles.heroTitle, isRTL && styles.heroTitleRtl]}>{t('accountTitle')}</Text>
              <Text style={[styles.heroSub, isRTL && styles.heroSubRtl]} numberOfLines={2}>
                {t('accountSubtitle')}
              </Text>
            </View>
            <View
              style={[styles.langSwitch, isRTL && styles.langSwitchRtl]}
              accessibilityRole="tablist"
              accessibilityLabel={t('languageSwitcher')}>
              <Pressable
                onPress={() => setLocale('fr')}
                style={({ pressed }) => [
                  styles.langPill,
                  locale === 'fr' && styles.langPillActive,
                  pressed && styles.langPillPressed,
                ]}
                accessibilityRole="tab"
                accessibilityState={{ selected: locale === 'fr' }}>
                <Text style={[styles.langPillTxt, locale === 'fr' && styles.langPillTxtActive]}>{t('langFr')}</Text>
              </Pressable>
              <Pressable
                onPress={() => setLocale('ar')}
                style={({ pressed }) => [
                  styles.langPill,
                  locale === 'ar' && styles.langPillActive,
                  pressed && styles.langPillPressed,
                ]}
                accessibilityRole="tab"
                accessibilityState={{ selected: locale === 'ar' }}>
                <Text style={[styles.langPillTxt, locale === 'ar' && styles.langPillTxtActive]}>{t('langAr')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={[styles.scroll, isRTL ? styles.rtl : styles.ltr]}
        contentContainerStyle={[
          styles.scrollContent,
          isRTL && styles.scrollContentRtl,
          { paddingBottom: spacing.section + insets.bottom + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        {...(Platform.OS === 'ios' ? { contentInsetAdjustmentBehavior: 'never' as const } : {})}
        {...(Platform.OS === 'android' ? { overScrollMode: 'always' as const } : {})}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {!isLoggedIn ? (
          <>
            <View style={styles.card}>
              <View style={[styles.cardHead, isRTL && styles.cardHeadRtl]}>
                <View style={styles.cardHeadIcon}>
                  <FontAwesome name="user-circle" size={22} color={homeShell.blue} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.cardEyebrow, isRTL && styles.cardEyebrowRtl]}>{t('profile')}</Text>
                  <Text style={[styles.cardLead, isRTL && styles.txtRtl]}>{t('accountLoginCta')}</Text>
                </View>
              </View>
              <Link href="/login" asChild>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}>
                  <Text style={[styles.primaryBtnTxt, isRTL && styles.txtRtl]}>{t('accountLoginCta')}</Text>
                  <FontAwesome name={isRTL ? 'arrow-left' : 'arrow-right'} size={15} color={homeShell.text} />
                </Pressable>
              </Link>
            </View>
          </>
        ) : !profileLoaded && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator color={homeShell.blue} size="large" />
            <Text style={[styles.loadingHint, isRTL && styles.txtRtl]}>{t('setupLoading')}</Text>
          </View>
        ) : (
          <>
            <View style={[styles.identityCard, isRTL && styles.identityCardRtl]}>
              <View style={styles.avatarRing}>
                <FontAwesome name="user" size={28} color={homeShell.blue} />
              </View>
              <View style={[styles.identityTextCol, isRTL && styles.identityTextColRtl]}>
                <Text
                  style={[styles.identityName, isRTL && styles.identityNameRtl]}
                  numberOfLines={1}>
                  {displayName || '—'}
                </Text>
                <Text
                  style={[
                    styles.identityMeta,
                    styles.identityMetaLtr,
                    isRTL && styles.identityMetaAlignRtl,
                  ]}
                  numberOfLines={1}>
                  {user?.phone ?? user?.email ?? ''}
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHead}>
                <FontAwesome name="id-card-o" size={16} color={homeShell.greenDark} />
                <Text
                  style={[styles.sectionTitle, isRTL ? styles.sectionTitleRtl : styles.sectionTitleLtr]}>
                  {t('accountSectionProfile')}
                </Text>
              </View>

              <Field label={t('setupLastName')} rtl={isRTL}>
                <TextInput
                  value={form.nom}
                  onChangeText={(v) => setForm((s) => ({ ...s, nom: v }))}
                  placeholder={t('setupLastName')}
                  placeholderTextColor={homeShell.cardMuted}
                  textAlign={isRTL ? 'right' : 'left'}
                  style={[styles.input, isRTL && styles.inputRtl]}
                />
              </Field>

              <Field label={t('setupFirstName')} rtl={isRTL}>
                <TextInput
                  value={form.prenom}
                  onChangeText={(v) => setForm((s) => ({ ...s, prenom: v }))}
                  placeholder={t('setupFirstName')}
                  placeholderTextColor={homeShell.cardMuted}
                  textAlign={isRTL ? 'right' : 'left'}
                  style={[styles.input, isRTL && styles.inputRtl]}
                />
              </Field>

              <Field label={t('setupEmail')} rtl={isRTL}>
                <TextInput
                  value={form.email}
                  onChangeText={(v) => setForm((s) => ({ ...s, email: v }))}
                  placeholder={t('setupEmail')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={homeShell.cardMuted}
                  textAlign="left"
                  style={[styles.input, styles.inputForcedLtr]}
                />
              </Field>

              <Field label={t('setupBirthDate')} rtl={isRTL}>
                <BirthDateField
                  value={form.dateNaissance}
                  onChange={(v) => setForm((s) => ({ ...s, dateNaissance: v }))}
                  rtl={isRTL}
                  placeholder={t('setupBirthDatePlaceholder')}
                  modalTitle={t('setupBirthDate')}
                  cancelLabel={t('setupDateCancel')}
                  okLabel={t('setupDateOk')}
                />
              </Field>

              <Field label={t('setupGender')} hint={`${t('setupMale')} · ${t('setupFemale')}`} rtl={isRTL}>
                <TextInput
                  value={form.genre}
                  onChangeText={(v) => setForm((s) => ({ ...s, genre: v }))}
                  placeholder={t('setupGender')}
                  placeholderTextColor={homeShell.cardMuted}
                  textAlign={isRTL ? 'right' : 'left'}
                  style={[styles.input, isRTL && styles.inputRtl]}
                />
              </Field>

              <Field
                label={t('setupCity')}
                hint={citiesLoading ? t('accountCitiesLoading') : undefined}
                rtl={isRTL}>
                <Pressable
                  onPress={() => {
                    if (citiesLoading || cities.length === 0) return;
                    setCityPickerOpen(true);
                  }}
                  disabled={citiesLoading || cities.length === 0}
                  accessibilityRole="button"
                  accessibilityLabel={t('setupCityModalTitle')}
                  style={({ pressed }) => [
                    styles.input,
                    styles.cityPickerBtn,
                    isRTL && styles.cityPickerBtnRtl,
                    pressed && { opacity: 0.85 },
                    (citiesLoading || cities.length === 0) && { opacity: 0.6 },
                  ]}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.cityPickerTxt,
                      !cityLabel && styles.cityPickerTxtPlaceholder,
                      isRTL && styles.txtRtl,
                    ]}>
                    {cityLabel || t('accountCityPlaceholder')}
                  </Text>
                  <FontAwesome
                    name="chevron-down"
                    size={12}
                    color={homeShell.cardMuted}
                  />
                </Pressable>
              </Field>
            </View>

            {/* ──────────────── Section Académique ──────────────── */}
            <View style={styles.card}>
              <View style={styles.sectionHead}>
                <FontAwesome name="graduation-cap" size={16} color={homeShell.greenDark} />
                <Text
                  style={[styles.sectionTitle, isRTL ? styles.sectionTitleRtl : styles.sectionTitleLtr]}>
                  {t('accountSectionAcademic')}
                </Text>
              </View>

              <SelectField
                label={t('setupStudyLevel')}
                value={labelFor(form.niveau, academicConfig.niveau.items)}
                rtl={isRTL}
                onPress={() => setAcademicField('niveau')}
              />

              <SelectField
                label={t('setupBacType')}
                value={labelFor(form.bacType, academicConfig.bacType.items)}
                rtl={isRTL}
                onPress={() => setAcademicField('bacType')}
              />

              {form.bacType === 'normal' ? (
                <SelectField
                  label={t('setupFiliere')}
                  value={labelFor(form.filiere, academicConfig.filiere.items)}
                  rtl={isRTL}
                  onPress={() => setAcademicField('filiere')}
                />
              ) : null}

              {form.bacType === 'mission' ? (
                <>
                  <SelectField
                    label={t('setupSpecialite1')}
                    value={labelFor(form.specialite1, academicConfig.specialite1.items)}
                    rtl={isRTL}
                    onPress={() => setAcademicField('specialite1')}
                  />
                  <SelectField
                    label={t('setupSpecialite2')}
                    value={labelFor(form.specialite2, academicConfig.specialite2.items)}
                    rtl={isRTL}
                    onPress={() => setAcademicField('specialite2')}
                  />
                  <SelectField
                    label={t('setupSpecialite3Optional')}
                    value={labelFor(form.specialite3, academicConfig.specialite3.items)}
                    rtl={isRTL}
                    onPress={() => setAcademicField('specialite3')}
                  />
                  <Field label={t('accountStudentCode')} hint={t('accountStudentCodeHint')} rtl={isRTL}>
                    <TextInput
                      value={form.studentCode}
                      onChangeText={(v) => setForm((s) => ({ ...s, studentCode: v }))}
                      placeholder={t('accountStudentCode')}
                      placeholderTextColor={homeShell.cardMuted}
                      autoCapitalize="none"
                      autoCorrect={false}
                      textAlign={isRTL ? 'right' : 'left'}
                      style={[styles.input, isRTL && styles.inputRtl]}
                    />
                  </Field>
                </>
              ) : null}

              {form.bacType === 'normal' ? (
                <Field label={t('accountMassarCode')} hint={t('accountMassarCodeHint')} rtl={isRTL}>
                  <TextInput
                    value={form.massarCode}
                    onChangeText={(v) => setForm((s) => ({ ...s, massarCode: v }))}
                    placeholder={t('accountMassarCode')}
                    placeholderTextColor={homeShell.cardMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textAlign={isRTL ? 'right' : 'left'}
                    style={[styles.input, isRTL && styles.inputRtl]}
                  />
                </Field>
              ) : null}

              {form.bacType ? (
                <SelectField
                  label={t('setupBacAnnee')}
                  hint={t('setupBacAnneeHelp')}
                  value={form.bacAnnee}
                  rtl={isRTL}
                  onPress={() => setAcademicField('bacAnnee')}
                />
              ) : null}

              {showDiplomeEnCours ? (
                <Field label={t('setupDiplomeEnCours')} rtl={isRTL}>
                  <TextInput
                    value={form.diplomeEnCours}
                    onChangeText={(v) => setForm((s) => ({ ...s, diplomeEnCours: v }))}
                    placeholder="Ex: Licence, Master..."
                    placeholderTextColor={homeShell.cardMuted}
                    textAlign={isRTL ? 'right' : 'left'}
                    style={[styles.input, isRTL && styles.inputRtl]}
                  />
                </Field>
              ) : null}

              <Field label={t('setupEtablissement')} rtl={isRTL}>
                <TextInput
                  value={form.nomEtablissement}
                  onChangeText={(v) => setForm((s) => ({ ...s, nomEtablissement: v }))}
                  placeholder={t('setupEtablissement')}
                  placeholderTextColor={homeShell.cardMuted}
                  textAlign={isRTL ? 'right' : 'left'}
                  style={[styles.input, isRTL && styles.inputRtl]}
                />
              </Field>

              <SelectField
                label={t('setupLyceeType')}
                value={labelFor(form.typeLycee, academicConfig.typeLycee.items)}
                rtl={isRTL}
                onPress={() => setAcademicField('typeLycee')}
              />
            </View>

            {/* ──────────────── Section Tuteur ──────────────── */}
            <View style={styles.card}>
              <View style={styles.sectionHead}>
                <FontAwesome name="users" size={16} color={homeShell.greenDark} />
                <Text
                  style={[styles.sectionTitle, isRTL ? styles.sectionTitleRtl : styles.sectionTitleLtr]}>
                  {t('accountSectionTutor')}
                </Text>
              </View>

              <SelectField
                label={t('setupGuardian')}
                value={labelFor(form.tuteur, academicConfig.tuteur.items)}
                rtl={isRTL}
                onPress={() => setAcademicField('tuteur')}
              />

              <Field label={t('setupGuardianLastName')} rtl={isRTL}>
                <TextInput
                  value={form.nomTuteur}
                  onChangeText={(v) => setForm((s) => ({ ...s, nomTuteur: v }))}
                  placeholder={t('setupGuardianLastName')}
                  placeholderTextColor={homeShell.cardMuted}
                  textAlign={isRTL ? 'right' : 'left'}
                  style={[styles.input, isRTL && styles.inputRtl]}
                />
              </Field>

              <Field label={t('setupGuardianFirstName')} rtl={isRTL}>
                <TextInput
                  value={form.prenomTuteur}
                  onChangeText={(v) => setForm((s) => ({ ...s, prenomTuteur: v }))}
                  placeholder={t('setupGuardianFirstName')}
                  placeholderTextColor={homeShell.cardMuted}
                  textAlign={isRTL ? 'right' : 'left'}
                  style={[styles.input, isRTL && styles.inputRtl]}
                />
              </Field>

              <Field label={t('setupGuardianPhone')} rtl={isRTL}>
                <TextInput
                  value={form.telTuteur}
                  onChangeText={(v) => setForm((s) => ({ ...s, telTuteur: v }))}
                  placeholder={t('setupGuardianPhone')}
                  keyboardType="phone-pad"
                  placeholderTextColor={homeShell.cardMuted}
                  textAlign="left"
                  style={[styles.input, styles.inputForcedLtr]}
                />
              </Field>

              <Field label={t('setupGuardianJob')} rtl={isRTL}>
                <TextInput
                  value={form.professionTuteur}
                  onChangeText={(v) => setForm((s) => ({ ...s, professionTuteur: v }))}
                  placeholder={t('setupGuardianJob')}
                  placeholderTextColor={homeShell.cardMuted}
                  textAlign={isRTL ? 'right' : 'left'}
                  style={[styles.input, isRTL && styles.inputRtl]}
                />
              </Field>

              <Field label={t('setupGuardianAddress')} rtl={isRTL}>
                <TextInput
                  value={form.adresseTuteur}
                  onChangeText={(v) => setForm((s) => ({ ...s, adresseTuteur: v }))}
                  placeholder={t('setupGuardianAddress')}
                  placeholderTextColor={homeShell.cardMuted}
                  textAlign={isRTL ? 'right' : 'left'}
                  multiline
                  style={[styles.input, isRTL && styles.inputRtl]}
                />
              </Field>
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHead}>
                <FontAwesome name="lock" size={16} color={homeShell.greenDark} />
                <Text
                  style={[styles.sectionTitle, isRTL ? styles.sectionTitleRtl : styles.sectionTitleLtr]}>
                  {t('accountSectionAccount')}
                </Text>
              </View>
              <InfoRow
                first
                icon="phone"
                label={t('accountPhone')}
                value={user?.phone ?? '—'}
                rtl={isRTL}
                valueDirection="ltr"
              />
              <InfoRow
                icon="check-circle"
                label={t('accountSetupStatus')}
                value={user?.is_setup ? t('accountSetupComplete') : t('accountSetupIncomplete')}
                rtl={isRTL}
                valueDirection="locale"
                valueTone={user?.is_setup ? 'ok' : 'muted'}
              />
            </View>

            <View style={styles.card}>
              <View style={[styles.sectionHead, isRTL && styles.sectionHeadRtl]}>
                <FontAwesome name="shopping-bag" size={16} color={homeShell.greenDark} />
                <Text style={[styles.sectionTitle, isRTL ? styles.sectionTitleRtl : styles.sectionTitleLtr]}>
                  {t('accountSectionOrders')}
                </Text>
              </View>

              {ordersLoading && !ordersLoaded ? (
                <View style={styles.ordersCenter}>
                  <ActivityIndicator color={homeShell.blue} size="small" />
                  <Text style={[styles.ordersHint, isRTL && styles.txtRtl]}>{t('accountOrdersLoading')}</Text>
                </View>
              ) : orders.length === 0 ? (
                <View style={styles.ordersCenter}>
                  <FontAwesome name="inbox" size={28} color={homeShell.borderOnWhite} />
                  <Text style={[styles.ordersHint, isRTL && styles.txtRtl]}>{t('accountOrdersEmpty')}</Text>
                </View>
              ) : (
                orders.map((order, idx) => (
                  <OrderRow
                    key={order.publicId}
                    order={order}
                    rtl={isRTL}
                    locale={locale}
                    first={idx === 0}
                  />
                ))
              )}
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={save}
              disabled={loading}
              style={({ pressed }) => [
                styles.primaryBtn,
                styles.primaryBtnWide,
                (loading || pressed) && { opacity: loading ? 0.75 : 0.92 },
              ]}>
              {loading ? (
                <ActivityIndicator color={homeShell.text} />
              ) : (
                <>
                  <FontAwesome name="save" size={16} color={homeShell.text} />
                  <Text style={[styles.primaryBtnTxt, isRTL && styles.txtRtl]}>{t('accountSave')}</Text>
                </>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('accountLogoutConfirm')}
              onPress={handleLogout}
              disabled={loggingOut}
              style={({ pressed }) => [
                styles.logoutBtn,
                (loggingOut || pressed) && { opacity: 0.88 },
              ]}>
              {loggingOut ? (
                <ActivityIndicator color={brand.error} />
              ) : (
                <>
                  <FontAwesome name="sign-out" size={16} color={brand.error} />
                  <Text style={[styles.logoutBtnTxt, isRTL && styles.txtRtl]}>{t('accountLogoutConfirm')}</Text>
                </>
              )}
            </Pressable>
          </>
        )}
      </ScrollView>

      {/* ── City picker (bottom-sheet searchable, partagé avec /ecoles & filtres) ── */}
      <SearchablePickSheet
        visible={cityPickerOpen}
        title={t('setupCityModalTitle')}
        searchPlaceholder={t('setupCitySearchPlaceholder')}
        emptyLabel={t('setupCityNoResults')}
        allLabel={t('accountCityPlaceholder')}
        items={cityPickerItems}
        selectedValue={form.villeId}
        onPick={(v) => setForm((s) => ({ ...s, villeId: v }))}
        onClose={() => setCityPickerOpen(false)}
        rtl={isRTL}
      />

      {academicField ? (
        <SearchablePickSheet
          visible
          title={academicConfig[academicField].title}
          searchPlaceholder={t('setupCitySearchPlaceholder')}
          emptyLabel={t('accountSelectNoResults')}
          allLabel={t('accountSelectPlaceholder')}
          items={academicConfig[academicField].items}
          selectedValue={academicConfig[academicField].value}
          onPick={(v) => {
            // Le sheet retourne '' quand on appuie sur "Tout" → désélection.
            const cleanField = academicField; // capture pour la closure
            setForm((s) => ({ ...s, [cleanField]: v }));
            // Si on change le type de bac, on nettoie les champs incompatibles
            if (cleanField === 'bacType') {
              setForm((s) => ({
                ...s,
                bacType: v,
                ...(v === 'normal'
                  ? { specialite1: '', specialite2: '', specialite3: '', studentCode: '' }
                  : {}),
                ...(v === 'mission' ? { filiere: '', massarCode: '' } : {}),
                ...(!v || v === '' ? { massarCode: '', studentCode: '' } : {}),
              }));
            }
            // Si le niveau change et n'est plus un niveau post-bac, on
            // efface « diplôme en cours » pour éviter de conserver une
            // valeur orpheline en base.
            if (cleanField === 'niveau') {
              const isHigher = ['BAC+1', 'BAC+2', 'BAC+3', 'BAC+4', 'BAC+5', 'BAC+6', 'Doctorant'].includes(v);
              if (!isHigher) setForm((s) => ({ ...s, diplomeEnCours: '' }));
            }
          }}
          onClose={() => setAcademicField(null)}
          rtl={isRTL}
        />
      ) : null}
    </View>
  );
}

// ─── Order status helper ────────────────────────────────────────────────────

function orderStatusConfig(
  status: string,
  locale: string,
): { label: string; color: string; bg: string } {
  const ar = locale === 'ar';
  switch (status.toLowerCase()) {
    case 'pending':
      return { label: ar ? 'قيد الانتظار' : 'En attente', color: '#92400E', bg: '#FEF3C7' };
    case 'confirmed':
      return { label: ar ? 'مؤكدة' : 'Confirmée', color: homeShell.blue, bg: '#EFF6FF' };
    case 'processing':
      return { label: ar ? 'قيد التجهيز' : 'En préparation', color: homeShell.blue, bg: '#DBEAFE' };
    case 'shipped':
      return { label: ar ? 'تم الشحن' : 'Expédiée', color: '#1D4ED8', bg: '#DBEAFE' };
    case 'delivered':
      return { label: ar ? 'تم التسليم' : 'Livrée', color: homeShell.greenDark, bg: '#DCFCE7' };
    case 'cancelled':
      return { label: ar ? 'ملغاة' : 'Annulée', color: brand.error, bg: '#FEE2E2' };
    case 'refunded':
      return { label: ar ? 'مسترجعة' : 'Remboursée', color: brand.textMuted, bg: '#F1F5F9' };
    default:
      return { label: status, color: brand.textMuted, bg: '#F1F5F9' };
  }
}

// ─── OrderRow ───────────────────────────────────────────────────────────────

function OrderRow({
  order,
  rtl,
  locale,
  first,
}: {
  order: UserOrderSummary;
  rtl: boolean;
  locale: string;
  first: boolean;
}) {
  const cfg = orderStatusConfig(order.status, locale);
  const dateStr = formatOrderCreatedAtShort(order.createdAt, locale);

  return (
    <View style={[styles.orderRow, first && styles.orderRowFirst, rtl && styles.orderRowRtl]}>
      <View style={styles.orderIconWrap}>
        <FontAwesome name="shopping-bag" size={13} color={homeShell.cardMuted} />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        {/* top line: order number + date */}
        <View style={[styles.orderTopLine, rtl && styles.orderTopLineRtl]}>
          <Text style={styles.orderNumber} numberOfLines={1}>
            {`N° ${order.orderNumber}`}
          </Text>
          <Text style={styles.orderDate}>{dateStr}</Text>
        </View>
        {/* product summary */}
        {order.firstItemTitle ? (
          <View style={styles.fieldLabelRow}>
            <Text style={[styles.orderItemTitle, rtl && styles.txtRtl]} numberOfLines={1}>
              {order.firstItemTitle}
              {order.itemsCount > 1 ? `  +${order.itemsCount - 1}` : ''}
            </Text>
          </View>
        ) : null}
        {/* bottom line: total + badge */}
        <View style={[styles.orderBottomLine, rtl && styles.orderBottomLineRtl]}>
          <Text style={styles.orderTotal}>
            {order.total} {order.currency}
          </Text>
          <View style={[styles.orderStatusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.orderStatusTxt, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Field ──────────────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  rtl,
  children,
}: {
  label: string;
  hint?: string;
  rtl: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      {/* row wrapper gives Text a definite width so textAlign works — same pattern as sectionHead/sectionTitle */}
      <View style={styles.fieldLabelRow}>
        <Text style={[styles.fieldLabel, rtl ? styles.fieldLabelRtl : styles.fieldLabelLtr]}>
          {label}
        </Text>
      </View>
      <View style={[styles.inputShell, rtl && styles.inputShellRtl]}>{children}</View>
      {hint ? (
        <View style={styles.fieldLabelRow}>
          <Text
            style={[styles.fieldHint, rtl ? styles.fieldHintRtl : styles.fieldHintLtr]}
            numberOfLines={2}>
            {hint}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function InfoRow({
  first,
  icon,
  label,
  value,
  rtl,
  valueTone = 'default',
  valueDirection = 'locale',
}: {
  first?: boolean;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  value: string;
  rtl: boolean;
  valueTone?: 'default' | 'ok' | 'muted';
  valueDirection?: 'locale' | 'ltr';
}) {
  const valStyle =
    valueTone === 'ok'
      ? styles.infoValOk
      : valueTone === 'muted'
        ? styles.infoValMuted
        : styles.infoVal;
  const valWriting =
    valueDirection === 'ltr' ? styles.infoValForcedLtr : rtl ? styles.txtRtl : undefined;
  return (
    <View style={[styles.infoRow, first && styles.infoRowFirst, rtl && styles.infoRowRtl]}>
      <View style={[styles.infoIconWrap, rtl && styles.infoIconWrapRtl]}>
        <FontAwesome name={icon} size={14} color={homeShell.cardMuted} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.fieldLabelRow}>
          <Text style={[styles.infoLbl, rtl && styles.infoLblRtl]}>{label}</Text>
        </View>
        <View style={styles.fieldLabelRow}>
          <Text style={[valStyle, valWriting]} numberOfLines={2}>
            {value}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  ltr: { direction: 'ltr' },
  rtl: { direction: 'rtl' },
  headerSafe: {
    backgroundColor: homeShell.bg,
    zIndex: 10,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  hero: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  heroTitleRowRtl: {
    flexDirection: 'row-reverse',
  },
  heroTitleCol: { flex: 1, minWidth: 0 },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: homeShell.text,
    letterSpacing: -0.5,
  },
  heroTitleRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  heroSub: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm + 1,
    fontWeight: '600',
    color: homeShell.textMuted,
    lineHeight: 20,
  },
  heroSubRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  langSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full,
    padding: 3,
    alignSelf: 'flex-start',
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
    color: homeShell.text,
  },
  scroll: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    flexGrow: 1,
  },
  /** Renforce l’alignement du contenu scrollé en RTL (Android + iOS). */
  scrollContentRtl: {
    direction: 'rtl',
    alignItems: 'stretch',
  },
  txtRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  center: {
    paddingVertical: spacing.xxl * 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingHint: {
    color: homeShell.cardMuted,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
  card: {
    backgroundColor: homeShell.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: spacing.lg,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  cardHeadRtl: {
    flexDirection: 'row-reverse',
  },
  cardHeadIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: homeShell.greenAlpha11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: homeShell.greenAlpha28,
  },
  cardEyebrow: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: homeShell.blue,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  cardEyebrowRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
    textTransform: 'none',
    letterSpacing: 0,
  },
  cardLead: {
    marginTop: 4,
    fontSize: fontSize.md,
    fontWeight: '700',
    color: homeShell.cardText,
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: homeShell.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(47,206,148,0.22)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  identityCardRtl: {
    flexDirection: 'row-reverse',
  },
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: homeShell.greenAlpha11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: homeShell.greenAlpha28,
  },
  identityName: {
    width: '100%',
    fontSize: fontSize.lg,
    fontWeight: '900',
    color: homeShell.cardText,
  },
  identityTextCol: {
    flex: 1,
    minWidth: 0,
  },
  identityTextColRtl: {
    alignItems: 'flex-end',
  },
  identityNameRtl: {
    width: '100%',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  identityMeta: {
    marginTop: 4,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: homeShell.cardMuted,
  },
  identityMetaLtr: {
    writingDirection: 'ltr',
  },
  identityMetaAlignRtl: {
    width: '100%',
    textAlign: 'right',
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    width: '100%',
  },
  sectionHeadRtl: {
    flexDirection: 'row-reverse',
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '900',
    color: homeShell.cardText,
    flex: 1,
    minWidth: 0,
  },
  sectionTitleLtr: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  sectionTitleRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  field: {
    marginTop: spacing.md,
  },
  fieldLabelRow: {
    flexDirection: 'row',
  },
  fieldLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: homeShell.blue,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  fieldLabelLtr: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  fieldLabelRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
    textTransform: 'none',
    letterSpacing: 0,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  inputShellRtl: {
    flexDirection: 'row-reverse',
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    color: homeShell.cardText,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  inputRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputForcedLtr: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  cityPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cityPickerBtnRtl: {
    flexDirection: 'row-reverse',
  },
  cityPickerTxt: {
    flex: 1,
    minWidth: 0,
    color: homeShell.cardText,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  cityPickerTxtPlaceholder: {
    color: homeShell.cardMuted,
    fontWeight: '500',
  },
  fieldHint: {
    flex: 1,
    minWidth: 0,
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    color: homeShell.cardMuted,
    fontWeight: '600',
  },
  fieldHintLtr: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  fieldHintRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(15,23,42,0.08)',
    gap: spacing.sm,
  },
  infoRowFirst: {
    borderTopWidth: 0,
    paddingTop: 0,
  },
  infoRowRtl: {
    flexDirection: 'row-reverse',
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconWrapRtl: {},
  infoLbl: {
    flex: 1,
    minWidth: 0,
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: homeShell.cardMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
  },
  infoLblRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
    textTransform: 'none',
    letterSpacing: 0,
  },
  infoVal: {
    flex: 1,
    minWidth: 0,
    marginTop: 4,
    fontSize: fontSize.md,
    fontWeight: '700',
    color: homeShell.cardText,
  },
  infoValOk: {
    flex: 1,
    minWidth: 0,
    marginTop: 4,
    fontSize: fontSize.md,
    fontWeight: '800',
    color: homeShell.greenDark,
  },
  infoValMuted: {
    flex: 1,
    minWidth: 0,
    marginTop: 4,
    fontSize: fontSize.md,
    fontWeight: '800',
    color: brand.warning,
  },
  infoValForcedLtr: {
    writingDirection: 'ltr',
    textAlign: 'left',
  },
  ordersCenter: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  ordersHint: {
    fontSize: fontSize.sm,
    color: homeShell.cardMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(15,23,42,0.08)',
    gap: spacing.sm,
  },
  orderRowFirst: {
    borderTopWidth: 0,
    paddingTop: 0,
  },
  orderRowRtl: {
    flexDirection: 'row-reverse',
  },
  orderIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  orderTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  orderTopLineRtl: {
    flexDirection: 'row-reverse',
  },
  orderNumber: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: homeShell.cardText,
    writingDirection: 'ltr',
  },
  orderDate: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: homeShell.cardMuted,
    writingDirection: 'ltr',
  },
  orderItemTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: homeShell.cardMuted,
  },
  orderBottomLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: 2,
  },
  orderBottomLineRtl: {
    flexDirection: 'row-reverse',
  },
  orderTotal: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: homeShell.cardText,
    writingDirection: 'ltr',
  },
  orderStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  orderStatusTxt: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: homeShell.blue,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
  },
  primaryBtnWide: {
    marginTop: spacing.xs,
  },
  primaryBtnPressed: {
    opacity: 0.92,
  },
  primaryBtnTxt: {
    color: homeShell.text,
    fontSize: fontSize.md,
    fontWeight: '900',
  },
  logoutBtn: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radius.full,
    backgroundColor: homeShell.card,
    borderWidth: 1.5,
    borderColor: brand.error,
  },
  logoutBtnTxt: {
    color: brand.error,
    fontSize: fontSize.md,
    fontWeight: '900',
  },
});
