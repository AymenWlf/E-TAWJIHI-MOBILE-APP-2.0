import type { ComponentProps } from 'react';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { Gesture, GestureDetector, Pressable as GHPressable } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  runOnUI,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { PaginationDots } from '@/components/home/PaginationDots';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { getPracticalLinkDef } from '@/constants/practicalLinks';
import { useLocale } from '@/contexts/LocaleContext';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

export type OrientationParcoursTask = {
  id: string;
  title: string;
  /** Icône FontAwesome (v4) pour la pastille d’étape sur la carte. */
  icon?: ComponentProps<typeof FontAwesome>['name'];
};

export type HomeStackCard = {
  id: string;
  /** Carte sous le parcours : un id parmi `PRACTICAL_LINK_DEFS` (écoles, inscriptions, …). */
  practicalLinkId?: string;
  eyebrow?: string;
  /** Sous-titre sous l’eyebrow ; omis si absent. */
  packLabel?: string;
  packName?: string;
  /** Ignorés si `dailyActions` est défini (remplacés par les boutons jeu / info). */
  validityLabel?: string;
  validityValue?: string;
  hint?: string;
  /** Bloc progression + ouverture liste des tâches (ex. carte « Votre parcours d'orientation »). */
  orientationProgress?: {
    percent: number;
    label?: string;
  };
  remainingOrientationTasks?: OrientationParcoursTask[];
  /** Jeu quotidien + information du jour (1re carte) : surbrillance si non joué / non lu. */
  dailyActions?: {
    playedToday: boolean;
    infoReadToday: boolean;
  };
};

type Props = {
  cards: HomeStackCard[];
  /** Largeur utile (ex. écran − padding horizontal) */
  width: number;
  onPressDailyGame?: () => void;
  onPressDailyInfo?: () => void;
  /** Cartes « lien pratique » : même id que la rangée Liens pratiques. */
  onPressPracticalLink?: (id: string) => void;
};

/** Hauteur de référence (iPhone classique) ; le rendu réel dépend de `buildStackCardLayout`. */
const BASE_CARD_H = 336;
const STACK_VERTICAL_EXTRA = 36;

export type StackCardLayout = {
  cardH: number;
  outerH: number;
  pad: number;
  padStripe: number;
  iconSize: number;
  eyebrow: number;
  packLabel: number;
  packName: number;
  packLh: number;
  validityLabel: number;
  validityValue: number;
  validityLh: number;
  boxPad: number;
  boxRadius: number;
  hint: number;
  hintLh: number;
  hintMinH: number;
  validityMT: number;
  packLabelMT: number;
  packNameMT: number;
  hintMT: number;
  calMR: number;
  calMT: number;
  validityValueMT: number;
};

/** Hauteur / typo / marges adaptées à la fenêtre pour que la carte tienne entièrement à l’écran. */
export function buildStackCardLayout(cardWidth: number, windowHeight: number): StackCardLayout {
  const wh = Math.max(420, windowHeight);
  const capByScreen = Math.floor(wh * 0.43);
  const capByWidth = Math.floor(cardWidth * 0.82);
  let cardH = Math.min(BASE_CARD_H, capByScreen, capByWidth);
  cardH = Math.max(210, cardH);
  const s = cardH / BASE_CARD_H;
  const r = (x: number) => Math.max(1, Math.round(x * s));

  return {
    cardH,
    outerH: cardH + STACK_VERTICAL_EXTRA,
    pad: r(spacing.lg),
    padStripe: r(6),
    iconSize: Math.max(12, r(16)),
    eyebrow: Math.max(10, r(fontSize.xs)),
    packLabel: Math.max(11, r(fontSize.sm)),
    packName: Math.max(13, r(fontSize.lg)),
    packLh: Math.max(18, r(22)),
    validityLabel: Math.max(9, r(fontSize.xs)),
    validityValue: Math.max(11, r(fontSize.sm)),
    validityLh: Math.max(16, r(20)),
    boxPad: r(spacing.md),
    boxRadius: r(radius.md),
    hint: Math.max(10, r(fontSize.xs)),
    hintLh: Math.max(14, r(16)),
    hintMinH: r(32),
    validityMT: r(spacing.sm),
    packLabelMT: r(spacing.sm),
    packNameMT: r(4),
    hintMT: r(spacing.sm),
    calMR: r(spacing.md),
    calMT: r(2),
    validityValueMT: r(4),
  };
}

