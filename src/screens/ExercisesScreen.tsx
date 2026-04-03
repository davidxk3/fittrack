import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExerciseVolumeChart } from '../components/ExerciseVolumeChart';
import { ScreenBrandHeader } from '../components/ScreenBrandHeader';
import { colors } from '../theme/colors';

type MuscleGroup = { id: string; label: string; icon: keyof typeof Ionicons.glyphMap };

const MUSCLE_GROUPS: MuscleGroup[] = [
  { id: 'chest', label: 'Chest', icon: 'barbell-outline' },
  { id: 'back', label: 'Back', icon: 'fitness-outline' },
  { id: 'shoulders', label: 'Shoulders', icon: 'triangle-outline' },
  { id: 'arms', label: 'Arms', icon: 'hand-left-outline' },
  { id: 'legs', label: 'Legs', icon: 'walk-outline' },
  { id: 'core', label: 'Core', icon: 'ellipse-outline' },
];

type ExerciseItem = { id: string; name: string };

const BUILTIN_BY_GROUP: Record<string, ExerciseItem[]> = {
  chest: [
    { id: 'bp', name: 'Barbell bench press' },
    { id: 'db-press', name: 'Dumbbell bench press' },
    { id: 'inc-fly', name: 'Incline dumbbell fly' },
    { id: 'pushup', name: 'Push-ups' },
    { id: 'cable-x', name: 'Cable chest fly' },
  ],
  back: [
    { id: 'row', name: 'Bent-over row' },
    { id: 'pullup', name: 'Pull-ups' },
    { id: 'lat-pd', name: 'Lat pulldown' },
    { id: 'rdl', name: 'Romanian deadlift' },
    { id: 'face-pull', name: 'Face pull' },
  ],
  shoulders: [
    { id: 'ohp', name: 'Overhead press' },
    { id: 'lat-raise', name: 'Lateral raise' },
    { id: 'rear-fly', name: 'Rear delt fly' },
    { id: 'arnold', name: 'Arnold press' },
  ],
  arms: [
    { id: 'curl', name: 'Barbell curl' },
    { id: 'tri-push', name: 'Tricep pushdown' },
    { id: 'hammer', name: 'Hammer curl' },
    { id: 'skull', name: 'Skull crusher' },
  ],
  legs: [
    { id: 'squat', name: 'Back squat' },
    { id: 'lunge', name: 'Walking lunge' },
    { id: 'leg-press', name: 'Leg press' },
    { id: 'rdl-leg', name: 'RDL' },
    { id: 'calf', name: 'Calf raise' },
  ],
  core: [
    { id: 'plank', name: 'Plank' },
    { id: 'crunch', name: 'Cable crunch' },
    { id: 'wheel', name: 'Ab wheel rollout' },
    { id: 'pallof', name: 'Pallof press' },
  ],
};

type Nav =
  | { screen: 'groups' }
  | { screen: 'exercises'; group: MuscleGroup }
  | { screen: 'log'; group: MuscleGroup; exercise: ExerciseItem };

type SetRow = { id: string; reps: string; weight: string };

function newSetRow(): SetRow {
  return { id: `${Date.now()}-${Math.random()}`, reps: '', weight: '' };
}

/** Demo only — “completed today” until a real log exists */
type TodayEntry = {
  id: string;
  name: string;
  group: string;
  sets: number;
  detail: string;
  time: string;
};

const MOCK_TODAY_COMPLETED: TodayEntry[] = [
  {
    id: 't1',
    name: 'Back squat',
    group: 'Legs',
    sets: 4,
    detail: '4 sets · 8 reps',
    time: '8:42 AM',
  },
  {
    id: 't2',
    name: 'Barbell bench press',
    group: 'Chest',
    sets: 3,
    detail: '3 sets · 10 reps',
    time: '9:05 AM',
  },
  {
    id: 't3',
    name: 'Lat pulldown',
    group: 'Back',
    sets: 3,
    detail: '3 sets · 12 reps',
    time: '9:28 AM',
  },
];

/** Demo only — counts of distinct exercises finished per day */
const MOCK_COMPLETIONS_BY_DAY = [
  { label: 'Mon', value: 4 },
  { label: 'Tue', value: 6 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 7 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 8 },
  { label: 'Sun', value: 3 },
];

