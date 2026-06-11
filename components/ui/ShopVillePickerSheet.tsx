/**
 * Bottom-sheet villes livraison (ShopVilleRow) — même UX que SearchablePickSheet
 * (compte, account-setup) : hauteur fixe, résultats filtrés en haut, clavier géré.
 */
import { useMemo } from 'react';

import {
  SearchablePickSheet,
  type SearchablePickItem,
} from '@/components/schools/SearchablePickSheet';
import {
  getActiveShopVilles,
  shopVilleListLabel,
  type ShopVilleRow,
} from '@/utils/shopVilles';

const SHOP_VILLE_PICK_ITEMS: SearchablePickItem[] = [...getActiveShopVilles()]
  .sort((a, b) =>
    shopVilleListLabel(a).localeCompare(shopVilleListLabel(b), 'fr', { sensitivity: 'base' }),
  )
  .map((v) => ({
    id: String(v.checkCode),
    value: String(v.checkCode),
    label: shopVilleListLabel(v),
    subtitle: v.region?.trim() || undefined,
    searchText: [v.name, v.ville, v.arabic_name].filter(Boolean).join('\n'),
  }));

const SHOP_VILLE_BY_CHECK_CODE = new Map<string, ShopVilleRow>(
  getActiveShopVilles().map((v) => [String(v.checkCode), v]),
);

interface Props {
  visible: boolean;
  selectedCheckCode: number;
  onClose: () => void;
  onSelect: (v: ShopVilleRow) => void;
  /** Titre du bandeau (ex. livraison vs ville étudiant). */
  sheetTitle?: string;
  searchPlaceholder: string;
  emptyLabel: string;
  allLabel: string;
  rtl: boolean;
}

export function ShopVillePickerSheet({
  visible,
  selectedCheckCode,
  onClose,
  onSelect,
  sheetTitle = 'Choisir une ville',
  searchPlaceholder,
  emptyLabel,
  allLabel,
  rtl,
}: Props) {
  const selectedValue = selectedCheckCode > 0 ? String(selectedCheckCode) : '';

  const items = useMemo(() => SHOP_VILLE_PICK_ITEMS, []);

  return (
    <SearchablePickSheet
      visible={visible}
      title={sheetTitle}
      searchPlaceholder={searchPlaceholder}
      emptyLabel={emptyLabel}
      allLabel={allLabel}
      items={items}
      selectedValue={selectedValue}
      onPick={(v) => {
        if (!v.trim()) {
          onClose();
          return;
        }
        const row = SHOP_VILLE_BY_CHECK_CODE.get(v);
        if (row) onSelect(row);
        else onClose();
      }}
      onClose={onClose}
      rtl={rtl}
      searchInSubtitle={false}
    />
  );
}
