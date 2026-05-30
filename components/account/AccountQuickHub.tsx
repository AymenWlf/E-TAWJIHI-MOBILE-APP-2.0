import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { HomeCopyKey } from '@/constants/i18n';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

type HubTile = {
  id: 'orders' | 'services' | 'referral';
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  subtitle?: string;
  badge?: string;
  accent: string;
  onPress: () => void;
};

type Props = {
  rtl: boolean;
  t: (k: HomeCopyKey) => string;
  openOrdersCount: number;
  servicesCount: number;
  referralQualifiedCount: number;
  referralUnlocked: boolean;
  referralRequiredServiceName: string;
  onPressOrders: () => void;
  onPressServices: () => void;
  onPressReferral: () => void;
};

export function AccountQuickHub({
  rtl,
  t,
  openOrdersCount,
  servicesCount,
  referralQualifiedCount,
  referralUnlocked,
  referralRequiredServiceName,
  onPressOrders,
  onPressServices,
  onPressReferral,
}: Props) {
  const tiles: HubTile[] = [
    {
      id: 'orders',
      icon: 'shopping-bag',
      label: t('accountSectionOrders'),
      subtitle:
        openOrdersCount > 0
          ? t('accountOrdersOpenCount').replace('{{count}}', String(openOrdersCount))
          : t('accountOrdersEmpty'),
      badge: openOrdersCount > 0 ? (openOrdersCount > 99 ? '99+' : String(openOrdersCount)) : undefined,
      accent: brand.primary,
      onPress: onPressOrders,
    },
    {
      id: 'services',
      icon: 'graduation-cap',
      label: t('accountSectionActiveServices'),
      subtitle: servicesCount > 0 ? undefined : t('accountActiveServicesEmpty'),
      badge: servicesCount > 0 ? String(servicesCount) : undefined,
      accent: homeShell.greenDark,
      onPress: onPressServices,
    },
    {
      id: 'referral',
      icon: referralUnlocked ? 'gift' : 'lock',
      label: t('referralTeaserTitle'),
      subtitle: referralUnlocked
        ? referralQualifiedCount > 0
          ? t('referralQualifiedCount').replace('{{count}}', String(referralQualifiedCount))
          : undefined
        : t('referralLockedBody').replace('{{service}}', referralRequiredServiceName),
      accent: referralUnlocked ? '#7C3AED' : homeShell.cardMuted,
      onPress: onPressReferral,
    },
  ];

  return (
    <View style={styles.wrap}>
      <View style={[styles.grid, rtl && styles.gridRtl]}>
        {tiles.map((tile) => (
          <Pressable
            key={tile.id}
            onPress={tile.onPress}
            accessibilityRole="button"
            style={({ pressed }) => [styles.tile, pressed && { opacity: 0.92, transform: [{ scale: 0.98 }] }]}>
            <View style={[styles.tileIcon, { backgroundColor: `${tile.accent}14` }]}>
              <FontAwesome name={tile.icon} size={18} color={tile.accent} />
              {tile.badge ? (
                <View style={[styles.badge, { backgroundColor: tile.accent }]}>
                  <Text style={styles.badgeTxt}>{tile.badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.tileLabel, rtl && styles.txtRtl]} numberOfLines={2}>
              {tile.label}
            </Text>
            {tile.subtitle ? (
              <Text style={[styles.tileSub, rtl && styles.txtRtl]} numberOfLines={2}>
                {tile.subtitle}
              </Text>
            ) : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  txtRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
    textTransform: 'none',
    letterSpacing: 0,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  gridRtl: {
    flexDirection: 'row-reverse',
  },
  tile: {
    flex: 1,
    minWidth: 0,
    backgroundColor: homeShell.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 6,
  },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    end: -4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: brand.white,
  },
  badgeTxt: {
    color: brand.white,
    fontSize: 9,
    fontWeight: '800',
  },
  tileLabel: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: homeShell.cardText,
    lineHeight: 18,
  },
  tileSub: {
    fontSize: 11,
    fontWeight: '600',
    color: homeShell.cardMuted,
    lineHeight: 15,
  },
});
