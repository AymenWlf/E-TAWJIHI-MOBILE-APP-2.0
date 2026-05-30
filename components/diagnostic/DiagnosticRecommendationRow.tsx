import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, View } from 'react-native';

import { EstablishmentRowLogoThumb } from '@/components/shop/EstablishmentRowLogoThumb';
import { EstablishmentTypeBadge } from '@/components/ui/EstablishmentTypeBadge';
import { Text } from '@/components/ui/Text';
import type { SchoolDiagnosticRecommendationItem } from '@/services/schoolRecommendationDiagnostic';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { establishmentRecommendationTitle, formatDiagnosticPercent } from '@/utils/diagnosticDisplayText';
import { formatNoteFr20 } from '@/utils/diagnosticBacComparisonNote';
import { preserveLtrDigitsInRtlLabel } from '@/utils/bidiText';
import {
  SEUIL_COMPATIBILITY_COLOR,
  SEUIL_COMPATIBILITY_LABEL,
  type SeuilCompatibilityInfo,
} from '@/utils/schoolDiagnosticSeuilCompatibility';
import { tierColor } from '@/utils/schoolDiagnosticTier';

const IA_LABEL = { fr: 'IA', ar: 'ذكاء اصطناعي' } as const;

function iaScoreAccent(score: number): string {
  if (score >= 75) return homeShell.greenDark;
  if (score >= 55) return brand.primary;
  return '#D97706';
}

type Props = {
  row: SchoolDiagnosticRecommendationItem;
  tier: 'recommended' | 'possible' | 'last' | 'avoid';
  isRTL: boolean;
  reportLocale: 'fr' | 'ar';
  seuilCompatibility: SeuilCompatibilityInfo;
  onPress: () => void;
  showFollowAction?: boolean;
  isFollowing?: boolean;
  followBusy?: boolean;
  onToggleFollow?: () => void;
  followLabelFollow?: string;
  followLabelFollowing?: string;
};

