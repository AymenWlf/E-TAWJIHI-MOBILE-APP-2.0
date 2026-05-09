import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { HeroEducationCarousel } from '@/components/home/HeroEducationCarousel';
import { HomePracticalInfoSection } from '@/components/home/HomePracticalInfoSection';
import { HomeStackedPackCards } from '@/components/home/HomeStackedPackCards';
import { HomeGreetingBlock } from '@/components/home/HomeGreetingBlock';
import { HomeTopBackdrop } from '@/components/home/HomeTopBackdrop';
import { HomeTopBar } from '@/components/home/HomeTopBar';
import { NewsCarousel } from '@/components/home/NewsCarousel';
import { PlanOffersSection } from '@/components/home/PlanOffersSection';
import { StoriesRow } from '@/components/home/StoriesRow';
import { StoryViewerModal } from '@/components/stories/StoryViewerModal';
import { Text } from '@/components/ui/Text';
import {
  heroSlidesForLocale,
  homeStackCardsForLocale,
  mockUnreadNotifications,
  newsForLocale,
  packOffersForLocale,
  storyChannelsForLocale,
} from '@/data/mock/homeFeed';
import { useLocale } from '@/contexts/LocaleContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEligibilityProfile } from '@/hooks/useEligibilityProfile';
import { useStoryReadChannels } from '@/hooks/useStoryReadChannels';
import { FILIERE_BAC_OPTIONS } from '@/constants/academicSetup';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, spacing } from '@/theme/tokens';

const H_PAD = spacing.xl;

export default function IndexScreen() {
  const { t, isRTL, locale } = useLocale();
  const { user, isLoading } = useAuth();
  const { profile: eligibilityProfile } = useEligibilityProfile();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const stackCardW = screenW - 2 * H_PAD;
  const { readIds, markChannelRead } = useStoryReadChannels();
  const [storyViewer, setStoryViewer] = useState<{ open: boolean; index: number }>({
    open: false,
    index: 0,
  });
  const heroSlides = useMemo(() => heroSlidesForLocale(locale), [locale]);
  const storyChannels = useMemo(() => storyChannelsForLocale(locale), [locale]);
  const stackCards = useMemo(() => homeStackCardsForLocale(locale), [locale]);
  const packOffers = useMemo(() => packOffersForLocale(locale), [locale]);
  const newsItems = useMemo(() => newsForLocale(locale), [locale]);

  const onPressPracticalItem = useCallback((_id: string) => {
    // Shell : brancher navigation / deep link vers l’écran du lien pratique.
  }, []);

  // ── Sous-titre du bloc salutation ───────────────────────────────────────────
  // Format : « Pack Standard · {filière} » ou « Pack Standard · BAC MISSION »
  // selon le profil académique chargé via useEligibilityProfile().
  // Si le profil n'est pas encore disponible (ou incomplet), on retombe sur la
  // chaîne i18n par défaut (`userSubtitle`) pour ne pas afficher un libellé
  // tronqué pendant le chargement.
  const userSubtitle = useMemo(() => {
    const pack = t('packStandardLabel');
    if (!eligibilityProfile) return t('userSubtitle');
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
  }, [eligibilityProfile, locale, t]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {/** Bleu jusqu’aux icônes de statut (iOS/Android) — plus de bande blanche au-dessus du header */}
      <View style={[styles.headerSafe, { paddingTop: insets.top }]}>
        <View style={styles.stickyHeader}>
          <HomeTopBar
            unreadCount={mockUnreadNotifications}
            onPressNotifications={() => {}}
            onPressProfile={() => {}}
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
          onPressDailyGame={() => Alert.alert(t('gameDailyTitle'), t('gameDailyBody'))}
          onPressDailyInfo={() => Alert.alert(t('infoDailyTitle'), t('infoDailyBody'))}
          onPressPracticalLink={onPressPracticalItem}
        />

        <HomePracticalInfoSection width={stackCardW} onPressItem={onPressPracticalItem} />

        <View style={styles.bannerRackFirst}>
          <HeroEducationCarousel slides={heroSlides} width={stackCardW} />
        </View>

        <PlanOffersSection
          title={t('planOffersTitle')}
          linkLabel={t('planOffersLink')}
          offers={packOffers}
          onPressLink={() => {}}
          onPressOffer={() => {}}
        />

        <Text style={[styles.infosTitle, isRTL && styles.infosTitleRtl]}>{t('newsTitle')}</Text>
        <NewsCarousel items={newsItems} onPressItem={() => {}} />

        <View style={styles.footerSpacer} />
      </ScrollView>

      <StoryViewerModal
        visible={storyViewer.open}
        channels={storyChannels}
        initialChannelIndex={storyViewer.index}
        onClose={() => setStoryViewer((s) => ({ ...s, open: false }))}
        onChannelFullyRead={markChannelRead}
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
  bannerRackFirst: {
    marginTop: spacing.section,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  bannerRackNext: {
    marginTop: spacing.md,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  infosTitle: {
    color: brand.text,
    fontSize: fontSize.md,
    fontWeight: '800',
    marginTop: spacing.section,
    marginBottom: spacing.md,
    letterSpacing: -0.2,
  },
  infosTitleRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  footerSpacer: {
    height: spacing.xxl,
  },
});
