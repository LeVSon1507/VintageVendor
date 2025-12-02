import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';

// Screens
import HomeScreen from '../screens/HomeScreen';
import GameOverScreen from '../screens/GameOverScreen';
import PhotoModeScreen from '../screens/PhotoModeScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StoreListScreen from '../screens/StoreListScreen';
import GameScreen from '../screens/GameScreen';

// Types
import { RootStackParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();

function RootNavigator(): React.ReactElement {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#F5F5DC' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            animationTypeForReplace: 'pop',
          }}
        />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="GameOver"
          component={GameOverScreen}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="PhotoMode"
          component={PhotoModeScreen}
          options={{
            presentation: 'modal',
            cardStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen
          name="Leaderboard"
          component={LeaderboardScreen}
          options={{
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            presentation: 'modal',
          }}
        />
        <Stack.Screen name="StoreList" component={StoreListScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
