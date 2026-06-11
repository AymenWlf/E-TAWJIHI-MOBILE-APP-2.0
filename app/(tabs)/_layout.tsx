import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BottomTabBar, type BottomTabBarButtonProps, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { Tabs } from 'expo-router';
import { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { TawjihPlusAccessProvider } from '@/contexts/TawjihPlusAccessContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useNotificationsDrawer } from '@/contexts/NotificationsDrawerContext';
import { useShopCart } from '@/contexts/ShopCartContext';
import { CAIRO } from '@/theme/arabicTypography';
import { countBadgeTextStyle } from '@/theme/countBadge';
import { buildTabBarStyle, centerTabBarItemStyle, defaultTabBarItemStyle } from '@/theme/tabBar';
import { brand } from '@/theme/tokens';

const INACTIVE = '#64748B';
const CENTER_TAB_SIZE = 54;
/** Surélévation bulle centrale (onglet Annonces). */
const CENTER_TAB_LIFT = Platform.select({ ios: 18, android: 12, default: 18 }) as number;
const TAB_LABEL_FONT_SIZE = Platform.OS === 'android' ? 10 : 11;

function TabBarLabel({
  color,
  children,
  focused,
  isRTL,
  compact,
}: {
  color: string;
  children: string;
  focused: boolean;
  isRTL: boolean;
  compact?: boolean;
}) {
  const label = typeof children === 'string' ? children : String(children ?? '');
  return (
    <Text
      numberOfLines={2}
      ellipsizeMode="tail"
      style={[
        styles.tabLabel,
        compact && styles.tabLabelCompact,
        {
          color,
          fontWeight: focused ? '700' : '600',
          ...(isRTL ? { fontFamily: CAIRO.bold, textAlign: 'center', writingDirection: 'rtl' } : { textAlign: 'center' }),
        },
      ]}
    >
      {label}
    </Text>
  );
}

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
          <Text latinDigits style={styles.badgeTxt}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/** Onglet central « Annonces » — bulle surélevée, arrondie, centrée (style chat FAB). */
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
          <Text latinDigits style={styles.badgeTxt}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function CenterTabBarButton(props: BottomTabBarButtonProps) {
  return <PlatformPressable {...props} style={[props.style, styles.centerTabButton]} />;
}

/**
 * Barre d’onglets RTL : inverse l’ordre des routes affichées.
 * Accueil passe à droite, Compte à gauche (le style `direction` ne cible pas le flex interne de BottomTabBar).
 */
function RtlAwareTabBar(props: BottomTabBarProps) {
  const { isRTL } = useLocale();

  const displayState = useMemo(() => {
    if (!isRTL) return props.state;
    const routes = [...props.state.routes].reverse();
    const activeKey = props.state.routes[props.state.index]?.key;
    if (!activeKey) return props.state;
    const index = routes.findIndex((route) => route.key === activeKey);
    return {
      ...props.state,
      routes,
      index: index >= 0 ? index : props.state.index,
    };
  }, [isRTL, props.state]);

  return <BottomTabBar {...props} state={displayState} />;
}

export default function TabLayout() {
  const { t, isRTL } = useLocale();
  const { count: cartCount } = useShopCart();
  const { inscriptionsTabBadgeCount } = useNotificationsDrawer();
  const insets = useSafeAreaInsets();

  const renderTabBarLabel =
    (compact?: boolean) =>
    ({
      color,
      children,
      focused,
    }: {
      color: string;
      children: string;
      focused: boolean;
    }) => (
      <TabBarLabel color={color} focused={focused} isRTL={isRTL} compact={compact}>
        {children}
      </TabBarLabel>
    );

  return (
    <TawjihPlusAccessProvider>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBar: (props) => <RtlAwareTabBar {...props} />,
        /** iPhone par défaut ; iPad/tablette (≥768px) passent en « beside-icon » sans cette option. */
        tabBarLabelPosition: 'below-icon',
        tabBarAllowFontScaling: false,
        tabBarActiveTintColor: brand.primary,
        tabBarInactiveTintColor: INACTIVE,
        tabBarLabel: renderTabBarLabel(false),
        /**
         * RN bottom-tabs utilise un cadre UIKit fixe (~31×28). Notre icône + pastille dépassait
         * → coupe horizontale/verticale (souvent « une moitié » de l’icône visible sur iOS).
         */
        tabBarIconStyle: {
          width: 42,
          height: Platform.OS === 'android' ? 30 : 34,
          marginTop: Platform.OS === 'ios' ? 2 : 4,
          overflow: 'visible',
        },
        tabBarItemStyle: defaultTabBarItemStyle,
        tabBarStyle: buildTabBarStyle(insets.bottom),
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
            marginTop: Platform.OS === 'android' ? -4 : 0,
            overflow: 'visible',
          },
          tabBarItemStyle: centerTabBarItemStyle,
          tabBarLabel: renderTabBarLabel(true),
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
      {/** Suivi TASSJIL : accessible via sidebar, barre d’onglets visible (href: null). */}
      <Tabs.Screen
        name="tassjil-school-choices"
        options={{
          href: null,
          headerShown: false,
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
    </TawjihPlusAccessProvider>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: TAB_LABEL_FONT_SIZE,
    lineHeight: Platform.OS === 'android' ? 13 : 14,
    marginTop: Platform.OS === 'android' ? 2 : 0,
    marginBottom: Platform.OS === 'android' ? 1 : 0,
    paddingHorizontal: 2,
    width: '100%',
    maxWidth: 88,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  tabLabelCompact: {
    maxWidth: 76,
    marginTop: Platform.OS === 'ios' ? -4 : -8,
    marginBottom: Platform.OS === 'android' ? 0 : 0,
  },
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
    ...countBadgeTextStyle(12),
  },
  centerTabButton: {
    overflow: 'visible',
    ...Platform.select({
      android: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 2,
      },
      default: {},
    }),
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
