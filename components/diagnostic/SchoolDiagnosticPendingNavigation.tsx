import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useRef } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { resolveUserDiagnosticPublicCode } from '@/utils/resolveSchoolDiagnosticNavigation';
import { consumePendingDiagnosticNavigation } from '@/utils/schoolDiagnosticBackgroundSubmit';

const COPY = {
  fr: {
    title: 'Analyse terminée',
    message: 'Votre diagnostic est prêt. Voir vos recommandations d’écoles ?',
    later: 'Plus tard',
    view: 'Voir mes recommandations',
  },
  ar: {
    title: 'اكتمل التحليل',
    message: 'تشخيصك جاهز. هل تريد عرض توصيات المدارس؟',
    later: 'لاحقًا',
    view: 'عرض توصياتي',
  },
} as const;

/** Propose d’ouvrir les recommandations après une analyse lancée puis quittée. */
export function SchoolDiagnosticPendingNavigation() {
  const { locale } = useLocale();
  const { getValidAccessToken, user } = useAuth();
  const cpy = COPY[locale === 'ar' ? 'ar' : 'fr'];
  const promptedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (promptedRef.current) return;
      let alive = true;
      void (async () => {
        const pendingCode = await consumePendingDiagnosticNavigation();
        if (!pendingCode || !alive) return;
        let code = pendingCode;
        if (user) {
          const ownedCode = await resolveUserDiagnosticPublicCode(
            getValidAccessToken,
            user.id,
            { uiLocale: locale === 'ar' ? 'ar' : 'fr' },
          );
          if (!ownedCode || ownedCode !== pendingCode) return;
          code = ownedCode;
        }
        promptedRef.current = true;
        Alert.alert(cpy.title, cpy.message, [
          { text: cpy.later, style: 'cancel' },
          {
            text: cpy.view,
            onPress: () => {
              router.push({
                pathname: '/diagnostic-ecoles/resultats',
                params: { c: code },
              } as never);
            },
          },
        ]);
      })();
      return () => {
        alive = false;
      };
    }, [cpy.later, cpy.message, cpy.title, cpy.view, getValidAccessToken, locale, user]),
  );

  return null;
}
