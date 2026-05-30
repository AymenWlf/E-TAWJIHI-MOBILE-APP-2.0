import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
import { RECOMMENDATION_FOLLOW_MIN_COUNT } from '@/constants/recommendationParcours';
import { RecommendationFollowProgress } from '@/components/diagnostic/RecommendationFollowProgress';
import { pollSchoolDiagnosticGrokUntilReady } from '@/utils/pollSchoolDiagnosticGrok';
import { tryCompleteRecommendationParcoursStep } from '@/utils/recommendationParcoursFollowStep';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import {
  getDiagnosticTier,
  tierColor,
  type DiagnosticTier,
} from '@/utils/schoolDiagnosticTier';
import { DIAGNOSTIC_ANALYSIS_MESSAGES } from '@/constants/diagnosticWizardUi';
import { resolveDiagnosticReportLocale } from '@/utils/schoolDiagnosticPayloadDisplayContext';
import { computeDiagnosticBacComparisonNote } from '@/utils/diagnosticBacComparisonNote';
import { emitNotificationsRefresh } from '@/services/notifications';
import { applyDiagnosticHardBlocksToRow } from '@/utils/schoolDiagnosticHardBlocks';
import {
  getSeuilCompatibilityForRow,
  sortSchoolDiagnosticRecommendationsWithSeuil,
} from '@/utils/schoolDiagnosticSeuilCompatibility';

const COPY = {
  fr: {
    eyebrow: 'Diagnostic écoles',
    title: 'Vos recommandations',
    subtitle: 'Classement : notes vs seuils, puis score de compatibilité',
    synthesis: 'Synthèse IA',
    profile: 'Votre profil',
    edit: 'Modifier mes réponses',
    schools: 'Voir les écoles recommandées',
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
    follow: 'Suivre',
    following: 'Suivi',
  },
  ar: {
    eyebrow: 'تشخيص المدارس',
    title: 'توصياتك',
    subtitle: 'الترتيب: النقط مقابل عتبة النقط، ثم نسبة التوافق',
    synthesis: 'ملخص الذكاء الاصطناعي',
    profile: 'ملفك',
    edit: 'تعديل إجاباتي',
    schools: 'عرض المدارس الموصى بها',
    establishments: (n: number) => `${n} مؤسسة محللة`,
    tierEstablishments: (n: number) => `${n} مؤسسة`,
    tiers: {
      recommended: 'موصى به',
      possible: 'ممكن',
      last: 'خيار أخير',
      avoid: 'يُفضّل تجنبه',
    } as Record<DiagnosticTier, string>,
    follow: 'متابعة',
    following: 'متابَع',
  },
} as const;

const TIER_ORDER: DiagnosticTier[] = ['recommended', 'possible', 'last', 'avoid'];

