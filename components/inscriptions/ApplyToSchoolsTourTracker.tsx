import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import {
  APPLY_TO_SCHOOLS_TOUR_STEPS,
  type ApplyToSchoolsTourStepId,
} from '@/constants/applyToSchoolsTour';
import { useLocale } from '@/contexts/LocaleContext';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import {
  getStepRequiredActionLabelKey,
  isStepActionComplete,
  type ApplyToSchoolsTourProgressState,
} from '@/utils/applyToSchoolsTourProgress';
import { formatArabicParagraph } from '@/utils/bidiText';

type Props = {
  step: ApplyToSchoolsTourStepId;
  stepIndex: number;
  progress: ApplyToSchoolsTourProgressState;
};

export function ApplyToSchoolsTourTracker({ step, stepIndex, progress }: Props) {
  const { t, isRTL } = useLocale();
  const done = isStepActionComplete(step, progress);
  const actionLabel = isRTL
    ? formatArabicParagraph(t(getStepRequiredActionLabelKey(step)))
    : t(getStepRequiredActionLabelKey(step));
  const isBravoStep = step === 'bravo';

  const stepCounterText = isRTL
    ? formatArabicParagraph(
        t('applySchoolsTourTrackerStep')
          .replace('{current}', String(stepIndex + 1))
          .replace('{total}', String(APPLY_TO_SCHOOLS_TOUR_STEPS.length)),
      )
    : t('applySchoolsTourTrackerStep')
        .replace('{current}', String(stepIndex + 1))
        .replace('{total}', String(APPLY_TO_SCHOOLS_TOUR_STEPS.length));

  return (
    <View style={[styles.wrap, isRTL && styles.wrapRtl]}>
      <View style={[styles.stepRow, isRTL && styles.stepRowRtl]}>
        <Text style={[styles.stepCounter, isRTL && styles.txtRtl]}>{stepCounterText}</Text>
        <View style={[styles.dotsRow, isRTL && styles.dotsRowRtl]}>
          {APPLY_TO_SCHOOLS_TOUR_STEPS.map((id, idx) => {
            const stepDone =
              idx < stepIndex ||
              (idx === stepIndex && done) ||
              progress.completedActions.has(id);
            return (
              <View
                key={id}
                style={[
                  styles.dot,
                  idx <= stepIndex && styles.dotReached,
                  stepDone && styles.dotDone,
                  idx === stepIndex && styles.dotCurrent,
                ]}
              />
            );
          })}
        </View>
      </View>

      <View
        style={[
          styles.actionCard,
          done && styles.actionCardDone,
          isRTL && styles.actionCardRtl,
          isBravoStep && done && styles.actionCardBravo,
        ]}>
        {isBravoStep && done ? (
          <View style={styles.bravoSuccessWrap}>
            <FontAwesome name="check-circle" size={36} color={homeShell.greenDark} />
            <Text style={[styles.bravoSuccessTxt, isRTL && styles.txtRtl]}>
              {t('applySchoolsTourTrackerDone')}
            </Text>
          </View>
        ) : (
          <>
        <View style={[styles.actionHeader, isRTL && styles.actionHeaderRtl]}>
          <FontAwesome
            name={done ? 'check-circle' : 'hand-pointer-o'}
            size={16}
            color={done ? homeShell.greenDark : brand.primary}
          />
          <Text style={[styles.actionTitle, isRTL && styles.txtRtl]}>
            {isRTL ? formatArabicParagraph(t('applySchoolsTourTrackerActionTitle')) : t('applySchoolsTourTrackerActionTitle')}
          </Text>
        </View>
        <Text style={[styles.actionBody, isRTL && styles.txtRtl]}>{actionLabel}</Text>
        <View
          style={[
            styles.statusChip,
            done ? styles.statusChipDone : styles.statusChipPending,
            isRTL && styles.statusChipRtl,
          ]}>
          <Text style={[styles.statusChipTxt, done && styles.statusChipTxtDone, isRTL && styles.txtRtl]}>
            {done ? t('applySchoolsTourTrackerDone') : t('applySchoolsTourTrackerPending')}
          </Text>
        </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  wrapRtl: {
    direction: 'rtl',
    alignItems: 'stretch',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  stepRowRtl: {
    direction: 'rtl',
  },
  stepCounter: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.textMuted,
    letterSpacing: 0.3,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dotsRowRtl: {
    direction: 'rtl',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  dotReached: {
    backgroundColor: homeShell.greenAlpha28,
  },
  dotDone: {
    backgroundColor: homeShell.green,
  },
  dotCurrent: {
    width: 14,
    height: 6,
    borderRadius: 3,
  },
  actionCard: {
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: homeShell.borderOnWhite,
    gap: spacing.xs,
  },
  actionCardRtl: {
    direction: 'rtl',
    alignItems: 'stretch',
  },
  actionCardDone: {
    borderColor: homeShell.green,
    backgroundColor: homeShell.greenAlpha11,
  },
  actionCardBravo: {
    alignItems: 'center',
  },
  bravoSuccessWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  bravoSuccessTxt: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: homeShell.greenDark,
    textAlign: 'center',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionHeaderRtl: {
    direction: 'rtl',
  },
  actionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.primary,
    letterSpacing: 0.3,
  },
  actionBody: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: brand.text,
    lineHeight: 20,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusChipRtl: {
    alignSelf: 'flex-start',
  },
  statusChipPending: {
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
  },
  statusChipDone: {
    backgroundColor: homeShell.green,
  },
  statusChipTxt: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.primary,
  },
  statusChipTxtDone: {
    color: homeShell.text,
  },
  txtRtl: {
    writingDirection: 'rtl',
    textAlign: 'right',
    alignSelf: 'stretch',
  },
});