export function DiagnosticRecommendationRow({
  row,
  tier,
  isRTL,
  reportLocale,
  seuilCompatibility,
  onPress,
  showFollowAction = false,
  isFollowing = false,
  followBusy = false,
  onToggleFollow,
  followLabelFollow = 'Suivre',
  followLabelFollowing = 'Suivi',
}: Props) {
  const title = establishmentRecommendationTitle(row, isRTL);
  const scoreLabel = formatDiagnosticPercent(row.combinedScore, isRTL);
  const iaScore = row.iaScore != null ? Math.round(row.iaScore) : null;
  const iaAccent = iaScore != null ? iaScoreAccent(iaScore) : brand.primary;
  const iaPctLabel =
    iaScore != null ? formatDiagnosticPercent(iaScore, isRTL) : '';

  const accent = tierColor(tier);
  const seuilLabels = SEUIL_COMPATIBILITY_LABEL[reportLocale];
  const seuilKind = seuilCompatibility.kind;
  const seuilLabel = seuilLabels[seuilKind];
  const seuilAccent = SEUIL_COMPATIBILITY_COLOR[seuilKind];
  const showSeuilBadge = seuilKind !== 'unknown';
  const seuilValue =
    seuilCompatibility.seuil != null ? `${formatNoteFr20(seuilCompatibility.seuil)}/20` : null;

  return (
    <View
      style={[
        styles.card,
        isRTL && styles.cardRtl,
        { borderStartColor: accent },
      ]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.topRow, isRTL && styles.topRowRtl, pressed && { opacity: 0.92 }]}>
        <EstablishmentRowLogoThumb logo={row.logo} nom={row.nom} sigle={row.sigle} size={56} />
        <View style={styles.body}>
          <Text style={[styles.title, isRTL && styles.rtlText]} numberOfLines={2}>
            {title}
          </Text>
          <View style={[styles.metaRow, isRTL && styles.metaRowRtl]}>
            {row.ville ? (
              <Text style={[styles.ville, isRTL && styles.rtlText]} numberOfLines={1}>
                {preserveLtrDigitsInRtlLabel(row.ville, isRTL)}
              </Text>
            ) : null}
            <EstablishmentTypeBadge type={row.typeEcole} size="xs" />
          </View>
          {showSeuilBadge ? (
            <View style={[styles.seuilBadge, isRTL && styles.seuilBadgeRtl]}>
              <View
                style={[
                  styles.seuilBadgePill,
                  { backgroundColor: `${seuilAccent}18`, borderColor: `${seuilAccent}55` },
                ]}>
                <FontAwesome
                  name={
                    seuilKind === 'compatible'
                      ? 'check-circle'
                      : seuilKind === 'almost'
                        ? 'exclamation-circle'
                        : 'times-circle'
                  }
                  size={11}
                  color={seuilAccent}
                />
                <Text style={[styles.seuilBadgeLabel, isRTL && styles.rtlText, { color: seuilAccent }]}>
                  {seuilLabel}
                </Text>
              </View>
              {seuilValue ? (
                <Text style={[styles.seuilValue, isRTL && styles.rtlText]} latinDigits>
                  {reportLocale === 'ar' ? 'عتبة النقط: ' : 'Seuil: '}
                  {seuilValue}
                </Text>
              ) : null}
            </View>
          ) : null}
          {iaScore != null ? (
            <View style={[styles.iaBadge, isRTL && styles.iaBadgeRtl]}>
              <View style={[styles.iaBadgeLead, { backgroundColor: `${iaAccent}18` }]}>
                <FontAwesome name="magic" size={11} color={iaAccent} />
                <Text style={[styles.iaBadgeLabel, isRTL && styles.rtlText, { color: iaAccent }]}>
                  {IA_LABEL[isRTL ? 'ar' : 'fr']}
                </Text>
              </View>
              <View
                style={[
                  styles.iaPctPill,
                  { backgroundColor: `${iaAccent}20`, borderColor: `${iaAccent}55` },
                ]}>
                <Text
                  style={[styles.iaPctValue, { color: iaAccent }]}
                  latinDigits>
                  {iaPctLabel}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
        <View
          style={[
            styles.scoreWrap,
            isRTL && styles.scoreWrapRtl,
            { borderColor: accent, backgroundColor: `${accent}14` },
          ]}>
          <Text
            style={[styles.scoreLabel, { color: accent }]}
            latinDigits={isRTL}>
            {scoreLabel}
          </Text>
        </View>
        <FontAwesome
          name={isRTL ? 'chevron-left' : 'chevron-right'}
          size={12}
          color={brand.textMuted}
          style={styles.chevron}
        />
      </Pressable>

      {showFollowAction && onToggleFollow ? (
        <Pressable
          onPress={() => {
            if (!followBusy) onToggleFollow();
          }}
          disabled={followBusy}
          style={({ pressed }) => [
            styles.followRow,
            isRTL && styles.followRowRtl,
            isFollowing && styles.followRowActive,
            followBusy && styles.followRowBusy,
            pressed && !followBusy && { opacity: 0.9 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={isFollowing ? followLabelFollowing : followLabelFollow}>
          {followBusy ? (
            <FontAwesome
              name="circle-o-notch"
              size={14}
              color={isFollowing ? brand.white : brand.primary}
            />
          ) : (
            <FontAwesome
              name={isFollowing ? 'check' : 'heart-o'}
              size={14}
              color={isFollowing ? brand.white : brand.primary}
            />
          )}
          <Text
            style={[
              styles.followRowTxt,
              isFollowing && styles.followRowTxtActive,
              isRTL && styles.rtlText,
            ]}>
            {isFollowing ? followLabelFollowing : followLabelFollow}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    borderStartWidth: 4,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardRtl: { direction: 'rtl' },
  rtlText: { writingDirection: 'rtl', textAlign: 'right' },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    paddingStart: spacing.md,
  },
  topRowRtl: { direction: 'rtl' },
  body: { flex: 1, minWidth: 0, gap: 4 },
  title: { fontWeight: '800', fontSize: fontSize.sm, color: brand.text, lineHeight: 20 },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  metaRowRtl: { direction: 'rtl' },
  ville: { fontSize: fontSize.xs, color: brand.textMuted, flexShrink: 1 },
  seuilBadge: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  seuilBadgeRtl: { direction: 'rtl' },
  seuilBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  seuilBadgeLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.15,
  },
  seuilValue: {
    fontSize: 10,
    fontWeight: '600',
    color: brand.textMuted,
  },
  iaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 2,
  },
  iaBadgeRtl: { direction: 'rtl' },
  iaBadgeLead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.full,
  },
  iaBadgeLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  iaPctPill: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: radius.full,
    borderWidth: 1.5,
    minWidth: 44,
    alignItems: 'center',
    direction: 'ltr',
  },
  iaPctValue: {
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 14,
    textAlign: 'center',
  },
  scoreWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 52,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: radius.md,
    borderWidth: 2,
  },
  scoreWrapRtl: { direction: 'ltr' },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 22,
    textAlign: 'center',
  },
  chevron: { marginStart: 2 },
  followRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: homeShell.borderOnWhite,
    backgroundColor: `${brand.primary}08`,
  },
  followRowRtl: { direction: 'rtl' },
  followRowActive: {
    backgroundColor: brand.primary,
    borderTopColor: brand.primary,
  },
  followRowBusy: { opacity: 0.65 },
  followRowTxt: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.primary,
  },
  followRowTxtActive: {
    color: brand.white,
  },
});
