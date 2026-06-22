import { memo, useCallback, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { brand, fontSize, spacing } from '@/theme/tokens';
import {
  ZIP_SNAKE_BODY,
  ZIP_SNAKE_ERR,
  ZIP_SNAKE_HEAD,
  buildZipPathStepMap,
  buildZipSnakeJoints,
  buildZipSnakeSegments,
  zipSnakeHeadSize,
} from '@/components/daily-challenge/zipSnakeRender';

const ANDROID_SNAKE_PERF = Platform.OS === 'android';

type ZipGridData = {
  rows: number;
  cols: number;
  cells: number[];
  wallsHorizontal: number[];
  wallsVertical: number[];
};

type Props = {
  zip: ZipGridData;
  zipOrder: number[];
  cellSize: number;
  zipPathError: boolean;
  zipGridV2PrefixIssue: 'order' | 'path' | null;
  zipHintHighlightIdx: number | null;
  zipSnakeStarted: boolean;
  isRTL: boolean;
  orderErrorLabel: string;
  pathErrorLabel: string;
  onCellTap: (cellIdx: number) => void;
  onCellDrag: (cellIdx: number) => void;
  startOverlay?: React.ReactNode;
};

type ZipCellProps = {
  cellSize: number;
  value: number;
  wallR: boolean;
  wallB: boolean;
  onPath: boolean;
  pathError: boolean;
  stepLabel?: number;
  hint: boolean;
};

const ZipGridCell = memo(function ZipGridCell({
  cellSize,
  value,
  wallR,
  wallB,
  onPath,
  pathError,
  stepLabel,
  hint,
}: ZipCellProps) {
  return (
    <View
      style={[
        styles.zipGridCell,
        { width: cellSize, height: cellSize },
        onPath && (pathError ? styles.zipGridCellPathErr : styles.zipGridCellPath),
        hint && styles.zipGridCellHint,
        wallR && styles.zipGridWallR,
        wallB && styles.zipGridWallB,
      ]}>
      {value > 0 ? (
        <Text style={[styles.zipGridNum, onPath && styles.zipGridGlyphOnSnake]}>{value}</Text>
      ) : (
        <Text style={[styles.zipGridDot, onPath && styles.zipGridGlyphOnSnake]}>·</Text>
      )}
      {stepLabel != null ? (
        <Text
          style={[
            styles.zipGridStep,
            pathError && styles.zipGridStepErr,
            onPath && styles.zipGridGlyphOnSnake,
          ]}>
          {stepLabel}
        </Text>
      ) : null}
    </View>
  );
});

export const ZipSnakeGrid = memo(function ZipSnakeGrid({
  zip,
  zipOrder,
  cellSize,
  zipPathError,
  zipGridV2PrefixIssue,
  zipHintHighlightIdx,
  zipSnakeStarted,
  isRTL,
  orderErrorLabel,
  pathErrorLabel,
  onCellTap,
  onCellDrag,
  startOverlay,
}: Props) {
  const { rows, cols, cells, wallsHorizontal: wh, wallsVertical: wv } = zip;
  const lastDragCellSv = useSharedValue(-1);

  const pathPos = useMemo(() => buildZipPathStepMap(zipOrder), [zipOrder]);
  const snakeSegs = useMemo(() => buildZipSnakeSegments(zipOrder, cols, cellSize), [zipOrder, cols, cellSize]);
  const snakeJoints = useMemo(() => buildZipSnakeJoints(zipOrder, cols, cellSize), [zipOrder, cols, cellSize]);
  const snakeColor = zipPathError ? ZIP_SNAKE_ERR : ZIP_SNAKE_BODY;

  const lastIdx = zipOrder.length > 0 ? zipOrder[zipOrder.length - 1]! : null;
  const lastRow = lastIdx != null ? Math.floor(lastIdx / cols) : 0;
  const lastCol = lastIdx != null ? lastIdx % cols : 0;
  const headSz = zipSnakeHeadSize(cellSize);
  const headLeft = lastIdx != null ? lastCol * cellSize + cellSize / 2 - headSz / 2 : 0;
  const headTop = lastIdx != null ? lastRow * cellSize + cellSize / 2 - headSz / 2 : 0;

  const handleBegin = useCallback(
    (idx: number) => {
      onCellTap(idx);
    },
    [onCellTap],
  );

  const handleDrag = useCallback(
    (idx: number) => {
      onCellDrag(idx);
    },
    [onCellDrag],
  );

  const handleFinalize = useCallback(() => {
    lastDragCellSv.value = -1;
  }, [lastDragCellSv]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(zipSnakeStarted)
        .minDistance(0)
        .activeOffsetX([-1, 1])
        .activeOffsetY([-1, 1])
        .onBegin((e) => {
          'worklet';
          const col = Math.floor(e.x / cellSize);
          const row = Math.floor(e.y / cellSize);
          if (row < 0 || col < 0 || row >= rows || col >= cols) {
            lastDragCellSv.value = -1;
            return;
          }
          const idx = row * cols + col;
          lastDragCellSv.value = idx;
          runOnJS(handleBegin)(idx);
        })
        .onUpdate((e) => {
          'worklet';
          const col = Math.floor(e.x / cellSize);
          const row = Math.floor(e.y / cellSize);
          if (row < 0 || col < 0 || row >= rows || col >= cols) return;
          const idx = row * cols + col;
          if (idx === lastDragCellSv.value) return;
          lastDragCellSv.value = idx;
          runOnJS(handleDrag)(idx);
        })
        .onFinalize(() => {
          'worklet';
          lastDragCellSv.value = -1;
          runOnJS(handleFinalize)();
        }),
    [zipSnakeStarted, cellSize, rows, cols, handleBegin, handleDrag, handleFinalize, lastDragCellSv],
  );

  const cellRows = useMemo(() => {
    return Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => {
        const idx = r * cols + c;
        return {
          idx,
          value: cells[idx] ?? 0,
          wallR: c < cols - 1 && (wv[r * (cols - 1) + c] ?? 0) === 1,
          wallB: r < rows - 1 && (wh[r * cols + c] ?? 0) === 1,
          onPath: pathPos.has(idx),
          stepLabel: pathPos.get(idx),
          hint: zipHintHighlightIdx === idx,
        };
      }),
    );
  }, [rows, cols, cells, wh, wv, pathPos, zipHintHighlightIdx]);

  return (
    <>
      <GestureDetector gesture={panGesture}>
        <View
          style={[
            styles.zipGridFrame,
            { width: cols * cellSize, height: rows * cellSize },
            zipPathError && styles.zipGridFrameErr,
          ]}
          collapsable={false}
          renderToHardwareTextureAndroid={ANDROID_SNAKE_PERF}>
          <View style={styles.zipSnakeUnderlay} pointerEvents="none">
            {snakeSegs.map((s) => (
              <View
                key={s.key}
                style={[
                  styles.zipSnakeSegment,
                  ANDROID_SNAKE_PERF && styles.zipSnakeSegmentAndroid,
                  {
                    left: s.left,
                    top: s.top,
                    width: s.width,
                    height: s.height,
                    borderRadius: s.height / 2,
                    backgroundColor: snakeColor,
                    transform: [{ rotate: `${s.angleDeg}deg` }],
                  },
                ]}
              />
            ))}
            {snakeJoints.map((j) => (
              <View
                key={j.key}
                style={[
                  styles.zipSnakeJoint,
                  ANDROID_SNAKE_PERF && styles.zipSnakeJointAndroid,
                  {
                    left: j.left,
                    top: j.top,
                    width: j.size,
                    height: j.size,
                    borderRadius: j.size / 2,
                    backgroundColor: snakeColor,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.zipGridCellsLayer} pointerEvents="none">
            {cellRows.map((row, r) => (
              <View key={`zip-row-${r}`} style={styles.zipGridRow}>
                {row.map((cell) => (
                  <ZipGridCell
                    key={`zip-cell-${cell.idx}`}
                    cellSize={cellSize}
                    value={cell.value}
                    wallR={cell.wallR}
                    wallB={cell.wallB}
                    onPath={cell.onPath}
                    pathError={zipPathError}
                    stepLabel={cell.stepLabel}
                    hint={cell.hint}
                  />
                ))}
              </View>
            ))}
          </View>
          {lastIdx != null ? (
            <View style={styles.zipSnakeHeadLayer} pointerEvents="none">
              <View
                style={[
                  styles.zipSnakeHead,
                  ANDROID_SNAKE_PERF && styles.zipSnakeHeadAndroid,
                  {
                    left: headLeft,
                    top: headTop,
                    width: headSz,
                    height: headSz,
                    borderRadius: headSz / 2,
                    backgroundColor: zipPathError ? '#fecaca' : ZIP_SNAKE_HEAD,
                    borderWidth: 2.5,
                    borderColor: zipPathError ? ZIP_SNAKE_ERR : '#dbeafe',
                  },
                ]}
              />
            </View>
          ) : null}
          {!zipSnakeStarted && startOverlay ? (
            <View style={styles.zipStartOverlay}>{startOverlay}</View>
          ) : null}
        </View>
      </GestureDetector>
      {zipPathError ? (
        <Text style={[styles.zipGridErrorBanner, isRTL && styles.rtl]}>
          {zipGridV2PrefixIssue === 'order' ? orderErrorLabel : pathErrorLabel}
        </Text>
      ) : null}
    </>
  );
});

const styles = StyleSheet.create({
  zipGridFrame: { marginTop: spacing.md, alignSelf: 'center', position: 'relative' },
  zipGridFrameErr: { borderWidth: 2, borderColor: '#dc2626' },
  zipGridRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  zipGridCell: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  zipGridCellsLayer: { zIndex: 1 },
  zipSnakeUnderlay: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
  zipSnakeSegment: {
    position: 'absolute',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.42,
    shadowRadius: 3,
    elevation: 3,
  },
  zipSnakeSegmentAndroid: {
    shadowOpacity: 0,
    elevation: 0,
  },
  zipSnakeJoint: {
    position: 'absolute',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.38,
    shadowRadius: 2,
    elevation: 3,
  },
  zipSnakeJointAndroid: {
    shadowOpacity: 0,
    elevation: 0,
  },
  zipSnakeHeadLayer: { ...StyleSheet.absoluteFillObject, zIndex: 2 },
  zipSnakeHead: {
    position: 'absolute',
    shadowColor: '#172554',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  zipSnakeHeadAndroid: {
    shadowOpacity: 0,
    elevation: 0,
  },
  zipGridCellPath: {
    backgroundColor: 'rgba(248, 250, 252, 0.38)',
    borderColor: brand.primary,
    borderWidth: StyleSheet.hairlineWidth,
  },
  zipGridGlyphOnSnake: {
    textShadowColor: 'rgba(255, 255, 255, 0.92)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  zipGridCellPathErr: {
    backgroundColor: 'rgba(254, 242, 242, 0.5)',
    borderColor: '#dc2626',
    borderWidth: StyleSheet.hairlineWidth,
  },
  zipGridCellHint: {
    borderWidth: 3,
    borderColor: '#f59e0b',
    shadowColor: '#f59e0b',
    shadowOpacity: 0.55,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  zipGridWallR: { borderRightWidth: 4, borderRightColor: '#0f172a' },
  zipGridWallB: { borderBottomWidth: 4, borderBottomColor: '#0f172a' },
  zipGridNum: { fontSize: fontSize.xl, fontWeight: '800', color: brand.text },
  zipGridDot: { fontSize: fontSize.md, color: brand.textMuted },
  zipGridStep: {
    position: 'absolute',
    bottom: 2,
    right: 3,
    fontSize: 10,
    fontWeight: '700',
    color: brand.primary,
  },
  zipGridStepErr: { color: '#b91c1c' },
  zipGridErrorBanner: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#b91c1c',
    textAlign: 'center',
  },
  zipStartOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.72)',
  },
  rtl: { writingDirection: 'rtl', textAlign: 'right' },
});
