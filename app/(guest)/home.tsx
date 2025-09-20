import React, { useState } from "react";
import { View, StyleSheet, ScrollView, FlatList } from "react-native";
import {
  Text,
  Searchbar,
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Modal,
  Portal,
} from "react-native-paper";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

interface Room {
  id: string;
  title: string;
  price: number;
  location: string;
  area: number;
  image: string;
  amenities: string[];
}

const mockRooms: Room[] = [
  {
    id: "1",
    title: "Modern Downtown Apartment",
    price: 1200,
    location: "Downtown, City Center",
    area: 45,
    image: "https://via.placeholder.com/300x200",
    amenities: ["WiFi", "Kitchen", "Air Conditioning"],
  },
  {
    id: "2",
    title: "Cozy Studio Near University",
    price: 800,
    location: "University District",
    area: 35,
    image: "https://via.placeholder.com/300x200",
    amenities: ["WiFi", "Gym", "Parking"],
  },
  {
    id: "3",
    title: "Spacious Family Home",
    price: 2000,
    location: "Suburban Area",
    area: 120,
    image: "https://via.placeholder.com/300x200",
    amenities: ["Garden", "Parking", "Kitchen", "WiFi"],
  },
];

export default function GuestHomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("");
  const [rooms] = useState(mockRooms);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handlePriceFilter = (range: string) => {
    setSelectedPriceRange(range);
  };

  const handleRoomPress = (roomId: string) => {
    router.push(`/(guest)/room-details/${roomId}`);
  };

  const handleLoginRequired = () => {
    setShowLoginModal(true);
  };

  const handleLogin = () => {
    setShowLoginModal(false);
    router.push("/(auth)/login");
  };

  const handleRegister = () => {
    setShowLoginModal(false);
    router.push("/(auth)/register");
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (!selectedPriceRange) return matchesSearch;

    const price = room.price;
    switch (selectedPriceRange) {
      case "under-1000":
        return matchesSearch && price < 1000;
      case "1000-1500":
        return matchesSearch && price >= 1000 && price <= 1500;
      case "over-1500":
        return matchesSearch && price > 1500;
      default:
        return matchesSearch;
    }
  });

  const priceRanges = [
    { key: "", label: "All Prices" },
    { key: "under-1000", label: "Under $1,000" },
    { key: "1000-1500", label: "$1,000 - $1,500" },
    { key: "over-1500", label: "Over $1,500" },
  ];

  const renderRoomCard = ({ item }: { item: Room }) => (
    <Card style={styles.roomCard} onPress={() => handleRoomPress(item.id)}>
      <Card.Cover source={{ uri: item.image }} style={styles.cardImage} />
      <Card.Content style={styles.cardContent}>
        <Title style={styles.roomTitle}>{item.title}</Title>
        <Paragraph style={styles.roomLocation}>{item.location}</Paragraph>

        <View style={styles.roomDetails}>
          <Text style={styles.priceText}>${item.price}/month</Text>
          <Text style={styles.areaText}>{item.area}m²</Text>
        </View>

        <View style={styles.amenitiesContainer}>
          {item.amenities.slice(0, 2).map((amenity) => (
            <Chip key={amenity} compact style={styles.amenityChip}>
              {amenity}
            </Chip>
          ))}
          {item.amenities.length > 2 && (
            <Text style={styles.moreAmenities}>
              +{item.amenities.length - 2} more
            </Text>
          )}
        </View>

        <View style={styles.cardActions}>
          <Button
            mode="outlined"
            onPress={handleLoginRequired}
            style={styles.actionButton}
            compact
          >
            Save
          </Button>
          <Button
            mode="contained"
            onPress={handleLoginRequired}
            style={styles.actionButton}
            compact
          >
            Contact
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Title style={styles.appTitle}>SafeNestly</Title>
          <Paragraph style={styles.appSubtitle}>
            Find your perfect room
          </Paragraph>
          <View style={styles.authButtons}>
            <Button
              mode="outlined"
              onPress={() => router.push("/(auth)/login")}
              style={styles.authButton}
              compact
            >
              Sign In
            </Button>
            <Button
              mode="contained"
              onPress={() => router.push("/(auth)/register")}
              style={styles.authButton}
              compact
            >
              Sign Up
            </Button>
          </View>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search by city, address..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
          />

          <Text style={styles.filterTitle}>Filter by Price:</Text>
          <View style={styles.priceFilters}>
            {priceRanges.map((range) => (
              <Chip
                key={range.key}
                selected={selectedPriceRange === range.key}
                onPress={() => handlePriceFilter(range.key)}
                style={styles.priceChip}
              >
                {range.label}
              </Chip>
            ))}
          </View>
        </View>

        {/* Limited Features Notice */}
        <Card style={styles.noticeCard}>
          <Card.Content>
            <Title style={styles.noticeTitle}>Browse as Guest</Title>
            <Paragraph style={styles.noticeText}>
              You're viewing with limited features. Sign up to save rooms,
              contact landlords, and use AI roommate matching!
            </Paragraph>
            <Button
              mode="contained"
              onPress={() => router.push("/(auth)/register")}
              style={styles.signUpButton}
            >
              Sign Up for Full Access
            </Button>
          </Card.Content>
        </Card>

        {/* Rooms List */}
        <View style={styles.roomsSection}>
          <Title style={styles.sectionTitle}>
            Available Rooms ({filteredRooms.length})
          </Title>
          <FlatList
            data={filteredRooms}
            renderItem={renderRoomCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {/* Login Required Modal */}
      <Portal>
        <Modal
          visible={showLoginModal}
          onDismiss={() => setShowLoginModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Card>
            <Card.Content style={styles.modalCard}>
              <Title style={styles.modalTitle}>Account Required</Title>
              <Paragraph style={styles.modalText}>
                Please sign in or create an account to save rooms and contact
                landlords.
              </Paragraph>

              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={handleLogin}
                  style={styles.modalButton}
                >
                  Sign In
                </Button>
                <Button
                  mode="contained"
                  onPress={handleRegister}
                  style={styles.modalButton}
                >
                  Sign Up
                </Button>
              </View>

              <Button
                mode="text"
                onPress={() => setShowLoginModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
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
    padding: 20,
    backgroundColor: "white",
    alignItems: "center",
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#6200ee",
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 20,
  },
  authButtons: {
    flexDirection: "row",
    gap: 12,
  },
  authButton: {
    paddingHorizontal: 20,
  },
  searchSection: {
    padding: 20,
    backgroundColor: "white",
    marginBottom: 10,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  priceFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  priceChip: {
    marginBottom: 4,
  },
  noticeCard: {
    margin: 20,
    marginBottom: 10,
    backgroundColor: "#E3F2FD",
    elevation: 2,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1976D2",
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  signUpButton: {
    alignSelf: "flex-start",
  },
  roomsSection: {
    padding: 20,
    backgroundColor: "white",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
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
  roomTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  roomLocation: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  roomDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6200ee",
  },
  areaText: {
    fontSize: 14,
    opacity: 0.7,
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  amenityChip: {
    marginRight: 6,
    marginBottom: 4,
  },
  moreAmenities: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: "italic",
  },
  cardActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  modalContent: {
    padding: 20,
  },
  modalCard: {
    alignItems: "center",
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  modalButton: {
    flex: 1,
  },
  cancelButton: {
    marginTop: 8,
  },
});
