import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Text } from '@/components/ui/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ShareIconButton } from '@/components/share/ShareIconButton';
import { AppBannerSlot } from '@/components/ads/AppBannerSlot';
import { CommunityQnaSection } from '@/components/community/CommunityQnaSection';
import { AnnouncementCard } from '@/components/inscriptions/AnnouncementCard';
import { ContestAnnouncementQnaBottomSheet } from '@/components/inscriptions/ContestAnnouncementQnaBottomSheet';
import { ContestYoutubeTutorial } from '@/components/inscriptions/ContestYoutubeTutorial';
import {
  EligibilityBadge,
  EligibilitySummary,
} from '@/components/inscriptions/EligibilityViews';
import { EstablishmentCampusSection } from '@/components/schools/EstablishmentCampusSection';
import { EstablishmentDescriptionHtml } from '@/components/schools/EstablishmentDescriptionHtml';
import { EstablishmentTypeBadge } from '@/components/ui/EstablishmentTypeBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useSharePreview } from '@/contexts/SharePreviewContext';
import { useEligibilityProfile } from '@/hooks/useEligibilityProfile';
import {
  fetchContestAnnouncementsByEstablishment,
  recordContestListingImpressionsBatch,
  type ContestAnnouncementCard,
} from '@/services/contestAnnouncements';
import {
  recordReferencingPageViewNative,
} from '@/services/referencingAds';
import {
  recordEstablishmentDetailImpressionOnce,
} from '@/services/establishmentTracking';
import {
  deleteEstablishmentFollowByEstablishment,
  fetchFollowStateByEstablishment,
  upsertEstablishmentFollow,
} from '@/services/establishmentFollows';
import { getEstablishmentFileUrl } from '@/constants/establishmentMedia';
import { getEstablishmentByIdSlug, type EstablishmentNormalized } from '@/services/establishments';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { mapCampusForDisplay } from '@/utils/campusMaps';
import { evaluateEligibility } from '@/utils/eligibility';
import { fireAndForget } from '@/utils/fireAndForget';
import { formatVillesCourtes, universityName } from '@/utils/establishmentFormat';
import { pickBrochureFromDocuments } from '@/utils/establishmentBrochure';
import { sharePayloadEstablishmentDetail } from '@/utils/sharePagePayloads';
import { parseYoutubeVideoId } from '@/utils/youtubeVideoId';

