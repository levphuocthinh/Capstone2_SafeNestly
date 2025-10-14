import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  Avatar,
  ProgressBar,
  Searchbar,
} from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Roommate {
  id: string;
  name: string;
  age: number;
  occupation: string;
  hometown: string;
  avatar: string;
  compatibilityRate: number;
  habits: string[];
  lifestyle: string[];
  description: string;
  city: string;
}

const mockRoommates: Roommate[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 24,
    occupation: 'Software Engineer',
    hometown: 'Los Angeles',
    avatar: 'https://via.placeholder.com/100x100',
    compatibilityRate: 92,
    habits: ['Non-smoker', 'Early bird', 'Fitness enthusiast'],
    lifestyle: ['Modern & Tech-savvy', 'Minimalist & Clean'],
    description:
      'I love coding, hiking, and cooking healthy meals. Looking for a clean and quiet roommate.',
    city: 'San Francisco',
  },
  {
    id: '2',
    name: 'Mike Chen',
    age: 26,
    occupation: 'Graphic Designer',
    hometown: 'Seattle',
    avatar: 'https://via.placeholder.com/100x100',
    compatibilityRate: 87,
    habits: ['Non-smoker', 'Night owl', 'Social person'],
    lifestyle: ['Social & Outgoing', 'Modern & Tech-savvy'],
    description:
      'Creative professional who enjoys good music, movies, and meeting new people.',
    city: 'San Francisco',
  },
];

export default function RoommateMatchingScreen() {
  const [roommates] = useState(mockRoommates);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRoommatePress = (roommateId: string) => {
    router.push(`./roommate-profile/${roommateId}`);
  };

  const handleConnect = (roommateId: string) => {
    const roommate = roommates.find((r) => r.id === roommateId);
    if (roommate) {
      router.push(`./chat/${roommate.name}`);
    }
  };

  const handleUpdatePreferences = () => {
    router.push('./roommate-preferences');
  };

  const filteredRoommates = roommates.filter(
    (roommate) =>
      roommate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roommate.occupation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roommate.hometown.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getCompatibilityColor = (rate: number) => {
    if (rate >= 90) return '#4CAF50';
    if (rate >= 75) return '#FF9800';
    return '#F44336';
  };

  const renderRoommateCard = ({ item }: { item: Roommate }) => (
    <Card
      style={styles.roommateCard}
      onPress={() => handleRoommatePress(item.id)}
    >
      <Card.Content style={styles.cardContent}>
        {/* Compatibility Badge */}
        <View style={styles.compatibilityBadge}>
          <Text
            style={[
              styles.compatibilityText,
              { color: getCompatibilityColor(item.compatibilityRate) },
            ]}
          >
            {item.compatibilityRate}% Match
          </Text>
          <ProgressBar
            progress={item.compatibilityRate / 100}
            color={getCompatibilityColor(item.compatibilityRate)}
            style={styles.progressBar}
          />
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Avatar.Image
            size={80}
            source={{ uri: item.avatar }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text variant='titleMedium' style={styles.roommateeName}>
              {item.name}
            </Text>
            <Text style={styles.ageOccupation}>
              {item.age} • {item.occupation}
            </Text>
            <Text style={styles.hometown}>
              From {item.hometown} • Looking in {item.city}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text variant='bodyMedium' style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Habits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habits</Text>
          <View style={styles.chipContainer}>
            {item.habits.slice(0, 3).map((habit) => (
              <Chip key={habit} compact style={styles.habitChip}>
                {habit}
              </Chip>
            ))}
            {item.habits.length > 3 && (
              <Text style={styles.moreText}>
                +{item.habits.length - 3} more
              </Text>
            )}
          </View>
        </View>

        {/* Lifestyle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lifestyle</Text>
          <View style={styles.chipContainer}>
            {item.lifestyle.map((lifestyle) => (
              <Chip key={lifestyle} compact style={styles.lifestyleChip}>
                {lifestyle}
              </Chip>
            ))}
          </View>
        </View>

        {/* Connect Button */}
        <Button
          mode='contained'
          onPress={() => handleConnect(item.id)}
          style={styles.connectButton}
          icon='message'
        >
          Connect
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button
          mode='text'
          icon='arrow-left'
          onPress={() => router.back()}
          style={styles.backButton}
        >
          Back
        </Button>
        <Text variant='headlineSmall' style={styles.headerTitle}>
          Roommate Matching
        </Text>
        <Button mode='text' icon='tune' onPress={handleUpdatePreferences}>
          Preferences
        </Button>
      </View>

      <View style={styles.searchSection}>
        <Searchbar
          placeholder='Search roommates...'
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {filteredRoommates.length} potential roommates found
          </Text>
          <Text style={styles.aiText}>Powered by AI Matching</Text>
        </View>
      </View>

      {filteredRoommates.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Roommates Found</Text>
          <Text variant='bodyMedium' style={styles.emptySubtitle}>
            {roommates.length === 0
              ? 'Update your preferences to find compatible roommates!'
              : 'No roommates match your search criteria.'}
          </Text>
          <Button
            mode='contained'
            onPress={handleUpdatePreferences}
            style={styles.preferencesButton}
          >
            Update Preferences
          </Button>
        </View>
      ) : (
        <FlatList
          data={filteredRoommates}
          renderItem={renderRoommateCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    margin: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  searchSection: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    marginBottom: 12,
    elevation: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  aiText: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  listContainer: {
    padding: 16,
  },
  roommateCard: {
    marginBottom: 16,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  compatibilityBadge: {
    marginBottom: 16,
  },
  compatibilityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  profileSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  roommateeName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ageOccupation: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  hometown: {
    fontSize: 14,
    opacity: 0.7,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  habitChip: {
    backgroundColor: '#E3F2FD',
    marginBottom: 4,
  },
  lifestyleChip: {
    backgroundColor: '#F3E5F5',
    marginBottom: 4,
  },
  moreText: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  connectButton: {
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
    lineHeight: 24,
  },
  preferencesButton: {
    paddingHorizontal: 24,
  },
});
