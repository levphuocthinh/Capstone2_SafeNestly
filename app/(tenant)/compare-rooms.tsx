import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, Button, IconButton, Chip } from "react-native-paper";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

interface Room {
  id: number;
  title: string;
  price: string;
  location: string;
  size: string;
  roomType: string;
  amenities: string[];
  safetyScore: number;
  image: string;
}

export default function CompareRoomsScreen() {
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([
    {
      id: 1,
      title: "Modern Downtown Studio",
      price: "$1,200/month",
      location: "Downtown District",
      size: "450 sq ft",
      roomType: "Studio",
      amenities: ["WiFi", "Gym", "Pool", "Parking"],
      safetyScore: 9.2,
      image: "studio1.jpg",
    },
    {
      id: 2,
      title: "Cozy 1BR Apartment",
      price: "$1,500/month",
      location: "University Area",
      size: "650 sq ft",
      roomType: "1 Bedroom",
      amenities: ["WiFi", "Laundry", "Pet-friendly", "Balcony"],
      safetyScore: 8.8,
      image: "apartment1.jpg",
    },
  ]);

  const comparisonCategories = [
    { key: "price", label: "Monthly Rent" },
    { key: "location", label: "Location" },
    { key: "size", label: "Size" },
    { key: "roomType", label: "Room Type" },
    { key: "safetyScore", label: "Safety Score" },
    { key: "amenities", label: "Amenities" },
  ];

  const removeRoom = (roomId: number) => {
    setSelectedRooms((prev) => prev.filter((room) => room.id !== roomId));
  };

  const renderComparisonRow = (category: any) => (
    <View key={category.key} style={styles.comparisonRow}>
      <View style={styles.categoryCell}>
        <Text variant="titleSmall" style={styles.categoryLabel}>
          {category.label}
        </Text>
      </View>
      {selectedRooms.map((room) => (
        <View key={`${room.id}-${category.key}`} style={styles.dataCell}>
          {category.key === "amenities" ? (
            <View style={styles.amenitiesContainer}>
              {room.amenities.slice(0, 2).map((amenity) => (
                <Chip key={amenity} compact style={styles.amenityChip}>
                  {amenity}
                </Chip>
              ))}
              {room.amenities.length > 2 && (
                <Text variant="bodySmall" style={styles.moreAmenities}>
                  +{room.amenities.length - 2} more
                </Text>
              )}
            </View>
          ) : category.key === "safetyScore" ? (
            <View style={styles.scoreContainer}>
              <Text
                variant="titleMedium"
                style={[
                  styles.scoreText,
                  {
                    color:
                      room.safetyScore >= 9
                        ? "#4CAF50"
                        : room.safetyScore >= 8
                        ? "#FF9800"
                        : "#F44336",
                  },
                ]}
              >
                {room.safetyScore}/10
              </Text>
            </View>
          ) : (
            <Text variant="bodyMedium" style={styles.dataText}>
              {room[category.key as keyof Room]}
            </Text>
          )}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
        <Text variant="titleLarge" style={styles.headerTitle}>
          Compare Rooms
        </Text>
        <IconButton
          icon="plus"
          size={24}
          onPress={() => {
            // Add more rooms to compare
            router.back();
          }}
        />
      </View>

      {selectedRooms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            No Rooms to Compare
          </Text>
          <Text variant="bodyLarge" style={styles.emptyDescription}>
            Add rooms to your favorites to compare them here
          </Text>
          <Button
            mode="contained"
            onPress={() => router.back()}
            style={styles.exploreButton}
          >
            Explore Rooms
          </Button>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* Room Headers */}
          <View style={styles.roomHeaders}>
            <View style={styles.categoryHeaderCell} />
            {selectedRooms.map((room) => (
              <Card key={room.id} style={styles.roomHeaderCard}>
                <Card.Content style={styles.roomHeaderContent}>
                  <IconButton
                    icon="close"
                    size={16}
                    style={styles.removeButton}
                    onPress={() => removeRoom(room.id)}
                  />
                  <Text variant="titleSmall" style={styles.roomHeaderTitle}>
                    {room.title}
                  </Text>
                  <Text variant="bodySmall" style={styles.roomHeaderPrice}>
                    {room.price}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </View>

          {/* Comparison Table */}
          <View style={styles.comparisonTable}>
            {comparisonCategories.map(renderComparisonRow)}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            {selectedRooms.map((room) => (
              <Button
                key={room.id}
                mode="contained"
                style={styles.actionButton}
                onPress={() => router.push(`../room-details/${room.id}`)}
              >
                View Details
              </Button>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    marginBottom: 12,
    textAlign: "center",
  },
  emptyDescription: {
    marginBottom: 20,
    textAlign: "center",
    opacity: 0.7,
  },
  exploreButton: {
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
  },
  roomHeaders: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: 8,
  },
  categoryHeaderCell: {
    width: 120,
  },
  roomHeaderCard: {
    flex: 1,
    marginHorizontal: 4,
    position: "relative",
  },
  roomHeaderContent: {
    padding: 12,
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  roomHeaderTitle: {
    marginBottom: 4,
    fontSize: 12,
  },
  roomHeaderPrice: {
    fontWeight: "600",
    color: "#2196F3",
  },
  comparisonTable: {
    paddingHorizontal: 16,
  },
  comparisonRow: {
    flexDirection: "row",
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  categoryCell: {
    width: 120,
    padding: 12,
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  categoryLabel: {
    fontWeight: "600",
  },
  dataCell: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
    marginHorizontal: 4,
  },
  dataText: {
    textAlign: "center",
  },
  amenitiesContainer: {
    alignItems: "center",
  },
  amenityChip: {
    marginVertical: 2,
  },
  moreAmenities: {
    marginTop: 4,
    opacity: 0.7,
  },
  scoreContainer: {
    alignItems: "center",
  },
  scoreText: {
    fontWeight: "600",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
});
