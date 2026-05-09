/**
 * SelectField — champ de sélection unique avec apparence "input" + chevron.
 *
 * Utilisé dans la page « Mon compte » pour ouvrir un bottom-sheet de
 * sélection (niveau d'étude, type de bac, filière, année, spécialités,
 * type de lycée, relation tuteur). Le rendu est volontairement aligné sur
 * le picker de ville, pour conserver une UX homogène dans toute la page.
 *
 * Ce composant est intentionnellement extrait dans son propre fichier
 * (plutôt que défini comme function-locale) pour éviter les références
 * cassées en Hot-Reload Metro/Hermes (le hoisting des function declarations
 * dans le même fichier peut être instable lors du fast-refresh).
 */

import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { homeShell } from '@/theme/homeShell';

export type SelectFieldProps = {
  /** Libellé affiché au-dessus du champ. */
  label: string;
  /** Texte d'aide optionnel sous le champ. */
  hint?: string;
  /** Valeur affichée (libellé déjà localisé). Vide ⇒ placeholder « — ». */
  value: string;
  /** Direction du texte (RTL en arabe). */
  rtl?: boolean;
  /** Callback lorsqu'on appuie sur le champ. */
  onPress: () => void;
  /** Désactive l'interaction et grise le champ. */
  disabled?: boolean;
  /** Style additionnel pour le bouton. */
  style?: ViewStyle;
};

export function SelectField({
  label,
  hint,
  value,
  rtl = false,
  onPress,
  disabled = false,
  style,
}: SelectFieldProps) {
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, rtl ? styles.labelRtl : styles.labelLtr]}>{label}</Text>
      </View>

      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        style={({ pressed }) => [
          styles.input,
          rtl && styles.inputRtl,
          pressed && !disabled && { opacity: 0.85 },
          disabled && { opacity: 0.6 },
          style,
        ]}>
        <Text
          numberOfLines={1}
          style={[
            styles.inputText,
            !value && styles.inputTextPlaceholder,
            rtl && styles.inputTextRtl,
          ]}>
          {value || '—'}
        </Text>
        <FontAwesome name="chevron-down" size={12} color={homeShell.cardMuted} />
      </Pressable>

      {hint ? (
        <View style={styles.labelRow}>
          <Text
            style={[styles.hint, rtl ? styles.hintRtl : styles.hintLtr]}
            numberOfLines={2}>
            {hint}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 14 },
  labelRow: { width: '100%' },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: homeShell.cardText,
    marginBottom: 6,
  },
  labelLtr: { textAlign: 'left' },
  labelRtl: { textAlign: 'right', writingDirection: 'rtl' },

  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 48,
    gap: 10,
  },
  inputRtl: { flexDirection: 'row-reverse' },
  inputText: {
    flex: 1,
    color: homeShell.cardText,
    fontWeight: '600',
    fontSize: 15,
  },
  inputTextPlaceholder: { color: homeShell.cardMuted, fontWeight: '500' },
  inputTextRtl: { textAlign: 'right', writingDirection: 'rtl' },

  hint: {
    color: homeShell.cardMuted,
    marginTop: 6,
    fontSize: 12,
  },
  hintLtr: { textAlign: 'left' },
  hintRtl: { textAlign: 'right', writingDirection: 'rtl' },
});

export default SelectField;
