import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@/theme/tokens';

type Props = {
  /**
   * Hauteur minimale quand le clavier est fermé : encoche / home + marge (aligné login).
   * Le clavier ouvert ajoute `keyboard.height` en temps réel sur le thread UI.
   */
  minPaddingWhenKeyboardClosed?: number;
};

/**
 * Espaceur animé sous une zone de saisie dans un `ScrollView` / `FlatList` :
 * même principe que l’écran login (`useAnimatedKeyboard` + hauteur animée) — pas de
 * `KeyboardAvoidingView` ni gros `paddingBottom` fixe ; la hauteur suit le clavier.
 */
export function KeyboardAwareBottomSpacer({ minPaddingWhenKeyboardClosed }: Props) {
  const { bottom: safeBottom } = useSafeAreaInsets();
  const keyboard = useAnimatedKeyboard();
  const base = minPaddingWhenKeyboardClosed ?? safeBottom + spacing.xl;

  const style = useAnimatedStyle(() => ({
    height: keyboard.height.value + base,
  }));

  return <Animated.View style={style} />;
}
