import React from "react";
import { Appbar } from "react-native-paper";
import { router } from "expo-router";

interface BackButtonProps {
  onPress?: () => void;
  title?: string;
  subtitle?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  title = "Back",
  subtitle,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      // Fallback navigation
      router.replace("/(auth)/login");
    }
  };

  return (
    <Appbar.Header>
      <Appbar.BackAction onPress={handlePress} />
      <Appbar.Content title={title} subtitle={subtitle} />
    </Appbar.Header>
  );
};

export default BackButton;
