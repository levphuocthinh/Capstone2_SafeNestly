import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  HelperText,
  TextInput,
  IconButton,
  Card,
  Avatar,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

import { buildApiUrl, getApiBaseUrl } from '../../../utils/api';
import {
  getStoredToken,
  getStoredUser,
  User,
} from '../../../utils/auth-storage';
import { upsertRecentChat } from '../../../utils/chat-history';

interface ChatMessage {
  id: string;
  backendId?: number;
  text: string;
  sender: 'user' | 'other';
  timestampLabel: string;
  rawTimestamp: number;
}

type RawMessage = Record<string, any>;

const normalizeParam = (value?: string | string[]): string | undefined => {
  if (Array.isArray(value)) {
    return value.length > 0 ? value[value.length - 1] : undefined;
  }
  return value;
};

export default function ChatScreen() {
  const params = useLocalSearchParams<{
    name?: string | string[];
    roommateId?: string | string[];
    backendUserId?: string | string[];
    roommateEmail?: string | string[];
    conversationId?: string | string[];
  }>();

  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionState, setConnectionState] = useState<
    'idle' | 'connecting' | 'connected' | 'error'
  >('idle');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');

  const scrollViewRef = useRef<ScrollView>(null);
  const stompClientRef = useRef<Client | null>(null);
  const pendingMessagesRef = useRef<RawMessage[]>([]);

  const [userSession, setUserSession] = useState<User | null>(null);
  const myEmail = userSession?.email ?? '';
  const myId = userSession?.id;

  const initialName = normalizeParam(params.name);
  const initialBackendUserId = normalizeParam(params.backendUserId);
  const initialRoommateEmail = normalizeParam(params.roommateEmail);
  const initialConversationIdRaw = normalizeParam(params.conversationId);
  const initialConversationId = initialConversationIdRaw
    ? Number.parseInt(initialConversationIdRaw, 10)
    : undefined;

  const [partner, setPartner] = useState<{
    id?: number;
    email?: string;
    name: string;
    conversationId?: number;
  }>(() => ({
    id: initialBackendUserId
      ? Number.parseInt(initialBackendUserId, 10)
      : undefined,
    email: initialRoommateEmail || undefined,
    name: initialName || 'Roommate',
    conversationId: initialConversationId,
  }));

  const conversationId = useMemo(() => {
    if (!myId || !partner.id) {
      return undefined;
    }
    const sorted = [myId, partner.id].sort((a, b) => a - b);
    return `conv_${sorted[0]}_${sorted[1]}`;
  }, [myId, partner.id]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const formatTimestamp = (value?: number | string) => {
    if (value === undefined || value === null) {
      return { label: '', raw: Date.now() };
    }
    const numeric =
      typeof value === 'number'
        ? value
        : Number.parseInt(String(value).trim(), 10);
    const raw = Number.isNaN(numeric) ? Date.now() : numeric;
    const date = new Date(raw);
    return {
      label: date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      raw,
    };
  };

  const mapBackendMessage = useCallback(
    (payload: Record<string, any>): ChatMessage => {
      const { label, raw } = formatTimestamp(payload.timestamp);
      const senderIdentifier =
        payload.senderName ?? payload.senderEmail ?? payload.senderId;
      const isUserMessage =
        senderIdentifier &&
        typeof senderIdentifier === 'string' &&
        myEmail &&
        senderIdentifier.toLowerCase() === myEmail.toLowerCase();

      return {
        id: payload.id ? String(payload.id) : `msg-${raw}-${Math.random()}`,
        backendId: payload.id,
        text: payload.message ?? '',
        sender: isUserMessage ? 'user' : 'other',
        timestampLabel: label,
        rawTimestamp: raw,
      };
    },
    [myEmail],
  );

  const fetchPartnerDetails = useCallback(async () => {
    if (partner.email || !partner.id) {
      return;
    }
    const token = await getStoredToken();
    if (!token) {
      setError(
        'Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại để tiếp tục trò chuyện.',
      );
      return;
    }
    try {
      const response = await fetch(
        buildApiUrl(`/owner/get-users/${partner.id}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );
      if (!response.ok) {
        throw new Error(
          `Không thể lấy thông tin người dùng (mã ${response.status}).`,
        );
      }
      const data = await response.json();
      const usersList = Array.isArray(data?.usersList)
        ? data.usersList
        : Array.isArray(data?.data)
          ? data.data
          : [];
      if (usersList.length > 0) {
        const [user] = usersList;
        setPartner((prev) => ({
          id: prev.id,
          email: user.email ?? prev.email,
          name: user.fullName ?? prev.name,
          conversationId: prev.conversationId,
        }));
      }
    } catch (err) {
      console.warn('Không thể tải thông tin người dùng:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể tải thông tin người dùng.',
      );
    }
  }, [partner.email, partner.id]);

  useEffect(() => {
    const loadUserSession = async () => {
      const user = await getStoredUser();
      setUserSession(user);
    };
    loadUserSession();
  }, []);

  useEffect(() => {
    fetchPartnerDetails();
  }, [fetchPartnerDetails]);

  const updateRecentChat = useCallback(
    (latest?: ChatMessage) => {
      if (!partner.name) {
        return;
      }
      void upsertRecentChat({
        conversationId: partner.conversationId ?? initialConversationId,
        partnerId: partner.id,
        partnerEmail: partner.email,
        partnerName: partner.name,
        lastMessagePreview: latest?.text ?? partner.email ?? undefined,
        lastTimestamp: latest?.rawTimestamp ?? Date.now(),
      });
    },
    [
      partner.email,
      partner.id,
      partner.name,
      partner.conversationId,
      initialConversationId,
    ],
  );

  const fetchChatHistory = useCallback(async () => {
    if (!myEmail || (!partner.email && !partner.id)) {
      return;
    }
    const token = await getStoredToken();
    if (!token) {
      setError(
        'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để xem lịch sử trò chuyện.',
      );
      return;
    }

    const receiverIdentifier = partner.email ?? String(partner.id);
    const url = buildApiUrl(
      `/messages/api/messages/history/${encodeURIComponent(myEmail)}/${encodeURIComponent(receiverIdentifier)}`,
    );

    setHistoryLoading(true);
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(
          `Không thể tải lịch sử trò chuyện (mã ${response.status}).`,
        );
      }
      const data = await response.json();
      const parsedData = data as { data?: RawMessage[] };
      const rawMessages: RawMessage[] = Array.isArray(data)
        ? (data as RawMessage[])
        : Array.isArray(parsedData?.data)
          ? (parsedData.data ?? [])
          : [];

      const mapped = rawMessages
        .filter(Boolean)
        .map((msg) => mapBackendMessage(msg))
        .sort((a, b) => a.rawTimestamp - b.rawTimestamp);
      setMessages(mapped);
      if (mapped.length > 0) {
        updateRecentChat(mapped[mapped.length - 1]);
      } else {
        updateRecentChat();
      }
      setError('');
    } catch (err) {
      console.error('Lỗi tải lịch sử trò chuyện:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể tải lịch sử trò chuyện.',
      );
    } finally {
      setHistoryLoading(false);
      scrollToBottom();
    }
  }, [mapBackendMessage, myEmail, partner.email, partner.id, scrollToBottom]);

  const handleIncomingMessage = useCallback(
    (messageEvent: IMessage) => {
      try {
        const payload = JSON.parse(messageEvent.body);
        const mapped = mapBackendMessage(payload);
        setMessages((prev) => {
          // Check if this message already exists by backendId
          const existsByBackendId =
            mapped.backendId !== undefined &&
            prev.some(
              (item) =>
                item.backendId !== undefined &&
                item.backendId === mapped.backendId,
            );
          if (existsByBackendId) {
            return prev;
          }

          // Check if this is a confirmation of a message we just sent (within 5 seconds)
          // by matching text content and sender
          const isOwnMessage = mapped.sender === 'user';
          if (isOwnMessage) {
            const recentlySentIndex = prev.findIndex(
              (item) =>
                item.text === mapped.text &&
                item.sender === 'user' &&
                !item.backendId &&
                Math.abs(item.rawTimestamp - mapped.rawTimestamp) < 5000,
            );

            if (recentlySentIndex !== -1) {
              // Replace the temporary message with the confirmed one
              const updated = [...prev];
              updated[recentlySentIndex] = mapped;
              return updated;
            }
          }

          const next = [...prev, mapped].sort(
            (a, b) => a.rawTimestamp - b.rawTimestamp,
          );
          updateRecentChat(mapped);
          return next;
        });
        scrollToBottom();
      } catch (err) {
        console.error('Không thể parse tin nhắn đến:', err);
      }
    },
    [mapBackendMessage, scrollToBottom, updateRecentChat],
  );

  const flushPendingMessages = useCallback(() => {
    const client = stompClientRef.current;
    if (!client || !client.active) {
      return;
    }
    pendingMessagesRef.current.forEach((payload: RawMessage) => {
      client.publish({
        destination: '/app/private-message',
        body: JSON.stringify(payload),
      });
    });
    pendingMessagesRef.current = [];
  }, []);

  useEffect(() => {
    const initWebSocket = async () => {
      if (!myEmail || !partner.email) {
        return;
      }

      // Check if we have valid authentication
      const token = await getStoredToken();
      if (!token) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        setConnectionState('error');
        return;
      }

      setConnectionState('connecting');

      const baseUrl = getApiBaseUrl().replace(/\/+$/, '');
      const socketUrl = `${baseUrl}/ws?username=${encodeURIComponent(myEmail)}`;

      const client = new Client({
        webSocketFactory: () => new SockJS(socketUrl),
        connectHeaders: {
          username: myEmail,
        },
        debug: (str) => {
          console.log('STOMP: ' + str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = () => {
        console.log('WebSocket connected for user:', myEmail);
        setConnectionState('connected');
        setError('');
        fetchChatHistory();
        flushPendingMessages();

        const privateQueue = `/user/${myEmail}/private`;
        console.log('Subscribing to:', privateQueue);
        client.subscribe(privateQueue, handleIncomingMessage);
      };

      client.onStompError = (frame) => {
        console.error('STOMP error:', frame);
        setConnectionState('error');
        setError(frame.body || 'Kết nối chat gặp lỗi.');
      };

      client.onWebSocketClose = () => {
        console.warn('WebSocket closed');
        setConnectionState('error');
      };

      client.onWebSocketError = (error) => {
        console.error('WebSocket error:', error);
        setConnectionState('error');
      };

      stompClientRef.current = client;
      client.activate();
    };

    initWebSocket();

    return () => {
      pendingMessagesRef.current = [];
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
      stompClientRef.current = null;
    };
  }, [
    myEmail,
    partner.email,
    fetchChatHistory,
    flushPendingMessages,
    handleIncomingMessage,
  ]);

  const handleSendMessage = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed || !myEmail || !partner.email || !myId || !partner.id) {
      return;
    }

    const now = Date.now();
    const { label } = formatTimestamp(now);
    const outgoingMessage: ChatMessage = {
      id: `local-${now}`,
      text: trimmed,
      sender: 'user',
      timestampLabel: label,
      rawTimestamp: now,
    };

    setMessages((prev) => [...prev, outgoingMessage]);
    setMessage('');
    scrollToBottom();
    updateRecentChat(outgoingMessage);

    const payload = {
      senderName: myEmail,
      senderId: myId,
      receiverName: partner.email,
      receiverId: partner.id,
      message: trimmed,
      status: 'MESSAGE',
      type: 'PRIVATE',
      conversationId: conversationId ?? undefined,
    };

    const client = stompClientRef.current;
    if (client && client.connected) {
      client.publish({
        destination: '/app/private-message',
        body: JSON.stringify(payload),
      });
    } else {
      pendingMessagesRef.current.push(payload);
      if (client && !client.active) {
        client.activate();
      }
    }
  }, [
    conversationId,
    message,
    myEmail,
    myId,
    partner.email,
    partner.id,
    scrollToBottom,
    updateRecentChat,
  ]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  const partnerInitial = partner.name?.charAt(0) || 'U';

  if (!userSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, styles.loadingState]}>
          <HelperText type='error' visible>
            Vui lòng đăng nhập để sử dụng tính năng chat.
          </HelperText>
          <IconButton icon='arrow-left' onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Chat Header */}
        <View style={styles.header}>
          <IconButton
            icon='arrow-left'
            size={24}
            onPress={() => router.back()}
          />
          <Avatar.Text size={40} label={partnerInitial} />
          <View style={styles.headerInfo}>
            <Text variant='titleMedium' style={styles.contactName}>
              {partner.name}
            </Text>
            <Text variant='bodySmall' style={styles.onlineStatus}>
              {connectionState === 'connected'
                ? 'Online'
                : connectionState === 'connecting'
                  ? 'Đang kết nối...'
                  : 'Đang ngoại tuyến'}
            </Text>
          </View>
          <IconButton
            icon='phone'
            size={24}
            onPress={() => {
              console.log('Voice call');
            }}
          />
          <IconButton
            icon='video'
            size={24}
            onPress={() => {
              console.log('Video call');
            }}
          />
        </View>

        {error ? (
          <HelperText type='error' visible style={styles.helperText}>
            {error}
          </HelperText>
        ) : null}

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {historyLoading && messages.length === 0 ? (
            <View style={styles.loadingState}>
              <ActivityIndicator animating size='large' />
              <Text style={styles.loadingText}>
                Đang tải lịch sử trò chuyện...
              </Text>
            </View>
          ) : null}
          {messages.map((item) => (
            <View
              key={item.id}
              style={[
                styles.messageContainer,
                item.sender === 'user'
                  ? styles.userMessage
                  : styles.otherMessage,
              ]}
            >
              <Card
                style={[
                  styles.messageCard,
                  {
                    backgroundColor:
                      item.sender === 'user'
                        ? theme.colors.primary
                        : theme.colors.surface,
                  },
                ]}
              >
                <Card.Content style={styles.messageContent}>
                  <Text
                    variant='bodyMedium'
                    style={[
                      styles.messageText,
                      {
                        color:
                          item.sender === 'user'
                            ? theme.colors.onPrimary
                            : theme.colors.onSurface,
                      },
                    ]}
                  >
                    {item.text}
                  </Text>
                  <Text
                    variant='bodySmall'
                    style={[
                      styles.timestamp,
                      {
                        color:
                          item.sender === 'user'
                            ? theme.colors.onPrimary
                            : theme.colors.onSurface,
                      },
                    ]}
                  >
                    {item.timestampLabel}
                  </Text>
                </Card.Content>
              </Card>
            </View>
          ))}
        </ScrollView>

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TextInput
            mode='outlined'
            placeholder='Nhập tin nhắn...'
            value={message}
            onChangeText={setMessage}
            style={styles.textInput}
            multiline
            onSubmitEditing={handleSendMessage}
            right={
              <TextInput.Icon
                icon='send'
                onPress={handleSendMessage}
                disabled={!message.trim()}
              />
            }
          />
        </View>
      </KeyboardAvoidingView>
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
    padding: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontWeight: '600',
  },
  onlineStatus: {
    color: '#4CAF50',
    opacity: 0.8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginVertical: 4,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageCard: {
    maxWidth: '80%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  messageContent: {
    padding: 8,
  },
  messageText: {
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.7,
  },
  helperText: {
    marginHorizontal: 16,
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    backgroundColor: '#fff',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.7,
  },
});
