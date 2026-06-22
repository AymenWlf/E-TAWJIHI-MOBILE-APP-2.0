import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEffectiveKeyboardHeight } from '@/hooks/useEffectiveKeyboardHeight';
import { spacing } from '@/theme/tokens';

type Props = {
  /**
   * Hauteur minimale quand le clavier est fermé : encoche / home + marge (aligné login).
   * Le clavier ouvert ajoute `keyboard.height` en temps réel sur le thread UI.
   */
  minPaddingWhenKeyboardClosed?: number;
  /**
   * Quand le sheet est déjà levé au-dessus du clavier (modale bas d’écran Android),
   * n’ajouter qu’une petite marge de scroll — évite la double levée.
   */
  scrollMarginWhenKeyboardOpen?: number;
};

/**
 * Espaceur animé sous une zone de saisie dans un `ScrollView` / `FlatList` :
 * même principe que l’écran login (`useAnimatedKeyboard` + hauteur animée) — pas de
 * `KeyboardAvoidingView` ni gros `paddingBottom` fixe ; la hauteur suit le clavier.
 */
export function KeyboardAwareBottomSpacer({
  minPaddingWhenKeyboardClosed,
  scrollMarginWhenKeyboardOpen,
}: Props) {
  const { bottom: safeBottom } = useSafeAreaInsets();
  const keyboardHeight = useEffectiveKeyboardHeight();
  const base = minPaddingWhenKeyboardClosed ?? safeBottom + spacing.xl;

  const style = useAnimatedStyle(() => {
    const kb = keyboardHeight.value;
    if (kb > 0) {
      const height =
        scrollMarginWhenKeyboardOpen != null ? scrollMarginWhenKeyboardOpen : kb + spacing.md;
      return { height };
    }
    return { height: base };
  });

  return <Animated.View style={style} />;
}
