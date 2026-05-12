import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMemo } from 'react';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { GlobalWallAttachment } from '@/services/globalWall';
import { resolveGlobalWallAttachmentUrl } from '@/services/globalWallAttachments';
import { downloadDocument, pickDocumentIcon, viewDocument } from '@/utils/documents';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

type Props = {
  attachment: GlobalWallAttachment;
  isRTL?: boolean;
  errorLabel: string;
};

/**
 * Pièce jointe dans une bulle du mur communauté : image visible dans le message,
 * document avec carte entièrement cliquable pour l’aperçu (URL résolue vers l’API).
 */
export function GlobalWallMessageAttachment({ attachment: a, isRTL, errorLabel }: Props) {
  const absoluteUrl = useMemo(() => resolveGlobalWallAttachmentUrl(a.url), [a.url]);
  const label = a.name ?? (a.kind === 'photo' ? 'Photo' : 'Document');

  const openPreview = async () => {
    const ok = await viewDocument(absoluteUrl);
    if (!ok) Alert.alert('', errorLabel);
  };

  const onDownload = async () => {
    const r = await downloadDocument(absoluteUrl, a.name ?? undefined);
    if (!r.ok) Alert.alert('', errorLabel);
  };

  if (a.kind === 'photo') {
    return (
      <Pressable
        onPress={() => void openPreview()}
        accessibilityRole="button"
        accessibilityLabel={`Aperçu — ${label}`}
        style={({ pressed }) => [styles.photoWrap, pressed && styles.pressed]}
      >
        <Image source={{ uri: absoluteUrl }} style={styles.photoImg} resizeMode="cover" />
        <View style={[styles.photoCaptionRow, isRTL && styles.rowRtl]}>
          <FontAwesome name="image" size={11} color={brand.primary} />
          <Text style={[styles.photoCaption, isRTL && styles.rtlText]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.docCard}>
      <Pressable
        onPress={() => void openPreview()}
        accessibilityRole="button"
        accessibilityLabel={`Aperçu — ${label}`}
        style={({ pressed }) => [styles.docPreviewZone, pressed && styles.pressed]}
      >
        <View style={[styles.docTopRow, isRTL && styles.rowRtl]}>
          <FontAwesome name={pickDocumentIcon(a.name ?? a.url)} size={14} color={brand.primary} />
          <Text style={[styles.docTitle, isRTL && styles.rtlText]} numberOfLines={2}>
            {label}
          </Text>
        </View>
        <Text style={[styles.docTapHint, isRTL && styles.rtlText]}>Toucher pour l’aperçu</Text>
      </Pressable>
      <View style={[styles.docDownloadRow, isRTL && styles.rowRtl]}>
        <Pressable
          onPress={() => void onDownload()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Télécharger"
          style={({ pressed }) => [styles.downloadBtn, pressed && { opacity: 0.88 }]}
        >
          <Text style={styles.downloadBtnTxt}>Télécharger</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.93 },
  rowRtl: { flexDirection: 'row-reverse' },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
  photoWrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.borderLight,
    backgroundColor: brand.backgroundSoft,
  },
  photoImg: {
    width: '100%',
    aspectRatio: 4 / 3,
    maxHeight: 240,
    backgroundColor: 'rgba(248,250,252,0.9)',
  },
  photoCaptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: brand.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.borderLight,
  },
  photoCaption: {
    flex: 1,
    minWidth: 0,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: brand.text,
  },
  docCard: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.borderLight,
    backgroundColor: brand.backgroundSoft,
    gap: 6,
  },
  docPreviewZone: {
    gap: 6,
  },
  docTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  docTitle: { flex: 1, minWidth: 0, fontSize: fontSize.xs, fontWeight: '700', color: brand.text },
  docTapHint: { fontSize: 9, fontWeight: '600', color: brand.textMuted },
  docDownloadRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  downloadBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  downloadBtnTxt: { fontSize: 10, fontWeight: '800', color: brand.primary },
});
