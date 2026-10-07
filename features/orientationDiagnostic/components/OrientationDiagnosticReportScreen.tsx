import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DiagnosticStatusBar } from '@/components/diagnostic/DiagnosticUi';
import { AppConfirmDialog } from '@/components/ui/AppConfirmDialog';
import { Text } from '@/components/ui/Text';
import {
  ETAWJIHI_LOGO_LIGHT_ASPECT,
  ETAWJIHI_LOGO_LIGHT_URL,
} from '@/constants/brandAssets';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { postPlanReussiteStep } from '@/services/planReussiteSteps';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { downloadOrientationDiagnosticReportPdf } from '@/utils/downloadOrientationDiagnosticReportPdf';
import { navigateToSchoolDiagnosticEntry } from '@/utils/navigateToSchoolDiagnosticEntry';
import {
  clearOrientationDiagnosticPrototypeDraft,
  persistOrientationDiagnosticPrototypeDraft,
  readOrientationDiagnosticPrototypeDraft,
} from '../constants/orientationDiagnosticPrototypeStorage';
import {
  localizeRiasecLabel,
  tOd,
  type OrientationUiLocale,
} from '../data/orientationDiagnosticI18n';
import type { OrientationReport, RiasecLetter } from '../types/orientationDiagnosticPrototype';
import {
  localizeDiagnosticBody,
  localizeDiagnosticLabel,
  localizeFamilyLabel,
  localizeForceLine,
  localizeProfileSentence,
  localizeProfileTitle,
  localizeReportPhrase,
  reportAmbitionLabel,
  reportFamilyTierLabel,
  reportFunctioningLabels,
} from '../utils/orientationDiagnosticReportLocale';
import { orientationUiLocaleFromApp } from '../utils/orientationUiLocaleFromApp';

const RIASEC_LETTERS: RiasecLetter[] = ['R', 'I', 'A', 'S', 'E', 'C'];
const RIASEC_COLORS: Record<RiasecLetter, string> = {
  R: '#0E7490',
  I: '#333E8F',
  A: '#7C3AED',
  S: '#059669',
  E: '#D97706',
  C: '#475569',
};
const FUNCTIONING_KEYS = [
  'autonomie',
  'leadership',
  'analyse',
  'contactHumain',
  'structure',
  'creativite',
  'action',
  'incertitude',
  'pratique',
  'collaboration',
  'variete',
] as const;

const LOGO_H = 28;

