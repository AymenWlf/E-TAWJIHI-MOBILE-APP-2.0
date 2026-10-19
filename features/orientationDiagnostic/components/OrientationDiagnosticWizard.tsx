import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Keyboard, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { DiagnosticStepHeader } from '@/components/diagnostic/DiagnosticUi';
import {
  DiagnosticFieldScrollProvider,
  scrollFocusedInputIntoView,
} from '@/components/diagnostic/diagnosticFieldScroll';
import { KeyboardAwareBottomSpacer } from '@/components/ui/KeyboardAwareBottomSpacer';
import { AppConfirmDialog } from '@/components/ui/AppConfirmDialog';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { postPlanReussiteStep } from '@/services/planReussiteSteps';
import {
  fetchOrientationDiagnosticServerReport,
  fetchOrientationDiagnosticSession,
  fetchOrientationTestDefinition,
  resetOrientationDiagnosticSession,
  saveOrientationDiagnosticStep,
} from '@/services/orientationDiagnosticSession';
import { getUserProfile } from '@/services/userProfile';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { DIR_RTL } from '@/utils/layoutDirection';
import {
  clearOrientationDiagnosticPrototypeDraft,
  completedModulesUpTo,
  ORIENTATION_MODULE_ORDER,
  persistOrientationDiagnosticPrototypeDraft,
  readOrientationDiagnosticPrototypeDraft,
  type OrientationDiagnosticPrototypeDraft,
} from '../constants/orientationDiagnosticPrototypeStorage';
import type { DiagnosticStep, ModuleId, OrientationReport } from '../types/orientationDiagnosticPrototype';
import {
  withAccountOrientationPrefill,
  type AccountOrientationPrefill,
} from '../data/orientationDiagnosticProfile';
import { buildOrientationCoreSteps } from '../data/orientationDiagnosticQuestions';
import { applyOrientationV2 } from '../utils/orientationDiagnosticEngineV2';
import { registerOrientationDefinitionSteps } from '../utils/orientationDiagnosticEngine';
import {
  lastContiguousModule,
  modulesFullyAnswered,
  publishedModuleOrder,
  publishedTestModules,
  publishedTestSteps,
} from '../utils/orientationPublishedDefinition';
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
import { prefetchUpcomingOrientationSteps } from '../utils/orientationDiagnosticCatalogCache';
import { submitOrientationAnswersAsSchoolRecommendations } from '@/utils/syncOrientationToSchoolRecommendations';
import { OrientationDiagnosticBriefScreen } from './OrientationDiagnosticBriefScreen';
import { OrientationDiagnosticStepContent } from './OrientationDiagnosticStepContent';
import { OrientationCatalogDetailProvider } from './OrientationCatalogDetailSheet';
import { OrientationDiagnosticWizardShell } from './OrientationDiagnosticWizardShell';
function orientationAnswersScore(answers: DiagnosticAnswers | null | undefined): number {
  const profile = answers?.profile;
  if (!profile) return answers?.cities?.length ?? 0;
  const filled = [
    profile.studyLevel,
    profile.bacType,
    profile.bacFiliere,
    profile.bacYear,
    profile.city,
    profile.cityId,
    profile.noteGenerale1ereBac,
    profile.noteControleContinu,
    profile.noteNational,
    profile.noteGeneralePremiere,
    profile.noteGeneraleTerminale,
    profile.noteGeneraleBac,
  ].filter((value) => String(value || '').trim()).length;
  return filled + (profile.bacSpecialites?.length ?? 0) + (answers?.cities?.length ?? 0);
}

function orientationProgressScore(answers: DiagnosticAnswers | null | undefined): number {
  if (!answers) return 0;
  const multi = Object.values(answers.multi || {}).reduce((sum, ids) => sum + (ids?.length ?? 0), 0);
  return (
    orientationAnswersScore(answers) +
    Object.keys(answers.single || {}).length +
    Object.keys(answers.likert || {}).length +
    Object.keys(answers.situations || {}).length +
    multi
  );
}

