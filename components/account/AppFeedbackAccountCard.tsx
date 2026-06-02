import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { HomeCopyKey } from '@/constants/i18n';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { UserActiveCommercialService } from '@/services/userActiveServices';
import { userIsCommercialClient } from '@/utils/commercialClientAccess';

type Props = {
  rtl: boolean;
  t: (k: HomeCopyKey) => string;
  services: UserActiveCommercialService[];
  servicesLoaded: boolean;
  servicesLoading: boolean;
  onOpenFeedback: () => void;
  onLockedPress?: () => void;
};

export function AppFeedbackAccountCard({
  rtl,
  t,
  services,
  servicesLoaded,
  servicesLoading,
  onOpenFeedback,
  onLockedPress,
}: Props) {
  const locked = servicesLoaded && !userIsCommercialClient(services);
  const pending = servicesLoading || !servicesLoaded;

  const handlePress = () => {
    if (pending) return;
    if (locked) {
      onLockedPress?.();
      return;
    }
    onOpenFeedback();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={pending}
      style={({ pressed }) => [
        styles.card,
        locked && styles.cardLocked,
        pending && styles.cardPending,
        pressed && !pending && { opacity: 0.92 },
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: pending || locked }}>
      <View style={[styles.head, rtl && styles.headRtl]}>
        <View style={[styles.icon, locked && styles.iconLocked]}>
          {pending ? (
            <ActivityIndicator size="small" color={brand.primary} />
          ) : (
            <FontAwesome name={locked ? 'lock' : 'comment-o'} size={18} color={locked ? homeShell.cardMuted : brand.primary} />
          )}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.title, locked && styles.titleLocked, rtl && styles.txtRtl]}>
            {locked ? t('appFeedbackLockedTitle') : t('appFeedbackTitle')}
          </Text>
          <Text style={[styles.sub, rtl && styles.txtRtl]} numberOfLines={3}>
            {locked ? t('appFeedbackLockedBody') : t('appFeedbackIntro')}
          </Text>
          {locked && onLockedPress ? (
            <Text style={[styles.cta, rtl && styles.txtRtl]}>{t('appFeedbackLockedCta')}</Text>
          ) : null}
        </View>
        {!pending ? (
          <FontAwesome
            name={rtl ? 'chevron-left' : 'chevron-right'}
            size={14}
            color={locked ? homeShell.cardMuted : homeShell.cardMuted}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: homeShell.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardLocked: {
    backgroundColor: '#F8FAFC',
    borderColor: homeShell.borderOnWhite,
    shadowOpacity: 0.03,
  },
  cardPending: {
    opacity: 0.85,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headRtl: {
    flexDirection: 'row-reverse',
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLocked: {
    backgroundColor: 'rgba(100, 116, 139, 0.12)',
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: brand.primary,
    marginBottom: 4,
  },
  titleLocked: {
    color: homeShell.cardText,
  },
  sub: {
    fontSize: fontSize.xs,
    color: homeShell.cardMuted,
    lineHeight: 17,
  },
  cta: {
    marginTop: 8,
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.primary,
  },
  txtRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
