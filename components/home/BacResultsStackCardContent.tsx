import { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Pressable as GHPressable } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import type { StackCardLayout } from '@/components/home/stackCardLayout';
import { BacThresholdsCtaSkeleton } from '@/components/home/BacResultsStackCardSkeleton';
import { useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import { Text } from '@/components/ui/Text';
import type { HomeCopyKey } from '@/constants/i18n';
import {
  getBacCountdownParts,
  hasAnyBacResultPublished,
  isBacResultsDay,
  pad2,
  type BacOutletStatus,
  type BacResultsCardConfig,
  type BacVerificationChannel,
} from '@/constants/bacResultsCard';
import { useLocale } from '@/contexts/LocaleContext';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

type Props = {
  config: BacResultsCardConfig;
  layout: StackCardLayout;
  isRTL?: boolean;
  onOpenVerification?: (channel: BacVerificationChannel) => void;
  onOpenThresholds?: () => void;
  thresholdsLocked?: boolean;
  /** Chargement config bac et/ou profil élève — affiche un skeleton à la place du CTA. */
  thresholdsLoading?: boolean;
  /** Carte en arrière-plan (peek) : masquer le CTA seuils. */
  hideThresholdsCta?: boolean;
};

function formatResultDate(iso: string, locale: 'fr' | 'ar', compact?: boolean): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return '—';
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-MA' : 'fr-FR', {
      weekday: compact ? undefined : 'short',
      day: 'numeric',
      month: compact ? 'short' : 'long',
      year: 'numeric',
      ...(compact ? {} : { hour: '2-digit', minute: '2-digit' }),
    }).format(d);
  } catch {
    return d.toLocaleString();
  }
}

function PublishedTag({
  label,
  compact,
  isRTL,
}: {
  label: string;
  compact?: boolean;
  isRTL?: boolean;
}) {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 650, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 650, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.tagPublished,
        compact && styles.tagCompact,
        isRTL && styles.tagRowRtl,
        isRTL && styles.tagAlignRtl,
        anim,
      ]}>
      <View style={styles.tagPublishedDot} />
      <Text
        style={[
          styles.tagPublishedTxt,
          compact && styles.tagTxtCompact,
          isRTL && compact && styles.tagTxtCompactRtl,
        ]}
        numberOfLines={isRTL && compact ? 2 : 1}>
        {label}
      </Text>
    </Animated.View>
  );
}

function NotYetTag({
  label,
  compact,
  isRTL,
}: {
  label: string;
  compact?: boolean;
  isRTL?: boolean;
}) {
  return (
    <View style={[styles.tagNotYet, compact && styles.tagCompact, isRTL && styles.tagNotYetRtl]}>
      <Text
        style={[
          styles.tagNotYetTxt,
          compact && styles.tagTxtCompact,
          isRTL && compact && styles.tagTxtCompactRtl,
        ]}
        numberOfLines={isRTL && compact ? 2 : 1}>
        {label}
      </Text>
    </View>
  );
}

function OutletStatusTag({
  status,
  publishedLabel,
  notYetLabel,
  isRTL,
}: {
  status: BacOutletStatus;
  publishedLabel: string;
  notYetLabel: string;
  isRTL?: boolean;
}) {
  if (status === 'published') {
    return <PublishedTag label={publishedLabel} compact isRTL={isRTL} />;
  }
  return <NotYetTag label={notYetLabel} compact isRTL={isRTL} />;
}

