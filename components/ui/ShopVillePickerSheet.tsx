/**
 * Bottom-sheet picker pour les villes de livraison (ShopVilleRow).
 * Même système visuel que le CityPickerSheet de l'account-setup :
 * fond translucide, slide depuis le bas, barre de recherche, FlatList performante.
 */
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlatformSheetOverlay } from '@/components/ui/PlatformSheetOverlay';
import { Text } from '@/components/ui/Text';
import { brand, radius, spacing } from '@/theme/tokens';
import {
  filterShopVilles,
  getActiveShopVilles,
  shopVilleListLabel,
  type ShopVilleRow,
} from '@/utils/shopVilles';

const ALL_SORTED = [...getActiveShopVilles()].sort((a, b) =>
  shopVilleListLabel(a).localeCompare(shopVilleListLabel(b), 'fr', {
    sensitivity: 'base',
  }),
);

interface Props {
  visible: boolean;
  selectedCheckCode: number;
  onClose: () => void;
  onSelect: (v: ShopVilleRow) => void;
  /** Titre du bandeau (ex. livraison vs ville étudiant). */
  sheetTitle?: string;
}

export function ShopVillePickerSheet({
  visible,
  selectedCheckCode,
  onClose,
  onSelect,
  sheetTitle = 'Choisir une ville',
}: Props) {
  const [query, setQuery] = useState('');

  /* Réinitialise la recherche à chaque ouverture */
  useEffect(() => {
    if (visible) setQuery('');
  }, [visible]);

  const rows = useMemo<ShopVilleRow[]>(() => {
    const q = query.trim();
    if (q.length < 2) return ALL_SORTED.slice(0, 80);
    return filterShopVilles(q, 120).map((r) => r.row);
  }, [query]);

  return (
    <PlatformSheetOverlay visible={visible} onRequestClose={onClose} animationType="slide">
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{sheetTitle}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fermer"
              onPress={onClose}
              hitSlop={10}
              style={styles.closeBtn}
            >
              <FontAwesome name="times" size={16} color={brand.text} />
            </Pressable>
          </View>

          {/* Search */}
          <View style={styles.searchRow}>
            <FontAwesome name="search" size={14} color={brand.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher une ville…"
              placeholderTextColor={brand.textMuted}
              style={styles.searchInput}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {query.length > 0 ? (
              <Pressable
                onPress={() => setQuery('')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Effacer"
              >
                <FontAwesome name="times-circle" size={14} color={brand.textMuted} />
              </Pressable>
            ) : null}
          </View>

          {/* List */}
          <FlatList
            data={rows}
            keyExtractor={(v) => String(v.checkCode)}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={20}
            windowSize={10}
            ListEmptyComponent={
              <View style={styles.empty}>
                <FontAwesome name="map-marker" size={20} color={brand.textMuted} />
                <Text style={styles.emptyTxt}>Aucune ville trouvée</Text>
              </View>
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const active = item.checkCode === selectedCheckCode;
              const label = shopVilleListLabel(item);
              return (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => onSelect(item)}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && { backgroundColor: 'rgba(15,23,42,0.04)' },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      numberOfLines={1}
                      style={[styles.rowLabel, active && styles.rowLabelActive]}
                    >
                      {label}
                    </Text>
                    {item.region?.trim() ? (
                      <Text numberOfLines={1} style={styles.rowMeta}>
                        {item.region.trim()}
                      </Text>
                    ) : null}
                  </View>
                  {active ? (
                    <FontAwesome name="check" size={14} color={brand.primary} />
                  ) : null}
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </View>
    </PlatformSheetOverlay>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,6,23,0.45)',
  },
  sheet: {
    backgroundColor: brand.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: 8,
    maxHeight: '85%',
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
  },
  title: { color: brand.text, fontSize: 16, fontWeight: '900', flex: 1 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.06)',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(15,23,42,0.04)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: brand.text,
    fontWeight: '600',
    paddingVertical: 0,
  },
  listContent: { paddingBottom: spacing.lg },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(15,23,42,0.08)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 4,
    gap: 10,
  },
  rowLabel: { color: brand.text, fontWeight: '700', fontSize: 14 },
  rowLabelActive: { color: brand.primary },
  rowMeta: { color: brand.textMuted, fontSize: 11, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyTxt: { color: brand.textMuted, fontWeight: '600' },
});
