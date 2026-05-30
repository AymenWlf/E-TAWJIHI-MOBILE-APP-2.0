import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { LoadingContentCardSkeleton } from '@/components/ui/CardLoadingSkeleton';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/contexts/AuthContext';
import { brand } from '@/theme/tokens';

export default function LogoutScreen() {
  const { logout } = useAuth();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await logout();
      } finally {
        if (!cancelled) router.replace('/login');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [logout]);

  return (
    <View style={styles.root} accessibilityLabel="Logout">
      <LoadingContentCardSkeleton style={styles.cardSk} />
      <Text style={styles.txt}>Déconnexion…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: brand.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  txt: { color: brand.textMuted, fontWeight: '800' },
  cardSk: { width: '88%', maxWidth: 320 },
});

