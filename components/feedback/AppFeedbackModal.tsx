import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
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

import { KeyboardAwareBottomSpacer } from '@/components/ui/KeyboardAwareBottomSpacer';
import { PlatformSheetOverlay } from '@/components/ui/PlatformSheetOverlay';
import { Text } from '@/components/ui/Text';
import {
  APP_FEEDBACK_CATEGORIES,
  APP_FEEDBACK_RATING_KEYS,
  APP_FEEDBACK_SCORE_OPTIONS,
  APP_FEEDBACK_TEXT_FIELDS,
  countAnsweredRatings,
  emptyAppFeedbackRatings,
  emptyAppFeedbackTexts,
  isAppFeedbackRatingsComplete,
  type AppFeedbackCategoryDef,
  type AppFeedbackQuestionDef,
  type AppFeedbackRatingKey,
  type AppFeedbackRatings,
  type AppFeedbackTextKey,
  type AppFeedbackTexts,
} from '@/constants/appFeedback';
import { PLAN_PARCOURS_MOBILE_STEP_KEYS } from '@/constants/orientationParcours';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { submitAppFeedback } from '@/services/appFeedback';
import { completePlanParcoursStep } from '@/services/planParcoursStepComplete';
import { getUserFacingApiError } from '@/utils/apiError';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

const SHEET_SLIDE_MS = 320;
const TOTAL_RATINGS = APP_FEEDBACK_RATING_KEYS.length;
const SCROLL_FOCUS_PADDING = 96;
const SUBMIT_FOOTER_APPROX = 56;

type Props = {
  visible: boolean;
  onClose: () => void;
  markParcoursStep?: boolean;
  onSubmitted?: () => void;
};

