import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
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

import {
  OrientationGlobalProgressSkeleton,
  OrientationPercentBadgeSkeleton,
  OrientationTimelineSkeleton,
} from '@/components/home/OrientationParcoursSkeleton';
import { PlatformSheetOverlay } from '@/components/ui/PlatformSheetOverlay';
import { Text } from '@/components/ui/Text';
import { isDevApiBaseUrl } from '@/constants/api';
import {
  EMPTY_PLAN_PARCOURS_COMPLETION,
  getNextPlanStep,
  isPlanStepComplete,
  isPlanStepUnlocked,
  PLAN_PARCOURS_STEP_COUNT,
  PLAN_PARCOURS_STEP_IDS,
  PLAN_PARCOURS_STEPS,
  resolvePlanParcoursState,
  type OrientationParcoursTask,
  type PlanParcoursCompletion,
  type PlanParcoursStepId,
} from '@/constants/orientationParcours';
import {
  formatInviteFriendParcoursHint,
  inviteFriendQualifiedProgress,
} from '@/constants/inviteFriendParcours';
import {
  formatRecommendationParcoursHint,
  recommendationFollowProgress,
} from '@/constants/recommendationParcours';
import { isPlanStepTawjihPlusGated } from '@/constants/tawjihPlusParcours';
import { useLocale } from '@/contexts/LocaleContext';
import {
  promptTawjihPlusParcoursLock,
  type TawjihPlusParcoursGate,
} from '@/utils/tawjihPlusParcoursGate';
import { homeShell } from '@/theme/homeShell';
import { getUserFacingApiError } from '@/utils/apiError';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

const SHEET_SLIDE_MS = 320;

type Props = {
  visible: boolean;
  title: string;
  completion: PlanParcoursCompletion;
  tasks?: OrientationParcoursTask[];
  /** Progression en cours de chargement — timeline en état loading. */
  loading?: boolean;
  onClose: () => void;
  /** Ouvre l’écran correspondant à l’étape tapée (ex. diagnostic, recommandations). */
  onPressStep: (stepId: PlanParcoursStepId) => void;
  /** Dev : réinitialise une étape franchie puis rafraîchit la progression. */
  onDevResetStep?: (stepId: PlanParcoursStepId) => Promise<void>;
  hasTawjihPlusAccess?: boolean;
  tawjihPlusLoading?: boolean;
  tawjihPlusGate?: TawjihPlusParcoursGate;
};

function stepProgressLabel(
  index: number,
  completedCount: number,
  total: number,
): string {
  if (index < completedCount) {
    return `${Math.round(((index + 1) / total) * 100)}%`;
  }
  if (index === completedCount) {
    return `${Math.round((completedCount / total) * 100)}%`;
  }
  return '—';
}

