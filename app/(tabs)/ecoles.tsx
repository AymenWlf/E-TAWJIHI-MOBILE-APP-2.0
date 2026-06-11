import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SearchInputWithApply } from '@/components/search/SearchInputWithApply';
import { SchoolsSearchFiltersSkeleton } from '@/components/schools/SchoolsSearchFiltersSkeleton';
import { SidebarMenuIconButton } from '@/components/SidebarMenuIconButton';
import { AppBannerSlot } from '@/components/ads/AppBannerSlot';
import { EstablishmentCard } from '@/components/schools/EstablishmentCard';
import { EstablishmentEligibleQuickFilter } from '@/components/schools/EstablishmentEligibleQuickFilter';
import {
  countActiveEstablishmentFilters,
  defaultEstablishmentFilters,
  EstablishmentFiltersModal,
  type EstablishmentFiltersValue,
} from '@/components/schools/EstablishmentFiltersModal';
import { AppRefreshControl } from '@/components/ui/AppRefreshControl';
import { EstablishmentCardSkeletonStack } from '@/components/schools/EstablishmentCardSkeleton';
import { HeroLangSwitch } from '@/components/ui/HeroLangSwitch';
import { Text } from '@/components/ui/Text';
import { getApiBaseUrl } from '@/constants/api';
import { useAuth } from '@/contexts/AuthContext';
import { useTawjihPlusAccessContext } from '@/contexts/TawjihPlusAccessContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useSharePreview } from '@/contexts/SharePreviewContext';
import { useAppliedTextSearch } from '@/hooks/useAppliedTextSearch';
import { useEligibilityProfile } from '@/hooks/useEligibilityProfile';
import { listAllEstablishments, listEstablishments, type EstablishmentNormalized } from '@/services/establishments';
import {
  deleteEstablishmentFollowByEstablishment,
  fetchEstablishmentFollows,
  upsertEstablishmentFollow,
} from '@/services/establishmentFollows';
import {
  recordEstablishmentClick,
  recordEstablishmentListingImpressionsBatch,
} from '@/services/establishmentTracking';
import {
  evaluateEligibilityByFiliere,
  hasEligibilityFiliereProfile,
  matchesAcceptedStudyPathFilter,
} from '@/utils/eligibility';
import { fireAndForget } from '@/utils/fireAndForget';
import {
  fetchListingPlacementsByEstablishment,
  mergeEstablishmentsWithListingPlacements,
  type ListingPlacementInfo,
} from '@/services/referencingAds';
import { listAllSecteursActive, listCities, type CityRow, type SecteurRow } from '@/services/referenceData';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import {
  applyEstablishmentWebClientFilters,
  dedupeEstablishmentsById,
  getListingWebOrderContentSig,
  sortEstablishmentsLikeEcolesSuperieuresWeb,
  sortSponsoredFirst,
} from '@/utils/establishmentWebFilters';
import { resolveEstablishmentLockedVariant } from '@/utils/establishmentLockDisplay';

const PAGE_SIZE = 18;
/** Bannière `mid` : une seule fois, après la 3e fiche (index 0-based = 2). */
const MID_BANNER_AFTER_CARD_INDEX = 2;
/** Alias conservé — évite crash si le bundle Metro est en retard sur le hot-reload. */
const MID_BANNER_AFTER_EVERY_N_CARDS = MID_BANNER_AFTER_CARD_INDEX;