export function OrientationDiagnosticReportScreen() {
  const { isRTL, locale } = useLocale();
  const uiLocale = orientationUiLocaleFromApp(locale);
  const { user, getValidAccessToken } = useAuth();
  const userId = user?.id ?? null;

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<OrientationReport | null>(null);
  const [marking, setMarking] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [retakeConfirmVisible, setRetakeConfirmVisible] = useState(false);

  useEffect(() => {
    void (async () => {
      const draft = await readOrientationDiagnosticPrototypeDraft(userId);
      if (draft?.report) {
        setReport(draft.report);
      }
      setLoading(false);
      if (!draft?.report) {
        router.replace('/diagnostic-orientation' as never);
      }
    })();
  }, [userId]);

  const markReportComplete = useCallback(async () => {
    if (marking) return;
    setMarking(true);
    try {
      const token = await getValidAccessToken();
      if (token) {
        await postPlanReussiteStep(token, 'orientationReport').catch(() => undefined);
      }
      const draft = await readOrientationDiagnosticPrototypeDraft(userId);
      if (draft) {
        await persistOrientationDiagnosticPrototypeDraft({
          ...draft,
          reportParcoursSynced: true,
        });
      }
    } finally {
      setMarking(false);
    }
  }, [getValidAccessToken, marking, userId]);

  const reportSyncedRef = useRef(false);
  useEffect(() => {
    if (report && !reportSyncedRef.current) {
      reportSyncedRef.current = true;
      void markReportComplete();
    }
  }, [report, markReportComplete]);

  const onDownloadPdf = useCallback(async () => {
    if (!report || pdfBusy) return;
    setPdfBusy(true);
    try {
      await downloadOrientationDiagnosticReportPdf(report, uiLocale);
    } catch {
      Alert.alert(
        uiLocale === 'ar' ? 'خطأ' : 'Erreur',
        tOd(uiLocale, 'reportPdfError'),
      );
    } finally {
      setPdfBusy(false);
    }
  }, [pdfBusy, report, uiLocale]);

  const onRetakeTest = useCallback(() => setRetakeConfirmVisible(true), []);

  const confirmRetakeTest = useCallback(() => {
    setRetakeConfirmVisible(false);
    void (async () => {
      await clearOrientationDiagnosticPrototypeDraft(userId);
      router.replace('/diagnostic-orientation' as never);
    })();
  }, [userId]);

  if (loading || !report) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={brand.primary} />
      </View>
    );
  }

  const t = (key: string) => tOd(uiLocale, key);
  const profileTitle = localizeProfileTitle(report.profileTitle, uiLocale);
  const profileSentence = localizeProfileSentence(report, uiLocale);
  const diagLabel = localizeDiagnosticLabel(report.diagnosticLabel, uiLocale);
  const diagBody = localizeDiagnosticBody(report, uiLocale);
  const scores = report.scores.riasecConsolide;
  const fnLabels = reportFunctioningLabels(uiLocale);
  const s = report.scores;

  const identityItems = [
    { label: t('reportKvEleve'), value: report.studentSummary.fullName },
    { label: t('reportKvNiveau'), value: report.studentSummary.studyLevel },
    { label: t('reportKvBac'), value: report.studentSummary.bacLabel },
    { label: t('reportKvVilles'), value: report.studentSummary.city },
    { label: t('reportKvNotes'), value: report.studentSummary.notesLabel },
  ].filter((x) => x.value?.trim());

  return (
    <>
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <DiagnosticStatusBar />
      <View style={[styles.topBar, isRTL && styles.rowRtl]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={10}
          accessibilityRole="button">
          <FontAwesome name={isRTL ? 'chevron-right' : 'chevron-left'} size={15} color={brand.white} />
        </Pressable>
        <Text style={styles.topTitle}>{t('reportHeroKicker')}</Text>
        <Pressable
          onPress={onRetakeTest}
          style={({ pressed }) => [styles.retakeTopBtn, pressed && { opacity: 0.88 }]}
          accessibilityRole="button"
          accessibilityLabel={t('retakeTest')}>
          <FontAwesome name="refresh" size={12} color={brand.white} />
          <Text style={styles.retakeTopTxt} numberOfLines={1}>
            {t('retakeTest')}
          </Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(420)} style={styles.hero}>
            <View style={styles.heroGlowA} />
            <View style={styles.heroGlowB} />
            <Image
              source={{ uri: ETAWJIHI_LOGO_LIGHT_URL }}
              style={styles.heroLogo}
              resizeMode="contain"
              accessibilityLabel="E-TAWJIHI"
            />
            <Text style={[styles.heroKicker, isRTL && styles.rtlText]}>{diagLabel}</Text>
            <Text style={[styles.heroTitle, isRTL && styles.rtlText]}>{profileTitle}</Text>
            <Text style={[styles.heroBody, isRTL && styles.rtlText]}>{profileSentence}</Text>
            {diagBody ? (
              <Text style={[styles.heroBodyMuted, isRTL && styles.rtlText]}>{diagBody}</Text>
            ) : null}

            <View style={styles.passWrap}>
              <View style={styles.passNotchLeft} />
              <View style={styles.passNotchRight} />
              <View style={styles.pass}>
                <View style={styles.passRibbon} />
                <View style={[styles.passTop, isRTL && styles.rowRtl]}>
                  <View style={styles.passBrandCol}>
                    <Image
                      source={{ uri: ETAWJIHI_LOGO_LIGHT_URL }}
                      style={styles.passLogo}
                      resizeMode="contain"
                    />
                    <Text style={styles.passBrand}>{t('reportPassBrand')}</Text>
                  </View>
                  <Text style={styles.passChip}>{t('reportPassChip')}</Text>
                </View>
                <View style={styles.passBody}>
                  <Text style={styles.passCodeLabel}>RIASEC</Text>
                  <Text style={styles.passCode} latinDigits>
                    {s.codeConsolide || t('reportProfilFallback')}
                  </Text>
                  <Text style={[styles.passDiag, isRTL && styles.rtlText]}>{diagLabel}</Text>
                  <View style={styles.passMetrics}>
                    <View style={styles.passMetric}>
                      <Text style={styles.passMetricLabel}>{t('reportPassAmbition')}</Text>
                      <Text style={styles.passMetricValue} latinDigits>
                        {s.ambitionGlobale}%
                      </Text>
                    </View>
                    <View style={styles.passMetric}>
                      <Text style={styles.passMetricLabel}>{t('reportPassFaisabilite')}</Text>
                      <Text style={styles.passMetricValue} latinDigits>
                        {s.faisabilite}%
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.passFoot, isRTL && styles.rowRtl]}>
                  <View style={styles.passBars}>
                    {Array.from({ length: 18 }).map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.passBar,
                          { opacity: i % 3 === 0 ? 0.9 : 0.45, width: i % 4 === 0 ? 2.5 : 1.5 },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={styles.passIssuer}>E-TAWJIHI</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(80).duration(380)}
            style={[styles.snapshot, isRTL && styles.rowRtl]}>
            <SnapshotItem k="RIASEC" v={s.codeConsolide || '—'} rtl={isRTL} />
            <SnapshotItem
              k={t('reportPassAmbition')}
              v={`${s.ambitionGlobale}%`}
              rtl={isRTL}
              accent
            />
            <SnapshotItem
              k={t('reportPassFaisabilite')}
              v={`${s.faisabilite}%`}
              rtl={isRTL}
              accent
            />
          </Animated.View>

          <Section index={0} title={t('reportSec0')} rtl={isRTL}>
            <View style={styles.kvGrid}>
              {identityItems.map((item) => (
                <View key={item.label} style={styles.kvCard}>
                  <Text style={[styles.kvLabel, isRTL && styles.rtlText]}>{item.label}</Text>
                  <Text style={[styles.kvValue, isRTL && styles.rtlText]}>{item.value}</Text>
                </View>
              ))}
            </View>
          </Section>

          <Section index={1} title={t('reportSec1')} rtl={isRTL}>
            <Text style={[styles.lead, isRTL && styles.rtlText]}>{t('reportRiasecIntro')}</Text>
            <LayerCard
              rtl={isRTL}
              index="01"
              tag={t('reportLayer1Tag')}
              title={`${t('reportLayer1Title')} · ${s.codeDeclare}`}
              body={t('reportLayer1Body')}
              how={t('reportLayer1How')}
            />
            <LayerCard
              rtl={isRTL}
              index="02"
              tag={t('reportLayer2Tag')}
              title={`${t('reportLayer2Title')} · ${s.codeComportemental}`}
              body={t('reportLayer2Body')}
              how={t('reportLayer2How')}
            />
            <LayerCard
              rtl={isRTL}
              index="03"
              tag={t('reportLayer3Tag')}
              title={`${t('reportLayer3Title')} · ${s.codeConsolide}`}
              body={t('reportLayer3Body')}
              how={t('reportLayer3How')}
            />
            <View style={styles.barsBlock}>
              {RIASEC_LETTERS.map((L) => (
                <View key={L} style={[styles.barRow, isRTL && styles.rowRtl]}>
                  <View style={[styles.letterBadge, { backgroundColor: RIASEC_COLORS[L] }]}>
                    <Text style={styles.letterBadgeTxt}>{L}</Text>
                  </View>
                  <Text style={[styles.barLabel, isRTL && styles.rtlText]}>
                    {localizeRiasecLabel(L, uiLocale)}
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${scores[L]}%`, backgroundColor: RIASEC_COLORS[L] },
                      ]}
                    />
                  </View>
                  <Text style={styles.barPct} latinDigits>
                    {scores[L]}
                  </Text>
                </View>
              ))}
            </View>
          </Section>

          <Section index={2} title={t('reportSec2')} rtl={isRTL}>
            <View style={styles.radarGrid}>
              {FUNCTIONING_KEYS.map((key) => (
                <View key={key} style={styles.radarItem}>
                  <Text style={styles.radarValue} latinDigits>
                    {s.functioning[key]}%
                  </Text>
                  <Text style={[styles.radarLabel, isRTL && styles.rtlText]}>{fnLabels[key]}</Text>
                </View>
              ))}
            </View>
          </Section>

          <Section index={3} title={t('reportSec3')} rtl={isRTL}>
            {report.moteursOrdered.map((m, i) => (
              <View key={m.key} style={[styles.barRow, isRTL && styles.rowRtl]}>
                <Text style={styles.rank} latinDigits>
                  {i + 1}
                </Text>
                <Text style={[styles.barLabelWide, isRTL && styles.rtlText]}>
                  {reportAmbitionLabel(m.key, m.label, uiLocale)}
                </Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${m.score}%` }]} />
                </View>
                <Text style={styles.barPct} latinDigits>
                  {m.score}
                </Text>
              </View>
            ))}
          </Section>

          <Section index={4} title={t('reportSec4')} rtl={isRTL}>
            <View style={styles.chipWrap}>
              {report.forces.map((f) => (
                <View key={f} style={styles.chipGood}>
                  <Text style={styles.chipGoodIcon}>+</Text>
                  <Text style={[styles.chipGoodTxt, isRTL && styles.rtlText]}>
                    {localizeForceLine(f, uiLocale, report.dominante)}
                  </Text>
                </View>
              ))}
            </View>
          </Section>

          <Section index={5} title={t('reportSec5')} rtl={isRTL}>
            <View style={styles.chipWrap}>
              {report.vigilances.map((f) => (
                <View key={f} style={styles.chipWarn}>
                  <Text style={styles.chipWarnIcon}>!</Text>
                  <Text style={[styles.chipWarnTxt, isRTL && styles.rtlText]}>
                    {localizeReportPhrase(f, uiLocale)}
                  </Text>
                </View>
              ))}
            </View>
          </Section>

          <Section index={6} title={t('reportSec6')} rtl={isRTL}>
            {report.families.slice(0, 8).map((f, i) => (
              <View key={f.id} style={[styles.rankRow, isRTL && styles.rowRtl]}>
                <Text style={styles.rank} latinDigits>
                  {i + 1}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>
                    {localizeFamilyLabel(f.id, uiLocale) ||
                      localizeFamilyLabel(f.label, uiLocale) ||
                      f.label}
                  </Text>
                  <Text style={[styles.cardMeta, isRTL && styles.rtlText]}>
                    {reportFamilyTierLabel(f.tier, uiLocale)}
                  </Text>
                </View>
                <View style={styles.scorePill}>
                  <Text style={styles.scorePillTxt} latinDigits>
                    {f.score}%
                  </Text>
                </View>
              </View>
            ))}
          </Section>

          <Section index={7} title={t('reportSec7')} rtl={isRTL}>
            {report.metiers.slice(0, 10).map((m, i) => (
              <View key={m.id} style={[styles.rankRow, isRTL && styles.rowRtl]}>
                <Text style={styles.rank} latinDigits>
                  {i + 1}
                </Text>
                <Text style={[styles.cardTitle, isRTL && styles.rtlText, { flex: 1 }]}>
                  {localizeReportPhrase(m.label, uiLocale)}
                </Text>
                <View style={styles.scorePill}>
                  <Text style={styles.scorePillTxt} latinDigits>
                    {m.score}%
                  </Text>
                </View>
              </View>
            ))}
          </Section>

          <Section index={8} title={t('reportSec8')} rtl={isRTL}>
            {report.ecolesStrategie.map((line, i) => (
              <View key={i} style={[styles.strategyRow, isRTL && styles.rowRtl]}>
                <View style={styles.strategyDot} />
                <Text style={[styles.bullet, isRTL && styles.rtlText, { flex: 1 }]}>
                  {localizeReportPhrase(line, uiLocale)}
                </Text>
              </View>
            ))}
            {report.filieresSuggest.length ? (
              <View style={styles.filieresBox}>
                <Text style={[styles.filieresLabel, isRTL && styles.rtlText]}>
                  {uiLocale === 'ar' ? 'مسارات مقترحة' : 'Filières suggérées'}
                </Text>
                <Text style={[styles.filieresValue, isRTL && styles.rtlText]}>
                  {report.filieresSuggest.join(' · ')}
                </Text>
              </View>
            ) : null}
          </Section>

          <View style={{ height: 210 }} />
        </ScrollView>

        <View style={styles.ctaDock}>
          <View style={styles.ctaFade} />
          <Pressable
            onPress={onRetakeTest}
            style={({ pressed }) => [styles.ctaRetake, pressed && { opacity: 0.92 }]}
            accessibilityRole="button"
            accessibilityLabel={t('retakeTest')}>
            <FontAwesome name="refresh" size={14} color={brand.primary} />
            <Text style={styles.ctaRetakeTxt}>{t('retakeTest')}</Text>
          </Pressable>
          <Pressable
            onPress={() => void onDownloadPdf()}
            style={({ pressed }) => [styles.ctaPdf, pressed && { opacity: 0.92 }]}
            disabled={pdfBusy}
            accessibilityRole="button">
            {pdfBusy ? (
              <ActivityIndicator color={brand.primary} />
            ) : (
              <>
                <FontAwesome name="file-pdf-o" size={15} color={brand.primary} />
                <Text style={styles.ctaPdfTxt}>{t('reportPdf')}</Text>
              </>
            )}
          </Pressable>
          <Pressable
            onPress={() => {
              void markReportComplete().finally(() => {
                void navigateToSchoolDiagnosticEntry({
                  getValidAccessToken,
                  userId,
                  uiLocale: uiLocale === 'ar' ? 'ar' : 'fr',
                });
              });
            }}
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] }]}
            disabled={marking}
            accessibilityRole="button">
            {marking ? (
              <ActivityIndicator color={brand.white} />
            ) : (
              <>
                <Text style={styles.ctaTxt}>
                  {uiLocale === 'ar' ? 'متابعة — توصيات المدارس' : 'Continuer — recommandations écoles'}
                </Text>
                <FontAwesome
                  name={isRTL ? 'arrow-left' : 'arrow-right'}
                  size={14}
                  color={brand.white}
                />
              </>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
    <AppConfirmDialog
      visible={retakeConfirmVisible}
      title={t('retakeTest')}
      message={t('retakeTestConfirm')}
      cancelLabel={t('retakeTestCancel')}
      confirmLabel={t('retakeTestConfirmAction')}
      confirmDestructive
      isRTL={isRTL}
      onCancel={() => setRetakeConfirmVisible(false)}
      onConfirm={confirmRetakeTest}
    />
    </>
  );
}

