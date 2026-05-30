import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { SearchablePickSheet } from '@/components/schools/SearchablePickSheet';
import { SelectField } from '@/components/ui/SelectField';
import {
  getOrientation1BacFiliereLabel,
  isValidOrientation1BacFiliereId,
  orientation1BacFilierePickItems,
} from '@/constants/orientation1bacFilieres';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { homeShell } from '@/theme/homeShell';
import { brand, radius, spacing } from '@/theme/tokens';
import {
  analyzeOrientation1Bac,
  completeOrientation1Bac,
  getOrientation1BacProgress,
  saveOrientation1BacStep,
  startOrientation1BacTest,
  type Orientation1BacAnalyzeReport,
  type Orientation1BacStepName,
} from '@/services/orientation1bac';

const STEPS: Array<{ id: Orientation1BacStepName; titleFr: string; titleAr: string }> = [
  { id: 'schoolInfo', titleFr: 'Profil scolaire', titleAr: 'المعطيات الدراسية' },
  { id: 'grades', titleFr: 'Notes & niveau', titleAr: 'النقط والمستوى' },
  { id: 'subjectPrefs', titleFr: 'Préférences matières', titleAr: 'تفضيلات المواد' },
  { id: 'workStyle', titleFr: 'Style de travail', titleAr: 'أسلوب العمل' },
  { id: 'interests', titleFr: 'Centres d’intérêt', titleAr: 'الاهتمامات' },
  { id: 'postBacGoals', titleFr: 'Objectifs post‑bac', titleAr: 'أهداف ما بعد الباك' },
  { id: 'constraints', titleFr: 'Contraintes & faisabilité', titleAr: 'القيود والإمكانيات' },
];

type Draft = {
  schoolInfo: { current1bac: string };
  grades: Record<string, string>;
  subjectPrefs: { likedCsv: string; dislikedCsv: string };
  workStyle: { preferredCsv: string };
  interests: { flagsCsv: string };
  postBacGoals: { selectedCsv: string };
  constraints: { readyForCatchup: boolean; readyToChangeSchool: boolean; parentsSupport: boolean };
};

const DEFAULT_DRAFT: Draft = {
  schoolInfo: { current1bac: '' },
  grades: {
    math: '',
    physicsChem: '',
    svt: '',
    eco: '',
    accounting: '',
    fr: '',
    ar: '',
    en: '',
    historyGeo: '',
    philo: '',
    tech: '',
    geo: '',
  },
  subjectPrefs: { likedCsv: '', dislikedCsv: '' },
  workStyle: { preferredCsv: '' },
  interests: { flagsCsv: '' },
  postBacGoals: { selectedCsv: '' },
  constraints: { readyForCatchup: false, readyToChangeSchool: false, parentsSupport: false },
};

function csvToList(s: string): string[] {
  return s
    .split(',')
    .map((x) => x.trim())
    .filter((x) => x !== '');
}

