import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { DiagnosticStepHeader } from '@/components/diagnostic/DiagnosticUi';
import { AppConfirmDialog } from '@/components/ui/AppConfirmDialog';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { postPlanReussiteStep } from '@/services/planReussiteSteps';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import {
  clearOrientationDiagnosticPrototypeDraft,
  completedModulesUpTo,
  persistOrientationDiagnosticPrototypeDraft,
  readOrientationDiagnosticPrototypeDraft,
  type OrientationDiagnosticPrototypeDraft,
} from '../constants/orientationDiagnosticPrototypeStorage';
import type { ModuleId } from '../types/orientationDiagnosticPrototype';
import { buildOrientationCoreSteps } from '../data/orientationDiagnosticQuestions';
import { localizeModuleMeta, localizeStep, tOd } from '../data/orientationDiagnosticI18n';
import type { DiagnosticAnswers } from '../types/orientationDiagnosticPrototype';
import {
  buildOrientationReport,
  emptyAnswers,
  isStepAnswered,
} from '../utils/orientationDiagnosticEngine';
import { buildSchoolRecommendations } from '../utils/orientationDiagnosticSchoolReco';
import { orientationUiLocaleFromApp } from '../utils/orientationUiLocaleFromApp';
import { buildVersusPlan, versusPlanToSteps } from '../utils/orientationDiagnosticVersus';
import { submitOrientationAnswersAsSchoolRecommendations } from '@/utils/syncOrientationToSchoolRecommendations';
import { OrientationDiagnosticBriefScreen } from './OrientationDiagnosticBriefScreen';
import { OrientationDiagnosticStepContent } from './OrientationDiagnosticStepContent';
import { OrientationCatalogDetailProvider } from './OrientationCatalogDetailSheet';
import { OrientationDiagnosticWizardShell } from './OrientationDiagnosticWizardShell';
export function OrientationDiagnosticWizard() {
  const { isRTL, locale } = useLocale();
  const uiLocale = orientationUiLocaleFromApp(locale);
  const { user, getValidAccessToken } = useAuth();
  const userId = user?.id ?? null;

  const [booting, setBooting] = useState(true);
  const [answers, setAnswers] = useState<DiagnosticAnswers>(() => emptyAnswers());
  const [stepIndex, setStepIndex] = useState(0);
  const [restoreStepId, setRestoreStepId] = useState<string | null>(null);
  const [situationPhase, setSituationPhase] = useState<'most' | 'least'>('most');
  const [situationBriefDone, setSituationBriefDone] = useState(false);
  const [versusBriefDone, setVersusBriefDone] = useState(false);
  const [versusBuilding, setVersusBuilding] = useState(false);
  const [reportBuilding, setReportBuilding] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [moduleFlash, setModuleFlash] = useState<string | null>(null);
  const [lastCompletedModule, setLastCompletedModule] = useState<ModuleId | null>(null);
  const [completedModules, setCompletedModules] = useState<ModuleId[]>([]);
  const [confirmKind, setConfirmKind] = useState<'quit' | 'retake' | null>(null);
  const resumedRef = useRef(false);

  const persistProgress = useCallback(
    (patch: Partial<OrientationDiagnosticPrototypeDraft> & { answers: DiagnosticAnswers }) => {
      void persistOrientationDiagnosticPrototypeDraft({
        userId,
        phase: patch.phase ?? 'quiz',
        stepId: patch.stepId ?? 'profile_identity',
        lastCompletedModule: patch.lastCompletedModule ?? lastCompletedModule,
        completedModules: patch.completedModules ?? completedModules,
        answers: patch.answers,
        ui: {
          situationBriefDone: patch.ui?.situationBriefDone ?? situationBriefDone,
          versusBriefDone: patch.ui?.versusBriefDone ?? versusBriefDone,
          situationPhase: patch.ui?.situationPhase ?? situationPhase,
        },
        uiLocale,
        report: patch.report ?? null,
        reportParcoursSynced: patch.reportParcoursSynced,
      });
    },
    [
      userId,
      lastCompletedModule,
      completedModules,
      situationBriefDone,
      versusBriefDone,
      situationPhase,
      uiLocale,
    ],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const draft = await readOrientationDiagnosticPrototypeDraft(userId);
      if (draft?.phase === 'report' && draft.report) {
        router.replace('/diagnostic-orientation/rapport' as never);
        return;
      }
      if (draft?.phase === 'quiz' && draft.answers) {
        setAnswers(draft.answers);
        setSituationBriefDone(draft.ui.situationBriefDone);
        setVersusBriefDone(draft.ui.versusBriefDone);
        setSituationPhase(draft.ui.situationPhase);
        setLastCompletedModule(draft.lastCompletedModule);
        setCompletedModules(draft.completedModules ?? completedModulesUpTo(draft.lastCompletedModule));
        setRestoreStepId(draft.stepId);
        resumedRef.current = true;
        setBooting(false);
        return;
      }

      // Profil toujours vide au démarrage (pas de préremplissage compte / profil).
      if (!cancelled) {
        const fresh = emptyAnswers();
        setAnswers(fresh);
        const firstId = buildOrientationCoreSteps({ multi: {}, labels: {} })[0]?.id || 'profile_identity';
        void persistOrientationDiagnosticPrototypeDraft({
          userId,
          phase: 'quiz',
          stepId: firstId,
          lastCompletedModule: null,
          completedModules: [],
          answers: fresh,
          ui: { situationBriefDone: false, versusBriefDone: false, situationPhase: 'most' },
          uiLocale,
        });
        setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, uiLocale]);

  const coreSteps = useMemo(
    () => buildOrientationCoreSteps(answers),
    [answers.multi.car_secteurs, answers.multi.sch_types, answers.labels],
  );
  const quizSteps = useMemo(
    () => [...coreSteps, ...versusPlanToSteps(answers.versusPlan ?? [])],
    [coreSteps, answers.versusPlan],
  );
  const coreStepsCount = coreSteps.length;
  const totalSteps = Math.max(quizSteps.length, coreStepsCount);
  const step = quizSteps[stepIndex];
  const displayStep = useMemo(
    () => (step ? localizeStep(step, uiLocale) : null),
    [step, uiLocale],
  );

  const firstSituationIndex = useMemo(
    () => coreSteps.findIndex((s) => s.kind === 'situation'),
    [coreSteps],
  );
  const firstVersusIndex = coreStepsCount;
  const showSituationBrief =
    Boolean(step?.kind === 'situation') &&
    stepIndex === firstSituationIndex &&
    !situationBriefDone;
  const showVersusBrief =
    Boolean(step?.kind === 'versus') && stepIndex === firstVersusIndex && !versusBriefDone;

  useEffect(() => {
    if (!restoreStepId || !quizSteps.length) return;
    const idx = quizSteps.findIndex((s) => s.id === restoreStepId);
    setStepIndex(idx >= 0 ? idx : 0);
    setRestoreStepId(null);
  }, [quizSteps, restoreStepId]);

  useEffect(() => {
    if (stepIndex >= quizSteps.length && quizSteps.length > 0) {
      setStepIndex(quizSteps.length - 1);
    }
  }, [quizSteps.length, stepIndex]);

  useEffect(() => {
    if (!step || step.kind !== 'situation') {
      setSituationPhase('most');
    }
  }, [step?.id, step?.kind]);

  useEffect(() => {
    if (!moduleFlash) return;
    const t = setTimeout(() => setModuleFlash(null), 3200);
    return () => clearTimeout(t);
  }, [moduleFlash]);

  const finishWithReport = useCallback(
    async (ans: DiagnosticAnswers) => {
      setReportBuilding(true);
      try {
        let report = buildOrientationReport(ans);
        const ecolesRecommandees = await buildSchoolRecommendations(ans);
        report = { ...report, ecolesRecommandees };
        let schoolRecoPublicCode: string | null = null;
        try {
          const reco = await submitOrientationAnswersAsSchoolRecommendations(ans, {
            getValidAccessToken,
            userId,
            uiLocale: uiLocale === 'ar' ? 'ar' : 'fr',
          });
          schoolRecoPublicCode = reco?.publicCode?.trim().toLowerCase() || null;
        } catch {
          /* le CTA rapport pourra retenter la sync */
        }
        await persistOrientationDiagnosticPrototypeDraft({
          userId,
          phase: 'report',
          stepId: 'report',
          lastCompletedModule: 'versus',
          completedModules: completedModulesUpTo('versus'),
          answers: ans,
          ui: { situationBriefDone, versusBriefDone, situationPhase: 'most' },
          uiLocale,
          report,
          schoolRecoPublicCode,
        });
        const token = await getValidAccessToken();
        if (token) {
          await postPlanReussiteStep(token, 'orientationDiagnostic').catch(() => undefined);
        }
        router.replace('/diagnostic-orientation/rapport' as never);
      } finally {
        setReportBuilding(false);
      }
    },
    [getValidAccessToken, situationBriefDone, versusBriefDone, uiLocale, userId],
  );

  const enterVersusModule = useCallback(async () => {
    setVersusBuilding(true);
    try {
      const completedModule = step?.module ?? 'schools';
      const built = await buildVersusPlan(answers);
      if (!built.plan.length) {
        const ans = {
          ...answers,
          versusPlan: [],
          versusField: built.field,
          versusLog: [],
          versusRankings: { metiers: [], ecoles: [] },
        };
        setAnswers(ans);
        setModuleFlash(tOd(uiLocale, 'moduleSaved'));
        await finishWithReport(ans);
        return;
      }
      const base = {
        ...answers,
        versusPlan: built.plan,
        versusField: built.field,
        versusLog: built.log,
        versusRankings: built.rankings,
      };
      const labels = { ...base.labels };
      for (const d of base.versusPlan ?? []) {
        for (const o of d.options) labels[o.id] = o.label;
      }
      for (const m of built.field.metiers) labels[m.id] = m.label;
      for (const e of built.field.ecoles) labels[e.id] = e.label;
      const merged = { ...base, labels };
      setAnswers(merged);
      setVersusBriefDone(false);
      setStepIndex(coreStepsCount);
      const versusFirstId = versusPlanToSteps(merged.versusPlan ?? [])[0]?.id || 'versus';
      const doneMods = completedModulesUpTo(completedModule, [
        ...completedModulesUpTo(lastCompletedModule),
        completedModule,
      ]);
      setLastCompletedModule(completedModule);
      setCompletedModules(doneMods);
      persistProgress({
        phase: 'quiz',
        stepId: versusFirstId,
        answers: merged,
        lastCompletedModule: completedModule,
        completedModules: doneMods,
        ui: { versusBriefDone: false, situationBriefDone, situationPhase: 'most' },
      });
      setModuleFlash(tOd(uiLocale, 'moduleSaved'));
    } catch {
      await finishWithReport(answers);
    } finally {
      setVersusBuilding(false);
    }
  }, [
    answers,
    completedModules,
    coreStepsCount,
    finishWithReport,
    lastCompletedModule,
    persistProgress,
    situationBriefDone,
    step?.module,
    uiLocale,
  ]);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    });
  }, [stepIndex, situationPhase, situationBriefDone, versusBriefDone]);

  const canContinue = useMemo(() => {
    if (!step) return false;
    if (showSituationBrief || showVersusBrief) return true;
    if (step.kind === 'situation') {
      const sit = answers.situations[step.id];
      if (situationPhase === 'most') return Boolean(sit?.most);
      return Boolean(sit?.most && sit?.least && sit.most !== sit.least);
    }
    return isStepAnswered(step.id, answers, step);
  }, [answers, showSituationBrief, showVersusBrief, situationPhase, step]);

  const goNext = () => {
    if (!canContinue || !step || versusBuilding || reportBuilding || catalogLoading) return;
    if (showSituationBrief) {
      setSituationBriefDone(true);
      setSituationPhase('most');
      persistProgress({
        answers,
        ui: { situationBriefDone: true, versusBriefDone, situationPhase: 'most' },
      });
      return;
    }
    if (showVersusBrief) {
      setVersusBriefDone(true);
      persistProgress({
        answers,
        ui: { situationBriefDone, versusBriefDone: true, situationPhase },
      });
      return;
    }
    if (step.kind === 'situation' && situationPhase === 'most') {
      setSituationPhase('least');
      persistProgress({
        answers,
        ui: { situationBriefDone, versusBriefDone, situationPhase: 'least' },
      });
      return;
    }
    if (stepIndex === coreStepsCount - 1) {
      void enterVersusModule();
      return;
    }
    if (stepIndex >= totalSteps - 1) {
      void finishWithReport(answers);
      return;
    }
    const nextIndex = stepIndex + 1;
    const nextStep = quizSteps[nextIndex];
    const crossedModule = Boolean(nextStep && nextStep.module !== step.module);
    setSituationPhase('most');
    setStepIndex(nextIndex);
    let nextLast = lastCompletedModule;
    let nextCompleted = completedModules;
    if (crossedModule) {
      nextLast = step.module;
      nextCompleted = completedModulesUpTo(step.module, [
        ...completedModulesUpTo(lastCompletedModule),
        step.module,
      ]);
      setLastCompletedModule(nextLast);
      setCompletedModules(nextCompleted);
      setModuleFlash(tOd(uiLocale, 'moduleSaved'));
    }
    persistProgress({
      phase: 'quiz',
      stepId: nextStep?.id || step.id,
      answers,
      lastCompletedModule: crossedModule ? step.module : lastCompletedModule,
      completedModules: nextCompleted,
      ui: { situationBriefDone, versusBriefDone, situationPhase: 'most' },
    });
  };

  const canGoBack = useMemo(() => {
    if (versusBuilding || reportBuilding || catalogLoading) return false;
    if (showSituationBrief) return stepIndex > 0;
    if (showVersusBrief) return true;
    if (
      step?.kind === 'situation' &&
      situationPhase === 'most' &&
      stepIndex === firstSituationIndex &&
      situationBriefDone
    ) {
      return true;
    }
    if (step?.kind === 'versus' && stepIndex === firstVersusIndex && versusBriefDone) {
      return true;
    }
    if (step?.kind === 'situation' && situationPhase === 'least') return true;
    if (stepIndex <= 0) return false;
    return true;
  }, [
    versusBuilding,
    reportBuilding,
    catalogLoading,
    showSituationBrief,
    showVersusBrief,
    step?.kind,
    situationPhase,
    stepIndex,
    firstSituationIndex,
    firstVersusIndex,
    situationBriefDone,
    versusBriefDone,
  ]);

  const goPrev = () => {
    if (!canGoBack) return;
    if (showSituationBrief) {
      setStepIndex((i) => i - 1);
      setSituationPhase('most');
      return;
    }
    if (showVersusBrief) {
      setVersusBriefDone(false);
      setAnswers((prev) => ({ ...prev, versusPlan: [] }));
      setStepIndex(coreStepsCount - 1);
      return;
    }
    if (
      step?.kind === 'situation' &&
      situationPhase === 'most' &&
      stepIndex === firstSituationIndex &&
      situationBriefDone
    ) {
      setSituationBriefDone(false);
      return;
    }
    if (step?.kind === 'versus' && stepIndex === firstVersusIndex && versusBriefDone) {
      setVersusBriefDone(false);
      return;
    }
    if (step?.kind === 'situation' && situationPhase === 'least') {
      setSituationPhase('most');
      return;
    }
    if (stepIndex === firstVersusIndex) {
      setAnswers((prev) => ({ ...prev, versusPlan: [] }));
      setVersusBriefDone(false);
      setStepIndex(coreStepsCount - 1);
      setSituationPhase('most');
      return;
    }
    setSituationPhase('most');
    setStepIndex((i) => i - 1);
  };

  const quitTest = useCallback(() => setConfirmKind('quit'), []);
  const retakeTest = useCallback(() => setConfirmKind('retake'), []);

  const closeConfirm = useCallback(() => setConfirmKind(null), []);

  const confirmQuit = useCallback(() => {
    setConfirmKind(null);
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)' as never);
  }, []);

  const confirmRetake = useCallback(() => {
    setConfirmKind(null);
    void (async () => {
      const fresh = emptyAnswers();
      await clearOrientationDiagnosticPrototypeDraft(userId);
      setAnswers(fresh);
      setStepIndex(0);
      setRestoreStepId(null);
      setSituationPhase('most');
      setSituationBriefDone(false);
      setVersusBriefDone(false);
      setVersusBuilding(false);
      setReportBuilding(false);
      setCatalogLoading(false);
      setModuleFlash(null);
      setLastCompletedModule(null);
      setCompletedModules([]);
      resumedRef.current = false;
      const firstId =
        buildOrientationCoreSteps({ multi: {}, labels: {} })[0]?.id || 'profile_identity';
      await persistOrientationDiagnosticPrototypeDraft({
        userId,
        phase: 'quiz',
        stepId: firstId,
        lastCompletedModule: null,
        completedModules: [],
        answers: fresh,
        ui: { situationBriefDone: false, versusBriefDone: false, situationPhase: 'most' },
        uiLocale,
        report: null,
        reportParcoursSynced: false,
      });
    })();
  }, [uiLocale, userId]);

  if (booting || !step || !displayStep) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={brand.primary} />
      </View>
    );
  }

  const subtitle =
    showSituationBrief || showVersusBrief
      ? ''
      : step.kind === 'situation'
        ? situationPhase === 'most'
          ? tOd(uiLocale, 'situationMostSub')
          : tOd(uiLocale, 'situationLeastSub')
        : displayStep.subtitle || '';

  return (
    <OrientationCatalogDetailProvider uiLocale={uiLocale}>
      <OrientationDiagnosticWizardShell
        uiLocale={uiLocale}
        rtl={isRTL}
        currentModule={step.module}
        completedModules={completedModules}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        onBack={goPrev}
        onContinue={goNext}
        onQuit={quitTest}
        onRetake={retakeTest}
        continueDisabled={!canContinue}
        backDisabled={!canGoBack}
        busy={versusBuilding || reportBuilding || catalogLoading}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.moduleBanner}>
            <Text style={[styles.moduleLabel, isRTL && styles.rtlText]}>{localizeModuleMeta(step.module, uiLocale).label}</Text>
            <Text style={[styles.moduleObjective, isRTL && styles.rtlText]}>
              {localizeModuleMeta(step.module, uiLocale).objective}
            </Text>
            {moduleFlash ? (
              <View style={[styles.flash, isRTL && styles.flashRtl]}>
                <FontAwesome name="check-circle" size={14} color={homeShell.greenDark} />
                <Text style={[styles.flashTxt, isRTL && styles.rtlText]}>{moduleFlash}</Text>
              </View>
            ) : null}
          </View>
          {showSituationBrief ? (
            <OrientationDiagnosticBriefScreen kind="situation" uiLocale={uiLocale} rtl={isRTL} />
          ) : showVersusBrief ? (
            <OrientationDiagnosticBriefScreen kind="versus" uiLocale={uiLocale} rtl={isRTL} />
          ) : (
            <>
              <DiagnosticStepHeader
                icon={
                  step.module === 'functioning'
                    ? 'cogs'
                    : step.module === 'situations'
                      ? 'balance-scale'
                      : 'question-circle'
                }
                title={displayStep.title}
                subtitle={subtitle}
                rtl={isRTL}
                stepNumber={stepIndex + 1}
                stepTotal={totalSteps}
              />
              <OrientationDiagnosticStepContent
                step={step}
                answers={answers}
                setAnswers={setAnswers}
                uiLocale={uiLocale}
                rtl={isRTL}
                situationPhase={situationPhase}
                onCatalogLoadingChange={setCatalogLoading}
                accessToken={null}
              />
            </>
          )}
        </ScrollView>
      </OrientationDiagnosticWizardShell>

      <AppConfirmDialog
        visible={confirmKind === 'quit'}
        title={tOd(uiLocale, 'quitConfirmTitle')}
        message={tOd(uiLocale, 'quitConfirmBody')}
        cancelLabel={tOd(uiLocale, 'quitConfirmStay')}
        confirmLabel={tOd(uiLocale, 'quitConfirmLeave')}
        confirmDestructive
        isRTL={isRTL}
        onCancel={closeConfirm}
        onConfirm={confirmQuit}
      />
      <AppConfirmDialog
        visible={confirmKind === 'retake'}
        title={tOd(uiLocale, 'topResetTitle')}
        message={tOd(uiLocale, 'retakeTestConfirm')}
        cancelLabel={tOd(uiLocale, 'retakeTestCancel')}
        confirmLabel={tOd(uiLocale, 'retakeTestConfirmAction')}
        confirmDestructive
        isRTL={isRTL}
        onCancel={closeConfirm}
        onConfirm={confirmRetake}
      />
    </OrientationCatalogDetailProvider>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: brand.backgroundSoft },
  scroll: { paddingBottom: spacing.xl, gap: spacing.sm },
  moduleBanner: {
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    gap: 4,
  },
  moduleLabel: { fontSize: fontSize.md, fontWeight: '800', color: brand.primary },
  moduleObjective: { fontSize: fontSize.sm, color: brand.textMuted, lineHeight: 20 },
  flash: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingVertical: 4,
  },
  flashRtl: { flexDirection: 'row-reverse' },
  flashTxt: { fontSize: fontSize.xs, color: homeShell.greenDark, fontWeight: '600' },
  rtlText: { writingDirection: 'rtl', textAlign: 'right' },
});
