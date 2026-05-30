import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { formatDiagnosticPercent } from '@/utils/diagnosticDisplayText';
import {
  SEUIL_COMPATIBILITY_COLOR,
  SEUIL_COMPATIBILITY_LABEL,
  type SeuilCompatibilityInfo,
} from '@/utils/schoolDiagnosticSeuilCompatibility';
import type { SeuilComparisonSource } from '@/utils/seuilBacComparisonNote';
import { getDiagnosticTier, tierColor } from '@/utils/schoolDiagnosticTier';
import { fontSize, radius } from '@/theme/tokens';

type Locale = 'fr' | 'ar';

type Props = {
  combinedScore: number;
  bacFiliereCompatible?: boolean;
  seuilCompatibility?: SeuilCompatibilityInfo;
  /** Indique si le seuil est calculé avec le bulletin ou le diagnostic (évite l’ambiguïté). */
  seuilNoteSource?: SeuilComparisonSource;
  size?: 'xs' | 'sm' | 'md';
  isRTL?: boolean;
  locale?: Locale;
};

const SEUIL_SHORT = {
  fr: { compatible: 'Seuil compat.', almost: 'Seuil presque', not: 'Seuil non compat.' },
  ar: { compatible: 'عتبة متوافقة', almost: 'عتبة شبه', not: 'عتبة غير متوافقة' },
} as const;

const SEUIL_SOURCE_HINT = {
  fr: { bac_results: 'Bulletin bac', diagnostic: 'Diagnostic' },
  ar: { bac_results: 'البيان', diagnostic: 'التشخيص' },
} as const;

function seuilIconName(kind: SeuilCompatibilityInfo['kind']): ComponentProps<typeof FontAwesome>['name'] {
  switch (kind) {
    case 'compatible':
      return 'check-circle';
    case 'almost':
      return 'exclamation-circle';
    case 'not':
      return 'times-circle';
    default:
      return 'minus-circle';
  }
}

export function DiagnosticRecommendationBadge({
  combinedScore,
  bacFiliereCompatible,
  seuilCompatibility,
  seuilNoteSource,
  size = 'xs',
  isRTL = false,
  locale = 'fr',
}: Props) {
  const tier = getDiagnosticTier({ combinedScore, bacFiliereCompatible });
  const scoreAccent = tierColor(tier);
  const pct = formatDiagnosticPercent(combinedScore, isRTL);
  const compact = size === 'xs';
  const seuilKind = seuilCompatibility?.kind ?? 'unknown';
  const showSeuil = seuilKind !== 'unknown' && seuilCompatibility != null;
  const seuilAccent = SEUIL_COMPATIBILITY_COLOR[seuilKind];
  const seuilBaseLabel = compact
    ? SEUIL_SHORT[locale][seuilKind as keyof (typeof SEUIL_SHORT)['fr']]
    : SEUIL_COMPATIBILITY_LABEL[locale][seuilKind];
  const sourceHint =
    showSeuil && seuilNoteSource ? SEUIL_SOURCE_HINT[locale][seuilNoteSource] : null;
  const seuilLabel = sourceHint ? `${seuilBaseLabel} · ${sourceHint}` : seuilBaseLabel;

  const scoreFont = size === 'md' ? 13 : size === 'sm' ? 12 : 11;
  const seuilFont = size === 'md' ? 11 : 10;
  const padV = size === 'md' ? 5 : 4;
  const padH = size === 'md' ? 10 : size === 'sm' ? 8 : 7;

  return (
    <View style={[styles.wrap, isRTL && styles.wrapRtl]}>
      <View
        style={[
          styles.pill,
          {
            backgroundColor: `${scoreAccent}18`,
            borderColor: `${scoreAccent}55`,
            paddingVertical: padV,
            paddingHorizontal: padH,
          },
        ]}>
        <FontAwesome name="line-chart" size={compact ? 9 : 10} color={scoreAccent} />
        <Text
          style={[styles.scoreTxt, { color: scoreAccent, fontSize: scoreFont }]}
          latinDigits={isRTL}>
          {pct}
        </Text>
      </View>
      {showSeuil ? (
        <View
          style={[
            styles.pill,
            {
              backgroundColor: `${seuilAccent}18`,
              borderColor: `${seuilAccent}55`,
              paddingVertical: padV,
              paddingHorizontal: padH,
            },
          ]}>
          <FontAwesome name={seuilIconName(seuilKind)} size={compact ? 9 : 10} color={seuilAccent} />
          <Text
            style={[styles.seuilTxt, { color: seuilAccent, fontSize: seuilFont }, isRTL && styles.rtlText]}
            numberOfLines={1}>
            {seuilLabel}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
  },
  wrapRtl: { direction: 'rtl' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  scoreTxt: {
    fontWeight: '900',
    lineHeight: 14,
  },
  seuilTxt: {
    fontWeight: '800',
    maxWidth: 120,
  },
  rtlText: { writingDirection: 'rtl' },
});
