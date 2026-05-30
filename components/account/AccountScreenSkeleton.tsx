import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { SkeletonBlock, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import { homeShell } from '@/theme/homeShell';
import { radius, spacing } from '@/theme/tokens';

type Props = {
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Carte identité + section profil (chargement auth / profil). */
export function AccountProfileLoadingSkeleton({ isRTL = false, style }: Props) {
  const pulseStyle = useSkeletonPulse();

  return (
    <View style={[styles.wrap, style]}>
      <View style={[styles.identityCard, isRTL && styles.identityCardRtl]}>
        <SkeletonBlock style={styles.avatarRing} pulseStyle={pulseStyle} />
        <View style={[styles.identityTextCol, isRTL && styles.identityTextColRtl]}>
          <SkeletonBlock style={styles.identityName} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.identityMeta} pulseStyle={pulseStyle} />
        </View>
      </View>

      <View style={styles.card}>
        <View style={[styles.sectionHead, isRTL && styles.sectionHeadRtl]}>
          <SkeletonBlock style={styles.sectionIcon} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.sectionTitle} pulseStyle={pulseStyle} />
        </View>
        <AccountFieldSkeleton isRTL={isRTL} />
        <AccountFieldSkeleton isRTL={isRTL} />
        <AccountFieldSkeleton isRTL={isRTL} short />
      </View>

      <View style={styles.card}>
        <View style={[styles.sectionHead, isRTL && styles.sectionHeadRtl]}>
          <SkeletonBlock style={styles.sectionIcon} pulseStyle={pulseStyle} />
          <SkeletonBlock style={[styles.sectionTitle, styles.sectionTitleShort]} pulseStyle={pulseStyle} />
        </View>
        <SkeletonBlock style={styles.teaserBlock} pulseStyle={pulseStyle} />
      </View>
    </View>
  );
}

function AccountFieldSkeleton({ isRTL = false, short = false }: { isRTL?: boolean; short?: boolean }) {
  const pulseStyle = useSkeletonPulse();
  return (
    <View style={styles.field}>
      <SkeletonBlock style={styles.fieldLabel} pulseStyle={pulseStyle} />
      <SkeletonBlock
        style={[styles.fieldInput, short && styles.fieldInputShort]}
        pulseStyle={pulseStyle}
      />
    </View>
  );
}

export function AccountOrderRowSkeleton({
  isRTL = false,
  first = false,
}: {
  isRTL?: boolean;
  first?: boolean;
}) {
  const pulseStyle = useSkeletonPulse();

  return (
    <View style={[styles.orderRow, first && styles.orderRowFirst, isRTL && styles.orderRowRtl]}>
      <SkeletonBlock style={styles.orderIconWrap} pulseStyle={pulseStyle} />
      <View style={styles.orderBody}>
        <View style={[styles.orderTopLine, isRTL && styles.orderTopLineRtl]}>
          <SkeletonBlock style={styles.orderNumber} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.orderDate} pulseStyle={pulseStyle} />
        </View>
        <SkeletonBlock style={styles.orderItemTitle} pulseStyle={pulseStyle} />
        <View style={[styles.orderBottomLine, isRTL && styles.orderBottomLineRtl]}>
          <SkeletonBlock style={styles.orderTotal} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.orderStatusBadge} pulseStyle={pulseStyle} />
        </View>
        <SkeletonBlock style={styles.orderDetailLink} pulseStyle={pulseStyle} />
      </View>
      <SkeletonBlock style={styles.orderChev} pulseStyle={pulseStyle} />
    </View>
  );
}

/** Lignes commande dans la carte « Mes commandes ». */
export function AccountOrdersLoadingSkeleton({
  count = 2,
  isRTL = false,
  style,
}: {
  count?: number;
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const pulseStyle = useSkeletonPulse();

  return (
    <View style={[styles.ordersWrap, style]}>
      <View style={[styles.ordersTabs, isRTL && styles.ordersTabsRtl]}>
        <SkeletonBlock style={styles.ordersTab} pulseStyle={pulseStyle} />
        <SkeletonBlock style={styles.ordersTab} pulseStyle={pulseStyle} />
        <SkeletonBlock style={styles.ordersTab} pulseStyle={pulseStyle} />
      </View>
      {Array.from({ length: count }, (_, i) => (
        <AccountOrderRowSkeleton key={i} isRTL={isRTL} first={i === 0} />
      ))}
    </View>
  );
}

const sk = 'rgba(51, 62, 143, 0.1)';
const skStrong = 'rgba(51, 62, 143, 0.16)';

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignSelf: 'stretch',
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: homeShell.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(47,206,148,0.22)',
  },
  identityCardRtl: {
    flexDirection: 'row-reverse',
  },
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: sk,
  },
  identityTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 8,
  },
  identityTextColRtl: {
    alignItems: 'flex-end',
  },
  identityName: {
    width: '72%',
    height: 20,
    borderRadius: 5,
    backgroundColor: skStrong,
  },
  identityMeta: {
    width: '55%',
    height: 14,
    borderRadius: 4,
    backgroundColor: sk,
  },
  card: {
    backgroundColor: homeShell.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    marginBottom: spacing.lg,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionHeadRtl: {
    flexDirection: 'row-reverse',
  },
  sectionIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: sk,
  },
  sectionTitle: {
    flex: 1,
    height: 16,
    borderRadius: 4,
    backgroundColor: skStrong,
    maxWidth: '70%',
  },
  sectionTitleShort: {
    maxWidth: '50%',
  },
  field: {
    marginTop: spacing.md,
    gap: 6,
  },
  fieldLabel: {
    width: 96,
    height: 11,
    borderRadius: 3,
    backgroundColor: sk,
  },
  fieldInput: {
    width: '100%',
    height: 44,
    borderRadius: radius.md,
    backgroundColor: sk,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
  },
  fieldInputShort: {
    height: 40,
    width: '88%',
  },
  teaserBlock: {
    width: '100%',
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: sk,
  },
  ordersWrap: {
    width: '100%',
  },
  ordersTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  ordersTabsRtl: {
    flexDirection: 'row-reverse',
  },
  ordersTab: {
    flex: 1,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: sk,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(15,23,42,0.08)',
    gap: spacing.sm,
  },
  orderRowFirst: {
    borderTopWidth: 0,
    paddingTop: 0,
  },
  orderRowRtl: {
    flexDirection: 'row-reverse',
  },
  orderIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: sk,
  },
  orderBody: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  orderTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  orderTopLineRtl: {
    flexDirection: 'row-reverse',
  },
  orderNumber: {
    flex: 1,
    height: 14,
    borderRadius: 4,
    backgroundColor: skStrong,
    maxWidth: '55%',
  },
  orderDate: {
    width: 56,
    height: 12,
    borderRadius: 3,
    backgroundColor: sk,
  },
  orderItemTitle: {
    width: '82%',
    height: 13,
    borderRadius: 4,
    backgroundColor: sk,
  },
  orderBottomLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: 2,
  },
  orderBottomLineRtl: {
    flexDirection: 'row-reverse',
  },
  orderTotal: {
    width: 64,
    height: 15,
    borderRadius: 4,
    backgroundColor: skStrong,
  },
  orderStatusBadge: {
    width: 72,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: sk,
  },
  orderDetailLink: {
    width: 100,
    height: 11,
    borderRadius: 3,
    backgroundColor: sk,
    marginTop: 2,
  },
  orderChev: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: sk,
    marginTop: 4,
  },
});
