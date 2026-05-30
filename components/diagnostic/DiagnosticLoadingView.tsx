import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { ComponentProps } from 'react';
import { useEffect, useRef } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import {
  DIAGNOSTIC_ANALYSIS_MESSAGES,
  DIAGNOSTIC_LOADING_COPY,
  diagnosticContentLocale,
  type DiagnosticUiLocale,
} from '@/constants/diagnosticWizardUi';
import { useSimulatedLoadingProgress } from '@/utils/useSimulatedLoadingProgress';
import { DiagnosticStatusBar, diagnosticTheme } from '@/components/diagnostic/DiagnosticUi';
import {
  ETAWJIHI_HEADER_LOGO_HEIGHT,
  ETAWJIHI_LOGO_LIGHT_ASPECT,
  ETAWJIHI_LOGO_LIGHT_URL,
} from '@/constants/brandAssets';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

export type DiagnosticLoadingVariant = 'boot' | 'analysis' | 'ia' | 'results' | 'report' | 'saving';

export type DiagnosticLoadingFooterAction = {
  label: string;
  hint?: string;
  onPress: () => void;
};

type Props = {
  variant: DiagnosticLoadingVariant;
  /** Index du message d’analyse (rotation). */
  messageIndex?: number;
  /** Plein écran avec bandeau charte (défaut true sauf `saving`). */
  fullScreen?: boolean;
  /** Progression simulée 0–100 (si fournie, remplace le calcul interne). */
  progressPercent?: number;
  /** Mise en page droite-à-gauche (arabe). */
  rtl?: boolean;
  /** Langue des libellés (prioritaire sur `rtl` pour les textes). */
  locale?: DiagnosticUiLocale;
  /** Bouton optionnel sous la carte (ex. continuer en arrière-plan pendant l’analyse). */
  footerAction?: DiagnosticLoadingFooterAction;
};

const ANALYSIS_ICONS: ComponentProps<typeof FontAwesome>['name'][] = [
  'user',
  'university',
  'line-chart',
  'magic',
];

type FaName = ComponentProps<typeof FontAwesome>['name'];

/** Index d’étape d’analyse : avance uniquement (jamais de retour arrière). */
function useMonotonicAnalysisIndex(messageIndex: number): number {
  const maxRef = useRef(messageIndex);
  maxRef.current = Math.max(maxRef.current, messageIndex);
  return maxRef.current;
}

function LoadingBrandLogo({ height = ETAWJIHI_HEADER_LOGO_HEIGHT }: { height?: number }) {
  return (
    <Image
      source={{ uri: ETAWJIHI_LOGO_LIGHT_URL }}
      style={{
        width: height * ETAWJIHI_LOGO_LIGHT_ASPECT,
        maxWidth: '88%',
        height,
        aspectRatio: ETAWJIHI_LOGO_LIGHT_ASPECT,
      }}
      resizeMode="contain"
      accessibilityLabel="E-Tawjihi"
      accessibilityIgnoresInvertColors
    />
  );
}

function BrandHeaderBand({ rtl }: { rtl?: boolean }) {
  return (
    <View style={styles.brandBand}>
      <View style={[styles.brandBandStripe, rtl && styles.brandBandStripeRtl]} />
      <View style={styles.brandBandInner}>
        <LoadingBrandLogo />
      </View>
    </View>
  );
}

function SpinnerRing({ accent = 'primary' }: { accent?: 'primary' | 'green' }) {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1400, easing: Easing.linear }),
      -1,
    );
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [rotation, pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.35, 0.85]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.96, 1.04]) }],
  }));

  const ringColor = accent === 'green' ? homeShell.green : brand.primary;
  const ringSoft = accent === 'green' ? homeShell.greenAlpha28 : 'rgba(51, 62, 143, 0.2)';

  return (
    <View style={styles.spinnerWrap}>
      <Animated.View style={[styles.spinnerGlow, glowStyle, { backgroundColor: ringSoft }]} />
      <Animated.View
        style={[
          styles.spinnerRing,
          ringStyle,
          { borderTopColor: ringColor, borderRightColor: ringColor },
        ]}
      />
      <View style={[styles.spinnerCore, accent === 'green' && styles.spinnerCoreGreen]}>
        <FontAwesome
          name={accent === 'green' ? 'magic' : 'graduation-cap'}
          size={26}
          color={accent === 'green' ? homeShell.greenDark : brand.primary}
        />
      </View>
    </View>
  );
}

