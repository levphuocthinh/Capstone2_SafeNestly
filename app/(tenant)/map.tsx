import React, { useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Text, Button, Card, FAB, IconButton } from "react-native-paper";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function MapScreen() {
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  // Mock property data
  const properties = [
    {
      id: 1,
      title: "Modern Studio",
      price: "$1,200/month",
      location: "Downtown",
      coordinates: { latitude: 37.7749, longitude: -122.4194 },
    },
    {
      id: 2,
      title: "Cozy 1BR",
      price: "$1,800/month",
      location: "Mission District",
      coordinates: { latitude: 37.7649, longitude: -122.4094 },
    },
    {
      id: 3,
      title: "Spacious 2BR",
      price: "$2,500/month",
      location: "SOMA",
      coordinates: { latitude: 37.7849, longitude: -122.4294 },
    },
  ];

  const handlePropertyPress = (property: any) => {
    setSelectedProperty(property);
  };

  const handleViewDetails = () => {
    if (selectedProperty) {
      router.push(`/(tenant)/room-details/${selectedProperty.id}`);
    }
  };

  const handleBackToList = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} onPress={handleBackToList} />
        <Text variant="titleLarge" style={styles.headerTitle}>
          Map View
        </Text>
        <IconButton
          icon="filter"
          size={24}
          onPress={() => router.push("./filters")}
        />
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Text variant="headlineSmall" style={styles.mapPlaceholderText}>
            🗺️ Interactive Map
          </Text>
          <Text variant="bodyMedium" style={styles.mapDescription}>
            Map integration would go here
          </Text>
          <Text variant="bodySmall" style={styles.mapNote}>
            (React Native Maps or Google Maps would be integrated here)
          </Text>

          {/* Mock property pins */}
          <View style={styles.mockPinsContainer}>
            {properties.map((property) => (
              <Button
                key={property.id}
                mode="contained"
                compact
                onPress={() => handlePropertyPress(property)}
                style={[
                  styles.propertyPin,
                  selectedProperty?.id === property.id && styles.selectedPin,
                ]}
              >
                ${property.price.split("/")[0].replace("$", "")}
              </Button>
            ))}
          </View>
        </View>
      </View>

      {/* Property Details Card */}
      {selectedProperty && (
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text variant="titleMedium">{selectedProperty.title}</Text>
            <Text variant="bodyMedium" style={styles.price}>
              {selectedProperty.price}
            </Text>
            <Text variant="bodySmall" style={styles.location}>
              📍 {selectedProperty.location}
            </Text>

            <View style={styles.cardActions}>
              <Button
                mode="outlined"
                onPress={() => setSelectedProperty(null)}
                style={styles.actionButton}
              >
                Close
              </Button>
              <Button
                mode="contained"
                onPress={handleViewDetails}
                style={styles.actionButton}
              >
                View Details
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Search in this area FAB */}
      <FAB
        icon="refresh"
        label="Search this area"
        style={styles.searchFab}
        onPress={() => {
          // Implement search in current map area
          console.log("Search in this area");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontWeight: "600",
  },
  mapContainer: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: "#f0f8ff",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  mapPlaceholderText: {
    marginBottom: 8,
    textAlign: "center",
  },
  mapDescription: {
    marginBottom: 4,
    textAlign: "center",
    opacity: 0.7,
  },
  mapNote: {
    textAlign: "center",
    opacity: 0.5,
    fontStyle: "italic",
  },
  mockPinsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  propertyPin: {
    position: "absolute",
    margin: 4,
  },
  selectedPin: {
    transform: [{ scale: 1.2 }],
  },
  detailsCard: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  price: {
    fontWeight: "600",
    color: "#2196F3",
    marginVertical: 4,
  },
  location: {
    opacity: 0.7,
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  searchFab: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
  },
});
