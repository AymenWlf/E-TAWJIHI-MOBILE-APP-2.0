import { useMemo, type ReactNode } from 'react';
import { Platform, StyleSheet, TextStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { brand, fontSize } from '@/theme/tokens';

export type WaSegment =
  | { type: 'text'; value: string }
  | { type: 'bold'; children: WaSegment[] }
  | { type: 'italic'; children: WaSegment[] }
  | { type: 'strike'; children: WaSegment[] }
  | { type: 'mono'; children: WaSegment[] }
  | { type: 'monoBlock'; value: string };

function mergeAdjacentText(segments: WaSegment[]): WaSegment[] {
  const out: WaSegment[] = [];
  for (const seg of segments) {
    if (seg.type === 'text' && seg.value === '') continue;
    const last = out[out.length - 1];
    if (seg.type === 'text' && last?.type === 'text') {
      last.value += seg.value;
    } else {
      out.push(
        seg.type === 'bold' || seg.type === 'italic' || seg.type === 'strike' || seg.type === 'mono'
          ? { ...seg, children: mergeAdjacentText(seg.children) }
          : seg,
      );
    }
  }
  return out;
}

export function parseWhatsAppStyle(input: string): WaSegment[] {
  const result: WaSegment[] = [];
  let buffer = '';
  let i = 0;

  const flush = () => {
    if (buffer) {
      result.push({ type: 'text', value: buffer });
      buffer = '';
    }
  };

  while (i < input.length) {
    if (input.startsWith('```', i)) {
      const close = input.indexOf('```', i + 3);
      if (close !== -1) {
        flush();
        let block = input.slice(i + 3, close);
        if (block.startsWith('\n')) block = block.slice(1);
        if (block.endsWith('\n')) block = block.slice(0, -1);
        result.push({ type: 'monoBlock', value: block });
        i = close + 3;
        continue;
      }
      buffer += '`';
      i += 1;
      continue;
    }

    if (input[i] === '`') {
      const close = input.indexOf('`', i + 1);
      if (close !== -1 && close > i + 1) {
        flush();
        const inner = input.slice(i + 1, close);
        result.push({ type: 'mono', children: parseWhatsAppStyle(inner) });
        i = close + 1;
        continue;
      }
    }

    if (input[i] === '*') {
      const close = input.indexOf('*', i + 1);
      if (close !== -1 && close > i + 1) {
        flush();
        const inner = input.slice(i + 1, close);
        result.push({ type: 'bold', children: parseWhatsAppStyle(inner) });
        i = close + 1;
        continue;
      }
    }

    if (input[i] === '_') {
      const close = input.indexOf('_', i + 1);
      if (close !== -1 && close > i + 1) {
        flush();
        const inner = input.slice(i + 1, close);
        result.push({ type: 'italic', children: parseWhatsAppStyle(inner) });
        i = close + 1;
        continue;
      }
    }

    if (input[i] === '~') {
      const close = input.indexOf('~', i + 1);
      if (close !== -1 && close > i + 1) {
        flush();
        const inner = input.slice(i + 1, close);
        result.push({ type: 'strike', children: parseWhatsAppStyle(inner) });
        i = close + 1;
        continue;
      }
    }

    buffer += input[i];
    i += 1;
  }

  flush();
  return mergeAdjacentText(result);
}

const monoFont = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string;

type RenderCtx = { base: TextStyle; rtl?: boolean; inMineBubble: boolean };

function renderSegment(seg: WaSegment, key: string, ctx: RenderCtx): ReactNode {
  const rtl = ctx.rtl ? ({ writingDirection: 'rtl' as const, textAlign: 'right' as const } satisfies TextStyle) : null;
  const monoBg = ctx.inMineBubble ? 'rgba(255,255,255,0.18)' : brand.backgroundSoft;
  const monoBorder = ctx.inMineBubble ? 'rgba(255,255,255,0.35)' : brand.border;
  const monoBlockBg = ctx.inMineBubble ? 'rgba(255,255,255,0.12)' : brand.backgroundSoft;

  switch (seg.type) {
    case 'text':
      return (
        <Text key={key} style={[ctx.base, rtl]}>
          {seg.value}
        </Text>
      );
    case 'bold':
      return (
        <Text key={key} style={[ctx.base, { fontWeight: '800' }, rtl]}>
          {seg.children.map((c, j) => renderSegment(c, `${key}b${j}`, ctx))}
        </Text>
      );
    case 'italic':
      return (
        <Text key={key} style={[ctx.base, { fontStyle: 'italic' }, rtl]}>
          {seg.children.map((c, j) => renderSegment(c, `${key}i${j}`, ctx))}
        </Text>
      );
    case 'strike':
      return (
        <Text key={key} style={[ctx.base, { textDecorationLine: 'line-through', opacity: 0.88 }, rtl]}>
          {seg.children.map((c, j) => renderSegment(c, `${key}s${j}`, ctx))}
        </Text>
      );
    case 'mono':
      return (
        <Text
          key={key}
          style={[
            ctx.base,
            ctx.inMineBubble && { color: brand.white },
            {
              fontFamily: monoFont,
              fontSize: fontSize.sm,
              backgroundColor: monoBg,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: monoBorder,
              borderRadius: 4,
              paddingHorizontal: 3,
              paddingVertical: 1,
            },
            rtl,
          ]}
        >
          {seg.children.map((c, j) => renderSegment(c, `${key}m${j}`, ctx))}
        </Text>
      );
    case 'monoBlock':
      return (
        <Text
          key={key}
          style={[
            ctx.base,
            ctx.inMineBubble && { color: brand.white },
            {
              marginTop: 8,
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 10,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: monoBorder,
              backgroundColor: monoBlockBg,
              fontFamily: monoFont,
              fontSize: fontSize.sm,
              lineHeight: 20,
            },
            rtl,
          ]}
        >
          {seg.value}
        </Text>
      );
    default:
      return null;
  }
}

type Props = {
  text: string;
  baseStyle: TextStyle;
  isRTL?: boolean;
  /** Bulle expéditeur (fond bleu) : mono lisible en blanc sur le bleu. */
  inMineBubble?: boolean;
};

/** Corps message officiel (admin) — style WhatsApp ; tout en `Text` pour RN. */
export function WhatsAppStyleOfficialBody({ text, baseStyle, isRTL, inMineBubble = false }: Props) {
  const segments = useMemo(() => parseWhatsAppStyle(text ?? ''), [text]);
  const ctx: RenderCtx = { base: baseStyle, rtl: isRTL, inMineBubble };
  return (
    <Text style={[baseStyle, isRTL && { writingDirection: 'rtl', textAlign: 'right' }]}>
      {segments.map((s, idx) => renderSegment(s, `wa-${idx}`, ctx))}
    </Text>
  );
}
