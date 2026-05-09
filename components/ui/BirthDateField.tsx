/**
 * BirthDateField — champ de saisie de date cross-platform.
 *
 * - **Web** : `<input type="date">` natif, stylisé pour s'intégrer aux cartes
 *   E-Tawjihi (charte bleu + vert + blanc).
 * - **iOS**  : un `Pressable` qui ouvre une bottom-sheet `Modal` contenant un
 *   `DateTimePicker` en mode `spinner` avec boutons « Annuler / OK ».
 * - **Android** : un `Pressable` qui déclenche le dialog calendrier natif.
 *
 * La valeur est manipulée au format **YYYY-MM-DD** (`value` / `onChange`),
 * mais affichée à l'utilisateur au format **DD-MM-YYYY**, comme convenu dans
 * le wizard d'inscription. Le composant gère le RTL (icône calendrier
 * positionnée à gauche en arabe).
 *
 * Ce composant est utilisé dans le formulaire d'édition de « Mon compte »
 * (`app/(tabs)/compte.tsx`) et peut être réutilisé partout où l'on souhaite
 * un sélecteur de date homogène (réécrire le wizard pour qu'il l'utilise
 * peut être fait dans un commit séparé pour limiter les régressions).
 */

import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { homeShell } from '@/theme/homeShell';

