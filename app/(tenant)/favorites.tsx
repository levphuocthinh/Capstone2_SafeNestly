import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, Chip, Searchbar } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SavedRoom {
  id: string;
  title: string;
  price: number;
  location: string;
  area: number;
  image: string;
  amenities: string[];
  dateSaved: string;
}

const mockSavedRooms: SavedRoom[] = [
  {
    id: '1',
    title: 'Cozy Downtown Apartment',
    price: 1200,
    location: 'Downtown, City Center',
    area: 45,
    image: 'https://via.placeholder.com/300x200',
    amenities: ['WiFi', 'Kitchen', 'Air Conditioning'],
    dateSaved: '2 days ago',
  },
  {
    id: '2',
    title: 'Modern Studio Near University',
    price: 800,
    location: 'University District',
    area: 35,
    image: 'https://via.placeholder.com/300x200',
    amenities: ['WiFi', 'Gym', 'Parking'],
    dateSaved: '1 week ago',
  },
];

export default function FavoritesScreen() {
  const [savedRooms, setSavedRooms] = useState(mockSavedRooms);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRoomPress = (roomId: string) => {
    router.push(`/(tenant)/room-details/${roomId}`);
  };

  const handleRemoveRoom = (roomId: string) => {
    setSavedRooms((prev) => prev.filter((room) => room.id !== roomId));
  };

  const handleCompareRooms = () => {
    router.push('./compare-rooms');
  };

  const filteredRooms = savedRooms.filter(
    (room) =>
      room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderRoomCard = ({ item }: { item: SavedRoom }) => (
    <Card style={styles.roomCard} onPress={() => handleRoomPress(item.id)}>
      <Card.Cover source={{ uri: item.image }} style={styles.cardImage} />
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text variant='titleMedium' style={styles.roomTitle}>
            {item.title}
          </Text>
          <Button
            mode='text'
            icon='close'
            onPress={() => handleRemoveRoom(item.id)}
            style={styles.removeButton}
          >
            Remove
          </Button>
        </View>

        <Text variant='bodyMedium' style={styles.roomLocation}>
          {item.location}
        </Text>

        <View style={styles.roomDetails}>
          <Text style={styles.priceText}>${item.price}/month</Text>
          <Text style={styles.areaText}>{item.area}m²</Text>
        </View>

        <View style={styles.amenitiesContainer}>
          {item.amenities.slice(0, 3).map((amenity) => (
            <Chip key={amenity} compact style={styles.amenityChip}>
              {amenity}
            </Chip>
          ))}
        </View>

        <Text style={styles.dateSaved}>Saved {item.dateSaved}</Text>
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
          Saved Rooms
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {savedRooms.length > 0 && (
        <View style={styles.searchSection}>
          <Searchbar
            placeholder='Search saved rooms...'
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />

          <Button
            mode='contained-tonal'
            icon='compare'
            onPress={handleCompareRooms}
            style={styles.compareButton}
          >
            Compare Rooms
          </Button>
        </View>
      )}

      {filteredRooms.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Saved Rooms</Text>
          <Text variant='bodyMedium' style={styles.emptySubtitle}>
            {savedRooms.length === 0
              ? "You haven't saved any rooms yet. Start browsing to save rooms you're interested in!"
              : 'No rooms match your search criteria.'}
          </Text>
          {savedRooms.length === 0 && (
            <Button
              mode='contained'
              onPress={() => router.push('/(tenant)/home')}
              style={styles.browseButton}
            >
              Browse Rooms
            </Button>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredRooms}
          renderItem={renderRoomCard}
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
  compareButton: {
    alignSelf: 'center',
  },
  listContainer: {
    padding: 16,
  },
  roomCard: {
    marginBottom: 16,
    elevation: 3,
  },
  cardImage: {
    height: 180,
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
  removeButton: {
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
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  amenityChip: {
    marginRight: 6,
    marginBottom: 4,
  },
  dateSaved: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic',
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
  browseButton: {
    paddingHorizontal: 24,
  },
});
