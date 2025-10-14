import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Modal,
  Portal,
} from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface RoomDetails {
  id: string;
  title: string;
  price: number;
  location: string;
  area: number;
  images: string[];
  amenities: string[];
  description: string;
}

const mockRoomDetails: RoomDetails = {
  id: '1',
  title: 'Modern Downtown Apartment',
  price: 1200,
  location: 'Downtown, City Center',
  area: 45,
  images: [
    'https://via.placeholder.com/400x300/6200ee/ffffff?text=Living+Room',
    'https://via.placeholder.com/400x300/4CAF50/ffffff?text=Kitchen',
    'https://via.placeholder.com/400x300/FF9800/ffffff?text=Bedroom',
  ],
  amenities: [
    'WiFi',
    'Kitchen',
    'Air Conditioning',
    'Washing Machine',
    'Balcony',
  ],
  description:
    'Beautiful and modern apartment in the heart of downtown. Perfect for young professionals or students.',
};

export default function GuestRoomDetailsScreen() {
  const [room] = useState(mockRoomDetails);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleLoginRequired = () => {
    setShowLoginModal(true);
  };

  const handleLogin = () => {
    setShowLoginModal(false);
    router.push('/(auth)/login');
  };

  const handleRegister = () => {
    setShowLoginModal(false);
    router.push('/(auth)/register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Button
            mode='text'
            icon='arrow-left'
            onPress={handleBack}
            style={styles.backButton}
          >
            Back
          </Button>
          <Button
            mode='text'
            icon='heart-outline'
            onPress={handleLoginRequired}
          >
            Save
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
                event.nativeEvent.contentOffset.x / width,
              );
              setCurrentImageIndex(index);
            }}
          >
            {room.images.map((image, index) => (
              <Card.Cover
                key={`image-${index}`}
                source={{ uri: image }}
                style={styles.roomImage}
              />
            ))}
          </ScrollView>
          <View style={styles.imageIndicator}>
            {room.images.map((_, index) => (
              <View
                key={`indicator-${index}`}
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
            <Title style={styles.roomTitle}>{room.title}</Title>
            <Paragraph style={styles.roomLocation}>{room.location}</Paragraph>

            <View style={styles.priceAreaContainer}>
              <Text style={styles.priceText}>${room.price}/month</Text>
              <Text style={styles.areaText}>{room.area}m²</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Description</Text>
            <Paragraph style={styles.description}>{room.description}</Paragraph>

            <View style={styles.divider} />

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

        {/* Limited Features Notice */}
        <Card style={styles.limitedCard}>
          <Card.Content>
            <Title style={styles.limitedTitle}>Want More Details?</Title>
            <Paragraph style={styles.limitedText}>
              Sign up to see full property details, safety information, landlord
              information, and contact options.
            </Paragraph>
            <View style={styles.limitedFeatures}>
              <Text style={styles.featureItem}>🔒 Safety & Security Info</Text>
              <Text style={styles.featureItem}>
                👤 Verified Landlord Details
              </Text>
              <Text style={styles.featureItem}>📱 Direct Contact Options</Text>
              <Text style={styles.featureItem}>🤖 AI Roommate Matching</Text>
            </View>
            <Button
              mode='contained'
              onPress={() => router.push('/(auth)/register')}
              style={styles.upgradeButton}
            >
              Sign Up for Full Access
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Limited Contact Actions */}
      <View style={styles.contactActions}>
        <Button
          mode='outlined'
          onPress={handleLoginRequired}
          style={styles.contactButton}
          icon='heart-outline'
        >
          Save Room
        </Button>
        <Button
          mode='contained'
          onPress={handleLoginRequired}
          style={styles.contactButton}
          icon='message'
        >
          Contact Landlord
        </Button>
      </View>

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
                  mode='outlined'
                  onPress={handleLogin}
                  style={styles.modalButton}
                >
                  Sign In
                </Button>
                <Button
                  mode='contained'
                  onPress={handleRegister}
                  style={styles.modalButton}
                >
                  Sign Up
                </Button>
              </View>

              <Button
                mode='text'
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
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  backButton: {
    margin: 0,
  },
  imageContainer: {
    position: 'relative',
  },
  roomImage: {
    width: width,
    height: 250,
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: 'white',
  },
  infoCard: {
    margin: 16,
    elevation: 3,
  },
  roomTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  roomLocation: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 16,
  },
  priceAreaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  areaText: {
    fontSize: 16,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    marginBottom: 8,
  },
  limitedCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 100,
    backgroundColor: '#FFF3E0',
    elevation: 3,
  },
  limitedTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: 12,
  },
  limitedText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  limitedFeatures: {
    marginBottom: 20,
  },
  featureItem: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  upgradeButton: {
    alignSelf: 'flex-start',
  },
  contactActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  contactButton: {
    flex: 1,
  },
  modalContent: {
    padding: 20,
  },
  modalCard: {
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
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
