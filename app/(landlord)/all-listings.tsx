import React, { useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text, Card, Chip, Searchbar, FAB } from "react-native-paper";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "../../components/ui/back-button";

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  area: number;
  status: "active" | "draft" | "rented";
  image: string;
  applicants: number;
  views: number;
}

const mockListings: Listing[] = [
  {
    id: "1",
    title: "Modern Downtown Apartment",
    price: 1200,
    location: "Downtown, City Center",
    area: 45,
    status: "active",
    image: "https://via.placeholder.com/300x200",
    applicants: 12,
    views: 156,
  },
  {
    id: "2",
    title: "Cozy Studio Near University",
    price: 800,
    location: "University District",
    area: 30,
    status: "active",
    image: "https://via.placeholder.com/300x200",
    applicants: 8,
    views: 89,
  },
  {
    id: "3",
    title: "Spacious 2BR with Garden",
    price: 1500,
    location: "Suburbs",
    area: 65,
    status: "draft",
    image: "https://via.placeholder.com/300x200",
    applicants: 0,
    views: 23,
  },
  {
    id: "4",
    title: "Luxury Penthouse",
    price: 2500,
    location: "Downtown Heights",
    area: 85,
    status: "rented",
    image: "https://via.placeholder.com/300x200",
    applicants: 25,
    views: 342,
  },
];

export default function AllListingsScreen() {
  const [listings] = useState(mockListings);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const filterOptions = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "draft", label: "Draft" },
    { key: "rented", label: "Rented" },
  ];

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" || listing.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleListingPress = (listingId: string) => {
    router.push(`./listing-details/${listingId}`);
  };

  const handleCreateListing = () => {
    router.push("./create-listing");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#4CAF50";
      case "draft":
        return "#FF9800";
      case "rented":
        return "#2196F3";
      default:
        return "#757575";
    }
  };

  const renderListingCard = ({ item }: { item: Listing }) => (
    <Card
      style={styles.listingCard}
      onPress={() => handleListingPress(item.id)}
    >
      <Card.Cover source={{ uri: item.image }} style={styles.cardImage} />
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.listingTitle}>
            {item.title}
          </Text>
          <Chip
            style={[
              styles.statusChip,
              { backgroundColor: getStatusColor(item.status) },
            ]}
            textStyle={styles.statusText}
          >
            {item.status.toUpperCase()}
          </Chip>
        </View>

        <Text variant="bodyMedium" style={styles.listingLocation}>
          📍 {item.location}
        </Text>

        <View style={styles.listingDetails}>
          <Text variant="titleMedium" style={styles.priceText}>
            ${item.price}/month
          </Text>
          <Text variant="bodyMedium" style={styles.areaText}>
            {item.area}m²
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text variant="labelSmall" style={styles.statLabel}>
              Views
            </Text>
            <Text variant="bodyMedium" style={styles.statValue}>
              {item.views}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="labelSmall" style={styles.statLabel}>
              Applicants
            </Text>
            <Text variant="bodyMedium" style={styles.statValue}>
              {item.applicants}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <BackButton title="All Listings" />

      <View style={styles.content}>
        {/* Search Bar */}
        <Searchbar
          placeholder="Search listings..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          {filterOptions.map((filter) => (
            <Chip
              key={filter.key}
              selected={selectedFilter === filter.key}
              onPress={() => setSelectedFilter(filter.key)}
              style={styles.filterChip}
            >
              {filter.label}
            </Chip>
          ))}
        </View>

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text variant="titleMedium" style={styles.resultsText}>
            {filteredListings.length} listings found
          </Text>
        </View>

        {/* Listings List */}
        <FlatList
          data={filteredListings}
          renderItem={renderListingCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />

        {/* Create Listing FAB */}
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleCreateListing}
          label="New Listing"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsText: {
    fontWeight: "600",
  },
  listContainer: {
    paddingBottom: 80,
  },
  listingCard: {
    marginBottom: 16,
    elevation: 4,
  },
  cardImage: {
    height: 150,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  listingTitle: {
    flex: 1,
    marginRight: 12,
    fontWeight: "600",
  },
  statusChip: {
    alignSelf: "flex-start",
  },
  statusText: {
    color: "white",
    fontWeight: "600",
    fontSize: 11,
  },
  listingLocation: {
    marginBottom: 12,
    opacity: 0.7,
  },
  listingDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priceText: {
    fontWeight: "bold",
    color: "#6200ee",
  },
  areaText: {
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    opacity: 0.7,
  },
  statValue: {
    fontWeight: "600",
    marginTop: 2,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
