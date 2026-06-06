import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  onApply: () => void;
  onClear?: () => void;
  placeholder?: string;
  applyLabel?: string;
  showApply?: boolean;
  isRTL?: boolean;
  editable?: boolean;
  locked?: boolean;
  lockedPlaceholder?: string;
  onLockedPress?: () => void;
  /** Variante plus basse (header Écoles sup). */
  compact?: boolean;
};

export function SearchInputWithApply({
  value,
  onChangeText,
  onApply,
  onClear,
  placeholder,
  applyLabel = 'Appliquer',
  showApply = true,
  isRTL = false,
  editable = true,
  locked = false,
  lockedPlaceholder,
  onLockedPress,
  compact = false,
}: Props) {
  const canEdit = editable && !locked;

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Pressable
        onPress={locked ? onLockedPress : undefined}
        disabled={!locked}
        style={({ pressed }) => [
          styles.row,
          compact && styles.rowCompact,
          isRTL && styles.rowRtl,
          locked && styles.rowLocked,
          locked && pressed && { opacity: 0.92 },
        ]}
      >
        <FontAwesome
          name={locked ? 'lock' : 'search'}
          size={compact ? 14 : 16}
          color={locked ? '#94A3B8' : homeShell.cardMuted}
        />
        <TextInput
          value={locked ? '' : value}
          onChangeText={canEdit ? onChangeText : undefined}
          editable={canEdit}
          pointerEvents={canEdit ? 'auto' : 'none'}
          placeholder={locked ? lockedPlaceholder : placeholder}
          placeholderTextColor={locked ? '#94A3B8' : homeShell.cardMuted}
          style={[
            styles.input,
            compact && styles.inputCompact,
            isRTL && styles.inputRtl,
            locked && styles.inputLocked,
          ]}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={canEdit ? onApply : undefined}
        />
        {canEdit && value ? (
          <Pressable
            onPress={onClear}
            hitSlop={10}
            accessibilityLabel="Effacer la recherche"
          >
            <FontAwesome name="times-circle" size={compact ? 16 : 18} color={homeShell.cardMuted} />
          </Pressable>
        ) : null}
      </Pressable>
      {showApply && canEdit ? (
        <Pressable
          onPress={onApply}
          style={({ pressed }) => [
            styles.applyBtn,
            compact && styles.applyBtnCompact,
            pressed && { opacity: 0.9 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={applyLabel}
        >
          <Text style={[styles.applyBtnTxt, compact && styles.applyBtnTxtCompact]}>{applyLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  wrapCompact: { gap: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    gap: spacing.sm + 4,
    borderRadius: radius.lg,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
  },
  rowCompact: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderRadius: radius.md,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  rowLocked: {
    backgroundColor: '#F8FAFC',
    opacity: 0.92,
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: homeShell.cardText,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  inputCompact: {
    fontSize: fontSize.sm,
    paddingVertical: 0,
  },
  inputRtl: { textAlign: 'right', writingDirection: 'rtl' },
  inputLocked: { color: '#94A3B8' },
  applyBtn: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: homeShell.blue,
  },
  applyBtnCompact: {
    paddingVertical: 8,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.md,
  },
  applyBtnTxt: {
    color: brand.white,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  applyBtnTxtCompact: {
    fontSize: fontSize.xs + 1,
  },
});
