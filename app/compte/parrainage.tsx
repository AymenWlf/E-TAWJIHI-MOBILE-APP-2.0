import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

/** Ancienne route — redirige vers la page fidélité (parrainage intégré). */
export default function ReferralRedirectScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/compte/fidelite');
  }, [router]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}
