import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import MainMenuScreen from '../screens/MainMenuScreen';
import SearchDriversScreen from '../screens/SearchDriversScreen';
import RealTimePickupScreen from '../screens/RealTimePickupScreen';
import ProfileScreen from '../screens/ProfileScreen';
import colors from '../styles/colors';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Pickup') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.primary,
          borderTopColor: colors.secondary,
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.background,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={MainMenuScreen}
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen
        name="Search"
        component={SearchDriversScreen}
        options={{ title: 'Buscar' }}
      />
      <Tab.Screen
        name="Pickup"
        component={RealTimePickupScreen}
        options={{ title: 'Recogida' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;