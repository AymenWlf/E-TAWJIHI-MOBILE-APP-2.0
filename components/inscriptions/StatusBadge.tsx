import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { fontSize, radius, spacing } from '@/theme/tokens';
import type { CandidacyStatus } from '@/types/inscriptions';
import { STATUS_VISUALS } from '@/utils/candidacyStatus';

type Props = {
  status: CandidacyStatus;
  size?: 'sm' | 'md';
};

export function StatusBadge({ status, size = 'md' }: Props) {
  const { t } = useLocale();
  const v = STATUS_VISUALS[status];
  const small = size === 'sm';
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          paddingHorizontal: small ? 8 : 10,
          paddingVertical: small ? 3 : 5,
        },
      ]}
    >
      <FontAwesome name={v.icon} size={small ? 10 : 12} color={v.fg} />
      <Text
        style={[
          styles.txt,
          { color: v.fg, fontSize: small ? fontSize.xs : fontSize.sm },
        ]}
      >
        {t(v.labelKey)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'flex-start',
  },
  txt: {
    fontWeight: '700',
    marginLeft: spacing.xs / 2,
  },
});
