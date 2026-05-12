import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CommunityQnaSection } from '@/components/community/CommunityQnaSection';
import { LiveNowPill } from '@/components/events/LiveNowPill';
import { SidebarMenuIconButton } from '@/components/SidebarMenuIconButton';
import { AppRefreshControl } from '@/components/ui/AppRefreshControl';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import {
  confirmPresencePlatformEvent,
  fetchPlatformEventDetail,
  registerPlatformEvent,
  unregisterPlatformEvent,
  type PlatformEventBrief,
} from '@/services/platformEvents';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { platformEventDaysRemainingLabel } from '@/utils/platformEventCountdown';
import { resolvePlatformEventCoverUri } from '@/utils/platformEventCover';
import { platformEventDisplayTitle, platformEventKindBadgeText } from '@/utils/platformEventLocale';
import { contactStatusLabelMobile } from '@/utils/platformEventRegistrationLabels';
import { formatPlatformEventDurationMobile } from '@/utils/eventDuration';
import { errorMessage } from '@/utils/errorMessage';
import { formatPlatformEventDetailDateTime } from '@/utils/platformEventFormat';
function InfoRow({
  icon,
  label,
  value,
  isRTL,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  value: string;
  isRTL: boolean;
}) {
  return (
    <View style={[detailStyles.infoRow, isRTL && detailStyles.rowRtl]}>
      <View style={detailStyles.infoIconWrap}>
        <FontAwesome name={icon} size={15} color={brand.primary} />
      </View>
      <View style={detailStyles.infoTextCol}>
        <Text style={detailStyles.infoLabel}>{label}</Text>
        <Text style={[detailStyles.infoValue, isRTL && detailStyles.rtl]}>{value}</Text>
      </View>
    </View>
  );
}

function SectionCard({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[detailStyles.sectionCard, style]}>{children}</View>;
}

const detailStyles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.borderLight,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51, 62, 143, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextCol: { flex: 1, minWidth: 0 },
  infoLabel: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: brand.text,
    lineHeight: 22,
  },
  sectionCard: {
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.06)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: spacing.md,
  },
});