const SWIPE_V = 820;
const SPRING_BACK = { damping: 24, stiffness: 190, mass: 1.0 } as const;
const EXIT_MS = 360;
/** La carte suit le doigt à 70 % de sa vitesse — ressenti plus lourd / contrôlé. */
const DRAG_DAMPING = 0.7;
const EXIT_EASING = Easing.out(Easing.cubic);

const ORIENTATION_STEP_COUNT = 5;
const ORIENTATION_DEFAULT_LABELS = [
  'Questionnaire',
  'Écoles',
  'Dossier',
  'Concours',
  'Conseiller',
] as const;
const ORIENTATION_DEFAULT_ICONS: readonly ComponentProps<typeof FontAwesome>['name'][] = [
  'clipboard',
  'university',
  'file-text-o',
  'calendar',
  'phone',
];

function buildOrientationStepsForCard(
  tasks?: OrientationParcoursTask[]
): { id: string; title: string; icon: ComponentProps<typeof FontAwesome>['name'] }[] {
  const out: { id: string; title: string; icon: ComponentProps<typeof FontAwesome>['name'] }[] = [];
  for (let i = 0; i < ORIENTATION_STEP_COUNT; i++) {
    const t = tasks?.[i];
    out.push({
      id: t?.id ?? `orientation-step-${i + 1}`,
      title: t?.title ?? ORIENTATION_DEFAULT_LABELS[i],
      icon: t?.icon ?? ORIENTATION_DEFAULT_ICONS[i]!,
    });
  }
  return out;
}

function orientationCompletedSteps(percent: number): number {
  const p = Math.min(100, Math.max(0, percent)) / 100;
  return Math.min(ORIENTATION_STEP_COUNT, Math.floor(p * ORIENTATION_STEP_COUNT));
}

