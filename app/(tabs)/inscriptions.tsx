import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Linking from 'expo-linking';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SidebarMenuIconButton } from '@/components/SidebarMenuIconButton';
import { AppBannerSlot } from '@/components/ads/AppBannerSlot';
import { AppRefreshControl } from '@/components/ui/AppRefreshControl';
import { AnnouncementCardSkeletonStack } from '@/components/inscriptions/AnnouncementCardSkeleton';
import { InscriptionsAnnouncementsFiltersSkeleton } from '@/components/inscriptions/InscriptionsAnnouncementsFiltersSkeleton';
import { LoadErrorState, loadErrorRetryLabel } from '@/components/ui/LoadErrorState';
import { HeroLangSwitch } from '@/components/ui/HeroLangSwitch';
import { Text } from '@/components/ui/Text';
import { AnnouncementCard } from '@/components/inscriptions/AnnouncementCard';
import { FollowedSchoolCard } from '@/components/inscriptions/FollowedSchoolCard';
import { StatusUpdateSheet } from '@/components/inscriptions/StatusUpdateSheet';
import { TawjihPlusLockBanner } from '@/components/inscriptions/TawjihPlusPaywall';
import {
  TawjihPlusAccessProvider,
  useTawjihPlusAccessContext,
} from '@/contexts/TawjihPlusAccessContext';
import {
  announcementEstablishmentFiltersFromProfile,
  countActiveEstablishmentFilters,
  countAnnouncementTabFiltersActive,
  defaultAnnouncementEstablishmentFilters,
  EstablishmentFiltersModal,
  neutralAnnouncementEstablishmentFilters,
  type EstablishmentFiltersValue,
} from '@/components/schools/EstablishmentFiltersModal';
import {
  SearchablePickSheet,
  type SearchablePickItem,
} from '@/components/schools/SearchablePickSheet';
import { useAuth } from '@/contexts/AuthContext';
import { openApplyToSchoolsTour } from '@/utils/applyToSchoolsTourNavigation';
import { useLocale } from '@/contexts/LocaleContext';
import { useNotificationsDrawer } from '@/contexts/NotificationsDrawerContext';
import { useSharePreview } from '@/contexts/SharePreviewContext';
import { useEligibilityProfile } from '@/hooks/useEligibilityProfile';
import {
  fetchActiveCandidacyStatuses,
  loadCandidacyStatusesWithRefresh,
} from '@/services/candidacyStatusTypes';
import { reportLinkVisited } from '@/services/candidacies';
import {
  fetchContestAnnouncements,
  recordContestClick,
  recordContestListingImpressionsBatch,
  type ContestAnnouncementCard,
} from '@/services/contestAnnouncements';
import {
  listAllEstablishments,
  type EstablishmentNormalized,
} from '@/services/establishments';
import {
  deleteEstablishmentFollow,
  deleteEstablishmentFollowByEstablishment,
  fetchEstablishmentFollows,
  updateFollowStatus,
  upsertEstablishmentFollow,
} from '@/services/establishmentFollows';
import {
  listAllSecteursActive,
  listCities,
  type CityRow,
  type SecteurRow,
} from '@/services/referenceData';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { CandidacyStatusType, EstablishmentFollow } from '@/types/inscriptions';
import {
  evaluateEligibilityByFiliere,
  mergeEligibilityCriteria,
  matchesAcceptedStudyPathFilter,
} from '@/utils/eligibility';
import { establishmentMatchesAllFilters } from '@/utils/establishmentWebFilters';
import { fireAndForget } from '@/utils/fireAndForget';
import { getUserFacingLoadError } from '@/utils/apiError';
import {
  followRequiresAttention,
  loadFollowLatestSeenMap,
  mergeDefaultSeenForFollows,
  saveFollowLatestSeenMap,
  sortFollowsActionRequiredFirst,
} from '@/utils/followLatestAnnouncementSeen';
import { isAnnouncementUnseen } from '@/utils/announcementSeenState';

/** Nombre de cartes chargées par « page » lors du scroll (lazy loading client). */
const LIST_PAGE_SIZE = 15;
/** Bandeau partenaire « milieu de liste » : une seule fois, après la 3e annonce. */
const MID_BANNER_AFTER_CARD_INDEX = 3;

type TabId = 'candidacies' | 'announcements';

export default function InscriptionsTabScreen() {
  return (
    <TawjihPlusAccessProvider>
      <InscriptionsTabScreenInner />
    </TawjihPlusAccessProvider>
  );
}

