import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import {
  Text,
  Card,
  Button,
  Chip,
  Avatar,
  Divider,
  List,
} from "react-native-paper";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface RoomDetails {
  id: string;
  title: string;
  price: number;
  location: string;
  area: number;
  images: string[];
  amenities: string[];
  description: string;
  landlord: {
    name: string;
    avatar: string;
    rating: number;
    verified: boolean;
    responseTime: string;
    joinedDate: string;
  };
  safety: {
    securityLevel: "Low" | "Medium" | "High" | "Very High";
    securityScore: number; // 1-10
    crimeRate: "Low" | "Medium" | "High";
    hospitalDistance: string;
    busStationDistance: string;
    policeStationDistance: string;
    neighborhoodWatch: boolean;
    securityCameras: boolean;
    securedEntrance: boolean;
    lighting: "Poor" | "Fair" | "Good" | "Excellent";
  };
  neighborhood: {
    walkability: number; // 1-10
    transitScore: number; // 1-10
    bikeScore: number; // 1-10
    noiseLevel: "Quiet" | "Moderate" | "Busy" | "Very Busy";
    demographics: string;
  };
  saved: boolean;
  reviewCount: number;
  overallRating: number;
}

const mockRoomDetails: RoomDetails = {
  id: "1",
  title: "Cozy Downtown Apartment",
  price: 1200,
  location: "Downtown, City Center",
  area: 45,
  images: [
    "https://via.placeholder.com/400x300/6200ee/ffffff?text=Living+Room",
    "https://via.placeholder.com/400x300/4CAF50/ffffff?text=Kitchen",
    "https://via.placeholder.com/400x300/FF9800/ffffff?text=Bedroom",
    "https://via.placeholder.com/400x300/2196F3/ffffff?text=Bathroom",
    "https://via.placeholder.com/400x300/9C27B0/ffffff?text=Balcony",
  ],
  amenities: [
    "WiFi",
    "Kitchen",
    "Air Conditioning",
    "Washing Machine",
    "Balcony",
    "Parking",
    "Gym Access",
    "Security System",
  ],
  description:
    "Beautiful and modern apartment in the heart of downtown. Perfect for young professionals or students. Close to public transportation, restaurants, and shopping centers. The building features 24/7 security, modern amenities, and excellent transport links.",
  landlord: {
    name: "John Smith",
    avatar: "https://via.placeholder.com/80x80",
    rating: 4.8,
    verified: true,
    responseTime: "Usually responds within 1 hour",
    joinedDate: "Member since 2019",
  },
  safety: {
    securityLevel: "High",
    securityScore: 8.5,
    crimeRate: "Low",
    hospitalDistance: "0.5 km",
    busStationDistance: "0.2 km",
    policeStationDistance: "0.8 km",
    neighborhoodWatch: true,
    securityCameras: true,
    securedEntrance: true,
    lighting: "Excellent",
  },
  neighborhood: {
    walkability: 9,
    transitScore: 8,
    bikeScore: 7,
    noiseLevel: "Moderate",
    demographics: "Young professionals and students",
  },
  saved: false,
  reviewCount: 34,
  overallRating: 4.7,
};

