import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { DiagnosticLoadingView } from '@/components/diagnostic/DiagnosticLoadingView';
import { DiagnosticRecommendationsTawjihPlusGate } from '@/components/diagnostic/DiagnosticRecommendationsTawjihPlusGate';
import { SchoolDiagnosticWizard } from '@/components/diagnostic/SchoolDiagnosticWizard';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useTawjihPlusAccess } from '@/hooks/useTawjihPlusAccess';
import { replaceToSchoolDiagnosticEntry } from '@/utils/navigateToSchoolDiagnosticEntry';

/**
 * Entrée diagnostic écoles : wizard si client TAWJIH PLUS et pas encore terminé ;
 * sinon page résultats (recommandations ou paywall) si diagnostic déjà enregistré.
 */
export function DiagnosticEcolesEntry() {
  const { getValidAccessToken, user } = useAuth();
  const { locale } = useLocale();
  const { hasAccess: hasTawjihPlusAccess, loading: tawjihPlusLoading } = useTawjihPlusAccess();
  const [booting, setBooting] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  const uiLocale = locale === 'ar' ? 'ar' : 'fr';

  useEffect(() => {
    let alive = true;

    void (async () => {
      if (tawjihPlusLoading) return;

      const redirected = await replaceToSchoolDiagnosticEntry({
        getValidAccessToken,
        userId: user?.id ?? null,
        uiLocale,
      });
      if (!alive) return;

      if (redirected) return;

      if (!hasTawjihPlusAccess) {
        setShowPaywall(true);
        setBooting(false);
        return;
      }

      setBooting(false);
    })();

    return () => {
      alive = false;
    };
  }, [getValidAccessToken, hasTawjihPlusAccess, tawjihPlusLoading, uiLocale, user?.id]);

  const onBackFromPaywall = useMemo(
    () => () => {
      if (router.canGoBack()) {
        router.back();
        return;
      }
      router.replace('/(tabs)' as never);
    },
    [],
  );

  if (booting || tawjihPlusLoading) {
    return (
      <View style={styles.boot}>
        <DiagnosticLoadingView variant="boot" rtl={locale === 'ar'} locale={uiLocale} />
      </View>
    );
  }

  if (showPaywall) {
    return (
      <DiagnosticRecommendationsTawjihPlusGate
        rtl={locale === 'ar'}
        onBack={onBackFromPaywall}
      />
    );
  }

  return <SchoolDiagnosticWizard />;
}

const styles = StyleSheet.create({
  boot: { flex: 1 },
});
