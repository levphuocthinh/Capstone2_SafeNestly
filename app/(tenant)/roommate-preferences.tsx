import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Button,
  IconButton,
  useTheme,
  HelperText,
  Portal,
  Modal,
  List,
  Divider,
  ProgressBar,
  Surface,
} from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RoommatePreferencesScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{
    gender?: string;
    hometown?: string;
    birthYear?: string;
    occupation?: string;
    phone?: string;
    userId?: string;
  }>();
  const [location, setLocation] = useState({
    city: '',
    district: '',
  });
  const [locationErrors, setLocationErrors] = useState({
    city: '',
    district: '',
  });
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [districtModalVisible, setDistrictModalVisible] = useState(false);

  const cityOptions = useMemo(
    () => [
      {
        name: 'TP. Hồ Chí Minh',
        districts: [
          'Quận 1',
          'Quận 3',
          'Quận 5',
          'Quận 7',
          'Quận 10',
          'Quận Bình Thạnh',
          'Thành phố Thủ Đức',
        ],
      },
      {
        name: 'Hà Nội',
        districts: [
          'Quận Hoàn Kiếm',
          'Quận Hai Bà Trưng',
          'Quận Cầu Giấy',
          'Quận Nam Từ Liêm',
          'Quận Bắc Từ Liêm',
          'Quận Long Biên',
        ],
      },
      {
        name: 'Đà Nẵng',
        districts: [
          'Quận Hải Châu',
          'Quận Sơn Trà',
          'Quận Ngũ Hành Sơn',
          'Quận Liên Chiểu',
          'Quận Thanh Khê',
        ],
      },
      {
        name: 'Cần Thơ',
        districts: [
          'Quận Ninh Kiều',
          'Quận Bình Thủy',
          'Quận Cái Răng',
          'Quận Ô Môn',
        ],
      },
    ],
    [],
  );

  const selectedCity = useMemo(
    () => cityOptions.find((option) => option.name === location.city),
    [cityOptions, location.city],
  );

  const handleNextStep = () => {
    const nextErrors = {
      city: location.city ? '' : 'Vui lòng chọn thành phố mong muốn.',
      district: location.district ? '' : 'Vui lòng chọn quận/huyện mong muốn.',
    };
    setLocationErrors(nextErrors);
    if (nextErrors.city || nextErrors.district) {
      return;
    }

    router.push({
      pathname: './roommate-lifestyle',
      params: {
        city: location.city,
        district: location.district,
        gender: params.gender ?? '',
        hometown: params.hometown ?? '',
        birthYear: params.birthYear ?? '',
        occupation: params.occupation ?? '',
        phone: params.phone ?? '',
        userId: params.userId ?? '',
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <IconButton
            icon='arrow-left'
            size={24}
            onPress={() => router.back()}
          />
          <Text variant='titleLarge' style={styles.headerTitle}>
            Thông tin Roommate - Bước 2/3
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <Surface style={styles.surface} elevation={2}>
            <Text style={styles.stepSubtitle}>
              Bạn muốn tìm trọ ở đâu? Hãy chọn thành phố và khu vực ưu tiên để
              chúng tôi gợi ý phù hợp.
            </Text>
            <ProgressBar progress={2 / 3} style={styles.progressBar} />

            <Text variant='titleMedium' style={styles.sectionTitle}>
              Location Preference
            </Text>
            <Text variant='bodySmall' style={styles.sectionDescription}>
              Chọn khu vực bạn muốn tìm trọ để chúng tôi gợi ý phòng phù hợp.
            </Text>

            <View style={styles.locationField}>
              <Text style={styles.locationLabel}>Thành phố</Text>
              <Button
                mode='outlined'
                onPress={() => setCityModalVisible(true)}
                icon='chevron-down'
                contentStyle={styles.selectButtonContent}
                style={styles.selectButton}
              >
                {location.city || 'Chọn thành phố'}
              </Button>
              <HelperText type='error' visible={!!locationErrors.city}>
                {locationErrors.city}
              </HelperText>
            </View>

            <View style={styles.locationField}>
              <Text style={styles.locationLabel}>Quận / Huyện</Text>
              <Button
                mode='outlined'
                onPress={() => setDistrictModalVisible(true)}
                icon='chevron-down'
                contentStyle={styles.selectButtonContent}
                style={styles.selectButton}
                disabled={!selectedCity}
              >
                {location.district ||
                  (selectedCity ? 'Chọn quận / huyện' : 'Chọn thành phố trước')}
              </Button>
              <HelperText type='error' visible={!!locationErrors.district}>
                {locationErrors.district}
              </HelperText>
            </View>
          </Surface>

          <View style={styles.buttonRow}>
            <Button
              mode='outlined'
              onPress={() => router.back()}
              style={styles.flexButton}
            >
              Quay lại
            </Button>
            <Button
              mode='contained'
              onPress={handleNextStep}
              style={styles.flexButton}
            >
              Tiếp theo
            </Button>
          </View>
        </View>
      </ScrollView>
      <Portal>
        <Modal
          visible={cityModalVisible}
          onDismiss={() => setCityModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Chọn thành phố</Text>
          <ScrollView style={styles.modalScroll}>
            <List.Section>
              {cityOptions.map((option, index) => (
                <View key={option.name}>
                  <List.Item
                    title={option.name}
                    onPress={() => {
                      setLocation({
                        city: option.name,
                        district: '',
                      });
                      setLocationErrors((prev) => ({
                        ...prev,
                        city: '',
                        district: '',
                      }));
                      setCityModalVisible(false);
                    }}
                    right={() =>
                      location.city === option.name ? (
                        <List.Icon
                          icon='check-circle'
                          color={theme.colors.primary}
                        />
                      ) : null
                    }
                  />
                  {index < cityOptions.length - 1 && <Divider />}
                </View>
              ))}
            </List.Section>
          </ScrollView>
        </Modal>

        <Modal
          visible={districtModalVisible}
          onDismiss={() => setDistrictModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Chọn quận / huyện</Text>
          <ScrollView style={styles.modalScroll}>
            <List.Section>
              {selectedCity ? (
                selectedCity.districts.map((district, index) => (
                  <View key={district}>
                    <List.Item
                      title={district}
                      onPress={() => {
                        setLocation((prev) => ({
                          ...prev,
                          district,
                        }));
                        setLocationErrors((prev) => ({
                          ...prev,
                          district: '',
                        }));
                        setDistrictModalVisible(false);
                      }}
                      right={() =>
                        location.district === district ? (
                          <List.Icon
                            icon='check-circle'
                            color={theme.colors.primary}
                          />
                        ) : null
                      }
                    />
                    {index < selectedCity.districts.length - 1 && <Divider />}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyPlaceholder}>
                  Vui lòng chọn thành phố trước.
                </Text>
              )}
            </List.Section>
          </ScrollView>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  headerSpacer: {
    width: 48,
  },
  content: {
    padding: 16,
  },
  surface: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  stepSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  sectionDescription: {
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
  },
  locationField: {
    marginBottom: 16,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  selectButton: {
    justifyContent: 'space-between',
  },
  selectButtonContent: {
    justifyContent: 'space-between',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  flexButton: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalScroll: {
    maxHeight: 320,
  },
  emptyPlaceholder: {
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
  },
});
