import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  Avatar,
  ProgressBar,
  Searchbar,
  HelperText,
} from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Roommate {
  id: string;
  backendUserId?: number;
  email?: string;
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

const transformApiRoommates = (data: unknown): Roommate[] => {
  if (!Array.isArray(data)) {
    return [];
  }

  const currentYear = new Date().getFullYear();

  const pickValue = (item: Record<string, unknown>, keys: string[]) => {
    for (const key of keys) {
      const value = item[key];
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }
    return undefined;
  };

  return data.map((entry, index) => {
    const item = (entry ?? {}) as Record<string, unknown>;
    const backendUserIdRaw = pickValue(item, ['userId', 'user_id', 'id']);
    const backendUserId =
      typeof backendUserIdRaw === 'number'
        ? backendUserIdRaw
        : Number.parseInt(String(backendUserIdRaw ?? ''), 10);

    const emailValue = pickValue(item, ['email', 'userEmail', 'username']);

    const rawHobbies =
      pickValue(item, ['hobbies', 'habit_list', 'habit']) ?? item.hobbies;
    const rawLifestyle =
      pickValue(item, ['lifestyle', 'lifestyleTags', 'lifestyle_tags']) ??
      item.lifestyle;

    const parseStringArray = (value: unknown): string[] => {
      if (Array.isArray(value)) {
        return value
          .map((v) => (typeof v === 'string' ? v.trim() : ''))
          .filter(Boolean);
      }
      if (typeof value === 'string') {
        return value
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean);
      }
      return [];
    };

    const yob = pickValue(item, ['yob', 'year_of_birth', 'birthYear']) as
      | string
      | number
      | undefined;
    const ageFromYob =
      yob && !Number.isNaN(Number(yob)) ? currentYear - Number(yob) : undefined;

    const compatibilityRaw = Number(
      (pickValue(item, [
        'matchScore',
        'match_score',
        'compatibility',
        'compatibilityRate',
        'compatibility_rate',
        'score',
      ]) as number | string | undefined) ?? 85,
    );
    const compatibilityRate = Number.isFinite(compatibilityRaw)
      ? Math.min(Math.max(Math.round(compatibilityRaw), 0), 100)
      : 85;

    const name =
      (pickValue(item, ['fullName', 'full_name', 'name', 'username']) as
        | string
        | undefined) || '';
    const hometown =
      (pickValue(item, ['hometown', 'origin']) as string | undefined) ||
      'Chưa rõ';

    return {
      id: String(
        pickValue(item, ['userId', 'user_id', 'id']) ?? `api-${index}`,
      ),
      backendUserId: Number.isFinite(backendUserId) ? backendUserId : undefined,
      email: typeof emailValue === 'string' ? emailValue : undefined,
      name: name.length > 0 ? name : `Ứng viên ${index + 1}`,
      age:
        typeof item.age === 'number' && !Number.isNaN(item.age)
          ? item.age
          : ageFromYob && Number.isFinite(ageFromYob)
            ? ageFromYob
            : 0,
      occupation:
        (pickValue(item, ['job', 'occupation']) as string | undefined) ||
        'Đang cập nhật',
      hometown,
      avatar:
        (pickValue(item, ['avatar', 'avatarUrl']) as string | undefined) ||
        'https://via.placeholder.com/100x100?text=Roomie',
      compatibilityRate,
      habits: parseStringArray(rawHobbies),
      lifestyle: parseStringArray(rawLifestyle),
      description:
        (pickValue(item, ['bio', 'description', 'more']) as
          | string
          | undefined) || 'Ứng viên phù hợp với tiêu chí của bạn.',
      city:
        (pickValue(item, ['city', 'location', 'searching_in']) as
          | string
          | undefined) || 'Không rõ',
    };
  });
};

export default function RoommateMatchingScreen() {
  const { recommendations } = useLocalSearchParams<{
    recommendations?: string | string[];
  }>();
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      setLoading(true);
      setError('');
      const recommendationPayload = Array.isArray(recommendations)
        ? recommendations[recommendations.length - 1]
        : recommendations;

      if (recommendationPayload) {
        const parsed = JSON.parse(recommendationPayload);
        console.log('Parsed recommendations payload:', parsed);
        const transformed = transformApiRoommates(parsed);
        console.log('Transformed roommates:', transformed);
        setRoommates(transformed);
      } else {
        setRoommates([]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể đọc dữ liệu gợi ý từ máy chủ.',
      );
      setRoommates([]);
    } finally {
      setLoading(false);
    }
  }, [recommendations]);

  const handleRoommatePress = (roommateId: string) => {
    router.push(`./roommate-profile/${roommateId}`);
  };

  const handleConnect = (roommateId: string) => {
    const roommate = roommates.find((r) => r.id === roommateId);
    if (!roommate) {
      return;
    }

    router.push({
      pathname: './chat/[name]',
      params: {
        name: roommate.name,
        roommateId: roommate.id,
        backendUserId: roommate.backendUserId
          ? String(roommate.backendUserId)
          : undefined,
        roommateEmail: roommate.email,
      },
    });
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
            {loading
              ? 'Đang tải gợi ý...'
              : `${filteredRoommates.length} potential roommates found`}
          </Text>
          <Text style={styles.aiText}>Powered by AI Matching</Text>
        </View>
        {error ? (
          <HelperText type='error' visible>
            {error}
          </HelperText>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size='large' />
        </View>
      ) : filteredRoommates.length === 0 ? (
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
          keyExtractor={(item, index) => `${item.id}-${index}`}
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
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
});
