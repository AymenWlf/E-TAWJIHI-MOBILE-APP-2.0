import { Stack } from 'expo-router';

import { TawjihPlusAccessProvider } from '@/contexts/TawjihPlusAccessContext';

export default function InscriptionsLayout() {
  return (
    <TawjihPlusAccessProvider>
      <Stack screenOptions={{ headerShown: false, title: '' }}>
        <Stack.Screen name="[id]" options={{ headerShown: false, title: '' }} />
        <Stack.Screen name="follow/[id]" options={{ headerShown: false, title: '' }} />
        <Stack.Screen name="apply-tour" options={{ headerShown: false, title: '' }} />
      </Stack>
    </TawjihPlusAccessProvider>
  );
}
