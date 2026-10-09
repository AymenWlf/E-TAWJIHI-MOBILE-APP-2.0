import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EstablishmentDescriptionHtml } from '@/components/schools/EstablishmentDescriptionHtml';
import { Text } from '@/components/ui/Text';
import { PlatformSheetOverlay } from '@/components/ui/PlatformSheetOverlay';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { tOd, type OrientationUiLocale } from '../data/orientationDiagnosticI18n';

export type CatalogDetailSection = {
  title: string;
  chips?: string[];
  lines?: string[];
  warn?: boolean;
};

export type CatalogDetailModel = {
  eyebrow: string;
  title: string;
  titleRtl?: boolean;
  subtitle?: string;
  subtitleRtl?: boolean;
  source?: string;
  loading?: boolean;
  lead?: string;
  leadRtl?: boolean;
  meta?: string;
  stats?: { label: string; value: string }[];
  sections?: CatalogDetailSection[];
};

type DetailApi = {
  open: (model: CatalogDetailModel) => void;
  patch: (partial: Partial<CatalogDetailModel>) => void;
  close: () => void;
};

const DetailContext = createContext<DetailApi | null>(null);

/** Hauteur max du bloc description dans la fiche (le reste de la modale défile à part). */
const DESCRIPTION_MAX_HEIGHT = 180;

export function useOrientationCatalogDetail(): DetailApi {
  const ctx = useContext(DetailContext);
  if (!ctx) {
    throw new Error('OrientationCatalogDetailProvider manquant');
  }
  return ctx;
}

export function OrientationCatalogDetailProvider({
  uiLocale,
  children,
}: {
  uiLocale: OrientationUiLocale;
  children: ReactNode;
}) {
  const [model, setModel] = useState<CatalogDetailModel | null>(null);
  const close = useCallback(() => setModel(null), []);
  const api = useMemo<DetailApi>(
    () => ({
      open: (next) => setModel(next),
      patch: (partial) => setModel((prev) => (prev ? { ...prev, ...partial } : prev)),
      close,
    }),
    [close],
  );

  return (
    <DetailContext.Provider value={api}>
      <View style={styles.host}>
        {children}
        <CatalogDetailOverlay model={model} uiLocale={uiLocale} onClose={close} />
      </View>
    </DetailContext.Provider>
  );
}

