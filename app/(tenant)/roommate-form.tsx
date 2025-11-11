import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Text,
  Button,
  TextInput,
  Surface,
  HelperText,
  ProgressBar,
  Portal,
  Modal,
  RadioButton,
  List,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

type FormState = {
  gender: string;
  hometown: string;
  birthYear: string;
  occupation: string;
  phone: string;
};

const hometownOptions = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Huế',
  'Nha Trang',
  'Đà Lạt',
  'Vũng Tàu',
  'Buôn Ma Thuột',
];

const genderOptions = ['Nam', 'Nữ', 'Khác'];

const INITIAL_FORM: FormState = {
  gender: 'Nam',
  hometown: '',
  birthYear: '',
  occupation: '',
  phone: '',
};

export default function RoommateFormScreen() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<keyof FormState, string>>({
    gender: '',
    hometown: '',
    birthYear: '',
    occupation: '',
    phone: '',
  });
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [hometownModalVisible, setHometownModalVisible] = useState(false);

  const progress = useMemo(() => 1 / 3, []);

  const updateForm = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => setForm((prev) => ({ ...prev, [field]: value }));

  const validateForm = () => {
    const nextErrors: Record<keyof FormState, string> = {
      gender: '',
      hometown: '',
      birthYear: '',
      occupation: '',
      phone: '',
    };

    if (!form.hometown) {
      nextErrors.hometown = 'Vui lòng chọn quê quán của bạn.';
    }
    if (!form.birthYear) {
      nextErrors.birthYear = 'Vui lòng nhập năm sinh.';
    } else if (!/^(19|20)\d{2}$/.test(form.birthYear)) {
      nextErrors.birthYear = 'Năm sinh không hợp lệ.';
    }
    if (!form.occupation.trim()) {
      nextErrors.occupation = 'Vui lòng nhập nghề nghiệp.';
    }
    if (!form.phone) {
      nextErrors.phone = 'Vui lòng nhập số điện thoại.';
    } else if (!/^\d{9,11}$/.test(form.phone)) {
      nextErrors.phone = 'Số điện thoại phải từ 9-11 chữ số.';
    }

    setErrors(nextErrors);
    return Object.values(nextErrors).every((error) => !error);
  };

  const handleNextStep = () => {
    if (!validateForm()) {
      return;
    }

    router.push({
      pathname: './roommate-preferences',
      params: {
        origin: 'roommate-form',
        gender: form.gender,
        hometown: form.hometown,
        birthYear: form.birthYear,
        occupation: form.occupation,
        phone: form.phone,
      },
    });
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps='handled'
        >
          <View style={styles.header}>
            <Button
              mode='text'
              icon='arrow-left'
              onPress={handleCancel}
              style={styles.backButton}
            >
              Quay lại
            </Button>
            <Button mode='text' onPress={handleCancel}>
              Hủy
            </Button>
          </View>

          <View style={styles.titleSection}>
            <Text variant='headlineSmall' style={styles.title}>
              Thông tin Roommate - Bước 1/3
            </Text>
            <Text variant='bodyMedium' style={styles.subtitle}>
              Cho chúng tôi biết thêm về bạn để tìm được người ở ghép phù hợp
              nhất.
            </Text>
            <ProgressBar progress={progress} style={styles.progressBar} />
          </View>

          <Surface style={styles.formCard} elevation={2}>
            <Text style={styles.sectionLabel}>Thông tin cá nhân</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Giới tính</Text>
              <Button
                mode='outlined'
                onPress={() => setGenderModalVisible(true)}
                style={styles.selectButton}
                icon='chevron-down'
                contentStyle={styles.selectButtonContent}
              >
                {form.gender}
              </Button>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Quê quán</Text>
              <Button
                mode='outlined'
                onPress={() => setHometownModalVisible(true)}
                style={styles.selectButton}
                icon='chevron-down'
                contentStyle={styles.selectButtonContent}
              >
                {form.hometown || 'Chọn quê quán của bạn'}
              </Button>
              <HelperText type='error' visible={!!errors.hometown}>
                {errors.hometown}
              </HelperText>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Năm sinh</Text>
              <TextInput
                mode='outlined'
                placeholder='Nhập năm sinh'
                value={form.birthYear}
                onChangeText={(value) => updateForm('birthYear', value)}
                keyboardType='number-pad'
                maxLength={4}
              />
              <HelperText type='error' visible={!!errors.birthYear}>
                {errors.birthYear}
              </HelperText>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nghề nghiệp</Text>
              <TextInput
                mode='outlined'
                placeholder='Nhập nghề nghiệp hiện tại'
                value={form.occupation}
                onChangeText={(value) => updateForm('occupation', value)}
                autoCapitalize='sentences'
              />
              <HelperText type='error' visible={!!errors.occupation}>
                {errors.occupation}
              </HelperText>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                mode='outlined'
                placeholder='Nhập số điện thoại của bạn'
                value={form.phone}
                onChangeText={(value) => updateForm('phone', value)}
                keyboardType='phone-pad'
              />
              <HelperText type='error' visible={!!errors.phone}>
                {errors.phone}
              </HelperText>
            </View>

            <View style={styles.footer}>
              <Button mode='outlined' onPress={handleCancel}>
                Quay lại
              </Button>
              <Button
                mode='contained'
                onPress={handleNextStep}
                style={styles.nextButton}
              >
                Tiếp theo
              </Button>
            </View>
          </Surface>
        </ScrollView>

        <Portal>
          <Modal
            visible={genderModalVisible}
            onDismiss={() => setGenderModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <Text style={styles.modalTitle}>Chọn giới tính</Text>
            <RadioButton.Group
              onValueChange={(value) => {
                updateForm('gender', value as FormState['gender']);
                setGenderModalVisible(false);
              }}
              value={form.gender}
            >
              {genderOptions.map((option) => (
                <RadioButton.Item
                  key={option}
                  label={option}
                  value={option}
                  position='leading'
                  style={styles.radioItem}
                />
              ))}
            </RadioButton.Group>
          </Modal>

          <Modal
            visible={hometownModalVisible}
            onDismiss={() => setHometownModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <Text style={styles.modalTitle}>Chọn quê quán</Text>
            <ScrollView style={styles.modalScroll}>
              <List.Section>
                {hometownOptions.map((option, index) => (
                  <View key={option}>
                    <List.Item
                      title={option}
                      onPress={() => {
                        updateForm('hometown', option);
                        setHometownModalVisible(false);
                      }}
                      right={() =>
                        form.hometown === option ? (
                          <List.Icon icon='check-circle' color='#6200ee' />
                        ) : null
                      }
                    />
                    {index < hometownOptions.length - 1 && <Divider />}
                  </View>
                ))}
              </List.Section>
            </ScrollView>
          </Modal>
        </Portal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  flex: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 0,
  },
  titleSection: {
    marginBottom: 16,
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 12,
    lineHeight: 20,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  formCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
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
    maxHeight: 280,
  },
  radioItem: {
    paddingHorizontal: 0,
  },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  nextButton: {
    flex: 1,
  },
});
