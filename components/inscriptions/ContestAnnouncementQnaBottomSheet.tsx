import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CommunityQnaSection } from '@/components/community/CommunityQnaSection';
import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { homeShell } from '@/theme/homeShell';
import { fontSize, radius, spacing } from '@/theme/tokens';

type Props = {
  visible: boolean;
  announcementId: number;
  /** Titre affiché dans l’en-tête (FR ou AR selon l’écran appelant). */
  announcementTitle: string;
  /** École de l’annonce (filtrage onglet Inscriptions). */
  establishmentId?: number;
  /** Navigation vers les annonces (ex. fermer la sheet puis scroller). */
  onPressContestAnnouncements?: () => void;
  onClose: () => void;
};

/**
 * Panneau modal « commentaires / Q&R » pour une annonce de concours,
 * même principe que {@link EstablishmentQnaBottomSheet} sur la liste Écoles.
 */
export function ContestAnnouncementQnaBottomSheet({
  visible,
  announcementId,
  announcementTitle,
  establishmentId,
  onPressContestAnnouncements,
  onClose,
}: Props) {
  const { t, isRTL } = useLocale();
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  const scrollMax = Math.min(winH * 0.78, 580);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root} pointerEvents="box-none">
        <Pressable
          style={styles.overlay}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('closeOverlayA11y')}
        />
        <View
          style={[
            styles.sheet,
            {
              paddingBottom: insets.bottom + spacing.md,
              maxHeight: winH * 0.92,
            },
          ]}>
          <View style={styles.handle} />
          <View style={[styles.header, isRTL && styles.rowRtl]}>
            <Text style={[styles.title, isRTL && styles.txtRtl]} numberOfLines={3}>
              {announcementTitle.trim() || '—'}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={t('modalClose')}>
              <FontAwesome name="times" size={20} color={homeShell.cardMuted} />
            </Pressable>
          </View>
          <View style={[styles.qnaHost, { height: scrollMax }]}>
            {announcementId > 0 ? (
              <CommunityQnaSection
                contextType="contest_announcement"
                contextId={announcementId}
                establishmentId={establishmentId}
                onPressContestAnnouncements={onPressContestAnnouncements}
                variant="embedded"
                marginHorizontal={0}
                composerLayout="instagram"
              />
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,6,23,0.55)',
  },
  sheet: {
    width: '100%',
    backgroundColor: homeShell.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: homeShell.borderOnWhite,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(15,23,42,0.15)',
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  title: {
    flex: 1,
    color: homeShell.cardText,
    fontSize: fontSize.lg,
    fontWeight: '900',
    letterSpacing: -0.2,
    lineHeight: 24,
    minWidth: 0,
  },
  txtRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  qnaHost: {
    width: '100%',
    minHeight: 0,
  },
});
