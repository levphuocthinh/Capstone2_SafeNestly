import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
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
import { getRooms, mapRoomDTOToUIRoom } from '../../utils/rooms';

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
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch rooms from API on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const roomsData = await getRooms();
      const mappedRooms = roomsData.map(mapRoomDTOToUIRoom);
      setRooms(mappedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      Alert.alert(
        'Error',
        'Failed to load rooms. Please check your connection and try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRooms();
    setRefreshing(false);
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

  const handleRoommateForm = () => {
    router.push('./roommate-form');
  };

  const handleChatHistory = () => {
    router.push('./chat-history');
  };

  const renderRoomCard = ({ item }: { item: Room }) => (
    <Card style={styles.roomCard} onPress={() => handleRoomPress(item.id)}>
      <Card.Cover
        source={{
          uri: 'https://cdn.thuviennhadat.vn/upload/hinh-anh-bai-viet/HNH/chu-phong-tro-da-nang-co-duoc-tang-gia-thue-sau-khi-cai-tao-phong-tro-khong.jpg',
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
            {item.price}đ/month
          </Text>
          <Text variant='bodyMedium' style={styles.areaText}>
            {item.area}m² • {item.roomType}
          </Text>
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
          <View style={styles.headerActions}>
            <IconButton
              icon='message-text-outline'
              size={26}
              onPress={handleChatHistory}
            />
            <Button
              mode='text'
              icon='account-circle'
              onPress={() => router.push('/(tenant)/profile')}
            >
              Profile
            </Button>
          </View>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <Searchbar
            placeholder='Search by city, address...'
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
            icon='map-marker'
            onIconPress={handleMapView}
          />

          <View style={styles.searchActions}>
            <Button
              mode='outlined'
              icon='filter-variant'
              onPress={handleFilterPress}
              style={styles.filterButton}
            >
              Filters
            </Button>
            <Button
              mode='contained'
              icon='map'
              onPress={handleMapView}
              style={styles.mapButton}
            >
              Map
            </Button>
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
              onPress={handleRoommateForm}
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
              <ActivityIndicator size='large' color='#6200ee' />
              <Text style={styles.loadingText}>Loading rooms...</Text>
            </View>
          ) : rooms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No rooms available at the moment
              </Text>
              <Button
                mode='contained'
                onPress={fetchRooms}
                style={styles.retryButton}
              >
                Retry
              </Button>
            </View>
          ) : (
            <FlatList
              data={rooms}
              renderItem={renderRoomCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon='plus'
        style={styles.fab}
        onPress={handleFilterPress}
        label='New Search'
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  searchActions: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flex: 1,
  },
  mapButton: {
    flex: 1,
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
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
  },
});
