import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/ui/Text';
import { TAWJIH_PLUS_PRODUCT_PATH } from '@/constants/tawjihPlusAccess';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useTawjihPlusAccess } from '@/hooks/useTawjihPlusAccess';
import { brand, fontSize, radius } from '@/theme/tokens';
import { navigateToSchoolDiagnosticWizard } from '@/utils/navigateToSchoolDiagnosticEntry';
import type { TawjihPlusParcoursGate } from '@/utils/tawjihPlusParcoursGate';

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
  const { getValidAccessToken, user } = useAuth();
  const { t } = useLocale();
  const { hasAccess: hasTawjihPlusAccess, loading: tawjihPlusLoading } = useTawjihPlusAccess();
  const tawjihPlusGate = useMemo<TawjihPlusParcoursGate>(
    () => ({
      hasAccess: hasTawjihPlusAccess,
      loading: tawjihPlusLoading,
      openProduct: () => router.push(TAWJIH_PLUS_PRODUCT_PATH as never),
      t,
    }),
    [hasTawjihPlusAccess, t, tawjihPlusLoading],
  );
  const compact = size === 'xs';
  const font = size === 'md' ? fontSize.sm : size === 'sm' ? fontSize.xs : 10;
  const padV = size === 'md' ? 6 : 4;
  const padH = size === 'md' ? 12 : size === 'sm' ? 9 : 7;

  return (
    <Pressable
      onPress={() => {
        void navigateToSchoolDiagnosticWizard(
          {
            getValidAccessToken,
            userId: user?.id ?? null,
            uiLocale: locale === 'ar' ? 'ar' : 'fr',
          },
          undefined,
          tawjihPlusGate,
        );
      }}
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
