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
import Slider from '@react-native-community/slider';
import BackButton from '../../components/ui/back-button';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FilterState {
  priceRange: [number, number];
  areaRange: [number, number];
  numBedrooms: number | null;
  numBathrooms: number | null;
  city: string;
  district: string;
  ward: string;
  isRoomAvailable: boolean | null;
}

const FILTER_STORAGE_KEY = 'applied_filters';

export default function AdvancedFiltersScreen() {
  const theme = useTheme();
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 50000000], // VNĐ
    areaRange: [0, 200], // m²
    numBedrooms: null,
    numBathrooms: null,
    city: '',
    district: '',
    ward: '',
    isRoomAvailable: null,
  });

  const bedroomOptions = [0, 1, 2, 3, 4, 5];
  const bathroomOptions = [0, 1, 2, 3, 4, 5];

  const updatePriceRange = (value: number, index: number) => {
    setFilters((prev) => ({
      ...prev,
      priceRange:
        index === 0 ? [value, prev.priceRange[1]] : [prev.priceRange[0], value],
    }));
  };

  const updateAreaRange = (value: number, index: number) => {
    setFilters((prev) => ({
      ...prev,
      areaRange:
        index === 0 ? [value, prev.areaRange[1]] : [prev.areaRange[0], value],
    }));
  };

  const buildFilterString = (): string => {
    const conditions: string[] = [];

    // Price range
    if (filters.priceRange[0] > 0) {
      conditions.push(`price:>${filters.priceRange[0]}`);
    }
    if (filters.priceRange[1] < 50000000) {
      conditions.push(`price:<${filters.priceRange[1]}`);
    }

    // Area range (size)
    if (filters.areaRange[0] > 0) {
      conditions.push(`size:>${filters.areaRange[0]}`);
    }
    if (filters.areaRange[1] < 200) {
      conditions.push(`size:<${filters.areaRange[1]}`);
    }

    // City
    if (filters.city.trim()) {
      conditions.push(`city:${encodeURIComponent(filters.city.trim())}`);
    }

    // District
    if (filters.district.trim()) {
      conditions.push(
        `district:${encodeURIComponent(filters.district.trim())}`,
      );
    }

    // Ward
    if (filters.ward.trim()) {
      conditions.push(`ward:${encodeURIComponent(filters.ward.trim())}`);
    }

    return conditions.join(',');
  };

  const handleApplyFilters = async () => {
    try {
      const filterString = buildFilterString();
      const filterParams: any = {};

      // Parse filter string để tạo query params
      if (filterString) {
        filterParams.filter = filterString;
      }

      // Lưu filter params vào AsyncStorage để home screen có thể đọc
      await AsyncStorage.setItem(
        FILTER_STORAGE_KEY,
        JSON.stringify(filterParams),
      );

      console.log('Applied filters:', filterParams);

      // Navigate back - home screen sẽ đọc từ AsyncStorage
      router.back();
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  };

  const handleClearFilters = async () => {
    setFilters({
      priceRange: [0, 50000000],
      areaRange: [0, 200],
      numBedrooms: null,
      numBathrooms: null,
      city: '',
      district: '',
      ward: '',
      isRoomAvailable: null,
    });
    // Clear stored filters
    await AsyncStorage.removeItem(FILTER_STORAGE_KEY);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000000) count++;
    if (filters.areaRange[0] > 0 || filters.areaRange[1] < 200) count++;
    if (filters.numBedrooms !== null) count++;
    if (filters.numBathrooms !== null) count++;
    if (filters.city.trim()) count++;
    if (filters.district.trim()) count++;
    if (filters.ward.trim()) count++;
    if (filters.isRoomAvailable !== null) count++;
    return count;
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton title='Bộ lọc nâng cao' />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant='headlineMedium' style={styles.title}>
            Bộ Lọc Nâng Cao
          </Text>
          <Text variant='bodyLarge' style={styles.subtitle}>
            Tìm phòng phù hợp với các tiêu chí của bạn
          </Text>
          {getActiveFiltersCount() > 0 && (
            <Chip icon='filter' style={styles.activeFiltersChip}>
              {getActiveFiltersCount()} bộ lọc đang áp dụng
            </Chip>
          )}
        </View>

        {/* Price Range */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant='titleMedium' style={styles.sectionTitle}>
              💰 Khoảng Giá
            </Text>
            <Text variant='bodyMedium' style={styles.rangeText}>
              {filters.priceRange[0].toLocaleString('vi-VN')} -{' '}
              {filters.priceRange[1].toLocaleString('vi-VN')} VNĐ/tháng
            </Text>

            <View style={styles.sliderContainer}>
              <Text variant='bodySmall'>Tối thiểu: 0 VNĐ</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={50000000}
                value={filters.priceRange[0]}
                onValueChange={(value: number) =>
                  updatePriceRange(Math.round(value), 0)
                }
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor='#e0e0e0'
              />
              <Text variant='bodySmall'>Tối đa: 50M VNĐ</Text>
            </View>

            <View style={styles.sliderContainer}>
              <Text variant='bodySmall'>Giá tối thiểu</Text>
              <Slider
                style={styles.slider}
                minimumValue={filters.priceRange[0]}
                maximumValue={50000000}
                value={filters.priceRange[1]}
                onValueChange={(value: number) =>
                  updatePriceRange(Math.round(value), 1)
                }
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor='#e0e0e0'
              />
              <Text variant='bodySmall'>Giá tối đa</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Area Range */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant='titleMedium' style={styles.sectionTitle}>
              📐 Diện Tích Phòng
            </Text>
            <Text variant='bodyMedium' style={styles.rangeText}>
              {filters.areaRange[0]} - {filters.areaRange[1]} m²
            </Text>

            <View style={styles.sliderContainer}>
              <Text variant='bodySmall'>Tối thiểu: 0m²</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={200}
                value={filters.areaRange[0]}
                onValueChange={(value: number) =>
                  updateAreaRange(Math.round(value), 0)
                }
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor='#e0e0e0'
              />
              <Text variant='bodySmall'>Tối đa: 200m²</Text>
            </View>

            <View style={styles.sliderContainer}>
              <Text variant='bodySmall'>Diện tích tối thiểu</Text>
              <Slider
                style={styles.slider}
                minimumValue={filters.areaRange[0]}
                maximumValue={200}
                value={filters.areaRange[1]}
                onValueChange={(value: number) =>
                  updateAreaRange(Math.round(value), 1)
                }
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor='#e0e0e0'
              />
              <Text variant='bodySmall'>Diện tích tối đa</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Number of Bedrooms */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant='titleMedium' style={styles.sectionTitle}>
              🛏️ Số Phòng Ngủ
            </Text>
            <View style={styles.chipContainer}>
              <Chip
                selected={filters.numBedrooms === null}
                onPress={() =>
                  setFilters((prev) => ({ ...prev, numBedrooms: null }))
                }
                style={[
                  styles.chip,
                  filters.numBedrooms === null && {
                    backgroundColor: theme.colors.primary,
                  },
                ]}
                textStyle={
                  filters.numBedrooms === null ? { color: 'white' } : {}
                }
              >
                Tất cả
              </Chip>
              {bedroomOptions.map((num) => (
                <Chip
                  key={num}
                  selected={filters.numBedrooms === num}
                  onPress={() =>
                    setFilters((prev) => ({
                      ...prev,
                      numBedrooms: prev.numBedrooms === num ? null : num,
                    }))
                  }
                  style={[
                    styles.chip,
                    filters.numBedrooms === num && {
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                  textStyle={
                    filters.numBedrooms === num ? { color: 'white' } : {}
                  }
                >
                  {num === 0 ? 'Studio' : `${num} phòng`}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Number of Bathrooms */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant='titleMedium' style={styles.sectionTitle}>
              🚿 Số Phòng Tắm
            </Text>
            <View style={styles.chipContainer}>
              <Chip
                selected={filters.numBathrooms === null}
                onPress={() =>
                  setFilters((prev) => ({ ...prev, numBathrooms: null }))
                }
                style={[
                  styles.chip,
                  filters.numBathrooms === null && {
                    backgroundColor: theme.colors.primary,
                  },
                ]}
                textStyle={
                  filters.numBathrooms === null ? { color: 'white' } : {}
                }
              >
                Tất cả
              </Chip>
              {bathroomOptions.map((num) => (
                <Chip
                  key={num}
                  selected={filters.numBathrooms === num}
                  onPress={() =>
                    setFilters((prev) => ({
                      ...prev,
                      numBathrooms: prev.numBathrooms === num ? null : num,
                    }))
                  }
                  style={[
                    styles.chip,
                    filters.numBathrooms === num && {
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                  textStyle={
                    filters.numBathrooms === num ? { color: 'white' } : {}
                  }
                >
                  {num} phòng
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Availability */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.switchContainer}>
              <View style={styles.switchContent}>
                <Text variant='titleMedium'>✅ Chỉ hiển thị phòng có sẵn</Text>
                <Text variant='bodySmall' style={styles.switchDescription}>
                  Lọc các phòng đang có sẵn để cho thuê
                </Text>
              </View>
              <Switch
                value={filters.isRoomAvailable === true}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    isRoomAvailable: value ? true : null,
                  }))
                }
              />
            </View>
          </Card.Content>
        </Card>

        {/* City */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant='titleMedium' style={styles.sectionTitle}>
              🏙️ Thành Phố
            </Text>
            <TextInput
              label='Thành phố'
              value={filters.city}
              onChangeText={(text) =>
                setFilters((prev) => ({ ...prev, city: text }))
              }
              mode='outlined'
              style={styles.input}
              placeholder='VD: Hà Nội, Đà Nẵng, TP.HCM'
              left={<TextInput.Icon icon='city' />}
            />
          </Card.Content>
        </Card>

        {/* District */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant='titleMedium' style={styles.sectionTitle}>
              📍 Quận/Huyện
            </Text>
            <TextInput
              label='Quận hoặc huyện'
              value={filters.district}
              onChangeText={(text) =>
                setFilters((prev) => ({ ...prev, district: text }))
              }
              mode='outlined'
              style={styles.input}
              placeholder='VD: Hoàn Kiếm, Thanh Khê, Quận 1'
              left={<TextInput.Icon icon='map-marker' />}
            />
          </Card.Content>
        </Card>

        {/* Ward */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant='titleMedium' style={styles.sectionTitle}>
              📍 Phường/Xã
            </Text>
            <TextInput
              label='Phường hoặc xã'
              value={filters.ward}
              onChangeText={(text) =>
                setFilters((prev) => ({ ...prev, ward: text }))
              }
              mode='outlined'
              style={styles.input}
              placeholder='VD: Phường Hàng Bông, Phường Hải Châu'
              left={<TextInput.Icon icon='map-marker-outline' />}
            />
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <Button
          mode='outlined'
          onPress={handleClearFilters}
          style={styles.clearButton}
        >
          Xóa Tất Cả
        </Button>
        <Button
          mode='contained'
          onPress={handleApplyFilters}
          style={styles.applyButton}
        >
          Áp Dụng Bộ Lọc
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 12,
  },
  activeFiltersChip: {
    backgroundColor: '#e3f2fd',
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionDescription: {
    opacity: 0.7,
    marginBottom: 16,
  },
  rangeText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
    color: '#6200ee',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    margin: 2,
  },
  input: {
    marginTop: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchContent: {
    flex: 1,
    marginRight: 16,
  },
  switchDescription: {
    opacity: 0.7,
    marginTop: 4,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  clearButton: {
    flex: 1,
  },
  applyButton: {
    flex: 2,
  },
});
