import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { homeShell } from '@/theme/homeShell';
import { radius } from '@/theme/tokens';

type Props = {
  style?: StyleProp<ViewStyle>;
};

/** FR / عربي — switch langue unifié (accueil + en-têtes hero). Ordre visuel fixe : FR à gauche, عربي à droite. */
export function HeroLangSwitch({ style }: Props = {}) {
  const { locale, setLocale, t, isRTL } = useLocale();

  return (
    <View
      style={[styles.langSwitch, style]}
      accessibilityRole="tablist"
      accessibilityLabel={t('languageSwitcher')}>
      <Pressable
        onPress={() => setLocale('fr')}
        style={({ pressed }) => [
          styles.langPill,
          locale === 'fr' && styles.langPillActive,
          pressed && styles.langPillPressed,
        ]}
        accessibilityRole="tab"
        accessibilityState={{ selected: locale === 'fr' }}>
        <Text
          style={[
            styles.langPillTxt,
            locale === 'fr' && styles.langPillTxtActive,
            isRTL && styles.frLabel,
          ]}>
          {t('langFr')}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => setLocale('ar')}
        style={({ pressed }) => [
          styles.langPill,
          locale === 'ar' && styles.langPillActive,
          pressed && styles.langPillPressed,
        ]}
        accessibilityRole="tab"
        accessibilityState={{ selected: locale === 'ar' }}>
        <Text
          style={[
            styles.langPillTxt,
            locale === 'ar' && styles.langPillTxtActive,
            styles.arLabel,
          ]}>
          {t('langAr')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  langSwitch: {
    flexDirection: 'row',
    direction: 'ltr',
    alignItems: 'center',
    flexShrink: 0,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full,
    padding: 3,
  },
  langPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.full,
  },
  langPillActive: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  langPillPressed: {
    opacity: 0.88,
  },
  langPillTxt: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  langPillTxtActive: {
    color: homeShell.text,
  },
  /** « FR » reste lisible en mode arabe (RTL). */
  frLabel: {
    writingDirection: 'ltr',
  },
  arLabel: {
    writingDirection: 'rtl',
  },
});
