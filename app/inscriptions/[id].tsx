import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  InteractionManager,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ShareIconButton } from '@/components/share/ShareIconButton';
import { AppBannerSlot } from '@/components/ads/AppBannerSlot';
import { CommunityQnaSection } from '@/components/community/CommunityQnaSection';
import { AnnouncementTypeChip } from '@/components/inscriptions/AnnouncementTypeChip';
import { ContestYoutubeTutorial } from '@/components/inscriptions/ContestYoutubeTutorial';
import {
  EligibilityBadge,
  EligibilitySummary,
} from '@/components/inscriptions/EligibilityViews';
import { StatusBadge } from '@/components/inscriptions/StatusBadge';
import { StatusUpdateSheet } from '@/components/inscriptions/StatusUpdateSheet';
import { EstablishmentDescriptionHtml } from '@/components/schools/EstablishmentDescriptionHtml';
import { EstablishmentTypeBadge } from '@/components/ui/EstablishmentTypeBadge';
import { Text } from '@/components/ui/Text';
import {
  fallbackEstablishmentAvatarName,
  getEstablishmentLogoUrl,
} from '@/constants/establishmentMedia';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useNotificationsDrawer } from '@/contexts/NotificationsDrawerContext';
import { useSharePreview } from '@/contexts/SharePreviewContext';
import { sharePayloadContestAnnouncementDetail } from '@/utils/sharePagePayloads';
import { useEligibilityProfile } from '@/hooks/useEligibilityProfile';
import {
  fetchContestAnnouncementDetail,
  recordContestClick,
  recordContestImpression,
  type ContestAnnouncementDetail,
} from '@/services/contestAnnouncements';
import {
  deleteEstablishmentFollowByEstablishment,
  fetchFollowStateByEstablishment,
  updateFollowStatus,
  upsertEstablishmentFollow,
} from '@/services/establishmentFollows';
import { markUnreadNotificationsForContestAnnouncement } from '@/services/notifications';
import { recordEstablishmentClick } from '@/services/establishmentTracking';
import type {
  CandidacyStatusType,
  EstablishmentFollow,
} from '@/types/inscriptions';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import {
  formatDaysUntilClose,
  formatShortDate,
  pickAnnouncementDescriptionHtml,
  pickAnnouncementTitle,
  pickEstablishmentName,
  pickRegistrationUrlLabel,
} from '@/utils/candidacyStatus';
import { splitSiblingsAroundCurrent } from '@/utils/contestAnnouncementSiblings';
import { downloadDocument, pickDocumentIcon, viewDocument } from '@/utils/documents';
import { evaluateEligibility } from '@/utils/eligibility';
import { fireAndForget } from '@/utils/fireAndForget';
import { parseYoutubeVideoId } from '@/utils/youtubeVideoId';

