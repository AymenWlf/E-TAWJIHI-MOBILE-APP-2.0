import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState, type ComponentProps } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReferralProgramSection } from '@/components/account/ReferralProgramSection';
import { ReferralShareCodeBlock } from '@/components/account/ReferralShareCodeBlock';
import { ReferralTierProgress } from '@/components/account/ReferralTierProgress';
import { AppRefreshControl } from '@/components/ui/AppRefreshControl';
import { HeroLangSwitch } from '@/components/ui/HeroLangSwitch';
import { Text } from '@/components/ui/Text';
import type { HomeCopyKey } from '@/constants/i18n';
import { useLocale } from '@/contexts/LocaleContext';
import { useAuth } from '@/contexts/AuthContext';
import { ReferralLockedBanner } from '@/components/account/ReferralLockedBanner';
import { useUserReferral } from '@/hooks/useUserReferral';
import {
  getReferralRequiredServiceName,
  getReferralRequiredServiceSlug,
  isReferralProgramUnlocked,
} from '@/services/userReferral';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { homeShell } from '@/theme/homeShell';
import { recordReferralProgramPageView } from '@/services/referralProgramAnalytics';

export default function ReferralScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, isRTL, locale } = useLocale();
  const { getValidAccessToken } = useAuth();

  const {
    data: referralProgram,
    loading: referralLoading,
    error: referralError,
    reload: reloadReferral,
  } = useUserReferral(true);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reloadReferral();
    } finally {
      setRefreshing(false);
    }
  }, [reloadReferral]);

  useFocusEffect(
    useCallback(() => {
      void reloadReferral();
      void (async () => {
        const token = await getValidAccessToken();
        if (token) await recordReferralProgramPageView(token);
      })();
    }, [reloadReferral, getValidAccessToken]),
  );

  const referralUnlocked = isReferralProgramUnlocked(referralProgram);
  const requiredServiceName = getReferralRequiredServiceName(referralProgram);

  const openServicesCta = useCallback(() => {
    const slug = getReferralRequiredServiceSlug(referralProgram);
    if (slug) {
      router.push(`/boutique/service/${slug}`);
      return;
    }
    router.push('/boutique');
  }, [referralProgram, router]);

  const referralSteps: {
    titleKey: HomeCopyKey;
    bodyKey: HomeCopyKey;
    icon: ComponentProps<typeof FontAwesome>['name'];
  }[] = [
    { titleKey: 'referralStep1Title', bodyKey: 'referralStep1Body', icon: 'share-alt' },
    { titleKey: 'referralStep2Title', bodyKey: 'referralStep2Body', icon: 'user-plus' },
    { titleKey: 'referralStep3Title', bodyKey: 'referralStep3BodyNew', icon: 'shopping-cart' },
    { titleKey: 'referralStep4Title', bodyKey: 'referralStep4BodyNew', icon: 'gift' },
  ];

  return (
    <View style={[styles.root, isRTL ? styles.rtl : styles.ltr]}>
      <StatusBar style="light" />
      <View style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}>
        <View style={[styles.heroTop, isRTL && styles.rowRtl]}>
          <Pressable onPress={() => router.back()} style={styles.heroBack} hitSlop={12}>
            <FontAwesome name={isRTL ? 'chevron-right' : 'chevron-left'} size={18} color={homeShell.text} />
          </Pressable>
          <Text style={[styles.heroTitle, isRTL && styles.heroTitleRtl]}>{t('referralPageTitle')}</Text>
          <HeroLangSwitch />
        </View>
        <Text
          style={[styles.heroSub, isRTL && styles.heroSubRtl]}
          numberOfLines={3}>
          {t('referralPageSubtitle')}
        </Text>
      </View>

      <ScrollView
        style={isRTL ? styles.scrollRtl : undefined}
        contentContainerStyle={[
          styles.scroll,
          isRTL && styles.scrollContentRtl,
          { paddingBottom: spacing.xxl + insets.bottom },
        ]}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        {referralLoading && !referralProgram ? (
          <ActivityIndicator color={brand.primary} style={{ marginVertical: spacing.lg }} />
        ) : referralProgram && !referralUnlocked ? (
          <View style={[styles.panel, isRTL && styles.panelRtl]}>
            <ReferralLockedBanner
              requiredServiceName={requiredServiceName}
              rtl={isRTL}
              t={t}
              variant="card"
              onCtaPress={openServicesCta}
            />
          </View>
        ) : (
          <>
            <View style={[styles.panel, isRTL && styles.panelRtl]}>
              <ReferralShareCodeBlock
                referralCode={referralProgram?.referralCode ?? ''}
                referralLink={referralProgram?.referralLink}
                referredDiscountPercent={referralProgram?.referredDiscountPercent ?? 10}
                rtl={isRTL}
                t={t}
                variant="card"
                showLink
              />
            </View>

            {referralProgram?.tierProgress ? (
              <View style={[styles.panel, isRTL && styles.panelRtl]}>
                <ReferralTierProgress
                  tierProgress={referralProgram.tierProgress}
                  rtl={isRTL}
                  locale={locale}
                  t={t}
                  onClaimSuccess={() => void reloadReferral()}
                  embedded
                />
              </View>
            ) : null}

            <View style={[styles.panel, isRTL && styles.panelRtl]}>
              <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRtl]}>
                {t('referralHowItWorks')}
              </Text>
              {referralSteps.map((step) => (
                <View key={step.titleKey} style={[styles.stepRow, isRTL && styles.rowRtl]}>
                  <View style={styles.stepIcon}>
                    <FontAwesome name={step.icon} size={14} color={homeShell.blue} />
                  </View>
                  <View style={[styles.stepBody, isRTL && styles.stepBodyRtl]}>
                    <Text style={[styles.stepTitle, isRTL && styles.txtRtl]}>{t(step.titleKey)}</Text>
                    <Text style={[styles.stepTxt, isRTL && styles.txtRtl]}>{t(step.bodyKey)}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={[styles.panel, isRTL && styles.panelRtl]}>
              <ReferralProgramSection
                program={referralProgram}
                loading={referralLoading}
                error={referralError}
                rtl={isRTL}
                t={t}
                onReload={() => void reloadReferral()}
                compact
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  ltr: { direction: 'ltr' },
  rtl: { direction: 'rtl' },
  hero: {
    backgroundColor: homeShell.bg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    gap: spacing.sm,
    alignItems: 'stretch',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  heroBack: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: homeShell.text,
  },
  heroTitleRtl: { textAlign: 'center' },
  heroSub: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 18,
    textAlign: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: spacing.xs,
  },
  heroSubRtl: {
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  scrollRtl: {
    direction: 'rtl',
  },
  scrollContentRtl: {
    direction: 'rtl',
    alignItems: 'stretch',
  },
  scroll: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  panel: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: homeShell.card,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
  },
  panelRtl: {
    direction: 'rtl',
    alignItems: 'stretch',
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: homeShell.cardText,
    marginBottom: spacing.sm,
    textAlign: 'left',
  },
  sectionTitleRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${homeShell.blue}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBody: { flex: 1, gap: 2, minWidth: 0 },
  stepBodyRtl: {
    alignItems: 'flex-end',
  },
  stepTitle: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: homeShell.cardText,
  },
  stepTxt: {
    fontSize: fontSize.xs,
    color: homeShell.cardMuted,
    lineHeight: 17,
  },
  txtRtl: { textAlign: 'right', writingDirection: 'rtl' },
});
