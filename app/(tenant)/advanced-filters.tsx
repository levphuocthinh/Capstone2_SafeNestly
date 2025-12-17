import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/ui/back-button';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FilterState {
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
}

const FILTER_STORAGE_KEY = 'applied_filters';

export default function AdvancedFiltersScreen() {
  const [filters, setFilters] = useState<FilterState>({
    minPrice: '0',
    maxPrice: '10000000',
    minArea: '0',
    maxArea: '100',
  });

  const buildFilterString = (): string => {
    const conditions: string[] = [];

    // Price range
    const minPrice = parseInt(filters.minPrice) || 0;
    const maxPrice = parseInt(filters.maxPrice) || 0;

    if (minPrice > 0) {
      conditions.push(`price:>${minPrice}`);
    }
    if (maxPrice > 0) {
      conditions.push(`price:<${maxPrice}`);
    }

    // Area range (size)
    const minArea = parseInt(filters.minArea) || 0;
    const maxArea = parseInt(filters.maxArea) || 0;

    if (minArea > 0) {
      conditions.push(`size:>${minArea}`);
    }
    if (maxArea > 0) {
      conditions.push(`size:<${maxArea}`);
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
      minPrice: '0',
      maxPrice: '10000000',
      minArea: '0',
      maxArea: '100',
    });
    // Clear stored filters
    await AsyncStorage.removeItem(FILTER_STORAGE_KEY);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.minPrice !== '0') count++;
    if (filters.maxPrice !== '10000000') count++;
    if (filters.minArea !== '0') count++;
    if (filters.maxArea !== '100') count++;
    return count;
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton title='Bộ lọc nâng cao' />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps='handled'
          >
            <View style={styles.filterRow}>
              <View style={styles.filterItem}>
                <Text variant='labelMedium' style={styles.label}>
                  Giá tối thiểu (VNĐ)
                </Text>
                <TextInput
                  mode='outlined'
                  value={filters.minPrice}
                  onChangeText={(text) =>
                    setFilters((prev) => ({ ...prev, minPrice: text }))
                  }
                  keyboardType='numeric'
                  placeholder='0'
                  style={styles.textInput}
                  returnKeyType='done'
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>

              <View style={styles.filterItem}>
                <Text variant='labelMedium' style={styles.label}>
                  Giá tối đa (VNĐ)
                </Text>
                <TextInput
                  mode='outlined'
                  value={filters.maxPrice}
                  onChangeText={(text) =>
                    setFilters((prev) => ({ ...prev, maxPrice: text }))
                  }
                  keyboardType='numeric'
                  placeholder='10000000'
                  style={styles.textInput}
                  returnKeyType='done'
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>
            </View>

            <View style={styles.filterRow}>
              <View style={styles.filterItem}>
                <Text variant='labelMedium' style={styles.label}>
                  Diện tích tối thiểu (m²)
                </Text>
                <TextInput
                  mode='outlined'
                  value={filters.minArea}
                  onChangeText={(text) =>
                    setFilters((prev) => ({ ...prev, minArea: text }))
                  }
                  keyboardType='numeric'
                  placeholder='0'
                  style={styles.textInput}
                  returnKeyType='done'
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>

              <View style={styles.filterItem}>
                <Text variant='labelMedium' style={styles.label}>
                  Diện tích tối đa (m²)
                </Text>
                <TextInput
                  mode='outlined'
                  value={filters.maxArea}
                  onChangeText={(text) =>
                    setFilters((prev) => ({ ...prev, maxArea: text }))
                  }
                  keyboardType='numeric'
                  placeholder='100'
                  style={styles.textInput}
                  returnKeyType='done'
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>

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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  filterItem: {
    flex: 1,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#fff',
  },
  actionContainer: {
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
