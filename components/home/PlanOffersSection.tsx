import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

/** Carte pack inscription / accès écoles (données type CDC Simple · Standard · Premium). */
export type PackOffer = {
  id: string;
  /** Grand chiffre ou accroche (ex. nombre d’écoles, dossiers) */
  primaryStat: string;
  /** Libellé court sous le chiffre (ex. écoles, filières) */
  primaryTag: string;
  /** Ligne descriptive (ex. inscriptions, concours) */
  feature: string;
  name: string;
  price: string;
  period: string;
};

type Props = {
  title: string;
  linkLabel?: string;
  offers: PackOffer[];
  onPressLink?: () => void;
  onPressOffer?: (id: string) => void;
};

const CARD_W = 200;

const cardWrapShadow =
  Platform.OS === 'android'
    ? { elevation: 8 }
    : {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.11,
        shadowRadius: 14,
      };

export function PlanOffersSection({ title, linkLabel = 'Voir tout', offers, onPressLink, onPressOffer }: Props) {
  const { isRTL } = useLocale();
  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <Text style={[styles.title, isRTL && styles.titleRtl]}>{title}</Text>
        <Pressable onPress={onPressLink} hitSlop={8}>
          <Text style={styles.link}>
            {linkLabel}{' '}
            <Text style={styles.chev}>{isRTL ? '‹' : '›'}</Text>
          </Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.scrollTrack, isRTL && styles.scrollRtl]}
        contentContainerStyle={styles.scrollContent}>
        {offers.map((o, idx) => (
          <Pressable
            key={o.id}
            onPress={() => onPressOffer?.(o.id)}
            style={({ pressed }) => [
              styles.cardWrap,
              cardWrapShadow,
              pressed && { opacity: 0.96 },
              idx < offers.length - 1 && { marginEnd: spacing.md },
            ]}>
            <View style={styles.cardClip}>
              <View style={styles.top}>
                <View style={styles.dataRow}>
                  <Text style={styles.dataMain}>{o.primaryStat}</Text>
                </View>
                <Text style={styles.dataSub}>{o.primaryTag}</Text>
                <View style={styles.featureRow}>
                  <FontAwesome
                    name="institution"
                    size={12}
                    color={homeShell.green}
                    style={[styles.featureIc, isRTL && styles.featureIcRtl]}
                  />
                  <Text style={styles.featureTxt}>{o.feature}</Text>
                </View>
              </View>
              <View style={styles.bottom}>
                <Text style={styles.planName}>{o.name}</Text>
                <Text style={styles.price}>
                  <Text style={styles.priceNum}>{o.price}</Text>
                  <Text style={styles.pricePer}> {o.period}</Text>
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.section,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: brand.text,
    fontSize: fontSize.md,
    fontWeight: '800',
    letterSpacing: -0.2,
    flex: 1,
    marginEnd: spacing.sm,
  },
  titleRtl: {
    textAlign: 'right',
  },
  link: {
    color: brand.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  chev: {
    fontWeight: '800',
  },
  /** Pleine largeur : même principe que liens pratiques / bannière pour le scroll horizontal en RTL. */
  scrollTrack: {
    width: '100%',
    /**
     * Full-bleed : annule le padding horizontal de la page,
     * puis on ré-applique le padding uniquement côté start dans `scrollContent`.
     */
    marginHorizontal: -spacing.xl,
    overflow: 'visible',
  },
  scrollRtl: {
    direction: 'rtl',
  },
  scrollContent: {
    paddingVertical: 4,
    /** Aligne au début (start) mais pas de marge côté fin (end). */
    paddingStart: spacing.xl,
    paddingEnd: 0,
  },
  cardWrap: {
    width: CARD_W,
    borderRadius: radius.lg,
  },
  cardClip: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: homeShell.card,
  },
  top: {
    backgroundColor: homeShell.blueDeep,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    minHeight: 108,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  dataMain: {
    color: homeShell.green,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  dataSub: {
    color: homeShell.textDim,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  featureIc: {
    marginEnd: 6,
  },
  featureIcRtl: {
    marginEnd: 0,
    marginStart: 6,
  },
  featureTxt: {
    color: homeShell.text,
    fontSize: fontSize.xs,
    fontWeight: '600',
    flex: 1,
  },
  bottom: {
    backgroundColor: homeShell.card,
    padding: spacing.md,
  },
  planName: {
    color: homeShell.cardText,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  price: {
    marginTop: 6,
  },
  priceNum: {
    color: homeShell.greenDark,
    fontSize: fontSize.lg,
    fontWeight: '900',
  },
  pricePer: {
    color: homeShell.cardMuted,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