const TIER_ICONS: Record<DiagnosticTier, ComponentProps<typeof FontAwesome>['name']> = {
  recommended: 'star',
  possible: 'check-circle',
  last: 'exclamation-circle',
  avoid: 'ban',
};

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
  const [reportLocale, setReportLocale] = useState<'fr' | 'ar'>('fr');
  const [followedIds, setFollowedIds] = useState<Set<number>>(() => new Set());
  const [followBusyIds, setFollowBusyIds] = useState<Set<number>>(() => new Set());
  const [followCount, setFollowCount] = useState(0);

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
    setReportLocale(resolveDiagnosticReportLocale(pl, appLocale === 'ar' ? 'ar' : 'fr'));
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
            setErr('Aucun diagnostic terminé pour ce compte.');
            setLoading(false);
            return;
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

  useEffect(() => {
    const code = publicCode?.trim().toLowerCase() ?? '';
    if (!/^[a-f0-9]{32}$/.test(code) || !grokPending || recommendationsDeferred) return;
    let alive = true;
    void (async () => {
      const token = await getValidAccessToken();
      await pollSchoolDiagnosticGrokUntilReady(
        async () =>
          fetchSchoolRecommendationDiagnosticByPublicCode(code, token),
        {
          onUpdate: (d) => {
            if (alive && d) applyDiagnostic(d);
          },
        },
      );
    })();
    return () => {
      alive = false;
    };
  }, [publicCode, grokPending, recommendationsDeferred, getValidAccessToken, applyDiagnostic]);

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

  const isRTL = reportLocale === 'ar' || appLocale === 'ar';
  const loadingRtl = appLocale === 'ar';
  const cpy = COPY[reportLocale];

  const bacComparison = useMemo(
    () => computeDiagnosticBacComparisonNote(diagnosticPayload),
    [diagnosticPayload],
  );

  const grouped = useMemo(() => {
    const map: Record<DiagnosticTier, SchoolDiagnosticRecommendationItem[]> = {
      recommended: [],
      possible: [],
      last: [],
      avoid: [],
    };
    for (const r of rows) {
      map[getDiagnosticTier(r)].push(r);
    }
    for (const tier of TIER_ORDER) {
      map[tier] = sortSchoolDiagnosticRecommendationsWithSeuil(map[tier], bacComparison);
    }
    return map;
  }, [rows, bacComparison]);

  const tierCounts = useMemo(
    () =>
      TIER_ORDER.map((tier) => ({
        tier,
        count: grouped[tier].length,
        color: tierColor(tier),
      })).filter((t) => t.count > 0),
    [grouped],
  );

  const showRecommendationsPaywall =
    recommendationsDeferred && !tawjihPlusLoading && !hasTawjihPlusAccess;

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
          <Pressable onPress={() => router.replace('/diagnostic-ecoles' as never)} style={styles.errBtn}>
            <Text style={styles.errBtnTxt}>{cpy.edit}</Text>
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
              style={[styles.headerEyebrow, isRTL && styles.rtlText, isRTL && styles.rtlNoTransform]}>
              {cpy.eyebrow}
            </Text>
            <Text style={[styles.headerTitle, isRTL && styles.rtlText]}>{cpy.title}</Text>
            <Text style={[styles.headerSub, isRTL && styles.rtlText]}>{cpy.subtitle}</Text>
            {academicYearLabel ? (
              <View style={[styles.yearPill, isRTL && styles.yearPillRtl]}>
                <FontAwesome name="calendar" size={11} color={homeShell.greenDark} />
                <Text style={[styles.yearPillTxt, isRTL && styles.rtlText]}>{academicYearLabel}</Text>
              </View>
            ) : null}
            {rows.length > 0 ? (
              <Text style={[styles.headerCount, isRTL && styles.rtlText]}>
                {cpy.establishments(rows.length)}
              </Text>
            ) : null}
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
                <Text style={[styles.statChipTxt, isRTL && styles.rtlText]}>
                  {cpy.tiers[tier]} · {count}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : null}
      </SafeAreaView>

      <ScrollView
          style={[styles.scroll, isRTL && styles.scrollRtl]}
          contentContainerStyle={[styles.scrollContent, isRTL && styles.scrollContentRtl]}
          showsVerticalScrollIndicator={false}>
          {profileSummary ? (
            <View style={[styles.insightCard, isRTL && styles.insightCardRtl]}>
              <View style={[styles.insightIcon, { backgroundColor: diagnosticTheme.primarySoft }]}>
                <FontAwesome name="user-circle" size={18} color={brand.primary} />
              </View>
              <View style={styles.insightBody}>
                <Text
                  style={[styles.insightLabel, isRTL && styles.rtlText, isRTL && styles.rtlNoTransform]}>
                  {cpy.profile}
                </Text>
                <Text style={[styles.insightTxt, isRTL && styles.rtlText]}>{profileSummary}</Text>
              </View>
            </View>
          ) : null}

          {globalComment ? (
            <View style={[styles.insightCard, styles.synthesisCard, isRTL && styles.insightCardRtl]}>
              <View style={[styles.insightIcon, { backgroundColor: homeShell.greenAlpha18 }]}>
                <FontAwesome name="comments" size={16} color={homeShell.greenDark} />
              </View>
              <View style={styles.insightBody}>
                <Text
                  style={[styles.insightLabel, isRTL && styles.rtlText, isRTL && styles.rtlNoTransform]}>
                  {cpy.synthesis}
                </Text>
                <Text style={[styles.insightTxt, isRTL && styles.rtlText]}>{globalComment}</Text>
              </View>
            </View>
          ) : null}

          {isLoggedIn ? (
            <RecommendationFollowProgress
              followCount={followProgress.current}
              locale={appLocale === 'ar' ? 'ar' : 'fr'}
              isRTL={isRTL}
            />
          ) : null}

          {TIER_ORDER.map((tier) => {
            const list = grouped[tier];
            if (!list.length) return null;
            const color = tierColor(tier);
            return (
              <View key={tier} style={styles.section}>
                <View style={[styles.tierHeader, isRTL && styles.tierHeaderRtl]}>
                  <View style={[styles.tierIconWrap, { backgroundColor: `${color}22` }]}>
                    <FontAwesome name={TIER_ICONS[tier]} size={14} color={color} />
                  </View>
                  <View style={styles.tierHeaderText}>
                    <Text style={[styles.tierTitle, isRTL && styles.rtlText]}>{cpy.tiers[tier]}</Text>
                    <Text style={[styles.tierSub, isRTL && styles.rtlText]}>
                      {cpy.tierEstablishments(list.length)}
                    </Text>
                  </View>
                  <View style={[styles.tierCountBadge, { backgroundColor: color }]}>
                    <Text style={styles.tierCountTxt}>{list.length}</Text>
                  </View>
                </View>
                <View style={styles.tierList}>
                  {list.map((row) => (
                    <DiagnosticRecommendationRow
                      key={row.establishmentId}
                      row={row}
                      tier={tier}
                      isRTL={isRTL}
                      reportLocale={reportLocale}
                      seuilCompatibility={getSeuilCompatibilityForRow(bacComparison, row)}
                      showFollowAction
                      isFollowing={followedIds.has(row.establishmentId)}
                      followBusy={followBusyIds.has(row.establishmentId)}
                      onToggleFollow={() => void toggleFollow(row.establishmentId)}
                      followLabelFollow={cpy.follow}
                      followLabelFollowing={cpy.following}
                      onPress={() =>
                        router.push(`/etablissements/${row.establishmentId}/${row.slug}` as never)
                      }
                    />
                  ))}
                </View>
              </View>
            );
          })}

          <View style={[styles.footerActions, isRTL && styles.footerActionsRtl]}>
            <Pressable
              style={({ pressed }) => [
                styles.ctaSecondary,
                isRTL && styles.ctaSecondaryRtl,
                pressed && { opacity: 0.9 },
              ]}
              onPress={() => router.replace('/diagnostic-ecoles' as never)}>
              <FontAwesome name="pencil" size={14} color={brand.primary} />
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
        </ScrollView>
      <SafeAreaView edges={['bottom']} style={styles.bottomSafe} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.primary },
  rootRtl: { direction: 'rtl' },
  headerRtl: { direction: 'rtl' },
  headerCenterRtl: { alignItems: 'flex-end' },
  headerRowRtl: { direction: 'rtl' },
  rtlNoTransform: { textTransform: 'none', letterSpacing: 0 },
  headerSafe: {
    backgroundColor: brand.primary,
    paddingBottom: spacing.md,
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
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: brand.white,
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  headerSub: {
    fontSize: fontSize.sm,
    color: diagnosticTheme.headerMuted,
    lineHeight: 20,
    marginTop: 2,
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
  yearPillRtl: { flexDirection: 'row-reverse' },
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
  statsRowRtl: { direction: 'rtl' },
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
  rtlText: { writingDirection: 'rtl', textAlign: 'right' },
  scroll: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollRtl: { direction: 'rtl' },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.md,
  },
  scrollContentRtl: { direction: 'rtl', alignItems: 'stretch' },
  centerRtl: { direction: 'rtl' },
  footerActionsRtl: { direction: 'rtl', alignItems: 'stretch' },
  ctaPrimaryRtl: { direction: 'rtl' },
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
    shadowColor: '#333E8F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  insightCardRtl: { direction: 'rtl' },
  synthesisCard: {
    borderColor: 'rgba(47,206,148,0.35)',
    backgroundColor: 'rgba(47,206,148,0.06)',
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
  section: { gap: spacing.sm },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tierHeaderRtl: { direction: 'rtl' },
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
  footerActions: { gap: spacing.sm, marginTop: spacing.md },
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
  ctaSecondaryRtl: { direction: 'rtl' },
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
