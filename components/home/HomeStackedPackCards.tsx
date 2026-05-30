import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { LoadingMiniIconSkeleton } from '@/components/ui/CardLoadingSkeleton';
import { Text } from '@/components/ui/Text';
import { Gesture, GestureDetector, Pressable as GHPressable } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import {
  OrientationPercentTextSkeleton,
  OrientationProgressSkeleton,
} from '@/components/home/OrientationParcoursSkeleton';
import { HomeStackedPackPracticalCardSkeleton } from '@/components/home/HomeStackedPackPracticalCardSkeleton';
import { PaginationDots } from '@/components/home/PaginationDots';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { HomeCopyKey } from '@/constants/i18n';
import {
  EMPTY_PLAN_PARCOURS_COMPLETION,
  getNextPlanStep,
  isPlanStepComplete,
  PLAN_PARCOURS_STEP_COUNT,
  PLAN_PARCOURS_STEPS,
  resolvePlanParcoursState,
  type OrientationParcoursTask,
  type PlanParcoursCompletion,
} from '@/constants/orientationParcours';
import { getPracticalLinkDef } from '@/constants/practicalLinks';
import { useLocale } from '@/contexts/LocaleContext';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { navigatePlanParcoursStep, type PlanParcoursNavigationAuth } from '@/utils/planParcoursNavigation';
import type { TawjihPlusParcoursGate } from '@/utils/tawjihPlusParcoursGate';
import {
  hasAnyBacResultPublished,
  type BacResultsCardConfig,
  type BacVerificationChannel,
} from '@/constants/bacResultsCard';
import { BacResultsStackCardContent } from '@/components/home/BacResultsStackCardContent';
import { BacResultsStackCardSkeleton } from '@/components/home/BacResultsStackCardSkeleton';
import {
  BASE_CARD_H,
  buildStackCardLayout,
  getHomeStackCardHeight,
  type StackCardLayout,
} from '@/components/home/stackCardLayout';

export type { StackCardLayout } from '@/components/home/stackCardLayout';
export { buildStackCardLayout } from '@/components/home/stackCardLayout';

export type { OrientationParcoursTask };

/** Données passées à la page d’accueil pour ouvrir le sheet parcours (plein écran). */
export type OrientationOverviewOpenPayload = {
  title: string;
  completion: PlanParcoursCompletion;
  tasks?: OrientationParcoursTask[];
};

export type HomeStackCard = {
  id: string;
  /** Carte sous le parcours : un id parmi `PRACTICAL_LINK_DEFS` (écoles, inscriptions, …). */
  practicalLinkId?: string;
  eyebrow?: string;
  /** Sous-titre sous l’eyebrow ; omis si absent. */
  packLabel?: string;
  packName?: string;
  /** Ignorés si `dailyActions` est défini (remplacés par le bouton défi quotidien, et optionnellement « info du jour »). */
  validityLabel?: string;
  validityValue?: string;
  hint?: string;
  /** Bloc progression + ouverture liste des tâches (ex. carte « Votre parcours d'orientation »). */
  orientationProgress?: {
    percent: number;
    label?: string;
    /** Progression parcours en cours de chargement (API). */
    loading?: boolean;
  };
  planParcoursCompletion?: PlanParcoursCompletion;
  remainingOrientationTasks?: OrientationParcoursTask[];
  /**
   * Défi quotidien (SNAKE) sur la carte accueil.
   * `includeDailyInfo` : affiche aussi le raccourci « Information du jour » (désactivé sur la carte parcours).
   */
  dailyActions?: {
    playedToday: boolean;
    /** Série (jours consécutifs), renseignée par l’API défi du jour si > 0. */
    streakDays?: number;
    includeDailyInfo?: boolean;
    infoReadToday?: boolean;
    loading?: boolean;
    /** Bouton test orientation 1ère bac (élèves 1ère bac). */
    showOrientation1Bac?: boolean;
    orientation1BacLocked?: boolean;
    orientation1BacUnlockLabel?: string;
  };
  /** Filière + niveau affichés sous le titre du pack (carte parcours). */
  academicPackLine?: string;
  /** Carte résultats du baccalauréat (canaux Outlook / SMS / MEN). */
  bacResults?: BacResultsCardConfig;
  /** Chargement config bac depuis l’API. */
  bacResultsLoading?: boolean;
};

type Props = {
  cards: HomeStackCard[];
  /** Largeur utile (ex. écran − padding horizontal) */
  width: number;
  onPressDailyGame?: () => void;
  onPressDailyInfo?: () => void;
  onPressOrientation1Bac?: () => void;
  /** Calcul des seuils (bac) : verrouillé pour 1ère bac. */
  bacThresholdsLocked?: boolean;
  /** Skeleton sur le bouton seuils (résultats bac + profil élève). */
  bacThresholdsLoading?: boolean;
  /** Cartes « lien pratique » : même id que la rangée Liens pratiques. */
  onPressPracticalLink?: (id: string) => void;
  /** Ouvre le sheet parcours au niveau de l’écran d’accueil (pas dans la carte). */
  onOpenOrientationOverview?: (payload: OrientationOverviewOpenPayload) => void;
  /** Chargement initial / refresh de la progression parcours. */
  planParcoursLoading?: boolean;
  /** Skeleton sur les cartes « lien pratique » pendant le refresh accueil. */
  contentLoading?: boolean;
  planParcoursNavAuth?: PlanParcoursNavigationAuth;
  tawjihPlusGate?: TawjihPlusParcoursGate;
  /** Ouvre le sheet d’instructions (Outlook / MEN / SMS) au niveau de l’écran d’accueil. */
  onOpenBacVerification?: (channel: BacVerificationChannel) => void;
  /** Ouvre le modal calcul des seuils (notes bulletin). */
  onOpenBacThresholds?: () => void;
};

/** Traits entre pastilles « à faire » — plus foncé que la piste de la barre et le fond du bloc. */
const ORIENTATION_STEP_LINE_TODO = '#CBD5E1';
const ORIENTATION_PROGRESS_TRACK_BG = '#E2E8F0';

const SWIPE_V = 520;
const SPRING_BACK = { damping: 22, stiffness: 260, mass: 0.9 } as const;
/** Sortie de la carte du dessus — court pour que la suivante devienne principale vite. */
const EXIT_MS = 200;
/** Révélation du contenu de la nouvelle carte principale (après fin du swipe). */
const REVEAL_MS = 220;
/** La carte suit le doigt — léger amorti sans retarder la reconnaissance du swipe. */
const DRAG_DAMPING = 0.88;
const EXIT_EASING = Easing.out(Easing.quad);
const REVEAL_EASING = Easing.out(Easing.cubic);