function stepIdAliases(stepId: string): string[] {
  if (stepId === 'prof_identity' || stepId === 'profile_identity') {
    return ['prof_identity', 'profile_identity'];
  }
  return [stepId];
}

/** Reprend l’étape enregistrée, sinon la première question encore sans réponse. */
function quizAnswerCount(answers: DiagnosticAnswers | null | undefined): number {
  if (!answers) return 0;
  const multi = Object.values(answers.multi || {}).reduce((sum, ids) => sum + (ids?.length ?? 0), 0);
  return (
    Object.keys(answers.single || {}).length +
    Object.keys(answers.likert || {}).length +
    Object.keys(answers.situations || {}).length +
    multi +
    (answers.cities?.length ?? 0)
  );
}

function findResumeStepIndex(
  steps: DiagnosticStep[],
  stepId: string | null | undefined,
  answers: DiagnosticAnswers,
): number {
  const pending = steps.findIndex((item) => !isStepAnswered(item.id, answers, item));
  const pendingIndex = pending >= 0 ? pending : Math.max(0, steps.length - 1);
  if (!stepId) return pendingIndex;
  const aliases = stepIdAliases(stepId);
  const exact = steps.findIndex((item) => aliases.includes(item.id));
  if (exact < 0) return pendingIndex;
  const saved = steps[exact];
  if (saved && isStepAnswered(saved.id, answers, saved) && pendingIndex > exact) return pendingIndex;
  return exact;
}

