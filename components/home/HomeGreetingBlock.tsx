import { StyleSheet, View } from 'react-native';

import { HomeGreetingSubtitleSkeleton } from '@/components/home/HomeGreetingSubtitleSkeleton';
import { Text } from '@/components/ui/Text';

import { homeShell } from '@/theme/homeShell';
import { fontSize, radius, spacing } from '@/theme/tokens';

type Props = {
  firstName: string;
  subtitle: string;
  /** Sous-titre (ex. filière) en cours de chargement — pas de texte de repli trompeur. */
  subtitleLoading?: boolean;
  greetingWord?: string;
  /** Alignement RTL (arabe) — le bloc salutation suit la direction du parent. */
  rtl?: boolean;
};

export function HomeGreetingBlock({
  firstName,
  subtitle,
  subtitleLoading,
  greetingWord = 'Bonjour',
  rtl,
}: Props) {
  return (
    <View style={[styles.wrap, rtl && styles.wrapRtl]}>
      <Text style={[styles.greet, rtl && styles.textRtl]}>
        {greetingWord} <Text style={styles.name}>{firstName}</Text>
      </Text>
      <View
        style={[styles.subRow, rtl && styles.subRowRtl]}
        accessibilityLabel={subtitleLoading ? undefined : subtitle}
      >
        {subtitleLoading ? (
          <HomeGreetingSubtitleSkeleton isRTL={rtl} />
        ) : (
          <Text style={[styles.subText, rtl && styles.textRtl]} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: spacing.sm,
  },
  wrapRtl: {
    alignItems: 'flex-end',
  },
  greet: {
    color: homeShell.text,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  name: {
    fontWeight: '800',
  },
  textRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  subRow: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    maxWidth: '100%',
  },
  subRowRtl: {
    alignSelf: 'flex-end',
  },
  subText: {
    color: homeShell.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});
