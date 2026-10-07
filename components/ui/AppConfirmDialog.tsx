import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  confirmDestructive?: boolean;
  isRTL?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * Dialogue de confirmation in-app (évite `Alert.alert` / `window.confirm` sur web).
 */
export function AppConfirmDialog({
  visible,
  title,
  message,
  cancelLabel,
  confirmLabel,
  confirmDestructive = false,
  isRTL = false,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityRole="button" />
        <View
          style={[styles.card, isRTL && styles.cardRtl]}
          accessibilityViewIsModal
          accessibilityRole="alert">
          <Text style={[styles.title, isRTL && styles.rtlText]}>{title}</Text>
          <Text style={[styles.message, isRTL && styles.rtlText]}>{message}</Text>
          <View style={[styles.actions, isRTL && styles.actionsRtl]}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [styles.btn, styles.btnCancel, pressed && { opacity: 0.88 }]}
              accessibilityRole="button">
              <Text style={styles.btnCancelTxt}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.btn,
                confirmDestructive ? styles.btnDanger : styles.btnPrimary,
                pressed && { opacity: 0.9 },
              ]}
              accessibilityRole="button">
              <Text style={styles.btnConfirmTxt}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: brand.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  cardRtl: { writingDirection: 'rtl' },
  title: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: brand.text,
  },
  message: {
    fontSize: fontSize.sm,
    color: brand.textSecondary,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionsRtl: { flexDirection: 'row-reverse' },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  btnCancel: {
    backgroundColor: brand.backgroundSoft,
    borderWidth: 1,
    borderColor: brand.border,
  },
  btnCancelTxt: { color: brand.primary, fontWeight: '800', fontSize: fontSize.sm },
  btnPrimary: { backgroundColor: brand.primary },
  btnDanger: { backgroundColor: brand.error },
  btnConfirmTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.sm },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
