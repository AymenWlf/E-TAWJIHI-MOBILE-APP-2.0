import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Linking from 'expo-linking';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { WebView } from 'react-native-webview';

import { homeShell } from '@/theme/homeShell';
import { fontSize, radius, spacing } from '@/theme/tokens';
import { type CampusDisplayRow } from '@/utils/campusMaps';

/** Largeur d’une carte campus en liste horizontale (plus compact que pleine largeur). */
const CARD_WIDTH = 236;
/** Aperçu carte Google Maps plus bas pour tenir dans la tuile. */
const MAP_HEIGHT = 118;

type Props = {
  rows: CampusDisplayRow[];
};

export function EstablishmentCampusSection({ rows }: Props) {
  if (rows.length === 0) return null;

  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.hScroll}
      accessibilityLabel="Liste des campus">
      {rows.map((campus) => (
        <View key={campus.key} style={[styles.card, { width: CARD_WIDTH }]}>
          {campus.embedUrl ? (
            <View style={styles.mapBox}>
              <WebView
                source={{ uri: campus.embedUrl }}
                style={styles.webview}
                scrollEnabled={false}
                nestedScrollEnabled={false}
                allowsInlineMediaPlayback
                javaScriptEnabled
                domStorageEnabled
                originWhitelist={['https://*', 'http://*']}
                setSupportMultipleWindows={false}
              />
            </View>
          ) : campus.openMapUrl ? (
            <Pressable
              onPress={() => void Linking.openURL(campus.openMapUrl!)}
              style={styles.mapFallback}
              accessibilityRole="button"
              accessibilityLabel="Ouvrir la localisation dans Google Maps">
              <FontAwesome name="map-o" size={28} color={homeShell.cardMuted} />
              <Text style={styles.mapFallbackTxt}>Google Maps</Text>
              <Text style={styles.mapFallbackHint} numberOfLines={2}>
                {campus.district !== 'Non spécifié' ? campus.district : campus.city}
              </Text>
            </Pressable>
          ) : null}

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
      ))}
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
  mapBox: {
    width: '100%',
    height: MAP_HEIGHT,
    backgroundColor: '#E2E8F0',
    ...(Platform.OS === 'web'
      ? {
          minHeight: MAP_HEIGHT,
        }
      : {}),
  },
  webview: {
    flex: 1,
    backgroundColor: '#E2E8F0',
  },
  mapFallback: {
    minHeight: MAP_HEIGHT,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    gap: 4,
  },
  mapFallbackTxt: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: homeShell.blue,
  },
  mapFallbackHint: {
    fontSize: 10,
    fontWeight: '600',
    color: homeShell.cardMuted,
    textAlign: 'center',
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
