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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, StyleSheet, View, type AppStateStatus } from 'react-native';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplash } from '@/components/AnimatedSplash';
import { FloatingBubbleHub } from '@/components/global/FloatingBubbleHub';
import { AppUpdateGate } from '@/components/appUpdate/AppUpdateGate';
import { MaintenanceGate } from '@/components/maintenance/MaintenanceGate';
import { AppSidebarPanel } from '@/components/AppSidebarPanel';
import { MobileAnalyticsTracker } from '@/components/MobileAnalyticsTracker';
import { NotificationsOffcanvas } from '@/components/notifications/NotificationsOffcanvas';
import { AppFeedbackProvider } from '@/contexts/AppFeedbackContext';
import { AppSidebarProvider } from '@/contexts/AppSidebarContext';
import { NotificationsDrawerProvider } from '@/contexts/NotificationsDrawerContext';
import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { GlobalWallUnreadProvider } from '@/contexts/GlobalWallUnreadContext';
import { LocaleProvider } from '@/contexts/LocaleContext';
import { SharePreviewProvider } from '@/contexts/SharePreviewContext';
import { SchoolDiagnosticRecommendationsProvider } from '@/contexts/SchoolDiagnosticRecommendationsContext';
import { ShopCartProvider } from '@/contexts/ShopCartContext';
import { isOrientation1BacUnlocked } from '@/constants/orientation1bacAccess';
import {
  GLOBAL_WALL_MOBILE_ENABLED,
  ORIENTATION_1BAC_MOBILE_ENABLED,
} from '@/constants/mobileFeatureFlags';
import { NotificationPermissionModal } from '@/components/notifications/NotificationPermissionModal';
import {
  attachNotificationListeners,
  getNotificationPermissionStatus,
  isNativePushRegistrationSupported,
  registerForPushAndSubmit,
} from '@/services/pushNotifications';
import { appNavigationTheme } from '@/theme/navigation';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

void SplashScreen.preventAutoHideAsync().catch(() => {
  /* Fast refresh / Expo Go : splash déjà libéré côté natif. */
});

const SPLASH_BG = '#333E8F';

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
  const nativeSplashHiddenRef = useRef(false);

  const hideNativeSplashOnce = useCallback(async () => {
    if (nativeSplashHiddenRef.current) return;
    nativeSplashHiddenRef.current = true;
    try {
      await SplashScreen.hideAsync();
    } catch {
      /* iOS : VC sans splash enregistré (reload, double hide). */
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    void hideNativeSplashOnce();
  }, [loaded, hideNativeSplashOnce]);

  if (!loaded) {
    return <View style={splashStyles.bootPlaceholder} />;
  }

  if (showAnimatedSplash) {
    return (
      <AnimatedSplash
        onReadyForHideNativeSplash={() => {
          void hideNativeSplashOnce();
        }}
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
              <MaintenanceGate>
                <AppUpdateGate>
                <AppFeedbackProvider>
                  <SchoolDiagnosticRecommendationsProvider>
                    <GlobalWallUnreadProvider>
                      <ShopCartProvider>
                        <RootLayoutNav />
                      </ShopCartProvider>
                    </GlobalWallUnreadProvider>
                  </SchoolDiagnosticRecommendationsProvider>
                </AppFeedbackProvider>
                </AppUpdateGate>
              </MaintenanceGate>
            </AuthProvider>
          </SharePreviewProvider>
        </LocaleProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const splashStyles = StyleSheet.create({
  bootPlaceholder: {
    flex: 1,
    backgroundColor: SPLASH_BG,
  },
});

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
          <View style={{ flex: 1 }}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="register" options={{ headerShown: false }} />
              <Stack.Screen name="device-transfer" options={{ headerShown: false }} />
              <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
              <Stack.Screen name="forgot-password-sent" options={{ headerShown: false }} />
              <Stack.Screen name="verify-reset-otp" options={{ headerShown: false }} />
              <Stack.Screen name="reset-password" options={{ headerShown: false }} />
              <Stack.Screen name="account-setup" options={{ headerShown: false }} />
              <Stack.Screen name="logout" options={{ headerShown: false }} />
              <Stack.Screen name="boutique/[slug]" options={{ headerShown: false }} />
              <Stack.Screen name="boutique/service/[slug]" options={{ headerShown: false }} />
              <Stack.Screen name="boutique/cart" options={{ headerShown: false }} />
              <Stack.Screen name="boutique/checkout" options={{ headerShown: false }} />
              <Stack.Screen name="boutique/thank-you" options={{ headerShown: false }} />
              <Stack.Screen name="compte/commande/[publicId]" options={{ headerShown: false }} />
              <Stack.Screen name="compte/fidelite" options={{ headerShown: false }} />
              <Stack.Screen name="compte/fidelite-catalogue" options={{ headerShown: false }} />
              <Stack.Screen name="compte/parrainage" options={{ headerShown: false }} />
              <Stack.Screen name="inscriptions" options={{ headerShown: false }} />
              <Stack.Screen name="etablissements" options={{ headerShown: false }} />
              <Stack.Screen name="communaute" options={{ headerShown: false }} />
              <Stack.Screen name="daily-challenge" options={{ headerShown: false }} />
              <Stack.Screen name="diagnostic-ecoles" options={{ headerShown: false }} />
              {ORIENTATION_1BAC_MOBILE_ENABLED ? (
                <Stack.Screen name="orientation-1bac" options={{ headerShown: false }} />
              ) : null}
            </Stack>
            <AppSidebarPanel />
            <NotificationsOffcanvas />
            <FloatingBubbleHub />
            <NotificationPermissionGate />
          </View>
        </NotificationsDrawerProvider>
      </AppSidebarProvider>
    </ThemeProvider>
  );
}

/** Modal si notifications refusées — affiché à chaque retour au premier plan. */
function NotificationPermissionGate() {
  const { user, isLoading, getValidAccessToken } = useAuth();
  const [showDeniedModal, setShowDeniedModal] = useState(false);

  const checkPermission = useCallback(async () => {
    if (isLoading || !user || !isNativePushRegistrationSupported()) {
      setShowDeniedModal(false);
      return;
    }
    const status = await getNotificationPermissionStatus();
    if (status === 'denied') {
      setShowDeniedModal(true);
      return;
    }
    setShowDeniedModal(false);
    if (status === 'granted') {
      void registerForPushAndSubmit(getValidAccessToken);
    }
  }, [getValidAccessToken, isLoading, user]);

  useEffect(() => {
    void checkPermission();
  }, [checkPermission]);

  useEffect(() => {
    if (isLoading || !user) return;
    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        void checkPermission();
      }
    };
    const sub = AppState.addEventListener('change', onAppState);
    return () => sub.remove();
  }, [checkPermission, isLoading, user]);

  return (
    <NotificationPermissionModal
      visible={showDeniedModal}
      onDismiss={() => setShowDeniedModal(false)}
    />
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
  const { getValidAccessToken } = useAuth();

  useEffect(() => {
    const detach = attachNotificationListeners(getValidAccessToken);
    return detach;
  }, [getValidAccessToken]);
}

