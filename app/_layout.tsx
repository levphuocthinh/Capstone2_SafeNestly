import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';
import { MD3LightTheme, MD3DarkTheme, PaperProvider } from 'react-native-paper';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBackHandler } from '@/hooks/use-back-handler';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200ee',
    primaryContainer: '#e1ccf7',
    secondary: '#625b71',
    secondaryContainer: '#e8def8',
    surface: '#ffffff',
    surfaceVariant: '#f3f2f7',
    outline: '#79757f',
    background: '#fefbff',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#d0bcff',
    primaryContainer: '#4f378b',
    secondary: '#ccc2dc',
    secondaryContainer: '#4a4458',
    surface: '#1c1b1f',
    surfaceVariant: '#49454f',
    outline: '#938f99',
    background: '#141218',
  },
};

export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Handle hardware back button
  useBackHandler();

  return (
    <PaperProvider theme={colorScheme === 'dark' ? darkTheme : lightTheme}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            gestureEnabled: false, // Disable swipe back gesture for auth flow
          }}
        >
          <Stack.Screen
            name='(auth)'
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name='(guest)'
            options={{
              headerShown: false,
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name='(tenant)'
            options={{
              headerShown: false,
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name='(landlord)'
            options={{
              headerShown: false,
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name='(tabs)'
            options={{
              headerShown: false,
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name='modal'
            options={{
              presentation: 'modal',
              title: 'Modal',
              gestureEnabled: true,
            }}
          />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </PaperProvider>
  );
}
