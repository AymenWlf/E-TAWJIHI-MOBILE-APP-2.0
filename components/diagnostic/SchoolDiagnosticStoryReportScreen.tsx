import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DiagnosticRecommendationsTawjihPlusGate } from '@/components/diagnostic/DiagnosticRecommendationsTawjihPlusGate';
import { DiagnosticLoadingView } from '@/components/diagnostic/DiagnosticLoadingView';
import { DiagnosticStatusBar } from '@/components/diagnostic/DiagnosticUi';
import { SchoolDiagnosticStoryCarousel } from '@/components/diagnostic/SchoolDiagnosticStoryCarousel';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { getUserFacingApiError } from '@/utils/apiError';
import { useTawjihPlusAccess } from '@/hooks/useTawjihPlusAccess';
import {
  fetchSchoolRecommendationDiagnosticByPublicCode,
  generateSchoolDiagnosticRecommendations,
  type SchoolDiagnosticFullResult,
} from '@/services/schoolRecommendationDiagnostic';
import { listCities, listAllSecteursActive } from '@/services/referenceData';
import { postPlanReussiteStep } from '@/services/planReussiteSteps';
import { brand, fontSize, spacing } from '@/theme/tokens';
import { buildSchoolDiagnosticStoryReport } from '@/utils/buildSchoolDiagnosticStoryReport';
import {
  buildPayloadDisplayContext,
  resolveDiagnosticReportLocale,
  type DiagnosticReportLocale,
} from '@/utils/schoolDiagnosticPayloadDisplayContext';
import { pollSchoolDiagnosticGrokUntilReady } from '@/utils/pollSchoolDiagnosticGrok';
import { persistSchoolDiagnosticResult } from '@/utils/schoolDiagnosticStorage';
import { sortSchoolDiagnosticRecommendationsWithSeuil } from '@/utils/schoolDiagnosticSeuilCompatibility';
import { computeDiagnosticBacComparisonNote } from '@/utils/diagnosticBacComparisonNote';
import { notifySchoolDiagnosticRecommendationsRefresh } from '@/utils/schoolDiagnosticRecommendationsNotify';
import FontAwesome from '@expo/vector-icons/FontAwesome';

function fallbackAcademicYearLabel(): string {
  const y = new Date().getFullYear();
  const m = new Date().getMonth();
  const start = m >= 8 ? y : y - 1;
  return `${start}-${start + 1}`;
}

