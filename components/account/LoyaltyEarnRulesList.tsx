import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { LoyaltyEarnRule } from '@/services/loyalty';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, spacing } from '@/theme/tokens';

type Props = {
  rules: LoyaltyEarnRule[];
  rtl: boolean;
  locale: 'fr' | 'ar';
  defaultPointsPerMad: number;
  title: string;
  selfSectionTitle: string;
  referrerSectionTitle: string;
  pointsUnit: string;
  perMadSuffix: string;
};

function formatRulePoints(rule: LoyaltyEarnRule, defaultPerMad: number, pointsUnit: string, perMadSuffix: string): string {
  if (rule.isVariableMad) {
    const rate = rule.pointsPerMad ?? defaultPerMad;
    return `${rate} ${pointsUnit} ${perMadSuffix}`.replace(/\s+/g, ' ').trim();
  }
  return `+${rule.points} ${pointsUnit}`;
}

export function LoyaltyEarnRulesList({
  rules,
  rtl,
  locale,
  defaultPointsPerMad,
  title,
  selfSectionTitle,
  referrerSectionTitle,
  pointsUnit,
  perMadSuffix,
}: Props) {
  const self = rules.filter((r) => r.audience === 'self');
  const referrer = rules.filter((r) => r.audience === 'referrer');

  const label = (r: LoyaltyEarnRule) =>
    locale === 'ar' && r.labelAr ? r.labelAr : r.labelFr ?? r.actionKey;

  return (
    <View style={[styles.wrap, rtl && styles.wrapRtl]}>
      <Text style={[styles.title, rtl && styles.txtRtl]}>{title}</Text>
      <Text style={[styles.section, rtl && styles.txtRtl]}>{selfSectionTitle}</Text>
      {self.map((r) => (
        <View key={r.actionKey} style={[styles.row, rtl && styles.rowRtl]}>
          <Text style={[styles.rowLabel, rtl && styles.txtRtl]}>{label(r)}</Text>
          <Text style={[styles.rowPts, rtl && styles.txtRtl]}>
            {formatRulePoints(r, defaultPointsPerMad, pointsUnit, perMadSuffix)}
          </Text>
        </View>
      ))}
      <Text style={[styles.section, styles.sectionSpaced, rtl && styles.txtRtl]}>{referrerSectionTitle}</Text>
      {referrer.map((r) => (
        <View key={r.actionKey} style={[styles.row, rtl && styles.rowRtl]}>
          <Text style={[styles.rowLabel, rtl && styles.txtRtl]}>{label(r)}</Text>
          <Text style={[styles.rowPts, rtl && styles.txtRtl]}>
            {formatRulePoints(r, defaultPointsPerMad, pointsUnit, perMadSuffix)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  wrapRtl: { direction: 'rtl', alignItems: 'stretch' },
  title: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: homeShell.cardText,
    marginBottom: spacing.xs,
  },
  section: {
    fontSize: 10,
    fontWeight: '700',
    color: homeShell.cardMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: spacing.xs,
  },
  sectionSpaced: { marginTop: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: homeShell.borderOnWhite,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  rowLabel: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: homeShell.cardText,
  },
  rowPts: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.primary,
  },
  txtRtl: { textAlign: 'right', writingDirection: 'rtl' },
});
