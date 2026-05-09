import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { AnnouncementCard } from '@/components/inscriptions/AnnouncementCard';
import { FollowedSchoolCard } from '@/components/inscriptions/FollowedSchoolCard';
import { NotificationCard } from '@/components/inscriptions/NotificationCard';
import { StatusUpdateSheet } from '@/components/inscriptions/StatusUpdateSheet';
import {
  countActiveEstablishmentFilters,
  defaultEstablishmentFilters,
  EstablishmentFiltersModal,
  type EstablishmentFiltersValue,
} from '@/components/schools/EstablishmentFiltersModal';
import {
  SearchablePickSheet,
  type SearchablePickItem,
} from '@/components/schools/SearchablePickSheet';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useEligibilityProfile } from '@/hooks/useEligibilityProfile';
import {
  reportLinkVisited,
} from '@/services/candidacies';
import {
  fetchContestAnnouncements,
  recordContestClick,
  recordContestImpression,
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
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/notifications';
import {
  listAllSecteursActive,
  listCities,
  type CityRow,
  type SecteurRow,
} from '@/services/referenceData';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type {
  AppNotification,
  CandidacyStatus,
  EstablishmentFollow,
} from '@/types/inscriptions';
import { STATUS_FLOW, STATUS_VISUALS } from '@/utils/candidacyStatus';
import { evaluateEligibilityByFiliere } from '@/utils/eligibility';
import { establishmentMatchesAllFilters } from '@/utils/establishmentWebFilters';

type TabId = 'notifications' | 'candidacies' | 'announcements';

export default function InscriptionsTabScreen() {
  const router = useRouter();
  const { t, isRTL, locale, setLocale } = useLocale();
  const { user, getValidAccessToken, isLoading: authLoading } = useAuth();
  const isLoggedIn = Boolean(user);

  const [tab, setTab] = useState<TabId>('announcements');

  // Notifications state
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');
  const [notifLoading, setNotifLoading] = useState(false);

  // Suivi école (= "Candidatures" dans l'UI)
  const [follows, setFollows] = useState<EstablishmentFollow[]>([]);
  const [followCounts, setFollowCounts] = useState<Partial<Record<CandidacyStatus, number>>>({});
  const [followFilter, setFollowFilter] = useState<CandidacyStatus | ''>('');
  const [followsLoading, setFollowsLoading] = useState(false);

  // Annonces
  const [announcements, setAnnouncements] = useState<ContestAnnouncementCard[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [followBusyId, setFollowBusyId] = useState<number | null>(null);

  /* Filtre "École" sur l'onglet Annonces — id établissement choisi (vide ⇒ toutes). */
  const [schoolFilterId, setSchoolFilterId] = useState<string>('');
  const [schoolPickerOpen, setSchoolPickerOpen] = useState(false);

  /**
   * Filtres rapides (pills) propres à l'onglet « Annonces » :
   *  - `statusFilter`     : ouvert / fermé / tous (basé sur `isOpen` /
   *    `isExpire` calculés côté backend à partir des dates).
   *  - `eligibilityFilter`: éligible / non éligible / tous, basé sur la
   *    filière du Bac uniquement (cf. `evaluateEligibilityByFiliere`).
   *  - `sortBy`           : ordre d'affichage. `closingSoon` trie par
   *    nombre de jours restants (`daysUntilClose`) croissant en plaçant
   *    les annonces déjà fermées en queue de liste.
   */
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [eligibilityFilter, setEligibilityFilter] = useState<
    'all' | 'eligible' | 'not_eligible'
  >('all');
  const [sortBy, setSortBy] = useState<'default' | 'closingSoon'>('default');
  const { profile: eligibilityProfile } = useEligibilityProfile();

  /**
   * Filtres avancés (mêmes que sur la page « Écoles supérieures »).
   * Appliqués côté client : pour chaque annonce, on récupère son école dans
   * `allEstablishmentsById` puis on évalue tous les critères.
   */
  const [filtersValue, setFiltersValue] = useState<EstablishmentFiltersValue>(
    defaultEstablishmentFilters(),
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* Données de référence partagées avec la page Écoles. */
  const [cities, setCities] = useState<CityRow[]>([]);
  const [secteurs, setSecteurs] = useState<SecteurRow[]>([]);
  const [allEstablishments, setAllEstablishments] = useState<EstablishmentNormalized[]>([]);
  const [filtersDataLoaded, setFiltersDataLoaded] = useState(false);
  const [filtersDataLoading, setFiltersDataLoading] = useState(false);

  // Status sheet (sur un follow école)
  const [statusSheetOpen, setStatusSheetOpen] = useState(false);
  const [activeFollow, setActiveFollow] = useState<EstablishmentFollow | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  // ── Loaders ──
  const reloadNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    const token = await getValidAccessToken();
    if (!token) return;
    setNotifLoading(true);
    try {
      const res = await fetchNotifications(token, {
        unreadOnly: notifFilter === 'unread',
        limit: 100,
      });
      setNotifs(res.items);
      setUnreadCount(res.unreadCount);
    } finally {
      setNotifLoading(false);
    }
  }, [getValidAccessToken, isLoggedIn, notifFilter]);

  const reloadFollows = useCallback(async () => {
    if (!isLoggedIn) return;
    const token = await getValidAccessToken();
    if (!token) return;
    setFollowsLoading(true);
    try {
      const res = await fetchEstablishmentFollows(token, followFilter || undefined);
      setFollows(res.items);
      setFollowCounts(res.counts);
    } finally {
      setFollowsLoading(false);
    }
  }, [getValidAccessToken, isLoggedIn, followFilter]);

  const reloadAnnouncements = useCallback(async () => {
    setAnnouncementsLoading(true);
    try {
      const items = await fetchContestAnnouncements();
      setAnnouncements(items);
      // Tracking analytique : enregistre une impression « listing » par annonce
      // visible, dédupliqué pour la session pour ne pas inflater les KPIs en
      // cas de pull-to-refresh ou de retour sur l'onglet.
      recordContestListingImpressionsBatch(items);
    } finally {
      setAnnouncementsLoading(false);
    }
  }, []);

  // Initial loads
  useEffect(() => {
    void reloadAnnouncements();
  }, [reloadAnnouncements]);

  /**
   * Charge à la volée les données de référence nécessaires aux filtres
   * avancés (cities, secteurs, écoles complètes). Appelé uniquement au
   * premier affichage de l'onglet « Annonces » pour éviter de payer le coût
   * réseau pour les utilisateurs qui n'ouvriront jamais le panneau filtres.
   */
  const ensureFiltersDataLoaded = useCallback(async () => {
    if (filtersDataLoaded || filtersDataLoading) return;
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
  }, [filtersDataLoaded, filtersDataLoading]);

  /* Pré-charger les données dès qu'on est sur l'onglet annonces. */
  useEffect(() => {
    if (tab === 'announcements') void ensureFiltersDataLoaded();
  }, [tab, ensureFiltersDataLoaded]);

  useEffect(() => {
    if (isLoggedIn) {
      void reloadFollows();
      void reloadNotifications();
      // Light refresh of unread count alone
      void (async () => {
        const token = await getValidAccessToken();
        if (token) {
          const c = await fetchUnreadCount(token);
          setUnreadCount(c);
        }
      })();
    }
  }, [isLoggedIn, reloadFollows, reloadNotifications, getValidAccessToken]);

  // Reload notifs when filter switches
  useEffect(() => {
    if (isLoggedIn) void reloadNotifications();
  }, [notifFilter, isLoggedIn, reloadNotifications]);

  // Reload follows when filter switches
  useEffect(() => {
    if (isLoggedIn) void reloadFollows();
  }, [followFilter, isLoggedIn, reloadFollows]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (tab === 'notifications') await reloadNotifications();
      else if (tab === 'candidacies') await reloadFollows();
      else await reloadAnnouncements();
    } finally {
      setRefreshing(false);
    }
  }, [tab, reloadNotifications, reloadFollows, reloadAnnouncements]);

  // Set des establishment IDs suivis (utile pour l'AnnouncementCard "déjà suivie ?").
  const followedEstablishmentSet = useMemo(() => {
    const s = new Set<number>();
    follows.forEach((f) => {
      if (f.establishment?.id) s.add(f.establishment.id);
    });
    return s;
  }, [follows]);

  /**
   * Liste unique des écoles qui apparaissent dans les annonces chargées,
   * triée par nom — alimente le picker de filtre.
   */
  const schoolFilterItems = useMemo<SearchablePickItem[]>(() => {
    const map = new Map<number, { label: string; subtitle: string }>();
    for (const a of announcements) {
      const e = a.establishment;
      if (!e || !e.id) continue;
      const ar = (e.nomArabe ?? '').trim();
      const fr = (e.nom ?? '').trim();
      const primary = locale === 'ar' && ar ? ar : fr || ar || `#${e.id}`;
      const secondaryParts: string[] = [];
      if (e.sigle) secondaryParts.push(e.sigle);
      if (locale === 'ar' && fr && ar) secondaryParts.push(fr);
      else if (locale === 'fr' && ar && fr) secondaryParts.push(ar);
      map.set(e.id, { label: primary, subtitle: secondaryParts.join(' · ') });
    }
    const arr = Array.from(map.entries()).map(([id, v]) => ({
      id: `est-${id}`,
      value: String(id),
      label: v.label,
      subtitle: v.subtitle || undefined,
    }));
    return arr.sort((a, b) => a.label.localeCompare(b.label, locale === 'ar' ? 'ar' : 'fr'));
  }, [announcements, locale]);

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

  /**
   * Annonces filtrées par école sélectionnée puis par filtres avancés.
   * On évalue chaque annonce contre son école parente (lookup via map). Si
   * les données de référence ne sont pas encore chargées, on n'applique pas
   * les filtres avancés (sinon on filtrerait tout) — l'utilisateur attend
   * de toute façon un loader au premier accès.
   */
  const visibleAnnouncements = useMemo(() => {
    let out = announcements;

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

    /* 3) Filtre statut ouvert/fermé.
       On préfère `isExpire` à `daysUntilClose <= 0` car le backend est
       seul à connaître son fuseau horaire de référence. */
    if (statusFilter === 'open') {
      out = out.filter((a) => a.isOpen && !a.isExpire);
    } else if (statusFilter === 'closed') {
      out = out.filter((a) => a.isExpire || !a.isOpen);
    }

    /* 4) Filtre éligibilité (filière du Bac). Silencieusement ignoré si
       l'utilisateur n'a pas de profil ⇒ on conserve la liste complète
       pour ne pas piéger un visiteur. */
    if (eligibilityFilter !== 'all' && eligibilityProfile) {
      out = out.filter((a) => {
        const verdict = evaluateEligibilityByFiliere(
          {
            filieresAcceptees: a.filieresAcceptees,
            specialitesBacMissionAcceptees: a.specialitesBacMissionAcceptees,
          },
          eligibilityProfile,
        );
        if (verdict === 'unknown') return true;
        return verdict === eligibilityFilter;
      });
    }

    /* 5) Tri par dernier délai : annonces ouvertes avec délai croissant en
       tête, puis annonces fermées (jours négatifs) en fin de liste. */
    if (sortBy === 'closingSoon') {
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
    statusFilter,
    eligibilityFilter,
    eligibilityProfile,
    sortBy,
  ]);

  /** Libellé du filtre actif (nom de l'école choisie, ou "Toutes les écoles"). */
  const schoolFilterLabel = useMemo(() => {
    const sid = schoolFilterId.trim();
    if (!sid) return t('inscFilterSchoolAll');
    const hit = schoolFilterItems.find((it) => it.value === sid);
    return hit?.label ?? t('inscFilterSchoolAll');
  }, [schoolFilterId, schoolFilterItems, t]);

  // ── Actions ──
  const handleOpenLink = useCallback(
    async (
      candidacyId: number | null,
      url: string,
      contestId: number,
    ) => {
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
      void recordContestClick(contestId, 'detail');
      if (candidacyId) {
        const token = await getValidAccessToken();
        if (token) {
          await reportLinkVisited(token, candidacyId);
        }
      }
    },
    [getValidAccessToken, t],
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
          status: 'interested',
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
          setFollowCounts((prev) => ({
            ...prev,
            [follow.status]: (prev[follow.status] ?? 0) + 1,
          }));
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
          setFollows((prev) => {
            const removed = prev.find((f) => f.establishment?.id === eid);
            if (removed) {
              setFollowCounts((c) => {
                const next = { ...c };
                if (next[removed.status]) next[removed.status] = Math.max(0, (next[removed.status] ?? 0) - 1);
                return next;
              });
            }
            return prev.filter((f) => f.establishment?.id !== eid);
          });
        }
      } finally {
        setFollowBusyId(null);
      }
    },
    [getValidAccessToken],
  );

  const handleOpenStatusSheet = useCallback((f: EstablishmentFollow) => {
    setActiveFollow(f);
    setStatusSheetOpen(true);
  }, []);

  const handleConfirmStatus = useCallback(
    async (status: CandidacyStatus) => {
      if (!activeFollow) return;
      const token = await getValidAccessToken();
      if (!token) return;
      const updated = await updateFollowStatus(token, activeFollow.id, status);
      if (updated) {
        setFollows((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
        await reloadFollows();
      }
      setStatusSheetOpen(false);
      setActiveFollow(null);
    },
    [activeFollow, getValidAccessToken, reloadFollows],
  );

  const handleUnfollowFromSheet = useCallback(() => {
    if (!activeFollow) return;
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
            const ok = await deleteEstablishmentFollow(token, activeFollow.id);
            if (ok) {
              setFollows((prev) => prev.filter((f) => f.id !== activeFollow.id));
              setStatusSheetOpen(false);
              setActiveFollow(null);
              await reloadFollows();
            }
          },
        },
      ],
    );
  }, [activeFollow, getValidAccessToken, reloadFollows, t]);

  const handleNotifPress = useCallback(
    async (n: AppNotification) => {
      if (!n.isRead) {
        const token = await getValidAccessToken();
        if (token) {
          await markNotificationRead(token, n.id);
        }
        setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      // Navigation prioritaire : page détail d'annonce si metadata fournit l'id
      const meta = (n.metadata ?? {}) as {
        announcement_id?: number | string;
        contest_announcement_id?: number | string;
        establishment_id?: number | string;
      };
      const annId = Number(meta.announcement_id ?? meta.contest_announcement_id ?? 0);
      if (Number.isFinite(annId) && annId > 0) {
        router.push(`/inscriptions/${annId}` as never);
        return;
      }
      const eid = Number(meta.establishment_id ?? 0);
      if (Number.isFinite(eid) && eid > 0) {
        const target = follows.find((f) => f.establishment?.id === eid);
        if (target) {
          router.push(`/inscriptions/follow/${target.id}` as never);
        }
      }
    },
    [getValidAccessToken, follows, router],
  );

  const handleMarkAllRead = useCallback(async () => {
    const token = await getValidAccessToken();
    if (!token) return;
    const ok = await markAllNotificationsRead(token);
    if (ok) {
      setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  }, [getValidAccessToken]);

  // ── Renders ──

  const renderHeader = () => (
    <View style={styles.hero}>
      <View style={[styles.heroTop, isRTL && styles.rowRtl]}>
        <View style={styles.heroTitles}>
          <Text style={[styles.heroEyebrow, isRTL && styles.rtl]}>{t('inscEyebrow')}</Text>
          <Text style={[styles.heroTitle, isRTL && styles.rtl]}>{t('inscTitle')}</Text>
        </View>

        {/* Lang switch */}
        <View
          style={[styles.langSwitch, isRTL && styles.rowRtl]}
          accessibilityRole="tablist"
          accessibilityLabel={t('languageSwitcher')}
        >
          <Pressable
            onPress={() => setLocale('fr')}
            style={({ pressed }) => [
              styles.langPill,
              locale === 'fr' && styles.langPillActive,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={[styles.langPillTxt, locale === 'fr' && styles.langPillTxtActive]}>
              {t('langFr')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setLocale('ar')}
            style={({ pressed }) => [
              styles.langPill,
              locale === 'ar' && styles.langPillActive,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={[styles.langPillTxt, locale === 'ar' && styles.langPillTxtActive]}>
              {t('langAr')}
            </Text>
          </Pressable>
        </View>
      </View>

      <Text style={[styles.heroSub, isRTL && styles.rtl]}>{t('inscSubtitle')}</Text>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {(['announcements', 'candidacies', 'notifications'] as const).map((id) => {
          const active = tab === id;
          const labelKey: 'inscTabCandidacies' | 'inscTabNotifications' | 'inscTabAnnouncements' =
            id === 'candidacies'
              ? 'inscTabCandidacies'
              : id === 'notifications'
                ? 'inscTabNotifications'
                : 'inscTabAnnouncements';
          const icon: React.ComponentProps<typeof FontAwesome>['name'] =
            id === 'candidacies' ? 'flag-checkered' : id === 'notifications' ? 'bell' : 'bullhorn';
          const showBadge = id === 'notifications' && unreadCount > 0;
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
              <FontAwesome name={icon} size={13} color={active ? brand.primary : brand.white} />
              <Text style={[styles.tabTxt, active && styles.tabTxtActive]}>{t(labelKey)}</Text>
              {showBadge ? (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeTxt}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              ) : null}
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

  const renderNotifications = () => {
    if (!isLoggedIn) return renderRequireLogin();
    return (
      <FlatList
        data={notifs}
        keyExtractor={(n) => `notif-${n.id}`}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={brand.primary} />
        }
        ListHeaderComponent={
          <View style={styles.subHeader}>
            <View style={[styles.chipsRow, isRTL && styles.rowRtl]}>
              {(['all', 'unread'] as const).map((f) => {
                const active = notifFilter === f;
                return (
                  <Pressable
                    key={f}
                    onPress={() => setNotifFilter(f)}
                    style={({ pressed }) => [
                      styles.chip,
                      active && styles.chipActive,
                      pressed && !active && { opacity: 0.85 },
                    ]}
                  >
                    <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>
                      {t(f === 'all' ? 'inscNotifFilterAll' : 'inscNotifFilterUnread')}
                    </Text>
                  </Pressable>
                );
              })}
              {unreadCount > 0 ? (
                <Pressable
                  onPress={handleMarkAllRead}
                  style={({ pressed }) => [styles.markAll, pressed && { opacity: 0.85 }]}
                >
                  <FontAwesome name="check-square-o" size={11} color={brand.primary} />
                  <Text style={styles.markAllTxt}>{t('inscNotifMarkAllRead')}</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <NotificationCard notif={item} onPress={() => handleNotifPress(item)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          notifLoading ? (
            <View style={styles.empty}>
              <ActivityIndicator color={brand.primary} />
            </View>
          ) : (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <FontAwesome name="bell-slash-o" size={28} color={brand.primary} />
              </View>
              <Text style={styles.emptyTitle}>{t('inscNotifEmptyTitle')}</Text>
              <Text style={styles.emptyTxt}>{t('inscNotifEmptyDesc')}</Text>
            </View>
          )
        }
      />
    );
  };

  const renderCandidacies = () => {
    if (!isLoggedIn) return renderRequireLogin();
    return (
      <FlatList
        data={follows}
        keyExtractor={(f) => `follow-${f.id}`}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={brand.primary} />
        }
        ListHeaderComponent={
          <View style={styles.subHeader}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statusChipsRow}
            >
              <Pressable
                onPress={() => setFollowFilter('')}
                style={({ pressed }) => [
                  styles.chip,
                  followFilter === '' && styles.chipActive,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={[styles.chipTxt, followFilter === '' && styles.chipTxtActive]}>
                  {t('inscCandidaciesFilterAll')} (
                  {Object.values(followCounts).reduce<number>((a, b) => a + (b ?? 0), 0)})
                </Text>
              </Pressable>
              {STATUS_FLOW.map((s) => {
                const visual = STATUS_VISUALS[s];
                const count = followCounts[s] ?? 0;
                if (count === 0 && followFilter !== s) return null;
                const active = followFilter === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => setFollowFilter(s)}
                    style={({ pressed }) => [
                      styles.chip,
                      active && { backgroundColor: visual.bg, borderColor: visual.fg },
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <FontAwesome name={visual.icon} size={10} color={active ? visual.fg : brand.textMuted} />
                    <Text
                      style={[
                        styles.chipTxt,
                        active && { color: visual.fg, fontWeight: '800' },
                      ]}
                    >
                      {t(visual.labelKey)} ({count})
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => (
          <FollowedSchoolCard
            follow={item}
            onPress={() => router.push(`/inscriptions/follow/${item.id}` as never)}
            onUpdateStatus={() => handleOpenStatusSheet(item)}
            onUnfollow={async () => {
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
                        setFollows((prev) => prev.filter((f) => f.id !== item.id));
                        await reloadFollows();
                      }
                    },
                  },
                ],
              );
            }}
            onOpenLatest={() => {
              if (item.latestAnnouncement?.id) {
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
          followsLoading ? (
            <View style={styles.empty}>
              <ActivityIndicator color={brand.primary} />
            </View>
          ) : (
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
            </View>
          )
        }
      />
    );
  };

  const renderAnnouncementsFilterBar = () => (
    <View style={styles.filterBarWrap}>
      <View style={[styles.filterBar, isRTL && styles.filterBarRtl]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('inscFilterSchoolPickTitle')}
          onPress={() => setSchoolPickerOpen(true)}
          style={({ pressed }) => [
            styles.filterField,
            isRTL && styles.filterFieldRtl,
            pressed && { opacity: 0.92 },
          ]}
        >
          <FontAwesome name="university" size={14} color={brand.primary} />
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
        {schoolFilterId ? (
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

      {/* Bouton "Filtres avancés" — ouvre la même modale que la page Écoles. */}
      <View style={[styles.advancedFilterRow, isRTL && styles.rowRtl]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('schoolsFiltersTitle')}
          onPress={() => {
            void ensureFiltersDataLoaded();
            setFiltersOpen(true);
          }}
          style={({ pressed }) => [
            styles.advancedFilterBtn,
            isRTL && styles.rowRtl,
            pressed && { opacity: 0.9 },
          ]}>
          <FontAwesome name="sliders" size={14} color={brand.primary} />
          <Text style={styles.advancedFilterBtnTxt}>{t('schoolsFiltersTitle')}</Text>
          {activeAdvancedFiltersCount > 0 ? (
            <View style={styles.advancedFilterBadge}>
              <Text style={styles.advancedFilterBadgeTxt}>{activeAdvancedFiltersCount}</Text>
            </View>
          ) : null}
        </Pressable>
        {activeAdvancedFiltersCount > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('schoolsReset')}
            onPress={() => setFiltersValue(defaultEstablishmentFilters())}
            hitSlop={10}
            style={({ pressed }) => [styles.advancedFilterClear, pressed && { opacity: 0.85 }]}>
            <FontAwesome name="times-circle" size={16} color={brand.primary} />
            <Text style={styles.advancedFilterClearTxt}>{t('schoolsReset')}</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Pills : statut + éligibilité + tri rapide. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickFiltersRow}
        style={isRTL ? styles.rowRtl : undefined}>
        {/* Statut ouvert / fermé */}
        {(
          [
            { value: 'all' as const, label: t('inscFilterStatusAll'), icon: 'list' as const },
            {
              value: 'open' as const,
              label: t('inscFilterStatusOpen'),
              icon: 'check-circle' as const,
            },
            {
              value: 'closed' as const,
              label: t('inscFilterStatusClosed'),
              icon: 'lock' as const,
            },
          ]
        ).map((opt) => {
          const active = statusFilter === opt.value;
          return (
            <Pressable
              key={`status-${opt.value}`}
              onPress={() => setStatusFilter(opt.value)}
              style={({ pressed }) => [
                styles.quickPill,
                active && styles.quickPillActive,
                pressed && { opacity: 0.85 },
              ]}>
              <FontAwesome
                name={opt.icon}
                size={11}
                color={active ? brand.white : brand.primary}
              />
              <Text style={[styles.quickPillTxt, active && styles.quickPillTxtActive]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}

        <View style={styles.quickPillSep} />

        {/* Éligibilité — masqué si l'utilisateur n'a pas de profil utilisable. */}
        {eligibilityProfile
          ? (
              [
                {
                  value: 'all' as const,
                  label: t('inscFilterEligibilityAll'),
                  icon: 'list' as const,
                },
                {
                  value: 'eligible' as const,
                  label: t('inscFilterEligibilityEligible'),
                  icon: 'check' as const,
                },
                {
                  value: 'not_eligible' as const,
                  label: t('inscFilterEligibilityNotEligible'),
                  icon: 'times' as const,
                },
              ]
            ).map((opt) => {
              const active = eligibilityFilter === opt.value;
              return (
                <Pressable
                  key={`elig-${opt.value}`}
                  onPress={() => setEligibilityFilter(opt.value)}
                  style={({ pressed }) => [
                    styles.quickPill,
                    active && styles.quickPillActive,
                    pressed && { opacity: 0.85 },
                  ]}>
                  <FontAwesome
                    name={opt.icon}
                    size={11}
                    color={active ? brand.white : brand.primary}
                  />
                  <Text style={[styles.quickPillTxt, active && styles.quickPillTxtActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })
          : null}

        {eligibilityProfile ? <View style={styles.quickPillSep} /> : null}

        {/* Tri */}
        <Pressable
          onPress={() => setSortBy(sortBy === 'closingSoon' ? 'default' : 'closingSoon')}
          style={({ pressed }) => [
            styles.quickPill,
            sortBy === 'closingSoon' && styles.quickPillActive,
            pressed && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('inscSortLabel')}>
          <FontAwesome
            name="sort-amount-asc"
            size={11}
            color={sortBy === 'closingSoon' ? brand.white : brand.primary}
          />
          <Text
            style={[
              styles.quickPillTxt,
              sortBy === 'closingSoon' && styles.quickPillTxtActive,
            ]}>
            {sortBy === 'closingSoon' ? t('inscSortClosingSoon') : t('inscSortDefault')}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );

  const renderAnnouncements = () => (
    <FlatList
      data={visibleAnnouncements}
      keyExtractor={(a) => `ann-${a.id}`}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={brand.primary} />
      }
      ListHeaderComponent={renderAnnouncementsFilterBar()}
      renderItem={({ item }) => {
        const eid = item.establishment?.id ?? 0;
        const isFollowed = eid > 0 && followedEstablishmentSet.has(eid);
        return (
          <AnnouncementCard
            item={item}
            isFollowed={isFollowed}
            busy={followBusyId === item.id}
            onPress={() => router.push(`/inscriptions/${item.id}` as never)}
            onToggleFollow={() => {
              if (isFollowed) void handleUnfollow(item);
              else void handleFollow(item);
            }}
            onOpenLink={() => handleOpenLink(null, item.registrationUrl, item.id)}
          />
        );
      }}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      ListEmptyComponent={
        announcementsLoading ? (
          <View style={styles.empty}>
            <ActivityIndicator color={brand.primary} />
          </View>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <FontAwesome name="bullhorn" size={28} color={brand.primary} />
            </View>
            <Text style={styles.emptyTitle}>{t('inscAnnouncementsEmptyTitle')}</Text>
            <Text style={styles.emptyTxt}>{t('inscAnnouncementsEmptyDesc')}</Text>
          </View>
        )
      }
    />
  );

  if (authLoading) {
    return (
      <SafeAreaView style={[styles.root, styles.center]} edges={['top']}>
        <ActivityIndicator color={brand.primary} />
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
        {tab === 'notifications' ? renderNotifications() : null}
      </View>

      <StatusUpdateSheet
        visible={statusSheetOpen}
        currentStatus={activeFollow?.status}
        onClose={() => {
          setStatusSheetOpen(false);
          setActiveFollow(null);
        }}
        onConfirm={handleConfirmStatus}
        onRequestDelete={activeFollow ? handleUnfollowFromSheet : undefined}
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

      {/* Modale de filtres avancés — partagée avec la page Écoles. */}
      <EstablishmentFiltersModal
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={filtersValue}
        onChange={setFiltersValue}
        cities={cities}
        secteurs={secteurs}
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

  langSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full,
    padding: 3,
  },
  langPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  langPillActive: { backgroundColor: brand.white },
  langPillTxt: { color: brand.white, fontSize: fontSize.xs, fontWeight: '700' },
  langPillTxtActive: { color: brand.primary },

  /* Tabs */
  tabsRow: {
    flexDirection: 'row',
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
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: radius.full,
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
    marginLeft: 2,
  },
  tabBadgeTxt: { color: brand.white, fontSize: 9, fontWeight: '800' },

  /* Sub-header (filters) */
  subHeader: { paddingTop: spacing.md, paddingBottom: spacing.sm },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  statusChipsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingRight: spacing.lg,
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

  markAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(51,62,143,0.08)',
    marginLeft: 'auto',
  },
  markAllTxt: { color: brand.primary, fontWeight: '700', fontSize: fontSize.xs },

  /* Lists */
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.section * 2,
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
  filterClearBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },

  /* Conteneur englobant la barre filtre + le bouton "Filtres avancés" */
  filterBarWrap: { marginBottom: spacing.md },
  advancedFilterRow: {
    flexDirection: 'row',
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
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  advancedFilterClearTxt: {
    color: brand.primary,
    fontSize: 12,
    fontWeight: '800',
  },

  /* Pills compacts (statut / éligibilité / tri). */
  quickFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: spacing.sm,
    paddingBottom: 2,
  },
  quickPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  quickPillActive: {
    backgroundColor: brand.primary,
    borderColor: brand.primary,
  },
  quickPillTxt: {
    color: brand.text,
    fontSize: 11,
    fontWeight: '700',
  },
  quickPillTxtActive: {
    color: brand.white,
  },
  quickPillSep: {
    width: StyleSheet.hairlineWidth,
    height: 18,
    backgroundColor: brand.border,
    marginHorizontal: 4,
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
});
