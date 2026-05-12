import { Stack } from 'expo-router';

/**
 * Stack événements sous l’onglet principal : la barre d’onglets du parent (tabs)
 * reste visible sur la liste et le détail (contrairement aux écrans racine Stack).
 */
export default function EvenementsStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
