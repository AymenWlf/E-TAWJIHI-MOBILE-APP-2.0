import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { GlobalWallReactionSummary } from '@/services/globalWall';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

export const GLOBAL_WALL_QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'] as const;

type Props = {
  reactions: GlobalWallReactionSummary[];
  mineBubble: boolean;
  disabled?: boolean;
  busy?: boolean;
  addLabel: string;
  onPick: (emoji: string) => void | Promise<void>;
  /** Bulle principale du fil vs réponse (taille / marges). */
  variant?: 'main' | 'reply';
  isRTL?: boolean;
};

/**
 * Réactions intégrées au bas du message : pastilles existantes + bouton circulaire pour en ajouter.
 */
export function GlobalWallMessageReactions({
  reactions,
  mineBubble,
  disabled,
  busy,
  addLabel,
  onPick,
  variant = 'main',
  isRTL,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleEmoji = useCallback(
    async (emoji: string) => {
      if (disabled || busy) return;
      await onPick(emoji);
      setPickerOpen(false);
    },
    [busy, disabled, onPick],
  );

  const showPicker = !disabled;

  if (disabled && reactions.length === 0) {
    return null;
  }

  return (
    <>
      <View
        style={[
          styles.bar,
          variant === 'reply' && styles.barReply,
          mineBubble && styles.barMineTop,
          mineBubble ? styles.barMine : styles.barOther,
          isRTL && styles.barRtl,
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollInner,
            mineBubble ? styles.scrollInnerMine : styles.scrollInnerOther,
            isRTL && styles.scrollInnerRtl,
          ]}
        >
          {reactions.map((r) => (
            <Pressable
              key={r.emoji}
              accessibilityRole="button"
              accessibilityLabel={`${r.emoji} ${r.count}`}
              disabled={disabled || busy}
              onPress={() => void handleEmoji(r.emoji)}
              style={({ pressed }) => [
                styles.chip,
                mineBubble ? styles.chipMine : styles.chipOther,
                r.reactedByMe && (mineBubble ? styles.chipActiveMine : styles.chipActiveOther),
                pressed && { opacity: 0.85 },
                (disabled || busy) && { opacity: 0.45 },
              ]}
            >
              <Text style={styles.emoji}>{r.emoji}</Text>
              <Text style={[styles.count, mineBubble && styles.countMine]}>{r.count}</Text>
            </Pressable>
          ))}
          {showPicker ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={addLabel}
              disabled={busy}
              onPress={() => setPickerOpen(true)}
              style={({ pressed }) => [
                styles.addBtn,
                mineBubble ? styles.addBtnMine : styles.addBtnOther,
                pressed && { opacity: 0.88 },
                busy && { opacity: 0.45 },
              ]}
            >
              <FontAwesome
                name="smile-o"
                size={variant === 'reply' ? 13 : 14}
                color={mineBubble ? 'rgba(255,255,255,0.92)' : brand.primary}
              />
            </Pressable>
          ) : null}
        </ScrollView>
      </View>

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)} accessibilityLabel={addLabel} />
        <View style={[styles.modalSheet, mineBubble && styles.modalSheetMine]}>
          <Text style={[styles.modalHint, mineBubble && styles.modalHintMine]}>{addLabel}</Text>
          <View style={styles.emojiGrid}>
            {GLOBAL_WALL_QUICK_REACTIONS.map((e) => (
              <Pressable
                key={e}
                onPress={() => void handleEmoji(e)}
                style={({ pressed }) => [
                  styles.emojiBtn,
                  mineBubble && styles.emojiBtnMine,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={styles.emojiLarge}>{e}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(148, 163, 184, 0.35)',
  },
  barReply: {
    marginTop: 6,
    paddingTop: 4,
  },
  barMine: {},
  barOther: {},
  /** Séparateur lisible sur bulle colorée (messages « moi »). */
  barMineTop: {
    borderTopColor: 'rgba(255,255,255,0.22)',
  },
  barRtl: {
    // alignement géré par scrollInnerRtl
  },
  scrollInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  scrollInnerMine: {
    justifyContent: 'flex-end',
    flexGrow: 1,
  },
  scrollInnerOther: {
    justifyContent: 'flex-start',
    flexGrow: 1,
  },
  scrollInnerRtl: {
    flexDirection: 'row-reverse',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipOther: {
    backgroundColor: 'rgba(248,250,252,0.95)',
    borderColor: brand.borderLight,
  },
  chipMine: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderColor: 'rgba(255,255,255,0.35)',
  },
  chipActiveOther: {
    borderColor: brand.primary,
    backgroundColor: 'rgba(51,62,143,0.08)',
  },
  chipActiveMine: {
    borderColor: 'rgba(255,255,255,0.65)',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  emoji: { fontSize: fontSize.sm },
  count: { fontSize: 10, fontWeight: '700', color: brand.textMuted },
  countMine: { color: 'rgba(255,255,255,0.88)' },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  /** Bulle blanche : fond et bordure visibles (éviter blanc sur blanc). */
  addBtnOther: {
    backgroundColor: 'rgba(51, 62, 143, 0.12)',
    borderColor: 'rgba(51, 62, 143, 0.38)',
  },
  addBtnMine: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.35)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  modalSheet: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: 120,
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.borderLight,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  modalSheetMine: {
    backgroundColor: brand.primary,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  modalHint: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: brand.textMuted,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalHintMine: { color: 'rgba(255,255,255,0.92)' },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emojiBtn: {
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: brand.backgroundSoft,
  },
  emojiBtnMine: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  emojiLarge: { fontSize: 28 },
});
