import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const DEFAULT_STEPS_TODAY = 7210;
const DEFAULT_STEP_GOAL = 10_000;

type StepsDayContextValue = {
  stepsToday: number;
  dailyStepGoal: number;
  setStepsToday: (n: number) => void;
  setDailyStepGoal: (n: number) => void;
};

const StepsDayContext = createContext<StepsDayContextValue | null>(null);

export function StepsDayProvider({ children }: { children: ReactNode }) {
  const [stepsToday, setStepsTodayState] = useState(DEFAULT_STEPS_TODAY);
  const [dailyStepGoal, setDailyStepGoalState] = useState(DEFAULT_STEP_GOAL);

  const setStepsToday = useCallback((n: number) => {
    setStepsTodayState(() => (Number.isFinite(n) && n >= 0 ? Math.round(n) : 0));
  }, []);

  const setDailyStepGoal = useCallback((n: number) => {
    setDailyStepGoalState(() =>
      Number.isFinite(n) && n > 0 ? Math.round(n) : DEFAULT_STEP_GOAL,
    );
  }, []);

  const value = useMemo(
    () => ({
      stepsToday,
      dailyStepGoal,
      setStepsToday,
      setDailyStepGoal,
    }),
    [stepsToday, dailyStepGoal, setStepsToday, setDailyStepGoal],
  );

  return (
    <StepsDayContext.Provider value={value}>{children}</StepsDayContext.Provider>
  );
}

export function useStepsDay() {
  const ctx = useContext(StepsDayContext);
  if (!ctx) {
    throw new Error('useStepsDay must be used within StepsDayProvider');
  }
  return ctx;
}
