import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { HomeCopyKey } from '@/constants/i18n';
import { useLocale } from '@/contexts/LocaleContext';
import { fontSize, radius } from '@/theme/tokens';

/**
 * Badge typé pour le type d'établissement.
 * Couleurs cohérentes :
 *   • Public        → bleu (institutionnel)
 *   • Privé         → rose (commercial)
 *   • Militaire     → vert kaki (défense)
 *   • Semi-public   → orange ambré (mixte)
 *   • Inconnu       → ardoise neutre
 */

type Kind = 'public' | 'private' | 'military' | 'semi_public' | 'other';

type Visual = {
  fg: string;
  bg: string;
  border: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  i18nKey: HomeCopyKey | null;
};

const VISUALS: Record<Kind, Visual> = {
  public: {
    fg: '#1D4ED8',
    bg: '#DBEAFE',
    border: '#BFDBFE',
    icon: 'university',
    i18nKey: 'schoolsTypePublic',
  },
  private: {
    fg: '#9D174D',
    bg: '#FCE7F3',
    border: '#FBCFE8',
    icon: 'briefcase',
    i18nKey: 'schoolsTypePrivate',
  },
  military: {
    fg: '#3F6212',
    bg: '#ECFCCB',
    border: '#BEF264',
    icon: 'shield',
    i18nKey: 'schoolsTypeMilitary',
  },
  semi_public: {
    fg: '#9A3412',
    bg: '#FFEDD5',
    border: '#FED7AA',
    icon: 'building',
    i18nKey: 'schoolsTypeSemiPublic',
  },
  other: {
    fg: '#475569',
    bg: '#F1F5F9',
    border: '#E2E8F0',
    icon: 'building-o',
    i18nKey: null,
  },
};

/** Normalise les valeurs hétérogènes du backend en clé canonique. */
export function classifyEstablishmentType(raw?: string | null): Kind {
  if (!raw) return 'other';
  const lower = raw.trim().toLowerCase();
  if (lower === 'public') return 'public';
  if (lower === 'privé' || lower === 'prive' || lower === 'private') return 'private';
  if (lower === 'militaire' || lower === 'military') return 'military';
  if (
    lower === 'semi-public' ||
    lower === 'semi public' ||
    lower === 'semipublic' ||
    lower === 'semi-Public'.toLowerCase() ||
    lower === 'semi_public'
  ) {
    return 'semi_public';
  }
  return 'other';
}

type Props = {
  type?: string | null;
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
  /** Si true, n'affiche rien quand le type est inconnu / vide. */
  hideIfUnknown?: boolean;
};

export function EstablishmentTypeBadge({
  type,
  size = 'sm',
  showIcon = true,
  hideIfUnknown = true,
}: Props) {
  const { t } = useLocale();
  const kind = classifyEstablishmentType(type);
  const visual = VISUALS[kind];

  if (kind === 'other') {
    if (hideIfUnknown) return null;
  }

  const label = visual.i18nKey ? t(visual.i18nKey) : (type ?? '').trim() || '—';

  const sizeStyle =
    size === 'xs'
      ? styles.sizeXs
      : size === 'md'
        ? styles.sizeMd
        : styles.sizeSm;
  const txtSize =
    size === 'xs'
      ? styles.txtXs
      : size === 'md'
        ? styles.txtMd
        : styles.txtSm;
  const iconSize = size === 'xs' ? 9 : size === 'md' ? 12 : 10;

  return (
    <View
      style={[
        styles.base,
        sizeStyle,
        { backgroundColor: visual.bg, borderColor: visual.border },
      ]}
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      {showIcon ? <FontAwesome name={visual.icon} size={iconSize} color={visual.fg} /> : null}
      <Text style={[styles.txt, txtSize, { color: visual.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'flex-start',
  },
  sizeXs: { paddingHorizontal: 7, paddingVertical: 2 },
  sizeSm: { paddingHorizontal: 8, paddingVertical: 3 },
  sizeMd: { paddingHorizontal: 10, paddingVertical: 5 },
  txt: { fontWeight: '800', letterSpacing: 0.2 },
  txtXs: { fontSize: 10 },
  txtSm: { fontSize: fontSize.xs },
  txtMd: { fontSize: fontSize.sm },
});