export function OrientationParcoursSheet({
  visible,
  title,
  completion,
  tasks,
  loading = false,
  onClose,
  onPressStep,
  onDevResetStep,
  hasTawjihPlusAccess = true,
  tawjihPlusLoading = false,
  tawjihPlusGate,
}: Props) {
  const { t, isRTL, locale } = useLocale();
  const insets = useSafeAreaInsets();
  const safeCompletion = loading
    ? EMPTY_PLAN_PARCOURS_COMPLETION
    : (completion ?? EMPTY_PLAN_PARCOURS_COMPLETION);
  const state = resolvePlanParcoursState(safeCompletion, tasks);
  const showDevReset = __DEV__ && isDevApiBaseUrl() && Boolean(onDevResetStep);
  const [devResetStepId, setDevResetStepId] = useState<PlanParcoursStepId | null>(null);

  const [mounted, setMounted] = useState(visible);
  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(480);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      backdropOpacity.value = withTiming(1, { duration: SHEET_SLIDE_MS, easing: Easing.out(Easing.cubic) });
      sheetTranslateY.value = withTiming(0, { duration: SHEET_SLIDE_MS, easing: Easing.out(Easing.cubic) });
      return;
    }
    backdropOpacity.value = withTiming(0, { duration: 220 });
    sheetTranslateY.value = withTiming(
      480,
      { duration: 260, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(setMounted)(false);
      },
    );
  }, [visible, backdropOpacity, sheetTranslateY]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  if (!mounted) return null;

  const nextStep = loading ? null : getNextPlanStep(safeCompletion);
  const recoFollowProgress = recommendationFollowProgress(safeCompletion);
  const inviteFriendProgress = inviteFriendQualifiedProgress(safeCompletion);

  const sheetBody = (
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]} pointerEvents="none" />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t('closeOverlayA11y')} />

        <Animated.View style={[styles.sheet, sheetStyle]} accessibilityViewIsModal>
          <View style={styles.sheetTop}>
            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>

            <View style={styles.sheetHeader}>
              <Pressable
                onPress={onClose}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.headerCloseBtn,
                  isRTL && styles.headerCloseBtnRtl,
                  pressed && { opacity: 0.85 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={t('modalClose')}>
                <FontAwesome name="times" size={18} color={brand.textMuted} />
              </Pressable>
              <View style={styles.sheetHeaderStripe} />
              <View style={[styles.sheetHeaderInner, isRTL && styles.sheetHeaderInnerRtl]}>
                <View style={styles.sheetHeaderIconWrap}>
                  <FontAwesome name="map-signs" size={18} color={brand.primary} />
                </View>
                <View style={styles.sheetHeaderText}>
                  <Text style={[styles.sheetHeaderEyebrow, isRTL && styles.rtlText]}>
                    {t('orientationProgressLabel')}
                  </Text>
                  <Text style={[styles.sheetHeaderTitle, isRTL && styles.rtlText]} numberOfLines={2}>
                    {title}
                  </Text>
                  <Text style={[styles.sheetHeaderSubtitle, isRTL && styles.rtlText]}>
                    {t('orientationModalSubtitle')}
                  </Text>
                </View>
                {loading ? (
                  <OrientationPercentBadgeSkeleton />
                ) : (
                  <View style={styles.percentBadge}>
                    <Text style={styles.percentBadgeValue}>{state.percent}%</Text>
                    <Text style={styles.percentBadgeHint}>
                      {state.completedCount}/{PLAN_PARCOURS_STEP_COUNT}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={[styles.sheetBody, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
            {loading ? (
              <OrientationGlobalProgressSkeleton />
            ) : (
              <View style={styles.globalProgressTrack}>
                <View style={[styles.globalProgressFill, { width: `${state.percent}%` }]} />
              </View>
            )}

            <ScrollView
              style={styles.timelineScroll}
              contentContainerStyle={styles.timelineScrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}>
              {loading ? (
                <OrientationTimelineSkeleton isRTL={isRTL} />
              ) : (
              PLAN_PARCOURS_STEPS.map((step, i) => {
                const done = isPlanStepComplete(step.id, safeCompletion);
                const current = !state.allDone && nextStep?.id === step.id;
                const unlocked = isPlanStepUnlocked(step.id, safeCompletion);
                const tawjihPlusLocked =
                  isPlanStepTawjihPlusGated(step.id) &&
                  !tawjihPlusLoading &&
                  !hasTawjihPlusAccess;
                const actionable = unlocked && !tawjihPlusLocked;
                const isLast = i === PLAN_PARCOURS_STEPS.length - 1;
                const prevStep = i > 0 ? PLAN_PARCOURS_STEPS[i - 1]! : null;
                const lineAboveDone =
                  prevStep != null && isPlanStepComplete(prevStep.id, safeCompletion);
                const lineBelowDone = !isLast && done;
                const badge = done
                  ? t('orientationStepBadgeDone')
                  : current
                    ? t('orientationStepBadgeCurrent')
                    : t('orientationStepBadgeTodo');
                const stepPct = stepProgressLabel(i, state.completedCount, PLAN_PARCOURS_STEP_COUNT);

                const isLockedCard = !actionable;
                const cardBody = (
                  <>
                      <View style={[styles.timelineCardTop, isRTL && styles.timelineCardTopRtl]}>
                        <Text
                          style={[
                            styles.timelineCardTitle,
                            isLockedCard && styles.timelineCardTitleLocked,
                            isRTL && styles.rtlText,
                          ]}
                          numberOfLines={2}>
                          {t(step.labelKey)}
                        </Text>
                        <Text
                          style={[
                            styles.timelineCardPct,
                            done && styles.timelineCardPctDone,
                            current && styles.timelineCardPctCurrent,
                          ]}>
                          {stepPct}
                        </Text>
                      </View>
                      {current && step.id === PLAN_PARCOURS_STEP_IDS.recommendation ? (
                        <Text style={[styles.timelineCardHint, isRTL && styles.rtlText]}>
                          {formatRecommendationParcoursHint(
                            recoFollowProgress.current,
                            locale === 'ar' ? 'ar' : 'fr',
                          )}
                        </Text>
                      ) : null}
                      {current && step.id === PLAN_PARCOURS_STEP_IDS.inviteFriend ? (
                        <Text style={[styles.timelineCardHint, isRTL && styles.rtlText]}>
                          {formatInviteFriendParcoursHint(
                            inviteFriendProgress.current,
                            locale === 'ar' ? 'ar' : 'fr',
                          )}
                        </Text>
                      ) : null}
                      {tawjihPlusLocked ? (
                        <Text style={[styles.timelineCardHint, isRTL && styles.rtlText]}>
                          {t('inscTawjihPlusLockTitle')}
                        </Text>
                      ) : null}
                      <View style={[styles.timelineCardMeta, isRTL && styles.timelineCardMetaRtl]}>
                        <View
                          style={[
                            styles.statusPill,
                            done && styles.statusPillDone,
                            current && styles.statusPillCurrent,
                          ]}>
                          <Text
                            style={[
                              styles.statusPillTxt,
                              done && styles.statusPillTxtDone,
                              current && styles.statusPillTxtCurrent,
                            ]}>
                            {badge}
                          </Text>
                        </View>
                        {showDevReset && done ? (
                          <Pressable
                            disabled={devResetStepId != null}
                            onPress={() => {
                              Alert.alert(
                                'Réinitialiser (dev)',
                                `Remettre « ${t(step.labelKey)} » comme non franchie ?`,
                                [
                                  { text: 'Annuler', style: 'cancel' },
                                  {
                                    text: 'Réinitialiser',
                                    style: 'destructive',
                                    onPress: () => {
                                      void (async () => {
                                        try {
                                          setDevResetStepId(step.id);
                                          await onDevResetStep!(step.id);
                                        } catch (e) {
                                          Alert.alert(
                                            'Erreur',
                                            getUserFacingApiError(e, t, { context: 'generic' }),
                                          );
                                        } finally {
                                          setDevResetStepId(null);
                                        }
                                      })();
                                    },
                                  },
                                ],
                              );
                            }}
                            style={({ pressed }) => [
                              styles.devResetBtn,
                              pressed && { opacity: 0.85 },
                              devResetStepId === step.id && styles.devResetBtnBusy,
                            ]}
                            accessibilityRole="button"
                            accessibilityLabel={`Réinitialiser ${t(step.labelKey)} (dev)`}>
                            {devResetStepId === step.id ? (
                              <ActivityIndicator size="small" color={brand.white} />
                            ) : (
                              <FontAwesome name="undo" size={11} color={brand.white} />
                            )}
                          </Pressable>
                        ) : null}
                        {actionable ? (
                          <FontAwesome
                            name={isRTL ? 'chevron-left' : 'chevron-right'}
                            size={12}
                            color={current ? brand.primary : brand.textMuted}
                          />
                        ) : (
                          <FontAwesome name="lock" size={12} color={brand.textMuted} />
                        )}
                      </View>
                  </>
                );

                return (
                  <View key={step.id} style={[styles.timelineRow, isRTL && styles.timelineRowRtl]}>
                    <View style={styles.timelineRailCol}>
                      {i > 0 ? (
                        <View
                          style={[
                            styles.timelineSegment,
                            styles.timelineSegmentTop,
                            {
                              backgroundColor: lineAboveDone ? homeShell.green : homeShell.borderOnWhite,
                            },
                          ]}
                        />
                      ) : (
                        <View style={styles.timelineSegmentTopSpacer} />
                      )}
                      <View
                        style={[
                          styles.timelineNode,
                          done && styles.timelineNodeDone,
                          current && styles.timelineNodeCurrent,
                          !done && !current && styles.timelineNodeTodo,
                        ]}>
                        <FontAwesome
                          name={done ? 'check' : step.icon}
                          size={done ? 14 : 15}
                          color={
                            done
                              ? homeShell.text
                              : current
                                ? brand.primary
                                : brand.textMuted
                          }
                        />
                      </View>
                      {!isLast ? (
                        <View
                          style={[
                            styles.timelineSegment,
                            styles.timelineSegmentBottom,
                            {
                              backgroundColor: lineBelowDone ? homeShell.green : homeShell.borderOnWhite,
                            },
                          ]}
                        />
                      ) : (
                        <View style={styles.timelineSegmentBottomSpacer} />
                      )}
                    </View>

                    {actionable ? (
                      <Pressable
                        onPress={() => {
                          onClose();
                          onPressStep(step.id);
                        }}
                        style={({ pressed }) => [
                          styles.timelineCard,
                          isRTL ? styles.timelineCardRtl : null,
                          done && styles.timelineCardDone,
                          current && styles.timelineCardCurrent,
                          pressed && { opacity: 0.9 },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`${t(step.labelKey)} — ${badge}`}>
                        {cardBody}
                      </Pressable>
                    ) : unlocked && tawjihPlusLocked ? (
                      <Pressable
                        onPress={() => {
                          if (tawjihPlusGate) promptTawjihPlusParcoursLock(tawjihPlusGate);
                        }}
                        style={({ pressed }) => [
                          styles.timelineCard,
                          isRTL ? styles.timelineCardRtl : null,
                          styles.timelineCardLocked,
                          current && styles.timelineCardCurrent,
                          pressed && { opacity: 0.9 },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`${t(step.labelKey)} — ${t('inscTawjihPlusLockTitle')}`}>
                        {cardBody}
                      </Pressable>
                    ) : (
                      <View
                        style={[
                          styles.timelineCard,
                          isRTL ? styles.timelineCardRtl : null,
                          styles.timelineCardLocked,
                        ]}
                        accessibilityRole="text"
                        accessibilityLabel={`${t(step.labelKey)} — ${badge}`}>
                        {cardBody}
                      </View>
                    )}
                  </View>
                );
              })
              )}
            </ScrollView>

            {!loading && !state.allDone && nextStep ? (
              <Pressable
                onPress={() => {
                  if (
                    isPlanStepTawjihPlusGated(nextStep.id) &&
                    !tawjihPlusLoading &&
                    !hasTawjihPlusAccess &&
                    tawjihPlusGate
                  ) {
                    promptTawjihPlusParcoursLock(tawjihPlusGate);
                    return;
                  }
                  onClose();
                  onPressStep(nextStep.id);
                }}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  isRTL && styles.primaryBtnRtl,
                  pressed && { opacity: 0.92 },
                ]}>
                <Text style={[styles.primaryBtnLabel, isRTL && styles.rtlText]}>
                  {t('orientationContinueCta')} · {t(nextStep.labelKey)}
                </Text>
                <FontAwesome
                  name={isRTL ? 'chevron-left' : 'chevron-right'}
                  size={14}
                  color={brand.white}
                  style={styles.primaryBtnIcon}
                />
              </Pressable>
            ) : null}
          </View>
        </Animated.View>
      </View>
  );

  return (
    <PlatformSheetOverlay visible={visible} keepMounted={mounted && !visible} onRequestClose={onClose}>
      {sheetBody}
    </PlatformSheetOverlay>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
  },
  sheet: {
    backgroundColor: brand.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '88%',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    borderColor: homeShell.borderOnWhite,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.28,
    shadowRadius: 32,
    elevation: 28,
  },
  sheetTop: {
    backgroundColor: brand.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    backgroundColor: brand.white,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: homeShell.dotInactiveOnLight,
  },
  sheetHeader: {
    position: 'relative',
    backgroundColor: brand.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: homeShell.borderOnWhite,
  },
  headerCloseBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.md,
    zIndex: 3,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.backgroundSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: homeShell.borderOnWhite,
  },
  headerCloseBtnRtl: {
    right: undefined,
    left: spacing.md,
  },
  sheetHeaderStripe: {
    position: 'absolute',
    start: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: homeShell.green,
  },
  sheetHeaderInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingStart: spacing.lg + 5,
    paddingEnd: spacing.lg + 44,
  },
  sheetHeaderInnerRtl: {
    flexDirection: 'row-reverse',
    paddingStart: spacing.lg + 44,
    paddingEnd: spacing.lg + 5,
  },
  sheetHeaderIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.linkChipBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${brand.primary}22`,
  },
  sheetHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  sheetHeaderEyebrow: {
    color: brand.primary,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.55,
  },
  sheetHeaderTitle: {
    marginTop: 4,
    color: brand.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  sheetHeaderSubtitle: {
    marginTop: 4,
    color: brand.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  percentBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 58,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: homeShell.greenAlpha11,
    borderWidth: 1.5,
    borderColor: homeShell.green,
  },
  percentBadgeValue: {
    color: homeShell.greenDark,
    fontSize: fontSize.lg,
    fontWeight: '800',
    lineHeight: 22,
  },
  percentBadgeHint: {
    marginTop: 2,
    color: brand.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  sheetBody: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: brand.chatSurface,
  },
  globalProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: homeShell.borderOnWhite,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  globalProgressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: homeShell.green,
  },
  timelineScroll: {
    maxHeight: 360,
  },
  timelineScrollContent: {
    paddingBottom: spacing.xs,
  },
  timelineEmpty: {
    fontSize: fontSize.sm,
    color: brand.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 72,
  },
  timelineRowRtl: {
    flexDirection: 'row-reverse',
  },
  timelineRailCol: {
    width: 36,
    alignItems: 'center',
  },
  timelineSegment: {
    width: 3,
    flex: 1,
    minHeight: 8,
    borderRadius: 2,
  },
  timelineSegmentTop: {
    flexGrow: 0,
    height: 10,
  },
  timelineSegmentTopSpacer: {
    height: 10,
  },
  timelineSegmentBottom: {
    flex: 1,
  },
  timelineSegmentBottomSpacer: {
    flex: 1,
    minHeight: 8,
  },
  timelineNode: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: homeShell.borderOnWhite,
    backgroundColor: brand.white,
    zIndex: 1,
  },
  timelineNodeDone: {
    backgroundColor: homeShell.green,
    borderColor: homeShell.green,
  },
  timelineNodeCurrent: {
    borderWidth: 2,
    borderColor: brand.primary,
    backgroundColor: brand.white,
    shadowColor: homeShell.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineNodeTodo: {
    borderColor: homeShell.dotInactiveOnLight,
  },
  timelineCard: {
    flex: 1,
    marginStart: spacing.sm,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: homeShell.borderOnWhite,
    justifyContent: 'center',
  },
  timelineCardRtl: {
    marginStart: 0,
    marginEnd: spacing.sm,
  },
  timelineCardDone: {
    borderColor: 'rgba(47, 206, 148, 0.35)',
  },
  timelineCardCurrent: {
    backgroundColor: homeShell.greenAlpha11,
    borderColor: homeShell.green,
    borderWidth: 1.5,
  },
  timelineCardLocked: {
    backgroundColor: brand.white,
    borderWidth: 1.5,
    borderColor: 'rgba(51, 62, 143, 0.22)',
  },
  timelineCardTitleLocked: {
    color: brand.textMuted,
  },
  timelineCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  timelineCardTopRtl: {
    flexDirection: 'row-reverse',
  },
  timelineCardTitle: {
    flex: 1,
    color: brand.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
    lineHeight: 20,
  },
  timelineCardHint: {
    fontSize: fontSize.xs,
    lineHeight: 18,
    color: brand.textMuted,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  timelineCardPct: {
    color: brand.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '800',
    minWidth: 32,
    textAlign: 'right',
  },
  timelineCardPctDone: {
    color: homeShell.greenDark,
  },
  timelineCardPctCurrent: {
    color: brand.primary,
  },
  timelineCardMeta: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timelineCardMetaRtl: {
    flexDirection: 'row-reverse',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: brand.linkChipBg,
  },
  statusPillDone: {
    backgroundColor: homeShell.greenAlpha18,
  },
  statusPillCurrent: {
    backgroundColor: `${brand.primary}14`,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${brand.primary}33`,
  },
  statusPillTxt: {
    color: brand.textMuted,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.25,
  },
  statusPillTxtDone: {
    color: homeShell.greenDark,
  },
  statusPillTxtCurrent: {
    color: brand.primary,
  },
  devResetBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B45309',
    marginHorizontal: spacing.xs,
  },
  devResetBtnBusy: {
    opacity: 0.7,
  },
  primaryBtn: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    backgroundColor: brand.primary,
    borderRadius: radius.md,
    shadowColor: homeShell.blueDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnRtl: {
    flexDirection: 'row-reverse',
  },
  primaryBtnLabel: {
    color: brand.white,
    fontSize: fontSize.sm,
    fontWeight: '800',
    letterSpacing: -0.15,
  },
  primaryBtnIcon: {
    marginTop: 1,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
