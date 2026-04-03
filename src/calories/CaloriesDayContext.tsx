import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type FoodLogEntry = {
  id: string;
  name: string;
  calories: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
};

/** Daily calorie target (hero ring, home summary). */
export const DAILY_CALORIE_GOAL = 2200;

/** Demo seed — sums to 1,487 cal · 168 / 112 / 54 g macros */
const SEED_ENTRIES: FoodLogEntry[] = [
  {
    id: 'seed-1',
    name: 'Greek yogurt bowl, berries & granola',
    calories: 520,
    carbsG: 58,
    proteinG: 38,
    fatG: 14,
  },
  {
    id: 'seed-2',
    name: 'Turkey & avocado sandwich',
    calories: 487,
    carbsG: 42,
    proteinG: 35,
    fatG: 22,
  },
  {
    id: 'seed-3',
    name: 'Post-workout protein shake',
    calories: 480,
    carbsG: 68,
    proteinG: 39,
    fatG: 18,
  },
];

function sumEntries(entries: FoodLogEntry[]) {
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      carbsG: acc.carbsG + e.carbsG,
      proteinG: acc.proteinG + e.proteinG,
      fatG: acc.fatG + e.fatG,
    }),
    { calories: 0, carbsG: 0, proteinG: 0, fatG: 0 },
  );
}

type CaloriesDayContextValue = {
  entries: FoodLogEntry[];
  caloriesEaten: number;
  macrosToday: { carbsG: number; proteinG: number; fatG: number };
  addEntry: (entry: FoodLogEntry) => void;
  removeEntry: (id: string) => void;
};

const CaloriesDayContext = createContext<CaloriesDayContextValue | null>(
  null,
);

export function CaloriesDayProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<FoodLogEntry[]>(SEED_ENTRIES);

  const totals = useMemo(() => sumEntries(entries), [entries]);

  const addEntry = useCallback((entry: FoodLogEntry) => {
    setEntries((prev) => [...prev, entry]);
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      entries,
      caloriesEaten: totals.calories,
      macrosToday: {
        carbsG: totals.carbsG,
        proteinG: totals.proteinG,
        fatG: totals.fatG,
      },
      addEntry,
      removeEntry,
    }),
    [entries, totals, addEntry, removeEntry],
  );

  return (
    <CaloriesDayContext.Provider value={value}>
      {children}
    </CaloriesDayContext.Provider>
  );
}

export function useCaloriesDay() {
  const ctx = useContext(CaloriesDayContext);
  if (!ctx) {
    throw new Error('useCaloriesDay must be used within CaloriesDayProvider');
  }
  return ctx;
}
