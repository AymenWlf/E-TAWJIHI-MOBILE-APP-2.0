import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const MODULE_ICONS: Record<ModuleId, ComponentProps<typeof FontAwesome>['name']> = {
  profile: 'user',
  context: 'compass',
  riasec: 'heart',
  situations: 'users',
  functioning: 'cogs',
  ambitions: 'rocket',
  reality: 'map-marker',
  careers: 'briefcase',
  schools: 'university',
  versus: 'random',
};

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
  continueDisabled?: boolean;
  backDisabled?: boolean;
  continueLabel?: string;
  backLabel?: string;
  busy?: boolean;
  children: ReactNode;
}) {
  const doneSet = new Set(completedModules);
  const progressPct = totalSteps > 0 ? ((stepIndex + 1) / totalSteps) * 100 : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
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

      <View style={styles.moduleTrack}>
        {ORIENTATION_MODULE_ORDER.map((mod) => {
          const done = doneSet.has(mod);
          const active = mod === currentModule;
          const meta = localizeModuleMeta(mod, uiLocale);
          return (
            <View
              key={mod}
              style={[
                styles.moduleDot,
                done && styles.moduleDotDone,
                active && styles.moduleDotActive,
              ]}
              accessibilityLabel={meta.label}>
              <FontAwesome
                name={MODULE_ICONS[mod]}
                size={11}
                color={active || done ? brand.white : 'rgba(255,255,255,0.55)'}
              />
            </View>
          );
        })}
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(100, progressPct)}%` }]} />
      </View>

      <View style={styles.body}>{children}</View>

      <View style={[styles.footer, rtl && styles.footerRtl]}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: brand.backgroundSoft },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: brand.primary,
    gap: spacing.sm,
  },
  headerRtl: { flexDirection: 'row-reverse' },
  btnRtl: { flexDirection: 'row-reverse' },
  quitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
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
    paddingBottom: spacing.sm,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.16)',
    minWidth: 88,
    justifyContent: 'center',
  },
  resetTxt: { color: brand.white, fontSize: fontSize.sm, fontWeight: '700' },
  moduleTrack: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: brand.primary,
  },
  moduleDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleDotDone: { backgroundColor: 'rgba(47,206,148,0.35)', borderColor: homeShell.green },
  moduleDotActive: { backgroundColor: homeShell.green, borderColor: homeShell.green },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: brand.white },
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
