import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';
import { colors } from '../theme/colors';

const RING_SIZE = 276;
const STROKE = 14;
const CX = RING_SIZE / 2;
const CY = RING_SIZE / 2;
const R = RING_SIZE / 2 - STROKE / 2;
const CIRC = 2 * Math.PI * R;

type Props = {
  current: number;
  goal: number;
  unitLabel: string;
  gradientColors: readonly [string, string, ...string[]];
  bottomInset: number;
  valueFormatter: (n: number) => string;
  /** Use inside ScrollView with fixed-height wrapper; skips full-screen safe area. */
  embedded?: boolean;
  /** Rendered below the goal row (e.g. “Breakdown” link). */
  belowFooter?: ReactNode;
};

export function RingMetricHero({
  current,
  goal,
  unitLabel,
  gradientColors,
  bottomInset,
  valueFormatter,
  embedded = false,
  belowFooter,
}: Props) {
  const overGoal = goal > 0 && current > goal;
  const ratio = goal > 0 ? current / goal : 0;
  const progressFill = Math.min(1, ratio);
  const pct = Math.round(ratio * 100);
  const dashOffset = CIRC * (1 - progressFill);
  const accentColor = overGoal ? colors.goalExceeded : colors.accent;
  const ringProgressColor = overGoal ? colors.goalExceeded : colors.ringProgress;

  const bottomPad = embedded ? 20 : bottomInset + 20;
  const body = (
    <View style={[styles.content, { paddingBottom: bottomPad }]}>
          <View style={styles.ringWrap}>
            <Svg width={RING_SIZE} height={RING_SIZE} style={styles.svg}>
              <G rotation={-90} originX={CX} originY={CY}>
                <Circle
                  cx={CX}
                  cy={CY}
                  r={R}
                  stroke={colors.ringTrack}
                  strokeWidth={STROKE}
                  fill="none"
                />
                <Circle
                  cx={CX}
                  cy={CY}
                  r={R}
                  stroke={ringProgressColor}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray={`${CIRC}`}
                  strokeDashoffset={dashOffset}
                  fill="none"
                />
              </G>
            </Svg>
            <View style={styles.ringCenter} pointerEvents="none">
              <Text style={styles.value}>{valueFormatter(current)}</Text>
              <Text style={[styles.unit, { color: accentColor }]}>
                {unitLabel}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <MaterialCommunityIcons
              name="target"
              size={22}
              color={accentColor}
            />
            <Text
              style={[
                styles.footerText,
                styles.footerTextAfterIcon,
                overGoal && styles.footerTextOver,
              ]}
            >
              {valueFormatter(goal)} ({pct}%)
            </Text>
          </View>
          {belowFooter ? (
            <View style={styles.belowFooter}>{belowFooter}</View>
          ) : null}
        </View>
  );

  if (embedded) {
    return (
      <LinearGradient colors={[...gradientColors]} style={styles.gradientEmbedded}>
        {body}
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[...gradientColors]} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {body}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  gradientEmbedded: {
    flex: 1,
    width: '100%',
    minHeight: 400,
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  ringCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 52,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -1,
  },
  unit: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 36,
  },
  footerText: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.textMuted,
  },
  footerTextAfterIcon: {
    marginLeft: 10,
  },
  footerTextOver: {
    color: colors.goalExceeded,
    fontWeight: '600',
  },
  belowFooter: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
});
