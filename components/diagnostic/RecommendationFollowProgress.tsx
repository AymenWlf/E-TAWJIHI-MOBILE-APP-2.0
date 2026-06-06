import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

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
  style?: StyleProp<ViewStyle>;
};

export function RecommendationFollowProgress({
  followCount,
  locale,
  isRTL = false,
  style,
}: Props) {
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
        style,
      ]}>
      <View style={[styles.headRow, isRTL && styles.headRowRtl]}>
        <FontAwesome
          name={satisfied ? 'check-circle' : 'heart-o'}
          size={13}
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
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: `${brand.primary}40`,
    backgroundColor: `${brand.primary}10`,
    gap: spacing.xs,
  },
  wrapDone: {
    borderColor: `${homeShell.greenDark}55`,
    backgroundColor: homeShell.greenAlpha18,
  },
  wrapRtl: { direction: 'rtl' },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headRowRtl: { flexDirection: 'row-reverse' },
  title: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: brand.text,
    lineHeight: 16,
  },
  ratio: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.primary,
    minWidth: 30,
    textAlign: 'right',
  },
  track: {
    height: 5,
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
    fontSize: 10,
    lineHeight: 14,
    color: brand.textMuted,
    fontWeight: '500',
  },
  rtlText: { writingDirection: 'rtl', textAlign: 'right' },
});
