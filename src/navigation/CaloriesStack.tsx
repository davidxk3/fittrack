import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CalorieBreakdownScreen } from '../screens/CalorieBreakdownScreen';
import { CaloriesTabScreen } from '../screens/CaloriesTabScreen';
import type { CaloriesStackParamList } from './types';

const Stack = createNativeStackNavigator<CaloriesStackParamList>();

export function CaloriesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CaloriesMain" component={CaloriesTabScreen} />
      <Stack.Screen name="CalorieBreakdown" component={CalorieBreakdownScreen} />
    </Stack.Navigator>
  );
}
