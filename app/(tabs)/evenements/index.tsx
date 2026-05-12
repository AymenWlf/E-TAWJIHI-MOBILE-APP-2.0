import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LiveNowPill } from '@/components/events/LiveNowPill';
import { SidebarMenuIconButton } from '@/components/SidebarMenuIconButton';
import { AppRefreshControl } from '@/components/ui/AppRefreshControl';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useSharePreview } from '@/contexts/SharePreviewContext';
import { fetchPlatformEvents, type PlatformEventBrief, type PlatformEventKind } from '@/services/platformEvents';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { platformEventDaysRemainingLabel } from '@/utils/platformEventCountdown';
import { resolvePlatformEventCoverUri } from '@/utils/platformEventCover';
import { formatPlatformEventDurationMobile } from '@/utils/eventDuration';
import { formatPlatformEventCardRange } from '@/utils/platformEventFormat';
import { platformEventDisplayTitle, platformEventKindBadgeText } from '@/utils/platformEventLocale';

type TabScope = 'upcoming' | 'live' | 'past';

function kindBadgeColors(kind: PlatformEventKind): { bg: string; text: string } {
  switch (kind) {
    case 'webinar':
      return { bg: 'rgba(79, 70, 229, 0.92)', text: '#fff' };
    case 'live':
      return { bg: 'rgba(225, 29, 72, 0.92)', text: '#fff' };
    default:
      return { bg: 'rgba(13, 148, 136, 0.92)', text: '#fff' };
  }
}

