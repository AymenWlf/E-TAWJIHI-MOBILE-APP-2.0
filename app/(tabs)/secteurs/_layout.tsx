import { Stack } from 'expo-router';

/** Liste des secteurs dans l’onglet. Le détail s’ouvre dans la pile racine. */
export default function SecteursTabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, title: '' }}>
      <Stack.Screen name="index" options={{ headerShown: false, title: '' }} />
    </Stack>
  );
}
