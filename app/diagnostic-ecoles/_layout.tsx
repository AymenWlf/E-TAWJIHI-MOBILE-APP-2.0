import { Stack } from 'expo-router';

export default function DiagnosticEcolesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          statusBarStyle: 'light',
        }}
      />
      <Stack.Screen
        name="rapport"
        options={{
          statusBarStyle: 'light',
        }}
      />
      <Stack.Screen
        name="resultats"
        options={{
          statusBarStyle: 'light',
        }}
      />
    </Stack>
  );
}
