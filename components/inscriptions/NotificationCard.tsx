import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { AppNotification } from '@/types/inscriptions';
import { notificationMessage, notificationTimeAgo, notificationTitle } from '@/utils/notificationDisplay';

type Props = {
  notif: AppNotification;
  onPress?: () => void;
  /** Tutoriel : désactive le tap sur la carte. */
  interactive?: boolean;
  /** Bouton d’action sous le contenu (tiroir notifications). */
  actionLabel?: string;
  onActionPress?: () => void;
};

const TYPE_ICON: Record<string, React.ComponentProps<typeof FontAwesome>['name']> = {
  welcome: 'hand-peace-o',
  favorite_added: 'star',
  favorite_removed: 'star-o',
  plan_step_completed: 'check',
  school_recommendations_ready: 'star',
  candidacy_status_changed: 'paper-plane',
  announcement: 'bullhorn',
  community_qna_reply: 'comment',
  community_qna_official: 'check-circle',
  community_qna_thread_reply: 'comments-o',
  community_qna_thread_official: 'check-circle',
  community_qna_me_too: 'hand-o-up',
  follow_school_new_announcement: 'bullhorn',
};

export function NotificationCard({
  notif,
  onPress,
  interactive = true,
  actionLabel,
  onActionPress,
}: Props) {
  const { isRTL, locale } = useLocale();
  const icon = TYPE_ICON[notif.type] ?? 'bell';
  const title = notificationTitle(notif, locale);
  const message = notificationMessage(notif, locale);
  const timeAgo = notificationTimeAgo(notif, locale);

  const canPress = interactive && typeof onPress === 'function';
  const showAction = Boolean(actionLabel && onActionPress);

  return (
    <Pressable
      onPress={canPress ? onPress : undefined}
      disabled={!interactive || showAction}
      style={({ pressed }) => [
        styles.card,
        !notif.isRead && styles.cardUnread,
        pressed && canPress && { opacity: 0.85 },
        isRTL && styles.cardRtl,
      ]}
    >
      <View style={[styles.iconWrap]}>
        <FontAwesome name={icon} size={15} color={brand.primary} />
      </View>
      <View style={styles.body}>
        <View style={[styles.headerRow, isRTL && styles.rowRtl]}>
          <Text
            style={[styles.title, !notif.isRead && styles.titleUnread, isRTL && styles.rtl]}
            numberOfLines={2}
          >
            {title}
          </Text>
          {!notif.isRead ? <View style={styles.dot} /> : null}
        </View>
        <Text style={[styles.message, isRTL && styles.rtl]} numberOfLines={4}>
          {message}
        </Text>
        <Text style={[styles.time, isRTL && styles.rtl]}>{timeAgo}</Text>
        {showAction ? (
          <Pressable
            onPress={onActionPress}
            style={({ pressed }) => [styles.actionBtn, isRTL && styles.rowRtl, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.actionBtnTxt}>{actionLabel}</Text>
            <FontAwesome name={isRTL ? 'chevron-left' : 'chevron-right'} size={12} color={brand.white} />
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  cardRtl: { flexDirection: 'row-reverse' },
  cardUnread: {
    backgroundColor: 'rgba(51,62,143,0.04)',
    borderColor: 'rgba(51,62,143,0.25)',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(51,62,143,0.10)',
  },
  body: { flex: 1, gap: 2 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  title: {
    fontSize: fontSize.sm,
    color: brand.text,
    fontWeight: '700',
    flex: 1,
    lineHeight: 18,
  },
  titleUnread: {
    fontWeight: '800',
    color: brand.primary,
  },
  message: {
    fontSize: fontSize.sm,
    color: brand.textSecondary,
    lineHeight: 18,
    fontWeight: '500',
  },
  time: {
    marginTop: 2,
    fontSize: 10,
    color: brand.textMuted,
    fontWeight: '600',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: brand.primary,
    flexShrink: 0,
  },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: brand.primary,
    paddingVertical: 8,
    borderRadius: radius.md,
    marginTop: spacing.xs,
  },
  actionBtnTxt: { color: brand.white, fontWeight: '800', fontSize: 10 },
});
