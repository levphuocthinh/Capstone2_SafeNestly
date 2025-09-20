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

export default function LandlordLayout() {
  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="create-listing" />
        <Stack.Screen name="contacts" />
        <Stack.Screen name="listing-details/[id]" />
        <Stack.Screen name="applicants/[id]" />
        <Stack.Screen name="all-listings" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="analytics" />
        <Stack.Screen name="chat/[name]" />
      </Stack>
    </PaperProvider>
  );
}
