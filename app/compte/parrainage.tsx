import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { LoadingContentCardSkeleton } from '@/components/ui/CardLoadingSkeleton';

/** Ancienne route — redirige vers la page fidélité (parrainage intégré). */
export default function ReferralRedirectScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/compte/fidelite');
  }, [router]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <LoadingContentCardSkeleton style={{ width: '100%', maxWidth: 320 }} />
    </View>
  );
}
