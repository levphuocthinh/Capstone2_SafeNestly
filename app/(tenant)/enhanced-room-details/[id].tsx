import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Card,
  Button,
  Chip,
  Avatar,
  Divider,
  ProgressBar,
  IconButton,
} from "react-native-paper";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "../../../components/ui/back-button";

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

export default function EnhancedRoomDetailsScreen() {
  const [room, setRoom] = useState(mockRoomDetails);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleSaveRoom = () => {
    setRoom((prev) => ({ ...prev, saved: !prev.saved }));
  };

  const handleContactLandlord = () => {
    router.push(`../chat/${room.landlord.name}`);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === room.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? room.images.length - 1 : prev - 1
    );
  };

  const getSecurityColor = (level: string): string => {
    switch (level) {
      case "Very High":
        return "#4CAF50"; // Green
      case "High":
        return "#8BC34A"; // Light Green
      case "Medium":
        return "#FF9800"; // Orange
      case "Low":
        return "#F44336"; // Red
      default:
        return "#9E9E9E"; // Grey
    }
  };

  const getCrimeRateColor = (rate: string): string => {
    switch (rate) {
      case "Low":
        return "#4CAF50"; // Green
      case "Medium":
        return "#FF9800"; // Orange
      case "High":
        return "#F44336"; // Red
      default:
        return "#9E9E9E"; // Grey
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 8) return "#4CAF50"; // Green
    if (score >= 6) return "#8BC34A"; // Light Green
    if (score >= 4) return "#FF9800"; // Orange
    return "#F44336"; // Red
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton title="Room Details" />

      <ScrollView style={styles.scrollContainer}>
        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          <TouchableOpacity
            style={styles.imageWrapper}
            onPress={() => {
              /* Could implement full screen image view */
            }}
          >
            <Text style={styles.imageCounter}>
              {currentImageIndex + 1} / {room.images.length}
            </Text>
          </TouchableOpacity>

          <IconButton
            icon="chevron-left"
            size={30}
            onPress={prevImage}
            style={styles.navButton}
            iconColor="white"
          />

          <IconButton
            icon="chevron-right"
            size={30}
            onPress={nextImage}
            style={[styles.navButton, styles.rightButton]}
            iconColor="white"
          />

          {/* Image indicators */}
          <View style={styles.indicatorContainer}>
            {room.images.map((_, index) => (
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
            <View style={styles.headerRow}>
              <View style={styles.titleSection}>
                <Text variant="headlineMedium" style={styles.roomTitle}>
                  {room.title}
                </Text>
                <Text variant="bodyLarge" style={styles.roomLocation}>
                  {room.location}
                </Text>
              </View>
              <Button
                mode={room.saved ? "contained" : "outlined"}
                icon={room.saved ? "heart" : "heart-outline"}
                onPress={handleSaveRoom}
                compact
              >
                {room.saved ? "Saved" : "Save"}
              </Button>
            </View>

            <View style={styles.priceRow}>
              <Text variant="headlineLarge" style={styles.priceText}>
                ${room.price}/month
              </Text>
              <Text variant="bodyLarge" style={styles.areaText}>
                {room.area}m²
              </Text>
            </View>

            {/* Rating */}
            <View style={styles.ratingRow}>
              <Text style={styles.ratingText}>
                ⭐ {room.overallRating} ({room.reviewCount} reviews)
              </Text>
            </View>

            <Divider style={styles.divider} />

            <Text variant="bodyLarge" style={styles.description}>
              {room.description}
            </Text>
          </Card.Content>
        </Card>

        {/* Safety & Security Information */}
        <Card style={styles.safetyCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              🛡️ Safety & Security
            </Text>

            {/* Security Level with Color Scale */}
            <View style={styles.securityLevelContainer}>
              <Text variant="titleMedium" style={styles.subsectionTitle}>
                Security Level
              </Text>
              <View style={styles.securityDisplay}>
                <View
                  style={[
                    styles.securityBadge,
                    {
                      backgroundColor: getSecurityColor(
                        room.safety.securityLevel
                      ),
                    },
                  ]}
                >
                  <Text style={styles.securityBadgeText}>
                    {room.safety.securityLevel}
                  </Text>
                </View>
                <Text style={styles.securityScore}>
                  {room.safety.securityScore}/10
                </Text>
              </View>
            </View>

            {/* Crime Rate */}
            <View style={styles.crimeRateContainer}>
              <Text variant="titleMedium" style={styles.subsectionTitle}>
                Area Crime Rate
              </Text>
              <View
                style={[
                  styles.crimeRateBadge,
                  { backgroundColor: getCrimeRateColor(room.safety.crimeRate) },
                ]}
              >
                <Text style={styles.crimeRateText}>
                  {room.safety.crimeRate} Crime Rate
                </Text>
              </View>
            </View>

            {/* Safety Features */}
            <View style={styles.safetyFeatures}>
              <Text variant="titleMedium" style={styles.subsectionTitle}>
                Safety Features
              </Text>
              <View style={styles.featuresGrid}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>
                    {room.safety.securityCameras ? "✅" : "❌"}
                  </Text>
                  <Text style={styles.featureText}>Security Cameras</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>
                    {room.safety.securedEntrance ? "✅" : "❌"}
                  </Text>
                  <Text style={styles.featureText}>Secured Entrance</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>
                    {room.safety.neighborhoodWatch ? "✅" : "❌"}
                  </Text>
                  <Text style={styles.featureText}>Neighborhood Watch</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>💡</Text>
                  <Text style={styles.featureText}>
                    {room.safety.lighting} Lighting
                  </Text>
                </View>
              </View>
            </View>

            {/* Distance to Important Places */}
            <View style={styles.distancesContainer}>
              <Text variant="titleMedium" style={styles.subsectionTitle}>
                Distance to Key Locations
              </Text>
              <View style={styles.distanceItem}>
                <Text style={styles.distanceIcon}>🏥</Text>
                <Text style={styles.distanceText}>
                  Hospital: {room.safety.hospitalDistance}
                </Text>
              </View>
              <View style={styles.distanceItem}>
                <Text style={styles.distanceIcon}>🚌</Text>
                <Text style={styles.distanceText}>
                  Bus Station: {room.safety.busStationDistance}
                </Text>
              </View>
              <View style={styles.distanceItem}>
                <Text style={styles.distanceIcon}>👮</Text>
                <Text style={styles.distanceText}>
                  Police Station: {room.safety.policeStationDistance}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Neighborhood Information */}
        <Card style={styles.neighborhoodCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              🏘️ Neighborhood
            </Text>

            <View style={styles.scoresContainer}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Walkability</Text>
                <View style={styles.scoreBar}>
                  <ProgressBar
                    progress={room.neighborhood.walkability / 10}
                    color={getScoreColor(room.neighborhood.walkability)}
                    style={styles.progressBar}
                  />
                  <Text style={styles.scoreValue}>
                    {room.neighborhood.walkability}/10
                  </Text>
                </View>
              </View>

              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Transit Score</Text>
                <View style={styles.scoreBar}>
                  <ProgressBar
                    progress={room.neighborhood.transitScore / 10}
                    color={getScoreColor(room.neighborhood.transitScore)}
                    style={styles.progressBar}
                  />
                  <Text style={styles.scoreValue}>
                    {room.neighborhood.transitScore}/10
                  </Text>
                </View>
              </View>

              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Bike Score</Text>
                <View style={styles.scoreBar}>
                  <ProgressBar
                    progress={room.neighborhood.bikeScore / 10}
                    color={getScoreColor(room.neighborhood.bikeScore)}
                    style={styles.progressBar}
                  />
                  <Text style={styles.scoreValue}>
                    {room.neighborhood.bikeScore}/10
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.neighborhoodInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Noise Level:</Text>
                <Text style={styles.infoValue}>
                  {room.neighborhood.noiseLevel}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Demographics:</Text>
                <Text style={styles.infoValue}>
                  {room.neighborhood.demographics}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Amenities */}
        <Card style={styles.amenitiesCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              ✨ Amenities
            </Text>
            <View style={styles.amenitiesContainer}>
              {room.amenities.map((amenity, index) => (
                <Chip
                  key={`amenity-${room.id}-${index}`}
                  style={styles.amenityChip}
                  icon="check"
                >
                  {amenity}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Landlord Information */}
        <Card style={styles.landlordCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              👤 Landlord
            </Text>
            <View style={styles.landlordInfo}>
              <Avatar.Image
                size={60}
                source={{ uri: room.landlord.avatar }}
                style={styles.landlordAvatar}
              />
              <View style={styles.landlordDetails}>
                <Text variant="titleMedium" style={styles.landlordName}>
                  {room.landlord.name}
                  {room.landlord.verified && (
                    <Text style={styles.verifiedBadge}> ✓ Verified</Text>
                  )}
                </Text>
                <Text style={styles.landlordRating}>
                  ⭐ {room.landlord.rating} rating
                </Text>
                <Text style={styles.landlordInfo}>
                  {room.landlord.responseTime}
                </Text>
                <Text style={styles.landlordJoined}>
                  {room.landlord.joinedDate}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Fixed Bottom Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          mode="outlined"
          onPress={handleContactLandlord}
          style={styles.contactButton}
          icon="message"
        >
          Contact
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push("../favorites")}
          style={styles.viewRoomsButton}
        >
          View Similar
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
  imageContainer: {
    height: 300,
    backgroundColor: "#e0e0e0",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imageCounter: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "white",
    padding: 8,
    borderRadius: 16,
    fontSize: 14,
    fontWeight: "500",
    zIndex: 2,
  },
  navButton: {
    position: "absolute",
    top: "50%",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 2,
  },
  rightButton: {
    right: 10,
  },
  indicatorContainer: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  activeIndicator: {
    backgroundColor: "white",
  },
  infoCard: {
    margin: 16,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
    marginRight: 16,
  },
  roomTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },
  roomLocation: {
    opacity: 0.7,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priceText: {
    color: "#6200ee",
    fontWeight: "bold",
  },
  areaText: {
    opacity: 0.7,
  },
  ratingRow: {
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    marginVertical: 16,
  },
  description: {
    lineHeight: 24,
  },
  safetyCard: {
    margin: 16,
    marginBottom: 8,
  },
  neighborhoodCard: {
    margin: 16,
    marginBottom: 8,
  },
  amenitiesCard: {
    margin: 16,
    marginBottom: 8,
  },
  landlordCard: {
    margin: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 16,
  },
  subsectionTitle: {
    fontWeight: "500",
    marginBottom: 8,
  },
  securityLevelContainer: {
    marginBottom: 16,
  },
  securityDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  securityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  securityBadgeText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  securityScore: {
    fontSize: 16,
    fontWeight: "500",
  },
  crimeRateContainer: {
    marginBottom: 16,
  },
  crimeRateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  crimeRateText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  safetyFeatures: {
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 8,
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  distancesContainer: {
    marginBottom: 16,
  },
  distanceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  distanceIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  distanceText: {
    fontSize: 14,
  },
  scoresContainer: {
    marginBottom: 16,
  },
  scoreItem: {
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  scoreBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  scoreValue: {
    fontSize: 12,
    fontWeight: "500",
    minWidth: 30,
  },
  neighborhoodInfo: {
    gap: 8,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    opacity: 0.7,
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  amenityChip: {
    marginBottom: 8,
  },
  landlordInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  landlordAvatar: {
    marginRight: 16,
  },
  landlordDetails: {
    flex: 1,
  },
  landlordName: {
    fontWeight: "600",
    marginBottom: 4,
  },
  verifiedBadge: {
    color: "#4CAF50",
    fontSize: 14,
  },
  landlordRating: {
    fontSize: 14,
    marginBottom: 2,
  },
  landlordJoined: {
    fontSize: 12,
    opacity: 0.7,
  },
  bottomSpacing: {
    height: 100,
  },
  actionButtons: {
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
  contactButton: {
    flex: 1,
  },
  viewRoomsButton: {
    flex: 1,
  },
});
