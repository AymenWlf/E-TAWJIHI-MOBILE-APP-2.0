import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, router } from 'expo-router';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { HomePracticalInfoSection } from '@/components/home/HomePracticalInfoSection';
import { HomeStackedPackCards } from '@/components/home/HomeStackedPackCards';
import { HomeGreetingBlock } from '@/components/home/HomeGreetingBlock';
import { HomeTopBackdrop } from '@/components/home/HomeTopBackdrop';
import { HomeTopBar } from '@/components/home/HomeTopBar';
import { StoriesRow } from '@/components/home/StoriesRow';
import { StoryViewerModal } from '@/components/stories/StoryViewerModal';
import { Text } from '@/components/ui/Text';
import { homeStackCardsForLocale, storyChannelsForLocale } from '@/data/mock/homeFeed';
import { useLocale } from '@/contexts/LocaleContext';
import { useAppSidebar } from '@/contexts/AppSidebarContext';
import { useNotificationsDrawer } from '@/contexts/NotificationsDrawerContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEligibilityProfile } from '@/hooks/useEligibilityProfile';
import { useStoryReadChannels } from '@/hooks/useStoryReadChannels';
import { getMobileVisitorId } from '@/utils/visitorId';
import { navigatePracticalLink } from '@/utils/navigatePracticalLink';
import { fetchStoryChannels, recordStoryEvent } from '@/services/stories';
import { fetchDailyChallengeToday } from '@/services/dailyChallenge';
import { FILIERE_BAC_OPTIONS } from '@/constants/academicSetup';
import { homeShell } from '@/theme/homeShell';
import { brand, spacing } from '@/theme/tokens';

const H_PAD = spacing.xl;

