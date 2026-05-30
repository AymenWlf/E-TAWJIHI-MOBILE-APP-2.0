import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/ui/Text';
import { homeShell } from '@/theme/homeShell';
import { fontSize, spacing } from '@/theme/tokens';

type Props = {
  onPress: () => void;
  refreshing?: boolean;
  label: string;
  accessibilityLabel: string;
  isRTL?: boolean;
};

/** Bouton discret « Actualiser » pour le bandeau bleu de l'accueil. */
export function HomeRefreshChip({
  onPress,
  refreshing = false,
  label,
  accessibilityLabel,
  isRTL = false,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={refreshing}
      style={({ pressed }) => [
        styles.chip,
        isRTL && styles.chipRtl,
        pressed && !refreshing && styles.pressed,
        refreshing && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy: refreshing }}>
      {refreshing ? (
        <ActivityIndicator size="small" color={homeShell.text} style={styles.spinner} />
      ) : (
        <FontAwesome name="refresh" size={11} color={homeShell.text} />
      )}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 2,
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.32)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    opacity: 0.92,
  },
  chipRtl: {
    flexDirection: 'row-reverse',
  },
  pressed: {
    opacity: 0.78,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  disabled: {
    opacity: 0.7,
  },
  spinner: {
    transform: [{ scale: 0.72 }],
  },
  label: {
    color: homeShell.text,
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.15,
    opacity: 0.95,
  },
});