function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return `rgba(51,62,143,${alpha})`;
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return `rgba(51,62,143,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
}

function formatHomeDailyStreakLine(streakDays: number | undefined, t: (key: HomeCopyKey) => string): string {
  if (streakDays == null || streakDays < 1) return '';
  if (streakDays === 1) return t('homeDailyStreakOne');
  return t('homeDailyStreakMany').replace(/\{\{n\}\}/g, String(streakDays));
}

function OrientationStepsStrip({
  completion,
  tasks,
  layout,
  compact,
}: {
  completion: PlanParcoursCompletion;
  tasks?: OrientationParcoursTask[];
  layout: StackCardLayout;
  compact?: boolean;
}) {
  const { t, isRTL } = useLocale();
  const state = resolvePlanParcoursState(completion, tasks);
  const scale = layout.cardH / BASE_CARD_H;
  const iconSz = Math.max(8, Math.round(layout.iconSize * (compact ? 0.52 : 0.58)));
  const bubble = Math.max(compact ? 16 : 18, Math.round((compact ? 18 : 22) * scale));

  const nextStep = getNextPlanStep(completion);

  return (
    <View style={styles.orientationStepsWrap}>
      <View style={[styles.orientationStepsRow, isRTL && styles.orientationStepsRowRtl]}>
        {PLAN_PARCOURS_STEPS.map((step, i) => {
          const done = isPlanStepComplete(step.id, completion);
          const current = !state.allDone && nextStep?.id === step.id;
          const prevStep = i > 0 ? PLAN_PARCOURS_STEPS[i - 1]! : null;
          const lineDone = prevStep != null && isPlanStepComplete(prevStep.id, completion);
          return (
            <Fragment key={step.id}>
              {i > 0 ? (
                <View
                  style={[
                    styles.orientationStepLine,
                    { backgroundColor: lineDone ? homeShell.green : ORIENTATION_STEP_LINE_TODO },
                  ]}
                />
              ) : null}
              <View
                style={[styles.orientationStepBubbleCol, { width: bubble }]}
                accessibilityLabel={`${t(step.labelKey)}${
                  done
                    ? t('orientationStepA11yDone')
                    : current
                      ? t('orientationStepA11yCurrent')
                      : t('orientationStepA11yTodo')
                }`}>
                <View
                  style={[
                    styles.orientationStepBubble,
                    { width: bubble, height: bubble, borderRadius: bubble / 2 },
                    done && styles.orientationStepBubbleDone,
                    current && styles.orientationStepBubbleCurrent,
                    !done && !current && styles.orientationStepBubbleTodo,
                  ]}>
                  <FontAwesome
                    name={step.icon}
                    size={iconSz}
                    color={done ? homeShell.text : current ? homeShell.green : brand.textMuted}
                  />
                </View>
                <View
                  style={[
                    styles.orientationStepDot,
                    done && styles.orientationStepDotDone,
                    current && styles.orientationStepDotCurrent,
                    !done && !current && styles.orientationStepDotTodo,
                  ]}
                />
              </View>
            </Fragment>
          );
        })}
      </View>
    </View>
  );
}

function OrientationParcoursProgress({
  completion,
  tasks,
  layout,
  compact,
  loading,
}: {
  completion: PlanParcoursCompletion;
  tasks?: OrientationParcoursTask[];
  layout: StackCardLayout;
  compact?: boolean;
  loading?: boolean;
}) {
  const { isRTL } = useLocale();
  const state = resolvePlanParcoursState(completion, tasks);
  if (loading) {
    return (
      <View style={styles.orientationProgressWrap}>
        <OrientationProgressSkeleton layout={layout} compact={compact} isRTL={isRTL} />
      </View>
    );
  }
  return (
    <View style={styles.orientationProgressWrap}>
      <View style={[styles.orientationProgressTrack, isRTL && styles.orientationProgressTrackRtl]}>
        <View style={[styles.orientationProgressFill, { width: `${state.percent}%` }]} />
      </View>
      <OrientationStepsStrip completion={completion} tasks={tasks} layout={layout} compact={compact} />
    </View>
  );
}

function DailyActionsBlock({
  daily,
  layout,
  onPressDailyGame,
  onPressDailyInfo,
  onPressOrientation1Bac,
}: {
  daily: NonNullable<HomeStackCard['dailyActions']>;
  layout: StackCardLayout;
  onPressDailyGame?: () => void;
  onPressDailyInfo?: () => void;
  onPressOrientation1Bac?: () => void;
}) {
  const { t, isRTL } = useLocale();
  const padV = Math.max(10, Math.round(layout.boxPad * 0.72));
  const padH = Math.max(8, Math.round(layout.boxPad * 0.58));
  const iconSz = Math.max(17, Math.round(layout.iconSize * 1.12));
  const titleFs = Math.max(11, layout.validityValue);
  const badgeFs = Math.max(9, layout.validityLabel);
  const radius = Math.max(10, layout.boxRadius);

  const gameLoading = daily.loading === true;
  const gamePending = !gameLoading && !daily.playedToday;
  const showInfo = Boolean(daily.includeDailyInfo && onPressDailyInfo);
  const showOrientation1Bac = Boolean(daily.showOrientation1Bac && onPressOrientation1Bac);
  const orientationLocked = showOrientation1Bac && daily.orientation1BacLocked === true;
  const infoPending = showInfo && !daily.infoReadToday;
  const gameOnly = !showInfo && !showOrientation1Bac;
  const streakLine = formatHomeDailyStreakLine(daily.streakDays, t);
  const unlockHint = daily.orientation1BacUnlockLabel
    ? t('orientation1BacHomeLocked').replace('{date}', daily.orientation1BacUnlockLabel)
    : '';
  const a11yStreak = streakLine ? `, ${streakLine}` : '';
  const playedCheckSize = Math.max(22, Math.round(iconSz + 5));

  return (
    <View
      style={[
        styles.dailyActionsWrap,
        gameOnly && styles.dailyActionsWrapGameOnly,
        isRTL && styles.dailyActionsWrapRtl,
        gameOnly && isRTL && styles.dailyActionsWrapGameOnlyRtl,
      ]}>
      <GHPressable
        onPress={onPressDailyGame}
        disabled={!onPressDailyGame || gameLoading}
        accessibilityRole="button"
        accessibilityState={{ disabled: gameLoading }}
        accessibilityLabel={
          gameLoading
            ? t('setupLoading')
            : gamePending
              ? `${t('gameDailyTitle')}${a11yStreak}`
              : `${t('dailyPlayed')}${a11yStreak ? `, ${streakLine}` : ''}`
        }
        style={({ pressed }) => [
          styles.dailyMini,
          gameOnly && styles.dailyMiniFullWidth,
          isRTL && styles.dailyMiniRtl,
          {
            paddingVertical: padV,
            paddingHorizontal: padH,
            borderRadius: radius,
          },
          gameLoading
            ? styles.dailyMiniLoading
            : gamePending
              ? styles.dailyMiniHighlight
              : styles.dailyMiniGrayPlayed,
          pressed && onPressDailyGame && !gameLoading ? { opacity: 0.88 } : null,
        ]}>
        {!gamePending && !gameLoading ? (
          <View
            style={[styles.dailyPlayedCheckBadgeBase, isRTL ? { left: 8 } : { right: 8 }]}
            pointerEvents="none">
            <FontAwesome name="check-circle" size={playedCheckSize} color={homeShell.greenDark} />
          </View>
        ) : null}
        {gameLoading ? (
          <LoadingMiniIconSkeleton size={iconSz} style={styles.dailyMiniIcon} />
        ) : (
          <FontAwesome
            name="trophy"
            size={iconSz}
            color={gamePending ? homeShell.greenDark : brand.textMuted}
            style={styles.dailyMiniIcon}
          />
        )}
        <Text
          style={[
            styles.dailyMiniTitle,
            { fontSize: titleFs, lineHeight: Math.round(titleFs * 1.22) },
            (gameLoading || !gamePending) && styles.dailyMiniTitleMuted,
            isRTL && styles.dailyMiniTextRtl,
          ]}
          numberOfLines={2}>
          {gameLoading ? t('setupLoading') : t('gameDailyTitle')}
        </Text>
        {streakLine ? (
          <Text
            style={[
              gamePending ? styles.dailyStreakLine : styles.dailyStreakLinePlayed,
              { fontSize: badgeFs },
              isRTL && styles.dailyMiniTextRtl,
            ]}
            numberOfLines={1}>
            {streakLine}
          </Text>
        ) : null}
        {gamePending ? (
          <View style={styles.dailyMiniBadge}>
            <Text
              style={[styles.dailyMiniBadgeTxt, { fontSize: badgeFs }, isRTL && styles.dailyMiniTextRtl]}
              numberOfLines={1}>
              {t('dailyPlay')}
            </Text>
          </View>
        ) : null}
      </GHPressable>
      {showInfo ? (
        <GHPressable
          onPress={onPressDailyInfo}
          disabled={!onPressDailyInfo}
          accessibilityRole="button"
          accessibilityLabel={t('infoDailyTitle')}
          style={({ pressed }) => [
            styles.dailyMini,
            {
              paddingVertical: padV,
              paddingHorizontal: padH,
              borderRadius: radius,
            },
            infoPending ? styles.dailyMiniHighlight : styles.dailyMiniDone,
            pressed && onPressDailyInfo ? { opacity: 0.88 } : null,
          ]}>
          <FontAwesome
            name="newspaper-o"
            size={iconSz}
            color={infoPending ? homeShell.greenDark : brand.textMuted}
            style={styles.dailyMiniIcon}
          />
          <Text
            style={[styles.dailyMiniTitle, { fontSize: titleFs, lineHeight: Math.round(titleFs * 1.22) }]}
            numberOfLines={2}>
            {t('infoDailyTitle')}
          </Text>
          {infoPending ? (
            <View style={styles.dailyMiniBadge}>
              <Text style={[styles.dailyMiniBadgeTxt, { fontSize: badgeFs }]}>{t('dailyRead')}</Text>
            </View>
          ) : (
            <Text style={[styles.dailyMiniHint, { fontSize: badgeFs }]}>{t('dailyReadDone')}</Text>
          )}
        </GHPressable>
      ) : null}
      {showOrientation1Bac ? (
        <GHPressable
          onPress={onPressOrientation1Bac}
          disabled={!onPressOrientation1Bac || orientationLocked}
          accessibilityRole="button"
          accessibilityState={{ disabled: orientationLocked }}
          accessibilityLabel={
            orientationLocked && daily.orientation1BacUnlockLabel
              ? t('orientation1BacHomeLockedA11y').replace('{date}', daily.orientation1BacUnlockLabel)
              : t('orientation1BacHomeButton')
          }
          style={({ pressed }) => [
            styles.dailyMini,
            isRTL && styles.dailyMiniRtl,
            {
              paddingVertical: padV,
              paddingHorizontal: padH,
              borderRadius: radius,
            },
            orientationLocked ? styles.dailyMiniLocked : styles.dailyMiniHighlight,
            pressed && onPressOrientation1Bac && !orientationLocked ? { opacity: 0.88 } : null,
          ]}>
          {orientationLocked ? (
            <View
              style={[styles.dailyPlayedCheckBadgeBase, isRTL ? { left: 8 } : { right: 8 }]}
              pointerEvents="none">
              <FontAwesome name="lock" size={Math.max(16, iconSz - 1)} color={brand.textMuted} />
            </View>
          ) : null}
          <FontAwesome
            name="compass"
            size={iconSz}
            color={orientationLocked ? brand.textMuted : homeShell.blue}
            style={styles.dailyMiniIcon}
          />
          <Text
            style={[
              styles.dailyMiniTitle,
              { fontSize: titleFs, lineHeight: Math.round(titleFs * 1.22) },
              orientationLocked && styles.dailyMiniTitleMuted,
              isRTL && styles.dailyMiniTextRtl,
            ]}
            numberOfLines={2}>
            {t('orientation1BacHomeButton')}
          </Text>
          {orientationLocked && unlockHint ? (
            <Text
              style={[styles.dailyMiniHint, { fontSize: badgeFs }, isRTL && styles.dailyMiniTextRtl]}
              numberOfLines={2}>
              {unlockHint}
            </Text>
          ) : null}
        </GHPressable>
      ) : null}
    </View>
  );
}

function StackCardFace({
  card,
  accent,
  layout,
  shellLoading: _shellLoading = false,
  onOpenOrientationOverview,
  onPressOrientationContinue,
  onPressDailyGame,
  onPressDailyInfo,
  onPressOrientation1Bac,
  onPressPracticalLink,
  onOpenBacVerification,
  onOpenBacThresholds,
  bacThresholdsLocked = false,
  bacThresholdsLoading = false,
  cardH,
  uniformStack = false,
  bacStackPeek = false,
}: {
  card: HomeStackCard;
  accent: 'blue' | 'green';
  layout: StackCardLayout;
  shellLoading?: boolean;
  cardH: number;
  /** Carte bac sous la carte du dessus : hauteur au contenu, pas de flex vertical. */
  bacStackPeek?: boolean;
  onOpenOrientationOverview?: () => void;
  onPressOrientationContinue?: () => void;
  onPressDailyGame?: () => void;
  onPressDailyInfo?: () => void;
  onPressOrientation1Bac?: () => void;
  onPressPracticalLink?: (id: string) => void;
  onOpenBacVerification?: (channel: BacVerificationChannel) => void;
  onOpenBacThresholds?: () => void;
  bacThresholdsLocked?: boolean;
  bacThresholdsLoading?: boolean;
  /** Pile à hauteur fixe (carte bac) : pas de rétrécissement des cartes du dessous. */
  uniformStack?: boolean;
}) {
  const { t, isRTL } = useLocale();
  const bacLoading = card.bacResults != null && card.bacResultsLoading === true;
  const thresholdsBtnLoading = bacThresholdsLoading && !bacLoading;
  const bacLive =
    card.bacResults != null && !bacLoading && hasAnyBacResultPublished(card.bacResults);
  const stripe = card.bacResults
    ? bacLive
      ? homeShell.green
      : '#D97706'
    : accent === 'green'
      ? homeShell.greenDark
      : homeShell.blue;
  const practicalDef = card.practicalLinkId ? getPracticalLinkDef(card.practicalLinkId) : undefined;
  const progress = card.orientationProgress;
  const planLoading = progress?.loading === true;
  const planCompletion = card.planParcoursCompletion ?? EMPTY_PLAN_PARCOURS_COMPLETION;
  const orientationState = progress && !planLoading
    ? resolvePlanParcoursState(planCompletion, card.remainingOrientationTasks)
    : null;
  const nameLines = progress ? 2 : practicalDef ? 2 : card.bacResults ? 1 : 3;
  /** 1re carte : progression + actions quotidiennes — répartition verticale homogène. */
  const packedOrientationDaily = progress != null && card.dailyActions != null;
  const iconHeroSz = Math.max(28, Math.round(layout.iconSize * 2.35));

  const cardInnerSize = { height: cardH, minHeight: cardH };

  if (card.bacResults) {
    const bacMain = !bacStackPeek;
    const bacBody = bacLoading ? (
      <BacResultsStackCardSkeleton
        layout={layout}
        isRTL={isRTL}
        showThresholdsCta
        hideThresholdsCta={!bacMain}
      />
    ) : (
      <BacResultsStackCardContent
        config={card.bacResults}
        layout={layout}
        isRTL={isRTL}
        onOpenVerification={onOpenBacVerification}
        onOpenThresholds={onOpenBacThresholds}
        thresholdsLocked={bacThresholdsLocked}
        thresholdsLoading={thresholdsBtnLoading}
        hideThresholdsCta={!bacMain}
      />
    );

    return (
      <View
        style={[
          styles.cardInner,
          styles.cardInnerBacFill,
          cardInnerSize,
          {
            paddingTop: layout.pad,
            paddingBottom: layout.pad,
            paddingEnd: layout.pad,
            paddingStart: layout.pad + layout.padStripe,
          },
        ]}>
        <View style={[styles.stripe, { backgroundColor: stripe }]} />
        <View
          style={[
            styles.cardColumn,
            styles.cardColumnBac,
            isRTL && styles.cardColumnRtl,
          ]}>
          <Text
            style={[
              styles.eyebrow,
              styles.bacEyebrow,
              { fontSize: layout.eyebrow },
              isRTL && styles.orientationLblRtl,
            ]}
            numberOfLines={1}>
            {t('bacCardEyebrow')}
          </Text>
          {bacMain ? (
            <ScrollView
              style={styles.bacScroll}
              contentContainerStyle={[
                styles.bacScrollContent,
                isRTL && styles.bacScrollContentRtl,
              ]}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              bounces={false}
              keyboardShouldPersistTaps="handled">
              {bacBody}
            </ScrollView>
          ) : (
            bacBody
          )}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.cardInner,
        uniformStack && styles.cardInnerStack,
        {
          ...cardInnerSize,
          paddingTop: layout.pad,
          paddingBottom: layout.pad,
          paddingEnd: layout.pad,
          paddingStart: layout.pad + layout.padStripe,
        },
      ]}>
      <View style={[styles.stripe, { backgroundColor: stripe }]} />
      <View style={[styles.cardColumn, uniformStack && styles.cardColumnStackFill]}>
        <View style={styles.cardTop} collapsable={false}>
          {practicalDef ? (
            <>
              <Text style={[styles.eyebrow, { fontSize: layout.eyebrow }]} numberOfLines={1}>
                {card.eyebrow ?? t('practicalCardEyebrow')}
              </Text>
              <Text
                style={[
                  styles.packName,
                  {
                    marginTop: layout.packLabelMT,
                    fontSize: layout.packName,
                    lineHeight: layout.packLh,
                  },
                ]}
                numberOfLines={nameLines}>
                {t(practicalDef.labelKey)}
              </Text>
              <Text
                style={[
                  styles.practicalLinkDesc,
                  isRTL && styles.orientationLblRtl,
                  {
                    marginTop: layout.packNameMT,
                    fontSize: layout.validityValue,
                    lineHeight: layout.validityLh,
                  },
                ]}
                numberOfLines={4}>
                {t(practicalDef.descriptionKey)}
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.eyebrow, { fontSize: layout.eyebrow }]} numberOfLines={1}>
                {card.eyebrow ?? ''}
              </Text>
              {card.packLabel ? (
                <Text
                  style={[styles.packLabel, { marginTop: layout.packLabelMT, fontSize: layout.packLabel }]}
                  numberOfLines={1}>
                  {card.packLabel}
                </Text>
              ) : null}
              <Text
                style={[
                  styles.packName,
                  {
                    marginTop: card.packLabel ? layout.packNameMT : layout.packLabelMT,
                    fontSize: layout.packName,
                    lineHeight: layout.packLh,
                  },
                ]}
                numberOfLines={nameLines}>
                {card.packName ?? ''}
              </Text>
              {card.academicPackLine ? (
                <Text
                  style={[
                    styles.academicPackLine,
                    isRTL && styles.orientationLblRtl,
                    { marginTop: layout.packNameMT, fontSize: layout.validityValue, lineHeight: layout.validityLh },
                  ]}
                  numberOfLines={2}>
                  {card.academicPackLine}
                </Text>
              ) : null}
            </>
          )}
        </View>
        {packedOrientationDaily ? (
          <View
            style={[
              styles.firstCardStackFill,
              { marginTop: layout.validityMT, gap: layout.validityMT },
            ]}>
            <View style={styles.firstCardStackHalf}>
              <GHPressable
                onPress={onOpenOrientationOverview}
                disabled={!onOpenOrientationOverview}
                accessibilityRole="button"
                accessibilityLabel={t('orientationTasksA11y')}
                style={({ pressed }) => [
                  styles.orientationBlock,
                  styles.orientationBlockPacked,
                  {
                    padding: layout.boxPad,
                    borderRadius: layout.boxRadius,
                  },
                  pressed && onOpenOrientationOverview ? { opacity: 0.92 } : null,
                ]}>
                <View style={[styles.orientationRow, isRTL && styles.orientationRowRtl]}>
                  <Text
                    style={[styles.orientationLabel, isRTL && styles.orientationLblRtl, { fontSize: layout.validityLabel }]}
                    numberOfLines={1}>
                    {progress!.label ?? t('orientationProgressLabel')}
                  </Text>
                  {planLoading ? (
                    <OrientationPercentTextSkeleton />
                  ) : (
                    <Text style={[styles.orientationPercent, isRTL && styles.orientationPctRtl, { fontSize: layout.packLabel }]}>
                      {`${orientationState?.completedCount ?? 0}/${PLAN_PARCOURS_STEP_COUNT} · ${orientationState?.percent ?? Math.round(progress!.percent)} %`}
                    </Text>
                  )}
                </View>
                <OrientationParcoursProgress
                  completion={planCompletion}
                  tasks={card.remainingOrientationTasks}
                  layout={layout}
                  compact
                  loading={planLoading}
                />
                {onOpenOrientationOverview ? (
                  <Text
                    style={[
                      styles.orientationTapHint,
                      isRTL && styles.orientationTapHintRtl,
                      { marginTop: layout.hintMT, fontSize: layout.hint },
                    ]}>
                    {t('orientationTapHint')}
                  </Text>
                ) : null}
              </GHPressable>
            </View>
            <View style={styles.firstCardStackHalf}>
              <View style={[styles.firstCardDailyStretch, isRTL && styles.firstCardDailyStretchRtl]}>
                <DailyActionsBlock
                  daily={card.dailyActions!}
                  layout={layout}
                  onPressDailyGame={onPressDailyGame}
                  onPressDailyInfo={onPressDailyInfo}
                  onPressOrientation1Bac={onPressOrientation1Bac}
                />
              </View>
            </View>
          </View>
        ) : practicalDef ? (
          <GHPressable
            onPress={() => onPressPracticalLink?.(practicalDef.id)}
            disabled={!onPressPracticalLink}
            accessibilityRole="button"
            accessibilityLabel={`${t(practicalDef.labelKey)}. ${t(practicalDef.descriptionKey)} — ${t('practicalCardA11y')}`}
            style={({ pressed }) => [
              styles.practicalLinkBox,
              {
                marginTop: layout.validityMT,
                padding: layout.boxPad,
                borderRadius: layout.boxRadius,
                flex: 1,
                minHeight: Math.max(132, Math.round(layout.cardH * 0.36)),
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: 'rgba(15, 23, 42, 0.08)',
              },
              pressed && onPressPracticalLink ? { opacity: 0.92 } : null,
            ]}>
            <View
              style={[
                styles.practicalLinkIconWrap,
                {
                  backgroundColor: withAlpha(practicalDef.accent, 0.14),
                  width: Math.max(68, iconHeroSz + 28),
                  height: Math.max(68, iconHeroSz + 28),
                  borderRadius: Math.max(34, (iconHeroSz + 28) / 2),
                },
              ]}>
              <FontAwesome name={practicalDef.icon} size={iconHeroSz} color={practicalDef.accent} />
            </View>
            <Text
              style={[
                styles.practicalLinkTap,
                isRTL && styles.orientationTapHintRtl,
                { marginTop: layout.hintMT, fontSize: layout.hint },
              ]}>
              {t('practicalCardTap')}
            </Text>
          </GHPressable>
        ) : progress != null ? (
          <GHPressable
            onPress={onOpenOrientationOverview}
            disabled={!onOpenOrientationOverview}
            accessibilityRole="button"
            accessibilityLabel={t('orientationTasksA11y')}
            style={({ pressed }) => [
              styles.orientationBlock,
              {
                marginTop: layout.validityMT,
                padding: layout.boxPad,
                borderRadius: layout.boxRadius,
              },
              pressed && onOpenOrientationOverview ? { opacity: 0.92 } : null,
            ]}>
            <View style={[styles.orientationRow, isRTL && styles.orientationRowRtl]}>
              <Text
                style={[styles.orientationLabel, isRTL && styles.orientationLblRtl, { fontSize: layout.validityLabel }]}
                numberOfLines={1}>
                {progress.label ?? t('orientationProgressLabel')}
              </Text>
              {planLoading ? (
                <OrientationPercentTextSkeleton />
              ) : (
                <Text style={[styles.orientationPercent, isRTL && styles.orientationPctRtl, { fontSize: layout.packLabel }]}>
                  {`${orientationState?.completedCount ?? 0}/${PLAN_PARCOURS_STEP_COUNT} · ${orientationState?.percent ?? Math.round(progress.percent)} %`}
                </Text>
              )}
            </View>
            <OrientationParcoursProgress
              completion={planCompletion}
              tasks={card.remainingOrientationTasks}
              layout={layout}
              loading={planLoading}
            />
            {onOpenOrientationOverview ? (
              <Text
                style={[
                  styles.orientationTapHint,
                  isRTL && styles.orientationTapHintRtl,
                  { marginTop: layout.hintMT, fontSize: layout.hint },
                ]}>
                {t('orientationTapHint')}
              </Text>
            ) : null}
          </GHPressable>
        ) : card.dailyActions != null ? (
          <View style={[styles.dailyActionsColumn, { marginTop: layout.validityMT }]}>
            <DailyActionsBlock
              daily={card.dailyActions}
              layout={layout}
              onPressDailyGame={onPressDailyGame}
              onPressDailyInfo={onPressDailyInfo}
              onPressOrientation1Bac={onPressOrientation1Bac}
            />
          </View>
        ) : card.validityLabel != null || card.validityValue != null ? (
          <View
            style={[
              styles.validityBox,
              {
                marginTop: layout.validityMT,
                padding: layout.boxPad,
                borderRadius: layout.boxRadius,
              },
            ]}>
            <FontAwesome
              name="calendar"
              size={layout.iconSize}
              color={brand.primary}
              style={[styles.calIcon, { marginEnd: layout.calMR, marginTop: layout.calMT }]}
            />
            <View style={styles.validityText}>
              {card.validityLabel ? (
                <Text style={[styles.validityLabel, { fontSize: layout.validityLabel }]} numberOfLines={1}>
                  {card.validityLabel}
                </Text>
              ) : null}
              {card.validityValue ? (
                <Text
                  style={[
                    styles.validityValue,
                    {
                      marginTop: card.validityLabel ? layout.validityValueMT : 0,
                      fontSize: layout.validityValue,
                      lineHeight: layout.validityLh,
                    },
                  ]}
                  numberOfLines={2}>
                  {card.validityValue}
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}
        <View
          style={[
            styles.cardFlexFill,
            (card.dailyActions != null || practicalDef) && styles.cardFlexFillWhenDaily,
          ]}
        />
        {practicalDef ? (
          <View
            style={[
              styles.hintSpacer,
              {
                marginTop: layout.hintMT,
                minHeight: spacing.sm,
              },
            ]}
          />
        ) : card.hint ? (
          <Text
            style={[
              styles.hint,
              {
                marginTop: layout.hintMT,
                fontSize: layout.hint,
                lineHeight: layout.hintLh,
                minHeight: layout.hintMinH,
              },
            ]}
            numberOfLines={2}>
            {card.hint}
          </Text>
        ) : (
          <View
            style={[
              styles.hintSpacer,
              {
                marginTop: layout.hintMT,
                minHeight: packedOrientationDaily ? spacing.sm : layout.hintMinH,
              },
            ]}
          />
        )}
      </View>
    </View>
  );
}

function DeckLayer({
  stackPos,
  card,
  accent,
  width,
  layout,
  translateX,
  translateY,
  exitAnimating,
  revealTop,
  isTop,
  shellLoading = false,
  onOpenOrientationOverview,
  onPressOrientationContinue,
  onPressDailyGame,
  onPressDailyInfo,
  onPressOrientation1Bac,
  onPressPracticalLink,
  onOpenBacVerification,
  onOpenBacThresholds,
  bacThresholdsLocked = false,
  bacThresholdsLoading = false,
  cardH,
  uniformStack = false,
  bacStackPeek = false,
}: {
  stackPos: 0 | 1 | 2;
  card: HomeStackCard;
  accent: 'blue' | 'green';
  width: number;
  layout: StackCardLayout;
  cardH: number;
  bacStackPeek?: boolean;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  exitAnimating: SharedValue<number>;
  /** 0 = carte du dessus masquée (blanc), 1 = contenu visible — après fin du swipe. */
  revealTop: SharedValue<number>;
  isTop: boolean;
  shellLoading?: boolean;
  onOpenOrientationOverview?: () => void;
  onPressOrientationContinue?: () => void;
  onPressDailyGame?: () => void;
  onPressDailyInfo?: () => void;
  onPressOrientation1Bac?: () => void;
  onPressPracticalLink?: (id: string) => void;
  onOpenBacVerification?: (channel: BacVerificationChannel) => void;
  onOpenBacThresholds?: () => void;
  bacThresholdsLocked?: boolean;
  bacThresholdsLoading?: boolean;
  uniformStack?: boolean;
}) {
  const baseY = stackPos * 10;
  const clipSized = { height: cardH, minHeight: cardH, width: '100%' as const };
  const baseScale = uniformStack ? 1 : 1 - stackPos * 0.045;
  /** Carte du dessus au-dessus des autres */
  const zIndex = stackPos === 0 ? 100 : stackPos === 1 ? 50 : 25;

  const topStyle = useAnimatedStyle(() => {
    'worklet';
    const tx = translateX.value;
    const ty = translateY.value * 0.28;
    const rot = interpolate(tx, [-width * 0.65, 0, width * 0.65], [-14, 0, 14], Extrapolation.CLAMP);
    return {
      zIndex: zIndex,
      opacity: 1,
      transform: [
        { translateY: baseY },
        { translateX: tx },
        { translateY: ty },
        { rotateZ: `${rot}deg` },
        { scale: baseScale },
      ],
    };
  }, [baseY, baseScale, zIndex, width, translateX, translateY]);

  /** Pile fixe ; la carte du milieu grossit pendant la sortie de celle du dessus. */
  const underStyle = useAnimatedStyle(() => {
    'worklet';
    const promote =
      stackPos === 1
        ? interpolate(exitAnimating.value, [0, 1], [0, 1], Extrapolation.CLAMP)
        : 0;
    const scale = baseScale + (1 - baseScale) * promote;
    const translateY = baseY - promote * 6;
    return {
      zIndex: zIndex,
      transform: [{ translateY }, { scale }],
    };
  }, [baseY, baseScale, zIndex, stackPos, exitAnimating]);

  /**
   * Voile blanc iOS / Android :
   * — carte suivante (milieu) : pendant drag non terminé + animation de sortie ;
   * — carte principale : brièvement blanche puis fondu contenu quand le swipe est terminé.
   */
  const transitionWhiteMaskStyle = useAnimatedStyle(() => {
    'worklet';
    let o = 0;
    if (stackPos === 1) {
      const dragCover = interpolate(
        Math.abs(translateX.value),
        [0, 6],
        [0, 1],
        Extrapolation.CLAMP,
      );
      o = Math.max(dragCover, exitAnimating.value);
    } else if (stackPos === 0) {
      o = interpolate(revealTop.value, [0, 1], [1, 0], Extrapolation.CLAMP);
    }
    return {
      opacity: o,
      backgroundColor: brand.white,
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      borderRadius: radius.xl,
      zIndex: 20,
    };
  }, [stackPos, translateX, exitAnimating, revealTop]);

  const style = isTop ? topStyle : underStyle;
  const bacLive =
    card.bacResults != null &&
    card.bacResultsLoading !== true &&
    hasAnyBacResultPublished(card.bacResults);

  return (
    <Animated.View
      pointerEvents={isTop ? 'auto' : 'none'}
      style={[styles.stackLayer, { width }, style]}
      collapsable={false}>
        <View style={[styles.cardElevate, clipSized]}>
        <View style={[styles.cardClip, clipSized]}>
          <StackCardFace
            card={card}
            accent={accent}
            layout={layout}
            cardH={cardH}
            shellLoading={shellLoading}
            onOpenOrientationOverview={onOpenOrientationOverview}
            onPressOrientationContinue={onPressOrientationContinue}
            onPressDailyGame={onPressDailyGame}
            onPressDailyInfo={onPressDailyInfo}
            onPressOrientation1Bac={onPressOrientation1Bac}
            onPressPracticalLink={onPressPracticalLink}
            onOpenBacVerification={onOpenBacVerification}
            onOpenBacThresholds={onOpenBacThresholds}
            bacThresholdsLocked={bacThresholdsLocked}
            bacThresholdsLoading={bacThresholdsLoading}
            uniformStack={uniformStack}
            bacStackPeek={bacStackPeek}
          />
          <Animated.View pointerEvents="none" style={transitionWhiteMaskStyle} />
        </View>
      </View>
    </Animated.View>
  );
}

export function HomeStackedPackCards({
  cards,
  width,
  onPressDailyGame,
  onPressDailyInfo,
  onPressOrientation1Bac,
  bacThresholdsLocked = false,
  bacThresholdsLoading = false,
  onPressPracticalLink,
  onOpenOrientationOverview: onOpenOrientationOverviewProp,
  planParcoursLoading = false,
  contentLoading = false,
  planParcoursNavAuth,
  tawjihPlusGate,
  onOpenBacVerification,
  onOpenBacThresholds,
}: Props) {
  const { t, isRTL } = useLocale();
  const n = cards.length;
  const { width: screenW, height: windowH } = useWindowDimensions();
  const layout = useMemo(() => buildStackCardLayout(width, windowH), [width, windowH]);
  const hasBacCard = useMemo(() => cards.some((c) => c.bacResults != null), [cards]);

  const screenWShared = useSharedValue(screenW);
  useEffect(() => {
    screenWShared.value = screenW;
  }, [screenW, screenWShared]);
  const [headIndex, setHeadIndex] = useState(0);

  const stackCardH = useMemo(
    () => getHomeStackCardHeight(layout, hasBacCard, isRTL),
    [layout, hasBacCard, isRTL],
  );
  const topCardH = stackCardH;
  /** Toutes les cartes de la pile à la même hauteur lorsque le bac est dans le deck. */
  const uniformStack = hasBacCard;
  const stackPeekPad = n > 1 ? (Math.min(3, n) - 1) * 10 : 0;
  const stackArenaTail = 8;
  const stackOuterH = topCardH + stackPeekPad + stackArenaTail;
  const openOrientationOverview = useCallback(
    (title: string, completion: PlanParcoursCompletion, tasks?: OrientationParcoursTask[]) => {
      onOpenOrientationOverviewProp?.({ title, completion, tasks });
    },
    [onOpenOrientationOverviewProp],
  );

  const handlePressOrientationContinue = useCallback(
    (completion: PlanParcoursCompletion, tasks?: OrientationParcoursTask[]) => {
      const state = resolvePlanParcoursState(completion, tasks);
      navigatePlanParcoursStep(state.currentStepKey, planParcoursNavAuth, tawjihPlusGate);
    },
    [planParcoursNavAuth, tawjihPlusGate],
  );

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const exitAnimating = useSharedValue(0);
  /** 1 = contenu carte principale visible ; 0 = voile blanc jusqu’à fin du swipe. */
  const revealTop = useSharedValue(1);
  const threshold = width * 0.14;

  const bumpNextState = useCallback(() => {
    setHeadIndex((h) => (h + 1) % n);
  }, [n]);

  const bumpPrevState = useCallback(() => {
    setHeadIndex((h) => (h - 1 + n) % n);
  }, [n]);

  /**
   * Bump d’index puis reset des transforms après le commit React (un seul rAF).
   * Ne pas reset translateX avant le bump : l’ancienne carte du dessus réapparaîtrait au centre.
   */
  const finishSwipeTransition = useCallback(
    (bump: () => void) => {
      bump();
      revealTop.value = 0;
      requestAnimationFrame(() => {
        translateX.value = 0;
        translateY.value = 0;
        exitAnimating.value = 0;
        revealTop.value = withTiming(1, { duration: REVEAL_MS, easing: REVEAL_EASING });
      });
    },
    [revealTop, translateX, translateY, exitAnimating],
  );

  const bumpNextThenResetTransforms = useCallback(() => {
    finishSwipeTransition(bumpNextState);
  }, [finishSwipeTransition, bumpNextState]);

  const bumpPrevThenResetTransforms = useCallback(() => {
    finishSwipeTransition(bumpPrevState);
  }, [finishSwipeTransition, bumpPrevState]);

  const panGesture = useMemo(() => {
    if (n <= 1) {
      return Gesture.Pan().enabled(false);
    }
    return Gesture.Pan()
      .activeOffsetX([-10, 10])
      .failOffsetY([-28, 28])
      .onUpdate((e) => {
        'worklet';
        translateX.value = e.translationX * DRAG_DAMPING;
        translateY.value = e.translationY * DRAG_DAMPING;
      })
      .onEnd((e) => {
        'worklet';
        const tx = translateX.value;
        const vx = e.velocityX;
        /** LTR : swipe gauche → suivant ; RTL : swipe droite → suivant (parcours droite → gauche). */
        const goNext = isRTL ? tx > threshold || vx > SWIPE_V : tx < -threshold || vx < -SWIPE_V;
        const goPrev = isRTL ? tx < -threshold || vx < -SWIPE_V : tx > threshold || vx > SWIPE_V;

        if (goNext) {
          exitAnimating.value = 1;
          const target = isRTL ? screenWShared.value * 1.12 : -screenWShared.value * 1.12;
          translateX.value = withTiming(
            target,
            { duration: EXIT_MS, easing: EXIT_EASING },
            (finished) => {
              'worklet';
              if (!finished) {
                exitAnimating.value = 0;
                return;
              }
              runOnJS(bumpNextThenResetTransforms)();
            }
          );
        } else if (goPrev) {
          exitAnimating.value = 1;
          const target = isRTL ? -screenWShared.value * 1.12 : screenWShared.value * 1.12;
          translateX.value = withTiming(
            target,
            { duration: EXIT_MS, easing: EXIT_EASING },
            (finished) => {
              'worklet';
              if (!finished) {
                exitAnimating.value = 0;
                return;
              }
              runOnJS(bumpPrevThenResetTransforms)();
            }
          );
        } else {
          exitAnimating.value = 0;
          revealTop.value = 1;
          translateX.value = withSpring(0, SPRING_BACK);
          translateY.value = withSpring(0, SPRING_BACK);
        }
      });
  }, [
    n,
    screenWShared,
    threshold,
    translateX,
    translateY,
    exitAnimating,
    revealTop,
    bumpNextThenResetTransforms,
    bumpPrevThenResetTransforms,
    isRTL,
  ]);

  if (n === 0) {
    return null;
  }

  const depth = Math.min(3, n);
  const layers: { stackPos: 0 | 1 | 2; idx: number }[] = [];
  for (let s = depth - 1; s >= 0; s--) {
    const stackPos = s as 0 | 1 | 2;
    layers.push({ stackPos, idx: (headIndex + stackPos) % n });
  }

  return (
    <View style={styles.wrap}>
      <View
        style={[styles.stackArena, { width, height: stackOuterH }]}
        collapsable={false}>
        {layers.map(({ stackPos, idx }) => {
          const card = cards[idx];
          const isTop = stackPos === 0;
          const accent: 'blue' | 'green' = idx % 2 === 0 ? 'blue' : 'green';
          const cardCompletion = card.planParcoursCompletion ?? EMPTY_PLAN_PARCOURS_COMPLETION;
          const orientationOverviewHandler =
            isTop && card.orientationProgress != null
              ? () =>
                  openOrientationOverview(
                    card.packName ?? '',
                    cardCompletion,
                    card.remainingOrientationTasks,
                  )
              : undefined;
          const orientationContinueHandler =
            isTop && card.orientationProgress != null
              ? () => handlePressOrientationContinue(cardCompletion, card.remainingOrientationTasks)
              : undefined;
          const dailyGameHandler =
            isTop && card.dailyActions != null ? onPressDailyGame : undefined;
          const dailyInfoHandler =
            isTop && card.dailyActions != null && card.dailyActions.includeDailyInfo === true
              ? onPressDailyInfo
              : undefined;
          const dailyOrientation1BacHandler =
            isTop && card.dailyActions?.showOrientation1Bac ? onPressOrientation1Bac : undefined;
          const shellLoading = contentLoading && Boolean(card.practicalLinkId);
          const bacVerificationHandler =
            isTop && card.bacResults != null && !card.bacResultsLoading
              ? onOpenBacVerification
              : undefined;
          const bacThresholdsHandler =
            isTop && card.bacResults != null && !card.bacResultsLoading
              ? onOpenBacThresholds
              : undefined;
          const bacStackPeek = card.bacResults != null && !isTop;
          const layerCardH = stackCardH;

          return isTop ? (
            <GestureDetector key={`deck-top-${card.id}`} gesture={panGesture}>
              <DeckLayer
                stackPos={stackPos}
                card={card}
                accent={accent}
                width={width}
                layout={layout}
                translateX={translateX}
                translateY={translateY}
                exitAnimating={exitAnimating}
                revealTop={revealTop}
                isTop
                shellLoading={shellLoading}
                onOpenOrientationOverview={orientationOverviewHandler}
                onPressOrientationContinue={orientationContinueHandler}
                onPressDailyGame={dailyGameHandler}
                onPressDailyInfo={dailyInfoHandler}
                onPressOrientation1Bac={dailyOrientation1BacHandler}
                onPressPracticalLink={onPressPracticalLink}
                onOpenBacVerification={bacVerificationHandler}
                onOpenBacThresholds={bacThresholdsHandler}
                bacThresholdsLocked={bacThresholdsLocked}
                bacThresholdsLoading={bacThresholdsLoading}
                cardH={layerCardH}
                uniformStack={uniformStack}
                bacStackPeek={bacStackPeek}
              />
            </GestureDetector>
          ) : (
            <DeckLayer
              key={`deck-${stackPos}-${card.id}`}
              stackPos={stackPos}
              card={card}
              accent={accent}
              width={width}
              layout={layout}
              cardH={layerCardH}
              uniformStack={uniformStack}
              bacStackPeek={bacStackPeek}
              translateX={translateX}
              translateY={translateY}
              exitAnimating={exitAnimating}
              revealTop={revealTop}
              isTop={false}
              shellLoading={shellLoading}
              onPressPracticalLink={onPressPracticalLink}
              onOpenBacVerification={bacVerificationHandler}
              onOpenBacThresholds={bacThresholdsHandler}
              bacThresholdsLocked={bacThresholdsLocked}
              bacThresholdsLoading={bacThresholdsLoading}
            />
          );
        })}
      </View>
      <Text style={[styles.swipeHint, isRTL && styles.swipeHintRtl]}>{t('swipeCardsHint')}</Text>
      <PaginationDots total={n} activeIndex={headIndex} onDark={false} compact rtl={isRTL} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  stackArena: {
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  stackLayer: {
    position: 'absolute',
    left: 0,
    top: 4,
    alignItems: 'center',
  },
  /** Ombre sur le conteneur externe — `overflow: hidden` sur une seule couche interne (iOS coupe l’ombre sinon). */
  cardElevate: {
    width: '100%',
    borderRadius: radius.xl,
    backgroundColor: 'transparent',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 14,
  },
  cardClip: {
    width: '100%',
    borderRadius: radius.xl,
    backgroundColor: homeShell.card,
    overflow: 'hidden',
  },
  cardInner: {
    position: 'relative',
  },
  cardColumn: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    minHeight: 0,
    zIndex: 1,
  },
  cardColumnStackFill: {
    flex: 1,
    minHeight: 0,
  },
  cardInnerBacFill: {
    flexDirection: 'column',
  },
  cardColumnBac: {
    flex: 1,
    flexGrow: 1,
    minHeight: 0,
    width: '100%',
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  bacEyebrow: {
    flexShrink: 0,
  },
  bacScroll: {
    flex: 1,
    minHeight: 0,
    width: '100%',
  },
  bacScrollContent: {
    flexGrow: 0,
    paddingBottom: 6,
  },
  bacScrollContentRtl: {
    paddingBottom: 10,
  },
  cardColumnRtl: {
    width: '100%',
    alignItems: 'stretch',
  },
  /** Ne pas rétrécir : sinon sur web le bloc titre peut passer à hauteur 0 (texte « invisible »). */
  cardTop: {
    flexGrow: 0,
    flexShrink: 0,
  },
  /** Pousse le hint vers le bas sans space-between (évite l’écrasement du header). */
  cardFlexFill: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: spacing.xs,
    minWidth: 0,
  },
  /** Zone jeu / info : elle prend la hauteur, inutile de réserver du flex vide au milieu. */
  cardFlexFillWhenDaily: {
    flexGrow: 0,
    flexShrink: 0,
    minHeight: 0,
  },
  /** 1re carte : zone sous le titre = moitié progression / moitié jeu+info (hauteur homogène). */
  firstCardStackFill: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    flexDirection: 'column',
  },
  firstCardStackHalf: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    justifyContent: 'center',
  },
  firstCardDailyStretch: {
    flex: 1,
    minHeight: 0,
    width: '100%',
  },
  firstCardDailyStretchRtl: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orientationBlockPacked: {
    alignSelf: 'stretch',
    width: '100%',
  },
  /** Colonne extensible pour agrandir les boutons quotidiens jusqu’au hint. */
  dailyActionsColumn: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    width: '100%',
    justifyContent: 'center',
  },
  stripe: {
    position: 'absolute',
    start: 0,
    top: 0,
    bottom: 0,
    width: 5,
    borderTopStartRadius: radius.xl,
    borderBottomStartRadius: radius.xl,
  },
  eyebrow: {
    color: brand.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  packLabel: {
    color: brand.textSecondary,
    fontWeight: '600',
  },
  academicPackLine: {
    color: brand.textSecondary,
    fontWeight: '700',
  },
  packName: {
    color: brand.text,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  practicalLinkBox: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    backgroundColor: brand.backgroundSoft,
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  },
  practicalLinkIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  practicalLinkTap: {
    color: brand.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  practicalLinkDesc: {
    color: brand.textSecondary,
    fontWeight: '600',
  },
  validityBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: brand.backgroundSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    flexGrow: 0,
    flexShrink: 0,
  },
  calIcon: {},
  validityText: {
    flex: 1,
  },
  validityLabel: {
    color: brand.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  validityValue: {
    color: brand.text,
    fontWeight: '800',
  },
  /** Deux boutons côte à côte : occupe la hauteur disponible (colonne parente flex). */
  dailyActionsWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    alignSelf: 'stretch',
    gap: 8,
    width: '100%',
    minHeight: 0,
  },
  /** Une seule tuile (défi) : pleine largeur, même hauteur que la rangée à deux tuiles. */
  dailyActionsWrapGameOnly: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dailyActionsWrapRtl: {
    direction: 'rtl',
  },
  dailyActionsWrapGameOnlyRtl: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dailyMini: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyMiniRtl: {
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  dailyMiniTextRtl: {
    textAlign: 'center',
    writingDirection: 'rtl',
    width: '100%',
  },
  dailyMiniFullWidth: {
    flexGrow: 1,
    maxWidth: '100%',
  },
  dailyMiniIcon: {
    marginBottom: 6,
  },
  dailyMiniTitle: {
    color: brand.text,
    fontWeight: '800',
    letterSpacing: -0.15,
    textAlign: 'center',
    width: '100%',
  },
  dailyMiniLoading: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    backgroundColor: brand.backgroundSoft,
    opacity: 0.92,
  },
  dailyMiniHighlight: {
    borderWidth: 1.5,
    borderColor: homeShell.greenDark,
    backgroundColor: homeShell.greenAlpha11,
    shadowColor: homeShell.green,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 2,
  },
  dailyMiniDone: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    backgroundColor: brand.backgroundSoft,
  },
  /** Défi déjà joué : bouton grisé ; la coche verte est en pastille (voir dailyPlayedCheckBadge). */
  dailyMiniGrayPlayed: {
    position: 'relative',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.65)',
    backgroundColor: 'rgba(241, 245, 249, 0.95)',
  },
  dailyMiniLocked: {
    position: 'relative',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.55)',
    backgroundColor: 'rgba(241, 245, 249, 0.92)',
    opacity: 0.92,
  },
  dailyPlayedCheckBadgeBase: {
    position: 'absolute',
    top: 6,
    zIndex: 2,
  },
  dailyMiniTitleMuted: {
    color: brand.textMuted,
  },
  dailyStreakLine: {
    marginTop: 4,
    fontWeight: '700',
    color: homeShell.greenDark,
    textAlign: 'center',
    width: '100%',
  },
  dailyStreakLinePlayed: {
    marginTop: 4,
    fontWeight: '700',
    color: brand.textSecondary,
    textAlign: 'center',
    width: '100%',
  },
  dailyMiniBadge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: homeShell.greenAlpha18,
  },
  dailyMiniBadgeTxt: {
    color: homeShell.greenDark,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dailyMiniHint: {
    marginTop: 6,
    color: brand.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  hint: {
    color: brand.textSecondary,
    fontWeight: '500',
  },
  hintSpacer: {},
  swipeHint: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    textAlign: 'center',
    color: brand.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  swipeHintRtl: {
    writingDirection: 'rtl',
  },
  orientationBlock: {
    backgroundColor: brand.backgroundSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    flexShrink: 0,
  },
  orientationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  orientationRowRtl: {
    flexDirection: 'row-reverse',
  },
  orientationLabel: {
    flex: 1,
    color: brand.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.35,
  },
  orientationLblRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  orientationPercent: {
    color: brand.primary,
    fontWeight: '800',
  },
  orientationPctRtl: {
    writingDirection: 'ltr',
  },
  orientationProgressWrap: {
    marginTop: 6,
    width: '100%',
  },
  orientationProgressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: ORIENTATION_PROGRESS_TRACK_BG,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  /** RTL : remplissage depuis la droite vers la gauche. */
  orientationProgressTrackRtl: {
    flexDirection: 'row-reverse',
  },
  orientationProgressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: homeShell.green,
  },
  orientationStepsWrap: {
    marginTop: 6,
    width: '100%',
  },
  orientationStepsEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minHeight: 22,
  },
  orientationStepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  orientationStepsRowRtl: {
    flexDirection: 'row-reverse',
  },
  orientationStepLine: {
    flex: 1,
    height: 2,
    minWidth: 1,
    borderRadius: 2,
    alignSelf: 'center',
  },
  orientationStepBubbleCol: {
    alignItems: 'center',
  },
  orientationStepBubble: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  orientationStepBubbleDone: {
    backgroundColor: homeShell.green,
    borderColor: homeShell.green,
  },
  orientationStepBubbleCurrent: {
    backgroundColor: brand.white,
    borderWidth: 2,
    borderColor: homeShell.green,
  },
  orientationStepBubbleTodo: {
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: ORIENTATION_STEP_LINE_TODO,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  orientationStepDot: {
    marginTop: 4,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  orientationStepDotDone: {
    backgroundColor: homeShell.green,
  },
  orientationStepDotCurrent: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: homeShell.green,
    backgroundColor: brand.white,
  },
  orientationStepDotTodo: {
    backgroundColor: brand.white,
    borderWidth: 1.5,
    borderColor: ORIENTATION_STEP_LINE_TODO,
  },
  orientationTapHint: {
    color: brand.textSecondary,
    fontWeight: '600',
    lineHeight: 16,
  },
  orientationTapHintRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
