import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Text, TextInput, Button, Menu } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/ui/back-button';
import { registerUser } from '../../services/auth.service';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [genderMenuVisible, setGenderMenuVisible] = useState(false);
  const [bio, setBio] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const handleRegister = async () => {
    // Validation
    const errors: { [key: string]: string } = {};

    if (!fullName.trim()) errors.fullName = 'Vui lòng nhập họ và tên';
    if (!email.trim()) errors.email = 'Vui lòng nhập email';
    if (!phone.trim()) errors.phone = 'Vui lòng nhập số điện thoại';
    if (!gender) errors.gender = 'Vui lòng chọn giới tính';
    if (!password) errors.password = 'Vui lòng nhập mật khẩu';
    if (password.length < 6)
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    if (password !== confirmPassword)
      errors.confirmPassword = 'Mật khẩu không khớp';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    try {
      // Format date as yyyy-MM-dd for backend
      const year = birthDate.getFullYear();
      const month = String(birthDate.getMonth() + 1).padStart(2, '0');
      const day = String(birthDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      const result = await registerUser({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        role: 'RENTER', // Mặc định là RENTER (người thuê)
        phone: phone.trim(),
        gender: gender.toUpperCase() as 'MALE' | 'FEMALE' | 'OTHER',
        dob: formattedDate,
        bio: bio.trim() || undefined,
      });

      if (result.success) {
        router.replace('/(auth)/login');
      } else {
        setValidationErrors({
          general: result.error || 'Đăng ký thất bại. Vui lòng thử lại.',
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setValidationErrors({
        general: 'Đăng ký thất bại. Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
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

  return (
    <SafeAreaView style={styles.container}>
      <BackButton title='Đăng Ký' />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          {/* Họ và tên */}
          <TextInput
            label='Nhập họ và tên'
            value={fullName}
            onChangeText={setFullName}
            mode='outlined'
            left={<TextInput.Icon icon='account' />}
            style={styles.input}
            error={!!validationErrors.fullName}
          />
          {!!validationErrors.fullName && (
            <Text style={styles.errorText}>{validationErrors.fullName}</Text>
          )}

          {/* Email */}
          <TextInput
            label='Nhập địa chỉ email'
            value={email}
            onChangeText={setEmail}
            mode='outlined'
            keyboardType='email-address'
            autoCapitalize='none'
            left={<TextInput.Icon icon='email' />}
            style={styles.input}
            error={!!validationErrors.email}
          />
          {!!validationErrors.email && (
            <Text style={styles.errorText}>{validationErrors.email}</Text>
          )}

          {/* Mật khẩu */}
          <TextInput
            label='Tạo mật khẩu'
            value={password}
            onChangeText={setPassword}
            mode='outlined'
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon='lock' />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
            error={!!validationErrors.password}
          />
          {!!validationErrors.password && (
            <Text style={styles.errorText}>{validationErrors.password}</Text>
          )}

          {/* Xác nhận mật khẩu */}
          <TextInput
            label='Xác nhận mật khẩu'
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode='outlined'
            secureTextEntry={!showConfirmPassword}
            left={<TextInput.Icon icon='lock-check' />}
            right={
              <TextInput.Icon
                icon={showConfirmPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
            style={styles.input}
            error={!!validationErrors.confirmPassword}
          />
          {!!validationErrors.confirmPassword && (
            <Text style={styles.errorText}>
              {validationErrors.confirmPassword}
            </Text>
          )}

          {/* SĐT và Ngày sinh */}
          <View style={styles.rowContainer}>
            <View style={styles.halfInput}>
              <TextInput
                label='SĐT'
                value={phone}
                onChangeText={setPhone}
                mode='outlined'
                keyboardType='phone-pad'
                left={<TextInput.Icon icon='phone' />}
                style={styles.input}
                error={!!validationErrors.phone}
              />
              {!!validationErrors.phone && (
                <Text style={styles.errorText}>{validationErrors.phone}</Text>
              )}
            </View>

            <View style={styles.halfInput}>
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
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={birthDate}
              mode='date'
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_event, selectedDate) => {
                // On Android, close picker after selection
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

          {/* iOS: Nút xác nhận khi chọn ngày */}
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
          <View>
            <Text style={styles.label}>Giới tính</Text>
            <Menu
              visible={genderMenuVisible}
              onDismiss={() => setGenderMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  onPress={() => setGenderMenuVisible(true)}
                  style={styles.menuButton}
                >
                  <TextInput
                    label='Chọn giới tính'
                    value={getGenderLabel()}
                    mode='outlined'
                    editable={false}
                    left={<TextInput.Icon icon='account' />}
                    right={<TextInput.Icon icon='chevron-down' />}
                    style={styles.input}
                    pointerEvents='none'
                    error={!!validationErrors.gender}
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
            {!!validationErrors.gender && (
              <Text style={styles.errorText}>{validationErrors.gender}</Text>
            )}
          </View>

          {/* Giới thiệu bản thân */}
          <TextInput
            label='Giới thiệu bản thân (tùy chọn)'
            value={bio}
            onChangeText={setBio}
            mode='outlined'
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textArea]}
            placeholder='Ví dụ: Sinh viên năm 3, thích sạch sẽ, yên tĩnh...'
          />

          {/* Nút đăng ký */}
          <Button
            mode='contained'
            onPress={handleRegister}
            loading={loading}
            disabled={
              !email ||
              !password ||
              !fullName ||
              !phone ||
              !gender ||
              password !== confirmPassword
            }
            style={styles.registerButton}
            contentStyle={styles.buttonContent}
          >
            Đăng ký
          </Button>

          {!!validationErrors.general && (
            <Text style={styles.errorText}>{validationErrors.general}</Text>
          )}
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
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginLeft: 4,
  },
  menuButton: {
    width: '100%',
  },
  textArea: {
    minHeight: 80,
  },
  registerButton: {
    marginTop: 20,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
});