function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return `rgba(51,62,143,${alpha})`;
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return `rgba(51,62,143,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
}

function OrientationStepsStrip({
  percent,
  tasks,
  layout,
}: {
  percent: number;
  tasks?: OrientationParcoursTask[];
  layout: StackCardLayout;
}) {
  const { t, isRTL } = useLocale();
  const steps = buildOrientationStepsForCard(tasks);
  const completed = orientationCompletedSteps(percent);
  const iconSz = Math.max(10, Math.round(layout.iconSize * 0.72));
  const bubble = Math.max(22, Math.round(26 * (layout.cardH / BASE_CARD_H)));

  return (
    <View style={styles.orientationStepsWrap}>
      <View style={[styles.orientationStepsRow, isRTL && styles.orientationStepsRowRtl]}>
        {steps.map((step, i) => {
          const done = i < completed;
          const current = i === completed && completed < ORIENTATION_STEP_COUNT;
          const lineDone = i > 0 && i <= completed;
          return (
            <Fragment key={step.id}>
              {i > 0 ? (
                <View
                  style={[
                    styles.orientationStepLine,
                    {
                      backgroundColor: lineDone ? homeShell.green : brand.borderLight,
                    },
                  ]}
                />
              ) : null}
              <View
                style={[styles.orientationStepBubbleCol, { width: bubble }]}
                accessibilityLabel={`${step.title}${
                  done ? t('orientationStepA11yDone') : current ? t('orientationStepA11yCurrent') : t('orientationStepA11yTodo')
                }`}>
                <View
                  style={[
                    styles.orientationStepBubble,
                    {
                      width: bubble,
                      height: bubble,
                      borderRadius: bubble / 2,
                    },
                    done && styles.orientationStepBubbleDone,
                    current && styles.orientationStepBubbleCurrent,
                    !done && !current && styles.orientationStepBubbleTodo,
                  ]}>
                  <FontAwesome
                    name={step.icon}
                    size={iconSz}
                    color={
                      done ? homeShell.text : current ? homeShell.green : brand.textMuted
                    }
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

function DailyActionsBlock({
  daily,
  layout,
  onPressDailyGame,
  onPressDailyInfo,
}: {
  daily: NonNullable<HomeStackCard['dailyActions']>;
  layout: StackCardLayout;
  onPressDailyGame?: () => void;
  onPressDailyInfo?: () => void;
}) {
  const { t } = useLocale();
  const padV = Math.max(10, Math.round(layout.boxPad * 0.72));
  const padH = Math.max(8, Math.round(layout.boxPad * 0.58));
  const iconSz = Math.max(17, Math.round(layout.iconSize * 1.12));
  const titleFs = Math.max(11, layout.validityValue);
  const badgeFs = Math.max(9, layout.validityLabel);
  const radius = Math.max(10, layout.boxRadius);

  const gamePending = !daily.playedToday;
  const infoPending = !daily.infoReadToday;

  return (
    <View style={styles.dailyActionsWrap}>
      <GHPressable
        onPress={onPressDailyGame}
        disabled={!onPressDailyGame}
        accessibilityRole="button"
        accessibilityLabel={t('gameDailyTitle')}
        style={({ pressed }) => [
          styles.dailyMini,
          {
            paddingVertical: padV,
            paddingHorizontal: padH,
            borderRadius: radius,
          },
          gamePending ? styles.dailyMiniHighlight : styles.dailyMiniDone,
          pressed && onPressDailyGame ? { opacity: 0.88 } : null,
        ]}>
        <FontAwesome
          name="trophy"
          size={iconSz}
          color={gamePending ? homeShell.greenDark : brand.textMuted}
          style={styles.dailyMiniIcon}
        />
        <Text
          style={[styles.dailyMiniTitle, { fontSize: titleFs, lineHeight: Math.round(titleFs * 1.22) }]}
          numberOfLines={2}>
          {t('gameDailyTitle')}
        </Text>
        {gamePending ? (
          <View style={styles.dailyMiniBadge}>
            <Text style={[styles.dailyMiniBadgeTxt, { fontSize: badgeFs }]}>{t('dailyPlay')}</Text>
          </View>
        ) : (
          <Text style={[styles.dailyMiniHint, { fontSize: badgeFs }]}>{t('dailyPlayed')}</Text>
        )}
      </GHPressable>
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
    </View>
  );
}

function StackCardFace({
  card,
  accent,
  layout,
  onOpenOrientationTasks,
  onPressDailyGame,
  onPressDailyInfo,
  onPressPracticalLink,
}: {
  card: HomeStackCard;
  accent: 'blue' | 'green';
  layout: StackCardLayout;
  onOpenOrientationTasks?: () => void;
  onPressDailyGame?: () => void;
  onPressDailyInfo?: () => void;
  onPressPracticalLink?: (id: string) => void;
}) {
  const { t, isRTL } = useLocale();
  const stripe = accent === 'green' ? homeShell.greenDark : homeShell.blue;
  const practicalDef = card.practicalLinkId ? getPracticalLinkDef(card.practicalLinkId) : undefined;
  const progress = card.orientationProgress;
  const nameLines = progress ? 2 : practicalDef ? 2 : 3;
  /** 1re carte : progression + actions quotidiennes — répartition verticale homogène. */
  const packedOrientationDaily = progress != null && card.dailyActions != null;
  const iconHeroSz = Math.max(28, Math.round(layout.iconSize * 2.35));
  return (
    <View
      style={[
        styles.cardInner,
        {
          height: layout.cardH,
          paddingTop: layout.pad,
          paddingBottom: layout.pad,
          paddingEnd: layout.pad,
          paddingStart: layout.pad + layout.padStripe,
        },
      ]}>
      <View style={[styles.stripe, { backgroundColor: stripe }]} />
      <View style={styles.cardColumn}>
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
                onPress={onOpenOrientationTasks}
                disabled={!onOpenOrientationTasks}
                accessibilityRole="button"
                accessibilityLabel={t('orientationTasksA11y')}
                style={({ pressed }) => [
                  styles.orientationBlock,
                  styles.orientationBlockPacked,
                  {
                    padding: layout.boxPad,
                    borderRadius: layout.boxRadius,
                  },
                  pressed && onOpenOrientationTasks ? { opacity: 0.92 } : null,
                ]}>
                <View style={[styles.orientationRow, isRTL && styles.orientationRowRtl]}>
                  <Text
                    style={[styles.orientationLabel, isRTL && styles.orientationLblRtl, { fontSize: layout.validityLabel }]}
                    numberOfLines={1}>
                    {progress!.label ?? t('orientationProgressLabel')}
                  </Text>
                  <Text style={[styles.orientationPercent, isRTL && styles.orientationPctRtl, { fontSize: layout.packLabel }]}>
                    {Math.round(Math.min(100, Math.max(0, progress!.percent)))} %
                  </Text>
                </View>
                <OrientationStepsStrip
                  percent={progress!.percent}
                  tasks={card.remainingOrientationTasks}
                  layout={layout}
                />
                {onOpenOrientationTasks ? (
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
              <View style={styles.firstCardDailyStretch}>
                <DailyActionsBlock
                  daily={card.dailyActions!}
                  layout={layout}
                  onPressDailyGame={onPressDailyGame}
                  onPressDailyInfo={onPressDailyInfo}
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
            onPress={onOpenOrientationTasks}
            disabled={!onOpenOrientationTasks}
            accessibilityRole="button"
            accessibilityLabel={t('orientationTasksA11y')}
            style={({ pressed }) => [
              styles.orientationBlock,
              {
                marginTop: layout.validityMT,
                padding: layout.boxPad,
                borderRadius: layout.boxRadius,
              },
              pressed && onOpenOrientationTasks ? { opacity: 0.92 } : null,
            ]}>
            <View style={[styles.orientationRow, isRTL && styles.orientationRowRtl]}>
              <Text
                style={[styles.orientationLabel, isRTL && styles.orientationLblRtl, { fontSize: layout.validityLabel }]}
                numberOfLines={1}>
                {progress.label ?? t('orientationProgressLabel')}
              </Text>
              <Text style={[styles.orientationPercent, isRTL && styles.orientationPctRtl, { fontSize: layout.packLabel }]}>
                {Math.round(Math.min(100, Math.max(0, progress.percent)))} %
              </Text>
            </View>
            <OrientationStepsStrip
              percent={progress.percent}
              tasks={card.remainingOrientationTasks}
              layout={layout}
            />
            {onOpenOrientationTasks ? (
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
  isTop,
  onOpenOrientationTasks,
  onPressDailyGame,
  onPressDailyInfo,
  onPressPracticalLink,
}: {
  stackPos: 0 | 1 | 2;
  card: HomeStackCard;
  accent: 'blue' | 'green';
  width: number;
  layout: StackCardLayout;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  exitAnimating: SharedValue<number>;
  isTop: boolean;
  onOpenOrientationTasks?: () => void;
  onPressDailyGame?: () => void;
  onPressDailyInfo?: () => void;
  onPressPracticalLink?: (id: string) => void;
}) {
  const baseY = stackPos * 10;
  const baseScale = 1 - stackPos * 0.045;
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

  /** Pile fixe : pas d’interpolation sur translateX → évite le « snap » quand translateX repasse à 0 après la sortie */
  const underStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      zIndex: zIndex,
      transform: [{ translateY: baseY }, { scale: baseScale }],
    };
  }, [baseY, baseScale, zIndex]);

  /** Carte « suivante » (milieu) : voile blanc pendant le geste + sortie jusqu’au bump d’index */
  const nextWhiteMaskStyle = useAnimatedStyle(() => {
    'worklet';
    if (stackPos !== 1) {
      return { opacity: 0 };
    }
    const tx = translateX.value;
    const dragCover = interpolate(
      Math.abs(tx),
      [0, 10],
      [0, 1],
      Extrapolation.CLAMP
    );
    const o = Math.max(dragCover, exitAnimating.value);
    return {
      opacity: o,
      backgroundColor: brand.white,
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      borderRadius: radius.xl,
    };
  }, [stackPos, translateX, exitAnimating]);

  const style = isTop ? topStyle : underStyle;

  return (
    <Animated.View
      pointerEvents={isTop ? 'auto' : 'none'}
      style={[styles.stackLayer, { width }, style]}
      collapsable={false}>
      <View style={[styles.cardElevate, { height: layout.cardH }]}>
        <View style={[styles.cardClip, { height: layout.cardH }]}>
          <StackCardFace
            card={card}
            accent={accent}
            layout={layout}
            onOpenOrientationTasks={onOpenOrientationTasks}
            onPressDailyGame={onPressDailyGame}
            onPressDailyInfo={onPressDailyInfo}
            onPressPracticalLink={onPressPracticalLink}
          />
          <Animated.View pointerEvents="none" style={nextWhiteMaskStyle} />
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
  onPressPracticalLink,
}: Props) {
  const { t, isRTL } = useLocale();
  const n = cards.length;
  const { width: screenW, height: windowH } = useWindowDimensions();
  const layout = useMemo(() => buildStackCardLayout(width, windowH), [width, windowH]);
  const screenWShared = useSharedValue(screenW);
  useEffect(() => {
    screenWShared.value = screenW;
  }, [screenW, screenWShared]);
  const [headIndex, setHeadIndex] = useState(0);
  const [orientationModal, setOrientationModal] = useState<{
    visible: boolean;
    title: string;
    tasks: OrientationParcoursTask[];
  }>({ visible: false, title: '', tasks: [] });

  const openOrientationTasks = useCallback((title: string, tasks: OrientationParcoursTask[]) => {
    if (!tasks.length) return;
    setOrientationModal({ visible: true, title, tasks });
  }, []);

  const closeOrientationTasks = useCallback(() => {
    setOrientationModal((m) => ({ ...m, visible: false }));
  }, []);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const exitAnimating = useSharedValue(0);
  const threshold = width * 0.2;

  const bumpNextState = useCallback(() => {
    setHeadIndex((h) => (h + 1) % n);
  }, [n]);

  const bumpPrevState = useCallback(() => {
    setHeadIndex((h) => (h - 1 + n) % n);
  }, [n]);

  /**
   * Ne pas remettre translateX/Y à 0 dans le worklet avant le bump : sinon l’ancienne
   * carte du dessus réapparaît au centre pendant un frame. On bump d’abord, puis après
   * commit (double rAF) on remet les transforms à 0 en même temps que le voile blanc.
   */
  const bumpNextThenResetTransforms = useCallback(() => {
    bumpNextState();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        runOnUI(() => {
          'worklet';
          translateX.value = 0;
          translateY.value = 0;
          exitAnimating.value = 0;
        })();
      });
    });
  }, [bumpNextState, translateX, translateY, exitAnimating]);

  const bumpPrevThenResetTransforms = useCallback(() => {
    bumpPrevState();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        runOnUI(() => {
          'worklet';
          translateX.value = 0;
          translateY.value = 0;
          exitAnimating.value = 0;
        })();
      });
    });
  }, [bumpPrevState, translateX, translateY, exitAnimating]);

  const panGesture = useMemo(() => {
    if (n <= 1) {
      return Gesture.Pan().enabled(false);
    }
    return Gesture.Pan()
      .activeOffsetX([-16, 16])
      .failOffsetY([-24, 24])
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
      <View style={[styles.stackArena, { width, height: layout.outerH }]} collapsable={false}>
        {layers.map(({ stackPos, idx }) => {
          const card = cards[idx];
          const isTop = stackPos === 0;
          const accent: 'blue' | 'green' = idx % 2 === 0 ? 'blue' : 'green';
          const orientationTasksHandler =
            isTop &&
            card.orientationProgress != null &&
            (card.remainingOrientationTasks?.length ?? 0) > 0
              ? () => openOrientationTasks(card.packName ?? '', card.remainingOrientationTasks!)
              : undefined;
          const dailyGameHandler =
            isTop && card.dailyActions != null ? onPressDailyGame : undefined;
          const dailyInfoHandler =
            isTop && card.dailyActions != null ? onPressDailyInfo : undefined;

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
                isTop
                onOpenOrientationTasks={orientationTasksHandler}
                onPressDailyGame={dailyGameHandler}
                onPressDailyInfo={dailyInfoHandler}
                onPressPracticalLink={onPressPracticalLink}
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
              translateX={translateX}
              translateY={translateY}
              exitAnimating={exitAnimating}
              isTop={false}
              onPressPracticalLink={onPressPracticalLink}
            />
          );
        })}
      </View>
      <Text style={[styles.swipeHint, isRTL && styles.swipeHintRtl]}>{t('swipeCardsHint')}</Text>
      <PaginationDots total={n} activeIndex={headIndex} onDark={false} compact rtl={isRTL} />

      <Modal
        visible={orientationModal.visible}
        transparent
        animationType="fade"
        onRequestClose={closeOrientationTasks}>
        <View style={styles.modalRoot}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeOrientationTasks}
            accessibilityLabel={t('closeOverlayA11y')}
          />
          <View style={styles.modalCard} accessibilityViewIsModal>
            <Text style={[styles.modalTitle, isRTL && styles.modalTxtRtl]} numberOfLines={2}>
              {orientationModal.title}
            </Text>
            <Text style={[styles.modalSubtitle, isRTL && styles.modalTxtRtl]}>{t('orientationModalSubtitle')}</Text>
            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
              bounces={false}>
              {orientationModal.tasks.map((task, i) => (
                <View
                  key={task.id}
                  style={[styles.modalTaskRow, isRTL && styles.modalTaskRowRtl]}>
                  <Text style={styles.modalTaskIndex}>{i + 1}.</Text>
                  <Text style={[styles.modalTaskTitle, isRTL && styles.modalTxtRtl]}>{task.title}</Text>
                </View>
              ))}
            </ScrollView>
            <Pressable
              onPress={closeOrientationTasks}
              style={({ pressed }) => [styles.modalCloseBtn, pressed && { opacity: 0.85 }]}>
              <Text style={styles.modalCloseLabel}>{t('modalClose')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  dailyMini: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: spacing.xs,
    marginBottom: 0,
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
  orientationStepsWrap: {
    marginTop: 6,
    width: '100%',
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
    height: 3,
    minWidth: 2,
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
    backgroundColor: brand.backgroundSoft,
    borderColor: brand.border,
  },
  orientationStepDot: {
    marginTop: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  orientationStepDotDone: {
    backgroundColor: homeShell.green,
  },
  orientationStepDotCurrent: {
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: homeShell.green,
    backgroundColor: brand.white,
  },
  orientationStepDotTodo: {
    backgroundColor: brand.borderLight,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
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
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '72%',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 16,
  },
  modalTitle: {
    color: brand.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  modalSubtitle: {
    marginTop: spacing.xs,
    color: brand.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  modalScroll: {
    marginTop: spacing.md,
    maxHeight: 320,
  },
  modalTaskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.borderLight,
    gap: spacing.sm,
  },
  modalTaskRowRtl: {
    flexDirection: 'row-reverse',
  },
  modalTaskIndex: {
    color: brand.primary,
    fontSize: fontSize.sm,
    fontWeight: '800',
    minWidth: 22,
  },
  modalTaskTitle: {
    flex: 1,
    color: brand.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
    lineHeight: 20,
  },
  modalCloseBtn: {
    marginTop: spacing.md,
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    backgroundColor: brand.backgroundSoft,
    borderRadius: radius.md,
  },
  modalCloseLabel: {
    color: brand.primary,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  modalTxtRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
