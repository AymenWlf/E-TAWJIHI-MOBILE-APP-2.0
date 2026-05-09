import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EstablishmentCard } from '@/components/schools/EstablishmentCard';
import { SearchablePickPanel, type SearchablePickItem } from '@/components/schools/SearchablePickSheet';
import { Text } from '@/components/ui/Text';
import { getApiBaseUrl } from '@/constants/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useEligibilityProfile } from '@/hooks/useEligibilityProfile';
import { listAllEstablishments, listEstablishments, type EstablishmentNormalized } from '@/services/establishments';
import {
  recordEstablishmentClick,
  recordEstablishmentListingImpressionsBatch,
} from '@/services/establishmentTracking';
import { evaluateEligibilityByFiliere } from '@/utils/eligibility';
import {
  deleteEstablishmentFollowByEstablishment,
  fetchEstablishmentFollows,
  upsertEstablishmentFollow,
} from '@/services/establishmentFollows';
import { listAllSecteursActive, listCities, type CityRow, type SecteurRow } from '@/services/referenceData';
import { homeShell } from '@/theme/homeShell';
import { fontSize, radius, spacing } from '@/theme/tokens';
import {
  applyEstablishmentWebClientFilters,
  DIPLOME_OPTIONS,
  sortSponsoredFirst,
} from '@/utils/establishmentWebFilters';

const PAGE_SIZE = 18;

