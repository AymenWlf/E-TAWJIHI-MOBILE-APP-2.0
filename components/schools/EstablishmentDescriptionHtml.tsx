import { useMemo } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import RenderHTML from 'react-native-render-html';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { CAIRO } from '@/theme/arabicTypography';
import { homeShell } from '@/theme/homeShell';
import { fontSize, spacing } from '@/theme/tokens';
import { prepareDescriptionHtmlForDisplay } from '@/utils/descriptionHtml';
import { safeOpenUrl } from '@/utils/safeOpenUrl';

type Props = {
  /** Peut contenir du HTML (admin / CMS) ou du texte brut. */
  description: string | null | undefined;
  /** Fallback si vide. */
  emptyLabel?: string;
};

export function EstablishmentDescriptionHtml({
  description,
  emptyLabel = 'Aucune description publiée pour cet établissement.',
}: Props) {
  const { isRTL } = useLocale();
  const { width: screenW } = useWindowDimensions();
  /** Section : marges latérales + padding carte (voir fiche détail). */
  const contentWidth = Math.max(120, screenW - spacing.xl * 4);

  const source = useMemo(
    () => ({
      html: prepareDescriptionHtmlForDisplay(description, { rtl: isRTL }),
    }),
    [description, isRTL],
  );

  const defaultTextProps = useMemo(
    () => ({
      selectable: true as const,
      ...(isRTL ? { style: { writingDirection: 'rtl' as const, textAlign: 'right' as const } } : {}),
    }),
    [isRTL],
  );

  const rtlText = useMemo(
    () =>
      isRTL
        ? ({ textAlign: 'right' as const, writingDirection: 'rtl' as const })
        : ({ textAlign: 'left' as const, writingDirection: 'ltr' as const }),
    [isRTL],
  );

  const classesStyles = useMemo(() => {
    if (!isRTL) return undefined;
    const rtlBlock = { textAlign: 'right' as const, writingDirection: 'rtl' as const };
    return {
      'ql-align-left': rtlBlock,
      'ql-align-right': rtlBlock,
      'ql-align-center': { textAlign: 'center' as const, writingDirection: 'rtl' as const },
      'ql-align-justify': rtlBlock,
      'ql-direction-ltr': rtlBlock,
      'ql-direction-rtl': rtlBlock,
    };
  }, [isRTL]);

  /** Les styles inline CMS (Quill) ne doivent pas réimposer du LTR / align left. */
  const ignoredStyles = useMemo(
    () =>
      isRTL
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
    [isRTL],
  );

  const renderersProps = useMemo(
    () =>
      isRTL
        ? {
            ul: { enableExperimentalRtl: true },
            ol: { enableExperimentalRtl: true },
          }
        : undefined,
    [isRTL],
  );

  const tagsStyles = useMemo(() => {
    const commonHeading = {
      color: homeShell.cardText,
      letterSpacing: -0.25,
      ...rtlText,
    };
    const ar = (family: keyof typeof CAIRO) => (isRTL ? { fontFamily: CAIRO[family] } : {});

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
      h1: {
        ...commonHeading,
        fontSize: fontSize.md + 2,
        fontWeight: '900' as const,
        marginTop: 14,
        marginBottom: 6,
        ...ar('black'),
      },
      h2: {
        ...commonHeading,
        fontSize: fontSize.md + 1.5,
        fontWeight: '800' as const,
        marginTop: 12,
        marginBottom: 5,
        ...ar('extrabold'),
      },
      h3: {
        ...commonHeading,
        fontSize: fontSize.md + 1,
        fontWeight: '800' as const,
        marginTop: 10,
        marginBottom: 5,
        ...ar('extrabold'),
      },
      h4: {
        ...commonHeading,
        fontSize: fontSize.md + 0.5,
        fontWeight: '800' as const,
        marginTop: 9,
        marginBottom: 4,
        ...ar('extrabold'),
      },
      h5: {
        ...commonHeading,
        fontSize: fontSize.md + 0.5,
        fontWeight: '700' as const,
        marginTop: 8,
        marginBottom: 4,
        color: homeShell.blueDeep,
        ...ar('bold'),
      },
      h6: {
        ...commonHeading,
        fontSize: fontSize.md,
        fontWeight: '800' as const,
        marginTop: 8,
        marginBottom: 4,
        color: homeShell.cardMuted,
        ...ar('extrabold'),
      },
      ul: {
        marginBottom: 10,
        ...(isRTL ? { paddingRight: 18, paddingLeft: 0 } : { paddingLeft: 18 }),
      },
      ol: {
        marginBottom: 10,
        ...(isRTL ? { paddingRight: 18, paddingLeft: 0 } : { paddingLeft: 18 }),
      },
      li: {
        color: homeShell.cardMuted,
        fontSize: fontSize.md,
        lineHeight: 22,
        fontWeight: '600' as const,
        marginBottom: 6,
        ...rtlText,
        ...ar('semibold'),
      },
      span: {
        color: homeShell.cardMuted,
        fontSize: fontSize.md,
        lineHeight: 23,
        fontWeight: '600' as const,
        ...rtlText,
        ...ar('semibold'),
      },
      strong: { fontWeight: '800' as const, color: homeShell.cardText, ...rtlText, ...ar('extrabold') },
      b: { fontWeight: '800' as const, color: homeShell.cardText, ...rtlText, ...ar('extrabold') },
      em: { fontStyle: 'italic' as const, ...rtlText },
      a: {
        color: homeShell.blue,
        textDecorationLine: 'underline' as const,
        fontWeight: '700' as const,
        ...rtlText,
        ...ar('bold'),
      },
      blockquote: {
        ...(isRTL
          ? {
              borderRightWidth: 3,
              borderRightColor: homeShell.green,
              paddingRight: 12,
              borderLeftWidth: 0,
              paddingLeft: 0,
            }
          : {
              borderLeftWidth: 3,
              borderLeftColor: homeShell.green,
              paddingLeft: 12,
            }),
        marginVertical: 8,
        paddingVertical: 4,
        fontStyle: 'italic' as const,
        color: homeShell.cardMuted,
        ...rtlText,
        ...ar('semibold'),
      },
      pre: {
        backgroundColor: '#F1F5F9',
        padding: 12,
        borderRadius: 10,
        marginVertical: 8,
        overflow: 'hidden' as const,
        ...rtlText,
        ...ar('semibold'),
      },
      code: {
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string,
        fontSize: 13,
        color: homeShell.blueDeep,
        ...rtlText,
      },
      th: {
        color: homeShell.cardText,
        fontWeight: '700' as const,
        paddingVertical: 6,
        paddingHorizontal: 8,
        ...rtlText,
        ...ar('bold'),
      },
      td: {
        color: homeShell.cardMuted,
        fontSize: fontSize.sm,
        paddingVertical: 6,
        paddingHorizontal: 8,
        ...rtlText,
        ...ar('semibold'),
      },
      table: {
        marginVertical: 8,
        ...(isRTL ? { alignSelf: 'flex-end' as const } : {}),
      },
    };
  }, [isRTL, rtlText]);

  const baseStyle = useMemo(
    () => ({
      color: homeShell.cardMuted,
      fontSize: fontSize.md,
      lineHeight: 23,
      ...rtlText,
      ...(isRTL ? { fontFamily: CAIRO.semibold } : {}),
    }),
    [isRTL, rtlText],
  );

  if (!source.html) {
    return <Text style={[styles.empty, isRTL && styles.emptyRtl]}>{emptyLabel}</Text>;
  }

  return (
    <View style={[styles.wrap, isRTL && styles.wrapRtl]}>
      <RenderHTML
        contentWidth={contentWidth}
        source={source}
        baseStyle={baseStyle}
        tagsStyles={tagsStyles}
        classesStyles={classesStyles}
        defaultTextProps={defaultTextProps}
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
  },
  wrapRtl: {
    direction: 'rtl',
    alignSelf: 'stretch',
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