export default function EvenementDetailScreen() {
  const { id: rawId, qnaQ: rawQnaQ } = useLocalSearchParams<{ id: string; qnaQ?: string | string[] }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { t, isRTL, locale, setLocale } = useLocale();
  const { getValidAccessToken, user, reloadMe } = useAuth();
  const id = Number(rawId);
  const highlightQuestionId = useMemo(() => {
    const s = Array.isArray(rawQnaQ) ? rawQnaQ[0] : rawQnaQ;
    const n = Number(s ?? 0);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [rawQnaQ]);
  const scrollRef = useRef<ScrollView>(null);

  const [ev, setEv] = useState<PlatformEventBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);

  const htmlSource = useMemo(() => {
    const ar = locale === 'ar' && ev?.descriptionHtmlAr?.trim();
    const h = (ar ? ev?.descriptionHtmlAr : ev?.descriptionHtml)?.trim();
    if (!h) return undefined;
    return { html: h };
  }, [ev?.descriptionHtml, ev?.descriptionHtmlAr, locale]);

  const registrationExplain = useMemo(() => {
    if (!ev) return '';
    const isEx = ev.registrationSource === 'external';
    const ar = ev.registrationInfoMessageAr?.trim();
    const fr = ev.registrationInfoMessage?.trim();
    const custom = locale === 'ar' ? ar || fr || '' : fr || ar || '';
    if (custom) return custom;
    if (isEx) return t('eventsExternalDefaultInfo');
    return '';
  }, [ev, locale, t]);

  const openExternalRegistration = useCallback(async () => {
    const raw = ev?.externalRegistrationUrl?.trim();
    if (!raw) return;
    const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
      await Linking.openURL(href);
    } catch {
      Alert.alert('', t('eventsLoadError'));
    }
  }, [ev?.externalRegistrationUrl, t]);

  const load = useCallback(async () => {
    if (!Number.isFinite(id) || id <= 0) {
      setEv(null);
      return;
    }
    const token = await getValidAccessToken();
    const data = await fetchPlatformEventDetail(token ?? undefined, id);
    setEv(data);
  }, [getValidAccessToken, id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const openOnline = async () => {
    const u = ev?.onlineUrl?.trim();
    if (!u) return;
    const href = /^https?:\/\//i.test(u) ? u : `https://${u}`;
    try {
      await Linking.openURL(href);
    } catch {
      Alert.alert('', t('eventsLoadError'));
    }
  };

  const openLocationMaps = async () => {
    const u = ev?.locationMapsUrl?.trim();
    if (!u) return;
    const href = /^https?:\/\//i.test(u) ? u : `https://${u}`;
    try {
      await Linking.openURL(href);
    } catch {
      Alert.alert('', t('eventsLoadError'));
    }
  };

  const openRegisterModal = async () => {
    if (ev?.registrationSource === 'external') return;
    const token = await getValidAccessToken();
    if (!token) {
      router.push('/login' as never);
      return;
    }
    if (!user?.phone?.trim()) {
      Alert.alert('', t('eventsRegMissingPhone'));
      return;
    }
    setRegFirstName((user.firstName ?? '').trim());
    setRegLastName((user.lastName ?? '').trim());
    setRegEmail((user.email ?? '').trim());
    setRegPhone((user.phone ?? '').trim());
    setRegModalOpen(true);
  };

  const submitEventRegistration = async () => {
    const fn = regFirstName.trim();
    const ln = regLastName.trim();
    const em = regEmail.trim();
    const ph = regPhone.trim();
    if (!fn || !ln || !em || !ph) {
      Alert.alert('', t('eventsRegError'));
      return;
    }
    const token = await getValidAccessToken();
    if (!token) {
      router.push('/login' as never);
      return;
    }
    setRegSubmitting(true);
    try {
      const next = await registerPlatformEvent(token, id, {
        firstName: fn,
        lastName: ln,
        email: em,
        phone: ph,
      });
      if (next) {
        setEv(next);
        setRegModalOpen(false);
        void reloadMe();
      } else {
        Alert.alert('', t('eventsRegError'));
      }
    } catch (e: unknown) {
      let msg = t('eventsRegError');
      const raw = errorMessage(e);
      try {
        const j = JSON.parse(raw) as { message?: string };
        if (typeof j.message === 'string' && j.message.trim()) msg = j.message.trim();
      } catch {
        if (raw && raw.length > 0 && raw.length < 240) msg = raw;
      }
      Alert.alert('', msg);
    } finally {
      setRegSubmitting(false);
    }
  };

  const handleUnregister = async () => {
    const token = await getValidAccessToken();
    if (!token) return;
    setBusy(true);
    try {
      const next = await unregisterPlatformEvent(token, id);
      if (next) setEv(next);
    } catch {
      Alert.alert('', t('eventsLoadError'));
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = async () => {
    const token = await getValidAccessToken();
    if (!token) return;
    setBusy(true);
    try {
      const next = await confirmPresencePlatformEvent(token, id);
      if (next) setEv(next);
    } catch {
      Alert.alert('', t('eventsLoadError'));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.root, styles.center]} edges={['top']}>
        <ActivityIndicator color={brand.primary} />
      </SafeAreaView>
    );
  }

  if (!ev) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.emptyTxt}>{t('eventsLoadError')}</Text>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnTxt}>OK</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const registered = Boolean(ev.myRegistration?.registeredAt);
  const confirmed = Boolean(ev.myRegistration?.presenceConfirmedAt);
  const full = Boolean(ev.isAtCapacity);
  const isExternalReg = ev.registrationSource === 'external';

  const coverUri = resolvePlatformEventCoverUri(ev);
  const daysLeftLabel = !ev.isPast
    ? platformEventDaysRemainingLabel(locale, {
        startsAt: ev.startsAt,
        endsAt: ev.endsAt,
        isPast: ev.isPast,
      })
    : null;

  const htmlContentWidth = Math.max(240, width - spacing.lg * 2 - spacing.md * 2);
  const dateStartStr = formatPlatformEventDetailDateTime(ev.startsAt, locale, ev.timezone);
  const dateEndStr = formatPlatformEventDetailDateTime(ev.endsAt, locale, ev.timezone);
  const durationStr = formatPlatformEventDurationMobile(ev.startsAt, ev.endsAt, locale);
  const seatsLine =
    ev.maxSeats != null && ev.maxSeats > 0
      ? ev.showRegistrationCount && typeof ev.registrationCount === 'number'
        ? `${ev.registrationCount} / ${ev.maxSeats}`
        : `≤ ${ev.maxSeats}`
      : '';

  const eventTitle = platformEventDisplayTitle(ev, locale);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar style="light" backgroundColor={brand.primary} />
      <View style={styles.heroBar}>
        <SidebarMenuIconButton color={brand.white} />
        <View style={styles.heroBarSpacer} />
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
            <Text style={[styles.langPillTxt, locale === 'fr' && styles.langPillTxtActive]}>{t('langFr')}</Text>
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
            <Text style={[styles.langPillTxt, locale === 'ar' && styles.langPillTxtActive]}>{t('langAr')}</Text>
          </Pressable>
        </View>
        <Pressable onPress={() => router.back()} hitSlop={14} style={styles.heroBackBtn} accessibilityRole="button">
          <FontAwesome name={isRTL ? 'chevron-right' : 'chevron-left'} size={20} color={brand.white} />
        </Pressable>
      </View>

      <View style={styles.mainColumn}>
      <ScrollView
        ref={scrollRef}
        style={[styles.body, isRTL && { direction: 'rtl' }]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing.section * 2 + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        refreshControl={
          <AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.coverHero}>
          <Image source={{ uri: coverUri }} style={styles.coverImage} resizeMode="cover" />
          <View style={styles.coverBottomFade} />
        </View>

        <View style={styles.contentSheet}>
          <Text style={[styles.pageTitle, isRTL && styles.rtl]}>{eventTitle}</Text>

          <View style={[styles.titleBadges, isRTL && styles.rowRtl]}>
            <View style={styles.kindPillSolid}>
              <Text style={[styles.kindPillSolidTxt, isRTL && styles.kindPillSolidTxtRtl]}>
                {platformEventKindBadgeText(t, ev.kind, locale)}
              </Text>
            </View>
            {ev.isLiveNow ? <LiveNowPill label={t('eventsLiveNow')} isRTL={isRTL} /> : null}
          </View>

          <SectionCard>
            <Text style={[styles.sectionHeading, isRTL && styles.rtl]}>{t('eventsDetailPractical')}</Text>
            <InfoRow
              icon="calendar"
              label={t('eventsDateStart')}
              value={dateStartStr}
              isRTL={isRTL}
            />
            <InfoRow icon="calendar" label={t('eventsDateEnd')} value={dateEndStr} isRTL={isRTL} />
            <View style={[detailStyles.infoRow, isRTL && detailStyles.rowRtl, styles.infoRowLast]}>
              <View style={detailStyles.infoIconWrap}>
                <FontAwesome name="clock-o" size={15} color={brand.primary} />
              </View>
              <View style={detailStyles.infoTextCol}>
                <Text style={detailStyles.infoLabel}>{t('eventsDuration')}</Text>
                <Text style={[detailStyles.infoValue, isRTL && detailStyles.rtl]}>{durationStr}</Text>
              </View>
            </View>
          </SectionCard>

          <SectionCard>
            <Text style={[styles.sectionHeading, isRTL && styles.rtl]}>{t('eventsDetailStatus')}</Text>
            {ev.isLiveNow ? (
              <View style={styles.liveBanner}>
                <Text style={styles.liveBannerTitle}>{t('eventsLiveBannerTitle')}</Text>
                <Text style={styles.liveBannerSub}>{t('eventsLiveBannerSubtitle')}</Text>
              </View>
            ) : null}
            {!ev.isPast ? (
              <View style={[styles.statusChipRow, isRTL && styles.rowRtl]}>
                <FontAwesome
                  name={ev.registrationOpen !== false ? 'unlock' : 'lock'}
                  size={15}
                  color={ev.registrationOpen !== false ? '#15803d' : '#be123c'}
                />
                <Text
                  style={[
                    styles.statusChipTxt,
                    ev.registrationOpen !== false ? styles.regBannerOpen : styles.regBannerClosed,
                    isRTL && styles.rtl,
                  ]}
                >
                  {ev.registrationOpen !== false ? t('eventsRegOpen') : t('eventsRegClosed')}
                </Text>
              </View>
            ) : (
              <Text style={[styles.pastEventNote, isRTL && styles.rtl]}>{t('eventsPastBadge')}</Text>
            )}
            {daysLeftLabel ? (
              <View style={[styles.daysLeftInline, isRTL && styles.rowRtl]}>
                <FontAwesome name="clock-o" size={14} color={brand.primary} />
                <Text style={[styles.daysLeftBannerTxt, isRTL && styles.rtl]}>{daysLeftLabel}</Text>
              </View>
            ) : null}
          </SectionCard>

          {ev.locationLabel || seatsLine || (ev.kind === 'event' && ev.locationMapsUrl) ? (
            <SectionCard>
              <Text style={[styles.sectionHeading, isRTL && styles.rtl]}>{t('eventsDetailVenue')}</Text>
              {ev.locationLabel ? (
                <View
                  style={[
                    detailStyles.infoRow,
                    isRTL && detailStyles.rowRtl,
                    !seatsLine && !(ev.kind === 'event' && ev.locationMapsUrl) ? styles.infoRowLast : null,
                  ]}
                >
                  <View style={detailStyles.infoIconWrap}>
                    <FontAwesome name="map-marker" size={15} color={brand.primary} />
                  </View>
                  <View style={detailStyles.infoTextCol}>
                    <Text style={detailStyles.infoLabel}>{t('eventsDetailLocationLabel')}</Text>
                    <Text style={[detailStyles.infoValue, isRTL && detailStyles.rtl]}>{ev.locationLabel}</Text>
                  </View>
                </View>
              ) : null}
              {seatsLine ? (
                <View
                  style={[
                    detailStyles.infoRow,
                    isRTL && detailStyles.rowRtl,
                    !(ev.kind === 'event' && ev.locationMapsUrl) ? styles.infoRowLast : null,
                  ]}
                >
                  <View style={detailStyles.infoIconWrap}>
                    <FontAwesome name="users" size={14} color={brand.primary} />
                  </View>
                  <View style={detailStyles.infoTextCol}>
                    <Text style={detailStyles.infoLabel}>{t('eventsPlacesLabel')}</Text>
                    <Text style={[detailStyles.infoValue, isRTL && detailStyles.rtl]}>{seatsLine}</Text>
                  </View>
                </View>
              ) : null}
              {ev.kind === 'event' && ev.locationMapsUrl ? (
                <Pressable
                  onPress={() => void openLocationMaps()}
                  style={({ pressed }) => [
                    detailStyles.infoRow,
                    isRTL && detailStyles.rowRtl,
                    styles.infoRowLast,
                    styles.mapsLinkRow,
                    pressed && { opacity: 0.9 },
                  ]}
                  accessibilityRole="link"
                  accessibilityLabel={t('eventsMapsLink')}
                >
                  <View style={[detailStyles.infoIconWrap, styles.mapsIconWrap]}>
                    <FontAwesome name="map" size={15} color="#fff" />
                  </View>
                  <View style={[detailStyles.infoTextCol, { flex: 1 }]}>
                    <Text style={detailStyles.infoLabel}>{t('eventsMapsLink')}</Text>
                    <Text style={[styles.mapsLinkSub, isRTL && detailStyles.rtl]}>Google Maps</Text>
                  </View>
                  <FontAwesome name="external-link" size={14} color="#059669" />
                </Pressable>
              ) : null}
            </SectionCard>
          ) : null}

          {registrationExplain ? (
            <SectionCard style={styles.mutedCard}>
              <Text style={[styles.sectionHeading, isRTL && styles.rtl]}>{t('eventsDetailRegistrationInfo')}</Text>
              <Text style={[styles.proseMuted, isRTL && styles.rtl]}>{registrationExplain}</Text>
            </SectionCard>
          ) : null}
          {ev.connectionLinkPending ? (
            <View style={styles.regPendingBox}>
              <Text style={[styles.regPendingTxt, isRTL && styles.rtl]}>{t('eventsConnectionPending')}</Text>
            </View>
          ) : null}

          {!ev.isPast ? (
            <SectionCard style={styles.actionsCard}>
              {!registered ? (
                <>
                  {isExternalReg ? (
                    ev.externalRegistrationUrl?.trim() && ev.registrationOpen !== false ? (
                      <Pressable
                        onPress={() => void openExternalRegistration()}
                        style={({ pressed }) => [styles.primaryBtnLg, pressed && { opacity: 0.92 }]}
                      >
                        <FontAwesome name="link" size={16} color={brand.white} />
                        <Text style={styles.primaryBtnLgTxt}>{t('eventsRegisterExternalLink')}</Text>
                      </Pressable>
                    ) : (
                      <Text style={styles.regHint}>{t('eventsExternalRegClosed')}</Text>
                    )
                  ) : (
                    <>
                      <Pressable
                        disabled={full || busy || ev.registrationOpen === false}
                        onPress={() => void openRegisterModal()}
                        style={({ pressed }) => [
                          styles.primaryBtnLg,
                          (full || busy || ev.registrationOpen === false) && styles.btnDisabled,
                          pressed && !full && ev.registrationOpen !== false && { opacity: 0.92 },
                        ]}
                      >
                        <Text style={styles.primaryBtnLgTxt}>
                          {full ? t('eventsFull') : ev.registrationOpen === false ? t('eventsRegClosed') : t('eventsRegister')}
                        </Text>
                      </Pressable>
                      {ev.registrationOpen === false && !full ? (
                        <Text style={styles.regHint}>{t('eventsRegClosedHint')}</Text>
                      ) : null}
                    </>
                  )}
                </>
              ) : (
                <Pressable
                  disabled={busy}
                  onPress={() => void handleUnregister()}
                  style={({ pressed }) => [styles.secondaryBtnLg, pressed && { opacity: 0.92 }]}
                >
                  <Text style={styles.secondaryBtnLgTxt}>{t('eventsUnregister')}</Text>
                </Pressable>
              )}
              {registered && ev.myRegistration ? (
                <View style={styles.followUp}>
                  <Text style={styles.followUpTitle}>{t('eventsFollowUpTitle')}</Text>
                  <Text style={styles.followUpLine}>
                    {t('eventsContactStatusPrefix')} : {contactStatusLabelMobile(t, ev.myRegistration.contactStatus)}
                  </Text>
                  {ev.myRegistration.attendanceStatus === 'attended' || ev.myRegistration.attendanceStatus === 'absent' ? (
                    <Text style={styles.followUpLine}>
                      {t('eventsAttendancePrefix')} :{' '}
                      {ev.myRegistration.attendanceStatus === 'attended'
                        ? t('eventsAttendanceAttended')
                        : t('eventsAttendanceAbsent')}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </SectionCard>
          ) : registered && !confirmed ? (
            <SectionCard>
              <Pressable
                disabled={busy}
                onPress={() => void handleConfirm()}
                style={({ pressed }) => [styles.confirmBtnLg, pressed && { opacity: 0.92 }]}
              >
                <Text style={styles.primaryBtnLgTxt}>{t('eventsConfirmPresence')}</Text>
              </Pressable>
            </SectionCard>
          ) : confirmed ? (
            <SectionCard style={styles.successCard}>
              <Text style={[styles.confirmedTxt, isRTL && styles.rtl]}>{t('eventsConfirmPresence')} ✓</Text>
            </SectionCard>
          ) : null}

          {ev.summary ? (
            <SectionCard>
              <Text style={[styles.sectionHeading, isRTL && styles.rtl]}>{t('eventsDetailDescription')}</Text>
              <Text style={[styles.summaryProse, isRTL && styles.rtl]}>{ev.summary}</Text>
            </SectionCard>
          ) : null}

          {htmlSource ? (
            <SectionCard>
              {!ev.summary ? (
                <Text style={[styles.sectionHeading, isRTL && styles.rtl]}>{t('eventsDetailDescription')}</Text>
              ) : null}
              <View style={[styles.htmlWrap, isRTL && { direction: 'rtl' }]}>
                <RenderHtml
                  contentWidth={htmlContentWidth}
                  source={htmlSource}
                  tagsStyles={{
                    body: {
                      color: brand.textSecondary,
                      fontSize: 15,
                      lineHeight: 24,
                      textAlign: isRTL ? 'right' : 'left',
                      writingDirection: isRTL ? 'rtl' : 'ltr',
                    },
                    p: { marginTop: 0, marginBottom: 12 },
                    li: { marginBottom: 6 },
                  }}
                />
              </View>
            </SectionCard>
          ) : null}

          {Number.isFinite(id) && id > 0 ? (
            <SectionCard>
              <CommunityQnaSection
                contextType="platform_event"
                contextId={id}
                variant="embedded"
                highlightQuestionId={highlightQuestionId}
                scrollParentRef={scrollRef}
              />
            </SectionCard>
          ) : null}
        </View>
      </ScrollView>

      {ev.onlineUrl ? (
        <View style={styles.bottomConnBar}>
          <Pressable
            onPress={() => void openOnline()}
            style={({ pressed }) => [styles.bottomConnBtn, pressed && { opacity: 0.92 }]}
            accessibilityRole="link"
            accessibilityLabel={
              ev.isLiveNow
                ? `${t('eventsOnlineLink')} — ${t('eventsLiveNow')}`
                : t('eventsOnlineLink')
            }
          >
            <View style={[styles.bottomConnBtnInner, isRTL && styles.rowRtl]}>
              <FontAwesome name="video-camera" size={18} color="#fff" />
              <Text style={styles.bottomConnBtnTxt}>{t('eventsOnlineLink')}</Text>
              {ev.isLiveNow ? (
                <View style={[styles.bottomLiveChip, isRTL && styles.bottomLiveChipRtl]}>
                  <View style={styles.bottomLiveDot} />
                  <Text style={styles.bottomLiveChipTxt}>{t('eventsLiveNow')}</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        </View>
      ) : null}
      </View>

      <Modal
        visible={regModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => !regSubmitting && setRegModalOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.regModalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable
            style={styles.regModalBackdrop}
            onPress={() => !regSubmitting && setRegModalOpen(false)}
          />
          <View style={[styles.regModalSheet, isRTL && styles.rowRtl]}>
            <Text style={[styles.regModalTitle, isRTL && styles.rtl]}>{t('eventsRegFormTitle')}</Text>
            <Text style={[styles.regModalHint, isRTL && styles.rtl]}>{eventTitle}</Text>

            <Text style={[styles.regFieldLabel, isRTL && styles.rtl]}>{t('eventsRegFirstName')} *</Text>
            <TextInput
              value={regFirstName}
              onChangeText={setRegFirstName}
              autoCapitalize="words"
              editable={!regSubmitting}
              style={[styles.regInput, isRTL && styles.rtl]}
              placeholderTextColor={brand.textMuted}
            />

            <Text style={[styles.regFieldLabel, isRTL && styles.rtl]}>{t('eventsRegLastName')} *</Text>
            <TextInput
              value={regLastName}
              onChangeText={setRegLastName}
              autoCapitalize="words"
              editable={!regSubmitting}
              style={[styles.regInput, isRTL && styles.rtl]}
              placeholderTextColor={brand.textMuted}
            />

            <Text style={[styles.regFieldLabel, isRTL && styles.rtl]}>{t('eventsRegEmail')} *</Text>
            <TextInput
              value={regEmail}
              onChangeText={setRegEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!regSubmitting}
              style={[styles.regInput, isRTL && styles.rtl]}
              placeholderTextColor={brand.textMuted}
            />

            <Text style={[styles.regFieldLabel, isRTL && styles.rtl]}>{t('eventsRegPhone')} *</Text>
            <TextInput
              value={regPhone}
              editable={false}
              style={[styles.regInput, styles.regInputDisabled, isRTL && styles.rtl]}
              placeholderTextColor={brand.textMuted}
            />
            <Text style={[styles.regPhoneHint, isRTL && styles.rtl]}>{t('eventsRegPhoneHint')}</Text>

            <View style={[styles.regModalActions, isRTL && styles.rowRtl]}>
              <Pressable
                onPress={() => !regSubmitting && setRegModalOpen(false)}
                style={({ pressed }) => [styles.regBtnGhost, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.regBtnGhostTxt}>{t('eventsRegCancel')}</Text>
              </Pressable>
              <Pressable
                disabled={regSubmitting || !regPhone.trim()}
                onPress={() => void submitEventRegistration()}
                style={({ pressed }) => [
                  styles.regBtnPrimary,
                  (regSubmitting || !regPhone.trim()) && styles.btnDisabled,
                  pressed && !regSubmitting && regPhone.trim() && { opacity: 0.9 },
                ]}
              >
                <Text style={styles.regBtnPrimaryTxt}>
                  {regSubmitting ? '…' : t('eventsRegSubmit')}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.primary },
  mainColumn: { flex: 1 },
  body: { flex: 1, backgroundColor: brand.backgroundSoft },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  rowRtl: { flexDirection: 'row-reverse' },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  heroBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: brand.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  heroBackBtn: { padding: 8, marginStart: -4 },
  heroBarSpacer: { flex: 1 },
  langSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full,
    padding: 3,
    flexShrink: 0,
  },
  langPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  langPillActive: { backgroundColor: brand.white },
  langPillTxt: { color: brand.white, fontSize: fontSize.xs, fontWeight: '700' },
  langPillTxtActive: { color: brand.primary },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.section * 2,
    paddingTop: 0,
  },
  coverHero: {
    marginHorizontal: -spacing.lg,
    marginBottom: -spacing.lg,
    height: 220,
    backgroundColor: '#e2e8f0',
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    overflow: 'hidden',
  },
  coverImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  coverBottomFade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.22)',
  },
  contentSheet: {
    paddingTop: spacing.lg + spacing.sm,
    paddingBottom: spacing.xs,
  },
  pageTitle: {
    fontSize: fontSize.xl,
    fontWeight: '900',
    color: brand.text,
    lineHeight: 28,
    marginBottom: spacing.sm,
  },
  titleBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  kindPillSolid: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(51, 62, 143, 0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(51, 62, 143, 0.2)',
  },
  kindPillSolidTxt: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
    color: brand.primary,
  },
  kindPillSolidTxtRtl: { textTransform: 'none' },
  sectionHeading: {
    fontSize: fontSize.sm,
    fontWeight: '900',
    color: brand.text,
    marginBottom: spacing.sm,
    letterSpacing: 0.2,
  },
  infoRowLast: { borderBottomWidth: 0 },
  mapsLinkRow: {
    backgroundColor: 'rgba(5, 150, 105, 0.06)',
    marginHorizontal: -spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    marginTop: 2,
  },
  mapsIconWrap: {
    backgroundColor: '#059669',
  },
  mapsLinkSub: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#047857',
    marginTop: 2,
  },
  statusChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
  },
  statusChipTxt: { flex: 1, fontSize: fontSize.sm, fontWeight: '800' },
  pastEventNote: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: brand.textMuted,
    paddingVertical: spacing.xs,
  },
  daysLeftInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  mutedCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.03)',
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  proseMuted: {
    marginTop: 2,
    fontSize: fontSize.sm,
    lineHeight: 22,
    color: brand.textSecondary,
    fontWeight: '500',
  },
  actionsCard: {
    paddingVertical: spacing.md + 2,
    gap: spacing.sm,
  },
  primaryBtnLg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: brand.primary,
    borderRadius: radius.full,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  primaryBtnLgTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.md },
  secondaryBtnLg: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    backgroundColor: brand.white,
    borderRadius: radius.full,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  secondaryBtnLgTxt: { color: brand.text, fontWeight: '800', fontSize: fontSize.md },
  confirmBtnLg: {
    backgroundColor: '#059669',
    borderRadius: radius.full,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomConnBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.border,
    backgroundColor: brand.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomConnBtn: {
    backgroundColor: '#059669',
    borderRadius: radius.full,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  bottomConnBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  bottomConnBtnTxt: { color: '#fff', fontWeight: '800', fontSize: fontSize.md },
  bottomLiveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  bottomLiveChipRtl: { marginLeft: 0, marginRight: 4 },
  bottomLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  bottomLiveChipTxt: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  successCard: {
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    borderColor: 'rgba(5, 150, 105, 0.25)',
    alignItems: 'center',
    paddingVertical: spacing.md + 2,
  },
  summaryProse: {
    fontSize: fontSize.md,
    lineHeight: 24,
    color: brand.text,
    fontWeight: '500',
  },
  liveBanner: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(220, 38, 38, 0.35)',
  },
  liveBannerTitle: { fontSize: fontSize.sm, fontWeight: '900', color: '#991b1b' },
  liveBannerSub: { marginTop: 4, fontSize: fontSize.xs, color: '#7f1d1d' },
  regBannerOpen: { color: '#15803d' },
  regBannerClosed: { color: '#be123c' },
  regHint: { marginTop: spacing.sm, fontSize: fontSize.xs, color: '#be123c', fontWeight: '600' },
  regPendingBox: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(245, 158, 11, 0.45)',
  },
  regPendingTxt: { fontSize: fontSize.sm, fontWeight: '600', color: '#92400e' },
  followUp: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(51, 62, 143, 0.2)',
  },
  followUpTitle: { fontSize: fontSize.sm, fontWeight: '900', color: brand.primary },
  followUpLine: { marginTop: 6, fontSize: fontSize.xs, color: brand.text, fontWeight: '600' },
  daysLeftBannerTxt: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.primary,
  },
  btnDisabled: { opacity: 0.5 },
  htmlWrap: { marginTop: spacing.sm },
  emptyTxt: { color: brand.textMuted },
  backBtn: { marginTop: spacing.md, padding: spacing.md },
  backBtnTxt: { color: brand.primary, fontWeight: '700' },
  confirmedTxt: { color: '#047857', fontWeight: '800', fontSize: fontSize.md, textAlign: 'center' },
  regModalRoot: { flex: 1, justifyContent: 'flex-end' },
  regModalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.45)' },
  regModalSheet: {
    backgroundColor: brand.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.section,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  regModalTitle: { fontSize: fontSize.md, fontWeight: '900', color: brand.text },
  regModalHint: { marginTop: 4, marginBottom: spacing.md, fontSize: fontSize.xs, color: brand.textSecondary },
  regFieldLabel: {
    marginTop: spacing.sm,
    marginBottom: 4,
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.textSecondary,
  },
  regInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: fontSize.sm,
    color: brand.text,
    backgroundColor: brand.white,
  },
  regInputDisabled: { backgroundColor: 'rgba(15,23,42,0.04)', color: brand.textSecondary },
  regPhoneHint: { marginTop: 4, fontSize: 11, color: brand.textMuted },
  regModalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  regBtnPrimary: {
    flex: 1,
    backgroundColor: brand.primary,
    borderRadius: radius.full,
    paddingVertical: 12,
    alignItems: 'center',
  },
  regBtnPrimaryTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.sm },
  regBtnGhost: {
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  regBtnGhostTxt: { color: brand.text, fontWeight: '800', fontSize: fontSize.sm },
});
