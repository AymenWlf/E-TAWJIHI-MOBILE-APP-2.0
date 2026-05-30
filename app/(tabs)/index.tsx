import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect, router } from 'expo-router';
import {
  Alert,
  InteractionManager,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { SchoolDiagnosticPendingNavigation } from '@/components/diagnostic/SchoolDiagnosticPendingNavigation';
import { LoadErrorState, loadErrorRetryLabel } from '@/components/ui/LoadErrorState';
import { HomeLatestAnnouncementsSection } from '@/components/home/HomeLatestAnnouncementsSection';
import { HomeMostVisitedSchoolsSection } from '@/components/home/HomeMostVisitedSchoolsSection';
import { HomeOrientationAccessSection } from '@/components/home/HomeOrientationAccessSection';
import { HomePracticalInfoSection } from '@/components/home/HomePracticalInfoSection';
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
import { homeStackCardsForLocale, storyChannelsForLocale } from '@/data/mock/homeFeed';
import { useLocale } from '@/contexts/LocaleContext';
import { useAppSidebar } from '@/contexts/AppSidebarContext';
import { useNotificationsDrawer } from '@/contexts/NotificationsDrawerContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEligibilityProfile } from '@/hooks/useEligibilityProfile';
import { useStoryReadChannels } from '@/hooks/useStoryReadChannels';
import { getMobileVisitorId } from '@/utils/visitorId';
import { navigatePracticalLink } from '@/utils/navigatePracticalLink';
import { buildApiUrl, isDevApiBaseUrl } from '@/constants/api';
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
import { useAppFeedback } from '@/contexts/AppFeedbackContext';
import { navigatePlanParcoursStep, type PlanParcoursNavigationAuth } from '@/utils/planParcoursNavigation';
import { TAWJIH_PLUS_PRODUCT_PATH } from '@/constants/tawjihPlusAccess';
import { useTawjihPlusAccess } from '@/hooks/useTawjihPlusAccess';
import {
  guardTawjihPlusParcoursStep,
  type TawjihPlusParcoursGate,
} from '@/utils/tawjihPlusParcoursGate';
import { httpGetJson } from '@/services/http';
import { buildHomePlanParcoursData } from '@/utils/orientationParcoursTasks';
import { fetchStoryChannels, recordStoryEvent } from '@/services/stories';
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
  const { openAppFeedback } = useAppFeedback();
  const { hasAccess: hasTawjihPlusAccess, loading: tawjihPlusLoading } = useTawjihPlusAccess();
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
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const heroWide = isHomeHeroWideLayout(screenW);
  const stackCardW = heroWide ? Math.min(screenW - 2 * H_PAD, 720) : screenW - 2 * H_PAD;
  const { readIds, markChannelRead } = useStoryReadChannels();
  const [storyViewer, setStoryViewer] = useState<{ open: boolean; index: number }>({
    open: false,
    index: 0,
  });
  const [storyChannels, setStoryChannels] = useState(() => storyChannelsForLocale(locale));
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

  const loadStories = useCallback(async () => {
    setStoriesLoading(true);
      try {
        const loc = locale === 'ar' ? 'ar' : 'fr';
        const remote = await fetchStoryChannels(loc);
      if (remote.length > 0) {
          setStoryChannels(remote);
      } else {
          setStoryChannels(storyChannelsForLocale(locale));
        }
      } catch {
      setStoryChannels(storyChannelsForLocale(locale));
    } finally {
      setStoriesLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    let cancelled = false;
    const task = InteractionManager.runAfterInteractions(() => {
      void (async () => {
        if (cancelled) return;
        await loadStories();
    })();
    });
    return () => {
      cancelled = true;
      task.cancel();
    };
  }, [loadStories]);

  /** Impressions « bande » stories (anneaux) — une fois par chaîne et session. */
  useEffect(() => {
    if (!analyticsVisitorId || storyChannels.length === 0) return;
    for (const ch of storyChannels) {
      if (feedTrackedIdsRef.current.has(ch.id)) continue;
      feedTrackedIdsRef.current.add(ch.id);
      void recordStoryEvent('feed_impression', {
        channelId: ch.id,
        visitorId: analyticsVisitorId,
        viewport: 'mobile',
      });
    }
  }, [analyticsVisitorId, storyChannels]);
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
      accountSetupComplete: Boolean(user?.is_setup),
    };
  }, [planParcoursCompletion, user?.is_setup]);

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
    orientationSheet.visible && (planParcoursLoading || planParcoursCompletion === null);

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
      setPlanParcoursCompletion(completion);
      return completion;
    } finally {
      setPlanParcoursLoading(false);
    }
  }, [getValidAccessToken, user?.is_setup]);

  const handleOrientationStep = useCallback(
    (stepId: PlanParcoursStepId) => {
      closeOrientationOverview();
      if (stepId === PLAN_PARCOURS_STEP_IDS.feedback) {
        guardTawjihPlusParcoursStep(stepId, tawjihPlusGate, () => {
          openAppFeedback({
            markParcoursStep: true,
            onSubmitted: () => void refreshPlanParcours(),
          });
        });
        return;
      }
      navigatePlanParcoursStep(stepId, planParcoursNavAuth, tawjihPlusGate);
    },
    [
      closeOrientationOverview,
      openAppFeedback,
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
          setPlanParcoursLoading(true);
          try {
            const token = await getValidAccessToken();
            const completion = await fetchPlanParcoursCompletion(token, Boolean(user?.is_setup));
            if (alive) setPlanParcoursCompletion(completion);
        } catch {
            if (alive) setPlanParcoursCompletion(null);
        } finally {
            if (alive) setPlanParcoursLoading(false);
        }
      })();
      });
      return () => {
        alive = false;
        task.cancel();
      };
    }, [getValidAccessToken, user?.is_setup]),
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
    const packLoading = planParcoursLoading || homeRefreshing;
    const dailyCardLoading = dailyLoading || homeRefreshing;
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
          percent: packLoading ? 0 : parcours.totalPercent,
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
    planParcoursLoading,
    bacResultsConfig,
    bacResultsLoading,
    eligibilityProfile,
    t,
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

  const onPressPracticalItem = useCallback(
    (id: string) => {
      navigatePracticalLink(
        (href) => router.push(href as never),
        id,
        planParcoursNavAuth,
        tawjihPlusGate,
      );
    },
    [planParcoursNavAuth, tawjihPlusGate],
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

  const onPressMostVisitedSchool = useCallback((item: MostVisitedEstablishment) => {
    router.push(`/etablissements/${item.id}/${item.slug ?? ''}` as never);
  }, []);

  const refreshHome = useCallback(async () => {
    if (homeRefreshInFlightRef.current) return;
    homeRefreshInFlightRef.current = true;
    setHomeRefreshing(true);
    setHomeLoadError(null);
    try {
      await Promise.all([
        loadActiveServices(),
        refreshUnread({ force: true }),
        loadHomeFeedSections({ force: true }),
        loadStories(),
        loadDailyChallenge(),
        loadBacResultsConfig({ force: true }),
        refreshPlanParcours(),
        user ? reloadMe() : Promise.resolve(),
        user ? refetchEligibilityProfile() : Promise.resolve(),
      ]);
    } finally {
      homeRefreshInFlightRef.current = false;
      setHomeRefreshing(false);
    }
  }, [
    loadActiveServices,
    refreshUnread,
    loadHomeFeedSections,
    loadStories,
    loadDailyChallenge,
    loadBacResultsConfig,
    refreshPlanParcours,
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
          onPressDailyGame={() => router.push('/daily-challenge')}
          onPressOrientation1Bac={onPressOrientation1Bac}
          onPressPracticalLink={onPressPracticalItem}
          onOpenOrientationOverview={openOrientationOverview}
          onOpenBacVerification={openBacVerification}
          onOpenBacThresholds={openBacThresholds}
          bacThresholdsLoading={bacResultsLoading || eligibilityLoading || homeRefreshing}
          bacThresholdsLocked={
            !bacResultsLoading &&
            !eligibilityLoading &&
            !homeRefreshing &&
            Boolean(
              eligibilityProfile?.bacType === 'normal' &&
                eligibilityProfile?.niveau &&
                isPremiereBacNiveau(eligibilityProfile.niveau),
            )
          }
          planParcoursLoading={planParcoursLoading || homeRefreshing}
          contentLoading={homeRefreshing}
          planParcoursNavAuth={planParcoursNavAuth}
          tawjihPlusGate={tawjihPlusGate}
        />

        <HomePracticalInfoSection
          width={stackCardW}
          onPressItem={onPressPracticalItem}
          loading={homeRefreshing}
        />

        <HomeOrientationAccessSection
          width={stackCardW}
          onPressItem={onPressPracticalItem}
          onOpenOrientationParcours={openOrientationParcoursSheet}
          planParcoursLoading={planParcoursLoading || homeRefreshing}
          planParcoursCompletion={planCompletionForUi}
          hasTawjihPlusAccess={hasTawjihPlusAccess}
          tawjihPlusLoading={tawjihPlusLoading}
          onOpenTawjihPlusProduct={openTawjihPlusProduct}
          loading={homeRefreshing}
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
