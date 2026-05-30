import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { loadCandidacyStatusesWithRefresh } from '@/services/candidacyStatusTypes';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { CandidacyStatusType } from '@/types/inscriptions';
import { partitionCandidacyStatuses, pickStatusLabel } from '@/utils/candidacyStatus';

type IconName = React.ComponentProps<typeof FontAwesome>['name'];

type Props = {
  visible: boolean;
  /**
   * Statut courant de la candidature, ou `null` si aucun statut n'est
   * encore explicitement choisi. Pré-coche la sélection initiale.
   */
  currentStatus: CandidacyStatusType | null;
  /**
   * Liste ordonnée des statuts proposés à l'utilisateur (= statuts
   * autorisés par l'annonce). Chaque entrée porte ses propres couleurs et
   * son libellé FR/AR. Si la liste est vide, le parent doit éviter
   * d'ouvrir la sheet (le bouton « Mettre à jour » doit déjà être caché).
   */
  availableStatuses: CandidacyStatusType[];
  onClose: () => void;
  /**
   * Confirmation du statut choisi.
   */
  onConfirm: (status: CandidacyStatusType | null) => void | Promise<void>;
  onRequestDelete?: () => void;
  /**
   * Afficher (grisés) les statuts du catalogue non autorisés pour la
   * cible courante, avec mention « Non disponible pour le moment ».
   *
   * - `true` (défaut) : utile sur l'écran école suivie, pour que
   *   l'utilisateur voie l'ensemble des statuts possibles à terme et
   *   comprenne pourquoi certains sont verrouillés.
   * - `false` : sur les écrans liés à une annonce, on n'affiche que les
   *   statuts effectivement débloqués par l'annonce — pas de pollution
   *   visuelle avec les statuts d'autres annonces.
   */
  showUnavailable?: boolean;
};

/**
 * Tri stable des statuts : par `sortOrder` croissant puis par `id`
 * (ordre admin), pour avoir un affichage homogène entre statuts
 * disponibles et indisponibles.
 */
function sortStatuses(list: CandidacyStatusType[]): CandidacyStatusType[] {
  return [...list].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.id - b.id;
  });
}