export default function EstablishmentDetailScreen() {
  const router = useRouter();
  const { isRTL, t, locale, setLocale } = useLocale();
  const { presentShare } = useSharePreview();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const { user, getValidAccessToken } = useAuth();
  const { profile: eligibilityProfile, loading: eligibilityProfileLoading } = useEligibilityProfile();
  const isLoggedIn = Boolean(user);
  const params = useLocalSearchParams<{ id?: string; slug?: string; qnaQ?: string | string[] }>();
  const id = useMemo(() => Number(params.id ?? 0), [params.id]);
  const slug = (params.slug ?? '').toString();
  const highlightQuestionId = useMemo(() => {
    const raw = params.qnaQ;
    const s = Array.isArray(raw) ? raw[0] : raw;
    const n = Number(s ?? 0);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [params.qnaQ]);
  const [data, setData] = useState<EstablishmentNormalized | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  /* Annonces publiées de cet établissement (concours, résultats, bourses…). */
  const [announcements, setAnnouncements] = useState<ContestAnnouncementCard[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementQnaSheet, setAnnouncementQnaSheet] = useState<{ id: number; title: string } | null>(null);
  const closeAnnouncementQnaSheet = useCallback(() => setAnnouncementQnaSheet(null), []);

  // Suivi école
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [followId, setFollowId] = useState<number | null>(null);
  const [followProbeDone, setFollowProbeDone] = useState(!isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) setFollowProbeDone(true);
    else setFollowProbeDone(false);
  }, [isLoggedIn, user?.id, id]);

  const refreshFollowState = useCallback(async () => {
    if (!isLoggedIn || !id) {
      setFollowProbeDone(true);
      return;
    }
    const token = await getValidAccessToken();
    if (!token) {
      setFollowProbeDone(true);
      return;
    }
    try {
      const state = await fetchFollowStateByEstablishment(token, id);
      setIsFollowing(state.isFollowing);
      setFollowId(state.follow?.id ?? null);
    } finally {
      setFollowProbeDone(true);
    }
  }, [getValidAccessToken, id, isLoggedIn]);

  useEffect(() => {
    void refreshFollowState();
  }, [refreshFollowState]);

  const onToggleFollow = useCallback(async () => {
    if (!isLoggedIn) {
      router.push('/login' as never);
      return;
    }
    if (!id) return;
    const token = await getValidAccessToken();
    if (!token) return;

    if (isFollowing) {
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
              const ok = await deleteEstablishmentFollowByEstablishment(token, id);
              setFollowBusy(false);
              if (ok) {
                setIsFollowing(false);
                setFollowId(null);
              }
            },
          },
        ],
      );
      return;
    }

    setFollowBusy(true);
    const { follow } = await upsertEstablishmentFollow(token, {
      establishmentId: id,
    });
    setFollowBusy(false);
    if (follow) {
      setIsFollowing(true);
      setFollowId(follow.id);
    }
  }, [getValidAccessToken, id, isFollowing, isLoggedIn, router, t]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    void getEstablishmentByIdSlug(id, slug)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e: unknown) => {
        const msg =
          typeof e === 'object' && e && 'message' in e
            ? String((e as unknown as { message: string }).message)
            : t('schoolsErrorNetwork');
        if (!cancelled) setErr(msg);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, slug]);

  /* Tracking analytique : impression « detail » (1 fois par session pour
     éviter de gonfler les chiffres si l'utilisateur ouvre/ferme la même
     fiche plusieurs fois). */
  const referencingPageViewSent = useRef(false);

  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) return;
    recordEstablishmentDetailImpressionOnce(id);
  }, [id]);

  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0 || referencingPageViewSent.current) return;
    referencingPageViewSent.current = true;
    fireAndForget(recordReferencingPageViewNative(id));
  }, [id]);

  /* Annonces de l'école : chargement séparé, n'attend pas le détail établissement. */
  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) return;
    let cancelled = false;
    setAnnouncementsLoading(true);
    void fetchContestAnnouncementsByEstablishment(id)
      .then((items) => {
        if (cancelled) return;
        setAnnouncements(items);
        // Tracking analytique : enregistre une impression « listing » par
        // annonce affichée sur la fiche école (dédupliqué par session).
        recordContestListingImpressionsBatch(items);
      })
      .finally(() => {
        if (!cancelled) setAnnouncementsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const campusRows = useMemo(() => mapCampusForDisplay(data?.campus), [data?.campus]);
  const uni = useMemo(() => (data ? universityName(data, { rtl: isRTL }) : ''), [data, isRTL]);
  const primaryName = useMemo(() => (data && isRTL && data.nomArabe ? data.nomArabe : data?.nom ?? ''), [data, isRTL]);
  const secondaryLine = useMemo(() => {
    if (!data) return '';
    if (isRTL && data.nomArabe) return [data.sigle, data.nom].filter(Boolean).join(' · ');
    return [data.sigle, data.nomArabe].filter(Boolean).join(' · ');
  }, [data, isRTL]);
  const desc = useMemo(() => {
    if (!data) return '';
    return (isRTL ? data.descriptionAr || data.description : data.description) || '';
  }, [data, isRTL]);

  /**
   * Évaluation locale de l'éligibilité de l'utilisateur connecté à cette
   * école : on compare son profil (filière, type de bac, spécialités, année)
   * aux critères publiés par l'école. Si l'école ne définit aucun critère,
   * `verdict === 'unknown'` ⇒ on masque la section. Si l'utilisateur n'est
   * pas connecté, `verdict === 'no_user'` ⇒ on affiche un CTA login.
   */
  const eligibility = useMemo(
    () =>
      evaluateEligibility(
        {
          filieresAcceptees: data?.filieresAcceptees ?? null,
          specialitesBacMissionAcceptees: data?.specialitesBacMissionAcceptees ?? null,
          anneesBacAcceptees: data?.anneesBacAcceptees ?? null,
        },
        eligibilityProfile,
      ),
    [data, eligibilityProfile],
  );
  /**
   * On affiche la section uniquement quand l'école a défini au moins un
   * critère (sinon il n'y a tout simplement rien à dire à l'utilisateur).
   * `unknown` = aucun critère ; `no_user` = utilisateur non connecté → on
   * affiche quand même pour proposer le login si l'école a des critères.
   */
  const showEligibilitySection =
    eligibility.verdict !== 'unknown' &&
    !!data &&
    ((data.filieresAcceptees?.length ?? 0) > 0 ||
      (data.specialitesBacMissionAcceptees?.length ?? 0) > 0 ||
      (data.anneesBacAcceptees?.length ?? 0) > 0);

  const schoolMedia = useMemo(() => {
    if (!data) {
      return {
        photoUris: [] as string[],
        videoRaw: null as string | null,
        brochureUrl: null as string | null,
      };
    }
    const rawPhotos = data.media?.photos ?? [];
    const photoUris = rawPhotos
      .map((p) => getEstablishmentFileUrl(p?.url))
      .filter((u): u is string => Boolean(u));
    const videoRaw =
      String(data.media?.videoUrl ?? data.videoUrl ?? '')
        .trim() || null;
    const brochureDoc = pickBrochureFromDocuments(data.media?.documents);
    const brochureUrl = brochureDoc?.url ? getEstablishmentFileUrl(brochureDoc.url) : null;
    return { photoUris, videoRaw, brochureUrl };
  }, [data]);

  return (
    <View style={styles.safe}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />
      {/** Bleu jusqu’aux icônes de statut (plus de bande grise comme sur la liste Écoles). */}
      <View style={[styles.headerSafe, { paddingTop: insets.top }]}>
        <View style={[styles.header, isRTL && styles.headerRtl]}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            style={styles.backBtn}
            accessibilityLabel={t('loginBack')}
          >
            <FontAwesome name={isRTL ? 'angle-right' : 'angle-left'} size={22} color={homeShell.text} />
          </Pressable>
          <Text style={[styles.headerTitle, isRTL && styles.txtRtl]} numberOfLines={1}>
            {t('estDetailTitle')}
          </Text>
          {id > 0 ? (
            <ShareIconButton
              color={homeShell.text}
              style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}
              onPress={() =>
                presentShare(
                  sharePayloadEstablishmentDetail({
                    id,
                    slug: slug || 'fiche',
                    title: data ? primaryName : t('estDetailTitle'),
                    subtitle: data ? secondaryLine || undefined : undefined,
                    thumbUrl: data?.displayLogoUrl,
                  }),
                )
              }
            />
          ) : null}
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
              <Text style={[styles.langPillTxt, locale === 'fr' && styles.langPillTxtActive]}>{t('langFr')}</Text>
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
              <Text style={[styles.langPillTxt, locale === 'ar' && styles.langPillTxtActive]}>{t('langAr')}</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.main}>
      {loading ? (
        <View style={[styles.center, { paddingBottom: insets.bottom }]}>
          <ActivityIndicator color={homeShell.green} />
        </View>
      ) : err ? (
        <View style={[styles.center, { paddingBottom: insets.bottom }]}>
          <Text style={styles.errTxt}>{err}</Text>
        </View>
      ) : !data ? (
        <View style={[styles.center, { paddingBottom: insets.bottom }]}>
          <Text style={[styles.errTxt, isRTL && styles.txtRtl]}>{t('estNotFound')}</Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: spacing.section + insets.bottom + spacing.xl }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        >
          <View style={[styles.heroCard, styles.heroFlat]}>
            <View style={styles.logoRing}>
              <Image source={{ uri: data.displayLogoUrl }} style={styles.heroLogo} resizeMode="contain" accessibilityIgnoresInvertColors />
            </View>
            <Text style={[styles.name, isRTL && styles.nameRtl]}>{primaryName}</Text>
            {secondaryLine ? <Text style={[styles.sigle, isRTL && styles.sigleRtl]}>{secondaryLine}</Text> : null}
            <View style={[styles.badgeWrap, isRTL && styles.badgeWrapRtl]}>
              <EstablishmentTypeBadge type={data.type} size="md" hideIfUnknown={false} />
              {data.accreditationEtat ? <PillSolid label={t('estBadgeStateRecognized')} tint="green" /> : null}
              {data.isRecommended ? <PillSolid label={t('estBadgeRecommended')} tint="green" /> : null}
              {data.isSponsored ? <PillSolid label={t('estBadgeSponsored')} tint="sponsor" /> : null}
              {/* Badge éligibilité personnalisé — masqué si pas de critères / pas connecté. */}
              {isLoggedIn && eligibilityProfileLoading ? (
                <View style={styles.heroEligibilityLoading}>
                  <ActivityIndicator size="small" color={brand.primary} />
                </View>
              ) : (
                <EligibilityBadge result={eligibility} size="sm" />
              )}
            </View>

            {/* Bouton Suivre / Ne plus suivre l'école (et accès rapide à la timeline si déjà suivie). */}
            <View style={[styles.followRow, isRTL && styles.flagsRowRtl]}>
              <Pressable
                onPress={onToggleFollow}
                disabled={followBusy || !followProbeDone}
                style={({ pressed }) => [
                  styles.followBtn,
                  !followProbeDone ? null : isFollowing ? styles.followBtnActive : null,
                  pressed && { opacity: 0.85 },
                  (followBusy || !followProbeDone) && { opacity: 0.6 },
                ]}
              >
                {followBusy || !followProbeDone ? (
                  <ActivityIndicator
                    size="small"
                    color={followProbeDone && isFollowing ? brand.primary : brand.white}
                  />
                ) : (
                  <>
                    <FontAwesome
                      name={isFollowing ? 'heart' : 'heart-o'}
                      size={13}
                      color={isFollowing ? brand.primary : brand.white}
                    />
                    <Text style={isFollowing ? styles.followBtnActiveTxt : styles.followBtnTxt}>
                      {isFollowing ? t('followSchoolUnfollowBtn') : t('followSchoolBtn')}
                    </Text>
                  </>
                )}
              </Pressable>
              {isFollowing && followId ? (
                <Pressable
                  onPress={() => router.push(`/inscriptions/follow/${followId}` as never)}
                  style={({ pressed }) => [styles.followLinkBtn, pressed && { opacity: 0.8 }]}
                >
                  <FontAwesome name="history" size={13} color={brand.primary} />
                  <Text style={styles.followLinkBtnTxt}>{t('followedSchoolTimelineTitle')}</Text>
                </Pressable>
              ) : null}
            </View>
            {(data.villesListe.length > 0 || !!uni) && (
              <View style={[styles.locRow, isRTL && styles.locRowRtl]}>
                <FontAwesome name="map-marker" size={14} color={homeShell.greenDark} />
                <Text style={[styles.locTxt, isRTL && styles.txtRtl]}>
                  {formatVillesCourtes(data.villesListe, 3)}
                  {data.villesListe.length && uni ? ' · ' : ''}
                  {uni}
                </Text>
              </View>
            )}
          </View>

          <Section title={t('estDetailSummary')} rtl={isRTL}>
            <Grid rtl={isRTL}>
              <Cell rtl={isRTL} icon="money" label={t('estLabelTuition')} value={data.fraisLabel} />
              <Cell rtl={isRTL} icon="clock-o" label={t('estLabelDuration')} value={data.dureeLabel || '—'} />
              <Cell
                rtl={isRTL}
                icon={data.concoursAdmission ? 'trophy' : 'folder-open-o'}
                label={t('estLabelAdmission')}
                value={data.concoursAdmission ? t('estAdmissionConcours') : t('estAdmissionDossier')}
              />
              <Cell rtl={isRTL} icon="graduation-cap" label={t('estLabelTracks')} value={filieresLine(data, isRTL)} />
              <Cell rtl={isRTL} icon="users" label={t('estLabelStudents')} value={formatNb(data.academicInfo?.nbEtudiants)} />
              <Cell rtl={isRTL} icon="certificate" label={t('estLabelYears')} value={yearsLabel(data, isRTL)} />
            </Grid>
          </Section>

          <AppBannerSlot zone="mid_square" analyticsPage="/mobile/ecoles/detail" style={{ marginHorizontal: spacing.md }} />

          <Section title={t('estDetailPresentation')} rtl={isRTL}>
            <EstablishmentDescriptionHtml description={desc} />
          </Section>

          {schoolMedia.photoUris.length > 0 ? (
            <Section
              title={`${t('estDetailMediaPhotos')} (${schoolMedia.photoUris.length})`}
              rtl={isRTL}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                  styles.photoStrip,
                  isRTL && styles.photoStripRtl,
                ]}
              >
                {schoolMedia.photoUris.map((uri, idx) => (
                  <Pressable
                    key={`${uri}-${idx}`}
                    onPress={() => void Linking.openURL(uri).catch(() => undefined)}
                  >
                    <Image
                      source={{ uri }}
                      style={styles.photoThumb}
                      resizeMode="cover"
                      accessibilityIgnoresInvertColors
                    />
                  </Pressable>
                ))}
              </ScrollView>
            </Section>
          ) : null}

          {schoolMedia.videoRaw ? (
            parseYoutubeVideoId(schoolMedia.videoRaw) ? (
              <Section title={t('estDetailMediaVideo')} rtl={isRTL}>
                <ContestYoutubeTutorial
                  youtubeUrl={schoolMedia.videoRaw}
                  title={t('estDetailMediaVideo')}
                  playbackErrorLabel={t('inscDetailTutorialPlaybackError')}
                  retryLabel={t('inscDetailTutorialRetry')}
                  rtl={isRTL}
                  showHeading={false}
                />
              </Section>
            ) : (
              <Section title={t('estDetailMediaVideo')} rtl={isRTL}>
                <Pressable
                  onPress={() => {
                    const raw = schoolMedia.videoRaw!;
                    const u = /^https?:\/\//i.test(raw)
                      ? raw
                      : getEstablishmentFileUrl(raw);
                    if (u) void Linking.openURL(u).catch(() => undefined);
                  }}
                  style={({ pressed }) => [styles.mediaOpenRow, isRTL && styles.mediaOpenRowRtl, pressed && { opacity: 0.88 }]}
                >
                  <FontAwesome name="play-circle" size={20} color={homeShell.blue} />
                  <Text style={[styles.mediaOpenTxt, isRTL && styles.txtRtl]}>{t('estDetailMediaVideoOpen')}</Text>
                </Pressable>
              </Section>
            )
          ) : null}

          {schoolMedia.brochureUrl ? (
            <Section title={t('estDetailMediaBrochure')} rtl={isRTL}>
              <Pressable
                onPress={() =>
                  void Linking.openURL(schoolMedia.brochureUrl!).catch(() => undefined)
                }
                style={({ pressed }) => [styles.mediaOpenRow, isRTL && styles.mediaOpenRowRtl, pressed && { opacity: 0.88 }]}
              >
                <FontAwesome name="file-pdf-o" size={18} color={homeShell.blue} />
                <Text style={[styles.mediaOpenTxt, isRTL && styles.txtRtl]}>
                  {t('estDetailMediaBrochureOpen')}
                </Text>
              </Pressable>
            </Section>
          ) : null}

          {/* Éligibilité personnalisée — visible uniquement si l'école a publié
              des critères (filières / spécialités / années de bac). */}
          {showEligibilitySection ? (
            <Section title={t('inscDetailEligibility')} rtl={isRTL}>
              {isLoggedIn && eligibilityProfileLoading ? (
                <View style={styles.announcementsLoading}>
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
          ) : null}

          {/* Annonces de l'école (concours, résultats, bourses…). */}
          <Section title={t('estDetailAnnouncements')} rtl={isRTL}>
            {announcementsLoading ? (
              <View style={styles.announcementsLoading}>
                <ActivityIndicator color={brand.primary} />
              </View>
            ) : announcements.length === 0 ? (
              <Text style={[styles.body, isRTL && styles.txtRtl]}>
                {t('estDetailAnnouncementsEmpty')}
              </Text>
            ) : (
              <View style={styles.announcementsList}>
                {announcements.map((a) => (
                  <AnnouncementCard
                    key={`ann-${a.id}`}
                    item={a}
                    /* Le suivi est porté par l'école entière → on reflète l'état global. */
                    isFollowed={isFollowing}
                    followStateLoading={isLoggedIn && !followProbeDone}
                    eligibilityLoading={isLoggedIn && eligibilityProfileLoading}
                    busy={followBusy}
                    onToggleFollow={onToggleFollow}
                    onOpenLink={() => {
                      if (a.registrationUrl) {
                        void Linking.openURL(a.registrationUrl).catch(() => undefined);
                      }
                    }}
                    onOpenComments={() =>
                      setAnnouncementQnaSheet({
                        id: a.id,
                        title: (isRTL && a.titleAr ? a.titleAr : a.title) || '',
                      })
                    }
                    onPress={() => router.push(`/inscriptions/${a.id}` as never)}
                  />
                ))}
              </View>
            )}
          </Section>

          {data.mergedDiplomes.length > 0 ? (
            <Section title={t('estDetailDegrees')} rtl={isRTL}>
              <Wrap rtl={isRTL}>
                {data.mergedDiplomes.map((d) => (
                  <Chip key={d} txt={d} />
                ))}
              </Wrap>
            </Section>
          ) : null}

          {secteurLines(data, isRTL).length ? (
            <Section title={t('estDetailSectors')} rtl={isRTL}>
              <Wrap rtl={isRTL}>
                {secteurLines(data, isRTL).map((s) => (
                  <Chip key={s} txt={s} />
                ))}
              </Wrap>
            </Section>
          ) : null}

          {(data.boursesDisponibles || (data.typesBourse && data.typesBourse.length)) && (
            <Section title={t('estDetailScholarships')} rtl={isRTL}>
              <Text style={[styles.body, isRTL && styles.txtRtl]}>
                {data.boursesDisponibles ? t('estScholarshipsAvailable') : '—'}
                {data.bourseMin != null || data.bourseMax != null
                  ? ` · ${fmtMaybeNum(data.bourseMin)} → ${fmtMaybeNum(data.bourseMax)} Dhs`
                  : ''}
              </Text>
              {data.typesBourse && data.typesBourse.length ? (
                <Wrap rtl={isRTL}>
                  {data.typesBourse.map((t) => (
                    <Chip key={t} txt={String(t)} />
                  ))}
                </Wrap>
              ) : null}
            </Section>
          )}

          <Section title={t('estDetailEngagements')} rtl={isRTL}>
            <View style={[styles.flagsRow, isRTL && styles.flagsRowRtl]}>
              {data.echangeInternational ? (
                <Flag rtl={isRTL} icon="globe" label={t('schoolsToggleExchangeInternational')} />
              ) : null}
              {data.eTawjihiInscription ? <Flag rtl={isRTL} icon="bolt" label={t('schoolsToggleEtawjihiOnly')} /> : null}
            </View>
          </Section>

          {campusRows.length > 0 ? (
            <Section title={`${t('estDetailCampus')} (${campusRows.length})`} rtl={isRTL}>
              <EstablishmentCampusSection rows={campusRows} />
            </Section>
          ) : null}

          {data.contact && (data.contact.telephone || data.contact.email || data.contact.siteWeb || data.contact.adresse) ? (
            <Section title={t('estDetailContact')} rtl={isRTL}>
              {data.contact.adresse ? <Text style={[styles.body, isRTL && styles.txtRtl]}>{data.contact.adresse}</Text> : null}
              {data.contact.telephone ? (
                <Text style={[styles.linkLine, isRTL && styles.linkLineRtl]}>
                  <FontAwesome name="phone" size={14} color={homeShell.blue} /> {data.contact.telephone}
                </Text>
              ) : null}
              {data.contact.email ? (
                <Text style={[styles.linkLine, isRTL && styles.linkLineRtl]}>
                  <FontAwesome name="envelope-o" size={14} color={homeShell.blue} /> {data.contact.email}
                </Text>
              ) : null}
              {data.contact.siteWeb ? (
                <Text style={[styles.linkLine, isRTL && styles.linkLineRtl]} numberOfLines={2}>
                  <FontAwesome name="link" size={14} color={homeShell.blue} /> {data.contact.siteWeb}
                </Text>
              ) : null}
            </Section>
          ) : null}

          {id > 0 ? (
            <CommunityQnaSection
              contextType="establishment"
              contextId={id}
              marginHorizontal={spacing.xl}
              highlightQuestionId={highlightQuestionId}
              scrollParentRef={scrollRef}
              composerLayout="instagram"
              instagramAnchoredDock
            />
          ) : null}
        </ScrollView>
      )}
      </View>

      <ContestAnnouncementQnaBottomSheet
        visible={announcementQnaSheet !== null}
        announcementId={announcementQnaSheet?.id ?? 0}
        announcementTitle={announcementQnaSheet?.title ?? ''}
        onClose={closeAnnouncementQnaSheet}
      />
    </View>
  );
}

