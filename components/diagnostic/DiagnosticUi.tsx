import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { getDiagnosticFormLabels } from '@/constants/schoolDiagnosticFormLabels';
import type { DiagnosticUiLocale } from '@/constants/schoolDiagnosticLocale';
import { homeShell } from '@/theme/homeShell';
import { labelContainsDigits, preserveLtrDigitsInRtlLabel } from '@/utils/bidiText';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

/** Barre système (heure, batterie) — fond bleu charte, icônes claires. */
export function DiagnosticStatusBar() {
  return (
    <StatusBar
      style="light"
      {...(Platform.OS === 'android' ? { backgroundColor: brand.primary } : {})}
    />
  );
}

/** Palette dédiée au wizard diagnostic (charte #333E8F + #2fce94). */
export const diagnosticTheme = {
  headerBg: brand.primary,
  headerText: brand.white,
  headerMuted: 'rgba(255,255,255,0.82)',
  trackBg: 'rgba(255,255,255,0.22)',
  trackFill: brand.white,
  dotIdle: 'rgba(255,255,255,0.14)',
  dotBorder: 'rgba(255,255,255,0.35)',
  dotDone: 'rgba(255,255,255,0.28)',
  accent: homeShell.green,
  accentSoft: homeShell.greenAlpha11,
  accentDark: homeShell.greenDark,
  surface: brand.white,
  surfaceSoft: brand.backgroundSoft,
  fieldBorder: homeShell.borderOnWhite,
  fieldBorderFocus: brand.primary,
  primarySoft: 'rgba(51, 62, 143, 0.08)',
} as const;

export function DiagnosticFormBlock({ children, rtl }: { children: ReactNode; rtl?: boolean }) {
  return <View style={[styles.formBlock, rtl && styles.formBlockRtl]}>{children}</View>;
}

export function DiagnosticFieldLabel({
  children,
  required,
  rtl,
}: {
  children: string;
  required?: boolean;
  rtl?: boolean;
}) {
  return (
    <Text style={[styles.label, rtl && styles.labelRtl]}>
      {children}
      {required ? <Text style={styles.required}> *</Text> : null}
    </Text>
  );
}

export function DiagnosticHint({ children, rtl }: { children: string; rtl?: boolean }) {
  return (
    <View style={[styles.hintBox, rtl && styles.hintBoxRtl]}>
      <FontAwesome name="info-circle" size={14} color={brand.primary} style={styles.hintIcon} />
      <Text style={[styles.hint, rtl && styles.rtlText]}>{children}</Text>
    </View>
  );
}

export function DiagnosticTextInput({
  value,
  onChangeText,
  placeholder,
  rtl,
  keyboardType,
  multiline,
  onFocus,
  onBlur,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  rtl?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  multiline?: boolean;
  onFocus?: TextInputProps['onFocus'];
  onBlur?: TextInputProps['onBlur'];
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="rgba(100,116,139,0.6)"
      keyboardType={keyboardType}
      multiline={multiline}
      onFocus={onFocus}
      onBlur={onBlur}
      textAlign={rtl ? 'right' : 'left'}
      textAlignVertical={multiline ? 'top' : 'center'}
      style={[
        styles.input,
        rtl && styles.inputRtl,
        multiline && styles.inputMultiline,
      ]}
    />
  );
}

