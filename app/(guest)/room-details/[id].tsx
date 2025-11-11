import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Modal,
  Portal,
  IconButton,
  List,
} from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { roomService, RoomDTO } from '../../../services/room.service';
import { mapsService, LocationResponse } from '../../../services/maps.service';
import { vatService, SafetyScoreResponse } from '../../../services/vat.service';
import Markdown from 'react-native-markdown-display';

const { width } = Dimensions.get('window');

export default function GuestRoomDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [room, setRoom] = useState<RoomDTO | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationData, setLocationData] = useState<LocationResponse | null>(
    null,
  );
  const [showNearbyPlacesModal, setShowNearbyPlacesModal] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [safetyScore, setSafetyScore] = useState<SafetyScoreResponse | null>(
    null,
  );
  const [loadingSafetyScore, setLoadingSafetyScore] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRoomDetails();
    }
  }, [id]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const roomData = await roomService.getRoomById(id);

      setRoom(roomData);

      // Build formatted address from RoomDTO fields
      const formattedAddress = buildFormattedAddress(roomData);

      // Fetch location data if we have address information
      if (formattedAddress) {
        await fetchLocationData(formattedAddress);
      }
    } catch (error) {
      console.error('Error fetching room details:', error);
      Alert.alert('Error', 'Failed to load room details. Please try again.', [
        { text: 'Go Back', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const buildFormattedAddress = (roomData: RoomDTO): string => {
    // Priority: use addressDetails if available, otherwise build from components
    if (roomData.addressDetails) {
      return roomData.addressDetails;
    }
    const addressStreet = roomData.street || roomData.addressDetails;
    // Build address from components: street, ward, district, city
    const addressParts = [
      addressStreet,
      roomData.ward,
      roomData.district,
      roomData.city,
    ].filter(Boolean); // Remove undefined/null/empty values

    return addressParts.join(', ');
  };

  const fetchLocationData = async (address: string) => {
    try {
      setLoadingLocation(true);
      const locationResponse = await mapsService.searchLocation({
        address: address,
      });
      setLocationData(locationResponse);
    } catch (error) {
      console.error('Error fetching location data:', error);
      // Don't show error alert for location data, just log it
    } finally {
      setLoadingLocation(false);
    }
  };

  useEffect(() => {
    if (!room || !locationData) return;
    fetchSafetyScore(room, locationData);
  }, [room, locationData]);

  const fetchSafetyScore = async (
    roomData: RoomDTO,
    location: LocationResponse,
  ) => {
    try {
      setLoadingSafetyScore(true);
      const safetyResponse = await vatService.getSafetyScore(
        parseInt(id, 10),
        roomData,
        location,
      );
      setSafetyScore(safetyResponse);
    } catch (error) {
      console.error('Error fetching safety score:', error);
      // Don't show error alert, just log it - safety score is optional
    } finally {
      setLoadingSafetyScore(false);
    }
  };

  const handleShowNearbyPlaces = () => {
    if (locationData?.nearbyPlaces && locationData.nearbyPlaces.length > 0) {
      setShowNearbyPlacesModal(true);
    } else {
      Alert.alert('No Data', 'No nearby places information available.');
    }
  };

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#6200ee' />
          <Text style={styles.loadingText}>Loading room details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!room) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Room not found</Text>
          <Button mode='contained' onPress={handleBack}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

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
            {(room.imageUrls || []).map((image: string, index: number) => (
              <Card.Cover
                key={`image-${index}`}
                source={{
                  uri:
                    image ||
                    'https://cdn.thuviennhadat.vn/upload/hinh-anh-bai-viet/HNH/chu-phong-tro-da-nang-co-duoc-tang-gia-thue-sau-khi-cai-tao-phong-tro-khong.jpg',
                }}
                style={styles.roomImage}
              />
            ))}
          </ScrollView>
          <View style={styles.imageIndicator}>
            {(room.imageUrls || []).map((_: string, index: number) => (
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
              <Text style={styles.priceText}>
                {room.price ? `${room.price}đ` : 'N/A'}/month
              </Text>
              <Text style={styles.areaText}>{room.roomSize || 0}m²</Text>
            </View>

            {room.numBedrooms !== undefined &&
              room.numBathrooms !== undefined && (
                <Text variant='bodyMedium' style={styles.roomInfo}>
                  🛏️ {room.numBedrooms} Bedroom
                  {room.numBedrooms !== 1 ? 's' : ''} • 🚿 {room.numBathrooms}{' '}
                  Bathroom{room.numBathrooms !== 1 ? 's' : ''}
                </Text>
              )}

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Description</Text>
            <Paragraph style={styles.description}>
              {room.description || 'No description available'}
            </Paragraph>

            {room.city || room.district || room.ward ? (
              <>
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Address Details</Text>
                <Paragraph style={styles.description}>
                  {[room.street, room.ward, room.district, room.city]
                    .filter(Boolean)
                    .join(', ')}
                </Paragraph>
                {room.addressDetails && (
                  <Paragraph style={styles.addressDetails}>
                    {room.addressDetails}
                  </Paragraph>
                )}
              </>
            ) : null}
          </Card.Content>
        </Card>

        {/* Location & Nearby Places */}
        <Card style={styles.locationCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Location & Nearby Places</Text>
            {locationData?.location && (
              <List.Item
                title='Address'
                description={locationData.location.formattedAddress}
                left={(props) => <List.Icon {...props} icon='map-marker' />}
              />
            )}
            <Button
              mode='outlined'
              icon='map-search'
              onPress={handleShowNearbyPlaces}
              style={styles.nearbyPlacesButton}
              loading={loadingLocation}
              disabled={!locationData || loadingLocation}
            >
              View Nearby Places ({locationData?.nearbyPlaces?.length || 0})
            </Button>
          </Card.Content>
        </Card>

        {/* Safety Score & AI Summary */}
        <Card style={styles.locationCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Safety Score</Text>
            {loadingSafetyScore ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size='small' color='#6200ee' />
                <Text style={styles.loadingText}>
                  Analyzing safety score...
                </Text>
              </View>
            ) : safetyScore ? (
              <>
                <View style={styles.scoreContainer}>
                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreLabel}>Crime Safety</Text>
                    <Text
                      style={[
                        styles.scoreValue,
                        {
                          color:
                            safetyScore.crime_score >= 7
                              ? '#4CAF50'
                              : safetyScore.crime_score >= 5
                                ? '#FF9800'
                                : '#F44336',
                        },
                      ]}
                    >
                      {safetyScore.crime_score}/10
                    </Text>
                  </View>
                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreLabel}>User Reviews</Text>
                    <Text
                      style={[
                        styles.scoreValue,
                        {
                          color:
                            safetyScore.user_score >= 7
                              ? '#4CAF50'
                              : safetyScore.user_score >= 5
                                ? '#FF9800'
                                : '#F44336',
                        },
                      ]}
                    >
                      {safetyScore.user_score}/10
                    </Text>
                  </View>
                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreLabel}>Environment</Text>
                    <Text
                      style={[
                        styles.scoreValue,
                        {
                          color:
                            safetyScore.environment_score >= 7
                              ? '#4CAF50'
                              : safetyScore.environment_score >= 5
                                ? '#FF9800'
                                : '#F44336',
                        },
                      ]}
                    >
                      {safetyScore.environment_score}/10
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.finalScoreContainer}>
                  <Text style={styles.finalScoreLabel}>
                    Overall Safety Score
                  </Text>
                  <Chip
                    icon='shield-check'
                    style={[
                      styles.finalScoreChip,
                      {
                        backgroundColor:
                          safetyScore.overall_score >= 7
                            ? '#4CAF50'
                            : safetyScore.overall_score >= 5
                              ? '#FF9800'
                              : '#F44336',
                      },
                    ]}
                    textStyle={styles.finalScoreText}
                  >
                    {safetyScore.overall_score}/10
                  </Chip>
                </View>

                {safetyScore.ai_summary && (
                  <>
                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>AI Analysis</Text>
                    <Card style={styles.aiSummaryCard}>
                      <Card.Content>
                        <Markdown style={markdownStyles}>
                          {safetyScore.ai_summary}
                        </Markdown>
                      </Card.Content>
                    </Card>
                  </>
                )}
              </>
            ) : (
              <Text style={styles.noDataText}>
                Safety score will be calculated based on location data
              </Text>
            )}
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

        {/* Nearby Places Modal */}
        <Modal
          visible={showNearbyPlacesModal}
          onDismiss={() => setShowNearbyPlacesModal(false)}
          contentContainerStyle={styles.nearbyModalContent}
        >
          <Card style={styles.nearbyModalCard}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Text variant='headlineSmall' style={styles.nearbyModalTitle}>
                  Nearby Places
                </Text>
                <IconButton
                  icon='close'
                  size={24}
                  onPress={() => setShowNearbyPlacesModal(false)}
                />
              </View>

              <ScrollView style={styles.modalScrollView}>
                {locationData?.nearbyPlaces?.map((place, index) => (
                  <Card key={place.placeId || index} style={styles.placeCard}>
                    <Card.Content>
                      <View style={styles.placeHeader}>
                        <Text variant='titleMedium' style={styles.placeName}>
                          {place.name}
                        </Text>
                        {place.rating > 0 && (
                          <Chip icon='star' compact style={styles.ratingChip}>
                            {place.rating.toFixed(1)}
                          </Chip>
                        )}
                      </View>

                      <Text style={styles.placeAddress}>{place.address}</Text>

                      <View style={styles.placeInfo}>
                        <Chip icon='walk' compact style={styles.infoChip}>
                          {(place.distanceInMeters / 1000).toFixed(2)} km
                        </Chip>
                        <Chip compact style={styles.infoChip}>
                          {place.type}
                        </Chip>
                      </View>

                      <View style={styles.placeCoordinates}>
                        <Text style={styles.coordinatesText}>
                          📍 {place.latitude.toFixed(6)},{' '}
                          {place.longitude.toFixed(6)}
                        </Text>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 16,
    color: '#d32f2f',
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
  roomInfo: {
    marginTop: 8,
    fontSize: 14,
  },
  addressDetails: {
    marginTop: 8,
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  locationCard: {
    margin: 16,
    marginTop: 0,
    elevation: 3,
  },
  nearbyPlacesButton: {
    marginTop: 12,
  },
  nearbyModalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  nearbyModalCard: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  nearbyModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  placeCard: {
    marginBottom: 12,
    elevation: 2,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  ratingChip: {
    backgroundColor: '#FFD700',
  },
  placeAddress: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  placeInfo: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  infoChip: {
    backgroundColor: '#e3f2fd',
  },
  placeCoordinates: {
    marginTop: 4,
  },
  coordinatesText: {
    fontSize: 12,
    opacity: 0.6,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  finalScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  finalScoreLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  finalScoreChip: {
    paddingHorizontal: 8,
  },
  finalScoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  aiSummaryCard: {
    backgroundColor: '#f0f0f0',
    elevation: 0,
    marginTop: 8,
  },
  aiSummaryText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
  noDataText: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 12,
  },
});

const markdownStyles = {
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
  heading1: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginTop: 12,
    marginBottom: 8,
    color: '#333',
  },
  heading2: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginTop: 10,
    marginBottom: 6,
    color: '#333',
  },
  heading3: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginTop: 8,
    marginBottom: 4,
    color: '#333',
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 8,
  },
  bullet_list: {
    marginTop: 4,
    marginBottom: 8,
  },
  ordered_list: {
    marginTop: 4,
    marginBottom: 8,
  },
  list_item: {
    marginBottom: 4,
  },
  strong: {
    fontWeight: 'bold' as const,
  },
  em: {
    fontStyle: 'italic' as const,
  },
  code_inline: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    fontFamily: 'monospace' as const,
    fontSize: 13,
  },
  code_block: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    marginVertical: 8,
    fontFamily: 'monospace' as const,
    fontSize: 13,
  },
  fence: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    marginVertical: 8,
    fontFamily: 'monospace' as const,
    fontSize: 13,
  },
  link: {
    color: '#6200ee',
    textDecorationLine: 'underline' as const,
  },
};