function ThreeOptionRating({
  value,
  onChange,
  isRTL,
  label,
  t,
}: {
  value: number | null;
  onChange: (n: number) => void;
  isRTL: boolean;
  label: string;
  t: (k: import('@/constants/i18n').HomeCopyKey) => string;
}) {
  return (
    <View style={[styles.optionsRow, isRTL && styles.optionsRowRtl]}>
      {APP_FEEDBACK_SCORE_OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${label} — ${t(opt.labelKey)}`}
            style={({ pressed }) => [
              styles.optionBtn,
              selected && styles.optionBtnSelected,
              pressed && !selected && styles.optionBtnPressed,
            ]}>
            <Text
              style={[styles.optionBtnLabel, selected && styles.optionBtnLabelSelected]}
              numberOfLines={2}>
              {t(opt.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function FeedbackCategoryCard({
  category,
  ratings,
  onRate,
  isRTL,
  t,
}: {
  category: AppFeedbackCategoryDef;
  ratings: AppFeedbackRatings;
  onRate: (key: AppFeedbackRatingKey, n: number) => void;
  isRTL: boolean;
  t: (k: import('@/constants/i18n').HomeCopyKey, params?: Record<string, string>) => string;
}) {
  const answered = category.questions.filter((q) => {
    const v = ratings[q.key];
    return typeof v === 'number' && v >= 1;
  }).length;

  return (
    <View style={styles.categoryCard}>
      <View style={[styles.categoryHead, isRTL && styles.categoryHeadRtl]}>
        <View style={styles.categoryIconWrap}>
          <FontAwesome name={category.icon} size={16} color={brand.primary} />
        </View>
        <View style={styles.categoryHeadText}>
          <Text style={[styles.categoryTitle, isRTL && styles.txtRtl]}>{t(category.titleKey)}</Text>
          <Text style={[styles.categoryDesc, isRTL && styles.txtRtl]}>{t(category.descriptionKey)}</Text>
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeTxt} latinDigits={isRTL}>
            {answered}/{category.questions.length}
          </Text>
        </View>
      </View>

      {category.questions.map((q: AppFeedbackQuestionDef, idx) => (
        <View
          key={q.key}
          style={[
            styles.questionBlock,
            idx < category.questions.length - 1 && styles.questionBlockBorder,
          ]}>
          <Text style={[styles.questionLabel, isRTL && styles.txtRtl]}>{t(q.labelKey)}</Text>
          <Text style={[styles.questionDesc, isRTL && styles.txtRtl]}>{t(q.descriptionKey)}</Text>
          <ThreeOptionRating
            value={ratings[q.key]}
            onChange={(n) => onRate(q.key, n)}
            isRTL={isRTL}
            label={t(q.labelKey)}
            t={t}
          />
        </View>
      ))}
    </View>
  );
}

export function AppFeedbackModal({
  visible,
  onClose,
  markParcoursStep = false,
  onSubmitted,
}: Props) {
  const { t, isRTL, locale } = useLocale();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { getValidAccessToken } = useAuth();

  const sheetMaxHeight = windowHeight * 0.92;
  const scrollMaxHeight = Math.max(280, windowHeight * 0.55);
  const thanksPaneMinHeight = scrollMaxHeight + SUBMIT_FOOTER_APPROX;
  const footerPad = Math.max(insets.bottom, spacing.md) + SUBMIT_FOOTER_APPROX;

  const scrollRef = useRef<ScrollView>(null);
  const scrollInnerRef = useRef<View>(null);
  const fieldWrapRefs = useRef<Partial<Record<AppFeedbackTextKey, View>>>({});

  const [ratings, setRatings] = useState<AppFeedbackRatings>(emptyAppFeedbackRatings);
  const [texts, setTexts] = useState<AppFeedbackTexts>(emptyAppFeedbackTexts);
  const [submitting, setSubmitting] = useState(false);
  const [thanks, setThanks] = useState(false);

  const [mounted, setMounted] = useState(visible);
  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(520);

  const answeredCount = useMemo(() => countAnsweredRatings(ratings), [ratings]);
  const progressPct = Math.round((answeredCount / TOTAL_RATINGS) * 100);

  const resetForm = useCallback(() => {
    setRatings(emptyAppFeedbackRatings());
    setTexts(emptyAppFeedbackTexts());
    setThanks(false);
    setSubmitting(false);
  }, []);

  useEffect(() => {
    if (visible) {
      resetForm();
      setMounted(true);
      backdropOpacity.value = withTiming(1, { duration: SHEET_SLIDE_MS, easing: Easing.out(Easing.cubic) });
      sheetTranslateY.value = withTiming(0, { duration: SHEET_SLIDE_MS, easing: Easing.out(Easing.cubic) });
      return;
    }
    backdropOpacity.value = withTiming(0, { duration: 220 });
    sheetTranslateY.value = withTiming(
      520,
      { duration: 260, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(setMounted)(false);
      },
    );
  }, [visible, backdropOpacity, sheetTranslateY, resetForm]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sheetTranslateY.value }] }));

  const setRating = useCallback((key: AppFeedbackRatingKey, n: number) => {
    setRatings((prev) => ({ ...prev, [key]: n }));
  }, []);

  const setText = useCallback((key: AppFeedbackTextKey, value: string) => {
    setTexts((prev) => ({ ...prev, [key]: value }));
  }, []);

  const scrollToTextField = useCallback((key: AppFeedbackTextKey) => {
    const fieldNode = fieldWrapRefs.current[key];
    const contentNode = scrollInnerRef.current;
    if (!fieldNode || !contentNode) return;

    const runScroll = () => {
      fieldNode.measureLayout(
        contentNode,
        (_x, y) => {
          scrollRef.current?.scrollTo({
            y: Math.max(0, y - SCROLL_FOCUS_PADDING),
            animated: true,
          });
        },
        () => {},
      );
    };

    if (Platform.OS === 'ios') {
      setTimeout(runScroll, 80);
    } else {
      requestAnimationFrame(runScroll);
    }
  }, []);

  const handleClose = useCallback(() => {
    if (submitting) return;
    onClose();
  }, [onClose, submitting]);

  const handleSubmit = useCallback(async () => {
    if (!isAppFeedbackRatingsComplete(ratings)) {
      Alert.alert(t('appFeedbackTitle'), t('appFeedbackRequiredRatings'));
      return;
    }
    const token = await getValidAccessToken();
    if (!token) {
      Alert.alert(t('appFeedbackTitle'), t('appFeedbackLoginRequired'));
      return;
    }

    setSubmitting(true);
    try {
      const ratingsPayload = APP_FEEDBACK_RATING_KEYS.reduce(
        (acc, key) => {
          acc[key] = ratings[key] as number;
          return acc;
        },
        {} as Record<AppFeedbackRatingKey, number>,
      );

      await submitAppFeedback(token, {
        ratings: ratingsPayload,
        texts: {
          improve: texts.improve.trim(),
          bugs: texts.bugs.trim(),
          features: texts.features.trim(),
        },
        locale,
      });

      if (markParcoursStep) {
        await completePlanParcoursStep(token, PLAN_PARCOURS_MOBILE_STEP_KEYS.feedback);
      }

      setThanks(true);
      onSubmitted?.();
      setTimeout(() => {
        handleClose();
      }, 1600);
    } catch (e) {
      Alert.alert(
        t('appFeedbackTitle'),
        getUserFacingApiError(e, t, { context: 'feedback' }),
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    ratings,
    texts,
    getValidAccessToken,
    t,
    locale,
    markParcoursStep,
    onSubmitted,
    handleClose,
  ]);

  if (!mounted) return null;

  return (
    <PlatformSheetOverlay visible={visible || submitting} keepMounted={mounted} onRequestClose={handleClose}>
      <View style={styles.overlayRoot} pointerEvents="box-none">
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} accessibilityLabel={t('closeOverlayA11y')} />
        </Animated.View>

        <Animated.View
          style={[styles.sheet, { maxHeight: sheetMaxHeight }, sheetStyle, isRTL && styles.sheetRtl]}
          accessibilityViewIsModal>
          <View style={styles.sheetTop}>
            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>

            <View style={styles.sheetHeader}>
              <View
                style={[
                  styles.sheetHeaderStripe,
                  isRTL && styles.sheetHeaderStripeRtl,
                  thanks && styles.sheetHeaderStripeThanks,
                ]}
              />
              <View style={[styles.sheetHeaderInner, isRTL && styles.sheetHeaderInnerRtl]}>
                <View
                  style={[
                    styles.sheetHeaderIconWrap,
                    thanks && styles.sheetHeaderIconWrapThanks,
                  ]}>
                  <FontAwesome
                    name={thanks ? 'check' : 'comment-o'}
                    size={thanks ? 20 : 18}
                    color={thanks ? homeShell.greenDark : brand.primary}
                  />
                </View>
                <View style={styles.sheetHeaderText}>
                  <Text style={[styles.sheetHeaderEyebrow, isRTL && styles.txtRtl]}>
                    {thanks ? t('appFeedbackThanksEyebrow') : t('appFeedbackEyebrow')}
                  </Text>
                  <Text style={[styles.sheetHeaderTitle, isRTL && styles.txtRtl]} numberOfLines={2}>
                    {thanks ? t('appFeedbackThanks') : t('appFeedbackTitle')}
                  </Text>
                  <Text style={[styles.sheetHeaderSubtitle, isRTL && styles.txtRtl]}>
                    {thanks ? t('appFeedbackThanksSub') : t('appFeedbackIntro')}
                  </Text>
                </View>
                <Pressable
                  onPress={handleClose}
                  hitSlop={10}
                  disabled={submitting}
                  style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.85 }]}
                  accessibilityRole="button"
                  accessibilityLabel={t('modalClose')}>
                  <FontAwesome name="times" size={16} color={brand.textMuted} />
                </Pressable>
              </View>
            </View>

            {!thanks ? (
              <View style={styles.progressBlock}>
                <View style={[styles.progressLabels, isRTL && styles.progressLabelsRtl]}>
                  <Text style={[styles.progressLabel, isRTL && styles.txtRtl]}>
                    {t('appFeedbackProgress')
                      .replace('{{done}}', String(answeredCount))
                      .replace('{{total}}', String(TOTAL_RATINGS))}
                  </Text>
                  <Text style={styles.progressPct} latinDigits={isRTL}>
                    {isRTL ? `\u2066${progressPct}%\u2069` : `${progressPct}%`}
                  </Text>
                </View>
                <View style={[styles.progressTrack, isRTL && styles.progressTrackRtl]}>
                  <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
                </View>
                <Text style={[styles.scaleHint, isRTL && styles.txtRtl]}>{t('appFeedbackScaleHint')}</Text>
              </View>
            ) : null}
          </View>

          {thanks ? (
            <View
              style={[
                styles.thanksPane,
                {
                  minHeight: thanksPaneMinHeight,
                  paddingBottom: Math.max(insets.bottom, spacing.lg),
                },
              ]}>
              <View style={styles.thanksCard}>
                <View style={styles.thanksIconRing}>
                  <View style={styles.thanksIconWrap}>
                    <FontAwesome name="check" size={32} color={homeShell.greenDark} />
                  </View>
                </View>
                <Text style={[styles.thanksCardTitle, isRTL && styles.txtRtl]}>
                  {t('appFeedbackThanksCardTitle')}
                </Text>
                <Text style={[styles.thanksCardSub, isRTL && styles.txtRtl]}>
                  {t('appFeedbackThanksCardSub')}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.sheetBody}>
              <ScrollView
                ref={scrollRef}
                style={[styles.scroll, { maxHeight: scrollMaxHeight }]}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                automaticallyAdjustKeyboardInsets
                showsVerticalScrollIndicator={false}>
                <View ref={scrollInnerRef} collapsable={false} style={styles.scrollInner}>
                  {APP_FEEDBACK_CATEGORIES.map((cat) => (
                    <FeedbackCategoryCard
                      key={cat.id}
                      category={cat}
                      ratings={ratings}
                      onRate={setRating}
                      isRTL={isRTL}
                      t={t}
                    />
                  ))}

                  <View style={styles.categoryCard}>
                    <View style={[styles.categoryHead, isRTL && styles.categoryHeadRtl]}>
                      <View style={styles.categoryIconWrap}>
                        <FontAwesome name="pencil" size={16} color={brand.primary} />
                      </View>
                      <View style={styles.categoryHeadText}>
                        <Text style={[styles.categoryTitle, isRTL && styles.txtRtl]}>
                          {t('appFeedbackCatComments')}
                        </Text>
                        <Text style={[styles.categoryDesc, isRTL && styles.txtRtl]}>
                          {t('appFeedbackCatCommentsDesc')}
                        </Text>
                      </View>
                    </View>

                    {APP_FEEDBACK_TEXT_FIELDS.map((field, idx) => (
                      <View
                        key={field.key}
                        ref={(node) => {
                          if (node) fieldWrapRefs.current[field.key] = node;
                        }}
                        style={[
                          styles.textFieldBlock,
                          idx < APP_FEEDBACK_TEXT_FIELDS.length - 1 && styles.questionBlockBorder,
                        ]}>
                        <Text style={[styles.questionLabel, isRTL && styles.txtRtl]}>
                          {t(field.labelKey)}
                          {field.required ? (
                            <Text style={styles.requiredMark}> *</Text>
                          ) : null}
                        </Text>
                        <TextInput
                          value={texts[field.key]}
                          onChangeText={(v) => setText(field.key, v)}
                          onFocus={() => scrollToTextField(field.key)}
                          placeholder={t(field.placeholderKey)}
                          placeholderTextColor={brand.textMuted}
                          multiline
                          textAlignVertical="top"
                          style={[styles.textInput, isRTL && styles.textInputRtl]}
                        />
                      </View>
                    ))}
                  </View>

                  <KeyboardAwareBottomSpacer minPaddingWhenKeyboardClosed={footerPad} />
                </View>
              </ScrollView>

              <View
                style={[
                  styles.footer,
                  { paddingBottom: Math.max(insets.bottom, spacing.md) },
                  isRTL && styles.footerRtl,
                ]}>
                <Pressable
                  onPress={() => void handleSubmit()}
                  disabled={submitting}
                  style={({ pressed }) => [
                    styles.submitBtn,
                    (pressed || submitting) && { opacity: 0.9 },
                  ]}
                  accessibilityRole="button">
                  {submitting ? (
                    <ActivityIndicator color={homeShell.text} size="small" />
                  ) : (
                    <>
                      <Text style={[styles.submitTxt, isRTL && styles.txtRtl]}>{t('appFeedbackSubmit')}</Text>
                      <FontAwesome
                        name={isRTL ? 'arrow-left' : 'arrow-right'}
                        size={14}
                        color={homeShell.text}
                      />
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          )}
        </Animated.View>
      </View>
    </PlatformSheetOverlay>
  );
}

const styles = StyleSheet.create({
  overlayRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  sheet: {
    width: '100%',
    backgroundColor: brand.backgroundSoft,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
  },
  sheetRtl: {
    direction: 'rtl',
  },
  sheetTop: {
    backgroundColor: brand.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: homeShell.borderOnWhite,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  sheetHeader: {
    overflow: 'hidden',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  sheetHeaderStripe: {
    position: 'absolute',
    start: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: homeShell.green,
  },
  sheetHeaderStripeRtl: {
    start: undefined,
    end: 0,
  },
  sheetHeaderInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingStart: spacing.lg + 4,
  },
  sheetHeaderInnerRtl: {
    flexDirection: 'row-reverse',
    paddingStart: spacing.lg,
    paddingEnd: spacing.lg + 4,
  },
  sheetHeaderIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: homeShell.greenAlpha11,
    borderWidth: 1,
    borderColor: homeShell.greenAlpha28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetHeaderText: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  sheetHeaderEyebrow: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: homeShell.greenDark,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sheetHeaderTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: brand.primary,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  sheetHeaderSubtitle: {
    fontSize: fontSize.sm,
    color: brand.textMuted,
    lineHeight: 19,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.backgroundSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  progressBlock: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: 6,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabelsRtl: {
    flexDirection: 'row-reverse',
  },
  progressLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: brand.textMuted,
  },
  progressPct: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.primary,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressTrackRtl: {
    direction: 'rtl',
  },
  progressFill: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: homeShell.green,
  },
  scaleHint: {
    fontSize: fontSize.xs,
    color: brand.textMuted,
    fontWeight: '600',
  },
  sheetBody: {
    width: '100%',
    backgroundColor: brand.backgroundSoft,
  },
  scroll: {
    backgroundColor: brand.backgroundSoft,
  },
  scrollContent: {
    paddingTop: spacing.md,
    backgroundColor: brand.backgroundSoft,
  },
  scrollInner: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  categoryCard: {
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: 'rgba(51, 62, 143, 0.04)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: homeShell.borderOnWhite,
  },
  categoryHeadRtl: {
    flexDirection: 'row-reverse',
  },
  categoryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(51, 62, 143, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryHeadText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  categoryTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: brand.primary,
  },
  categoryDesc: {
    fontSize: fontSize.xs,
    color: brand.textMuted,
    lineHeight: 16,
  },
  categoryBadge: {
    backgroundColor: homeShell.greenAlpha11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: homeShell.greenAlpha28,
  },
  categoryBadgeTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: homeShell.greenDark,
  },
  questionBlock: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: brand.white,
  },
  questionBlockBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(15, 23, 42, 0.06)',
  },
  questionLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: brand.text,
    marginBottom: 4,
  },
  questionDesc: {
    fontSize: fontSize.xs,
    color: brand.textMuted,
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.xs,
  },
  optionsRowRtl: {
    flexDirection: 'row-reverse',
  },
  optionBtn: {
    flex: 1,
    minHeight: 40,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.white,
    borderWidth: 1.5,
    borderColor: homeShell.borderOnWhite,
  },
  optionBtnPressed: {
    backgroundColor: brand.backgroundSoft,
  },
  optionBtnSelected: {
    backgroundColor: homeShell.greenAlpha18,
    borderColor: homeShell.green,
  },
  optionBtnLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: brand.textMuted,
    textAlign: 'center',
  },
  optionBtnLabelSelected: {
    color: homeShell.greenDark,
    fontWeight: '800',
  },
  textFieldBlock: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  textInput: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.sm,
    color: brand.text,
    backgroundColor: brand.white,
    marginTop: spacing.xs,
  },
  textInputRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  requiredMark: {
    color: '#DC2626',
    fontWeight: '800',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: brand.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: homeShell.borderOnWhite,
  },
  footerRtl: {
    direction: 'rtl',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: homeShell.green,
    borderRadius: radius.full,
    paddingVertical: 14,
    shadowColor: homeShell.greenDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitTxt: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: homeShell.text,
  },
  sheetHeaderStripeThanks: {
    backgroundColor: homeShell.green,
  },
  sheetHeaderIconWrapThanks: {
    backgroundColor: homeShell.greenAlpha18,
    borderColor: homeShell.greenAlpha28,
  },
  thanksPane: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: brand.backgroundSoft,
  },
  thanksCard: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  thanksIconRing: {
    padding: spacing.sm,
    borderRadius: 999,
    backgroundColor: homeShell.greenAlpha11,
    marginBottom: spacing.xs,
  },
  thanksIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: brand.white,
    borderWidth: 2,
    borderColor: homeShell.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thanksCardTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: brand.primary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  thanksCardSub: {
    fontSize: fontSize.sm,
    color: brand.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.sm,
  },
  txtRtl: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
});
