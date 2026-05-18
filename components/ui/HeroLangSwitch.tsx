import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { homeShell } from '@/theme/homeShell';
import { radius } from '@/theme/tokens';

/** FR / AR pour en-têtes hero (fond bleu marque). */
export function HeroLangSwitch() {
  const { locale, setLocale, t, isRTL } = useLocale();

  return (
    <View
      style={[styles.langSwitch, isRTL && styles.langSwitchRtl]}
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
        <Text style={[styles.langPillTxt, locale === 'fr' && styles.langPillTxtActive]}>{t('langFr')}</Text>
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
        <Text style={[styles.langPillTxt, locale === 'ar' && styles.langPillTxtActive]}>{t('langAr')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  langSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full,
    padding: 3,
  },
  langSwitchRtl: {
    flexDirection: 'row-reverse',
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
});
