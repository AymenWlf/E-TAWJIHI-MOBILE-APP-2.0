import { Stack } from 'expo-router';

/** Fiche secteur au-dessus des onglets, comme une école ou une annonce. */
export default function SecteursDetailLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, title: '' }}>
      <Stack.Screen name="[id]" options={{ headerShown: false, title: '' }} />
    </Stack>
  );
}
