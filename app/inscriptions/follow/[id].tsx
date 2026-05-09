import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnnouncementCard } from '@/components/inscriptions/AnnouncementCard';
import { StatusBadge } from '@/components/inscriptions/StatusBadge';
import { StatusUpdateSheet } from '@/components/inscriptions/StatusUpdateSheet';
import { EstablishmentTypeBadge } from '@/components/ui/EstablishmentTypeBadge';
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
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type {
  CandidacyStatus,
  EstablishmentFollowTimeline,
} from '@/types/inscriptions';
import {
  formatTimeAgo,
  pickEstablishmentName,
  STATUS_VISUALS,
} from '@/utils/candidacyStatus';

export default function FollowedSchoolDetailScreen() {
  const router = useRouter();
  const { t, locale, isRTL, setLocale } = useLocale();
  const insets = useSafeAreaInsets();
  const { getValidAccessToken } = useAuth();
  const params = useLocalSearchParams<{ id?: string }>();
  const followId = useMemo(() => Number(params.id ?? 0), [params.id]);

  const [data, setData] = useState<EstablishmentFollowTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusSheetOpen, setStatusSheetOpen] = useState(false);
  const [busy, setBusy] = useState(false);

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
    const payload = await fetchEstablishmentFollowTimeline(token, followId);
    setData(payload);
    setLoading(false);
  }, [followId, getValidAccessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

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

  const onConfirmStatus = useCallback(
    async (status: CandidacyStatus) => {
      // NB : on ne ferme la sheet qu'APRÈS la résolution de la requête pour
      // que `StatusUpdateSheet` puisse afficher l'état de chargement sur le
      // bouton « Mettre à jour » pendant l'aller-retour réseau.
      if (!data?.follow) {
        setStatusSheetOpen(false);
        return;
      }
      const token = await getValidAccessToken();
      if (!token) {
        setStatusSheetOpen(false);
        return;
      }
      const updated = await updateFollowStatus(token, data.follow.id, status);
      if (updated) {
        setData((prev) => (prev ? { ...prev, follow: updated } : prev));
      }
      setStatusSheetOpen(false);
    },
    [data, getValidAccessToken],
  );

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
      <SafeAreaView style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={brand.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
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
  const visual = STATUS_VISUALS[follow.status];
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
            {est?.sigle ? (
              <View style={styles.siglePill}>
                <Text style={styles.siglePillTxt}>{est.sigle}</Text>
              </View>
            ) : null}
            {est?.type ? <EstablishmentTypeBadge type={est.type} size="xs" /> : null}
            <StatusBadge status={follow.status} size="sm" />
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

      {/* Actions */}
      <View style={[styles.actionsRow, isRTL && styles.rowRtl]}>
        <Pressable
          onPress={() => setStatusSheetOpen(true)}
          style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.85 }]}
        >
          <FontAwesome name="pencil" size={12} color={brand.primary} />
          <Text style={styles.actionBtnTxt}>{t('inscStatusActionUpdate')}</Text>
        </Pressable>
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
        <FontAwesome name="history" size={14} color={brand.primary} />
        <Text style={[styles.sectionTitle, isRTL && styles.rtl]}>
          {t('followedSchoolTimelineTitle')}
        </Text>
      </View>
      {data.events.length === 0 ? (
        <Text style={[styles.muted, isRTL && styles.rtl]}>{t('followedSchoolTimelineNoEvents')}</Text>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {data.events.map((ev) => (
            <View key={`ev-${ev.id}`} style={[styles.eventRow, isRTL && styles.rowRtl]}>
              <View style={[styles.eventDot, { backgroundColor: visual.fg }]} />
              <View style={{ flex: 1 }}>
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
        data={data.announcements}
        keyExtractor={(a) => `ann-${a.id}`}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderTimeline()}
            <View style={[styles.sectionHeader, { paddingHorizontal: spacing.lg }, isRTL && styles.rowRtl]}>
              <FontAwesome name="bullhorn" size={14} color={brand.primary} />
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
                establishment: item.establishment ?? null,
              }}
              isFollowed
              onToggleFollow={() => undefined}
              onOpenLink={() => undefined}
              onPress={() => router.push(`/inscriptions/${item.id}` as never)}
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
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      <StatusUpdateSheet
        visible={statusSheetOpen}
        currentStatus={follow.status}
        onClose={() => setStatusSheetOpen(false)}
        onConfirm={onConfirmStatus}
        onRequestDelete={onUnfollow}
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

  /* Hero */
  hero: {
    backgroundColor: brand.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  heroTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  heroTitle: {
    color: brand.white,
    fontSize: fontSize.md,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },

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

  estCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: brand.white,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  estLogo: { width: 54, height: 54, borderRadius: radius.sm, backgroundColor: brand.borderLight },
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

  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  statPillTxt: { color: brand.white, fontSize: fontSize.xs, fontWeight: '700' },

  /* CTA fiche école (bouton plein largeur dans le hero) */
  viewSchoolCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: brand.white,
    marginBottom: spacing.sm,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
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
  actionDanger: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
  actionDangerTxt: { color: '#B91C1C', fontWeight: '800', fontSize: fontSize.sm },

  /* Sections */
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
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.lg, marginBottom: spacing.sm },
  sectionTitle: { color: brand.text, fontSize: fontSize.md, fontWeight: '800' },
  muted: { color: brand.textMuted, fontSize: fontSize.sm, lineHeight: 20 },

  eventRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: 6,
  },
  eventDot: { width: 8, height: 8, borderRadius: 4, marginTop: 7 },
  eventMsg: { color: brand.text, fontSize: fontSize.sm, fontWeight: '700' },
  eventMeta: { color: brand.textMuted, fontSize: fontSize.xs, fontWeight: '600' },

  rtl: { textAlign: 'right', writingDirection: 'rtl' },
});
