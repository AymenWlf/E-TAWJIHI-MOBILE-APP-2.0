import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

export type TourFocusWrapProps = {
  active: boolean;
  label?: string;
  dimmed?: boolean;
  /** Anneau pulsant — uniquement pour une action au tap requise. */
  pulse?: boolean;
  /** Étire le cadre (ex. bouton Continuer du footer). */
  fill?: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function TourFocusWrap({
  active,
  label,
  dimmed = false,
  pulse = true,
  fill = false,
  children,
  style,
}: TourFocusWrapProps) {
  const { isRTL } = useLocale();
  const pulseSv = useSharedValue(0);
  const shouldPulse = active && pulse;

  useEffect(() => {
    if (!shouldPulse) {
      pulseSv.value = withTiming(0, { duration: 200 });
      return;
    }
    pulseSv.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 650, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 650, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
  }, [shouldPulse, pulseSv]);

  const ringAnim = useAnimatedStyle(() => {
    if (!active) {
      return {
        borderColor: 'transparent',
        shadowOpacity: 0,
        transform: [{ scale: 1 }],
      };
    }
    if (!pulse) {
      return {
        borderColor: homeShell.green,
        shadowOpacity: 0.18,
        transform: [{ scale: 1 }],
      };
    }
    return {
      borderColor: `rgba(47, 206, 148, ${0.35 + pulseSv.value * 0.55})`,
      shadowOpacity: 0.12 + pulseSv.value * 0.28,
      transform: [{ scale: 1 + pulseSv.value * 0.02 }],
    };
  });

  const labelIcon = pulse ? 'hand-pointer-o' : 'eye';

  return (
    <View style={[style, dimmed && !active && styles.dimmed, fill && styles.wrapFill]}>
      {active && label ? (
        <View
          style={[
            styles.labelChip,
            !pulse && styles.labelChipLearn,
            isRTL && styles.labelChipRtl,
          ]}>
          <FontAwesome
            name={labelIcon}
            size={12}
            color={pulse ? homeShell.greenDark : brand.white}
          />
          <Text style={[styles.labelTxt, !pulse && styles.labelTxtLearn, isRTL && styles.labelTxtRtl]}>
            {label}
          </Text>
        </View>
      ) : null}
      <Animated.View
        style={[
          styles.ring,
          active && styles.ringActive,
          !pulse && active && styles.ringStatic,
          fill && styles.ringFill,
          ringAnim,
        ]}
        pointerEvents="box-none">
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapFill: {
    flex: 1,
    minWidth: 0,
    alignSelf: 'stretch',
  },
  dimmed: {
    opacity: 0.38,
  },
  labelChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: homeShell.green,
  },
  labelChipLearn: {
    backgroundColor: homeShell.green,
    borderWidth: 0,
  },
  labelChipRtl: {
    alignSelf: 'flex-start',
    direction: 'rtl',
  },
  labelTxt: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.white,
  },
  labelTxtLearn: {
    color: brand.white,
  },
  labelTxtRtl: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  ring: {
    borderRadius: radius.md,
    borderWidth: 2.5,
    borderColor: 'transparent',
    shadowColor: homeShell.greenDark,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 0,
  },
  ringActive: {
    backgroundColor: homeShell.greenAlpha11,
    elevation: 8,
  },
  ringStatic: {
    elevation: 4,
  },
  ringFill: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
  },
});
