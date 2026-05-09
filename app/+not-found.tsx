import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';

import { useAppColors } from '@/hooks/useAppColors';
import { fontSize, spacing } from '@/theme/tokens';

export default function NotFoundScreen() {
  const c = useAppColors();

  return (
    <>
      <Stack.Screen options={{ title: 'Introuvable' }} />
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Text style={[styles.title, { color: c.text }]}>Cette page n’existe pas.</Text>
        <Link href="/" style={styles.linkWrap}>
          <Text style={[styles.link, { color: c.primary }]}>Retour à l’accueil</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  linkWrap: {
    marginTop: spacing.lg,
  },
  link: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
