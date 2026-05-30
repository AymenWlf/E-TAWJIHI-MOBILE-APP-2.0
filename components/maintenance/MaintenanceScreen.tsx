import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { brand, radius, spacing } from '@/theme/tokens';

const LOGO_URI = 'https://cdn.e-tawjihi.ma/logo-rectantgle-simple-nobg.png';

type Props = {
  message: string;
  retryAfterMinutes: number;
  onRefresh: () => void;
  refreshing?: boolean;
};

export function MaintenanceScreen({
  message,
  retryAfterMinutes,
  onRefresh,
  refreshing = false,
}: Props) {
  const enter = useSharedValue(0);

  useEffect(() => {
    enter.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) });
  }, [enter]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 16 }],
  }));

  return (
    <View style={styles.root}>
      <View style={styles.blobTop} pointerEvents="none" />
      <View style={styles.blobBottom} pointerEvents="none" />
      <View style={styles.blobMid} pointerEvents="none" />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.card, cardStyle]}>
            <Image
              source={{ uri: LOGO_URI }}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="E-TAWJIHI"
            />

            <View style={styles.iconWrap}>
              <FontAwesome name="wrench" size={28} color={brand.white} />
            </View>

            <Text style={styles.title}>Maintenance en cours</Text>

            <Text style={styles.body}>{message}</Text>

            <Text style={styles.hint}>
              Veuillez réessayer dans environ{' '}
              <Text style={styles.hintHighlight}>{retryAfterMinutes} minutes</Text>
              , ou actualisez l&apos;application.
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={refreshing ? 'Vérification en cours' : 'Actualiser'}
              onPress={onRefresh}
              disabled={refreshing}
              style={({ pressed }) => [
                styles.btn,
                pressed && !refreshing && styles.btnPressed,
                refreshing && styles.btnDisabled,
              ]}
            >
              {refreshing ? (
                <ActivityIndicator color={brand.white} />
              ) : (
                <>
                  <FontAwesome name="refresh" size={16} color={brand.white} style={styles.btnIcon} />
                  <Text style={styles.btnLabel}>Actualiser</Text>
                </>
              )}
            </Pressable>
          </Animated.View>

          <Text style={styles.footer}>E-TAWJIHI — Votre plateforme d&apos;orientation au Maroc</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  blobTop: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: brand.primary,
    opacity: 0.1,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -100,
    left: -70,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: brand.emerald,
    opacity: 0.1,
  },
  blobMid: {
    position: 'absolute',
    top: '32%',
    left: '50%',
    marginLeft: -90,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#1E40AF',
    opacity: 0.06,
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  card: {
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: brand.border,
    padding: spacing.xxl,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  logo: {
    width: '100%',
    maxWidth: 400,
    height: 88,
    marginBottom: spacing.xl,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    shadowColor: brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    color: brand.primary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    color: brand.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  hint: {
    color: brand.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  hintHighlight: {
    color: brand.primary,
    fontWeight: '700',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    minWidth: '100%',
    minHeight: 48,
    shadowColor: brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  btnPressed: {
    backgroundColor: brand.primaryHover,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  btnIcon: {
    marginRight: spacing.sm,
  },
  btnLabel: {
    color: brand.white,
    fontWeight: '700',
    fontSize: 16,
  },
  footer: {
    marginTop: spacing.xl,
    textAlign: 'center',
    fontSize: 12,
    color: brand.textMuted,
    paddingHorizontal: spacing.md,
  },
});
