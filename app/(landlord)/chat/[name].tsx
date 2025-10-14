import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, TextInput, Avatar } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../../components/ui/back-button';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'landlord' | 'tenant';
  timestamp: string;
  read: boolean;
}

interface Contact {
  name: string;
  avatar: string;
  lastSeen: string;
  status: 'online' | 'offline';
}

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    text: "Hi! I'm interested in your downtown apartment listing.",
    sender: 'tenant',
    timestamp: '2024-01-20 10:30',
    read: true,
  },
  {
    id: '2',
    text: 'Hello Sarah! Thank you for your interest. When would you like to schedule a viewing?',
    sender: 'landlord',
    timestamp: '2024-01-20 10:45',
    read: true,
  },
  {
    id: '3',
    text: "I'm available this weekend. Would Saturday morning work?",
    sender: 'tenant',
    timestamp: '2024-01-20 11:00',
    read: true,
  },
  {
    id: '4',
    text: "Saturday at 10 AM works perfectly. I'll send you the exact address.",
    sender: 'landlord',
    timestamp: '2024-01-20 11:15',
    read: true,
  },
  {
    id: '5',
    text: 'Great! Looking forward to seeing the place. Do you have any specific requirements for tenants?',
    sender: 'tenant',
    timestamp: '2024-01-20 11:30',
    read: false,
  },
];

const mockContact: Contact = {
  name: 'Sarah Johnson',
  avatar: 'https://via.placeholder.com/50',
  lastSeen: '2 hours ago',
  status: 'offline',
};

export default function ChatScreen() {
  const { name } = useLocalSearchParams();
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [contact] = useState(mockContact);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        sender: 'landlord',
        timestamp: new Date().toLocaleString(),
        read: false,
      };

      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const renderMessage = (message: ChatMessage) => {
    const isLandlord = message.sender === 'landlord';

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isLandlord ? styles.landlordMessage : styles.tenantMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isLandlord ? styles.landlordBubble : styles.tenantBubble,
          ]}
        >
          <Text
            variant='bodyMedium'
            style={[
              styles.messageText,
              isLandlord ? styles.landlordText : styles.tenantText,
            ]}
          >
            {message.text}
          </Text>
          <Text
            variant='labelSmall'
            style={[
              styles.timestamp,
              isLandlord ? styles.landlordTimestamp : styles.tenantTimestamp,
            ]}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton title={`Chat with ${name || contact.name}`} />

      {/* Chat Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerContent}>
            <Avatar.Image size={40} source={{ uri: contact.avatar }} />
            <View style={styles.contactInfo}>
              <Text variant='titleMedium' style={styles.contactName}>
                {name || contact.name}
              </Text>
              <Text variant='bodySmall' style={styles.lastSeen}>
                {contact.status === 'online'
                  ? '🟢 Online'
                  : `Last seen ${contact.lastSeen}`}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Messages */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map(renderMessage)}
      </ScrollView>

      {/* Message Input */}
      <Card style={styles.inputCard}>
        <Card.Content>
          <View style={styles.inputContainer}>
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder='Type a message...'
              style={styles.textInput}
              multiline
              right={
                <TextInput.Icon
                  icon='send'
                  onPress={handleSendMessage}
                  disabled={!newMessage.trim()}
                />
              }
            />
          </View>
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactInfo: {
    marginLeft: 12,
    flex: 1,
  },
  contactName: {
    fontWeight: '600',
  },
  lastSeen: {
    opacity: 0.7,
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 8,
  },
  messageContainer: {
    marginVertical: 4,
  },
  landlordMessage: {
    alignItems: 'flex-end',
  },
  tenantMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  landlordBubble: {
    backgroundColor: '#6200ee',
    borderBottomRightRadius: 4,
  },
  tenantBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    elevation: 1,
  },
  messageText: {
    marginBottom: 4,
  },
  landlordText: {
    color: 'white',
  },
  tenantText: {
    color: '#000',
  },
  timestamp: {
    fontSize: 11,
  },
  landlordTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  tenantTimestamp: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  inputCard: {
    margin: 16,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
  },
});