export function ExercisesScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [nav, setNav] = useState<Nav>({ screen: 'groups' });
  const [customByGroup, setCustomByGroup] = useState<
    Record<string, ExerciseItem[]>
  >({});
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [setRows, setSetRows] = useState<SetRow[]>([newSetRow()]);

  const exercisesForGroup = useCallback(
    (groupId: string): ExerciseItem[] => {
      const built = BUILTIN_BY_GROUP[groupId] ?? [];
      const custom = customByGroup[groupId] ?? [];
      return [...built, ...custom];
    },
    [customByGroup],
  );

  const openLog = (group: MuscleGroup, exercise: ExerciseItem) => {
    setSetRows([newSetRow()]);
    setNav({ screen: 'log', group, exercise });
  };

  const openAddModal = () => {
    setNewExerciseName('');
    setAddModalVisible(true);
  };

  const saveCustomExercise = () => {
    const name = newExerciseName.trim();
    if (!name || nav.screen !== 'exercises') {
      setAddModalVisible(false);
      return;
    }
    const gid = nav.group.id;
    const item: ExerciseItem = {
      id: `custom-${Date.now()}`,
      name,
    };
    setCustomByGroup((prev) => ({
      ...prev,
      [gid]: [...(prev[gid] ?? []), item],
    }));
    setAddModalVisible(false);
    setNewExerciseName('');
  };

  const addSet = () => setSetRows((rows) => [...rows, newSetRow()]);

  const removeSet = (id: string) => {
    setSetRows((rows) => (rows.length <= 1 ? rows : rows.filter((r) => r.id !== id)));
  };

  const updateSet = (id: string, field: 'reps' | 'weight', value: string) => {
    setSetRows((rows) =>
      rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const paddingBottom = tabBarHeight + 24;

  const listForExercises = useMemo(() => {
    if (nav.screen !== 'exercises') return [];
    return exercisesForGroup(nav.group.id);
  }, [nav, exercisesForGroup]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {nav.screen === 'groups' && (
        <ScrollView
          contentContainerStyle={[styles.scrollPad, { paddingBottom }]}
          showsVerticalScrollIndicator={false}
        >
          <ScreenBrandHeader style={{ paddingHorizontal: 0 }} tightBottom />
          <Text style={styles.pageTitle}>Workout</Text>
          <Text style={styles.pageSubtitle}>
            Plan sessions and review progress
          </Text>

          <Text style={styles.sectionHeading}>Current workout</Text>
          <View style={styles.panel}>
            <Text style={styles.panelMeta}>
              Completed today (frontend demo — not saved)
            </Text>
            {MOCK_TODAY_COMPLETED.map((row, index) => (
              <View
                key={row.id}
                style={[
                  styles.todayRow,
                  index === MOCK_TODAY_COMPLETED.length - 1 && styles.todayRowLast,
                ]}
              >
                <View style={styles.todayIcon}>
                  <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                </View>
                <View style={styles.todayBody}>
                  <Text style={styles.todayName}>{row.name}</Text>
                  <Text style={styles.todayMeta}>
                    {row.group} · {row.detail}
                  </Text>
                </View>
                <Text style={styles.todayTime}>{row.time}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionHeading}>Muscle groups</Text>
          <Text style={styles.gridLead}>Choose a muscle group</Text>
          <View style={styles.groupGrid}>
            {MUSCLE_GROUPS.map((g) => (
              <Pressable
                key={g.id}
                style={({ pressed }) => [
                  styles.groupCard,
                  pressed && styles.pressed,
                ]}
                onPress={() => setNav({ screen: 'exercises', group: g })}
              >
                <Ionicons name={g.icon} size={28} color={colors.accent} />
                <Text style={styles.groupLabel}>{g.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionHeading}>Completed over time</Text>
          <View style={styles.panel}>
            <ExerciseVolumeChart
              data={MOCK_COMPLETIONS_BY_DAY}
              subtitle="Exercises finished per day (sample week — demo data only)."
            />
          </View>
        </ScrollView>
      )}

      {nav.screen === 'exercises' && (
        <View style={styles.flex}>
          <View style={styles.topBar}>
            <Pressable
              style={styles.backBtn}
              onPress={() => setNav({ screen: 'groups' })}
            >
              <Ionicons name="chevron-back" size={24} color={colors.accent} />
            </Pressable>
            <Text style={styles.topTitle} numberOfLines={1}>
              {nav.group.label}
            </Text>
            <View style={styles.backBtnPlaceholder} />
          </View>
          <FlatList
            data={listForExercises}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom }}
            ListHeaderComponent={
              <Text style={styles.listHint}>Common exercises · add your own</Text>
            }
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.exerciseRow,
                  pressed && styles.pressed,
                ]}
                onPress={() => openLog(nav.group, item)}
              >
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.sage}
                />
              </Pressable>
            )}
            ListFooterComponent={
              <Pressable
                style={({ pressed }) => [
                  styles.addExerciseCard,
                  pressed && styles.pressed,
                ]}
                onPress={openAddModal}
              >
                <Ionicons name="add-circle-outline" size={26} color={colors.accent} />
                <Text style={styles.addExerciseText}>Add your own exercise</Text>
              </Pressable>
            }
          />
        </View>
      )}

      {nav.screen === 'log' && (
        <ScrollView
          contentContainerStyle={[styles.scrollPad, { paddingBottom }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable
              style={styles.backBtn}
              onPress={() => setNav({ screen: 'exercises', group: nav.group })}
            >
              <Ionicons name="chevron-back" size={24} color={colors.accent} />
            </Pressable>
            <Text style={styles.topTitle} numberOfLines={2}>
              {nav.exercise.name}
            </Text>
            <View style={styles.backBtnPlaceholder} />
          </View>
          <Text style={styles.logSubtitle}>
            Sets, reps, and optional weight per set (UI only).
          </Text>

          {setRows.map((row, index) => (
            <View key={row.id} style={styles.setCard}>
              <View style={styles.setHeader}>
                <Text style={styles.setTitle}>Set {index + 1}</Text>
                {setRows.length > 1 ? (
                  <Pressable
                    hitSlop={8}
                    onPress={() => removeSet(row.id)}
                  >
                    <Ionicons name="close-circle-outline" size={22} color={colors.sage} />
                  </Pressable>
                ) : (
                  <View style={{ width: 22 }} />
                )}
              </View>
              <Text style={styles.fieldLabel}>Reps</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 10"
                placeholderTextColor={colors.sage}
                keyboardType="number-pad"
                value={row.reps}
                onChangeText={(t) => updateSet(row.id, 'reps', t)}
              />
              <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>
                Weight (optional)
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 135 lbs"
                placeholderTextColor={colors.sage}
                value={row.weight}
                onChangeText={(t) => updateSet(row.id, 'weight', t)}
              />
            </View>
          ))}

          <Pressable
            style={({ pressed }) => [styles.addSetBtn, pressed && styles.pressed]}
            onPress={addSet}
          >
            <Ionicons name="add" size={22} color={colors.background} />
            <Text style={styles.addSetBtnText}>Add set</Text>
          </Pressable>
        </ScrollView>
      )}

      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setAddModalVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>New exercise</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Exercise name"
              placeholderTextColor={colors.sage}
              value={newExerciseName}
              onChangeText={setNewExerciseName}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancel}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalSave} onPress={saveCustomExercise}>
                <Text style={styles.modalSaveText}>Add</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollPad: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.accent,
  },
  pageSubtitle: {
    fontSize: 15,
    color: colors.sage,
    marginTop: 6,
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.sage,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 16,
    marginBottom: 10,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  panelMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
  },
  todayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  todayRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 4,
  },
  todayIcon: {
    marginRight: 12,
  },
  todayBody: {
    flex: 1,
    minWidth: 0,
  },
  todayName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  todayMeta: {
    marginTop: 3,
    fontSize: 13,
    color: colors.textMuted,
  },
  todayTime: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.sage,
    marginLeft: 8,
  },
  gridLead: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: 14,
  },
  groupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  groupCard: {
    width: '47%',
    flexGrow: 1,
    minWidth: 140,
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  groupLabel: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  pressed: {
    opacity: 0.88,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
  },
  backBtn: {
    padding: 8,
    width: 44,
  },
  backBtnPlaceholder: {
    width: 44,
  },
  topTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  listHint: {
    fontSize: 13,
    color: colors.textMuted,
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 4,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  exerciseName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    paddingRight: 8,
  },
  addExerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accent,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(185, 156, 124, 0.08)',
  },
  addExerciseText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  logSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  setCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  setTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.accent,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.sage,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  fieldLabelSpaced: {
    marginTop: 12,
  },
  input: {
    marginTop: 6,
    backgroundColor: 'rgba(31, 34, 43, 0.45)',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingVertical: 14,
    backgroundColor: colors.accent,
    borderRadius: 18,
  },
  addSetBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  modalInput: {
    backgroundColor: 'rgba(31, 34, 43, 0.45)',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 20,
  },
  modalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: colors.sage,
    fontWeight: '600',
  },
  modalSave: {
    backgroundColor: colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
});
