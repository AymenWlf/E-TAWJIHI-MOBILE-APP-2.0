import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Linking from 'expo-linking';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { EstablishmentSnapCarousel } from '@/components/schools/EstablishmentSnapCarousel';
import { Text } from '@/components/ui/Text';
import type { HomeCopyKey } from '@/constants/i18n';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import {
  buildGoogleMapsEmbedWebHtml,
  GOOGLE_MAPS_EMBED_WEBVIEW_BASE_URL,
  type CampusDisplayRow,
} from '@/utils/campusMaps';

const MAP_HEIGHT = 132;

type Props = {
  rows: CampusDisplayRow[];
  rtl?: boolean;
  t: (key: HomeCopyKey) => string;
};

function CampusMapEmbed({
  embedUrl,
  openMapUrl,
  isRTL,
  t,
}: {
  embedUrl: string;
  openMapUrl: string | null;
  isRTL: boolean;
  t: (key: HomeCopyKey) => string;
}) {
  const [failed, setFailed] = useState(false);
  const mapHtml = useMemo(() => buildGoogleMapsEmbedWebHtml(embedUrl), [embedUrl]);

  if (failed) {
    return openMapUrl ? (
      <Pressable
        onPress={() => void Linking.openURL(openMapUrl)}
        style={({ pressed }) => [
          styles.mapsLinkRow,
          isRTL && styles.rowRtl,
          pressed && { opacity: 0.92 },
        ]}
        accessibilityRole="link"
        accessibilityLabel={t('eventsMapsLink')}
      >
        <View style={styles.mapsIconWrap}>
          <FontAwesome name="map" size={14} color="#fff" />
        </View>
        <View style={[styles.mapsLinkTextCol, isRTL && styles.rtlCol]}>
          <Text style={[styles.mapsLinkLabel, isRTL && styles.rtlText]}>{t('eventsMapsLink')}</Text>
          <Text style={[styles.mapsLinkSub, isRTL && styles.rtlText]} numberOfLines={1}>
            Google Maps
          </Text>
        </View>
        <FontAwesome name="external-link" size={13} color={brand.primary} />
      </Pressable>
    ) : (
      <View style={[styles.mapsEmptyRow, isRTL && styles.rowRtl]}>
        <FontAwesome name="map-o" size={16} color={brand.textMuted} />
        <Text style={[styles.mapsEmptyTxt, isRTL && styles.rtlText]} numberOfLines={2}>
          {t('estDetailCampusNoMapsUrl')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.mapBlock}>
      <WebView
        key={embedUrl.slice(0, 80)}
        originWhitelist={['https://*', 'http://*']}
        source={{ html: mapHtml, baseUrl: GOOGLE_MAPS_EMBED_WEBVIEW_BASE_URL }}
        style={styles.webview}
        scrollEnabled={false}
        nestedScrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
        allowsFullscreenVideo
        setSupportMultipleWindows={false}
        onError={() => setFailed(true)}
        onHttpError={() => setFailed(true)}
      />
      {openMapUrl ? (
        <Pressable
          onPress={() => void Linking.openURL(openMapUrl)}
          style={({ pressed }) => [
            styles.mapOpenLink,
            isRTL && styles.rowRtl,
            pressed && { opacity: 0.88 },
          ]}
          accessibilityRole="link"
          accessibilityLabel={t('eventsMapsLink')}
        >
          <FontAwesome name="external-link" size={11} color={brand.primary} />
          <Text style={[styles.mapOpenLinkTxt, isRTL && styles.rtlText]}>{t('eventsMapsLink')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function CampusCard({
  campus,
  isRTL,
  t,
  width,
}: {
  campus: CampusDisplayRow;
  isRTL: boolean;
  t: (key: HomeCopyKey) => string;
  width: number;
}) {
  const openMapUrl = campus.openMapUrl;

  return (
    <View style={[styles.card, { width }]}>
      <View style={styles.cardAccent} />
      {campus.embedUrl ? (
        <CampusMapEmbed embedUrl={campus.embedUrl} openMapUrl={openMapUrl} isRTL={isRTL} t={t} />
      ) : openMapUrl ? (
        <Pressable
          onPress={() => void Linking.openURL(openMapUrl)}
          style={({ pressed }) => [
            styles.mapsLinkRow,
            isRTL && styles.rowRtl,
            pressed && { opacity: 0.92 },
          ]}
          accessibilityRole="link"
          accessibilityLabel={t('eventsMapsLink')}
        >
          <View style={styles.mapsIconWrap}>
            <FontAwesome name="map" size={14} color="#fff" />
          </View>
          <View style={[styles.mapsLinkTextCol, isRTL && styles.rtlCol]}>
            <Text style={[styles.mapsLinkLabel, isRTL && styles.rtlText]}>{t('eventsMapsLink')}</Text>
            <Text style={[styles.mapsLinkSub, isRTL && styles.rtlText]} numberOfLines={1}>
              Google Maps
            </Text>
          </View>
          <FontAwesome name="external-link" size={13} color={brand.primary} />
        </Pressable>
      ) : (
        <View style={[styles.mapsEmptyRow, isRTL && styles.rowRtl]}>
          <FontAwesome name="map-o" size={16} color={brand.textMuted} />
          <Text style={[styles.mapsEmptyTxt, isRTL && styles.rtlText]} numberOfLines={2}>
            {t('estDetailCampusNoMapsUrl')}
          </Text>
        </View>
      )}

      <Text style={[styles.campusTitle, isRTL && styles.rtlText]} numberOfLines={2}>
        {campus.name}
      </Text>

      <View style={[styles.metaRow, isRTL && styles.rowRtl]}>
        <FontAwesome name="map-marker" size={12} color={brand.textMuted} />
        <Text style={[styles.metaTxt, isRTL && styles.rtlText]} numberOfLines={1}>
          Ville : <Text style={styles.metaStrong}>{campus.city}</Text>
        </Text>
      </View>
      <View style={[styles.metaRow, styles.metaLast, isRTL && styles.rowRtl]}>
        <FontAwesome name="building-o" size={12} color={brand.textMuted} />
        <Text style={[styles.metaTxt, isRTL && styles.rtlText]} numberOfLines={2}>
          Quartier : <Text style={styles.metaStrong}>{campus.district}</Text>
        </Text>
      </View>
    </View>
  );
}

export function EstablishmentCampusCarousel({
  rows,
  rtl = false,
  t,
}: Props) {
  if (rows.length === 0) return null;

  return (
    <EstablishmentSnapCarousel
      data={rows}
      keyExtractor={(campus) => campus.key}
      rtl={rtl}
      prevAccessibilityLabel={t('estDetailCampusPrev')}
      nextAccessibilityLabel={t('estDetailCampusNext')}
      renderSlide={(campus, { cardWidth }) => (
        <CampusCard campus={campus} isRTL={rtl} t={t} width={cardWidth} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.12)',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardAccent: {
    height: 4,
    backgroundColor: brand.primary,
  },
  mapBlock: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51,62,143,0.10)',
    backgroundColor: '#E2E8F0',
  },
  webview: {
    width: '100%',
    height: MAP_HEIGHT,
    backgroundColor: '#E2E8F0',
  },
  mapOpenLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    backgroundColor: 'rgba(51,62,143,0.06)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(51,62,143,0.10)',
  },
  mapOpenLinkTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: brand.primary,
  },
  mapsLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(51,62,143,0.06)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51,62,143,0.10)',
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
  mapsIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: brand.primary,
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
    color: brand.primary,
  },
  mapsLinkSub: {
    marginTop: 1,
    fontSize: 10,
    fontWeight: '600',
    color: brand.textMuted,
  },
  mapsEmptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51,62,143,0.10)',
  },
  mapsEmptyTxt: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: brand.textMuted,
    lineHeight: 16,
  },
  campusTitle: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    fontSize: fontSize.sm,
    fontWeight: '900',
    color: brand.text,
    textAlign: 'center',
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
    color: brand.textMuted,
    lineHeight: 16,
  },
  metaStrong: {
    color: brand.text,
    fontWeight: '800',
  },
});
