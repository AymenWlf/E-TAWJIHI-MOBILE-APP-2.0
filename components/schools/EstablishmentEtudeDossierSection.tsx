import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

type Props = {
  body: string;
  hint: string;
  rtl?: boolean;
};

/** Bloc fiche publique : admission en étude de dossier (seuils masqués) — charte alignée panneau seuils. */
export function EstablishmentEtudeDossierSection({ body, hint, rtl = false }: Props) {
  return (
    <View style={styles.panel}>
      <View style={styles.accentBar} />
      <View style={[styles.panelHead, rtl && styles.rowRtl]}>
        <View style={styles.panelIcon}>
          <FontAwesome name="clipboard" size={17} color="#fff" />
        </View>
        <View style={[styles.panelHeadText, rtl && styles.rtlCol]}>
          <View style={styles.modePill}>
            <Text style={[styles.modePillTxt, rtl && styles.rtlText]}>Mode d&apos;admission</Text>
          </View>
          <Text style={[styles.panelSubtitle, rtl && styles.rtlText]}>
            Sélection sur analyse du parcours et des pièces du candidat.
          </Text>
        </View>
      </View>

      <View style={styles.highlightBox}>
        <Text style={[styles.body, rtl && styles.rtlText]}>{body}</Text>
      </View>

      <Text style={[styles.disclaimer, rtl && styles.rtlText]}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.12)',
    backgroundColor: brand.background,
    overflow: 'hidden',
    padding: spacing.md,
    gap: spacing.md,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: brand.primary,
  },
  panelHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingTop: 4,
  },
  panelIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.primary,
    shadowColor: brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  panelHeadText: {
    flex: 1,
    gap: 6,
    paddingTop: 2,
  },
  modePill: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.18)',
    backgroundColor: 'rgba(51,62,143,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  modePillTxt: {
    fontSize: 10,
    fontWeight: '900',
    color: brand.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.45,
  },
  panelSubtitle: {
    fontSize: fontSize.xs,
    lineHeight: 18,
    color: brand.textMuted,
    fontWeight: '600',
  },
  highlightBox: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.14)',
    backgroundColor: 'rgba(51,62,143,0.05)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  body: {
    fontSize: fontSize.sm,
    lineHeight: 22,
    color: brand.textSecondary,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    color: brand.textMuted,
    fontWeight: '600',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(51,62,143,0.10)',
    paddingTop: spacing.sm,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  rtlCol: {
    alignItems: 'flex-end',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