export function OrientationDiagnosticWizard() {
  const { isRTL, locale } = useLocale();
  const uiLocale = orientationUiLocaleFromApp(locale);
  const { user, getValidAccessToken } = useAuth();
  const userId = user?.id ?? null;
  const { fresh } = useLocalSearchParams<{ fresh?: string }>();
  const forceFreshRef = useRef(fresh === '1');
  if (fresh === '1') forceFreshRef.current = true;

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
  const [definitionSteps, setDefinitionSteps] = useState<DiagnosticStep[] | null>(null);
  const [definitionStatus, setDefinitionStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [definitionRetry, setDefinitionRetry] = useState(0);
  const [moduleOrder, setModuleOrder] = useState<ModuleId[]>(ORIENTATION_MODULE_ORDER);
  const modelVersionRef = useRef<'1.0' | '2.0'>('2.0');
  const userJumpedRef = useRef(false);
  const quizLiveRef = useRef(false);
  const [accountPrefill, setAccountPrefill] = useState<AccountOrientationPrefill | null>(null);
  const [profileFetchDone, setProfileFetchDone] = useState(false);
  const [profilePrefillReady, setProfilePrefillReady] = useState(false);
  const pendingAccountPersist = useRef<DiagnosticAnswers | null>(null);
  const resumedRef = useRef(false);
  const uiLocaleRef = useRef(uiLocale);
  uiLocaleRef.current = uiLocale;
  /** Étape affichée : empêche une liste serveur incomplète de renvoyer au début. */
  const heldStepIdRef = useRef<string | null>(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const persistProgress = useCallback(
    (patch: Partial<OrientationDiagnosticPrototypeDraft> & { answers: DiagnosticAnswers }) => {
      const savedAnswers = {
        ...patch.answers,
        modelVersion: patch.answers.modelVersion ?? modelVersionRef.current,
      };
      void (async () => {
        const existing = await readOrientationDiagnosticPrototypeDraft(userId);
        const wouldWipeQuiz =
          (patch.phase ?? 'quiz') !== 'report' &&
          existing?.phase === 'quiz' &&
          quizAnswerCount(existing.answers) > 0 &&
          quizAnswerCount(savedAnswers) === 0;
        if (wouldWipeQuiz) return;
        await persistOrientationDiagnosticPrototypeDraft({
          userId,
          phase: patch.phase ?? 'quiz',
          stepId: patch.stepId ?? heldStepIdRef.current ?? 'profile_identity',
          lastCompletedModule: patch.lastCompletedModule ?? lastCompletedModule,
          completedModules: patch.completedModules ?? completedModules,
          answers: savedAnswers,
          ui: {
            situationBriefDone: patch.ui?.situationBriefDone ?? situationBriefDone,
            versusBriefDone: patch.ui?.versusBriefDone ?? versusBriefDone,
            situationPhase: patch.ui?.situationPhase ?? situationPhase,
          },
          uiLocale,
          report: patch.report ?? null,
          reportParcoursSynced: patch.reportParcoursSynced,
        });
        const token = await getValidAccessToken();
        if (!token) return;
        await saveOrientationDiagnosticStep(token, {
          stepId: patch.stepId ?? heldStepIdRef.current ?? 'profile_identity',
          phase: patch.phase === 'report' ? 'report' : 'quiz',
          uiLocale: uiLocaleRef.current,
          answers: savedAnswers,
          clientUpdatedAt: new Date().toISOString(),
        });
      })().catch(() => undefined);
    },
    [
      userId,
      lastCompletedModule,
      completedModules,
      situationBriefDone,
      versusBriefDone,
      situationPhase,
      uiLocale,
      getValidAccessToken,
    ],
  );

  useEffect(() => {
    if (quizLiveRef.current && !forceFreshRef.current) return;
    let cancelled = false;
    void (async () => {
      if (forceFreshRef.current) {
        forceFreshRef.current = false;
        userJumpedRef.current = false;
        const freshAnswers = emptyAnswers();
        await clearOrientationDiagnosticPrototypeDraft(userId);
        const freshToken = await getValidAccessToken();
        if (freshToken) {
          await resetOrientationDiagnosticSession(freshToken).catch(() => undefined);
        }
        await clearOrientationDiagnosticPrototypeDraft(userId);
        if (cancelled) return;
        setAnswers(freshAnswers);
        setStepIndex(0);
        setRestoreStepId(null);
        setSituationPhase('most');
        setSituationBriefDone(false);
        setVersusBriefDone(false);
        setLastCompletedModule(null);
        setCompletedModules([]);
        resumedRef.current = false;
        const firstId = 'profile_identity';
        await persistOrientationDiagnosticPrototypeDraft({
          userId,
          phase: 'quiz',
          stepId: firstId,
          lastCompletedModule: null,
          completedModules: [],
          answers: freshAnswers,
          ui: { situationBriefDone: false, versusBriefDone: false, situationPhase: 'most' },
          uiLocale: uiLocaleRef.current,
          report: null,
        });
        if (!cancelled) setBooting(false);
        return;
      }
      const draft = await readOrientationDiagnosticPrototypeDraft(userId);
      const token = await getValidAccessToken();
      if (token) {
        try {
          const server = await fetchOrientationDiagnosticSession(token);
          const localScore = orientationProgressScore(draft?.answers);
          const serverScore = orientationProgressScore(server?.answers);
          const serverHasAnswers = serverScore > 0;
          const useServer = Boolean(server && serverHasAnswers && (serverScore > localScore || !draft?.answers));
          if (useServer && server && !cancelled) {
            if (server.modelVersion === '1.0' || server.modelVersion === '2.0') {
              modelVersionRef.current = server.modelVersion;
            }
            const restored = { ...emptyAnswers(), ...server.answers };
            setAnswers(restored);
            await persistOrientationDiagnosticPrototypeDraft({
              userId,
              phase: server.phase,
              stepId: server.stepId,
              lastCompletedModule: draft?.lastCompletedModule ?? null,
              completedModules: draft?.completedModules ?? [],
              answers: restored,
              ui: draft?.ui ?? { situationBriefDone: false, versusBriefDone: false, situationPhase: 'most' },
              uiLocale: uiLocaleRef.current,
              report: server.report,
            });
            if (server.phase === 'report' && server.report) {
              router.replace('/diagnostic-orientation/rapport' as never);
              return;
            }
            setRestoreStepId(server.stepId);
            resumedRef.current = true;
            setBooting(false);
            return;
          }
          if (draft && (draft.phase === 'quiz' || draft.phase === 'report') && draft.answers) {
            void saveOrientationDiagnosticStep(token, {
              stepId: draft.stepId,
              phase: draft.phase === 'report' ? 'report' : 'quiz',
              uiLocale: uiLocaleRef.current,
              answers: draft.answers,
              clientUpdatedAt: draft.savedAt || new Date().toISOString(),
            })
              .catch(() => undefined);
          }
        } catch {
          /* reprise locale */
        }
      }
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

      if (!cancelled) {
        const fresh = emptyAnswers();
        setAnswers(fresh);
        const firstId = 'profile_identity';
        void persistOrientationDiagnosticPrototypeDraft({
          userId,
          phase: 'quiz',
          stepId: firstId,
          lastCompletedModule: null,
          completedModules: [],
          answers: fresh,
          ui: { situationBriefDone: false, versusBriefDone: false, situationPhase: 'most' },
          uiLocale: uiLocaleRef.current,
        });
        setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, getValidAccessToken]);

  useEffect(() => {
    let alive = true;
    let keepReady = false;
    setDefinitionStatus((status) => {
      keepReady = status === 'ready';
      return status === 'ready' ? status : 'loading';
    });
    void (async () => {
      const token = await getValidAccessToken();
      if (!token) {
        if (alive) {
          registerOrientationDefinitionSteps(null);
          setDefinitionSteps(null);
          setDefinitionStatus('error');
        }
        return;
      }
      try {
        const definition = await fetchOrientationTestDefinition(token);
        if (!alive) return;
        const steps = definition ? publishedTestSteps(definition) : [];
        if (!steps.length) {
          if (!keepReady) {
            registerOrientationDefinitionSteps(null);
            setDefinitionSteps(null);
            setDefinitionStatus('error');
          }
          return;
        }
        registerOrientationDefinitionSteps(steps);
        setDefinitionSteps(steps);
        const order = publishedModuleOrder(publishedTestModules(definition!, steps));
        if (order.length) setModuleOrder(order);
        setDefinitionStatus('ready');
      } catch {
        if (!alive || keepReady) return;
        registerOrientationDefinitionSteps(null);
        setDefinitionSteps(null);
        setDefinitionStatus('error');
      }
    })();
    return () => {
      alive = false;
    };
  }, [getValidAccessToken, definitionRetry]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') setDefinitionRetry((count) => count + 1);
    });
    return () => sub.remove();
  }, []);

  const coreSteps = useMemo(
    () => (definitionSteps ? buildOrientationCoreSteps(answers, definitionSteps) : []),
    [definitionSteps, answers.multi.car_secteurs, answers.multi.sch_types, answers.labels],
  );
  const localQuizSteps = useMemo(
    () => [...coreSteps, ...versusPlanToSteps(answers.versusPlan ?? [])],
    [coreSteps, answers.versusPlan],
  );
  const quizSteps = useMemo(
    () => (definitionSteps?.length ? localQuizSteps : []),
    [definitionSteps, localQuizSteps],
  );
  const versusStart = quizSteps.findIndex((item) => item.kind === 'versus');
  const coreStepsCount = versusStart >= 0 ? versusStart : quizSteps.length;
  const answeredModuleIds = useMemo(
    () => modulesFullyAnswered(moduleOrder, quizSteps, answers),
    [moduleOrder, quizSteps, answers],
  );
  const totalSteps = Math.max(quizSteps.length, coreStepsCount);
  const step = quizSteps[stepIndex];
  if (restoreStepId) heldStepIdRef.current = restoreStepId;
  else if (step?.id) heldStepIdRef.current = step.id;

  useEffect(() => {
    let alive = true;
    void (async () => {
      const token = await getValidAccessToken();
      if (!alive) return;
      if (!token) {
        setAccountPrefill(null);
        setProfileFetchDone(true);
        return;
      }
      try {
        const profile = await getUserProfile(token);
        if (!alive) return;
        setAccountPrefill({
          firstName: profile?.prenom || user?.firstName,
          lastName: profile?.nom || user?.lastName,
          phone: profile?.telephone || user?.phone,
          studyLevel: profile?.niveau,
          bacType: profile?.bacType,
          filiere: profile?.filiere,
          city: profile?.ville?.titre,
          cityId: profile?.ville?.id != null ? String(profile.ville.id) : '',
        });
      } catch {
        if (!alive) return;
        setAccountPrefill({
          firstName: user?.firstName,
          lastName: user?.lastName,
          phone: user?.phone,
        });
      }
      if (alive) setProfileFetchDone(true);
    })();
    return () => {
      alive = false;
    };
  }, [user?.id, user?.phone, user?.firstName, user?.lastName, getValidAccessToken]);

  useEffect(() => {
    if (booting || !profileFetchDone) return;
    if (accountPrefill) {
      setAnswers((prev) => {
        const profile = withAccountOrientationPrefill(prev.profile, accountPrefill);
        if (profile === prev.profile) return prev;
        const next = { ...prev, profile };
        pendingAccountPersist.current = next;
        return next;
      });
    }
    setProfilePrefillReady(true);
  }, [booting, profileFetchDone, accountPrefill, answers.profile]);

  useEffect(() => {
    const next = pendingAccountPersist.current;
    if (!next || booting || restoreStepId) return;
    pendingAccountPersist.current = null;
    const latest = answersRef.current;
    persistProgress({
      phase: 'quiz',
      stepId: step?.id || heldStepIdRef.current || 'profile_identity',
      answers: { ...latest, profile: next.profile ?? latest.profile },
      lastCompletedModule,
    });
  }, [answers.profile, booting, step?.id, lastCompletedModule, persistProgress]);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const token = await getValidAccessToken();
      if (!alive) return;
      prefetchUpcomingOrientationSteps(
        quizSteps,
        stepIndex,
        answers.multi.car_secteurs ?? [],
        token,
      );
    })();
    return () => {
      alive = false;
    };
  }, [quizSteps, stepIndex, answers.multi.car_secteurs, getValidAccessToken]);
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
    if (userJumpedRef.current) return;
    if (definitionStatus !== 'ready') return;
    if (!restoreStepId || !quizSteps.length) return;
    setStepIndex(findResumeStepIndex(quizSteps, restoreStepId, answers));
    setRestoreStepId(null);
  }, [quizSteps, restoreStepId, definitionStatus, answers]);

  useEffect(() => {
    if (restoreStepId) return;
    if (stepIndex >= quizSteps.length && quizSteps.length > 0) {
      setStepIndex(quizSteps.length - 1);
    }
  }, [quizSteps.length, stepIndex, restoreStepId]);

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
        const stamped = {
          ...ans,
          modelVersion: ans.modelVersion ?? modelVersionRef.current,
        };
        let report = buildOrientationReport(stamped);
        if (stamped.modelVersion === '2.0') report = applyOrientationV2(report, stamped);
        const ecolesRecommandees = await buildSchoolRecommendations(ans);
        report = { ...report, ecolesRecommandees };
        const tokenForReport = await getValidAccessToken();
        if (tokenForReport) {
          try {
            await saveOrientationDiagnosticStep(tokenForReport, {
              stepId: 'report',
              phase: 'report',
              uiLocale: uiLocaleRef.current,
              answers: stamped,
              clientUpdatedAt: new Date().toISOString(),
            });
            const remote = await fetchOrientationDiagnosticServerReport(tokenForReport);
            if (remote) report = remote as OrientationReport;
          } catch {
            /* le rapport local reste utilisé si le serveur est injoignable */
          }
        }
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
        const doneModules = modulesFullyAnswered(moduleOrder, quizSteps, stamped);
        await persistOrientationDiagnosticPrototypeDraft({
          userId,
          phase: 'report',
          stepId: 'report',
          lastCompletedModule: lastContiguousModule(moduleOrder, doneModules),
          completedModules: doneModules,
          answers: stamped,
          ui: { situationBriefDone, versusBriefDone, situationPhase: 'most' },
          uiLocale: uiLocaleRef.current,
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
    [getValidAccessToken, moduleOrder, quizSteps, situationBriefDone, versusBriefDone, uiLocale, userId],
  );

  const enterVersusModule = useCallback(async () => {
    setVersusBuilding(true);
    try {
      const completedModule = step?.module ?? 'schools';
      if ((answers.versusPlan ?? []).length > 0 && answers.versusField) {
        setVersusBriefDone(false);
        setStepIndex(coreStepsCount);
        setVersusBuilding(false);
        return;
      }
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
      const doneMods = modulesFullyAnswered(moduleOrder, quizSteps, merged);
      const doneLast = lastContiguousModule(moduleOrder, doneMods);
      setLastCompletedModule(doneLast);
      setCompletedModules(doneMods);
      persistProgress({
        phase: 'quiz',
        stepId: versusFirstId,
        answers: merged,
        lastCompletedModule: doneLast,
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
    moduleOrder,
    persistProgress,
    quizSteps,
    situationBriefDone,
    step?.module,
    uiLocale,
  ]);

  const scrollRef = useRef<ScrollView>(null);
  const scrollContentRef = useRef<View>(null);
  const scrollFocusedField = useCallback(() => {
    scrollFocusedInputIntoView(scrollRef, scrollContentRef);
  }, []);

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
    userJumpedRef.current = true;
    setRestoreStepId(null);
    setSituationPhase('most');
    setStepIndex(nextIndex);
    const nextCompleted = modulesFullyAnswered(moduleOrder, quizSteps, answers);
    const nextLast = lastContiguousModule(moduleOrder, nextCompleted);
    if (crossedModule && nextCompleted.includes(step.module)) {
      setModuleFlash(tOd(uiLocale, 'moduleSaved'));
    }
    setLastCompletedModule(nextLast);
    setCompletedModules(nextCompleted);
    persistProgress({
      phase: 'quiz',
      stepId: nextStep?.id || step.id,
      answers,
      lastCompletedModule: nextLast,
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
    userJumpedRef.current = true;
    setRestoreStepId(null);
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

  const goToModule = (moduleId: ModuleId) => {
    if (versusBuilding || reportBuilding || catalogLoading || !step) return;
    const currentIndex = moduleOrder.indexOf(step.module);
    const firstGap = moduleOrder.findIndex((id) => !answeredModuleIds.includes(id));
    const openIndex = firstGap < 0 ? moduleOrder.length - 1 : Math.max(firstGap, currentIndex);
    const targetIndex = moduleOrder.indexOf(moduleId);
    const reopened = answeredModuleIds.includes(moduleId);
    if (targetIndex < 0 || (targetIndex > openIndex && !reopened)) return;
    const targetStepIndex = quizSteps.findIndex((item) => item.module === moduleId);
    if (targetStepIndex < 0 || targetStepIndex === stepIndex) return;
    userJumpedRef.current = true;
    setRestoreStepId(null);
    setSituationPhase('most');
    setStepIndex(targetStepIndex);
    persistProgress({
      phase: 'quiz',
      stepId: quizSteps[targetStepIndex].id,
      answers,
      lastCompletedModule,
      completedModules,
      ui: { situationBriefDone, versusBriefDone, situationPhase: 'most' },
    });
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
      const token = await getValidAccessToken();
      if (token) {
        await resetOrientationDiagnosticSession(token).catch(() => undefined);
      }
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
        'profile_identity';
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
  }, [getValidAccessToken, uiLocale, userId]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const sub = Keyboard.addListener(showEvent, () => {
      scrollFocusedInputIntoView(scrollRef, scrollContentRef);
    });
    return () => sub.remove();
  }, []);

  if (booting || definitionStatus === 'loading' || !profilePrefillReady) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={brand.primary} />
        <Text style={styles.bootLabel}>{tOd(uiLocale, 'btnLoading')}</Text>
      </View>
    );
  }

  if (definitionStatus !== 'ready' || !step || !displayStep) {
    return (
      <View style={styles.boot}>
        <Text style={styles.errorTitle}>{tOd(uiLocale, 'testLoadError')}</Text>
        <Pressable
          onPress={() => setDefinitionRetry((count) => count + 1)}
          style={styles.errorBtn}
          accessibilityRole="button">
          <Text style={styles.errorBtnTxt}>{tOd(uiLocale, 'testLoadRetry')}</Text>
        </Pressable>
        <Pressable
          onPress={() => router.replace('/(tabs)' as never)}
          style={styles.errorBtnGhost}
          accessibilityRole="button">
          <Text style={styles.errorBtnGhostTxt}>{tOd(uiLocale, 'testLoadHome')}</Text>
        </Pressable>
      </View>
    );
  }

  quizLiveRef.current = true;

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
        moduleOrder={moduleOrder}
        completedModules={answeredModuleIds}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        onBack={goPrev}
        onContinue={goNext}
        onQuit={quitTest}
        onRetake={retakeTest}
        onSelectModule={goToModule}
        continueDisabled={!canContinue}
        backDisabled={!canGoBack}
        busy={versusBuilding || reportBuilding || catalogLoading}>
        <DiagnosticFieldScrollProvider scroll={scrollFocusedField}>
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}>
          <View ref={scrollContentRef} collapsable={false} style={isRTL ? DIR_RTL : undefined}>
          <View style={styles.moduleBanner}>
            <Text style={[styles.moduleLabel, isRTL && styles.rtlText, isRTL && styles.moduleLabelRtl]}>{localizeModuleMeta(step.module, uiLocale).label}</Text>
            <Text style={[styles.moduleObjective, isRTL && styles.rtlText, isRTL && styles.moduleObjectiveRtl]}>
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
                compact
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
          <KeyboardAwareBottomSpacer minPaddingWhenKeyboardClosed={spacing.md} />
          </View>
        </ScrollView>
        </DiagnosticFieldScrollProvider>
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
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: brand.backgroundSoft, padding: spacing.lg, gap: spacing.md },
  bootLabel: { fontSize: fontSize.sm, fontWeight: '700', color: brand.textMuted, textAlign: 'center' },
  errorTitle: { fontSize: fontSize.md, fontWeight: '800', color: brand.primary, textAlign: 'center' },
  errorBtn: { backgroundColor: brand.primary, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 22 },
  errorBtnTxt: { color: brand.white, fontWeight: '800' },
  errorBtnGhost: { paddingVertical: 10, paddingHorizontal: 18 },
  errorBtnGhostTxt: { color: brand.primary, fontWeight: '800' },
  scrollView: { flex: 1 },
  scroll: { paddingTop: 8, paddingBottom: spacing.sm, gap: 6 },
  moduleBanner: {
    marginBottom: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    gap: 2,
  },
  moduleLabel: { fontSize: fontSize.sm, fontWeight: '800', color: brand.primary, lineHeight: 18 },
  moduleLabelRtl: { lineHeight: 22 },
  moduleObjective: { fontSize: fontSize.xs, color: brand.textMuted, lineHeight: 16 },
  moduleObjectiveRtl: { lineHeight: 20 },
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
