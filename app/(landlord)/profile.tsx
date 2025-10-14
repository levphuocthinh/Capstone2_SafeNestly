import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Card,
  Button,
  Avatar,
  List,
  Switch,
  Divider,
} from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/ui/back-button';

interface LandlordProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  verified: boolean;
  joinDate: string;
  totalListings: number;
  activeListings: number;
  rating: number;
  reviews: number;
  bio: string;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    phoneNotifications: boolean;
  };
}

const mockProfile: LandlordProfile = {
  id: '2',
  name: 'Mike Thompson',
  email: 'landlord@test.com',
  phone: '+1 (555) 123-4567',
  avatar: 'https://via.placeholder.com/100',
  verified: true,
  joinDate: 'January 2023',
  totalListings: 8,
  activeListings: 5,
  rating: 4.7,
  reviews: 23,
  bio: 'Experienced landlord with over 10 years in property management. Committed to providing quality housing and excellent tenant relationships.',
  preferences: {
    notifications: true,
    emailUpdates: true,
    phoneNotifications: false,
  },
};

export default function LandlordProfileScreen() {
  const [profile, setProfile] = useState(mockProfile);

  const handleEditProfile = () => {
    router.push('./edit-profile');
  };

  const handleViewListings = () => {
    router.push('./all-listings');
  };

  const handleViewAnalytics = () => {
    router.push('./analytics');
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

  const handlePhoneToggle = () => {
    setProfile((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        phoneNotifications: !prev.preferences.phoneNotifications,
      },
    }));
  };

  const handleLogout = async () => {
    try {
      // Import logout function from auth utils
      const { logoutUser } = require('../../utils/auth');
      await logoutUser();

      // Navigate to login screen and reset navigation stack
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback navigation
      router.replace('/(auth)/login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton title='Profile' />

      <ScrollView style={styles.scrollContainer}>
        {/* Profile Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerContent}>
              <Avatar.Image size={80} source={{ uri: profile.avatar }} />
              <View style={styles.userInfo}>
                <Text variant='headlineSmall' style={styles.userName}>
                  {profile.name}
                </Text>
                <Text variant='bodyMedium' style={styles.userEmail}>
                  {profile.email}
                </Text>
                <View style={styles.verificationContainer}>
                  {profile.verified && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>✓ Verified</Text>
                    </View>
                  )}
                  <Text variant='bodySmall' style={styles.joinDate}>
                    Member since {profile.joinDate}
                  </Text>
                </View>
              </View>
            </View>

            <Button
              mode='outlined'
              onPress={handleEditProfile}
              style={styles.editButton}
            >
              Edit Profile
            </Button>
          </Card.Content>
        </Card>

        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant='titleLarge' style={styles.sectionTitle}>
              Your Statistics
            </Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text variant='headlineMedium' style={styles.statValue}>
                  {profile.totalListings}
                </Text>
                <Text variant='bodyMedium' style={styles.statLabel}>
                  Total Listings
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text variant='headlineMedium' style={styles.statValue}>
                  {profile.activeListings}
                </Text>
                <Text variant='bodyMedium' style={styles.statLabel}>
                  Active Listings
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text variant='headlineMedium' style={styles.statValue}>
                  {profile.rating}
                </Text>
                <Text variant='bodyMedium' style={styles.statLabel}>
                  Rating
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text variant='headlineMedium' style={styles.statValue}>
                  {profile.reviews}
                </Text>
                <Text variant='bodyMedium' style={styles.statLabel}>
                  Reviews
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Text variant='titleLarge' style={styles.sectionTitle}>
              Quick Actions
            </Text>

            <List.Item
              title='View All Listings'
              description='Manage your property listings'
              left={(props) => <List.Icon {...props} icon='home-group' />}
              right={(props) => <List.Icon {...props} icon='chevron-right' />}
              onPress={handleViewListings}
            />

            <List.Item
              title='Analytics & Reports'
              description='View performance metrics'
              left={(props) => <List.Icon {...props} icon='chart-line' />}
              right={(props) => <List.Icon {...props} icon='chevron-right' />}
              onPress={handleViewAnalytics}
            />

            <List.Item
              title='Edit Profile'
              description='Update your information'
              left={(props) => <List.Icon {...props} icon='account-edit' />}
              right={(props) => <List.Icon {...props} icon='chevron-right' />}
              onPress={handleEditProfile}
            />
          </Card.Content>
        </Card>

        {/* Notification Preferences */}
        <Card style={styles.preferencesCard}>
          <Card.Content>
            <Text variant='titleLarge' style={styles.sectionTitle}>
              Notifications
            </Text>

            <List.Item
              title='Push Notifications'
              description='Get notified about new applicants'
              left={(props) => <List.Icon {...props} icon='bell' />}
              right={() => (
                <Switch
                  value={profile.preferences.notifications}
                  onValueChange={handleNotificationToggle}
                />
              )}
            />

            <List.Item
              title='Email Updates'
              description='Receive weekly reports via email'
              left={(props) => <List.Icon {...props} icon='email' />}
              right={() => (
                <Switch
                  value={profile.preferences.emailUpdates}
                  onValueChange={handleEmailToggle}
                />
              )}
            />

            <List.Item
              title='Phone Notifications'
              description='Get called for urgent matters'
              left={(props) => <List.Icon {...props} icon='phone' />}
              right={() => (
                <Switch
                  value={profile.preferences.phoneNotifications}
                  onValueChange={handlePhoneToggle}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Account Actions */}
        <Card style={styles.accountCard}>
          <Card.Content>
            <Text variant='titleLarge' style={styles.sectionTitle}>
              Account
            </Text>

            <List.Item
              title='Help & Support'
              description='Get help with the app'
              left={(props) => <List.Icon {...props} icon='help-circle' />}
              right={(props) => <List.Icon {...props} icon='chevron-right' />}
            />

            <List.Item
              title='Terms & Privacy'
              description='Read our terms and privacy policy'
              left={(props) => <List.Icon {...props} icon='file-document' />}
              right={(props) => <List.Icon {...props} icon='chevron-right' />}
            />

            <Divider style={styles.divider} />

            <List.Item
              title='Logout'
              description='Sign out of your account'
              left={(props) => <List.Icon {...props} icon='logout' />}
              onPress={handleLogout}
              titleStyle={styles.logoutText}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    opacity: 0.7,
    marginBottom: 8,
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  verifiedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  verifiedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  joinDate: {
    opacity: 0.6,
  },
  editButton: {
    alignSelf: 'center',
  },
  statsCard: {
    margin: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  statLabel: {
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'center',
  },
  actionsCard: {
    margin: 16,
    marginBottom: 8,
  },
  preferencesCard: {
    margin: 16,
    marginBottom: 8,
  },
  accountCard: {
    margin: 16,
    marginBottom: 32,
  },
  divider: {
    marginVertical: 8,
  },
  logoutText: {
    color: '#f44336',
  },
});
