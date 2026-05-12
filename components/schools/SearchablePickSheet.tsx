import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { ComponentProps } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { homeShell } from '@/theme/homeShell';
import { fontSize, radius, spacing } from '@/theme/tokens';

type FaName = ComponentProps<typeof FontAwesome>['name'];

function StatusPickSwatch({
  icon,
  colorFg,
  colorBg,
  colorBorder,
}: {
  icon: string;
  colorFg: string;
  colorBg: string;
  colorBorder: string;
}) {
  const safeIcon = (icon || 'circle') as FaName;
  return (
    <View
      style={[
        styles.statusSwatch,
        {
          backgroundColor: colorBg,
          borderColor: colorBorder,
        },
      ]}
    >
      <FontAwesome name={safeIcon} size={15} color={colorFg} />
    </View>
  );
}

export type SearchablePickItem = {
  id: string;
  /** Valeur stockée dans l’état parent (ville = titre ; secteur = id). */
  value: string;
  label: string;
  subtitle?: string;
  /**
   * Texte additionnel pour la recherche (nom arabe, sigle, etc.) sans modifier
   * l’affichage. Si présent, la recherche s’applique sur `label` + `searchText`
   * (+ `subtitle` si `searchInSubtitle`).
   */
  searchText?: string;
  /**
   * Pastille optionnelle (ex. statuts de candidature) : icône + couleurs du catalogue admin.
   */
  statusAppearance?: {
    icon: string;
    colorFg: string;
    colorBg: string;
    colorBorder: string;
  };
};

type PanelProps = {
  title: string;
  searchPlaceholder: string;
  emptyLabel: string;
  allLabel: string;
  items: SearchablePickItem[];
  selectedValue: string;
  onPick: (value: string) => void;
  onClose: () => void;
  rtl: boolean;
  /** Réinitialise la recherche à l’ouverture (obligatoire quand le panneau est monté dans le même Modal que les filtres). */
  isActive: boolean;
  /**
   * Inclure le `subtitle` dans la portée de la recherche.
   * Par défaut `false` — on ne filtre que sur le label, pour éviter qu'un mot
   * présent dans la région (subtitle) matche une ville (cas typique : choix de
   * ville dans le profil utilisateur, où l'utilisateur cherche par nom de ville).
   */
  searchInSubtitle?: boolean;
};

/**
 * Contenu seul (sans Modal) — à superposer dans un parent (ex. même Modal que les filtres) pour éviter les modaux imbriqués iOS/Android.
 */
