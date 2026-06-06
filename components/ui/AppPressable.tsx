import { Platform, type PressableProps } from 'react-native';
import { Gesture, GestureDetector, Pressable } from 'react-native-gesture-handler';

/**
 * Pressable compatible RNGH (évite les doubles-taps / délais sur Android dans ScrollView / FlatList).
 * Sur Android, `Gesture.Native()` laisse passer le tap aux enfants quand la liste scroll (RNGH).
 */
const androidNativeGesture = Gesture.Native();

export function AppPressable({ delayPressIn = 0, onPress, ...rest }: PressableProps) {
  const node = (
    <Pressable
      delayPressIn={delayPressIn}
      onPress={onPress}
      {...(Platform.OS === 'android'
        ? {
            android_ripple: { color: 'rgba(15, 23, 42, 0.06)', borderless: false },
          }
        : {})}
      {...rest}
    />
  );

  if (Platform.OS !== 'android') {
    return node;
  }

  return <GestureDetector gesture={androidNativeGesture}>{node}</GestureDetector>;
}
