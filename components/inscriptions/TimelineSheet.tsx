import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { LoadingTimelineStackSkeleton } from '@/components/ui/CardLoadingSkeleton';
import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import {
  findStatusByCode,
  loadCandidacyStatusesWithRefresh,
} from '@/services/candidacyStatusTypes';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type {
  CandidacyEvent,
  CandidacyStatusType,
  CandidacyTimelinePayload,
} from '@/types/inscriptions';
import {
  formatShortDate,
  formatTimeAgo,
  pickAnnouncementTitle,
  pickStatusLabel,
} from '@/utils/candidacyStatus';
import { pickAnnouncementTypeLabel } from '@/utils/announcementTypeLabel';

type Props = {
  visible: boolean;
  loading?: boolean;
  payload: CandidacyTimelinePayload | null;
  onClose: () => void;
};

const EVENT_ICON: Record<CandidacyEvent['type'], React.ComponentProps<typeof FontAwesome>['name']> = {
  created: 'plus-circle',
  status_changed: 'exchange',
  link_visited: 'external-link',
  note_added: 'sticky-note-o',
  deadline_reminder: 'clock-o',
  announcement_update: 'bullhorn',
};

export function TimelineSheet({ visible, loading, payload, onClose }: Props) {
  const { t, locale, isRTL } = useLocale();

  // Catalogue actif chargé via le service avec cache (pour rendre les
  // events `status_changed` qui ne portent que des codes string).
  const [catalog, setCatalog] = useState<CandidacyStatusType[]>([]);
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    void loadCandidacyStatusesWithRefresh((fresh) => {
      if (!cancelled) setCatalog(fresh);
    }).then((cached) => {
      if (!cancelled) setCatalog(cached);
    });
    return () => {
      cancelled = true;
    };
  }, [visible]);

  const labelForCode = (code: string | null): string => {
    if (!code) return '';
    const s = findStatusByCode(catalog, code);
    return s ? pickStatusLabel(s, locale) : t('inscStatusUnknown');
  };

  const renderEventLabel = (e: CandidacyEvent): string => {
    if (e.type === 'status_changed' && e.newStatus) {
      return `${t('inscEventStatusChanged')} → ${labelForCode(e.newStatus)}`;
    }
    switch (e.type) {
      case 'created': return t('inscEventCreated');
      case 'link_visited': return t('inscEventLinkVisited');
      case 'note_added': return t('inscEventNoteAdded');
      case 'deadline_reminder': return t('inscEventDeadlineReminder');
      case 'announcement_update': return t('inscEventAnnouncementUpdate');
      default: return e.message ?? '';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          <View style={[styles.headerRow, isRTL && styles.rowRtl]}>
            <Text style={[styles.title, isRTL && styles.rtl]}>{t('inscTimelineTitle')}</Text>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <FontAwesome name="times" size={16} color={brand.textMuted} />
            </Pressable>
          </View>

          {loading ? (
            <LoadingTimelineStackSkeleton count={4} isRTL={isRTL} style={styles.loadingWrap} />
          ) : !payload ? (
            <View style={styles.loadingWrap}>
              <Text style={styles.empty}>{t('inscErrorLoad')}</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
              {/* Timeline events */}
              <View style={styles.eventsBlock}>
                {payload.events.length === 0 ? (
                  <Text style={[styles.empty, isRTL && styles.rtl]}>{t('inscTimelineEmpty')}</Text>
                ) : (
                  payload.events.map((e, idx) => {
                    const isLast = idx === payload.events.length - 1;
                    return (
                      <View key={e.id} style={[styles.eventRow, isRTL && styles.rowRtl]}>
                        <View style={styles.eventIconCol}>
                          <View style={styles.eventIconBubble}>
                            <FontAwesome name={EVENT_ICON[e.type] ?? 'circle'} size={11} color={brand.white} />
                          </View>
                          {!isLast ? <View style={styles.eventLine} /> : null}
                        </View>
                        <View style={styles.eventBody}>
                          <Text style={[styles.eventLabel, isRTL && styles.rtl]} numberOfLines={2}>
                            {renderEventLabel(e)}
                          </Text>
                          {e.message && e.type !== 'status_changed' ? (
                            <Text style={[styles.eventMessage, isRTL && styles.rtl]} numberOfLines={3}>
                              {e.message}
                            </Text>
                          ) : null}
                          <Text style={[styles.eventTime, isRTL && styles.rtl]}>
                            {formatTimeAgo(e.createdAt, locale)}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>

              {/* Annonces liées */}
              {payload.relatedAnnouncements.length > 0 ? (
                <View style={styles.relatedBlock}>
                  <Text style={[styles.relatedTitle, isRTL && styles.rtl]}>
                    {t('inscTimelineRelatedAnnouncements')}
                  </Text>
                  {payload.relatedAnnouncements.map((a) => (
                    <View key={a.id} style={styles.relCard}>
                      <View style={[styles.relCardHead, isRTL && styles.rowRtl]}>
                        <View style={styles.relIconWrap}>
                          <FontAwesome name="bullhorn" size={12} color={brand.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.relTitle, isRTL && styles.rtl]} numberOfLines={2}>
                            {pickAnnouncementTitle(a, locale) || a.title}
                          </Text>
                          <Text style={[styles.relMeta, isRTL && styles.rtl]}>
                            {pickAnnouncementTypeLabel(a.announcementType, t)} ·{' '}
                            {formatShortDate(a.dateStart, locale)} → {formatShortDate(a.dateEnd, locale)}
                          </Text>
                        </View>
                      </View>
                      {Array.isArray(a.liensUtiles) && a.liensUtiles.length > 0 ? (
                        <View style={[styles.relLinks, isRTL && styles.rowRtl]}>
                          {a.liensUtiles.slice(0, 4).map((l, i) => (
                            <Pressable
                              key={`${l.url}-${i}`}
                              onPress={() => {
                                void Linking.openURL(l.url).catch(() => undefined);
                              }}
                              style={({ pressed }) => [
                                styles.relLinkChip,
                                pressed && { opacity: 0.85 },
                              ]}
                            >
                              <FontAwesome name="link" size={10} color={brand.primary} />
                              <Text style={styles.relLinkChipTxt} numberOfLines={1}>
                                {l.titre || l.url}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  ))}
                </View>
              ) : null}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: brand.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.lg,
    maxHeight: '85%',
    gap: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 4,
    backgroundColor: brand.border,
    marginBottom: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowRtl: { flexDirection: 'row-reverse' },
  title: { fontSize: fontSize.lg, fontWeight: '800', color: brand.text },
  closeBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: brand.borderLight,
  },
  loadingWrap: { paddingVertical: 40, alignItems: 'center' },
  empty: { color: brand.textMuted, fontSize: fontSize.sm, textAlign: 'center' },
  eventsBlock: { gap: 0, marginTop: spacing.sm },
  eventRow: { flexDirection: 'row', gap: spacing.sm, minHeight: 56 },
  eventIconCol: { width: 28, alignItems: 'center' },
  eventIconBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  eventLine: { flex: 1, width: 2, backgroundColor: brand.border, marginTop: 4 },
  eventBody: { flex: 1, paddingBottom: spacing.md, gap: 2 },
  eventLabel: { color: brand.text, fontWeight: '700', fontSize: fontSize.sm },
  eventMessage: { color: brand.textSecondary, fontSize: fontSize.xs, lineHeight: 17 },
  eventTime: { color: brand.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  relatedBlock: { marginTop: spacing.md, gap: spacing.sm },
  relatedTitle: { fontWeight: '800', color: brand.text, fontSize: fontSize.md, marginBottom: 4 },
  relCard: {
    padding: spacing.md,
    backgroundColor: brand.backgroundSoft,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  relCardHead: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  relIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(51,62,143,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  relTitle: { fontWeight: '700', color: brand.text, fontSize: fontSize.sm },
  relMeta: { color: brand.textMuted, fontSize: fontSize.xs, marginTop: 2 },
  relLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  relLinkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(51,62,143,0.25)',
    backgroundColor: brand.white,
    maxWidth: 220,
  },
  relLinkChipTxt: {
    color: brand.primary,
    fontSize: fontSize.xs,
    fontWeight: '700',
    flexShrink: 1,
  },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
});
