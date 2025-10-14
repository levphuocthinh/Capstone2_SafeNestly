import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  Avatar,
  Chip,
  Searchbar,
} from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Contact {
  id: string;
  name: string;
  avatar: string;
  property: string;
  status: 'new' | 'replied' | 'interested' | 'not-interested';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://via.placeholder.com/50x50',
    property: 'Modern Downtown Apartment',
    status: 'new',
    lastMessage:
      "Hi! I'm interested in viewing this apartment. When would be a good time?",
    lastMessageTime: '2 hours ago',
    unreadCount: 2,
  },
  {
    id: '2',
    name: 'Mike Chen',
    avatar: 'https://via.placeholder.com/50x50',
    property: 'Cozy Studio Near University',
    status: 'replied',
    lastMessage:
      "Thank you for the information. I'll let you know by tomorrow.",
    lastMessageTime: '1 day ago',
    unreadCount: 0,
  },
  {
    id: '3',
    name: 'Emma Wilson',
    avatar: 'https://via.placeholder.com/50x50',
    property: 'Modern Downtown Apartment',
    status: 'interested',
    lastMessage: 'I would like to schedule a viewing for this weekend.',
    lastMessageTime: '3 days ago',
    unreadCount: 1,
  },
];

export default function ManageContactsScreen() {
  const [contacts] = useState(mockContacts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const handleContactPress = (contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (contact) {
      router.push(`./chat/${contact.name}`);
    }
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

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.property.toLowerCase().includes(searchQuery.toLowerCase());

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

  const renderContactCard = ({ item }: { item: Contact }) => (
    <Card
      style={styles.contactCard}
      onPress={() => handleContactPress(item.id)}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.contactHeader}>
          <Avatar.Image
            size={50}
            source={{ uri: item.avatar }}
            style={styles.avatar}
          />
          <View style={styles.contactInfo}>
            <View style={styles.nameContainer}>
              <Title style={styles.contactName}>{item.name}</Title>
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.propertyName}>{item.property}</Text>
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
              <Text style={styles.timeText}>{item.lastMessageTime}</Text>
            </View>
          </View>
        </View>

        <Paragraph style={styles.lastMessage} numberOfLines={2}>
          {item.lastMessage}
        </Paragraph>
      </Card.Content>
    </Card>
  );

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

      {filteredContacts.length === 0 ? (
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
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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
});
