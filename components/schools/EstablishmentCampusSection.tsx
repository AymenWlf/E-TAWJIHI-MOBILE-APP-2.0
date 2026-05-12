import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Linking from 'expo-linking';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { homeShell } from '@/theme/homeShell';
import { fontSize, radius, spacing } from '@/theme/tokens';
import { type CampusDisplayRow } from '@/utils/campusMaps';

const CARD_WIDTH = 236;

type Props = {
  rows: CampusDisplayRow[];
};

export function EstablishmentCampusSection({ rows }: Props) {
  const { isRTL, t } = useLocale();

  if (rows.length === 0) return null;

  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.hScroll}
      accessibilityLabel="Liste des campus">
      {rows.map((campus) => {
        const mapsHref = campus.openMapUrl ?? campus.embedUrl;
        return (
          <View key={campus.key} style={[styles.card, { width: CARD_WIDTH }]}>
            {mapsHref ? (
              <Pressable
                onPress={() => void Linking.openURL(mapsHref)}
                style={({ pressed }) => [
                  styles.mapsLinkRow,
                  isRTL && styles.mapsLinkRowRtl,
                  pressed && { opacity: 0.92 },
                ]}
                accessibilityRole="link"
                accessibilityLabel={t('eventsMapsLink')}>
                <View style={styles.mapsIconWrap}>
                  <FontAwesome name="map" size={14} color="#fff" />
                </View>
                <View style={[styles.mapsLinkTextCol, isRTL && styles.rtlCol]}>
                  <Text style={[styles.mapsLinkLabel, isRTL && styles.rtlText]}>{t('eventsMapsLink')}</Text>
                  <Text style={[styles.mapsLinkSub, isRTL && styles.rtlText]} numberOfLines={1}>
                    Google Maps
                  </Text>
                </View>
                <FontAwesome name="external-link" size={13} color="#059669" />
              </Pressable>
            ) : (
              <View style={[styles.mapsEmptyRow, isRTL && styles.mapsLinkRowRtl]}>
                <FontAwesome name="map-o" size={16} color={homeShell.cardMuted} />
                <Text style={[styles.mapsEmptyTxt, isRTL && styles.rtlText]} numberOfLines={2}>
                  {t('estDetailCampusNoMapsUrl')}
                </Text>
              </View>
            )}

            <Text style={styles.campusTitle} numberOfLines={2}>
              {campus.name}
            </Text>

            <View style={styles.metaRow}>
              <FontAwesome name="map-marker" size={12} color={homeShell.cardMuted} />
              <Text style={styles.metaTxt} numberOfLines={1}>
                Ville : <Text style={styles.metaStrong}>{campus.city}</Text>
              </Text>
            </View>
            <View style={[styles.metaRow, styles.metaLast]}>
              <FontAwesome name="building-o" size={12} color={homeShell.cardMuted} />
              <Text style={styles.metaTxt} numberOfLines={2}>
                Quartier : <Text style={styles.metaStrong}>{campus.district}</Text>
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hScroll: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingBottom: 2,
    paddingEnd: spacing.xl,
    gap: spacing.md,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    backgroundColor: '#FAFBFC',
    overflow: 'hidden',
    flexShrink: 0,
  },
  mapsLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: '#ECFDF5',
    borderBottomWidth: 1,
    borderBottomColor: '#D1FAE5',
  },
  mapsLinkRowRtl: {
    flexDirection: 'row-reverse',
  },
  rtlCol: {
    alignItems: 'flex-end',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  mapsIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapsLinkTextCol: {
    flex: 1,
    minWidth: 0,
  },
  mapsLinkLabel: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: '#065F46',
  },
  mapsLinkSub: {
    marginTop: 1,
    fontSize: 10,
    fontWeight: '600',
    color: '#047857',
  },
  mapsEmptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: homeShell.borderOnWhite,
  },
  mapsEmptyTxt: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: homeShell.cardMuted,
    lineHeight: 16,
  },
  campusTitle: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    fontSize: fontSize.sm,
    fontWeight: '900',
    color: homeShell.cardText,
    textAlign: 'center',
    letterSpacing: -0.15,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingHorizontal: spacing.sm,
    marginTop: 6,
  },
  metaLast: {
    paddingBottom: spacing.sm,
  },
  metaTxt: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: homeShell.cardMuted,
    lineHeight: 16,
  },
  metaStrong: {
    color: homeShell.cardText,
    fontWeight: '800',
  },
});
