import { Stack } from 'expo-router';

import { TawjihPlusAccessProvider } from '@/contexts/TawjihPlusAccessContext';

export default function EtablissementsLayout() {
  return (
    <TawjihPlusAccessProvider>
      <Stack screenOptions={{ headerShown: false, title: '' }} />
    </TawjihPlusAccessProvider>
  );
}
