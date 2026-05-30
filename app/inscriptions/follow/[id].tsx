import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnnouncementCard } from '@/components/inscriptions/AnnouncementCard';
import { FollowedSchoolDetailLoadingSkeleton } from '@/components/inscriptions/FollowedSchoolDetailLoadingSkeleton';
import { useTawjihPlusAccessContext } from '@/contexts/TawjihPlusAccessContext';
import { StatusBadge } from '@/components/inscriptions/StatusBadge';
import { StatusUpdateSheet } from '@/components/inscriptions/StatusUpdateSheet';
import { AppRefreshControl } from '@/components/ui/AppRefreshControl';
import { EstablishmentTypeBadge } from '@/components/ui/EstablishmentTypeBadge';
import { HeroLangSwitch } from '@/components/ui/HeroLangSwitch';
import { Text } from '@/components/ui/Text';
import {
  fallbackEstablishmentAvatarName,
  getEstablishmentLogoUrl,
} from '@/constants/establishmentMedia';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import {
  deleteEstablishmentFollow,
  fetchEstablishmentFollowTimeline,
  updateFollowStatus,
} from '@/services/establishmentFollows';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { CandidacyStatusType, EstablishmentFollowTimeline } from '@/types/inscriptions';
import { formatTimeAgo, pickEstablishmentName } from '@/utils/candidacyStatus';
import { updateLatestSeenOnDisk } from '@/utils/followLatestAnnouncementSeen';