export function SearchablePickPanel({
  title,
  searchPlaceholder,
  emptyLabel,
  allLabel,
  items,
  selectedValue,
  onPick,
  onClose,
  rtl,
  isActive,
  searchInSubtitle = false,
}: PanelProps) {
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  /** Hauteur explicite : sinon FlatList peut rester à 0 dans une feuille sans flex fixe. */
  const listHeight = Math.min(Math.max(winH * 0.62, 360), winH * 0.78);

  useEffect(() => {
    if (isActive) setQuery('');
  }, [isActive]);

  const needsStatusSwatchColumn = useMemo(
    () => items.some((i) => i.statusAppearance != null),
    [items],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => {
      const parts: string[] = [i.label];
      const extra = (i.searchText ?? '').trim();
      if (extra) parts.push(extra);
      if (searchInSubtitle && i.subtitle) parts.push(i.subtitle);
      const hay = parts.join('\n').toLowerCase();
      return hay.includes(q);
    });
  }, [items, query, searchInSubtitle]);

  return (
    <View style={[styles.card, { paddingBottom: Math.max(spacing.md, insets.bottom) }]}>
      <View style={styles.handle} />
      <View style={[styles.header, rtl && styles.headerRtl]}>
        <Text style={[styles.title, rtl && styles.rtlText]} numberOfLines={1}>
          {title}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          hitSlop={10}
          accessibilityLabel={title}
          style={styles.closeBtn}>
          <FontAwesome name="times" size={16} color={homeShell.cardText} />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <View style={[styles.searchInner, rtl && styles.searchInnerRtl]}>
          <FontAwesome name="search" size={15} color={homeShell.cardMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={searchPlaceholder}
            placeholderTextColor={homeShell.cardMuted}
            style={[styles.searchInput, rtl && styles.rtlInput]}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            clearButtonMode="never"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityRole="button">
              <FontAwesome name="times-circle" size={15} color={homeShell.cardMuted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <FlatList
        {...(rtl ? { style: { direction: 'rtl' as const, height: listHeight } } : { style: { height: listHeight } })}
        data={filtered}
        keyExtractor={(it) => it.id}
        keyboardShouldPersistTaps="always"
        removeClippedSubviews={false}
        initialNumToRender={24}
        maxToRenderPerBatch={24}
        windowSize={10}
        ListHeaderComponent={
          <>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                onPick('');
                onClose();
              }}
              style={({ pressed }) => [
                styles.row,
                rtl && styles.rowRtl,
                pressed && { backgroundColor: 'rgba(15,23,42,0.05)' },
              ]}>
              <View style={[styles.rowMain, rtl && styles.rowMainRtl]}>
                {needsStatusSwatchColumn ? <View style={styles.statusSwatchPlaceholder} /> : null}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.rowText, rtl && styles.rtlText, !selectedValue && styles.rowTextActive]}>
                    {allLabel}
                  </Text>
                </View>
              </View>
              {!selectedValue ? <FontAwesome name="check" size={14} color={homeShell.blue} /> : null}
            </Pressable>
            <View style={styles.sep} />
          </>
        }
        ListEmptyComponent={
          query.trim() && filtered.length === 0 ? (
            <View style={styles.empty}>
              <FontAwesome name="filter" size={20} color={homeShell.cardMuted} />
              <Text style={[styles.emptyText, rtl && styles.rtlText]}>{emptyLabel}</Text>
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => {
          const active = selectedValue !== '' && selectedValue === item.value;
          const vis = item.statusAppearance;
          return (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                onPick(item.value);
                onClose();
              }}
              style={({ pressed }) => [
                styles.row,
                rtl && styles.rowRtl,
                pressed && { backgroundColor: 'rgba(15,23,42,0.05)' },
              ]}>
              <View style={[styles.rowMain, rtl && styles.rowMainRtl]}>
                {vis ? (
                  <StatusPickSwatch
                    icon={vis.icon}
                    colorFg={vis.colorFg}
                    colorBg={vis.colorBg}
                    colorBorder={vis.colorBorder}
                  />
                ) : null}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.rowText, rtl && styles.rtlText, active && styles.rowTextActive]} numberOfLines={2}>
                    {item.label}
                  </Text>
                  {item.subtitle ? (
                    <Text style={[styles.rowMeta, rtl && styles.rtlText]} numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                  ) : null}
                </View>
              </View>
              {active ? <FontAwesome name="check" size={14} color={homeShell.blue} /> : null}
            </Pressable>
          );
        }}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

type SheetProps = Omit<PanelProps, 'isActive'> & {
  visible: boolean;
};

/** Modal autonome (ex. hors écran filtres) — un seul Modal à la fois. */
export function SearchablePickSheet({ visible, onClose, ...panel }: SheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.sheetRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <SearchablePickPanel {...panel} onClose={onClose} isActive={visible} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheetRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,6,23,0.45)',
  },
  card: {
    backgroundColor: homeShell.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: 8,
    maxHeight: '95%',
    minHeight: '70%',
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: homeShell.borderOnWhite,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(15,23,42,0.18)',
    marginTop: 6,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  headerRtl: { flexDirection: 'row-reverse' },
  title: {
    color: homeShell.cardText,
    fontSize: fontSize.lg,
    fontWeight: '900',
    flex: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  searchWrap: {
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    minHeight: 40,
  },
  searchInnerRtl: { flexDirection: 'row-reverse' },
  searchInput: {
    flex: 1,
    color: homeShell.cardText,
    fontWeight: '600',
    fontSize: fontSize.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    minHeight: 40,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlInput: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  listContent: { paddingBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: spacing.sm + 4,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  rowMain: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  rowMainRtl: { flexDirection: 'row-reverse' },
  statusSwatchPlaceholder: {
    width: 36,
    height: 36,
  },
  statusSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  rowText: { color: homeShell.cardText, fontWeight: '700', fontSize: fontSize.sm + 1 },
  rowTextActive: { color: homeShell.blue },
  rowMeta: { color: homeShell.cardMuted, fontSize: 12, marginTop: 4 },
  sep: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(15,23,42,0.08)',
  },
  empty: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  emptyText: { color: homeShell.cardMuted, fontWeight: '600' },
});
