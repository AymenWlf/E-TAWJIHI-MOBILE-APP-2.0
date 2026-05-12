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
};

const TYPE_ICON: Record<string, React.ComponentProps<typeof FontAwesome>['name']> = {
  welcome: 'hand-peace-o',
  favorite_added: 'star',
  favorite_removed: 'star-o',
  plan_step_completed: 'check',
  candidacy_status_changed: 'paper-plane',
  announcement: 'bullhorn',
  community_qna_reply: 'comment',
  community_qna_official: 'check-circle',
  community_qna_thread_reply: 'comments-o',
  community_qna_thread_official: 'check-circle',
  community_qna_me_too: 'hand-o-up',
  follow_school_new_announcement: 'bullhorn',
};

export function NotificationCard({ notif, onPress }: Props) {
  const { isRTL, locale } = useLocale();
  const icon = TYPE_ICON[notif.type] ?? 'bell';
  const title = notificationTitle(notif, locale);
  const message = notificationMessage(notif, locale);
  const timeAgo = notificationTimeAgo(notif, locale);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        !notif.isRead && styles.cardUnread,
        pressed && { opacity: 0.85 },
        isRTL && styles.cardRtl,
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: notif.isRead ? brand.borderLight : 'rgba(51,62,143,0.10)' },
        ]}
      >
        <FontAwesome name={icon} size={16} color={brand.primary} />
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
        <Text style={[styles.message, isRTL && styles.rtl]} numberOfLines={3}>
          {message}
        </Text>
        <Text style={[styles.time, isRTL && styles.rtl]}>{timeAgo}</Text>
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
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 3 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  title: {
    fontSize: fontSize.md,
    color: brand.text,
    fontWeight: '600',
    flex: 1,
  },
  titleUnread: {
    fontWeight: '800',
    color: brand.primary,
  },
  message: {
    fontSize: fontSize.sm,
    color: brand.textSecondary,
    lineHeight: 19,
  },
  time: {
    marginTop: 2,
    fontSize: fontSize.xs,
    color: brand.textMuted,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: brand.primary,
    flexShrink: 0,
  },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
});
