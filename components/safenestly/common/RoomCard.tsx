import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Card, Button, Chip } from "react-native-paper";

interface RoomCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  area: number;
  image: string;
  amenities: string[];
  saved?: boolean;
  onPress: (id: string) => void;
  onSave?: (id: string) => void;
  showSaveButton?: boolean;
  showContactButton?: boolean;
  onContact?: (id: string) => void;
}

export function RoomCard({
  id,
  title,
  price,
  location,
  area,
  image,
  amenities,
  saved = false,
  onPress,
  onSave,
  showSaveButton = false,
  showContactButton = false,
  onContact,
}: RoomCardProps) {
  return (
    <Card style={styles.card} onPress={() => onPress(id)}>
      <Card.Cover source={{ uri: image }} style={styles.image} />
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title}>
            {title}
          </Text>
          {showSaveButton && onSave && (
            <Button
              mode="text"
              icon={saved ? "heart" : "heart-outline"}
              onPress={() => onSave(id)}
              style={styles.saveButton}
            >
              {saved ? "Saved" : "Save"}
            </Button>
          )}
        </View>

        <Text variant="bodyMedium" style={styles.location}>
          {location}
        </Text>

        <View style={styles.details}>
          <Text style={styles.price}>${price}/month</Text>
          <Text style={styles.area}>{area}m²</Text>
        </View>

        <View style={styles.amenitiesContainer}>
          {amenities.slice(0, 3).map((amenity) => (
            <Chip key={amenity} compact style={styles.amenityChip}>
              {amenity}
            </Chip>
          ))}
          {amenities.length > 3 && (
            <Text style={styles.moreAmenities}>
              +{amenities.length - 3} more
            </Text>
          )}
        </View>

        {showContactButton && onContact && (
          <Button
            mode="contained"
            onPress={() => onContact(id)}
            style={styles.contactButton}
            icon="message"
          >
            Contact
          </Button>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 3,
  },
  image: {
    height: 200,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    margin: 0,
    padding: 0,
  },
  location: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6200ee",
  },
  area: {
    fontSize: 14,
    opacity: 0.7,
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
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
  contactButton: {
    marginTop: 8,
  },
});
