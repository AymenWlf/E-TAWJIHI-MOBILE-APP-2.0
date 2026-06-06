import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { DiagnosticLoadingView } from '@/components/diagnostic/DiagnosticLoadingView';
import { DiagnosticRecommendationsTawjihPlusGate } from '@/components/diagnostic/DiagnosticRecommendationsTawjihPlusGate';
import { SchoolDiagnosticWizard } from '@/components/diagnostic/SchoolDiagnosticWizard';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useTawjihPlusAccess } from '@/hooks/useTawjihPlusAccess';
import { resolveUserDiagnosticPublicCode } from '@/utils/resolveSchoolDiagnosticNavigation';

/**
 * Entrée `/diagnostic-ecoles` : affiche le wizard (reprise / refaire le questionnaire).
 * Les recommandations sont accessibles via le lien dédié ou `/diagnostic-ecoles/resultats`.
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

      if (!hasTawjihPlusAccess) {
        const existingCode = await resolveUserDiagnosticPublicCode(
          getValidAccessToken,
          user?.id ?? null,
          { uiLocale },
        );
        if (!alive) return;
        if (!existingCode) {
          setShowPaywall(true);
          setBooting(false);
          return;
        }
      }

      if (!alive) return;
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
