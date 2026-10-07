import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { DiagnosticLoadingView } from '@/components/diagnostic/DiagnosticLoadingView';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { replaceToSchoolDiagnosticEntry } from '@/utils/navigateToSchoolDiagnosticEntry';

/**
 * Ancienne entrée `/diagnostic-ecoles` (wizard 7 étapes) :
 * redirige vers les recommandations (générées depuis le test d’orientation)
 * ou vers le test d’orientation s’il n’est pas encore terminé.
 */
export function DiagnosticEcolesEntry() {
  const { getValidAccessToken, user } = useAuth();
  const { locale } = useLocale();
  const [booting, setBooting] = useState(true);
  const uiLocale = locale === 'ar' ? 'ar' : 'fr';

  useEffect(() => {
    let alive = true;
    void (async () => {
      const opened = await replaceToSchoolDiagnosticEntry({
        getValidAccessToken,
        userId: user?.id ?? null,
        uiLocale,
      });
      if (!alive) return;
      if (!opened) {
        router.replace('/diagnostic-orientation' as never);
        return;
      }
      setBooting(false);
    })();
    return () => {
      alive = false;
    };
  }, [getValidAccessToken, uiLocale, user?.id]);

  if (!booting) {
    return null;
  }

  return (
    <View style={styles.boot}>
      <DiagnosticLoadingView variant="boot" rtl={locale === 'ar'} locale={uiLocale} />
    </View>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1 },
});
