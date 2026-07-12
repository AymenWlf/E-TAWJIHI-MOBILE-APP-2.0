import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SidebarMenuIconButton } from '@/components/SidebarMenuIconButton';
import { AppRefreshControl } from '@/components/ui/AppRefreshControl';
import { LoadErrorState } from '@/components/ui/LoadErrorState';
import { HeroLangSwitch } from '@/components/ui/HeroLangSwitch';
import { Text } from '@/components/ui/Text';
import { TassjilSchoolCard } from '@/components/tassjil/TassjilSchoolCard';
import { TassjilSchoolQuickFilters } from '@/components/tassjil/TassjilSchoolQuickFilters';
import { ETAWJIHI_TRANSFER_SUPPORT_PHONE, supportPhoneWaDigits } from '@/constants/etawjihiSupport';
import {
  filterTassjilSchoolsByStatuts,
  sortSchoolsByDateFin,
} from '@/constants/tassjilInscriptionStatus';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useEligibilityProfile } from '@/hooks/useEligibilityProfile';
import { fetchTassjilPanierEcoles } from '@/services/tassjilInscriptions';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { TassjilSchool } from '@/types/tassjilSchoolChoices';
import { getUserFacingApiError } from '@/utils/apiError';
import { openWhatsAppChat } from '@/utils/openWhatsApp';
import {
  buildTassjilDisplaySchools,
  filterTassjilSchoolsByEligibility,
} from '@/utils/tassjilDisplaySchools';
import { getTassjilDossierEtatDisplay } from '@/utils/tassjilDossierEtat';

const H_PAD = spacing.lg;

function BrandedEmptyState({
  icon,
  title,
  body,
  actionLabel,
  onAction,
  isRTL,
}: {
  icon: ComponentProps<typeof FontAwesome>['name'];
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  isRTL: boolean;
}) {
  return (
    <View style={emptyStyles.card}>
      <View style={emptyStyles.iconWrap}>
        <FontAwesome name={icon} size={28} color={brand.primary} />
      </View>
      <Text style={[emptyStyles.title, isRTL && emptyStyles.rtl]}>{title}</Text>
      <Text style={[emptyStyles.body, isRTL && emptyStyles.rtl]}>{body}</Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [emptyStyles.btn, pressed && { opacity: 0.9 }]}
        >
          <Text style={emptyStyles.btnTxt}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  card: {
    marginTop: spacing.md,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: brand.text,
    textAlign: 'center',
  },
  body: {
    fontSize: fontSize.sm,
    color: brand.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  btn: {
    marginTop: spacing.sm,
    backgroundColor: brand.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
  },
  btnTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.sm },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
});

