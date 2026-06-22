import { useEffect } from 'react';
import { Keyboard, Platform } from 'react-native';
import {
  type SharedValue,
  useAnimatedKeyboard,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

/**
 * Hauteur clavier fiable dans les modales Android (`Modal` n’expose pas toujours
 * les insets à `useAnimatedKeyboard`). iOS continue d’utiliser Reanimated.
 */
export function useEffectiveKeyboardHeight(): SharedValue<number> {
  const keyboard = useAnimatedKeyboard();
  const height = useSharedValue(0);
  const isAndroid = Platform.OS === 'android';

  useAnimatedReaction(
    () => keyboard.height.value,
    (value) => {
      if (!isAndroid) {
        height.value = value;
      }
    },
    [isAndroid],
  );

  useEffect(() => {
    if (!isAndroid) return;

    const showSub = Keyboard.addListener('keyboardDidShow', (event) => {
      height.value = withTiming(event.endCoordinates.height, { duration: 200 });
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      height.value = withTiming(0, { duration: 200 });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [height, isAndroid]);

  return height;
}