export default function EcolesScreen() {
  const router = useRouter();
  const { isRTL, t } = useLocale();
  const { presentShare } = useSharePreview();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<EstablishmentNormalized[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [clientMode, setClientMode] = useState(false);
  const [filteredPool, setFilteredPool] = useState<EstablishmentNormalized[] | null>(null);
  /** Catalogue complet (toutes pages API) pour compteur / filtre « Éligibles » hors pagination. */
  const [fullCatalogPool, setFullCatalogPool] = useState<EstablishmentNormalized[] | null>(null);
  const [visibleEnd, setVisibleEnd] = useState(PAGE_SIZE);

  const {
    draft: q,
    setDraft: setQ,
    applied: appliedQ,
    apply: applySearch,
    clear: clearSearch,
    hasPending: searchPending,
  } = useAppliedTextSearch();

  /** Même modale que l’onglet Inscriptions › Annonces (`EstablishmentFiltersModal`). */
  const [filtersValue, setFiltersValue] = useState<EstablishmentFiltersValue>(() => ({
    ...defaultEstablishmentFilters(),
    /** Pas de filtre éligibilité auto-activé — toggle rapide dédié ci-dessous. */
    eligibilityFilter: 'all',
  }));
  const [filtersOpen, setFiltersOpen] = useState(false);

  /**
   * Filtre rapide « Éligibles » : écoles compatibles profil, hors écoles déjà
   * suivies (candidature pas encore « activée » via le cœur).
   */
  const [eligibleDiscoveryFilter, setEligibleDiscoveryFilter] = useState(false);

  /** Afficher uniquement les établissements déjà suivis (cœur). */
  const [followedOnly, setFollowedOnly] = useState(false);

  const [cities, setCities] = useState<CityRow[]>([]);
  const [secteurs, setSecteurs] = useState<SecteurRow[]>([]);
  const [placementByEid, setPlacementByEid] = useState<Record<number, ListingPlacementInfo>>({});
  /** Ne reshuffle le tri « style EcolesSupérieures » que si la piscine / les placements changent. */
  const listingWebOrderContentSigRef = useRef<string>('');
  /** Ordre mélangé (client mode) — ne pas réécrire `filteredPool` pour éviter boucles de re-render. */
  const orderedClientPoolRef = useRef<EstablishmentNormalized[] | null>(null);
  /** Catalogue complet ordonné (filtre « Éligibles ») — évite reshuffle à chaque scroll / placement. */
  const catalogListingContentSigRef = useRef<string>('');
  const orderedCatalogPoolRef = useRef<EstablishmentNormalized[] | null>(null);
  /** Évite les appels `onEndReached` en rafale (skeleton / fetch en boucle). */
  const loadMoreInFlightRef = useRef(false);
  /** Ignore le premier `onEndReached` au montage (liste courte). */
  const endReachedEnabledRef = useRef(false);
  /** Révision du listing client ordonné (ref seule ne déclenche pas de re-render). */
  const [clientListingRevision, setClientListingRevision] = useState(0);
  /** Listing serveur : ordre stable à l’append (évite de revoir les mêmes écoles au load more). */
  const stableServerListingRef = useRef<EstablishmentNormalized[]>([]);
  const serverListingNeedsResetRef = useRef(true);

  /* Suivi d'écoles : Set des IDs suivis + IDs en cours de toggle */
  const { user, getValidAccessToken, isLoading: authLoading } = useAuth();
  const isLoggedIn = !!user;
  const {
    profile: eligibilityProfile,
    loading: eligibilityProfileLoading,
    refetch: refetchEligibilityProfile,
  } = useEligibilityProfile();
  const {
    hasSchoolsCatalogAccess,
    loading: schoolsCatalogAccessLoading,
    openTawjihPlusProduct: openTawjihPlusFromContext,
  } = useTawjihPlusAccessContext();
  /** Skeleton recherche/filtres tant que la session ou les droits client ne sont pas connus. */
  const searchFiltersAccessLoading = authLoading || schoolsCatalogAccessLoading;
  const searchFiltersLocked = !searchFiltersAccessLoading && !hasSchoolsCatalogAccess;
  /** Catalogue écoles : 3 premières fiches complètes sans service actif ; listing complet pour clients. */
  const schoolsCatalogLocked = searchFiltersLocked;

  const openTawjihPlusProduct = useCallback(() => {
    openTawjihPlusFromContext();
  }, [openTawjihPlusFromContext]);

  const showTawjihPlusUpgradeAlert = useCallback(() => {
    Alert.alert(t('inscTawjihPlusLockTitle'), t('schoolsSearchFiltersLockedHint'), [
      { text: t('accountLogoutCancel'), style: 'cancel' },
      { text: t('inscTawjihPlusUpgradeCta'), onPress: openTawjihPlusProduct },
    ]);
  }, [openTawjihPlusProduct, t]);
  const [followedIds, setFollowedIds] = useState<Set<number>>(() => new Set());
  const [followBusyIds, setFollowBusyIds] = useState<Set<number>>(() => new Set());
  /** Premier chargement des suivis : évite d’afficher « non suivi » avant la réponse API. */
  const [followsReady, setFollowsReady] = useState(!isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) {
      setFollowsReady(true);
      setFollowedOnly(false);
      setEligibleDiscoveryFilter(false);
    } else setFollowsReady(false);
  }, [isLoggedIn, user?.id]);

  useEffect(() => {
    if (!eligibleDiscoveryFilter) return;
    setPage(1);
    setVisibleEnd(PAGE_SIZE);
  }, [eligibleDiscoveryFilter]);

  /** Recharge la liste des écoles suivies (un seul appel partagé pour toute la liste). */
  const reloadFollows = useCallback(async () => {
    if (!isLoggedIn) {
      setFollowedIds(new Set());
      setFollowsReady(true);
      return;
    }
    try {
      const token = await getValidAccessToken();
      if (!token) return;
      const payload = await fetchEstablishmentFollows(token);
      const ids = new Set<number>();
      for (const f of payload.items) {
        const eid = f.establishment?.id;
        if (typeof eid === 'number' && Number.isFinite(eid)) ids.add(eid);
      }
      setFollowedIds(ids);
    } finally {
      setFollowsReady(true);
    }
  }, [getValidAccessToken, isLoggedIn]);

  useEffect(() => {
    void reloadFollows();
  }, [reloadFollows]);

  useEffect(() => {
    void fetchListingPlacementsByEstablishment()
      .then(setPlacementByEid)
      .catch(() => setPlacementByEid({}));
  }, []);

  /** Mode client : même composition que `EcolesSupérieures.tsx` (shuffle sponsorisés + blocs mélangés). */
  useEffect(() => {
    if (!clientMode || !filteredPool?.length) {
      orderedClientPoolRef.current = null;
      return;
    }
    const merged = mergeEstablishmentsWithListingPlacements(filteredPool, placementByEid);
    const contentSig = getListingWebOrderContentSig(merged, placementByEid);
    if (contentSig === listingWebOrderContentSigRef.current && orderedClientPoolRef.current) {
      return;
    }
    listingWebOrderContentSigRef.current = contentSig;
    const ordered = dedupeEstablishmentsById(
      sortEstablishmentsLikeEcolesSuperieuresWeb(merged, placementByEid),
    );
    orderedClientPoolRef.current = ordered;
    setClientListingRevision((v) => v + 1);
  }, [clientMode, filteredPool, placementByEid]);

  /** Toggle Suivre/Ne plus suivre — mise à jour optimiste, revert si l'API échoue. */
  const handleToggleFollow = useCallback(
    async (eid: number) => {
      if (!isLoggedIn) {
        Alert.alert(t('inscRequireLogin'));
        router.push('/login' as never);
        return;
      }
      if (!Number.isFinite(eid) || eid <= 0) return;
      // Verrouillage local pour éviter doubles taps.
      setFollowBusyIds((prev) => {
        const next = new Set(prev);
        next.add(eid);
        return next;
      });
      const wasFollowed = followedIds.has(eid);
      // Optimiste
      setFollowedIds((prev) => {
        const next = new Set(prev);
        if (wasFollowed) next.delete(eid);
        else next.add(eid);
        return next;
      });
      try {
        const token = await getValidAccessToken();
        if (!token) {
          // Revert
          setFollowedIds((prev) => {
            const next = new Set(prev);
            if (wasFollowed) next.add(eid);
            else next.delete(eid);
            return next;
          });
          return;
        }
        let ok = false;
        if (wasFollowed) {
          ok = await deleteEstablishmentFollowByEstablishment(token, eid);
        } else {
          const res = await upsertEstablishmentFollow(token, {
            establishmentId: eid,
          });
          ok = !!res.follow;
        }
        if (!ok) {
          setFollowedIds((prev) => {
            const next = new Set(prev);
            if (wasFollowed) next.add(eid);
            else next.delete(eid);
            return next;
          });
          Alert.alert('', t('inscErrorLoad'));
        }
      } finally {
        setFollowBusyIds((prev) => {
          const next = new Set(prev);
          next.delete(eid);
          return next;
        });
      }
    },
    [followedIds, getValidAccessToken, isLoggedIn, router, t],
  );

  useEffect(() => {
    void listCities(1000)
      .then(setCities)
      .catch(() => setCities([]));
  }, []);

  useEffect(() => {
    if (!filtersOpen) return;
    void listAllSecteursActive()
      .then(setSecteurs)
      .catch(() => setSecteurs([]));
  }, [filtersOpen]);

  const needsClientScan = useMemo(() => {
    const fv = filtersValue;
    return (
      !!fv.secteurId.trim() ||
      !!fv.diplome.trim() ||
      fv.fraisMin > 0 ||
      fv.fraisMax < 100_000 ||
      !!fv.regionTitle.trim()
    );
  }, [filtersValue]);

  const regionTitle = filtersValue.regionTitle.trim();
  /** Attendre les villes uniquement pour le filtre région (scan client). */
  const needsCitiesForRegion = needsClientScan && regionTitle.length > 0;

  const queryKey = useMemo(
    () =>
      [
        appliedQ,
        filtersValue.type,
        filtersValue.ville.trim(),
        filtersValue.universite.trim(),
        filtersValue.regionTitle,
        filtersValue.secteurId,
        filtersValue.diplome,
        filtersValue.fraisMin,
        filtersValue.fraisMax,
        needsClientScan ? 1 : 0,
      ].join('__'),
    [appliedQ, filtersValue, needsClientScan],
  );

  const apiQueryBase = useCallback(
    () => ({
      search: appliedQ || undefined,
      type: filtersValue.type || undefined,
      ville: filtersValue.ville.trim() || undefined,
      universite: filtersValue.universite.trim() || undefined,
    }),
    [appliedQ, filtersValue],
  );

  const catalogPool = filteredPool ?? fullCatalogPool;

  useEffect(() => {
    if (filteredPool) {
      setFullCatalogPool(null);
      return;
    }
    let cancelled = false;
    void listAllEstablishments(apiQueryBase())
      .then((all) => {
        if (!cancelled) setFullCatalogPool(dedupeEstablishmentsById(all));
      })
      .catch(() => {
        if (!cancelled) setFullCatalogPool(null);
      });
    return () => {
      cancelled = true;
    };
  }, [apiQueryBase, filteredPool, queryKey]);

  useEffect(() => {
    let cancelled = false;
    setErr(null);
    setPage(1);
    setVisibleEnd(PAGE_SIZE);
    endReachedEnabledRef.current = false;
    setClientMode(needsClientScan);
    setFilteredPool(null);
    listingWebOrderContentSigRef.current = '';
    orderedClientPoolRef.current = null;
    catalogListingContentSigRef.current = '';
    orderedCatalogPoolRef.current = null;
    stableServerListingRef.current = [];
    serverListingNeedsResetRef.current = true;

    if (needsClientScan) {
      if (needsCitiesForRegion && cities.length === 0) {
        setLoading(true);
        return () => {
          cancelled = true;
        };
      }
      setLoading(true);
      void listAllEstablishments(apiQueryBase())
        .then((all) => {
          if (cancelled) return;
          const regionSet =
            needsCitiesForRegion && cities.length > 0
              ? new Set(
                  cities
                    .filter((c) => c.region?.titre === regionTitle)
                    .map((c) => c.titre.trim())
                    .filter(Boolean),
                )
              : null;
          let f = applyEstablishmentWebClientFilters(all, {
            secteurId: filtersValue.secteurId ? parseInt(filtersValue.secteurId, 10) : null,
            villesInRegion: regionSet && regionSet.size > 0 ? regionSet : null,
            villeExact: filtersValue.ville.trim() || null,
            diplomeExact: filtersValue.diplome.trim() || null,
            fraisMin: filtersValue.fraisMin,
            fraisMax: filtersValue.fraisMax,
          });
          setFilteredPool(f);
          setItems([]);
          setVisibleEnd(PAGE_SIZE);
          setPages(Math.max(1, Math.ceil(f.length / PAGE_SIZE)));
        })
        .catch((e: unknown) => {
          const msg =
            typeof e === 'object' && e && 'message' in e ? String((e as { message: string }).message) : 'Erreur réseau';
          if (!cancelled) setErr(msg);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    void listEstablishments({ ...apiQueryBase(), page: 1, limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setItems(res.data);
        setPages(res.pagination.pages);
      })
      .catch((e: unknown) => {
        const msg =
          typeof e === 'object' && e && 'message' in e ? String((e as { message: string }).message) : 'Erreur réseau';
        if (!cancelled) setErr(msg);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [queryKey, apiQueryBase, needsCitiesForRegion ? cities.length : -1]);

  const refreshEstablishments = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    setErr(null);
    setPage(1);
    setVisibleEnd(PAGE_SIZE);
    setClientMode(needsClientScan);
    listingWebOrderContentSigRef.current = '';
    orderedClientPoolRef.current = null;
    catalogListingContentSigRef.current = '';
    orderedCatalogPoolRef.current = null;
    stableServerListingRef.current = [];
    serverListingNeedsResetRef.current = true;

    try {
      const rt = filtersValue.regionTitle.trim();
      let citiesLocal = cities;

      await Promise.all([
        reloadFollows(),
        isLoggedIn ? refetchEligibilityProfile() : Promise.resolve(),
        fetchListingPlacementsByEstablishment()
          .then(setPlacementByEid)
          .catch(() => setPlacementByEid({})),
        (async () => {
          if (needsClientScan && rt && citiesLocal.length === 0) {
            citiesLocal = await listCities(1000).catch(() => [] as CityRow[]);
            setCities(citiesLocal);
          }
        })(),
      ]);

      if (needsClientScan) {
        const all = await listAllEstablishments(apiQueryBase());
        const regionSet =
          rt && citiesLocal.length > 0
            ? new Set(
                citiesLocal
                  .filter((c) => c.region?.titre === rt)
                  .map((c) => c.titre.trim())
                  .filter(Boolean),
              )
            : null;
        const f = applyEstablishmentWebClientFilters(all, {
          secteurId: filtersValue.secteurId ? parseInt(filtersValue.secteurId, 10) : null,
          villesInRegion: regionSet && regionSet.size > 0 ? regionSet : null,
          villeExact: filtersValue.ville.trim() || null,
          diplomeExact: filtersValue.diplome.trim() || null,
          fraisMin: filtersValue.fraisMin,
          fraisMax: filtersValue.fraisMax,
        });
        setFilteredPool(f);
        setItems([]);
        setVisibleEnd(PAGE_SIZE);
        setPages(Math.max(1, Math.ceil(f.length / PAGE_SIZE)));
      } else {
        setFilteredPool(null);
        const [res, all] = await Promise.all([
          listEstablishments({ ...apiQueryBase(), page: 1, limit: PAGE_SIZE }),
          listAllEstablishments(apiQueryBase()),
        ]);
        setItems(res.data);
        setPages(res.pagination.pages);
        setFullCatalogPool(dedupeEstablishmentsById(all));
      }
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e && 'message' in e ? String((e as { message: string }).message) : 'Erreur réseau';
      setErr(msg);
    } finally {
      setRefreshing(false);
    }
  }, [
    refreshing,
    reloadFollows,
    isLoggedIn,
    refetchEligibilityProfile,
    needsClientScan,
    filtersValue,
    cities,
    apiQueryBase,
  ]);

  const buildListingFromPool = useCallback(
    (pool: EstablishmentNormalized[]) => {
      if (!pool.length) return [];
      const merged = dedupeEstablishmentsById(
        mergeEstablishmentsWithListingPlacements(pool, placementByEid),
      );
      const contentSig = getListingWebOrderContentSig(merged, placementByEid);
      if (contentSig === catalogListingContentSigRef.current && orderedCatalogPoolRef.current) {
        return orderedCatalogPoolRef.current;
      }
      catalogListingContentSigRef.current = contentSig;
      const ordered = clientMode
        ? dedupeEstablishmentsById(sortEstablishmentsLikeEcolesSuperieuresWeb(merged, placementByEid))
        : sortSponsoredFirst(merged);
      orderedCatalogPoolRef.current = ordered;
      return ordered;
    },
    [clientMode, placementByEid],
  );

  const usesFullCatalogEligibleListing =
    eligibleDiscoveryFilter && hasEligibilityFiliereProfile(eligibilityProfile) && !!catalogPool?.length;

  const activeFiltersCount = countActiveEstablishmentFilters(filtersValue);

  const mergedEstablishments = useMemo(() => {
    if (clientMode) {
      return dedupeEstablishmentsById(
        mergeEstablishmentsWithListingPlacements(items, placementByEid),
      );
    }
    const merged = dedupeEstablishmentsById(
      mergeEstablishmentsWithListingPlacements(items, placementByEid),
    );
    if (serverListingNeedsResetRef.current || stableServerListingRef.current.length === 0) {
      const sorted = sortSponsoredFirst(merged);
      stableServerListingRef.current = sorted;
      serverListingNeedsResetRef.current = false;
      return sorted;
    }
    const mergedById = new Map(merged.map((e) => [e.id, e]));
    const prevIds = new Set(stableServerListingRef.current.map((e) => e.id));
    const next: EstablishmentNormalized[] = [];
    for (const e of stableServerListingRef.current) {
      const updated = mergedById.get(e.id);
      if (updated) next.push(updated);
    }
    for (const e of merged) {
      if (!prevIds.has(e.id)) next.push(e);
    }
    stableServerListingRef.current = next;
    return next;
  }, [items, placementByEid, clientMode]);

  const matchesEligibleDiscovery = useCallback(
    (it: EstablishmentNormalized) => {
      if (!hasEligibilityFiliereProfile(eligibilityProfile)) return false;
      const verdict = evaluateEligibilityByFiliere(
        { filieresAcceptees: it.filieresAcceptees ?? null },
        eligibilityProfile,
      );
      if (verdict !== 'eligible') return false;
      if (isLoggedIn && followedIds.has(it.id)) return false;
      return true;
    },
    [eligibilityProfile, followedIds, isLoggedIn],
  );

  const listingBase = useMemo(() => {
    if (usesFullCatalogEligibleListing && catalogPool) {
      return buildListingFromPool(catalogPool);
    }
    if (clientMode && filteredPool?.length) {
      if (orderedClientPoolRef.current?.length) {
        return orderedClientPoolRef.current;
      }
      return dedupeEstablishmentsById(
        mergeEstablishmentsWithListingPlacements(filteredPool, placementByEid),
      );
    }
    return mergedEstablishments;
  }, [
    usesFullCatalogEligibleListing,
    catalogPool,
    buildListingFromPool,
    mergedEstablishments,
    clientMode,
    clientListingRevision,
    filteredPool,
    placementByEid,
  ]);

  const eligibleDiscoveryCount = useMemo(() => {
    if (!hasEligibilityFiliereProfile(eligibilityProfile) || !catalogPool?.length) return 0;
    return buildListingFromPool(catalogPool).filter(matchesEligibleDiscovery).length;
  }, [catalogPool, eligibilityProfile, buildListingFromPool, matchesEligibleDiscovery]);

  /**
   * Filtres client sur la base listing (pagination serveur ou catalogue complet).
   */
  const filteredListingBeforeSlice = useMemo(() => {
    const elig = filtersValue.eligibilityFilter;
    let list = listingBase;
    const studyBac = filtersValue.acceptedStudyBacType;
    const studyVal = filtersValue.acceptedStudyValue.trim();
    if ((studyBac === 'normal' || studyBac === 'mission') && studyVal) {
      list = list.filter((it) =>
        matchesAcceptedStudyPathFilter(
          {
            filieresAcceptees: it.filieresAcceptees ?? null,
            specialitesBacMissionAcceptees: it.specialitesBacMissionAcceptees ?? null,
          },
          { bacType: studyBac, value: studyVal },
        ),
      );
    }
    if (eligibleDiscoveryFilter && hasEligibilityFiliereProfile(eligibilityProfile)) {
      list = list.filter(matchesEligibleDiscovery);
    } else if (elig !== 'all' && hasEligibilityFiliereProfile(eligibilityProfile)) {
      list = list.filter((it) => {
        const verdict = evaluateEligibilityByFiliere(
          { filieresAcceptees: it.filieresAcceptees ?? null },
          eligibilityProfile,
        );
        if (verdict === 'unknown') return true;
        return verdict === elig;
      });
    }
    if (followedOnly && isLoggedIn) {
      list = list.filter((it) => followedIds.has(it.id));
    }
    return dedupeEstablishmentsById(list);
  }, [
    listingBase,
    eligibleDiscoveryFilter,
    matchesEligibleDiscovery,
    filtersValue.eligibilityFilter,
    filtersValue.acceptedStudyBacType,
    filtersValue.acceptedStudyValue,
    eligibilityProfile,
    followedOnly,
    isLoggedIn,
    followedIds,
  ]);

  const visibleItems = useMemo(
    () => filteredListingBeforeSlice.slice(0, visibleEnd),
    [filteredListingBeforeSlice, visibleEnd],
  );

  const hasMoreToShow = visibleEnd < filteredListingBeforeSlice.length;
  const canFetchMoreFromServer =
    !clientMode && !usesFullCatalogEligibleListing && page < pages;

  useEffect(() => {
    setVisibleEnd((prev) => {
      const total = filteredListingBeforeSlice.length;
      if (total === 0) return PAGE_SIZE;
      if (prev > total) return total;
      return prev;
    });
  }, [filteredListingBeforeSlice.length]);

  useEffect(() => {
    if (!visibleItems.length) return;
    recordEstablishmentListingImpressionsBatch(
      visibleItems
        .filter((it) => typeof it.id === 'number')
        .map((it) => ({ id: it.id as number })),
    );
  }, [visibleItems]);

  const loadMore = useCallback(async () => {
    if (loadMoreInFlightRef.current || loadingMore || loading || refreshing) return;

    if (hasMoreToShow) {
      setLoadingMore(true);
      try {
        setVisibleEnd((prev) =>
          Math.min(filteredListingBeforeSlice.length, prev + PAGE_SIZE),
        );
      } finally {
        setLoadingMore(false);
      }
      return;
    }

    if (!canFetchMoreFromServer) return;

    loadMoreInFlightRef.current = true;
    setLoadingMore(true);
    setErr(null);
    try {
      const MAX_DUPLICATE_PAGE_SKIPS = 5;
      let nextPage = page + 1;
      let totalPages = pages;
      let grewAny = false;
      let addedCount = 0;

      for (let attempt = 0; attempt < MAX_DUPLICATE_PAGE_SKIPS && nextPage <= totalPages; attempt++) {
        const res = await listEstablishments({ ...apiQueryBase(), page: nextPage, limit: PAGE_SIZE });
        totalPages = res.pagination.pages;
        let grew = false;
        setItems((prev) => {
          const merged = dedupeEstablishmentsById([...prev, ...res.data]);
          grew = merged.length > prev.length;
          addedCount += merged.length - prev.length;
          return merged;
        });
        setPage(nextPage);
        setPages(totalPages);
        if (grew) grewAny = true;
        if (res.data.length === 0 || grew) break;
        nextPage++;
      }

      if (grewAny && addedCount > 0) {
        setVisibleEnd((prev) => prev + addedCount);
      }
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e && 'message' in e ? String((e as { message: string }).message) : 'Erreur réseau';
      setErr(msg);
    } finally {
      setLoadingMore(false);
      loadMoreInFlightRef.current = false;
    }
  }, [
    apiQueryBase,
    canFetchMoreFromServer,
    filteredListingBeforeSlice.length,
    hasMoreToShow,
    loading,
    loadingMore,
    page,
    pages,
    refreshing,
  ]);

  const onPressFollowedOnlyToggle = useCallback(() => {
    if (!isLoggedIn) {
      Alert.alert(t('inscRequireLogin'), undefined, [
        { text: t('accountLogoutCancel'), style: 'cancel' },
        { text: t('accountLoginCta'), onPress: () => router.push('/login' as never) },
      ]);
      return;
    }
    setFollowedOnly((v) => !v);
  }, [isLoggedIn, router, t]);

  const onEligibleDiscoveryFilterChange = useCallback(
    (next: boolean) => {
      if (searchFiltersLocked) {
        showTawjihPlusUpgradeAlert();
        return;
      }
      if (next && !isLoggedIn) {
        Alert.alert(t('inscRequireLogin'), undefined, [
          { text: t('accountLogoutCancel'), style: 'cancel' },
          { text: t('accountLoginCta'), onPress: () => router.push('/login' as never) },
        ]);
        return;
      }
      if (next && !hasEligibilityFiliereProfile(eligibilityProfile)) {
        Alert.alert(t('eligibilityProfileIncomplete'), t('eligibilityProfileIncompleteCta'), [
          { text: t('accountLogoutCancel'), style: 'cancel' },
          {
            text: t('eligibilityProfileIncompleteCta'),
            onPress: () => router.push('/account-setup' as never),
          },
        ]);
        return;
      }
      if (next) setFollowedOnly(false);
      setEligibleDiscoveryFilter(next);
    },
    [eligibilityProfile, isLoggedIn, router, searchFiltersLocked, showTawjihPlusUpgradeAlert, t],
  );

  return (
    <View style={[styles.root, isRTL ? styles.rtl : styles.ltr]}>
      <StatusBar style="light" />
      {/** Même traitement que l’accueil : bleu jusqu’aux icônes de statut (plus de bande grise sous la notch). */}
      <View style={[styles.headerSafe, { paddingTop: insets.top }]}>
        <View style={styles.hero}>
        <View style={[styles.heroTitleRow, isRTL && styles.heroTitleRowRtl]}>
          <SidebarMenuIconButton color={homeShell.text} />
          <View style={styles.heroTitleCol}>
            <Text style={[styles.heroEyebrow, isRTL && styles.heroTitleRtl]}>{t('schoolsHeroEyebrow')}</Text>
            <Text
              style={[
                styles.heroTitle,
                isRTL && styles.heroTitleRtl,
                !isRTL && styles.heroTitleFrCaps,
              ]}>
              {t('schoolsHeroTitle')}
            </Text>
          </View>
          <HeroLangSwitch />
        </View>

        <View style={styles.searchCard}>
          {searchFiltersAccessLoading ? (
            <SchoolsSearchFiltersSkeleton isRTL={isRTL} />
          ) : (
            <>
              <SearchInputWithApply
                value={q}
                onChangeText={setQ}
                onApply={applySearch}
                onClear={clearSearch}
                placeholder={t('schoolsSearchPlaceholder')}
                applyLabel={t('schoolsApply')}
                showApply={!searchFiltersLocked && (searchPending || q.trim().length > 0)}
                isRTL={isRTL}
                locked={searchFiltersLocked}
                lockedPlaceholder={t('schoolsSearchPlaceholderLocked')}
                onLockedPress={showTawjihPlusUpgradeAlert}
                compact
              />

              <View style={[styles.filterBarRow, isRTL && styles.filterBarRowRtl]}>
                <Pressable
                  onPress={
                    searchFiltersLocked ? showTawjihPlusUpgradeAlert : () => setFiltersOpen(true)
                  }
                  style={({ pressed }) => [
                    styles.filtersBtnBar,
                    isRTL && styles.filtersBtnBarRtl,
                    searchFiltersLocked && styles.filtersBtnBarLocked,
                    pressed && { opacity: 0.92 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={
                    searchFiltersLocked ? t('schoolsSearchFiltersLockedHint') : t('schoolsFiltersA11y')
                  }>
                  <FontAwesome
                    name={searchFiltersLocked ? 'lock' : 'sliders'}
                    size={14}
                    color={searchFiltersLocked ? '#94A3B8' : homeShell.blue}
                  />
                  <Text
                    style={[
                      styles.filtersBtnBarTxt,
                      searchFiltersLocked && styles.filtersBtnBarTxtLocked,
                    ]}>
                    {t('schoolsFilters')}
                  </Text>
                  {!searchFiltersLocked && activeFiltersCount > 0 ? (
                    <View style={styles.filtersBadge}>
                      <Text style={styles.filtersBadgeTxt}>{activeFiltersCount}</Text>
                    </View>
                  ) : null}
                </Pressable>
                <Pressable
                  onPress={onPressFollowedOnlyToggle}
                  style={({ pressed }) => [
                    styles.followedOnlyBtn,
                    followedOnly && styles.followedOnlyBtnOn,
                    pressed && { opacity: 0.88 },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: followedOnly }}
                  accessibilityLabel={t('schoolsFollowedOnlyA11y')}>
                  <FontAwesome
                    name={followedOnly ? 'heart' : 'heart-o'}
                    size={16}
                    color={followedOnly ? homeShell.blue : homeShell.cardMuted}
                  />
                </Pressable>
              </View>
            </>
          )}
        </View>

        </View>
      </View>

      {loading ? (
        <ScrollView
          style={styles.scrollFill}
          contentContainerStyle={styles.center}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <AppRefreshControl refreshing={refreshing} onRefresh={() => void refreshEstablishments()} />
          }>
          <EstablishmentCardSkeletonStack count={4} isRTL={isRTL} />
        </ScrollView>
      ) : err ? (
        <ScrollView
          style={styles.scrollFill}
          contentContainerStyle={styles.center}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <AppRefreshControl refreshing={refreshing} onRefresh={() => void refreshEstablishments()} />
          }>
          <Text style={styles.errTxt}>{err}</Text>
          <Text style={styles.errSub}>API: {getApiBaseUrl()}</Text>
          <Pressable onPress={() => void refreshEstablishments()} style={styles.retryBtn}>
            <Text style={styles.retryTxt}>{t('schoolsRetry')}</Text>
          </Pressable>
        </ScrollView>
      ) : (
        <View style={styles.scrollFill}>
        <FlatList
          data={visibleItems}
          keyExtractor={(it) => `school-${it.id}`}
          extraData={visibleEnd}
          style={styles.scrollFill}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <AppRefreshControl refreshing={refreshing} onRefresh={() => void refreshEstablishments()} />
          }
          initialNumToRender={PAGE_SIZE}
          maxToRenderPerBatch={PAGE_SIZE}
          windowSize={7}
          removeClippedSubviews={false}
          onMomentumScrollBegin={() => {
            endReachedEnabledRef.current = true;
          }}
          onEndReachedThreshold={0.25}
          onEndReached={() => {
            if (!endReachedEnabledRef.current) return;
            void loadMore();
          }}
          ListHeaderComponent={
            <View>
              <AppBannerSlot zone="top" analyticsPage="/mobile/ecoles" style={{ marginTop: spacing.sm }} />
              {!searchFiltersAccessLoading ? (
                <View style={styles.listEligibleFilter}>
                  <EstablishmentEligibleQuickFilter
                    active={eligibleDiscoveryFilter}
                    onChange={onEligibleDiscoveryFilterChange}
                    eligibleCount={eligibleDiscoveryCount}
                    disabled={
                      searchFiltersLocked ||
                      !isLoggedIn ||
                      !hasEligibilityFiliereProfile(eligibilityProfile)
                    }
                    onDisabledPress={
                      searchFiltersLocked
                        ? showTawjihPlusUpgradeAlert
                        : !isLoggedIn
                          ? () =>
                              Alert.alert(t('inscRequireLogin'), undefined, [
                                { text: t('accountLogoutCancel'), style: 'cancel' },
                                {
                                  text: t('accountLoginCta'),
                                  onPress: () => router.push('/login' as never),
                                },
                              ])
                          : () =>
                              Alert.alert(
                                t('eligibilityProfileIncomplete'),
                                t('eligibilityProfileIncompleteCta'),
                                [
                                  { text: t('accountLogoutCancel'), style: 'cancel' },
                                  {
                                    text: t('eligibilityProfileIncompleteCta'),
                                    onPress: () => router.push('/account-setup' as never),
                                  },
                                ],
                              )
                    }
                  />
                </View>
              ) : null}
            </View>
          }
          ListFooterComponent={
            loadingMore && (hasMoreToShow || canFetchMoreFromServer) ? (
              <View style={styles.footer}>
                <ActivityIndicator size="small" color={homeShell.blue} />
              </View>
            ) : null
          }
          renderItem={({ item, index }) => {
            const lockedVariant = resolveEstablishmentLockedVariant(schoolsCatalogLocked, index);
            const cardLocked = lockedVariant === 'compact';
            const showMidBanner = index === MID_BANNER_AFTER_CARD_INDEX;
            return (
            <View>
              <EstablishmentCard
                item={item}
                lockedVariant={lockedVariant}
                onPress={() => {
                  if (cardLocked) {
                    openTawjihPlusProduct();
                    return;
                  }
                  fireAndForget(recordEstablishmentClick(item.id, 'listing'));
                  router.push({
                    pathname: `/etablissements/${item.id}/${item.slug}`,
                    params: { listIdx: String(index) },
                  } as never);
                }}
                isFollowed={followedIds.has(item.id)}
                followStateLoading={isLoggedIn && !followsReady}
                followBusy={followBusyIds.has(item.id)}
                eligibilityLoading={isLoggedIn && eligibilityProfileLoading}
                onToggleFollow={() => {
                  if (cardLocked) {
                    openTawjihPlusProduct();
                    return;
                  }
                  void handleToggleFollow(item.id);
                }}
              />
              {showMidBanner ? (
                <AppBannerSlot zone="mid" analyticsPage="/mobile/ecoles" />
              ) : null}
            </View>
            );
          }}
        />
        {refreshing ? (
          <View style={styles.refreshOverlay} pointerEvents="none">
            <View style={[styles.refreshOverlayInner, isRTL && styles.refreshBannerRtl]}>
              <ActivityIndicator size="large" color={homeShell.blue} />
              <Text style={styles.refreshOverlayTxt}>{t('schoolsRefreshing')}</Text>
            </View>
          </View>
        ) : null}
        </View>
      )}

      <EstablishmentFiltersModal
        visible={filtersOpen && !searchFiltersLocked}
        onClose={() => setFiltersOpen(false)}
        value={filtersValue}
        onChange={setFiltersValue}
        cities={cities}
        secteurs={secteurs}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerSafe: {
    backgroundColor: homeShell.bg,
    zIndex: 10,
  },
  ltr: { direction: 'ltr' },
  rtl: { direction: 'rtl' },
  hero: {
    backgroundColor: homeShell.bg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  heroTitleRowRtl: {
    flexDirection: 'row-reverse',
  },
  heroTitleCol: { flex: 1, minWidth: 0, gap: 4 },
  heroEyebrow: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: homeShell.textMuted,
    letterSpacing: 0.15,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: homeShell.text,
    letterSpacing: 0,
  },
  /** Espacement type « titre display » pour le libellé FR en capitales. */
  heroTitleFrCaps: {
    letterSpacing: 1.1,
  },
  heroTitleRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  searchCard: {
    marginTop: spacing.md,
    backgroundColor: homeShell.card,
    borderRadius: radius.lg,
    padding: spacing.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(47,206,148,0.18)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    gap: spacing.sm + 4,
    borderRadius: radius.lg,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
  },
  searchRowRtl: {
    flexDirection: 'row-reverse',
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: homeShell.cardText,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  searchInputRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  filterBarRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 6,
    alignSelf: 'stretch',
  },
  filterBarRowRtl: {
    flexDirection: 'row-reverse',
  },
  /** Filtres : sous la barre de recherche (carte blanche). */
  filtersBtnBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.md,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: 'rgba(47,206,148,0.35)',
    minWidth: 0,
  },
  followedOnlyBtn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
  },
  followedOnlyBtnOn: {
    backgroundColor: 'rgba(51,62,143,0.10)',
    borderColor: 'rgba(51,62,143,0.28)',
  },
  filtersBtnBarRtl: {
    flexDirection: 'row-reverse',
  },
  filtersBtnBarLocked: {
    backgroundColor: '#F8FAFC',
    borderColor: homeShell.borderOnWhite,
    opacity: 0.92,
  },
  filtersBtnBarTxtLocked: {
    color: '#94A3B8',
  },
  filtersBtnBarTxt: {
    color: homeShell.blueDeep,
    fontSize: fontSize.sm,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  filtersBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 9,
    backgroundColor: homeShell.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersBadgeTxt: { color: homeShell.text, fontSize: 11, fontWeight: '900' },
  scrollFill: { flex: 1 },
  list: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.section,
  },
  listEligibleFilter: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  center: {
    flexGrow: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  errTxt: {
    color: homeShell.blueDeep,
    fontSize: fontSize.md,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  errSub: { color: '#64748B', fontSize: fontSize.sm, fontWeight: '600', textAlign: 'center', marginBottom: 14 },
  retryBtn: {
    backgroundColor: homeShell.blue,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: radius.full,
  },
  retryTxt: { color: homeShell.text, fontWeight: '800', fontSize: fontSize.sm },
  footer: { paddingVertical: 18 },
  refreshBannerRtl: {
    flexDirection: 'row-reverse',
  },
  refreshOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: spacing.xl,
    backgroundColor: 'rgba(248, 250, 252, 0.72)',
    zIndex: 8,
  },
  refreshOverlayInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  refreshOverlayTxt: {
    color: homeShell.blueDeep,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
});
