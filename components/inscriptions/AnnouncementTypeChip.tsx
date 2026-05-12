import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { fontSize, radius } from '@/theme/tokens';
import { getAnnouncementTypeStyle } from '@/utils/announcementTypeStyle';

type Variant =
  /** Pill compact (par défaut) — utilisable inline (header card, ligne titre…). */
  | 'pill'
  /** Bandeau pleine largeur — utilisé en haut de card pour signaler le type. */
  | 'banner';

type Size = 'xs' | 'sm';

type Props = {
  /** Libellé brut renvoyé par l'API (ex. « Ouverture d'inscription »). */
  type: string | null | undefined;
  variant?: Variant;
  size?: Size;
  /** Si vrai, layout RTL (ordre icône/label inversé). */
  isRTL?: boolean;
  /** Style override pour s'aligner sur le conteneur parent (margin/marginTop). */
  style?: ViewStyle;
};

/**
 * Affichage cohérent d'un tag « type d'annonce » (Ouverture, Résultat,
 * Bourse, etc.) avec couleur thématique + icône. La palette est fournie
 * par `getAnnouncementTypeStyle` pour rester unique partout dans l'app
 * (card listing, page détail, candidacy card…).
 */
export function AnnouncementTypeChip({
  type,
  variant = 'pill',
  size = 'xs',
  isRTL = false,
  style,
}: Props) {
  const visual = getAnnouncementTypeStyle(type);
  const label = (type ?? '').trim();
  if (label === '') return null;

  const bannerStyle = variant === 'banner';
  const padH = bannerStyle ? 12 : 8;
  const padV = bannerStyle ? 6 : 4;
  const iconSize = size === 'sm' ? 12 : 10;
  const txtSize = size === 'sm' ? fontSize.sm : fontSize.xs;

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: visual.bg,
          borderColor: visual.border,
          paddingHorizontal: padH,
          paddingVertical: padV,
          borderRadius: bannerStyle ? radius.md : radius.full,
          flexDirection: isRTL ? 'row-reverse' : 'row',
          // Toujours auto-sized (largeur = contenu + padding). Avant on
          // stretchait en pleine largeur pour le variant `banner`, mais
          // visuellement c'est plus propre quand le tag « hugge » son
          // libellé — sinon on a une grosse bande de couleur qui mange
          // tout le haut de la card.
          alignSelf: 'flex-start',
          justifyContent: 'center',
        },
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <FontAwesome name={visual.icon} size={iconSize} color={visual.fg} />
      <Text style={[styles.txt, { color: visual.fg, fontSize: txtSize }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  txt: {
    fontWeight: '700',
  },
});
