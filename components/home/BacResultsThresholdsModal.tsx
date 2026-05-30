import { useEffect, useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { AppTextInput } from '@/components/ui/AppTextInput';
import { Text } from '@/components/ui/Text';
import { PlatformSheetOverlay } from '@/components/ui/PlatformSheetOverlay';
import { useLocale } from '@/contexts/LocaleContext';
import { fetchBacUserGrades, saveBacUserGrades, type BacUserGradesDto } from '@/services/bacUserGrades';
import { notifySchoolDiagnosticRecommendationsRefresh } from '@/utils/schoolDiagnosticRecommendationsNotify';
import { CAIRO } from '@/theme/arabicTypography';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { formatGradeDisplay, normalizeGradeInput, toNullableNumber } from '@/utils/bacGrades';

const SHEET_MS = 300;
const SHEET_HEIGHT_RATIO = 0.82;

type Props = {
  visible: boolean;
  onClose: () => void;
};

type GradeFieldKey = 'regional' | 'national' | 'continuous' | 'overall';

const FIELD_META: Record<
  GradeFieldKey,
  { icon: ComponentProps<typeof FontAwesome>['name']; labelKey: 'bacThresholdsRegional' | 'bacThresholdsNational' | 'bacThresholdsContinuous' | 'bacThresholdsOverall' }
> = {
  regional: { icon: 'map-marker', labelKey: 'bacThresholdsRegional' },
  national: { icon: 'flag', labelKey: 'bacThresholdsNational' },
  continuous: { icon: 'tasks', labelKey: 'bacThresholdsContinuous' },
  overall: { icon: 'star', labelKey: 'bacThresholdsOverall' },
};

function dtoToFields(dto: BacUserGradesDto) {
  return {
    regional: dto.regional ?? '',
    national: dto.national ?? '',
    continuous: dto.continuous ?? '',
    overall: dto.overall ?? '',
  };
}

export function BacResultsThresholdsModal({ visible, onClose }: Props) {
  const { t, isRTL } = useLocale();
  const insets = useSafeAreaInsets();
  const { height: windowH } = useWindowDimensions();
  const sheetHeight = Math.round(windowH * SHEET_HEIGHT_RATIO);
  const slideOffset = sheetHeight + 48;

  const titleFont = isRTL ? CAIRO.extrabold : undefined;
  const bodyFont = isRTL ? CAIRO.semibold : undefined;
  const boldFont = isRTL ? CAIRO.bold : undefined;

  const [mounted, setMounted] = useState(visible);
  const [regional, setRegional] = useState('');
  const [national, setNational] = useState('');
  const [continuous, setContinuous] = useState('');
  const [overall, setOverall] = useState('');
  const [saved, setSaved] = useState<BacUserGradesDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const backdropOpacity = useSharedValue(0);
  const sheetY = useSharedValue(slideOffset);

  useEffect(() => {
    sheetY.value = slideOffset;
  }, [slideOffset, sheetY]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    void (async () => {
      const dto = await fetchBacUserGrades();
      if (cancelled || !dto) return;
      const fields = dtoToFields(dto);
      setRegional(fields.regional);
      setNational(fields.national);
      setContinuous(fields.continuous);
      setOverall(fields.overall);
      setSaved(dto);
    })();
    return () => {
      cancelled = true;
    };
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setSaveError(null);
      setSavedFlash(false);
      sheetY.value = slideOffset;
      backdropOpacity.value = withTiming(1, { duration: SHEET_MS, easing: Easing.out(Easing.cubic) });
      sheetY.value = withTiming(0, { duration: SHEET_MS, easing: Easing.out(Easing.cubic) });
      return;
    }
    backdropOpacity.value = withTiming(0, { duration: 220 });
    sheetY.value = withTiming(slideOffset, { duration: 260, easing: Easing.in(Easing.cubic) }, (finished) => {
      if (finished) runOnJS(setMounted)(false);
    });
  }, [visible, backdropOpacity, sheetY, slideOffset]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sheetY.value }] }));

  if (!mounted) return null;

  const setters: Record<GradeFieldKey, (v: string) => void> = {
    regional: setRegional,
    national: setNational,
    continuous: setContinuous,
    overall: setOverall,
  };

  const values: Record<GradeFieldKey, string> = {
    regional,
    national,
    continuous,
    overall,
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaving(true);
    try {
      const res = await saveBacUserGrades({
        regional: toNullableNumber(regional),
        national: toNullableNumber(national),
        continuous: toNullableNumber(continuous),
        overall: toNullableNumber(overall),
      });
      setSaved(res);
      const fields = dtoToFields(res);
      setRegional(fields.regional);
      setNational(fields.national);
      setContinuous(fields.continuous);
      setOverall(fields.overall);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2200);
      notifySchoolDiagnosticRecommendationsRefresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erreur lors de la sauvegarde.';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const hasResults = saved && (saved.calc75_25 || saved.calc50_50);

  return (
    <PlatformSheetOverlay visible={visible} keepMounted={mounted && !visible} onRequestClose={onClose}>
      <View style={styles.root} pointerEvents="box-none">
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t('bacModalClose')}
          />
        </Animated.View>

        <Animated.View style={[styles.sheet, { height: sheetHeight }, sheetStyle]}>
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          <View style={styles.heroHeader}>
            <View style={[styles.heroStripe, isRTL && styles.heroStripeRtl]} />
            <View style={[styles.heroTopRow, isRTL && styles.rowRtl]}>
              <View style={styles.heroIconWrap}>
                <FontAwesome name="graduation-cap" size={20} color={homeShell.text} />
              </View>
              <View style={styles.heroText}>
                <Text style={[styles.heroEyebrow, bodyFont && { fontFamily: bodyFont }, isRTL && styles.rtlText]}>
                  {t('bacThresholdsEyebrow')}
                </Text>
                <Text style={[styles.heroTitle, titleFont && { fontFamily: titleFont }, isRTL && styles.rtlText]}>
                  {t('bacThresholdsTitle')}
                </Text>
                <Text style={[styles.heroSubtitle, bodyFont && { fontFamily: bodyFont }, isRTL && styles.rtlText]} numberOfLines={3}>
                  {t('bacThresholdsSubtitle')}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t('bacModalClose')}
                style={({ pressed }) => [styles.heroCloseBtn, pressed && styles.pressed]}>
                <FontAwesome name="times" size={16} color={homeShell.textMuted} />
              </Pressable>
            </View>
            <View style={[styles.heroAccentBar, isRTL && styles.heroAccentBarRtl]} />
          </View>

          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={insets.top + 20}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces>
              <View style={[styles.tipCard, isRTL && styles.rowRtl]}>
                <View style={styles.tipIconWrap}>
                  <FontAwesome name="info-circle" size={14} color={brand.primary} />
                </View>
                <Text style={[styles.tipText, bodyFont && { fontFamily: bodyFont }, isRTL && styles.rtlText]}>
                  {t('bacThresholdsTip')}
                </Text>
              </View>

              <View style={styles.sectionHead}>
                <Text style={[styles.sectionTitle, boldFont && { fontFamily: boldFont }, isRTL && styles.rtlText]}>
                  {t('bacThresholdsSectionNotes')}
                </Text>
                <Text style={[styles.sectionHint, bodyFont && { fontFamily: bodyFont }, isRTL && styles.rtlText]}>
                  {t('bacThresholdsSectionHint')}
                </Text>
              </View>

              <View style={styles.fieldsGrid}>
                {(Object.keys(FIELD_META) as GradeFieldKey[]).map((key) => (
                  <GradeCell
                    key={key}
                    icon={FIELD_META[key].icon}
                    label={t(FIELD_META[key].labelKey)}
                    value={values[key]}
                    onChange={setters[key]}
                    placeholder={t('bacThresholdsPlaceholder')}
                    outOf20={t('bacThresholdsOutOf20')}
                    isRTL={isRTL}
                    bodyFont={bodyFont}
                  />
                ))}
              </View>

              {saveError ? (
                <View style={[styles.errorBanner, isRTL && styles.rowRtl]}>
                  <FontAwesome name="exclamation-circle" size={14} color={brand.error} />
                  <Text style={[styles.errorTxt, bodyFont && { fontFamily: bodyFont }, isRTL && styles.rtlText]} numberOfLines={4}>
                    {saveError}
                  </Text>
                </View>
              ) : null}

              {hasResults ? (
                <View style={styles.resultsBlock}>
                  <Text style={[styles.resultsSectionTitle, boldFont && { fontFamily: boldFont }, isRTL && styles.rtlText]}>
                    {t('bacThresholdsResultsTitle')}
                  </Text>

                  <View style={styles.heroScoreCard}>
                    <View style={[styles.heroScoreTop, isRTL && styles.rowRtl]}>
                      <View style={styles.majorBadge}>
                        <FontAwesome name="check" size={9} color={homeShell.greenDark} />
                        <Text style={[styles.majorBadgeTxt, boldFont && { fontFamily: boldFont }]}>
                          {t('bacThresholdsFormulaMajorBadge')}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.heroScoreValue, titleFont && { fontFamily: titleFont }]}>
                      {formatGradeDisplay(saved!.calc75_25)}
                    </Text>
                    <Text style={[styles.heroScoreLabel, bodyFont && { fontFamily: bodyFont }, isRTL && styles.rtlText]} numberOfLines={2}>
                      {t('bacThresholdsFormula7525')}
                    </Text>
                  </View>

                  <View style={[styles.altScoreCard, isRTL && styles.rowRtl]}>
                    <View style={styles.altScoreLeft}>
                      <FontAwesome name="balance-scale" size={14} color={brand.primary} />
                      <Text style={[styles.altScoreLabel, bodyFont && { fontFamily: bodyFont }, isRTL && styles.rtlText]} numberOfLines={2}>
                        {t('bacThresholdsFormula5050')}
                      </Text>
                    </View>
                    <Text style={[styles.altScoreValue, boldFont && { fontFamily: boldFont }]}>
                      {formatGradeDisplay(saved!.calc50_50)}
                    </Text>
                  </View>

                  {saved!.overall ? (
                    <View style={[styles.overallCard, isRTL && styles.rowRtl]}>
                      <Text style={[styles.overallLabel, bodyFont && { fontFamily: bodyFont }, isRTL && styles.rtlText]}>
                        {t('bacThresholdsOverallLabel')}
                      </Text>
                      <Text style={[styles.overallValue, boldFont && { fontFamily: boldFont }]}>
                        {formatGradeDisplay(saved!.overall)}
                      </Text>
                    </View>
                  ) : null}

                  <View style={[styles.disclaimerCard, isRTL && styles.rowRtl]}>
                    <FontAwesome name="lightbulb-o" size={14} color={homeShell.greenDark} style={styles.disclaimerIcon} />
                    <Text style={[styles.disclaimer, bodyFont && { fontFamily: bodyFont }, isRTL && styles.rtlText]}>
                      {t('bacThresholdsDisclaimer')}
                    </Text>
                  </View>
                </View>
              ) : null}
            </ScrollView>
          </KeyboardAvoidingView>

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
            <Pressable
              onPress={() => void handleSave()}
              disabled={saving}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.saveBtn,
                saving && styles.saveBtnDisabled,
                savedFlash && styles.saveBtnSuccess,
                pressed && !saving && styles.pressed,
              ]}>
              {saving ? (
                <ActivityIndicator color={brand.white} size="small" />
              ) : (
                <>
                  <FontAwesome
                    name={savedFlash ? 'check-circle' : 'calculator'}
                    size={16}
                    color={brand.white}
                    style={styles.saveBtnIcon}
                  />
                  <Text style={[styles.saveBtnTxt, boldFont && { fontFamily: boldFont }]}>
                    {savedFlash ? t('bacThresholdsSaved') : t('bacThresholdsSave')}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </PlatformSheetOverlay>
  );
}

