import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Button,
  Card,
  Chip,
  Switch,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FiltersScreen() {
  const theme = useTheme();
  const [priceRange, setPriceRange] = useState([500, 2000]);
  const [roomType, setRoomType] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [petFriendly, setPetFriendly] = useState(false);
  const [location, setLocation] = useState('');

  const roomTypes = ['Studio', '1 Bedroom', '2 Bedroom', '3+ Bedroom'];
  const amenityOptions = [
    'WiFi',
    'Parking',
    'Laundry',
    'Pool',
    'Gym',
    'Air Conditioning',
    'Dishwasher',
    'Balcony',
  ];

  const toggleRoomType = (type: string) => {
    setRoomType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity],
    );
  };

  const handleApplyFilters = () => {
    // Apply filters logic here
    console.log('Filters applied:', {
      priceRange,
      roomType,
      amenities,
      petFriendly,
      location,
    });
    router.back();
  };

  const handleClearFilters = () => {
    setPriceRange([500, 2000]);
    setRoomType([]);
    setAmenities([]);
    setPetFriendly(false);
    setLocation('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text
            variant='headlineMedium'
            style={[styles.title, { color: theme.colors.primary }]}
          >
            Lọc kết quả
          </Text>
          <Text variant='bodyLarge' style={styles.subtitle}>
            Tùy chỉnh tùy chọn tìm kiếm của bạn
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant='titleMedium' style={styles.sectionTitle}>
              Khoảng giá
            </Text>
            <View style={styles.priceContainer}>
              <Text variant='bodyMedium'>
                ${priceRange[0]} - ${priceRange[1]} mỗi tháng
              </Text>
              <View style={styles.sliderContainer}>
                {/* Note: React Native Paper doesn't have Slider, using placeholder */}
                <View style={styles.sliderPlaceholder}>
                  <Text variant='bodySmall'>Thanh trượt giá</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant='titleMedium' style={styles.sectionTitle}>
              Loại phòng
            </Text>
            <View style={styles.chipContainer}>
              {roomTypes.map((type) => (
                <Chip
                  key={type}
                  selected={roomType.includes(type)}
                  onPress={() => toggleRoomType(type)}
                  style={styles.chip}
                >
                  {type}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant='titleMedium' style={styles.sectionTitle}>
              Vị trí
            </Text>
            <TextInput
              label='Khu vực hoặc phường ưa thích'
              value={location}
              onChangeText={setLocation}
              mode='outlined'
              style={styles.input}
              placeholder='Ví dụ: Quận 1, Quận Tân Bình'
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant='titleMedium' style={styles.sectionTitle}>
              Tiện nghi
            </Text>
            <View style={styles.chipContainer}>
              {amenityOptions.map((amenity) => (
                <Chip
                  key={amenity}
                  selected={amenities.includes(amenity)}
                  onPress={() => toggleAmenity(amenity)}
                  style={styles.chip}
                >
                  {amenity}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.switchContainer}>
              <Text variant='titleMedium'>Pet Friendly</Text>
              <Switch value={petFriendly} onValueChange={setPetFriendly} />
            </View>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode='outlined'
            onPress={handleClearFilters}
            style={styles.clearButton}
          >
            Clear All
          </Button>
          <Button
            mode='contained'
            onPress={handleApplyFilters}
            style={styles.applyButton}
          >
            Apply Filters
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  priceContainer: {
    marginVertical: 8,
  },
  sliderContainer: {
    marginTop: 16,
  },
  sliderPlaceholder: {
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  input: {
    marginVertical: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  clearButton: {
    flex: 1,
  },
  applyButton: {
    flex: 1,
  },
});
