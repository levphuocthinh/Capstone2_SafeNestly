import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  RadioButton,
  Chip,
  useTheme,
} from "react-native-paper";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "../../components/ui/back-button";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState("");
  const [hometown, setHometown] = useState("");
  const [occupation, setOccupation] = useState("");
  const [userType, setUserType] = useState("tenant"); // tenant or landlord
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const theme = useTheme();

  const handleRegister = async () => {
    // Validation
    const errors: { [key: string]: string } = {};

    if (!fullName.trim()) errors.fullName = "Full name is required";
    if (!email.trim()) errors.email = "Email is required";
    if (!phone.trim()) errors.phone = "Phone number is required";
    if (!birthYear.trim()) errors.birthYear = "Birth year is required";
    if (!gender) errors.gender = "Gender is required";
    if (!hometown.trim()) errors.hometown = "Hometown is required";
    if (!occupation.trim()) errors.occupation = "Occupation is required";
    if (!password) errors.password = "Password is required";
    if (password !== confirmPassword)
      errors.confirmPassword = "Passwords don't match";

    // Validate birth year
    const year = parseInt(birthYear);
    if (isNaN(year) || year < 1950 || year > 2010) {
      errors.birthYear = "Please enter a valid birth year (1950-2010)";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    try {
      // In a real app, you'd send registration data to your backend
      const userData = {
        fullName,
        email,
        phone,
        birthYear: parseInt(birthYear),
        gender,
        hometown,
        occupation,
        userType,
        password,
      };

      // Store user data for profile setup (in real app, this would be handled by backend)
      console.log("User registration data:", userData);

      // Navigate to profile setup for detailed onboarding
      router.replace("./profile-setup");
    } catch (error) {
      console.error("Registration error:", error);
      setValidationErrors({
        general: "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton title="Create Account" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text
            variant="headlineLarge"
            style={[styles.title, { color: theme.colors.primary }]}
          >
            Join SafeNestly
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Create your account to get started
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.cardTitle}>
              Account Information
            </Text>

            <View style={styles.userTypeContainer}>
              <Text style={styles.sectionTitle}>I am a:</Text>
              <View style={styles.chipContainer}>
                <Chip
                  selected={userType === "tenant"}
                  onPress={() => setUserType("tenant")}
                  style={styles.chip}
                >
                  Tenant
                </Chip>
                <Chip
                  selected={userType === "landlord"}
                  onPress={() => setUserType("landlord")}
                  style={styles.chip}
                >
                  Landlord
                </Chip>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                mode="outlined"
                left={<TextInput.Icon icon="account" />}
                style={styles.input}
                error={!!validationErrors.fullName}
              />
              {!!validationErrors.fullName && (
                <Text style={styles.errorText}>
                  {validationErrors.fullName}
                </Text>
              )}

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                left={<TextInput.Icon icon="email" />}
                style={styles.input}
                error={!!validationErrors.email}
              />
              {!!validationErrors.email && (
                <Text style={styles.errorText}>{validationErrors.email}</Text>
              )}

              <TextInput
                label="Phone Number"
                value={phone}
                onChangeText={setPhone}
                mode="outlined"
                keyboardType="phone-pad"
                left={<TextInput.Icon icon="phone" />}
                style={styles.input}
                error={!!validationErrors.phone}
              />
              {!!validationErrors.phone && (
                <Text style={styles.errorText}>{validationErrors.phone}</Text>
              )}

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
                error={!!validationErrors.password}
              />
              {!!validationErrors.password && (
                <Text style={styles.errorText}>
                  {validationErrors.password}
                </Text>
              )}

              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? "eye-off" : "eye"}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                style={styles.input}
                error={!!validationErrors.confirmPassword}
              />
              {!!validationErrors.confirmPassword && (
                <Text style={styles.errorText}>
                  {validationErrors.confirmPassword}
                </Text>
              )}
            </View>

            <Text variant="headlineSmall" style={styles.sectionTitle}>
              Personal Information
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                label="Birth Year"
                value={birthYear}
                onChangeText={setBirthYear}
                mode="outlined"
                keyboardType="number-pad"
                placeholder="1990"
                left={<TextInput.Icon icon="calendar" />}
                style={styles.input}
                error={!!validationErrors.birthYear}
              />
              {!!validationErrors.birthYear && (
                <Text style={styles.errorText}>
                  {validationErrors.birthYear}
                </Text>
              )}

              <View style={styles.genderContainer}>
                <Text style={styles.inputLabel}>Gender</Text>
                <RadioButton.Group onValueChange={setGender} value={gender}>
                  <View style={styles.radioRow}>
                    <View style={styles.radioItem}>
                      <RadioButton value="male" />
                      <Text>Male</Text>
                    </View>
                    <View style={styles.radioItem}>
                      <RadioButton value="female" />
                      <Text>Female</Text>
                    </View>
                    <View style={styles.radioItem}>
                      <RadioButton value="other" />
                      <Text>Other</Text>
                    </View>
                  </View>
                </RadioButton.Group>
                {!!validationErrors.gender && (
                  <Text style={styles.errorText}>
                    {validationErrors.gender}
                  </Text>
                )}
              </View>

              <TextInput
                label="Hometown"
                value={hometown}
                onChangeText={setHometown}
                mode="outlined"
                left={<TextInput.Icon icon="map-marker" />}
                style={styles.input}
                error={!!validationErrors.hometown}
              />
              {!!validationErrors.hometown && (
                <Text style={styles.errorText}>
                  {validationErrors.hometown}
                </Text>
              )}

              <TextInput
                label="Occupation"
                value={occupation}
                onChangeText={setOccupation}
                mode="outlined"
                left={<TextInput.Icon icon="briefcase" />}
                style={styles.input}
                error={!!validationErrors.occupation}
              />
              {!!validationErrors.occupation && (
                <Text style={styles.errorText}>
                  {validationErrors.occupation}
                </Text>
              )}
            </View>

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={
                !email ||
                !password ||
                !fullName ||
                !birthYear ||
                !gender ||
                !hometown ||
                !occupation ||
                password !== confirmPassword
              }
              style={styles.registerButton}
              contentStyle={styles.buttonContent}
            >
              Create Account
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Button mode="text" onPress={handleLogin} compact>
            Sign In
          </Button>
        </View>
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
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
  },
  card: {
    marginBottom: 20,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    marginTop: 8,
  },
  userTypeContainer: {
    marginBottom: 20,
  },
  chipContainer: {
    flexDirection: "row",
    gap: 10,
  },
  chip: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    opacity: 0.7,
  },
  genderContainer: {
    marginBottom: 16,
  },
  radioRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  registerButton: {
    marginTop: 10,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    opacity: 0.7,
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
});
