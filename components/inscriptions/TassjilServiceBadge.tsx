import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { fontSize, radius } from '@/theme/tokens';

type Props = {
  included: boolean;
  isRTL?: boolean;
};

/** Pastille compacte : établissement inclus ou non dans le service TASSJIL. */
export function TassjilServiceBadge({ included, isRTL }: Props) {
  const { t } = useLocale();
  const label = included
    ? t('inscTassjilServiceIncludedBadge')
    : t('inscTassjilServiceNotIncludedBadge');

  return (
    <View
      style={[
        styles.badge,
        included ? styles.included : styles.notIncluded,
        isRTL && styles.badgeRtl,
      ]}
      accessibilityRole="text"
      accessibilityLabel={label}>
      <FontAwesome
        name={included ? 'check-circle' : 'minus-circle'}
        size={9}
        color={included ? '#1E40AF' : '#B91C1C'}
      />
      <Text
        style={[styles.text, included ? styles.textIncluded : styles.textNotIncluded, isRTL && styles.rtlText]}
        numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: '100%',
  },
  badgeRtl: {
    flexDirection: 'row-reverse',
  },
  included: {
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
    borderColor: 'rgba(51, 62, 143, 0.18)',
  },
  notIncluded: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  text: {
    fontSize: fontSize.xs - 1,
    fontWeight: '700',
    lineHeight: 14,
  },
  textIncluded: {
    color: '#1E40AF',
  },
  textNotIncluded: {
    color: '#B91C1C',
  },
  rtlText: {
    textAlign: 'right',
  },
});