export function DiagnosticChoiceRow({
  label,
  detail,
  selected,
  onPress,
  rtl,
  mode = 'radio',
  icon,
}: {
  label: string;
  /** Explication sous le libellé principal */
  detail?: string;
  selected: boolean;
  onPress: () => void;
  rtl?: boolean;
  mode?: 'radio' | 'checkbox';
  icon?: ComponentProps<typeof FontAwesome>['name'];
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={mode === 'checkbox' ? 'checkbox' : 'radio'}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.choiceRow,
        rtl && styles.choiceRowRtl,
        selected && styles.choiceRowSelected,
        pressed && styles.choiceRowPressed,
      ]}>
      <View
        style={[
          styles.choiceMark,
          mode === 'checkbox' && styles.choiceMarkSquare,
          selected && styles.choiceMarkOn,
        ]}>
        {selected ? <FontAwesome name="check" size={11} color={brand.white} /> : null}
      </View>
      {icon ? (
        <View style={[styles.choiceIconWrap, selected && styles.choiceIconWrapOn]}>
          <FontAwesome name={icon} size={14} color={selected ? brand.primary : brand.textMuted} />
        </View>
      ) : null}
      <View style={[styles.choiceTextCol, rtl && styles.choiceTextColRtl]}>
        <Text
          style={[styles.choiceLabel, rtl && styles.rtlText, selected && styles.choiceLabelSelected]}
          latinDigits={rtl && labelContainsDigits(label)}>
          {preserveLtrDigitsInRtlLabel(label, rtl)}
        </Text>
        {detail ? (
          <Text style={[styles.choiceDetail, rtl && styles.rtlText]} latinDigits={rtl && labelContainsDigits(detail)}>
            {preserveLtrDigitsInRtlLabel(detail, rtl)}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export function DiagnosticChipGrid({ children, rtl }: { children: ReactNode; rtl?: boolean }) {
  return <View style={[styles.chipGrid, rtl && styles.chipGridRtl]}>{children}</View>;
}

export function DiagnosticChip({
  label,
  selected,
  onPress,
  rtl: rtlProp,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  rtl?: boolean;
}) {
  const { isRTL: localeRtl } = useLocale();
  const rtl = rtlProp ?? localeRtl;
  const displayLabel = preserveLtrDigitsInRtlLabel(label, rtl);
  const latinDigits = rtl && labelContainsDigits(label);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        rtl && styles.chipRtl,
        selected && styles.chipSelected,
        pressed && { opacity: 0.88 },
      ]}>
      {selected ? (
        <FontAwesome
          name="check"
          size={10}
          color={diagnosticTheme.accentDark}
          style={[styles.chipCheck, rtl && styles.chipCheckRtl]}
        />
      ) : null}
      <Text
        style={[styles.chipText, rtl && styles.chipTextRtl, selected && styles.chipTextSelected]}
        latinDigits={latinDigits}
        numberOfLines={2}>
        {displayLabel}
      </Text>
    </Pressable>
  );
}

type DiagnosticFormLabels = ReturnType<typeof getDiagnosticFormLabels>;

function diagnosticUiLabels(rtl?: boolean, locale?: DiagnosticUiLocale): DiagnosticFormLabels {
  if (locale === 'ar') return getDiagnosticFormLabels('ar');
  if (locale === 'fr') return getDiagnosticFormLabels('fr');
  return getDiagnosticFormLabels(rtl ? 'ar' : 'fr');
}

export type DiagnosticYesNoPillsVariant = 'yesNo' | 'yesNoDepends' | 'yesNoUnsure';

