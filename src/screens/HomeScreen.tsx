import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  DAILY_CALORIE_GOAL,
  useCaloriesDay,
} from '../calories/CaloriesDayContext';
import { RingMetricCompact } from '../components/RingMetricCompact';
import { ScreenBrandHeader } from '../components/ScreenBrandHeader';
import { useStepsDay } from '../steps/StepsDayContext';
import type { RootTabParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type HomeNav = BottomTabNavigationProp<RootTabParamList, 'Home'>;

const MEALS = [
  { id: '1', name: 'Breakfast', items: 'Oatmeal, berries, coffee' },
  { id: '2', name: 'Lunch', items: 'Chicken bowl, greens' },
  { id: '3', name: 'Dinner', items: 'Salmon, rice, broccoli' },
];
const SNACKS = [
  { id: 's1', name: 'Greek yogurt' },
  { id: 's2', name: 'Apple + almond butter' },
];
function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function MacroPill({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <View style={styles.macroPill}>
      <Text style={styles.macroValue}>
        {value}
        {unit}
      </Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const tabBarHeight = useBottomTabBarHeight();
  const { caloriesEaten, macrosToday } = useCaloriesDay();
  const { stepsToday, dailyStepGoal } = useStepsDay();
  const caloriesRemaining = Math.max(0, DAILY_CALORIE_GOAL - caloriesEaten);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenBrandHeader style={{ paddingHorizontal: 0 }} />

        <Text style={styles.sectionHeading}>Calories & steps</Text>
        <SectionCard>
          <View style={styles.ringsRow}>
            <Pressable
              style={({ pressed }) => [
                styles.ringPressable,
                pressed && styles.ringPressablePressed,
              ]}
              onPress={() =>
                navigation.navigate({
                  name: 'Calories',
                  params: { screen: 'CaloriesMain' },
                })
              }
              accessibilityRole="button"
              accessibilityLabel="Open calories"
            >
              <RingMetricCompact
                current={caloriesEaten}
                goal={DAILY_CALORIE_GOAL}
                unitLabel="CALORIES"
                accentColor={colors.accent}
                valueFormatter={(n) => n.toLocaleString('en-US')}
                detail={`${caloriesRemaining.toLocaleString('en-US')} remaining`}
              />
            </Pressable>
            <View style={styles.ringsDivider} />
            <Pressable
              style={({ pressed }) => [
                styles.ringPressable,
                pressed && styles.ringPressablePressed,
              ]}
              onPress={() =>
                navigation.navigate({ name: 'Steps', params: undefined })
              }
              accessibilityRole="button"
              accessibilityLabel="Open steps"
            >
              <RingMetricCompact
                current={stepsToday}
                goal={dailyStepGoal}
                unitLabel="STEPS"
                accentColor={colors.accent}
                valueFormatter={(n) => n.toLocaleString('en-US')}
              />
            </Pressable>
          </View>
        </SectionCard>

        <Text style={styles.sectionHeading}>Nutrition</Text>
        <SectionCard>
          <Text style={styles.cardSubtitle}>Carbs · Protein · Fat</Text>
          <View style={styles.macroRow}>
            <MacroPill label="Carbs" value={macrosToday.carbsG} unit="g" />
            <MacroPill label="Protein" value={macrosToday.proteinG} unit="g" />
            <MacroPill label="Fat" value={macrosToday.fatG} unit="g" />
          </View>
        </SectionCard>

        <Pressable
          onPress={() =>
            navigation.navigate({
              name: 'Calories',
              params: { screen: 'CalorieBreakdown' },
            })
          }
          style={({ pressed }) => [
            styles.mealsPressable,
            pressed && styles.mealsPressablePressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Open meal calorie breakdown"
        >
          <Text style={styles.sectionHeading}>Meals</Text>
          <SectionCard>
            {MEALS.map((meal, index) => (
              <View
                key={meal.id}
                style={[
                  styles.mealRow,
                  index === MEALS.length - 1 && styles.mealRowLast,
                ]}
              >
                <View style={styles.mealDot} />
                <View style={styles.mealTextWrap}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealItems}>{meal.items}</Text>
                </View>
              </View>
            ))}
          </SectionCard>
        </Pressable>

        <Text style={styles.sectionHeading}>Snacks</Text>
        <SectionCard>
          {SNACKS.map((snack) => (
            <View key={snack.id} style={styles.snackRow}>
              <Text style={styles.snackBullet}>·</Text>
              <Text style={styles.snackName}>{snack.name}</Text>
            </View>
          ))}
        </SectionCard>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.sage,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  ringsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  ringsDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
    marginHorizontal: 6,
  },
  ringPressable: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 16,
  },
  ringPressablePressed: {
    opacity: 0.85,
  },
  mealsPressable: {
    borderRadius: 4,
  },
  mealsPressablePressed: {
    opacity: 0.92,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 14,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  macroPill: {
    flex: 1,
    backgroundColor: 'rgba(31, 34, 43, 0.35)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  macroLabel: {
    fontSize: 11,
    color: colors.sage,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  mealRowLast: {
    borderBottomWidth: 0,
  },
  mealDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginTop: 6,
    marginRight: 12,
  },
  mealTextWrap: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  mealItems: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  snackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  snackBullet: {
    fontSize: 20,
    color: colors.sage,
    marginRight: 10,
    lineHeight: 22,
  },
  snackName: {
    fontSize: 15,
    color: colors.textMuted,
  },
});
