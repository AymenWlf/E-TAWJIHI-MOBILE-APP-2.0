import { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';

import { Text } from '@/components/ui/Text';
import { CAIRO } from '@/theme/arabicTypography';
import { brand, spacing } from '@/theme/tokens';

const BLUE = brand.primary;

type Props = {
  length?: number;
  value: string[];
  onChange: (digits: string[]) => void;
  isRTL?: boolean;
  error?: string | null;
  label?: string;
};

export function OtpCodeInput({ length = 6, value, onChange, isRTL, error, label }: Props) {
  const inputsRef = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const onDigit = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, '');
    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, length);
      const next = Array(length).fill('');
      for (let i = 0; i < pasted.length; i++) {
        next[i] = pasted[i];
      }
      onChange(next);
      const focusAt = Math.min(pasted.length, length - 1);
      inputsRef.current[focusAt]?.focus();
      return;
    }
    const digit = cleaned.slice(-1);
    const next = [...value];
    next[index] = digit;
    onChange(next);
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const onKeyPress = (index: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.wrap}>
      {label ? <Text style={[styles.label, isRTL && styles.rtl]}>{label}</Text> : null}
      <View style={[styles.row, isRTL && styles.rowRtl]}>
        {value.map((d, i) => {
          const filled = d.length > 0;
          const focused = focusedIndex === i;
          return (
            <Pressable
              key={i}
              onPress={() => inputsRef.current[i]?.focus()}
              style={[
                styles.cell,
                filled && styles.cellFilled,
                focused && styles.cellFocused,
                error ? styles.cellError : undefined,
              ]}
            >
              <TextInput
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
                value={d}
                onChangeText={(v) => onDigit(i, v)}
                onKeyPress={(e) => onKeyPress(i, e)}
                onFocus={() => setFocusedIndex(i)}
                keyboardType="number-pad"
                maxLength={i === 0 ? length : 1}
                style={[styles.cellInput, isRTL && styles.rtlInput]}
                textContentType={i === 0 ? 'oneTimeCode' : 'none'}
                selectTextOnFocus
                accessibilityLabel={`Chiffre ${i + 1}`}
              />
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={[styles.error, isRTL && styles.rtl]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.sm, marginBottom: spacing.md },
  label: {
    fontSize: 13,
    fontWeight: '900',
    color: brand.text,
    marginBottom: spacing.md,
    fontFamily: CAIRO.bold,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  cell: {
    flex: 1,
    maxWidth: 52,
    height: 58,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: brand.border,
    backgroundColor: brand.backgroundSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFilled: {
    borderColor: 'rgba(51,62,143,0.35)',
    backgroundColor: brand.white,
  },
  cellFocused: {
    borderColor: BLUE,
    backgroundColor: brand.white,
    shadowColor: BLUE,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cellError: {
    borderColor: brand.error,
    backgroundColor: 'rgba(239,68,68,0.04)',
  },
  cellInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '900',
    color: brand.text,
    fontFamily: CAIRO.black,
    padding: 0,
  },
  rtlInput: { writingDirection: 'ltr', textAlign: 'center' },
  error: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: brand.error,
    fontWeight: '700',
    textAlign: 'center',
  },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
});
