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
import {
  countActiveEstablishmentFilters,
  defaultEstablishmentFilters,
  EstablishmentFiltersModal,
  type EstablishmentFiltersValue,
} from '@/components/schools/EstablishmentFiltersModal';
import { AppRefreshControl } from '@/components/ui/AppRefreshControl';
import {
  EstablishmentCardSkeleton,
  EstablishmentCardSkeletonStack,
} from '@/components/schools/EstablishmentCardSkeleton';
import { HeroLangSwitch } from '@/components/ui/HeroLangSwitch';
import { Text } from '@/components/ui/Text';
import { getApiBaseUrl } from '@/constants/api';
import { TAWJIH_PLUS_PRODUCT_PATH } from '@/constants/tawjihPlusAccess';
import { useAuth } from '@/contexts/AuthContext';
import { useTawjihPlusAccess } from '@/hooks/useTawjihPlusAccess';
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
import { evaluateEligibilityByFiliere, matchesAcceptedStudyPathFilter } from '@/utils/eligibility';
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
  getListingWebOrderContentSig,
  sortEstablishmentsLikeEcolesSuperieuresWeb,
  sortSponsoredFirst,
} from '@/utils/establishmentWebFilters';
const PAGE_SIZE = 18;

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
  const [filtersValue, setFiltersValue] = useState<EstablishmentFiltersValue>(() => defaultEstablishmentFilters());
  const [filtersOpen, setFiltersOpen] = useState(false);

  /** Afficher uniquement les établissements déjà suivis (cœur). */
  const [followedOnly, setFollowedOnly] = useState(false);

  const [cities, setCities] = useState<CityRow[]>([]);
  const [secteurs, setSecteurs] = useState<SecteurRow[]>([]);
  const [placementByEid, setPlacementByEid] = useState<Record<number, ListingPlacementInfo>>({});
  /** Ne reshuffle le tri « style EcolesSupérieures » que si la piscine / les placements changent. */
  const listingWebOrderContentSigRef = useRef<string>('');

  /* Suivi d'écoles : Set des IDs suivis + IDs en cours de toggle */
  const { user, getValidAccessToken, isLoading: authLoading } = useAuth();
  const isLoggedIn = !!user;
  const {
    profile: eligibilityProfile,
    loading: eligibilityProfileLoading,
    refetch: refetchEligibilityProfile,
  } = useEligibilityProfile();
  const { hasAccess: hasTawjihPlusAccess, loading: tawjihPlusLoading } = useTawjihPlusAccess();
  /** Skeleton recherche/filtres tant que la session ou les droits TAWJIH PLUS ne sont pas connus. */
  const searchFiltersAccessLoading = authLoading || tawjihPlusLoading;
  const searchFiltersLocked = !searchFiltersAccessLoading && !hasTawjihPlusAccess;

  const openTawjihPlusProduct = useCallback(() => {
    router.push(TAWJIH_PLUS_PRODUCT_PATH as never);
  }, [router]);

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
    } else setFollowsReady(false);
  }, [isLoggedIn, user?.id]);

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
    if (!clientMode || !filteredPool?.length) return;
    const merged = mergeEstablishmentsWithListingPlacements(filteredPool, placementByEid);
    const contentSig = getListingWebOrderContentSig(merged, placementByEid);
    if (contentSig === listingWebOrderContentSigRef.current) return;
    listingWebOrderContentSigRef.current = contentSig;
    const next = sortEstablishmentsLikeEcolesSuperieuresWeb(merged, placementByEid);
    setFilteredPool(next);
    const end = Math.min(visibleEnd, next.length);
    setItems(next.slice(0, end));
  }, [clientMode, filteredPool, placementByEid, visibleEnd]);

  // Tracking « impression card » : best-effort, dédupliqué côté service par
  // session pour éviter d'envoyer N hits par item à chaque rerender de la
  // FlatList (typiquement scroll, refresh, retour sur l'onglet).
  useEffect(() => {
    if (!Array.isArray(items) || items.length === 0) return;
    recordEstablishmentListingImpressionsBatch(
      items
        .filter((it) => typeof it.id === 'number')
        .map((it) => ({ id: it.id as number })),
    );
  }, [items]);

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
        filtersValue.eligibilityFilter,
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

  useEffect(() => {
    let cancelled = false;
    setErr(null);
    setPage(1);
    setVisibleEnd(PAGE_SIZE);
    setClientMode(needsClientScan);
    setFilteredPool(null);
    listingWebOrderContentSigRef.current = '';

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
          setItems(f.slice(0, PAGE_SIZE));
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
        setItems(f.slice(0, PAGE_SIZE));
        setVisibleEnd(PAGE_SIZE);
        setPages(Math.max(1, Math.ceil(f.length / PAGE_SIZE)));
      } else {
        setFilteredPool(null);
        const res = await listEstablishments({ ...apiQueryBase(), page: 1, limit: PAGE_SIZE });
        setItems(res.data);
        setPages(res.pagination.pages);
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

  async function loadMore() {
    if (loadingMore || loading || refreshing) return;

    if (clientMode && filteredPool) {
      if (visibleEnd >= filteredPool.length) return;
      setLoadingMore(true);
      try {
        const next = Math.min(filteredPool.length, visibleEnd + PAGE_SIZE);
        setVisibleEnd(next);
        setItems(filteredPool.slice(0, next));
      } finally {
        setLoadingMore(false);
      }
      return;
    }

    if (page >= pages) return;
    setLoadingMore(true);
    setErr(null);
    try {
      const nextPage = page + 1;
      const res = await listEstablishments({ ...apiQueryBase(), page: nextPage, limit: PAGE_SIZE });
      setItems((prev) => [...prev, ...res.data]);
      setPage(nextPage);
      setPages(res.pagination.pages);
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e && 'message' in e ? String((e as { message: string }).message) : 'Erreur réseau';
      setErr(msg);
    } finally {
      setLoadingMore(false);
    }
  }

  const activeFiltersCount = countActiveEstablishmentFilters(filtersValue);

  const mergedEstablishments = useMemo(() => {
    const merged = mergeEstablishmentsWithListingPlacements(items, placementByEid);
    /** En mode client l’ordre « web » est déjà appliqué sur `filteredPool` puis `items` (tranche). */
    if (clientMode) return merged;
    return sortSponsoredFirst(merged);
  }, [items, placementByEid, clientMode]);

  /**
   * Items effectivement affichés : on applique le filtre éligibilité (non
   * supporté côté serveur) après tous les autres filtres déjà appliqués
   * dans `items`. Le filtre est silencieusement ignoré quand l'utilisateur
   * n'est pas connecté ou n'a pas renseigné son profil — on évite ainsi
   * de cacher toutes les écoles à un visiteur qui ne pourrait pas le
   * désactiver depuis l'UI.
   * Le filtre « écoles suivies » s’applique en dernier (bouton cœur).
   */
  const visibleItems = useMemo(() => {
    const elig = filtersValue.eligibilityFilter;
    let list = mergedEstablishments;
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
    if (elig !== 'all' && eligibilityProfile) {
      list = list.filter((it) => {
        const verdict = evaluateEligibilityByFiliere(
          {
            filieresAcceptees: it.filieresAcceptees ?? null,
            specialitesBacMissionAcceptees: it.specialitesBacMissionAcceptees ?? null,
          },
          eligibilityProfile,
        );
        if (verdict === 'unknown') return true;
        return verdict === elig;
      });
    }
    if (followedOnly && isLoggedIn) {
      list = list.filter((it) => followedIds.has(it.id));
    }
    return list;
  }, [
    mergedEstablishments,
    filtersValue.eligibilityFilter,
    filtersValue.acceptedStudyBacType,
    filtersValue.acceptedStudyValue,
    eligibilityProfile,
    followedOnly,
    isLoggedIn,
    followedIds,
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
                    size={16}
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
                    size={18}
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
          keyExtractor={(it) => String(it.id)}
          style={styles.scrollFill}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <AppRefreshControl refreshing={refreshing} onRefresh={() => void refreshEstablishments()} />
          }
          onEndReachedThreshold={0.35}
          onEndReached={loadMore}
          ListHeaderComponent={
            <AppBannerSlot zone="top" analyticsPage="/mobile/ecoles" style={{ marginTop: spacing.sm }} />
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footer}>
                <EstablishmentCardSkeleton isRTL={isRTL} />
              </View>
            ) : null
          }
          renderItem={({ item, index }) => (
            <View>
              {index > 0 && index % 3 === 0 ? (
                <AppBannerSlot zone="mid" analyticsPage="/mobile/ecoles" />
              ) : null}
              <EstablishmentCard
                item={item}
                onPress={() => {
                  fireAndForget(recordEstablishmentClick(item.id, 'listing'));
                  router.push(`/etablissements/${item.id}/${item.slug}`);
                }}
                isFollowed={followedIds.has(item.id)}
                followStateLoading={isLoggedIn && !followsReady}
                followBusy={followBusyIds.has(item.id)}
                eligibilityLoading={isLoggedIn && eligibilityProfileLoading}
                onToggleFollow={() => handleToggleFollow(item.id)}
              />
            </View>
          )}
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
    paddingBottom: spacing.lg,
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
    marginTop: spacing.lg,
    backgroundColor: homeShell.card,
    borderRadius: radius.xl,
    padding: spacing.sm + 2,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(47,206,148,0.18)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
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
    gap: spacing.sm,
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
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: 'rgba(47,206,148,0.35)',
    minWidth: 0,
  },
  followedOnlyBtn: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
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