/** CTA seuils : skeleton (chargement) ou bouton actif / verrouillé. */
function BacThresholdsCtaSlot({
  loading,
  locked,
  disabled,
  onPress,
  isRTL,
  t,
}: {
  loading: boolean;
  locked: boolean;
  disabled: boolean;
  onPress?: () => void;
  isRTL: boolean;
  t: (key: HomeCopyKey) => string;
}) {
  const pulseStyle = useSkeletonPulse();

  if (loading) {
    return <BacThresholdsCtaSkeleton pulseStyle={pulseStyle} isRTL={isRTL} />;
  }

  return (
    <View style={styles.thresholdsCtaOuter}>
      <GHPressable
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        accessibilityLabel={t('bacThresholdsCtaTitle')}
        style={({ pressed }) => [
          styles.thresholdsCta,
          isRTL && styles.thresholdsCtaRtl,
          disabled && styles.thresholdsCtaDisabled,
          pressed && !disabled && styles.thresholdsCtaPressed,
        ]}>
        <View style={styles.thresholdsCtaIconWrap}>
          <FontAwesome name={disabled ? 'lock' : 'graduation-cap'} size={16} color={brand.white} />
        </View>
        <View style={[styles.thresholdsCtaText, isRTL && styles.thresholdsCtaTextRtl]}>
          <Text
            style={[styles.thresholdsCtaTitle, isRTL && styles.textRtl, isRTL && styles.thresholdsCtaTitleRtl]}
            numberOfLines={2}>
            {t('bacThresholdsCtaTitle')}
          </Text>
          <Text
            style={[styles.thresholdsCtaSub, isRTL && styles.textRtl, isRTL && styles.thresholdsCtaSubRtl]}
            numberOfLines={2}>
            {locked ? t('bacThresholdsLockedSub') : t('bacThresholdsCtaSub')}
          </Text>
        </View>
        <View style={styles.thresholdsCtaArrow}>
          <FontAwesome
            name={disabled ? 'lock' : isRTL ? 'chevron-left' : 'chevron-right'}
            size={12}
            color={brand.white}
          />
        </View>
      </GHPressable>
    </View>
  );
}

