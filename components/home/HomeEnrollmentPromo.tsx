import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';

import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

type Props = {
  title: string;
  body: string;
  ctaLabel?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Bloc promo inscription / écoles (sans visuel télécom). */
export function HomeEnrollmentPromo({
  title,
  body,
  ctaLabel = 'Explorer les écoles',
  onPress,
  style,
}: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
        accessibilityRole="button">
        <Text style={styles.ctaTxt}>{ctaLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.section,
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: brand.backgroundSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  title: {
    color: brand.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  body: {
    marginTop: spacing.sm,
    color: brand.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
    fontWeight: '500',
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: homeShell.blue,
  },
  ctaTxt: {
    color: homeShell.text,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
});
