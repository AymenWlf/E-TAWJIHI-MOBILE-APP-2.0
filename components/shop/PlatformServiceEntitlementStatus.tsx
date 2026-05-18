import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { brand, radius, spacing } from '@/theme/tokens';
import type { PlatformServiceCatalogEntitlement } from '@/services/platformServices';
import {
  platformServiceEntitlementBadgeTone,
  platformServiceEntitlementShortLabel,
  resolveUpgradeSourceName,
} from '@/utils/platformServiceEntitlementUi';

type Props = {
  entitlement?: PlatformServiceCatalogEntitlement;
  entitlementsLoading?: boolean;
  serviceNameBySlug: Map<string, string>;
  locale: 'fr' | 'ar';
  isRTL: boolean;
  t: (key: string) => string;
  /** compact = pill seul ; full = pill + encart message API si différent */
  variant?: 'compact' | 'full';
};

function toneStyles(tone: ReturnType<typeof platformServiceEntitlementBadgeTone>) {
  switch (tone) {
    case 'success':
      return {
        pill: styles.pillSuccess,
        pillTxt: styles.pillTxtSuccess,
        icon: brand.emerald,
        card: styles.cardSuccess,
        cardTxt: styles.cardTxtSuccess,
      };
    case 'warning':
      return {
        pill: styles.pillWarning,
        pillTxt: styles.pillTxtWarning,
        icon: '#B45309',
        card: styles.cardWarning,
        cardTxt: styles.cardTxtWarning,
      };
    case 'danger':
      return {
        pill: styles.pillDanger,
        pillTxt: styles.pillTxtDanger,
        icon: '#B91C1C',
        card: styles.cardDanger,
        cardTxt: styles.cardTxtDanger,
      };
    case 'info':
      return {
        pill: styles.pillInfo,
        pillTxt: styles.pillTxtInfo,
        icon: brand.primary,
        card: styles.cardInfo,
        cardTxt: styles.cardTxtInfo,
      };
    default:
      return {
        pill: styles.pillMuted,
        pillTxt: styles.pillTxtMuted,
        icon: brand.textMuted,
        card: styles.cardMuted,
        cardTxt: styles.cardTxtMuted,
      };
  }
}

function iconName(status: PlatformServiceCatalogEntitlement['status'] | undefined): string {
  if (status === 'included' || status === 'already_owned') return 'gift';
  if (status === 'upgrade_available') return 'level-up';
  if (status === 'blocked') return 'ban';
  if (status === 'requires_prerequisite') return 'exclamation-circle';
  return 'info-circle';
}

export function PlatformServiceEntitlementStatus({
  entitlement,
  entitlementsLoading = false,
  serviceNameBySlug,
  locale,
  isRTL,
  t,
  variant = 'full',
}: Props) {
  if (entitlementsLoading) {
    return (
      <View style={[styles.row, isRTL && styles.rowRtl]}>
        <View style={[styles.pill, styles.pillInfo, isRTL && styles.rowRtl]}>
          <ActivityIndicator size="small" color={brand.primary} />
          <Text style={[styles.pillTxt, styles.pillTxtInfo, isRTL && styles.txtRtl]} numberOfLines={2}>
            {t('shopEntitlementChecking')}
          </Text>
        </View>
      </View>
    );
  }

  const includedViaName = entitlement?.includedViaSlug
    ? serviceNameBySlug.get(entitlement.includedViaSlug) ?? entitlement.includedViaSlug
    : null;
  const shortLabel = platformServiceEntitlementShortLabel(
    entitlement,
    t as (key: string) => string,
    includedViaName,
  );
  const apiMessage = entitlement?.message?.trim() ?? '';
  if (!shortLabel && !apiMessage) return null;

  const tone = platformServiceEntitlementBadgeTone(entitlement?.status);
  const ts = toneStyles(tone);
  const showDetailCard =
    variant === 'full' &&
    apiMessage !== '' &&
    apiMessage !== shortLabel &&
    (entitlement?.status === 'blocked' ||
      entitlement?.status === 'requires_prerequisite' ||
      entitlement?.status === 'included' ||
      entitlement?.status === 'already_owned' ||
      entitlement?.status === 'upgrade_available');

  return (
    <View style={styles.wrap}>
      {shortLabel ? (
        <View style={[styles.pill, ts.pill, isRTL && styles.rowRtl]}>
          <FontAwesome name={iconName(entitlement?.status) as 'gift'} size={11} color={ts.icon} />
          <Text style={[styles.pillTxt, ts.pillTxt, isRTL && styles.txtRtl]} numberOfLines={3}>
            {shortLabel}
          </Text>
        </View>
      ) : null}
      {showDetailCard ? (
        <View style={[styles.card, ts.card]}>
          <Text style={[styles.cardTxt, ts.cardTxt, isRTL && styles.txtRtl]}>{apiMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginTop: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  rowRtl: { flexDirection: 'row-reverse' },
  pill: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  pillTxt: { flex: 1, fontSize: 12, fontWeight: '700', lineHeight: 17 },
  txtRtl: { textAlign: 'right' },
  pillSuccess: { backgroundColor: 'rgba(47,206,148,0.12)', borderColor: 'rgba(47,206,148,0.35)' },
  pillTxtSuccess: { color: '#047857' },
  pillInfo: { backgroundColor: 'rgba(51,62,143,0.08)', borderColor: 'rgba(51,62,143,0.2)' },
  pillTxtInfo: { color: brand.primary },
  pillWarning: { backgroundColor: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.3)' },
  pillTxtWarning: { color: '#B45309' },
  pillDanger: { backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' },
  pillTxtDanger: { color: '#B91C1C' },
  pillMuted: { backgroundColor: brand.backgroundSoft, borderColor: brand.border },
  pillTxtMuted: { color: brand.textSecondary },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  cardTxt: { fontSize: 13, fontWeight: '600', lineHeight: 19 },
  cardSuccess: { backgroundColor: 'rgba(47,206,148,0.08)', borderColor: 'rgba(47,206,148,0.22)' },
  cardTxtSuccess: { color: '#065F46' },
  cardInfo: { backgroundColor: 'rgba(51,62,143,0.06)', borderColor: 'rgba(51,62,143,0.14)' },
  cardTxtInfo: { color: brand.text },
  cardWarning: { backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.25)' },
  cardTxtWarning: { color: '#92400E' },
  cardDanger: { backgroundColor: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' },
  cardTxtDanger: { color: '#991B1B' },
  cardMuted: { backgroundColor: brand.backgroundSoft, borderColor: brand.border },
  cardTxtMuted: { color: brand.textSecondary },
});
