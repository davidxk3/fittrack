import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RingMetricHero } from '../components/RingMetricHero';
import { ScreenBrandHeader } from '../components/ScreenBrandHeader';
import { useStepsDay } from '../steps/StepsDayContext';
import { colors } from '../theme/colors';

const HERO_BLOCK_HEIGHT = 440;
const STEP_GOAL_PRESETS = [8_000, 10_000, 12_000, 15_000] as const;
const MAX_STEP_GOAL = 100_000;

/** Rough steps→miles heuristic for demo only */
function milesFromSteps(steps: number): number {
  return Math.round(steps * 0.00045 * 10) / 10;
}

function formatSteps(n: number): string {
  return n.toLocaleString('en-US');
}

type MiniStatProps = { label: string; value: string; hint?: string };

function MiniStat({ label, value, hint }: MiniStatProps) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatLabel}>{label}</Text>
      <Text style={styles.miniStatValue}>{value}</Text>
      {hint ? <Text style={styles.miniStatHint}>{hint}</Text> : null}
    </View>
  );
}

export function StepsTabScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { stepsToday, dailyStepGoal, setDailyStepGoal } = useStepsDay();
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [draftGoal, setDraftGoal] = useState(String(dailyStepGoal));
  const [goalError, setGoalError] = useState<string | null>(null);

  const distanceMi = useMemo(() => milesFromSteps(stepsToday), [stepsToday]);
  const activeMinutes = 52;
  const activeTimeLabel =
    activeMinutes >= 60
      ? `${Math.floor(activeMinutes / 60)}h ${activeMinutes % 60}m`
      : `${activeMinutes} min`;

  const closeGoalModal = () => {
    setGoalModalVisible(false);
    setGoalError(null);
  };

  const openGoalModal = () => {
    setDraftGoal(String(dailyStepGoal));
    setGoalError(null);
    setGoalModalVisible(true);
  };

  const saveGoal = () => {
    const parsed = parseInt(draftGoal.replace(/,/g, '').trim(), 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
      setGoalError('Enter a positive number');
      return;
    }
    if (parsed > MAX_STEP_GOAL) {
      setGoalError(`Maximum ${formatSteps(MAX_STEP_GOAL)} steps`);
      return;
    }
    setDailyStepGoal(parsed);
    closeGoalModal();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenBrandHeader tightBottom />
        <View style={styles.heroSlot}>
          <RingMetricHero
            current={stepsToday}
            goal={dailyStepGoal}
            unitLabel="STEPS"
            gradientColors={colors.heroSteps}
            bottomInset={0}
            valueFormatter={formatSteps}
            embedded
          />
        </View>

        <View style={styles.goalBar}>
          <View style={styles.goalBarText}>
            <Text style={styles.goalBarTitle}>Daily goal</Text>
            <Text style={styles.goalBarSubtitle}>
              {formatSteps(dailyStepGoal)} steps
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.goalsButton,
              pressed && styles.goalsButtonPressed,
            ]}
            onPress={openGoalModal}
          >
            <Ionicons name="flag-outline" size={18} color={colors.background} />
            <Text style={styles.goalsButtonLabel}>Goals</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionHeading}>Today</Text>
        <View style={styles.statsRow}>
          <MiniStat
            label="Distance"
            value={`${distanceMi.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 1,
            })} mi`}
            hint="Approx. from steps"
          />
          <View style={styles.statsDivider} />
          <MiniStat
            label="Active time"
            value={activeTimeLabel}
            hint="Time spent moving"
          />
        </View>

        <Text style={styles.note}>
          Distance and active time are placeholders. Steps use en-US number
          grouping (e.g. {formatSteps(10000)}).
        </Text>
      </ScrollView>

      <Modal
        visible={goalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeGoalModal}
      >
        <View style={styles.goalModalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeGoalModal}
            accessibilityLabel="Close goal dialog"
          />
          <View style={styles.goalModalCard}>
            <Text style={styles.goalModalTitle}>Daily step goal</Text>
            <Text style={styles.goalModalHint}>
              How many steps you want to reach each day.
            </Text>
            <TextInput
              style={styles.goalModalInput}
              value={draftGoal}
              onChangeText={(t) => {
                setDraftGoal(t);
                setGoalError(null);
              }}
              keyboardType="number-pad"
              placeholder={formatSteps(10_000)}
              placeholderTextColor={colors.sage}
              selectTextOnFocus
            />
            {goalError ? (
              <Text style={styles.goalModalError}>{goalError}</Text>
            ) : null}
            <Text style={styles.goalModalPresetsLabel}>Quick picks</Text>
            <View style={styles.goalModalPresets}>
              {STEP_GOAL_PRESETS.map((n) => {
                const draftN = parseInt(
                  draftGoal.replace(/,/g, '').trim(),
                  10,
                );
                const chipMatchesDraft =
                  Number.isFinite(draftN) && draftN === n;
                return (
                  <Pressable
                    key={n}
                    style={({ pressed }) => [
                      styles.goalPresetChip,
                      chipMatchesDraft && styles.goalPresetChipActive,
                      pressed && styles.goalPresetChipPressed,
                    ]}
                    onPress={() => {
                      setDraftGoal(String(n));
                      setGoalError(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.goalPresetChipText,
                        chipMatchesDraft && styles.goalPresetChipTextActive,
                      ]}
                    >
                      {formatSteps(n)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.goalModalActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.goalModalBtnCancel,
                  pressed && styles.goalModalBtnPressed,
                ]}
                onPress={closeGoalModal}
              >
                <Text style={styles.goalModalBtnCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.goalModalBtnSave,
                  pressed && styles.goalModalBtnPressed,
                ]}
                onPress={saveGoal}
              >
                <Text style={styles.goalModalBtnSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSlot: {
    height: HERO_BLOCK_HEIGHT,
    width: '100%',
  },
  goalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  goalBarText: {
    flex: 1,
    marginRight: 12,
  },
  goalBarTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.sage,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalBarSubtitle: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  goalsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 18,
  },
  goalsButtonPressed: {
    opacity: 0.9,
  },
  goalsButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.background,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.sage,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  miniStat: {
    flex: 1,
    paddingHorizontal: 6,
  },
  miniStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.sage,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  miniStatValue: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  miniStatHint: {
    marginTop: 6,
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 14,
  },
  statsDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  note: {
    marginTop: 16,
    marginHorizontal: 24,
    fontSize: 11,
    color: colors.sage,
    textAlign: 'center',
    lineHeight: 16,
  },
  goalModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  goalModalCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  goalModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  goalModalHint: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  goalModalInput: {
    marginTop: 18,
    backgroundColor: 'rgba(31, 34, 43, 0.35)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  goalModalError: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    color: colors.goalExceeded,
  },
  goalModalPresetsLabel: {
    marginTop: 18,
    fontSize: 12,
    fontWeight: '600',
    color: colors.sage,
    textTransform: 'uppercase',
    letterSpacing: 0.45,
  },
  goalModalPresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  goalPresetChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: 'rgba(31, 34, 43, 0.25)',
  },
  goalPresetChipActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(185, 156, 124, 0.18)',
  },
  goalPresetChipPressed: {
    opacity: 0.88,
  },
  goalPresetChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  goalPresetChipTextActive: {
    color: colors.accent,
  },
  goalModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 22,
  },
  goalModalBtnCancel: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  goalModalBtnCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.sage,
  },
  goalModalBtnSave: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 14,
    backgroundColor: colors.accent,
  },
  goalModalBtnSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  goalModalBtnPressed: {
    opacity: 0.9,
  },
});
