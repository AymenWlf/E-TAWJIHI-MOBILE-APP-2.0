import { Redirect, useLocalSearchParams } from 'expo-router';

/** Ancienne route rapport : redirection vers les recommandations. */
export default function DiagnosticRapportScreen() {
  const { c, id } = useLocalSearchParams<{ c?: string; id?: string }>();
  const code = typeof c === 'string' ? c.trim() : '';
  const legacyId = typeof id === 'string' ? id.trim() : '';

  if (code) {
    return (
      <Redirect
        href={{
          pathname: '/diagnostic-ecoles/resultats',
          params: { c: code },
        }}
      />
    );
  }
  if (legacyId) {
    return (
      <Redirect
        href={{
          pathname: '/diagnostic-ecoles/resultats',
          params: { id: legacyId },
        }}
      />
    );
  }
  return <Redirect href="/diagnostic-ecoles/resultats" />;
}