export default function TassjilSchoolChoicesScreen() {
  const router = useRouter();
  const { getValidAccessToken } = useAuth();
  const { t, isRTL } = useLocale();
  const { profile: eligibilityProfile } = useEligibilityProfile();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [schools, setSchools] = useState<TassjilSchool[]>([]);
  const [etatDossierSuivi, setEtatDossierSuivi] = useState<string | null>(null);
  const [etablissementFinalise, setEtablissementFinalise] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noTassjilDossier, setNoTassjilDossier] = useState(false);
  const [inscriptionFilter, setInscriptionFilter] = useState('');
  const [suiviFilter, setSuiviFilter] = useState('');
  const [eligibleOnlyFilter, setEligibleOnlyFilter] = useState(true);

  const onBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  }, [router]);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    setNoTassjilDossier(false);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        router.replace('/login');
        return;
      }
      const res = await fetchTassjilPanierEcoles(token);
      if (!res.success) {
        if (res.code === 'LEGACY_LINK_REQUIRED') {
          setNoTassjilDossier(true);
          setSchools([]);
          setEtatDossierSuivi(null);
          setEtablissementFinalise(null);
          return;
        }
        throw new Error(res.message ?? t('tassjilSchoolsErrGeneric'));
      }
      const list = sortSchoolsByDateFin(
        buildTassjilDisplaySchools(
          res.data?.selectedSchools ?? [],
          res.data?.availableSchools,
          res.data?.displayMode ?? 'full_catalog',
        ),
      );
      setSchools(list);
      setEtatDossierSuivi(res.data?.etatDossierSuivi ?? null);
      setEtablissementFinalise(res.data?.etablissementFinalise ?? null);
    } catch (e) {
      setError(getUserFacingApiError(e, t, { context: 'generic' }) ?? t('tassjilSchoolsErrGeneric'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getValidAccessToken, router, t]);

  useFocusEffect(
    useCallback(() => {
      void load(false);
    }, [load]),
  );

  const openSupport = () => {
    void openWhatsAppChat({
      message: t('tassjilSchoolsSupportMessage'),
      phoneWaDigits: supportPhoneWaDigits(ETAWJIHI_TRANSFER_SUPPORT_PHONE),
    });
  };

  const countLabel = useMemo(
    () => t('tassjilSchoolsCount').replace('{count}', String(schools.length)),
    [schools.length, t],
  );

  const dossierEtatDisplay = useMemo(
    () =>
      getTassjilDossierEtatDisplay(
        etatDossierSuivi,
        etablissementFinalise,
        isRTL,
        t('tassjilDossierEtatPrestationEnCours'),
      ),
    [etatDossierSuivi, etablissementFinalise, isRTL, t],
  );

  const filteredSchools = useMemo(() => {
    const byEligibility = filterTassjilSchoolsByEligibility(
      schools,
      eligibleOnlyFilter,
      eligibilityProfile,
    );
    return filterTassjilSchoolsByStatuts(byEligibility, inscriptionFilter, suiviFilter);
  }, [schools, eligibleOnlyFilter, eligibilityProfile, inscriptionFilter, suiviFilter]);

  const renderBody = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={brand.primary} />
          <Text style={styles.loadingText}>{t('tassjilSchoolsLoading')}</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorWrap}>
          <LoadErrorState message={error} onRetry={() => void load(false)} />
        </View>
      );
    }

    if (noTassjilDossier) {
      return (
        <BrandedEmptyState
          icon="folder-open-o"
          title={t('tassjilNoDossierTitle')}
          body={t('tassjilNoDossierBody')}
          actionLabel={t('tassjilLinkSupport')}
          onAction={openSupport}
          isRTL={isRTL}
        />
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<AppRefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}
      >
        {schools.length === 0 ? (
          <BrandedEmptyState
            icon="graduation-cap"
            title={t('tassjilSchoolsEmptyTitle')}
            body={t('tassjilSchoolsEmptyBody')}
            actionLabel={t('tassjilLinkSupport')}
            onAction={openSupport}
            isRTL={isRTL}
          />
        ) : (
          <>
            <View style={[styles.summaryRow, isRTL && styles.rowRtl]}>
              <View style={[styles.summaryChip, isRTL && styles.rowRtl]}>
                <FontAwesome name="university" size={13} color={brand.primary} />
                <Text style={styles.summaryChipTxt}>{countLabel}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={openSupport}
                style={({ pressed }) => [styles.supportChip, isRTL && styles.rowRtl, pressed && { opacity: 0.88 }]}
              >
                <FontAwesome name="whatsapp" size={14} color={homeShell.greenDark} />
                <Text style={styles.supportChipTxt}>{t('tassjilSupportWhatsapp')}</Text>
              </Pressable>
            </View>

            <TassjilSchoolQuickFilters
              schools={schools}
              eligibleOnly={eligibleOnlyFilter}
              onEligibleOnlyChange={setEligibleOnlyFilter}
              eligibilityProfile={eligibilityProfile}
              inscriptionFilter={inscriptionFilter}
              suiviFilter={suiviFilter}
              onInscriptionFilterChange={setInscriptionFilter}
              onSuiviFilterChange={setSuiviFilter}
              filteredCount={filteredSchools.length}
            />

            {filteredSchools.length === 0 ? (
              <BrandedEmptyState
                icon="filter"
                title={t('tassjilFilterEmptyTitle')}
                body={t('tassjilFilterEmptyBody')}
                actionLabel={t('tassjilFilterReset')}
                onAction={() => {
                  setEligibleOnlyFilter(true);
                  setInscriptionFilter('');
                  setSuiviFilter('');
                }}
                isRTL={isRTL}
              />
            ) : (
              filteredSchools.map((school) => <TassjilSchoolCard key={school.id} school={school} />)
            )}
          </>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.hero}>
          <View style={[styles.heroNavRow, isRTL && styles.rowRtl]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('loginBack')}
              onPress={onBack}
              hitSlop={12}
              style={({ pressed }) => [styles.heroBackBtn, pressed && styles.heroBackBtnPressed]}
            >
              <FontAwesome name={isRTL ? 'chevron-right' : 'chevron-left'} size={18} color={homeShell.text} />
            </Pressable>
            <SidebarMenuIconButton trailingSpacing={0} />
            <View style={styles.heroNavSpacer} />
            <HeroLangSwitch />
          </View>

          <View style={styles.heroTitles}>
            <Text style={[styles.heroEyebrow, isRTL && styles.rtlHero]}>{t('tassjilSchoolsHeroEyebrow')}</Text>
            <Text style={[styles.heroTitle, isRTL && styles.rtlHero]}>{t('tassjilSchoolsTitle')}</Text>
            <Text style={[styles.heroSub, isRTL && styles.rtlHero]}>{t('tassjilSchoolsSubtitle')}</Text>
            {!loading && !error && !noTassjilDossier ? (
              <View
                style={[
                  styles.dossierEtatChip,
                  dossierEtatDisplay.tone === 'success' && styles.dossierEtatChipSuccess,
                  dossierEtatDisplay.tone === 'warning' && styles.dossierEtatChipWarning,
                  dossierEtatDisplay.tone === 'danger' && styles.dossierEtatChipDanger,
                  isRTL && styles.rowRtl,
                ]}
              >
                <FontAwesome
                  name={dossierEtatDisplay.hasEtat ? 'flag' : 'clock-o'}
                  size={12}
                  color={
                    dossierEtatDisplay.tone === 'success'
                      ? '#047857'
                      : dossierEtatDisplay.tone === 'warning'
                        ? '#b45309'
                        : dossierEtatDisplay.tone === 'danger'
                          ? '#b91c1c'
                          : homeShell.text
                  }
                />
                <Text
                  style={[
                    styles.dossierEtatChipTxt,
                    dossierEtatDisplay.tone === 'success' && styles.dossierEtatChipTxtSuccess,
                    dossierEtatDisplay.tone === 'warning' && styles.dossierEtatChipTxtWarning,
                    dossierEtatDisplay.tone === 'danger' && styles.dossierEtatChipTxtDanger,
                    isRTL && styles.rtlHero,
                  ]}
                  numberOfLines={2}
                >
                  {dossierEtatDisplay.label}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={[styles.heroAccentBar, isRTL && styles.heroAccentBarRtl]} />
        </View>
      </SafeAreaView>

      <View style={styles.body}>{renderBody()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.primary },
  headerSafe: { backgroundColor: brand.primary },
  hero: {
    paddingHorizontal: H_PAD,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  heroNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroBackBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBackBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  heroNavSpacer: { flex: 1 },
  heroTitles: { gap: 4 },
  heroEyebrow: {
    color: homeShell.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: homeShell.text,
    fontSize: fontSize.xxl,
    fontWeight: '900',
    lineHeight: 30,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: fontSize.sm,
    lineHeight: 19,
    marginTop: 2,
  },
  dossierEtatChip: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.16)',
    maxWidth: '100%',
  },
  dossierEtatChipSuccess: {
    backgroundColor: 'rgba(209, 250, 229, 0.95)',
  },
  dossierEtatChipWarning: {
    backgroundColor: 'rgba(254, 243, 199, 0.95)',
  },
  dossierEtatChipDanger: {
    backgroundColor: 'rgba(254, 226, 226, 0.95)',
  },
  dossierEtatChipTxt: {
    color: homeShell.text,
    fontSize: fontSize.xs,
    fontWeight: '800',
    flexShrink: 1,
  },
  dossierEtatChipTxtSuccess: { color: '#047857' },
  dossierEtatChipTxtWarning: { color: '#b45309' },
  dossierEtatChipTxtDanger: { color: '#b91c1c' },
  heroAccentBar: {
    height: 3,
    width: 48,
    borderRadius: radius.full,
    backgroundColor: homeShell.green,
  },
  heroAccentBarRtl: { alignSelf: 'flex-end' },
  body: { flex: 1, backgroundColor: brand.backgroundSoft },
  scrollContent: {
    paddingHorizontal: H_PAD,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  loadingText: { color: brand.textMuted, fontWeight: '600' },
  errorWrap: { flex: 1, paddingHorizontal: H_PAD, paddingTop: spacing.lg },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  summaryChipTxt: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.primary,
  },
  supportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: homeShell.greenSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: homeShell.greenBorder,
  },
  supportChipTxt: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: homeShell.greenDark,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  rtlHero: { textAlign: 'right', writingDirection: 'rtl' },
});
