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

export default function AuthLayout() {
  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="phone-login" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="profile-setup" />
      </Stack>
    </PaperProvider>
  );
}
