import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { analyzeOrientation1Bac, fetchSupFilieresForTracks, type Orientation1BacAnalyzeReport } from '@/services/orientation1bac';
import { homeShell } from '@/theme/homeShell';
import { brand, radius, spacing } from '@/theme/tokens';

export function Orientation1BacReportScreen() {
  const { locale } = useLocale();
  const uiLang: 'fr' | 'ar' = locale === 'ar' ? 'ar' : 'fr';
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Orientation1BacAnalyzeReport | null>(null);
  const [supCount, setSupCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await analyzeOrientation1Bac();
        const rep = (res.data?.report ?? null) as Orientation1BacAnalyzeReport | null;
        if (!alive) return;
        setReport(rep);

        const topTracks = (rep?.recommendedTracks ?? []).slice(0, 3).map((t) => t.trackId);
        if (topTracks.length > 0) {
          const sup = await fetchSupFilieresForTracks(topTracks);
          if (!alive) return;
          const count = Number((sup as any)?.data?.count ?? (sup as any)?.data?.items?.length ?? 0);
          setSupCount(Number.isFinite(count) ? count : 0);
        } else {
          setSupCount(0);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const top = report?.recommendedTracks?.[0] ?? null;
  const tiers = useMemo(() => {
    const rows = report?.recommendedTracks ?? [];
    const by: Record<string, typeof rows> = {};
    for (const r of rows) {
      const k = r.band || 'unknown';
      (by[k] ??= []).push(r);
    }
    return by;
  }, [report]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.title}>Rapport</Text>
          <Text style={styles.hint}>Chargement…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Résultat</Text>
        <Text style={styles.title}>Profiling & recommandation</Text>
        <Text style={styles.hint}>{uiLang === 'ar' ? 'توصيات 2 باك' : 'Recommandations 2ème bac'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, styles.cardPrimary]}>
          <Text style={styles.cardTitle}>Votre choix le plus recommandé</Text>
          <Text style={styles.primaryValue}>{top ? `${top.trackId} · ${top.score}/100` : '—'}</Text>
          {top?.reasons?.length ? (
            <View style={{ marginTop: 10, gap: 6 }}>
              {top.reasons.slice(0, 3).map((r, idx) => (
                <Text key={idx} style={styles.reason}>- {r}</Text>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Risque</Text>
          <Text style={styles.primaryValueSm}>{report?.riskLevel ?? '—'}</Text>
          {(report?.riskNotes ?? []).map((n, idx) => (
            <Text key={idx} style={styles.hint}>- {n}</Text>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Matières à renforcer</Text>
          <Text style={styles.hint}>{(report?.subjectsToImprove ?? []).join(' · ') || '—'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Études sup / écoles (DB)</Text>
          <Text style={styles.hint}>
            {supCount == null ? '—' : `${supCount} filière(s) trouvée(s) compatible(s) (MVP)`}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Toutes les recommandations</Text>
          {Object.entries(tiers).map(([band, rows]) => (
            <View key={band} style={{ marginTop: 10 }}>
              <Text style={styles.bandTitle}>{band}</Text>
              {rows.slice(0, 5).map((r) => (
                <Text key={r.trackId} style={styles.hint}>
                  - {r.trackId} · {r.score}/100
                </Text>
              ))}
            </View>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          {report?.disclaimer ??
            'Les recommandations ne remplacent pas la décision officielle de votre établissement.'}
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={() => router.replace('/orientation-1bac' as never)} style={[styles.btn, styles.btnGhost]}>
          <Text style={styles.btnGhostText}>Modifier</Text>
        </Pressable>
        <Pressable onPress={() => router.replace('/(tabs)' as never)} style={[styles.btn, styles.btnPrimary]}>
          <Text style={styles.btnPrimaryText}>Retour accueil</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: brand.white },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: homeShell.borderOnWhite,
    backgroundColor: brand.white,
  },
  eyebrow: { color: brand.textMuted, fontSize: 12, fontWeight: '700' },
  title: { marginTop: 6, fontSize: 20, fontWeight: '900', color: brand.text },
  hint: { marginTop: 6, fontSize: 12, color: brand.textMuted, lineHeight: 16 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  card: {
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: homeShell.borderOnWhite,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  cardPrimary: { borderColor: 'rgba(47, 206, 148, 0.45)', backgroundColor: 'rgba(47, 206, 148, 0.06)' },
  cardTitle: { fontSize: 13, fontWeight: '900', color: brand.text },
  primaryValue: { marginTop: 8, fontSize: 18, fontWeight: '900', color: homeShell.blue },
  primaryValueSm: { marginTop: 8, fontSize: 14, fontWeight: '900', color: homeShell.blue },
  reason: { fontSize: 12, color: brand.text, lineHeight: 16 },
  bandTitle: { fontSize: 12, fontWeight: '900', color: brand.text, marginBottom: 6 },
  disclaimer: { fontSize: 11, color: brand.textMuted, lineHeight: 16 },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: homeShell.borderOnWhite,
    backgroundColor: brand.white,
  },
  btn: { flex: 1, borderRadius: radius.xl, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  btnGhost: { backgroundColor: 'rgba(51, 62, 143, 0.08)' },
  btnGhostText: { fontWeight: '900', color: homeShell.blue },
  btnPrimary: { backgroundColor: homeShell.blue },
  btnPrimaryText: { fontWeight: '900', color: brand.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
});

