import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  useWindowDimensions,
} from 'react-native';
import {
  Text,
  Button,
  IconButton,
  Checkbox,
  TextInput,
  Surface,
  ProgressBar,
  HelperText,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { buildApiUrl, describeApiTarget } from '../../utils/api';
import { getAuthToken } from '../../utils/auth';

const roomStyleImages = [
  'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/276671/pexels-photo-276671.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
];

export default function RoommateLifestyleScreen() {
  const {
    city,
    district,
    gender,
    hometown,
    birthYear,
    occupation,
    phone,
    userId: userIdParam,
  } = useLocalSearchParams<{
    city?: string;
    district?: string;
    gender?: string;
    hometown?: string;
    birthYear?: string;
    occupation?: string;
    phone?: string;
    userId?: string;
  }>();
  const { width } = useWindowDimensions();

  const [habits, setHabits] = useState({
    petFriendly: false,
    smoking: false,
    vegetarian: false,
  });
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [imageError, setImageError] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  const cardWidth = useMemo(() => Math.max(width / 3 - 28, 100), [width]);

  const resolvedUserId = useMemo(() => {
    const candidate =
      (profile?.userId as number | undefined) ??
      (profile?.id as number | undefined) ??
      (profile as { user?: { id?: number; userId?: number } } | null)?.user
        ?.id ??
      (profile as { user?: { id?: number; userId?: number } } | null)?.user
        ?.userId ??
      (profile?.renterId as number | undefined) ??
      (profile?.accountId as number | undefined) ??
      (profile?.profileId as number | undefined) ??
      (profile && typeof profile === 'object'
        ? Number(
            (profile as Record<string, unknown>).user_id ??
              (profile as Record<string, unknown>).userID ??
              (profile as Record<string, unknown>).renter_id ??
              (profile as Record<string, unknown>).account_id ??
              (profile as Record<string, unknown>).id,
          )
        : undefined) ??
      (userIdParam ? Number(userIdParam) : undefined);

    return candidate && !Number.isNaN(candidate) ? candidate : undefined;
  }, [profile, userIdParam]);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      const token = getAuthToken();
      if (!token) {
        setProfileError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        return;
      }

      try {
        setProfileLoading(true);
        setProfileError('');
        const response = await fetch(buildApiUrl('/renterowner/get-profile'), {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const message = await response.text().catch(() => '');
          throw new Error(
            message || `Yêu cầu thất bại với mã ${response.status}`,
          );
        }
        const data = await response.json().catch(() => null);
        if (isMounted) {
          setProfile(data);
        }
      } catch (error) {
        if (isMounted) {
          const rawMessage =
            error instanceof Error
              ? error.message
              : 'Không thể tải thông tin hồ sơ.';
          const friendlyMessage = rawMessage.includes('Network request failed')
            ? `Không thể kết nối tới API tại ${describeApiTarget()}. Nếu bạn dùng thiết bị thật, hãy dùng IP máy tính thay vì localhost hoặc cập nhật biến môi trường EXPO_PUBLIC_API_URL.`
            : rawMessage;
          setProfileError(friendlyMessage);
        }
      } finally {
        if (isMounted) {
          setProfileLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleHabit = (key: keyof typeof habits) => {
    setHabits((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const mapGenderToApi = (value?: string) => {
    const normalized = (value || '').toLowerCase();
    if (normalized === 'nam' || normalized === 'male') {
      return 'MALE';
    }
    if (normalized === 'nữ' || normalized === 'nu' || normalized === 'female') {
      return 'FEMALE';
    }
    return 'OTHER';
  };

  const buildHobbiesString = () => {
    const selections: string[] = [];
    if (habits.petFriendly) selections.push('Nuôi thú cưng');
    if (habits.smoking) selections.push('Hút thuốc');
    if (habits.vegetarian) selections.push('Ăn chay');
    return selections.join(', ');
  };

  const handleSubmit = async () => {
    if (selectedImage === null) {
      setImageError('Vui lòng chọn một phong cách phòng.');
      return;
    }

    const hobbyString = buildHobbiesString();
    const payload = {
      hometown: hometown || (profile?.hometown as string) || '',
      city: city || (profile?.city as string) || '',
      district: district || (profile?.district as string) || '',
      yob: birthYear || (profile?.yob as string) || '',
      job: occupation || (profile?.job as string) || '',
      phone: phone || (profile?.phone as string) || '',
      hobbies: hobbyString || (profile?.hobbies as string) || '',
      rateImage: String((selectedImage ?? 0) + 1),
      more: description,
      userId: resolvedUserId,
      gender: mapGenderToApi(gender || (profile?.gender as string)),
    };

    const token = getAuthToken();
    if (!token) {
      setApiError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      return;
    }

    if (!payload.userId) {
      setApiError(
        'Không xác định được tài khoản người dùng. Vui lòng đăng nhập lại.',
      );
      return;
    }

    if (!payload.city || !payload.district) {
      setApiError(
        'Vui lòng hoàn thành thông tin thành phố và quận trước khi tiếp tục.',
      );
      return;
    }

    setImageError('');
    setApiError('');

    try {
      setLoading(true);
      console.log('Submitting roommate profile payload:', payload);

      const postResponse = await fetch(buildApiUrl('/api/roommates'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!postResponse.ok) {
        const message = await postResponse.text().catch(() => '');
        throw new Error(
          message || `Không thể lưu thông tin (mã ${postResponse.status}).`,
        );
      }

      const recommendResponse = await fetch(
        buildApiUrl(`/api/roommates/recommend/${payload.userId}`),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!recommendResponse.ok) {
        const message = await recommendResponse.text().catch(() => '');
        throw new Error(
          message ||
            `Không thể lấy danh sách gợi ý (mã ${recommendResponse.status}).`,
        );
      }

      const recommendPayload = await recommendResponse.json().catch(() => null);
      const recommendations = Array.isArray(recommendPayload?.data)
        ? (recommendPayload?.data ?? [])
        : Array.isArray(recommendPayload)
          ? recommendPayload
          : [];
      console.log('Roommate recommendations:', recommendations);

      router.push({
        pathname: '/(tenant)/roommate-matching',
        params: {
          recommendations: JSON.stringify(recommendations ?? []),
        },
      });
    } catch (error) {
      const rawMessage =
        error instanceof Error
          ? error.message
          : 'Đã xảy ra lỗi khi gửi yêu cầu.';
      const friendlyMessage = rawMessage.includes('Network request failed')
        ? `Không thể kết nối tới API tại ${describeApiTarget()}. Hãy đảm bảo backend chạy và thiết bị có thể truy cập địa chỉ này (đặt EXPO_PUBLIC_API_URL hoặc dùng IP máy tính).`
        : rawMessage;
      setApiError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <IconButton
            icon='arrow-left'
            size={24}
            onPress={() => router.back()}
          />
          <Text variant='titleLarge' style={styles.headerTitle}>
            Thông tin Roommate - Bước 3/3
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <Surface style={styles.surface} elevation={2}>
          <Text style={styles.stepSubtitle}>
            Hoàn thiện thói quen sinh hoạt và gu thẩm mỹ để chúng tôi đề xuất
            người ở ghép phù hợp nhất.
          </Text>
          <ProgressBar progress={1} style={styles.progressBar} />

          {profileLoading ? (
            <HelperText type='info' visible>
              Đang tải thông tin hồ sơ...
            </HelperText>
          ) : null}
          {profileError ? (
            <HelperText type='error' visible>
              {profileError}
            </HelperText>
          ) : null}

          {(city || district) && (
            <View style={styles.locationSummary}>
              <Text variant='bodyMedium' style={styles.locationSummaryLabel}>
                Khu vực mong muốn:
              </Text>
              <Text variant='bodyLarge' style={styles.locationSummaryValue}>
                {city || 'Chưa xác định'}
                {district ? ` • ${district}` : ''}
              </Text>
            </View>
          )}

          <Text variant='titleMedium' style={styles.sectionTitle}>
            Thói quen sinh hoạt
          </Text>
          <View style={styles.checkboxRow}>
            <Checkbox.Item
              status={habits.petFriendly ? 'checked' : 'unchecked'}
              onPress={() => toggleHabit('petFriendly')}
              label='Nuôi thú cưng'
              position='leading'
              mode='android'
            />
            <Checkbox.Item
              status={habits.smoking ? 'checked' : 'unchecked'}
              onPress={() => toggleHabit('smoking')}
              label='Hút thuốc'
              position='leading'
              mode='android'
            />
            <Checkbox.Item
              status={habits.vegetarian ? 'checked' : 'unchecked'}
              onPress={() => toggleHabit('vegetarian')}
              label='Ăn chay'
              position='leading'
              mode='android'
            />
          </View>

          <Text variant='titleMedium' style={styles.sectionTitle}>
            Vui lòng chọn một trong ba phong cách phòng dưới đây
          </Text>
          <View style={styles.imageRow}>
            {roomStyleImages.map((uri, index) => {
              const isSelected = selectedImage === index;

              return (
                <TouchableOpacity
                  key={uri}
                  style={[
                    styles.imageCard,
                    { width: cardWidth },
                    isSelected && styles.imageCardSelected,
                  ]}
                  onPress={() => setSelectedImage(index)}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri }} style={styles.image} />
                  <View style={styles.radioIndicator}>
                    <View
                      style={[
                        styles.radioOuter,
                        isSelected && styles.radioOuterActive,
                      ]}
                    >
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          <HelperText type='error' visible={!!imageError}>
            {imageError}
          </HelperText>

          <Text variant='titleMedium' style={styles.sectionTitle}>
            Mô tả thêm
          </Text>
          <TextInput
            mode='outlined'
            placeholder='Chia sẻ thêm về phong cách sống hoặc nhu cầu của bạn...'
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />

          <View style={styles.buttonRow}>
            <Button
              mode='outlined'
              onPress={() => router.back()}
              style={styles.flexButton}
              disabled={loading}
            >
              Quay lại
            </Button>
            <Button
              mode='contained'
              onPress={handleSubmit}
              style={styles.flexButton}
              loading={loading}
              disabled={loading}
            >
              Tìm người phù hợp
            </Button>
          </View>
          {apiError ? (
            <HelperText type='error' visible style={styles.apiError}>
              {apiError}
            </HelperText>
          ) : null}
        </Surface>
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
    paddingBottom: 24,
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
  surface: {
    margin: 16,
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
    marginTop: 12,
    marginBottom: 12,
    fontWeight: '600',
  },
  locationSummary: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f5f0ff',
    marginBottom: 12,
  },
  locationSummaryLabel: {
    opacity: 0.7,
    marginBottom: 4,
  },
  locationSummaryValue: {
    fontWeight: '600',
  },
  checkboxRow: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  imageCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#fafafa',
  },
  imageCardSelected: {
    borderColor: '#6200ee',
  },
  image: {
    height: 110,
    width: '100%',
  },
  radioIndicator: {
    padding: 8,
    alignItems: 'center',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#bdbdbd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: '#6200ee',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6200ee',
  },
  textArea: {
    marginTop: 4,
    minHeight: 120,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  flexButton: {
    flex: 1,
  },
  apiError: {
    marginTop: 8,
  },
});