function filieresLine(data: EstablishmentNormalized, rtl: boolean): string {
  const n = data.academicInfo?.nbFilieres ?? data.nbFilieres;
  if (typeof n !== 'number' || !Number.isFinite(n)) return '—';
  if (rtl) return `${n} شعبة`;
  return `${n} filière${n > 1 ? 's' : ''}`;
}

function secteurLines(data: EstablishmentNormalized, rtl: boolean): string[] {
  const ss = Array.isArray(data.secteurs) ? data.secteurs : [];
  const out = ss.map((s) => {
    if (typeof s === 'object' && s !== null) {
      if (rtl) {
        return String(
          (s as { titreAr?: string | null }).titreAr ??
            (s as { titre?: string }).titre ??
            (s as { nom?: string }).nom ??
            '',
        );
      }
      return String((s as { titre?: string }).titre ?? (s as { nom?: string }).nom ?? '');
    }
    return '';
  });
  return out.map((x) => x.trim()).filter(Boolean);
}

function fmtMaybeNum(n: unknown): string {
  if (n === null || n === undefined || n === '') return '—';
  const x = Number(n);
  if (Number.isFinite(x)) return x.toLocaleString('fr-FR');
  return String(n);
}

function formatNb(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  return n.toLocaleString('fr-FR');
}

