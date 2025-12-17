import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card, Button, Avatar, List, Switch } from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logoutUser } from '@/services/auth.service';
import {
  getUserProfile,
  UserProfile,
  defaultProfile,
} from '@/services/profile.service';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getUserProfile();

      if (result.success && result.profile) {
        setProfile(result.profile);
      } else {
        setError(result.error || 'Failed to load profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Reload profile when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile]),
  );

  const handleEditProfile = () => {
    router.push('./edit-profile');
  };

  const handleRoommatePreferences = () => {
    router.push('./roommate-preferences');
  };

  const handleSearchPreferences = () => {
    router.push('./search-preferences');
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
      await logoutUser();

      // Navigate to login screen and reset navigation stack
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback navigation
      router.replace('/(auth)/login');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#6200ee' />
          <Text style={styles.loadingText}>Đang tải hồ sơ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lỗi: {error}</Text>
          <Button
            mode='contained'
            onPress={async () => {
              setLoading(true);
              setError(null);
              // Retry fetching using service
              try {
                const result = await getUserProfile();
                if (result.success && result.profile) {
                  setProfile(result.profile);
                } else {
                  setError(result.error || 'Failed to load profile');
                }
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : 'An error occurred',
                );
              } finally {
                setLoading(false);
              }
            }}
            style={styles.retryButton}
          >
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Button
            mode='text'
            icon='arrow-left'
            onPress={() => router.back()}
            style={styles.backButton}
          >
            Back
          </Button>
          <Text variant='headlineMedium' style={styles.headerTitle}>
            Hồ Sơ Cá Nhân
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
              <Text variant='headlineSmall' style={styles.userName}>
                {profile.name}
              </Text>
              <View style={styles.verificationContainer}>
                <Text style={styles.userEmail}>{profile.email}</Text>
                {profile.verified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓ Đã xác minh</Text>
                  </View>
                )}
              </View>
              <Text style={styles.memberSince}>
                Thành viên từ {profile.memberSince}
              </Text>
            </View>
            <Button
              mode='outlined'
              onPress={handleEditProfile}
              style={styles.editButton}
            >
              Chỉnh sửa hồ sơ
            </Button>
          </Card.Content>
        </Card>

        {/* Account Settings */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text variant='titleLarge' style={styles.sectionTitle}>
              Tài khoản
            </Text>

            <List.Item
              title='Thông tin cá nhân'
              description='Cập nhật thông tin cá nhân của bạn'
              left={(props) => <List.Icon {...props} icon='account-edit' />}
              right={(props) => <List.Icon {...props} icon='chevron-right' />}
              onPress={handleEditProfile}
            />

            <List.Item
              title='Số điện thoại'
              description={profile.phone}
              left={(props) => <List.Icon {...props} icon='phone' />}
              right={(props) => <List.Icon {...props} icon='chevron-right' />}
              onPress={handleEditProfile}
            />

            <List.Item
              title='Mật khẩu & Bảo mật'
              description='Đổi mật khẩu, xác thực hai yếu tố'
              left={(props) => <List.Icon {...props} icon='lock' />}
              right={(props) => <List.Icon {...props} icon='chevron-right' />}
              onPress={() => router.push('./security')}
            />
          </Card.Content>
        </Card>

        {/* Preferences */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text variant='titleLarge' style={styles.sectionTitle}>
              Tùy chọn
            </Text>

            <List.Item
              title='Tùy chọn bạn cùng phòng'
              description='Cập nhật tùy chọn ghép bạn cùng phòng'
              left={(props) => <List.Icon {...props} icon='account-multiple' />}
              right={(props) => <List.Icon {...props} icon='chevron-right' />}
              onPress={handleRoommatePreferences}
            />

            <List.Item
              title='Tùy chọn tìm kiếm'
              description='Tùy chỉnh tiêu chí tìm phòng của bạn'
              left={(props) => <List.Icon {...props} icon='home-search' />}
              right={(props) => <List.Icon {...props} icon='chevron-right' />}
              onPress={handleSearchPreferences}
            />
          </Card.Content>
        </Card>

        {/* Logout Section */}
        <Card style={styles.logoutCard}>
          <Card.Content>
            <View style={styles.logoutSection}>
              <View style={styles.logoutInfo}>
                <Text variant='titleMedium' style={styles.logoutTitle}>
                  Quản lý tài khoản
                </Text>
                <Text variant='bodyMedium' style={styles.logoutDescription}>
                  Đăng xuất tài khoản SafeNestly của bạn một cách an toàn
                </Text>
              </View>
              <Button
                mode='contained'
                onPress={handleLogout}
                icon='logout-variant'
                style={styles.logoutButton}
                contentStyle={styles.logoutButtonContent}
                buttonColor='#dc3545'
                textColor='white'
              >
                Đăng xuất
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
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    margin: 0,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 60,
  },
  profileCard: {
    margin: 16,
    elevation: 3,
  },
  profileContent: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    opacity: 0.7,
    marginRight: 8,
  },
  verifiedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  verifiedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '600',
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
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 10,
  },
});