function BootDot({ delay }: { delay: number }) {
  const o = useSharedValue(0.35);
  useEffect(() => {
    o.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: delay }),
        withTiming(1, { duration: 400 }),
        withTiming(0.35, { duration: 400 }),
      ),
      -1,
    );
  }, [delay, o]);
  const dotStyle = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[styles.bootDot, dotStyle]} />;
}

function loadingLocale(rtl?: boolean, locale?: DiagnosticUiLocale): DiagnosticUiLocale {
  return diagnosticContentLocale(rtl, locale);
}

function AnalysisProgressBar({
  percent,
  rtl,
  locale,
}: {
  percent: number;
  rtl?: boolean;
  locale?: DiagnosticUiLocale;
}) {
  const progress = useSharedValue(0);
  const shimmer = useSharedValue(0);
  const nearEnd = percent >= 88;

  useEffect(() => {
    progress.value = withTiming(Math.min(1, percent / 100), {
      duration: 380,
      easing: Easing.out(Easing.cubic),
    });
  }, [percent, progress]);

  useEffect(() => {
    if (!nearEnd) {
      shimmer.value = 0;
      return;
    }
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.55, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [nearEnd, shimmer]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.round(progress.value * 100)}%`,
    opacity: nearEnd ? interpolate(shimmer.value, [0, 1], [0.88, 1]) : 1,
  }));

  const display = Math.min(100, Math.max(0, Math.round(percent)));

  const lang = loadingLocale(rtl, locale);
  const copy = DIAGNOSTIC_LOADING_COPY[lang];

  return (
    <View style={styles.analysisProgressWrap}>
      <View style={[styles.analysisProgressLabels, rtl && styles.analysisProgressLabelsRtl]}>
        <Text style={[styles.analysisProgressLabel, rtl && styles.rtlText]}>{copy.progressLabel}</Text>
        <Text style={[styles.analysisProgressPct, rtl && styles.rtlText]} latinDigits={rtl}>
          {rtl ? `\u2066${display}%\u2069` : `${display}%`}
        </Text>
      </View>
      <View style={[styles.analysisTrack, rtl && styles.analysisTrackRtl]}>
        <Animated.View style={[styles.analysisFill, fillStyle]} />
      </View>
    </View>
  );
}

function AnalysisStepsList({
  phaseIndex,
  rtl,
  locale,
}: {
  phaseIndex: number;
  rtl?: boolean;
  locale?: DiagnosticUiLocale;
}) {
  const messages = DIAGNOSTIC_ANALYSIS_MESSAGES[loadingLocale(rtl, locale)];
  const stepPulse = useSharedValue(0);

  useEffect(() => {
    stepPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [stepPulse]);

  const activeIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(stepPulse.value, [0, 1], [1, 1.06]) }],
  }));

  return (
    <View style={styles.stepsList}>
      {messages.map((msg, i) => {
        const done = i < phaseIndex;
        const active = i === phaseIndex;
        const icon = ANALYSIS_ICONS[i] ?? 'circle';
        return (
          <View
            key={msg}
            style={[
              styles.stepRow,
              rtl && styles.stepRowRtl,
              active && styles.stepRowActive,
              done && styles.stepRowDone,
            ]}>
            <Animated.View
              style={[
                styles.stepIcon,
                done && styles.stepIconDone,
                active && styles.stepIconActive,
                active && activeIconStyle,
              ]}>
              {done ? (
                <FontAwesome name="check" size={11} color={homeShell.greenDark} />
              ) : (
                <FontAwesome
                  name={icon as FaName}
                  size={12}
                  color={active ? brand.primary : brand.textMuted}
                />
              )}
            </Animated.View>
            <Text
              style={[
                styles.stepLabel,
                rtl && styles.rtlText,
                done && styles.stepLabelDone,
                active && styles.stepLabelActive,
              ]}
              numberOfLines={2}>
              {msg.replace(/…$/, '')}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function LoadingCard({
  variant,
  messageIndex = 0,
  progressPercent: progressPercentProp,
  rtl = false,
  locale,
}: {
  variant: DiagnosticLoadingVariant;
  messageIndex?: number;
  progressPercent?: number;
  rtl?: boolean;
  locale?: DiagnosticUiLocale;
}) {
  const lang = loadingLocale(rtl, locale);
  const isAnalysis = variant === 'analysis' || variant === 'ia';
  const isIa = variant === 'ia';
  const isBoot = variant === 'boot';
  const isResults = variant === 'results';
  const isReport = variant === 'report';
  const copy = DIAGNOSTIC_LOADING_COPY[lang];
  const analysisMessages = DIAGNOSTIC_ANALYSIS_MESSAGES[lang];

  const title = isIa
    ? copy.iaEnrichmentTitle
    : isAnalysis
    ? copy.analysisTitle
    : isResults
      ? copy.resultsTitle
      : isReport
        ? copy.reportTitle
        : isBoot
          ? copy.bootTitle
          : copy.saving;

  const subtitle = isIa
    ? copy.iaEnrichmentSubtitle
    : isAnalysis
    ? copy.analysisSubtitle
    : isResults
      ? copy.resultsSubtitle
      : isReport
        ? copy.reportSubtitle
        : isBoot
          ? copy.bootSubtitle
          : undefined;

  const phaseIndex = useMonotonicAnalysisIndex(messageIndex);
  const activeMsg = analysisMessages[phaseIndex]!;
  const { percent: internalPercent } = useSimulatedLoadingProgress(isAnalysis && progressPercentProp == null);
  const analysisPercent = progressPercentProp ?? internalPercent;
  const spinnerAccent = isAnalysis || isIa ? 'green' : 'primary';

  return (
    <View style={[styles.card, variant === 'saving' && styles.cardCompact]}>
      <SpinnerRing accent={spinnerAccent} />

      <Text style={[styles.cardTitle, rtl && styles.rtlText]}>{title}</Text>
      {subtitle ? <Text style={[styles.cardSub, rtl && styles.rtlText]}>{subtitle}</Text> : null}

      {isAnalysis ? (
        <>
          <AnalysisProgressBar percent={analysisPercent} rtl={rtl} locale={locale} />
          <Animated.View
            key={phaseIndex}
            entering={FadeIn.duration(280)}
            exiting={FadeOut.duration(180)}
            style={styles.liveMsgWrap}>
            <Text style={[styles.liveMsg, rtl && styles.rtlText]}>{activeMsg}</Text>
          </Animated.View>
          <AnalysisStepsList phaseIndex={phaseIndex} rtl={rtl} locale={locale} />
        </>
      ) : null}

      {isBoot || isResults || isReport ? (
        <View style={styles.bootDots}>
          {[0, 1, 2].map((i) => (
            <BootDot key={i} delay={i * 180} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** Écran ou overlay de chargement diagnostic (charte #333E8F + #2fce94). */
export function DiagnosticLoadingView({
  variant,
  messageIndex = 0,
  fullScreen,
  progressPercent,
  rtl = false,
  locale,
  footerAction,
}: Props) {
  const fullscreen = fullScreen ?? variant !== 'saving';
  const lang = loadingLocale(rtl, locale);
  const copy = DIAGNOSTIC_LOADING_COPY[lang];

  if (variant === 'saving') {
    return (
      <View style={[styles.savingRow, rtl && styles.savingRowRtl]}>
        <View style={styles.savingSpinner}>
          <SpinnerRing accent="primary" />
        </View>
        <Text style={[styles.savingTxt, rtl && styles.rtlText]}>{copy.saving}</Text>
      </View>
    );
  }

  if (!fullscreen) {
    return (
      <LoadingCard
        variant={variant}
        messageIndex={messageIndex}
        progressPercent={progressPercent}
        rtl={rtl}
        locale={locale}
      />
    );
  }

  return (
    <View style={[styles.screen, rtl && styles.screenRtl]}>
      <DiagnosticStatusBar />
      <View style={styles.headerShell}>
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <BrandHeaderBand rtl={rtl} />
        </SafeAreaView>
      </View>
      <View style={styles.screenBody}>
        <LoadingCard
          variant={variant}
          messageIndex={messageIndex}
          progressPercent={progressPercent}
          rtl={rtl}
          locale={locale}
        />
      </View>
      <SafeAreaView edges={['bottom']} style={styles.screenFooterSafe}>
        <View style={styles.screenFooter}>
          {footerAction ? (
            <View style={styles.footerActionWrap}>
              <Pressable
                onPress={footerAction.onPress}
                style={({ pressed }) => [styles.footerActionBtn, pressed && { opacity: 0.88 }]}
                accessibilityRole="button">
                <Text style={[styles.footerActionTxt, rtl && styles.rtlText]}>{footerAction.label}</Text>
              </Pressable>
              {footerAction.hint ? (
                <Text style={[styles.footerActionHint, rtl && styles.rtlText]}>{footerAction.hint}</Text>
              ) : null}
            </View>
          ) : null}
          <View style={[styles.footerPill, rtl && styles.footerPillRtl, { backgroundColor: homeShell.greenAlpha18 }]}>
            <FontAwesome name="shield" size={12} color={homeShell.greenDark} />
            <Text style={[styles.footerPillTxt, rtl && styles.rtlText]}>{copy.secureFooter}</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: diagnosticTheme.surfaceSoft,
  },
  screenRtl: {
    direction: 'rtl',
  },
  headerShell: {
    backgroundColor: diagnosticTheme.headerBg,
  },
  headerSafeArea: {
    backgroundColor: diagnosticTheme.headerBg,
  },
  brandBand: {
    backgroundColor: diagnosticTheme.headerBg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    overflow: 'hidden',
  },
  brandBandStripe: {
    position: 'absolute',
    start: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: homeShell.green,
  },
  brandBandStripeRtl: {
    start: undefined,
    end: 0,
  },
  brandBandInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  screenBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  screenFooterSafe: {
    backgroundColor: diagnosticTheme.surfaceSoft,
  },
  screenFooter: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  footerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  footerPillTxt: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: homeShell.greenDark,
  },
  footerActionWrap: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  footerActionBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(51, 62, 143, 0.25)',
    backgroundColor: brand.white,
  },
  footerActionTxt: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: brand.primary,
    textAlign: 'center',
  },
  footerActionHint: {
    marginTop: spacing.sm,
    fontSize: fontSize.xs,
    color: brand.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    overflow: 'hidden',
    padding: spacing.xxl,
    borderWidth: 1,
    borderColor: 'rgba(51, 62, 143, 0.1)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  cardCompact: {
    padding: spacing.lg,
    maxWidth: 280,
  },
  spinnerWrap: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  spinnerGlow: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  spinnerRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'transparent',
    borderBottomColor: 'rgba(51, 62, 143, 0.12)',
    borderLeftColor: 'rgba(51, 62, 143, 0.12)',
  },
  spinnerCore: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: diagnosticTheme.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerCoreGreen: {
    backgroundColor: homeShell.greenAlpha11,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: brand.primary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  cardSub: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: brand.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.sm,
  },
  analysisProgressWrap: {
    width: '100%',
    marginTop: spacing.lg,
  },
  analysisProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  analysisProgressLabelsRtl: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  analysisProgressLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: brand.textMuted,
  },
  analysisProgressPct: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.primary,
    fontVariant: ['tabular-nums'],
  },
  analysisTrack: {
    width: '100%',
    height: 8,
    borderRadius: radius.full,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  analysisTrackRtl: { direction: 'rtl' },
  analysisFill: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: homeShell.green,
  },
  liveMsgWrap: {
    marginTop: spacing.md,
    minHeight: 22,
    width: '100%',
  },
  liveMsg: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: homeShell.greenDark,
    textAlign: 'center',
  },
  stepsList: {
    width: '100%',
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  stepRowRtl: {
    flexDirection: 'row-reverse',
  },
  stepRowActive: {
    backgroundColor: diagnosticTheme.primarySoft,
  },
  stepRowDone: {
    opacity: 0.72,
  },
  stepIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.backgroundSoft,
  },
  stepIconActive: {
    backgroundColor: 'rgba(51, 62, 143, 0.14)',
  },
  stepIconDone: {
    backgroundColor: homeShell.greenAlpha18,
  },
  stepLabel: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: brand.textMuted,
  },
  stepLabelActive: {
    color: brand.primary,
    fontWeight: '800',
  },
  stepLabelDone: {
    color: homeShell.greenDark,
  },
  bootDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.lg,
  },
  bootDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: brand.primary,
  },
  savingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  savingRowRtl: {
    flexDirection: 'row-reverse',
  },
  savingSpinner: {
    width: 28,
    height: 28,
    transform: [{ scale: 0.32 }],
    marginStart: -8,
    marginEnd: -8,
  },
  footerPillRtl: {
    flexDirection: 'row-reverse',
  },
  savingTxt: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: brand.primary,
  },
});