function CatalogDetailOverlay({
  model,
  uiLocale,
  onClose,
}: {
  model: CatalogDetailModel | null;
  uiLocale: OrientationUiLocale;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const rtl = uiLocale === 'ar';
  const descriptionWidth = Math.max(160, screenW - spacing.lg * 2 - spacing.sm * 2 - 2);

  return (
    <PlatformSheetOverlay visible={Boolean(model)} onRequestClose={onClose} animationType="fade">
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={tOd(uiLocale, 'closeAria')} />
        {model ? (
          <View style={[styles.card, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
            <View style={styles.handle} />
            <View style={[styles.head, rtl && styles.headRtl]}>
              <View style={styles.headCopy}>
                <Text style={[styles.eyebrow, rtl && styles.rtl]}>{model.eyebrow}</Text>
                <Text style={[styles.title, model.titleRtl ? styles.rtl : styles.ltr]}>{model.title}</Text>
                {model.subtitle ? (
                  <Text style={[styles.subtitle, model.subtitleRtl ? styles.rtl : styles.ltr]}>
                    {model.subtitle}
                  </Text>
                ) : null}
                {model.source ? (
                  <Text style={[styles.source, rtl && styles.rtl]}>{model.source}</Text>
                ) : null}
              </View>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel={tOd(uiLocale, 'closeAria')}
                style={styles.closeIcon}>
                <Text style={styles.closeIconTxt}>×</Text>
              </Pressable>
            </View>
            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}>
              {model.loading ? (
                <View style={styles.loading}>
                  <ActivityIndicator color={brand.primary} />
                  <Text style={[styles.loadingTxt, rtl && styles.rtl]}>{tOd(uiLocale, 'loadingDetails')}</Text>
                </View>
              ) : (
                <>
                  {model.lead ? (
                    <View style={styles.leadBox}>
                      <EstablishmentDescriptionHtml
                        description={model.lead}
                        forceRtl={Boolean(model.leadRtl)}
                        emptyLabel=""
                        contentWidth={descriptionWidth}
                        boundedHeight={DESCRIPTION_MAX_HEIGHT}
                      />
                    </View>
                  ) : null}
                  {model.stats?.length ? (
                    <View style={styles.stats}>
                      {model.stats.map((stat) => (
                        <View key={stat.label} style={styles.stat}>
                          <Text style={[styles.statLabel, rtl && styles.rtl]}>{stat.label}</Text>
                          <Text style={[styles.statValue, rtl && styles.rtl]}>{stat.value}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                  {model.meta ? <Text style={[styles.meta, rtl && styles.rtl]}>{model.meta}</Text> : null}
                  {model.sections?.map((section) => (
                    <View key={section.title} style={styles.section}>
                      <View style={[styles.sectionHead, rtl && styles.headRtl]}>
                        <View style={styles.sectionMark} />
                        <Text style={[styles.sectionTitle, rtl && styles.rtl]}>{section.title}</Text>
                      </View>
                      {section.lines?.length ? (
                        section.lines.map((line) => (
                          <Text key={line} style={[styles.line, rtl && styles.rtl]}>
                            {'•  '}
                            {line}
                          </Text>
                        ))
                      ) : null}
                      {section.chips?.length ? (
                        <View style={[styles.chips, rtl && styles.chipsRtl]}>
                          {section.chips.map((chip) => (
                            <View
                              key={chip}
                              style={[styles.chip, section.warn && styles.chipWarn]}>
                              <Text style={[styles.chipTxt, section.warn && styles.chipTxtWarn]}>{chip}</Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  ))}
                </>
              )}
            </ScrollView>
            <Pressable onPress={onClose} style={styles.closeBtn} accessibilityRole="button">
              <Text style={styles.closeBtnTxt}>{tOd(uiLocale, 'closeFiche')}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </PlatformSheetOverlay>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1 },
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  card: {
    maxHeight: '88%',
    backgroundColor: brand.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: homeShell.green,
    marginBottom: spacing.sm,
  },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  headRtl: { flexDirection: 'row-reverse' },
  headCopy: { flex: 1, gap: 2 },
  eyebrow: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: brand.primary,
  },
  title: { fontSize: fontSize.lg, fontWeight: '800', color: brand.text, lineHeight: 24 },
  subtitle: { fontSize: fontSize.sm, fontWeight: '600', color: brand.textMuted, lineHeight: 18 },
  source: { fontSize: fontSize.xs, fontWeight: '700', color: brand.emerald, marginTop: 2 },
  closeIcon: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: homeShell.greenSurface,
    borderWidth: 1,
    borderColor: homeShell.greenBorder,
  },
  closeIconTxt: { fontSize: 22, lineHeight: 24, color: brand.text, fontWeight: '600' },
  body: { marginTop: spacing.sm },
  bodyContent: { gap: spacing.md, paddingBottom: spacing.md },
  loading: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  loadingTxt: { color: brand.textMuted, fontSize: fontSize.sm, fontWeight: '600' },
  leadBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: homeShell.greenBorder,
    backgroundColor: homeShell.greenSurface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    overflow: 'hidden',
  },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: {
    minWidth: '46%',
    flexGrow: 1,
    backgroundColor: homeShell.greenSurface,
    borderWidth: 1,
    borderColor: homeShell.greenBorder,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: 2,
  },
  statLabel: { fontSize: fontSize.xs, fontWeight: '700', color: brand.textMuted },
  statValue: { fontSize: fontSize.sm, fontWeight: '800', color: brand.text },
  meta: { fontSize: fontSize.sm, fontWeight: '700', color: brand.primary },
  section: { gap: spacing.xs },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionMark: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: homeShell.green,
  },
  sectionTitle: { flex: 1, fontSize: fontSize.sm, fontWeight: '800', color: brand.text },
  line: { fontSize: fontSize.sm, lineHeight: 20, color: brand.textSecondary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chipsRtl: { flexDirection: 'row-reverse' },
  chip: {
    backgroundColor: brand.linkChipBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipWarn: { backgroundColor: '#FEF3C7' },
  chipTxt: { fontSize: fontSize.xs, fontWeight: '700', color: brand.primary },
  chipTxtWarn: { color: '#92400E' },
  closeBtn: {
    marginTop: spacing.sm,
    backgroundColor: brand.primary,
    borderRadius: radius.lg,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.md },
  rtl: { writingDirection: 'rtl', textAlign: 'right' },
  ltr: { writingDirection: 'ltr', textAlign: 'left' },
});