/** Pills Oui / Non (+ option selon le variant). */
export function DiagnosticYesNoPills({
  label,
  value,
  onChange,
  rtl,
  locale,
  variant = 'yesNoDepends',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rtl?: boolean;
  locale?: DiagnosticUiLocale;
  variant?: DiagnosticYesNoPillsVariant;
}) {
  const L = diagnosticUiLabels(rtl, locale);
  const options =
    variant === 'yesNo'
      ? ([
          { id: 'yes', label: L.yes },
          { id: 'no', label: L.no },
        ] as const)
      : variant === 'yesNoUnsure'
        ? ([
            { id: 'yes', label: L.yes },
            { id: 'no', label: L.no },
            { id: 'unsure', label: L.unsureSimple },
          ] as const)
        : ([
            { id: 'yes', label: L.yes },
            { id: 'no', label: L.no },
            { id: 'depends', label: L.dependsSimple },
          ] as const);
  return (
    <View style={[styles.yesNoBlock, rtl && styles.yesNoBlockRtl]}>
      <DiagnosticFieldLabel rtl={rtl}>{label}</DiagnosticFieldLabel>
      <View style={[styles.yesNoRow, rtl && styles.yesNoRowRtl]}>
        {options.map((o) => {
          const on = value === o.id;
          return (
            <Pressable
              key={o.id}
              onPress={() => onChange(o.id)}
              style={[styles.yesNoPill, on && styles.yesNoPillOn]}>
              <Text style={[styles.yesNoPillTxt, rtl && styles.rtlText, on && styles.yesNoPillTxtOn]}>
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export type DiagnosticGradeAccent =
  | 'national'
  | 'regional'
  | 'semestre1'
  | 'missionNational'
  | 'missionPremiere'
  | 'missionSemestre1';

const gradeAccentStyles: Record<
  DiagnosticGradeAccent,
  { borderColor: string; backgroundColor: string; titleColor: string }
> = {
  national: {
    borderColor: 'rgba(51, 62, 143, 0.2)',
    backgroundColor: diagnosticTheme.primarySoft,
    titleColor: brand.primary,
  },
  regional: {
    borderColor: 'rgba(47, 206, 148, 0.4)',
    backgroundColor: homeShell.greenAlpha11,
    titleColor: homeShell.greenDark,
  },
  semestre1: {
    borderColor: 'rgba(14, 116, 144, 0.35)',
    backgroundColor: 'rgba(14, 116, 144, 0.09)',
    titleColor: '#0E7490',
  },
  missionNational: {
    borderColor: 'rgba(51, 62, 143, 0.2)',
    backgroundColor: diagnosticTheme.primarySoft,
    titleColor: brand.primary,
  },
  missionPremiere: {
    borderColor: 'rgba(124, 58, 237, 0.35)',
    backgroundColor: 'rgba(124, 58, 237, 0.09)',
    titleColor: '#6D28D9',
  },
  missionSemestre1: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    titleColor: '#B45309',
  },
};

export function DiagnosticGradeSectionCard({
  children,
  title,
  accent = 'national',
  rtl,
}: {
  children: ReactNode;
  title?: string;
  accent?: DiagnosticGradeAccent;
  rtl?: boolean;
}) {
  const a = gradeAccentStyles[accent];
  return (
    <View
      style={[
        styles.sectionCard,
        rtl && styles.sectionCardRtl,
        { borderColor: a.borderColor, backgroundColor: a.backgroundColor },
      ]}>
      {title ? (
        <Text style={[styles.sectionCardTitle, { color: a.titleColor }, rtl && styles.rtlText]}>
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

export function DiagnosticSectionCard({
  children,
  title,
  rtl,
}: {
  children: ReactNode;
  title?: string;
  rtl?: boolean;
}) {
  return (
    <DiagnosticGradeSectionCard title={title} rtl={rtl}>
      {children}
    </DiagnosticGradeSectionCard>
  );
}

/** Champ note sur 20 : saisie + suffixe « /20 » (aligné fourchettes prévisionnelles). */
export function DiagnosticNoteSur20Input({
  value,
  onChangeText,
  placeholder = 'ex. 14,5',
  rtl,
  accent,
  variant = 'boxed',
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  rtl?: boolean;
  accent?: DiagnosticGradeAccent;
  /** `boxed` : encadré coloré ; `inline` : dans une fourchette min/max */
  variant?: 'boxed' | 'inline';
}) {
  const a = accent ? gradeAccentStyles[accent] : null;
  const row = (
    <View style={[styles.noteRangeInputRow, rtl && styles.noteRangeInputRowForceLtr]}>
      <View style={styles.noteSur20InputFlex}>
        <DiagnosticTextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          rtl={false}
        />
      </View>
      <Text style={styles.noteRangeSuffix} latinDigits>
        /20
      </Text>
    </View>
  );
  if (variant === 'inline') {
    return row;
  }
  return (
    <View
      style={[
        styles.noteSur20Wrap,
        a ? { borderColor: a.borderColor, backgroundColor: a.backgroundColor } : null,
      ]}>
      {row}
    </View>
  );
}

export function DiagnosticNoteRangeInput({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  accent = 'national',
  rtl,
  locale,
  labels,
}: {
  minValue: string;
  maxValue: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
  accent?: DiagnosticGradeAccent;
  rtl?: boolean;
  locale?: DiagnosticUiLocale;
  labels?: DiagnosticFormLabels;
}) {
  const L = labels ?? diagnosticUiLabels(rtl, locale);
  const a = gradeAccentStyles[accent];
  return (
    <View style={[styles.noteRangeWrap, { borderColor: a.borderColor, backgroundColor: a.backgroundColor }]}>
      <Text style={[styles.noteRangeTitle, rtl && styles.rtlText]}>{L.noteRangeTitle}</Text>
      <View style={[styles.noteRangeRow, rtl && styles.noteRangeRowRtl]}>
        <View style={styles.noteRangeCol}>
          <Text style={[styles.noteRangeLabel, rtl && styles.noteRangeLabelRtl]}>{L.noteRangeMin}</Text>
          <DiagnosticNoteSur20Input
            value={minValue}
            onChangeText={onMinChange}
            placeholder="13"
            rtl={rtl}
            variant="inline"
          />
        </View>
        <Text style={styles.noteRangeSep}>{rtl ? '←' : '→'}</Text>
        <View style={styles.noteRangeCol}>
          <Text style={[styles.noteRangeLabel, rtl && styles.noteRangeLabelRtl]}>{L.noteRangeMax}</Text>
          <DiagnosticNoteSur20Input
            value={maxValue}
            onChangeText={onMaxChange}
            placeholder="16"
            rtl={rtl}
            variant="inline"
          />
        </View>
      </View>
      <Text style={[styles.noteRangeHint, rtl && styles.rtlText]}>{L.noteRangeOptional}</Text>
    </View>
  );
}

export function DiagnosticGradeAvailabilityBlock({
  sectionTitle,
  question,
  accent,
  received,
  onSelectYes,
  onSelectNo,
  definitiveLabel,
  definitiveValue,
  onDefinitiveChange,
  previsionnelMin,
  previsionnelMax,
  onPrevisionnelMinChange,
  onPrevisionnelMaxChange,
  rtl,
  locale,
  labels,
}: {
  sectionTitle: string;
  question: string;
  accent: DiagnosticGradeAccent;
  received: '' | 'yes' | 'no';
  onSelectYes: () => void;
  onSelectNo: () => void;
  definitiveLabel: string;
  definitiveValue: string;
  onDefinitiveChange: (v: string) => void;
  previsionnelMin: string;
  previsionnelMax: string;
  onPrevisionnelMinChange: (v: string) => void;
  onPrevisionnelMaxChange: (v: string) => void;
  rtl?: boolean;
  locale?: DiagnosticUiLocale;
  labels?: DiagnosticFormLabels;
}) {
  const L = labels ?? diagnosticUiLabels(rtl, locale);
  return (
    <DiagnosticGradeSectionCard title={sectionTitle} accent={accent} rtl={rtl}>
      <DiagnosticFieldLabel required rtl={rtl}>
        {question}
      </DiagnosticFieldLabel>
      <DiagnosticChoiceRow
        rtl={rtl}
        label={L.yesDefinitiveGrade}
        selected={received === 'yes'}
        onPress={onSelectYes}
      />
      <DiagnosticChoiceRow
        rtl={rtl}
        label={L.noPrevisionnelRange}
        selected={received === 'no'}
        onPress={onSelectNo}
      />
      {received === 'yes' ? (
        <>
          <DiagnosticFieldLabel required rtl={rtl}>
            {definitiveLabel}
          </DiagnosticFieldLabel>
          <DiagnosticNoteSur20Input
            value={definitiveValue}
            onChangeText={onDefinitiveChange}
            accent={accent}
            rtl={rtl}
          />
        </>
      ) : null}
      {received === 'no' ? (
        <DiagnosticNoteRangeInput
          minValue={previsionnelMin}
          maxValue={previsionnelMax}
          onMinChange={onPrevisionnelMinChange}
          onMaxChange={onPrevisionnelMaxChange}
          accent={accent}
          rtl={rtl}
          locale={locale}
          labels={L}
        />
      ) : null}
    </DiagnosticGradeSectionCard>
  );
}

export function DiagnosticErrorBanner({ message, rtl }: { message: string; rtl?: boolean }) {
  return (
    <View style={[styles.errorBanner, rtl && styles.errorBannerRtl]}>
      <FontAwesome name="exclamation-circle" size={16} color={brand.error} />
      <Text style={[styles.errorBannerTxt, rtl && styles.rtlText]}>{message}</Text>
    </View>
  );
}

export function DiagnosticStepHeader({
  icon,
  title,
  subtitle,
  rtl,
  stepNumber,
  stepTotal,
}: {
  icon: ComponentProps<typeof FontAwesome>['name'];
  title: string;
  subtitle: string;
  rtl?: boolean;
  stepNumber?: number;
  stepTotal?: number;
}) {
  return (
    <View style={[styles.stepHeader, rtl && styles.stepHeaderRtl]}>
      <View style={styles.stepHeaderIcon}>
        <FontAwesome name={icon} size={20} color={brand.primary} />
      </View>
      <View style={[styles.stepHeaderTexts, rtl && styles.stepHeaderTextsRtl]}>
        {stepNumber != null && stepTotal != null ? (
          <Text style={[styles.stepHeaderKicker, rtl && styles.rtlText]}>
            {rtl ? `المرحلة ${stepNumber} من ${stepTotal}` : `Étape ${stepNumber} sur ${stepTotal}`}
          </Text>
        ) : null}
        <Text style={[styles.stepHeaderTitle, rtl && styles.rtlText]}>{title}</Text>
        <Text style={[styles.stepHeaderSub, rtl && styles.rtlText]}>{subtitle}</Text>
      </View>
    </View>
  );
}

export function DiagnosticStepProgressBar({
  step,
  total,
  labels,
  rtl,
}: {
  step: number;
  total: number;
  labels: readonly string[];
  rtl?: boolean;
}) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming((step + 1) / total, {
      duration: 380,
      easing: Easing.out(Easing.cubic),
    });
  }, [step, total, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.round(progress.value * 100)}%`,
  }));

  return (
    <View style={styles.progressWrap}>
      <View style={[styles.progressTrack, rtl && styles.progressTrackRtl]}>
        <Animated.View style={[styles.progressFill, fillStyle]} />
      </View>
      <View style={[styles.progressSteps, rtl && styles.progressStepsRtl]}>
        {Array.from({ length: total }, (_, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <View key={i} style={styles.progressStepCol} accessibilityLabel={labels[i]}>
              <View
                style={[
                  styles.progressDot,
                  done && styles.progressDotDone,
                  active && styles.progressDotActive,
                ]}>
                {done ? (
                  <FontAwesome name="check" size={10} color={brand.primary} />
                ) : (
                  <Text style={[styles.progressDotNum, active && styles.progressDotNumActive]}>
                    {i + 1}
                  </Text>
                )}
              </View>
              {active ? (
                <Text style={[styles.progressStepLabel, rtl && styles.rtlText]} numberOfLines={1}>
                  {labels[i] ?? ''}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>
      <Text style={[styles.progressCaption, rtl && styles.rtlText]}>
        {rtl ? `المرحلة ${step + 1} من ${total}` : `Étape ${step + 1} sur ${total}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  formBlock: { gap: spacing.md, width: '100%' },
  formBlockRtl: { direction: 'rtl', alignItems: 'stretch' },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: brand.text,
    marginBottom: spacing.xs,
    alignSelf: 'stretch',
  },
  labelRtl: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  required: { color: diagnosticTheme.accentDark },
  hintBoxRtl: { direction: 'rtl' },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    alignSelf: 'stretch',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: diagnosticTheme.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(51, 62, 143, 0.12)',
    marginBottom: spacing.xs,
  },
  hintIcon: { marginTop: 1 },
  hint: {
    flex: 1,
    fontSize: fontSize.xs,
    color: brand.textSecondary,
    lineHeight: 19,
  },
  rtlText: { writingDirection: 'rtl', textAlign: 'right' },
  /** Montants / fourchettes : chiffres lisibles (4 000, pas 000 4) en interface RTL */
  ltrDigitsText: { writingDirection: 'ltr', textAlign: 'left' },
  input: {
    borderWidth: 1.5,
    borderColor: diagnosticTheme.fieldBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    fontSize: fontSize.sm,
    color: brand.text,
    backgroundColor: diagnosticTheme.surface,
  },
  inputRtl: { textAlign: 'right', writingDirection: 'rtl', alignSelf: 'stretch' },
  inputMultiline: { minHeight: 140, maxHeight: 220, textAlignVertical: 'top', paddingTop: spacing.md },
  choiceRowRtl: { direction: 'rtl' },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'stretch',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: diagnosticTheme.fieldBorder,
    backgroundColor: diagnosticTheme.surface,
    marginBottom: spacing.xs,
  },
  choiceRowSelected: {
    borderColor: brand.primary,
    backgroundColor: diagnosticTheme.primarySoft,
  },
  choiceRowPressed: { opacity: 0.92 },
  choiceMark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceMarkSquare: { borderRadius: 6 },
  choiceMarkOn: { backgroundColor: brand.primary, borderColor: brand.primary },
  choiceIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.backgroundSoft,
  },
  choiceIconWrapOn: { backgroundColor: 'rgba(51, 62, 143, 0.12)' },
  choiceTextCol: { flex: 1, minWidth: 0, gap: 4 },
  choiceTextColRtl: { alignItems: 'flex-end' },
  choiceLabel: { fontSize: fontSize.sm, fontWeight: '600', color: brand.text },
  choiceLabelSelected: { fontWeight: '800', color: brand.primary },
  choiceDetail: {
    fontSize: fontSize.xs,
    color: brand.textMuted,
    lineHeight: 17,
    fontWeight: '400',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignSelf: 'stretch',
  },
  chipGridRtl: { direction: 'rtl' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: diagnosticTheme.fieldBorder,
    backgroundColor: diagnosticTheme.surface,
    maxWidth: '100%',
  },
  chipSelected: {
    borderColor: diagnosticTheme.accent,
    backgroundColor: diagnosticTheme.accentSoft,
  },
  chipCheck: { marginRight: 6 },
  chipCheckRtl: { marginRight: 0, marginLeft: 6 },
  chipRtl: { direction: 'rtl' },
  chipText: { fontSize: fontSize.xs, color: brand.textMuted, fontWeight: '600', flexShrink: 1 },
  chipTextRtl: { writingDirection: 'rtl', textAlign: 'right' },
  chipTextSelected: { color: diagnosticTheme.accentDark, fontWeight: '800' },
  yesNoBlock: { marginTop: spacing.xs, alignSelf: 'stretch' },
  yesNoBlockRtl: { direction: 'rtl' },
  yesNoRow: { flexDirection: 'row', gap: spacing.sm },
  yesNoRowRtl: { direction: 'rtl' },
  yesNoPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: diagnosticTheme.fieldBorder,
    backgroundColor: diagnosticTheme.surface,
    alignItems: 'center',
  },
  yesNoPillOn: {
    borderColor: brand.primary,
    backgroundColor: diagnosticTheme.primarySoft,
  },
  yesNoPillTxt: { fontSize: fontSize.sm, fontWeight: '600', color: brand.textMuted },
  yesNoPillTxtOn: { color: brand.primary, fontWeight: '800' },
  sectionCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(51, 62, 143, 0.14)',
    backgroundColor: diagnosticTheme.primarySoft,
    padding: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.md,
    alignSelf: 'stretch',
  },
  sectionCardRtl: { direction: 'rtl', alignItems: 'stretch' },
  sectionCardTitle: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    alignSelf: 'stretch',
  },
  noteSur20Wrap: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: diagnosticTheme.fieldBorder,
    backgroundColor: diagnosticTheme.surface,
    padding: spacing.sm,
  },
  noteSur20InputFlex: { flex: 1, minWidth: 0 },
  noteRangeWrap: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  noteRangeTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: brand.text,
  },
  noteRangeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  noteRangeRowRtl: { direction: 'rtl' },
  /** Notes /20 : champ à gauche, suffixe à droite (même en RTL arabe). */
  noteRangeInputRowForceLtr: { direction: 'ltr' },
  noteRangeCol: { flex: 1, minWidth: 0, gap: spacing.xs },
  noteRangeLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  noteRangeLabelRtl: {
    textTransform: 'none',
    textAlign: 'right',
    writingDirection: 'rtl',
    letterSpacing: 0,
  },
  noteRangeInputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  noteRangeSuffix: { fontSize: fontSize.sm, fontWeight: '600', color: brand.textMuted },
  noteRangeSep: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: brand.textMuted,
    paddingBottom: 12,
  },
  noteRangeHint: { fontSize: fontSize.xs, color: brand.textMuted, lineHeight: 16 },
  errorBannerRtl: { direction: 'rtl' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    alignSelf: 'stretch',
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  errorBannerTxt: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#B91C1C',
    lineHeight: 20,
  },
  stepHeaderRtl: { direction: 'rtl' },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    alignSelf: 'stretch',
    backgroundColor: diagnosticTheme.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.07)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  stepHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: diagnosticTheme.primarySoft,
  },
  stepHeaderTexts: { flex: 1, minWidth: 0, alignItems: 'flex-start' },
  stepHeaderTextsRtl: { alignItems: 'flex-end' },
  stepHeaderKicker: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: homeShell.greenDark,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  stepHeaderTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: brand.text,
    letterSpacing: -0.3,
  },
  stepHeaderSub: {
    marginTop: 4,
    fontSize: fontSize.sm,
    color: brand.textMuted,
    lineHeight: 20,
  },
  progressWrap: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.22)',
  },
  progressTrack: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: diagnosticTheme.trackBg,
    overflow: 'hidden',
  },
  progressTrackRtl: { direction: 'rtl' },
  progressFill: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: diagnosticTheme.trackFill,
  },
  progressSteps: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  progressStepsRtl: { direction: 'rtl' },
  progressStepCol: { alignItems: 'center', flex: 1, minWidth: 0 },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: diagnosticTheme.dotIdle,
    borderWidth: 1.25,
    borderColor: diagnosticTheme.dotBorder,
  },
  progressDotDone: {
    backgroundColor: diagnosticTheme.dotDone,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  progressDotActive: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: brand.white,
    borderColor: brand.white,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  progressDotNum: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.75)',
  },
  progressDotNumActive: { color: brand.primary, fontSize: 12 },
  progressStepLabel: {
    marginTop: 4,
    fontSize: 9,
    fontWeight: '700',
    color: brand.white,
    textAlign: 'center',
    maxWidth: 52,
  },
  progressCaption: {
    marginTop: spacing.md,
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: diagnosticTheme.headerMuted,
    textAlign: 'center',
  },
});