function yearsLabel(data: EstablishmentNormalized, rtl: boolean): string {
  const y = data.academicInfo?.anneesEtudes ?? data.anneesEtudes;
  if (typeof y === 'number' && y > 0) return rtl ? `${y} سنوات` : `${y} ans`;
  return '—';
}

function Section({ title, children, rtl }: { title: string; children: React.ReactNode; rtl?: boolean }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, rtl && styles.txtRtl]}>{title}</Text>
      {children}
    </View>
  );
}

function Grid({ children, rtl }: { children: React.ReactNode; rtl?: boolean }) {
  return <View style={[styles.grid, rtl && styles.gridRtl]}>{children}</View>;
}

function Cell({
  icon,
  label,
  value,
  rtl,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  value: string;
  rtl?: boolean;
}) {
  return (
    <View style={[styles.cell, rtl && styles.cellRtl]}>
      <FontAwesome name={icon} size={13} color={homeShell.greenDark} />
      <Text style={[styles.cellLbl, rtl && styles.txtRtl]}>{label}</Text>
      <Text style={[styles.cellVal, rtl && styles.txtRtl]} numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}

function Wrap({ children, rtl }: { children: React.ReactNode; rtl?: boolean }) {
  return <View style={[styles.wrap, rtl && styles.wrapRtl]}>{children}</View>;
}

function Chip({ txt }: { txt: string }) {
  return (
    <View style={styles.miniChip}>
      <Text style={styles.miniChipTxt}>{txt}</Text>
    </View>
  );
}

function PillSolid({ label, tint }: { label: string; tint?: 'default' | 'green' | 'sponsor' }) {
  const t = tint ?? 'default';
  const bg =
    t === 'sponsor'
      ? 'rgba(51,62,143,0.14)'
      : t === 'green'
        ? homeShell.greenAlpha18
        : 'rgba(51,62,143,0.10)';
  const fg = t === 'sponsor' ? homeShell.blueDeep : t === 'green' ? homeShell.greenDark : homeShell.blue;
  return (
    <View style={[styles.miniPill, { backgroundColor: bg }]}>
      <Text style={[styles.miniPillTxt, { color: fg }]}>{label}</Text>
    </View>
  );
}

function Flag({
  icon,
  label,
  rtl,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  rtl?: boolean;
}) {
  return (
    <View style={[styles.flag, rtl && styles.flagRtl]}>
      <FontAwesome name={icon} size={15} color={homeShell.greenDark} />
      <Text style={[styles.flagTxt, rtl && styles.txtRtl]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  headerSafe: {
    backgroundColor: homeShell.blue,
    zIndex: 10,
  },
  main: {
    flex: 1,
  },
  header: {
    backgroundColor: homeShell.blue,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerRtl: {
    flexDirection: 'row-reverse',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  headerTitle: {
    flex: 1,
    color: homeShell.text,
    fontSize: fontSize.md,
    fontWeight: '800',
    letterSpacing: -0.2,
    opacity: 0.92,
  },
  langSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full,
    padding: 3,
    marginStart: spacing.sm,
  },
  langSwitchRtl: {
    flexDirection: 'row-reverse',
    marginStart: 0,
    marginEnd: spacing.sm,
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
  txtRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errTxt: {
    color: brand.textSecondary,
    fontSize: fontSize.md,
    fontWeight: '700',
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.section,
  },
  heroCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: homeShell.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    alignItems: 'center',
  },
  heroFlat: {
    marginTop: spacing.lg,
  },
  logoRing: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: homeShell.card,
    borderWidth: 3,
    borderColor: homeShell.green,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  heroLogo: {
    width: '100%',
    height: '100%',
  },
  name: {
    color: homeShell.cardText,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  nameRtl: {
    writingDirection: 'rtl',
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: 0,
  },
  sigle: {
    marginTop: 6,
    color: homeShell.cardMuted,
    fontSize: fontSize.sm,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  sigleRtl: {
    writingDirection: 'rtl',
    textAlign: 'center',
    lineHeight: 20,
  },
  heroEligibilityLoading: {
    minHeight: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  /* Suivi école — bouton placé sous les badges. */
  followRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.md,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: brand.primary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.primary,
  },
  followBtnTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.sm },
  followBtnActive: {
    backgroundColor: 'rgba(51,62,143,0.10)',
    borderColor: brand.primary,
  },
  followBtnActiveTxt: { color: brand.primary, fontWeight: '800', fontSize: fontSize.sm },
  followLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.primary,
    backgroundColor: brand.white,
  },
  followLinkBtnTxt: { color: brand.primary, fontWeight: '700', fontSize: fontSize.sm },
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.md,
  },
  badgeWrapRtl: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
    maxWidth: '100%',
  },
  locRowRtl: {
    flexDirection: 'row-reverse',
  },
  locTxt: {
    flex: 1,
    color: homeShell.cardMuted,
    fontWeight: '600',
    fontSize: fontSize.sm,
    lineHeight: 19,
    textAlign: 'center',
  },
  section: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.xl,
    backgroundColor: homeShell.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
  },
  sectionTitle: {
    color: homeShell.blue,
    fontSize: fontSize.sm,
    fontWeight: '900',
    letterSpacing: 0.55,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  body: {
    color: homeShell.cardMuted,
    fontSize: fontSize.md,
    lineHeight: 22,
    fontWeight: '600',
  },

  /* Section "Annonces de l'école" */
  announcementsLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  announcementsList: {
    gap: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridRtl: {
    flexDirection: 'row-reverse',
  },
  cell: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    gap: 6,
    minHeight: 96,
  },
  cellRtl: {
    alignItems: 'flex-end',
  },
  cellLbl: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  cellVal: {
    fontSize: fontSize.sm + 1,
    fontWeight: '800',
    color: homeShell.cardText,
    lineHeight: 19,
    flexShrink: 1,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wrapRtl: {
    flexDirection: 'row-reverse',
  },
  miniChip: {
    backgroundColor: homeShell.greenAlpha11,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(47,206,148,0.22)',
    maxWidth: '100%',
  },
  miniChipTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: homeShell.greenDark,
  },
  miniPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  miniPillTxt: {
    fontSize: 11,
    fontWeight: '900',
  },
  flagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    alignItems: 'center',
  },
  flagsRowRtl: {
    flexDirection: 'row-reverse',
  },
  flag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
    maxWidth: '100%',
    backgroundColor: homeShell.greenAlpha11,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(47,206,148,0.18)',
  },
  flagRtl: {
    flexDirection: 'row-reverse',
  },
  flagTxt: {
    flexShrink: 1,
    color: homeShell.cardText,
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  linkLine: {
    marginTop: 8,
    color: homeShell.blue,
    fontWeight: '700',
    fontSize: fontSize.sm,
    lineHeight: 20,
    gap: 8,
    flexShrink: 1,
  },
  linkLineRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  photoStrip: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: 2,
  },
  photoStripRtl: {
    flexDirection: 'row-reverse',
  },
  photoThumb: {
    width: 200,
    height: 120,
    borderRadius: radius.lg,
    backgroundColor: '#E2E8F0',
  },
  mediaOpenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
  },
  mediaOpenRowRtl: {
    flexDirection: 'row-reverse',
  },
  mediaOpenTxt: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '800',
    color: homeShell.blue,
  },
});
