import { Stack } from 'expo-router';

export default function InscriptionsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, title: '' }}>
      <Stack.Screen name="[id]" options={{ headerShown: false, title: '' }} />
      <Stack.Screen name="follow/[id]" options={{ headerShown: false, title: '' }} />
      <Stack.Screen name="apply-tour" options={{ headerShown: false, title: '' }} />
    </Stack>
  );
}
