import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

type Props = {
  isRTL?: boolean;
};

export function TassjilServiceIncludedNotice({ isRTL }: Props) {
  const { t } = useLocale();

  return (
    <View style={[styles.wrap, isRTL && styles.wrapRtl]} accessibilityRole="text">
      <FontAwesome name="handshake-o" size={13} color={brand.primary} />
      <Text style={[styles.text, isRTL && styles.rtlText]}>{t('inscTassjilServiceIncluded')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(51, 62, 143, 0.14)',
  },
  wrapRtl: {
    flexDirection: 'row-reverse',
  },
  text: {
    flex: 1,
    fontSize: fontSize.xs,
    lineHeight: 18,
    color: brand.primary,
    fontWeight: '500',
  },
  rtlText: {
    textAlign: 'right',
  },
});
