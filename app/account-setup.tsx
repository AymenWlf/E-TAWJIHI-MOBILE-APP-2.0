import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { type ComponentProps, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  SearchablePickSheet,
  type SearchablePickItem,
} from '@/components/schools/SearchablePickSheet';
import { HeroLangSwitch } from '@/components/ui/HeroLangSwitch';
import { SelectField } from '@/components/ui/SelectField';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import {
  BAC_TYPES,
  type LabeledOption,
  NIVEAU_ETUDE_OPTIONS,
  SPECIALITES_MISSION,
} from '@/constants/academicSetup';
import { isValidOrientation1BacFiliereId } from '@/constants/orientation1bacFilieres';
import {
  filiereOptionsForNiveau,
  isPremiereBacNiveau,
  resolveFiliereDisplayLabel,
  sanitizeFiliereForNiveau,
} from '@/utils/academicFiliere';
import { anneesBacOptionsForLocale } from '@/utils/bacSchoolYearLabels';
import { listCities, type CityRow } from '@/services/referenceData';
import { completeAccountSetup, type AccountSetupPayload } from '@/services/accountSetup';
import { promptNotificationPermissionAfterAuth } from '@/services/pushNotifications';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { errorMessage } from '@/utils/errorMessage';
import { isValidEmail } from '@/utils/isValidEmail';

const BLUE = brand.primary;

type StepId = 1 | 2;
const TOTAL_STEPS: StepId[] = [1, 2];
const LAST_SETUP_STEP = TOTAL_STEPS[TOTAL_STEPS.length - 1];

type SetupPickField =
  | 'userType'
  | 'niveau'
  | 'bacType'
  | 'filiere'
  | 'bacAnnee'
  | 'specialite1'
  | 'specialite2'
  | 'specialite3'
  | 'typeLycee'
  | 'genre'
  | 'ville';

function stepMeta(step: StepId, t: (k: any) => string) {
  switch (step) {
    case 1:
      return { icon: 'graduation-cap' as const, title: t('setupStep1Title'), sub: t('setupStep1Sub') };
    case 2:
      return { icon: 'user' as const, title: t('setupStep3Title'), sub: t('setupStep3Sub') };
  }
}

