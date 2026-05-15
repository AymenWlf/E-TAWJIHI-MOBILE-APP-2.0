import 'react-native-gesture-handler';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  Cairo_600SemiBold,
  Cairo_700Bold,
  Cairo_800ExtraBold,
  Cairo_900Black,
} from '@expo-google-fonts/cairo';
import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useMemo, useState } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplash } from '@/components/AnimatedSplash';
import { AppSidebarPanel } from '@/components/AppSidebarPanel';
import { MobileAnalyticsTracker } from '@/components/MobileAnalyticsTracker';
import { NotificationsOffcanvas } from '@/components/notifications/NotificationsOffcanvas';
import { AppSidebarProvider } from '@/contexts/AppSidebarContext';
import { NotificationsDrawerProvider } from '@/contexts/NotificationsDrawerContext';
import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { GlobalWallUnreadProvider } from '@/contexts/GlobalWallUnreadContext';
import { LocaleProvider } from '@/contexts/LocaleContext';
import { SharePreviewProvider } from '@/contexts/SharePreviewContext';
import { ShopCartProvider } from '@/contexts/ShopCartContext';
import {
  attachNotificationListeners,
  registerForPushAndSubmit,
} from '@/services/pushNotifications';
import { appNavigationTheme } from '@/theme/navigation';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
    Cairo_600SemiBold,
    Cairo_700Bold,
    Cairo_800ExtraBold,
    Cairo_900Black,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);
  const [canHideNativeSplash, setCanHideNativeSplash] = useState(false);

  const maybeHideNativeSplash = useCallback(async () => {
    if (!loaded || !canHideNativeSplash) return;
    await SplashScreen.hideAsync();
  }, [loaded, canHideNativeSplash]);

  useEffect(() => {
    void maybeHideNativeSplash();
  }, [maybeHideNativeSplash]);

  if (!loaded) {
    return null;
  }

  if (showAnimatedSplash) {
    return (
      <AnimatedSplash
        onReadyForHideNativeSplash={() => setCanHideNativeSplash(true)}
        onDone={() => setShowAnimatedSplash(false)}
      />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LocaleProvider>
          <SharePreviewProvider>
            <AuthProvider>
              <GlobalWallUnreadProvider>
                <ShopCartProvider>
                  <RootLayoutNav />
                </ShopCartProvider>
              </GlobalWallUnreadProvider>
            </AuthProvider>
          </SharePreviewProvider>
        </LocaleProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme() ?? 'light';
  const navTheme = useMemo(
    () => appNavigationTheme(colorScheme === 'dark' ? 'dark' : 'light'),
    [colorScheme],
  );

  useSetupRedirectGate();
  usePushNotificationsBootstrap();

  return (
    <ThemeProvider value={navTheme}>
      <AppSidebarProvider>
        <NotificationsDrawerProvider>
          <MobileAnalyticsTracker />
          <AppSidebarPanel />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
            <Stack.Screen name="account-setup" options={{ headerShown: false }} />
            <Stack.Screen name="logout" options={{ headerShown: false }} />
            <Stack.Screen name="boutique/[slug]" options={{ headerShown: false }} />
            <Stack.Screen name="boutique/service/[slug]" options={{ headerShown: false }} />
            <Stack.Screen name="boutique/cart" options={{ headerShown: false }} />
            <Stack.Screen name="boutique/checkout" options={{ headerShown: false }} />
            <Stack.Screen name="boutique/thank-you" options={{ headerShown: false }} />
            <Stack.Screen name="compte/commande/[publicId]" options={{ headerShown: false }} />
            <Stack.Screen name="inscriptions/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="inscriptions/follow/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="communaute" options={{ headerShown: false }} />
            <Stack.Screen name="daily-challenge" options={{ headerShown: false }} />
          </Stack>
          <NotificationsOffcanvas />
        </NotificationsDrawerProvider>
      </AppSidebarProvider>
    </ThemeProvider>
  );
}

/**
 * Branche le tracking des notifications push (listeners de tap + register
 * du token côté backend dès qu'on a une session authentifiée).
 *
 * - Listeners attachés une fois pour toute la durée de vie de l'app
 *   (idempotent côté `attachNotificationListeners`).
 * - Le token est ré-enregistré à chaque changement d'utilisateur (login,
 *   refresh) pour garantir le bon rattachement côté serveur. Un cache en
 *   RAM (dans le service) évite d'envoyer plusieurs fois le même token.
 */
function usePushNotificationsBootstrap() {
  const { user, isLoading, getValidAccessToken } = useAuth();

  useEffect(() => {
    // Listeners installés au boot — fonctionnent même avant login (utiles
    // pour le cas « notif tappée juste avant l'auth se ré-hydrate »).
    const detach = attachNotificationListeners(getValidAccessToken);
    return detach;
  }, [getValidAccessToken]);

  useEffect(() => {
    if (isLoading || !user) return;
    void registerForPushAndSubmit(getValidAccessToken);
  }, [isLoading, user, getValidAccessToken]);
}

function useSetupRedirectGate() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const route = segments.join('/');
    const isOnAuth =
      route === 'login' || route === 'register' || route === 'forgot-password';
    const isOnLogout = route === 'logout';
    const isPublicDailyChallenge = route === 'daily-challenge';

    // Defer navigation to next tick so Expo Router state is settled
    const navigate = (dest: string) => {
      setTimeout(() => router.replace(dest as Parameters<typeof router.replace>[0]), 10);
    };

    // Not logged in → login (unless already on an auth/logout screen)
    if (!user) {
      if (!isOnAuth && !isOnLogout && !isPublicDailyChallenge) navigate('/login');
      return;
    }

    const isOnSetup = route === 'account-setup';

    // Logged in + setup not done → setup wizard
    if (!user.is_setup && !isOnSetup) {
      navigate('/account-setup');
      return;
    }

    // Logged in + setup done → home (escape auth/setup screens)
    if (user.is_setup && (isOnSetup || isOnAuth)) {
      navigate('/(tabs)');
    }
  }, [isLoading, segments, user]);
}
