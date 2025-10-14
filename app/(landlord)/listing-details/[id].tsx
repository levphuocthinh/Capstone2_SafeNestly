import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Card,
  Button,
  Avatar,
  Chip,
  List,
  Divider,
} from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../../components/ui/back-button';

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  area: number;
  status: 'active' | 'draft' | 'rented';
  description: string;
  amenities: string[];
  images: string[];
  applicants: number;
  views: number;
  createdAt: string;
}

const mockListing: Listing = {
  id: '1',
  title: 'Modern Downtown Apartment',
  price: 1200,
  location: 'Downtown, City Center',
  area: 45,
  status: 'active',
  description:
    'Beautiful and modern apartment in the heart of downtown. Perfect for young professionals or students. Recently renovated with high-end finishes.',
  amenities: [
    'WiFi',
    'Kitchen',
    'Air Conditioning',
    'Washing Machine',
    'Balcony',
    'Parking',
  ],
  images: [
    'https://via.placeholder.com/400x300',
    'https://via.placeholder.com/400x300',
    'https://via.placeholder.com/400x300',
  ],
  applicants: 12,
  views: 156,
  createdAt: '2024-01-15',
};

export default function ListingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [listing] = useState(mockListing);

  const handleEditListing = () => {
    router.push(`../create-listing?id=${id}`);
  };

  const handleViewApplicants = () => {
    router.push(`../applicants/${id}`);
  };

  const handleToggleStatus = () => {
    // Toggle between active/draft status
    console.log('Toggle listing status');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'draft':
        return '#FF9800';
      case 'rented':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton title='Listing Details' />

      <ScrollView style={styles.scrollContainer}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <Card.Cover source={{ uri: listing.images[0] }} />
          <Card.Content>
            <View style={styles.headerContent}>
              <Text variant='headlineSmall' style={styles.title}>
                {listing.title}
              </Text>
              <Chip
                style={[
                  styles.statusChip,
                  { backgroundColor: getStatusColor(listing.status) },
                ]}
                textStyle={styles.statusText}
              >
                {listing.status.toUpperCase()}
              </Chip>
            </View>

            <Text variant='bodyLarge' style={styles.location}>
              📍 {listing.location}
            </Text>

            <View style={styles.priceAreaContainer}>
              <Text variant='headlineSmall' style={styles.price}>
                ${listing.price}/month
              </Text>
              <Text variant='bodyLarge' style={styles.area}>
                {listing.area}m²
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant='titleMedium' style={styles.sectionTitle}>
              Performance
            </Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text variant='headlineMedium' style={styles.statValue}>
                  {listing.views}
                </Text>
                <Text variant='bodyMedium' style={styles.statLabel}>
                  Views
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text variant='headlineMedium' style={styles.statValue}>
                  {listing.applicants}
                </Text>
                <Text variant='bodyMedium' style={styles.statLabel}>
                  Applicants
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text variant='headlineMedium' style={styles.statValue}>
                  {Math.round(listing.views / 30)}
                </Text>
                <Text variant='bodyMedium' style={styles.statLabel}>
                  Daily Views
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Description Card */}
        <Card style={styles.descriptionCard}>
          <Card.Content>
            <Text variant='titleMedium' style={styles.sectionTitle}>
              Description
            </Text>
            <Text variant='bodyMedium' style={styles.description}>
              {listing.description}
            </Text>
          </Card.Content>
        </Card>

        {/* Amenities Card */}
        <Card style={styles.amenitiesCard}>
          <Card.Content>
            <Text variant='titleMedium' style={styles.sectionTitle}>
              Amenities
            </Text>
            <View style={styles.amenitiesContainer}>
              {listing.amenities.map((amenity) => (
                <Chip key={amenity} style={styles.amenityChip}>
                  {amenity}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Actions Card */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Text variant='titleMedium' style={styles.sectionTitle}>
              Actions
            </Text>

            <List.Item
              title='Edit Listing'
              description='Modify listing details and photos'
              left={(props) => <List.Icon {...props} icon='pencil' />}
              right={(props) => <List.Icon {...props} icon='chevron-right' />}
              onPress={handleEditListing}
            />

            <List.Item
              title='View Applicants'
              description={`${listing.applicants} people interested`}
              left={(props) => <List.Icon {...props} icon='account-group' />}
              right={(props) => <List.Icon {...props} icon='chevron-right' />}
              onPress={handleViewApplicants}
            />

            <List.Item
              title='Toggle Status'
              description='Change between active/draft'
              left={(props) => <List.Icon {...props} icon='toggle-switch' />}
              right={(props) => <List.Icon {...props} icon='chevron-right' />}
              onPress={handleToggleStatus}
            />
          </Card.Content>
        </Card>
      </ScrollView>
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
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    marginRight: 12,
    fontWeight: '600',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
  },
  location: {
    marginBottom: 12,
    opacity: 0.7,
  },
  priceAreaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  area: {
    opacity: 0.7,
  },
  statsCard: {
    margin: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  statLabel: {
    opacity: 0.7,
    marginTop: 4,
  },
  descriptionCard: {
    margin: 16,
    marginBottom: 8,
  },
  description: {
    lineHeight: 20,
  },
  amenitiesCard: {
    margin: 16,
    marginBottom: 8,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    marginBottom: 4,
  },
  actionsCard: {
    margin: 16,
    marginBottom: 32,
  },
});
