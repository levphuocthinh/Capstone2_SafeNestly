import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  IconButton,
  ActivityIndicator,
  Divider,
  Chip,
  Button,
} from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildApiUrl } from '../../utils/api';
import { getStoredToken } from '../../utils/auth-storage';

// Interface cho Notification từ backend
interface NotificationDto {
  id?: number;
  userId: number;
  message: string;
  type: string; // NotificationType từ backend
  createdAt?: string;
}

// Key để lưu danh sách notifications đã đọc
const READ_NOTIFICATIONS_KEY = 'read_notifications';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(
    new Set(),
  );

  // Load danh sách notifications đã đọc từ AsyncStorage
  const loadReadNotifications = useCallback(async () => {
    try {
      const readIdsJson = await AsyncStorage.getItem(READ_NOTIFICATIONS_KEY);
      if (readIdsJson) {
        const readIds = JSON.parse(readIdsJson) as string[];
        setReadNotificationIds(new Set(readIds));
      }
    } catch (error) {
      console.error('Error loading read notifications:', error);
    }
  }, []);

  // Lưu danh sách notifications đã đọc vào AsyncStorage
  const saveReadNotifications = useCallback(async (ids: Set<string>) => {
    try {
      const idsArray = Array.from(ids);
      await AsyncStorage.setItem(
        READ_NOTIFICATIONS_KEY,
        JSON.stringify(idsArray),
      );
    } catch (error) {
      console.error('Error saving read notifications:', error);
    }
  }, []);

  // Hàm tạo unique ID từ notification content (không phụ thuộc vào index)
  // Dùng hash đơn giản của userId-type-message để tạo unique ID ổn định
  const getNotificationId = useCallback(
    (notification: NotificationDto): string => {
      // Tạo hash đơn giản từ content để có unique ID ổn định
      const content = `${notification.userId}-${notification.type}-${notification.message}`;
      // Sử dụng JSON.stringify và hash đơn giản
      let hash = 0;
      for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      // Nếu notification có id từ backend thì dùng id, nếu không dùng hash
      return notification.id
        ? `id-${notification.id}`
        : `hash-${Math.abs(hash)}`;
    },
    [],
  );

  // Function để fetch notifications từ API
  const fetchNotifications = useCallback(async () => {
    try {
      setError('');
      const token = await getStoredToken();

      if (!token) {
        setError('Vui lòng đăng nhập để xem thông báo.');
        setLoading(false);
        return;
      }

      const response = await fetch(buildApiUrl('/api/notifications'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (response.status === 403) {
          setError('Bạn không có quyền truy cập thông báo.');
        } else {
          setError(
            `Không thể tải thông báo (mã ${response.status}). Vui lòng thử lại sau.`,
          );
        }
        setNotifications([]);
        return;
      }

      const data = await response.json();

      // Xử lý response có thể là array hoặc object có property data
      let notificationsList: NotificationDto[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];

      // Thêm index gốc từ backend vào mỗi notification để làm unique key
      // Index này sẽ được dùng cho keyExtractor, nhưng không ảnh hưởng đến getNotificationId
      const notificationsWithOriginalIndex = notificationsList.map(
        (notif, originalIndex) => ({
          ...notif,
          _originalIndex: originalIndex, // Thêm index gốc để dùng cho key
        }),
      );

      // Sắp xếp notifications mới nhất lên đầu (không dùng reverse())
      // Tạo array mới bằng cách duyệt từ cuối lên đầu
      const sortedNotifications: any[] = [];
      for (let i = notificationsWithOriginalIndex.length - 1; i >= 0; i--) {
        sortedNotifications.push(notificationsWithOriginalIndex[i]);
      }

      setNotifications(sortedNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng.',
      );
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load read notifications và fetch notifications khi component mount
  useEffect(() => {
    loadReadNotifications();
    fetchNotifications();
  }, [loadReadNotifications, fetchNotifications]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, [fetchNotifications]);

  // Đánh dấu tất cả notifications là đã đọc
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      const allIds = notifications.map((notif) => getNotificationId(notif));

      const newReadIds = new Set([...readNotificationIds, ...allIds]);
      setReadNotificationIds(newReadIds);
      await saveReadNotifications(newReadIds);

      Alert.alert('Thành công', 'Đã đánh dấu tất cả thông báo là đã đọc.');
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('Lỗi', 'Không thể đánh dấu tất cả là đã đọc.');
    }
  }, [
    notifications,
    readNotificationIds,
    saveReadNotifications,
    getNotificationId,
  ]);

  // Đánh dấu một notification là đã đọc
  const handleMarkAsRead = useCallback(
    async (notification: NotificationDto) => {
      try {
        const notificationId = getNotificationId(notification);
        const newReadIds = new Set([...readNotificationIds, notificationId]);
        setReadNotificationIds(newReadIds);
        await saveReadNotifications(newReadIds);
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    },
    [readNotificationIds, saveReadNotifications, getNotificationId],
  );

  // Kiểm tra notification đã đọc chưa
  const isNotificationRead = useCallback(
    (notification: NotificationDto): boolean => {
      const notificationId = getNotificationId(notification);
      return readNotificationIds.has(notificationId);
    },
    [readNotificationIds, getNotificationId],
  );

  // Đếm số notifications chưa đọc
  const unreadCount = notifications.filter(
    (notif) => !isNotificationRead(notif),
  ).length;

  // Render notification item
  const renderNotificationItem = ({ item }: { item: NotificationDto }) => {
    const isRead = isNotificationRead(item);
    return (
      <Card
        style={[styles.notificationCard, isRead && styles.readNotificationCard]}
        mode='outlined'
      >
        <Card.Content>
          <View style={styles.notificationHeader}>
            <Chip
              icon='bell'
              style={styles.typeChip}
              textStyle={styles.chipText}
            >
              {item.type || 'Notification'}
            </Chip>
            {!isRead && <View style={styles.unreadDot} />}
            <IconButton
              icon={isRead ? 'check-circle' : 'check-circle-outline'}
              size={20}
              onPress={() => handleMarkAsRead(item)}
              style={styles.markReadButton}
            />
          </View>
          <Text
            variant='bodyMedium'
            style={[styles.messageText, isRead && styles.readMessageText]}
          >
            {item.message || 'Không có nội dung'}
          </Text>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton icon='arrow-left' size={24} onPress={() => router.back()} />
        <Text variant='headlineSmall' style={styles.headerTitle}>
          Thông báo
        </Text>
        <IconButton
          icon='refresh'
          size={24}
          onPress={handleRefresh}
          disabled={refreshing}
        />
      </View>
      <Divider />

      {/* Mark all as read button */}
      {notifications.length > 0 && unreadCount > 0 && (
        <View style={styles.markAllContainer}>
          <Button
            mode='text'
            icon='check-all'
            onPress={handleMarkAllAsRead}
            style={styles.markAllButton}
            textColor='#6200ee'
          >
            Đánh dấu tất cả đã đọc ({unreadCount})
          </Button>
        </View>
      )}

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <IconButton
            icon='refresh'
            size={24}
            onPress={handleRefresh}
            disabled={refreshing}
          />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
          <Text style={styles.emptySubtext}>
            Các thông báo mới sẽ hiển thị ở đây
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={({ item }) => renderNotificationItem({ item })}
          keyExtractor={(item, index) => {
            // Dùng originalIndex từ backend để đảm bảo unique key
            // Nếu không có originalIndex thì dùng index hiện tại
            const originalIndex = (item as any)._originalIndex ?? index;
            return `notif-${originalIndex}-${getNotificationId(item)}`;
          }}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: 'white',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  markAllContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  markAllButton: {
    alignSelf: 'flex-end',
  },
  listContainer: {
    padding: 16,
  },
  notificationCard: {
    marginBottom: 8,
    elevation: 2,
  },
  readNotificationCard: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5',
  },
  notificationHeader: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
    marginLeft: 8,
  },
  markReadButton: {
    margin: 0,
    padding: 0,
  },
  typeChip: {
    alignSelf: 'flex-start',
  },
  chipText: {
    fontSize: 12,
  },
  messageText: {
    marginBottom: 8,
    lineHeight: 20,
  },
  readMessageText: {
    opacity: 0.7,
  },
  userIdText: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  separator: {
    height: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.7,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.5,
    textAlign: 'center',
  },
});