export default function RoomDetailsScreen() {
  const [room, setRoom] = useState(mockRoomDetails);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleSaveRoom = () => {
    setRoom((prev) => ({ ...prev, saved: !prev.saved }));
  };

  const handleContactLandlord = () => {
    router.push(`../chat/${room.landlord.name}`);
  };

  const handleCallLandlord = () => {
    // Implement call functionality
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Button
            mode="text"
            icon="arrow-left"
            onPress={handleBack}
            style={styles.backButton}
          >
            Back
          </Button>
          <Button
            mode="text"
            icon={room.saved ? "heart" : "heart-outline"}
            onPress={handleSaveRoom}
          >
            {room.saved ? "Saved" : "Save"}
          </Button>
        </View>

        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              setCurrentImageIndex(index);
            }}
          >
            {room.images.map((image, index) => (
              <Card.Cover
                key={`image-${room.id}-${index}`}
                source={{ uri: image }}
                style={styles.roomImage}
              />
            ))}
          </ScrollView>
          <View style={styles.imageIndicator}>
            {room.images.map((image, index) => (
              <View
                key={`indicator-${room.id}-${index}`}
                style={[
                  styles.indicator,
                  index === currentImageIndex && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Room Information */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.roomTitle}>
              {room.title}
            </Text>
            <Text variant="bodyLarge" style={styles.roomLocation}>
              {room.location}
            </Text>

            <View style={styles.priceAreaContainer}>
              <Text style={styles.priceText}>${room.price}/month</Text>
              <Text style={styles.areaText}>{room.area}m²</Text>
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>Description</Text>
            <Text variant="bodyMedium" style={styles.description}>
              {room.description}
            </Text>

            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesContainer}>
              {room.amenities.map((amenity) => (
                <Chip key={amenity} style={styles.amenityChip}>
                  {amenity}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Safety Information */}
        <Card style={styles.safetyCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Safety Information</Text>
            <List.Item
              title="Security Level"
              description={room.safety.securityLevel}
              left={(props) => <List.Icon {...props} icon="shield-check" />}
            />
            <List.Item
              title="Nearest Hospital"
              description={room.safety.hospitalDistance}
              left={(props) => <List.Icon {...props} icon="hospital-box" />}
            />
            <List.Item
              title="Bus Station"
              description={room.safety.busStationDistance}
              left={(props) => <List.Icon {...props} icon="bus" />}
            />
          </Card.Content>
        </Card>

        {/* Landlord Information */}
        <Card style={styles.landlordCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Landlord</Text>
            <View style={styles.landlordInfo}>
              <Avatar.Image size={60} source={{ uri: room.landlord.avatar }} />
              <View style={styles.landlordDetails}>
                <View style={styles.landlordName}>
                  <Text variant="titleMedium" style={styles.landlordNameText}>
                    {room.landlord.name}
                  </Text>
                  {room.landlord.verified && (
                    <Chip
                      icon="check-circle"
                      compact
                      style={styles.verifiedChip}
                    >
                      Verified
                    </Chip>
                  )}
                </View>
                <Text style={styles.ratingText}>
                  ⭐ {room.landlord.rating}/5.0 Rating
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Contact Actions */}
      <View style={styles.contactActions}>
        <Button
          mode="outlined"
          icon="phone"
          onPress={handleCallLandlord}
          style={styles.callButton}
        >
          Call
        </Button>
        <Button
          mode="contained"
          icon="message"
          onPress={handleContactLandlord}
          style={styles.chatButton}
        >
          Contact Landlord
        </Button>
      </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
  },
  backButton: {
    margin: 0,
  },
  imageContainer: {
    position: "relative",
  },
  roomImage: {
    width: width,
    height: 250,
  },
  imageIndicator: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  activeIndicator: {
    backgroundColor: "white",
  },
  infoCard: {
    margin: 16,
    elevation: 3,
  },
  roomTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  roomLocation: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 16,
  },
  priceAreaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  priceText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6200ee",
  },
  areaText: {
    fontSize: 16,
    opacity: 0.7,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  amenityChip: {
    marginBottom: 8,
  },
  safetyCard: {
    margin: 16,
    marginTop: 0,
    elevation: 3,
  },
  landlordCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 100,
    elevation: 3,
  },
  landlordInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  landlordDetails: {
    marginLeft: 16,
    flex: 1,
  },
  landlordName: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  landlordNameText: {
    fontSize: 18,
    marginRight: 8,
  },
  verifiedChip: {
    backgroundColor: "#4CAF50",
  },
  ratingText: {
    fontSize: 14,
    opacity: 0.7,
  },
  contactActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: 12,
  },
  callButton: {
    flex: 1,
  },
  chatButton: {
    flex: 2,
  },
});
