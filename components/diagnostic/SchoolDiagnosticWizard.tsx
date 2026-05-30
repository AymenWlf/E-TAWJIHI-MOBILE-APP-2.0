import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ScrollView as ScrollViewType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  SchoolDiagnosticStepContent,
  type DiagnosticStepContext,
} from '@/components/diagnostic/SchoolDiagnosticStepContent';
import { DiagnosticLoadingView } from '@/components/diagnostic/DiagnosticLoadingView';
import { useSchoolDiagnosticBackgroundSubmit } from '@/hooks/useSchoolDiagnosticBackgroundSubmit';
import { useSimulatedLoadingProgress } from '@/utils/useSimulatedLoadingProgress';
import {
  getSchoolDiagnosticBgSubmitSnapshot,
  markSchoolDiagnosticSubmitDetached,
  resetSchoolDiagnosticBgSubmitIdle,
  runSchoolDiagnosticBackgroundSubmit,
} from '@/utils/schoolDiagnosticBackgroundSubmit';
import {
  DiagnosticStatusBar,
  DiagnosticStepHeader,
  DiagnosticStepProgressBar,
  diagnosticTheme,
} from '@/components/diagnostic/DiagnosticUi';
import { getDiagnosticStepMeta } from '@/constants/diagnosticWizardUi';
import {
  diagnosticUiLocale,
  getDiagnosticStepShortLabels,
  pickLabeledOption,
} from '@/constants/schoolDiagnosticLocale';
import { getDiagnosticFormLabels } from '@/constants/schoolDiagnosticFormLabels';
import { KeyboardAwareBottomSpacer } from '@/components/ui/KeyboardAwareBottomSpacer';
import { SearchablePickSheet, type SearchablePickItem } from '@/components/schools/SearchablePickSheet';
import { Text } from '@/components/ui/Text';
import { FILIERE_BAC_OPTIONS, NIVEAU_ETUDE_OPTIONS, SPECIALITES_MISSION } from '@/constants/academicSetup';
import { GENDER_OPTIONS, LYCEE_PUBLIC_PRIVE_OPTIONS } from '@/constants/schoolQuickDiagnostic';
import { DIAGNOSTIC_ANALYSIS_MESSAGES } from '@/constants/diagnosticWizardUi';
import {
  DIAGNOSTIC_TOTAL_STEPS,
  defaultSchoolQuickDiagnosticForm,
  normalizeSchoolQuickDiagnosticDraft,
  type SchoolQuickDiagnosticForm,
} from '@/constants/schoolQuickDiagnostic';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { getUserFacingApiError } from '@/utils/apiError';
import { listAllSecteursActive, listCities, type CityRow, type SecteurRow } from '@/services/referenceData';
import {
  createSchoolDiagnosticDraft,
  fetchPrimarySchoolDiagnosticForUser,
  fetchSchoolRecommendationDiagnostic,
  fetchSchoolRecommendationDiagnosticByPublicCode,
  finalizeSchoolDiagnosticDraft,
  submitSchoolRecommendationDiagnostic,
  updateSchoolDiagnosticDraft,
} from '@/services/schoolRecommendationDiagnostic';
import { postPlanReussiteStep } from '@/services/planReussiteSteps';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import {
  clearDiagnosticDraft,
  loadDiagnosticDraft,
  persistServerDraftDiagnosticId,
  readPersistedSchoolDiagnosticResult,
  readServerDraftDiagnosticId,
  readServerDraftDiagnosticPublicCode,
  saveDiagnosticDraft,
} from '@/utils/schoolDiagnosticStorage';
import {
  buildAutofillPatchFromAuthUser,
  buildAutofillPatchFromProfile,
  mergeSchoolQuickDiagnosticFillEmpty,
  schoolDiagnosticPayloadToFormPatch,
} from '@/utils/schoolQuickDiagnosticAutofill';
import { syncSchoolDiagnosticFromServer } from '@/utils/syncSchoolDiagnosticFromServer';
import { getUserProfile } from '@/services/userProfile';
import { validateSchoolDiagnosticStep } from '@/utils/schoolDiagnosticValidation';
import {
  cityDisplayLabel,
  enrichSchoolDiagnosticSubmitPayload,
} from '@/utils/schoolDiagnosticPayloadDisplayContext';

