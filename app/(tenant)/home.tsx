import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import {
  Text,
  Searchbar,
  Card,
  Button,
  Chip,
  Avatar,
  FAB,
  IconButton,
} from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { roomService, Room as RoomModel } from '../../services/room.service';
import { getStoredToken } from '../../utils/auth-storage';

interface Room {
  id: string;
  title: string;
  price: number;
  location: string;
  area: number;
  images: string[];
  amenities: string[];
  saved: boolean;
  rating: number;
  reviewCount: number;
  landlord: {
    name: string;
    verified: boolean;
  };
  availableFrom: string;
  roomType: string;
  distanceToCenter: number;
}

export default function TenantHomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Fetch rooms on component mount
  useEffect(() => {
    checkAuthAndFetchRooms();
  }, []);

  const checkAuthAndFetchRooms = async () => {
    try {
      // Check if user is authenticated
      const token = await getStoredToken();
      if (!token) {
        // User not authenticated, redirect to login
        router.replace('/(auth)/login');
        return;
      }

      // User is authenticated, fetch rooms
      await fetchRooms();
    } catch (error) {
      console.error('Auth check failed:', error);
      router.replace('/(auth)/login');
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedRooms = await roomService.getAllRooms();
      setRooms(fetchedRooms);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      setError(err instanceof Error ? err.message : 'Failed to load rooms');
      // Fallback to empty array
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFilter = (filter: string) => {
    setSelectedFilters((prev) => prev.filter((f) => f !== filter));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search logic with your backend
  };

  const handleRoomPress = (roomId: string) => {
    router.push(`/(tenant)/room-details/${roomId}`);
  };

  const handleSaveRoom = (roomId: string) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId ? { ...room, saved: !room.saved } : room,
      ),
    );
  };

  const handleFilterPress = () => {
    router.push('./advanced-filters');
  };

  const handleMapView = () => {
    router.push('./map');
  };

  const renderRoomCard = ({ item }: { item: Room }) => (
    <Card style={styles.roomCard} onPress={() => handleRoomPress(item.id)}>
      <Card.Cover
        source={{
          uri:
            item.images.length > 0
              ? item.images[0]
              : 'https://via.placeholder.com/300x200/6200ee/ffffff?text=No+Image',
        }}
        style={styles.cardImage}
      />
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text variant='titleMedium' style={styles.roomTitle}>
            {item.title}
          </Text>
          <Button
            mode='text'
            icon={item.saved ? 'heart' : 'heart-outline'}
            onPress={() => handleSaveRoom(item.id)}
            style={styles.saveButton}
          >
            {item.saved ? 'Saved' : 'Save'}
          </Button>
        </View>

        <Text variant='bodyMedium' style={styles.roomLocation}>
          {item.location}
        </Text>

        <View style={styles.roomDetails}>
          <Text variant='headlineSmall' style={styles.priceText}>
            ${item.price}/month
          </Text>
          <Text variant='bodyMedium' style={styles.areaText}>
            {item.area}m² • {item.roomType}
          </Text>
        </View>

        {/* Rating and Reviews */}
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>⭐ {item.rating}</Text>
          <Text style={styles.reviewText}>({item.reviewCount} reviews)</Text>
          {item.landlord.verified && (
            <Text style={styles.verifiedText}>✓ Verified Host</Text>
          )}
        </View>

        {/* Availability and Distance */}
        <View style={styles.infoRow}>
          <Text style={styles.availabilityText}>{item.availableFrom}</Text>
          <Text style={styles.distanceText}>
            {item.distanceToCenter}km to center
          </Text>
        </View>

        <View style={styles.amenitiesContainer}>
          {item.amenities.slice(0, 3).map((amenity, index) => (
            <Chip
              key={`${item.id}-${amenity}-${index}`}
              compact
              style={styles.amenityChip}
            >
              {amenity}
            </Chip>
          ))}
          {item.amenities.length > 3 && (
            <Text style={styles.moreAmenities}>
              +{item.amenities.length - 3} more
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Avatar.Icon size={40} icon='account' />
            <View style={styles.userText}>
              <Text style={styles.greeting}>Good morning!</Text>
              <Text variant='headlineMedium' style={styles.userName}>
                Find your perfect room
              </Text>
            </View>
          </View>
          <Button
            mode='text'
            icon='account-circle'
            onPress={() => router.push('/(tenant)/profile')}
          >
            Profile
          </Button>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchRow}>
            <Searchbar
              placeholder='Search by city, address...'
              onChangeText={handleSearch}
              value={searchQuery}
              style={styles.searchBar}
              icon='map-marker'
              onIconPress={handleMapView}
            />
            <View style={styles.buttonContainer}>
              <IconButton
                mode='outlined'
                icon='filter-variant'
                size={22}
                onPress={handleFilterPress}
                style={styles.iconButton}
              />
              <IconButton
                mode='contained'
                icon='map'
                size={22}
                onPress={handleMapView}
                style={styles.iconButton}
              />
            </View>
          </View>
        </View>

        {/* Active Filters */}
        {selectedFilters.length > 0 && (
          <View style={styles.filtersContainer}>
            <Text style={styles.filtersTitle}>Active Filters:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterChips}>
                {selectedFilters.map((filter) => (
                  <Chip
                    key={filter}
                    onClose={() => removeFilter(filter)}
                    style={styles.filterChip}
                  >
                    {filter}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text variant='titleLarge' style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.actionButtons}>
            <Button
              mode='contained-tonal'
              icon='account-multiple'
              onPress={() => router.push('/(tenant)/roommate-matching')}
              style={styles.actionButton}
            >
              Find Roommate
            </Button>
            <Button
              mode='contained-tonal'
              icon='heart'
              onPress={() => router.push('/(tenant)/favorites')}
              style={styles.actionButton}
            >
              Saved Rooms
            </Button>
          </View>
        </View>

        {/* Recommended Rooms */}
        <View style={styles.roomsSection}>
          <Text variant='titleLarge' style={styles.sectionTitle}>
            Recommended for You
          </Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading rooms...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Button mode='contained' onPress={fetchRooms}>
                Retry
              </Button>
            </View>
          ) : rooms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No rooms available</Text>
            </View>
          ) : (
            <FlatList
              data={rooms}
              renderItem={renderRoomCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon='filter'
        style={styles.fab}
        onPress={handleFilterPress}
        label='Filter'
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userText: {
    marginLeft: 12,
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    opacity: 0.7,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchSection: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    elevation: 2,
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
    padding: 0,
  },
  filtersContainer: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  quickActions: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  roomsSection: {
    padding: 20,
    backgroundColor: 'white',
  },
  roomCard: {
    marginBottom: 16,
    elevation: 3,
  },
  cardImage: {
    height: 200,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    margin: 0,
    padding: 0,
  },
  roomLocation: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  roomDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  areaText: {
    fontSize: 14,
    opacity: 0.7,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  reviewText: {
    fontSize: 12,
    opacity: 0.7,
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  availabilityText: {
    fontSize: 12,
    color: '#6200ee',
    fontWeight: '500',
  },
  distanceText: {
    fontSize: 12,
    opacity: 0.7,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  amenityChip: {
    marginRight: 6,
    marginBottom: 4,
  },
  moreAmenities: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#f44336',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
});
