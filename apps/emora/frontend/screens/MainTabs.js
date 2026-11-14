// screens/MainTabs.js
import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../lib/theme';

import HomeScreen from './HomeScreen';
import TodosScreen from './TodosScreen';
import PassionsScreen from './PassionsScreen';
import LettersScreen from './LettersScreen';
import ChatScreen from './ChatScreen';

const Tab = createBottomTabNavigator();

const icon = (emoji) => ({ color, size }) => (
  <Text style={{ fontSize: size - 4, color }}>{emoji}</Text>
);

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
          paddingBottom: 4,
          height: 60,
        },
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Tagebuch', tabBarIcon: icon('📔') }}
      />
      <Tab.Screen
        name="Todos"
        component={TodosScreen}
        options={{ tabBarLabel: 'ToDos', tabBarIcon: icon('✅') }}
      />
      <Tab.Screen
        name="Passions"
        component={PassionsScreen}
        options={{ tabBarLabel: 'Leidenschaft', tabBarIcon: icon('❤️') }}
      />
      <Tab.Screen
        name="Letters"
        component={LettersScreen}
        options={{ tabBarLabel: 'Briefe', tabBarIcon: icon('💌') }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ tabBarLabel: 'KI', tabBarIcon: icon('🧠') }}
      />
    </Tab.Navigator>
  );
}