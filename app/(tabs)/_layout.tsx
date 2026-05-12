import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatbotFloatingBubble } from '@/components/chatbot/ChatbotFloatingBubble';
import { FloatingBubbleHub } from '@/components/global/FloatingBubbleHub';
import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { useNotificationsDrawer } from '@/contexts/NotificationsDrawerContext';
import { useShopCart } from '@/contexts/ShopCartContext';
import { CAIRO } from '@/theme/arabicTypography';
import { brand } from '@/theme/tokens';

const INACTIVE = '#64748B';

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
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <FontAwesome name={name} size={size} color={color} />
      {badgeCount && badgeCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeTxt}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function TabLayout() {
  const { t, isRTL } = useLocale();
  const { count: cartCount } = useShopCart();
  const { unreadCount: notifUnread } = useNotificationsDrawer();
  const insets = useSafeAreaInsets();

  return (
    <>
    <Tabs
      screenOptions={{
        headerShown: false,
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
          paddingTop: 8,
          paddingBottom: Math.max(8, insets.bottom),
          /** Pas de height fixe : laisse mesurer icônes + labels (évite clipping). */
          minHeight: 52 + Math.max(0, insets.bottom),
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
            <TabIcon name="home" focused={focused} color={color} size={size} badgeCount={notifUnread} />
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
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              name="calendar"
              focused={focused}
              color={color}
              size={size}
              badgeCount={notifUnread}
            />
          ),
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
    {/* Hub unique à droite → ouvre Chatbot / Communauté */}
    <ChatbotFloatingBubble hideLauncher />
    <FloatingBubbleHub />
    </>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  iconWrapActive: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
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
});
