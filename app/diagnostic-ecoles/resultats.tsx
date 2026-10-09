import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import { Platform, Pressable, ScrollView, SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DiagnosticRecommendationsTawjihPlusGate } from '@/components/diagnostic/DiagnosticRecommendationsTawjihPlusGate';
import { DiagnosticLoadingView } from '@/components/diagnostic/DiagnosticLoadingView';
import { DiagnosticRecommendationRow } from '@/components/diagnostic/DiagnosticRecommendationRow';
import { DiagnosticStatusBar, diagnosticTheme } from '@/components/diagnostic/DiagnosticUi';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useTawjihPlusAccess } from '@/hooks/useTawjihPlusAccess';
import {
  deleteEstablishmentFollowByEstablishment,
  fetchEstablishmentFollows,
  upsertEstablishmentFollow,
} from '@/services/establishmentFollows';
import { getUserFacingApiError } from '@/utils/apiError';
import {
  fetchSchoolRecommendationDiagnosticByPublicCode,
  generateSchoolDiagnosticRecommendations,
  type SchoolDiagnosticFullResult,
  type SchoolDiagnosticRecommendationItem,
} from '@/services/schoolRecommendationDiagnostic';
import { resolveUserDiagnosticPublicCode } from '@/utils/resolveSchoolDiagnosticNavigation';
import { ensureSchoolRecommendationsFromOrientation } from '@/utils/syncOrientationToSchoolRecommendations';
import { RECOMMENDATION_FOLLOW_MIN_COUNT } from '@/constants/recommendationParcours';
import { RecommendationFollowProgress } from '@/components/diagnostic/RecommendationFollowProgress';
import { useSchoolDiagnosticGrokEnrichment } from '@/hooks/useSchoolDiagnosticGrokEnrichment';
import { tryCompleteRecommendationParcoursStep } from '@/utils/recommendationParcoursFollowStep';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import {
  getDiagnosticTier,
  tierColor,
  type DiagnosticTier,
} from '@/utils/schoolDiagnosticTier';
import {
  DIAGNOSTIC_ANALYSIS_MESSAGES,
  DIAGNOSTIC_LOADING_COPY,
  DIAGNOSTIC_RECOMMENDATION_HOME_DELAY_MS,
} from '@/constants/diagnosticWizardUi';
import { resolveDiagnosticReportLocale } from '@/utils/schoolDiagnosticPayloadDisplayContext';
import { computeDiagnosticBacComparisonNote } from '@/utils/diagnosticBacComparisonNote';
import { emitNotificationsRefresh } from '@/services/notifications';
import { applyDiagnosticHardBlocksToRow } from '@/utils/schoolDiagnosticHardBlocks';
import {
  getSeuilCompatibilityForRow,
  sortSchoolDiagnosticRecommendationsWithSeuil,
  type SeuilCompatibilityInfo,
} from '@/utils/schoolDiagnosticSeuilCompatibility';
import { partitionFacultePublique } from '@/features/orientationDiagnostic/utils/orientationFacultePubliqueGroup';

import { DIR_RTL } from '@/utils/layoutDirection';
import { CAIRO } from '@/theme/arabicTypography';
const COPY = {
  fr: {
    eyebrow: 'Orientation',
    title: 'Vos recommandations',
    subtitle: 'Classement issu de votre test d’orientation',
    synthesis: 'Synthèse IA',
    profile: 'Votre profil',
    edit: 'Refaire le test d’orientation',
    schools: 'Voir les écoles recommandées',
    emptyNoOrientation:
      'Terminez d’abord le test d’orientation pour générer vos recommandations d’écoles.',
    emptyGoOrientation: 'Ouvrir le test d’orientation',
    facultesTitle: 'Universités et facultés publiques',
    facultesHint: 'Accès ouvert — ouvrir pour voir la liste',
    facultesCount: (n: number) => `${n} établissement${n > 1 ? 's' : ''}`,
    facultesClosed: 'Voir toutes les facultés',
    establishments: (n: number) =>
      `${n} établissement${n > 1 ? 's' : ''} analysé${n > 1 ? 's' : ''}`,
    tierEstablishments: (n: number) =>
      `${n} établissement${n > 1 ? 's' : ''}`,
    tiers: {
      recommended: 'Recommandé',
      possible: 'Possible',
      last: 'Dernier choix',
      avoid: 'À éviter',
    } as Record<DiagnosticTier, string>,
  },
  ar: {
    eyebrow: 'التوجيه',
    title: 'توصياتك',
    subtitle: 'الترتيب مستمد من اختبار التوجيه',
    synthesis: 'ملخص الذكاء الاصطناعي',
    profile: 'ملفك',
    edit: 'إعادة اختبار التوجيه',
    schools: 'عرض المدارس الموصى بها',
    emptyNoOrientation: 'أنهِ أولاً اختبار التوجيه لإنشاء توصيات المدارس.',
    emptyGoOrientation: 'فتح اختبار التوجيه',
    facultesTitle: 'الجامعات والكليات العمومية',
    facultesHint: 'ولوج مفتوح — افتح لعرض القائمة',
    facultesCount: (n: number) => `${n} مؤسسة`,
    facultesClosed: 'عرض كل الكليات',
    establishments: (n: number) => `${n} مؤسسة محللة`,
    tierEstablishments: (n: number) => `${n} مؤسسة`,
    tiers: {
      recommended: 'موصى به',
      possible: 'ممكن',
      last: 'خيار أخير',
      avoid: 'يُفضّل تجنبه',
    } as Record<DiagnosticTier, string>,
  },
} as const;

