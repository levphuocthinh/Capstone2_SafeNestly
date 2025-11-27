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
  Button,
  Chip,
  Avatar,
  Divider,
  List,
  Portal,
  IconButton,
  Modal,
} from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { roomService, RoomDTO } from '../../../services/room.service';
import { mapsService, LocationResponse } from '../../../services/maps.service';
import { vatService, SafetyScoreResponse } from '../../../services/vat.service';
import { viewRequestService } from '../../../services/view-request.service';
import Markdown from 'react-native-markdown-display';

const { width } = Dimensions.get('window');

export default function RoomDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [room, setRoom] = useState<RoomDTO | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
  const [submittingRequest, setSubmittingRequest] = useState(false);

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
    } catch (error) {
      console.error('Error fetching room details:', error);
      Alert.alert('Error', 'Failed to load room details. Please try again.', [
        { text: 'Go Back', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!room) return;
    const formattedAddress = buildFormattedAddress(room);
    if (!formattedAddress) return;
    fetchLocationData(formattedAddress);
  }, [room]);

  const buildFormattedAddress = (roomData: RoomDTO): string => {
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
    } finally {
      setLoadingLocation(false);
    }
  };

  useEffect(() => {
    if (!locationData || !room) return;
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

  const handleSaveRoom = () => {
    if (!room) return;
    // TODO: Implement save room functionality with backend
    Alert.alert('Info', 'Save room functionality coming soon!');
  };

  const handleViewRequest = async () => {
    if (!room || !id) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin phòng.');
      return;
    }

    try {
      setSubmittingRequest(true);

      // Gọi service để tạo view request
      const result = await viewRequestService.createViewRequest(
        parseInt(id, 10),
        room,
      );

      if (result.success) {
        // Hiển thị thông báo thành công
        Alert.alert(
          'Thành công',
          'Yêu cầu xem phòng đã được gửi thành công. Chủ nhà sẽ liên hệ với bạn sớm nhất.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Có thể navigate đến trang xem danh sách yêu cầu hoặc quay lại
                // router.push('./my-view-requests');
              },
            },
          ],
        );
      } else {
        // Hiển thị thông báo lỗi
        Alert.alert('Lỗi', result.error || 'Không thể gửi yêu cầu.');
      }
    } catch (error) {
      console.error('Error submitting view request:', error);
      Alert.alert(
        'Lỗi',
        error instanceof Error
          ? error.message
          : 'Không thể gửi yêu cầu. Vui lòng kiểm tra kết nối mạng và thử lại.',
      );
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleCallLandlord = () => {
    // Implement call functionality
  };

  const handleBack = () => {
    router.back();
  };

  const formatMemberSince = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const month = date.toLocaleString('vi-VN', { month: 'long' });
      const year = date.getFullYear();
      return `${month} ${year}`;
    } catch (error) {
      return '';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#6200ee' />
          <Text style={styles.loadingText}>Đang tải chi tiết phòng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!room) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Không tìm thấy phòng</Text>
          <Button mode='contained' onPress={handleBack}>
            Quay lại
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
            Quay lại
          </Button>
          <Button mode='text' icon='heart-outline' onPress={handleSaveRoom}>
            Lưu
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
                key={`image-${room.id}-${index}`}
                source={{
                  uri: 'https://cdn.thuviennhadat.vn/upload/hinh-anh-bai-viet/HNH/chu-phong-tro-da-nang-co-duoc-tang-gia-thue-sau-khi-cai-tao-phong-tro-khong.jpg',
                }}
                style={styles.roomImage}
              />
            ))}
          </ScrollView>
          <View style={styles.imageIndicator}>
            {(room.imageUrls || []).map((_: string, index: number) => (
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
            <Text variant='headlineSmall' style={styles.roomTitle}>
              {room.title}
            </Text>
            <Text variant='bodyLarge' style={styles.roomLocation}>
              {room.location}
            </Text>

            <View style={styles.priceAreaContainer}>
              <Text style={styles.priceText}>
                {room.price ? `${room.price}đ` : 'N/A'}/tháng
              </Text>
              <Text style={styles.areaText}>{room.roomSize || 0}m²</Text>
            </View>

            {room.numBedrooms !== undefined &&
              room.numBathrooms !== undefined && (
                <Text variant='bodyMedium' style={styles.roomInfo}>
                  🛏️ {room.numBedrooms} Phòng ngủ
                  {room.numBedrooms !== 1 ? 's' : ''} • 🚿 {room.numBathrooms}{' '}
                  Phòng tắm{room.numBathrooms !== 1 ? 's' : ''}
                </Text>
              )}

            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text variant='bodyMedium' style={styles.description}>
              {room.description || 'Không có mô tả'}
            </Text>

            {room.city || room.district || room.ward ? (
              <>
                <Divider style={styles.divider} />
                <Text style={styles.sectionTitle}>Chi tiết địa chỉ</Text>
                <Text variant='bodyMedium' style={styles.description}>
                  {[room.street, room.ward, room.district, room.city]
                    .filter(Boolean)
                    .join(', ')}
                </Text>
                {room.addressDetails && (
                  <Text variant='bodySmall' style={styles.addressDetails}>
                    {room.addressDetails}
                  </Text>
                )}
              </>
            ) : null}
          </Card.Content>
        </Card>

        {/* Location & Nearby Places */}
        <Card style={styles.safetyCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Vị trí & Địa điểm lân cận</Text>
            {locationData?.location && (
              <List.Item
                title='Địa chỉ'
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
              Xem địa điểm lân cận ({locationData?.nearbyPlaces?.length || 0})
            </Button>
          </Card.Content>
        </Card>

        {/* Safety Score & AI Summary */}
        <Card style={styles.safetyCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Điểm an toàn</Text>
            {loadingSafetyScore ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size='small' color='#6200ee' />
                <Text style={styles.loadingText}>
                  Đang phân tích điểm an toàn...
                </Text>
              </View>
            ) : safetyScore ? (
              <>
                <View style={styles.scoreContainer}>
                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreLabel}>An toàn tội phạm</Text>
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
                    <Text style={styles.scoreLabel}>
                      Đánh giá của người dùng
                    </Text>
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
                    <Text style={styles.scoreLabel}>Môi trường</Text>
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

                <Divider style={styles.divider} />

                <View style={styles.finalScoreContainer}>
                  <Text style={styles.finalScoreLabel}>Tổng điểm an toàn</Text>
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
                    <Divider style={styles.divider} />
                    <Text style={styles.sectionTitle}>Phân tích AI</Text>
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
                Điểm an toàn sẽ được tính toán dựa trên dữ liệu vị trí
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Owner Information */}
        {room.ownerName && (
          <Card style={styles.landlordCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Chủ nhà</Text>
              <View style={styles.landlordInfo}>
                <Avatar.Icon size={60} icon='account' />
                <View style={styles.landlordDetails}>
                  <Text variant='titleMedium' style={styles.landlordNameText}>
                    {room.ownerName}
                  </Text>
                  {room.availableFrom && (
                    <Text style={styles.availabilityText}>
                      Có sẵn từ:{' '}
                      {new Date(room.availableFrom).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Contact Actions */}
      <View style={styles.contactActions}>
        <Button
          mode='outlined'
          icon='phone'
          onPress={handleCallLandlord}
          style={styles.callButton}
        >
          Gọi
        </Button>
        <Button
          mode='contained'
          icon='message'
          onPress={handleViewRequest}
          style={styles.chatButton}
          loading={submittingRequest}
          disabled={submittingRequest}
        >
          {submittingRequest ? 'Đang gửi...' : 'Gửi Yêu Cầu Xem Phòng'}
        </Button>
      </View>

      {/* Nearby Places Modal */}
      <Portal>
        <Modal
          visible={showNearbyPlacesModal}
          onDismiss={() => setShowNearbyPlacesModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.modalCard}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Text variant='headlineSmall' style={styles.modalTitle}>
                  Địa điểm lân cận
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
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  landlordDetails: {
    marginLeft: 16,
    flex: 1,
  },
  landlordName: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  landlordNameText: {
    fontSize: 18,
    marginRight: 8,
  },
  verifiedChip: {
    backgroundColor: '#4CAF50',
  },
  ratingText: {
    fontSize: 14,
    opacity: 0.7,
  },
  availabilityText: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
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
  callButton: {
    flex: 1,
  },
  chatButton: {
    flex: 2,
  },
  nearbyPlacesButton: {
    marginTop: 12,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalCard: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
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
