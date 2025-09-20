import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  Card,
  Button,
  Avatar,
  IconButton,
  Chip,
  List,
  useTheme,
} from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

interface RoommateProfile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  bio: string;
  photo: string;
  compatibility: number;
  lifestyle: string[];
  preferences: {
    cleanliness: number;
    socialLevel: number;
    noiseLevel: number;
    guestPolicy: string;
    smokingPolicy: string;
    petPolicy: string;
  };
  interests: string[];
  schedule: string;
  budget: string;
  moveInDate: string;
}

export default function RoommateProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock profile data - in real app, fetch based on id
  const profile: RoommateProfile = {
    id: id || "1",
    name: "Sarah Johnson",
    age: 24,
    occupation: "Software Engineer",
    bio: "I'm a clean, organized person who loves cooking and hiking. Looking for a friendly roommate to share a cozy space with. I work from home sometimes but I'm pretty quiet.",
    photo: "sarah.jpg",
    compatibility: 92,
    lifestyle: ["Health-conscious", "Social", "Tech-savvy"],
    preferences: {
      cleanliness: 9,
      socialLevel: 7,
      noiseLevel: 4,
      guestPolicy: "Ask before inviting",
      smokingPolicy: "No smoking",
      petPolicy: "Cats okay",
    },
    interests: ["Hiking", "Cooking", "Reading", "Yoga", "Photography"],
    schedule: "9-5 weekdays, flexible weekends",
    budget: "$800-1200/month",
    moveInDate: "Next month",
  };

  const handleConnect = () => {
    router.push(`../chat/${profile.name}`);
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return "#4CAF50";
    if (score >= 80) return "#FF9800";
    return "#F44336";
  };

  const renderPreferenceItem = (label: string, value: string | number) => (
    <List.Item
      title={label}
      description={typeof value === "number" ? `${value}/10` : value}
      left={(props) => <List.Icon {...props} icon="check-circle" />}
    />
  );

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
            Roommate Profile
          </Text>
          <IconButton
            icon={isFavorite ? "heart" : "heart-outline"}
            size={24}
            iconColor={isFavorite ? theme.colors.error : undefined}
            onPress={handleFavorite}
          />
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <View style={styles.profileHeader}>
              <Avatar.Text
                size={80}
                label={profile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
                style={styles.avatar}
              />
              <View style={styles.profileInfo}>
                <Text variant="headlineSmall" style={styles.name}>
                  {profile.name}
                </Text>
                <Text variant="bodyLarge" style={styles.ageOccupation}>
                  {profile.age} • {profile.occupation}
                </Text>
                <View style={styles.compatibilityContainer}>
                  <Text
                    variant="titleMedium"
                    style={[
                      styles.compatibility,
                      { color: getCompatibilityColor(profile.compatibility) },
                    ]}
                  >
                    {profile.compatibility}% Match
                  </Text>
                </View>
              </View>
            </View>

            <Text variant="bodyMedium" style={styles.bio}>
              {profile.bio}
            </Text>

            {/* Lifestyle Tags */}
            <View style={styles.lifestyleContainer}>
              {profile.lifestyle.map((lifestyle) => (
                <Chip key={lifestyle} style={styles.lifestyleChip}>
                  {lifestyle}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Living Preferences */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Living Preferences
            </Text>
            {renderPreferenceItem(
              "Cleanliness Level",
              profile.preferences.cleanliness
            )}
            {renderPreferenceItem(
              "Social Level",
              profile.preferences.socialLevel
            )}
            {renderPreferenceItem(
              "Noise Tolerance",
              profile.preferences.noiseLevel
            )}
            {renderPreferenceItem(
              "Guest Policy",
              profile.preferences.guestPolicy
            )}
            {renderPreferenceItem(
              "Smoking Policy",
              profile.preferences.smokingPolicy
            )}
            {renderPreferenceItem("Pet Policy", profile.preferences.petPolicy)}
          </Card.Content>
        </Card>

        {/* Interests */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Interests & Hobbies
            </Text>
            <View style={styles.interestsContainer}>
              {profile.interests.map((interest) => (
                <Chip
                  key={interest}
                  style={styles.interestChip}
                  mode="outlined"
                >
                  {interest}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Additional Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Additional Information
            </Text>
            <List.Item
              title="Schedule"
              description={profile.schedule}
              left={(props) => <List.Icon {...props} icon="clock" />}
            />
            <List.Item
              title="Budget Range"
              description={profile.budget}
              left={(props) => <List.Icon {...props} icon="currency-usd" />}
            />
            <List.Item
              title="Move-in Date"
              description={profile.moveInDate}
              left={(props) => <List.Icon {...props} icon="calendar" />}
            />
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            style={styles.actionButton}
            onPress={() => router.back()}
          >
            Back to Results
          </Button>
          <Button
            mode="contained"
            style={styles.actionButton}
            onPress={handleConnect}
          >
            Connect
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
  profileCard: {
    margin: 16,
    marginBottom: 12,
  },
  profileContent: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  avatar: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontWeight: "600",
    marginBottom: 4,
  },
  ageOccupation: {
    opacity: 0.7,
    marginBottom: 8,
  },
  compatibilityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  compatibility: {
    fontWeight: "600",
  },
  bio: {
    marginBottom: 16,
    lineHeight: 22,
  },
  lifestyleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  lifestyleChip: {
    marginBottom: 4,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: "600",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestChip: {
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
});