const TIER_ORDER: DiagnosticTier[] = ['recommended', 'possible', 'last', 'avoid'];

const TIER_ICONS: Record<DiagnosticTier, ComponentProps<typeof FontAwesome>['name']> = {
  recommended: 'star',
  possible: 'check-circle',
  last: 'exclamation-circle',
  avoid: 'ban',
};

type RecommendationListItem = {
  key: string;
  row: SchoolDiagnosticRecommendationItem;
  tier: DiagnosticTier;
  seuilCompatibility: SeuilCompatibilityInfo;
};

type RecommendationSection = {
  key: DiagnosticTier;
  tier: DiagnosticTier;
  data: RecommendationListItem[];
};

const PROFILE_SUMMARY_FR =
  'Classement basé sur ton profil (secteurs, villes, bac, budget, type d’école).';
const PROFILE_SUMMARY_AR =
  'الترتيب مبني على ملفك (القطاعات، المدن، الباك، الميزانية، نوع المدرسة).';
const GLOBAL_COMMENT_FR =
  'Les scores sont calculés instantanément par l’algorithme E-TAWJIHI. Suis au moins 3 écoles pour valider l’étape du parcours.';
const GLOBAL_COMMENT_AR =
  'تُحسب النقط فوراً بخوارزمية E-TAWJIHI. تابع 3 مدارس على الأقل لإتمام مرحلة المسار.';

function topRecommendationScore(rows: SchoolDiagnosticRecommendationItem[]): number {
  return rows.reduce((max, row) => Math.max(max, Math.round(row.combinedScore || 0)), 0);
}

function BilingualParagraph({
  fr,
  ar,
  locale,
}: {
  fr: string;
  ar: string;
  locale: 'fr' | 'ar';
}) {
  const primaryIsAr = locale === 'ar';
  return (
    <View style={styles.bilingualBlock}>
      <Text
        style={[
          styles.insightTxt,
          primaryIsAr ? styles.rtlText : styles.ltrText,
          primaryIsAr && styles.arabicFace,
        ]}>
        {primaryIsAr ? ar : fr}
      </Text>
      <Text
        style={[
          styles.insightSecondary,
          primaryIsAr ? styles.secondaryUnderRtl : styles.secondaryUnderLtr,
          !primaryIsAr && styles.arabicFace,
        ]}>
        {primaryIsAr ? fr : ar}
      </Text>
    </View>
  );
}

function profileSummaryPair(summary: string | null, count: number, topScore: number): { fr: string; ar: string } {
  const match = summary?.match(/(\d+)[^\d]+(\d+)\s*%/);
  const n = match ? Number(match[1]) : count;
  const score = match ? Number(match[2]) : topScore;
  return {
    fr: `${PROFILE_SUMMARY_FR} ${n} établissements scorés — meilleur score ${score}%.`,
    ar: `${PROFILE_SUMMARY_AR} تم تقييم ${n} مؤسسة — أعلى نقطة ${score}٪.`,
  };
}

function RecommendationItemSeparator() {
  return <View style={styles.tierItemSeparator} />;
}

function RecommendationSectionSeparator() {
  return <View style={styles.tierSectionSeparator} />;
}

const recommendationItemSeparator = RecommendationItemSeparator;
const recommendationSectionSeparator = RecommendationSectionSeparator;

