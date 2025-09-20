import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, Button, Avatar, List, Switch } from "react-native-paper";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  verified: boolean;
  memberSince: string;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    locationTracking: boolean;
  };
}

const mockProfile: UserProfile = {
  name: "Alex Thompson",
  email: "alex.thompson@email.com",
  phone: "+1 (555) 123-4567",
  avatar: "https://via.placeholder.com/100x100",
  verified: true,
  memberSince: "January 2024",
  preferences: {
    notifications: true,
    emailUpdates: false,
    locationTracking: true,
  },
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState(mockProfile);

  const handleEditProfile = () => {
    router.push("./edit-profile");
  };

  const handleRoommatePreferences = () => {
    router.push("./roommate-preferences");
  };

  const handleSearchPreferences = () => {
    router.push("./search-preferences");
  };

  const handleNotificationToggle = () => {
    setProfile((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: !prev.preferences.notifications,
      },
    }));
  };

  const handleEmailToggle = () => {
    setProfile((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        emailUpdates: !prev.preferences.emailUpdates,
      },
    }));
  };

  const handleLocationToggle = () => {
    setProfile((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        locationTracking: !prev.preferences.locationTracking,
      },
    }));
  };

  const handleLogout = async () => {
    try {
      // Import logout function from auth utils
      const { logoutUser } = require("../../utils/auth");
      await logoutUser();

      // Navigate to login screen and reset navigation stack
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback navigation
      router.replace("/(auth)/login");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Button
            mode="text"
            icon="arrow-left"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            Back
          </Button>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Profile
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Image
              size={100}
              source={{ uri: profile.avatar }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text variant="headlineSmall" style={styles.userName}>
                {profile.name}
              </Text>
              <View style={styles.verificationContainer}>
                <Text style={styles.userEmail}>{profile.email}</Text>
                {profile.verified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓ Verified</Text>
                  </View>
                )}
              </View>
              <Text style={styles.memberSince}>
                Member since {profile.memberSince}
              </Text>
            </View>
            <Button
              mode="outlined"
              onPress={handleEditProfile}
              style={styles.editButton}
            >
              Edit Profile
            </Button>
          </Card.Content>
        </Card>

        {/* Account Settings */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Account
            </Text>

            <List.Item
              title="Personal Information"
              description="Update your personal details"
              left={(props) => <List.Icon {...props} icon="account-edit" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleEditProfile}
            />

            <List.Item
              title="Phone Number"
              description={profile.phone}
              left={(props) => <List.Icon {...props} icon="phone" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleEditProfile}
            />

            <List.Item
              title="Password & Security"
              description="Change password, two-factor authentication"
              left={(props) => <List.Icon {...props} icon="lock" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => router.push("./security")}
            />
          </Card.Content>
        </Card>

        {/* Preferences */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Preferences
            </Text>

            <List.Item
              title="Roommate Preferences"
              description="Update your roommate matching preferences"
              left={(props) => <List.Icon {...props} icon="account-multiple" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleRoommatePreferences}
            />

            <List.Item
              title="Search Preferences"
              description="Customize your room search criteria"
              left={(props) => <List.Icon {...props} icon="home-search" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleSearchPreferences}
            />
          </Card.Content>
        </Card>

        {/* Notifications */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Notifications
            </Text>

            <List.Item
              title="Push Notifications"
              description="Receive notifications about new matches and messages"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={profile.preferences.notifications}
                  onValueChange={handleNotificationToggle}
                />
              )}
            />

            <List.Item
              title="Email Updates"
              description="Receive weekly updates via email"
              left={(props) => <List.Icon {...props} icon="email" />}
              right={() => (
                <Switch
                  value={profile.preferences.emailUpdates}
                  onValueChange={handleEmailToggle}
                />
              )}
            />

            <List.Item
              title="Location Services"
              description="Allow location access for better recommendations"
              left={(props) => <List.Icon {...props} icon="map-marker" />}
              right={() => (
                <Switch
                  value={profile.preferences.locationTracking}
                  onValueChange={handleLocationToggle}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Support */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Support
            </Text>

            <List.Item
              title="Help Center"
              description="FAQs and support articles"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => router.push("./help")}
            />

            <List.Item
              title="Contact Us"
              description="Get in touch with our support team"
              left={(props) => <List.Icon {...props} icon="message-text" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => router.push("./contact")}
            />

            <List.Item
              title="Terms & Privacy"
              description="Read our terms of service and privacy policy"
              left={(props) => <List.Icon {...props} icon="file-document" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => router.push("./terms")}
            />
          </Card.Content>
        </Card>

        {/* Logout Section */}
        <Card style={styles.logoutCard}>
          <Card.Content>
            <View style={styles.logoutSection}>
              <View style={styles.logoutInfo}>
                <Text variant="titleMedium" style={styles.logoutTitle}>
                  Account Management
                </Text>
                <Text variant="bodyMedium" style={styles.logoutDescription}>
                  Securely sign out of your SafeNestly account
                </Text>
              </View>
              <Button
                mode="contained"
                onPress={handleLogout}
                icon="logout-variant"
                style={styles.logoutButton}
                contentStyle={styles.logoutButtonContent}
                buttonColor="#dc3545"
                textColor="white"
              >
                Sign Out
              </Button>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.versionText}>SafeNestly v1.0.0</Text>
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
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    margin: 0,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 60,
  },
  profileCard: {
    margin: 16,
    elevation: 3,
  },
  profileContent: {
    alignItems: "center",
    padding: 24,
  },
  avatar: {
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  verificationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    opacity: 0.7,
    marginRight: 8,
  },
  verifiedBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  verifiedText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  memberSince: {
    fontSize: 14,
    opacity: 0.6,
  },
  editButton: {
    paddingHorizontal: 24,
  },
  settingsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  logoutCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  logoutSection: {
    paddingVertical: 8,
  },
  logoutInfo: {
    marginBottom: 16,
  },
  logoutTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },
  logoutDescription: {
    opacity: 0.7,
  },
  logoutButton: {
    borderRadius: 8,
  },
  logoutButtonContent: {
    paddingVertical: 4,
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
  versionText: {
    fontSize: 12,
    opacity: 0.5,
  },
});
