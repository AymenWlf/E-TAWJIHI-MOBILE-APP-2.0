import { Stack } from 'expo-router';

import { brand } from '@/theme/tokens';

const statusBar = {
  statusBarStyle: 'light' as const,
  statusBarBackgroundColor: brand.primary,
};

export default function DiagnosticOrientationLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={statusBar} />
      <Stack.Screen name="rapport" options={statusBar} />
    </Stack>
  );
}
