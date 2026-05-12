import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { Text } from '@/components/ui/Text';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import {
  parseYoutubeVideoId,
  youtubeNocookieEmbedSrc,
  YOUTUBE_EMBED_DEFAULT_ORIGIN,
} from '@/utils/youtubeVideoId';

type Props = {
  youtubeUrl: string;
  title: string;
  /** Message si le WebView ne charge pas le lecteur */
  playbackErrorLabel: string;
  retryLabel: string;
  rtl?: boolean;
  /** Faux quand un <Section> parent affiche déjà le titre */
  showHeading?: boolean;
};

export function ContestYoutubeTutorial({
  youtubeUrl,
  title,
  playbackErrorLabel,
  retryLabel,
  rtl,
  showHeading = true,
}: Props) {
  const videoId = useMemo(() => parseYoutubeVideoId(youtubeUrl), [youtubeUrl]);
  const [failed, setFailed] = useState(false);

  if (!videoId) return null;

  const embedUri = youtubeNocookieEmbedSrc(videoId);

  return (
    <View style={styles.card}>
      {showHeading ? (
        <View style={[styles.header, rtl && styles.rowRtl]}>
          <View style={[styles.titleRow, rtl && styles.rowRtl]}>
            <FontAwesome name="video-camera" size={14} color="#7C3AED" />
            <Text style={[styles.title, rtl && styles.rtl]} numberOfLines={2}>
              {title}
            </Text>
          </View>
        </View>
      ) : null}
      {!failed ? (
        <View style={styles.videoWrap}>
          <WebView
            source={{
              uri: embedUri,
              headers: {
                /* Requis avec l’API embed WebView (sinon erreur YouTube 153 — embedder.identity.missing.referrer) */
                Referer: `${YOUTUBE_EMBED_DEFAULT_ORIGIN}/`,
              },
            }}
            style={styles.webview}
            javaScriptEnabled
            domStorageEnabled
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            thirdPartyCookiesEnabled
            onError={() => setFailed(true)}
            onHttpError={() => setFailed(true)}
          />
        </View>
      ) : (
        <View style={styles.fallback}>
          <FontAwesome name="exclamation-circle" size={32} color={brand.textMuted} />
          <Text style={[styles.fallbackTxt, rtl && styles.rtl]}>{playbackErrorLabel}</Text>
          <Pressable
            onPress={() => setFailed(false)}
            style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.88 }]}
          >
            <Text style={styles.retryBtnTxt}>{retryLabel}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EDE9FE',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F3FF',
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  title: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  rtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  videoWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  fallback: {
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#FAF5FF',
    padding: spacing.lg,
  },
  fallbackTxt: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: brand.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  retryBtn: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
  },
  retryBtnTxt: {
    color: brand.white,
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
});
