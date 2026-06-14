import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import RenderHTML from 'react-native-render-html';
import { WebView } from 'react-native-webview';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { CAIRO, applyArabicFontOverlay } from '@/theme/arabicTypography';
import { homeShell } from '@/theme/homeShell';
import { fontSize, spacing } from '@/theme/tokens';
import { normalizeRtlInlineStyle, prepareDescriptionHtmlForDisplay } from '@/utils/descriptionHtml';
import {
  RTL_DESCRIPTION_HEIGHT_SCRIPT,
  RTL_DESCRIPTION_WEBVIEW_BASE_URL,
  buildRtlDescriptionWebHtml,
} from '@/utils/rtlDescriptionWebHtml';
import { safeOpenUrl } from '@/utils/safeOpenUrl';

type Props = {
  /** Peut contenir du HTML (admin / CMS) ou du texte brut. */
  description: string | null | undefined;
  /** Fallback si vide. */
  emptyLabel?: string;
  /** Largeur utile RenderHTML (défaut : écran − marges fiche). */
  contentWidth?: number;
  /** Force RTL + Cairo même si le conteneur parent est LTR (défaut : locale ar). */
  forceRtl?: boolean;
  /** Limite la hauteur (aperçu verrouillé) — indispensable pour la WebView RTL. */
  maxHeight?: number;
};

const MIN_RTL_WEBVIEW_HEIGHT = 120;