function formatDateYMD(d: Date): string {
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateDMY(d: Date): string {
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}-${mm}-${yyyy}`;
}

function parseYMD(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y, mo - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

const FR_MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
const AR_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];
const FR_WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const AR_WEEKDAYS = ['ن', 'ث', 'ر', 'خ', 'ج', 'س', 'ح'];

const INPUT_PLACEHOLDER_RGBA = 'rgba(100,116,139,0.65)';

/** Couleurs littérales pour les worklets Reanimated. */
const SHELL_BG_IDLE = '#F1F5F9';
const SHELL_BG_ACTIVE = '#FFFFFF';
const SHELL_BORDER_IDLE = '#CDD7E3';

type FieldShellProps = { focused: boolean; children: ReactNode };

/** Bordure, fond et ombre interpolés au focus (transition continue). */
function AnimatedFieldShell({ focused, children }: FieldShellProps) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(focused ? 1 : 0, {
      duration: 280,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [focused]);

  const shellStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(t.value, [0, 1], [SHELL_BG_IDLE, SHELL_BG_ACTIVE]),
    borderColor: interpolateColor(t.value, [0, 1], [SHELL_BORDER_IDLE, BLUE]),
    shadowOpacity: 0.06 + t.value * 0.2,
    shadowRadius: 6 + t.value * 16,
    shadowOffset: { width: 0, height: 2 + t.value * 4 },
    shadowColor: 'rgba(51,62,143,0.28)',
    transform: [{ scale: 1 + t.value * 0.01 }],
  }));

  return (
    <Animated.View
      style={[
        styles.fieldShellBase,
        shellStyle,
        Platform.OS === 'android' && focused ? styles.fieldShellElevated : null,
      ]}
    >
      {children}
    </Animated.View>
  );
}

type SetupTextInputProps = ComponentProps<typeof TextInput> & { rtl?: boolean };

/** Champ avec coque animée — tap hors zone de texte recentre le focus. */
function SetupTextInput({
  rtl,
  style,
  onFocus,
  onBlur,
  placeholderTextColor,
  ...rest
}: SetupTextInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessible={false}
      onPress={() => inputRef.current?.focus()}
      style={styles.fieldPressable}
      android_ripple={{ color: 'rgba(51,62,143,0.06)', foreground: false }}
    >
      <AnimatedFieldShell focused={focused}>
        <TextInput
          ref={inputRef}
          {...rest}
          placeholderTextColor={placeholderTextColor ?? INPUT_PLACEHOLDER_RGBA}
          selectionColor={BLUE}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.inputInner, rtl && styles.rtl, style]}
        />
      </AnimatedFieldShell>
    </Pressable>
  );
}

export default function AccountSetupScreen() {
  const { isRTL, locale, t } = useLocale();
  const rtl = isRTL;
  const bacLocale = locale === 'ar' ? 'ar' : 'fr';
  const anneesBacOptions = useMemo(() => anneesBacOptionsForLocale(bacLocale), [bacLocale]);
  const { user, getValidAccessToken, reloadMe } = useAuth();

  const scrollRef = useRef<ScrollView>(null);
  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCities, setLoadingCities] = useState(true);
  const [cities, setCities] = useState<CityRow[]>([]);
  const [serverError, setServerError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickField, setPickField] = useState<SetupPickField | null>(null);

  const [data, setData] = useState<AccountSetupPayload>({
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
    typeEcolePrefere: [],
    servicesPrefere: [],
    nom: '',
    prenom: '',
    email: '',
    dateNaissance: '',
    genre: '',
    ville: '',
    tuteur: '',
    nomTuteur: '',
    prenomTuteur: '',
    telTuteur: '',
    professionTuteur: '',
    adresseTuteur: '',
    consentContact: false,
  });

  const birthDate = useMemo(() => parseYMD(data.dateNaissance), [data.dateNaissance]);
  const birthDateDisplay = useMemo(
    () => (birthDate ? formatDateDMY(birthDate) : ''),
    [birthDate],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await listCities(1000);
        if (!cancelled) setCities(rows);
      } finally {
        if (!cancelled) setLoadingCities(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (user?.is_setup) {
      router.replace('/(tabs)');
    }
  }, [user?.is_setup]);


  const progressLabel = useMemo(() => {
    return `${t('setupStepPrefix')} ${currentStep} / ${TOTAL_STEPS.length}`;
  }, [currentStep, t]);

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(currentStep / TOTAL_STEPS.length, { duration: 420, easing: Easing.out(Easing.cubic) });
  }, [currentStep, progress]);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.round(progress.value * 100)}%`,
  }));

  const meta = useMemo(() => stepMeta(currentStep, t), [currentStep, t]);

  const selectedCity = useMemo(() => {
    if (!data.ville) return null;
    return cities.find((c) => String(c.id) === data.ville) ?? null;
  }, [cities, data.ville]);

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

  const anneesBacPickItems = useMemo(
    () => toPickItems(anneesBacOptions),
    [anneesBacOptions, toPickItems],
  );

  const userTypeOptions = useMemo<LabeledOption[]>(
    () => [
      { value: 'student', label: t('setupStudent'), labelAr: 'تلميذ/طالب' },
      { value: 'tutor', label: t('setupTutor'), labelAr: 'ولي الأمر' },
    ],
    [t],
  );

  const typeLyceeOptions = useMemo<LabeledOption[]>(
    () => [
      { value: 'public', label: t('setupPublic'), labelAr: 'عمومي' },
      { value: 'prive', label: t('setupPrivate'), labelAr: 'خصوصي' },
    ],
    [t],
  );

  const genreOptions = useMemo<LabeledOption[]>(
    () => [
      { value: 'Homme', label: t('setupMale'), labelAr: 'ذكر' },
      { value: 'Femme', label: t('setupFemale'), labelAr: 'أنثى' },
    ],
    [t],
  );

  const specialiteOptions = useMemo<LabeledOption[]>(
    () => SPECIALITES_MISSION.map((s) => ({ value: s, label: s, labelAr: s })),
    [],
  );

  const cityPickerItems = useMemo<SearchablePickItem[]>(
    () =>
      [...cities]
        .sort((a, b) => (a.titre ?? '').localeCompare(b.titre ?? '', 'fr', { sensitivity: 'base' }))
        .map((c) => ({
          id: String(c.id),
          value: String(c.id),
          label: c.titre ?? '',
          subtitle: c.region?.titre,
        })),
    [cities],
  );

  const labelFor = useCallback((value: string, items: SearchablePickItem[]): string => {
    if (!value) return '';
    return items.find((i) => i.value === value)?.label ?? value;
  }, []);

  const setupPickConfig = useMemo(
    () => ({
      userType: {
        title: t('setupYouAre'),
        items: toPickItems(userTypeOptions),
        value: data.userType,
      },
      niveau: {
        title: t('setupStudyLevel'),
        items: toPickItems(NIVEAU_ETUDE_OPTIONS),
        value: data.niveau,
      },
      bacType: {
        title: t('setupBacType'),
        items: BAC_TYPES.map((b) => ({ id: b.value, value: b.value, label: b.label })),
        value: data.bacType,
      },
      filiere: {
        title: isPremiereBacNiveau(data.niveau) ? t('setupFiliere1Bac') : t('setupFiliere'),
        items: toPickItems(filiereOptionsForNiveau(data.niveau)),
        value: data.filiere,
      },
      bacAnnee: {
        title: t('setupBacAnnee'),
        items: anneesBacPickItems,
        value: data.bacAnnee,
      },
      specialite1: {
        title: t('setupSpecialite1'),
        items: toPickItems(specialiteOptions),
        value: data.specialite1,
      },
      specialite2: {
        title: t('setupSpecialite2'),
        items: toPickItems(specialiteOptions),
        value: data.specialite2,
      },
      specialite3: {
        title: t('setupSpecialite3Optional'),
        items: toPickItems(specialiteOptions),
        value: data.specialite3,
      },
      typeLycee: {
        title: t('setupLyceeType'),
        items: toPickItems(typeLyceeOptions),
        value: data.typeLycee,
      },
      genre: {
        title: t('setupGender'),
        items: toPickItems(genreOptions),
        value: data.genre,
      },
      ville: {
        title: t('setupCityModalTitle'),
        items: cityPickerItems,
        value: data.ville,
      },
    }),
    [
      t,
      toPickItems,
      anneesBacPickItems,
      data,
      specialiteOptions,
      typeLyceeOptions,
      genreOptions,
      userTypeOptions,
      cityPickerItems,
    ],
  );

  function openPickField(field: SetupPickField) {
    setServerError('');
    setPickField(field);
  }

  function handleSetupPick(field: SetupPickField, v: string) {
    if (field === 'ville') {
      setData((s) => ({ ...s, ville: v }));
      return;
    }
    if (field === 'bacType') {
      setData((s) => ({
        ...s,
        bacType: v as AccountSetupPayload['bacType'],
        filiere: '',
        specialite1: '',
        specialite2: '',
        specialite3: '',
      }));
      return;
    }
    if (field === 'niveau') {
      const isHigher = ['BAC+1', 'BAC+2', 'BAC+3', 'BAC+4', 'BAC+5', 'BAC+6', 'Doctorant'].includes(v);
      setData((s) => ({
        ...s,
        niveau: v,
        filiere: sanitizeFiliereForNiveau(v, s.filiere),
        ...(isHigher ? {} : { diplomeEnCours: '' }),
      }));
      return;
    }
    setData((s) => ({ ...s, [field]: v }));
  }

  function validateStep(step: StepId): string | null {
    if (step === 1) {
      if (!data.userType) return t('setupErrPickUserType');
      if (!data.niveau) return t('setupErrPickLevel');

      const isBac = data.niveau.includes('bac') || data.niveau.includes('Bac') || data.niveau.includes('Baccalauréat');
      const isHigher = ['BAC+1', 'BAC+2', 'BAC+3', 'BAC+4', 'BAC+5', 'BAC+6', 'Doctorant'].includes(data.niveau);

      if (isBac) {
        if (!data.bacType) return t('setupErrPickBacType');
        if (data.bacType === 'normal' && !data.filiere) return t('setupErrPickFiliere');
        if (
          data.bacType === 'normal' &&
          isPremiereBacNiveau(data.niveau) &&
          !isValidOrientation1BacFiliereId(data.filiere)
        ) {
          return t('setupErrPickFiliere');
        }
        if (data.bacType === 'mission') {
          if (!data.specialite1 || !data.specialite2) {
            return t('setupErrPickMissionSpecs');
          }
          if (data.specialite1 === data.specialite2) return t('setupErrMissionSpecsDistinct');
          if (data.specialite3 && (data.specialite3 === data.specialite1 || data.specialite3 === data.specialite2)) {
            return t('setupErrMissionSpec3Distinct');
          }
        }
      }
      if (isHigher && !data.diplomeEnCours) return t('setupErrPickDiplome');
      if (!data.nomEtablissement) return t('setupErrEtablissement');
      return null;
    }

    if (step === 2) {
      if (!data.nom || !data.prenom || !data.email || !data.dateNaissance || !data.genre) return t('setupErrFillRequired');
      if (!isValidEmail(data.email)) return t('errInvalidEmail');
      return null;
    }

    return null;
  }

  function scrollToTop() {
    // Wait for React to commit the new step content before scrolling
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    });
  }

  async function goNext() {
    setServerError('');
    const err = validateStep(currentStep);
    if (err) {
      setServerError(err);
      return;
    }
    if (currentStep < LAST_SETUP_STEP) {
      setCurrentStep((s) => (s + 1) as StepId);
      scrollToTop();
    } else {
      await submit();
    }
  }

  function goPrev() {
    setServerError('');
    if (currentStep > 1) {
      setCurrentStep((s) => (s - 1) as StepId);
      scrollToTop();
    }
  }

  async function submit() {
    setServerError('');
    setSubmitting(true);
    try {
      const token = await getValidAccessToken();
      if (!token) throw new Error('Non authentifié');
      const res = await completeAccountSetup({ ...data, email: data.email.trim() }, token);
      if (!res?.success) throw new Error(res?.message || 'Setup failed');
      await reloadMe();
      void promptNotificationPermissionAfterAuth(getValidAccessToken);
      router.replace('/(tabs)');
    } catch (e: unknown) {
      setServerError(errorMessage(e, t, 'auth'));
    } finally {
      setSubmitting(false);
    }
  }

  const isBac = data.niveau.includes('bac') || data.niveau.includes('Bac') || data.niveau.includes('Baccalauréat');
  const showBacFields = isBac;
  const showHigherFields = ['BAC+1', 'BAC+2', 'BAC+3', 'BAC+4', 'BAC+5', 'BAC+6', 'Doctorant'].includes(data.niveau);

  function openBirthDatePicker() {
    setServerError('');
    setShowDatePicker(true);
  }

  function handleBirthDateSelected(d: Date) {
    setData((s) => ({ ...s, dateNaissance: formatDateYMD(d) }));
    setShowDatePicker(false);
  }

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.topSafe}>
        <View style={styles.header}>
          <View style={[styles.headerRow, rtl && styles.headerRowRtl]}>
            <View style={styles.headerTitles}>
              <Text style={[styles.headerTitle, rtl && styles.rtl]}>{t('setupTitle')}</Text>
              <Text style={[styles.headerSub, rtl && styles.rtl]}>{progressLabel}</Text>
            </View>

            <View style={styles.headerActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Logout"
                onPress={() => router.replace('/logout')}
                hitSlop={10}
                style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.9 }]}
              >
                <FontAwesome name="sign-out" size={18} color="white" />
              </Pressable>

              <HeroLangSwitch />
            </View>
          </View>
        </View>

        <View style={[styles.progressWrap, rtl && styles.progressWrapRtl]}>
          <View style={[styles.progressTrack, rtl && styles.progressTrackRtl]}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>
          <View style={styles.progressSteps}>
            {TOTAL_STEPS.map((s) => {
              const done = s < currentStep;
              const active = s === currentStep;
              const stepIcon = stepMeta(s, t).icon;
              return (
                <View
                  key={s}
                  accessibilityRole="image"
                  accessibilityLabel={`Étape ${s}${done ? ' terminée' : active ? ' en cours' : ''}`}
                  style={[
                    styles.progressIcon,
                    done && styles.progressIconDone,
                    active && styles.progressIconActive,
                  ]}
                >
                  <FontAwesome
                    name={done ? 'check' : stepIcon}
                    size={done ? 12 : active ? 14 : 12}
                    color={active ? BLUE : 'rgba(255,255,255,0.96)'}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.flex}>
        <View style={styles.flex}>
          <ScrollView
            ref={scrollRef}
            {...(rtl ? { style: { direction: 'rtl' as const } } : {})}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            automaticallyAdjustKeyboardInsets
            alwaysBounceVertical
          >
          <View style={styles.stepHeader}>
            <View style={[styles.stepHeaderRow, rtl && styles.stepHeaderRowRtl]}>
              <View style={styles.stepIcon}>
                <FontAwesome name={meta.icon as any} size={18} color={BLUE} />
              </View>
              <View style={styles.stepHeaderTexts}>
                <Text style={[styles.stepTitle, rtl && styles.rtl]}>{meta.title}</Text>
                <Text style={[styles.stepSub, rtl && styles.rtl]}>{meta.sub}</Text>
              </View>
            </View>
          </View>

          {!!serverError && (
            <View style={[styles.errorRow, rtl && styles.errorRowRtl]}>
              <FontAwesome name="exclamation-circle" size={14} color={brand.error} />
              <Text style={[styles.errorText, rtl && styles.rtl]}>{serverError}</Text>
            </View>
          )}

          {currentStep === 1 && (
            <>
              <SelectField
                label={t('setupYouAre')}
                value={labelFor(data.userType, setupPickConfig.userType.items)}
                rtl={rtl}
                onPress={() => openPickField('userType')}
              />

              <SelectField
                label={t('setupStudyLevel')}
                value={labelFor(data.niveau, setupPickConfig.niveau.items)}
                rtl={rtl}
                onPress={() => openPickField('niveau')}
              />

              {showBacFields && (
                <>
                  <SelectField
                    label={t('setupBacType')}
                    value={labelFor(data.bacType, setupPickConfig.bacType.items)}
                    rtl={rtl}
                    onPress={() => openPickField('bacType')}
                  />

                  {data.bacType === 'normal' && (
                    <SelectField
                      label={isPremiereBacNiveau(data.niveau) ? t('setupFiliere1Bac') : t('setupFiliere')}
                      value={
                        resolveFiliereDisplayLabel(data.filiere, locale === 'ar' ? 'ar' : 'fr') ||
                        labelFor(data.filiere, setupPickConfig.filiere.items)
                      }
                      rtl={rtl}
                      onPress={() => openPickField('filiere')}
                    />
                  )}

                  {data.bacType === 'mission' && (
                    <>
                      <SelectField
                        label={t('setupSpecialite1')}
                        value={labelFor(data.specialite1, setupPickConfig.specialite1.items)}
                        rtl={rtl}
                        onPress={() => openPickField('specialite1')}
                      />
                      <SelectField
                        label={t('setupSpecialite2')}
                        value={labelFor(data.specialite2, setupPickConfig.specialite2.items)}
                        rtl={rtl}
                        onPress={() => openPickField('specialite2')}
                      />
                      <SelectField
                        label={t('setupSpecialite3Optional')}
                        value={labelFor(data.specialite3, setupPickConfig.specialite3.items)}
                        rtl={rtl}
                        onPress={() => openPickField('specialite3')}
                      />
                    </>
                  )}

                  <SelectField
                    label={t('setupBacAnnee')}
                    value={labelFor(data.bacAnnee, setupPickConfig.bacAnnee.items)}
                    rtl={rtl}
                    onPress={() => openPickField('bacAnnee')}
                  />
                </>
              )}

              {showHigherFields && (
                <View style={styles.block}>
                  <Text style={[styles.label, rtl && styles.rtl]}>{t('setupDiplomeEnCours')}</Text>
                  <SetupTextInput
                    rtl={rtl}
                    value={data.diplomeEnCours}
                    onChangeText={(v) => setData((s) => ({ ...s, diplomeEnCours: v }))}
                    placeholder="Ex: Licence, Master..."
                  />
                </View>
              )}

              <View style={styles.block}>
                <Text style={[styles.label, rtl && styles.rtl]}>{t('setupEtablissement')}</Text>
                <SetupTextInput
                  rtl={rtl}
                  value={data.nomEtablissement}
                  onChangeText={(v) => setData((s) => ({ ...s, nomEtablissement: v }))}
                  placeholder="Ex: Lycée ..."
                />
              </View>

              <SelectField
                label={t('setupLyceeType')}
                value={labelFor(data.typeLycee, setupPickConfig.typeLycee.items)}
                rtl={rtl}
                onPress={() => openPickField('typeLycee')}
              />
            </>
          )}

          {currentStep === 2 && (
            <>
              <View style={styles.block}>
                <Text style={[styles.label, rtl && styles.rtl]}>{t('setupLastName')}</Text>
                <SetupTextInput rtl={rtl} value={data.nom} onChangeText={(v) => setData((s) => ({ ...s, nom: v }))} />
              </View>
              <View style={styles.block}>
                <Text style={[styles.label, rtl && styles.rtl]}>{t('setupFirstName')}</Text>
                <SetupTextInput rtl={rtl} value={data.prenom} onChangeText={(v) => setData((s) => ({ ...s, prenom: v }))} />
              </View>
              <View style={styles.block}>
                <Text style={[styles.label, rtl && styles.rtl]}>{t('setupEmail')}</Text>
                <SetupTextInput
                  rtl={rtl}
                  value={data.email}
                  onChangeText={(v) => setData((s) => ({ ...s, email: v }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.block}>
                <Text style={[styles.label, rtl && styles.rtl]}>{t('setupBirthDate')}</Text>
                {Platform.OS === 'web' ? (
                  <View style={[styles.dateField, rtl && styles.dateFieldRtl]}>
                    {/* @ts-ignore – web-only HTML input */}
                    <input
                      type="date"
                      value={data.dateNaissance}
                      min="1940-01-01"
                      max={formatDateYMD(new Date())}
                      onChange={(e: any) => {
                        const v: string = e.target.value;
                        if (v) setData((s) => ({ ...s, dateNaissance: v }));
                      }}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        flex: 1,
                        fontSize: 15,
                        color: data.dateNaissance ? '#0f172a' : '#94a3b8',
                        outline: 'none',
                        width: '100%',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    />
                  </View>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    onPress={openBirthDatePicker}
                    style={[styles.dateField, rtl && styles.dateFieldRtl]}
                  >
                    <Text style={[styles.dateFieldText, rtl && styles.rtl, !birthDateDisplay && { color: brand.textMuted }]}>
                      {birthDateDisplay || t('setupBirthDatePlaceholder')}
                    </Text>
                    <FontAwesome name="calendar" size={16} color={brand.textMuted} />
                  </Pressable>
                )}
              </View>
              <SelectField
                label={t('setupGender')}
                value={labelFor(data.genre, setupPickConfig.genre.items)}
                rtl={rtl}
                onPress={() => openPickField('genre')}
              />
              <SelectField
                label={t('setupCity')}
                hint={t('setupCityHint')}
                value={selectedCity?.titre ?? ''}
                rtl={rtl}
                loading={loadingCities}
                loadingLabel={t('setupLoading')}
                disabled={!loadingCities && cities.length === 0}
                onPress={() => openPickField('ville')}
              />
            </>
          )}


          </ScrollView>

          <View style={[styles.footer, rtl && styles.footerRtl]}>
            <Pressable
              accessibilityRole="button"
              onPress={goPrev}
              disabled={currentStep === 1 || submitting}
              style={[styles.btn, styles.btnGhost, (currentStep === 1 || submitting) && styles.btnDisabled]}
            >
              <Text style={styles.btnGhostText}>{t('setupBack')}</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={goNext}
              disabled={submitting}
              style={[styles.btn, styles.btnPrimary, submitting && styles.btnDisabled]}
            >
              {submitting ? (
                <View style={styles.btnRow}>
                  <ActivityIndicator color="white" />
                  <Text style={styles.btnPrimaryText}>{t('setupSaving')}</Text>
                </View>
              ) : (
                <Text style={styles.btnPrimaryText}>{currentStep === LAST_SETUP_STEP ? t('setupFinish') : t('setupContinue')}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>

      {pickField ? (
        <SearchablePickSheet
          visible
          title={setupPickConfig[pickField].title}
          searchPlaceholder={t('setupCitySearchPlaceholder')}
          emptyLabel={pickField === 'ville' ? t('setupCityNoResults') : t('accountSelectNoResults')}
          allLabel={pickField === 'ville' ? t('setupCityChoose') : t('accountSelectPlaceholder')}
          items={setupPickConfig[pickField].items}
          selectedValue={setupPickConfig[pickField].value}
          onPick={(v) => handleSetupPick(pickField, v)}
          onClose={() => setPickField(null)}
          rtl={rtl}
        />
      ) : null}

      {/* Birth date — native iOS/Android picker (web uses inline <input type="date">) */}
      {Platform.OS !== 'web' && (
        <BirthDateNativePicker
          visible={showDatePicker}
          value={birthDate}
          maxDate={new Date()}
          minDate={new Date(1940, 0, 1)}
          rtl={rtl}
          labels={{
            title: t('setupBirthDate'),
            cancel: t('setupDateCancel'),
            ok: t('setupDateOk'),
          }}
          onClose={() => setShowDatePicker(false)}
          onSelect={handleBirthDateSelected}
        />
      )}
    </View>
  );
}

function BirthDateNativePicker({
  visible,
  value,
  maxDate,
  minDate,
  rtl,
  labels,
  onClose,
  onSelect,
}: {
  visible: boolean;
  value: Date | null;
  maxDate?: Date;
  minDate?: Date;
  rtl: boolean;
  labels: { title: string; cancel: string; ok: string };
  onClose: () => void;
  onSelect: (d: Date) => void;
}) {
  const initial = useMemo(() => value ?? new Date(2006, 0, 1), [value]);
  const [temp, setTemp] = useState<Date>(initial);

  useEffect(() => {
    if (!visible) return;
    setTemp(value ?? new Date(2006, 0, 1));
  }, [visible, value]);

  const onChangeAndroid = (_e: DateTimePickerEvent, selected?: Date) => {
    // Android: picker se ferme automatiquement après set/dismiss
    const e = _e as any;
    if (e?.type === 'dismissed') {
      onClose();
      return;
    }
    if (selected) onSelect(selected);
    onClose();
  };

  if (!visible) return null;

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={temp}
        mode="date"
        display="calendar"
        maximumDate={maxDate}
        minimumDate={minDate}
        onChange={onChangeAndroid}
      />
    );
  }

  // iOS: modal bottom sheet avec boutons Annuler/OK
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.sheetRoot}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />
        <SafeAreaView edges={['bottom']} style={styles.sheetCard}>
          <View style={styles.sheetHandle} />
          <View style={[styles.sheetHeader, rtl && styles.sheetHeaderRtl]}>
            <Text style={[styles.sheetTitle, rtl && styles.rtl]}>{labels.title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fermer"
              onPress={onClose}
              hitSlop={10}
              style={styles.sheetClose}
            >
              <FontAwesome name="times" size={16} color={brand.text} />
            </Pressable>
          </View>

          <View style={{ paddingVertical: 4 }}>
            <DateTimePicker
              value={temp}
              mode="date"
              display="spinner"
              maximumDate={maxDate}
              minimumDate={minDate}
              onChange={(_e, d) => d && setTemp(d)}
              themeVariant="light"
              {...(rtl ? { style: { direction: 'rtl' as const } } : {})}
            />
          </View>

          <View style={[styles.calFooter, rtl && styles.calFooterRtl]}>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [styles.modalBtn, styles.modalBtnGhost, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.modalBtnGhostText}>{labels.cancel}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onSelect(temp)}
              style={({ pressed }) => [styles.modalBtn, styles.modalBtnPrimary, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.modalBtnPrimaryText}>{labels.ok}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function BirthDateCalendar({
  visible,
  value,
  maxDate,
  minDate,
  rtl,
  locale,
  labels,
  onClose,
  onSelect,
}: {
  visible: boolean;
  value: Date | null;
  maxDate?: Date;
  minDate?: Date;
  rtl: boolean;
  locale: 'fr' | 'ar';
  labels: { title: string; cancel: string; ok: string };
  onClose: () => void;
  onSelect: (d: Date) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const initial = useMemo(() => value ?? new Date(2006, 0, 1), [value]);
  const [viewYear, setViewYear] = useState<number>(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initial.getMonth());
  const [selected, setSelected] = useState<Date | null>(value);
  const [mode, setMode] = useState<'days' | 'years'>('days');

  useEffect(() => {
    if (!visible) return;
    const v = value ?? new Date(2006, 0, 1);
    setViewYear(v.getFullYear());
    setViewMonth(v.getMonth());
    setSelected(value);
    setMode('days');
  }, [visible, value]);

  const months = locale === 'ar' ? AR_MONTHS : FR_MONTHS;
  const weekdays = locale === 'ar' ? AR_WEEKDAYS : FR_WEEKDAYS;

  const minTime = minDate ? minDate.getTime() : -Infinity;
  const maxTime = maxDate ? maxDate.getTime() : Infinity;

  const headerLabel = `${months[viewMonth]} ${viewYear}`;

  const cells = useMemo(() => {
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const startOffset = (firstWeekday + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const arr: Array<{ day: number; date: Date; inRange: boolean } | null> = [];
    for (let i = 0; i < startOffset; i += 1) arr.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) {
      const date = new Date(viewYear, viewMonth, d);
      const t = date.getTime();
      arr.push({ day: d, date, inRange: t >= minTime && t <= maxTime });
    }
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [viewYear, viewMonth, minTime, maxTime]);

  function gotoPrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }
  function gotoNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const minYear = minDate ? minDate.getFullYear() : 1940;
  const maxYear = maxDate ? maxDate.getFullYear() : today.getFullYear();
  const [yearPageStart, setYearPageStart] = useState<number>(() => {
    const base = Math.floor(viewYear / 12) * 12;
    return Math.max(minYear, Math.min(base, maxYear - 11));
  });

  useEffect(() => {
    if (mode === 'years') {
      const base = Math.floor(viewYear / 12) * 12;
      setYearPageStart(Math.max(minYear, Math.min(base, maxYear - 11)));
    }
  }, [mode, viewYear, minYear, maxYear]);

  const yearsForPage = useMemo(() => {
    const arr: number[] = [];
    for (let y = yearPageStart; y < yearPageStart + 12; y += 1) {
      if (y >= minYear && y <= maxYear) arr.push(y);
    }
    return arr;
  }, [yearPageStart, minYear, maxYear]);

  const isSelected = (d: Date) =>
    selected != null &&
    d.getFullYear() === selected.getFullYear() &&
    d.getMonth() === selected.getMonth() &&
    d.getDate() === selected.getDate();
  const isToday = (d: Date) =>
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();

  const { width: winW } = useWindowDimensions();
  const [measuredGridW, setMeasuredGridW] = useState(0);
  /** % + aspectRatio avec flexWrap → hauteur 0 sur le web ; tailles px explicites. */
  const cellSide = useMemo(() => {
    const base = measuredGridW > 0 ? measuredGridW : Math.max(280, winW - spacing.lg * 4);
    return Math.max(36, Math.floor(base / 7));
  }, [measuredGridW, winW]);
  const cellBox = useMemo(
    () => ({
      width: cellSide,
      height: cellSide,
      minWidth: cellSide,
      minHeight: cellSide,
    }),
    [cellSide],
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.sheetRoot}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />
        <SafeAreaView edges={['bottom']} style={styles.sheetCard}>
          <View style={styles.sheetHandle} />
          <View style={[styles.sheetHeader, rtl && styles.sheetHeaderRtl]}>
            <Text style={[styles.sheetTitle, rtl && styles.rtl]}>{labels.title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fermer"
              onPress={onClose}
              hitSlop={10}
              style={styles.sheetClose}
            >
              <FontAwesome name="times" size={16} color={brand.text} />
            </Pressable>
          </View>

          <View style={[styles.calNav, rtl && styles.calNavRtl]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mois précédent"
              onPress={mode === 'days' ? gotoPrevMonth : () => setYearPageStart((s) => Math.max(minYear, s - 12))}
              hitSlop={8}
              style={styles.calNavBtn}
            >
              <FontAwesome name={rtl ? 'chevron-right' : 'chevron-left'} size={14} color={brand.text} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setMode((m) => (m === 'days' ? 'years' : 'days'))}
              style={styles.calNavTitleBtn}
            >
              <Text style={styles.calNavTitle}>
                {mode === 'days' ? headerLabel : `${yearPageStart} – ${Math.min(yearPageStart + 11, maxYear)}`}
              </Text>
              <FontAwesome
                name={mode === 'days' ? 'caret-down' : 'caret-up'}
                size={12}
                color={brand.textMuted}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mois suivant"
              onPress={mode === 'days' ? gotoNextMonth : () => setYearPageStart((s) => Math.min(maxYear - 11, s + 12))}
              hitSlop={8}
              style={styles.calNavBtn}
            >
              <FontAwesome name={rtl ? 'chevron-left' : 'chevron-right'} size={14} color={brand.text} />
            </Pressable>
          </View>

          {mode === 'days' ? (
            <>
              <View style={[styles.calWeekRow, rtl && styles.calWeekRowRtl]}>
                {weekdays.map((w, i) => (
                  <View key={`wd-${i}`} style={styles.calWeekCell}>
                    <Text style={styles.calWeekTxt}>{w}</Text>
                  </View>
                ))}
              </View>
              <View
                style={[styles.calGrid, rtl && styles.calGridRtl]}
                onLayout={(e) => {
                  const w = e.nativeEvent.layout.width;
                  if (w > 0) setMeasuredGridW(w);
                }}
              >
                {cells.map((c, idx) => {
                  if (!c) return <View key={`e-${idx}`} style={[styles.calCell, cellBox]} />;
                  const sel = isSelected(c.date);
                  const tod = isToday(c.date);
                  return (
                    <Pressable
                      key={`d-${idx}`}
                      disabled={!c.inRange}
                      onPress={() => setSelected(c.date)}
                      accessibilityRole="button"
                      accessibilityLabel={formatDateDMY(c.date)}
                      style={({ pressed }) => [
                        styles.calCell,
                        cellBox,
                        styles.calDayBtn,
                        sel && styles.calDayBtnSelected,
                        !sel && tod && styles.calDayBtnToday,
                        !c.inRange && { opacity: 0.32 },
                        pressed && c.inRange && !sel && { backgroundColor: 'rgba(15,23,42,0.06)' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.calDayTxt,
                          sel && styles.calDayTxtSelected,
                          !sel && tod && styles.calDayTxtToday,
                          rtl && styles.calDayTxtRtl,
                        ]}
                      >
                        {c.day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : (
            <View style={styles.calYearGrid}>
              {yearsForPage.map((y) => {
                const active = y === viewYear;
                return (
                  <Pressable
                    key={`y-${y}`}
                    onPress={() => {
                      setViewYear(y);
                      setMode('days');
                    }}
                    style={({ pressed }) => [
                      styles.calYearBtn,
                      active && styles.calYearBtnActive,
                      pressed && !active && { backgroundColor: 'rgba(15,23,42,0.06)' },
                    ]}
                  >
                    <Text style={[styles.calYearTxt, active && styles.calYearTxtActive]}>
                      {y}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={[styles.calFooter, rtl && styles.calFooterRtl]}>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [styles.modalBtn, styles.modalBtnGhost, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.modalBtnGhostText}>{labels.cancel}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={!selected}
              onPress={() => selected && onSelect(selected)}
              style={({ pressed }) => [
                styles.modalBtn,
                styles.modalBtnPrimary,
                (!selected || pressed) && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.modalBtnPrimaryText}>{labels.ok}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.backgroundSoft },
  flex: { flex: 1 },
  topSafe: { backgroundColor: BLUE },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  headerRowRtl: { flexDirection: 'row-reverse' },
  headerTitles: { flex: 1 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  progressWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, marginTop: -4 },
  progressWrapRtl: { direction: 'rtl' },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
  },
  progressTrackRtl: { transform: [{ scaleX: -1 }] },
  progressFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  progressSteps: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressIcon: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1.25,
    borderColor: 'rgba(255,255,255,0.30)',
  },
  progressIconDone: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderColor: 'rgba(255,255,255,0.55)',
  },
  progressIconActive: {
    width: 36,
    height: 36,
    backgroundColor: 'white',
    borderColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  content: { padding: spacing.lg, paddingBottom: 120 },
  rtl: { writingDirection: 'rtl', textAlign: 'right' as const },

  stepHeader: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  stepHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepHeaderRowRtl: { flexDirection: 'row-reverse' },
  stepIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(51,62,143,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepHeaderTexts: { flex: 1 },
  stepTitle: { color: brand.text, fontSize: 16, fontWeight: '900' },
  stepSub: { color: brand.textMuted, marginTop: 6, fontSize: 13, fontWeight: '700' },

  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.28)',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  errorRowRtl: { flexDirection: 'row-reverse' },
  errorText: { color: brand.error, flex: 1 },

  block: { marginBottom: spacing.xl },
  label: {
    color: brand.textSecondary,
    marginBottom: 8,
    fontSize: fontSize.sm,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  fieldPressable: { alignSelf: 'stretch' },
  fieldShellBase: {
    borderRadius: radius.xl,
    borderWidth: 2,
    paddingHorizontal: spacing.lg + 2,
    paddingVertical: Platform.OS === 'ios' ? 14 : 13,
    minHeight: 54,
    overflow: 'visible',
    justifyContent: 'center',
  },
  fieldShellElevated: {
    elevation: 5,
  },
  inputInner: {
    padding: 0,
    margin: 0,
    fontSize: fontSize.lg,
    fontWeight: '600',
    lineHeight: Math.round(fontSize.lg * 1.35),
    letterSpacing: -0.15,
    color: brand.text,
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: SHELL_BG_IDLE,
    borderWidth: 2,
    borderColor: SHELL_BORDER_IDLE,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg + 2,
    paddingVertical: Platform.OS === 'ios' ? 14 : 13,
    minHeight: 54,
    ...Platform.select({
      ios: { shadowColor: 'rgba(15,23,42,0.08)', shadowOpacity: 1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 0 },
    }),
  },
  dateFieldRtl: { flexDirection: 'row-reverse' },
  dateFieldText: {
    color: brand.text,
    fontWeight: '600',
    fontSize: fontSize.lg,
    lineHeight: Math.round(fontSize.lg * 1.35),
    letterSpacing: -0.15,
  },
  hint: { color: brand.textMuted, marginTop: 8, fontSize: 12 },
  sectionHint: { color: brand.textMuted, marginBottom: spacing.md },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 23, 42, 0.06)',
    backgroundColor: 'white',
    flexDirection: 'row',
    gap: 12,
  },
  footerRtl: { flexDirection: 'row-reverse' },
  btn: { flex: 1, borderRadius: radius.lg, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: BLUE },
  btnPrimaryText: { color: 'white', fontWeight: '900' },
  btnGhost: { backgroundColor: 'white', borderWidth: 1, borderColor: brand.border },
  btnGhostText: { color: brand.text, fontWeight: '900' },
  btnDisabled: { opacity: 0.55 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  modalBtn: { flex: 1, borderRadius: radius.lg, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  modalBtnPrimary: { backgroundColor: BLUE },
  modalBtnPrimaryText: { color: 'white', fontWeight: '900' },
  modalBtnGhost: { backgroundColor: 'white', borderWidth: 1, borderColor: brand.border },
  modalBtnGhostText: { color: brand.text, fontWeight: '900' },

  sheetRoot: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,6,23,0.45)',
  },
  sheetCard: {
    backgroundColor: 'white',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: 8,
    height: '65%',
    maxHeight: '85%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(15,23,42,0.18)',
    marginTop: 6,
    marginBottom: spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
  },
  sheetHeaderRtl: { flexDirection: 'row-reverse' },
  sheetTitle: { color: brand.text, fontSize: 16, fontWeight: '900', flex: 1 },
  sheetClose: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.06)',
  },
  sheetSearchWrap: { marginBottom: spacing.sm },
  sheetSearchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minHeight: 28,
  },
  sheetSearchInnerRtl: { flexDirection: 'row-reverse' },
  sheetSearchInput: {
    flex: 1,
    color: brand.text,
    fontWeight: '600',
    fontSize: fontSize.lg,
    lineHeight: Math.round(fontSize.lg * 1.35),
    letterSpacing: -0.15,
    paddingVertical: 0,
  },
  cityListContent: { paddingBottom: spacing.lg },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 10,
  },
  cityRowRtl: { flexDirection: 'row-reverse' },
  cityRowText: { color: brand.text, fontWeight: '700' },
  cityRowTextActive: { color: BLUE },
  cityRowMeta: { color: brand.textMuted, fontSize: 12, marginTop: 2 },
  cityRowSep: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(15,23,42,0.08)' },
  sheetEmpty: { alignItems: 'center', paddingVertical: spacing.xl, gap: 8 },
  sheetEmptyText: { color: brand.textMuted, fontWeight: '600' },

  calNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    gap: 10,
  },
  calNavRtl: { flexDirection: 'row-reverse' },
  calNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.06)',
  },
  calNavTitleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51,62,143,0.08)',
  },
  calNavTitle: { color: brand.text, fontWeight: '900', fontSize: 14 },

  calWeekRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.border,
  },
  calWeekRowRtl: { flexDirection: 'row-reverse' },
  calWeekCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  calWeekTxt: { color: brand.textMuted, fontWeight: '800', fontSize: 11 },

  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 6,
    width: '100%',
  },
  calGridRtl: { flexDirection: 'row-reverse' },
  calCell: {
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calDayBtn: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calDayBtnSelected: { backgroundColor: BLUE },
  calDayBtnToday: { borderWidth: 1.25, borderColor: BLUE },
  calDayTxt: { color: brand.text, fontWeight: '700', fontSize: 13 },
  calDayTxtRtl: { writingDirection: 'ltr' },
  calDayTxtSelected: { color: 'white', fontWeight: '900' },
  calDayTxtToday: { color: BLUE, fontWeight: '900' },

  calYearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 8,
  },
  calYearBtn: {
    width: `${100 / 4}%`,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  calYearBtnActive: { backgroundColor: BLUE },
  calYearTxt: { color: brand.text, fontWeight: '700', fontSize: 14 },
  calYearTxtActive: { color: 'white', fontWeight: '900' },

  calFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  calFooterRtl: { flexDirection: 'row-reverse' },
});

