import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCaloriesDay } from '../calories/CaloriesDayContext';
import { ScreenBrandHeader } from '../components/ScreenBrandHeader';
import { colors } from '../theme/colors';
import type { CaloriesStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<CaloriesStackParamList, 'CalorieBreakdown'>;

export function CalorieBreakdownScreen() {
  const navigation = useNavigation<Nav>();
  const { entries, removeEntry } = useCaloriesDay();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          onPress={() => navigation.goBack()}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={26} color={colors.accent} />
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>
      </View>
      <ScreenBrandHeader tightBottom />
      <Text style={styles.title}>Breakdown</Text>
      <Text style={styles.subtitle}>
        Foods logged today — remove an item to subtract it from your totals.
      </Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {entries.length === 0 ? (
          <Text style={styles.empty}>No foods logged yet today.</Text>
        ) : (
          entries.map((item) => (
            <View key={item.id} style={styles.row}>
              <View style={styles.rowBody}>
                <Text style={styles.rowName}>{item.name}</Text>
                <Text style={styles.rowMacros}>
                  {item.calories.toLocaleString('en-US')} cal · {item.carbsG}g C ·{' '}
                  {item.proteinG}g P · {item.fatG}g F
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.minusBtn,
                  pressed && styles.pressed,
                ]}
                onPress={() => removeEntry(item.id)}
                accessibilityLabel={`Remove ${item.name}`}
              >
                <Ionicons name="remove" size={22} color={colors.background} />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingRight: 12,
  },
  backLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.accent,
    marginLeft: 2,
  },
  pressed: {
    opacity: 0.85,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.accent,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  empty: {
    fontSize: 15,
    color: colors.sage,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 10,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rowBody: {
    flex: 1,
    marginRight: 10,
    minWidth: 0,
  },
  rowName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 21,
  },
  rowMacros: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
  },
  minusBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accent,
  },
});
