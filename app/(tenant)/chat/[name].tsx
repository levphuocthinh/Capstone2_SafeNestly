import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Text,
  TextInput,
  IconButton,
  Card,
  Avatar,
  useTheme,
} from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

interface Message {
  id: number;
  text: string;
  sender: "user" | "other";
  timestamp: string;
}

export default function ChatScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const theme = useTheme();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm interested in your room listing. Is it still available?",
      sender: "user",
      timestamp: "10:30 AM",
    },
    {
      id: 2,
      text: "Hello! Yes, the room is still available. Would you like to schedule a viewing?",
      sender: "other",
      timestamp: "10:35 AM",
    },
    {
      id: 3,
      text: "That sounds great! I'm free this weekend. What times work for you?",
      sender: "user",
      timestamp: "10:40 AM",
    },
    {
      id: 4,
      text: "Saturday at 2 PM or Sunday at 11 AM would work for me. Which do you prefer?",
      sender: "other",
      timestamp: "10:45 AM",
    },
  ]);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: message.trim(),
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const renderMessage = (msg: Message) => (
    <View
      key={msg.id}
      style={[
        styles.messageContainer,
        msg.sender === "user" ? styles.userMessage : styles.otherMessage,
      ]}
    >
      <Card
        style={[
          styles.messageCard,
          {
            backgroundColor:
              msg.sender === "user"
                ? theme.colors.primary
                : theme.colors.surface,
          },
        ]}
      >
        <Card.Content style={styles.messageContent}>
          <Text
            variant="bodyMedium"
            style={[
              styles.messageText,
              {
                color:
                  msg.sender === "user"
                    ? theme.colors.onPrimary
                    : theme.colors.onSurface,
              },
            ]}
          >
            {msg.text}
          </Text>
          <Text
            variant="bodySmall"
            style={[
              styles.timestamp,
              {
                color:
                  msg.sender === "user"
                    ? theme.colors.onPrimary
                    : theme.colors.onSurface,
              },
            ]}
          >
            {msg.timestamp}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Chat Header */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => router.back()}
          />
          <Avatar.Text size={40} label={name?.charAt(0) || "U"} />
          <View style={styles.headerInfo}>
            <Text variant="titleMedium" style={styles.contactName}>
              {name || "User"}
            </Text>
            <Text variant="bodySmall" style={styles.onlineStatus}>
              Online
            </Text>
          </View>
          <IconButton
            icon="phone"
            size={24}
            onPress={() => {
              // Handle voice call
              console.log("Voice call");
            }}
          />
          <IconButton
            icon="video"
            size={24}
            onPress={() => {
              // Handle video call
              console.log("Video call");
            }}
          />
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map(renderMessage)}
        </ScrollView>

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TextInput
            mode="outlined"
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            style={styles.textInput}
            multiline
            onSubmitEditing={handleSendMessage}
            right={
              <TextInput.Icon
                icon="send"
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
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontWeight: "600",
  },
  onlineStatus: {
    color: "#4CAF50",
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
    alignItems: "flex-end",
  },
  otherMessage: {
    alignItems: "flex-start",
  },
  messageCard: {
    maxWidth: "80%",
    elevation: 2,
    shadowColor: "#000",
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
  inputContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  textInput: {
    backgroundColor: "#fff",
  },
});
