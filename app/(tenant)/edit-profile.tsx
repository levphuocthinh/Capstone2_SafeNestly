import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Menu,
  ActivityIndicator,
} from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/ui/back-button';
import { updateUserProfile } from '../../services/auth.service';
import { getStoredUser } from '../../utils/auth-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<number>(0);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [genderMenuVisible, setGenderMenuVisible] = useState(false);
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bio, setBio] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getStoredUser();
      if (user) {
        setUserId(user.id);
        setFullName(user.fullName || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
        setGender(user.gender?.toLowerCase() || '');
        setBio(user.bio || '');

        // Parse dob
        if (user.dob) {
          const dobDate = new Date(user.dob);
          if (!isNaN(dobDate.getTime())) {
            setBirthDate(dobDate);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ và tên');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }

    setSaving(true);
    try {
      // Format date as yyyy-MM-dd
      const year = birthDate.getFullYear();
      const month = String(birthDate.getMonth() + 1).padStart(2, '0');
      const day = String(birthDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      const result = await updateUserProfile(userId, {
        fullName: fullName.trim(),
        // Email không được cập nhật
        phone: phone.trim(),
        gender: gender.toUpperCase() as 'MALE' | 'FEMALE' | 'OTHER',
        dob: formattedDate,
        bio: bio.trim(),
      });

      if (result.success) {
        Alert.alert('Thành công', 'Cập nhật hồ sơ thành công', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('Lỗi', result.error || 'Không thể cập nhật hồ sơ');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getGenderLabel = () => {
    if (gender === 'male') return 'Nam';
    if (gender === 'female') return 'Nữ';
    if (gender === 'other') return 'Khác';
    return 'Chọn giới tính';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <BackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton title='Chỉnh sửa Hồ sơ' />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          {/* Họ và tên */}
          <TextInput
            label='Họ và tên'
            value={fullName}
            onChangeText={setFullName}
            mode='outlined'
            left={<TextInput.Icon icon='account' />}
            style={styles.input}
          />

          {/* Email - Không thể chỉnh sửa */}
          <TextInput
            label='Email (không thể thay đổi)'
            value={email}
            mode='outlined'
            keyboardType='email-address'
            autoCapitalize='none'
            editable={false}
            left={<TextInput.Icon icon='email' />}
            style={[styles.input, styles.disabledInput]}
          />

          {/* Số điện thoại */}
          <TextInput
            label='Số điện thoại'
            value={phone}
            onChangeText={setPhone}
            mode='outlined'
            keyboardType='phone-pad'
            left={<TextInput.Icon icon='phone' />}
            style={styles.input}
          />

          {/* Ngày sinh */}
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput
              label='Ngày sinh'
              value={formatDate(birthDate)}
              mode='outlined'
              editable={false}
              left={<TextInput.Icon icon='calendar' />}
              style={styles.input}
              pointerEvents='none'
            />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={birthDate}
              mode='date'
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_event, selectedDate) => {
                if (Platform.OS === 'android') {
                  setShowDatePicker(false);
                }
                if (selectedDate) {
                  setBirthDate(selectedDate);
                }
              }}
              maximumDate={new Date()}
            />
          )}

          {showDatePicker && Platform.OS === 'ios' && (
            <Button
              mode='contained'
              onPress={() => setShowDatePicker(false)}
              style={{ marginBottom: 12 }}
            >
              Xác nhận
            </Button>
          )}

          {/* Giới tính */}
          <Menu
            visible={genderMenuVisible}
            onDismiss={() => setGenderMenuVisible(false)}
            anchor={
              <TouchableOpacity
                onPress={() => setGenderMenuVisible(true)}
                style={styles.menuButton}
              >
                <TextInput
                  label='Giới tính'
                  value={getGenderLabel()}
                  mode='outlined'
                  editable={false}
                  left={<TextInput.Icon icon='account' />}
                  right={<TextInput.Icon icon='chevron-down' />}
                  style={styles.input}
                  pointerEvents='none'
                />
              </TouchableOpacity>
            }
          >
            <Menu.Item
              onPress={() => {
                setGender('male');
                setGenderMenuVisible(false);
              }}
              title='Nam'
            />
            <Menu.Item
              onPress={() => {
                setGender('female');
                setGenderMenuVisible(false);
              }}
              title='Nữ'
            />
            <Menu.Item
              onPress={() => {
                setGender('other');
                setGenderMenuVisible(false);
              }}
              title='Khác'
            />
          </Menu>

          {/* Giới thiệu */}
          <TextInput
            label='Giới thiệu bản thân'
            value={bio}
            onChangeText={setBio}
            mode='outlined'
            multiline
            numberOfLines={4}
            style={[styles.input, styles.textArea]}
            placeholder='Chia sẻ về bản thân bạn...'
          />

          {/* Nút lưu */}
          <Button
            mode='contained'
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            style={styles.saveButton}
            contentStyle={styles.buttonContent}
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>

          <Button
            mode='outlined'
            onPress={() => router.back()}
            disabled={saving}
            style={styles.cancelButton}
          >
            Hủy
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  disabledInput: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5',
  },
  menuButton: {
    width: '100%',
  },
  textArea: {
    minHeight: 100,
  },
  saveButton: {
    marginTop: 20,
    borderRadius: 8,
  },
  cancelButton: {
    marginTop: 12,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
