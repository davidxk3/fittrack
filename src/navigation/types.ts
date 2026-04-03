import type { NavigatorScreenParams } from '@react-navigation/native';

export type CaloriesStackParamList = {
  CaloriesMain: undefined;
  CalorieBreakdown: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Calories: NavigatorScreenParams<CaloriesStackParamList>;
  Steps: undefined;
  Exercises: undefined;
};
