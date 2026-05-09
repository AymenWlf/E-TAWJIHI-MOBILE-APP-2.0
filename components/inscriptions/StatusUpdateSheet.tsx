import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { CandidacyStatus } from '@/types/inscriptions';
import { STATUS_FLOW, STATUS_VISUALS } from '@/utils/candidacyStatus';

type Props = {
  visible: boolean;
  currentStatus?: CandidacyStatus;
  onClose: () => void;
  onConfirm: (status: CandidacyStatus) => void | Promise<void>;
  onRequestDelete?: () => void;
};

export function StatusUpdateSheet({ visible, currentStatus, onClose, onConfirm, onRequestDelete }: Props) {
  const { t, isRTL } = useLocale();
  const [selected, setSelected] = useState<CandidacyStatus | undefined>(currentStatus);
  // État de soumission du bouton « Mettre à jour ». Activé pendant l'await
  // de `onConfirm`, désactivé une fois la promesse résolue ou rejetée. Bloque
  // également les interactions de fermeture pour éviter les races.
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSelected(currentStatus);
  }, [currentStatus, visible]);

  // Si la sheet se ferme depuis l'extérieur, on remet le bouton à l'état repos.
  useEffect(() => {
    if (!visible) setSubmitting(false);
  }, [visible]);

  const handleConfirm = async () => {
    if (!selected || submitting) return;
    try {
      setSubmitting(true);
      await Promise.resolve(onConfirm(selected));
    } finally {
      // Le parent referme normalement la sheet via setVisible(false) ; cet
      // effet de garde évite tout état « bloqué » si la promesse rejette.
      setSubmitting(false);
    }
  };

  // Pendant la soumission, on désactive backdrop / Android back / suppression
  // pour garder un parcours linéaire jusqu'à la résolution de la requête.
  const handleBackdropPress = () => {
    if (submitting) return;
    onClose();
  };
  const handleRequestClose = () => {
    if (submitting) return;
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleRequestClose}>
      <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
        <Pressable
          style={styles.sheet}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />
          <Text style={[styles.title, isRTL && styles.rtl]}>{t('inscStatusActionTitle')}</Text>
          <Text style={[styles.subtitle, isRTL && styles.rtl]}>{t('inscStatusActionSubtitle')}</Text>

          <View style={styles.list}>
            {STATUS_FLOW.map((s) => {
              const v = STATUS_VISUALS[s];
              const active = selected === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => setSelected(s)}
                  disabled={submitting}
                  style={({ pressed }) => [
                    styles.row,
                    isRTL && styles.rowRtl,
                    active && { borderColor: v.fg, backgroundColor: v.bg },
                    pressed && { opacity: 0.85 },
                    submitting && { opacity: 0.6 },
                  ]}
                >
                  <View
                    style={[styles.iconWrap, { backgroundColor: active ? v.fg : v.bg }]}
                  >
                    <FontAwesome
                      name={v.icon}
                      size={14}
                      color={active ? '#FFFFFF' : v.fg}
                    />
                  </View>
                  <Text
                    style={[
                      styles.rowLabel,
                      isRTL && styles.rtl,
                      active && { color: v.fg, fontWeight: '800' },
                    ]}
                  >
                    {t(v.labelKey)}
                  </Text>
                  {active ? (
                    <FontAwesome name="check" size={14} color={v.fg} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.footer, isRTL && styles.rowRtl]}>
            {onRequestDelete ? (
              <Pressable
                onPress={onRequestDelete}
                disabled={submitting}
                style={({ pressed }) => [
                  styles.btnDanger,
                  pressed && { opacity: 0.8 },
                  submitting && { opacity: 0.5 },
                ]}
              >
                <FontAwesome name="trash" size={12} color={brand.error} />
                <Text style={styles.btnDangerTxt}>{t('inscRemoveCandidacy')}</Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={handleConfirm}
              disabled={!selected || submitting}
              accessibilityState={{ busy: submitting, disabled: !selected || submitting }}
              style={({ pressed }) => [
                styles.btnConfirm,
                isRTL && styles.btnConfirmRtl,
                (!selected || submitting) && { opacity: 0.85 },
                pressed && !submitting && { opacity: 0.85 },
              ]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={brand.white} />
              ) : null}
              <Text style={styles.btnConfirmTxt}>
                {submitting ? t('inscStatusActionUpdating') : t('inscStatusActionUpdate')}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: brand.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 4,
    backgroundColor: brand.border,
    marginBottom: spacing.sm,
  },
  title: { fontSize: fontSize.lg, fontWeight: '800', color: brand.text },
  subtitle: { fontSize: fontSize.sm, color: brand.textSecondary, marginTop: -4 },
  list: { gap: 8, marginTop: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    backgroundColor: brand.white,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    color: brand.text,
    fontWeight: '600',
    fontSize: fontSize.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  btnConfirm: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnConfirmRtl: { flexDirection: 'row-reverse' },
  btnConfirmTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.md },
  btnDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.error,
  },
  btnDangerTxt: { color: brand.error, fontWeight: '700', fontSize: fontSize.sm },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
});
