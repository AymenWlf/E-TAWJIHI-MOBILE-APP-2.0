import { Stack } from 'expo-router';

/**
 * Stack secteurs sous l’onglet principal : la barre d’onglets du parent (tabs)
 * reste visible. Header natif désactivé — chaque écran a son hero custom.
 */
export default function SecteursStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        header: () => null,
        title: '',
        animation: 'fade',
      }}>
      <Stack.Screen name="index" options={{ headerShown: false, header: () => null }} />
      <Stack.Screen name="[id]" options={{ headerShown: false, header: () => null }} />
    </Stack>
  );
}