function GradeCell({
  icon,
  label,
  value,
  onChange,
  placeholder,
  outOf20,
  isRTL,
  bodyFont,
}: {
  icon: ComponentProps<typeof FontAwesome>['name'];
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  outOf20: string;
  isRTL: boolean;
  bodyFont?: string;
}) {
  return (
    <View style={styles.gradeCell}>
      <View style={[styles.gradeCellHead, isRTL && styles.rowRtl]}>
        <View style={styles.gradeCellIcon}>
          <FontAwesome name={icon} size={11} color={brand.primary} />
        </View>
        <Text style={[styles.gradeCellLabel, bodyFont && { fontFamily: bodyFont }, isRTL && styles.rtlText]} numberOfLines={2}>
          {label}
        </Text>
      </View>
      <View style={[styles.gradeInputRow, isRTL && styles.rowRtl]}>
        <AppTextInput
          value={value}
          onChangeText={(v) => onChange(normalizeGradeInput(v))}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          textRtl={isRTL}
          style={styles.gradeInput}
        />
        <Text style={[styles.gradeSuffix, bodyFont && { fontFamily: bodyFont }]}>{outOf20}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  flex: {
    flex: 1,
    minHeight: 0,
  },
  backdrop: {
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
  },
  sheet: {
    backgroundColor: brand.backgroundSoft,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    borderColor: homeShell.borderOnWhite,
    ...Platform.select({
      ios: {
        shadowColor: brand.primary,
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
      },
      android: { elevation: 28 },
      default: {},
    }),
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: 2,
    backgroundColor: homeShell.bg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  heroHeader: {
    position: 'relative',
    backgroundColor: homeShell.bg,
    paddingBottom: spacing.md,
    overflow: 'hidden',
  },
  heroStripe: {
    position: 'absolute',
    start: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: homeShell.green,
  },
  heroStripeRtl: {
    start: undefined,
    end: 0,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingStart: spacing.lg + 5,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heroText: {
    flex: 1,
    minWidth: 0,
    paddingEnd: 40,
  },
  heroEyebrow: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: homeShell.green,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroTitle: {
    marginTop: 4,
    fontSize: fontSize.xl,
    fontWeight: '900',
    color: homeShell.text,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: homeShell.textMuted,
    lineHeight: 19,
  },
  heroCloseBtn: {
    position: 'absolute',
    top: spacing.xs,
    end: spacing.md,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroAccentBar: {
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    marginStart: spacing.lg + 5,
    height: 3,
    borderRadius: 2,
    backgroundColor: homeShell.green,
    opacity: 0.85,
  },
  heroAccentBarRtl: {
    marginStart: spacing.lg,
    marginEnd: spacing.lg + 5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: brand.linkChipBg,
    borderWidth: 1,
    borderColor: 'rgba(51, 62, 143, 0.14)',
  },
  tipIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tipText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: brand.textSecondary,
    lineHeight: 19,
  },
  sectionHead: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.text,
    letterSpacing: -0.2,
  },
  sectionHint: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: brand.textMuted,
    lineHeight: 16,
  },
  fieldsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  gradeCell: {
    width: '48%',
    minWidth: 140,
    flexGrow: 1,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: 'rgba(51, 62, 143, 0.1)',
    gap: spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: brand.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  gradeCellHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gradeCellIcon: {
    width: 22,
    height: 22,
    borderRadius: 8,
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  gradeCellLabel: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: brand.textSecondary,
    lineHeight: 13,
  },
  gradeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gradeInput: {
    flex: 1,
    minHeight: 44,
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    textAlign: 'center',
    borderRadius: radius.md,
  },
  gradeSuffix: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: brand.textMuted,
    flexShrink: 0,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.22)',
  },
  errorTxt: {
    flex: 1,
    color: '#B91C1C',
    fontWeight: '700',
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  resultsBlock: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  resultsSectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.text,
  },
  heroScoreCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: homeShell.bg,
    alignItems: 'center',
    gap: spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: homeShell.bg,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  heroScoreTop: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  majorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    backgroundColor: homeShell.greenSurface,
    borderWidth: 1,
    borderColor: homeShell.greenBorder,
  },
  majorBadgeTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: homeShell.greenDark,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  heroScoreValue: {
    fontSize: 36,
    fontWeight: '900',
    color: homeShell.text,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  heroScoreLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: homeShell.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  altScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: 'rgba(51, 62, 143, 0.12)',
  },
  altScoreLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  altScoreLabel: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: brand.textSecondary,
    lineHeight: 16,
  },
  altScoreValue: {
    fontVariant: ['tabular-nums'],
    fontSize: fontSize.xl,
    fontWeight: '900',
    color: brand.primary,
  },
  overallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: homeShell.greenSurface,
    borderWidth: 1,
    borderColor: homeShell.greenBorder,
  },
  overallLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: homeShell.greenDark,
  },
  overallValue: {
    fontVariant: ['tabular-nums'],
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: homeShell.greenDark,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: homeShell.borderOnWhite,
  },
  disclaimerIcon: {
    marginTop: 2,
    flexShrink: 0,
  },
  disclaimer: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: brand.textMuted,
    lineHeight: 17,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: homeShell.borderOnWhite,
    backgroundColor: brand.white,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: radius.lg,
    backgroundColor: brand.primary,
    ...Platform.select({
      ios: {
        shadowColor: brand.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.32,
        shadowRadius: 10,
      },
      android: { elevation: 5 },
      default: {},
    }),
  },
  saveBtnSuccess: {
    backgroundColor: homeShell.greenDark,
  },
  saveBtnDisabled: {
    opacity: 0.75,
  },
  saveBtnIcon: {
    marginEnd: 8,
  },
  saveBtnTxt: {
    color: brand.white,
    fontWeight: '900',
    fontSize: fontSize.sm,
  },
  pressed: {
    opacity: 0.9,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