export function SchoolDiagnosticStoryReportScreen() {
  const { c } = useLocalSearchParams<{ c?: string }>();
  const { getValidAccessToken, user } = useAuth();
  const { locale, isRTL, t } = useLocale();
  const { hasAccess: hasTawjihPlusAccess, loading: tawjihPlusLoading, refresh: refreshTawjihPlusAccess } =
    useTawjihPlusAccess();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [diagnosticId, setDiagnosticId] = useState<number | null>(null);
  const [recommendationsDeferred, setRecommendationsDeferred] = useState(false);
  const [generatingRecommendations, setGeneratingRecommendations] = useState(false);
  const generateStartedRef = useRef(false);
  const [grokPending, setGrokPending] = useState(false);
  const [profileSummary, setProfileSummary] = useState<string | null>(null);
  const [globalComment, setGlobalComment] = useState<string | null>(null);
  const [academicYearLabel, setAcademicYearLabel] = useState<string | null>(null);
  const [items, setItems] = useState<Awaited<ReturnType<typeof fetchSchoolRecommendationDiagnosticByPublicCode>>['recommendations']>([]);
  const [diagnosticPayload, setDiagnosticPayload] = useState<Record<string, unknown>>({});
  const [reportLocale, setReportLocale] = useState<DiagnosticReportLocale>('fr');
  const [lookupReady, setLookupReady] = useState(false);
  const [citiesLookup, setCitiesLookup] = useState<{ id: number; titre: string }[]>([]);
  const [sectorsLookup, setSectorsLookup] = useState<
    { id: number; titre: string; titreAr?: string | null }[]
  >([]);

  const publicCode = typeof c === 'string' ? c.trim().toLowerCase() : '';

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const [cities, secteurs] = await Promise.all([listCities(8000), listAllSecteursActive()]);
        if (!alive) return;
        setCitiesLookup(
          cities
            .map((row) => ({ id: Number(row.id), titre: String(row.titre ?? '').trim() }))
            .filter((row) => Number.isFinite(row.id) && row.titre !== ''),
        );
        setSectorsLookup(
          secteurs.map((s) => ({
            id: Number(s.id),
            titre: String(s.titre ?? s.code ?? '').trim(),
            titreAr: s.titreAr ?? null,
          })),
        );
      } catch {
        if (alive) {
          setCitiesLookup([]);
          setSectorsLookup([]);
        }
      } finally {
        if (alive) setLookupReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const applyFromServer = useCallback((d: SchoolDiagnosticFullResult) => {
      setDiagnosticId(d.id);
      const deferred = Boolean(d.recommendationsDeferred);
      setRecommendationsDeferred(deferred);
      if (deferred) generateStartedRef.current = false;
      setGrokPending(Boolean(d.grokPending));
      setProfileSummary(d.profileSummary ?? null);
      setGlobalComment(d.globalComment ?? null);
      setAcademicYearLabel(d.academicYearLabel ?? null);
      setItems(Array.isArray(d.recommendations) ? d.recommendations : []);
      const pl = (d.payload ?? {}) as Record<string, unknown>;
      setDiagnosticPayload(pl);
      setReportLocale(resolveDiagnosticReportLocale(pl, locale === 'ar' ? 'ar' : 'fr'));
      void persistSchoolDiagnosticResult(d.id, d.publicCode, user?.id ?? null);
      notifySchoolDiagnosticRecommendationsRefresh();
    },
    [locale, user?.id],
  );

  useEffect(() => {
    if (!/^[a-f0-9]{32}$/.test(publicCode)) {
      setError('Lien invalide');
      setLoading(false);
      return;
    }
    let alive = true;
    void (async () => {
      try {
        const token = await getValidAccessToken();
        const data = await fetchSchoolRecommendationDiagnosticByPublicCode(publicCode, token);
        if (!alive) return;
        applyFromServer(data);
        const token2 = await getValidAccessToken();
        if (token2) {
          await postPlanReussiteStep(token2, 'quickDiagnosticReportVisited').catch(() => undefined);
        }
      } catch (e) {
        if (alive) setError(getUserFacingApiError(e, t, { context: 'diagnostic' }));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [publicCode, getValidAccessToken, applyFromServer, t]);

  useFocusEffect(
    useCallback(() => {
      void refreshTawjihPlusAccess();
    }, [refreshTawjihPlusAccess]),
  );

  useEffect(() => {
    if (loading || tawjihPlusLoading || !recommendationsDeferred || !hasTawjihPlusAccess) {
      return;
    }
    if (diagnosticId == null || generateStartedRef.current) return;
    generateStartedRef.current = true;
    let alive = true;
    setGeneratingRecommendations(true);
    void (async () => {
      try {
        const token = await getValidAccessToken();
        const generated = await generateSchoolDiagnosticRecommendations(diagnosticId, token);
        if (!alive) return;
        const full = await fetchSchoolRecommendationDiagnosticByPublicCode(
          generated.publicCode,
          token,
        );
        if (!alive) return;
        setRecommendationsDeferred(false);
        applyFromServer(full);
      } catch (e) {
        if (alive) {
          generateStartedRef.current = false;
          setError(getUserFacingApiError(e, t, { context: 'diagnostic' }));
        }
      } finally {
        if (alive) setGeneratingRecommendations(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [
    applyFromServer,
    diagnosticId,
    getValidAccessToken,
    hasTawjihPlusAccess,
    loading,
    recommendationsDeferred,
    t,
    tawjihPlusLoading,
  ]);

  useEffect(() => {
    if (!/^[a-f0-9]{32}$/.test(publicCode) || !grokPending || recommendationsDeferred) return;
    let alive = true;
    void (async () => {
      const token = await getValidAccessToken();
      await pollSchoolDiagnosticGrokUntilReady(
        () =>
          fetchSchoolRecommendationDiagnosticByPublicCode(publicCode, token),
        {
          onUpdate: (d) => {
            if (alive && d) applyFromServer(d);
          },
        },
      );
    })();
    return () => {
      alive = false;
    };
  }, [publicCode, grokPending, recommendationsDeferred, getValidAccessToken, applyFromServer]);

  const showRecommendationsPaywall =
    recommendationsDeferred && !tawjihPlusLoading && !hasTawjihPlusAccess;

  const sortedItems = useMemo(() => {
    const summary = computeDiagnosticBacComparisonNote(diagnosticPayload);
    return sortSchoolDiagnosticRecommendationsWithSeuil(items, summary);
  }, [items, diagnosticPayload]);

  const cards = useMemo(() => {
    if (!lookupReady) return [];
    const ctx = buildPayloadDisplayContext(citiesLookup, sectorsLookup, reportLocale);
    return buildSchoolDiagnosticStoryReport({
      payload: diagnosticPayload,
      profileSummary,
      globalComment,
      academicYearLabel: academicYearLabel ?? fallbackAcademicYearLabel(),
      grokAvailable: true,
      recommendations: sortedItems,
      locale: reportLocale,
      displayContext: ctx,
    });
  }, [
    lookupReady,
    citiesLookup,
    sectorsLookup,
    reportLocale,
    diagnosticPayload,
    profileSummary,
    globalComment,
    academicYearLabel,
    sortedItems,
  ]);

  const storyRtl = reportLocale === 'ar' || isRTL;
  const swipeHint =
    reportLocale === 'ar'
      ? 'اسحب للمتابعة'
      : 'Glissez pour continuer';

  const openFullReport = useCallback(() => {
    router.push({
      pathname: '/diagnostic-ecoles/resultats',
      params: { c: publicCode },
    } as never);
  }, [publicCode]);

  if (loading || tawjihPlusLoading) {
    return (
      <DiagnosticLoadingView variant="report" rtl={storyRtl} locale={reportLocale} />
    );
  }

  if (error) {
    return (
      <View style={styles.errRoot}>
        <DiagnosticStatusBar />
        <SafeAreaView style={styles.errSafe}>
          <Text style={styles.errTxt}>{error}</Text>
          <Pressable onPress={() => router.replace('/diagnostic-ecoles' as never)} style={styles.errBtn}>
            <Text style={styles.errBtnTxt}>Retour</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  if (showRecommendationsPaywall) {
    return (
      <DiagnosticRecommendationsTawjihPlusGate
        rtl={storyRtl}
        onBack={() => router.replace('/(tabs)' as never)}
      />
    );
  }

  if (generatingRecommendations || (grokPending && items.length === 0)) {
    return (
      <DiagnosticLoadingView variant="ia" rtl={storyRtl} locale={reportLocale} />
    );
  }

  return (
    <View style={[styles.root, storyRtl && styles.rootRtl]}>
      <DiagnosticStatusBar />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={[styles.header, storyRtl && styles.headerRtl]}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <FontAwesome
              name={storyRtl ? 'chevron-right' : 'chevron-left'}
              size={18}
              color={brand.text}
            />
          </Pressable>
          <Text style={[styles.headerTitle, storyRtl && styles.rtlText]} numberOfLines={1}>
            {reportLocale === 'ar' ? 'تقرير التشخيص' : 'Rapport du diagnostic'}
          </Text>
          {grokPending ? (
            <ActivityIndicator size="small" color={brand.primary} style={styles.headerSpinner} />
          ) : (
            <View style={styles.headerSpinner} />
          )}
        </View>

        <SchoolDiagnosticStoryCarousel
          cards={cards}
          locale={reportLocale}
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
          onOpenFullReport={openFullReport}
          swipeHint={swipeHint}
          embedScreenHeader
          parentDirectionRtl={storyRtl}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  rootRtl: { direction: 'rtl' },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  headerRtl: { flexDirection: 'row-reverse' },
  backBtn: { padding: 4 },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '900',
    color: brand.text,
  },
  headerSpinner: { width: 24 },
  rtlText: { writingDirection: 'rtl', textAlign: 'right' },
  errRoot: { flex: 1, backgroundColor: brand.white },
  errSafe: { flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  errTxt: { textAlign: 'center', color: brand.textSecondary },
  errBtn: {
    alignSelf: 'center',
    backgroundColor: brand.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 10,
  },
  errBtnTxt: { color: brand.white, fontWeight: '800' },
});
