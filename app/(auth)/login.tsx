import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Text, TextInput, Button, Card, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authenticateUser } from '../../services/auth.service';
import { getHomeRouteForRole } from '../../utils/auth-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const result = await authenticateUser(email.trim(), password);

      if (result.success && result.user) {
        const homeRoute = getHomeRouteForRole(result.user.role);
        router.replace(homeRoute as any);
      } else {
        Alert.alert(
          'Đăng nhập thất bại',
          result.error || 'Thông tin đăng nhập không hợp lệ',
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = () => {
    router.push('/(auth)/phone-login');
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode='contain'
            />
            <Text variant='headlineSmall' style={styles.mainSubtitle}>
              Kết nối an toàn 🛡️
            </Text>
            <Text variant='headlineSmall' style={styles.mainSubtitle}>
              ✨ Gợi ý tiện ích thông minh ✨
            </Text>
          </View>
          <View style={styles.taglineContainer}>
            <Text variant='bodyMedium' style={styles.taglineItem}>
              📍 Đề xuất tiện ích xung quanh
            </Text>
            <Text variant='bodyMedium' style={styles.taglineItem}>
              🤝 Gợi ý bạn ở ghép thông minh
            </Text>
            <Text variant='bodyMedium' style={styles.taglineItem}>
              🛡️ Khu vực an toàn
            </Text>
          </View>
        </View>

        {/* Card đăng nhập */}
        <Card style={styles.card} elevation={5}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text variant='headlineSmall' style={styles.cardTitle}>
                ĐĂNG NHẬP
              </Text>
              <Text variant='bodyMedium' style={styles.cardSubtitle}>
                Đăng nhập để tiếp tục hành trình tìm phòng trọ an toàn
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label='Địa chỉ email'
                value={email}
                onChangeText={setEmail}
                mode='outlined'
                keyboardType='email-address'
                autoCapitalize='none'
                autoComplete='email'
                left={<TextInput.Icon icon='email-outline' />}
                style={styles.input}
                contentStyle={styles.inputContent}
              />

              <TextInput
                label='Mật khẩu'
                value={password}
                onChangeText={setPassword}
                mode='outlined'
                secureTextEntry={!showPassword}
                autoComplete='password'
                left={<TextInput.Icon icon='lock-outline' />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
                contentStyle={styles.inputContent}
              />
            </View>

            <Button
              mode='contained'
              onPress={handleLogin}
              loading={loading}
              disabled={!email || !password}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>

            <View style={styles.dividerContainer}>
              <Divider style={styles.divider} />
              <Text style={styles.orText}>HOẶC</Text>
              <Divider style={styles.divider} />
            </View>

            <Button
              mode='outlined'
              onPress={handlePhoneLogin}
              icon='phone-outline'
              style={styles.phoneButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.secondaryButtonLabel}
            >
              Đăng nhập bằng số điện thoại
            </Button>
          </Card.Content>
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Chưa có tài khoản? </Text>
          <Button
            mode='text'
            onPress={handleRegister}
            compact
            labelStyle={styles.footerButtonLabel}
          >
            Đăng ký ngay
          </Button>
        </View>

        {/* Truy cập khách */}
        <View style={styles.guestAccessSection}>
          <Text variant='bodyMedium' style={styles.guestAccessText}>
            Muốn xem trước không cần đăng ký?
          </Text>
          <Button
            mode='outlined'
            onPress={() => router.push('/(guest)/home')}
            icon='eye-outline'
            style={styles.guestAccessButton}
            contentStyle={styles.guestAccessButtonContent}
            labelStyle={styles.guestAccessButtonLabel}
          >
            Xem với tư cách khách
          </Button>
          <Text variant='bodySmall' style={styles.guestAccessNote}>
            Giới hạn tính năng • Đăng ký để sử dụng đầy đủ
          </Text>
        </View>

        {/* Thông tin tính năng */}
        <View style={styles.featuresInfo}>
          <Text variant='bodySmall' style={styles.featuresText}>
            ✨ Ghép đôi người ở ghép bằng AI • 🔒 Xác minh chính chủ • 📱 Chat
            trực tuyến
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logoImage: {
    width: 250,
    height: 250,
    marginBottom: -10,
  },
  mainSubtitle: {
    fontSize: 23,
    textAlign: 'center',
    fontWeight: '700',
    color: '#0085ff',
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 8,
    fontWeight: '500',
  },
  taglineContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 6,
  },
  taglineItem: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  cardContent: {
    padding: 24,
  },
  cardHeader: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2530caff',
  },
  cardSubtitle: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  inputContent: {
    fontSize: 16,
    paddingVertical: 4,
  },
  loginButton: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    opacity: 0.3,
  },
  orText: {
    marginHorizontal: 20,
    opacity: 0.7,
    fontSize: 14,
    fontWeight: '500',
  },
  phoneButton: {
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  secondaryButtonLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  quickAccessInfo: {
    backgroundColor: '#f0f4ff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickAccessText: {
    opacity: 0.8,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerText: {
    opacity: 0.7,
    fontSize: 16,
  },
  footerButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  featuresInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  featuresText: {
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 18,
  },
  guestAccessSection: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginHorizontal: 8,
  },
  guestAccessText: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  guestAccessButton: {
    borderRadius: 8,
    borderColor: '#6200ee',
    borderWidth: 1.5,
  },
  guestAccessButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  guestAccessButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  guestAccessNote: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.6,
    fontStyle: 'italic',
  },
});
