import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { brand } from '@/theme/tokens';

/** Fond type messagerie : dérivé du bleu charte (`brand.chatSurface`), cohérent E‑MOWAJIH / mur communauté. */
export const CHAT_WALLPAPER_BG = brand.chatSurface;

const ROW_H = 64;
const COLS = 5;

/** Motif répété sur toute la zone : icônes IA sobres (opacité très basse). */
const ICON_NAMES = [
  'robot-outline',
  'brain',
  'chip',
  'lightbulb-outline',
  'chart-line-variant',
  'creation-outline',
] as const;

type Props = {
  width: number;
  height: number;
};

export function ChatConversationBackground({ width, height }: Props) {
  /** Bleu primaire en filigrane, lisible sur `chatSurface`. */
  const tint = 'rgba(51, 62, 143, 0.07)';
  const cells = useMemo(() => {
    if (width <= 0 || height <= 0) return [];
    const rows = Math.max(6, Math.ceil(height / ROW_H));
    const cellW = width / COLS;
    const out: {
      key: string;
      left: number;
      top: number;
      name: (typeof ICON_NAMES)[number];
      size: number;
      opacity: number;
      rotate: string;
    }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c;
        const jitterX = ((i * 17) % 9) - 4;
        const jitterY = ((i * 23) % 7) - 3;
        const cx = (c + 0.5) * cellW + jitterX;
        const cy = (r + 0.5) * ROW_H + jitterY;
        const size = 19 + (i % 4);
        const opacity = 0.032 + ((i * 11) % 6) * 0.005;
        const rotate = `${-14 + (i % 29)}deg`;
        out.push({
          key: `${r}-${c}`,
          left: cx,
          top: cy,
          name: ICON_NAMES[i % ICON_NAMES.length],
          size,
          opacity,
          rotate,
        });
      }
    }
    return out;
  }, [width, height]);

  if (width <= 0 || height <= 0) return null;

  return (
    <View style={[styles.layer, { width, height }]} pointerEvents="none">
      {cells.map((cell) => (
        <View
          key={cell.key}
          style={[
            styles.iconAnchor,
            {
              left: cell.left - cell.size / 2,
              top: cell.top - cell.size / 2,
              opacity: cell.opacity,
              width: cell.size + 8,
              height: cell.size + 8,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={cell.name}
            size={cell.size}
            color={tint}
            style={{ transform: [{ rotate: cell.rotate }] }}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: 0,
    top: 0,
    overflow: 'hidden',
  },
  iconAnchor: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
