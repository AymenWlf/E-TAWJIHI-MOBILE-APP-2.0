import { useMemo } from 'react';
import { Linking, Platform, StyleSheet, useWindowDimensions } from 'react-native';
import RenderHTML from 'react-native-render-html';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { CAIRO } from '@/theme/arabicTypography';
import { homeShell } from '@/theme/homeShell';
import { fontSize, spacing } from '@/theme/tokens';
import { normalizeEstablishmentDescriptionHtml } from '@/utils/descriptionHtml';

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

  const source = useMemo(() => ({ html: normalizeEstablishmentDescriptionHtml(description) }), [description]);

  if (!source.html) {
    return <Text style={styles.empty}>{emptyLabel}</Text>;
  }

  const tagsStyles = useMemo(() => {
    const commonHeading = {
      color: homeShell.cardText,
      letterSpacing: -0.25,
    };
    const ar = (family: keyof typeof CAIRO) => (isRTL ? { fontFamily: CAIRO[family] } : {});

    return {
      p: {
        color: homeShell.cardMuted,
        fontSize: fontSize.md,
        lineHeight: 23,
        fontWeight: '600' as const,
        marginTop: 0,
        marginBottom: 12,
        ...ar('semibold'),
      },
      div: {
        color: homeShell.cardMuted,
        fontSize: fontSize.md,
        lineHeight: 23,
        fontWeight: '600' as const,
        marginBottom: 8,
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
      ul: { marginBottom: 10, paddingLeft: 4 },
      ol: { marginBottom: 10, paddingLeft: 4 },
      li: {
        color: homeShell.cardMuted,
        fontSize: fontSize.md,
        lineHeight: 22,
        fontWeight: '600' as const,
        marginBottom: 6,
        ...ar('semibold'),
      },
      strong: { fontWeight: '800' as const, color: homeShell.cardText, ...ar('extrabold') },
      b: { fontWeight: '800' as const, color: homeShell.cardText, ...ar('extrabold') },
      em: { fontStyle: 'italic' as const },
      a: {
        color: homeShell.blue,
        textDecorationLine: 'underline' as const,
        fontWeight: '700' as const,
        ...ar('bold'),
      },
      blockquote: {
        borderLeftWidth: 3,
        borderLeftColor: homeShell.green,
        paddingLeft: 12,
        marginVertical: 8,
        paddingVertical: 4,
        fontStyle: 'italic' as const,
        color: homeShell.cardMuted,
        ...ar('semibold'),
      },
      pre: {
        backgroundColor: '#F1F5F9',
        padding: 12,
        borderRadius: 10,
        marginVertical: 8,
        overflow: 'hidden' as const,
        ...ar('semibold'),
      },
      code: {
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string,
        fontSize: 13,
        color: homeShell.blueDeep,
      },
    };
  }, [isRTL]);

  const baseStyle = useMemo(
    () => ({
      color: homeShell.cardMuted,
      fontSize: fontSize.md,
      lineHeight: 23,
      ...(isRTL ? { fontFamily: CAIRO.semibold } : {}),
    }),
    [isRTL],
  );

  return (
    <RenderHTML
      contentWidth={contentWidth}
      source={source}
      baseStyle={baseStyle}
      tagsStyles={tagsStyles}
      defaultTextProps={{
        selectable: true,
      }}
      ignoredDomTags={['script', 'iframe', 'object', 'embed', 'style', 'form', 'button', 'input']}
      renderersProps={{
        a: {
          onPress(_, href) {
            if (!href) return;
            void Linking.openURL(href);
          },
        },
      }}
      enableExperimentalGhostLinesPrevention
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    color: homeShell.cardMuted,
    fontSize: fontSize.md,
    lineHeight: 22,
    fontWeight: '600',
  },
});
