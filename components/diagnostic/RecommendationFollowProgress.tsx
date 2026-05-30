import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import {
  formatRecommendationFollowProgressHint,
  formatRecommendationFollowProgressTitle,
  RECOMMENDATION_FOLLOW_MIN_COUNT,
  type RecommendationFollowCopyLocale,
} from '@/constants/recommendationParcours';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

type Props = {
  followCount: number;
  locale: RecommendationFollowCopyLocale;
  isRTL?: boolean;
};

export function RecommendationFollowProgress({ followCount, locale, isRTL = false }: Props) {
  const goal = RECOMMENDATION_FOLLOW_MIN_COUNT;
  const done = Math.max(0, Math.floor(followCount));
  const satisfied = done >= goal;
  const fillPct = Math.min(100, (done / goal) * 100);

  return (
    <View
      style={[
        styles.wrap,
        satisfied && styles.wrapDone,
        isRTL && styles.wrapRtl,
      ]}>
      <View style={[styles.headRow, isRTL && styles.headRowRtl]}>
        <FontAwesome
          name={satisfied ? 'check-circle' : 'heart-o'}
          size={16}
          color={satisfied ? homeShell.greenDark : brand.primary}
        />
        <Text style={[styles.title, isRTL && styles.rtlText]}>
          {formatRecommendationFollowProgressTitle(done, locale)}
        </Text>
        <Text style={[styles.ratio, isRTL && styles.rtlText]} latinDigits>
          {done}/{goal}
        </Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            satisfied && styles.fillDone,
            { width: `${fillPct}%` },
          ]}
        />
      </View>
      <Text style={[styles.hint, isRTL && styles.rtlText]}>
        {formatRecommendationFollowProgressHint(done, locale)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${brand.primary}40`,
    backgroundColor: `${brand.primary}10`,
    gap: spacing.sm,
  },
  wrapDone: {
    borderColor: `${homeShell.greenDark}55`,
    backgroundColor: homeShell.greenAlpha18,
  },
  wrapRtl: { direction: 'rtl' },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headRowRtl: { flexDirection: 'row-reverse' },
  title: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: brand.text,
    lineHeight: 20,
  },
  ratio: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.primary,
    minWidth: 36,
    textAlign: 'right',
  },
  track: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: `${brand.primary}18`,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: brand.primary,
  },
  fillDone: {
    backgroundColor: homeShell.greenDark,
  },
  hint: {
    fontSize: fontSize.xs,
    lineHeight: 18,
    color: brand.textMuted,
    fontWeight: '500',
  },
  rtlText: { writingDirection: 'rtl', textAlign: 'right' },
});
