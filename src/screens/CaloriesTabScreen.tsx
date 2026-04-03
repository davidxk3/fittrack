import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  DAILY_CALORIE_GOAL,
  useCaloriesDay,
} from '../calories/CaloriesDayContext';
import { RingMetricHero } from '../components/RingMetricHero';
import { ScreenBrandHeader } from '../components/ScreenBrandHeader';
import type { CaloriesStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

const HERO_BLOCK_HEIGHT = 500;

type CaloriesMainNav = NativeStackNavigationProp<
  CaloriesStackParamList,
  'CaloriesMain'
>;

function parseGrams(s: string): number {
  const n = parseFloat(s.trim().replace(',', '.'));
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
}

function parseCalories(s: string): number {
  const n = parseFloat(s.trim().replace(',', '.'));
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
}

type LogMode = 'search' | 'manual' | 'camera';

type MockFood = {
  id: string;
  name: string;
  calories: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
};

const MOCK_FOODS: MockFood[] = [
  {
    id: '1',
    name: 'Oatmeal, cooked (1 cup)',
    calories: 150,
    carbsG: 27,
    proteinG: 5,
    fatG: 3,
  },
  {
    id: '2',
    name: 'Greek yogurt, plain',
    calories: 120,
    carbsG: 8,
    proteinG: 17,
    fatG: 0,
  },
  {
    id: '3',
    name: 'Chicken breast, grilled (4 oz)',
    calories: 185,
    carbsG: 0,
    proteinG: 35,
    fatG: 4,
  },
  {
    id: '4',
    name: 'Brown rice (1 cup cooked)',
    calories: 216,
    carbsG: 45,
    proteinG: 5,
    fatG: 2,
  },
  {
    id: '5',
    name: 'Salmon fillet (6 oz)',
    calories: 350,
    carbsG: 0,
    proteinG: 34,
    fatG: 22,
  },
  {
    id: '6',
    name: 'Banana, medium',
    calories: 105,
    carbsG: 27,
    proteinG: 1,
    fatG: 0,
  },
];

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function CaloriesTabScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<CaloriesMainNav>();
  const { caloriesEaten, macrosToday, addEntry } = useCaloriesDay();
  const caloriesLeft = Math.max(0, DAILY_CALORIE_GOAL - caloriesEaten);

  const [logMode, setLogMode] = useState<LogMode>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<
    string | null
  >(null);
  const [pendingAddFood, setPendingAddFood] = useState<MockFood | null>(
    null,
  );

  const [foodName, setFoodName] = useState('');
  const [caloriesInput, setCaloriesInput] = useState('');
  const [carbsInput, setCarbsInput] = useState('');
  const [proteinInput, setProteinInput] = useState('');
  const [fatInput, setFatInput] = useState('');

  const [lastPhotoUri, setLastPhotoUri] = useState<string | null>(null);

  const filteredSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return MOCK_FOODS;
    return MOCK_FOODS.filter((f) => f.name.toLowerCase().includes(q));
  }, [searchQuery]);

  const openCamera = useCallback(async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Camera',
        'Use the FitTrack app on an iPhone or Android device to open the camera.',
      );
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera access',
        'Camera permission is required to take a meal photo. You can enable it in Settings.',
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setLastPhotoUri(result.assets[0].uri);
    }
  }, []);

  const onSelectSuggestion = (item: MockFood) => {
    setSelectedSuggestionId(item.id);
    setPendingAddFood(item);
  };

  const dismissAddFoodDialog = () => {
    setPendingAddFood(null);
    setSelectedSuggestionId(null);
  };

  const confirmAddFood = () => {
    const item = pendingAddFood;
    if (!item) return;
    addEntry({
      id: `search-${item.id}-${Date.now()}`,
      name: item.name,
      calories: item.calories,
      carbsG: item.carbsG,
      proteinG: item.proteinG,
      fatG: item.fatG,
    });
    dismissAddFoodDialog();
  };

  const onLogManualPress = () => {
    if (!foodName.trim()) {
      Alert.alert('Food name', 'Enter a food name.');
      return;
    }
    const c = caloriesInput.trim();
    const carb = carbsInput.trim();
    const pro = proteinInput.trim();
    const fat = fatInput.trim();
    if (!c && !carb && !pro && !fat) {
      Alert.alert(
        'Macros or calories',
        'Add at least calories or one of carbs / protein / fat.',
      );
      return;
    }
    const calN = c ? parseCalories(c) : 0;
    const carbN = carb ? parseGrams(carb) : 0;
    const proN = pro ? parseGrams(pro) : 0;
    const fatN = fat ? parseGrams(fat) : 0;
    addEntry({
      id: `manual-${Date.now()}`,
      name: foodName.trim(),
      calories: calN,
      carbsG: carbN,
      proteinG: proN,
      fatG: fatN,
    });
    setFoodName('');
    setCaloriesInput('');
    setCarbsInput('');
    setProteinInput('');
    setFatInput('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenBrandHeader tightBottom />
        <View style={styles.heroSlot}>
          <RingMetricHero
            current={caloriesEaten}
            goal={DAILY_CALORIE_GOAL}
            unitLabel="CALORIES"
            gradientColors={colors.heroCalories}
            bottomInset={0}
            valueFormatter={(n) => n.toLocaleString('en-US')}
            embedded
            belowFooter={
              <Pressable
                style={({ pressed }) => [
                  styles.breakdownRow,
                  pressed && styles.breakdownRowPressed,
                ]}
                onPress={() => navigation.navigate('CalorieBreakdown')}
              >
                <Text style={styles.breakdownLabel}>Breakdown</Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.accent}
                />
              </Pressable>
            }
          />
        </View>

        <Text style={styles.sectionHeading}>Calories summary</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}
        >
          <StatCard
            label="Total calories"
            value={DAILY_CALORIE_GOAL.toLocaleString('en-US')}
          />
          <StatCard
            label="Consumed"
            value={caloriesEaten.toLocaleString('en-US')}
          />
          <StatCard
            label="Remaining"
            value={caloriesLeft.toLocaleString('en-US')}
          />
        </ScrollView>

        <Text style={styles.sectionHeading}>Nutrition summary</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}
        >
          <StatCard
            label="Carbs today"
            value={`${macrosToday.carbsG}`}
            sub="grams"
          />
          <StatCard
            label="Protein today"
            value={`${macrosToday.proteinG}`}
            sub="grams"
          />
          <StatCard
            label="Fat today"
            value={`${macrosToday.fatG}`}
            sub="grams"
          />
        </ScrollView>

        <Text style={styles.sectionHeading}>Log food</Text>
        <View style={styles.card}>
          <View style={styles.modeRow}>
            <Pressable
              style={({ pressed }) => [
                styles.modeChip,
                logMode === 'search' && styles.modeChipActive,
                pressed && styles.modeChipPressed,
              ]}
              onPress={() => setLogMode('search')}
            >
              <Ionicons
                name="search-outline"
                size={17}
                color={logMode === 'search' ? colors.background : colors.sage}
              />
              <Text
                style={[
                  styles.modeChipText,
                  logMode === 'search' && styles.modeChipTextActive,
                ]}
                numberOfLines={1}
              >
                Search
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.modeChip,
                logMode === 'manual' && styles.modeChipActive,
                pressed && styles.modeChipPressed,
              ]}
              onPress={() => setLogMode('manual')}
            >
              <Ionicons
                name="nutrition-outline"
                size={17}
                color={logMode === 'manual' ? colors.background : colors.sage}
              />
              <Text
                style={[
                  styles.modeChipText,
                  logMode === 'manual' && styles.modeChipTextActive,
                ]}
                numberOfLines={1}
              >
                Manual
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.modeChip,
                logMode === 'camera' && styles.modeChipActive,
                pressed && styles.modeChipPressed,
              ]}
              onPress={() => setLogMode('camera')}
            >
              <Ionicons
                name="camera-outline"
                size={17}
                color={logMode === 'camera' ? colors.background : colors.sage}
              />
              <Text
                style={[
                  styles.modeChipText,
                  logMode === 'camera' && styles.modeChipTextActive,
                ]}
                numberOfLines={1}
              >
                Camera
              </Text>
            </Pressable>
          </View>

          {logMode === 'search' ? (
            <>
              <Text style={styles.lead}>
                Type to filter placeholder foods. Tap a row to add it to today
                after you confirm (no real search API yet).
              </Text>
              <View style={styles.searchFieldWrap}>
                <Ionicons
                  name="search"
                  size={20}
                  color={colors.sage}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search foods…"
                  placeholderTextColor={colors.sage}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <Text style={styles.suggestionsTitle}>Suggestions</Text>
              {filteredSuggestions.length === 0 ? (
                <Text style={styles.emptyReco}>No matches — try another word.</Text>
              ) : (
                <View style={styles.recoList}>
                  {filteredSuggestions.map((item, index) => (
                    <Pressable
                      key={item.id}
                      style={({ pressed }) => [
                        styles.recoRow,
                        index === filteredSuggestions.length - 1 &&
                          styles.recoRowLast,
                        selectedSuggestionId === item.id &&
                          styles.recoRowSelected,
                        pressed && styles.recoRowPressed,
                      ]}
                      onPress={() => onSelectSuggestion(item)}
                    >
                      <Text style={styles.recoName}>{item.name}</Text>
                      <Text style={styles.recoMacros}>
                        {item.calories} cal · {item.carbsG}g C · {item.proteinG}g P ·{' '}
                        {item.fatG}g F
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </>
          ) : null}

          {logMode === 'manual' ? (
            <>
              <Text style={styles.lead}>
                Enter the food and macros you care about. Nothing is saved yet.
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Food name"
                placeholderTextColor={colors.sage}
                value={foodName}
                onChangeText={setFoodName}
              />
              <TextInput
                style={[styles.input, styles.inputGap]}
                placeholder="Calories"
                placeholderTextColor={colors.sage}
                keyboardType="numeric"
                value={caloriesInput}
                onChangeText={setCaloriesInput}
              />
              <Text style={styles.macroInputLabel}>Nutrition (grams)</Text>
              <View style={styles.macroNutritionColumn}>
                <View style={styles.macroField}>
                  <Text style={styles.macroFieldLabel}>Carbs</Text>
                  <TextInput
                    style={styles.macroInputFull}
                    placeholder="0"
                    placeholderTextColor={colors.sage}
                    keyboardType="decimal-pad"
                    value={carbsInput}
                    onChangeText={setCarbsInput}
                  />
                </View>
                <View style={styles.macroField}>
                  <Text style={styles.macroFieldLabel}>Protein</Text>
                  <TextInput
                    style={styles.macroInputFull}
                    placeholder="0"
                    placeholderTextColor={colors.sage}
                    keyboardType="decimal-pad"
                    value={proteinInput}
                    onChangeText={setProteinInput}
                  />
                </View>
                <View style={[styles.macroField, styles.macroFieldLast]}>
                  <Text style={styles.macroFieldLabel}>Fat</Text>
                  <TextInput
                    style={styles.macroInputFull}
                    placeholder="0"
                    placeholderTextColor={colors.sage}
                    keyboardType="decimal-pad"
                    value={fatInput}
                    onChangeText={setFatInput}
                  />
                </View>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                ]}
                onPress={onLogManualPress}
              >
                <Text style={styles.buttonLabel}>Log food</Text>
              </Pressable>
            </>
          ) : null}

          {logMode === 'camera' ? (
            <>
              <Text style={styles.lead}>
                Open your phone’s camera to snap your meal. The photo stays on
                this screen only (not uploaded).
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.cameraButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={openCamera}
              >
                <Ionicons name="camera" size={22} color={colors.background} />
                <Text style={styles.cameraButtonLabel}>Open camera</Text>
              </Pressable>
              {lastPhotoUri ? (
                <View style={styles.previewBlock}>
                  <Text style={styles.previewCaption}>Last capture (local)</Text>
                  <Image
                    source={{ uri: lastPhotoUri }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                </View>
              ) : null}
            </>
          ) : null}

          <Text style={styles.note}>Frontend only — no backend yet.</Text>
        </View>
      </ScrollView>

      <Modal
        visible={pendingAddFood !== null}
        transparent
        animationType="fade"
        onRequestClose={dismissAddFoodDialog}
      >
        <View style={styles.addFoodOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={dismissAddFoodDialog}
            accessibilityLabel="Close dialog"
          />
          <View style={styles.addFoodDialog}>
            <Text style={styles.addFoodTitle}>Add food?</Text>
            {pendingAddFood ? (
              <>
                <Text style={styles.addFoodName}>{pendingAddFood.name}</Text>
                <Text style={styles.addFoodDetail}>
                  {pendingAddFood.calories.toLocaleString('en-US')} cal ·{' '}
                  {pendingAddFood.carbsG}g C · {pendingAddFood.proteinG}g P ·{' '}
                  {pendingAddFood.fatG}g F
                </Text>
                <Text style={styles.addFoodHint}>
                  Add this to your daily intake totals?
                </Text>
              </>
            ) : null}
            <View style={styles.addFoodActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.addFoodBtnNo,
                  pressed && styles.addFoodBtnPressed,
                ]}
                onPress={dismissAddFoodDialog}
              >
                <Text style={styles.addFoodBtnNoText}>No</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.addFoodBtnYes,
                  pressed && styles.addFoodBtnPressed,
                ]}
                onPress={confirmAddFood}
              >
                <Text style={styles.addFoodBtnYesText}>Yes</Text>
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
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(185, 156, 124, 0.14)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(185, 156, 124, 0.35)',
    gap: 6,
  },
  breakdownRowPressed: {
    opacity: 0.88,
  },
  breakdownLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent,
    letterSpacing: 0.3,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.sage,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  statsRow: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    flexDirection: 'row',
  },
  statCard: {
    width: 148,
    marginRight: 12,
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  statSub: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.sage,
    marginTop: 2,
  },
  statLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    color: colors.sage,
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  modeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(31, 34, 43, 0.45)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  modeChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  modeChipPressed: {
    opacity: 0.9,
  },
  modeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.sage,
  },
  modeChipTextActive: {
    color: colors.background,
  },
  lead: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  searchFieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 34, 43, 0.45)',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  recoList: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  recoRow: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(31, 34, 43, 0.25)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  recoRowLast: {
    borderBottomWidth: 0,
  },
  recoRowSelected: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    paddingLeft: 11,
  },
  recoRowPressed: {
    opacity: 0.92,
  },
  recoName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  recoMacros: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
  },
  emptyReco: {
    fontSize: 14,
    color: colors.sage,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  macroInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 10,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  macroNutritionColumn: {
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: 'rgba(31, 34, 43, 0.2)',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  macroField: {
    width: '100%',
    marginBottom: 14,
  },
  macroFieldLast: {
    marginBottom: 0,
  },
  macroFieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
  macroInputFull: {
    width: '100%',
    minHeight: 48,
    backgroundColor: 'rgba(31, 34, 43, 0.45)',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  input: {
    backgroundColor: 'rgba(31, 34, 43, 0.45)',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  inputGap: {
    marginTop: 10,
  },
  button: {
    marginTop: 16,
    backgroundColor: colors.accent,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cameraButton: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.accent,
    borderRadius: 18,
    paddingVertical: 16,
  },
  cameraButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  previewBlock: {
    marginTop: 18,
  },
  previewCaption: {
    fontSize: 12,
    color: colors.sage,
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: colors.background,
  },
  note: {
    marginTop: 16,
    fontSize: 12,
    color: colors.sage,
    textAlign: 'center',
  },
  addFoodOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  addFoodDialog: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  addFoodTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  addFoodName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
    lineHeight: 22,
  },
  addFoodDetail: {
    marginTop: 8,
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 21,
  },
  addFoodHint: {
    marginTop: 16,
    fontSize: 14,
    color: colors.sage,
    lineHeight: 20,
  },
  addFoodActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 22,
  },
  addFoodBtnNo: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  addFoodBtnNoText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.sage,
  },
  addFoodBtnYes: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 14,
    backgroundColor: colors.accent,
  },
  addFoodBtnYesText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  addFoodBtnPressed: {
    opacity: 0.9,
  },
});