export function BacResultsStackCardContent({
  config,
  layout,
  isRTL: isRTLProp,
  onOpenVerification,
  onOpenThresholds,
  thresholdsLocked = false,
  thresholdsLoading = false,
  hideThresholdsCta = false,
}: Props) {
  const { t, isRTL: isRTLContext, locale } = useLocale();
  const isRTL = isRTLProp ?? isRTLContext;
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const countdown = useMemo(
    () => getBacCountdownParts(config.resultDateIso, nowMs),
    [config.resultDateIso, nowMs],
  );
  const resultsDay = isBacResultsDay(config.resultDateIso, nowMs);
  const waitingResultsDay =
    resultsDay && config.globalStatus === 'not_yet';
  const showCountdown = config.globalStatus === 'not_yet' && !countdown.isPast;
  const compact = showCountdown;
  const isPublished =
    config.globalStatus === 'published' || hasAnyBacResultPublished(config);
  /** CTA seuils visible même avant publication (comme une fois les résultats publiés). */
  const showThresholdsSlot = true;
  const thresholdsCtaDisabled = thresholdsLocked || !onOpenThresholds;

  const fs = Math.max(compact ? 9 : 10, layout.validityLabel);
  const fsSm = Math.max(compact ? 8 : 9, layout.hint);
  const fsTitle = Math.max(compact ? 13 : 14, layout.packName - 2);

  const outletRows: {
    key: HomeCopyKey;
    status: BacOutletStatus;
    icon: 'envelope-o' | 'mobile' | 'graduation-cap';
    channel: BacVerificationChannel;
  }[] = [
    { key: 'bacOutletOutlook', status: config.outlook, icon: 'envelope-o', channel: 'outlook' },
    { key: 'bacOutletSms', status: config.sms, icon: 'mobile', channel: 'sms' },
    { key: 'bacOutletMenResults', status: config.menResults, icon: 'graduation-cap', channel: 'men' },
  ];

  const countdownLine = `${pad2(countdown.days)}${t('bacCountdownDays')} · ${pad2(countdown.hours)}${t('bacCountdownHours')} · ${pad2(countdown.minutes)}${t('bacCountdownMinutes')}`;

  return (
    <View
      style={[
        styles.root,
        compact && styles.rootCompact,
        isRTL && styles.rootRtl,
        { gap: compact ? 8 : layout.validityMT, marginTop: layout.packNameMT },
      ]}>
      <View style={[styles.headerRow, isRTL && styles.rowRtl]}>
        <View style={styles.headerText}>
          <Text
            style={[
              styles.title,
              { fontSize: fsTitle },
              isRTL ? styles.textRtl : styles.textLtr,
              isRTL && styles.titleRtl,
            ]}
            numberOfLines={2}>
            {t('bacCardTitle')}
          </Text>
          <Text
            style={[styles.dateLine, { fontSize: fsSm }, isRTL ? styles.textRtl : styles.textLtr]}
            numberOfLines={2}>
            {t('bacCardDateLabel')}: {formatResultDate(config.resultDateIso, locale, compact)}
          </Text>
        </View>
        <View style={[styles.headerTagWrap, isRTL && styles.headerTagWrapRtl]}>
          {isPublished ? (
            <PublishedTag label={t('bacStatusPublished')} compact={compact} isRTL={isRTL} />
          ) : (
            <NotYetTag label={t('bacStatusNotYet')} compact={compact} isRTL={isRTL} />
          )}
        </View>
      </View>

      {showCountdown ? (
        <View style={[styles.countdownCompact, isRTL && styles.rowRtl]}>
          <FontAwesome name="hourglass-half" size={11} color={homeShell.blue} />
          <Text style={[styles.countdownCompactTxt, isRTL && styles.textRtl]} numberOfLines={isRTL ? 2 : 1}>
            {t('bacCountdownKicker')}: {countdownLine}
          </Text>
        </View>
      ) : null}

      {!compact && waitingResultsDay ? (
        <View style={[styles.jourJBanner, isRTL && styles.rowRtl]}>
          <FontAwesome name="clock-o" size={16} color="#B45309" />
          <View style={styles.jourJText}>
            <Text style={[styles.jourJTitle, isRTL && styles.textRtl]}>{t('bacJourJTitle')}</Text>
            <Text style={[styles.jourJSub, { fontSize: fsSm }, isRTL && styles.textRtl]}>
              {t('bacWaitingResult')}
            </Text>
          </View>
        </View>
      ) : null}

      {!compact && showCountdown ? (
        <View style={styles.countdownBlock}>
          <Text style={[styles.countdownKicker, { fontSize: fsSm }, isRTL && styles.textRtl]}>
            {t('bacCountdownKicker')}
          </Text>
          <View style={[styles.countRow, isRTL && styles.countRowRtl]}>
            <View style={[styles.countUnit, isRTL && styles.countUnitRtl]}>
              <Text style={styles.countValue}>{pad2(countdown.days)}</Text>
              <Text style={[styles.countLabel, isRTL && styles.countLabelRtl]}>
                {t('bacCountdownDays')}
              </Text>
            </View>
            <Text style={styles.countSep}>:</Text>
            <View style={[styles.countUnit, isRTL && styles.countUnitRtl]}>
              <Text style={styles.countValue}>{pad2(countdown.hours)}</Text>
              <Text style={[styles.countLabel, isRTL && styles.countLabelRtl]}>
                {t('bacCountdownHours')}
              </Text>
            </View>
            <Text style={styles.countSep}>:</Text>
            <View style={[styles.countUnit, isRTL && styles.countUnitRtl]}>
              <Text style={styles.countValue}>{pad2(countdown.minutes)}</Text>
              <Text style={[styles.countLabel, isRTL && styles.countLabelRtl]}>
                {t('bacCountdownMinutes')}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      <View
        style={[
          styles.outletsCard,
          compact && styles.outletsCardCompact,
          isRTL && styles.outletsCardRtl,
          { padding: compact ? 8 : layout.boxPad, borderRadius: layout.boxRadius },
        ]}>
        <Text
          style={[styles.outletsTitle, { fontSize: fs }, isRTL ? styles.textRtl : styles.textLtr]}
          numberOfLines={2}>
          {t('bacOutletsTitle')}
        </Text>
        {outletRows.map((row) => (
          <GHPressable
            key={row.key}
            onPress={() => onOpenVerification?.(row.channel)}
            accessibilityRole="button"
            accessibilityLabel={`${t(row.key)} — ${t('bacOutletGuideA11y')}`}
            style={({ pressed }) => [
              styles.outletRow,
              styles.outletRowPressable,
              styles.outletRowFill,
              isRTL && styles.outletRowRtl,
              pressed && styles.outletRowPressed,
            ]}>
            <View style={[styles.outletLeft, isRTL && styles.outletLeftRtl]}>
              <FontAwesome
                name={row.icon}
                size={compact ? 11 : 13}
                color={brand.primary}
                style={styles.outletIcon}
              />
              <View style={styles.outletLabelWrap}>
                <Text
                  style={[styles.outletLabel, { fontSize: fsSm }, isRTL ? styles.textRtl : styles.textLtr]}
                  numberOfLines={compact && isRTL ? 1 : 2}>
                  {t(row.key)}
                </Text>
                {onOpenVerification ? (
                  <Text
                    style={[styles.outletGuideHint, isRTL ? styles.textRtl : styles.textLtr]}
                    numberOfLines={1}>
                    {t('bacTapForGuide')}
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={[styles.outletRight, isRTL && styles.outletRightRtl]}>
              <View style={[styles.statusTagWrap, isRTL && styles.statusTagWrapRtl]}>
                <OutletStatusTag
                  status={row.status}
                  publishedLabel={t('bacStatusPublished')}
                  notYetLabel={t('bacStatusNotYet')}
                  isRTL={isRTL}
                />
              </View>
              <FontAwesome
                name={isRTL ? 'chevron-left' : 'chevron-right'}
                size={10}
                color={brand.textMuted}
                style={styles.chevron}
              />
            </View>
          </GHPressable>
        ))}
      </View>

      {showThresholdsSlot && !hideThresholdsCta ? (
        <BacThresholdsCtaSlot
          loading={thresholdsLoading}
          locked={thresholdsLocked}
          disabled={thresholdsCtaDisabled}
          onPress={onOpenThresholds}
          isRTL={isRTL}
          t={t}
        />
      ) : null}

      {compact && waitingResultsDay ? (
        <Text style={[styles.jourJInline, { fontSize: fsSm }, isRTL && styles.textRtl]} numberOfLines={2}>
          {t('bacJourJTitle')} — {t('bacWaitingResult')}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
    gap: spacing.sm,
    minWidth: 0,
    paddingBottom: 2,
  },
  rootRtl: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    alignItems: 'stretch',
  },
  rootCompact: {
    justifyContent: 'flex-start',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    width: '100%',
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  headerTagWrap: {
    flexShrink: 1,
    minWidth: 0,
    maxWidth: '42%',
    alignItems: 'flex-end',
  },
  headerTagWrapRtl: {
    alignItems: 'flex-start',
    maxWidth: '48%',
  },
  textLtr: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  textRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  title: {
    fontWeight: '800',
    color: brand.text,
    letterSpacing: -0.3,
  },
  titleRtl: {
    letterSpacing: 0,
  },
  dateLine: {
    marginTop: 2,
    color: brand.textMuted,
    fontWeight: '500',
  },
  countdownCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(51, 62, 143, 0.14)',
    width: '100%',
  },
  countdownCompactTxt: {
    flex: 1,
    minWidth: 0,
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: homeShell.blue,
    fontVariant: ['tabular-nums'],
  },
  tagRowRtl: {
    flexDirection: 'row-reverse',
  },
  tagPublished: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: 'rgba(34, 197, 94, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.45)',
    maxWidth: '100%',
    alignSelf: 'flex-end',
  },
  tagPublishedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: homeShell.greenDark,
    flexShrink: 0,
  },
  tagPublishedTxt: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: homeShell.greenDark,
    flexShrink: 1,
  },
  tagNotYet: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.35)',
    maxWidth: '100%',
    alignSelf: 'flex-end',
  },
  tagAlignRtl: {
    alignSelf: 'flex-start',
  },
  tagNotYetRtl: {
    alignSelf: 'flex-start',
  },
  tagNotYetTxt: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: '#B91C1C',
    flexShrink: 1,
  },
  tagCompact: {
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  tagTxtCompact: {
    fontSize: 8,
  },
  tagTxtCompactRtl: {
    fontSize: 7,
    lineHeight: 10,
    textAlign: 'center',
  },
  statusTagWrap: {
    flexShrink: 1,
    minWidth: 0,
    maxWidth: 104,
  },
  statusTagWrapRtl: {
    maxWidth: 118,
    alignItems: 'flex-start',
  },
  jourJBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.28)',
    width: '100%',
  },
  jourJText: {
    flex: 1,
    minWidth: 0,
  },
  jourJTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: '#B45309',
  },
  jourJSub: {
    marginTop: 2,
    color: '#92400E',
    fontWeight: '600',
  },
  jourJInline: {
    color: '#B45309',
    fontWeight: '700',
    marginTop: 2,
  },
  countdownBlock: {
    paddingVertical: spacing.xs,
    width: '100%',
  },
  countdownKicker: {
    fontWeight: '700',
    color: brand.textMuted,
    marginBottom: spacing.xs,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    minWidth: 0,
  },
  countRowRtl: {
    flexDirection: 'row-reverse',
  },
  countUnit: {
    minWidth: 52,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: radius.md,
    backgroundColor: brand.backgroundSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  countValue: {
    fontSize: 18,
    fontWeight: '800',
    color: homeShell.blue,
    fontVariant: ['tabular-nums'],
  },
  countLabel: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '700',
    color: brand.textMuted,
    textTransform: 'uppercase',
  },
  countLabelRtl: {
    textTransform: 'none',
    writingDirection: 'rtl',
  },
  countSep: {
    fontSize: 16,
    fontWeight: '700',
    color: brand.textMuted,
    marginBottom: 8,
  },
  outletsCard: {
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: brand.backgroundSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    gap: 6,
    flexShrink: 1,
    minWidth: 0,
  },
  outletsCardRtl: {
    alignItems: 'stretch',
  },
  outletsCardCompact: {
    gap: 6,
    paddingVertical: 2,
  },
  outletsTitle: {
    fontWeight: '800',
    color: brand.text,
    marginBottom: 0,
  },
  outletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    width: '100%',
  },
  outletRowRtl: {
    flexDirection: 'row-reverse',
  },
  outletRowPressable: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: radius.sm,
  },
  outletRowFill: {
    minHeight: 40,
    justifyContent: 'center',
  },
  outletRowPressed: {
    backgroundColor: 'rgba(51, 62, 143, 0.06)',
  },
  outletLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  outletLeftRtl: {
    flexDirection: 'row-reverse',
  },
  outletLabelWrap: {
    flex: 1,
    minWidth: 0,
  },
  outletLabel: {
    color: brand.text,
    fontWeight: '600',
  },
  outletGuideHint: {
    fontSize: 9,
    fontWeight: '600',
    color: brand.primary,
    marginTop: 1,
  },
  outletRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
    maxWidth: '44%',
    minWidth: 0,
  },
  outletRightRtl: {
    flexDirection: 'row-reverse',
    maxWidth: '50%',
  },
  outletIcon: {
    width: 16,
    textAlign: 'center',
    flexShrink: 0,
  },
  chevron: {
    flexShrink: 0,
  },
  thresholdsCtaOuter: {
    width: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
    maxWidth: '100%',
    flexShrink: 0,
    borderRadius: radius.lg,
    marginTop: spacing.xs,
  },
  thresholdsCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    alignSelf: 'stretch',
    paddingVertical: 12,
    paddingHorizontal: 12,
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
  thresholdsCtaRtl: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 64,
  },
  thresholdsCtaPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  thresholdsCtaDisabled: {
    opacity: 0.78,
  },
  thresholdsCtaIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  thresholdsCtaText: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    gap: 2,
    overflow: 'hidden',
  },
  thresholdsCtaTextRtl: {
    alignSelf: 'stretch',
  },
  thresholdsCtaTitle: {
    fontSize: fontSize.sm,
    fontWeight: '900',
    color: brand.white,
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  thresholdsCtaTitleRtl: {
    letterSpacing: 0,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  thresholdsCtaSub: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.88)',
    lineHeight: 14,
    flexShrink: 1,
  },
  thresholdsCtaSubRtl: {
    fontSize: 10,
    lineHeight: 16,
    marginTop: 2,
  },
  thresholdsCtaArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
