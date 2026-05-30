import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  onApply: () => void;
  placeholder?: string;
  applyLabel?: string;
  showApply?: boolean;
  isRTL?: boolean;
};

/** Recherche dans une modale (mur global, pièces jointes) — filtre au Entrée ou via Appliquer. */
export function ModalSearchWithApply({
  value,
  onChangeText,
  onApply,
  placeholder,
  applyLabel = 'Appliquer',
  showApply = true,
  isRTL = false,
}: Props) {
  return (
    <View style={styles.wrap}>
      <TextInput
        style={[styles.input, isRTL && styles.inputRtl]}
        placeholder={placeholder}
        placeholderTextColor={brand.textMuted}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={onApply}
      />
      {showApply ? (
        <Pressable
          onPress={onApply}
          style={({ pressed }) => [styles.applyBtn, pressed && { opacity: 0.9 }]}
          accessibilityRole="button"
          accessibilityLabel={applyLabel}
        >
          <Text style={styles.applyBtnTxt}>{applyLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.12)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: fontSize.sm,
    color: brand.text,
    backgroundColor: brand.white,
  },
  inputRtl: { textAlign: 'right', writingDirection: 'rtl' },
  applyBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
  },
  applyBtnTxt: {
    color: brand.white,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
});
