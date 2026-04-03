import {
  DarkTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CaloriesDayProvider } from './src/calories/CaloriesDayContext';
import { RootTabs } from './src/navigation/RootTabs';
import { StepsDayProvider } from './src/steps/StepsDayContext';
import { colors } from './src/theme/colors';

const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={navigationTheme}>
        <CaloriesDayProvider>
          <StepsDayProvider>
            <RootTabs />
          </StepsDayProvider>
        </CaloriesDayProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
