import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Chip,
  HelperText,
} from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateListingScreen() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const amenitiesList = [
    'WiFi',
    'Kitchen',
    'Air Conditioning',
    'Heating',
    'Washing Machine',
    'Dryer',
    'Balcony',
    'Parking',
    'Gym Access',
    'Pool',
    'Security',
    'Pet Friendly',
  ];

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity],
    );
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return false;
    }
    if (!price.trim() || isNaN(Number(price))) {
      Alert.alert('Error', 'Please enter a valid price');
      return false;
    }
    if (!area.trim() || isNaN(Number(area))) {
      Alert.alert('Error', 'Please enter a valid area');
      return false;
    }
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter an address');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }
    return true;
  };

  const handleSave = async (saveStatus: 'draft' | 'publish') => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Simulate API call to save listing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const listingData = {
        title,
        price: Number(price),
        area: Number(area),
        address,
        description,
        amenities: selectedAmenities,
        status: saveStatus,
      };

      console.log('Saving listing:', listingData);

      Alert.alert(
        'Success',
        saveStatus === 'draft'
          ? 'Listing saved as draft'
          : 'Listing published successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      console.error('Listing save error:', error);
      Alert.alert('Error', 'Failed to save listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Button
            mode='text'
            icon='arrow-left'
            onPress={handleBack}
            style={styles.backButton}
          >
            Back
          </Button>
          <Title style={styles.headerTitle}>Create Listing</Title>
          <View style={styles.headerSpacer} />
        </View>

        {/* Basic Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Basic Information</Title>

            <TextInput
              label='Property Title *'
              value={title}
              onChangeText={setTitle}
              mode='outlined'
              placeholder='e.g., Cozy Downtown Apartment'
              style={styles.input}
            />

            <View style={styles.row}>
              <TextInput
                label='Monthly Rent ($) *'
                value={price}
                onChangeText={setPrice}
                mode='outlined'
                keyboardType='numeric'
                placeholder='1200'
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                label='Area (m²) *'
                value={area}
                onChangeText={setArea}
                mode='outlined'
                keyboardType='numeric'
                placeholder='45'
                style={[styles.input, styles.halfInput]}
              />
            </View>

            <TextInput
              label='Address *'
              value={address}
              onChangeText={setAddress}
              mode='outlined'
              placeholder='123 Main St, City, State'
              style={styles.input}
            />

            <TextInput
              label='Description *'
              value={description}
              onChangeText={setDescription}
              mode='outlined'
              multiline
              numberOfLines={4}
              placeholder='Describe your property, location benefits, and what makes it special...'
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Amenities */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Amenities</Title>
            <Text style={styles.subtitle}>Select all amenities that apply</Text>

            <View style={styles.amenitiesContainer}>
              {amenitiesList.map((amenity) => (
                <Chip
                  key={amenity}
                  selected={selectedAmenities.includes(amenity)}
                  onPress={() => toggleAmenity(amenity)}
                  style={styles.amenityChip}
                >
                  {amenity}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Photos Section - Placeholder */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Photos</Title>
            <Text style={styles.subtitle}>
              Add up to 10 photos (Feature coming soon)
            </Text>

            <View style={styles.photoPlaceholder}>
              <Button
                mode='outlined'
                icon='camera'
                style={styles.photoButton}
                disabled
              >
                Add Photos
              </Button>
              <HelperText type='info'>
                Photo upload will be available in the next update
              </HelperText>
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode='outlined'
            onPress={() => handleSave('draft')}
            loading={loading && status === 'draft'}
            disabled={loading}
            style={styles.draftButton}
          >
            Save as Draft
          </Button>

          <Button
            mode='contained'
            onPress={() => handleSave('publish')}
            loading={loading && status === 'publish'}
            disabled={loading}
            style={styles.publishButton}
          >
            Publish Now
          </Button>
        </View>

        <View style={styles.footer} />
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
  card: {
    margin: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    marginBottom: 8,
  },
  photoPlaceholder: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  photoButton: {
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  draftButton: {
    flex: 1,
  },
  publishButton: {
    flex: 1,
  },
  footer: {
    height: 20,
  },
});