export default function IndexScreen() {
  const { t, isRTL, locale } = useLocale();
  const { open: openSidebar } = useAppSidebar();
  const { unreadCount: notifUnreadCount, openDrawer, refreshUnread } = useNotificationsDrawer();
  const { user, isLoading, getValidAccessToken } = useAuth();
  const { profile: eligibilityProfile, loading: eligibilityLoading } = useEligibilityProfile();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const stackCardW = screenW - 2 * H_PAD;
  const { readIds, markChannelRead } = useStoryReadChannels();
  const [storyViewer, setStoryViewer] = useState<{ open: boolean; index: number }>({
    open: false,
    index: 0,
  });
  const [storyChannels, setStoryChannels] = useState(() => storyChannelsForLocale(locale));
  const [analyticsVisitorId, setAnalyticsVisitorId] = useState<string | null>(null);
  const feedTrackedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    void getMobileVisitorId().then(setAnalyticsVisitorId);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshUnread();
    }, [refreshUnread]),
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const loc = locale === 'ar' ? 'ar' : 'fr';
        const remote = await fetchStoryChannels(loc);
        if (!cancelled && remote.length > 0) {
          setStoryChannels(remote);
        } else if (!cancelled) {
          setStoryChannels(storyChannelsForLocale(locale));
        }
      } catch {
        if (!cancelled) setStoryChannels(storyChannelsForLocale(locale));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  /** Impressions « bande » stories (anneaux) — une fois par chaîne et session. */
  useEffect(() => {
    if (!analyticsVisitorId || storyChannels.length === 0) return;
    for (const ch of storyChannels) {
      if (feedTrackedIdsRef.current.has(ch.id)) continue;
      feedTrackedIdsRef.current.add(ch.id);
      void recordStoryEvent('feed_impression', {
        channelId: ch.id,
        visitorId: analyticsVisitorId,
        viewport: 'mobile',
      });
    }
  }, [analyticsVisitorId, storyChannels]);
  const [dailyOverlay, setDailyOverlay] = useState<{
    playedToday: boolean;
    infoReadToday: boolean;
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void (async () => {
        try {
          const token = await getValidAccessToken();
          const res = await fetchDailyChallengeToday(token);
          if (!alive || !res.success) return;
          const d = res.data;
          if (!d.available || !d.challengeDate) {
            if (alive) setDailyOverlay(null);
            return;
          }
          const k = `daily_info_read_${d.challengeDate}`;
          const ir = await AsyncStorage.getItem(k);
          if (alive) {
            setDailyOverlay({
              playedToday: Boolean(d.allGamesPlayed ?? d.playedToday),
              infoReadToday: ir === '1',
            });
          }
        } catch {
          if (alive) setDailyOverlay(null);
        }
      })();
      return () => {
        alive = false;
      };
    }, [getValidAccessToken]),
  );

  const stackCards = useMemo(() => {
    const base = homeStackCardsForLocale(locale);
    if (!dailyOverlay) return base;
    return base.map((card, idx) => {
      if (idx !== 0 || !card.dailyActions) return card;
      return {
        ...card,
        dailyActions: {
          playedToday: dailyOverlay.playedToday,
          infoReadToday: dailyOverlay.infoReadToday,
        },
      };
    });
  }, [locale, dailyOverlay]);

  const onPressPracticalItem = useCallback((id: string) => {
    navigatePracticalLink((href) => router.push(href as never), id);
  }, []);

  // ── Sous-titre du bloc salutation ───────────────────────────────────────────
  // Format : « Pack Standard · {filière} » ou « Pack Standard · BAC MISSION »
  // selon le profil académique chargé via useEligibilityProfile().
  // Si le profil n'est pas encore disponible (ou incomplet), on retombe sur la
  // chaîne i18n par défaut (`userSubtitle`) pour ne pas afficher un libellé
  // tronqué pendant le chargement.
  const userSubtitle = useMemo(() => {
    const pack = t('packStandardLabel');
    if (!user) return t('userSubtitle');
    if (eligibilityLoading) return '';
    if (!eligibilityProfile) return `${pack} · …`;
    if (eligibilityProfile.bacType === 'mission') {
      return `${pack} · ${t('bacMissionLabel')}`;
    }
    const filiereValue = (eligibilityProfile.filiere ?? '').trim();
    if (filiereValue !== '') {
      const opt = FILIERE_BAC_OPTIONS.find((o) => o.value === filiereValue);
      const filiereLabel = opt
        ? (locale === 'ar' ? opt.labelAr ?? opt.label : opt.label)
        : filiereValue;
      return `${pack} · ${filiereLabel}`;
    }
    return pack;
  }, [user, eligibilityLoading, eligibilityProfile, locale, t]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {/** Bleu jusqu’aux icônes de statut (iOS/Android) — plus de bande blanche au-dessus du header */}
      <View style={[styles.headerSafe, { paddingTop: insets.top }]}>
        <View style={styles.stickyHeader}>
          <HomeTopBar
            unreadCount={notifUnreadCount}
            onPressNotifications={() => openDrawer()}
            onPressProfile={() => router.push('/compte' as never)}
            onPressMenu={openSidebar}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: spacing.section + insets.bottom + 8 },
        ]}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        bounces={false}
        {...(Platform.OS === 'ios' ? { contentInsetAdjustmentBehavior: 'never' as const } : {})}
      >
        <View style={styles.heroShell}>
          <View style={styles.heroBackdropLayer} pointerEvents="none">
            <HomeTopBackdrop width={screenW} />
          </View>
          {isLoading ? (
            <View style={styles.userLoadingRow} accessibilityLabel="Loading user">
              <ActivityIndicator color={homeShell.text} />
              <Text style={styles.userLoadingTxt}>{t('greeting')}…</Text>
            </View>
          ) : (
            <HomeGreetingBlock
              firstName={(user?.firstName || user?.phone || '—') as string}
              subtitle={userSubtitle}
              subtitleLoading={Boolean(user) && eligibilityLoading}
              greetingWord={t('greeting')}
              rtl={isRTL}
            />
          )}
          <StoriesRow
            channels={storyChannels}
            readChannelIds={readIds}
            tone="dark"
            onOpenChannel={(index) => setStoryViewer({ open: true, index })}
          />
        </View>

        <HomeStackedPackCards
          cards={stackCards}
          width={stackCardW}
          onPressDailyGame={() => router.push('/daily-challenge')}
          onPressDailyInfo={() => router.push('/daily-challenge?openInfo=1')}
          onPressPracticalLink={onPressPracticalItem}
        />

        <HomePracticalInfoSection width={stackCardW} onPressItem={onPressPracticalItem} />
      </ScrollView>

      <StoryViewerModal
        visible={storyViewer.open}
        channels={storyChannels}
        initialChannelIndex={storyViewer.index}
        onClose={() => setStoryViewer((s) => ({ ...s, open: false }))}
        onChannelFullyRead={markChannelRead}
        analyticsVisitorId={analyticsVisitorId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: brand.white,
  },
  headerSafe: {
    backgroundColor: homeShell.bg,
    zIndex: 20,
  },
  /** Fond du scroll = blanc pour un overshoot propre sous le hero (pull + bas de page). */
  scroll: {
    flex: 1,
    backgroundColor: brand.white,
  },
  /** Logo + langue + actions : même bleu que la marque ; le safe top (encoche) est sur `headerSafe`. */
  stickyHeader: {
    backgroundColor: homeShell.bg,
    paddingHorizontal: H_PAD,
    paddingBottom: spacing.sm,
    zIndex: 20,
  },
  content: {
    paddingHorizontal: H_PAD,
    backgroundColor: brand.white,
    flexGrow: 1,
  },
  /** Bloc haut : fond bleu continu avec le header (pas de transparence sur blanc). */
  heroShell: {
    position: 'relative',
    marginHorizontal: -H_PAD,
    marginBottom: spacing.xs,
    paddingHorizontal: H_PAD,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    overflow: 'visible',
    backgroundColor: homeShell.bg,
  },
  heroBackdropLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'visible',
  },
  userLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  userLoadingTxt: {
    color: homeShell.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
});