function InscriptionsTabScreenInner() {
  const router = useRouter();
  const {
    isInscriptionsLocked,
    isInscriptionsAccessPending,
    openTawjihPlusProduct,
    applyServerInscriptionsAccess,
    resolveInscriptionsAccessWithoutServer,
  } = useTawjihPlusAccessContext();
  const showInscriptionsPaywall = !isInscriptionsAccessPending && isInscriptionsLocked;
  const announcementsFiltersLocked = showInscriptionsPaywall;

  const showAnnouncementsFiltersUpgradeAlert = useCallback(() => {
    Alert.alert(t('inscTawjihPlusLockTitle'), t('schoolsSearchFiltersLockedHint'), [
      { text: t('accountLogoutCancel'), style: 'cancel' },
      { text: t('inscTawjihPlusUpgradeCta'), onPress: openTawjihPlusProduct },
    ]);
  }, [openTawjihPlusProduct, t]);
  const { tab: tabParam, clearFilters: clearFiltersParam } = useLocalSearchParams<{
    tab?: string | string[];
    clearFilters?: string | string[];
  }>();
  const { t, isRTL, locale } = useLocale();
  const { user, getValidAccessToken, isLoading: authLoading } = useAuth();
  const {
    refreshUnread,
    unreadAnnouncementIds,
    seenAnnouncementIds,
    markAnnouncementSeen,
  } = useNotificationsDrawer();
  const { presentShare } = useSharePreview();
  const isLoggedIn = Boolean(user);

  const [tab, setTab] = useState<TabId>('announcements');

  const tabFromUrl = useMemo(() => {
    const raw = tabParam === undefined ? undefined : Array.isArray(tabParam) ? tabParam[0] : tabParam;
    return raw === 'candidacies' || raw === 'announcements' ? raw : undefined;
  }, [tabParam]);

  const clearFiltersFromUrl = useMemo(() => {
    const raw =
      clearFiltersParam === undefined
        ? undefined
        : Array.isArray(clearFiltersParam)
          ? clearFiltersParam[0]
          : clearFiltersParam;
    return raw === '1' || raw === 'true';
  }, [clearFiltersParam]);

  useEffect(() => {
    if (tabFromUrl === 'candidacies') setTab('candidacies');
    else if (tabFromUrl === 'announcements') setTab('announcements');
  }, [tabFromUrl]);

  /**
   * Suivi école : porte le statut de candidature de l'utilisateur sur
   * l'école (refonte UX 2026-05). C'est la **seule** liste affichée dans
   * l'onglet Candidatures, le concept de candidature par annonce ayant
   * été retiré de l'UI.
   */
  const [follows, setFollows] = useState<EstablishmentFollow[]>([]);
  const [followsLoading, setFollowsLoading] = useState(false);
  /** Après le premier fetch des suivis (connecté) — évite un état « non suivi » fictif sur les cartes annonces. */
  const [followsReady, setFollowsReady] = useState(!isLoggedIn);

  /** Catalogue des statuts (API) — pour le filtre de l’onglet Candidatures. */
  const [candidacyStatusCatalog, setCandidacyStatusCatalog] = useState<CandidacyStatusType[]>([]);
  /** `''` = toutes ; `none` = sans statut ; sinon id numérique en string. */
  const [candidacyStatusFilter, setCandidacyStatusFilter] = useState('');
  const [candidacyStatusPickerOpen, setCandidacyStatusPickerOpen] = useState(false);
  /** Filtre « nouvelle annonce non consultée » dans l’onglet Candidatures. */
  const [candidaciesAttentionFilter, setCandidaciesAttentionFilter] = useState<'all' | 'action_required'>(
    'all',
  );

  /**
   * Sheet de mise à jour du statut d'un follow. `activeFollow` détient
   * le follow ciblé pour ré-utiliser sa palette de statuts autorisés
   * (`availableStatuses`) sans round-trip au backend.
   */
  const [activeFollow, setActiveFollow] = useState<EstablishmentFollow | null>(null);
  const [statusSheetOpen, setStatusSheetOpen] = useState(false);

  /**
   * Sheet de mise à jour du statut **depuis une annonce** (onglet
   * Annonces). Les statuts proposés sont ceux de l'annonce ; si
   * l'utilisateur ne suit pas l'école, le suivi est créé à la
   * confirmation avec le statut choisi (auto-follow).
   */
  const [activeAnnouncement, setActiveAnnouncement] = useState<ContestAnnouncementCard | null>(
    null,
  );
  const [annStatusSheetOpen, setAnnStatusSheetOpen] = useState(false);

  // Annonces
  const [announcements, setAnnouncements] = useState<ContestAnnouncementCard[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [announcementsLoadError, setAnnouncementsLoadError] = useState<string | null>(null);
  const [followsLoadError, setFollowsLoadError] = useState<string | null>(null);
  const [followBusyId, setFollowBusyId] = useState<number | null>(null);

  /* Filtre "École" sur l'onglet Annonces — id établissement choisi (vide ⇒ toutes). */
  const [schoolFilterId, setSchoolFilterId] = useState<string>('');
  const [schoolPickerOpen, setSchoolPickerOpen] = useState(false);

  /**
   * Tri par dernier délai. C'est volontairement un toggle binaire
   * (sélectionné / non sélectionné) plutôt qu'un picker à plusieurs
   * options : on ne propose qu'une alternative au tri par défaut, donc
   * un bouton « Trier par délai » qui s'allume / s'éteint suffit.
   *
   * Les filtres « statut » et « éligibilité » vivent désormais dans
   * `filtersValue` (et donc dans la modale Filtres avancés) — ils ont
   * été retirés de la barre rapide pour alléger l'UI.
   */
  const [sortByClosingSoon, setSortByClosingSoon] = useState(false);
  const {
    profile: eligibilityProfile,
    loading: eligibilityProfileLoading,
    refetch: refetchEligibilityProfile,
  } = useEligibilityProfile();

  /**
   * Filtres avancés (mêmes que sur la page « Écoles supérieures »).
   * Appliqués côté client : pour chaque annonce, on récupère son école dans
   * `allEstablishmentsById` puis on évalue tous les critères.
   */
  const [filtersValue, setFiltersValue] = useState<EstablishmentFiltersValue>(
    defaultAnnouncementEstablishmentFilters(),
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  const getAnnouncementDefaultFilters = useCallback((): EstablishmentFiltersValue => {
    return {
      ...announcementEstablishmentFiltersFromProfile(eligibilityProfile),
      eligibilityFilter: 'eligible',
    };
  }, [eligibilityProfile]);

  /** Applique la filière du profil une fois chargée, sans écraser un filtrage personnalisé. */
  useEffect(() => {
    if (!eligibilityProfile) return;
    setFiltersValue((prev) => {
      const base = defaultAnnouncementEstablishmentFilters();
      const stillProductDefaults =
        prev.eligibilityFilter === base.eligibilityFilter &&
        prev.statusFilter === base.statusFilter &&
        prev.type === base.type &&
        prev.universite === base.universite &&
        prev.regionTitle === base.regionTitle &&
        prev.ville === base.ville &&
        prev.secteurId === base.secteurId &&
        prev.diplome === base.diplome &&
        prev.fraisMin === base.fraisMin &&
        prev.fraisMax === base.fraisMax &&
        !prev.acceptedStudyBacType &&
        !prev.acceptedStudyValue.trim();
      if (!stillProductDefaults) return prev;
      return announcementEstablishmentFiltersFromProfile(eligibilityProfile);
    });
  }, [eligibilityProfile]);

  /* Données de référence partagées avec la page Écoles. */
  const [cities, setCities] = useState<CityRow[]>([]);
  const [secteurs, setSecteurs] = useState<SecteurRow[]>([]);
  const [allEstablishments, setAllEstablishments] = useState<EstablishmentNormalized[]>([]);
  const [filtersDataLoaded, setFiltersDataLoaded] = useState(false);
  const [filtersDataLoading, setFiltersDataLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [announcementsVisibleEnd, setAnnouncementsVisibleEnd] = useState(LIST_PAGE_SIZE);
  const [candidaciesVisibleEnd, setCandidaciesVisibleEnd] = useState(LIST_PAGE_SIZE);
  const [loadingMoreAnnouncements, setLoadingMoreAnnouncements] = useState(false);
  const [loadingMoreCandidacies, setLoadingMoreCandidacies] = useState(false);

  /**
   * Par suivi d’école : id de la dernière annonce considérée comme « vue ».
   * Sert à détecter une nouvelle « dernière annonce » sans champ API dédié.
   */
  const [latestSeenMap, setLatestSeenMap] = useState<Record<string, number>>({});

  const clearAllAnnouncementFilters = useCallback(() => {
    setFiltersValue(getAnnouncementDefaultFilters());
    setSchoolFilterId('');
    setSortByClosingSoon(false);
  }, [getAnnouncementDefaultFilters]);

  const clearAllCandidacyFilters = useCallback(() => {
    setCandidacyStatusFilter('');
    setCandidaciesAttentionFilter('all');
  }, []);

  useLayoutEffect(() => {
    if (!clearFiltersFromUrl) return;
    setFiltersValue(neutralAnnouncementEstablishmentFilters());
    setSchoolFilterId('');
    setSortByClosingSoon(false);
    router.replace('/inscriptions?tab=announcements');
  }, [clearFiltersFromUrl, router]);

  // ── Loaders ──
  useEffect(() => {
    if (!isLoggedIn) setFollowsReady(true);
    else setFollowsReady(false);
  }, [isLoggedIn, user?.id]);

  const reloadFollows = useCallback(
    async (opts?: { silent?: boolean }): Promise<EstablishmentFollow[] | undefined> => {
      if (!isLoggedIn) {
        setFollowsReady(true);
        return undefined;
      }
      const token = await getValidAccessToken();
      if (!token) {
        setFollowsReady(true);
        return undefined;
      }
      const silent = opts?.silent === true;
      if (!silent) setFollowsLoading(true);
      setFollowsLoadError(null);
      try {
        const res = await fetchEstablishmentFollows(token, { throwOnError: true });
        setFollows(res.items);
        return res.items;
      } catch (e) {
        setFollows([]);
        if (!silent) {
          setFollowsLoadError(getUserFacingLoadError(e, t, { context: 'inscriptions' }));
        }
        return undefined;
      } finally {
        if (!silent) setFollowsLoading(false);
        setFollowsReady(true);
      }
    },
    [getValidAccessToken, isLoggedIn, t],
  );

  const reloadAnnouncements = useCallback(async () => {
    setAnnouncementsLoading(true);
    setAnnouncementsLoadError(null);
    try {
      const token = isLoggedIn ? await getValidAccessToken() : null;
      const { items, inscriptionsFullAccess } = await fetchContestAnnouncements({
        throwOnError: true,
        accessToken: token,
      });
      applyServerInscriptionsAccess(inscriptionsFullAccess);
      setAnnouncements(items);
      recordContestListingImpressionsBatch(items.slice(0, LIST_PAGE_SIZE));
    } catch (e) {
      setAnnouncements([]);
      setAnnouncementsLoadError(getUserFacingLoadError(e, t, { context: 'inscriptions' }));
      resolveInscriptionsAccessWithoutServer();
    } finally {
      setAnnouncementsLoading(false);
    }
  }, [
    applyServerInscriptionsAccess,
    getValidAccessToken,
    isLoggedIn,
    resolveInscriptionsAccessWithoutServer,
    t,
  ]);

  // Initial loads
  useEffect(() => {
    void reloadAnnouncements();
  }, [reloadAnnouncements]);

  /** Recharge villes, secteurs et catalogue complet des établissements (filtres + picker école). */
  const reloadFiltersData = useCallback(async () => {
    setFiltersDataLoading(true);
    try {
      const [c, s, est] = await Promise.all([
        listCities(1000).catch(() => [] as CityRow[]),
        listAllSecteursActive().catch(() => [] as SecteurRow[]),
        listAllEstablishments({}).catch(() => [] as EstablishmentNormalized[]),
      ]);
      setCities(c);
      setSecteurs(s);
      setAllEstablishments(est);
      setFiltersDataLoaded(true);
    } finally {
      setFiltersDataLoading(false);
    }
  }, []);

  /**
   * Charge à la volée les données de référence nécessaires aux filtres
   * avancés (cities, secteurs, écoles complètes). Appelé au premier affichage
   * de l'onglet « Annonces ».
   */
  const ensureFiltersDataLoaded = useCallback(async () => {
    if (filtersDataLoaded || filtersDataLoading) return;
    await reloadFiltersData();
  }, [filtersDataLoaded, filtersDataLoading, reloadFiltersData]);

  /* Pré-charger les données dès qu'on est sur l'onglet annonces. */
  useEffect(() => {
    if (tab === 'announcements') void ensureFiltersDataLoaded();
  }, [tab, ensureFiltersDataLoaded]);

  useEffect(() => {
    if (isLoggedIn) void reloadFollows();
  }, [isLoggedIn, reloadFollows]);

  /** Pré-charge le catalogue des statuts à l’ouverture des onglets Candidatures ou Annonces (filtre statut). */
  useEffect(() => {
    if (tab !== 'candidacies' && tab !== 'announcements') return;
    void (async () => {
      const initial = await loadCandidacyStatusesWithRefresh((fresh) => {
        setCandidacyStatusCatalog(fresh);
      });
      setCandidacyStatusCatalog(initial);
    })();
  }, [tab]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      let freshFollows: EstablishmentFollow[] | undefined;
      await reloadFiltersData();
      if (tab === 'candidacies') {
        freshFollows = await reloadFollows();
      } else {
        await reloadAnnouncements();
        if (isLoggedIn) freshFollows = await reloadFollows();
      }
      const statuses = await fetchActiveCandidacyStatuses();
      setCandidacyStatusCatalog(statuses);

      if (isLoggedIn) {
        await refetchEligibilityProfile();
        if (freshFollows !== undefined) {
          const snapshot = freshFollows;
          const persisted = await loadFollowLatestSeenMap();
          setLatestSeenMap((cur) => {
            const merged = mergeDefaultSeenForFollows(snapshot, { ...persisted, ...cur });
            if (merged.changed) void saveFollowLatestSeenMap(merged.map);
            return merged.map;
          });
        }
      }
    } finally {
      setRefreshing(false);
    }
  }, [tab, reloadFollows, reloadAnnouncements, reloadFiltersData, isLoggedIn, refetchEligibilityProfile]);

  const announcementsBootstrapPending = useMemo(() => {
    if (tab !== 'announcements') return false;
    if (isInscriptionsAccessPending) return true;
    if (announcementsLoading) return true;
    if (!filtersDataLoaded || filtersDataLoading) return true;
    if (isLoggedIn && eligibilityProfileLoading) return true;
    return false;
  }, [
    tab,
    isInscriptionsAccessPending,
    announcementsLoading,
    filtersDataLoaded,
    filtersDataLoading,
    isLoggedIn,
    eligibilityProfileLoading,
  ]);

  const candidaciesBootstrapPending = useMemo(() => {
    if (tab !== 'candidacies') return false;
    if (isInscriptionsAccessPending) return true;
    if (isLoggedIn && !followsReady) return true;
    if (followsLoading) return true;
    return false;
  }, [tab, followsLoading, followsReady, isInscriptionsAccessPending, isLoggedIn]);

  const announcementsListLoading =
    announcementsBootstrapPending || (refreshing && tab === 'announcements');
  const candidaciesListLoading =
    candidaciesBootstrapPending || (refreshing && tab === 'candidacies');

  // Set des establishment IDs suivis (utile pour l'AnnouncementCard "déjà suivie ?").
  const followedEstablishmentSet = useMemo(() => {
    const s = new Set<number>();
    follows.forEach((f) => {
      if (f.establishment?.id) s.add(f.establishment.id);
    });
    return s;
  }, [follows]);

  /**
   * Map id-école → follow courant. Permet à l'AnnouncementCard d'afficher
   * le statut existant et au handler de confirmation de savoir s'il faut
   * créer un nouveau follow (auto-follow) ou patcher l'existant.
   */
  const followsByEstId = useMemo(() => {
    const m = new Map<number, EstablishmentFollow>();
    follows.forEach((f) => {
      if (f.establishment?.id) m.set(f.establishment.id, f);
    });
    return m;
  }, [follows]);

  /** Candidatures « actives » : pas de statut explicite ou statut catalogue `isActive`. */
  const activeCandidaciesCount = useMemo(
    () => follows.filter((f) => !f.status || f.status.isActive).length,
    [follows],
  );

  const candidaciesBadgeScale = useRef(new Animated.Value(1)).current;
  const prevActiveCandidaciesRef = useRef(0);
  const prevAttentionTotalRef = useRef(0);
  const skipActiveBumpRef = useRef(true);

  const playCandidaciesBadgeBump = useCallback(() => {
    candidaciesBadgeScale.setValue(1);
    Animated.sequence([
      Animated.spring(candidaciesBadgeScale, {
        toValue: 1.32,
        friction: 5,
        tension: 280,
        useNativeDriver: true,
      }),
      Animated.spring(candidaciesBadgeScale, {
        toValue: 1,
        friction: 7,
        tension: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [candidaciesBadgeScale]);

  /** Actions requises sur l’ensemble des suivis (hors filtre statut) — badge onglet + ligne de compteur. */
  const candidaciesAttentionTotalCount = useMemo(
    () => follows.filter((f) => followRequiresAttention(f, latestSeenMap)).length,
    [follows, latestSeenMap],
  );

  useEffect(() => {
    if (!isLoggedIn) {
      skipActiveBumpRef.current = true;
      prevActiveCandidaciesRef.current = 0;
      prevAttentionTotalRef.current = 0;
      return;
    }
    if (followsLoading) return;
    if (skipActiveBumpRef.current) {
      skipActiveBumpRef.current = false;
      prevActiveCandidaciesRef.current = activeCandidaciesCount;
      prevAttentionTotalRef.current = candidaciesAttentionTotalCount;
      return;
    }
    if (
      activeCandidaciesCount > prevActiveCandidaciesRef.current ||
      candidaciesAttentionTotalCount > prevAttentionTotalRef.current
    ) {
      playCandidaciesBadgeBump();
    }
    prevActiveCandidaciesRef.current = activeCandidaciesCount;
    prevAttentionTotalRef.current = candidaciesAttentionTotalCount;
  }, [
    activeCandidaciesCount,
    candidaciesAttentionTotalCount,
    followsLoading,
    isLoggedIn,
    playCandidaciesBadgeBump,
  ]);

  /**
   * Liste des écoles affichables dans le picker de filtre. On préfère la
   * liste complète (`allEstablishments`, chargée par
   * `ensureFiltersDataLoaded`) pour permettre à l'utilisateur de choisir
   * une école qui n'a pas (encore) d'annonce — utile par exemple pour
   * suivre les futures publications. Tant que ce pré-chargement n'a pas
   * abouti, on retombe sur les écoles présentes dans les annonces déjà
   * chargées pour ne pas afficher un picker vide.
   *
   * Triée par nom dans la locale courante.
   */
  const schoolFilterItems = useMemo<SearchablePickItem[]>(() => {
    type Row = {
      id: number;
      nom?: string | null;
      nomArabe?: string | null;
      sigle?: string | null;
    };
    const map = new Map<number, { label: string; subtitle: string; searchText: string }>();

    const addRow = (e: Row | null | undefined) => {
      if (!e || !e.id) return;
      const ar = (e.nomArabe ?? '').trim();
      const fr = (e.nom ?? '').trim();
      const sig = (e.sigle ?? '').trim();
      const primary = locale === 'ar' && ar ? ar : fr || ar || `#${e.id}`;
      const secondaryParts: string[] = [];
      if (sig) secondaryParts.push(sig);
      if (locale === 'ar' && fr && ar) secondaryParts.push(fr);
      else if (locale === 'fr' && ar && fr) secondaryParts.push(ar);
      /** Recherche : nom FR, nom AR et sigle (indépendamment de la locale d’affichage). */
      const searchText = [fr, ar, sig].filter(Boolean).join(' ');
      map.set(e.id, { label: primary, subtitle: secondaryParts.join(' · '), searchText });
    };

    if (allEstablishments.length > 0) {
      for (const e of allEstablishments) addRow(e);
    } else {
      // Fallback : utilise les écoles déjà associées à une annonce, le
      // temps que le pré-chargement complet (`ensureFiltersDataLoaded`)
      // se termine.
      for (const a of Array.isArray(announcements) ? announcements : []) {
        if (a) addRow(a.establishment);
      }
    }

    const arr = Array.from(map.entries()).map(([id, v]) => ({
      id: `est-${id}`,
      value: String(id),
      label: v.label,
      subtitle: v.subtitle || undefined,
      searchText: v.searchText,
    }));
    return arr.sort((a, b) => a.label.localeCompare(b.label, locale === 'ar' ? 'ar' : 'fr'));
  }, [allEstablishments, announcements, locale]);

  /**
   * Map id → école normalisée (lookup constant lors du filtrage des annonces).
   * Vide tant que `ensureFiltersDataLoaded` n'a pas terminé.
   */
  const allEstablishmentsById = useMemo(() => {
    const m = new Map<number, EstablishmentNormalized>();
    for (const e of allEstablishments) {
      if (e?.id) m.set(e.id, e);
    }
    return m;
  }, [allEstablishments]);

  /** Pré-calcule la liste des villes appartenant à la région choisie. */
  const villesInRegion = useMemo(() => {
    if (!filtersValue.regionTitle.trim() || cities.length === 0) return null;
    return new Set(
      cities
        .filter((c) => c.region?.titre === filtersValue.regionTitle)
        .map((c) => (c.titre ?? '').trim())
        .filter(Boolean),
    );
  }, [filtersValue.regionTitle, cities]);

  /** Combien de filtres avancés sont actifs (utile pour le badge). */
  const activeAdvancedFiltersCount = useMemo(
    () => countActiveEstablishmentFilters(filtersValue),
    [filtersValue],
  );

  /** Inclut aussi « ouvertes » et « éligibles » (présélection produit onglet Annonces). */
  const announcementTabFiltersActiveCount = useMemo(
    () => countAnnouncementTabFiltersActive(filtersValue),
    [filtersValue],
  );

  const hasActiveAnnouncementListingFilters = useMemo(
    () =>
      announcementTabFiltersActiveCount > 0 ||
      Boolean(schoolFilterId.trim()) ||
      sortByClosingSoon,
    [announcementTabFiltersActiveCount, schoolFilterId, sortByClosingSoon],
  );

  /**
   * Annonces filtrées par école sélectionnée puis par filtres avancés.
   * On évalue chaque annonce contre son école parente (lookup via map). Si
   * les données de référence ne sont pas encore chargées, on n'applique pas
   * les filtres avancés (sinon on filtrerait tout) — l'utilisateur attend
   * de toute façon un loader au premier accès.
   */
  const visibleAnnouncements = useMemo(() => {
    const list = Array.isArray(announcements) ? announcements : [];
    let out = list;

    /* 1) Filtre rapide par école précise */
    const sid = schoolFilterId.trim();
    if (sid) {
      const wanted = Number(sid);
      if (Number.isFinite(wanted) && wanted > 0) {
        out = out.filter((a) => a.establishment?.id === wanted);
      }
    }

    /* 2) Filtres avancés (uniquement si on a chargé les écoles complètes) */
    if (activeAdvancedFiltersCount > 0 && allEstablishmentsById.size > 0) {
      out = out.filter((a) => {
        const eid = a.establishment?.id;
        if (!eid) return false;
        const est = allEstablishmentsById.get(eid);
        if (!est) return false;
        return establishmentMatchesAllFilters(est, {
          ...filtersValue,
          villesInRegion,
        });
      });
    }

    /* 3) Filtre éligibilité (filière du Bac, depuis Filtres avancés).
       Silencieusement ignoré si l'utilisateur n'a pas de profil ⇒ on
       conserve la liste complète pour ne pas piéger un visiteur. */
    if (filtersValue.eligibilityFilter !== 'all' && eligibilityProfile) {
      out = out.filter((a) => {
        const verdict = evaluateEligibilityByFiliere(
          {
            filieresAcceptees: a.filieresAcceptees,
            specialitesBacMissionAcceptees: a.specialitesBacMissionAcceptees,
          },
          eligibilityProfile,
        );
        if (verdict === 'unknown') return true;
        return verdict === filtersValue.eligibilityFilter;
      });
    }

    const studyBac = filtersValue.acceptedStudyBacType;
    const studyVal = filtersValue.acceptedStudyValue.trim();
    if (
      filtersDataLoaded &&
      (studyBac === 'normal' || studyBac === 'mission') &&
      studyVal
    ) {
      out = out.filter((a) => {
        const est =
          a.establishment?.id != null ? allEstablishmentsById.get(a.establishment.id) : undefined;
        const criteria = mergeEligibilityCriteria(
          {
            filieresAcceptees: a.filieresAcceptees,
            specialitesBacMissionAcceptees: a.specialitesBacMissionAcceptees,
          },
          est
            ? {
                filieresAcceptees: est.filieresAcceptees ?? null,
                specialitesBacMissionAcceptees: est.specialitesBacMissionAcceptees ?? null,
              }
            : null,
        );
        return matchesAcceptedStudyPathFilter(criteria, { bacType: studyBac, value: studyVal });
      });
    }

    /* 5) Tri par dernier délai : annonces ouvertes avec délai croissant en
       tête, puis annonces fermées (jours négatifs) en fin de liste. */
    if (sortByClosingSoon) {
      out = [...out].sort((a, b) => {
        const aClosed = a.isExpire || !a.isOpen;
        const bClosed = b.isExpire || !b.isOpen;
        if (aClosed !== bClosed) return aClosed ? 1 : -1;
        const aDays = Number.isFinite(a.daysUntilClose) ? a.daysUntilClose : 9999;
        const bDays = Number.isFinite(b.daysUntilClose) ? b.daysUntilClose : 9999;
        return aDays - bDays;
      });
    }

    return out;
  }, [
    announcements,
    schoolFilterId,
    activeAdvancedFiltersCount,
    allEstablishmentsById,
    filtersValue,
    villesInRegion,
    eligibilityProfile,
    filtersDataLoaded,
    sortByClosingSoon,
  ]);

  const paginatedVisibleAnnouncements = useMemo(
    () => visibleAnnouncements.slice(0, announcementsVisibleEnd),
    [visibleAnnouncements, announcementsVisibleEnd],
  );

  const hasMoreAnnouncements = paginatedVisibleAnnouncements.length < visibleAnnouncements.length;

  useEffect(() => {
    setAnnouncementsVisibleEnd(LIST_PAGE_SIZE);
  }, [
    schoolFilterId,
    activeAdvancedFiltersCount,
    filtersValue.eligibilityFilter,
    filtersValue.acceptedStudyBacType,
    filtersValue.acceptedStudyValue,
    sortByClosingSoon,
    announcements.length,
  ]);

  /** Libellé du filtre actif (nom de l'école choisie, ou "Toutes les écoles"). */
  const schoolFilterLabel = useMemo(() => {
    const sid = schoolFilterId.trim();
    if (!sid) return t('inscFilterSchoolAll');
    const hit = schoolFilterItems.find((it) => it.value === sid);
    return hit?.label ?? t('inscFilterSchoolAll');
  }, [schoolFilterId, schoolFilterItems, t]);

  const candidacyStatusFilterItems = useMemo<SearchablePickItem[]>(() => {
    const byId = new Map<number, CandidacyStatusType>();
    for (const s of candidacyStatusCatalog) {
      if (s.isActive) byId.set(s.id, s);
    }
    for (const f of follows) {
      const st = f.status;
      if (st && !byId.has(st.id)) byId.set(st.id, st);
    }
    const merged = Array.from(byId.values()).sort((a, b) => a.sortOrder - b.sortOrder);
    /** Aligné sur `StatusBadge` lorsque `status === null`. */
    const noneAppearance = {
      icon: 'circle',
      colorFg: '#6B7280',
      colorBg: '#F3F4F6',
      colorBorder: '#E5E7EB',
    };
    const rows: SearchablePickItem[] = [
      {
        id: 'status-none',
        value: 'none',
        label: t('inscStatusNone'),
        statusAppearance: noneAppearance,
      },
    ];
    for (const s of merged) {
      rows.push({
        id: `status-${s.id}`,
        value: String(s.id),
        label: locale === 'ar' ? s.labelAr : s.labelFr,
        statusAppearance: {
          icon: s.icon,
          colorFg: s.colorFg,
          colorBg: s.colorBg,
          colorBorder: s.colorBorder,
        },
      });
    }
    return rows;
  }, [candidacyStatusCatalog, follows, locale, t]);

  const candidacyStatusFilterLabel = useMemo(() => {
    if (!candidacyStatusFilter) return t('inscCandidaciesFilterAll');
    if (candidacyStatusFilter === 'none') return t('inscStatusNone');
    const sid = Number(candidacyStatusFilter);
    if (!Number.isFinite(sid)) return t('inscCandidaciesFilterAll');
    const fromCat = candidacyStatusCatalog.find((s) => s.id === sid);
    if (fromCat) return locale === 'ar' ? fromCat.labelAr : fromCat.labelFr;
    const fromFollow = follows.find((f) => f.status?.id === sid)?.status;
    if (fromFollow) return locale === 'ar' ? fromFollow.labelAr : fromFollow.labelFr;
    return `#${sid}`;
  }, [candidacyStatusFilter, candidacyStatusCatalog, follows, locale, t]);

  const filteredFollows = useMemo(() => {
    if (!candidacyStatusFilter) return follows;
    if (candidacyStatusFilter === 'none') {
      return follows.filter((f) => !f.status);
    }
    const sid = Number(candidacyStatusFilter);
    if (!Number.isFinite(sid)) return follows;
    return follows.filter((f) => f.status?.id === sid);
  }, [follows, candidacyStatusFilter]);

  /** Nombre de candidatures (liste filtrée par statut) avec une dernière annonce non consultée. */
  const candidaciesAttentionCount = useMemo(
    () => filteredFollows.filter((f) => followRequiresAttention(f, latestSeenMap)).length,
    [filteredFollows, latestSeenMap],
  );

  const candidaciesDisplayFollows = useMemo(() => {
    let rows = filteredFollows;
    if (candidaciesAttentionFilter === 'action_required') {
      rows = rows.filter((f) => followRequiresAttention(f, latestSeenMap));
    }
    return sortFollowsActionRequiredFirst(rows, latestSeenMap);
  }, [filteredFollows, candidaciesAttentionFilter, latestSeenMap]);

  const paginatedCandidaciesDisplayFollows = useMemo(
    () => candidaciesDisplayFollows.slice(0, candidaciesVisibleEnd),
    [candidaciesDisplayFollows, candidaciesVisibleEnd],
  );

  const hasMoreCandidacies = paginatedCandidaciesDisplayFollows.length < candidaciesDisplayFollows.length;

  useEffect(() => {
    setCandidaciesVisibleEnd(LIST_PAGE_SIZE);
  }, [candidacyStatusFilter, candidaciesAttentionFilter, follows.length]);

  const loadMoreAnnouncements = useCallback(() => {
    if (
      announcementsListLoading ||
      loadingMoreAnnouncements ||
      refreshing ||
      !hasMoreAnnouncements
    ) {
      return;
    }
    setLoadingMoreAnnouncements(true);
    try {
      const nextEnd = Math.min(visibleAnnouncements.length, announcementsVisibleEnd + LIST_PAGE_SIZE);
      const batch = visibleAnnouncements.slice(announcementsVisibleEnd, nextEnd);
      if (batch.length > 0) recordContestListingImpressionsBatch(batch);
      setAnnouncementsVisibleEnd(nextEnd);
    } finally {
      setLoadingMoreAnnouncements(false);
    }
  }, [
    announcementsListLoading,
    loadingMoreAnnouncements,
    refreshing,
    hasMoreAnnouncements,
    visibleAnnouncements,
    announcementsVisibleEnd,
  ]);

  const loadMoreCandidacies = useCallback(() => {
    if (candidaciesListLoading || loadingMoreCandidacies || refreshing || !hasMoreCandidacies) {
      return;
    }
    setLoadingMoreCandidacies(true);
    try {
      const nextEnd = Math.min(candidaciesDisplayFollows.length, candidaciesVisibleEnd + LIST_PAGE_SIZE);
      setCandidaciesVisibleEnd(nextEnd);
    } finally {
      setLoadingMoreCandidacies(false);
    }
  }, [
    candidaciesListLoading,
    loadingMoreCandidacies,
    refreshing,
    hasMoreCandidacies,
    candidaciesDisplayFollows.length,
    candidaciesVisibleEnd,
  ]);

  useEffect(() => {
    if (!isLoggedIn) {
      setLatestSeenMap({});
      return;
    }
    let cancelled = false;
    void (async () => {
      const persisted = await loadFollowLatestSeenMap();
      if (cancelled) return;
      setLatestSeenMap((cur) => {
        const merged = mergeDefaultSeenForFollows(follows, { ...persisted, ...cur });
        if (merged.changed) void saveFollowLatestSeenMap(merged.map);
        return merged.map;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, follows]);

  useFocusEffect(
    useCallback(() => {
      if (!isLoggedIn || tab !== 'candidacies') return;
      let cancelled = false;
      void (async () => {
        const persisted = await loadFollowLatestSeenMap();
        if (cancelled) return;
        setLatestSeenMap((cur) => {
          const merged = mergeDefaultSeenForFollows(follows, { ...cur, ...persisted });
          return merged.map;
        });
      })();
      return () => {
        cancelled = true;
      };
    }, [isLoggedIn, tab, follows]),
  );

  useFocusEffect(
    useCallback(() => {
      void refreshUnread();
    }, [refreshUnread]),
  );

  /** Retour sur l’onglet ou depuis une fiche annonce / suivi (pile racine) : données à jour pour les badges « action requise ». */
  useFocusEffect(
    useCallback(() => {
      if (!isLoggedIn) return;
      void reloadFollows({ silent: true });
    }, [isLoggedIn, reloadFollows]),
  );

  const markLatestAnnouncementSeenForFollow = useCallback((followId: number, announcementId: number) => {
    setLatestSeenMap((prev) => {
      const next = { ...prev, [String(followId)]: announcementId };
      void saveFollowLatestSeenMap(next);
      return next;
    });
  }, []);

  // ── Actions ──
  const handleOpenLink = useCallback(
    async (
      candidacyId: number | null,
      url: string,
      contestId: number,
    ) => {
      if (isInscriptionsLocked) {
        openTawjihPlusProduct();
        return;
      }
      if (!url) {
        Alert.alert(t('inscNoLink'));
        return;
      }
      try {
        await Linking.openURL(url);
      } catch {
        Alert.alert(t('inscErrorLoad'));
        return;
      }
      fireAndForget(recordContestClick(contestId, 'detail'));
      if (candidacyId) {
        const token = await getValidAccessToken();
        if (token) {
          await reportLinkVisited(token, candidacyId);
        }
      }
    },
    [getValidAccessToken, isInscriptionsLocked, openTawjihPlusProduct, t],
  );

  /**
   * Suivre une annonce ⇒ on suit l'école.
   * Le backend résout l'école côté serveur via `contestAnnouncementId`.
   */
  const handleFollow = useCallback(
    async (announcement: ContestAnnouncementCard) => {
      if (!isLoggedIn) {
        Alert.alert(t('inscRequireLogin'));
        return;
      }
      setFollowBusyId(announcement.id);
      try {
        const token = await getValidAccessToken();
        if (!token) return;
        const { follow } = await upsertEstablishmentFollow(token, {
          contestAnnouncementId: announcement.id,
        });
        if (follow) {
          setFollows((prev) => {
            const idx = prev.findIndex((f) => f.id === follow.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = follow;
              return next;
            }
            return [follow, ...prev];
          });
        }
      } finally {
        setFollowBusyId(null);
      }
    },
    [getValidAccessToken, isLoggedIn, t],
  );

  /** Ne plus suivre l'école associée à l'annonce. */
  const handleUnfollow = useCallback(
    async (announcement: ContestAnnouncementCard) => {
      const eid = announcement.establishment?.id;
      if (!eid) return;
      setFollowBusyId(announcement.id);
      try {
        const token = await getValidAccessToken();
        if (!token) return;
        const ok = await deleteEstablishmentFollowByEstablishment(token, eid);
        if (ok) {
          setFollows((prev) => prev.filter((f) => f.establishment?.id !== eid));
        }
      } finally {
        setFollowBusyId(null);
      }
    },
    [getValidAccessToken],
  );

  const handleOpenFollowStatusSheet = useCallback(
    (f: EstablishmentFollow) => {
      if (isInscriptionsLocked) {
        openTawjihPlusProduct();
        return;
      }
      setActiveFollow(f);
      setStatusSheetOpen(true);
    },
    [isInscriptionsLocked, openTawjihPlusProduct],
  );

  const handleConfirmFollowStatus = useCallback(
    async (next: CandidacyStatusType | null) => {
      if (isInscriptionsLocked) {
        openTawjihPlusProduct();
        return;
      }
      if (!activeFollow) return;
      const token = await getValidAccessToken();
      if (!token) return;
      const updated = await updateFollowStatus(token, activeFollow.id, next?.id ?? null);
      if (updated) {
        await reloadFollows({ silent: true });
      }
      setStatusSheetOpen(false);
      setActiveFollow(null);
    },
    [activeFollow, getValidAccessToken, isInscriptionsLocked, openTawjihPlusProduct, reloadFollows],
  );

  /** Ouverture de la sheet depuis une carte annonce. Garde sur le login. */
  const handleOpenAnnouncementStatusSheet = useCallback(
    (a: ContestAnnouncementCard) => {
      if (isInscriptionsLocked) {
        openTawjihPlusProduct();
        return;
      }
      if (!isLoggedIn) {
        router.push('/login' as never);
        return;
      }
      if (!(a.availableStatuses?.length ?? 0)) return;
      setActiveAnnouncement(a);
      setAnnStatusSheetOpen(true);
    },
    [isInscriptionsLocked, isLoggedIn, openTawjihPlusProduct, router],
  );

  /**
   * Confirmation depuis la sheet d'annonce. Auto-follow si nécessaire :
   *   - pas encore suiveur ⇒ création + statut, fallback PATCH si le
   *     backend a posé `interested` au lieu du statut demandé.
   *   - déjà suiveur ⇒ updateFollowStatus direct.
   * Met à jour la liste locale `follows` pour rafraîchir la card sans
   * round-trip (la prochaine ouverture de la sheet voit le bon statut).
   */
  const handleConfirmAnnouncementStatus = useCallback(
    async (next: CandidacyStatusType | null) => {
      if (isInscriptionsLocked) {
        openTawjihPlusProduct();
        return;
      }
      if (!activeAnnouncement) return;
      const eid = activeAnnouncement.establishment?.id ?? 0;
      if (!Number.isFinite(eid) || eid <= 0) return;
      const token = await getValidAccessToken();
      if (!token) return;
      const existing = followsByEstId.get(eid) ?? null;

      let changed = false;
      if (!existing) {
        const { follow } = await upsertEstablishmentFollow(token, {
          contestAnnouncementId: activeAnnouncement.id,
          establishmentId: eid,
          statusId: next?.id ?? null,
        });
        if (follow) {
          if (next?.id != null && follow.status?.id !== next.id) {
            await updateFollowStatus(token, follow.id, next.id);
          }
          changed = true;
        }
      } else {
        const updated = await updateFollowStatus(token, existing.id, next?.id ?? null);
        if (updated) changed = true;
      }

      if (changed) await reloadFollows({ silent: true });

      setAnnStatusSheetOpen(false);
      setActiveAnnouncement(null);
    },
    [
      activeAnnouncement,
      followsByEstId,
      getValidAccessToken,
      isInscriptionsLocked,
      openTawjihPlusProduct,
      reloadFollows,
    ],
  );

  // ── Renders ──

  const renderHeader = () => (
    <View style={styles.hero}>
      <View style={[styles.heroTop, isRTL && styles.rowRtl]}>
        <SidebarMenuIconButton color={brand.white} />
        <View style={styles.heroTitles}>
          <Text style={[styles.heroEyebrow, isRTL && styles.rtl]}>{t('inscEyebrow')}</Text>
          <Text style={[styles.heroTitle, isRTL && styles.rtl]}>{t('inscTitle')}</Text>
        </View>

        <HeroLangSwitch />
      </View>

      <Text style={[styles.heroSub, isRTL && styles.rtl]}>{t('inscSubtitle')}</Text>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {(['announcements', 'candidacies'] as const).map((id) => {
          const active = tab === id;
          const labelKey: 'inscTabCandidacies' | 'inscTabAnnouncements' =
            id === 'candidacies' ? 'inscTabCandidacies' : 'inscTabAnnouncements';
          const icon: React.ComponentProps<typeof FontAwesome>['name'] =
            id === 'candidacies' ? 'flag-checkered' : 'bullhorn';
          const showCandidaciesBadge =
            id === 'candidacies' &&
            isLoggedIn &&
            (activeCandidaciesCount > 0 || candidaciesAttentionTotalCount > 0);
          const isCandidacies = id === 'candidacies';
          return (
            <Pressable
              key={id}
              onPress={() => setTab(id)}
              style={({ pressed }) => [
                styles.tab,
                active && styles.tabActive,
                pressed && !active && { opacity: 0.85 },
              ]}
            >
              {isCandidacies ? (
                <View style={styles.tabCandidaciesInline}>
                  <View style={[styles.tabCandidaciesIconText, isRTL && styles.rowRtl]}>
                    <FontAwesome name={icon} size={13} color={active ? brand.primary : brand.white} />
                    <Text
                      style={[styles.tabTxt, active && styles.tabTxtActive, styles.tabCandidaciesLabel]}
                      numberOfLines={1}>
                      {t(labelKey)}
                    </Text>
                  </View>
                  {showCandidaciesBadge ? (
                    <Animated.View
                      style={[
                        styles.candidaciesTabBadgeWrap,
                        isRTL && styles.rowRtl,
                        { transform: [{ scale: candidaciesBadgeScale }] },
                      ]}
                      accessibilityLabel={t('inscCandidaciesTabBadgeA11y')
                        .replace('{{active}}', String(activeCandidaciesCount))
                        .replace('{{attention}}', String(candidaciesAttentionTotalCount))}
                    >
                      <View style={[styles.tabBadge, styles.tabBadgeCandidaciesCompact, styles.candidaciesBadgeActive]}>
                        <Text style={styles.tabBadgeTxt}>
                          {activeCandidaciesCount > 99 ? '99+' : activeCandidaciesCount}
                        </Text>
                      </View>
                      {candidaciesAttentionTotalCount > 0 ? (
                        <View
                          style={[
                            styles.tabBadge,
                            styles.tabBadgeCandidaciesCompact,
                            styles.candidaciesBadgeAttention,
                          ]}>
                          <Text style={styles.tabBadgeTxt}>
                            {candidaciesAttentionTotalCount > 99 ? '99+' : candidaciesAttentionTotalCount}
                          </Text>
                        </View>
                      ) : null}
                    </Animated.View>
                  ) : null}
                </View>
              ) : (
                <>
                  <FontAwesome name={icon} size={13} color={active ? brand.primary : brand.white} />
                  <Text style={[styles.tabTxt, active && styles.tabTxtActive]}>{t(labelKey)}</Text>
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const renderRequireLogin = () => (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <FontAwesome name="lock" size={28} color={brand.primary} />
      </View>
      <Text style={styles.emptyTitle}>{t('inscRequireLogin')}</Text>
      <Pressable
        onPress={() => router.push('/login')}
        style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
      >
        <Text style={styles.ctaTxt}>{t('inscRequireLoginCta')}</Text>
      </Pressable>
    </View>
  );

  const renderCandidacies = () => {
    if (!isLoggedIn) return renderRequireLogin();
    return (
      <FlatList
        data={candidaciesListLoading ? [] : paginatedCandidaciesDisplayFollows}
        keyExtractor={(f) => `follow-${f.id}`}
        style={{ flex: 1 }}
        contentContainerStyle={styles.list}
        refreshControl={
          <AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReachedThreshold={0.35}
        onEndReached={loadMoreCandidacies}
        ListFooterComponent={
          loadingMoreCandidacies ? (
            <AnnouncementCardSkeletonStack count={1} isRTL={isRTL} style={styles.listFooter} />
          ) : null
        }
        ListHeaderComponent={
          <View style={styles.subHeader}>
            {showInscriptionsPaywall ? (
              <TawjihPlusLockBanner locked style={{ marginBottom: spacing.sm }} />
            ) : (
            <View>
            <View style={[styles.filterBar, isRTL && styles.filterBarRtl]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('inscCandidaciesFilterStatusPickTitle')}
                onPress={() => setCandidacyStatusPickerOpen(true)}
                style={({ pressed }) => [
                  styles.filterField,
                  isRTL && styles.filterFieldRtl,
                  pressed && { opacity: 0.92 },
                ]}
              >
                <FontAwesome name="flag" size={14} color={brand.primary} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.filterFieldLbl, isRTL && styles.rtl]}>
                    {t('inscCandidaciesFilterStatusLabel')}
                  </Text>
                  <Text
                    style={[
                      styles.filterFieldVal,
                      !candidacyStatusFilter && styles.filterFieldValMuted,
                      isRTL && styles.rtl,
                    ]}
                    numberOfLines={1}
                  >
                    {candidacyStatusFilterLabel}
                  </Text>
                </View>
                <FontAwesome
                  name={isRTL ? 'chevron-left' : 'chevron-right'}
                  size={12}
                  color={brand.textMuted}
                />
              </Pressable>
              {candidacyStatusFilter ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('inscFilterReset')}
                  onPress={() => setCandidacyStatusFilter('')}
                  hitSlop={10}
                  style={({ pressed }) => [styles.filterClearBtn, pressed && { opacity: 0.85 }]}
                >
                  <FontAwesome name="times-circle" size={18} color={brand.primary} />
                </Pressable>
              ) : null}
            </View>

            <View style={[styles.attentionFilterRow, isRTL && styles.rowRtl]}>
              {(['all', 'action_required'] as const).map((mode) => {
                const active = candidaciesAttentionFilter === mode;
                const isRequired = mode === 'action_required';
                return (
                  <Pressable
                    key={mode}
                    onPress={() => setCandidaciesAttentionFilter(mode)}
                    style={({ pressed }) => [
                      styles.attentionChip,
                      active && styles.attentionChipActive,
                      isRequired && active && styles.attentionChipActiveDanger,
                      pressed && !active && { opacity: 0.88 },
                    ]}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                  >
                    <Text
                      style={[
                        styles.attentionChipTxt,
                        active && styles.attentionChipTxtActive,
                        isRequired && active && styles.attentionChipTxtActiveDanger,
                      ]}
                    >
                      {mode === 'all'
                        ? t('inscCandidaciesAttentionFilterAll')
                        : t('inscCandidaciesAttentionFilterRequired')}
                    </Text>
                    {isRequired && candidaciesAttentionCount > 0 ? (
                      <View
                        style={[
                          styles.attentionChipBadge,
                          active && styles.attentionChipBadgeActive,
                        ]}
                      >
                        <Text style={styles.attentionChipBadgeTxt}>
                          {candidaciesAttentionCount > 99 ? '99+' : candidaciesAttentionCount}
                        </Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
            </View>
            )}

            {candidacyStatusFilter || candidaciesAttentionFilter !== 'all' ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('schoolsReset')}
                onPress={clearAllCandidacyFilters}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.advancedFilterClear,
                  isRTL && styles.rowRtl,
                  pressed && { opacity: 0.85 },
                  { alignSelf: 'flex-start', marginTop: spacing.xs },
                ]}>
                <FontAwesome name="times-circle" size={16} color={brand.primary} />
                <Text style={styles.advancedFilterClearTxt}>{t('schoolsReset')}</Text>
              </Pressable>
            ) : null}

            <Text style={[styles.followsCount, isRTL && styles.rtl]}>
              {t('followedSchoolsTitle')} (
              {candidacyStatusFilter
                ? `${filteredFollows.length}${
                    follows.length !== filteredFollows.length ? ` / ${follows.length}` : ''
                  }`
                : `${activeCandidaciesCount} ${t('inscCandidaciesActiveShort')}`}
              {candidacyStatusFilter
                ? candidaciesAttentionCount > 0
                  ? ` · ${candidaciesAttentionCount} ${t('inscCandidaciesActionsRequiredShort')}`
                  : ''
                : candidaciesAttentionTotalCount > 0
                  ? ` · ${candidaciesAttentionTotalCount} ${t('inscCandidaciesActionsRequiredShort')}`
                  : ''}
              )
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <FollowedSchoolCard
            follow={item}
            actionRequired={followRequiresAttention(item, latestSeenMap)}
            onPress={() => router.push(`/inscriptions/follow/${item.id}` as never)}
            onUpdateStatus={() => handleOpenFollowStatusSheet(item)}
            statusUpdateLocked={showInscriptionsPaywall}
            onUnfollow={() => {
              Alert.alert(
                t('followSchoolUnfollowConfirmTitle'),
                t('followSchoolUnfollowConfirmMsg'),
                [
                  { text: t('inscCancel'), style: 'cancel' },
                  {
                    text: t('inscDelete'),
                    style: 'destructive',
                    onPress: async () => {
                      const token = await getValidAccessToken();
                      if (!token) return;
                      const ok = await deleteEstablishmentFollow(token, item.id);
                      if (ok) {
                        setFollows((prev) => prev.filter((x) => x.id !== item.id));
                        await reloadFollows();
                      }
                    },
                  },
                ],
              );
            }}
            onOpenLatest={() => {
              if (item.latestAnnouncement?.id) {
                markLatestAnnouncementSeenForFollow(item.id, item.latestAnnouncement.id);
                router.push(`/inscriptions/${item.latestAnnouncement.id}` as never);
              }
            }}
            onOpenSchool={() => {
              const eid = item.establishment?.id;
              if (!eid) return;
              const slug = item.establishment?.slug?.trim() || 'fiche';
              router.push(`/etablissements/${eid}/${slug}` as never);
            }}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          candidaciesListLoading ? (
            <AnnouncementCardSkeletonStack count={2} isRTL={isRTL} style={styles.listLoading} />
          ) : followsLoadError ? (
            <LoadErrorState
              message={followsLoadError}
              onRetry={() => void reloadFollows()}
              retryLabel={loadErrorRetryLabel(t)}
              isRTL={isRTL}
            />
          ) : follows.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <FontAwesome name="flag-o" size={28} color={brand.primary} />
              </View>
              <Text style={styles.emptyTitle}>{t('inscCandidaciesEmptyTitle')}</Text>
              <Text style={styles.emptyTxt}>{t('inscCandidaciesEmptyDesc')}</Text>
              <Pressable
                onPress={() => setTab('announcements')}
                style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.ctaTxt}>{t('inscCandidaciesEmptyCta')}</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (isInscriptionsLocked) {
                    openTawjihPlusProduct();
                    return;
                  }
                  openApplyToSchoolsTour();
                }}
                style={({ pressed }) => [styles.ctaOutline, pressed && { opacity: 0.85 }]}
              >
                <FontAwesome name="graduation-cap" size={14} color={brand.primary} />
                <Text style={styles.ctaOutlineTxt}>{t('inscCandidaciesEmptyTourCta')}</Text>
              </Pressable>
            </View>
          ) : filteredFollows.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <FontAwesome name="filter" size={28} color={brand.primary} />
              </View>
              <Text style={styles.emptyTitle}>{t('inscCandidaciesFilteredEmptyTitle')}</Text>
              <Text style={styles.emptyTxt}>{t('inscCandidaciesFilteredEmptyDesc')}</Text>
              <Pressable
                onPress={() => setCandidacyStatusFilter('')}
                style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.ctaTxt}>{t('inscCandidaciesFilterAll')}</Text>
              </Pressable>
            </View>
          ) : candidaciesAttentionFilter === 'action_required' ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <FontAwesome name="check-circle" size={28} color="#059669" />
              </View>
              <Text style={styles.emptyTitle}>{t('inscCandidaciesActionRequiredEmpty')}</Text>
              <Pressable
                onPress={() => setCandidaciesAttentionFilter('all')}
                style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.ctaTxt}>{t('inscCandidaciesAttentionFilterAll')}</Text>
              </Pressable>
            </View>
          ) : null
        }
      />
    );
  };

  const renderAnnouncementsFilterBar = () => {
    if (isInscriptionsAccessPending) {
      return (
        <View style={styles.filterBarWrap}>
          <InscriptionsAnnouncementsFiltersSkeleton isRTL={isRTL} />
        </View>
      );
    }

    return (
    <View style={styles.filterBarWrap}>
      <View style={[styles.filterBar, isRTL && styles.filterBarRtl]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            announcementsFiltersLocked
              ? t('schoolsSearchFiltersLockedHint')
              : t('inscFilterSchoolPickTitle')
          }
          onPress={
            announcementsFiltersLocked
              ? showAnnouncementsFiltersUpgradeAlert
              : () => setSchoolPickerOpen(true)
          }
          style={({ pressed }) => [
            styles.filterField,
            isRTL && styles.filterFieldRtl,
            announcementsFiltersLocked && styles.filterFieldLocked,
            pressed && !announcementsFiltersLocked && { opacity: 0.92 },
          ]}
        >
          <FontAwesome
            name={announcementsFiltersLocked ? 'lock' : 'university'}
            size={14}
            color={announcementsFiltersLocked ? '#94A3B8' : brand.primary}
          />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.filterFieldLbl, isRTL && styles.rtl]}>
              {t('inscFilterSchoolLabel')}
            </Text>
            <Text
              style={[
                styles.filterFieldVal,
                !schoolFilterId && styles.filterFieldValMuted,
                isRTL && styles.rtl,
              ]}
              numberOfLines={1}
            >
              {schoolFilterLabel}
            </Text>
          </View>
          <FontAwesome
            name={isRTL ? 'chevron-left' : 'chevron-right'}
            size={12}
            color={brand.textMuted}
          />
        </Pressable>
        {schoolFilterId && !announcementsFiltersLocked ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('inscFilterReset')}
            onPress={() => setSchoolFilterId('')}
            hitSlop={10}
            style={({ pressed }) => [styles.filterClearBtn, pressed && { opacity: 0.85 }]}
          >
            <FontAwesome name="times-circle" size={18} color={brand.primary} />
          </Pressable>
        ) : null}
      </View>

      {/* Bouton "Filtres avancés" + toggle tri par délai. */}
      <View style={[styles.advancedFilterRow, isRTL && styles.rowRtl]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            announcementsFiltersLocked
              ? t('schoolsSearchFiltersLockedHint')
              : t('schoolsFiltersTitle')
          }
          onPress={
            announcementsFiltersLocked
              ? showAnnouncementsFiltersUpgradeAlert
              : () => {
                  void ensureFiltersDataLoaded();
                  setFiltersOpen(true);
                }
          }
          style={({ pressed }) => [
            styles.advancedFilterBtn,
            isRTL && styles.rowRtl,
            announcementsFiltersLocked && styles.advancedFilterBtnLocked,
            pressed && !announcementsFiltersLocked && { opacity: 0.9 },
          ]}>
          <FontAwesome
            name={announcementsFiltersLocked ? 'lock' : 'sliders'}
            size={14}
            color={announcementsFiltersLocked ? '#94A3B8' : brand.primary}
          />
          <Text
            style={[
              styles.advancedFilterBtnTxt,
              announcementsFiltersLocked && styles.advancedFilterBtnTxtLocked,
            ]}>
            {t('schoolsFiltersTitle')}
          </Text>
          {!announcementsFiltersLocked && announcementTabFiltersActiveCount > 0 ? (
            <View style={styles.advancedFilterBadge}>
              <Text style={styles.advancedFilterBadgeTxt}>{announcementTabFiltersActiveCount}</Text>
            </View>
          ) : null}
        </Pressable>

        {/*
          Tri par dernier délai — toggle binaire ON/OFF placé à côté du
          bouton « Filtres avancés ». Le label reste fixe (« Trier par
          délai ») ; on signifie l'état via le style (couleur de fond
          + couleur du texte).
        */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            announcementsFiltersLocked
              ? t('schoolsSearchFiltersLockedHint')
              : t('inscSortClosingSoon')
          }
          accessibilityState={{ selected: !announcementsFiltersLocked && sortByClosingSoon }}
          onPress={
            announcementsFiltersLocked
              ? showAnnouncementsFiltersUpgradeAlert
              : () => setSortByClosingSoon((v) => !v)
          }
          style={({ pressed }) => [
            styles.advancedFilterBtn,
            isRTL && styles.rowRtl,
            announcementsFiltersLocked && styles.advancedFilterBtnLocked,
            !announcementsFiltersLocked && sortByClosingSoon && styles.advancedFilterBtnActive,
            pressed && !announcementsFiltersLocked && { opacity: 0.9 },
          ]}>
          <FontAwesome
            name={announcementsFiltersLocked ? 'lock' : 'sort-amount-asc'}
            size={14}
            color={
              announcementsFiltersLocked
                ? '#94A3B8'
                : sortByClosingSoon
                  ? brand.white
                  : brand.primary
            }
          />
          <Text
            style={[
              styles.advancedFilterBtnTxt,
              announcementsFiltersLocked && styles.advancedFilterBtnTxtLocked,
              !announcementsFiltersLocked && sortByClosingSoon && styles.advancedFilterBtnTxtActive,
            ]}>
            {t('inscSortClosingSoon')}
          </Text>
        </Pressable>

        {hasActiveAnnouncementListingFilters && !announcementsFiltersLocked ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('schoolsReset')}
            onPress={clearAllAnnouncementFilters}
            hitSlop={10}
            style={({ pressed }) => [
              styles.advancedFilterClear,
              isRTL && styles.rowRtl,
              pressed && { opacity: 0.85 },
            ]}>
            <FontAwesome name="times-circle" size={16} color={brand.primary} />
            <Text style={styles.advancedFilterClearTxt}>{t('schoolsReset')}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
    );
  };

  const renderAnnouncements = () => (
    <FlatList
      data={announcementsListLoading ? [] : paginatedVisibleAnnouncements}
      keyExtractor={(a) => `ann-${a.id}`}
      style={{ flex: 1 }}
      contentContainerStyle={styles.list}
      refreshControl={
        <AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onEndReachedThreshold={0.35}
      onEndReached={loadMoreAnnouncements}
      ListFooterComponent={
        loadingMoreAnnouncements ? (
          <AnnouncementCardSkeletonStack count={1} isRTL={isRTL} style={styles.listFooter} />
        ) : null
      }
      ListHeaderComponent={
        <View>
          <AppBannerSlot zone="top" analyticsPage="/mobile/inscriptions/annonces" />
          {renderAnnouncementsFilterBar()}
        </View>
      }
      renderItem={({ item, index }) => {
        if (!item) return null;
        const eid = item.establishment?.id ?? 0;
        const isFollowed = eid > 0 && followedEstablishmentSet.has(eid);
        return (
        <View>
          {index === MID_BANNER_AFTER_CARD_INDEX ? (
            <AppBannerSlot zone="mid" analyticsPage="/mobile/inscriptions/annonces" />
          ) : null}
          <AnnouncementCard
            item={item}
            isFollowed={isFollowed}
            isUnread={unreadAnnouncementIds.has(item.id)}
            isUnseen={isAnnouncementUnseen(item.id, seenAnnouncementIds)}
            followStateLoading={isLoggedIn && !followsReady}
            eligibilityLoading={isLoggedIn && eligibilityProfileLoading}
            busy={followBusyId === item.id}
            onPress={() => {
              void markAnnouncementSeen(item.id);
              router.push(`/inscriptions/${item.id}` as never);
            }}
            onToggleFollow={() => {
              if (isFollowed) void handleUnfollow(item);
              else void handleFollow(item);
            }}
            onOpenLink={() => handleOpenLink(null, item.registrationUrl, item.id)}
            currentStatus={eid > 0 ? followsByEstId.get(eid)?.status ?? null : null}
            onUpdateStatus={() => handleOpenAnnouncementStatusSheet(item)}
            previewOnly={item.previewOnly ?? showInscriptionsPaywall}
          />
        </View>
        );
      }}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      ListEmptyComponent={
        announcementsListLoading ? (
          <AnnouncementCardSkeletonStack count={2} isRTL={isRTL} style={styles.listLoading} />
        ) : announcementsLoadError ? (
          <LoadErrorState
            message={announcementsLoadError}
            onRetry={() => void reloadAnnouncements()}
            retryLabel={loadErrorRetryLabel(t)}
            isRTL={isRTL}
          />
        ) : announcements.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <FontAwesome name="bullhorn" size={28} color={brand.primary} />
            </View>
            <Text style={styles.emptyTitle}>{t('inscAnnouncementsEmptyTitle')}</Text>
            <Text style={styles.emptyTxt}>{t('inscAnnouncementsEmptyDesc')}</Text>
          </View>
        ) : visibleAnnouncements.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <FontAwesome name="filter" size={28} color={brand.primary} />
            </View>
            <Text style={styles.emptyTitle}>{t('inscAnnouncementsFilteredEmptyTitle')}</Text>
            <Text style={styles.emptyTxt}>{t('inscAnnouncementsFilteredEmptyDesc')}</Text>
            <Pressable
              onPress={clearAllAnnouncementFilters}
              style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.ctaTxt}>{t('schoolsReset')}</Text>
            </Pressable>
          </View>
        ) : null
      }
    />
  );

  if (authLoading) {
    return (
      <SafeAreaView style={[styles.root, styles.center]} edges={['top']}>
        <AnnouncementCardSkeletonStack count={3} isRTL={isRTL} style={styles.center} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar style="light" backgroundColor={brand.primary} />
      {renderHeader()}
      <View style={styles.body}>
        {tab === 'announcements' ? renderAnnouncements() : null}
        {tab === 'candidacies' ? renderCandidacies() : null}
      </View>

      {/* Sheet de mise à jour du statut d'un follow école. Les statuts
          proposables = union des annonces de l'école (calcul backend). */}
      <StatusUpdateSheet
        visible={statusSheetOpen}
        currentStatus={activeFollow?.status ?? null}
        availableStatuses={activeFollow?.availableStatuses ?? []}
        onClose={() => {
          setStatusSheetOpen(false);
          setActiveFollow(null);
        }}
        onConfirm={handleConfirmFollowStatus}
      />

      {/* Sheet de mise à jour du statut depuis une carte annonce.
          Contrairement à la sheet « école suivie », on n'affiche QUE les
          statuts débloqués par cette annonce (`showUnavailable={false}`)
          — pas les statuts d'autres annonces de l'école, pour ne pas
          créer de confusion sur ce qui est réellement actionnable ici.
          Auto-follow côté handler si l'école n'est pas encore suivie. */}
      <StatusUpdateSheet
        visible={annStatusSheetOpen}
        currentStatus={
          activeAnnouncement?.establishment?.id
            ? followsByEstId.get(activeAnnouncement.establishment.id)?.status ?? null
            : null
        }
        availableStatuses={activeAnnouncement?.availableStatuses ?? []}
        showUnavailable={false}
        onClose={() => {
          setAnnStatusSheetOpen(false);
          setActiveAnnouncement(null);
        }}
        onConfirm={handleConfirmAnnouncementStatus}
      />

      {/* Modal recherchable pour filtrer les annonces par école. */}
      <SearchablePickSheet
        visible={schoolPickerOpen}
        title={t('inscFilterSchoolPickTitle')}
        searchPlaceholder={t('inscFilterSchoolSearchPlaceholder')}
        emptyLabel={t('inscFilterSchoolNoResults')}
        allLabel={t('inscFilterSchoolAll')}
        items={schoolFilterItems}
        selectedValue={schoolFilterId}
        onPick={(v) => setSchoolFilterId(v)}
        onClose={() => setSchoolPickerOpen(false)}
        rtl={isRTL}
      />

      <SearchablePickSheet
        visible={candidacyStatusPickerOpen}
        title={t('inscCandidaciesFilterStatusPickTitle')}
        searchPlaceholder={t('inscCandidaciesFilterStatusSearchPlaceholder')}
        emptyLabel={t('inscCandidaciesFilterStatusNoResults')}
        allLabel={t('inscCandidaciesFilterAll')}
        items={candidacyStatusFilterItems}
        selectedValue={candidacyStatusFilter}
        onPick={(v) => setCandidacyStatusFilter(v)}
        onClose={() => setCandidacyStatusPickerOpen(false)}
        rtl={isRTL}
      />

      {/* Modale de filtres avancés — partagée avec la page Écoles. */}
      <EstablishmentFiltersModal
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={filtersValue}
        onChange={setFiltersValue}
        cities={cities}
        secteurs={secteurs}
        getDefaultFilters={getAnnouncementDefaultFilters}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.primary },
  body: { flex: 1, backgroundColor: brand.backgroundSoft },
  center: { alignItems: 'center', justifyContent: 'center' },
  rowRtl: { flexDirection: 'row-reverse' },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },

  /* Hero */
  hero: {
    backgroundColor: brand.primary,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroTitles: { flex: 1, gap: 3 },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  heroTitle: { color: brand.white, fontSize: fontSize.xxl, fontWeight: '900' },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: fontSize.sm, lineHeight: 19 },

  /* Tabs */
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 4,
    borderRadius: radius.full,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    flex: 1,
    minWidth: 0,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: radius.full,
  },
  /** Onglet Candidatures : une ligne icône + libellé + pastilles à droite du texte. */
  tabCandidaciesInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
    maxWidth: '100%',
  },
  tabCandidaciesIconText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
    minWidth: 0,
  },
  tabCandidaciesLabel: {
    flexShrink: 1,
    textAlign: 'center',
  },
  tabActive: { backgroundColor: brand.white },
  tabTxt: { color: brand.white, fontWeight: '700', fontSize: fontSize.xs },
  tabTxtActive: { color: brand.primary, fontWeight: '800' },
  tabBadge: {
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeLtr: { marginStart: 2 },
  tabBadgeRtl: { marginEnd: 2 },
  candidaciesTabBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    flexShrink: 0,
  },
  tabBadgeCandidaciesCompact: {
    minWidth: 15,
    height: 15,
    paddingHorizontal: 3,
    borderRadius: 8,
  },
  candidaciesBadgeActive: {
    backgroundColor: '#059669',
  },
  candidaciesBadgeAttention: {
    backgroundColor: '#DC2626',
  },
  tabBadgeTxt: { color: brand.white, fontSize: 9, fontWeight: '800' },

  /* Sub-header (filters) */
  subHeader: { paddingTop: spacing.md, paddingBottom: spacing.sm },
  attentionFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  attentionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  attentionChipActive: {
    backgroundColor: 'rgba(51,62,143,0.12)',
    borderColor: brand.primary,
  },
  attentionChipActiveDanger: {
    backgroundColor: '#FEE2E2',
    borderColor: '#F87171',
  },
  attentionChipTxt: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.textMuted,
  },
  attentionChipTxtActive: { color: brand.primary },
  attentionChipTxtActiveDanger: { color: '#991B1B' },
  attentionChipBadge: {
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attentionChipBadgeActive: {
    backgroundColor: '#DC2626',
  },
  attentionChipBadgeTxt: {
    color: brand.white,
    fontSize: 9,
    fontWeight: '900',
  },
  followsCount: { color: brand.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 6,
    backgroundColor: brand.white,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  chipActive: {
    backgroundColor: brand.primary,
    borderColor: brand.primary,
  },
  chipTxt: { color: brand.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  chipTxtActive: { color: brand.white },

  /* Lists */
  list: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.section * 2,
  },
  /** Skeleton liste : pleine largeur, sans marges « empty state ». */
  listLoading: {
    width: '100%',
    alignSelf: 'stretch',
    paddingTop: spacing.xs,
  },
  listFooter: {
    width: '100%',
    alignSelf: 'stretch',
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },

  /* Filter bar (onglet "Annonces") */
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterBarRtl: {
    flexDirection: 'row-reverse',
  },
  filterField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  filterFieldRtl: {
    flexDirection: 'row-reverse',
  },
  filterFieldLbl: {
    color: brand.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  filterFieldVal: {
    color: brand.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginTop: 1,
  },
  filterFieldValMuted: {
    color: brand.textMuted,
    fontWeight: '600',
  },
  filterFieldLocked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.92,
  },
  filterClearBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    flexShrink: 0,
  },

  /* Conteneur englobant la barre filtre + le bouton "Filtres avancés" */
  filterBarWrap: { marginBottom: spacing.md },
  advancedFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: -spacing.sm + 2,
  },
  advancedFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  advancedFilterBtnTxt: {
    color: brand.text,
    fontSize: 12,
    fontWeight: '800',
  },
  advancedFilterBtnLocked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.92,
  },
  advancedFilterBtnTxtLocked: {
    color: '#94A3B8',
  },
  /* État ON du bouton « Trier par délai » : fond plein bleu primaire. */
  advancedFilterBtnActive: {
    backgroundColor: brand.primary,
    borderColor: brand.primary,
  },
  advancedFilterBtnTxtActive: {
    color: brand.white,
  },
  advancedFilterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 999,
    paddingHorizontal: 6,
    backgroundColor: brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advancedFilterBadgeTxt: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  advancedFilterClear: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    flexShrink: 0,
  },
  advancedFilterClearTxt: {
    color: brand.primary,
    fontSize: 12,
    fontWeight: '800',
  },


  /* Empty / require login */
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.section * 2,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: 'rgba(51,62,143,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: { color: brand.text, fontSize: fontSize.md, fontWeight: '800', textAlign: 'center' },
  emptyTxt: { color: brand.textSecondary, fontSize: fontSize.sm, textAlign: 'center', lineHeight: 19 },
  cta: {
    marginTop: spacing.md,
    backgroundColor: brand.primary,
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: radius.full,
  },
  ctaTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.sm },
  ctaOutline: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: brand.primary,
    backgroundColor: brand.white,
  },
  ctaOutlineTxt: {
    color: brand.primary,
    fontWeight: '800',
    fontSize: fontSize.sm,
  },
});