export default function EcolesScreen() {
  const router = useRouter();
  const { isRTL, locale, setLocale, t } = useLocale();
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();

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

  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [type, setType] = useState<string>('');

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [cityPickOpen, setCityPickOpen] = useState(false);
  const [sectorPickOpen, setSectorPickOpen] = useState(false);
  const [ville, setVille] = useState('');
  const [universite, setUniversite] = useState('');
  const [regionTitle, setRegionTitle] = useState('');
  const [secteurId, setSecteurId] = useState('');
  const [diplome, setDiplome] = useState('');
  const [fraisMin, setFraisMin] = useState(0);
  const [fraisMax, setFraisMax] = useState(100_000);
  const [fraisMinStr, setFraisMinStr] = useState('0');
  const [fraisMaxStr, setFraisMaxStr] = useState('100000');
  const [eTawjihiOnly, setETawjihiOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [recommendedOnly, setRecommendedOnly] = useState(false);
  const [sponsoredOnly, setSponsoredOnly] = useState(false);
  const [accreditationEtat, setAccreditationEtat] = useState(false);
  const [echangeInternational, setEchangeInternational] = useState(false);
  /**
   * Filtre d'éligibilité (filière du Bac uniquement, pas l'année).
   * Appliqué client-side après le rendu des `items` car il dépend du
   * profil utilisateur (qui ne fait pas partie des paramètres serveur).
   */
  const [eligibilityFilter, setEligibilityFilter] = useState<
    'all' | 'eligible' | 'not_eligible'
  >('all');

  const [cities, setCities] = useState<CityRow[]>([]);
  const [secteurs, setSecteurs] = useState<SecteurRow[]>([]);

  /* Suivi d'écoles : Set des IDs suivis + IDs en cours de toggle */
  const { user, getValidAccessToken } = useAuth();
  const isLoggedIn = !!user;
  const { profile: eligibilityProfile } = useEligibilityProfile();
  const [followedIds, setFollowedIds] = useState<Set<number>>(() => new Set());
  const [followBusyIds, setFollowBusyIds] = useState<Set<number>>(() => new Set());

  /** Recharge la liste des écoles suivies (un seul appel partagé pour toute la liste). */
  const reloadFollows = useCallback(async () => {
    if (!isLoggedIn) {
      setFollowedIds(new Set());
      return;
    }
    const token = await getValidAccessToken();
    if (!token) return;
    const payload = await fetchEstablishmentFollows(token);
    const ids = new Set<number>();
    for (const f of payload.items) {
      const eid = f.establishment?.id;
      if (typeof eid === 'number' && Number.isFinite(eid)) ids.add(eid);
    }
    setFollowedIds(ids);
  }, [getValidAccessToken, isLoggedIn]);

  useEffect(() => {
    void reloadFollows();
  }, [reloadFollows]);

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
            status: 'interested',
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
    const t = setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    void listCities(1000)
      .then(setCities)
      .catch(() => setCities([]));
  }, []);

  useEffect(() => {
    if (!filtersOpen && !sectorPickOpen && !cityPickOpen) return;
    void listAllSecteursActive()
      .then(setSecteurs)
      .catch(() => setSecteurs([]));
  }, [filtersOpen, sectorPickOpen, cityPickOpen]);

  const needsClientScan = useMemo(
    () =>
      !!secteurId ||
      !!diplome.trim() ||
      eTawjihiOnly ||
      fraisMin > 0 ||
      fraisMax < 100_000 ||
      !!regionTitle,
    [secteurId, diplome, eTawjihiOnly, fraisMin, fraisMax, regionTitle],
  );

  const queryKey = useMemo(
    () =>
      [
        debouncedQ,
        type,
        ville.trim(),
        universite.trim(),
        regionTitle,
        secteurId,
        diplome,
        fraisMin,
        fraisMax,
        eTawjihiOnly ? 1 : 0,
        featuredOnly ? 1 : 0,
        recommendedOnly ? 1 : 0,
        sponsoredOnly ? 1 : 0,
        accreditationEtat ? 1 : 0,
        echangeInternational ? 1 : 0,
        needsClientScan ? 1 : 0,
        cities.length,
      ].join('__'),
    [
      debouncedQ,
      type,
      ville,
      universite,
      regionTitle,
      secteurId,
      diplome,
      fraisMin,
      fraisMax,
      eTawjihiOnly,
      featuredOnly,
      recommendedOnly,
      sponsoredOnly,
      accreditationEtat,
      echangeInternational,
      needsClientScan,
      cities.length,
    ],
  );

  const apiQueryBase = useCallback(
    () => ({
      search: debouncedQ || undefined,
      type: type || undefined,
      ville: ville.trim() || undefined,
      universite: universite.trim() || undefined,
      isRecommended: recommendedOnly || undefined,
      isSponsored: sponsoredOnly || undefined,
      isFeatured: featuredOnly || undefined,
      echangeInternational: echangeInternational || undefined,
      accreditationEtat: accreditationEtat || undefined,
    }),
    [
      debouncedQ,
      type,
      ville,
      universite,
      recommendedOnly,
      sponsoredOnly,
      featuredOnly,
      echangeInternational,
      accreditationEtat,
    ],
  );

  useEffect(() => {
    let cancelled = false;
    setErr(null);
    setPage(1);
    setVisibleEnd(PAGE_SIZE);
    setClientMode(needsClientScan);
    setFilteredPool(null);

    if (needsClientScan) {
      if (regionTitle && cities.length === 0) {
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
            regionTitle && cities.length > 0
              ? new Set(
                  cities
                    .filter((c) => c.region?.titre === regionTitle)
                    .map((c) => c.titre.trim())
                    .filter(Boolean),
                )
              : null;
          let f = applyEstablishmentWebClientFilters(all, {
            secteurId: secteurId ? parseInt(secteurId, 10) : null,
            villesInRegion: regionSet && regionSet.size > 0 ? regionSet : null,
            villeExact: ville.trim() || null,
            diplomeExact: diplome.trim() || null,
            fraisMin,
            fraisMax,
            eTawjihiInscription: eTawjihiOnly,
          });
          f = sortSponsoredFirst(f);
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
  }, [queryKey, apiQueryBase, needsClientScan, regionTitle, cities.length]);

  async function onRefresh() {
    setRefreshing(true);
    setErr(null);
    void reloadFollows();
    try {
      if (needsClientScan && !(regionTitle && cities.length === 0)) {
        const all = await listAllEstablishments(apiQueryBase());
        const regionSet =
          regionTitle && cities.length > 0
            ? new Set(
                cities
                  .filter((c) => c.region?.titre === regionTitle)
                  .map((c) => c.titre.trim())
                  .filter(Boolean),
              )
            : null;
        let f = applyEstablishmentWebClientFilters(all, {
          secteurId: secteurId ? parseInt(secteurId, 10) : null,
          villesInRegion: regionSet && regionSet.size > 0 ? regionSet : null,
          villeExact: ville.trim() || null,
          diplomeExact: diplome.trim() || null,
          fraisMin,
          fraisMax,
          eTawjihiInscription: eTawjihiOnly,
        });
        f = sortSponsoredFirst(f);
        setFilteredPool(f);
        setItems(f.slice(0, PAGE_SIZE));
        setVisibleEnd(PAGE_SIZE);
        setPages(Math.max(1, Math.ceil(f.length / PAGE_SIZE)));
      } else if (!needsClientScan) {
        const res = await listEstablishments({ ...apiQueryBase(), page: 1, limit: PAGE_SIZE });
        setItems(res.data);
        setPages(res.pagination.pages);
        setPage(1);
      }
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e && 'message' in e ? String((e as { message: string }).message) : 'Erreur réseau';
      setErr(msg);
    } finally {
      setRefreshing(false);
    }
  }

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

  const typeOptions = [
    { label: t('schoolsTypeAll'), value: '' },
    { label: t('schoolsTypePublic'), value: 'Public' },
    { label: t('schoolsTypePrivate'), value: 'Privé' },
    { label: t('schoolsTypeSemiPublic'), value: 'Semi-Public' },
    { label: t('schoolsTypeMilitary'), value: 'Militaire' },
  ];

  const regionOptions = useMemo(() => {
    const r = new Set<string>();
    for (const c of cities) {
      if (c.region?.titre) r.add(c.region.titre);
    }
    return Array.from(r).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [cities]);

  const sortedSecteurs = useMemo(
    () => [...secteurs].sort((a, b) => (a.titre ?? '').localeCompare(b.titre ?? '', 'fr')),
    [secteurs],
  );

  const sortedCities = useMemo(
    () => [...cities].sort((a, b) => (a.titre ?? '').localeCompare(b.titre ?? '', 'fr')),
    [cities],
  );

  const cityPickItems = useMemo((): SearchablePickItem[] => {
    return sortedCities
      .filter((c) => (c.titre ?? '').trim())
      .map((c) => ({
        id: `city-${c.id}`,
        value: (c.titre ?? '').trim(),
        label: (c.titre ?? '').trim(),
        subtitle: c.region?.titre ?? undefined,
      }));
  }, [sortedCities]);

  const secteurPickItems = useMemo((): SearchablePickItem[] => {
    return sortedSecteurs.map((s) => ({
      id: `secteur-${s.id}`,
      value: String(s.id),
      label:
        ((isRTL ? s.titreAr || s.titre : s.titre) ?? '').trim() || `${t('schoolsSectorLabel')} ${s.id}`,
    }));
  }, [sortedSecteurs, isRTL, t]);

  const villeLabel = useMemo(() => {
    const v = ville.trim();
    if (!v) return t('schoolsAllCities');
    const hit = sortedCities.find((c) => (c.titre ?? '').trim() === v);
    return hit?.titre?.trim() ?? v;
  }, [ville, sortedCities, t]);

  const secteurLabel = useMemo(() => {
    const id = secteurId.trim();
    if (!id) return t('schoolsAllSectors');
    const s = sortedSecteurs.find((x) => String(x.id) === id);
    if (!s) return id;
    return ((isRTL ? s.titreAr || s.titre : s.titre) ?? '').trim() || id;
  }, [secteurId, sortedSecteurs, isRTL, t]);

  const activeFiltersCount =
    (type.trim() ? 1 : 0) +
    (ville.trim() ? 1 : 0) +
    (universite.trim() ? 1 : 0) +
    (regionTitle ? 1 : 0) +
    (secteurId ? 1 : 0) +
    (diplome.trim() ? 1 : 0) +
    (fraisMin > 0 || fraisMax < 100_000 ? 1 : 0) +
    (eTawjihiOnly ? 1 : 0) +
    (featuredOnly ? 1 : 0) +
    (recommendedOnly ? 1 : 0) +
    (sponsoredOnly ? 1 : 0) +
    (accreditationEtat ? 1 : 0) +
    (echangeInternational ? 1 : 0) +
    (eligibilityFilter !== 'all' ? 1 : 0);

  /**
   * Items effectivement affichés : on applique le filtre éligibilité (non
   * supporté côté serveur) après tous les autres filtres déjà appliqués
   * dans `items`. Le filtre est silencieusement ignoré quand l'utilisateur
   * n'est pas connecté ou n'a pas renseigné son profil — on évite ainsi
   * de cacher toutes les écoles à un visiteur qui ne pourrait pas le
   * désactiver depuis l'UI.
   */
  const visibleItems = useMemo(() => {
    if (eligibilityFilter === 'all' || !eligibilityProfile) return items;
    return items.filter((it) => {
      const verdict = evaluateEligibilityByFiliere(
        {
          filieresAcceptees: it.filieresAcceptees ?? null,
          specialitesBacMissionAcceptees: it.specialitesBacMissionAcceptees ?? null,
        },
        eligibilityProfile,
      );
      if (verdict === 'unknown') return true;
      return verdict === eligibilityFilter;
    });
  }, [items, eligibilityFilter, eligibilityProfile]);

  function resetFilters() {
    setType('');
    setVille('');
    setUniversite('');
    setRegionTitle('');
    setSecteurId('');
    setDiplome('');
    setFraisMin(0);
    setFraisMax(100_000);
    setFraisMinStr('0');
    setFraisMaxStr('100000');
    setETawjihiOnly(false);
    setFeaturedOnly(false);
    setRecommendedOnly(false);
    setSponsoredOnly(false);
    setAccreditationEtat(false);
    setEchangeInternational(false);
    setEligibilityFilter('all');
  }

  function syncFraisFromStr(kind: 'min' | 'max', txt: string) {
    if (kind === 'min') {
      setFraisMinStr(txt);
      const n = Number.parseInt(txt.replace(/\D/g, ''), 10);
      setFraisMin(Number.isFinite(n) ? Math.max(0, n) : 0);
    } else {
      setFraisMaxStr(txt);
      const n = Number.parseInt(txt.replace(/\D/g, ''), 10);
      setFraisMax(Number.isFinite(n) ? Math.max(0, n) : 100_000);
    }
  }

  const pickSheetOpen = cityPickOpen || sectorPickOpen;

  function closeFilterModalLayers() {
    if (cityPickOpen) {
      setCityPickOpen(false);
      return;
    }
    if (sectorPickOpen) {
      setSectorPickOpen(false);
      return;
    }
    setFiltersOpen(false);
  }

  function closePickSheetsOnly() {
    setCityPickOpen(false);
    setSectorPickOpen(false);
  }

  return (
    <View style={[styles.root, isRTL ? styles.rtl : styles.ltr]}>
      <StatusBar style="light" />
      {/** Même traitement que l’accueil : bleu jusqu’aux icônes de statut (plus de bande grise sous la notch). */}
      <View style={[styles.headerSafe, { paddingTop: insets.top }]}>
        <View style={styles.hero}>
        <View style={[styles.heroTitleRow, isRTL && styles.heroTitleRowRtl]}>
          <View style={styles.heroTitleCol}>
            <Text style={[styles.heroTitle, isRTL && styles.heroTitleRtl]}>{t('schoolsTitle')}</Text>
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
              <Text style={[styles.langPillTxt, locale === 'fr' && styles.langPillTxtActive]}>FR</Text>
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
              <Text style={[styles.langPillTxt, locale === 'ar' && styles.langPillTxtActive]}>عربي</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={() => setFiltersOpen(true)}
            style={({ pressed }) => [styles.filtersBtn, pressed && { opacity: 0.92 }]}
            accessibilityRole="button"
            accessibilityLabel={t('schoolsFiltersA11y')}>
            <FontAwesome name="sliders" size={16} color={homeShell.text} />
            <Text style={styles.filtersBtnTxt}>{t('schoolsFilters')}</Text>
            {activeFiltersCount > 0 ? (
              <View style={styles.filtersBadge}>
                <Text style={styles.filtersBadgeTxt}>{activeFiltersCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <View style={styles.searchCard}>
          <View style={[styles.searchRow, isRTL && styles.searchRowRtl]}>
            <FontAwesome name="search" size={16} color={homeShell.cardMuted} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder={t('schoolsSearchPlaceholder')}
              placeholderTextColor={homeShell.cardMuted}
              style={[styles.searchInput, isRTL && styles.searchInputRtl]}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {q ? (
              <Pressable onPress={() => setQ('')} hitSlop={10} accessibilityLabel="Effacer la recherche">
                <FontAwesome name="times-circle" size={18} color={homeShell.cardMuted} />
              </Pressable>
            ) : null}
          </View>
        </View>

        </View>
      </View>

      {loading ? (
        <ScrollView
          contentContainerStyle={styles.center}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={homeShell.blue}
              colors={[homeShell.green, homeShell.blue]}
            />
          }>
          <ActivityIndicator color={homeShell.blue} />
        </ScrollView>
      ) : err ? (
        <ScrollView
          contentContainerStyle={styles.center}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={homeShell.blue}
              colors={[homeShell.green, homeShell.blue]}
            />
          }>
          <Text style={styles.errTxt}>{err}</Text>
          <Text style={styles.errSub}>API: {getApiBaseUrl()}</Text>
          <Pressable onPress={onRefresh} style={styles.retryBtn}>
            <Text style={styles.retryTxt}>{t('schoolsRetry')}</Text>
          </Pressable>
        </ScrollView>
      ) : (
        <FlatList
          data={visibleItems}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={homeShell.blue}
              colors={[homeShell.green, homeShell.blue]}
            />
          }
          onEndReachedThreshold={0.35}
          onEndReached={loadMore}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator color={homeShell.blue} />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <EstablishmentCard
              item={item}
              onPress={() => {
                // Tracking « clic card » avant la navigation : l'appel est
                // fire-and-forget pour ne pas retarder la transition d'écran.
                void recordEstablishmentClick(item.id, 'listing');
                router.push(`/etablissements/${item.id}/${item.slug}`);
              }}
              isFollowed={followedIds.has(item.id)}
              followBusy={followBusyIds.has(item.id)}
              onToggleFollow={() => handleToggleFollow(item.id)}
            />
          )}
        />
      )}

      <Modal
        visible={filtersOpen}
        transparent
        animationType="slide"
        onRequestClose={closeFilterModalLayers}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalOverlay} onPress={closeFilterModalLayers} />
          <View
            style={[
              styles.modalCard,
              { paddingBottom: insets.bottom + spacing.md },
              pickSheetOpen && styles.modalCardBehindPick,
            ]}
            pointerEvents={pickSheetOpen ? 'none' : 'auto'}>
            <View style={styles.modalHandle} />
            <View style={[styles.modalHeader, isRTL && styles.rowRtl]}>
              <Text style={[styles.modalTitle, isRTL && styles.txtRtl]}>{t('schoolsFiltersTitle')}</Text>
              <Pressable onPress={closeFilterModalLayers} hitSlop={10} accessibilityLabel={t('closeOverlayA11y')}>
                <FontAwesome name="times" size={18} color={homeShell.cardMuted} />
              </Pressable>
            </View>

            <ScrollView
              style={{ maxHeight: Math.min(winH * 0.52, 440) }}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled>
              <Text style={[styles.modalHint, isRTL && styles.txtRtl]}>{t('schoolsFiltersHint')}</Text>

              <Text style={[styles.modalLabel, isRTL && styles.txtRtl]}>{t('schoolsTypeLabel')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={isRTL && styles.hScrollRtl}
                contentContainerStyle={styles.hScrollTight}
                nestedScrollEnabled>
                {typeOptions.map((opt) => (
                  <Pressable
                    key={opt.value || 'all'}
                    onPress={() => setType(opt.value)}
                    style={[styles.modalTypeChip, type === opt.value && styles.modalTypeChipOn]}>
                    <Text style={[styles.modalTypeChipTxt, type === opt.value && styles.modalTypeChipTxtOn]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
                {type.trim() ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('schoolsClearFilter')}
                    onPress={() => setType('')}
                    style={styles.chipClearHit}
                    hitSlop={12}>
                    <FontAwesome name="times-circle" size={20} color={homeShell.blue} />
                  </Pressable>
                ) : null}
              </ScrollView>

              <Text style={[styles.modalLabel, isRTL && styles.txtRtl]}>{t('schoolsUniversityLabel')}</Text>
              <View style={[styles.modalInputRow, isRTL && styles.rowRtl]}>
                <FontAwesome name="search" size={15} color={homeShell.greenDark} />
                <TextInput
                  value={universite}
                  onChangeText={setUniversite}
                  placeholder={t('schoolsUniversityPlaceholder')}
                  placeholderTextColor={homeShell.cardMuted}
                  style={[styles.modalInput, isRTL && styles.searchInputRtl]}
                />
              </View>

              <Text style={[styles.modalLabel, isRTL && styles.txtRtl]}>{t('schoolsRegionLabel')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={isRTL && styles.hScrollRtl}
                contentContainerStyle={styles.hScrollTight}
                nestedScrollEnabled>
                <Pressable
                  onPress={() => setRegionTitle('')}
                  style={[styles.miniChip, !regionTitle && styles.miniChipOn]}>
                  <Text style={[styles.miniChipTxt, !regionTitle && styles.miniChipTxtOn]}>{t('schoolsAll')}</Text>
                </Pressable>
                {regionOptions.map((r) => (
                  <Pressable key={r} onPress={() => setRegionTitle(r)} style={[styles.miniChip, regionTitle === r && styles.miniChipOn]}>
                    <Text style={[styles.miniChipTxt, regionTitle === r && styles.miniChipTxtOn]}>{r}</Text>
                  </Pressable>
                ))}
                {regionTitle ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('schoolsClearFilter')}
                    onPress={() => setRegionTitle('')}
                    style={styles.chipClearHit}
                    hitSlop={12}>
                    <FontAwesome name="times-circle" size={20} color={homeShell.blue} />
                  </Pressable>
                ) : null}
              </ScrollView>

              <Text style={[styles.modalLabel, isRTL && styles.txtRtl]}>{t('schoolsCityLabel')}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('schoolsCityLabel')}
                onPress={() => {
                  setSectorPickOpen(false);
                  setCityPickOpen(true);
                }}
                style={({ pressed }) => [
                  styles.selectField,
                  isRTL && styles.selectFieldRtl,
                  pressed && { opacity: 0.92 },
                ]}>
                <Text style={[styles.selectFieldTxt, !ville.trim() && styles.selectFieldPlaceholder, isRTL && styles.txtRtl]} numberOfLines={1}>
                  {villeLabel}
                </Text>
                <FontAwesome name={isRTL ? 'chevron-left' : 'chevron-right'} size={14} color={homeShell.cardMuted} />
              </Pressable>

              <Text style={[styles.modalLabel, isRTL && styles.txtRtl]}>{t('schoolsSectorLabel')}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('schoolsSectorLabel')}
                onPress={() => {
                  setCityPickOpen(false);
                  setSectorPickOpen(true);
                }}
                style={({ pressed }) => [
                  styles.selectField,
                  isRTL && styles.selectFieldRtl,
                  pressed && { opacity: 0.92 },
                ]}>
                <Text style={[styles.selectFieldTxt, !secteurId.trim() && styles.selectFieldPlaceholder, isRTL && styles.txtRtl]} numberOfLines={1}>
                  {secteurLabel}
                </Text>
                <FontAwesome name={isRTL ? 'chevron-left' : 'chevron-right'} size={14} color={homeShell.cardMuted} />
              </Pressable>

              <Text style={[styles.modalLabel, isRTL && styles.txtRtl]}>{t('schoolsDiplomaLabel')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={isRTL && styles.hScrollRtl}
                contentContainerStyle={styles.hScrollTight}
                nestedScrollEnabled>
                <Pressable onPress={() => setDiplome('')} style={[styles.miniChip, !diplome && styles.miniChipOn]}>
                  <Text style={[styles.miniChipTxt, !diplome && styles.miniChipTxtOn]}>{t('schoolsAllDiplomas')}</Text>
                </Pressable>
                {DIPLOME_OPTIONS.map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => setDiplome(d)}
                    style={[styles.miniChip, diplome === d && styles.miniChipOn]}>
                    <Text style={[styles.miniChipTxt, diplome === d && styles.miniChipTxtOn]} numberOfLines={1}>
                      {d}
                    </Text>
                  </Pressable>
                ))}
                {diplome.trim() ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('schoolsClearFilter')}
                    onPress={() => setDiplome('')}
                    style={styles.chipClearHit}
                    hitSlop={12}>
                    <FontAwesome name="times-circle" size={20} color={homeShell.blue} />
                  </Pressable>
                ) : null}
              </ScrollView>

              <Text style={[styles.modalLabel, isRTL && styles.txtRtl]}>{t('schoolsFeesLabel')}</Text>
              <View style={[styles.row2, isRTL && styles.rowRtl]}>
                <View style={styles.fraisCol}>
                  <Text style={[styles.fraisLbl, isRTL && styles.txtRtl]}>{t('schoolsMin')}</Text>
                  <TextInput
                    value={fraisMinStr}
                    onChangeText={(t) => syncFraisFromStr('min', t)}
                    keyboardType="number-pad"
                    style={[styles.fraisInput, isRTL && styles.searchInputRtl]}
                  />
                </View>
                <View style={styles.fraisCol}>
                  <Text style={[styles.fraisLbl, isRTL && styles.txtRtl]}>{t('schoolsMax')}</Text>
                  <TextInput
                    value={fraisMaxStr}
                    onChangeText={(t) => syncFraisFromStr('max', t)}
                    keyboardType="number-pad"
                    style={[styles.fraisInput, isRTL && styles.searchInputRtl]}
                  />
                </View>
              </View>

              {/*
                Éligibilité — basée sur la filière du Bac uniquement.
                Volontairement basé sur la filière (pas l'année du Bac) :
                l'année est un critère trop restrictif pour un filtre
                rapide.
              */}
              <Text style={[styles.modalLabel, isRTL && styles.txtRtl]}>
                {t('inscFilterEligibilityLabel')}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={isRTL && styles.hScrollRtl}
                contentContainerStyle={styles.hScrollTight}
                nestedScrollEnabled>
                {(
                  [
                    { value: 'all' as const, label: t('inscFilterEligibilityAll') },
                    { value: 'eligible' as const, label: t('inscFilterEligibilityEligible') },
                    {
                      value: 'not_eligible' as const,
                      label: t('inscFilterEligibilityNotEligible'),
                    },
                  ]
                ).map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => setEligibilityFilter(opt.value)}
                    style={[
                      styles.modalTypeChip,
                      eligibilityFilter === opt.value && styles.modalTypeChipOn,
                    ]}>
                    <Text
                      style={[
                        styles.modalTypeChipTxt,
                        eligibilityFilter === opt.value && styles.modalTypeChipTxtOn,
                      ]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <View style={styles.toggleRow}>
                <Toggle label={t('schoolsToggleRecommended')} value={recommendedOnly} onToggle={() => setRecommendedOnly((v) => !v)} />
                <Toggle label={t('schoolsToggleSponsored')} value={sponsoredOnly} onToggle={() => setSponsoredOnly((v) => !v)} />
                <Toggle label={t('schoolsToggleFeatured')} value={featuredOnly} onToggle={() => setFeaturedOnly((v) => !v)} />
                <Toggle label={t('schoolsToggleAccreditationEtat')} value={accreditationEtat} onToggle={() => setAccreditationEtat((v) => !v)} />
                <Toggle label={t('schoolsToggleExchangeInternational')} value={echangeInternational} onToggle={() => setEchangeInternational((v) => !v)} />
                <Toggle
                  label={t('schoolsToggleEtawjihiOnly')}
                  value={eTawjihiOnly}
                  onToggle={() => setETawjihiOnly((v) => !v)}
                />
              </View>

              <Text style={styles.modalFootnote}>
                {t('schoolsFootnote')}
              </Text>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable onPress={resetFilters} style={({ pressed }) => [styles.modalGhostBtn, pressed && { opacity: 0.9 }]}>
                <Text style={styles.modalGhostTxt}>{t('schoolsReset')}</Text>
              </Pressable>
              <Pressable
                onPress={() => setFiltersOpen(false)}
                style={({ pressed }) => [styles.modalPrimaryBtn, pressed && { opacity: 0.92 }]}>
                <Text style={styles.modalPrimaryTxt}>{t('schoolsApply')}</Text>
              </Pressable>
            </View>
          </View>

          {pickSheetOpen ? (
            <View style={styles.pickSheetRoot} pointerEvents="box-none">
              <Pressable style={StyleSheet.absoluteFillObject} onPress={closePickSheetsOnly} />
              {cityPickOpen ? (
                <SearchablePickPanel
                  isActive={cityPickOpen}
                  title={t('setupCityModalTitle')}
                  searchPlaceholder={t('setupCitySearchPlaceholder')}
                  emptyLabel={t('setupCityNoResults')}
                  allLabel={t('schoolsAllCities')}
                  items={cityPickItems}
                  selectedValue={ville.trim()}
                  onPick={(v) => setVille(v)}
                  onClose={() => setCityPickOpen(false)}
                  rtl={isRTL}
                />
              ) : (
                <SearchablePickPanel
                  isActive={sectorPickOpen}
                  title={t('schoolsSectorPickTitle')}
                  searchPlaceholder={t('schoolsSectorSearchPlaceholder')}
                  emptyLabel={t('schoolsSectorNoResults')}
                  allLabel={t('schoolsAllSectors')}
                  items={secteurPickItems}
                  selectedValue={secteurId.trim()}
                  onPick={(v) => setSecteurId(v)}
                  onClose={() => setSectorPickOpen(false)}
                  rtl={isRTL}
                />
              )}
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

function Toggle({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  const { isRTL } = useLocale();
  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [styles.tgl, isRTL && styles.rowRtl, pressed && { opacity: 0.92 }]}>
      <View style={[styles.tglBox, value && styles.tglBoxOn]}>
        {value ? <FontAwesome name="check" size={12} color={homeShell.text} /> : null}
      </View>
      <Text style={[styles.tglTxt, isRTL && styles.txtRtl]}>{label}</Text>
    </Pressable>
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
  langSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full,
    padding: 3,
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
  searchCard: {
    marginTop: spacing.lg,
    backgroundColor: homeShell.card,
    borderRadius: radius.xl,
    padding: spacing.sm + 2,
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
  hScroll: { gap: 8, paddingVertical: 4, flexWrap: 'wrap', alignItems: 'center' },
  /** Rangées de puces dans le modal : sans marge latérale fantôme. */
  hScrollTight: {
    gap: 8,
    paddingVertical: 2,
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  modalTypeChip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: radius.full,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    marginEnd: 6,
  },
  modalTypeChipOn: {
    backgroundColor: 'rgba(51,62,143,0.12)',
    borderColor: 'rgba(51,62,143,0.35)',
  },
  modalTypeChipTxt: {
    color: homeShell.cardMuted,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  modalTypeChipTxtOn: {
    color: homeShell.blue,
  },
  chipClearHit: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginStart: 4,
  },
  filtersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: homeShell.hairline,
  },
  filtersBtnTxt: { color: homeShell.text, fontSize: fontSize.sm, fontWeight: '900', letterSpacing: 0.2 },
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
  list: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.section },
  center: {
    flex: 1,
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

  /** Filtres : le panneau est aligné en bas (flex-end), sans wrapper intermédiaire → pas de vide transparent sous la carte. */
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,6,23,0.55)',
  },
  modalCard: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: homeShell.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: homeShell.borderOnWhite,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  modalCardBehindPick: {
    opacity: 0.38,
  },
  pickSheetRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    justifyContent: 'flex-end',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(15,23,42,0.15)',
    marginBottom: spacing.sm,
  },
  modalScrollContent: {
    paddingBottom: spacing.sm,
    flexGrow: 1,
  },
  modalHint: {
    color: homeShell.cardMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.md,
    lineHeight: 19,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  txtRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  hScrollRtl: {
    direction: 'rtl',
  },
  modalTitle: {
    color: homeShell.cardText,
    fontSize: fontSize.lg,
    fontWeight: '900',
    letterSpacing: -0.2,
    flex: 1,
    paddingEnd: spacing.md,
  },
  modalLabel: {
    color: homeShell.blue,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.45,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    borderRadius: radius.lg,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 6,
    marginBottom: spacing.sm,
  },
  selectFieldRtl: {
    flexDirection: 'row-reverse',
  },
  selectFieldTxt: {
    flex: 1,
    minWidth: 0,
    color: homeShell.cardText,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  selectFieldPlaceholder: {
    color: homeShell.cardMuted,
    fontWeight: '600',
  },
  modalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  modalInput: {
    flex: 1,
    minWidth: 0,
    color: homeShell.cardText,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  miniChip: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    marginEnd: 6,
    marginBottom: 6,
    maxWidth: 220,
  },
  miniChipOn: {
    backgroundColor: 'rgba(51,62,143,0.10)',
    borderColor: 'rgba(51,62,143,0.28)',
  },
  miniChipTxt: { color: homeShell.cardMuted, fontSize: 12, fontWeight: '700' },
  miniChipTxtOn: { color: homeShell.blue },
  row2: { flexDirection: 'row', gap: spacing.md },
  fraisCol: { flex: 1 },
  fraisLbl: { fontSize: 11, fontWeight: '800', color: '#94A3B8', marginBottom: 6 },
  fraisInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: homeShell.cardText,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  toggleRow: { marginTop: spacing.md, gap: spacing.md },
  tgl: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tglBox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: homeShell.borderOnWhite,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tglBoxOn: { backgroundColor: homeShell.green, borderColor: 'rgba(47,206,148,0.55)' },
  tglTxt: { flex: 1, color: homeShell.cardText, fontSize: fontSize.md, fontWeight: '700' },
  modalFootnote: {
    marginTop: spacing.md,
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  modalActions: {
    paddingTop: spacing.md,
    marginTop: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: homeShell.borderOnWhite,
  },
  modalGhostBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    paddingVertical: 12,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  modalGhostTxt: { color: homeShell.blueDeep, fontWeight: '900', fontSize: fontSize.md },
  modalPrimaryBtn: {
    flex: 1,
    backgroundColor: homeShell.blue,
    paddingVertical: 12,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  modalPrimaryTxt: { color: homeShell.text, fontWeight: '900', fontSize: fontSize.md },
});
