import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  Searchbar,
  Card,
  Button,
  Chip,
  Avatar,
  FAB,
  IconButton,
  useTheme,
} from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { roomService, RoomDTO } from '../../services/room.service';
import { buildApiUrl, getApiBaseUrl } from '../../utils/api';
import { getStoredToken, getStoredUser } from '../../utils/auth-storage';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const READ_NOTIFICATIONS_KEY = 'read_notifications';
const FILTER_STORAGE_KEY = 'applied_filters';

// Interface cho Notification từ backend
interface NotificationDto {
  id?: number;
  userId: number;
  message: string;
  type: string;
  createdAt?: string;
}

// Hàm tạo unique ID từ notification content (giống với notifications.tsx)
// Dùng hash đơn giản của userId-type-message để tạo unique ID ổn định
const getNotificationId = (notification: NotificationDto): string => {
  // Tạo hash đơn giản từ content để có unique ID ổn định
  const content = `${notification.userId}-${notification.type}-${notification.message}`;
  // Sử dụng hash đơn giản
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Nếu notification có id từ backend thì dùng id, nếu không dùng hash
  return notification.id ? `id-${notification.id}` : `hash-${Math.abs(hash)}`;
};

export default function TenantHomeScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [appliedFilterParams, setAppliedFilterParams] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const stompClientRef = useRef<Client | null>(null);

  // Load applied filters from AsyncStorage
  const loadAppliedFilters = useCallback(async () => {
    try {
      const filtersJson = await AsyncStorage.getItem(FILTER_STORAGE_KEY);
      if (filtersJson) {
        const filters = JSON.parse(filtersJson);

        // Parse filter string to display active filters
        const filterDescriptions: string[] = [];
        if (filters.filter) {
          const conditions = filters.filter.split(',');
          conditions.forEach((cond: string) => {
            if (cond.includes('price:>')) {
              const price = cond.split(':>')[1];
              filterDescriptions.push(
                `Giá từ ${parseInt(price).toLocaleString('vi-VN')} VNĐ`,
              );
            } else if (cond.includes('price:<')) {
              const price = cond.split(':<')[1];
              filterDescriptions.push(
                `Giá đến ${parseInt(price).toLocaleString('vi-VN')} VNĐ`,
              );
            } else if (cond.includes('size:>')) {
              const size = cond.split(':>')[1];
              filterDescriptions.push(`Diện tích từ ${parseFloat(size)} m²`);
            } else if (cond.includes('size:<')) {
              const size = cond.split(':<')[1];
              filterDescriptions.push(`Diện tích đến ${parseFloat(size)} m²`);
            } else if (cond.includes('city:')) {
              const city = decodeURIComponent(cond.split('city:')[1]);
              filterDescriptions.push(`Thành phố: ${city}`);
            } else if (cond.includes('district:')) {
              const district = decodeURIComponent(cond.split('district:')[1]);
              filterDescriptions.push(`Quận/Huyện: ${district}`);
            } else if (cond.includes('ward:')) {
              const ward = decodeURIComponent(cond.split('ward:')[1]);
              filterDescriptions.push(`Phường/Xã: ${ward}`);
            }
          });
        }

        setAppliedFilterParams(filters);
        setSelectedFilters(filterDescriptions);
        return filters;
      } else {
        setAppliedFilterParams(null);
        setSelectedFilters([]);
        return null;
      }
    } catch (error) {
      console.error('Error loading filters:', error);
      return null;
    }
  }, []);

  // Fetch rooms function - reads from storage directly to avoid dependency issues
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);

      // Build filter params - read directly from storage to avoid dependency loop
      const filterParams: any = {};

      // Read current filters from storage (don't use state to avoid dependency)
      const filtersJson = await AsyncStorage.getItem(FILTER_STORAGE_KEY);
      if (filtersJson) {
        const currentFilterParams = JSON.parse(filtersJson);
        if (currentFilterParams.filter) {
          filterParams.filter = currentFilterParams.filter;
        }
        if (currentFilterParams.search) {
          filterParams.search = currentFilterParams.search;
        }
      }

      // Add search query if available (overrides filter search)
      if (searchQuery.trim()) {
        filterParams.search = searchQuery.trim();
      }

      const roomsData = await roomService.getAllRooms(
        Object.keys(filterParams).length > 0 ? filterParams : undefined,
      );
      setRooms(roomsData);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      Alert.alert(
        'Lỗi',
        'Không thể tải danh sách phòng. Vui lòng kiểm tra kết nối và thử lại.',
      );
    } finally {
      setLoading(false);
    }
  }, [searchQuery]); // Only depend on searchQuery, not appliedFilterParams

  // Load applied filters and fetch rooms on component mount
  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      const loadedFilters = await loadAppliedFilters();
      if (isMounted) {
        // Fetch rooms after loading filters
        fetchRooms();
      }
    };

    initData();

    return () => {
      isMounted = false;
    };
  }, []); // Only run once on mount

  // Reload rooms when screen comes into focus (after applying filters)
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const refreshData = async () => {
        await loadAppliedFilters();
        if (isMounted) {
          // Fetch rooms after loading filters - use a fresh fetchRooms
          try {
            setLoading(true);
            const filterParams: any = {};
            const filtersJson = await AsyncStorage.getItem(FILTER_STORAGE_KEY);
            if (filtersJson) {
              const currentFilterParams = JSON.parse(filtersJson);
              if (currentFilterParams.filter) {
                filterParams.filter = currentFilterParams.filter;
              }
              if (currentFilterParams.search) {
                filterParams.search = currentFilterParams.search;
              }
            }
            if (searchQuery.trim()) {
              filterParams.search = searchQuery.trim();
            }
            const roomsData = await roomService.getAllRooms(
              Object.keys(filterParams).length > 0 ? filterParams : undefined,
            );
            if (isMounted) {
              setRooms(roomsData);
            }
          } catch (error) {
            console.error('Error fetching rooms:', error);
            if (isMounted) {
              Alert.alert(
                'Lỗi',
                'Không thể tải danh sách phòng. Vui lòng kiểm tra kết nối và thử lại.',
              );
            }
          } finally {
            if (isMounted) {
              setLoading(false);
            }
          }
        }
      };

      refreshData();

      return () => {
        isMounted = false;
      };
    }, [searchQuery]), // Only depend on searchQuery
  );

  // Fetch unread notifications count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = await getStoredToken();
      if (!token) {
        setUnreadCount(0);
        return;
      }

      const response = await fetch(buildApiUrl('/api/notifications'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        let notifications = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];

        // Lấy danh sách notifications đã đọc từ AsyncStorage
        const readIdsJson = await AsyncStorage.getItem(READ_NOTIFICATIONS_KEY);
        const readIds = readIdsJson
          ? new Set(JSON.parse(readIdsJson) as string[])
          : new Set();

        // Đếm số notifications chưa đọc
        // Dùng cùng logic getNotificationId như notifications.tsx
        const unread = notifications.filter((notif: NotificationDto) => {
          const notificationId = getNotificationId(notif);
          return !readIds.has(notificationId);
        });

        setUnreadCount(unread.length);
      } else {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    }
  }, []);

  // Fetch unread count when component mounts
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Refresh unread count when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [fetchUnreadCount]),
  );

  // WebSocket connection để nhận notifications real-time
  useEffect(() => {
    let client: Client | null = null;

    const connectWebSocket = async () => {
      try {
        const user = await getStoredUser();
        const token = await getStoredToken();

        if (!user?.id || !token) {
          console.warn('[Home] No user ID or token, skipping WebSocket');
          return;
        }

        const baseUrl = getApiBaseUrl();
        const wsUrl = `${baseUrl}/ws?username=${encodeURIComponent(user.email || '')}`;

        client = new Client({
          webSocketFactory: () => new SockJS(wsUrl) as any,
          connectHeaders: {
            username: user.email || '',
          },
          debug: (str) => {
            console.log('[Home WS]', str);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            console.log('[Home] WebSocket connected for notifications');
            if (!client) return;

            // Subscribe to notifications topic cho user
            const notificationTopic = `/topic/notifications/${user.id}`;
            console.log('[Home] Subscribing to:', notificationTopic);

            client.subscribe(notificationTopic, (message) => {
              try {
                const notification = JSON.parse(message.body);
                console.log('[Home] Received notification:', notification);

                // Khi nhận được thông báo mới, refresh unread count ngay lập tức
                fetchUnreadCount();
              } catch (err) {
                console.error('[Home] Error processing notification:', err);
              }
            });
          },
          onStompError: (frame) => {
            console.error('[Home] STOMP error:', frame);
          },
          onWebSocketError: (event) => {
            console.error('[Home] WebSocket error:', event);
          },
          onDisconnect: () => {
            console.log('[Home] WebSocket disconnected');
          },
        });

        stompClientRef.current = client;
        client.activate();
      } catch (error) {
        console.error('[Home] Failed to connect WebSocket:', error);
      }
    };

    connectWebSocket();

    // Cleanup khi component unmount
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [fetchUnreadCount]);

  // Tự động refresh unread count mỗi 30 giây để cập nhật khi có thông báo mới (backup)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // 30 giây

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleRefresh = async () => {
    setRefreshing(true);

    // Clear all filters when user refreshes
    await AsyncStorage.removeItem(FILTER_STORAGE_KEY);
    setAppliedFilterParams(null);
    setSelectedFilters([]);

    // Fetch rooms without filters
    await fetchRooms();
    setRefreshing(false);
  };

  const removeFilter = async (filterIndex: number) => {
    // Remove specific filter from selected filters
    const newFilters = selectedFilters.filter(
      (_, index) => index !== filterIndex,
    );
    setSelectedFilters(newFilters);

    // Clear all filters if no filters remain
    if (newFilters.length === 0) {
      await AsyncStorage.removeItem(FILTER_STORAGE_KEY);
      setAppliedFilterParams(null);
    }

    // Reload rooms
    fetchRooms();
  };

  const clearAllFilters = async () => {
    await AsyncStorage.removeItem(FILTER_STORAGE_KEY);
    setAppliedFilterParams(null);
    setSelectedFilters([]);
    fetchRooms();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Fetch rooms when search query changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRooms();
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchRooms]);

  const handleRoomPress = (roomId: string) => {
    router.push(`/(tenant)/room-details/${roomId}`);
  };

  const handleSaveRoom = (roomId: number) => {
    // TODO: Implement save room functionality with backend
    Alert.alert('Info', 'Save room functionality coming soon!');
  };

  const handleFilterPress = () => {
    router.push('./advanced-filters');
  };

  const handleMapView = () => {
    router.push('./map');
  };

  const handleRoommateForm = () => {
    router.push('./roommate-form');
  };

  const handleChatHistory = () => {
    router.push('./chat-history');
  };

  const handleNotifications = () => {
    // Navigate to notifications screen
    // The notifications screen will automatically fetch notifications from API
    router.push('./notifications');
  };
  const renderRoomCard = ({ item }: { item: RoomDTO }) => (
    <Card
      style={styles.roomCard}
      onPress={() => handleRoomPress(item.id.toString())}
    >
      <Card.Cover
        source={{
          uri: 'https://cdn.thuviennhadat.vn/upload/hinh-anh-bai-viet/HNH/chu-phong-tro-da-nang-co-duoc-tang-gia-thue-sau-khi-cai-tao-phong-tro-khong.jpg',
        }}
        style={styles.cardImage}
      />
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text variant='titleMedium' style={styles.roomTitle}>
            {item.title}
          </Text>
          <Button
            mode='text'
            icon='heart-outline'
            onPress={() => handleSaveRoom(item.id)}
            style={styles.saveButton}
          >
            Lưu
          </Button>
        </View>

        <Text variant='bodyMedium' style={styles.roomLocation}>
          {item.location ||
            [item.city, item.district].filter(Boolean).join(', ')}
        </Text>

        <View style={styles.roomDetails}>
          <Text variant='headlineSmall' style={styles.priceText}>
            {item.price || 0}VNĐ/Tháng
          </Text>
          <Text variant='bodyMedium' style={styles.areaText}>
            {item.roomSize || 0}m² • {item.numBedrooms || 0} BR
          </Text>
        </View>

        {/* Availability */}
        <View style={styles.infoRow}>
          <Text style={styles.availabilityText}>
            {item.availableFrom
              ? new Date(item.availableFrom).toLocaleDateString()
              : item.isRoomAvailable
                ? 'Có Sẵn'
                : 'Không Có Sẵn'}
          </Text>
          {item.ownerName && (
            <Text style={styles.ownerText}>Chủ sở hữu: {item.ownerName}</Text>
          )}
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
            <Avatar.Icon size={40} icon='account' />
            <View style={styles.userText}>
              <Text style={styles.greeting} numberOfLines={1}>
                Chào buổi sáng!
              </Text>
              <Text
                variant='headlineMedium'
                style={styles.userName}
                numberOfLines={1}
                ellipsizeMode='tail'
              >
                SafeNestly
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.notificationContainer}>
              <IconButton
                icon='bell-outline'
                size={26}
                onPress={handleNotifications}
              />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
            <IconButton
              icon='message-text-outline'
              size={26}
              onPress={handleChatHistory}
            />
            <IconButton
              icon='account-circle'
              size={30}
              onPress={() => router.push('/(tenant)/profile')}
            />
          </View>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <Searchbar
            placeholder='Tìm kiếm theo thành phố, địa chỉ...'
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
            icon='map-marker'
            onIconPress={handleMapView}
          />

          <View style={styles.searchActions}>
            <Button
              mode='outlined'
              icon='filter-variant'
              onPress={handleFilterPress}
              style={styles.filterButton}
            >
              Bộ Lọc
            </Button>
            <Button
              mode='contained'
              icon='map'
              onPress={handleMapView}
              style={styles.mapButton}
            >
              Bản đồ
            </Button>
          </View>
        </View>

        {/* Active Filters */}
        {selectedFilters.length > 0 && (
          <View style={styles.filtersContainer}>
            <View style={styles.filtersHeader}>
              <Text style={styles.filtersTitle}>Bộ lọc đang áp dụng:</Text>
              <Button
                mode='text'
                compact
                onPress={clearAllFilters}
                textColor={theme.colors.error}
              >
                Xóa tất cả
              </Button>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterChips}>
                {selectedFilters.map((filter, index) => (
                  <Chip
                    key={`${filter}-${index}`}
                    onClose={() => removeFilter(index)}
                    style={styles.filterChip}
                  >
                    {filter}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text variant='titleLarge' style={styles.sectionTitle}>
            Hành động nhanh
          </Text>
          <View style={styles.actionButtons}>
            <Button
              mode='contained-tonal'
              icon='account-multiple'
              onPress={handleRoommateForm}
              style={styles.actionButton}
            >
              Tìm bạn cùng phòng
            </Button>
            <Button
              mode='contained-tonal'
              icon='heart'
              onPress={() => router.push('/(tenant)/favorites')}
              style={styles.actionButton}
            >
              Phòng đã lưu
            </Button>
          </View>
        </View>

        {/* Recommended Rooms */}
        <View style={styles.roomsSection}>
          <Text variant='titleLarge' style={styles.sectionTitle}>
            Gợi ý cho bạn
          </Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size='large' color='#6200ee' />
              <Text style={styles.loadingText}>
                Đang tải danh sách phòng...
              </Text>
            </View>
          ) : rooms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Hiện tại không có phòng nào khả dụng
              </Text>
              <Button
                mode='contained'
                onPress={fetchRooms}
                style={styles.retryButton}
              >
                Thử lại
              </Button>
            </View>
          ) : (
            <FlatList
              data={rooms}
              renderItem={renderRoomCard}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon='plus'
        style={styles.fab}
        onPress={handleFilterPress}
        label='Nhập tìm kiếm mới'
      />
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
    padding: 20,
    backgroundColor: 'white',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userText: {
    marginLeft: 12,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  notificationContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 1,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  greeting: {
    fontSize: 14,
    opacity: 0.7,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    flexShrink: 1,
  },
  profileButtonLabel: {
    fontSize: 12,
  },
  searchSection: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  searchActions: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flex: 1,
  },
  mapButton: {
    flex: 1,
  },
  filtersContainer: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  quickActions: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  roomsSection: {
    padding: 20,
    backgroundColor: 'white',
  },
  roomCard: {
    marginBottom: 16,
    elevation: 3,
  },
  cardImage: {
    height: 200,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    margin: 0,
    padding: 0,
  },
  roomLocation: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  roomDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  areaText: {
    fontSize: 14,
    opacity: 0.7,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  reviewText: {
    fontSize: 12,
    opacity: 0.7,
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  availabilityText: {
    fontSize: 12,
    color: '#6200ee',
    fontWeight: '500',
  },
  ownerText: {
    fontSize: 12,
    opacity: 0.7,
  },
  distanceText: {
    fontSize: 12,
    opacity: 0.7,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  amenityChip: {
    marginRight: 6,
    marginBottom: 4,
  },
  moreAmenities: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
  },
});
