import { useCallback, useMemo, useRef } from 'react';
import {
  Platform,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { AppPressable } from '@/components/ui/AppPressable';

const TAP_MAX_DISTANCE = 14;

function resolvePressableStyle(
  style: PressableProps['style'],
  pressed: boolean,
): StyleProp<ViewStyle> {
  if (typeof style === 'function') {
    return style({ pressed });
  }
  return style;
}

/**
 * Pressable dans une carte swipeable (Pan parent sur Android).
 * Android : `Gesture.Tap()` + `runOnJS(onPress)` pour que l’action parte malgré le Pan.
 * iOS : `AppPressable` classique.
 */
export function DeckGesturePressable({ onPress, disabled, style, children, ...rest }: PressableProps) {
  const pressedSv = useSharedValue(0);
  const onPressRef = useRef(onPress);
  onPressRef.current = onPress;

  const firePress = useCallback(() => {
    onPressRef.current?.();
  }, []);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: pressedSv.value ? 0.88 : 1,
  }));

  const tapGesture = useMemo(
    () =>
      Gesture.Tap()
        .enabled(!disabled && !!onPress)
        .maxDistance(TAP_MAX_DISTANCE)
        .maxDuration(450)
        .onBegin(() => {
          pressedSv.value = 1;
        })
        .onFinalize(() => {
          pressedSv.value = 0;
        })
        .onEnd(() => {
          runOnJS(firePress)();
        }),
    [disabled, firePress, onPress, pressedSv],
  );

  if (Platform.OS !== 'android') {
    return (
      <AppPressable onPress={onPress} disabled={disabled} style={style} {...rest}>
        {children}
      </AppPressable>
    );
  }

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[resolvePressableStyle(style, false), fadeStyle]}
        accessible
        accessibilityRole={rest.accessibilityRole ?? 'button'}
        accessibilityState={rest.accessibilityState}
        accessibilityLabel={rest.accessibilityLabel}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
