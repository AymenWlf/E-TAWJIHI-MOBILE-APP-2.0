import { StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { EstablishmentDescriptionHtml } from '@/components/schools/EstablishmentDescriptionHtml';
import { Text } from '@/components/ui/Text';

const BULLET_LINE_RE = /^[\s]*([-–•*·])\s+(.*)$/u;

function looksLikeHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value.trim());
}

type Props = {
  value: string | null | undefined;
  isRTL: boolean;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  numberOfLines?: number;
  contentWidth?: number;
  htmlFontSize?: number;
  htmlLineHeight?: number;
  htmlColor?: string;
};

/**
 * Description boutique / service.
 * HTML CMS en arabe : même moteur que les fiches établissement (WebView + RTL forcé).
 */
export function ShopLocalizedDescription({
  value,
  isRTL,
  style,
  containerStyle,
  numberOfLines,
  contentWidth,
  htmlLineHeight,
}: Props) {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return null;

  const previewMaxHeight =
    numberOfLines != null && htmlLineHeight != null
      ? Math.ceil(numberOfLines * htmlLineHeight)
      : numberOfLines != null
        ? numberOfLines * 18
        : undefined;

  if (looksLikeHtml(trimmed)) {
    return (
      <View style={[styles.htmlWrap, containerStyle]}>
        <EstablishmentDescriptionHtml
          description={trimmed}
          contentWidth={contentWidth}
          forceRtl={isRTL}
          maxHeight={previewMaxHeight}
          emptyLabel=" "
        />
      </View>
    );
  }

  if (isRTL) {
    const lines = trimmed.split(/\n/);
    const hasBullets = lines.some((line) => BULLET_LINE_RE.test(line.trim()));

    if (hasBullets || lines.length > 1) {
      return (
        <View style={[styles.plainRtl, containerStyle]}>
          {lines.map((line, index) => {
            const lineTrimmed = line.trim();
            if (!lineTrimmed) return <View key={`gap-${index}`} style={styles.plainGap} />;

            const bulletMatch = BULLET_LINE_RE.exec(lineTrimmed);
            if (bulletMatch) {
              const mark = bulletMatch[1] === '-' ? '−' : bulletMatch[1];
              return (
                <View key={`${index}-${lineTrimmed}`} style={styles.bulletRow}>
                  <Text style={[style, styles.plainLineRtl, styles.bulletBody]} numberOfLines={numberOfLines}>
                    {bulletMatch[2]}
                  </Text>
                  <Text style={[style, styles.bulletMark]}>{mark}</Text>
                </View>
              );
            }

            return (
              <Text key={`${index}-${lineTrimmed}`} style={[style, styles.plainLineRtl]} numberOfLines={numberOfLines}>
                {lineTrimmed}
              </Text>
            );
          })}
        </View>
      );
    }

    return (
      <Text style={[style, styles.plainLineRtl]} numberOfLines={numberOfLines}>
        {trimmed}
      </Text>
    );
  }

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {trimmed}
    </Text>
  );
}

const styles = StyleSheet.create({
  htmlWrap: {
    alignSelf: 'stretch',
    width: '100%',
  },
  plainRtl: {
    alignSelf: 'stretch',
    width: '100%',
    gap: 4,
  },
  plainGap: { height: 4 },
  plainLineRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
    alignSelf: 'stretch',
    width: '100%',
  },
  bulletRow: {
    flexDirection: 'row-reverse',
    direction: 'ltr',
    alignItems: 'flex-start',
    gap: 6,
    alignSelf: 'stretch',
  },
  bulletBody: { flex: 1, minWidth: 0 },
  bulletMark: { lineHeight: 17, fontWeight: '700' },
});