export function Orientation1BacWizard() {
  const { isRTL, locale } = useLocale();
  const uiLang: 'fr' | 'ar' = locale === 'ar' ? 'ar' : 'fr';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT);
  const [filierePickerOpen, setFilierePickerOpen] = useState(false);

  const step = STEPS[stepIdx]!;
  const stepTitle = uiLang === 'ar' ? step.titleAr : step.titleFr;
  const progressLabel = `${stepIdx + 1} / ${STEPS.length}`;

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming((stepIdx + 1) / STEPS.length, { duration: 420, easing: Easing.out(Easing.cubic) });
  }, [stepIdx, progress]);
  const progressStyle = useAnimatedStyle(() => ({ width: `${Math.round(progress.value * 100)}%` }));

  const bootOnce = useRef(false);
  useEffect(() => {
    if (bootOnce.current) return;
    bootOnce.current = true;
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        await startOrientation1BacTest({ selectedLanguage: uiLang });
        const prog = await getOrientation1BacProgress();
        if (!alive) return;
        const current = prog.data?.currentStep ?? 'schoolInfo';
        const idx = Math.max(0, STEPS.findIndex((s) => s.id === current));
        setStepIdx(idx === -1 ? 0 : idx);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [uiLang]);

  const filiereItems = useMemo(() => orientation1BacFilierePickItems(uiLang), [uiLang]);

  const currentFiliereLabel = useMemo(
    () => getOrientation1BacFiliereLabel(draft.schoolInfo.current1bac, uiLang),
    [draft.schoolInfo.current1bac, uiLang],
  );

  const validateStep = useCallback((): string | null => {
    if (step.id === 'schoolInfo') {
      if (!isValidOrientation1BacFiliereId(draft.schoolInfo.current1bac)) {
        return uiLang === 'ar' ? 'اختر شعبة 1 باك الحالية' : 'Choisissez votre filière actuelle en 1ère bac.';
      }
    }
    return null;
  }, [draft.schoolInfo.current1bac, step.id, uiLang]);

  const buildStepData = useCallback((): Record<string, unknown> => {
    switch (step.id) {
      case 'schoolInfo':
        return {
          current1bac: draft.schoolInfo.current1bac.trim(),
          answers: {
            current1bac: { value: draft.schoolInfo.current1bac.trim() },
          },
        };
      case 'grades':
        return { ...draft.grades, answers: Object.fromEntries(Object.entries(draft.grades).map(([k, v]) => [k, { value: v }])) };
      case 'subjectPrefs':
        return {
          liked: csvToList(draft.subjectPrefs.likedCsv),
          disliked: csvToList(draft.subjectPrefs.dislikedCsv),
          answers: {
            liked: { value: draft.subjectPrefs.likedCsv },
            disliked: { value: draft.subjectPrefs.dislikedCsv },
          },
        };
      case 'workStyle':
        return {
          preferred: csvToList(draft.workStyle.preferredCsv),
          answers: { preferred: { value: draft.workStyle.preferredCsv } },
        };
      case 'interests':
        return {
          flags: csvToList(draft.interests.flagsCsv),
          answers: { flags: { value: draft.interests.flagsCsv } },
        };
      case 'postBacGoals':
        return {
          selected: csvToList(draft.postBacGoals.selectedCsv),
          answers: { selected: { value: draft.postBacGoals.selectedCsv } },
        };
      case 'constraints':
        return {
          ...draft.constraints,
          answers: {
            readyForCatchup: { value: draft.constraints.readyForCatchup },
            readyToChangeSchool: { value: draft.constraints.readyToChangeSchool },
            parentsSupport: { value: draft.constraints.parentsSupport },
          },
        };
      default:
        return { answers: {} };
    }
  }, [draft, step.id]);

  const saveCurrent = useCallback(async () => {
    const err = validateStep();
    if (err) {
      Alert.alert(uiLang === 'ar' ? 'تنبيه' : 'Attention', err);
      return false;
    }
    setSaving(true);
    try {
      await saveOrientation1BacStep({
        stepName: step.id,
        stepNumber: stepIdx + 1,
        stepData: buildStepData(),
        language: uiLang,
      });
      return true;
    } finally {
      setSaving(false);
    }
  }, [buildStepData, step.id, stepIdx, uiLang, validateStep]);

  const goNext = useCallback(async () => {
    const ok = await saveCurrent();
    if (!ok) return;

    if (stepIdx < STEPS.length - 1) {
      setStepIdx((s) => Math.min(STEPS.length - 1, s + 1));
      return;
    }

    // fin: analyze + complete + naviguer rapport
    setSaving(true);
    try {
      const res = await analyzeOrientation1Bac();
      const report = (res.data?.report ?? null) as Orientation1BacAnalyzeReport | null;
      if (report) {
        await completeOrientation1Bac({ report });
      }
      router.replace('/orientation-1bac/rapport' as never);
    } finally {
      setSaving(false);
    }
  }, [saveCurrent, stepIdx]);

  const goPrev = useCallback(() => {
    setStepIdx((s) => Math.max(0, s - 1));
  }, []);

  const toggleConstraint = (k: keyof Draft['constraints']) => {
    setDraft((d) => ({ ...d, constraints: { ...d.constraints, [k]: !d.constraints[k] } }));
  };

  const stepBody = useMemo(() => {
    if (step.id === 'schoolInfo') {
      return (
        <View style={styles.card}>
          <SelectField
            label={uiLang === 'ar' ? 'شعبة 1 باك الحالية' : 'Filière actuelle en 1ère bac'}
            hint={
              uiLang === 'ar'
                ? 'اختر الشعبة كما هي مسجّلة في مؤسستك.'
                : 'Sélectionnez la filière telle qu’inscrite dans votre établissement.'
            }
            value={currentFiliereLabel}
            rtl={isRTL}
            required
            hasError={false}
            onPress={() => setFilierePickerOpen(true)}
            style={styles.selectField}
          />
        </View>
      );
    }

    if (step.id === 'grades') {
      return (
        <View style={styles.card}>
          <Text style={styles.hint}>Entrez vos notes (0–20). Champs principaux: math, physicsChem, svt, eco, accounting, tech.</Text>
          {Object.entries(draft.grades).map(([k, v]) => (
            <View key={k} style={styles.row}>
              <Text style={styles.rowLabel}>{k}</Text>
              <TextInput
                value={v}
                onChangeText={(nv) => setDraft((d) => ({ ...d, grades: { ...d.grades, [k]: nv } }))}
                placeholder="0-20"
                keyboardType="numeric"
                style={[styles.input, styles.inputSmall]}
              />
            </View>
          ))}
        </View>
      );
    }

    if (step.id === 'subjectPrefs') {
      return (
        <View style={styles.card}>
          <Text style={styles.label}>Matières aimées (csv)</Text>
          <TextInput
            value={draft.subjectPrefs.likedCsv}
            onChangeText={(v) => setDraft((d) => ({ ...d, subjectPrefs: { ...d.subjectPrefs, likedCsv: v } }))}
            placeholder="math, physicsChem"
            style={styles.input}
          />
          <Text style={[styles.label, { marginTop: 12 }]}>Matières détestées (csv)</Text>
          <TextInput
            value={draft.subjectPrefs.dislikedCsv}
            onChangeText={(v) => setDraft((d) => ({ ...d, subjectPrefs: { ...d.subjectPrefs, dislikedCsv: v } }))}
            placeholder="historyGeo"
            style={styles.input}
          />
        </View>
      );
    }

    if (step.id === 'workStyle') {
      return (
        <View style={styles.card}>
          <Text style={styles.hint}>Ex: exercises, memorization, analysis, writing, technical_projects, problems, method, reading</Text>
          <Text style={styles.label}>Préférés (csv)</Text>
          <TextInput
            value={draft.workStyle.preferredCsv}
            onChangeText={(v) => setDraft((d) => ({ ...d, workStyle: { preferredCsv: v } }))}
            placeholder="exercises, problems"
            style={styles.input}
          />
        </View>
      );
    }

    if (step.id === 'interests') {
      return (
        <View style={styles.card}>
          <Text style={styles.hint}>Ex: health, engineering, business, law, languages, social, technology, environment, entrepreneurship, communication</Text>
          <Text style={styles.label}>Intérêts (csv)</Text>
          <TextInput
            value={draft.interests.flagsCsv}
            onChangeText={(v) => setDraft((d) => ({ ...d, interests: { flagsCsv: v } }))}
            placeholder="engineering, technology"
            style={styles.input}
          />
        </View>
      );
    }

    if (step.id === 'postBacGoals') {
      return (
        <View style={styles.card}>
          <Text style={styles.hint}>Ex: medicine, health, cpge, engineering, it_data, encg, fsjes, business, accounting, est_bts, technical, languages, communication, law, social_sciences, agronomy, environment</Text>
          <Text style={styles.label}>Objectifs (csv)</Text>
          <TextInput
            value={draft.postBacGoals.selectedCsv}
            onChangeText={(v) => setDraft((d) => ({ ...d, postBacGoals: { selectedCsv: v } }))}
            placeholder="cpge, engineering"
            style={styles.input}
          />
        </View>
      );
    }

    return (
      <View style={styles.card}>
        {(
          [
            ['readyForCatchup', uiLang === 'ar' ? 'مستعد لتعويض المواد' : 'Prêt pour un rattrapage'],
            ['readyToChangeSchool', uiLang === 'ar' ? 'مستعد لتغيير المؤسسة' : 'Prêt à changer de lycée'],
            ['parentsSupport', uiLang === 'ar' ? 'دعم الوالدين' : 'Soutien des parents'],
          ] as const
        ).map(([k, label]) => (
          <Pressable key={k} onPress={() => toggleConstraint(k)} style={styles.switchRow}>
            <View style={[styles.checkbox, draft.constraints[k] && styles.checkboxOn]} />
            <Text style={styles.switchLabel}>{label}</Text>
          </Pressable>
        ))}
      </View>
    );
  }, [currentFiliereLabel, draft, isRTL, step.id, toggleConstraint, uiLang]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.title}>Orientation 1ère bac</Text>
          <Text style={styles.hint}>Chargement…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Test d’orientation</Text>
        <Text style={styles.title}>1ère bac → 2ème bac</Text>
        <Text style={styles.sub}>{stepTitle} · {progressLabel}</Text>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {stepBody}
        <Text style={styles.disclaimer}>
          Les recommandations ne remplacent pas la décision officielle de votre établissement.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={goPrev}
          disabled={stepIdx === 0 || saving}
          style={[styles.btn, styles.btnGhost, (stepIdx === 0 || saving) && styles.btnDisabled]}>
          <Text style={styles.btnGhostText}>Retour</Text>
        </Pressable>
        <Pressable
          onPress={() => void goNext()}
          disabled={saving}
          style={[styles.btn, styles.btnPrimary, saving && styles.btnDisabled]}>
          <Text style={styles.btnPrimaryText}>{stepIdx === STEPS.length - 1 ? 'Terminer' : 'Continuer'}</Text>
        </Pressable>
      </View>

      <SearchablePickSheet
        visible={filierePickerOpen}
        title={uiLang === 'ar' ? 'شعبة 1 باك' : 'Filière en 1ère bac'}
        searchPlaceholder={uiLang === 'ar' ? 'بحث…' : 'Rechercher une filière…'}
        emptyLabel={uiLang === 'ar' ? 'لا توجد نتائج' : 'Aucun résultat'}
        allLabel={uiLang === 'ar' ? 'اختر شعبة…' : 'Sélectionner une filière…'}
        items={filiereItems}
        selectedValue={draft.schoolInfo.current1bac}
        onPick={(v) => {
          if (v && isValidOrientation1BacFiliereId(v)) {
            setDraft((d) => ({ ...d, schoolInfo: { current1bac: v } }));
          } else {
            setDraft((d) => ({ ...d, schoolInfo: { current1bac: '' } }));
          }
        }}
        onClose={() => setFilierePickerOpen(false)}
        rtl={isRTL}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: brand.white },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: homeShell.borderOnWhite,
    backgroundColor: brand.white,
  },
  eyebrow: { color: brand.textMuted, fontSize: 12, fontWeight: '700' },
  title: { marginTop: 6, fontSize: 20, fontWeight: '900', color: brand.text },
  sub: { marginTop: 4, fontSize: 12, color: brand.textMuted },
  progressTrack: {
    marginTop: 10,
    height: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(51, 62, 143, 0.12)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: homeShell.blue },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: homeShell.borderOnWhite,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  selectField: { marginBottom: 0 },
  label: { fontSize: 13, fontWeight: '800', color: brand.text },
  hint: { marginTop: 6, fontSize: 12, color: brand.textMuted, lineHeight: 16 },
  input: {
    marginTop: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: homeShell.borderOnWhite,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: brand.text,
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
  },
  inputSmall: { width: 110, marginTop: 0, paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 10 },
  rowLabel: { flex: 1, color: brand.text, fontSize: 13, fontWeight: '700' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(51, 62, 143, 0.22)',
    backgroundColor: 'transparent',
  },
  checkboxOn: { backgroundColor: homeShell.blue, borderColor: homeShell.blue },
  switchLabel: { fontSize: 14, fontWeight: '700', color: brand.text },
  disclaimer: { fontSize: 11, color: brand.textMuted, lineHeight: 16 },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: homeShell.borderOnWhite,
    backgroundColor: brand.white,
  },
  btn: { flex: 1, borderRadius: radius.xl, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  btnGhost: { backgroundColor: 'rgba(51, 62, 143, 0.08)' },
  btnGhostText: { fontWeight: '900', color: homeShell.blue },
  btnPrimary: { backgroundColor: homeShell.blue },
  btnPrimaryText: { fontWeight: '900', color: brand.white },
  btnDisabled: { opacity: 0.5 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
});

