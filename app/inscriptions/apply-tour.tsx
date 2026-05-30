import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ApplyToSchoolsTourScreen } from '@/components/inscriptions/ApplyToSchoolsTourScreen';

export default function ApplyToSchoolsTourPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      <ApplyToSchoolsTourScreen />
    </>
  );
}
