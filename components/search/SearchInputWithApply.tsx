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
}: Props) {
  const canEdit = editable && !locked;

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={locked ? onLockedPress : undefined}
        disabled={!locked}
        style={({ pressed }) => [
          styles.row,
          isRTL && styles.rowRtl,
          locked && styles.rowLocked,
          locked && pressed && { opacity: 0.92 },
        ]}
      >
        <FontAwesome
          name={locked ? 'lock' : 'search'}
          size={16}
          color={locked ? '#94A3B8' : homeShell.cardMuted}
        />
        <TextInput
          value={locked ? '' : value}
          onChangeText={canEdit ? onChangeText : undefined}
          editable={canEdit}
          pointerEvents={canEdit ? 'auto' : 'none'}
          placeholder={locked ? lockedPlaceholder : placeholder}
          placeholderTextColor={locked ? '#94A3B8' : homeShell.cardMuted}
          style={[styles.input, isRTL && styles.inputRtl, locked && styles.inputLocked]}
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
            <FontAwesome name="times-circle" size={18} color={homeShell.cardMuted} />
          </Pressable>
        ) : null}
      </Pressable>
      {showApply && canEdit ? (
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
  wrap: { gap: spacing.sm },
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
  applyBtnTxt: {
    color: brand.white,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
});
