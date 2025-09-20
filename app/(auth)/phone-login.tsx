import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, TextInput, Button, Card, useTheme } from "react-native-paper";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PhoneLoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const handleSendCode = async () => {
    setLoading(true);
    // Implement phone verification logic with your backend
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsCodeSent(true);
    } catch (error) {
      console.error("Send code error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    // Implement code verification logic with your backend
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.replace("/(tenant)/home");
    } catch (error) {
      console.error("Verify code error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Button
            mode="text"
            onPress={handleBack}
            icon="arrow-left"
            style={styles.backButton}
          >
            Back
          </Button>
          <Text
            variant="headlineLarge"
            style={[styles.title, { color: theme.colors.primary }]}
          >
            Phone Verification
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            {isCodeSent
              ? "Enter the verification code sent to your phone"
              : "Enter your phone number to receive a verification code"}
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            {!isCodeSent ? (
              <>
                <Text variant="headlineSmall" style={styles.cardTitle}>
                  Enter Phone Number
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Phone Number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    mode="outlined"
                    keyboardType="phone-pad"
                    left={<TextInput.Icon icon="phone" />}
                    placeholder="+1 (555) 123-4567"
                    style={styles.input}
                  />
                </View>

                <Button
                  mode="contained"
                  onPress={handleSendCode}
                  loading={loading}
                  disabled={!phoneNumber}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                >
                  Send Verification Code
                </Button>
              </>
            ) : (
              <>
                <Text variant="headlineSmall" style={styles.cardTitle}>
                  Verify Code
                </Text>
                <Text variant="bodyMedium" style={styles.phoneDisplay}>
                  Code sent to: {phoneNumber}
                </Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    label="Verification Code"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    mode="outlined"
                    keyboardType="number-pad"
                    left={<TextInput.Icon icon="shield-check" />}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    style={styles.input}
                  />
                </View>

                <Button
                  mode="contained"
                  onPress={handleVerifyCode}
                  loading={loading}
                  disabled={verificationCode.length !== 6}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                >
                  Verify & Sign In
                </Button>

                <Button
                  mode="text"
                  onPress={() => setIsCodeSent(false)}
                  style={styles.resendButton}
                >
                  Change Phone Number
                </Button>
              </>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    paddingHorizontal: 20,
  },
  card: {
    elevation: 4,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  phoneDisplay: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 24,
    fontWeight: "500",
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 10,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  resendButton: {
    marginTop: 10,
  },
});