export default function InscriptionDetailScreen() {
  const router = useRouter();
  const { t, locale, isRTL, setLocale } = useLocale();
  const { presentShare } = useSharePreview();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id?: string;
    qnaQ?: string | string[];
    qnaScroll?: string | string[];
  }>();
  const id = useMemo(() => Number(params.id ?? 0), [params.id]);
  const highlightQuestionId = useMemo(() => {
    const raw = params.qnaQ;
    const s = Array.isArray(raw) ? raw[0] : raw;
    const n = Number(s ?? 0);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [params.qnaQ]);
  const qnaScrollRequested = useMemo(() => {
    const raw = params.qnaScroll;
    const s = Array.isArray(raw) ? raw[0] : raw;
    return s === '1' || s === 'true';
  }, [params.qnaScroll]);
  const scrollRef = useRef<ScrollView>(null);
  const qnaScrollDoneRef = useRef(false);
  const { profile: eligibilityProfile, loading: eligibilityProfileLoading } = useEligibilityProfile();
  const { user, getValidAccessToken } = useAuth();
  const isLoggedIn = Boolean(user);
  const { refreshUnread } = useNotificationsDrawer();

  const [data, setData] = useState<ContestAnnouncementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Suivi école courant (objet complet) pour pouvoir afficher le statut
   * et appeler `updateFollowStatus` avec son id. `null` ⇒ pas (encore)
   * suivie. Refonte UX 2026-05 : suivre = créer l'EstablishmentFollow,
   * statut par défaut côté backend (`interested`).
   */
  const [currentFollow, setCurrentFollow] = useState<EstablishmentFollow | null>(null);
  const isFollowingEst = currentFollow !== null;
  const [followBusy, setFollowBusy] = useState(false);
  /** État suivi serveur pour l’école de l’annonce (évite cœur « non suivi » le temps du fetch). */
  const [followStateLoading, setFollowStateLoading] = useState(false);

  /**
   * Sheet de mise à jour du statut depuis la page annonce. Les statuts
   * proposés sont ceux **autorisés par l'annonce courante** (sous-ensemble
   * de ce que l'école accepte). Si l'utilisateur ne suit pas encore, le
   * suivi est créé automatiquement à la confirmation avec le statut choisi.
   */
  const [statusSheetOpen, setStatusSheetOpen] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isFinite(id) || id <= 0) {
      setError(t('inscDetailNotFound'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const detail = await fetchContestAnnouncementDetail(id);
    if (!detail) {
      setError(t('inscDetailNotFound'));
    } else {
      setData(detail);
      fireAndForget(recordContestImpression(detail.id, 'detail'));
    }
    setLoading(false);
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Aligner la cloche / pastilles avec la lecture sur cette page : marquer les notifs liées à l’annonce. */
  useEffect(() => {
    if (!data || !isLoggedIn || data.id !== id) return;
    let cancelled = false;
    void (async () => {
      const token = await getValidAccessToken();
      if (!token || cancelled) return;
      const marked = await markUnreadNotificationsForContestAnnouncement(token, id);
      if (!cancelled && marked > 0) void refreshUnread();
    })();
    return () => {
      cancelled = true;
    };
  }, [data, id, isLoggedIn, getValidAccessToken, refreshUnread]);

  // Charge l'état suivi côté serveur dès qu'on connaît l'établissement.
  // En cas d'utilisateur déconnecté, on laisse `currentFollow = null` :
  // le bouton tap déclenchera une redirection vers le login.
  useEffect(() => {
    let cancelled = false;
    const eid = data?.establishment?.id ?? 0;
    if (!isLoggedIn || !Number.isFinite(eid) || eid <= 0) {
      setCurrentFollow(null);
      setFollowStateLoading(false);
      return;
    }
    setFollowStateLoading(true);
    void (async () => {
      const token = await getValidAccessToken();
      if (!token || cancelled) {
        if (!cancelled) setFollowStateLoading(false);
        return;
      }
      const state = await fetchFollowStateByEstablishment(token, eid);
      if (!cancelled) {
        setCurrentFollow(state.follow);
        setFollowStateLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [data?.establishment?.id, getValidAccessToken, isLoggedIn]);

  useEffect(() => {
    qnaScrollDoneRef.current = false;
  }, [id, qnaScrollRequested]);

  useEffect(() => {
    if (!qnaScrollRequested || qnaScrollDoneRef.current || loading || !data) return;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const interactionTask = InteractionManager.runAfterInteractions(() => {
      timeoutId = setTimeout(() => {
        qnaScrollDoneRef.current = true;
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 420);
    });
    return () => {
      interactionTask.cancel?.();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [qnaScrollRequested, loading, data, id]);

  const onToggleFollowEst = useCallback(async () => {
    const eid = data?.establishment?.id ?? 0;
    if (!Number.isFinite(eid) || eid <= 0) return;
    if (!isLoggedIn) {
      router.push('/login' as never);
      return;
    }
    const token = await getValidAccessToken();
    if (!token) return;

    if (isFollowingEst) {
      Alert.alert(
        t('followSchoolUnfollowConfirmTitle'),
        t('followSchoolUnfollowConfirmMsg'),
        [
          { text: t('inscCancel'), style: 'cancel' },
          {
            text: t('inscDelete'),
            style: 'destructive',
            onPress: async () => {
              setFollowBusy(true);
              const ok = await deleteEstablishmentFollowByEstablishment(token, eid);
              setFollowBusy(false);
              if (ok) setCurrentFollow(null);
            },
          },
        ],
      );
      return;
    }

    setFollowBusy(true);
    const { follow } = await upsertEstablishmentFollow(token, {
      establishmentId: eid,
    });
    setFollowBusy(false);
    if (follow) setCurrentFollow(follow);
  }, [
    data?.establishment?.id,
    getValidAccessToken,
    isFollowingEst,
    isLoggedIn,
    router,
    t,
  ]);

  /**
   * Confirmation du sheet de statut. Deux cas :
   *   1. L'utilisateur ne suit pas encore l'école ⇒ on crée le suivi avec
   *      le `statusId` choisi (le backend pose ce statut s'il est
   *      autorisé par l'union des annonces, sinon il retombera sur
   *      `interested` — ce qui n'arrive pas en pratique car le statut
   *      vient de l'annonce courante, donc déjà autorisé).
   *   2. L'utilisateur suit déjà ⇒ `updateFollowStatus` direct.
   */
  const onConfirmStatus = useCallback(
    async (next: CandidacyStatusType | null) => {
      const eid = data?.establishment?.id ?? 0;
      if (!Number.isFinite(eid) || eid <= 0) return;
      if (!isLoggedIn) {
        router.push('/login' as never);
        return;
      }
      setStatusBusy(true);
      try {
        const token = await getValidAccessToken();
        if (!token) return;

        if (!currentFollow) {
          const { follow } = await upsertEstablishmentFollow(token, {
            contestAnnouncementId: data?.id,
            establishmentId: eid,
            statusId: next?.id ?? null,
          });
          if (follow) {
            // Si on vient de créer le follow et qu'on voulait un statut
            // précis, on s'assure qu'il est bien posé (le backend ne pose
            // le `statusId` qu'à la création — couvert ici — mais on
            // re-PATCH par sécurité si la valeur n'est pas la bonne).
            if (next?.id != null && follow.status?.id !== next.id) {
              const updated = await updateFollowStatus(token, follow.id, next.id);
              setCurrentFollow(updated ?? follow);
            } else {
              setCurrentFollow(follow);
            }
          }
        } else {
          const updated = await updateFollowStatus(
            token,
            currentFollow.id,
            next?.id ?? null,
          );
          if (updated) setCurrentFollow(updated);
        }
      } finally {
        setStatusBusy(false);
        setStatusSheetOpen(false);
      }
    },
    [currentFollow, data?.establishment?.id, data?.id, getValidAccessToken, isLoggedIn, router],
  );

  /** Ouvre la sheet (avec garde sur login + statuts dispo). */
  const onPressUpdateStatus = useCallback(() => {
    if (!isLoggedIn) {
      router.push('/login' as never);
      return;
    }
    if (!data?.availableStatuses?.length) return;
    setStatusSheetOpen(true);
  }, [data?.availableStatuses?.length, isLoggedIn, router]);

  /**
   * Navigation vers la fiche école associée à l'annonce. Trace un clic
   * « detail » sur l'établissement (équivalent d'un click depuis listing
   * mais avec un point de départ différent — annonce vs liste écoles).
   */
  const onPressViewEstablishment = useCallback(() => {
    const est = data?.establishment;
    if (!est?.id) return;
    fireAndForget(recordEstablishmentClick(est.id, 'detail'));
    router.push(`/etablissements/${est.id}/${est.slug ?? ''}` as never);
  }, [data?.establishment, router]);

  const onPressOpenLink = useCallback(() => {
    if (!data?.registrationUrl) return;
    fireAndForget(recordContestClick(data.id, 'detail'));
    void Linking.openURL(data.registrationUrl).catch(() =>
      Alert.alert('Erreur', "Impossible d'ouvrir le lien."),
    );
  }, [data]);

  /* ───────── Render ───────── */

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.center, { paddingTop: insets.top + spacing.xl }]}>
          <ActivityIndicator size="large" color={brand.primary} />
          <Text style={styles.loadingTxt}>{t('inscDetailLoading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.center, { paddingTop: insets.top + spacing.xl }]}>
          <FontAwesome name="exclamation-triangle" size={32} color={brand.textMuted} />
          <Text style={styles.errorTxt}>{error ?? t('inscDetailNotFound')}</Text>
          <Pressable
            onPress={() => void load()}
            style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.85 }]}
          >
            <FontAwesome name="refresh" size={12} color={brand.primary} />
            <Text style={styles.retryBtnTxt}>{t('inscDetailRetry')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const est = data.establishment;
  const estName = pickEstablishmentName(est, locale);
  const title = pickAnnouncementTitle(data, locale) || data.title;
  const descriptionHtml =
    pickAnnouncementDescriptionHtml(
      { descriptionHtml: data.description, descriptionHtmlAr: data.descriptionAr },
      locale,
    ) || data.description;

  const villes = (est.villes ?? []).filter(Boolean);
  const villeMain = est.ville?.trim() || '';
  const villesShort = villes.length > 0 ? villes.join(' · ') : villeMain;

  const logoUri =
    getEstablishmentLogoUrl(est.logo) ?? fallbackEstablishmentAvatarName(est.nom, est.sigle);

  const deadline = formatDaysUntilClose(data.daysUntilClose, locale);
  const noEligibility =
    data.filieresAcceptees.length === 0 &&
    data.specialitesBacMissionAcceptees.length === 0 &&
    data.anneesBacAcceptees.length === 0;
  const eligibility = evaluateEligibility(
    {
      filieresAcceptees: data.filieresAcceptees,
      specialitesBacMissionAcceptees: data.specialitesBacMissionAcceptees,
      anneesBacAcceptees: data.anneesBacAcceptees,
    },
    eligibilityProfile,
  );

  const fee =
    data.preRegistrationFee != null && Number(data.preRegistrationFee) > 0
      ? `${Number(data.preRegistrationFee).toLocaleString('fr-FR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })} Dhs`
      : null;

  const siblingBlocks = splitSiblingsAroundCurrent(
    { id: data.id, dateOuverture: data.dateStart },
    data.autresAnnoncesMemeEtablissement ?? [],
  );
  const hasSiblingHistory =
    siblingBlocks.newer.length > 0 || siblingBlocks.older.length > 0;

  const siblingStatusLabel = (s: { isOpen: boolean; isExpire: boolean }) => {
    if (s.isOpen) return t('inscOpen');
    if (s.isExpire) return t('inscClosed');
    return t('inscDetailSiblingUpcoming');
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      {/* ── Top bar ── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }, isRTL && styles.rowRtl]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.8 }]}
          accessibilityLabel="Back"
        >
          <FontAwesome
            name={isRTL ? 'chevron-right' : 'chevron-left'}
            size={16}
            color={brand.white}
          />
        </Pressable>
        <Text style={[styles.topBarTitle, isRTL && styles.rtl]} numberOfLines={1}>
          {data.announcementType || data.type}
        </Text>
        <ShareIconButton
          color={brand.white}
          style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}
          onPress={() => {
            const thumb =
              data.ogImage && /^https?:\/\//i.test(data.ogImage.trim())
                ? data.ogImage.trim()
                : /^https?:\/\//i.test(logoUri)
                  ? logoUri
                  : undefined;
            presentShare(
              sharePayloadContestAnnouncementDetail({
                id: data.id,
                announcementTitle: title,
                establishmentName: estName,
                subtitle: villesShort || undefined,
                thumbUrl: thumb,
              }),
            );
          }}
        />
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
            accessibilityRole="tab"
            accessibilityState={{ selected: locale === 'fr' }}
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
            accessibilityRole="tab"
            accessibilityState={{ selected: locale === 'ar' }}
          >
            <Text style={[styles.langPillTxt, locale === 'ar' && styles.langPillTxtActive]}>
              {t('langAr')}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + spacing.section + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      >
        {/* ── Hero (cover ou bandeau couleur de marque) ── */}
        {data.ogImage ? (
          <Image source={{ uri: data.ogImage }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={[styles.cover, styles.coverFallback]}>
            <FontAwesome name="bullhorn" size={48} color={brand.white} />
          </View>
        )}

        {/* ── Header card (logo + identité école) ── */}
        <View style={[styles.headerCard, isRTL && styles.rowRtl]}>
          <Image
            source={{ uri: logoUri }}
            style={styles.estLogo}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.estName, isRTL && styles.rtl]} numberOfLines={3}>
              {estName}
            </Text>
            <View style={[styles.estMetaRow, isRTL && styles.rowRtl]}>
              {est.sigle ? (
                <View style={styles.siglePill}>
                  <Text style={styles.siglePillTxt}>{est.sigle}</Text>
                </View>
              ) : null}
              {est.type ? <EstablishmentTypeBadge type={est.type} size="xs" /> : null}
            </View>
            {villesShort ? (
              <View style={[styles.villeRow, isRTL && styles.rowRtl]}>
                <FontAwesome name="map-marker" size={11} color={brand.textMuted} />
                <Text style={[styles.villeTxt, isRTL && styles.rtl]} numberOfLines={2}>
                  {villesShort}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── Actions école : voir la fiche / suivre l'école ── */}
        {est?.id ? (
          <View style={[styles.estActionsRow, isRTL && styles.rowRtl]}>
            <Pressable
              onPress={onPressViewEstablishment}
              style={({ pressed }) => [
                styles.estActionBtn,
                styles.estActionBtnSecondary,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="link"
            >
              <FontAwesome name="university" size={12} color={brand.primary} />
              <Text style={styles.estActionTxtSecondary} numberOfLines={1}>
                {t('followedSchoolViewSchool')}
              </Text>
            </Pressable>
            <Pressable
              onPress={onToggleFollowEst}
              disabled={followBusy || followStateLoading}
              style={({ pressed }) => [
                styles.estActionBtn,
                isFollowingEst ? styles.estActionBtnFollowing : styles.estActionBtnFollow,
                pressed && { opacity: 0.85 },
                (followBusy || followStateLoading) && { opacity: 0.7 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={
                followStateLoading ? t('inscLoading') : isFollowingEst ? t('followSchoolUnfollowBtn') : t('followSchoolBtn')
              }
            >
              {followBusy || followStateLoading ? (
                <ActivityIndicator size="small" color={isFollowingEst ? brand.primary : brand.white} />
              ) : (
                <FontAwesome
                  name={isFollowingEst ? 'heart' : 'heart-o'}
                  size={12}
                  color={isFollowingEst ? brand.primary : brand.white}
                />
              )}
              <Text
                style={[
                  styles.estActionTxt,
                  isFollowingEst && styles.estActionTxtFollowing,
                ]}
                numberOfLines={1}
              >
                {isFollowingEst ? t('followSchoolUnfollowBtn') : t('followSchoolBtn')}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* ── Title + countdown ── */}
        <View style={[styles.titleBlock, isRTL && styles.titleBlockRtl]}>
          <AnnouncementTypeChip
            type={data.announcementType}
            variant="pill"
            size="sm"
            isRTL={isRTL}
          />
          <Text style={[styles.title, isRTL && styles.rtl]}>{title}</Text>
          {deadline.label ? (
            <View
              style={[
                styles.countdown,
                isRTL && styles.rowRtl,
                deadline.kind === 'closed' && styles.countdownClosed,
                deadline.kind === 'today' && styles.countdownToday,
                deadline.kind === 'soon' && styles.countdownSoon,
                deadline.kind === 'normal' && styles.countdownOpen,
              ]}
            >
              <FontAwesome
                name={deadline.kind === 'closed' ? 'lock' : 'hourglass-half'}
                size={12}
                color={
                  deadline.kind === 'closed'
                    ? '#B91C1C'
                    : deadline.kind === 'today'
                      ? '#B45309'
                      : deadline.kind === 'soon'
                        ? '#9A3412'
                        : '#15803D'
                }
              />
              <Text
                style={[
                  styles.countdownTxt,
                  deadline.kind === 'closed' && { color: '#B91C1C' },
                  deadline.kind === 'today' && { color: '#B45309' },
                  deadline.kind === 'soon' && { color: '#9A3412' },
                  deadline.kind === 'normal' && { color: '#15803D' },
                ]}
              >
                {deadline.label}
              </Text>
            </View>
          ) : null}
          {!noEligibility ? (
            <View style={[styles.heroEligibilityRow, isRTL && styles.rowRtl]}>
              {isLoggedIn && eligibilityProfileLoading ? (
                <View style={styles.heroEligibilityLoading}>
                  <ActivityIndicator size="small" color={brand.primary} />
                </View>
              ) : (
                <EligibilityBadge result={eligibility} size="sm" />
              )}
            </View>
          ) : null}
        </View>

        {/* ── Statut de candidature (école) ──
           Affiché uniquement si l'admin a autorisé au moins un statut sur
           cette annonce. Le statut affiché est celui de l'EstablishmentFollow
           (porté par l'école), et la mise à jour passe par les statuts
           autorisés ici, **avec auto-follow** si l'utilisateur ne suivait
           pas encore l'école. */}
        {data.availableStatuses.length > 0 ? (
          <View style={styles.candidacyStatusBlock}>
            <View style={[styles.candidacyStatusRow, isRTL && styles.rowRtl]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.candidacyStatusEyebrow, isRTL && styles.rtl]}>
                  {t('inscStatusBlockTitle')}
                </Text>
                <View style={[styles.candidacyStatusBadgeRow, isRTL && styles.rowRtl]}>
                  {followStateLoading ? (
                    <ActivityIndicator size="small" color={brand.primary} />
                  ) : (
                    <StatusBadge status={currentFollow?.status ?? null} size="sm" />
                  )}
                </View>
              </View>
              <Pressable
                onPress={onPressUpdateStatus}
                disabled={statusBusy || followStateLoading}
                style={({ pressed }) => [
                  styles.candidacyStatusBtn,
                  pressed && { opacity: 0.85 },
                  (statusBusy || followStateLoading) && { opacity: 0.6 },
                ]}
              >
                {statusBusy ? (
                  <ActivityIndicator size="small" color={brand.white} />
                ) : (
                  <FontAwesome name="pencil" size={12} color={brand.white} />
                )}
                <Text style={styles.candidacyStatusBtnTxt} numberOfLines={1}>
                  {currentFollow?.status
                    ? t('inscStatusActionUpdate')
                    : t('inscStatusActionTitle')}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* ── Dates clés ── */}
        <Section title={t('inscDetailKeyDates')} icon="calendar" rtl={isRTL}>
          <View style={[styles.datesRow, isRTL && styles.rowRtl]}>
            <View style={[styles.datePill, isRTL && styles.rowRtl]}>
              <FontAwesome name="play-circle" size={11} color={brand.success} />
              <Text style={styles.datePillTxt}>
                {t('inscDateOpens')}: {formatShortDate(data.dateStart, locale)}
              </Text>
            </View>
            <View style={[styles.datePill, isRTL && styles.rowRtl]}>
              <FontAwesome name="stop-circle" size={11} color={brand.textMuted} />
              <Text style={styles.datePillTxt}>
                {t('inscDateCloses')}: {formatShortDate(data.dateEnd, locale)}
              </Text>
            </View>
          </View>
        </Section>

        <AppBannerSlot zone="mid_square" analyticsPage="/mobile/inscriptions/annonce/detail" style={{ marginHorizontal: spacing.md }} />

        {/* ── Frais ── */}
        {(fee || data.preRegistrationFee === '0') ? (
          <Section title={t('inscDetailFees')} icon="money" rtl={isRTL}>
            <Text style={[styles.feeTxt, isRTL && styles.rtl]}>
              {fee ?? t('inscDetailFreeRegistration')}
            </Text>
          </Section>
        ) : null}

        {/* ── Tutoriel vidéo (YouTube) ── */}
        {data.inscriptionTutorialYoutubeUrl &&
        parseYoutubeVideoId(data.inscriptionTutorialYoutubeUrl) ? (
          <Section title={t('inscDetailTutorialTitle')} icon="video-camera" rtl={isRTL}>
            <ContestYoutubeTutorial
              youtubeUrl={data.inscriptionTutorialYoutubeUrl}
              title={t('inscDetailTutorialTitle')}
              playbackErrorLabel={t('inscDetailTutorialPlaybackError')}
              retryLabel={t('inscDetailTutorialRetry')}
              rtl={isRTL}
              showHeading={false}
            />
          </Section>
        ) : null}

        {/* ── Description ── */}
        <Section title={t('inscDetailAnnouncementDescription')} icon="info-circle" rtl={isRTL}>
          {data.descriptionLeadImage ? (
            <Image
              source={{ uri: data.descriptionLeadImage }}
              style={styles.leadImage}
              resizeMode="cover"
            />
          ) : null}
          <EstablishmentDescriptionHtml
            description={descriptionHtml}
            emptyLabel={t('inscDetailAnnouncementDescription')}
          />
        </Section>

        {/* ── Eligibilité ── */}
        <Section title={t('inscDetailEligibility')} icon="users" rtl={isRTL}>
          {noEligibility ? (
            <Text style={[styles.muted, isRTL && styles.rtl]}>
              {t('inscDetailNoEligibilityCriteria')}
            </Text>
          ) : isLoggedIn && eligibilityProfileLoading ? (
            <View style={styles.eligibilitySectionLoading}>
              <ActivityIndicator color={brand.primary} />
            </View>
          ) : (
            <EligibilitySummary
              result={eligibility}
              onCompleteProfile={() => router.push('/account-setup' as never)}
              onLogin={() => router.push('/login' as never)}
            />
          )}
        </Section>

        {/* ── Liens utiles ── */}
        {data.liensUtiles.length > 0 ? (
          <Section title={t('inscDetailUsefulLinks')} icon="link" rtl={isRTL}>
            <View style={[styles.linksWrap, isRTL && styles.rowRtl]}>
              {data.liensUtiles.map((l, i) => (
                <Pressable
                  key={`${l.url}-${i}`}
                  onPress={() => {
                    void Linking.openURL(l.url).catch(() => undefined);
                  }}
                  style={({ pressed }) => [
                    styles.linkChip,
                    isRTL && styles.rowRtl,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <FontAwesome name="external-link" size={11} color={brand.primary} />
                  <Text style={[styles.linkChipTxt, isRTL && styles.rtl]} numberOfLines={1}>
                    {l.titre || l.url}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Section>
        ) : null}

        {/* ── Autres annonces (même établissement) : plus récentes / plus anciennes ── */}
        {hasSiblingHistory ? (
          <Section title={t('inscDetailSiblingHistoryTitle')} icon="history" rtl={isRTL}>
            <Text style={[styles.siblingHint, isRTL && styles.rtl]}>{t('inscDetailSiblingHistoryHint')}</Text>
            {siblingBlocks.newer.length > 0 ? (
              <View style={{ gap: spacing.xs }}>
                <Text style={[styles.siblingSubheading, isRTL && styles.rtl]}>
                  {t('inscDetailSiblingsNewer')}
                </Text>
                {siblingBlocks.newer.map((s) => (
                  <Pressable
                    key={s.id}
                    onPress={() => router.push(`/inscriptions/${s.id}` as never)}
                    style={({ pressed }) => [
                      styles.siblingRow,
                      isRTL && styles.rowRtl,
                      pressed && { opacity: 0.88 },
                    ]}
                  >
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={[styles.siblingRowTitle, isRTL && styles.rtl]} numberOfLines={3}>
                        {pickAnnouncementTitle(
                          { title: s.titreSpecial, titleAr: s.titreSpecialAr ?? null },
                          locale,
                        )}
                      </Text>
                      <Text style={[styles.siblingRowMeta, isRTL && styles.rtl]} numberOfLines={2}>
                        {formatShortDate(s.dateDebut, locale)} → {formatShortDate(s.dateFin, locale)} ·{' '}
                        {siblingStatusLabel(s)} · {s.typeAnnonce}
                      </Text>
                    </View>
                    <FontAwesome
                      name={isRTL ? 'chevron-left' : 'chevron-right'}
                      size={12}
                      color={brand.textMuted}
                    />
                  </Pressable>
                ))}
              </View>
            ) : null}
            {siblingBlocks.older.length > 0 ? (
              <View style={{ gap: spacing.xs, marginTop: siblingBlocks.newer.length > 0 ? spacing.md : 0 }}>
                <Text style={[styles.siblingSubheading, isRTL && styles.rtl]}>
                  {t('inscDetailSiblingsOlder')}
                </Text>
                {siblingBlocks.older.map((s) => (
                  <Pressable
                    key={s.id}
                    onPress={() => router.push(`/inscriptions/${s.id}` as never)}
                    style={({ pressed }) => [
                      styles.siblingRow,
                      isRTL && styles.rowRtl,
                      pressed && { opacity: 0.88 },
                    ]}
                  >
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={[styles.siblingRowTitle, isRTL && styles.rtl]} numberOfLines={3}>
                        {pickAnnouncementTitle(
                          { title: s.titreSpecial, titleAr: s.titreSpecialAr ?? null },
                          locale,
                        )}
                      </Text>
                      <Text style={[styles.siblingRowMeta, isRTL && styles.rtl]} numberOfLines={2}>
                        {formatShortDate(s.dateDebut, locale)} → {formatShortDate(s.dateFin, locale)} ·{' '}
                        {siblingStatusLabel(s)} · {s.typeAnnonce}
                      </Text>
                    </View>
                    <FontAwesome
                      name={isRTL ? 'chevron-left' : 'chevron-right'}
                      size={12}
                      color={brand.textMuted}
                    />
                  </Pressable>
                ))}
              </View>
            ) : null}
          </Section>
        ) : null}

        {/* ── Documents utiles (aperçu in-app + téléchargement) ── */}
        {data.documentsUtiles.length > 0 ? (
          <Section title={t('inscDetailDocuments')} icon="file-text-o" rtl={isRTL}>
            <View style={{ gap: spacing.sm }}>
              {data.documentsUtiles.map((d, i) => (
                <DocumentRow
                  key={`${d.url}-${i}`}
                  url={d.url}
                  title={d.titre || d.url}
                  rtl={isRTL}
                  viewLabel={t('inscDetailDocumentView')}
                  downloadLabel={t('inscDetailDocumentDownload')}
                  downloadingLabel={t('inscDetailDocumentDownloading')}
                  errorTitle={t('inscDetailDocumentDownloadErrorTitle')}
                  errorMsg={t('inscDetailDocumentDownloadErrorMsg')}
                  sharingUnavailableTitle={t('inscDetailDocumentSharingUnavailableTitle')}
                  sharingUnavailableMsg={t('inscDetailDocumentSharingUnavailableMsg')}
                />
              ))}
            </View>
          </Section>
        ) : null}

        {id > 0 ? (
          <CommunityQnaSection
            contextType="contest_announcement"
            contextId={id}
            highlightQuestionId={highlightQuestionId}
            scrollParentRef={scrollRef}
          />
        ) : null}
      </ScrollView>

      {/* ── Footer sticky : Ouvrir le lien d'inscription ── */}
      {data.registrationUrl ? (
        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + 12 },
            Platform.OS === 'android' && { elevation: 8 },
          ]}
        >
          <Pressable
            onPress={onPressOpenLink}
            style={({ pressed }) => [styles.cta, isRTL && styles.rowRtl, pressed && { opacity: 0.9 }]}
          >
            <FontAwesome name="external-link" size={14} color={brand.white} />
            <Text style={styles.ctaTxt} numberOfLines={1}>
              {pickRegistrationUrlLabel(
                data.registrationUrlLabel,
                data.announcementType || data.type,
                t,
              )}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {/* Sheet de mise à jour du statut. On affiche UNIQUEMENT les
          statuts débloqués par l'annonce (`showUnavailable={false}`) :
          les statuts d'autres annonces de la même école n'ont pas leur
          place ici, ils risqueraient de laisser croire qu'ils sont
          actionnables depuis cette annonce. Si l'utilisateur n'est pas
          encore suiveur de l'école, le suivi est créé à la confirmation
          avec le statut choisi. */}
      {data.availableStatuses.length > 0 ? (
        <StatusUpdateSheet
          visible={statusSheetOpen}
          currentStatus={currentFollow?.status ?? null}
          availableStatuses={data.availableStatuses}
          showUnavailable={false}
          onClose={() => setStatusSheetOpen(false)}
          onConfirm={onConfirmStatus}
        />
      ) : null}
    </View>
  );
}

/* ───────────────────────── Helpers UI ───────────────────────── */

function Section({
  title,
  icon,
  rtl,
  children,
}: {
  title: string;
  icon?: React.ComponentProps<typeof FontAwesome>['name'];
  rtl: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={[styles.sectionHeader, rtl && styles.rowRtl]}>
        {icon ? <FontAwesome name={icon} size={14} color={brand.primary} /> : null}
        <Text style={[styles.sectionTitle, rtl && styles.rtl]}>{title}</Text>
      </View>
      <View style={{ gap: spacing.sm }}>{children}</View>
    </View>
  );
}

/**
 * Ligne « Document utile » : icône + titre, plus deux actions :
 *   - Aperçu  → ouvre le document dans un navigateur in-app
 *               (Safari View / Chrome Custom Tab) capable de prévisualiser
 *               PDF et images directement par-dessus l'application.
 *   - Télécharger → télécharge le fichier dans le cache puis ouvre la
 *                   feuille de partage native pour permettre la sauvegarde
 *                   dans Files / Drive ou son ouverture dans une autre app.
 *
 * Pendant le téléchargement, le bouton affiche un spinner et le label
 * « Téléchargement… ». En cas d'erreur, un Alert localisé est présenté.
 */
function DocumentRow({
  url,
  title,
  rtl,
  viewLabel,
  downloadLabel,
  downloadingLabel,
  errorTitle,
  errorMsg,
  sharingUnavailableTitle,
  sharingUnavailableMsg,
}: {
  url: string;
  title: string;
  rtl: boolean;
  viewLabel: string;
  downloadLabel: string;
  downloadingLabel: string;
  errorTitle: string;
  errorMsg: string;
  sharingUnavailableTitle: string;
  sharingUnavailableMsg: string;
}) {
  const [downloading, setDownloading] = useState(false);
  const icon = pickDocumentIcon(url);

  const onView = useCallback(async () => {
    const ok = await viewDocument(url);
    if (!ok) {
      // Fallback ultime : ouvrir le navigateur système.
      void Linking.openURL(url).catch(() => undefined);
    }
  }, [url]);

  const onDownload = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    const result = await downloadDocument(url, title);
    setDownloading(false);
    if (!result.ok) {
      if (result.reason === 'sharing-unavailable') {
        Alert.alert(sharingUnavailableTitle, sharingUnavailableMsg);
      } else {
        Alert.alert(errorTitle, errorMsg);
      }
    }
  }, [
    downloading,
    url,
    title,
    sharingUnavailableTitle,
    sharingUnavailableMsg,
    errorTitle,
    errorMsg,
  ]);

  return (
    <View style={styles.docCard}>
      {/* Bandeau titre — appui = aperçu in-app. */}
      <Pressable
        onPress={onView}
        style={({ pressed }) => [
          styles.docHeader,
          rtl && styles.rowRtl,
          pressed && { opacity: 0.85 },
        ]}
        accessibilityLabel={`${viewLabel} · ${title}`}
        accessibilityRole="button"
      >
        <View style={styles.docIconWrap}>
          <FontAwesome name={icon} size={20} color={brand.primary} />
        </View>
        <Text style={[styles.docTitle, rtl && styles.rtl]} numberOfLines={3}>
          {title}
        </Text>
      </Pressable>

      <View style={[styles.docActions, rtl && styles.rowRtl]}>
        <Pressable
          onPress={onView}
          disabled={downloading}
          style={({ pressed }) => [
            styles.docActionGhost,
            rtl && styles.rowRtl,
            pressed && { opacity: 0.85 },
            downloading && { opacity: 0.5 },
          ]}
        >
          <FontAwesome name="eye" size={12} color={brand.primary} />
          <Text style={styles.docActionGhostTxt}>{viewLabel}</Text>
        </Pressable>
        <Pressable
          onPress={onDownload}
          disabled={downloading}
          accessibilityState={{ busy: downloading, disabled: downloading }}
          style={({ pressed }) => [
            styles.docActionPrimary,
            rtl && styles.rowRtl,
            pressed && !downloading && { opacity: 0.9 },
            downloading && { opacity: 0.85 },
          ]}
        >
          {downloading ? (
            <ActivityIndicator size="small" color={brand.white} />
          ) : (
            <FontAwesome name="download" size={12} color={brand.white} />
          )}
          <Text style={styles.docActionPrimaryTxt} numberOfLines={1}>
            {downloading ? downloadingLabel : downloadLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ───────────────────────── Styles ───────────────────────── */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.backgroundSoft },
  scroll: { paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  loadingTxt: { color: brand.textMuted, fontSize: fontSize.sm },
  errorTxt: { color: brand.text, fontSize: fontSize.md, fontWeight: '700', textAlign: 'center' },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.primary,
  },
  retryBtnTxt: { color: brand.primary, fontWeight: '700', fontSize: fontSize.sm },

  /* Top bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: brand.primary,
    gap: spacing.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  topBarTitle: { color: brand.white, fontWeight: '800', fontSize: fontSize.md, flex: 1, textAlign: 'center' },

  /* Lang switcher (FR / AR) */
  langSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radius.full,
    padding: 3,
  },
  langPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  langPillActive: { backgroundColor: brand.white },
  langPillTxt: { color: brand.white, fontSize: fontSize.xs, fontWeight: '700' },
  langPillTxtActive: { color: brand.primary },

  /* Cover */
  cover: { width: '100%', height: 170, backgroundColor: brand.borderLight },
  coverFallback: { backgroundColor: brand.primary, alignItems: 'center', justifyContent: 'center' },

  /* Header card */
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: brand.white,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: -32,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  estLogo: {
    width: 54,
    height: 54,
    borderRadius: radius.sm,
    backgroundColor: brand.borderLight,
  },
  estName: { fontWeight: '800', color: brand.text, fontSize: fontSize.md, lineHeight: 19 },
  estMetaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 4 },
  siglePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: 'rgba(51,62,143,0.10)',
    borderRadius: radius.sm,
  },
  siglePillTxt: { color: brand.primary, fontWeight: '800', fontSize: fontSize.xs, letterSpacing: 0.4 },
  villeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  villeTxt: { color: brand.textSecondary, fontSize: fontSize.xs, fontWeight: '600', flex: 1 },

  /* Actions « école » sous le header card */
  estActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  estActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  estActionBtnSecondary: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  estActionBtnFollow: {
    backgroundColor: brand.primary,
  },
  estActionBtnFollowing: {
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: brand.primary,
  },
  estActionTxt: {
    color: brand.white,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  estActionTxtFollowing: {
    color: brand.primary,
  },
  estActionTxtSecondary: {
    color: brand.primary,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },

  /* Title block */
  titleBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  titleBlockRtl: { alignItems: 'flex-end' },
  heroEligibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  heroEligibilityLoading: {
    minHeight: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
  },
  title: { color: brand.text, fontSize: fontSize.xl, fontWeight: '800', lineHeight: 28 },

  /* Bloc « Statut de candidature » sous le titre */
  candidacyStatusBlock: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  candidacyStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  candidacyStatusEyebrow: {
    color: brand.textMuted,
    fontWeight: '700',
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  candidacyStatusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  candidacyStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radius.full,
    backgroundColor: brand.primary,
  },
  candidacyStatusBtnTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.xs },

  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(51,62,143,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  countdownTxt: { fontWeight: '800', fontSize: fontSize.xs },
  countdownOpen: { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' },
  countdownSoon: { backgroundColor: '#FFEDD5', borderColor: '#FED7AA' },
  countdownToday: { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
  countdownClosed: { backgroundColor: '#FEE2E2', borderColor: '#FECACA' },

  /* Section */
  section: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { color: brand.text, fontSize: fontSize.md, fontWeight: '800' },

  siblingHint: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: brand.textMuted,
    lineHeight: 16,
    marginBottom: spacing.xs,
  },
  siblingSubheading: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: brand.primary,
    marginBottom: 4,
  },
  siblingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    backgroundColor: '#FAFBFC',
  },
  siblingRowTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.text,
    lineHeight: 18,
  },
  siblingRowMeta: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '600',
    color: brand.textMuted,
  },

  /* Dates */
  datesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: brand.borderLight,
  },
  datePillTxt: { fontSize: fontSize.xs, color: brand.text, fontWeight: '600' },

  /* Frais */
  feeTxt: { color: brand.text, fontSize: fontSize.md, fontWeight: '700' },

  /* Description */
  leadImage: { width: '100%', height: 160, borderRadius: radius.md, backgroundColor: brand.borderLight },

  /* Eligibility section */
  muted: { color: brand.textMuted, fontSize: fontSize.sm, lineHeight: 20 },
  eligibilitySectionLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Links */
  linksWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  linkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(51,62,143,0.25)',
    backgroundColor: 'rgba(51,62,143,0.06)',
    maxWidth: 240,
  },
  linkChipTxt: { color: brand.primary, fontSize: fontSize.xs, fontWeight: '700', flexShrink: 1 },

  /* Documents */
  docCard: {
    backgroundColor: brand.backgroundSoft,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    overflow: 'hidden',
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  docIconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(51,62,143,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTitle: { flex: 1, color: brand.text, fontSize: fontSize.sm, fontWeight: '700' },
  docActions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  docActionGhost: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(51,62,143,0.30)',
    backgroundColor: brand.white,
  },
  docActionGhostTxt: { color: brand.primary, fontSize: fontSize.xs, fontWeight: '800' },
  docActionPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
  },
  docActionPrimaryTxt: { color: brand.white, fontSize: fontSize.xs, fontWeight: '800' },

  /* Sticky footer */
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: brand.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -4 },
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
  },
  ctaTxt: { color: brand.white, fontSize: fontSize.md, fontWeight: '800' },

  rtl: { textAlign: 'right', writingDirection: 'rtl' },
});
