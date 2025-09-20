import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  Button,
  Card,
  Chip,
  Switch,
  TextInput,
  useTheme,
} from "react-native-paper";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import BackButton from "../../components/ui/back-button";

interface FilterState {
  priceRange: [number, number];
  areaRange: [number, number];
  amenities: string[];
  petFriendly: boolean;
  lifestyle: string[];
  roomType: string[];
  location: string;
}

export default function AdvancedFiltersScreen() {
  const theme = useTheme();
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [500, 2500],
    areaRange: [20, 100],
    amenities: [],
    petFriendly: false,
    lifestyle: [],
    roomType: [],
    location: "",
  });

  const amenityOptions = [
    "WiFi",
    "Kitchen",
    "Air Conditioning",
    "Heating",
    "Washing Machine",
    "Dryer",
    "Balcony",
    "Parking",
    "Gym Access",
    "Pool",
    "Security",
    "Pet Friendly",
    "Furnished",
    "Dishwasher",
    "Microwave",
    "Garden Access",
  ];

  const lifestyleOptions = [
    "Quiet & Private",
    "Social & Outgoing",
    "Modern & Tech-savvy",
    "Minimalist & Clean",
    "Student Friendly",
    "Professional Environment",
    "Family Friendly",
    "Party Friendly",
  ];

  const roomTypes = [
    "Studio",
    "1 Bedroom",
    "2 Bedroom",
    "3+ Bedroom",
    "Shared Room",
    "Private Room",
  ];

  const toggleAmenity = (amenity: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const toggleLifestyle = (lifestyle: string) => {
    setFilters((prev) => ({
      ...prev,
      lifestyle: prev.lifestyle.includes(lifestyle)
        ? prev.lifestyle.filter((l) => l !== lifestyle)
        : [...prev.lifestyle, lifestyle],
    }));
  };

  const toggleRoomType = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      roomType: prev.roomType.includes(type)
        ? prev.roomType.filter((t) => t !== type)
        : [...prev.roomType, type],
    }));
  };

  const updatePriceRange = (value: number, index: number) => {
    setFilters((prev) => ({
      ...prev,
      priceRange:
        index === 0 ? [value, prev.priceRange[1]] : [prev.priceRange[0], value],
    }));
  };

  const updateAreaRange = (value: number, index: number) => {
    setFilters((prev) => ({
      ...prev,
      areaRange:
        index === 0 ? [value, prev.areaRange[1]] : [prev.areaRange[0], value],
    }));
  };

  const handleApplyFilters = () => {
    // In a real app, you would pass these filters back to the home screen
    // and use them to filter the room results
    console.log("Applied filters:", filters);

    // Navigate back with filters
    router.back();
  };

  const handleClearFilters = () => {
    setFilters({
      priceRange: [500, 2500],
      areaRange: [20, 100],
      amenities: [],
      petFriendly: false,
      lifestyle: [],
      roomType: [],
      location: "",
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.amenities.length > 0) count++;
    if (filters.lifestyle.length > 0) count++;
    if (filters.roomType.length > 0) count++;
    if (filters.petFriendly) count++;
    if (filters.location.trim()) count++;
    return count;
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton title="Advanced Filters" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Refine Your Search
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Find your perfect room with advanced filters
          </Text>
          {getActiveFiltersCount() > 0 && (
            <Chip icon="filter" style={styles.activeFiltersChip}>
              {getActiveFiltersCount()} filter
              {getActiveFiltersCount() > 1 ? "s" : ""} active
            </Chip>
          )}
        </View>

        {/* Price Range */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              💰 Price Range
            </Text>
            <Text variant="bodyMedium" style={styles.rangeText}>
              ${filters.priceRange[0]} - ${filters.priceRange[1]} per month
            </Text>

            <View style={styles.sliderContainer}>
              <Text variant="bodySmall">Min: $500</Text>
              <Slider
                style={styles.slider}
                minimumValue={500}
                maximumValue={3000}
                value={filters.priceRange[0]}
                onValueChange={(value: number) =>
                  updatePriceRange(Math.round(value), 0)
                }
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor="#e0e0e0"
              />
              <Text variant="bodySmall">Max: $3000</Text>
            </View>

            <View style={styles.sliderContainer}>
              <Text variant="bodySmall">Min Price</Text>
              <Slider
                style={styles.slider}
                minimumValue={filters.priceRange[0]}
                maximumValue={3000}
                value={filters.priceRange[1]}
                onValueChange={(value: number) =>
                  updatePriceRange(Math.round(value), 1)
                }
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor="#e0e0e0"
              />
              <Text variant="bodySmall">Max Price</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Area Range */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              📐 Room Area
            </Text>
            <Text variant="bodyMedium" style={styles.rangeText}>
              {filters.areaRange[0]} - {filters.areaRange[1]} m²
            </Text>

            <View style={styles.sliderContainer}>
              <Text variant="bodySmall">Min: 15m²</Text>
              <Slider
                style={styles.slider}
                minimumValue={15}
                maximumValue={150}
                value={filters.areaRange[0]}
                onValueChange={(value: number) =>
                  updateAreaRange(Math.round(value), 0)
                }
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor="#e0e0e0"
              />
              <Text variant="bodySmall">Max: 150m²</Text>
            </View>

            <View style={styles.sliderContainer}>
              <Text variant="bodySmall">Min Area</Text>
              <Slider
                style={styles.slider}
                minimumValue={filters.areaRange[0]}
                maximumValue={150}
                value={filters.areaRange[1]}
                onValueChange={(value: number) =>
                  updateAreaRange(Math.round(value), 1)
                }
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor="#e0e0e0"
              />
              <Text variant="bodySmall">Max Area</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Room Type */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              🏠 Room Type
            </Text>
            <View style={styles.chipContainer}>
              {roomTypes.map((type) => (
                <Chip
                  key={type}
                  selected={filters.roomType.includes(type)}
                  onPress={() => toggleRoomType(type)}
                  style={[
                    styles.chip,
                    filters.roomType.includes(type) && {
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                  textStyle={
                    filters.roomType.includes(type) ? { color: "white" } : {}
                  }
                >
                  {type}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Amenities */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              ⭐ Amenities ({filters.amenities.length} selected)
            </Text>
            <View style={styles.chipContainer}>
              {amenityOptions.map((amenity) => (
                <Chip
                  key={amenity}
                  selected={filters.amenities.includes(amenity)}
                  onPress={() => toggleAmenity(amenity)}
                  style={[
                    styles.chip,
                    filters.amenities.includes(amenity) && {
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                  textStyle={
                    filters.amenities.includes(amenity)
                      ? { color: "white" }
                      : {}
                  }
                >
                  {amenity}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Lifestyle Preferences */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              🎨 Lifestyle Preferences
            </Text>
            <Text variant="bodySmall" style={styles.sectionDescription}>
              Choose the living environment that matches your style
            </Text>
            <View style={styles.chipContainer}>
              {lifestyleOptions.map((lifestyle) => (
                <Chip
                  key={lifestyle}
                  selected={filters.lifestyle.includes(lifestyle)}
                  onPress={() => toggleLifestyle(lifestyle)}
                  style={[
                    styles.chip,
                    filters.lifestyle.includes(lifestyle) && {
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                  textStyle={
                    filters.lifestyle.includes(lifestyle)
                      ? { color: "white" }
                      : {}
                  }
                >
                  {lifestyle}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Pet Policy */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.switchContainer}>
              <View style={styles.switchContent}>
                <Text variant="titleMedium">🐕 Pet Friendly</Text>
                <Text variant="bodySmall" style={styles.switchDescription}>
                  Allow pets in the accommodation
                </Text>
              </View>
              <Switch
                value={filters.petFriendly}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, petFriendly: value }))
                }
              />
            </View>
          </Card.Content>
        </Card>

        {/* Location */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              📍 Location
            </Text>
            <TextInput
              label="Preferred area or neighborhood"
              value={filters.location}
              onChangeText={(text) =>
                setFilters((prev) => ({ ...prev, location: text }))
              }
              mode="outlined"
              style={styles.input}
              placeholder="e.g., Downtown, University District, Near Metro"
              left={<TextInput.Icon icon="map-marker" />}
            />
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <Button
          mode="outlined"
          onPress={handleClearFilters}
          style={styles.clearButton}
        >
          Clear All
        </Button>
        <Button
          mode="contained"
          onPress={handleApplyFilters}
          style={styles.applyButton}
        >
          Apply Filters
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
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 20,
    backgroundColor: "white",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 12,
  },
  activeFiltersChip: {
    backgroundColor: "#e3f2fd",
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  sectionDescription: {
    opacity: 0.7,
    marginBottom: 16,
  },
  rangeText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 16,
    textAlign: "center",
    color: "#6200ee",
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 16,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    margin: 2,
  },
  input: {
    marginTop: 8,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchContent: {
    flex: 1,
    marginRight: 16,
  },
  switchDescription: {
    opacity: 0.7,
    marginTop: 4,
  },
  actionContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: 12,
  },
  clearButton: {
    flex: 1,
  },
  applyButton: {
    flex: 2,
  },
});
