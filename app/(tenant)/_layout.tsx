import { Stack } from "expo-router";
import React from "react";
import { MD3LightTheme, PaperProvider } from "react-native-paper";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#6200ee",
    primaryContainer: "#e1ccf7",
    secondary: "#625b71",
    secondaryContainer: "#e8def8",
  },
};

export default function TenantLayout() {
  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="home" />
        <Stack.Screen name="room-details/[id]" />
        <Stack.Screen name="enhanced-room-details/[id]" />
        <Stack.Screen name="favorites" />
        <Stack.Screen name="roommate-matching" />
        <Stack.Screen name="roommate-preferences" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="search-preferences" />
        <Stack.Screen name="security" />
        <Stack.Screen name="help" />
        <Stack.Screen name="contact" />
        <Stack.Screen name="terms" />
        <Stack.Screen name="filters" />
        <Stack.Screen name="advanced-filters" />
        <Stack.Screen name="compare-rooms" />
        <Stack.Screen name="map" />
        <Stack.Screen name="chat/[name]" />
        <Stack.Screen name="roommate-profile/[id]" />
      </Stack>
    </PaperProvider>
  );
}