export default function EvenementsScreen() {
  const router = useRouter();
  const { t, isRTL, locale, setLocale } = useLocale();
  const { presentShare } = useSharePreview();
  const { getValidAccessToken } = useAuth();
  const [tab, setTab] = useState<TabScope>('upcoming');
  const [items, setItems] = useState<PlatformEventBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const token = await getValidAccessToken();
    const rows = await fetchPlatformEvents(token ?? undefined, tab);
    setItems(rows);
  }, [getValidAccessToken, tab]);

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

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar style="light" backgroundColor={brand.primary} />
      <View style={styles.hero}>
        <View style={[styles.heroTop, isRTL && styles.rowRtl]}>
          <SidebarMenuIconButton color={brand.white} />
          <View style={styles.heroTitles}>
            <Text style={[styles.heroTitle, isRTL && styles.rtl]}>{t('eventsAgendaTitle')}</Text>
          </View>
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
        </View>
        <View style={styles.tabsRow}>
          {(['upcoming', 'live', 'past'] as const).map((id) => {
            const active = tab === id;
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
                {id === 'live' ? (
                  <View style={[styles.tabLiveInner, isRTL && styles.rowRtl]}>
                    <View style={[styles.liveTabBadge, active && styles.liveTabBadgeOnWhite]}>
                      <Text style={styles.liveTabBadgeTxt}>LIVE</Text>
                    </View>
                    <Text style={[styles.tabTxt, active && styles.tabTxtActive, styles.tabTxtLive]} numberOfLines={1}>
                      {t('eventsTabLive')}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.tabTxt, active && styles.tabTxtActive]} numberOfLines={1}>
                    {id === 'upcoming' ? t('eventsTabUpcoming') : t('eventsTabPast')}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.body}>
        {loading ? (
          <ScrollView
            style={styles.bodyFill}
            contentContainerStyle={styles.centerGrow}
            keyboardShouldPersistTaps="handled"
            refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            <ActivityIndicator color={brand.primary} />
          </ScrollView>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => `ev-${item.id}`}
            style={[styles.bodyFill, isRTL ? { direction: 'rtl' } : undefined]}
            contentContainerStyle={styles.list}
            refreshControl={
              <AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => {
              const coverUri = resolvePlatformEventCoverUri(item);
              const kColors = kindBadgeColors(item.kind);
              const daysLeftLabel = !item.isPast
                ? platformEventDaysRemainingLabel(locale, {
                    startsAt: item.startsAt,
                    endsAt: item.endsAt,
                    isPast: item.isPast,
                  })
                : null;
              return (
                <Pressable
                  style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                  onPress={() => router.push(`/evenements/${item.id}` as never)}
                >
                  <View style={[styles.cardAccentBar, isRTL && styles.cardAccentBarRtl]} />
                  <View style={styles.cardImageWrap}>
                    <Image source={{ uri: coverUri }} style={styles.cardImage} resizeMode="cover" />
                    <View style={styles.cardImageScrim} />
                    <View style={styles.cardImageBottomFade} />
                    <View style={[styles.cardBadgesRow, isRTL && styles.rowRtl]}>
                      <View style={[styles.kindPill, { backgroundColor: kColors.bg }]}>
                        <Text style={[styles.kindPillTxt, { color: kColors.text }]}>
                          {platformEventKindBadgeText(t, item.kind, locale)}
                        </Text>
                      </View>
                      {item.isLiveNow ? (
                        <LiveNowPill label={t('eventsLiveNow')} isRTL={isRTL} />
                      ) : item.isPast ? (
                        <View style={styles.pastPill}>
                          <Text style={styles.pastPillTxt}>{t('eventsPastBadge')}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.cardBody}>
                    <Text style={[styles.cardTitle, isRTL && styles.rtl]} numberOfLines={2}>
                      {platformEventDisplayTitle(item, locale)}
                    </Text>
                    <View style={styles.titleDivider} />

                    <View style={styles.metaBlock}>
                      <View style={[styles.metaRow, isRTL && styles.rowRtl]}>
                        <View style={styles.metaIconCol}>
                          <FontAwesome name="calendar" size={14} color={brand.primary} />
                        </View>
                        <Text style={[styles.metaTxtStrong, isRTL && styles.rtl]} numberOfLines={3}>
                          {formatPlatformEventCardRange(item.startsAt, item.endsAt, locale, item.timezone)}
                        </Text>
                      </View>

                      <View style={[styles.metaRow, isRTL && styles.rowRtl]}>
                        <View style={styles.metaIconCol}>
                          <FontAwesome name="clock-o" size={14} color={brand.primary} />
                        </View>
                        <View style={styles.metaTextCol}>
                          <Text style={[styles.metaCaption, isRTL && styles.rtl]}>{t('eventsDuration')}</Text>
                          <Text style={[styles.metaTxtStrong, isRTL && styles.rtl]} numberOfLines={1}>
                            {formatPlatformEventDurationMobile(item.startsAt, item.endsAt, locale)}
                          </Text>
                        </View>
                      </View>

                      {daysLeftLabel ? (
                        <View style={[styles.daysLeftRow, isRTL && styles.rowRtl]}>
                          <View style={styles.metaIconCol}>
                            <FontAwesome name="clock-o" size={13} color={brand.primary} />
                          </View>
                          <Text style={[styles.daysLeftTxt, isRTL && styles.rtl]} numberOfLines={2}>
                            {daysLeftLabel}
                          </Text>
                        </View>
                      ) : null}

                      {!item.isPast ? (
                        <View style={[styles.regRow, isRTL && styles.rowRtl]}>
                          <View style={styles.metaIconCol}>
                            <FontAwesome
                              name={item.registrationOpen !== false ? 'unlock' : 'lock'}
                              size={13}
                              color={item.registrationOpen !== false ? '#15803d' : '#be123c'}
                            />
                          </View>
                          <Text
                            style={[
                              styles.regRowTxt,
                              item.registrationOpen !== false ? styles.regOpen : styles.regClosed,
                              isRTL && styles.rtl,
                            ]}
                            numberOfLines={2}
                          >
                            {item.registrationOpen !== false ? t('eventsRegOpen') : t('eventsRegClosed')}
                          </Text>
                        </View>
                      ) : null}

                      {item.locationLabel ? (
                        <View style={[styles.metaRow, isRTL && styles.rowRtl]}>
                          <View style={styles.metaIconCol}>
                            <FontAwesome name="map-marker" size={14} color={brand.textMuted} />
                          </View>
                          <View style={styles.metaTextCol}>
                            <Text style={[styles.metaCaption, isRTL && styles.rtl]}>{t('eventsDetailLocationLabel')}</Text>
                            <Text style={[styles.metaTxtMuted, isRTL && styles.rtl]} numberOfLines={2}>
                              {item.locationLabel}
                            </Text>
                          </View>
                        </View>
                      ) : null}
                      {item.kind === 'event' && item.locationMapsUrl ? (
                        <Pressable
                          onPress={async () => {
                            const u = item.locationMapsUrl?.trim();
                            if (!u) return;
                            const href = /^https?:\/\//i.test(u) ? u : `https://${u}`;
                            try {
                              await Linking.openURL(href);
                            } catch {
                              /* ignore */
                            }
                          }}
                          style={({ pressed }) => [
                            styles.metaRow,
                            isRTL && styles.rowRtl,
                            styles.mapsListRow,
                            pressed && { opacity: 0.88 },
                          ]}
                          accessibilityRole="link"
                          accessibilityLabel={t('eventsMapsLink')}
                        >
                          <View style={styles.metaIconCol}>
                            <FontAwesome name="map" size={14} color="#059669" />
                          </View>
                          <View style={styles.metaTextCol}>
                            <Text style={[styles.mapsListTxt, isRTL && styles.rtl]}>{t('eventsMapsLink')}</Text>
                          </View>
                          <FontAwesome name="external-link" size={12} color="#059669" />
                        </Pressable>
                      ) : null}
                    </View>

                    <View style={[styles.statsRow, isRTL && styles.rowRtl]}>
                      <View style={styles.statCell}>
                        <Text style={styles.statLabel}>{t('eventsRegisteredLabel')}</Text>
                        <Text style={styles.statValue}>
                          {item.showRegistrationCount && typeof item.registrationCount === 'number'
                            ? item.registrationCount
                            : '—'}
                        </Text>
                      </View>
                      <View style={styles.statSep} />
                      <View style={styles.statCell}>
                        <Text style={styles.statLabel}>{t('eventsPlacesLabel')}</Text>
                        <Text style={styles.statValue}>
                          {item.maxSeats != null && item.maxSeats > 0 ? item.maxSeats : '—'}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.cardFooter, isRTL && styles.rowRtl]}>
                      <Text style={[styles.detailLink, isRTL && styles.rtl]}>{t('eventsOpenDetail')}</Text>
                      <View style={styles.detailChevronWrap}>
                        <FontAwesome name={isRTL ? 'angle-left' : 'angle-right'} size={16} color={brand.primary} />
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <FontAwesome name="calendar-o" size={32} color={brand.primary} />
                <Text style={styles.emptyTxt}>
                  {tab === 'live' ? t('eventsEmptyLive') : t('eventsEmpty')}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.primary },
  body: { flex: 1, backgroundColor: brand.backgroundSoft },
  bodyFill: { flex: 1 },
  centerGrow: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  hero: {
    backgroundColor: brand.primary,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroTitles: { flex: 1, minWidth: 0 },
  heroTitle: { color: brand.white, fontSize: fontSize.xl, fontWeight: '900' },
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
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 4,
    borderRadius: radius.full,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: radius.full,
    minWidth: 0,
  },
  tabActive: { backgroundColor: brand.white },
  tabLiveInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    maxWidth: '100%',
  },
  liveTabBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
  },
  liveTabBadgeOnWhite: {
    backgroundColor: '#dc2626',
  },
  liveTabBadgeTxt: {
    fontSize: 8,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.6,
  },
  tabTxt: { color: brand.white, fontWeight: '700', fontSize: fontSize.xs },
  tabTxtActive: { color: brand.primary, fontWeight: '800' },
  tabTxtLive: { flexShrink: 1 },
  list: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.section * 2,
    gap: spacing.lg,
  },
  /** Aligné sur {@link EstablishmentCard} : bordure claire, ombre douce, bandeau vert. */
  card: {
    backgroundColor: homeShell.card,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    position: 'relative',
  },
  cardAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    zIndex: 2,
    backgroundColor: homeShell.green,
    borderTopLeftRadius: radius.xl,
    borderBottomLeftRadius: radius.xl,
  },
  cardAccentBarRtl: {
    left: undefined,
    right: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  cardPressed: { opacity: 0.96, transform: [{ scale: 0.995 }] },
  cardImageWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#e2e8f0',
    position: 'relative',
  },
  cardImage: { ...StyleSheet.absoluteFillObject },
  cardImageScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(15,23,42,0.08)',
  },
  cardImageBottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 72,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  /** léger voile bas pour lisibilité des badges si besoin */
  cardBadgesRow: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    top: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  kindPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  kindPillTxt: { fontSize: 10, fontWeight: '900', letterSpacing: 0.6 },
  pastPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
  },
  pastPillTxt: { fontSize: 10, fontWeight: '800', color: '#fff' },
  cardBody: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md + 2,
    paddingBottom: spacing.sm,
    gap: 0,
  },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '900', color: brand.text, lineHeight: 26 },
  titleDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  metaBlock: {
    gap: 10,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(51, 62, 143, 0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(51, 62, 143, 0.1)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  mapsListRow: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: radius.md,
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(5, 150, 105, 0.22)',
    alignItems: 'center',
  },
  mapsListTxt: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: '#047857',
    flex: 1,
    minWidth: 0,
  },
  metaIconCol: {
    width: 28,
    alignItems: 'center',
    paddingTop: 2,
  },
  metaTextCol: { flex: 1, minWidth: 0 },
  metaCaption: {
    fontSize: 10,
    fontWeight: '800',
    color: brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  metaTxtStrong: {
    flex: 1,
    minWidth: 0,
    fontSize: fontSize.sm,
    color: brand.text,
    fontWeight: '700',
    lineHeight: 20,
  },
  daysLeftRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(15, 23, 42, 0.06)',
    marginTop: 2,
    paddingTop: 10,
  },
  daysLeftTxt: {
    flex: 1,
    minWidth: 0,
    fontSize: fontSize.sm,
    color: brand.primary,
    fontWeight: '800',
    lineHeight: 20,
  },
  regRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(15, 23, 42, 0.06)',
    marginTop: 2,
    paddingTop: 10,
  },
  regRowTxt: { flex: 1, minWidth: 0, fontSize: fontSize.xs, fontWeight: '800', lineHeight: 18 },
  regOpen: { color: '#15803d' },
  regClosed: { color: '#be123c' },
  metaTxtMuted: { flex: 1, fontSize: fontSize.xs, color: brand.textMuted, fontWeight: '500', lineHeight: 18 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  statCell: { flex: 1, alignItems: 'center' },
  statSep: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', backgroundColor: 'rgba(15,23,42,0.08)' },
  statLabel: { fontSize: 9, fontWeight: '800', color: brand.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
  statValue: { fontSize: fontSize.sm, fontWeight: '900', color: brand.text, marginTop: 2 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(15, 23, 42, 0.08)',
  },
  detailLink: { flex: 1, fontSize: fontSize.sm, fontWeight: '800', color: brand.primary },
  detailChevronWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(51, 62, 143, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingVertical: spacing.section * 2, gap: spacing.sm },
  emptyTxt: { color: brand.textMuted, fontSize: fontSize.sm, textAlign: 'center' },
});
