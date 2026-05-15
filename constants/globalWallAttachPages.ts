/**
 * Pages du site partageables dans le fil communauté (chemins web publics).
 * `branch` → sous-menu avec recherche / liste détaillée.
 */
export type GlobalWallAttachSubmenu = 'establishments' | 'announcements' | 'boutique' | 'events';

export type GlobalWallAttachMainEntry =
  | { kind: 'leaf'; path: string; labelKey: GlobalWallAttachLabelKey }
  | { kind: 'branch'; labelKey: GlobalWallAttachLabelKey; submenu: GlobalWallAttachSubmenu };

/** Clés i18n (`useLocale` / `t`) pour les libellés du sélecteur de lien. */
export type GlobalWallAttachLabelKey =
  | 'globalWallPresetHome'
  | 'globalWallPresetSchools'
  | 'globalWallPresetFilieres'
  | 'globalWallPresetContestAnnouncements'
  | 'globalWallPresetBoutique'
  | 'globalWallPresetEvents'
  | 'globalWallPresetBlog'
  | 'globalWallPresetSecteurs'
  | 'globalWallPresetServices'
  | 'globalWallPresetCommunity';

export const GLOBAL_WALL_ATTACH_MAIN_ENTRIES: GlobalWallAttachMainEntry[] = [
  { kind: 'leaf', path: '/', labelKey: 'globalWallPresetHome' },
  { kind: 'branch', labelKey: 'globalWallPresetSchools', submenu: 'establishments' },
  { kind: 'leaf', path: '/filieres', labelKey: 'globalWallPresetFilieres' },
  { kind: 'branch', labelKey: 'globalWallPresetContestAnnouncements', submenu: 'announcements' },
  { kind: 'branch', labelKey: 'globalWallPresetBoutique', submenu: 'boutique' },
  { kind: 'branch', labelKey: 'globalWallPresetEvents', submenu: 'events' },
  { kind: 'leaf', path: '/blog', labelKey: 'globalWallPresetBlog' },
  { kind: 'leaf', path: '/secteurs', labelKey: 'globalWallPresetSecteurs' },
  { kind: 'leaf', path: '/services', labelKey: 'globalWallPresetServices' },
  { kind: 'leaf', path: '/communaute', labelKey: 'globalWallPresetCommunity' },
];
