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
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { homeShell } from '@/theme/homeShell';
import { brand } from '@/theme/tokens';

export type SelectFieldProps = {
  /** Libellé affiché au-dessus du champ. */
  label: string;
  /** Texte d'aide optionnel sous le champ. */
  hint?: string;
  /** Valeur affichée (libellé déjà localisé). Vide ⇒ placeholder « — ». */
  value: string;
  /** Direction du texte (RTL en arabe). */
  rtl?: boolean;
  /** Affiche un astérisque après le libellé. */
  required?: boolean;
  /** Bordure rouge (validation échouée). */
  hasError?: boolean;
  /** Callback lorsqu'on appuie sur le champ. */
  onPress: () => void;
  /** Désactive l'interaction et grise le champ. */
  disabled?: boolean;
  /** Liste en cours de chargement : spinner, pas d’ouverture du picker. */
  loading?: boolean;
  /** Libellé pendant le chargement (défaut : « Chargement… »). */
  loadingLabel?: string;
  /** Style additionnel pour le bouton. */
  style?: ViewStyle;
};

export function SelectField({
  label,
  hint,
  value,
  rtl = false,
  required = false,
  hasError = false,
  onPress,
  disabled = false,
  loading = false,
  loadingLabel = 'Chargement…',
  style,
}: SelectFieldProps) {
  const isLocked = disabled || loading;

  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, rtl ? styles.labelRtl : styles.labelLtr]}>
          {label}
          {required ? <Text style={styles.requiredMark}> *</Text> : null}
        </Text>
      </View>

      <Pressable
        onPress={loading ? undefined : onPress}
        disabled={isLocked}
        accessibilityRole="button"
        accessibilityLabel={loading ? `${label} — ${loadingLabel}` : label}
        accessibilityState={{ disabled: isLocked, busy: loading }}
        style={({ pressed }) => [
          styles.input,
          rtl && styles.inputRtl,
          hasError && styles.inputError,
          loading && styles.inputLoading,
          pressed && !isLocked && { opacity: 0.85 },
          disabled && !loading && { opacity: 0.6 },
          style,
        ]}>
        {loading ? (
          <>
            <ActivityIndicator size="small" color={brand.primary} style={styles.loadingSpinner} />
            <Text
              numberOfLines={1}
              style={[styles.inputText, styles.inputTextLoading, rtl && styles.inputTextRtl]}>
              {loadingLabel}
            </Text>
          </>
        ) : (
          <>
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
          </>
        )}
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
  inputRtl: { direction: 'rtl' },
  inputError: {
    borderColor: '#DC2626',
    borderWidth: 2,
    backgroundColor: '#FEF2F2',
  },
  inputLoading: {
    backgroundColor: 'rgba(51, 62, 143, 0.05)',
    borderColor: 'rgba(51, 62, 143, 0.18)',
  },
  loadingSpinner: { marginEnd: 2 },
  inputTextLoading: {
    color: brand.primary,
    fontWeight: '600',
  },
  requiredMark: { color: '#DC2626', fontWeight: '800' },
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
