import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect, router } from 'expo-router';
import {
  Alert,
  InteractionManager,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { SchoolDiagnosticPendingNavigation } from '@/components/diagnostic/SchoolDiagnosticPendingNavigation';
import { LoadErrorState, loadErrorRetryLabel } from '@/components/ui/LoadErrorState';
import { HomeLatestAnnouncementsSection } from '@/components/home/HomeLatestAnnouncementsSection';
import { HomeMostVisitedSchoolsSection } from '@/components/home/HomeMostVisitedSchoolsSection';
import { HomeOrientationAccessSection } from '@/components/home/HomeOrientationAccessSection';
import { HomePracticalInfoSection, type PracticalInfoItem } from '@/components/home/HomePracticalInfoSection';
import {
  HomeStackedPackCards,
  type OrientationOverviewOpenPayload,
} from '@/components/home/HomeStackedPackCards';
import { OrientationParcoursSheet } from '@/components/home/OrientationParcoursSheet';
import { HomeGreetingBlock } from '@/components/home/HomeGreetingBlock';
import { HomeGreetingBlockSkeleton } from '@/components/home/HomeGreetingBlockSkeleton';
import { HomeRefreshChip } from '@/components/home/HomeRefreshChip';
import { HomeTopBackdrop } from '@/components/home/HomeTopBackdrop';
import { HomeTopBar } from '@/components/home/HomeTopBar';
import { StoriesRow } from '@/components/home/StoriesRow';
import { StoryViewerModal } from '@/components/stories/StoryViewerModal';
import { homeStackCardsForLocale, type StoryChannel } from '@/data/mock/homeFeed';
import { buildTabBarStyle } from '@/theme/tabBar';
import type { AppLocale } from '@/constants/i18n';
import { useLocale } from '@/contexts/LocaleContext';
import { useAppSidebar } from '@/contexts/AppSidebarContext';
import { useNotificationsDrawer } from '@/contexts/NotificationsDrawerContext';
import { useAuth } from '@/contexts/AuthContext';
import { invalidateEligibilityProfileCache, useEligibilityProfile } from '@/hooks/useEligibilityProfile';
import { useStoryReadChannels } from '@/hooks/useStoryReadChannels';
import { getMobileVisitorId } from '@/utils/visitorId';
import { navigatePracticalLink } from '@/utils/navigatePracticalLink';
import {
  getTassjilPracticalLinkLock,
  isTassjilPracticalLinkId,
} from '@/utils/tassjilPracticalLinkLock';
import { buildApiUrl, isDevApiBaseUrl } from '@/constants/api';
import { PRACTICAL_LINK_DEFS } from '@/constants/practicalLinks';
import {
  BAC_RESULTS_STATIC_DEFAULT,
  orderHomeStackCards,
  type BacResultsCardConfig,
  type BacVerificationChannel,
} from '@/constants/bacResultsCard';
import { BacResultsThresholdsModal } from '@/components/home/BacResultsThresholdsModal';
import { BacResultsVerificationModal } from '@/components/home/BacResultsVerificationModal';
import { useBacResultsMassar } from '@/hooks/useBacResultsMassar';
import {
  PLAN_PARCOURS_STEP_IDS,
  resolvePlanParcoursState,
  type PlanParcoursCompletion,
  type PlanParcoursStepId,
} from '@/constants/orientationParcours';
import { fetchPlanParcoursCompletion } from '@/services/planParcours';
import { resetPlanParcoursStepDev } from '@/services/planReussiteSteps';
import { useParcoursFeedback } from '@/contexts/ParcoursFeedbackContext';
import { navigatePlanParcoursStep, type PlanParcoursNavigationAuth } from '@/utils/planParcoursNavigation';
import { TAWJIH_PLUS_PRODUCT_PATH } from '@/constants/tawjihPlusAccess';
import { useTawjihPlusAccess } from '@/hooks/useTawjihPlusAccess';
import {
  guardTawjihPlusParcoursStep,
  type TawjihPlusParcoursGate,
  guardDailyChallengeAccess,
} from '@/utils/tawjihPlusParcoursGate';
import { httpGetJson } from '@/services/http';
import { buildHomePlanParcoursData } from '@/utils/orientationParcoursTasks';
import {
  fetchStoryChannels,
  invalidateStoryChannelsCache,
  peekCachedStoryChannels,
  recordStoryEvent,
} from '@/services/stories';
import { fetchDailyChallengeToday } from '@/services/dailyChallenge';
import {
  clearContestAnnouncementsListCache,
  fetchContestAnnouncements,
  fetchContestAnnouncementsCached,
  type ContestAnnouncementCard,
} from '@/services/contestAnnouncements';
import {
  fetchMostVisitedEstablishments,
  type MostVisitedEstablishment,
} from '@/services/establishments';
import { fetchUserActiveServices, type UserActiveCommercialService } from '@/services/userActiveServices';
import { fetchBacResultsConfig } from '@/services/bacResults';
import {
  formatOrientation1BacUnlockDate,
  isOrientation1BacUnlocked,
} from '@/constants/orientation1bacAccess';
import { isPremiereBacNiveau } from '@/utils/academicFiliere';
import { buildHomeAcademicSubtitleParts, simplifiedFiliereLabel, simplifiedStudyLevelLabel } from '@/utils/homeUserSubtitle';
import { getUserFacingLoadError } from '@/utils/apiError';
import { Text } from '@/components/ui/Text';
import { homeShell } from '@/theme/homeShell';
import { brand, radius, spacing } from '@/theme/tokens';
import { isHomeHeroWideLayout } from '@/utils/homeTopBackdropLayout';

const H_PAD = spacing.xl;

export default function IndexScreen() {
  const { t, isRTL, locale } = useLocale();
  const { open: openSidebar } = useAppSidebar();
  const { unreadCount: notifUnreadCount, openDrawer, refreshUnread } = useNotificationsDrawer();
  const { user, isLoading, getValidAccessToken, reloadMe } = useAuth();
  const { openParcoursFeedback } = useParcoursFeedback();
  const {
    hasAccess: hasTawjihPlusAccess,
    loading: tawjihPlusLoading,
    refresh: refreshTawjihPlusAccess,
  } = useTawjihPlusAccess();
  const {
    profile: eligibilityProfile,
    loading: eligibilityLoading,
    refetch: refetchEligibilityProfile,
  } = useEligibilityProfile();
  const [activeServices, setActiveServices] = useState<UserActiveCommercialService[]>([]);
  const [activeServicesLoading, setActiveServicesLoading] = useState(false);
  const [homeLoadError, setHomeLoadError] = useState<string | null>(null);
  const [mostVisitedSchools, setMostVisitedSchools] = useState<MostVisitedEstablishment[]>([]);
  const [mostVisitedLoading, setMostVisitedLoading] = useState(true);
  const [latestAnnouncements, setLatestAnnouncements] = useState<ContestAnnouncementCard[]>([]);
  const [latestAnnouncementsLoading, setLatestAnnouncementsLoading] = useState(true);
  const [homeRefreshing, setHomeRefreshing] = useState(false);
  const [bacResultsConfig, setBacResultsConfig] = useState<BacResultsCardConfig>(
    BAC_RESULTS_STATIC_DEFAULT,
  );
  const [bacResultsLoading, setBacResultsLoading] = useState(true);
  const homeRefreshInFlightRef = useRef(false);
  const planParcoursLoadGenRef = useRef(0);
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const heroWide = isHomeHeroWideLayout(screenW);
  const stackCardW = heroWide ? Math.min(screenW - 2 * H_PAD, 720) : screenW - 2 * H_PAD;
  const { readIds, markChannelRead } = useStoryReadChannels();
  const navigation = useNavigation();
  const [storyViewer, setStoryViewer] = useState<{ open: boolean; index: number }>({
    open: false,
    index: 0,
  });
  const [storyChannels, setStoryChannels] = useState<StoryChannel[]>([]);

  /** Plein écran stories : masquer la barre d’onglets, puis restaurer le fond blanc explicitement. */
  useLayoutEffect(() => {
    const visibleStyle = buildTabBarStyle(insets.bottom);
    navigation.setOptions({
      tabBarStyle: storyViewer.open ? { display: 'none' } : visibleStyle,
    });
    return () => {
      navigation.setOptions({ tabBarStyle: visibleStyle });
    };
  }, [navigation, storyViewer.open, insets.bottom]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [analyticsVisitorId, setAnalyticsVisitorId] = useState<string | null>(null);
  const feedTrackedIdsRef = useRef<Set<string>>(new Set());
  const userLoggedInRef = useRef(Boolean(user));
  userLoggedInRef.current = Boolean(user);

  useEffect(() => {
    void getMobileVisitorId().then(setAnalyticsVisitorId);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshUnread();
    }, [refreshUnread]),
  );

  const userId = user?.id ?? null;
  const getValidAccessTokenRef = useRef(getValidAccessToken);
  getValidAccessTokenRef.current = getValidAccessToken;
  const tRef = useRef(t);
  tRef.current = t;
  const activeServicesLoadGenRef = useRef(0);

  const loadActiveServices = useCallback(async () => {
    const gen = ++activeServicesLoadGenRef.current;
    if (!userId) {
      setActiveServices((prev) => (prev.length === 0 ? prev : []));
      setActiveServicesLoading(false);
      return;
    }
    const token = await getValidAccessTokenRef.current();
    if (gen !== activeServicesLoadGenRef.current) return;
    if (!token) {
      setActiveServices((prev) => (prev.length === 0 ? prev : []));
      setActiveServicesLoading(false);
      return;
    }
    setActiveServicesLoading(true);
    try {
      const items = await fetchUserActiveServices(token, { highestTierOnly: true });
      if (gen !== activeServicesLoadGenRef.current) return;
      setActiveServices(items);
    } catch (e) {
      if (gen !== activeServicesLoadGenRef.current) return;
      setActiveServices((prev) => (prev.length === 0 ? prev : []));
      if (userLoggedInRef.current) {
        setHomeLoadError(getUserFacingLoadError(e, tRef.current, { context: 'generic' }));
      }
    } finally {
      if (gen === activeServicesLoadGenRef.current) {
        setActiveServicesLoading(false);
      }
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      void loadActiveServices();
      return () => {
        activeServicesLoadGenRef.current += 1;
      };
    }, [loadActiveServices]),
  );

  const storiesFetchGenRef = useRef(0);
  const storiesBootstrappedRef = useRef(false);
  const storiesHomeFocusedOnceRef = useRef(false);

  const refreshStories = useCallback(
    async (options?: { showLoading?: boolean; force?: boolean; targetLocale?: AppLocale }) => {
      const targetLocale = options?.targetLocale ?? locale;
      const apiLocale = targetLocale === 'ar' ? 'ar' : 'fr';
      const gen = ++storiesFetchGenRef.current;

      const cached = !options?.force ? peekCachedStoryChannels(apiLocale) : null;
      if (cached) {
        setStoryChannels(cached);
        setStoriesLoading(false);
      } else {
        setStoryChannels([]);
      }

      const showSkeleton = Boolean(options?.showLoading) && !cached;
      if (showSkeleton) setStoriesLoading(true);

      try {
        const remote = await fetchStoryChannels(apiLocale);
        if (gen !== storiesFetchGenRef.current) return;
        setStoryChannels(remote);
      } catch {
        if (gen !== storiesFetchGenRef.current) return;
        setStoryChannels(cached ?? []);
      } finally {
        if (gen === storiesFetchGenRef.current) {
          setStoriesLoading(false);
        }
      }
    },
    [locale],
  );

  useEffect(() => {
    const isFirstLoad = !storiesBootstrappedRef.current;
    storiesBootstrappedRef.current = true;

    if (isFirstLoad) {
      let cancelled = false;
      const task = InteractionManager.runAfterInteractions(() => {
        if (cancelled) return;
        void refreshStories({ showLoading: true, targetLocale: locale });
      });
      return () => {
        cancelled = true;
        task.cancel();
        storiesFetchGenRef.current += 1;
      };
    }

    // Changement FR ↔ AR : cache immédiat si dispo, sinon skeleton puis API.
    void refreshStories({ showLoading: true, targetLocale: locale });
    return () => {
      storiesFetchGenRef.current += 1;
    };
  }, [locale, refreshStories]);

  /** Retour sur l’accueil : réappliquer le cache et terminer un chargement interrompu. */
  useFocusEffect(
    useCallback(() => {
      if (!storiesHomeFocusedOnceRef.current) {
        storiesHomeFocusedOnceRef.current = true;
        return;
      }
      void refreshStories({ showLoading: false, targetLocale: locale });
    }, [locale, refreshStories]),
  );

  const storyChannelIdsKey = useMemo(
    () => storyChannels.map((ch) => ch.id).join('\u0001'),
    [storyChannels],
  );

  /** Impressions « bande » stories (anneaux) — une fois par chaîne et session. */
  useEffect(() => {
    if (!analyticsVisitorId || !storyChannelIdsKey) return;
    for (const channelId of storyChannelIdsKey.split('\u0001')) {
      if (!channelId || feedTrackedIdsRef.current.has(channelId)) continue;
      feedTrackedIdsRef.current.add(channelId);
      void recordStoryEvent('feed_impression', {
        channelId,
        visitorId: analyticsVisitorId,
        viewport: 'mobile',
      });
    }
  }, [analyticsVisitorId, storyChannelIdsKey]);
  const [dailyOverlay, setDailyOverlay] = useState<{ playedToday: boolean; streakDays?: number } | null>(null);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [planParcoursCompletion, setPlanParcoursCompletion] = useState<Awaited<
    ReturnType<typeof fetchPlanParcoursCompletion>
  > | null>(null);
  const [planParcoursLoading, setPlanParcoursLoading] = useState(true);
  const [orientationSheet, setOrientationSheet] = useState<{
    visible: boolean;
    title: string;
  }>({
    visible: false,
    title: '',
  });
  const [bacVerification, setBacVerification] = useState<{
    visible: boolean;
    channel: BacVerificationChannel | null;
  }>({ visible: false, channel: null });
  const [bacThresholdsOpen, setBacThresholdsOpen] = useState(false);
  const {
    massarCode: bacMassarCode,
    loading: bacMassarLoading,
    saving: bacMassarSaving,
    confirmMassar: confirmBacMassar,
  } = useBacResultsMassar();

  const planCompletionForUi = useMemo((): PlanParcoursCompletion => {
    return {
      ...(planParcoursCompletion ?? {
        orientationDiagnosticComplete: false,
        recommendationComplete: false,
        recommendationFollowCount: 0,
        feedbackComplete: false,
        applyToSchoolsComplete: false,
        inviteFriendComplete: false,
        inviteFriendQualifiedCount: 0,
      }),
      accountSetupComplete:
        planParcoursCompletion?.accountSetupComplete ?? Boolean(user?.is_setup),
    };
  }, [planParcoursCompletion, user?.is_setup]);

  const planParcoursInitialLoading = planParcoursLoading && planParcoursCompletion === null;

  const parcoursUiState = useMemo(
    () => resolvePlanParcoursState(planCompletionForUi),
    [planCompletionForUi],
  );

  const planParcoursNavAuth = useMemo<PlanParcoursNavigationAuth>(
    () => ({
      getValidAccessToken,
      userId: user?.id ?? null,
      uiLocale: locale === 'ar' ? 'ar' : 'fr',
    }),
    [getValidAccessToken, user?.id, locale],
  );

  const openTawjihPlusProduct = useCallback(() => {
    router.push(TAWJIH_PLUS_PRODUCT_PATH as never);
  }, []);

  const tawjihPlusGate = useMemo<TawjihPlusParcoursGate>(
    () => ({
      hasAccess: hasTawjihPlusAccess,
      loading: tawjihPlusLoading,
      openProduct: openTawjihPlusProduct,
      t,
    }),
    [hasTawjihPlusAccess, openTawjihPlusProduct, t, tawjihPlusLoading],
  );

  const orientationSheetTitle = useMemo(
    () =>
      homeStackCardsForLocale(locale).find((c) => c.orientationProgress)?.packName ??
      t('orientationProgressLabel'),
    [locale, t],
  );

  const orientationSheetLoading =
    orientationSheet.visible && (planParcoursInitialLoading || planParcoursLoading);

  const orientationSheetTasks = useMemo(() => {
    if (!orientationSheet.visible || orientationSheetLoading) return undefined;
    return buildHomePlanParcoursData({ completion: planCompletionForUi }, t).remainingTasks;
  }, [orientationSheet.visible, orientationSheetLoading, planCompletionForUi, t]);

  const openOrientationOverview = useCallback(
    (payload?: OrientationOverviewOpenPayload) => {
      setOrientationSheet({
        visible: true,
        title: payload?.title || orientationSheetTitle,
      });
    },
    [orientationSheetTitle],
  );

  const openOrientationParcoursSheet = useCallback(() => {
    openOrientationOverview({
      title: orientationSheetTitle,
      completion: planCompletionForUi,
    });
  }, [openOrientationOverview, orientationSheetTitle, planCompletionForUi]);

  const closeOrientationOverview = useCallback(() => {
    setOrientationSheet((s) => ({ ...s, visible: false }));
  }, []);

  const openBacVerification = useCallback((channel: BacVerificationChannel) => {
    setBacVerification({ visible: true, channel });
  }, []);

  const closeBacVerification = useCallback(() => {
    setBacVerification((s) => ({ ...s, visible: false }));
  }, []);

  const openBacThresholds = useCallback(() => {
    setBacThresholdsOpen(true);
  }, []);

  const closeBacThresholds = useCallback(() => {
    setBacThresholdsOpen(false);
  }, []);

  const refreshPlanParcours = useCallback(async (): Promise<PlanParcoursCompletion> => {
    const gen = ++planParcoursLoadGenRef.current;
    setPlanParcoursLoading(true);
    try {
      const token = await getValidAccessToken();
      let accountSetupComplete = Boolean(user?.is_setup);
      if (token) {
        try {
          const res = await httpGetJson<{ success?: boolean; data?: { user?: { is_setup?: boolean } } }>(
            buildApiUrl('/api/me'),
            { headers: { Authorization: `Bearer ${token}` } },
          );
          accountSetupComplete = Boolean(res.data?.user?.is_setup);
        } catch {
          /* conserve la valeur locale */
        }
      }
      const completion = await fetchPlanParcoursCompletion(token, accountSetupComplete);
      if (gen === planParcoursLoadGenRef.current) {
        setPlanParcoursCompletion(completion);
      }
      return completion;
    } finally {
      if (gen === planParcoursLoadGenRef.current) {
        setPlanParcoursLoading(false);
      }
    }
  }, [getValidAccessToken, user?.is_setup]);

  const handleOrientationStep = useCallback(
    (stepId: PlanParcoursStepId) => {
      closeOrientationOverview();
      if (stepId === PLAN_PARCOURS_STEP_IDS.feedback) {
        guardTawjihPlusParcoursStep(stepId, tawjihPlusGate, () => {
          openParcoursFeedback({
            onSubmitted: () => void refreshPlanParcours(),
          });
        });
        return;
      }
      navigatePlanParcoursStep(stepId, planParcoursNavAuth, tawjihPlusGate);
    },
    [
      closeOrientationOverview,
      openParcoursFeedback,
      planParcoursNavAuth,
      refreshPlanParcours,
      tawjihPlusGate,
    ],
  );

  const loadDailyChallenge = useCallback(async () => {
    setDailyLoading(true);
        try {
          const token = await getValidAccessToken();
          const res = await fetchDailyChallengeToday(token);
      if (!res.success) {
        setDailyOverlay(null);
        return;
      }
          const d = res.data;
          if (!d.available || !d.challengeDate) {
        setDailyOverlay(null);
            return;
          }
          const rawStreak = d.streak?.current;
          const streakDays =
        userLoggedInRef.current && typeof rawStreak === 'number' && rawStreak > 0
              ? Math.min(9999, Math.floor(rawStreak))
              : undefined;
            setDailyOverlay({
              playedToday: Boolean(d.allGamesPlayed ?? d.playedToday),
              ...(streakDays != null ? { streakDays } : {}),
            });
    } catch (e) {
      if (userLoggedInRef.current) {
        setHomeLoadError(getUserFacingLoadError(e, tRef.current, { context: 'dailyChallenge' }));
      }
      setDailyOverlay(null);
    } finally {
      setDailyLoading(false);
    }
  }, [getValidAccessToken]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      const task = InteractionManager.runAfterInteractions(() => {
        void (async () => {
          if (!alive) return;
          await loadDailyChallenge();
        })();
      });
      return () => {
        alive = false;
        task.cancel();
      };
    }, [loadDailyChallenge]),
  );

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      const task = InteractionManager.runAfterInteractions(() => {
        void (async () => {
          if (!alive) return;
          try {
            await refreshPlanParcours();
          } catch {
            if (alive) setPlanParcoursCompletion(null);
          }
        })();
      });
      return () => {
        alive = false;
        task.cancel();
      };
    }, [refreshPlanParcours]),
  );

  const handleDevResetPlanStep = useCallback(
    async (stepId: PlanParcoursStepId) => {
      const token = await getValidAccessToken();
      if (!token) {
        throw new Error('Non connecté');
      }
      await resetPlanParcoursStepDev(token, stepId);
      if (stepId === PLAN_PARCOURS_STEP_IDS.accountSetup) {
        await reloadMe();
      }
      const completion = await refreshPlanParcours();
      setOrientationSheet((s) => ({ ...s, completion }));
    },
    [getValidAccessToken, reloadMe, refreshPlanParcours],
  );

  const stackCards = useMemo(() => {
    const base = orderHomeStackCards(
      homeStackCardsForLocale(locale),
      bacResultsConfig.bacCardFirst,
    );
    const completion = planCompletionForUi;
    const packLoading = planParcoursInitialLoading;
    const dailyCardLoading = dailyLoading || homeRefreshing;
    const showLegacyTassjil = Boolean(
      user?.legacyLink?.hasTassjilCandidate || user?.legacyLink?.linked,
    );
    return base.map((card) => {
      const isParcoursCard =
        card.id === 'stack-1' || card.orientationProgress != null;
      const dailyPatch =
        isParcoursCard && card.dailyActions
          ? {
              dailyActions: {
                ...card.dailyActions,
                loading: dailyCardLoading,
                ...(dailyOverlay && !dailyCardLoading
                  ? { playedToday: dailyOverlay.playedToday, streakDays: dailyOverlay.streakDays }
                  : {}),
              },
            }
          : {};

      if (card.bacResults != null || card.id === 'stack-bac-results') {
        return {
          ...card,
          bacResults: bacResultsConfig,
          bacResultsLoading,
          ...dailyPatch,
        };
      }

      if (!isParcoursCard || !card.orientationProgress) {
        return { ...card, ...dailyPatch };
      }

      const parcours = buildHomePlanParcoursData({ completion }, t);
      const profile = eligibilityProfile;
      const appLocale = locale === 'ar' ? 'ar' : 'fr';
      const showOrientation1BacBtn =
        Boolean(profile?.bacType === 'normal' && profile?.niveau && isPremiereBacNiveau(profile.niveau));
      const unlockLabel = formatOrientation1BacUnlockDate(appLocale);
      const filiereShort = profile ? simplifiedFiliereLabel(profile.filiere ?? '', appLocale) : '';
      const niveauShort = profile ? simplifiedStudyLevelLabel(profile.niveau ?? '', appLocale) : '';
      const academicPackLine =
        filiereShort && niveauShort
          ? t('homePackAcademicLine').replace('{filiere}', filiereShort).replace('{niveau}', niveauShort)
          : filiereShort || niveauShort || undefined;

      return {
        ...card,
        ...dailyPatch,
        academicPackLine,
        planParcoursCompletion: parcours.completion,
        orientationProgress: {
          ...card.orientationProgress,
          percent: parcours.totalPercent,
          loading: packLoading,
        },
        remainingOrientationTasks: parcours.remainingTasks,
        dailyActions: card.dailyActions
          ? {
              ...card.dailyActions,
              ...(dailyPatch.dailyActions ?? {}),
              showOrientation1Bac: showOrientation1BacBtn,
              orientation1BacLocked: !isOrientation1BacUnlocked(),
              orientation1BacUnlockLabel: unlockLabel,
              showTassjilTrack: showLegacyTassjil,
            }
          : card.dailyActions,
      };
    });
  }, [
    locale,
    dailyOverlay,
    dailyLoading,
    homeRefreshing,
    planCompletionForUi,
    planParcoursInitialLoading,
    bacResultsConfig,
    bacResultsLoading,
    eligibilityProfile,
    t,
    user?.legacyLink?.hasTassjilCandidate,
    user?.legacyLink?.linked,
  ]);

  const onPressOrientation1Bac = useCallback(() => {
    const unlockLabel = formatOrientation1BacUnlockDate(locale === 'ar' ? 'ar' : 'fr');
    if (!isOrientation1BacUnlocked()) {
      Alert.alert(
        t('orientation1BacHomeButton'),
        t('orientation1BacHomeLocked').replace('{date}', unlockLabel),
      );
      return;
    }
    router.push('/orientation-1bac' as never);
  }, [locale, t]);

  const practicalItems = useMemo((): PracticalInfoItem[] => {
    const tassjilLock = getTassjilPracticalLinkLock(user?.legacyLink);
    return PRACTICAL_LINK_DEFS.map((d) => {
      const lock = isTassjilPracticalLinkId(d.id) ? tassjilLock : null;
      return {
        id: d.id,
        label: t(d.labelKey),
        description: '',
        icon: d.icon,
        accent: d.accent,
        ...(lock?.locked ? { locked: true, lockReasonKey: lock.reasonKey } : {}),
      };
    });
  }, [t, user?.legacyLink]);

  const onPressPracticalItem = useCallback(
    (id: string) => {
      if (isTassjilPracticalLinkId(id)) {
        const lock = getTassjilPracticalLinkLock(user?.legacyLink);
        if (lock.locked && lock.reasonKey) {
          Alert.alert(t('practical_ecolesInscription_locked_title'), t(lock.reasonKey), [
            { text: t('closeOverlayA11y'), style: 'cancel' },
          ]);
          return;
        }
      }
      navigatePracticalLink(
        (href) => router.push(href as never),
        id,
        planParcoursNavAuth,
        tawjihPlusGate,
      );
    },
    [planParcoursNavAuth, tawjihPlusGate, t, user?.legacyLink],
  );

  const onPressLatestAnnouncement = useCallback(
    (item: ContestAnnouncementCard) => {
      guardTawjihPlusParcoursStep(PLAN_PARCOURS_STEP_IDS.applyToSchools, tawjihPlusGate, () => {
        router.push(`/inscriptions/${item.id}` as never);
      });
    },
    [tawjihPlusGate],
  );

  const openInscriptionsTab = useCallback(() => {
    guardTawjihPlusParcoursStep(PLAN_PARCOURS_STEP_IDS.applyToSchools, tawjihPlusGate, () => {
      router.push('/(tabs)/inscriptions' as never);
    });
  }, [tawjihPlusGate]);

  const homeFeedLoadGenRef = useRef(0);
  const bacResultsLoadGenRef = useRef(0);

  const loadBacResultsConfig = useCallback(async (options?: { force?: boolean }) => {
    const gen = ++bacResultsLoadGenRef.current;
    setBacResultsLoading(true);
    try {
      const config = await fetchBacResultsConfig(options);
      if (gen !== bacResultsLoadGenRef.current) return;
      setBacResultsConfig(config);
    } finally {
      if (gen === bacResultsLoadGenRef.current) {
        setBacResultsLoading(false);
      }
    }
  }, []);

  const loadHomeFeedSections = useCallback(async (options?: { force?: boolean }) => {
    const gen = ++homeFeedLoadGenRef.current;
    setMostVisitedLoading(true);
    setLatestAnnouncementsLoading(true);
    try {
      if (options?.force) {
        clearContestAnnouncementsListCache();
      }
      const token = await getValidAccessTokenRef.current();
      const [schools, announcementsResult] = await Promise.all([
        fetchMostVisitedEstablishments(10),
        options?.force
          ? fetchContestAnnouncements({ accessToken: token })
          : fetchContestAnnouncementsCached(token),
      ]);
      if (gen !== homeFeedLoadGenRef.current) return;
      setMostVisitedSchools(schools);
      setLatestAnnouncements(announcementsResult.items);
    } catch (e) {
      if (gen !== homeFeedLoadGenRef.current) return;
      setMostVisitedSchools([]);
      setLatestAnnouncements([]);
      setHomeLoadError(getUserFacingLoadError(e, tRef.current, { context: 'generic' }));
    } finally {
      if (gen === homeFeedLoadGenRef.current) {
        setMostVisitedLoading(false);
        setLatestAnnouncementsLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadHomeFeedSections();
      void loadBacResultsConfig();
    }, [loadHomeFeedSections, loadBacResultsConfig]),
  );

  const onPressMostVisitedSchool = useCallback((item: MostVisitedEstablishment, index: number) => {
    router.push({
      pathname: `/etablissements/${item.id}/${item.slug ?? ''}`,
      params: { listIdx: String(index) },
    } as never);
  }, []);

  const refreshHome = useCallback(async () => {
    if (homeRefreshInFlightRef.current) return;
    homeRefreshInFlightRef.current = true;
    setHomeRefreshing(true);
    setHomeLoadError(null);
    try {
      invalidateEligibilityProfileCache();
      await Promise.all([
        loadActiveServices(),
        refreshUnread({ force: true }),
        loadHomeFeedSections({ force: true }),
        (() => {
          invalidateStoryChannelsCache();
          return refreshStories({ showLoading: false, force: true });
        })(),
        loadDailyChallenge(),
        loadBacResultsConfig({ force: true }),
        refreshTawjihPlusAccess(),
        user ? reloadMe() : Promise.resolve(),
      ]);
      await Promise.all([
        user ? refetchEligibilityProfile() : Promise.resolve(),
        refreshPlanParcours(),
      ]);
    } finally {
      homeRefreshInFlightRef.current = false;
      setHomeRefreshing(false);
    }
  }, [
    loadActiveServices,
    refreshUnread,
    loadHomeFeedSections,
    refreshStories,
    loadDailyChallenge,
    loadBacResultsConfig,
    refreshPlanParcours,
    refreshTawjihPlusAccess,
    reloadMe,
    refetchEligibilityProfile,
    user,
  ]);

  // ── Sous-titre du bloc salutation ───────────────────────────────────────────
  // Format : « TAWJIH PLUS · Sciences Math A · 2ème Bac » (pack + filière + niveau).
  const academicSubtitleParts = useMemo(() => {
    if (!user || eligibilityLoading || !eligibilityProfile) return [];
    return buildHomeAcademicSubtitleParts(eligibilityProfile, locale, t('bacMissionLabel'));
  }, [user, eligibilityLoading, eligibilityProfile, locale, t]);

  const userSubtitle = useMemo(() => {
    if (!user) return t('userSubtitle');
    if (eligibilityLoading || activeServicesLoading) return '';

    const segments: string[] = [];
    const serviceNames = activeServices
      .map((s) => s.serviceName.trim())
      .filter((name) => name !== '');
    if (serviceNames.length > 0) {
      segments.push(serviceNames.join(' · '));
    }
    segments.push(...academicSubtitleParts);
    return segments.filter((part) => part.trim() !== '').join(' · ');
  }, [
    user,
    eligibilityLoading,
    activeServicesLoading,
    activeServices,
    academicSubtitleParts,
    t,
  ]);

  const androidHomeScrollNative = useMemo(
    () => (Platform.OS === 'android' ? Gesture.Native() : null),
    [],
  );

  const homeScrollView = (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: spacing.section + insets.bottom + 8 },
        ]}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        bounces={false}
        {...(Platform.OS === 'ios' ? { contentInsetAdjustmentBehavior: 'never' as const } : {})}
      >
        <View style={[styles.heroShell, heroWide && styles.heroShellWide]}>
          <View style={[styles.heroBackdropLayer, heroWide && styles.heroBackdropLayerWide]} pointerEvents="none">
            <HomeTopBackdrop width={screenW} />
          </View>
          <View style={[styles.greetingRow, isRTL && styles.greetingRowRtl]}>
            <View style={styles.greetingCol}>
          {isLoading ? (
                <HomeGreetingBlockSkeleton isRTL={isRTL} />
          ) : (
            <HomeGreetingBlock
              firstName={(user?.firstName || user?.phone || '—') as string}
              subtitle={userSubtitle}
                  subtitleLoading={
                    Boolean(user) &&
                    (eligibilityLoading || activeServicesLoading || homeRefreshing)
                  }
              greetingWord={t('greeting')}
              rtl={isRTL}
            />
          )}
            </View>
            <HomeRefreshChip
              onPress={() => void refreshHome()}
              refreshing={homeRefreshing}
              label={homeRefreshing ? t('homeRefreshing') : t('homeRefresh')}
              accessibilityLabel={t('homeRefreshA11y')}
              isRTL={isRTL}
            />
          </View>
          <StoriesRow
            channels={storyChannels}
            readChannelIds={readIds}
            tone="dark"
            loading={storiesLoading || homeRefreshing}
            onOpenChannel={(index) => setStoryViewer({ open: true, index })}
          />
        </View>

        {homeLoadError ? (
          <LoadErrorState
            message={homeLoadError}
            onRetry={() => void refreshHome()}
            retryLabel={loadErrorRetryLabel(t)}
            isRTL={isRTL}
            compact
            style={{ marginHorizontal: spacing.md, marginBottom: spacing.sm }}
          />
        ) : null}

        <View style={heroWide ? styles.wideFeed : undefined}>
        <HomeStackedPackCards
          cards={stackCards}
          width={stackCardW}
          onPressDailyGame={() =>
            guardDailyChallengeAccess(
              tawjihPlusGate,
              Boolean(user),
              () => router.push('/daily-challenge'),
              () => router.push('/login'),
            )
          }
          onPressTassjilTrack={() => router.push('/tassjil-school-choices')}
          onPressOrientation1Bac={onPressOrientation1Bac}
          onPressPracticalLink={onPressPracticalItem}
          onOpenOrientationOverview={openOrientationOverview}
          onOpenBacVerification={openBacVerification}
          onOpenBacThresholds={openBacThresholds}
          bacThresholdsLoading={bacResultsLoading || eligibilityLoading || homeRefreshing}
          planParcoursLoading={planParcoursInitialLoading}
          contentLoading={homeRefreshing}
          planParcoursNavAuth={planParcoursNavAuth}
          tawjihPlusGate={tawjihPlusGate}
        />

        <HomePracticalInfoSection
          width={stackCardW}
          items={practicalItems}
          onPressItem={onPressPracticalItem}
          loading={homeRefreshing}
        />

        <HomeOrientationAccessSection
          width={stackCardW}
          onPressItem={onPressPracticalItem}
          onOpenOrientationParcours={openOrientationParcoursSheet}
          planParcoursLoading={planParcoursInitialLoading}
          planParcoursCompletion={planCompletionForUi}
          hasTawjihPlusAccess={hasTawjihPlusAccess}
          tawjihPlusLoading={tawjihPlusLoading || homeRefreshing}
          onOpenTawjihPlusProduct={openTawjihPlusProduct}
          loading={false}
        />

        <HomeMostVisitedSchoolsSection
          width={stackCardW}
          items={mostVisitedSchools}
          loading={mostVisitedLoading || homeRefreshing}
          onPressSchool={onPressMostVisitedSchool}
          onSeeMore={() => router.push('/(tabs)/ecoles' as never)}
        />

        <HomeLatestAnnouncementsSection
          width={stackCardW}
          items={latestAnnouncements}
          loading={latestAnnouncementsLoading || homeRefreshing}
          onPressAnnouncement={onPressLatestAnnouncement}
          onSeeMore={openInscriptionsTab}
        />
        </View>
      </ScrollView>
  );

  return (
    <View style={styles.root}>
      <SchoolDiagnosticPendingNavigation />
      <StatusBar style="light" />
      {/** Bleu jusqu’aux icônes de statut (iOS/Android) — plus de bande blanche au-dessus du header */}
      <View style={[styles.headerSafe, { paddingTop: insets.top }]}>
        <View style={styles.stickyHeader}>
          <HomeTopBar
            unreadCount={notifUnreadCount}
            onPressNotifications={() => openDrawer()}
            onPressProfile={() => router.push('/compte' as never)}
            onPressMenu={openSidebar}
          />
        </View>
      </View>

      {androidHomeScrollNative ? (
        <GestureDetector gesture={androidHomeScrollNative}>{homeScrollView}</GestureDetector>
      ) : (
        homeScrollView
      )}

      <StoryViewerModal
        visible={storyViewer.open}
        channels={storyChannels}
        initialChannelIndex={storyViewer.index}
        onClose={() => setStoryViewer((s) => ({ ...s, open: false }))}
        onChannelFullyRead={markChannelRead}
        analyticsVisitorId={analyticsVisitorId}
      />

      <OrientationParcoursSheet
        visible={orientationSheet.visible}
        title={orientationSheet.title}
        completion={planCompletionForUi}
        tasks={orientationSheetTasks}
        loading={orientationSheetLoading}
        onClose={closeOrientationOverview}
        onPressStep={handleOrientationStep}
        hasTawjihPlusAccess={hasTawjihPlusAccess}
        tawjihPlusLoading={tawjihPlusLoading}
        tawjihPlusGate={tawjihPlusGate}
        onDevResetStep={
          __DEV__ && isDevApiBaseUrl() ? handleDevResetPlanStep : undefined
        }
      />

      <BacResultsVerificationModal
        visible={bacVerification.visible}
        channel={bacVerification.channel}
        massarCode={bacMassarCode}
        massarLoading={bacMassarLoading}
        massarSaving={bacMassarSaving}
        onConfirmMassar={confirmBacMassar}
        onClose={closeBacVerification}
      />

      <BacResultsThresholdsModal visible={bacThresholdsOpen} onClose={closeBacThresholds} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: brand.white,
  },
  headerSafe: {
    backgroundColor: homeShell.bg,
    zIndex: 20,
  },
  /** Fond du scroll = blanc pour un overshoot propre sous le hero (pull + bas de page). */
  scroll: {
    flex: 1,
    backgroundColor: brand.white,
  },
  /** Logo + langue + actions : même bleu que la marque ; le safe top (encoche) est sur `headerSafe`. */
  stickyHeader: {
    backgroundColor: homeShell.bg,
    paddingHorizontal: H_PAD,
    paddingBottom: spacing.sm,
    zIndex: 20,
  },
  content: {
    paddingHorizontal: H_PAD,
    backgroundColor: brand.white,
    flexGrow: 1,
  },
  /** Bloc haut : fond bleu continu avec le header (pas de transparence sur blanc). */
  heroShell: {
    position: 'relative',
    marginHorizontal: -H_PAD,
    marginBottom: spacing.xs,
    paddingHorizontal: H_PAD,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    overflow: 'visible',
    backgroundColor: homeShell.bg,
  },
  /** iPad / tablette : clip du disque + séparation nette avant le fond blanc. */
  heroShellWide: {
    overflow: 'hidden',
    paddingBottom: spacing.md,
    marginBottom: spacing.sm,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  heroBackdropLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'visible',
  },
  heroBackdropLayerWide: {
    overflow: 'hidden',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  greetingRowRtl: {
    flexDirection: 'row-reverse',
  },
  greetingCol: {
    flex: 1,
    minWidth: 0,
  },
  wideFeed: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  homeLoadError: {
    minHeight: 280,
    paddingVertical: spacing.xxl,
  },
});
