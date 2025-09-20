import React, { useState } from "react";
import { View, StyleSheet, ScrollView, FlatList } from "react-native";
import { Text, Card, Button, Chip, Avatar, FAB } from "react-native-paper";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  area: number;
  image: string;
  status: "active" | "draft" | "rented";
  views: number;
  interests: number;
  datePosted: string;
}

const mockListings: Listing[] = [
  {
    id: "1",
    title: "Modern Downtown Apartment",
    price: 1200,
    location: "Downtown, City Center",
    area: 45,
    image: "https://via.placeholder.com/300x200",
    status: "active",
    views: 234,
    interests: 15,
    datePosted: "2 days ago",
  },
  {
    id: "2",
    title: "Cozy Studio Near University",
    price: 800,
    location: "University District",
    area: 35,
    image: "https://via.placeholder.com/300x200",
    status: "rented",
    views: 456,
    interests: 28,
    datePosted: "1 week ago",
  },
];

const mockStats = {
  totalListings: 5,
  activeListings: 3,
  totalViews: 1240,
  totalInterests: 67,
  monthlyEarnings: 3600,
};

export default function LandlordDashboard() {
  const [listings] = useState(mockListings);

  const handleCreateListing = () => {
    router.push("./create-listing");
  };

  const handleListingPress = (listingId: string) => {
    router.push(`./listing-details/${listingId}`);
  };

  const handleManageContacts = () => {
    router.push("./contacts");
  };

  const handleProfile = () => {
    router.push("./profile");
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
          {item.location}
        </Text>

        <View style={styles.listingDetails}>
          <Text style={styles.priceText}>${item.price}/month</Text>
          <Text style={styles.areaText}>{item.area}m²</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{item.views}</Text>
            <Text style={styles.statLabel}>Views</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{item.interests}</Text>
            <Text style={styles.statLabel}>Interests</Text>
          </View>
          <Text style={styles.datePosted}>Posted {item.datePosted}</Text>
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
            <Avatar.Icon size={40} icon="account" />
            <View style={styles.userText}>
              <Text style={styles.greeting}>Good morning!</Text>
              <Text variant="headlineSmall" style={styles.userName}>
                Manage your properties
              </Text>
            </View>
          </View>
          <Button mode="text" icon="account-circle" onPress={handleProfile}>
            Profile
          </Button>
        </View>

        {/* Statistics Overview */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.statsTitle}>
              Overview
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{mockStats.totalListings}</Text>
                <Text style={styles.statTitle}>Total Listings</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{mockStats.activeListings}</Text>
                <Text style={styles.statTitle}>Active</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{mockStats.totalViews}</Text>
                <Text style={styles.statTitle}>Total Views</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{mockStats.totalInterests}</Text>
                <Text style={styles.statTitle}>Interests</Text>
              </View>
            </View>
            <View style={styles.earningsContainer}>
              <Text style={styles.earningsLabel}>This Month's Earnings</Text>
              <Text style={styles.earningsValue}>
                ${mockStats.monthlyEarnings}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              icon="plus"
              onPress={handleCreateListing}
              style={styles.actionButton}
            >
              New Listing
            </Button>
            <Button
              mode="contained-tonal"
              icon="message-text"
              onPress={handleManageContacts}
              style={styles.actionButton}
            >
              Messages
            </Button>
          </View>
        </View>

        {/* Recent Listings */}
        <View style={styles.listingsSection}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Your Listings
            </Text>
            <Button mode="text" onPress={() => router.push("./all-listings")}>
              View All
            </Button>
          </View>

          <FlatList
            data={listings}
            renderItem={renderListingCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateListing}
        label="New Listing"
      />
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
    padding: 20,
    backgroundColor: "white",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
  },
  statsCard: {
    margin: 20,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statBox: {
    width: "48%",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6200ee",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
  },
  earningsContainer: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#e8f5e8",
    borderRadius: 8,
  },
  earningsLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  earningsValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  quickActions: {
    padding: 20,
    backgroundColor: "white",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  listingsSection: {
    padding: 20,
    backgroundColor: "white",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  listingCard: {
    marginBottom: 16,
    elevation: 3,
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
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    marginLeft: 8,
  },
  statusText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  listingLocation: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  listingDetails: {
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
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6200ee",
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  datePosted: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: "italic",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