export default function FollowedSchoolDetailScreen() {
  const router = useRouter();
  const { t, locale, isRTL } = useLocale();
  const {
    isInscriptionsLocked,
    isInscriptionsAccessPending,
    openTawjihPlusProduct,
    applyServerInscriptionsAccess,
    resolveInscriptionsAccessWithoutServer,
  } = useTawjihPlusAccessContext();
  const showInscriptionsPaywall = !isInscriptionsAccessPending && isInscriptionsLocked;
  const pageLoading = loading || isInscriptionsAccessPending;
  const insets = useSafeAreaInsets();
  const { getValidAccessToken } = useAuth();
  const params = useLocalSearchParams<{ id?: string }>();
  const followId = useMemo(() => Number(params.id ?? 0), [params.id]);
  const listRef = useRef<FlatList<any>>(null);

  const [data, setData] = useState<EstablishmentFollowTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [statusSheetOpen, setStatusSheetOpen] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isFinite(followId) || followId <= 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const token = await getValidAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const result = await fetchEstablishmentFollowTimeline(token, followId);
      if (!result?.timeline?.follow) {
        setData(null);
        resolveInscriptionsAccessWithoutServer();
      } else {
        applyServerInscriptionsAccess(result.inscriptionsFullAccess);
        setData(result.timeline);
      }
    } catch {
      setData(null);
      resolveInscriptionsAccessWithoutServer();
    } finally {
      setLoading(false);
    }
  }, [
    applyServerInscriptionsAccess,
    followId,
    getValidAccessToken,
    resolveInscriptionsAccessWithoutServer,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const onConfirmStatus = useCallback(
    async (next: CandidacyStatusType | null) => {
      if (showInscriptionsPaywall) {
        openTawjihPlusProduct();
        return;
      }
      if (!data?.follow) return;
      setStatusBusy(true);
      try {
        const token = await getValidAccessToken();
        if (!token) return;
        const updated = await updateFollowStatus(token, data.follow.id, next?.id ?? null);
        if (updated) {
          setData((prev) => (prev ? { ...prev, follow: updated } : prev));
        }
      } finally {
        setStatusBusy(false);
        setStatusSheetOpen(false);
      }
    },
    [data?.follow, getValidAccessToken, openTawjihPlusProduct, showInscriptionsPaywall],
  );

  const onUnfollow = useCallback(() => {
    if (!data?.follow) return;
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
            setBusy(true);
            const ok = await deleteEstablishmentFollow(token, data.follow.id);
            setBusy(false);
            if (ok) router.back();
          },
        },
      ],
    );
  }, [data, getValidAccessToken, router, t]);

  /**
   * Navigation vers la fiche complète de l'établissement.
   * On accepte le slug comme bonus (pour des URL "propres") mais l'id seul suffit
   * — le routeur Expo Router résout la fiche correctement avec un slug placeholder.
   *
   * IMPORTANT : ce hook doit être déclaré avant tout `return` conditionnel pour
   * respecter les règles de hooks (sinon "Rendered more hooks than during the
   * previous render").
   */
  const estId = data?.follow.establishment?.id ?? null;
  const estSlug = data?.follow.establishment?.slug ?? null;
  const onViewSchool = useCallback(() => {
    if (!estId) return;
    const slug = (estSlug ?? '').trim() || 'fiche';
    router.push(`/etablissements/${estId}/${slug}` as never);
  }, [estId, estSlug, router]);
  const canViewSchool = Boolean(estId);

  if (loading) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar style="light" />
        <FollowedSchoolDetailLoadingSkeleton
          isRTL={isRTL}
          topInset={insets.top}
          bottomInset={insets.bottom}
        />
      </View>
    );
  }

  if (!data?.follow) {
    return (
      <SafeAreaView style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.center}>
          <FontAwesome name="exclamation-triangle" size={28} color={brand.textMuted} />
          <Text style={styles.errorTxt}>{t('inscDetailNotFound')}</Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.retryBtnTxt}>{t('followedSchoolBackToList')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const follow = data.follow;
  const est = follow.establishment;
  const estName = pickEstablishmentName(est, locale);
  const villes = (est?.villes ?? []).filter(Boolean);
  const villeMain = est?.ville?.trim() || '';
  const villesShort = villes.length > 0 ? villes.join(' · ') : villeMain;
  const logoUri =
    getEstablishmentLogoUrl(est?.logo) ?? fallbackEstablishmentAvatarName(est?.nom, est?.sigle);

  /** Hero header rendu en dehors du FlatList. */
  const renderHeader = () => (
    <View style={[styles.hero, { paddingTop: insets.top + 6 }]}>
      <View style={[styles.heroTopBar, isRTL && styles.rowRtl]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.8 }]}
          accessibilityLabel="Back"
        >
          <FontAwesome name={isRTL ? 'chevron-right' : 'chevron-left'} size={16} color={brand.white} />
        </Pressable>
        <Text style={[styles.heroTitle, isRTL && styles.rtl]} numberOfLines={1}>
          {t('followedSchoolTimelineTitle')}
        </Text>
        <HeroLangSwitch />
      </View>

      <Pressable
        onPress={canViewSchool ? onViewSchool : undefined}
        disabled={!canViewSchool}
        accessibilityRole={canViewSchool ? 'link' : undefined}
        accessibilityLabel={t('followedSchoolViewSchool')}
        style={({ pressed }) => [
          styles.estCard,
          isRTL && styles.rowRtl,
          canViewSchool && pressed && { opacity: 0.85 },
        ]}
      >
        <View style={styles.logoWrap}>
          <Image
            source={{ uri: logoUri }}
            style={styles.estLogo}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.estName, isRTL && styles.rtl]} numberOfLines={3}>
            {estName}
          </Text>
          <View style={[styles.estMetaRow, isRTL && styles.rowRtl]}>
            {est?.sigle ? (
              <View style={styles.siglePill}>
                <Text style={styles.siglePillTxt}>{est.sigle}</Text>
              </View>
            ) : null}
            {est?.type ? <EstablishmentTypeBadge type={est.type} size="xs" /> : null}
          </View>
          {villesShort ? (
            <View style={[styles.villeRow, isRTL && styles.rowRtl]}>
              <FontAwesome name="map-marker" size={11} color={brand.textMuted} />
              <Text style={[styles.villeTxt, isRTL && styles.rtl]} numberOfLines={2}>
                {villesShort}
              </Text>
            </View>
          ) : null}
          {canViewSchool ? (
            <View style={[styles.viewSchoolHint, isRTL && styles.rowRtl]}>
              <FontAwesome name="external-link" size={10} color={brand.primary} />
              <Text style={[styles.viewSchoolHintTxt, isRTL && styles.rtl]} numberOfLines={1}>
                {t('followedSchoolViewSchool')}
              </Text>
            </View>
          ) : null}
        </View>
        {canViewSchool ? (
          <FontAwesome
            name={isRTL ? 'chevron-left' : 'chevron-right'}
            size={14}
            color={brand.textMuted}
          />
        ) : null}
      </Pressable>

      {/* Statut courant — affiché bien en évidence sur le hero, avec un
          CTA dédié vers la sheet de mise à jour. Le CTA est masqué quand
          aucune annonce de l'école n'autorise de statut. */}
      <View style={[styles.statusBlock, isRTL && styles.rowRtl]}>
        <View style={{ flexShrink: 1 }}>
          <Text style={[styles.statusEyebrow, isRTL && styles.rtl]}>
            {t('inscStatusBlockTitle')}
          </Text>
          <View style={{ marginTop: 6 }}>
            <StatusBadge status={follow.status} size="md" />
          </View>
        </View>
        {(follow.availableStatuses?.length ?? 0) > 0 ? (
          <Pressable
            onPress={() => {
              if (isInscriptionsLocked) {
                openTawjihPlusProduct();
                return;
              }
              setStatusSheetOpen(true);
            }}
            disabled={statusBusy}
            style={({ pressed }) => [
              styles.statusUpdateBtn,
              showInscriptionsPaywall && styles.statusUpdateBtnLocked,
              pressed && { opacity: 0.85 },
              statusBusy && { opacity: 0.6 },
            ]}
          >
            <FontAwesome
              name={isInscriptionsLocked ? 'lock' : 'pencil'}
              size={11}
              color={isInscriptionsLocked ? '#475569' : brand.primary}
            />
            <Text style={styles.statusUpdateBtnTxt}>
              {showInscriptionsPaywall ? t('inscTawjihPlusUpgradeCta') : t('inscStatusActionUpdate')}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* Stats */}
      <View style={[styles.statsRow, isRTL && styles.rowRtl]}>
        <View style={[styles.statPill, isRTL && styles.rowRtl]}>
          <FontAwesome name="bullhorn" size={11} color={brand.white} />
          <Text style={styles.statPillTxt}>
            {follow.stats.totalAnnouncements} {t('followedSchoolStatTotalAnnouncements')}
          </Text>
        </View>
        {follow.stats.openAnnouncements > 0 ? (
          <View style={[styles.statPill, isRTL && styles.rowRtl]}>
            <FontAwesome name="play-circle" size={11} color={brand.white} />
            <Text style={styles.statPillTxt}>
              {follow.stats.openAnnouncements} {t('followedSchoolStatOpenAnnouncements')}
            </Text>
          </View>
        ) : null}
        {follow.stats.candidaciesCount > 0 ? (
          <View style={[styles.statPill, isRTL && styles.rowRtl]}>
            <FontAwesome name="flag-checkered" size={11} color={brand.white} />
            <Text style={styles.statPillTxt}>
              {follow.stats.candidaciesCount} {t('followedSchoolStatCandidacies')}
            </Text>
          </View>
        ) : null}
      </View>

      {/* CTA principal : ouvrir la fiche école */}
      {canViewSchool ? (
        <Pressable
          onPress={onViewSchool}
          accessibilityRole="link"
          accessibilityLabel={t('followedSchoolViewSchool')}
          style={({ pressed }) => [
            styles.viewSchoolCta,
            isRTL && styles.rowRtl,
            pressed && { opacity: 0.9 },
          ]}
        >
          <FontAwesome name="university" size={13} color={brand.primary} />
          <Text style={[styles.viewSchoolCtaTxt, isRTL && styles.rtl]} numberOfLines={1}>
            {t('followedSchoolViewSchool')}
          </Text>
          <FontAwesome
            name={isRTL ? 'chevron-left' : 'chevron-right'}
            size={12}
            color={brand.primary}
          />
        </Pressable>
      ) : null}

      {/* Actions — uniquement « Ne plus suivre » : la mise à jour de statut
          se fait au niveau de chaque candidature (page d'annonce). */}
      <View style={[styles.actionsRow, isRTL && styles.rowRtl]}>
        <Pressable
          onPress={onUnfollow}
          disabled={busy}
          style={({ pressed }) => [
            styles.actionBtn,
            styles.actionDanger,
            pressed && { opacity: 0.85 },
            busy && { opacity: 0.5 },
          ]}
        >
          <FontAwesome name="trash-o" size={12} color="#B91C1C" />
          <Text style={styles.actionDangerTxt}>{t('followSchoolUnfollowBtn')}</Text>
        </Pressable>
      </View>
    </View>
  );

  /** Section : timeline agrégée. */
  const renderTimeline = () => (
    <View style={styles.section}>
      <View style={[styles.sectionHeader, isRTL && styles.rowRtl]}>
        <View style={styles.sectionIconCircle}>
          <FontAwesome name="history" size={13} color={brand.primary} />
        </View>
        <Text style={[styles.sectionTitle, isRTL && styles.rtl]}>
          {t('followedSchoolTimelineTitle')}
        </Text>
      </View>
      {data.events.length === 0 ? (
        <Text style={[styles.muted, isRTL && styles.rtl]}>{t('followedSchoolTimelineNoEvents')}</Text>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {data.events.map((ev) => (
            <View key={`ev-${ev.id}`} style={[styles.eventCard, isRTL && styles.rowRtl]}>
              <View style={[styles.eventDot, { backgroundColor: homeShell.green }]} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.eventMsg, isRTL && styles.rtl]}>
                  {ev.message ?? '—'}
                </Text>
                <Text style={[styles.eventMeta, isRTL && styles.rtl]} numberOfLines={1}>
                  {ev.announcementTitle ? `${ev.announcementTitle} · ` : ''}
                  {formatTimeAgo(ev.createdAt, locale)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <FlatList
        ref={listRef}
        data={data.announcements}
        keyExtractor={(a) => `ann-${a.id}`}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xxl + spacing.lg }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderTimeline()}
            <View style={[styles.announcementsTitleRow, isRTL && styles.rowRtl]}>
              <View style={styles.sectionIconCircle}>
                <FontAwesome name="bullhorn" size={13} color={brand.primary} />
              </View>
              <Text style={[styles.sectionTitle, isRTL && styles.rtl]}>
                {t('followedSchoolHistoricalAnnouncements')}
              </Text>
            </View>
          </>
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: spacing.lg }}>
            <AnnouncementCard
              item={{
                id: item.id,
                title: item.title,
                titleAr: item.titleAr ?? null,
                announcementType: item.announcementType,
                dateStart: item.dateStart,
                dateEnd: item.dateEnd,
                isOpen: item.isOpen,
                isExpire: item.isExpire,
                daysUntilClose: item.daysUntilClose ?? 0,
                registrationUrl: item.registrationUrl,
                registrationUrlLabel: item.registrationUrlLabel ?? null,
                ogImage: item.ogImage ?? null,
                liensUtiles: item.liensUtiles ?? [],
                filieresAcceptees: item.filieresAcceptees ?? [],
                specialitesBacMissionAcceptees: item.specialitesBacMissionAcceptees ?? [],
                anneesBacAcceptees: item.anneesBacAcceptees ?? [],
                availableStatuses: item.availableStatuses ?? [],
                establishment: item.establishment ?? null,
              }}
              isFollowed
              onToggleFollow={() => undefined}
              onOpenLink={() => {
                if (showInscriptionsPaywall) openTawjihPlusProduct();
              }}
              onUpdateStatus={() => {
                if (showInscriptionsPaywall) openTawjihPlusProduct();
              }}
              onPress={() => {
                void updateLatestSeenOnDisk(followId, item.id);
                router.push(`/inscriptions/${item.id}` as never);
              }}
              previewOnly={showInscriptionsPaywall || Boolean(item.previewOnly)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={{ paddingHorizontal: spacing.lg }}>
            <Text style={[styles.muted, isRTL && styles.rtl]}>
              {t('followedSchoolTimelineNoAnnouncements')}
            </Text>
          </View>
        }
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      <StatusUpdateSheet
        visible={statusSheetOpen}
        currentStatus={follow.status}
        availableStatuses={follow.availableStatuses ?? []}
        onClose={() => setStatusSheetOpen(false)}
        onConfirm={onConfirmStatus}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.backgroundSoft },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  errorTxt: { color: brand.text, fontSize: fontSize.md, fontWeight: '700', textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.primary,
  },
  retryBtnTxt: { color: brand.primary, fontWeight: '700', fontSize: fontSize.sm },

  list: { paddingTop: 0 },

  /* Hero — bandeau marque + carte école qui « flotte » sur le fond */
  hero: {
    backgroundColor: homeShell.bg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  heroTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  heroTitle: {
    color: brand.white,
    fontSize: fontSize.md,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },

  estCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: brand.white,
    padding: spacing.md + 2,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: '#0F172A',
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  logoWrap: {
    padding: 3,
    borderRadius: radius.md + 2,
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  estLogo: { width: 56, height: 56, borderRadius: radius.sm, backgroundColor: brand.borderLight },
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
  viewSchoolHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  viewSchoolHintTxt: {
    color: brand.primary,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  /* Bloc statut courant + bouton mise à jour */
  statusBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(226,232,240,0.95)',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  statusEyebrow: {
    color: brand.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  statusUpdateBtnLocked: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderColor: '#CBD5E1',
  },
  statusUpdateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: 9,
    borderRadius: radius.full,
    backgroundColor: 'rgba(51,62,143,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.22)',
  },
  statusUpdateBtnTxt: { color: brand.primary, fontWeight: '800', fontSize: fontSize.xs },

  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  statPillTxt: { color: brand.white, fontSize: fontSize.xs, fontWeight: '700' },

  /* CTA fiche école (bouton plein largeur dans le hero) */
  viewSchoolCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: brand.white,
    marginBottom: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.55)',
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  viewSchoolCtaTxt: {
    flex: 1,
    color: brand.primary,
    fontWeight: '800',
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.primary,
  },
  actionBtnTxt: { color: brand.primary, fontWeight: '800', fontSize: fontSize.sm },
  actionDanger: {
    borderColor: 'rgba(248,113,113,0.45)',
    backgroundColor: '#FFF1F2',
  },
  actionDangerTxt: { color: '#B91C1C', fontWeight: '800', fontSize: fontSize.sm },

  /* Sections (cartes sur fond grisé) */
  section: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.borderLight,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.xs,
  },
  sectionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(51,62,143,0.10)',
  },
  announcementsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  sectionTitle: { flex: 1, color: brand.text, fontSize: fontSize.md, fontWeight: '800' },
  muted: { color: brand.textMuted, fontSize: fontSize.sm, lineHeight: 20 },

  eventCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    backgroundColor: brand.backgroundSoft,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  eventDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  eventMsg: { color: brand.text, fontSize: fontSize.sm, fontWeight: '700' },
  eventMeta: { color: brand.textMuted, fontSize: fontSize.xs, fontWeight: '600' },

  rtl: { textAlign: 'right', writingDirection: 'rtl' },
});
