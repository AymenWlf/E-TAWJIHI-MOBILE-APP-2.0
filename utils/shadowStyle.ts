import { Platform, type TextStyle, type ViewStyle } from 'react-native';

type Offset = { width?: number; height?: number };

export type BoxShadowInput = {
  color?: string;
  offset?: Offset;
  opacity?: number;
  radius?: number;
  /** Android material elevation (ignored on web). */
  elevation?: number;
};

export type TextShadowInput = {
  color?: string;
  offset?: Offset;
  radius?: number;
};

/** Convertit `#rgb` / `#rrggbb` / `rgb()` / `rgba()` + opacité → `rgba(...)`. */
function colorWithOpacity(color: string, opacity: number): string {
  const c = color.trim();
  const a = Math.max(0, Math.min(1, opacity));

  const rgbaMatch = c.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i,
  );
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${a})`;
  }

  const hex = c.replace('#', '');
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  if (/^[0-9a-f]{8}$/i.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  return c;
}

/**
 * Ombre de vue compatible RN Web (`boxShadow`) et natif (RN 0.76+ `boxShadow`).
 * Évite le warning RNW : `"shadow*" style props are deprecated`.
 */
export function rnBoxShadow(input: BoxShadowInput = {}): ViewStyle {
  const ox = input.offset?.width ?? 0;
  const oy = input.offset?.height ?? 0;
  const radius = input.radius ?? 0;
  const opacity = input.opacity ?? 1;
  const color = colorWithOpacity(input.color ?? '#000', opacity);
  const boxShadow = `${ox}px ${oy}px ${radius}px ${color}`;

  const style: ViewStyle = { boxShadow } as ViewStyle;
  if (Platform.OS === 'android' && input.elevation != null) {
    style.elevation = input.elevation;
  }
  return style;
}

/**
 * Ombre de texte : `textShadow` (string) sur web, props legacy sur natif.
 * Évite le warning RNW : `"textShadow*" style props are deprecated`.
 */
export function rnTextShadow(input: TextShadowInput = {}): TextStyle {
  const ox = input.offset?.width ?? 0;
  const oy = input.offset?.height ?? 0;
  const radius = input.radius ?? 0;
  const color = input.color ?? '#000';

  if (Platform.OS === 'web') {
    return { textShadow: `${ox}px ${oy}px ${radius}px ${color}` } as TextStyle;
  }

  return {
    textShadowColor: color,
    textShadowOffset: { width: ox, height: oy },
    textShadowRadius: radius,
  };
}