function SnapshotItem({
  k,
  v,
  rtl,
  accent,
}: {
  k: string;
  v: string;
  rtl?: boolean;
  accent?: boolean;
}) {
  return (
    <View style={[styles.snapshotItem, accent && styles.snapshotItemAccent]}>
      <Text style={[styles.snapshotK, rtl && styles.rtlText]}>{k}</Text>
      <Text style={[styles.snapshotV, rtl && styles.rtlText]} latinDigits>
        {v}
      </Text>
    </View>
  );
}

function LayerCard({
  index,
  tag,
  title,
  body,
  how,
  rtl,
}: {
  index: string;
  tag: string;
  title: string;
  body: string;
  how: string;
  rtl?: boolean;
}) {
  return (
    <View style={styles.layer}>
      <View style={[styles.layerHead, rtl && styles.rowRtl]}>
        <Text style={styles.layerIndex} latinDigits>
          {index}
        </Text>
        <Text style={[styles.layerTag, rtl && styles.rtlText]}>{tag}</Text>
      </View>
      <Text style={[styles.layerTitle, rtl && styles.rtlText]}>{title}</Text>
      <Text style={[styles.cardBody, rtl && styles.rtlText]}>{body}</Text>
      <Text style={[styles.layerHow, rtl && styles.rtlText]}>{how}</Text>
    </View>
  );
}