const DEFAULT_MIN = new Date(1940, 0, 1);
const DEFAULT_INITIAL = new Date(2006, 0, 1);

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatDateYMD(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatDateDMY(d: Date): string {
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
}

function parseYMD(s: string | undefined | null): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y, mo - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export type BirthDateFieldProps = {
  /** Valeur courante au format YYYY-MM-DD (vide ⇒ pas de date sélectionnée). */
  value: string;
  /** Callback déclenché à la sélection (toujours YYYY-MM-DD). */
  onChange: (ymd: string) => void;
  /** Direction du texte (RTL en arabe). */
  rtl?: boolean;
  /** Texte affiché lorsqu'aucune date n'est sélectionnée. */
  placeholder?: string;
  /** Date minimale autorisée (défaut : 1er janvier 1940). */
  minDate?: Date;
  /** Date maximale autorisée (défaut : aujourd'hui). */
  maxDate?: Date;
  /** Titre de la sheet iOS (défaut : « Date de naissance »). */
  modalTitle?: string;
  /** Libellés des boutons iOS. */
  cancelLabel?: string;
  okLabel?: string;
};

export function BirthDateField({
  value,
  onChange,
  rtl = false,
  placeholder = 'JJ-MM-AAAA',
  minDate = DEFAULT_MIN,
  maxDate,
  modalTitle = 'Date de naissance',
  cancelLabel = 'Annuler',
  okLabel = 'OK',
}: BirthDateFieldProps) {
  const max = maxDate ?? new Date();

  const dateValue = useMemo(() => parseYMD(value), [value]);
  const display = useMemo(
    () => (dateValue ? formatDateDMY(dateValue) : ''),
    [dateValue],
  );

  const [open, setOpen] = useState(false);

  if (Platform.OS === 'web') {
    /* Le navigateur fournit déjà un date picker natif riche. */
    return (
      <View style={[styles.field, rtl && styles.fieldRtl]}>
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore – web-only HTML input */}
        <input
          type="date"
          value={value}
          min={formatDateYMD(minDate)}
          max={formatDateYMD(max)}
          onChange={(e: any) => {
            const v: string = e?.target?.value ?? '';
            if (v) onChange(v);
          }}
          style={{
            border: 'none',
            background: 'transparent',
            flex: 1,
            fontSize: 15,
            color: value ? homeShell.cardText : homeShell.cardMuted,
            outline: 'none',
            width: '100%',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        />
        <FontAwesome
          name="calendar"
          size={16}
          color={homeShell.cardMuted}
          style={rtl ? styles.iconLeft : styles.iconRight}
        />
      </View>
    );
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={modalTitle}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.field,
          rtl && styles.fieldRtl,
          pressed && { opacity: 0.85 },
        ]}>
        <Text
          numberOfLines={1}
          style={[
            styles.fieldText,
            !display && styles.fieldTextPlaceholder,
            rtl && styles.fieldTextRtl,
          ]}>
          {display || placeholder}
        </Text>
        <FontAwesome name="calendar" size={16} color={homeShell.cardMuted} />
      </Pressable>

      <BirthDateNativePicker
        visible={open}
        value={dateValue}
        minDate={minDate}
        maxDate={max}
        rtl={rtl}
        labels={{ title: modalTitle, cancel: cancelLabel, ok: okLabel }}
        onClose={() => setOpen(false)}
        onSelect={(d) => {
          onChange(formatDateYMD(d));
          setOpen(false);
        }}
      />
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function BirthDateNativePicker({
  visible,
  value,
  maxDate,
  minDate,
  rtl,
  labels,
  onClose,
  onSelect,
}: {
  visible: boolean;
  value: Date | null;
  maxDate?: Date;
  minDate?: Date;
  rtl: boolean;
  labels: { title: string; cancel: string; ok: string };
  onClose: () => void;
  onSelect: (d: Date) => void;
}) {
  const initial = useMemo(() => value ?? DEFAULT_INITIAL, [value]);
  const [temp, setTemp] = useState<Date>(initial);

  useEffect(() => {
    if (!visible) return;
    setTemp(value ?? DEFAULT_INITIAL);
  }, [visible, value]);

  if (!visible) return null;

  if (Platform.OS === 'android') {
    const onChangeAndroid = (e: DateTimePickerEvent, selected?: Date) => {
      // Android : « set » ou « dismissed » ferment automatiquement le dialog.
      if ((e as { type?: string })?.type === 'dismissed') {
        onClose();
        return;
      }
      if (selected) onSelect(selected);
      else onClose();
    };

    return (
      <DateTimePicker
        value={temp}
        mode="date"
        display="calendar"
        maximumDate={maxDate}
        minimumDate={minDate}
        onChange={onChangeAndroid}
      />
    );
  }

  /* iOS : bottom-sheet avec spinner et boutons */
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.sheetRoot}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />
        <SafeAreaView edges={['bottom']} style={styles.sheetCard}>
          <View style={styles.sheetHandle} />
          <View style={[styles.sheetHeader, rtl && styles.sheetHeaderRtl]}>
            <Text style={[styles.sheetTitle, rtl && styles.fieldTextRtl]}>{labels.title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fermer"
              onPress={onClose}
              hitSlop={10}
              style={styles.sheetClose}>
              <FontAwesome name="times" size={16} color={homeShell.cardText} />
            </Pressable>
          </View>

          <View style={{ paddingVertical: 4 }}>
            <DateTimePicker
              value={temp}
              mode="date"
              display="spinner"
              maximumDate={maxDate}
              minimumDate={minDate}
              onChange={(_e, d) => d && setTemp(d)}
              themeVariant="light"
              {...(rtl ? { style: { direction: 'rtl' as const } } : {})}
            />
          </View>

          <View style={[styles.footer, rtl && styles.footerRtl]}>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [
                styles.btn,
                styles.btnGhost,
                pressed && { opacity: 0.85 },
              ]}>
              <Text style={styles.btnGhostText}>{labels.cancel}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onSelect(temp)}
              style={({ pressed }) => [
                styles.btn,
                styles.btnPrimary,
                pressed && { opacity: 0.85 },
              ]}>
              <Text style={styles.btnPrimaryText}>{labels.ok}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    minHeight: 48,
    gap: 10,
  },
  fieldRtl: { flexDirection: 'row-reverse' },
  fieldText: {
    color: homeShell.cardText,
    fontWeight: '600',
    fontSize: 15,
    flex: 1,
  },
  fieldTextPlaceholder: { color: homeShell.cardMuted, fontWeight: '500' },
  fieldTextRtl: { writingDirection: 'rtl', textAlign: 'right' },
  iconRight: { marginLeft: 'auto' },
  iconLeft: { marginRight: 'auto' },

  sheetRoot: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,6,23,0.45)',
  },
  sheetCard: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    maxHeight: '85%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(15,23,42,0.18)',
    marginTop: 6,
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  sheetHeaderRtl: { flexDirection: 'row-reverse' },
  sheetTitle: { color: homeShell.cardText, fontSize: 16, fontWeight: '900', flex: 1 },
  sheetClose: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.06)',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  footerRtl: { flexDirection: 'row-reverse' },
  btn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: homeShell.greenDark },
  btnPrimaryText: { color: 'white', fontWeight: '800' },
  btnGhost: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
  },
  btnGhostText: { color: homeShell.cardText, fontWeight: '700' },
});

export default BirthDateField;
