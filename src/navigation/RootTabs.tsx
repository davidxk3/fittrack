import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { CaloriesStack } from './CaloriesStack';
import { ExercisesScreen } from '../screens/ExercisesScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { StepsTabScreen } from '../screens/StepsTabScreen';
import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

function TabIconWrap({
  focused,
  children,
}: {
  focused: boolean;
  children: ReactNode;
}) {
  return (
    <View style={[styles.iconPill, focused && styles.iconPillActive]}>
      {children}
    </View>
  );
}

export function RootTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.sage,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          elevation: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingTop: 6,
          paddingBottom: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <TabIconWrap focused={focused}>
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={size}
                color={color}
              />
            </TabIconWrap>
          ),
        }}
      />
      <Tab.Screen
        name="Calories"
        component={CaloriesStack}
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <TabIconWrap focused={focused}>
              <Ionicons
                name={focused ? 'flame' : 'flame-outline'}
                size={size}
                color={color}
              />
            </TabIconWrap>
          ),
        }}
      />
      <Tab.Screen
        name="Steps"
        component={StepsTabScreen}
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <TabIconWrap focused={focused}>
              <Ionicons
                name={focused ? 'footsteps' : 'footsteps-outline'}
                size={size}
                color={color}
              />
            </TabIconWrap>
          ),
        }}
      />
      <Tab.Screen
        name="Exercises"
        component={ExercisesScreen}
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <TabIconWrap focused={focused}>
              <Ionicons
                name={focused ? 'barbell' : 'barbell-outline'}
                size={size}
                color={color}
              />
            </TabIconWrap>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 38,
  },
  iconPillActive: {
    backgroundColor: colors.tabActivePill,
  },
});
