import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  Card,
  Button,
  IconButton,
  Chip,
  Switch,
  useTheme,
} from "react-native-paper";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RoommatePreferencesScreen() {
  const theme = useTheme();
  const [preferences, setPreferences] = useState({
    ageRange: [20, 30],
    occupation: [] as string[],
    lifestyle: [] as string[],
    cleanliness: 8,
    socialLevel: 6,
    petFriendly: false,
    smokingOk: false,
    budgetRange: [800, 1500],
  });

  const occupations = [
    "Student",
    "Professional",
    "Freelancer",
    "Artist",
    "Engineer",
    "Teacher",
    "Healthcare",
  ];

  const lifestyles = [
    "Social",
    "Quiet",
    "Health-conscious",
    "Night owl",
    "Early bird",
    "Fitness enthusiast",
  ];

  const toggleOccupation = (occupation: string) => {
    setPreferences((prev) => ({
      ...prev,
      occupation: prev.occupation.includes(occupation)
        ? prev.occupation.filter((o) => o !== occupation)
        : [...prev.occupation, occupation],
    }));
  };

  const toggleLifestyle = (lifestyle: string) => {
    setPreferences((prev) => ({
      ...prev,
      lifestyle: prev.lifestyle.includes(lifestyle)
        ? prev.lifestyle.filter((l) => l !== lifestyle)
        : [...prev.lifestyle, lifestyle],
    }));
  };

  const handleSavePreferences = () => {
    // Save preferences logic here
    console.log("Saving preferences:", preferences);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => router.back()}
          />
          <Text variant="titleLarge" style={styles.headerTitle}>
            Roommate Preferences
          </Text>
          <View style={{ width: 48 }} />
        </View>

        <View style={styles.content}>
          <Text
            variant="headlineMedium"
            style={[styles.title, { color: theme.colors.primary }]}
          >
            Find Your Perfect Match
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Set your preferences to get better roommate recommendations
          </Text>

          {/* Age Range */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Age Range
              </Text>
              <View style={styles.rangeContainer}>
                <Text variant="bodyLarge">
                  {preferences.ageRange[0]} - {preferences.ageRange[1]} years
                  old
                </Text>
                <Text variant="bodySmall" style={styles.rangeNote}>
                  Adjust age range for roommate matching
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Occupation Preferences */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Preferred Occupations
              </Text>
              <View style={styles.chipContainer}>
                {occupations.map((occupation) => (
                  <Chip
                    key={occupation}
                    selected={preferences.occupation.includes(occupation)}
                    onPress={() => toggleOccupation(occupation)}
                    style={styles.chip}
                  >
                    {occupation}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>

          {/* Lifestyle Preferences */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Lifestyle Preferences
              </Text>
              <View style={styles.chipContainer}>
                {lifestyles.map((lifestyle) => (
                  <Chip
                    key={lifestyle}
                    selected={preferences.lifestyle.includes(lifestyle)}
                    onPress={() => toggleLifestyle(lifestyle)}
                    style={styles.chip}
                  >
                    {lifestyle}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>

          {/* Living Standards */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Living Standards
              </Text>

              <View style={styles.preferenceItem}>
                <View style={styles.preferenceText}>
                  <Text variant="bodyLarge">Cleanliness Level</Text>
                  <Text variant="bodySmall" style={styles.preferenceValue}>
                    {preferences.cleanliness}/10
                  </Text>
                </View>
              </View>

              <View style={styles.preferenceItem}>
                <View style={styles.preferenceText}>
                  <Text variant="bodyLarge">Social Level</Text>
                  <Text variant="bodySmall" style={styles.preferenceValue}>
                    {preferences.socialLevel}/10
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Policies */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Policies
              </Text>

              <View style={styles.switchItem}>
                <Text variant="bodyLarge">Pet Friendly</Text>
                <Switch
                  value={preferences.petFriendly}
                  onValueChange={(value) =>
                    setPreferences((prev) => ({ ...prev, petFriendly: value }))
                  }
                />
              </View>

              <View style={styles.switchItem}>
                <Text variant="bodyLarge">Smoking Allowed</Text>
                <Switch
                  value={preferences.smokingOk}
                  onValueChange={(value) =>
                    setPreferences((prev) => ({ ...prev, smokingOk: value }))
                  }
                />
              </View>
            </Card.Content>
          </Card>

          {/* Budget Range */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Budget Range
              </Text>
              <View style={styles.rangeContainer}>
                <Text variant="bodyLarge">
                  ${preferences.budgetRange[0]} - ${preferences.budgetRange[1]}{" "}
                  per month
                </Text>
                <Text variant="bodySmall" style={styles.rangeNote}>
                  Expected roommate contribution range
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Save Button */}
          <Button
            mode="contained"
            onPress={handleSavePreferences}
            style={styles.saveButton}
          >
            Save Preferences
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
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: "600",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  rangeContainer: {
    paddingVertical: 8,
  },
  rangeNote: {
    opacity: 0.7,
    marginTop: 4,
  },
  preferenceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  preferenceText: {
    flex: 1,
  },
  preferenceValue: {
    marginTop: 2,
    opacity: 0.7,
  },
  switchItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  saveButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
});