export default function DiagnosticResultatsScreen() {
  const { c } = useLocalSearchParams<{ c?: string }>();
  const { getValidAccessToken, user } = useAuth();
  const isLoggedIn = Boolean(user);
  const { locale: appLocale, t } = useLocale();
  const { hasAccess: hasTawjihPlusAccess, loading: tawjihPlusLoading, refresh: refreshTawjihPlusAccess } =
    useTawjihPlusAccess();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [profileSummary, setProfileSummary] = useState<string | null>(null);
  const [globalComment, setGlobalComment] = useState<string | null>(null);
  const [academicYearLabel, setAcademicYearLabel] = useState<string | null>(null);
  const [rows, setRows] = useState<SchoolDiagnosticRecommendationItem[]>([]);
  const [diagnosticPayload, setDiagnosticPayload] = useState<Record<string, unknown>>({});
  const [publicCode, setPublicCode] = useState<string | null>(null);
  const [diagnosticId, setDiagnosticId] = useState<number | null>(null);
  const [recommendationsDeferred, setRecommendationsDeferred] = useState(false);
  const [generatingRecommendations, setGeneratingRecommendations] = useState(false);
  const generateStartedRef = useRef(false);
  const [grokPending, setGrokPending] = useState(false);
  const [grokMsg, setGrokMsg] = useState(0);
  const [reportLocale, setReportLocale] = useState<'fr' | 'ar'>(appLocale === 'ar' ? 'ar' : 'fr');
  const reportLocaleLocked = useRef(false);
  const [followedIds, setFollowedIds] = useState<Set<number>>(() => new Set());
  const [followBusyIds, setFollowBusyIds] = useState<Set<number>>(() => new Set());
  const [followCount, setFollowCount] = useState(0);
  const [facultesOpen, setFacultesOpen] = useState(false);

  const followProgress = useMemo(
    () => ({
      current: followCount,
      required: RECOMMENDATION_FOLLOW_MIN_COUNT,
      satisfied: followCount >= RECOMMENDATION_FOLLOW_MIN_COUNT,
    }),
    [followCount],
  );

  const refreshFollowState = useCallback(async () => {
    const token = await getValidAccessToken();
    if (!token) {
      setFollowedIds(new Set());
      setFollowCount(0);
      return;
    }
    const { items } = await fetchEstablishmentFollows(token);
    const ids = new Set<number>();
    for (const f of items) {
      const eid = f.establishment?.id;
      if (typeof eid === 'number' && eid > 0) ids.add(eid);
    }
    setFollowedIds(ids);
    setFollowCount(ids.size);
    await tryCompleteRecommendationParcoursStep(token, ids.size);
  }, [getValidAccessToken]);

  useEffect(() => {
    if (!isLoggedIn) {
      setFollowedIds(new Set());
      setFollowCount(0);
      return;
    }
    void refreshFollowState();
  }, [isLoggedIn, refreshFollowState]);

  const toggleFollow = useCallback(
    async (establishmentId: number) => {
      if (!isLoggedIn) {
        router.push('/login' as never);
        return;
      }
      const wasFollowed = followedIds.has(establishmentId);
      setFollowBusyIds((prev) => new Set(prev).add(establishmentId));
      setFollowedIds((prev) => {
        const next = new Set(prev);
        if (wasFollowed) next.delete(establishmentId);
        else next.add(establishmentId);
        setFollowCount(next.size);
        return next;
      });
      try {
        const token = await getValidAccessToken();
        if (!token) return;
        let ok = false;
        if (wasFollowed) {
          ok = await deleteEstablishmentFollowByEstablishment(token, establishmentId);
        } else {
          const res = await upsertEstablishmentFollow(token, { establishmentId });
          ok = !!res.follow;
        }
        if (!ok) {
          await refreshFollowState();
          return;
        }
        const { items } = await fetchEstablishmentFollows(token);
        const ids = new Set<number>();
        for (const f of items) {
          const eid = f.establishment?.id;
          if (typeof eid === 'number' && eid > 0) ids.add(eid);
        }
        setFollowedIds(ids);
        setFollowCount(ids.size);
        await tryCompleteRecommendationParcoursStep(token, ids.size);
      } finally {
        setFollowBusyIds((prev) => {
          const next = new Set(prev);
          next.delete(establishmentId);
          return next;
        });
      }
    },
    [followedIds, getValidAccessToken, isLoggedIn, refreshFollowState],
  );

  const applyDiagnostic = useCallback((data: SchoolDiagnosticFullResult) => {
    setPublicCode(data.publicCode);
    setDiagnosticId(data.id);
    const deferred = Boolean(data.recommendationsDeferred);
    setRecommendationsDeferred(deferred);
    if (deferred) generateStartedRef.current = false;
    const pl = (data.payload ?? {}) as Record<string, unknown>;
    setDiagnosticPayload(pl);
    if (!reportLocaleLocked.current) {
      setReportLocale(resolveDiagnosticReportLocale(pl, appLocale === 'ar' ? 'ar' : 'fr'));
    }
    const bacSummary = computeDiagnosticBacComparisonNote(pl);
    const normalized = (data.recommendations ?? []).map((row) =>
      applyDiagnosticHardBlocksToRow(row, pl, bacSummary),
    );
    const sorted = sortSchoolDiagnosticRecommendationsWithSeuil(normalized, bacSummary);
    setRows(sorted);
    setProfileSummary(data.profileSummary ?? null);
    setGlobalComment(data.globalComment ?? null);
    setAcademicYearLabel(data.academicYearLabel ?? null);
    const pending = Boolean(data.grokPending);
    setGrokPending(pending);
    if (!pending) {
      emitNotificationsRefresh({ force: true });
    }
  }, [appLocale]);

  useEffect(() => {
    const urlCode = typeof c === 'string' ? c.trim().toLowerCase() : '';
    let alive = true;
    void (async () => {
      try {
        const uiLocale = appLocale === 'ar' ? 'ar' : 'fr';
        let codeToLoad = urlCode;

        if (user) {
          const fromOrientation = await ensureSchoolRecommendationsFromOrientation({
            getValidAccessToken,
            userId: user.id,
            uiLocale,
          });
          if (!alive) return;

          if (fromOrientation) {
            if (fromOrientation !== urlCode) {
              router.replace({
                pathname: '/diagnostic-ecoles/resultats',
                params: { c: fromOrientation },
              } as never);
              return;
            }
            codeToLoad = fromOrientation;
          } else {
            const ownedCode = await resolveUserDiagnosticPublicCode(
              getValidAccessToken,
              user.id,
              { uiLocale },
            );
            if (!alive) return;
            if (ownedCode) {
              if (ownedCode !== urlCode) {
                router.replace({
                  pathname: '/diagnostic-ecoles/resultats',
                  params: { c: ownedCode },
                } as never);
                return;
              }
              codeToLoad = ownedCode;
            } else if (!/^[a-f0-9]{32}$/.test(urlCode)) {
              setErr(COPY[uiLocale].emptyNoOrientation);
              setLoading(false);
              return;
            }
          }
        } else if (!/^[a-f0-9]{32}$/.test(urlCode)) {
          setErr('Lien de résultats invalide.');
          setLoading(false);
          return;
        }

        const token = await getValidAccessToken();
        const data = await fetchSchoolRecommendationDiagnosticByPublicCode(codeToLoad, token);
        if (!alive) return;
        applyDiagnostic(data);
      } catch (e) {
        if (alive) setErr(getUserFacingApiError(e, t, { context: 'diagnostic' }));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [c, getValidAccessToken, user, appLocale, applyDiagnostic, t]);

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
        applyDiagnostic(full);
      } catch (e) {
        if (alive) {
          generateStartedRef.current = false;
          setErr(getUserFacingApiError(e, t, { context: 'diagnostic' }));
        }
      } finally {
        if (alive) setGeneratingRecommendations(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [
    applyDiagnostic,
    diagnosticId,
    getValidAccessToken,
    hasTawjihPlusAccess,
    loading,
    recommendationsDeferred,
    t,
    tawjihPlusLoading,
  ]);

  useSchoolDiagnosticGrokEnrichment({
    diagnosticId,
    grokPending,
    recommendationsDeferred,
    enabled: !loading && !tawjihPlusLoading && hasTawjihPlusAccess,
    getValidAccessToken,
    onComplete: applyDiagnostic,
    onError: (error) => {
      setErr(getUserFacingApiError(error, t, { context: 'diagnostic' }));
    },
  });

  useEffect(() => {
    if (!grokPending) {
      setGrokMsg(0);
      return;
    }
    const msgs = DIAGNOSTIC_ANALYSIS_MESSAGES[reportLocale];
    const last = msgs.length - 1;
    const t = setInterval(() => {
      setGrokMsg((m) => (m >= last ? last : m + 1));
    }, 2200);
    return () => clearInterval(t);
  }, [grokPending, reportLocale]);

  const isRTL = reportLocale === 'ar';
  const alignText = isRTL ? styles.rtlText : styles.ltrText;
  const loadingRtl = appLocale === 'ar';
  const cpy = COPY[reportLocale];

  const recommendationGenerationFooter = useMemo(() => {
    const loadingCopy = DIAGNOSTIC_LOADING_COPY[reportLocale];
    return {
      footerActionDelayMs: DIAGNOSTIC_RECOMMENDATION_HOME_DELAY_MS,
      footerAction: {
        label: loadingCopy.goHomeWhileGenerating,
        hint: loadingCopy.goHomeWhileGeneratingHint,
        onPress: () => router.replace('/(tabs)' as never),
      },
    };
  }, [reportLocale]);

  const bacComparison = useMemo(
    () => computeDiagnosticBacComparisonNote(diagnosticPayload),
    [diagnosticPayload],
  );

  const { facultes, others: nonFaculteRows } = useMemo(
    () => partitionFacultePublique(rows),
    [rows],
  );

  const facultesSorted = useMemo(
    () => sortSchoolDiagnosticRecommendationsWithSeuil(facultes, bacComparison),
    [facultes, bacComparison],
  );

  const grouped = useMemo(() => {
    const map: Record<DiagnosticTier, SchoolDiagnosticRecommendationItem[]> = {
      recommended: [],
      possible: [],
      last: [],
      avoid: [],
    };
    for (const r of nonFaculteRows) {
      map[getDiagnosticTier(r)].push(r);
    }
    for (const tier of TIER_ORDER) {
      map[tier] = sortSchoolDiagnosticRecommendationsWithSeuil(map[tier], bacComparison);
    }
    return map;
  }, [nonFaculteRows, bacComparison]);

  const tierCounts = useMemo(
    () =>
      TIER_ORDER.map((tier) => ({
        tier,
        count: grouped[tier].length,
        color: tierColor(tier),
      })).filter((t) => t.count > 0),
    [grouped],
  );

  const recommendationSections = useMemo((): RecommendationSection[] => {
    return TIER_ORDER.filter((tier) => grouped[tier].length > 0).map((tier) => ({
      key: tier,
      tier,
      data: grouped[tier].map((row) => ({
        key: String(row.establishmentId),
        row,
        tier,
        seuilCompatibility: getSeuilCompatibilityForRow(bacComparison, row),
      })),
    }));
  }, [grouped, bacComparison]);

  const openEstablishment = useCallback((establishmentId: number, slug: string) => {
    router.push(`/etablissements/${establishmentId}/${slug}` as never);
  }, []);

  const renderRecommendationItem = useCallback(
    ({ item }: { item: RecommendationListItem }) => (
      <DiagnosticRecommendationRow
        row={item.row}
        tier={item.tier}
        isRTL={isRTL}
        reportLocale={reportLocale}
        seuilCompatibility={item.seuilCompatibility}
        showFollowAction={isLoggedIn}
        isFollowing={followedIds.has(item.row.establishmentId)}
        followBusy={followBusyIds.has(item.row.establishmentId)}
        onToggleFollow={() => void toggleFollow(item.row.establishmentId)}
        followLabelFollow={t('inscAnnouncementsFollow')}
        followLabelFollowing={t('inscAnnouncementsFollowing')}
        onPress={() => openEstablishment(item.row.establishmentId, item.row.slug)}
      />
    ),
    [
      followBusyIds,
      followedIds,
      isLoggedIn,
      isRTL,
      openEstablishment,
      reportLocale,
      t,
      toggleFollow,
    ],
  );

  const renderRecommendationSectionHeader = useCallback(
    ({ section }: { section: RecommendationSection }) => {
      const tier = section.tier;
      const color = tierColor(tier);
      const count = section.data.length;
      return (
        <View style={styles.section}>
          <View style={[styles.tierHeader, isRTL && styles.tierHeaderRtl]}>
            <View style={[styles.tierIconWrap, { backgroundColor: `${color}22` }]}>
              <FontAwesome name={TIER_ICONS[tier]} size={14} color={color} />
            </View>
            <View style={styles.tierHeaderText}>
              <Text style={[styles.tierTitle, alignText, isRTL && styles.arabicFace]}>{cpy.tiers[tier]}</Text>
              <Text style={[styles.tierSub, alignText, isRTL && styles.arabicFace]}>
                {cpy.tierEstablishments(count)}
              </Text>
            </View>
            <View style={[styles.tierCountBadge, { backgroundColor: color }]}>
              <Text style={styles.tierCountTxt}>{count}</Text>
            </View>
          </View>
        </View>
      );
    },
    [cpy, isRTL],
  );

  const recommendationListHeader = useMemo(() => {
    if (!profileSummary && !globalComment) return null;
    const profilePair = profileSummaryPair(profileSummary, rows.length, topRecommendationScore(rows));
    return (
      <View style={styles.listHeaderWrap}>
        {profileSummary ? (
          <View style={[styles.insightCard, isRTL && styles.insightCardRtl]}>
            <View style={[styles.insightIcon, { backgroundColor: diagnosticTheme.primarySoft }]}>
              <FontAwesome name="user-circle" size={18} color={brand.primary} />
            </View>
            <View style={styles.insightBody}>
              <Text
                style={[styles.insightLabel, alignText, isRTL && styles.rtlNoTransform]}>
                {cpy.profile}
              </Text>
              <BilingualParagraph fr={profilePair.fr} ar={profilePair.ar} locale={reportLocale} />
            </View>
          </View>
        ) : null}

        {globalComment ? (
          <View
            style={[
              styles.insightCard,
              styles.synthesisCard,
              Platform.OS === 'android' && styles.synthesisCardAndroid,
              isRTL && styles.insightCardRtl,
            ]}>
            <View
              style={[
                styles.insightIcon,
                {
                  backgroundColor:
                    Platform.OS === 'android' ? homeShell.greenSurface : homeShell.greenAlpha18,
                },
              ]}>
              <FontAwesome name="comments" size={16} color={homeShell.greenDark} />
            </View>
            <View style={styles.insightBody}>
              <Text
                style={[styles.insightLabel, alignText, isRTL && styles.rtlNoTransform]}>
                {cpy.synthesis}
              </Text>
              <BilingualParagraph fr={GLOBAL_COMMENT_FR} ar={GLOBAL_COMMENT_AR} locale={reportLocale} />
            </View>
          </View>
        ) : null}
      </View>
    );
  }, [alignText, cpy, globalComment, isRTL, profileSummary, reportLocale, rows]);

  const recommendationListFooter = useMemo(
    () => (
      <View style={styles.listFooterWrap}>
        {facultesSorted.length > 0 ? (
          <View style={styles.facultesAccordion}>
            <Pressable
              onPress={() => setFacultesOpen((v) => !v)}
              style={[styles.facultesTrigger, isRTL && styles.facultesTriggerRtl]}
              accessibilityRole="button"
              accessibilityState={{ expanded: facultesOpen }}
              accessibilityLabel={cpy.facultesTitle}>
              <View style={styles.facultesIcon}>
                <FontAwesome name="university" size={15} color={brand.primary} />
              </View>
              <View style={styles.facultesCopy}>
                <Text style={[styles.facultesTitle, isRTL && styles.rtlText]}>
                  {cpy.facultesTitle}
                </Text>
                <Text style={[styles.facultesHint, isRTL && styles.rtlText]}>
                  {cpy.facultesHint}
                </Text>
              </View>
              <View style={styles.facultesMeta}>
                <Text style={styles.facultesCount}>{cpy.facultesCount(facultesSorted.length)}</Text>
                <FontAwesome
                  name={facultesOpen ? 'chevron-up' : 'chevron-down'}
                  size={12}
                  color={brand.primary}
                />
              </View>
            </Pressable>
            {facultesOpen ? (
              <View style={styles.facultesBody}>
                {facultesSorted.map((row, index) => {
                  const tier = getDiagnosticTier(row);
                  return (
                    <View key={`faculte-${row.establishmentId}`}>
                      {index > 0 ? <View style={styles.tierItemSeparator} /> : null}
                      <DiagnosticRecommendationRow
                        row={row}
                        tier={tier}
                        isRTL={isRTL}
                        reportLocale={reportLocale}
                        seuilCompatibility={getSeuilCompatibilityForRow(bacComparison, row)}
                        showFollowAction={isLoggedIn}
                        isFollowing={followedIds.has(row.establishmentId)}
                        followBusy={followBusyIds.has(row.establishmentId)}
                        onToggleFollow={() => void toggleFollow(row.establishmentId)}
                        followLabelFollow={t('inscAnnouncementsFollow')}
                        followLabelFollowing={t('inscAnnouncementsFollowing')}
                        onPress={() => openEstablishment(row.establishmentId, row.slug)}
                      />
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={[styles.facultesClosed, isRTL && styles.rtlText]}>
                {cpy.facultesClosed}
              </Text>
            )}
          </View>
        ) : null}

        <View style={[styles.footerActions, isRTL && styles.footerActionsRtl]}>
          <Pressable
            style={({ pressed }) => [
              styles.ctaSecondary,
              isRTL && styles.ctaSecondaryRtl,
              pressed && { opacity: 0.9 },
            ]}
            onPress={() => router.replace('/diagnostic-orientation' as never)}>
            <FontAwesome name="refresh" size={14} color={brand.primary} />
            <Text style={[styles.ctaSecondaryTxt, isRTL && styles.rtlText]}>{cpy.edit}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.ctaPrimary,
              isRTL && styles.ctaPrimaryRtl,
              pressed && { opacity: 0.92 },
            ]}
            onPress={() => router.push('/(tabs)/ecoles' as never)}>
            <Text style={[styles.ctaPrimaryTxt, isRTL && styles.rtlText]}>{cpy.schools}</Text>
            <FontAwesome name="graduation-cap" size={14} color={brand.white} />
          </Pressable>
        </View>
      </View>
    ),
    [
      bacComparison,
      cpy,
      facultesOpen,
      facultesSorted,
      followBusyIds,
      followedIds,
      isLoggedIn,
      isRTL,
      openEstablishment,
      reportLocale,
      t,
      toggleFollow,
    ],
  );

  /** Non-client ayant terminé le diagnostic : toujours l’écran d’achat TAWJIH PLUS. */
  const showRecommendationsPaywall =
    !tawjihPlusLoading && !hasTawjihPlusAccess && Boolean(publicCode);

  if (loading || tawjihPlusLoading) {
    return (
      <DiagnosticLoadingView
        variant="results"
        rtl={loadingRtl}
        locale={appLocale === 'ar' ? 'ar' : 'fr'}
      />
    );
  }

  if (err) {
    return (
      <View style={[styles.root, isRTL && styles.rootRtl]}>
        <DiagnosticStatusBar />
        <SafeAreaView style={styles.center} edges={['top', 'bottom']}>
          <Text style={[styles.err, isRTL && styles.rtlText]}>{err}</Text>
          <Pressable
            onPress={() => router.replace('/diagnostic-orientation' as never)}
            style={styles.errBtn}>
            <Text style={styles.errBtnTxt}>{cpy.emptyGoOrientation}</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  if (showRecommendationsPaywall) {
    return (
      <DiagnosticRecommendationsTawjihPlusGate
        rtl={isRTL}
        onBack={() => router.replace('/(tabs)' as never)}
      />
    );
  }

  if (generatingRecommendations || grokPending) {
    return (
      <DiagnosticLoadingView
        variant="ia"
        rtl={isRTL}
        locale={reportLocale}
        messageIndex={grokMsg}
        {...recommendationGenerationFooter}
      />
    );
  }

  return (
    <View style={[styles.root, isRTL && styles.rootRtl]}>
      <DiagnosticStatusBar />
      <SafeAreaView style={[styles.headerSafe, isRTL && styles.headerRtl]} edges={['top']}>
        <View style={[styles.headerRow, isRTL && styles.headerRowRtl]}>
          <Pressable
            onPress={() => router.replace('/(tabs)' as never)}
            style={styles.backBtn}
            accessibilityRole="button">
            <FontAwesome
              name={isRTL ? 'chevron-right' : 'chevron-left'}
              size={18}
              color={brand.primary}
            />
          </Pressable>
          <View style={[styles.headerCenter, isRTL && styles.headerCenterRtl]}>
            <Text
              style={[styles.headerEyebrow, alignText, isRTL && styles.rtlNoTransform]}>
              {cpy.eyebrow}
            </Text>
            <Text style={[styles.headerTitle, alignText, isRTL && styles.arabicFace]}>{cpy.title}</Text>
            {academicYearLabel ? (
              <View style={[styles.yearPill, isRTL && styles.yearPillRtl]}>
                <FontAwesome name="calendar" size={11} color={homeShell.greenDark} />
                <Text style={[styles.yearPillTxt, styles.ltrText]} latinDigits>
                  {academicYearLabel}
                </Text>
              </View>
            ) : null}
            {rows.length > 0 ? (
              <Text style={[styles.headerCount, alignText]}>
                {cpy.establishments(rows.length)}
              </Text>
            ) : null}
          </View>
          <View style={styles.langSwitch}>
            {(['fr', 'ar'] as const).map((code) => {
              const on = reportLocale === code;
              return (
                <Pressable
                  key={code}
                  onPress={() => {
                    reportLocaleLocked.current = true;
                    setReportLocale(code);
                  }}
                  style={[styles.langBtn, on && styles.langBtnOn]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}>
                  <Text style={[styles.langBtnTxt, on && styles.langBtnTxtOn, styles.ltrText]}>
                    {code === 'fr' ? 'FR' : 'AR'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={styles.headerAccentLine} />
        {tierCounts.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.statsRow, isRTL && styles.statsRowRtl]}>
            {tierCounts.map(({ tier, count, color }) => (
              <View key={tier} style={[styles.statChip, { borderColor: color }]}>
                <View style={[styles.statDot, { backgroundColor: color }]} />
                <Text style={[styles.statChipTxt, alignText]}>
                  {cpy.tiers[tier]} · {count}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : null}
      </SafeAreaView>

      {isLoggedIn ? (
        <View style={[styles.followStickyBar, isRTL && styles.followStickyBarRtl]}>
          <RecommendationFollowProgress
            followCount={followProgress.current}
            locale={reportLocale}
            isRTL={isRTL}
            style={styles.followStickyCard}
          />
        </View>
      ) : null}

      <SectionList
        style={[styles.scroll, isRTL && styles.scrollRtl]}
        contentContainerStyle={[styles.scrollContent, isRTL && styles.scrollContentRtl]}
        sections={recommendationSections}
        keyExtractor={(item) => item.key}
        renderItem={renderRecommendationItem}
        renderSectionHeader={renderRecommendationSectionHeader}
        ListHeaderComponent={recommendationListHeader}
        ListFooterComponent={recommendationListFooter}
        ItemSeparatorComponent={recommendationItemSeparator}
        SectionSeparatorComponent={recommendationSectionSeparator}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={6}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
      />
      <SafeAreaView edges={['bottom']} style={styles.bottomSafe} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.primary },
  rootRtl: DIR_RTL,
  headerRtl: DIR_RTL,
  headerCenterRtl: { alignItems: 'stretch' },
  headerRowRtl: DIR_RTL,
  rtlNoTransform: { textTransform: 'none', letterSpacing: 0 },
  headerSafe: {
    backgroundColor: brand.primary,
    paddingBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    gap: spacing.sm,
  },
  headerCenter: { flex: 1, minWidth: 0, gap: 4 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    marginTop: 2,
  },
  headerEyebrow: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.88)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: brand.white,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  yearPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: spacing.xs,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: homeShell.greenAlpha28,
  },
  yearPillRtl: { alignSelf: 'flex-start' },
  yearPillTxt: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: homeShell.greenDark,
  },
  headerCount: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  headerAccentLine: {
    height: 3,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: 2,
    backgroundColor: homeShell.green,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  statsRowRtl: DIR_RTL,
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statChipTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: brand.white,
  },
  followStickyBar: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: homeShell.borderOnWhite,
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  followStickyBarRtl: DIR_RTL,
  followStickyCard: { marginBottom: 0 },
  rtlText: { writingDirection: 'rtl', textAlign: 'right' },
  ltrText: { writingDirection: 'ltr', textAlign: 'left' },
  bilingualBlock: { gap: 3, alignSelf: 'stretch' },
  insightSecondary: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: brand.textMuted,
    lineHeight: 18,
  },
  secondaryUnderRtl: { writingDirection: 'ltr', textAlign: 'right' },
  secondaryUnderLtr: { writingDirection: 'rtl', textAlign: 'left' },
  langSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    overflow: 'hidden',
    marginTop: 2,
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  langBtnOn: { backgroundColor: brand.white },
  langBtnTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
  },
  langBtnTxtOn: { color: brand.primary },
  scroll: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollRtl: DIR_RTL,
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.md,
  },
  scrollContentRtl: { ...DIR_RTL, alignItems: 'stretch' },
  listHeaderWrap: { gap: spacing.md, marginBottom: spacing.md },
  centerRtl: DIR_RTL,
  footerActionsRtl: { ...DIR_RTL, alignItems: 'stretch' },
  ctaPrimaryRtl: DIR_RTL,
  bottomSafe: { backgroundColor: '#F8FAFC' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: '#F8FAFC',
    gap: spacing.md,
  },
  err: { color: '#B91C1C', textAlign: 'center', fontWeight: '600', fontSize: fontSize.sm },
  errBtn: {
    backgroundColor: brand.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  errBtnTxt: { color: brand.white, fontWeight: '700', fontSize: fontSize.sm },
  insightCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    ...Platform.select({
      ios: {
        shadowColor: '#333E8F',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 0 },
    }),
  },
  insightCardRtl: DIR_RTL,
  synthesisCard: {
    borderColor: 'rgba(47,206,148,0.35)',
    backgroundColor: 'rgba(47,206,148,0.06)',
  },
  synthesisCardAndroid: {
    backgroundColor: brand.white,
    borderColor: homeShell.greenBorder,
    elevation: 0,
    shadowOpacity: 0,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightBody: { flex: 1, minWidth: 0, gap: 4 },
  insightLabel: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
  },
  insightTxt: { fontSize: fontSize.sm, color: brand.text, lineHeight: 21 },
  arabicFace: { fontFamily: CAIRO.bold },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tierHeaderRtl: DIR_RTL,
  tierIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierHeaderText: { flex: 1, minWidth: 0 },
  tierTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: brand.primary,
  },
  tierSub: {
    fontSize: fontSize.xs,
    color: brand.textMuted,
    marginTop: 1,
  },
  tierCountBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  tierCountTxt: {
    color: brand.white,
    fontWeight: '800',
    fontSize: fontSize.xs,
  },
  tierList: { gap: spacing.sm },
  tierItemSeparator: { height: spacing.sm },
  tierSectionSeparator: { height: spacing.md },
  listFooterWrap: { gap: spacing.md, marginTop: spacing.sm },
  facultesAccordion: {
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.12)',
    borderRadius: radius.lg,
    backgroundColor: brand.white,
    overflow: 'hidden',
  },
  facultesTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  facultesTriggerRtl: DIR_RTL,
  facultesIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: diagnosticTheme.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facultesCopy: { flex: 1, minWidth: 0, gap: 2 },
  facultesTitle: { fontSize: fontSize.sm, fontWeight: '800', color: brand.primary },
  facultesHint: { fontSize: fontSize.xs, color: brand.textMuted, lineHeight: 16 },
  facultesMeta: { alignItems: 'flex-end', gap: 4 },
  facultesCount: { fontSize: 11, fontWeight: '700', color: brand.textMuted },
  facultesBody: { paddingHorizontal: spacing.sm, paddingBottom: spacing.sm },
  facultesClosed: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    fontSize: fontSize.xs,
    color: brand.textMuted,
  },
  footerActions: { gap: spacing.sm },
  ctaSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(51, 62, 143, 0.25)',
  },
  ctaSecondaryRtl: DIR_RTL,
  ctaSecondaryTxt: {
    color: brand.primary,
    fontWeight: '700',
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  ctaPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: brand.primary,
    borderRadius: radius.xl,
    paddingVertical: 15,
    shadowColor: '#333E8F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaPrimaryTxt: {
    color: brand.white,
    fontWeight: '800',
    fontSize: fontSize.sm,
  },
});