type PickerKey =
  | 'city'
  | 'gender'
  | 'studyLevel'
  | 'bacStream'
  | 'lycee'
  | 'mission1'
  | 'mission2'
  | 'mission3'
  | 'prefCities';

/** Marge au-dessus du champ focalisé (évite scrollToEnd qui masque le commentaire libre). */
const SCROLL_FOCUS_PADDING = 120;

export function SchoolDiagnosticWizard() {
  const { isRTL, locale, t } = useLocale();
  const uiLocale = diagnosticUiLocale(isRTL, locale);
  const { user, getValidAccessToken } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<SchoolQuickDiagnosticForm>(() => defaultSchoolQuickDiagnosticForm());
  const [stepError, setStepError] = useState<string | null>(null);
  const [cities, setCities] = useState<CityRow[]>([]);
  const [secteurs, setSecteurs] = useState<SecteurRow[]>([]);
  const serverPayload = useMemo(
    () => enrichSchoolDiagnosticSubmitPayload(form, uiLocale, cities, secteurs),
    [form, uiLocale, cities, secteurs],
  );
  const [picker, setPicker] = useState<PickerKey | null>(null);
  const [serverDraftId, setServerDraftId] = useState<number | null>(null);
  const [serverDraftPublicCode, setServerDraftPublicCode] = useState<string | null>(null);
  const [draftSaving, setDraftSaving] = useState(false);
  const bgSubmit = useSchoolDiagnosticBackgroundSubmit();
  const submitting = bgSubmit.phase === 'running';
  const { percent: submitProgress, complete: completeSubmitProgress } =
    useSimulatedLoadingProgress(submitting);
  const [submitMsg, setSubmitMsg] = useState(0);
  const [booting, setBooting] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [secteursLoading, setSecteursLoading] = useState(true);
  const scrollRef = useRef<ScrollViewType>(null);
  const scrollContentRef = useRef<View>(null);
  const focusAnchorRefs = useRef<Partial<Record<string, View>>>({});
  const profileAutofillDoneRef = useRef(false);

  const registerFocusAnchor = useCallback((key: string, node: View | null) => {
    if (node) {
      focusAnchorRefs.current[key] = node;
    } else {
      delete focusAnchorRefs.current[key];
    }
  }, []);

  const scrollToFocusedField = useCallback((key: string) => {
    const fieldNode = focusAnchorRefs.current[key];
    const contentNode = scrollContentRef.current;
    if (!fieldNode || !contentNode) {
      return;
    }

    const runScroll = () => {
      fieldNode.measureLayout(
        contentNode,
        (_x, y) => {
          scrollRef.current?.scrollTo({
            y: Math.max(0, y - SCROLL_FOCUS_PADDING),
            animated: true,
          });
        },
        () => {},
      );
    };

    if (Platform.OS === 'ios') {
      setTimeout(runScroll, 80);
      setTimeout(runScroll, 320);
    } else {
      requestAnimationFrame(runScroll);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (getSchoolDiagnosticBgSubmitSnapshot().phase === 'running') {
        markSchoolDiagnosticSubmitDetached();
      }
    };
  }, []);

  useEffect(() => {
    if (bgSubmit.phase !== 'success' || bgSubmit.detached || !bgSubmit.publicCode) return;
    let cancelled = false;
    void (async () => {
      completeSubmitProgress();
      await new Promise((r) => setTimeout(r, 420));
      if (cancelled) return;
      router.replace({
        pathname: '/diagnostic-ecoles/resultats',
        params: { c: bgSubmit.publicCode! },
      } as never);
      resetSchoolDiagnosticBgSubmitIdle();
    })();
    return () => {
      cancelled = true;
    };
  }, [bgSubmit.phase, bgSubmit.detached, bgSubmit.publicCode, completeSubmitProgress]);

  useEffect(() => {
    if (bgSubmit.phase !== 'error' || bgSubmit.detached) return;
    Alert.alert(t('commonErrorTitle'), t('apiErrDiagnostic'));
    resetSchoolDiagnosticBgSubmitIdle();
  }, [bgSubmit.phase, bgSubmit.detached, t]);

  const leaveAnalysisInBackground = useCallback(() => {
    if (getSchoolDiagnosticBgSubmitSnapshot().phase === 'running') {
      markSchoolDiagnosticSubmitDetached();
    }
    router.back();
  }, []);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const [draft, draftId, draftCode, lastResult] = await Promise.all([
        loadDiagnosticDraft(),
        readServerDraftDiagnosticId(),
        readServerDraftDiagnosticPublicCode(),
        readPersistedSchoolDiagnosticResult(user?.id ?? null),
      ]);
      if (!alive) return;

      const token = await getValidAccessToken();
      let serverId = draftId ?? lastResult?.id ?? null;
      let serverCode = draftCode ?? lastResult?.publicCode ?? null;
      let base = draft ?? defaultSchoolQuickDiagnosticForm();

      if (token) {
        try {
          const primary = await fetchPrimarySchoolDiagnosticForUser(token);
          if (primary) {
            await syncSchoolDiagnosticFromServer(primary, user?.id ?? null);
            serverId = primary.id;
            serverCode = primary.publicCode;
            setServerDraftId(primary.id);
            setServerDraftPublicCode(primary.publicCode);
            if (primary.payload && typeof primary.payload === 'object') {
              base = mergeSchoolQuickDiagnosticFillEmpty(
                defaultSchoolQuickDiagnosticForm(),
                normalizeSchoolQuickDiagnosticDraft(
                  primary.payload as Record<string, unknown>,
                ) as Partial<SchoolQuickDiagnosticForm>,
                schoolDiagnosticPayloadToFormPatch(primary.payload as Record<string, unknown>),
              );
              await saveDiagnosticDraft(base);
            }
          }
        } catch {
          /* garde brouillon local si sync compte échoue */
        }
      } else if (serverId != null || (serverCode != null && serverCode.length >= 32)) {
        if (serverId) setServerDraftId(serverId);
        if (serverCode) setServerDraftPublicCode(serverCode);
        try {
          const remote =
            serverCode != null && serverCode.length >= 32
              ? await fetchSchoolRecommendationDiagnosticByPublicCode(serverCode, token)
              : await fetchSchoolRecommendationDiagnostic(serverId!, token);
          if (!alive) return;
          base = mergeSchoolQuickDiagnosticFillEmpty(
            defaultSchoolQuickDiagnosticForm(),
            normalizeSchoolQuickDiagnosticDraft(remote.payload as Record<string, unknown>) as Partial<SchoolQuickDiagnosticForm>,
          );
          setServerDraftId(remote.id);
          setServerDraftPublicCode(remote.publicCode);
          await persistServerDraftDiagnosticId(remote.id, remote.publicCode);
          await saveDiagnosticDraft(base);
        } catch {
          /* garde le brouillon local si l’API échoue */
        }
      }

      if (!alive) return;
      const withAuth = mergeSchoolQuickDiagnosticFillEmpty(
        base,
        user ? buildAutofillPatchFromAuthUser(user) : {},
      );
      setForm(withAuth);
      setBooting(false);
    })();
    return () => {
      alive = false;
    };
  }, [user?.firstName, user?.lastName, user?.phone, getValidAccessToken]);

  /** Profil compte (/api/user/profile) : complète les champs vides une fois les villes chargées. */
  useEffect(() => {
    if (booting || citiesLoading || cities.length === 0) return;
    if (profileAutofillDoneRef.current) return;
    profileAutofillDoneRef.current = true;

    let alive = true;
    void (async () => {
      try {
        const token = await getValidAccessToken();
        if (!token) return;
        const profile = await getUserProfile(token);
        if (!alive || !profile) return;
        const patch = buildAutofillPatchFromProfile(profile);
        setForm((prev) => {
          const merged = mergeSchoolQuickDiagnosticFillEmpty(prev, patch);
          if (merged === prev) return prev;
          void saveDiagnosticDraft(merged);
          return merged;
        });
      } catch {
        /* profil optionnel */
      }
    })();
    return () => {
      alive = false;
    };
  }, [booting, citiesLoading, cities.length, getValidAccessToken]);

  useEffect(() => {
    if (!user) profileAutofillDoneRef.current = false;
  }, [user]);

  useEffect(() => {
    let alive = true;
    setCitiesLoading(true);
    void listCities()
      .then((rows) => {
        if (alive) setCities(rows);
      })
      .catch(() => {
        if (alive) setCities([]);
      })
      .finally(() => {
        if (alive) setCitiesLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setSecteursLoading(true);
    void listAllSecteursActive()
      .then((rows) => {
        if (alive) setSecteurs(rows);
      })
      .catch(() => {
        if (alive) setSecteurs([]);
      })
      .finally(() => {
        if (alive) setSecteursLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!submitting) {
      setSubmitMsg(0);
      return;
    }
    const msgs = DIAGNOSTIC_ANALYSIS_MESSAGES[uiLocale];
    const last = msgs.length - 1;
    const t = setInterval(() => {
      setSubmitMsg((m) => (m >= last ? last : m + 1));
    }, 2200);
    return () => clearInterval(t);
  }, [submitting, uiLocale]);

  const update = useCallback(<K extends keyof SchoolQuickDiagnosticForm>(key: K, value: SchoolQuickDiagnosticForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setStepError(null);
  }, []);

  const toggleArray = useCallback((
    key:
      | 'strongSubjects'
      | 'weakSubjects'
      | 'attractedSectors'
      | 'excludedSectors'
      | 'targetStudyLevelIds'
      | 'diplomesSouhaites'
      | 'preferredStudyCityIds',
    id: string,
  ) => {
    setForm((prev) => {
      const arr = Array.isArray(prev[key]) ? [...(prev[key] as string[])] : [];
      const next = arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
      if (key === 'attractedSectors') {
        return { ...prev, attractedSectors: next, excludedSectors: prev.excludedSectors.filter((x) => x !== id) };
      }
      if (key === 'excludedSectors') {
        return { ...prev, excludedSectors: next, attractedSectors: prev.attractedSectors.filter((x) => x !== id) };
      }
      return { ...prev, [key]: next };
    });
    setStepError(null);
  }, []);

  const toggleLang = useCallback((id: string) => {
    setForm((prev) => {
      const arr = [...(prev.acceptedHigherEdLanguages ?? [])];
      if (id === 'no_preference') {
        return { ...prev, acceptedHigherEdLanguages: arr.includes('no_preference') ? [] : ['no_preference'] };
      }
      const base = arr.filter((x) => x !== 'no_preference');
      const on = base.includes(id);
      return { ...prev, acceptedHigherEdLanguages: on ? base.filter((x) => x !== id) : [...base, id] };
    });
    setStepError(null);
  }, []);

  const L = getDiagnosticFormLabels(uiLocale);
  const stepMetaList = useMemo(() => getDiagnosticStepMeta(uiLocale), [uiLocale]);
  const stepShortLabels = useMemo(() => getDiagnosticStepShortLabels(uiLocale), [uiLocale]);

  const pickCommon = useMemo(
    () => ({
      searchPlaceholder: L.search,
      emptyLabel: L.emptyPick,
      allLabel: '—',
      rtl: isRTL,
    }),
    [L, isRTL],
  );

  /** Libellé = nom de ville uniquement (recherche par ville, pas par région). */
  const cityItems: SearchablePickItem[] = useMemo(
    () =>
      cities.map((c) => ({
        id: String(c.id),
        value: String(c.id),
        label: cityDisplayLabel(c, uiLocale),
        subtitle: c.region?.titre,
      })),
    [cities, uiLocale],
  );

  const cityPickCommon = useMemo(
    () => ({
      ...pickCommon,
      searchPlaceholder: L.searchCity,
    }),
    [pickCommon, L.searchCity],
  );

  const pickerSheet = useMemo(() => {
    if (!picker) return null;
    const close = () => setPicker(null);
    /** Exclut les options vides : le sheet ajoute déjà une ligne « — » via `allLabel`. */
    const mapOpts = (opts: { value: string; label: string; labelAr?: string }[]) =>
      opts
        .filter((o) => String(o.value).trim() !== '')
        .map((o) => ({
          id: o.value,
          value: o.value,
          label: pickLabeledOption(opts, o.value, uiLocale),
        }));

    switch (picker) {
      case 'city':
        return (
          <SearchablePickSheet
            visible
            title={L.city}
            items={cityItems}
            selectedValue={form.cityId}
            onPick={(v) => {
              const row = cities.find((c) => String(c.id) === v);
              update('cityId', v);
              update('city', row?.titre ?? '');
              close();
            }}
            onClose={close}
            searchInSubtitle={false}
            {...cityPickCommon}
          />
        );
      case 'prefCities':
        return (
          <SearchablePickSheet
            visible
            title={L.citiesStudy}
            items={cityItems}
            selectedValue={form.preferredStudyCityIds[0] ?? ''}
            onPick={(v) => {
              toggleArray('preferredStudyCityIds', v);
              close();
            }}
            onClose={close}
            searchInSubtitle={false}
            {...cityPickCommon}
          />
        );
      case 'gender':
        return (
          <SearchablePickSheet
            visible
            title={L.gender}
            items={mapOpts(GENDER_OPTIONS)}
            selectedValue={form.gender}
            onPick={(v) => {
              update('gender', v);
              close();
            }}
            onClose={close}
            {...pickCommon}
          />
        );
      case 'studyLevel':
        return (
          <SearchablePickSheet
            visible
            title={L.studyLevel}
            items={mapOpts(
              NIVEAU_ETUDE_OPTIONS.filter((o) => o.value).map((o) => ({ value: o.value, label: o.label })),
            )}
            selectedValue={form.studyLevel}
            onPick={(v) => {
              update('studyLevel', v);
              close();
            }}
            onClose={close}
            {...pickCommon}
          />
        );
      case 'bacStream':
        return (
          <SearchablePickSheet
            visible
            title="Filière"
            items={mapOpts(
              FILIERE_BAC_OPTIONS.filter((o) => o.value).map((o) => ({ value: o.value, label: o.label })),
            )}
            selectedValue={form.bacStream}
            onPick={(v) => {
              update('bacStream', v);
              close();
            }}
            onClose={close}
            {...pickCommon}
          />
        );
      case 'lycee':
        return (
          <SearchablePickSheet
            visible
            title="Type de lycée"
            items={mapOpts(LYCEE_PUBLIC_PRIVE_OPTIONS)}
            selectedValue={form.lyceePublicPrive}
            onPick={(v) => {
              update('lyceePublicPrive', v as SchoolQuickDiagnosticForm['lyceePublicPrive']);
              close();
            }}
            onClose={close}
            {...pickCommon}
          />
        );
      case 'mission1':
      case 'mission2':
      case 'mission3': {
        const key =
          picker === 'mission1'
            ? 'missionSpecialite1'
            : picker === 'mission2'
              ? 'missionSpecialite2'
              : 'missionSpecialite3';
        const items = SPECIALITES_MISSION.map((s) => ({ id: s, value: s, label: s }));
        return (
          <SearchablePickSheet
            visible
            title="Spécialité"
            items={items}
            selectedValue={form[key]}
            onPick={(v) => {
              update(key, v);
              close();
            }}
            onClose={close}
            {...pickCommon}
          />
        );
      }
      default:
        return null;
    }
  }, [
    picker,
    cityItems,
    cities,
    form,
    isRTL,
    uiLocale,
    toggleArray,
    update,
    pickCommon,
    cityPickCommon,
    L,
  ]);

  const stepCtx: DiagnosticStepContext = {
    form,
    setForm,
    isRTL,
    locale: uiLocale,
    update,
    toggleArray,
    toggleLang,
    secteurs,
    cities,
    citiesLoading,
    secteursLoading,
    onOpenCity: () => {
      if (citiesLoading) return;
      setPicker('city');
    },
    onOpenPrefCities: () => {
      if (citiesLoading) return;
      setPicker('prefCities');
    },
    onOpenStudyLevel: () => setPicker('studyLevel'),
    onOpenBacStream: () => setPicker('bacStream'),
    onOpenMissionSp1: () => setPicker('mission1'),
    onOpenMissionSp2: () => setPicker('mission2'),
    onOpenMissionSp3: () => setPicker('mission3'),
    onOpenGender: () => setPicker('gender'),
    onOpenLyceeType: () => setPicker('lycee'),
    registerFocusAnchor,
    onFieldFocus: scrollToFocusedField,
  };

  const persistDraft = useCallback(async (next: SchoolQuickDiagnosticForm) => {
    await saveDiagnosticDraft(next);
  }, []);

  const goNext = async () => {
    const err = validateSchoolDiagnosticStep(step, form);
    if (err) {
      setStepError(err);
      return;
    }
    await persistDraft(form);
    if (step < DIAGNOSTIC_TOTAL_STEPS - 1) {
      if (step === 0) {
        setDraftSaving(true);
        try {
          const token = await getValidAccessToken();
          if (serverDraftId == null) {
            const { id, publicCode } = await createSchoolDiagnosticDraft(serverPayload, token);
            setServerDraftId(id);
            setServerDraftPublicCode(publicCode);
            await persistServerDraftDiagnosticId(id, publicCode);
          } else {
            await updateSchoolDiagnosticDraft(serverDraftId, serverPayload, token, serverDraftPublicCode);
          }
        } catch (e) {
          setStepError(getUserFacingApiError(e, t, { context: 'diagnostic' }));
          setDraftSaving(false);
          return;
        }
        setDraftSaving(false);
      } else if (serverDraftId != null) {
        const token = await getValidAccessToken();
        void updateSchoolDiagnosticDraft(serverDraftId, serverPayload, token, serverDraftPublicCode).catch(
          () => undefined,
        );
      }
      setStep((s) => s + 1);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: 0, animated: false }));
      return;
    }
    await onSubmit();
  };

  const goPrev = useCallback(() => {
    setStepError(null);
    setStep((s) => Math.max(0, s - 1));
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: 0, animated: false }));
  }, []);

  const onSubmit = () => {
    setStepError(null);
    const started = runSchoolDiagnosticBackgroundSubmit({
      userId: user?.id ?? null,
      execute: async () => {
        const token = await getValidAccessToken();
        return serverDraftId != null
          ? await finalizeSchoolDiagnosticDraft(
              serverDraftId,
              serverPayload,
              token,
              serverDraftPublicCode,
            )
          : await submitSchoolRecommendationDiagnostic(serverPayload, token);
      },
      afterSuccess: async () => {
        const token = await getValidAccessToken();
        if (token) {
          await Promise.all([
            postPlanReussiteStep(token, 'quickDiagnosticCompleted'),
            postPlanReussiteStep(token, 'orientationDiagnostic'),
          ]).catch(() => undefined);
        }
        await clearDiagnosticDraft();
      },
    });
    if (!started) {
      Alert.alert('Diagnostic', 'Une analyse est déjà en cours.');
    }
  };

  const stepMeta = stepMetaList[step] ?? stepMetaList[0]!;
  const isLastStep = step === DIAGNOSTIC_TOTAL_STEPS - 1;

  if (booting) {
    return <DiagnosticLoadingView variant="boot" rtl={isRTL} locale={uiLocale} />;
  }

  if (submitting) {
    return (
      <DiagnosticLoadingView
        variant="analysis"
        messageIndex={submitMsg}
        progressPercent={submitProgress}
        rtl={isRTL}
        locale={uiLocale}
        footerAction={{
          label: uiLocale === 'ar' ? 'متابعة في الخلفية' : 'Continuer en arrière-plan',
          hint:
            uiLocale === 'ar'
              ? 'يستمر التحليل حتى لو غادرت هذه الشاشة.'
              : 'L’analyse continue même si vous quittez cet écran.',
          onPress: leaveAnalysisInBackground,
        }}
      />
    );
  }

  return (
    <View style={[styles.root, isRTL && styles.rootRtl]}>
      <DiagnosticStatusBar />
      <View style={styles.headerShell}>
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.88 }]}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={L.back}>
            <FontAwesome
              name={isRTL ? 'chevron-right' : 'chevron-left'}
              size={16}
              color={brand.primary}
            />
          </Pressable>
          <View style={styles.headerTitles}>
            <Text style={[styles.headerTitle, isRTL && styles.rtlText]}>{L.wizardTitle}</Text>
            <Text style={[styles.headerSub, isRTL && styles.rtlText]}>{L.wizardSub}</Text>
          </View>
        </View>
        <DiagnosticStepProgressBar
          step={step}
          total={DIAGNOSTIC_TOTAL_STEPS}
          labels={stepShortLabels}
          rtl={isRTL}
        />
      </SafeAreaView>
      </View>

      <View style={styles.keyboardAvoid}>
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            showsVerticalScrollIndicator={false}>
            <View ref={scrollContentRef} collapsable={false}>
              <DiagnosticStepHeader
                icon={stepMeta.icon}
                title={stepMeta.title}
                subtitle={stepMeta.subtitle}
                rtl={isRTL}
                stepNumber={step + 1}
                stepTotal={DIAGNOSTIC_TOTAL_STEPS}
              />
              <View style={[styles.formCard, isRTL && styles.formCardRtl]}>
                <SchoolDiagnosticStepContent step={step} ctx={stepCtx} />
              </View>
              <KeyboardAwareBottomSpacer minPaddingWhenKeyboardClosed={72} />
            </View>
          </ScrollView>

          <SafeAreaView edges={['bottom']} style={styles.footerSafe}>
          {stepError ? (
            <View style={styles.footerErrorWrap}>
              <FontAwesome name="exclamation-circle" size={14} color={brand.error} />
              <Text style={[styles.footerErrorTxt, isRTL && styles.rtlText]} numberOfLines={3}>
                {stepError}
              </Text>
            </View>
          ) : null}
          <View style={styles.footer}>
            <Pressable
              onPress={goPrev}
              disabled={step === 0 || draftSaving}
              style={({ pressed }) => [
                styles.btnSecondary,
                step === 0 && styles.btnDisabled,
                pressed && step > 0 && { opacity: 0.9 },
              ]}>
              <FontAwesome
                name={isRTL ? 'arrow-right' : 'arrow-left'}
                size={14}
                color={brand.primary}
              />
              <Text style={[styles.btnSecondaryTxt, isRTL && styles.rtlText]}>{L.back}</Text>
            </Pressable>
            <Pressable
              onPress={() => void goNext()}
              disabled={draftSaving}
              style={({ pressed }) => [
                styles.btnPrimary,
                isLastStep && styles.btnPrimaryFinish,
                draftSaving && styles.btnDisabled,
                pressed && { opacity: 0.92 },
              ]}>
              {draftSaving ? (
                <View style={styles.btnSavingInner}>
                  <ActivityIndicator color={brand.white} size="small" />
                  <Text style={[styles.btnPrimaryTxt, isRTL && styles.rtlText]}>{L.saving}</Text>
                </View>
              ) : (
                <>
                  <Text style={[styles.btnPrimaryTxt, isRTL && styles.rtlText]}>
                    {isLastStep ? L.seeRecommendations : L.continue}
                  </Text>
                  <FontAwesome
                    name={isRTL ? 'chevron-left' : 'chevron-right'}
                    size={14}
                    color={brand.white}
                  />
                </>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
        </View>

      {pickerSheet}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: diagnosticTheme.surfaceSoft },
  rootRtl: { direction: 'rtl' },
  rtlText: { writingDirection: 'rtl', textAlign: 'right' },
  btnSavingInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerShell: {
    backgroundColor: diagnosticTheme.headerBg,
  },
  headerSafe: {
    backgroundColor: diagnosticTheme.headerBg,
    paddingBottom: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  headerTitles: { flex: 1, minWidth: 0, paddingTop: 2 },
  headerTitlesRtl: { alignItems: 'flex-end' },
  headerTitle: { fontSize: fontSize.xl, fontWeight: '800', color: brand.white, letterSpacing: -0.4 },
  headerSub: {
    fontSize: fontSize.sm,
    color: diagnosticTheme.headerMuted,
    marginTop: 6,
    lineHeight: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  keyboardAvoid: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  formCard: {
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(51, 62, 143, 0.1)',
    shadowColor: '#333E8F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  formCardRtl: {
    direction: 'rtl',
    alignItems: 'stretch',
  },
  footerSafe: {
    backgroundColor: brand.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: homeShell.borderOnWhite,
  },
  footerErrorWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  footerErrorTxt: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#B91C1C',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: brand.primary,
    borderRadius: radius.lg,
    paddingVertical: 15,
    paddingHorizontal: spacing.md,
  },
  btnPrimaryFinish: {
    backgroundColor: homeShell.green,
  },
  btnPrimaryTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.sm },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 15,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: homeShell.borderOnWhite,
    backgroundColor: brand.white,
  },
  btnSecondaryTxt: { color: brand.primary, fontWeight: '700', fontSize: fontSize.sm },
  btnDisabled: { opacity: 0.45 },
});
