import React, { useCallback, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Text,
  List,
  ActivityIndicator,
  IconButton,
  Divider,
} from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

import {
  clearRecentChats,
  loadRecentChats,
  persistRecentChats,
  RecentChat,
  upsertRecentChat,
} from '../../utils/chat-history';
import { buildApiUrl, getApiBaseUrl } from '../../utils/api';
import { getStoredToken, getStoredUser } from '../../utils/auth-storage';

const ChatHistoryScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chats, setChats] = useState<RecentChat[]>([]);
  const [error, setError] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const stompClientRef = useRef<Client | null>(null);

  const fetchChats = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getStoredToken();
      const user = await getStoredUser();

      if (!token || !user?.id) {
        // Load cached data only, don't throw error
        const cached = await loadRecentChats();
        setChats(cached);
        setError('Vui lòng đăng nhập để xem tin nhắn mới.');
        setLoading(false);
        return;
      }

      const response = await fetch(
        buildApiUrl(`/messages/api/messages/conversations/${user.id}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Không thể tải danh sách trò chuyện (mã ${response.status}).`,
        );
      }

      const payload = await response.json();
      const rawItems = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      const mapped: RecentChat[] = rawItems
        .filter(
          (item: unknown): item is Record<string, unknown> =>
            typeof item === 'object' && item !== null,
        )
        .map((item: Record<string, unknown>) => ({
          conversationId:
            typeof item.conversationId === 'number'
              ? item.conversationId
              : undefined,
          partnerId:
            typeof item.partnerId === 'number' ? item.partnerId : undefined,
          partnerEmail:
            typeof item.partnerEmail === 'string'
              ? item.partnerEmail
              : undefined,
          partnerName:
            (item.partnerName as string) ||
            (item.partnerEmail as string) ||
            'Unknown',
          lastMessagePreview:
            (item.lastMessage as string) ||
            (item.partnerEmail as string) ||
            undefined,
          lastTimestamp:
            typeof item.lastTimestamp === 'number'
              ? item.lastTimestamp
              : Date.now(),
        }))
        .sort(
          (a: RecentChat, b: RecentChat) => b.lastTimestamp - a.lastTimestamp,
        );

      setChats(mapped);
      setError('');
      await persistRecentChats(mapped);
    } catch (err) {
      console.warn('Falling back to cached conversations:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể tải lịch sử trò chuyện từ máy chủ.',
      );
      const cached = await loadRecentChats();
      setChats(cached);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchChats();
    setRefreshing(false);
  }, [fetchChats]);

  useFocusEffect(
    useCallback(() => {
      void fetchChats();
    }, [fetchChats]),
  );

  // WebSocket connection for real-time updates
  useEffect(() => {
    let client: Client | null = null;

    const connectWebSocket = async () => {
      try {
        const user = await getStoredUser();
        const token = await getStoredToken();

        if (!user?.email || !token) {
          console.warn('[ChatHistory] No user or token, skipping WebSocket');
          return;
        }

        const baseUrl = getApiBaseUrl();
        const wsUrl = `${baseUrl}/ws?username=${encodeURIComponent(user.email)}`;

        client = new Client({
          webSocketFactory: () => new SockJS(wsUrl) as any,
          connectHeaders: {
            username: user.email,
          },
          debug: (str) => {
            console.log('[ChatHistory WS]', str);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            console.log('[ChatHistory] WebSocket connected');
            setWsConnected(true);

            if (!client) return;

            // Subscribe to private messages
            client.subscribe(
              `/user/${user.email}/private`,
              async (message: IMessage) => {
                try {
                  const body = JSON.parse(message.body);
                  console.log('[ChatHistory] Received message:', body);

                  // Determine partner info from the message
                  const isOutgoing = body.senderEmail === user.email;
                  const partnerEmail = isOutgoing
                    ? body.receiverEmail
                    : body.senderEmail;
                  const partnerId = isOutgoing
                    ? body.receiverId
                    : body.senderId;

                  // Update the chat list
                  setChats((prevChats) => {
                    const existingIndex = prevChats.findIndex(
                      (c) =>
                        c.partnerEmail === partnerEmail ||
                        (partnerId && c.partnerId === partnerId),
                    );

                    // If conversation exists, preserve the partner name
                    const existingChat =
                      existingIndex >= 0 ? prevChats[existingIndex] : null;

                    // Get partner name: prefer existing name > message name > email
                    const partnerName =
                      existingChat?.partnerName ||
                      (isOutgoing
                        ? body.receiverName || body.receiverEmail
                        : body.senderName || body.senderEmail);

                    const newChat: RecentChat = {
                      conversationId:
                        body.conversationId || existingChat?.conversationId,
                      partnerId: partnerId || existingChat?.partnerId,
                      partnerName: partnerName,
                      partnerEmail: partnerEmail,
                      lastMessagePreview: body.content || body.message || '',
                      lastTimestamp: body.timestamp || Date.now(),
                    };

                    let updatedChats: RecentChat[];
                    if (existingIndex >= 0) {
                      // Update existing conversation
                      updatedChats = [...prevChats];
                      updatedChats[existingIndex] = newChat;
                    } else {
                      // Add new conversation
                      updatedChats = [newChat, ...prevChats];
                    }

                    // Sort by timestamp
                    updatedChats.sort(
                      (a, b) => b.lastTimestamp - a.lastTimestamp,
                    );

                    // Persist to storage
                    persistRecentChats(updatedChats).catch((err) =>
                      console.error('[ChatHistory] Failed to persist:', err),
                    );

                    return updatedChats;
                  });
                } catch (err) {
                  console.error('[ChatHistory] Error processing message:', err);
                }
              },
            );
          },
          onStompError: (frame) => {
            console.error('[ChatHistory] STOMP error:', frame);
            setWsConnected(false);
          },
          onWebSocketError: (event) => {
            console.error('[ChatHistory] WebSocket error:', event);
            setWsConnected(false);
          },
          onDisconnect: () => {
            console.log('[ChatHistory] WebSocket disconnected');
            setWsConnected(false);
          },
        });

        stompClientRef.current = client;
        client.activate();
      } catch (error) {
        console.error('[ChatHistory] Failed to connect WebSocket:', error);
        setWsConnected(false);
      }
    };

    void connectWebSocket();

    return () => {
      if (stompClientRef.current) {
        console.log('[ChatHistory] Deactivating WebSocket');
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      setWsConnected(false);
    };
  }, []);

  const handleOpenChat = (chat: RecentChat) => {
    router.push({
      pathname: '/(tenant)/chat/[name]',
      params: {
        name: chat.partnerName,
        conversationId: chat.conversationId
          ? String(chat.conversationId)
          : undefined,
        backendUserId: chat.partnerId ? String(chat.partnerId) : undefined,
        roommateEmail: chat.partnerEmail,
      },
    });
  };

  const handleClearHistory = async () => {
    await clearRecentChats();
    setChats([]);
  };

  const renderItem = ({ item }: { item: RecentChat }) => (
    <List.Item
      title={item.partnerName}
      description={item.lastMessagePreview ?? 'Chạm để mở lại cuộc trò chuyện'}
      left={(props) => <List.Icon {...props} icon='message-text-outline' />}
      right={(props) => (
        <View style={styles.itemMeta}>
          <Text style={styles.timestamp}>
            {new Date(item.lastTimestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          <IconButton
            {...props}
            icon='chevron-right'
            onPress={() => handleOpenChat(item)}
          />
        </View>
      )}
      onPress={() => handleOpenChat(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton icon='arrow-left' onPress={() => router.back()} />
        <Text variant='titleLarge' style={styles.headerTitle}>
          Lịch sử trò chuyện
        </Text>
        <IconButton
          icon='delete-outline'
          onPress={handleClearHistory}
          disabled={chats.length === 0}
          accessibilityLabel='Xóa lịch sử trò chuyện'
        />
      </View>
      <Divider />
      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator animating size='large' />
          <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
        </View>
      ) : chats.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Chưa có cuộc trò chuyện nào</Text>
          <Text style={styles.emptySubtitle}>
            Bấm nút "Find Roommate" để tìm người phù hợp và bắt đầu trò chuyện.
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item, index) =>
            `chat-${item.conversationId ?? ''}-${item.partnerId ?? ''}-${item.partnerEmail ?? ''}-${index}`
          }
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </SafeAreaView>
  );
};

export default ChatHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  listContainer: {
    backgroundColor: 'white',
  },
  errorText: {
    textAlign: 'center',
    color: '#B00020',
    padding: 12,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
    marginRight: 4,
  },
});
