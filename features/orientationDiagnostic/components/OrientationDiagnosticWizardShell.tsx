import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  DiagnosticStatusBar,
  diagnosticTheme,
} from '@/components/diagnostic/DiagnosticUi';
import { HeroLangSwitch } from '@/components/ui/HeroLangSwitch';
import { Text } from '@/components/ui/Text';
import { ORIENTATION_MODULE_ORDER } from '../constants/orientationDiagnosticPrototypeStorage';
import type { ModuleId } from '../types/orientationDiagnosticPrototype';
import {
  localizeModuleMeta,
  pickLocaleText,
  tOd,
  type OrientationUiLocale,
} from '../data/orientationDiagnosticI18n';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

import { OrientationPickSheetHost } from './orientationPickSheetHost';

export function OrientationDiagnosticWizardShell({
  uiLocale,
  rtl,
  currentModule,
  completedModules,
  stepIndex,
  totalSteps,
  onBack,
  onContinue,
  onQuit,
  onRetake,
  onSelectModule,
  continueDisabled,
  backDisabled,
  continueLabel,
  backLabel,
  busy,
  children,
}: {
  uiLocale: OrientationUiLocale;
  rtl?: boolean;
  currentModule: ModuleId;
  completedModules: ModuleId[];
  stepIndex: number;
  totalSteps: number;
  onBack: () => void;
  onContinue: () => void;
  onQuit: () => void;
  onRetake?: () => void;
  onSelectModule?: (moduleId: ModuleId) => void;
  continueDisabled?: boolean;
  backDisabled?: boolean;
  continueLabel?: string;
  backLabel?: string;
  busy?: boolean;
  children: ReactNode;
}) {
  const doneSet = new Set(completedModules);
  const progressPct = totalSteps > 0 ? ((stepIndex + 1) / totalSteps) * 100 : 0;
  const insets = useSafeAreaInsets();
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  /** Hauteur de la barre système Android (retour, accueil, applications). */
  const androidNavInset = Platform.OS === 'android' && !keyboardOpen ? insets.bottom : 0;

  return (
    <View style={styles.safe}>
      <OrientationPickSheetHost>
      <SafeAreaView style={styles.headerSafe} edges={['top', 'left', 'right']}>
      <DiagnosticStatusBar />
      <View style={[styles.header, rtl && styles.headerRtl]}>
        <Pressable
          onPress={onQuit}
          accessibilityRole="button"
          accessibilityLabel={tOd(uiLocale, 'topQuit')}
          style={({ pressed }) => [styles.quitBtn, rtl && styles.btnRtl, pressed && { opacity: 0.85 }]}>
          <FontAwesome name="times" size={14} color={brand.white} />
          <Text style={styles.quitTxt}>{tOd(uiLocale, 'topQuit')}</Text>
        </Pressable>
        <Text style={[styles.headerTitle, rtl && styles.rtlText]} numberOfLines={1}>
          {pickLocaleText(uiLocale, 'Diagnostic d’orientation', 'اختبار التوجيه')}
        </Text>
        {onRetake ? (
          <Pressable
            onPress={onRetake}
            accessibilityRole="button"
            accessibilityLabel={tOd(uiLocale, 'topResetTitle')}
            style={({ pressed }) => [styles.resetBtn, rtl && styles.btnRtl, pressed && { opacity: 0.85 }]}>
            <FontAwesome name="refresh" size={13} color={brand.white} />
            <Text style={styles.resetTxt}>{tOd(uiLocale, 'topReset')}</Text>
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <View style={styles.langRow}>
        <HeroLangSwitch />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.moduleScroller}
        contentContainerStyle={[styles.moduleTrack, rtl && styles.moduleTrackRtl]}>
        {ORIENTATION_MODULE_ORDER.map((mod, index) => {
          const done = doneSet.has(mod);
          const active = mod === currentModule;
          const currentIndex = ORIENTATION_MODULE_ORDER.indexOf(currentModule);
          const completedReached = Math.max(
            -1,
            ...ORIENTATION_MODULE_ORDER.map((id, idIndex) => (doneSet.has(id) ? idIndex : -1)),
          );
          const reachedIndex = Math.max(currentIndex, completedReached);
          const canOpen = Boolean(onSelectModule) && index <= reachedIndex;
          const meta = localizeModuleMeta(mod, uiLocale);
          return (
            <Pressable
              key={mod}
              disabled={!canOpen}
              onPress={() => onSelectModule?.(mod)}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canOpen, selected: active }}
              accessibilityLabel={meta.label}
              style={({ pressed }) => [
                styles.moduleStep,
                pressed && canOpen && { opacity: 0.75 },
              ]}>
              <View
                style={[
                  styles.moduleDot,
                  done && styles.moduleDotDone,
                  active && styles.moduleDotActive,
                ]}>
                <Text
                  style={[
                    styles.moduleDotTxt,
                    (done || active) && styles.moduleDotTxtOn,
                    active && styles.moduleDotTxtActive,
                  ]}>
                  {done && !active ? '✓' : String(index + 1)}
                </Text>
              </View>
              <Text
                style={[
                  styles.moduleName,
                  rtl && styles.rtlText,
                  (done || active) && styles.moduleNameOn,
                  active && styles.moduleNameActive,
                ]}
                numberOfLines={1}>
                {meta.short}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(100, progressPct)}%` }]} />
      </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={styles.avoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.body}>{children}</View>

      <View style={[styles.footer, rtl && styles.footerRtl, { paddingBottom: spacing.lg + androidNavInset }]}>
        <Pressable
          onPress={onBack}
          disabled={backDisabled || busy}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.backBtn,
            rtl && styles.btnRtl,
            (backDisabled || busy) && styles.backBtnDisabled,
            pressed && !backDisabled && !busy && { opacity: 0.9 },
          ]}>
          <FontAwesome
            name={rtl ? 'chevron-right' : 'chevron-left'}
            size={14}
            color={brand.primary}
          />
          <Text style={styles.backTxt}>{backLabel ?? tOd(uiLocale, 'btnBack')}</Text>
        </Pressable>
        <Pressable
          onPress={onContinue}
          disabled={continueDisabled || busy}
          style={({ pressed }) => [
            styles.continueBtn,
            (continueDisabled || busy) && styles.continueBtnDisabled,
            pressed && !continueDisabled && !busy && { opacity: 0.92 },
          ]}>
          {busy ? (
            <ActivityIndicator color={brand.white} />
          ) : (
            <>
              <Text style={styles.continueTxt}>
                {continueLabel ?? tOd(uiLocale, 'btnContinue')}
              </Text>
              <FontAwesome
                name={rtl ? 'chevron-left' : 'chevron-right'}
                size={14}
                color={brand.white}
              />
            </>
          )}
        </Pressable>
      </View>
      </KeyboardAvoidingView>
      </OrientationPickSheetHost>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: brand.backgroundSoft },
  headerSafe: { backgroundColor: brand.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: brand.primary,
    gap: spacing.sm,
  },
  headerRtl: { flexDirection: 'row-reverse' },
  btnRtl: { flexDirection: 'row-reverse' },
  quitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    minWidth: 88,
  },
  quitTxt: { color: brand.white, fontSize: fontSize.sm, fontWeight: '700' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: brand.white,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  headerSpacer: { minWidth: 88 },
  langRow: {
    alignItems: 'center',
    backgroundColor: brand.primary,
    paddingBottom: 2,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.16)',
    minWidth: 88,
    justifyContent: 'center',
  },
  resetTxt: { color: brand.white, fontSize: fontSize.sm, fontWeight: '700' },
  moduleScroller: { backgroundColor: brand.primary, flexGrow: 0 },
  moduleTrack: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 2,
    paddingTop: 2,
    paddingBottom: 8,
    paddingHorizontal: spacing.sm,
  },
  moduleTrackRtl: { flexDirection: 'row-reverse' },
  moduleStep: {
    width: 68,
    alignItems: 'center',
    gap: 3,
  },
  moduleDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleDotTxt: { color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '800' },
  moduleDotTxtOn: { color: brand.white },
  moduleName: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  moduleNameOn: { color: brand.white },
  moduleDotDone: { backgroundColor: 'rgba(47,206,148,0.35)', borderColor: homeShell.green },
  moduleDotActive: {
    backgroundColor: brand.white,
    borderColor: brand.white,
    borderWidth: 2,
  },
  moduleDotTxtActive: { color: brand.primary },
  moduleNameActive: { color: brand.white, fontWeight: '800' },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: spacing.md,
    marginBottom: 6,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: brand.white },
  avoid: { flex: 1 },
  body: { flex: 1, paddingHorizontal: spacing.md },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: brand.white,
    borderTopWidth: 1,
    borderTopColor: homeShell.borderOnWhite,
  },
  footerRtl: { flexDirection: 'row-reverse' },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 108,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: diagnosticTheme.fieldBorder,
    backgroundColor: brand.white,
  },
  backBtnDisabled: { opacity: 0.4 },
  backTxt: { color: brand.primary, fontSize: fontSize.md, fontWeight: '800' },
  continueBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: homeShell.green,
    borderRadius: radius.lg,
    paddingVertical: 14,
    minHeight: 52,
  },
  continueBtnDisabled: { opacity: 0.45 },
  continueTxt: { color: brand.white, fontSize: fontSize.md, fontWeight: '800' },
  rtlText: { writingDirection: 'rtl', textAlign: 'right' },
});
