import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { useNotificationsDrawer } from '@/contexts/NotificationsDrawerContext';
import { useShopCart } from '@/contexts/ShopCartContext';
import { CAIRO } from '@/theme/arabicTypography';
import { brand } from '@/theme/tokens';

const INACTIVE = '#64748B';
const CENTER_TAB_SIZE = 54;
const CENTER_TAB_LIFT = 18;

function TabIcon({
  name,
  focused,
  color,
  size,
  badgeCount,
}: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  focused: boolean;
  /** Fourni par React Navigation (TabBarIcon) — aligne la taille sur la zone allouée. */
  color: string;
  size: number;
  badgeCount?: number;
}) {
  return (
    <View style={styles.iconWrap}>
      <View style={[styles.iconInner, focused && styles.iconInnerActive]}>
        <FontAwesome name={name} size={size} color={color} />
      </View>
      {badgeCount && badgeCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeTxt}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
        </View>
      ) : null}
    </View>
  );
}

/** Onglet central « Inscriptions » — bulle surélevée, arrondie, centrée (style chat FAB). */
function CenterInscriptionsTabIcon({
  focused,
  badgeCount,
}: {
  focused: boolean;
  badgeCount?: number;
}) {
  return (
    <View style={styles.centerTabSlot}>
      <View style={[styles.centerTabBubble, focused ? styles.centerTabBubbleActive : styles.centerTabBubbleIdle]}>
        <FontAwesome name="calendar" size={22} color={focused ? brand.white : brand.primary} />
      </View>
      {badgeCount && badgeCount > 0 ? (
        <View style={styles.centerTabBadge}>
          <Text style={styles.badgeTxt}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
        </View>
      ) : null}
    </View>
  );
}

function CenterTabBarButton(props: BottomTabBarButtonProps) {
  return <PlatformPressable {...props} style={[props.style, styles.centerTabButton]} />;
}

export default function TabLayout() {
  const { t, isRTL } = useLocale();
  const { count: cartCount } = useShopCart();
  const { inscriptionsTabBadgeCount } = useNotificationsDrawer();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        /** iPhone par défaut ; iPad/tablette (≥768px) passent en « beside-icon » sans cette option. */
        tabBarLabelPosition: 'below-icon',
        tabBarActiveTintColor: brand.primary,
        tabBarInactiveTintColor: INACTIVE,
        /**
         * RN bottom-tabs utilise un cadre UIKit fixe (~31×28). Notre icône + pastille dépassait
         * → coupe horizontale/verticale (souvent « une moitié » de l’icône visible sur iOS).
         */
        tabBarIconStyle: {
          width: 42,
          height: 34,
          marginTop: Platform.OS === 'ios' ? 2 : 0,
          overflow: 'visible',
        },
        tabBarItemStyle: {
          overflow: 'visible',
        },
        tabBarStyle: {
          backgroundColor: brand.white,
          borderTopColor: brand.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingTop: 10,
          paddingBottom: Math.max(8, insets.bottom),
          overflow: 'visible',
          /** Pas de height fixe : laisse mesurer icônes + labels (évite clipping). */
          minHeight: 56 + Math.max(0, insets.bottom),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          ...(isRTL ? { fontFamily: CAIRO.bold } : {}),
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabHome'),
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="home" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="ecoles"
        options={{
          title: t('tabEcoles'),
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="university" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="inscriptions"
        options={{
          title: t('tabInscriptions'),
          tabBarIcon: ({ focused }) => (
            <CenterInscriptionsTabIcon focused={focused} badgeCount={inscriptionsTabBadgeCount} />
          ),
          tabBarIconStyle: {
            width: CENTER_TAB_SIZE,
            height: CENTER_TAB_SIZE,
            marginTop: 0,
            overflow: 'visible',
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            marginTop: -4,
            ...(isRTL ? { fontFamily: CAIRO.bold } : {}),
          },
          tabBarActiveTintColor: brand.primary,
          tabBarInactiveTintColor: brand.textMuted,
          tabBarButton: CenterTabBarButton,
        }}
      />
      <Tabs.Screen
        name="boutique"
        options={{
          title: t('tabBoutique'),
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="shopping-cart" focused={focused} color={color} size={size} badgeCount={cartCount} />
          ),
        }}
      />
      <Tabs.Screen
        name="compte"
        options={{
          title: t('tabCompte'),
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="user-o" focused={focused} color={color} size={size} />
          ),
        }}
      />
      {/**
       * Événements : même barre d’onglets que le reste de l’app, sans entrée visible
       * (navigation via sidebar / liens). Voir expo-router : `href: null`.
       */}
      <Tabs.Screen
        name="evenements"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 42,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  iconInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  iconInnerActive: {
    backgroundColor: 'rgba(51, 62, 143, 0.12)',
  },
  badge: {
    position: 'absolute',
    top: -2,
    end: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: '#EF4444',
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
  centerTabButton: {
    overflow: 'visible',
  },
  centerTabSlot: {
    width: CENTER_TAB_SIZE,
    height: CENTER_TAB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -CENTER_TAB_LIFT,
    overflow: 'visible',
  },
  centerTabBubble: {
    width: CENTER_TAB_SIZE,
    height: CENTER_TAB_SIZE,
    borderRadius: CENTER_TAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: brand.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 10,
      },
      android: { elevation: 10 },
      default: {},
    }),
  },
  centerTabBubbleActive: {
    backgroundColor: brand.primary,
    borderWidth: 3,
    borderColor: brand.white,
  },
  centerTabBubbleIdle: {
    backgroundColor: brand.white,
    borderWidth: 3,
    borderColor: brand.primary,
  },
  centerTabBadge: {
    position: 'absolute',
    top: -2,
    end: -2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: brand.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: brand.white,
  },
});
