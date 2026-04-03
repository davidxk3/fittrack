import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors } from '../theme/colors';

type Props = {
  current: number;
  goal: number;
  unitLabel: string;
  accentColor: string;
  valueFormatter: (n: number) => string;
  detail?: string;
  size?: number;
  strokeWidth?: number;
};

export function RingMetricCompact({
  current,
  goal,
  unitLabel,
  accentColor,
  valueFormatter,
  detail,
  size = 156,
  strokeWidth = 9,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - strokeWidth / 2;
  const circ = 2 * Math.PI * r;
  const overGoal = goal > 0 && current > goal;
  const ratio = goal > 0 ? current / goal : 0;
  const progressFill = Math.min(1, ratio);
  const dashOffset = circ * (1 - progressFill);
  const pct = Math.round(ratio * 100);
  const ringStroke = overGoal ? colors.goalExceeded : accentColor;
  const footerAccent = overGoal ? colors.goalExceeded : colors.accent;

  return (
    <View style={styles.column}>
      <View style={[styles.ringOuter, { width: size, height: size }]}>
        <Svg width={size} height={size} style={styles.svg}>
          <G rotation={-90} originX={cx} originY={cy}>
            <Circle
              cx={cx}
              cy={cy}
              r={r}
              stroke={colors.ringTrackOnCard}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx={cx}
              cy={cy}
              r={r}
              stroke={ringStroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${circ}`}
              strokeDashoffset={dashOffset}
              fill="none"
            />
          </G>
        </Svg>
        <View style={styles.ringCenter} pointerEvents="none">
          <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
            {valueFormatter(current)}
          </Text>
          <Text style={[styles.unit, { color: footerAccent }]}>{unitLabel}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <MaterialCommunityIcons name="target" size={15} color={footerAccent} />
        <Text
          style={[styles.footerText, overGoal && styles.footerTextOver]}
        >
          {valueFormatter(goal)} ({pct}%)
        </Text>
      </View>
      {detail ? (
        <Text
          style={[styles.detail, overGoal && styles.detailOver]}
          numberOfLines={2}
        >
          {detail}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
    paddingHorizontal: 4,
  },
  ringOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  ringCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '88%',
  },
  value: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  unit: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  footerText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  footerTextOver: {
    color: colors.goalExceeded,
    fontWeight: '600',
  },
  detail: {
    marginTop: 6,
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
  },
  detailOver: {
    color: colors.goalExceeded,
  },
});
