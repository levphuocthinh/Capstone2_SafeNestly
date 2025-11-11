import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_CHATS_KEY = 'recent-chats/v1';
const MAX_RECENT_CHATS = 20;

export interface RecentChat {
  conversationId?: number;
  partnerId?: number;
  partnerEmail?: string;
  partnerName: string;
  lastMessagePreview?: string;
  lastTimestamp: number;
}

const parseChats = (raw: string | null): RecentChat[] => {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as RecentChat[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter((item) => !!item && typeof item === 'object')
      .map((item) => ({
        conversationId:
          typeof item.conversationId === 'number'
            ? item.conversationId
            : undefined,
        partnerId:
          typeof item.partnerId === 'number' ? item.partnerId : undefined,
        partnerEmail:
          typeof item.partnerEmail === 'string' ? item.partnerEmail : undefined,
        partnerName:
          typeof item.partnerName === 'string' ? item.partnerName : 'Unknown',
        lastMessagePreview:
          typeof item.lastMessagePreview === 'string'
            ? item.lastMessagePreview
            : undefined,
        lastTimestamp:
          typeof item.lastTimestamp === 'number'
            ? item.lastTimestamp
            : Date.now(),
      }))
      .sort((a, b) => b.lastTimestamp - a.lastTimestamp);
  } catch (error) {
    console.warn('Failed to parse recent chats cache:', error);
    return [];
  }
};

const serialiseChats = (chats: RecentChat[]): string => {
  return JSON.stringify(
    chats.slice(0, MAX_RECENT_CHATS).map((item) => ({
      ...item,
      lastTimestamp:
        typeof item.lastTimestamp === 'number'
          ? item.lastTimestamp
          : Date.now(),
    })),
  );
};

export const loadRecentChats = async (): Promise<RecentChat[]> => {
  try {
    const raw = await AsyncStorage.getItem(RECENT_CHATS_KEY);
    return parseChats(raw);
  } catch (error) {
    console.warn('Unable to load recent chats:', error);
    return [];
  }
};

export const persistRecentChats = async (chats: RecentChat[]) => {
  try {
    await AsyncStorage.setItem(RECENT_CHATS_KEY, serialiseChats(chats));
  } catch (error) {
    console.warn('Unable to persist recent chats:', error);
  }
};

export const upsertRecentChat = async (chat: RecentChat) => {
  const existing = await loadRecentChats();
  const filtered = existing.filter((item) => {
    if (chat.partnerId && item.partnerId) {
      return item.partnerId !== chat.partnerId;
    }
    if (chat.partnerEmail && item.partnerEmail) {
      return item.partnerEmail !== chat.partnerEmail;
    }
    return item.partnerName !== chat.partnerName;
  });

  const updated: RecentChat[] = [
    {
      conversationId:
        typeof chat.conversationId === 'number'
          ? chat.conversationId
          : undefined,
      partnerId: chat.partnerId,
      partnerEmail: chat.partnerEmail,
      partnerName: chat.partnerName,
      lastMessagePreview: chat.lastMessagePreview,
      lastTimestamp: chat.lastTimestamp ?? Date.now(),
    },
    ...filtered,
  ];

  await persistRecentChats(updated);
  return updated;
};

export const clearRecentChats = async () => {
  try {
    await AsyncStorage.removeItem(RECENT_CHATS_KEY);
  } catch (error) {
    console.warn('Unable to clear recent chats:', error);
  }
};
