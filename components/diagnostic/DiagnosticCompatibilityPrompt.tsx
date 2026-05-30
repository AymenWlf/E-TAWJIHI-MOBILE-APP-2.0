import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/ui/Text';
import { brand, fontSize, radius } from '@/theme/tokens';

const COPY = {
  fr: 'Passer le test de compatibilité',
  ar: 'أجرِ اختبار التوافق',
} as const;

type Props = {
  size?: 'xs' | 'sm' | 'md';
  isRTL?: boolean;
  locale?: 'fr' | 'ar';
};

export function DiagnosticCompatibilityPrompt({ size = 'xs', isRTL = false, locale = 'fr' }: Props) {
  const compact = size === 'xs';
  const font = size === 'md' ? fontSize.sm : size === 'sm' ? fontSize.xs : 10;
  const padV = size === 'md' ? 6 : 4;
  const padH = size === 'md' ? 12 : size === 'sm' ? 9 : 7;

  return (
    <Pressable
      onPress={() => router.push('/diagnostic-ecoles' as never)}
      style={({ pressed }) => [
        styles.pill,
        isRTL && styles.pillRtl,
        {
          paddingVertical: padV,
          paddingHorizontal: padH,
        },
        pressed && { opacity: 0.88 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={COPY[locale]}>
      <FontAwesome name="compass" size={compact ? 10 : 12} color={brand.primary} />
      <Text style={[styles.label, { fontSize: font }, isRTL && styles.rtlText]} numberOfLines={2}>
        {COPY[locale]}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(51, 62, 143, 0.28)',
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  pillRtl: { direction: 'rtl' },
  label: {
    fontWeight: '800',
    color: brand.primary,
    flexShrink: 1,
  },
  rtlText: { writingDirection: 'rtl', textAlign: 'right' },
});