export function StatusUpdateSheet({
  visible,
  currentStatus,
  availableStatuses,
  onClose,
  onConfirm,
  onRequestDelete,
  showUnavailable = true,
}: Props) {
  const { t, locale, isRTL } = useLocale();

  // Sélection courante : id de statut, ou `undefined` tant qu'aucun choix.
  const [selectedId, setSelectedId] = useState<number | undefined>(
    currentStatus?.id ?? undefined,
  );
  const [submitting, setSubmitting] = useState(false);
  // Catalogue complet (tous statuts actifs). Utilisé pour afficher en
  // grisé ceux qui ne sont pas autorisés pour la cible courante (annonce
  // ou école). Chargé en lazy depuis le cache + refresh réseau.
  const [catalog, setCatalog] = useState<CandidacyStatusType[]>([]);

  useEffect(() => {
    setSelectedId(currentStatus?.id ?? undefined);
  }, [currentStatus, visible]);

  useEffect(() => {
    if (!visible) setSubmitting(false);
  }, [visible]);

  // Charge le catalogue à l'ouverture (cache d'abord, refresh derrière).
  // On ne paie ce coût que si l'écran demande à afficher les statuts
  // indisponibles — sinon le sheet se contente de la liste fournie.
  useEffect(() => {
    if (!visible || !showUnavailable) return;
    let cancelled = false;
    void loadCandidacyStatusesWithRefresh((fresh) => {
      if (!cancelled) setCatalog(fresh);
    }).then((cached) => {
      if (!cancelled) setCatalog(cached);
    });
    return () => {
      cancelled = true;
    };
  }, [visible, showUnavailable]);

  /**
   * Statuts indisponibles : ceux du catalogue qui ne sont pas autorisés
   * pour la cible courante. Le statut courant (s'il y en a un) est
   * volontairement exclu de la liste « indisponibles » pour ne pas se
   * retrouver à la fois dans « disponibles » et « grisés » au cas où il
   * vient d'être désautorisé.
   *
   * Liste vide quand `showUnavailable === false` (sheet ouverte depuis
   * une annonce : on ne pollue pas avec les statuts des autres annonces).
   */
  const { available, unavailable } = useMemo(() => {
    const available = sortStatuses(availableStatuses);
    if (!showUnavailable) {
      return { available, unavailable: [] as CandidacyStatusType[] };
    }
    const allowedIds = new Set(available.map((s) => s.id));
    if (currentStatus?.id != null) allowedIds.add(currentStatus.id);
    const unavailable = sortStatuses(catalog.filter((s) => !allowedIds.has(s.id)));
    return { available, unavailable };
  }, [availableStatuses, catalog, currentStatus, showUnavailable]);

  const findById = (id: number): CandidacyStatusType | undefined =>
    available.find((s) => s.id === id);

  const hasSelection = selectedId !== undefined;

  const handleConfirm = async () => {
    if (!hasSelection || submitting) return;
    try {
      setSubmitting(true);
      const next = findById(selectedId as number) ?? null;
      await Promise.resolve(onConfirm(next));
    } finally {
      setSubmitting(false);
    }
  };

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
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={handleBackdropPress}
          accessibilityRole="button"
          accessibilityLabel={t('loginBack')}
        />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={[styles.title, isRTL && styles.rtl]}>{t('inscStatusActionTitle')}</Text>
          <Text style={[styles.subtitle, isRTL && styles.rtl]}>
            {t('inscStatusActionSubtitle')}
          </Text>

          {/* Liste scrollable : la sheet reste à hauteur raisonnable même
              avec un catalogue large (12+ statuts), tout en laissant le
              CTA « Mettre à jour » et les indicateurs visibles en bas. */}
          <ScrollView
            style={[styles.list, { maxHeight: Dimensions.get('window').height * 0.55 }]}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator
            bounces
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            scrollEventThrottle={16}
          >
            {available.map((s) => {
              const active = selectedId === s.id;
              const fg = s.colorFg;
              const bg = s.colorBg;
              const icon = (s.icon || 'circle') as IconName;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => setSelectedId(s.id)}
                  disabled={submitting}
                  style={({ pressed }) => [
                    styles.row,
                    isRTL && styles.rowRtl,
                    active && { borderColor: fg, backgroundColor: bg },
                    pressed && { opacity: 0.85 },
                    submitting && { opacity: 0.6 },
                  ]}
                >
                  <View style={[styles.iconWrap, { backgroundColor: active ? fg : bg }]}>
                    <FontAwesome name={icon} size={14} color={active ? '#FFFFFF' : fg} />
                  </View>
                  <Text
                    style={[
                      styles.rowLabel,
                      isRTL && styles.rtl,
                      active && { color: fg, fontWeight: '800' },
                    ]}
                  >
                    {pickStatusLabel(s, locale)}
                  </Text>
                  {active ? <FontAwesome name="check" size={14} color={fg} /> : null}
                </Pressable>
              );
            })}

            {/* Statuts du catalogue non autorisés pour la cible : grisés
                + non sélectionnables, avec mention « Indisponible » pour
                que l'utilisateur sache qu'ils existent (transparence) et
                comprenne pourquoi ils ne sont pas activables ici. */}
            {unavailable.map((s) => {
              const icon = (s.icon || 'circle') as IconName;
              return (
                <View
                  key={`disabled-${s.id}`}
                  pointerEvents="none"
                  accessibilityState={{ disabled: true }}
                  style={[styles.row, styles.rowDisabled, isRTL && styles.rowRtl]}
                >
                  <View style={[styles.iconWrap, styles.iconWrapDisabled]}>
                    <FontAwesome name={icon} size={14} color={brand.textMuted} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.rowLabel, styles.rowLabelDisabled, isRTL && styles.rtl]}
                    >
                      {pickStatusLabel(s, locale)}
                    </Text>
                    <Text style={[styles.rowDisabledHint, isRTL && styles.rtl]}>
                      {t('inscStatusUnavailable')}
                    </Text>
                  </View>
                  <FontAwesome name="lock" size={12} color={brand.textMuted} />
                </View>
              );
            })}

          </ScrollView>

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
              disabled={!hasSelection || submitting}
              accessibilityState={{ busy: submitting, disabled: !hasSelection || submitting }}
              style={({ pressed }) => [
                styles.btnConfirm,
                isRTL && styles.btnConfirmRtl,
                (!hasSelection || submitting) && { opacity: 0.85 },
                pressed && !submitting && { opacity: 0.85 },
              ]}
            >
              {submitting ? <ActivityIndicator size="small" color={brand.white} /> : null}
              <Text style={styles.btnConfirmTxt}>
                {submitting ? t('inscStatusActionUpdating') : t('inscStatusActionUpdate')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
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
  list: { marginTop: spacing.sm },
  listContent: { gap: 8, paddingBottom: spacing.xs },
  section: { gap: 8 },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.xs,
  },
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
  /* Variante grisée : statut existant dans le catalogue mais non
     autorisé pour la cible (annonce / école) — affiché à titre indicatif. */
  rowDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E5E7EB',
    opacity: 0.85,
  },
  iconWrapDisabled: { backgroundColor: '#E5E7EB' },
  rowLabelDisabled: { color: brand.textMuted, fontWeight: '700' },
  rowDisabledHint: {
    color: brand.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginTop: 2,
    fontStyle: 'italic',
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