function useSetupRedirectGate() {
  const { user, isLoading, sessionReady, accessToken, refreshToken } = useAuth();
  const segments = useSegments();
  const routeKey = segments.join('/');

  useEffect(() => {
    if (isLoading) return;
    if (!sessionReady && (accessToken || refreshToken)) return;

    const route = routeKey;
    const isOnAuth =
      route === 'login' ||
      route === 'register' ||
      route === 'device-transfer' ||
      route === 'forgot-password' ||
      route === 'forgot-password-sent' ||
      route === 'verify-reset-otp' ||
      route === 'reset-password';
    const isOnLogout = route === 'logout';
    const isOnSetup = route === 'account-setup';
    const isOnTabs = route === '(tabs)' || route.startsWith('(tabs)/');
    const isPublicDailyChallenge = route === 'daily-challenge';
    const isCommunauteRoute = route === 'communaute' || route.startsWith('communaute/');
    const isOrientation1BacRoute =
      route === 'orientation-1bac' || route.startsWith('orientation-1bac/');

    // Defer navigation to next tick so Expo Router state is settled
    const navigate = (dest: string) => {
      if (dest === '/login' && isOnAuth) return;
      if (dest === '/account-setup' && isOnSetup) return;
      if (dest === '/(tabs)' && isOnTabs) return;
      setTimeout(() => router.replace(dest as Parameters<typeof router.replace>[0]), 10);
    };

    if (isCommunauteRoute && !GLOBAL_WALL_MOBILE_ENABLED) {
      navigate('/(tabs)');
      return;
    }

    if (isOrientation1BacRoute && (!ORIENTATION_1BAC_MOBILE_ENABLED || !isOrientation1BacUnlocked())) {
      navigate('/(tabs)');
      return;
    }

    // Session expirée ou déconnecté → login (sauf écrans auth / défi public)
    if (!user) {
      if (!isOnAuth && !isOnLogout && !isPublicDailyChallenge) {
        navigate('/login');
      }
      return;
    }

    const hasSessionTokens = Boolean(accessToken || refreshToken);
    if (!hasSessionTokens) {
      navigate('/login');
      return;
    }

    // Logged in + setup not done → setup wizard
    if (!user.is_setup && !isOnSetup) {
      navigate('/account-setup');
      return;
    }

    // Logged in + setup done → home (escape auth/setup screens)
    if (user.is_setup && (isOnSetup || isOnAuth)) {
      navigate('/(tabs)');
    }
  }, [isLoading, sessionReady, accessToken, refreshToken, routeKey, user]);
}
