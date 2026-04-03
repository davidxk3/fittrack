import { useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { colors } from '../theme/colors';

export type ChartPoint = { label: string; value: number };

type Props = {
  data: ChartPoint[];
  subtitle?: string;
};

export function ExerciseVolumeChart({ data, subtitle }: Props) {
  const { width: winW } = useWindowDimensions();
  const chartW = Math.min(Math.max(winW - 48, 280), 400);
  const chartH = 128;
  const padX = 8;
  const padY = 14;
  const innerW = chartW - padX * 2;
  const innerH = chartH - padY * 2;
  const maxV = Math.max(...data.map((d) => d.value), 1);

  const pts = useMemo(() => {
    const n = data.length;
    return data.map((d, i) => {
      const x =
        padX +
        (n <= 1 ? innerW / 2 : (i / Math.max(n - 1, 1)) * innerW);
      const y = padY + innerH - (d.value / maxV) * innerH;
      return { x, y, label: d.label, value: d.value };
    });
  }, [data, innerW, innerH, maxV, padX, padY]);

  const polyPoints = pts.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View style={styles.wrap}>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={[styles.chartBox, { width: chartW }]}>
        <Svg width={chartW} height={chartH}>
          {[0, 0.5, 1].map((t) => {
            const y = padY + innerH * (1 - t);
            return (
              <Line
                key={t}
                x1={padX}
                y1={y}
                x2={padX + innerW}
                y2={y}
                stroke={colors.border}
                strokeWidth={StyleSheet.hairlineWidth}
                opacity={0.8}
              />
            );
          })}
          <Line
            x1={padX}
            y1={padY + innerH}
            x2={padX + innerW}
            y2={padY + innerH}
            stroke={colors.sage}
            strokeOpacity={0.35}
            strokeWidth={1}
          />
          <Polyline
            points={polyPoints}
            fill="none"
            stroke={colors.accent}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {pts.map((p, i) => (
            <Circle
              key={`${p.label}-${i}`}
              cx={p.x}
              cy={p.y}
              r={5}
              fill={colors.accent}
              stroke={colors.background}
              strokeWidth={2}
            />
          ))}
        </Svg>
        <View style={[styles.labelRow, { width: chartW }]}>
          {data.map((d) => (
            <Text key={d.label} style={styles.axisLabel} numberOfLines={1}>
              {d.label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  subtitle: {
    alignSelf: 'flex-start',
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 10,
    lineHeight: 16,
  },
  chartBox: {
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  axisLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
    color: colors.sage,
    textAlign: 'center',
  },
});