export function EstablishmentDescriptionHtml({
  description,
  emptyLabel = 'Aucune description publiée pour cet établissement.',
  contentWidth: contentWidthProp,
  forceRtl,
  maxHeight,
}: Props) {
  const { isRTL: localeRtl } = useLocale();
  const rtl = forceRtl ?? localeRtl;
  const { width: screenW } = useWindowDimensions();
  const contentWidth = contentWidthProp ?? Math.max(120, screenW - spacing.xl * 4);

  const [webViewHeight, setWebViewHeight] = useState(MIN_RTL_WEBVIEW_HEIGHT);

  const systemFonts = useMemo(() => Object.values(CAIRO), []);

  const htmlDocument = useMemo(
    () => (rtl ? buildRtlDescriptionWebHtml(description) : ''),
    [description, rtl],
  );

  const source = useMemo(
    () => ({
      html: prepareDescriptionHtmlForDisplay(description, { rtl }),
    }),
    [description, rtl],
  );

  useEffect(() => {
    setWebViewHeight(maxHeight != null ? maxHeight : MIN_RTL_WEBVIEW_HEIGHT);
  }, [htmlDocument, maxHeight]);

  const onWebViewMessage = useCallback(
    (raw: string) => {
      try {
        const msg = JSON.parse(raw) as { type?: string; value?: number };
        if (msg.type === 'height' && typeof msg.value === 'number' && msg.value > 0) {
          const measured = Math.max(MIN_RTL_WEBVIEW_HEIGHT, Math.ceil(msg.value));
          setWebViewHeight(
            maxHeight != null ? Math.min(measured, maxHeight) : measured,
          );
        }
      } catch {
        /* ignore */
      }
    },
    [maxHeight],
  );

  const resolvedWebViewHeight =
    maxHeight != null ? Math.min(webViewHeight, maxHeight) : webViewHeight;

  const defaultTextProps = useMemo(
    () => ({
      selectable: true as const,
      ...(rtl
        ? {
            style: {
              writingDirection: 'rtl' as const,
              textAlign: 'right' as const,
              ...applyArabicFontOverlay({ fontFamily: CAIRO.semibold }),
            },
          }
        : {}),
    }),
    [rtl],
  );

  const rtlText = useMemo(
    () =>
      rtl
        ? ({
            textAlign: 'right' as const,
            writingDirection: 'rtl' as const,
            direction: 'rtl' as const,
            width: '100%' as const,
            alignSelf: 'stretch' as const,
          })
        : ({
            textAlign: 'left' as const,
            writingDirection: 'ltr' as const,
            direction: 'ltr' as const,
          }),
    [rtl],
  );

  const domVisitors = useMemo(
    () =>
      rtl
        ? {
            onElement: (element: { attribs?: Record<string, string> }) => {
              if (!element.attribs) {
                element.attribs = {};
              }
              element.attribs.dir = 'rtl';
              const merged = normalizeRtlInlineStyle(
                element.attribs.style
                  ? `${element.attribs.style};direction:rtl;text-align:right;unicode-bidi:embed`
                  : 'direction:rtl;text-align:right;unicode-bidi:embed',
              );
              element.attribs.style = merged;
              const cls = element.attribs.class ?? '';
              element.attribs.class = cls
                .replace(/\bql-align-left\b/g, 'ql-align-right')
                .replace(/\bql-align-center\b/g, 'ql-align-right')
                .replace(/\bql-direction-ltr\b/g, 'ql-direction-rtl');
            },
          }
        : undefined,
    [rtl],
  );

  const classesStyles = useMemo(() => {
    if (!rtl) return undefined;
    const rtlBlock = {
      textAlign: 'right' as const,
      writingDirection: 'rtl' as const,
      direction: 'rtl' as const,
      width: '100%' as const,
    };
    return {
      'ql-align-left': rtlBlock,
      'ql-align-right': rtlBlock,
      'ql-align-center': rtlBlock,
      'ql-align-justify': rtlBlock,
      'ql-direction-ltr': rtlBlock,
      'ql-direction-rtl': rtlBlock,
    };
  }, [rtl]);

  const ignoredStyles = useMemo(
    () =>
      rtl
        ? ([
            'textAlign',
            'direction',
            'writingDirection',
            'float',
            'marginLeft',
            'marginRight',
            'paddingLeft',
            'paddingRight',
          ] as const)
        : undefined,
    [rtl],
  );

  const renderersProps = useMemo(
    () =>
      rtl
        ? {
            ul: { enableExperimentalRtl: true },
            ol: { enableExperimentalRtl: true },
          }
        : undefined,
    [rtl],
  );

  const tagsStyles = useMemo(() => {
    const commonHeading = {
      color: homeShell.cardText,
      letterSpacing: -0.25,
      ...rtlText,
    };
    const ar = (family: keyof typeof CAIRO) =>
      rtl ? applyArabicFontOverlay({ fontFamily: CAIRO[family] }) : {};

    return {
      body: rtlText,
      p: {
        color: homeShell.cardMuted,
        fontSize: fontSize.md,
        lineHeight: 23,
        fontWeight: '600' as const,
        marginTop: 0,
        marginBottom: 12,
        ...rtlText,
        ...ar('semibold'),
      },
      div: {
        color: homeShell.cardMuted,
        fontSize: fontSize.md,
        lineHeight: 23,
        fontWeight: '600' as const,
        marginBottom: 8,
        ...rtlText,
        ...ar('semibold'),
      },
      h1: { ...commonHeading, fontSize: fontSize.md + 2, fontWeight: '900' as const, marginTop: 14, marginBottom: 6, ...ar('black') },
      h2: { ...commonHeading, fontSize: fontSize.md + 1.5, fontWeight: '800' as const, marginTop: 12, marginBottom: 5, ...ar('extrabold') },
      h3: { ...commonHeading, fontSize: fontSize.md + 1, fontWeight: '800' as const, marginTop: 10, marginBottom: 5, ...ar('extrabold') },
      h4: { ...commonHeading, fontSize: fontSize.md + 0.5, fontWeight: '800' as const, marginTop: 9, marginBottom: 4, ...ar('extrabold') },
      h5: { ...commonHeading, fontSize: fontSize.md + 0.5, fontWeight: '700' as const, marginTop: 8, marginBottom: 4, color: homeShell.blueDeep, ...ar('bold') },
      h6: { ...commonHeading, fontSize: fontSize.md, fontWeight: '800' as const, marginTop: 8, marginBottom: 4, color: homeShell.cardMuted, ...ar('extrabold') },
      ul: { marginBottom: 10, ...rtlText, ...(rtl ? { paddingRight: 18, paddingLeft: 0 } : { paddingLeft: 18 }) },
      ol: { marginBottom: 10, ...rtlText, ...(rtl ? { paddingRight: 18, paddingLeft: 0 } : { paddingLeft: 18 }) },
      li: { color: homeShell.cardMuted, fontSize: fontSize.md, lineHeight: 22, fontWeight: '600' as const, marginBottom: 6, ...rtlText, ...ar('semibold') },
      span: { color: homeShell.cardMuted, fontSize: fontSize.md, lineHeight: 23, fontWeight: '600' as const, ...rtlText, ...ar('semibold') },
      strong: { fontWeight: '800' as const, color: homeShell.cardText, ...rtlText, ...ar('extrabold') },
      b: { fontWeight: '800' as const, color: homeShell.cardText, ...rtlText, ...ar('extrabold') },
      em: { fontStyle: 'italic' as const, ...rtlText },
      a: { color: homeShell.blue, textDecorationLine: 'underline' as const, fontWeight: '700' as const, ...rtlText, ...ar('bold') },
      blockquote: {
        ...(rtl
          ? { borderRightWidth: 3, borderRightColor: homeShell.green, paddingRight: 12, borderLeftWidth: 0, paddingLeft: 0 }
          : { borderLeftWidth: 3, borderLeftColor: homeShell.green, paddingLeft: 12 }),
        marginVertical: 8,
        paddingVertical: 4,
        fontStyle: 'italic' as const,
        color: homeShell.cardMuted,
        ...rtlText,
        ...ar('semibold'),
      },
      pre: { backgroundColor: '#F1F5F9', padding: 12, borderRadius: 10, marginVertical: 8, overflow: 'hidden' as const, ...rtlText, ...ar('semibold') },
      code: {
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string,
        fontSize: 13,
        color: homeShell.blueDeep,
        ...rtlText,
      },
      th: { color: homeShell.cardText, fontWeight: '700' as const, paddingVertical: 6, paddingHorizontal: 8, ...rtlText, ...ar('bold') },
      td: { color: homeShell.cardMuted, fontSize: fontSize.sm, paddingVertical: 6, paddingHorizontal: 8, ...rtlText, ...ar('semibold') },
      table: { marginVertical: 8, ...(rtl ? { alignSelf: 'flex-end' as const } : {}) },
    };
  }, [rtl, rtlText]);

  const baseStyle = useMemo(
    () => ({
      color: homeShell.cardMuted,
      fontSize: fontSize.md,
      lineHeight: 23,
      ...rtlText,
      ...(rtl ? applyArabicFontOverlay({ fontFamily: CAIRO.semibold }) : {}),
    }),
    [rtl, rtlText],
  );

  const hasContent = rtl ? Boolean(htmlDocument) : Boolean(source.html);

  if (!hasContent) {
    return <Text style={[styles.empty, rtl && styles.emptyRtl]}>{emptyLabel}</Text>;
  }

  if (rtl) {
    return (
      <View
        style={[
          styles.wrap,
          styles.wrapRtl,
          maxHeight != null && { maxHeight, overflow: 'hidden' as const },
        ]}
      >
        <WebView
          key={htmlDocument.slice(0, 120)}
          originWhitelist={['*']}
          source={{ html: htmlDocument, baseUrl: RTL_DESCRIPTION_WEBVIEW_BASE_URL }}
          style={[styles.webView, { height: resolvedWebViewHeight }]}
          scrollEnabled={false}
          nestedScrollEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          javaScriptEnabled
          opaque={false}
          injectedJavaScript={RTL_DESCRIPTION_HEIGHT_SCRIPT}
          onMessage={(event) => onWebViewMessage(event.nativeEvent.data)}
          onShouldStartLoadWithRequest={(request) => {
            const url = request.url ?? '';
            if (
              url === 'about:blank' ||
              url.startsWith(RTL_DESCRIPTION_WEBVIEW_BASE_URL) ||
              url.startsWith('data:')
            ) {
              return true;
            }
            void safeOpenUrl(url);
            return false;
          }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, maxHeight != null && { maxHeight, overflow: 'hidden' as const }]}>
      <RenderHTML
        contentWidth={contentWidth}
        source={source}
        baseStyle={baseStyle}
        tagsStyles={tagsStyles}
        classesStyles={classesStyles}
        defaultTextProps={defaultTextProps}
        systemFonts={systemFonts}
        domVisitors={domVisitors}
        enableCSSInlineProcessing
        enableUserAgentStyles={false}
        ignoredStyles={ignoredStyles}
        ignoredDomTags={['script', 'iframe', 'object', 'embed', 'style', 'form', 'button', 'input']}
        renderersProps={{
          ...(renderersProps ?? {}),
          a: {
            onPress(_, href) {
              void safeOpenUrl(href);
            },
          },
        }}
        enableExperimentalGhostLinesPrevention
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'stretch',
    width: '100%',
  },
  wrapRtl: {
    direction: 'rtl',
    alignSelf: 'stretch',
    width: '100%',
  },
  webView: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  empty: {
    color: homeShell.cardMuted,
    fontSize: fontSize.md,
    lineHeight: 22,
    fontWeight: '600',
  },
  emptyRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
