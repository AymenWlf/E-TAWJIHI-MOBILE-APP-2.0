import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { useLocale } from '@/contexts/LocaleContext';

type Props = {
  onPress: () => void;
  /** Couleur de l’icône (ex. blanc sur header bleu). */
  color: string;
  style?: ViewStyle;
  /** Taille du bouton tactile (défaut 40). */
  hitSize?: number;
};

export function ShareIconButton({ onPress, color, style, hitSize = 40 }: Props) {
  const { t } = useLocale();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={t('shareOpenSheetA11y')}
      style={({ pressed }) => [
        styles.btn,
        { width: hitSize, height: hitSize, borderRadius: hitSize / 2 },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      <FontAwesome name="share-alt" size={17} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
});