function Section({
  index,
  title,
  children,
  rtl,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
  rtl?: boolean;
}) {
  return (
    <Animated.View
      entering={FadeInUp.delay(40 + index * 30).duration(360)}
      style={styles.section}>
      <View style={[styles.sectionHead, rtl && styles.rowRtl]}>
        <View style={styles.sectionAccent} />
        <Text style={[styles.sectionTitle, rtl && styles.rtlText]}>{title}</Text>
      </View>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#EEF1F7' },
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF1F7' },
  body: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#1a2454',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    color: brand.white,
    fontWeight: '800',
    fontSize: fontSize.sm,
    letterSpacing: 0.3,
  },
  topSpacer: { width: 36 },
  retakeTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: 120,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  retakeTopTxt: {
    color: brand.white,
    fontSize: 11,
    fontWeight: '800',
    flexShrink: 1,
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  hero: {
    borderRadius: 22,
    padding: spacing.lg,
    gap: spacing.sm,
    overflow: 'hidden',
    backgroundColor: '#1a2454',
  },
  heroGlowA: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(47,206,148,0.18)',
  },
  heroGlowB: {
    position: 'absolute',
    bottom: -50,
    left: -20,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(47,111,143,0.35)',
  },
  heroLogo: {
    height: LOGO_H,
    width: LOGO_H * ETAWJIHI_LOGO_LIGHT_ASPECT,
    marginBottom: 2,
  },
  heroKicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.72)',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: brand.white,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  heroBody: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 22,
  },
  heroBodyMuted: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 20,
  },
  passWrap: {
    marginTop: spacing.sm,
    position: 'relative',
  },
  passNotchLeft: {
    position: 'absolute',
    left: -8,
    top: '48%',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1a2454',
    zIndex: 3,
    marginTop: -8,
  },
  passNotchRight: {
    position: 'absolute',
    right: -8,
    top: '48%',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1a2454',
    zIndex: 3,
    marginTop: -8,
  },
  pass: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(18,26,61,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    transform: [{ rotate: '-0.5deg' }],
  },
  passRibbon: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: homeShell.green,
    zIndex: 1,
  },
  passTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.18)',
    borderStyle: 'dashed',
    paddingLeft: spacing.md + 4,
  },
  passBrandCol: { gap: 2 },
  passLogo: {
    height: 16,
    width: 16 * ETAWJIHI_LOGO_LIGHT_ASPECT,
  },
  passBrand: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: brand.white,
    textTransform: 'uppercase',
  },
  passChip: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#063827',
    backgroundColor: homeShell.green,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  passBody: { padding: spacing.md, paddingLeft: spacing.md + 4, gap: 6 },
  passCodeLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.55)',
  },
  passCode: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 2.5,
    color: brand.white,
  },
  passDiag: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.82)', marginBottom: 4 },
  passMetrics: { flexDirection: 'row', gap: spacing.sm },
  passMetric: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  passMetricLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  passMetricValue: { fontSize: fontSize.lg, fontWeight: '900', color: homeShell.green },
  passFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md + 4,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.18)',
  },
  passBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 18,
    flex: 1,
    maxWidth: 130,
  },
  passBar: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 1,
  },
  passIssuer: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.7)',
  },
  snapshot: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  snapshotItem: {
    flex: 1,
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.08)',
    gap: 2,
  },
  snapshotItemAccent: {
    backgroundColor: homeShell.greenSurface,
    borderColor: homeShell.greenBorder,
  },
  snapshotK: {
    fontSize: 10,
    fontWeight: '800',
    color: brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  snapshotV: {
    fontSize: fontSize.md,
    fontWeight: '900',
    color: brand.primary,
  },
  section: {
    backgroundColor: brand.white,
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.08)',
    gap: spacing.sm,
    shadowColor: '#1a2454',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  sectionAccent: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: homeShell.green,
  },
  sectionTitle: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '800',
    color: brand.primary,
  },
  lead: { fontSize: fontSize.sm, color: brand.textMuted, lineHeight: 20, marginBottom: 2 },
  kvGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  kvCard: {
    width: '48%',
    flexGrow: 1,
    minWidth: '46%',
    backgroundColor: '#F5F7FB',
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: 3,
  },
  kvLabel: { fontSize: 10, fontWeight: '700', color: brand.textMuted, textTransform: 'uppercase' },
  kvValue: { fontSize: fontSize.sm, fontWeight: '700', color: brand.text, lineHeight: 18 },
  layer: {
    backgroundColor: '#F5F7FB',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.06)',
  },
  layerHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  layerIndex: {
    fontSize: 11,
    fontWeight: '900',
    color: homeShell.greenDark,
    backgroundColor: homeShell.greenSurface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    overflow: 'hidden',
  },
  layerTag: { fontSize: 10, fontWeight: '800', color: homeShell.greenDark, letterSpacing: 0.6 },
  layerTitle: { fontSize: fontSize.sm, fontWeight: '800', color: brand.text },
  layerHow: { fontSize: fontSize.xs, color: brand.textMuted, fontStyle: 'italic', lineHeight: 18 },
  barsBlock: { gap: 2, marginTop: 4 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 5 },
  letterBadge: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterBadgeTxt: { color: brand.white, fontSize: 11, fontWeight: '900' },
  barLabel: { width: 64, fontSize: fontSize.xs, color: brand.textMuted, fontWeight: '600' },
  barLabelWide: { flex: 1.1, fontSize: fontSize.xs, color: brand.textMuted, fontWeight: '600' },
  barTrack: {
    flex: 1,
    height: 9,
    backgroundColor: '#E8ECF6',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: homeShell.green, borderRadius: 5 },
  barPct: {
    width: 28,
    fontSize: fontSize.xs,
    fontWeight: '800',
    textAlign: 'right',
    color: brand.text,
  },
  rank: {
    width: 22,
    height: 22,
    borderRadius: 11,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 11,
    fontWeight: '800',
    color: brand.primary,
    backgroundColor: '#E8ECF6',
  },
  radarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  radarItem: {
    width: '30%',
    minWidth: 96,
    flexGrow: 1,
    backgroundColor: '#F5F7FB',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.06)',
  },
  radarValue: { fontSize: fontSize.md, fontWeight: '900', color: brand.primary },
  radarLabel: { fontSize: 10, color: brand.textMuted, textAlign: 'center', marginTop: 2, lineHeight: 13 },
  chipWrap: { gap: spacing.sm },
  chipGood: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: homeShell.greenSurface,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: homeShell.greenBorder,
  },
  chipGoodIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '900',
    color: homeShell.greenDark,
    backgroundColor: 'rgba(47,206,148,0.25)',
  },
  chipGoodTxt: { flex: 1, fontSize: fontSize.sm, color: '#065F46', lineHeight: 20, fontWeight: '600' },
  chipWarn: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFF7ED',
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  chipWarnIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '900',
    color: '#B45309',
    backgroundColor: 'rgba(251,191,36,0.35)',
  },
  chipWarnTxt: { flex: 1, fontSize: fontSize.sm, color: '#9A3412', lineHeight: 20, fontWeight: '600' },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: homeShell.borderOnWhite,
  },
  scorePill: {
    backgroundColor: brand.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scorePillTxt: { color: brand.white, fontSize: 12, fontWeight: '800' },
  cardTitle: { fontSize: fontSize.sm, fontWeight: '800', color: brand.text },
  cardMeta: { fontSize: fontSize.xs, color: brand.textMuted, marginTop: 1 },
  cardBody: { fontSize: fontSize.sm, color: brand.text, lineHeight: 20 },
  bullet: { fontSize: fontSize.sm, color: brand.text, lineHeight: 20 },
  strategyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  strategyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: homeShell.green,
    marginTop: 7,
  },
  filieresBox: {
    marginTop: spacing.xs,
    backgroundColor: homeShell.greenSurface,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: homeShell.greenBorder,
    gap: 4,
  },
  filieresLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: homeShell.greenDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filieresValue: { fontSize: fontSize.sm, fontWeight: '700', color: '#065F46', lineHeight: 20 },
  ctaDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.lg,
  },
  ctaFade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(238,241,247,0.92)',
  },
  ctaRetake: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: brand.white,
    borderRadius: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(51,62,143,0.22)',
    marginBottom: spacing.sm,
  },
  ctaRetakeTxt: { color: brand.primary, fontWeight: '800', fontSize: fontSize.sm },
  ctaPdf: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: brand.white,
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(51,62,143,0.28)',
    marginBottom: spacing.sm,
  },
  ctaPdfTxt: { color: brand.primary, fontWeight: '800', fontSize: fontSize.md },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: homeShell.green,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#158f65',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 4,
  },
  ctaTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.md },
  rtlText: { writingDirection: 'rtl', textAlign: 'right' },
  rowRtl: { flexDirection: 'row-reverse' },
});
