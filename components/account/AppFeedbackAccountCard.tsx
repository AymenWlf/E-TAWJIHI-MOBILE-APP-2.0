import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { HomeCopyKey } from '@/constants/i18n';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

type Props = {
  rtl: boolean;
  t: (k: HomeCopyKey) => string;
  onOpenFeedback: () => void;
};

export function AppFeedbackAccountCard({ rtl, t, onOpenFeedback }: Props) {
  return (
    <Pressable
      onPress={onOpenFeedback}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
      accessibilityRole="button">
      <View style={[styles.head, rtl && styles.headRtl]}>
        <View style={styles.icon}>
          <FontAwesome name="star-o" size={18} color={brand.primary} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.title, rtl && styles.txtRtl]}>{t('appFeedbackSimpleTitle')}</Text>
          <Text style={[styles.sub, rtl && styles.txtRtl]} numberOfLines={3}>
            {t('appFeedbackSimpleAccountHint')}
          </Text>
        </View>
        <FontAwesome
          name={rtl ? 'chevron-left' : 'chevron-right'}
          size={14}
          color={homeShell.cardMuted}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: homeShell.borderOnWhite,
    backgroundColor: brand.white,
    padding: spacing.md,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headRtl: { flexDirection: 'row-reverse' },
  icon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51,62,143,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: fontSize.md, fontWeight: '800', color: brand.text },
  sub: { marginTop: 4, fontSize: fontSize.xs, color: brand.textMuted, lineHeight: 18 },
  txtRtl: { writingDirection: 'rtl', textAlign: 'right' },
});
