import React, { useCallback, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  Avatar,
  Chip,
  Searchbar,
  ActivityIndicator,
} from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

import {
  loadRecentChats,
  RecentChat,
  persistRecentChats,
} from '../../utils/chat-history';
import { buildApiUrl, getApiBaseUrl } from '../../utils/api';
import { getStoredToken, getStoredUser } from '../../utils/auth-storage';

interface Contact extends RecentChat {
  id: string;
  name: string;
  status: 'new' | 'replied' | 'interested' | 'not-interested';
  unreadCount: number;
}

export default function ManageContactsScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [wsConnected, setWsConnected] = useState(false);
  const stompClientRef = useRef<Client | null>(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getStoredToken();
      const user = await getStoredUser();

      if (!token || !user?.id) {
        // Load cached data only, don't throw error
        const cached = await loadRecentChats();
        const cachedContacts: Contact[] = cached.map((item) => ({
          id: String(item.partnerId || item.conversationId || Math.random()),
          conversationId: item.conversationId,
          partnerId: item.partnerId,
          partnerEmail: item.partnerEmail,
          partnerName: item.partnerName,
          name: item.partnerName,
          lastMessagePreview: item.lastMessagePreview,
          lastTimestamp: item.lastTimestamp,
          status: 'replied' as const,
          unreadCount: 0,
        }));
        setContacts(cachedContacts);
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

      const mapped: Contact[] = rawItems
        .filter(
          (item: unknown): item is Record<string, unknown> =>
            typeof item === 'object' && item !== null,
        )
        .map((item: Record<string, unknown>) => ({
          id: String(item.partnerId || item.conversationId || Math.random()),
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
          name:
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
          status: 'replied' as const,
          unreadCount: 0,
        }))
        .sort((a: Contact, b: Contact) => b.lastTimestamp - a.lastTimestamp);

      setContacts(mapped);
      setError('');
    } catch (err) {
      console.error('Lỗi tải danh sách trò chuyện:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể tải danh sách trò chuyện.',
      );
      // Load cached data as fallback
      const cached = await loadRecentChats();
      const cachedContacts: Contact[] = cached.map((item) => ({
        id: String(item.partnerId || item.conversationId || Math.random()),
        conversationId: item.conversationId,
        partnerId: item.partnerId,
        partnerEmail: item.partnerEmail,
        partnerName: item.partnerName,
        name: item.partnerName,
        lastMessagePreview: item.lastMessagePreview,
        lastTimestamp: item.lastTimestamp,
        status: 'replied' as const,
        unreadCount: 0,
      }));
      setContacts(cachedContacts);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchContacts();
    setRefreshing(false);
  }, [fetchContacts]);

  useFocusEffect(
    useCallback(() => {
      fetchContacts();
    }, [fetchContacts]),
  );

  // WebSocket connection for real-time updates
  useEffect(() => {
    let client: Client | null = null;

    const connectWebSocket = async () => {
      try {
        const user = await getStoredUser();
        const token = await getStoredToken();

        if (!user?.email || !token) {
          console.warn(
            '[LandlordContacts] No user or token, skipping WebSocket',
          );
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
            console.log('[LandlordContacts WS]', str);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            console.log('[LandlordContacts] WebSocket connected');
            setWsConnected(true);

            if (!client) return;

            // Subscribe to private messages
            client.subscribe(
              `/user/${user.email}/private`,
              async (message: IMessage) => {
                try {
                  const body = JSON.parse(message.body);
                  console.log('[LandlordContacts] Received message:', body);

                  // Determine partner info from the message
                  const isOutgoing = body.senderEmail === user.email;
                  const partnerEmail = isOutgoing
                    ? body.receiverEmail
                    : body.senderEmail;
                  const partnerId = isOutgoing
                    ? body.receiverId
                    : body.senderId;

                  // Update the contacts list
                  setContacts((prevContacts) => {
                    const existingIndex = prevContacts.findIndex(
                      (c) =>
                        c.partnerEmail === partnerEmail ||
                        (partnerId && c.partnerId === partnerId),
                    );

                    // If contact exists, preserve the partner name
                    const existingContact =
                      existingIndex >= 0 ? prevContacts[existingIndex] : null;

                    // Get partner name: prefer existing name > message name > email
                    const partnerName =
                      existingContact?.partnerName ||
                      (isOutgoing
                        ? body.receiverName || body.receiverEmail
                        : body.senderName || body.senderEmail);

                    const newContact: Contact = {
                      id: String(
                        partnerId || body.conversationId || Math.random(),
                      ),
                      conversationId:
                        body.conversationId || existingContact?.conversationId,
                      partnerId: partnerId || existingContact?.partnerId,
                      partnerName: partnerName,
                      partnerEmail: partnerEmail,
                      name: partnerName,
                      lastMessagePreview: body.content || body.message || '',
                      lastTimestamp: body.timestamp || Date.now(),
                      status: existingContact?.status || ('replied' as const),
                      unreadCount: 0,
                    };

                    let updatedContacts: Contact[];
                    if (existingIndex >= 0) {
                      // Update existing contact
                      updatedContacts = [...prevContacts];
                      updatedContacts[existingIndex] = newContact;
                    } else {
                      // Add new contact
                      updatedContacts = [newContact, ...prevContacts];
                    }

                    // Sort by timestamp
                    updatedContacts.sort(
                      (a, b) => b.lastTimestamp - a.lastTimestamp,
                    );

                    // Persist to storage (as RecentChat format)
                    const recentChats: RecentChat[] = updatedContacts.map(
                      (c) => ({
                        conversationId: c.conversationId,
                        partnerId: c.partnerId,
                        partnerName: c.partnerName,
                        partnerEmail: c.partnerEmail,
                        lastMessagePreview: c.lastMessagePreview,
                        lastTimestamp: c.lastTimestamp,
                      }),
                    );
                    persistRecentChats(recentChats).catch((err) =>
                      console.error(
                        '[LandlordContacts] Failed to persist:',
                        err,
                      ),
                    );

                    return updatedContacts;
                  });
                } catch (err) {
                  console.error(
                    '[LandlordContacts] Error processing message:',
                    err,
                  );
                }
              },
            );
          },
          onStompError: (frame) => {
            console.error('[LandlordContacts] STOMP error:', frame);
            setWsConnected(false);
          },
          onWebSocketError: (event) => {
            console.error('[LandlordContacts] WebSocket error:', event);
            setWsConnected(false);
          },
          onDisconnect: () => {
            console.log('[LandlordContacts] WebSocket disconnected');
            setWsConnected(false);
          },
        });

        stompClientRef.current = client;
        client.activate();
      } catch (error) {
        console.error('[LandlordContacts] Failed to connect WebSocket:', error);
        setWsConnected(false);
      }
    };

    void connectWebSocket();

    return () => {
      if (stompClientRef.current) {
        console.log('[LandlordContacts] Deactivating WebSocket');
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      setWsConnected(false);
    };
  }, []);

  const handleContactPress = (contact: Contact) => {
    router.push({
      pathname: './chat/[name]',
      params: {
        name: contact.name,
        backendUserId: contact.partnerId?.toString() || '',
        tenantEmail: contact.partnerEmail || '',
        conversationId: contact.conversationId?.toString() || '',
      },
    });
  };

  const handleFilterPress = (filter: string) => {
    setSelectedFilter(filter);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return '#FF5722';
      case 'replied':
        return '#2196F3';
      case 'interested':
        return '#4CAF50';
      case 'not-interested':
        return '#757575';
      default:
        return '#757575';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return 'New';
      case 'replied':
        return 'Replied';
      case 'interested':
        return 'Interested';
      case 'not-interested':
        return 'Not Interested';
      default:
        return status;
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.partnerEmail &&
        contact.partnerEmail.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedFilter === 'all') return matchesSearch;
    return matchesSearch && contact.status === selectedFilter;
  });

  const filterOptions = [
    { key: 'all', label: 'All', count: contacts.length },
    {
      key: 'new',
      label: 'New',
      count: contacts.filter((c) => c.status === 'new').length,
    },
    {
      key: 'replied',
      label: 'Replied',
      count: contacts.filter((c) => c.status === 'replied').length,
    },
    {
      key: 'interested',
      label: 'Interested',
      count: contacts.filter((c) => c.status === 'interested').length,
    },
  ];

  const renderContactCard = ({ item }: { item: Contact }) => {
    const initial = item.name?.charAt(0) || 'U';
    return (
      <Card style={styles.contactCard} onPress={() => handleContactPress(item)}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.contactHeader}>
            <Avatar.Text size={50} label={initial} style={styles.avatar} />
            <View style={styles.contactInfo}>
              <View style={styles.nameContainer}>
                <Title style={styles.contactName}>{item.name}</Title>
                {item.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unreadCount}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.propertyName}>
                {item.partnerEmail || 'No email'}
              </Text>
              <View style={styles.statusContainer}>
                <Chip
                  style={[
                    styles.statusChip,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                  textStyle={styles.statusText}
                  compact
                >
                  {getStatusLabel(item.status)}
                </Chip>
                <Text style={styles.timeText}>
                  {formatTimestamp(item.lastTimestamp)}
                </Text>
              </View>
            </View>
          </View>

          <Paragraph style={styles.lastMessage} numberOfLines={2}>
            {item.lastMessagePreview || 'No messages yet'}
          </Paragraph>
        </Card.Content>
      </Card>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Button
            mode='text'
            icon='arrow-left'
            onPress={() => router.back()}
            style={styles.backButton}
          >
            Back
          </Button>
          <Title style={styles.headerTitle}>Messages</Title>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' />
          <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button
          mode='text'
          icon='arrow-left'
          onPress={() => router.back()}
          style={styles.backButton}
        >
          Back
        </Button>
        <Title style={styles.headerTitle}>Messages</Title>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchSection}>
        <Searchbar
          placeholder='Search contacts...'
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <View style={styles.filtersContainer}>
          {filterOptions.map((option) => (
            <Chip
              key={option.key}
              selected={selectedFilter === option.key}
              onPress={() => handleFilterPress(option.key)}
              style={styles.filterChip}
            >
              {option.label} ({option.count})
            </Chip>
          ))}
        </View>
      </View>

      {error ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Error</Text>
          <Paragraph style={styles.emptySubtitle}>{error}</Paragraph>
          <Button
            mode='contained'
            onPress={fetchContacts}
            style={{ marginTop: 16 }}
          >
            Retry
          </Button>
        </View>
      ) : filteredContacts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Messages</Text>
          <Paragraph style={styles.emptySubtitle}>
            {contacts.length === 0
              ? "You haven't received any messages yet. When tenants contact you about your listings, they'll appear here."
              : 'No contacts match your search criteria.'}
          </Paragraph>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          renderItem={renderContactCard}
          keyExtractor={(item, index) =>
            `contact-${item.conversationId ?? ''}-${item.partnerId ?? ''}-${item.partnerEmail ?? ''}-${index}`
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    margin: 0,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 60,
  },
  searchSection: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    marginBottom: 12,
    elevation: 1,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    marginRight: 4,
  },
  listContainer: {
    padding: 16,
  },
  contactCard: {
    marginBottom: 12,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  contactHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#FF5722',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  propertyName: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 12,
    opacity: 0.6,
  },
  lastMessage: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    opacity: 0.7,
  },
});
