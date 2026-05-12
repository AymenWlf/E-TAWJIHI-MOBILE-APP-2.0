import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { fontSize, radius, spacing } from '@/theme/tokens';
import type { CandidacyStatusType } from '@/types/inscriptions';
import { pickStatusLabel } from '@/utils/candidacyStatus';

type IconName = React.ComponentProps<typeof FontAwesome>['name'];

type Props = {
  /**
   * Statut courant à afficher. Un objet `CandidacyStatusType` complet (les
   * couleurs, l'icône et les libellés viennent du back). `null` ⇒ on
   * rend un badge neutre « Aucun statut » (utile pour les candidatures
   * sans statut explicite).
   */
  status: CandidacyStatusType | null;
  size?: 'sm' | 'md';
};

const NEUTRAL = {
  bg: '#F3F4F6',
  border: '#E5E7EB',
  fg: '#6B7280',
};

export function StatusBadge({ status, size = 'md' }: Props) {
  const { t, locale } = useLocale();
  const small = size === 'sm';

  const bg = status?.colorBg ?? NEUTRAL.bg;
  const border = status?.colorBorder ?? NEUTRAL.border;
  const fg = status?.colorFg ?? NEUTRAL.fg;
  const icon = (status?.icon ?? 'circle') as IconName;
  const label = status ? pickStatusLabel(status, locale) : t('inscStatusNone');

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: border,
          paddingHorizontal: small ? 8 : 10,
          paddingVertical: small ? 3 : 5,
        },
      ]}
    >
      <FontAwesome name={icon} size={small ? 10 : 12} color={fg} />
      <Text
        style={[
          styles.txt,
          { color: fg, fontSize: small ? fontSize.xs : fontSize.sm },
        ]}
      >
        {label}
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
