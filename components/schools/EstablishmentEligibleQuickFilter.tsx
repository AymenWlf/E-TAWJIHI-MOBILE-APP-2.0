import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

type Props = {
  active: boolean;
  onChange: (active: boolean) => void;
  eligibleCount: number;
  disabled?: boolean;
  onDisabledPress?: () => void;
};

/**
 * Filtre rapide « Éligibles » (écoles sup) — désactivé par défaut côté parent.
 * Quand actif : le parent filtre les établissements éligibles non encore suivis.
 */
export function EstablishmentEligibleQuickFilter({
  active,
  onChange,
  eligibleCount,
  disabled,
  onDisabledPress,
}: Props) {
  const { t, isRTL } = useLocale();

  const press = (next: boolean) => {
    if (disabled) {
      onDisabledPress?.();
      return;
    }
    onChange(next);
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.row, isRTL && styles.rowRtl]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: !active }}
          onPress={() => press(false)}
          style={({ pressed }) => [
            styles.chip,
            !active && styles.chipOnNeutral,
            pressed && { opacity: 0.88 },
          ]}
        >
          <Text style={[styles.chipTxt, !active && styles.chipTxtOn, isRTL && styles.rtlText]}>
            {t('schoolsEligibleQuickAll')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: active }}
          accessibilityLabel={t('schoolsEligibleQuickA11y')}
          onPress={() => press(true)}
          style={({ pressed }) => [
            styles.chip,
            active && styles.chipOnEligible,
            disabled && styles.chipDisabled,
            pressed && { opacity: 0.88 },
          ]}
        >
          <FontAwesome
            name="check-circle"
            size={12}
            color={active ? homeShell.greenDark : brand.textMuted}
            style={styles.chipIcon}
          />
          <Text
            style={[
              styles.chipTxt,
              active && styles.chipTxtEligible,
              disabled && styles.chipTxtDisabled,
              isRTL && styles.rtlText,
            ]}
          >
            {t('schoolsEligibleQuickFilter')}
          </Text>
          {eligibleCount > 0 ? (
            <View style={[styles.badge, active && styles.badgeOn]}>
              <Text style={[styles.badgeTxt, active && styles.badgeTxtOn]}>{eligibleCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: brand.border,
    backgroundColor: brand.white,
    maxWidth: 220,
  },
  chipOnNeutral: {
    borderColor: homeShell.borderOnWhite,
    backgroundColor: '#F8FAFC',
  },
  chipOnEligible: {
    borderColor: homeShell.greenDark,
    backgroundColor: homeShell.greenSurface,
  },
  chipDisabled: {
    opacity: 0.55,
  },
  chipIcon: {
    marginEnd: 4,
  },
  chipTxt: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.textMuted,
  },
  chipTxtOn: {
    color: brand.text,
  },
  chipTxtEligible: {
    color: homeShell.greenDark,
  },
  chipTxtDisabled: {
    color: brand.textMuted,
  },
  badge: {
    minWidth: 18,
    height: 18,
    marginStart: 6,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: brand.backgroundSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOn: {
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  badgeTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: brand.textMuted,
  },
  badgeTxtOn: {
    color: homeShell.greenDark,
  },
  rtlText: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
});
